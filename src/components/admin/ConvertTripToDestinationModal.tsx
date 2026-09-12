'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Compass,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { ITrip } from '@/types';
import { adminApi } from '@/lib/api/admin.api';

interface ConvertTripToDestinationModalProps {
  trip: ITrip | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (destination: any) => void;
}

const CATEGORIES = [
  { label: 'Beach', value: 'BEACH' },
  { label: 'Mountain', value: 'MOUNTAIN' },
  { label: 'Island', value: 'ISLAND' },
  { label: 'Resort', value: 'RESORT' },
  { label: 'Nature', value: 'NATURE' },
  { label: 'Forest', value: 'FOREST' },
  { label: 'Historical', value: 'HISTORICAL' },
  { label: 'City', value: 'CITY' },
  { label: 'River', value: 'RIVER' },
  { label: 'Other', value: 'OTHER' },
];

function detectCategory(title: string, summary: string, destinationName?: string): string {
  const text = `${title} ${summary} ${destinationName || ''}`.toLowerCase();
  if (text.includes('beach') || text.includes('sea') || text.includes('ocean') || text.includes('cox') || text.includes('kuakata')) {
    return 'BEACH';
  }
  if (text.includes('hill') || text.includes('mountain') || text.includes('valley') || text.includes('sajek') || text.includes('bandarban') || text.includes('rangamati')) {
    return 'MOUNTAIN';
  }
  if (text.includes('island') || text.includes('saint martin') || text.includes('chera dwip')) {
    return 'ISLAND';
  }
  if (text.includes('forest') || text.includes('sundarban') || text.includes('jungle')) {
    return 'FOREST';
  }
  if (text.includes('river') || text.includes('lake') || text.includes('waterfall') || text.includes('haor') || text.includes('tanguar')) {
    return 'RIVER';
  }
  if (text.includes('history') || text.includes('heritage') || text.includes('museum') || text.includes('ancient') || text.includes('fort')) {
    return 'HISTORICAL';
  }
  if (text.includes('resort') || text.includes('cottage') || text.includes('spa')) {
    return 'RESORT';
  }
  if (text.includes('city') || text.includes('dhaka') || text.includes('chittagong') || text.includes('sylhet')) {
    return 'CITY';
  }
  return 'NATURE';
}

