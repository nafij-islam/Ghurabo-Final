'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TripCard from '@/components/cards/TripCard';
import { ITrip, IComment } from '@/types';
import {
  MapPin, Calendar, Clock, DollarSign, ShieldCheck, Heart, Bookmark, ThumbsUp,
  Share2, MessageSquare, Star, User, AlertTriangle, Lightbulb, CheckCircle2, ChevronDown
} from 'lucide-react';

export default function TripDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [trip, setTrip] = useState<ITrip | null>(null);
  const [relatedTrips, setRelatedTrips] = useState<ITrip[]>([]);
  const [authorTrips, setAuthorTrips] = useState<ITrip[]>([]);
  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);

  const [comments, setComments] = useState<IComment[]>([
    {
      id: 'c1',
      tripId: slug,
      userId: 'user_2',
      userName: 'Tanvir & Sarah',
      userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
      content: 'This itinerary is super clean! Thanks for sharing exact per-person costs.',
      createdAt: '2026-02-03T10:00:00Z',
    }
  ]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (slug) {
      fetch(`/api/trips/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setTrip(data.trip);
            setRelatedTrips(data.relatedTrips || []);
            setAuthorTrips(data.authorTrips || []);
            setHelpfulCount(data.trip.helpfulVotesCount || 45);
          }
          setLoading(false);
        });
    }
  }, [slug]);

  const handleHelpfulVote = () => {
    setHelpfulCount(helpfulCount + 1);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && trip) {
      const added: IComment = {
        id: `c_${Date.now()}`,
        tripId: trip.id,
        userId: 'user_current',
        userName: 'You (Explorer)',
        userAvatar: 'https://i.pravatar.cc/150?u=me',
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      };
      setComments([...comments, added]);
      setNewComment('');
    }
  };

  if (loading) {
    return <div className="pt-32 pb-20 text-center text-slate-500 font-medium">Loading trip story...</div>;
  }

  if (!trip) {
    return (
      <div className="pt-32 pb-20 text-center">
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
        <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover opacity-85" />
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
        {/* Author Bar & Action Buttons */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={trip.userAvatar}
              alt={trip.userName}
              className="w-14 h-14 rounded-full object-cover border-2 border-brand-500"
            />
            <div>
              <Link href={`/profile/${trip.userId}`} className="font-display text-lg font-bold text-slate-900 hover:text-brand-600">
                {trip.userName}
              </Link>
              <p className="text-xs text-slate-500">Published on {new Date(trip.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                liked ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{liked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                saved ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-600'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleHelpfulVote}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-brand-500 text-white hover:bg-brand-600 text-xs font-bold transition-all"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Helpful ({helpfulCount})</span>
            </button>
          </div>
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
            <span className="font-display text-2xl font-bold text-cyan-300">${cost.totalCost}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Cost / Person</span>
            <span className="font-display text-3xl font-extrabold text-emerald-400">${cost.perPersonCost}</span>
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
                {trip.highlights.map((h, i) => (
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
            {trip.itinerary?.map((day) => (
              <div key={day.dayNumber} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative pl-12">
                <div className="absolute left-4 top-6 w-6 h-6 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                  {day.dayNumber}
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 uppercase mb-2">{day.title}</h3>
                <ul className="space-y-1 mb-3">
                  {day.activities.map((act, i) => (
                    <li key={i} className="text-xs text-slate-600 font-light flex items-center space-x-2">
                      <span className="text-brand-500 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-200">
                  <span>Locations: {day.locations.join(', ')}</span>
                  <span className="text-brand-600 font-bold">Est. Cost: ${day.estimatedCost}</span>
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
                  <th className="p-3.5 text-right rounded-r-xl">Cost (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-3.5 font-bold">Transportation & Flights</td>
                  <td className="p-3.5 text-slate-500">AC Coach / Train / Flight tickets</td>
                  <td className="p-3.5 text-right text-brand-600 font-bold">${cost.transport}</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Hotel & Resort Accommodation</td>
                  <td className="p-3.5 text-slate-500">Stays and cottages</td>
                  <td className="p-3.5 text-right text-brand-600 font-bold">${cost.hotel}</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Food & Meals</td>
                  <td className="p-3.5 text-slate-500">Breakfast, seafood dinners, bamboo tea</td>
                  <td className="p-3.5 text-right text-brand-600 font-bold">${cost.food}</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Local Transport & Rides</td>
                  <td className="p-3.5 text-slate-500">Scooters, TomTom, Chander Gari</td>
                  <td className="p-3.5 text-right text-brand-600 font-bold">${cost.localTransport}</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Entry Tickets & Sightseeing</td>
                  <td className="p-3.5 text-slate-500">Park permits and boat tickets</td>
                  <td className="p-3.5 text-right text-brand-600 font-bold">${cost.tickets}</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold">Shopping & Crafts</td>
                  <td className="p-3.5 text-slate-500">Local souvenirs and coconut crafts</td>
                  <td className="p-3.5 text-right text-brand-600 font-bold">${cost.shopping}</td>
                </tr>
                <tr className="bg-brand-50 font-bold text-sm">
                  <td className="p-4 text-brand-900">TOTAL PER-PERSON EXPENSE</td>
                  <td className="p-4 text-brand-700">Calculated for {trip.travellersCount} traveller(s)</td>
                  <td className="p-4 text-right text-brand-600 text-base font-extrabold">${cost.perPersonCost}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

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
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100 mb-12">
          <h2 className="font-display text-3xl font-bold text-slate-900 uppercase mb-6 flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-brand-500" />
            <span>Community Discussion ({comments.length})</span>
          </h2>

          <form onSubmit={handleAddComment} className="mb-8 flex flex-col space-y-3">
            <textarea
              rows={3}
              placeholder="Ask a question or leave a review for the author..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase rounded-full shadow transition-all"
              >
                Post Comment
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex space-x-3">
                <img src={c.userAvatar} alt={c.userName} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{c.userName}</span>
                    <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-light">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Trips */}
        {relatedTrips.length > 0 && (
          <div>
            <h2 className="font-display text-3xl font-bold text-slate-900 uppercase mb-6">
              More Community Trips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedTrips.map((rt) => (
                <TripCard key={rt.id} trip={rt} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
