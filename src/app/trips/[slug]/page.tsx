import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import TripCard from '@/components/cards/TripCard';
import { tripsApi } from '@/lib/api/trips.api';
import { adaptBackendTripToITrip } from '@/lib/api/adapters';
import { AuthorActions, CommentsSection } from '@/components/trips/TripDetailsInteractive';
import { TripCostDisplay } from '@/components/trips/TripCostDisplay';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { siteConfig } from '@/config/site';
import { getCachedTripBySlug } from '@/lib/seo/trips.server';
import { formatTripMetaTitle, truncateText } from '@/lib/seo/sanitize';
import { getTripArticleJsonLd, getBreadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd';
import {
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Home,
} from 'lucide-react';
import { ITrip, IItineraryDay } from '@/types';

const GoogleTripMap = dynamic(() => import('@/components/trips/GoogleTripMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 sm:h-80 rounded-2xl sm:rounded-3xl bg-slate-900 border border-white/10 animate-pulse flex items-center justify-center my-6 sm:my-8">
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading Interactive Map...</p>
    </div>
  ),
});

interface PageProps {
  params: { slug: string };
}

/**
 * Dynamic Metadata for Public Trip Details (Phases 14-19)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const trip = await getCachedTripBySlug(params.slug);

  if (!trip || trip.status !== 'approved') {
    return {
      title: 'Trip Not Found | Ghurabo',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const metaTitle = formatTripMetaTitle(trip.title);
  const metaDescription =
    truncateText(trip.summary, 160) ||
    truncateText(trip.story, 160) ||
    `Explore ${trip.title} with real trip costs, itinerary, travel tips, photos and firsthand experience shared by a Ghurabo traveler.`;

  const canonicalUrl = `${siteConfig.siteUrl}/trips/${trip.slug}`;
  const coverUrl = trip.coverImage || `${siteConfig.siteUrl}${siteConfig.defaultOgImage}`;
  const authorProfileUrl = `${siteConfig.siteUrl}/profile/${encodeURIComponent(trip.authorUsername || trip.userName)}`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [
        {
          url: coverUrl,
          width: 1200,
          height: 630,
          alt: trip.title,
        },
      ],
      publishedTime: trip.createdAt,
      authors: [authorProfileUrl],
      section: trip.travelType ? `${trip.travelType} Travel` : 'Travel Guide',
      tags: [trip.destinationName, trip.travelType, 'Bangladesh Travel'].filter(Boolean),
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [coverUrl],
    },
  };
}

/**
 * Server-Rendered Public Trip Details Page (Phases 20-22, 46, 55)
 */
