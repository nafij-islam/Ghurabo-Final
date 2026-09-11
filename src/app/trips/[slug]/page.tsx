'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    <div className="w-full h-80 rounded-2xl bg-slate-900 border border-white/10 animate-pulse flex items-center justify-center my-8">
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading Interactive Map...</p>
    </div>
  ),
});

export default function TripDetailsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [trip, setTrip] = useState<ITrip | null>(null);
  const [relatedTrips, setRelatedTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!slug) return;

    setLoading(true);
    tripsApi
      .getTripBySlug(slug)
      .then(async (backendTrip) => {
        if (!isMounted) return;
        const adapted = adaptBackendTripToITrip(backendTrip);
        setTrip(adapted);

        try {
          const relatedRes = await tripsApi.getTrips({
            travelType: backendTrip.travelType,
            limit: 4,
          });
          if (isMounted && relatedRes?.data) {
            const adaptedRelated = relatedRes.data
              .map(adaptBackendTripToITrip)
              .filter((t) => t.id !== backendTrip._id && t.slug !== slug)
              .slice(0, 3);
            setRelatedTrips(adaptedRelated);
          }
        } catch {
          // related trips load failure is non-blocking
        }
      })
      .catch((err) => {
        console.error('Failed to load trip story:', err);
        if (isMounted) setTrip(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full bg-slate-50 min-h-screen pt-20 pb-20 animate-pulse">
        <div className="h-[480px] w-full bg-slate-800 relative">
          <div className="absolute bottom-10 left-0 right-0 max-w-5xl mx-auto px-4 sm:px-6 space-y-4">
            <div className="h-6 w-32 bg-slate-700 rounded-full" />
            <div className="h-10 w-3/4 bg-slate-700 rounded-xl" />
            <div className="h-4 w-1/2 bg-slate-700 rounded" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">
          <div className="h-24 bg-white rounded-3xl shadow-sm border border-slate-100" />
          <div className="h-32 bg-slate-900 rounded-3xl shadow-xl" />
          <div className="h-64 bg-white rounded-3xl shadow-sm border border-slate-100" />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="pt-32 pb-20 text-center bg-slate-50 min-h-screen">
        <h2 className="font-display text-3xl font-bold text-slate-900 uppercase">Trip Story Not Found</h2>
        <Link href="/trips" className="mt-4 inline-block text-brand-600 font-bold text-sm">
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
      {/* Cover Image Header */}
      <div className="relative h-[480px] w-full overflow-hidden bg-slate-950">
        <img
          src={getOptimizedImageUrl(trip.coverImage, { width: 1400, height: 800, quality: 'auto' })}
          alt={trip.title}
          className="w-full h-full object-cover opacity-85"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1400';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-10 left-0 right-0 max-w-5xl mx-auto px-4 sm:px-6 text-white z-10">
          <div className="flex items-center space-x-3 mb-3">
            <span className="px-3.5 py-1 bg-brand-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
              {trip.travelType} Tour
            </span>
            {trip.isVerified && (
              <span className="flex items-center space-x-1 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Trip Report</span>
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold uppercase leading-tight mb-4 text-shadow-hero">
            {trip.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-white/90 font-medium">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-300" />
              <span>{trip.destinationName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-300" />
              <span>{trip.durationDays} Days</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-300" />
              <span>Travel Date: {trip.travelDate}</span>
            </div>
            <div className="flex items-center space-x-1 text-amber-300 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{trip.ratings?.overall || 4.9} Overall</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Author Bar & Interactive Action Buttons */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={getOptimizedImageUrl(trip.userAvatar, { width: 120, height: 120 })}
              alt={trip.userName}
              className="w-14 h-14 rounded-full object-cover border-2 border-brand-500"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
              }}
            />
            <div>
              <Link href={`/profile/${trip.userId}`} className="font-display text-lg font-bold text-slate-900 hover:text-brand-600">
                {trip.userName}
              </Link>
              <p className="text-xs text-slate-500">Published on {new Date(trip.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <AuthorActions trip={trip} initialHelpfulCount={trip.helpfulVotesCount || 45} />
        </div>

        {/* Cost Summary Banner */}
        <div className="bg-darkslate-900 text-white p-8 rounded-3xl shadow-xl mb-12 border border-white/10 grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Travel Type</span>
            <span className="font-display text-2xl font-bold text-cyan-300">{trip.travelType}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Duration</span>
            <span className="font-display text-2xl font-bold text-cyan-300">{trip.durationDays} Days</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Total Trip Expense</span>
            <span className="font-display text-2xl font-bold text-cyan-300">
              <TripCostDisplay amountBDT={cost.totalCost || cost.perPersonCost || 0} />
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Cost / Person</span>
            <span className="font-display text-3xl font-extrabold text-emerald-400">
              <TripCostDisplay amountBDT={cost.perPersonCost || cost.totalCost || 0} />
            </span>
          </div>
        </div>

        {/* Complete Travel Story */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100 mb-12 space-y-6">
          <h2 className="font-display text-3xl font-bold text-slate-900 uppercase">The Complete Travel Story</h2>
          <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-light space-y-4">
            {trip.story}
          </div>

          {/* Highlights Box */}
          {trip.highlights && trip.highlights.length > 0 && (
            <div className="p-6 bg-brand-50 rounded-2xl border border-brand-200 mt-6">
              <h3 className="font-display text-lg font-bold text-brand-900 uppercase mb-3 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
                <span>Trip Highlights</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                {trip.highlights.map((h: string, i: number) => (
                  <li key={i} className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Day-by-Day Itinerary */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100 mb-12">
          <h2 className="font-display text-3xl font-bold text-slate-900 uppercase mb-6">
            Day-by-Day Itinerary ({trip.itinerary?.length || 0} Days)
          </h2>

          <div className="space-y-6">
            {trip.itinerary?.map((day: IItineraryDay) => (
              <div key={day.dayNumber} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative pl-12">
                <div className="absolute left-4 top-6 w-6 h-6 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                  {day.dayNumber}
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 uppercase mb-2">{day.title}</h3>
                <ul className="space-y-1 mb-3">
                  {day.activities?.map((act: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 font-light flex items-center space-x-2">
                      <span className="text-brand-500 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-200">
                  <span>Locations: {day.locations?.join(', ')}</span>
                  <span className="text-brand-600 font-bold">
                    Est. Cost: <TripCostDisplay amountBDT={day.estimatedCost || 0} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Itemized Cost Breakdown Table */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100 mb-12">
          <h2 className="font-display text-3xl font-bold text-slate-900 uppercase mb-6">
            Itemized Cost Breakdown
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-900 uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Category</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5 text-right rounded-r-xl">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-3.5 font-bold">Transportation & Flights</td>
                  <td className="p-3.5 text-slate-500">AC Coach / Train / Flight tickets</td>
                  <td className="p-3.5 text-right text-brand-600 font-bold">
                    <TripCostDisplay amountBDT={cost.transport || 0} />
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Hotel & Resort Accommodation</td>
                  <td className="p-3.5 text-slate-500">Stays and cottages</td>
                  <td className="p-3.5 text-right text-brand-600 font-bold">
                    <TripCostDisplay amountBDT={cost.hotel || 0} />
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Food & Meals</td>
                  <td className="p-3.5 text-slate-500">Breakfast, seafood dinners, bamboo tea</td>
                  <td className="p-3.5 text-right text-brand-600 font-bold">
                    <TripCostDisplay amountBDT={cost.food || 0} />
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Local Transport & Rides</td>
                  <td className="p-3.5 text-slate-500">Scooters, TomTom, Chander Gari</td>
                  <td className="p-3.5 text-right text-brand-600 font-bold">
                    <TripCostDisplay amountBDT={cost.localTransport || 0} />
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Entry Tickets & Sightseeing</td>
                  <td className="p-3.5 text-slate-500">Park permits and boat tickets</td>
                  <td className="p-3.5 text-right text-brand-600 font-bold">
                    <TripCostDisplay amountBDT={cost.tickets || 0} />
                  </td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Shopping & Crafts</td>
                  <td className="p-3.5 text-slate-500">Local souvenirs and coconut crafts</td>
                  <td className="p-3.5 text-right text-brand-600 font-bold">
                    <TripCostDisplay amountBDT={cost.shopping || 0} />
                  </td>
                </tr>
                <tr className="bg-brand-50 font-bold text-sm">
                  <td className="p-4 text-brand-900">TOTAL PER-PERSON EXPENSE</td>
                  <td className="p-4 text-brand-700">Calculated for {trip.travellersCount} traveller(s)</td>
                  <td className="p-4 text-right text-brand-600 text-base font-extrabold">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {trip.tips && (
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200">
              <h3 className="font-display text-lg font-bold text-amber-900 uppercase mb-2 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <span>Traveller Local Tips</span>
              </h3>
              <p className="text-xs text-amber-900/90 leading-relaxed font-light">{trip.tips}</p>
            </div>
          )}

          {trip.safetyNotes && (
            <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200">
              <h3 className="font-display text-lg font-bold text-rose-900 uppercase mb-2 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Safety & Precautions</span>
              </h3>
              <p className="text-xs text-rose-900/90 leading-relaxed font-light">{trip.safetyNotes}</p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <CommentsSection tripId={trip.id} />

        {/* Related Trips */}
        {relatedTrips.length > 0 && (
          <div>
            <h2 className="font-display text-3xl font-bold text-slate-900 uppercase mb-6">
              More Community Trips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
