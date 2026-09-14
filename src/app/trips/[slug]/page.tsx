'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import TripCard from '@/components/cards/TripCard';
import { tripsApi } from '@/lib/api/trips.api';
import { adaptBackendTripToITrip } from '@/lib/api/adapters';
import { AuthorActions, CommentsSection } from '@/components/trips/TripDetailsInteractive';
import { TripCostDisplay } from '@/components/trips/TripCostDisplay';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { MapPin, Calendar, Clock, ShieldCheck, Star, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ITrip, IItineraryDay } from '@/types';

const GoogleTripMap = dynamic(() => import('@/components/trips/GoogleTripMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 sm:h-80 rounded-2xl sm:rounded-3xl bg-slate-900 border border-white/10 animate-pulse flex items-center justify-center my-6 sm:my-8">
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading Interactive Map...</p>
    </div>
  ),
});

import { useTrip, useTrips } from '@/lib/swr/hooks';

export default function TripDetailsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { trip, isLoading, error, mutate } = useTrip(slug);

  const { trips: relatedCandidateTrips } = useTrips(
    trip ? { travelType: trip.travelType, limit: 5 } : undefined
  );

  const relatedTrips = (relatedCandidateTrips || [])
    .filter((t) => t.id !== trip?.id && t.slug !== slug)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="w-full bg-slate-50 min-h-screen pt-20 pb-20 animate-pulse">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6">
          <div className="h-[340px] sm:h-[400px] md:h-[440px] lg:h-[460px] w-full bg-slate-800 rounded-2xl sm:rounded-3xl relative overflow-hidden">
            <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 px-5 sm:px-8 space-y-3 sm:space-y-4">
              <div className="h-6 w-32 bg-slate-700 rounded-full" />
              <div className="h-8 sm:h-10 w-3/4 bg-slate-700 rounded-xl" />
              <div className="h-4 w-1/2 bg-slate-700 rounded" />
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <div className="h-24 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100" />
          <div className="h-32 bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xl" />
          <div className="h-64 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100" />
        </div>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="pt-32 pb-20 text-center bg-slate-50 min-h-screen px-4">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 uppercase">Unable to Load Trip Story</h2>
        <p className="text-xs text-rose-600 mt-1">{error?.message || 'Network error occurred while fetching itinerary.'}</p>
        <button
          onClick={() => mutate()}
          className="mt-4 inline-block px-5 py-2.5 bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-sm hover:bg-brand-600 transition-all cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="pt-32 pb-20 text-center bg-slate-50 min-h-screen px-4">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 uppercase">Trip Story Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The trip report may have been removed or is pending moderation.</p>
        <Link href="/trips" className="mt-4 inline-block text-brand-600 font-bold text-xs sm:text-sm">
          &larr; Back to All Trips
        </Link>
      </div>
    );
  }

  const cost = trip.costBreakdown || {
    transport: 50,
    hotel: 80,
    food: 40,
    localTransport: 20,
    tickets: 10,
    guide: 0,
    shopping: 20,
    misc: 10,
    totalCost: 230,
    perPersonCost: 230,
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pt-20 pb-20">
      {/* Cover Image Header inside page container */}
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6">
        <div className="relative h-[340px] sm:h-[400px] md:h-[440px] lg:h-[460px] w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl bg-slate-950 border border-slate-200/40">
          <Image
            src={getOptimizedImageUrl(trip.coverImage, { width: 1920, height: 1080, quality: 'auto' })}
            alt={trip.title}
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
                alt={trip.userName || 'Author avatar'}
                width={56}
                height={56}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-brand-500 hover:opacity-80 transition-opacity"
              />
            </Link>
            <div className="truncate">
              <Link href={`/profile/${trip.authorUsername || trip.userName}`} className="font-display text-base sm:text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors block truncate">
                {trip.userName}
              </Link>
              <p className="text-[11px] sm:text-xs text-slate-500">Published on {new Date(trip.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-start sm:justify-end">
            <AuthorActions trip={trip} initialHelpfulCount={trip.helpfulVotesCount || 45} />
          </div>
        </div>

        {/* Cost Summary Banner (Responsive 2x2 Grid on Mobile, 4-Cols on Desktop) */}
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

        {/* Complete Travel Story */}
        <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-8 sm:mb-12 space-y-5 sm:space-y-6">
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
        </div>

        {/* Day-by-Day Itinerary */}
        <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-8 sm:mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 uppercase mb-5 sm:mb-6">
            Day-by-Day Itinerary ({trip.itinerary?.length || 0} Days)
          </h2>

          <div className="space-y-4 sm:space-y-6">
            {trip.itinerary?.map((day: IItineraryDay) => (
              <div key={day.dayNumber} className="p-4 pl-11 sm:p-6 sm:pl-14 bg-slate-50 rounded-2xl border border-slate-200 relative">
                <div className="absolute left-3 sm:left-4 top-4 sm:top-6 w-6 h-6 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                  {day.dayNumber}
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 uppercase mb-2 break-words">{day.title}</h3>
                <ul className="space-y-1 mb-3">
                  {day.activities?.map((act: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 font-light flex items-start space-x-2">
                      <span className="text-brand-500 font-bold leading-tight shrink-0">•</span>
                      <span className="break-words">{act}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-200">
                  <span className="break-words">Locations: {day.locations?.join(', ') || 'N/A'}</span>
                  <span className="text-brand-600 font-bold shrink-0">
                    Est. Cost: <TripCostDisplay amountBDT={day.estimatedCost || 0} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Itemized Cost Breakdown Table */}
        <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 mb-8 sm:mb-12">
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
                  <td className="p-2.5 sm:p-3.5 text-slate-500">Breakfast, seafood dinners, bamboo tea</td>
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
                  <td className="p-2.5 sm:p-3.5 text-slate-500">Local souvenirs and coconut crafts</td>
                  <td className="p-2.5 sm:p-3.5 text-right text-brand-600 font-bold whitespace-nowrap">
                    <TripCostDisplay amountBDT={cost.shopping || 0} />
                  </td>
                </tr>
                <tr className="bg-brand-50 font-bold text-xs sm:text-sm">
                  <td className="p-3 sm:p-4 text-brand-900">TOTAL PER-PERSON</td>
                  <td className="p-3 sm:p-4 text-brand-700 text-[11px] sm:text-xs">For {trip.travellersCount} traveller(s)</td>
                  <td className="p-3 sm:p-4 text-right text-brand-600 text-sm sm:text-base font-extrabold whitespace-nowrap">
                    <TripCostDisplay amountBDT={cost.perPersonCost || cost.totalCost || 0} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Google Maps Interactive Destination Location */}
        <GoogleTripMap
          destinationName={trip.destinationName}
          latitude={trip.latitude || 21.4272}
          longitude={trip.longitude || 92.0058}
          googlePlaceId={trip.googlePlaceId}
        />

        {/* Tips & Safety Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {trip.tips && (
            <div className="bg-amber-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-200">
              <h3 className="font-display text-base sm:text-lg font-bold text-amber-900 uppercase mb-2 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
                <span>Traveller Local Tips</span>
              </h3>
              <p className="text-xs text-amber-900/90 leading-relaxed font-light break-words">{trip.tips}</p>
            </div>
          )}

          {trip.safetyNotes && (
            <div className="bg-rose-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-rose-200">
              <h3 className="font-display text-base sm:text-lg font-bold text-rose-900 uppercase mb-2 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
                <span>Safety & Precautions</span>
              </h3>
              <p className="text-xs text-rose-900/90 leading-relaxed font-light break-words">{trip.safetyNotes}</p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <CommentsSection
          tripId={trip.id}
          onCommentCountChange={(count) =>
            mutate((prev) => (prev ? { ...prev, commentsCount: count } : prev), false)
          }
        />

        {/* Related Trips */}
        {relatedTrips.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 uppercase mb-4 sm:mb-6">
              More Community Trips
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {relatedTrips.map((rt: ITrip) => (
                <TripCard key={rt.id} trip={rt} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