export default async function TripDetailsPage({ params }: PageProps) {
  const trip = await getCachedTripBySlug(params.slug);

  // Phase 32: Non-public or missing trips return true 404
  if (!trip || trip.status !== 'approved') {
    notFound();
  }

  // Fetch related trips on server
  let relatedTrips: ITrip[] = [];
  try {
    const relatedRes = await tripsApi.getTrips({
      travelType: trip.travelType,
      limit: 4,
    });
    if (relatedRes?.data) {
      relatedTrips = relatedRes.data
        .map(adaptBackendTripToITrip)
        .filter((t) => t.id !== trip.id && t.slug !== trip.slug)
        .slice(0, 3);
    }
  } catch {
    // Non-blocking fallback
  }

  const cost = trip.costBreakdown || {
    transport: 0,
    hotel: 0,
    food: 0,
    localTransport: 0,
    tickets: 0,
    guide: 0,
    shopping: 0,
    misc: 0,
    totalCost: 0,
    perPersonCost: 0,
  };

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Trips', url: '/trips' },
    { name: trip.title, url: `/trips/${trip.slug}` },
  ];

  const articleJsonLd = getTripArticleJsonLd(trip);
  const breadcrumbJsonLd = getBreadcrumbJsonLd(breadcrumbs);

  return (
    <article className="w-full bg-slate-50 min-h-screen pt-20 pb-20">
      {/* Search Engine Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      {/* Visible Semantic Breadcrumbs */}
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center space-x-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-1">
            <li className="flex items-center space-x-1.5">
              <Link href="/" className="hover:text-brand-600 transition-colors flex items-center space-x-1">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
            </li>
            <li className="flex items-center space-x-1.5">
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <Link href="/trips" className="hover:text-brand-600 transition-colors">
                Trips
              </Link>
            </li>
            <li className="flex items-center space-x-1.5 text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-sm">
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate" aria-current="page">
                {trip.title}
              </span>
            </li>
          </ol>
        </nav>

        {/* Cover Image Header */}
        <div className="relative h-[340px] sm:h-[400px] md:h-[440px] lg:h-[460px] w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl bg-slate-950 border border-slate-200/40">
          <Image
            src={getOptimizedImageUrl(trip.coverImage, { width: 1920, height: 1080, quality: 'auto' })}
            alt={`${trip.title} - Travel Guide & Budget`}
            fill
            priority
            quality={90}
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 px-5 sm:px-8 md:px-10 text-white z-10">
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              <span className="px-3 py-1 bg-brand-500 text-white text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                {trip.travelType} Tour
              </span>
              {trip.isVerified && (
                <span className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-500 text-white text-[10px] sm:text-xs font-semibold rounded-full shadow">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Trip</span>
                </span>
              )}
            </div>

            {/* Single Primary H1 */}
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase leading-tight mb-3 sm:mb-4 text-shadow-hero break-words">
              {trip.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/90 font-medium">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span className="truncate max-w-[160px] sm:max-w-none">{trip.destinationName}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>{trip.durationDays} Days</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>{trip.travelDate}</span>
              </div>
              <div className="flex items-center space-x-1 text-amber-300 bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full font-bold text-[11px] sm:text-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{trip.ratings?.overall || 4.9}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 md:py-10">
        {/* Author Bar & Interactive Action Buttons */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
            <Link href={`/profile/${trip.authorUsername || trip.userName}`} className="shrink-0">
              <Image
                src={getOptimizedImageUrl(trip.userAvatar, { width: 120, height: 120 })}
                alt={trip.userName ? `${trip.userName}'s profile photo` : 'Author profile photo'}
                width={56}
                height={56}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-brand-500 hover:opacity-80 transition-opacity"
              />
            </Link>
            <div className="truncate">
              <Link
                href={`/profile/${trip.authorUsername || trip.userName}`}
                className="font-display text-base sm:text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors block truncate"
              >
                {trip.userName}
              </Link>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Published on {new Date(trip.createdAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-start sm:justify-end">
            <AuthorActions trip={trip} initialHelpfulCount={trip.helpfulVotesCount || 0} />
          </div>
        </div>

        {/* Cost Summary Banner */}
        <div className="bg-darkslate-900 text-white p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl mb-8 sm:mb-12 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="p-2 sm:p-0">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block mb-1">Travel Type</span>
            <span className="font-display text-lg sm:text-2xl font-bold text-cyan-300">{trip.travelType}</span>
          </div>
          <div className="p-2 sm:p-0">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block mb-1">Duration</span>
            <span className="font-display text-lg sm:text-2xl font-bold text-cyan-300">{trip.durationDays} Days</span>
          </div>
          <div className="p-2 sm:p-0">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block mb-1">Total Trip Expense</span>
            <span className="font-display text-lg sm:text-2xl font-bold text-cyan-300">
              <TripCostDisplay amountBDT={cost.totalCost || cost.perPersonCost || 0} />
            </span>
          </div>
          <div className="p-2 sm:p-0">
            <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider block mb-1">Cost / Person</span>
            <span className="font-display text-xl sm:text-3xl font-extrabold text-emerald-400">
              <TripCostDisplay amountBDT={cost.perPersonCost || cost.totalCost || 0} />
            </span>
          </div>
        </div>

        {/* Trip Summary Section */}
        {trip.summary && (
          <section className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 uppercase mb-3 sm:mb-4">
              Trip Overview
            </h2>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-light">
              {trip.summary}
            </p>
          </section>
        )}

        {/* Complete Travel Story */}
        <section className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-8 sm:mb-12 space-y-5 sm:space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 uppercase">
            The Complete Travel Story
          </h2>
          <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-light space-y-4 break-words">
            {trip.story}
          </div>

          {/* Highlights Box */}
          {trip.highlights && trip.highlights.length > 0 && (
            <div className="p-4 sm:p-6 bg-brand-50 rounded-2xl border border-brand-200 mt-6">
              <h3 className="font-display text-base sm:text-lg font-bold text-brand-900 uppercase mb-3 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 shrink-0" />
                <span>Trip Highlights</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                {trip.highlights.map((h: string, i: number) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></span>
                    <span className="break-words">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Day-by-Day Itinerary */}
        {trip.itinerary && trip.itinerary.length > 0 && (
          <section className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 uppercase mb-5 sm:mb-6">
              Day-by-Day Itinerary ({trip.itinerary.length} Days)
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {trip.itinerary.map((day: IItineraryDay) => (
                <div key={day.dayNumber} className="p-4 pl-11 sm:p-6 sm:pl-14 bg-slate-50 rounded-2xl border border-slate-200 relative">
                  <div className="absolute left-3 sm:left-4 top-4 sm:top-6 w-6 h-6 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                    {day.dayNumber}
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 uppercase mb-2 break-words">{day.title}</h3>
                  {day.activities && day.activities.length > 0 && (
                    <ul className="space-y-1 mb-3">
                      {day.activities.map((act: string, i: number) => (
                        <li key={i} className="text-xs text-slate-600 font-light flex items-start space-x-2">
                          <span className="text-brand-500 font-bold leading-tight shrink-0">•</span>
                          <span className="break-words">{act}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-200">
                    <span className="break-words">Locations: {day.locations?.join(', ') || trip.destinationName}</span>
                    {day.estimatedCost > 0 && (
                      <span className="text-brand-600 font-bold shrink-0">
                        Est. Cost: <TripCostDisplay amountBDT={day.estimatedCost} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Itemized Cost Breakdown Table */}
        <section className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-8 sm:mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 uppercase mb-2 sm:mb-4">
            Itemized Cost Breakdown
          </h2>
          <p className="text-[11px] text-slate-400 sm:hidden mb-3">Scroll table horizontally to view full breakdown</p>

          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[440px] sm:min-w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-900 uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-2.5 sm:p-3.5 rounded-l-xl">Category</th>
                  <th className="p-2.5 sm:p-3.5">Details</th>
                  <th className="p-2.5 sm:p-3.5 text-right rounded-r-xl">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-2.5 sm:p-3.5 font-bold">Transportation & Flights</td>
                  <td className="p-2.5 sm:p-3.5 text-slate-500">AC Coach / Train / Flight tickets</td>
                  <td className="p-2.5 sm:p-3.5 text-right text-brand-600 font-bold whitespace-nowrap">
                    <TripCostDisplay amountBDT={cost.transport || 0} />
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 sm:p-3.5 font-bold">Hotel & Resort Accommodation</td>
                  <td className="p-2.5 sm:p-3.5 text-slate-500">Stays and cottages</td>
                  <td className="p-2.5 sm:p-3.5 text-right text-brand-600 font-bold whitespace-nowrap">
                    <TripCostDisplay amountBDT={cost.hotel || 0} />
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 sm:p-3.5 font-bold">Food & Meals</td>
                  <td className="p-2.5 sm:p-3.5 text-slate-500">Breakfast, seafood dinners, local cuisine</td>
                  <td className="p-2.5 sm:p-3.5 text-right text-brand-600 font-bold whitespace-nowrap">
                    <TripCostDisplay amountBDT={cost.food || 0} />
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 sm:p-3.5 font-bold">Local Transport & Rides</td>
                  <td className="p-2.5 sm:p-3.5 text-slate-500">Scooters, TomTom, Chander Gari</td>
                  <td className="p-2.5 sm:p-3.5 text-right text-brand-600 font-bold whitespace-nowrap">
                    <TripCostDisplay amountBDT={cost.localTransport || 0} />
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 sm:p-3.5 font-bold">Entry Tickets & Sightseeing</td>
                  <td className="p-2.5 sm:p-3.5 text-slate-500">Park permits and boat tickets</td>
                  <td className="p-2.5 sm:p-3.5 text-right text-brand-600 font-bold whitespace-nowrap">
                    <TripCostDisplay amountBDT={cost.tickets || 0} />
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 sm:p-3.5 font-bold">Shopping & Crafts</td>
                  <td className="p-2.5 sm:p-3.5 text-slate-500">Local souvenirs and crafts</td>
                  <td className="p-2.5 sm:p-3.5 text-right text-brand-600 font-bold whitespace-nowrap">
                    <TripCostDisplay amountBDT={cost.shopping || 0} />
                  </td>
                </tr>
                <tr className="bg-brand-50 font-bold text-xs sm:text-sm">
                  <td className="p-3 sm:p-4 text-brand-900">TOTAL PER-PERSON</td>
                  <td className="p-3 sm:p-4 text-brand-700 text-[11px] sm:text-xs">For {trip.travellersCount || 1} traveller(s)</td>
                  <td className="p-3 sm:p-4 text-right text-brand-600 text-sm sm:text-base font-extrabold whitespace-nowrap">
                    <TripCostDisplay amountBDT={cost.perPersonCost || cost.totalCost || 0} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Google Maps Interactive Destination Location */}
        <GoogleTripMap
          destinationName={trip.destinationName}
          latitude={trip.latitude || 21.4272}
          longitude={trip.longitude || 92.0058}
          googlePlaceId={trip.googlePlaceId}
        />

        {/* Photos Grid if present */}
        {trip.images && trip.images.length > 0 && (
          <section className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 uppercase mb-6">
              Travel Photographs ({trip.images.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {trip.images.map((img, idx) => (
                <div key={idx} className="relative h-60 rounded-2xl overflow-hidden bg-slate-900">
                  <Image
                    src={getOptimizedImageUrl(img.url, { width: 600, height: 400 })}
                    alt={img.caption || `${trip.title} travel photograph ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {img.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-xs">
                      <p className="truncate">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tips & Safety Notes */}
        {(trip.tips || trip.safetyNotes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {trip.tips && (
              <section className="bg-amber-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-200">
                <h3 className="font-display text-base sm:text-lg font-bold text-amber-900 uppercase mb-2 flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
                  <span>Traveller Local Tips</span>
                </h3>
                <p className="text-xs text-amber-900/90 leading-relaxed font-light break-words">{trip.tips}</p>
              </section>
            )}

            {trip.safetyNotes && (
              <section className="bg-rose-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-200">
                <h3 className="font-display text-base sm:text-lg font-bold text-rose-900 uppercase mb-2 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
                  <span>Safety & Precautions</span>
                </h3>
                <p className="text-xs text-rose-900/90 leading-relaxed font-light break-words">{trip.safetyNotes}</p>
              </section>
            )}
          </div>
        )}

        {/* Comments Section */}
        <CommentsSection tripId={trip.id} />

        {/* Related Trips */}
        {relatedTrips.length > 0 && (
          <section className="mt-8 sm:mt-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 uppercase mb-4 sm:mb-6">
              More Community Trips
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {relatedTrips.map((rt: ITrip) => (
                <TripCard key={rt.id} trip={rt} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