export default function ConvertTripToDestinationModal({
  trip,
  isOpen,
  onClose,
  onSuccess,
}: ConvertTripToDestinationModalProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [category, setCategory] = useState('BEACH');
  const [averageDailyCostBDT, setAverageDailyCostBDT] = useState(3000);
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [bestTimeToVisit, setBestTimeToVisit] = useState('October to March');
  const [weather, setWeather] = useState('Pleasant & Tropical');
  const [isFeatured, setIsFeatured] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdDestination, setCreatedDestination] = useState<any | null>(null);

  useEffect(() => {
    if (trip && isOpen) {
      setCreatedDestination(null);
      setError(null);

      // Derive smart defaults from trip
      const rawName = trip.destinationName || trip.title;
      const initialName = rawName.replace(/^(trip to|a tour of|tour to|exploring)\s+/i, '').trim();
      setName(initialName);

      const initialCity = trip.destinationName || initialName;
      setCity(initialCity);

      setCountry('Bangladesh');

      const detectedCat = detectCategory(trip.title, trip.summary || '', trip.destinationName);
      setCategory(detectedCat);

      const days = trip.durationDays && trip.durationDays > 0 ? trip.durationDays : 1;
      const totalCost = trip.costBreakdown?.totalCost || 0;
      const calculatedDaily = totalCost > 0 ? Math.round(totalCost / days) : 3500;
      setAverageDailyCostBDT(calculatedDaily);

      const shortSummary = trip.summary
        ? trip.summary.slice(0, 300)
        : `Explore ${initialName}, a premier travel destination in Bangladesh with scenic beauty and vibrant culture.`;
      setSummary(shortSummary);

      setDescription(
        trip.story || trip.summary || `Discover the captivating experiences and local charms of ${initialName}.`
      );

      setCoverImageUrl(
        trip.coverImage ||
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
      );
      setBestTimeToVisit('October to March');
      setWeather('Sunny & Pleasant');
      setIsFeatured(false);
    }
  }, [trip, isOpen]);

  if (!isOpen || !trip) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Destination name must be at least 2 characters.');
      return;
    }

    if (city.trim().length < 2) {
      setError('City is required.');
      return;
    }

    if (summary.trim().length < 5) {
      setError('Please provide a short summary (at least 5 characters).');
      return;
    }

    if (summary.trim().length > 300) {
      setError('Summary cannot exceed 300 characters.');
      return;
    }

    setLoading(true);
    try {
      const destinationPayload = {
        name: name.trim(),
        city: city.trim(),
        country: country.trim(),
        category: category as any,
        averageDailyCostBDT: Number(averageDailyCostBDT) || 0,
        summary: summary.trim(),
        description: description.trim() || summary.trim(),
        coverImage: {
          url: coverImageUrl.trim(),
          caption: name.trim(),
        },
        bestTimeToVisit: bestTimeToVisit.trim() || undefined,
        weather: weather.trim() || undefined,
        isFeatured,
        status: 'ACTIVE' as any,
      };

      const res = await adminApi.convertTripToDestination(trip.id, destinationPayload);
      setCreatedDestination(res);
      onSuccess(res);
    } catch (err: any) {
      console.error('Failed to convert trip to destination:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to convert trip into destination.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full my-8 overflow-hidden text-slate-900 transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-darkslate-900 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-400">
                <Sparkles className="w-3 h-3" />
                <span>Trip to Destination Converter</span>
              </div>
              <h2 className="font-display text-lg font-bold">Convert Trip to Official Destination</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Trip Summary Banner */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center space-x-4">
          <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-200">
            {trip.coverImage ? (
              <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Compass className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Source Community Trip</span>
            <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{trip.title}</h3>
            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-brand-500" />
                <span>{trip.destinationName}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{trip.durationDays} Days</span>
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">৳{trip.costBreakdown?.totalCost?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        {/* Success View */}
        {createdDestination ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-slate-900">
                Destination Created Successfully!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                The trip has been converted into an official Destination and is now active. It will appear immediately on the Destinations exploration page and throughout the Ghurabo platform.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto flex items-center space-x-3 text-left">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                <img
                  src={createdDestination.coverImage?.url || coverImageUrl}
                  alt={createdDestination.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-slate-900">{createdDestination.name}</h4>
                <p className="text-xs text-slate-500">
                  {createdDestination.city}, {createdDestination.country} • {createdDestination.category}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/destinations/${createdDestination.slug}`}
                target="_blank"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
              >
                <span>View on Destinations Page</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Destination Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Destination Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sajek Valley"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City, Country & Daily Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  City / Region <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Rangamati"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Country
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Bangladesh"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Avg Daily Cost (BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    min="0"
                    value={averageDailyCostBDT}
                    onChange={(e) => setAverageDailyCostBDT(Number(e.target.value))}
                    className="w-full pl-7 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Best Time & Weather */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Best Time to Visit
                </label>
                <input
                  type="text"
                  value={bestTimeToVisit}
                  onChange={(e) => setBestTimeToVisit(e.target.value)}
                  placeholder="e.g. October to March"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Typical Weather
                </label>
                <input
                  type="text"
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  placeholder="e.g. Misty & Cool"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Short Summary */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Summary <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">{summary.length} / 300 chars</span>
              </div>
              <textarea
                required
                rows={2}
                maxLength={300}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A compelling brief description shown on destination cards..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
              />
            </div>

            {/* Full Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Full Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive overview of sights, culture, travel tips..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
              />
            </div>

            {/* Cover Image URL */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Cover Image URL
              </label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {/* Toggles */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="convert-featured-toggle"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="convert-featured-toggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Feature on Homepage
                </label>
              </div>
              <span className="text-[11px] text-slate-400">
                Destination will be published as <strong className="text-emerald-600 font-bold uppercase">Active</strong>
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Converting...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>Confirm & Convert to Destination</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
