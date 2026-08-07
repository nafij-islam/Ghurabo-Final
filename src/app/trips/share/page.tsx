'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Check, ArrowRight, ArrowLeft, Upload, Trash2, DollarSign, Calendar,
  MapPin, Clock, FileText, Image as ImageIcon, ShieldCheck, Compass, Sparkles, AlertCircle
} from 'lucide-react';
import { ITripCost, IItineraryDay } from '@/types';
import { usePreferences } from '@/context/PreferencesContext';

const POPULAR_DESTINATIONS = [
  { name: "Cox's Bazar Beach", lat: 21.4272, lng: 92.0058, placeId: 'ChIJjT0bX66SVDcRLB2a89Ww30s' },
  { name: 'Sajek Valley', lat: 23.3820, lng: 92.2938, placeId: 'ChIJV4rQ52oVUzcR-sM-vjG-y00' },
  { name: 'Saint Martin Coral Island', lat: 20.6268, lng: 92.3225, placeId: 'ChIJY-xM58WTVDcROZ7r-jX-x22' },
  { name: 'Sreemangal Tea Gardens', lat: 24.3065, lng: 91.7296, placeId: 'ChIJm7_k3--cVTcR3bW8x_Y-x33' },
  { name: 'Bandarban Nilgiri', lat: 21.9213, lng: 92.3551, placeId: 'ChIJ3-yN68-TVDcR6W7r-jX-x44' },
  { name: 'Sylhet Ratargul Swamp Forest', lat: 25.0069, lng: 91.9351, placeId: 'ChIJZ-xM68-TVDcR7W7r-jX-x55' },
  { name: 'Sundarbans Mangrove Forest', lat: 21.9497, lng: 89.1833, placeId: 'ChIJ1-xM68-TVDcR8W7r-jX-x66' },
];

export default function ShareTripPage() {
  const [step, setStep] = useState(1);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [validationError, setValidationError] = useState('');

  const { currency: globalCurrency, exchangeRate } = usePreferences();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          setCheckingAuth(false);
        } else {
          window.location.href = '/auth/login?redirect=/trips/share';
        }
      })
      .catch(() => {
        window.location.href = '/auth/login?redirect=/trips/share';
      });
  }, []);

  // STEP 1 — TRIP BASICS
  const [title, setTitle] = useState('');
  const [destinationName, setDestinationName] = useState("Cox's Bazar Beach");
  const [latitude, setLatitude] = useState<number>(21.4272);
  const [longitude, setLongitude] = useState<number>(92.0058);
  const [googlePlaceId, setGooglePlaceId] = useState<string>('ChIJjT0bX66SVDcRLB2a89Ww30s');
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [travelType, setTravelType] = useState<'Solo' | 'Couple' | 'Family' | 'Group'>('Solo');
  const [travellersCount, setTravellersCount] = useState(1);
  const [durationDays, setDurationDays] = useState(3);
  const [summary, setSummary] = useState('');

  // STEP 2 — COST & EXPERIENCE
  const [inputCurrency, setInputCurrency] = useState<'BDT' | 'USD'>('BDT');
  const [transport, setTransport] = useState(3000);
  const [hotel, setHotel] = useState(5000);
  const [food, setFood] = useState(2500);
  const [localTransport, setLocalTransport] = useState(1000);
  const [tickets, setTickets] = useState(500);
  const [shopping, setShopping] = useState(1000);
  const [story, setStory] = useState('');
  const [tips, setTips] = useState('');
  const [safetyNotes, setSafetyNotes] = useState('');

  // Auto-calculated costs
  const rawTotal = transport + hotel + food + localTransport + tickets + shopping;
  const totalCost = inputCurrency === 'USD' ? Math.round(rawTotal * exchangeRate) : rawTotal;
  const perPersonCost = Math.round(totalCost / Math.max(1, travellersCount));

  // Itinerary
  const [itinerary, setItinerary] = useState<IItineraryDay[]>([
    {
      dayNumber: 1,
      title: 'Arrival & Exploring',
      activities: ['Hotel Check-in', 'Sunset scenery photography'],
      locations: ['Destination Landmark'],
      estimatedCost: Math.round(perPersonCost / 3),
    },
  ]);

  // STEP 3 — PHOTOS & PUBLISH
  const [images, setImages] = useState<Array<{ url: string; caption?: string }>>([
    {
      url: '/banner-one.png',
      caption: "Cox's Bazar Scenic Shoreline",
    },
  ]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleDestinationSelect = (name: string) => {
    setDestinationName(name);
    const found = POPULAR_DESTINATIONS.find((d) => d.name.toLowerCase() === name.toLowerCase());
    if (found) {
      setLatitude(found.lat);
      setLongitude(found.lng);
      setGooglePlaceId(found.placeId);
    }
  };

  const validateStep1 = () => {
    if (!title.trim()) {
      setValidationError('Please enter a descriptive Trip Title');
      return false;
    }
    if (!destinationName.trim()) {
      setValidationError('Please enter or select a Destination');
      return false;
    }
    if (!travelDate) {
      setValidationError('Please select a Travel Date');
      return false;
    }
    if (durationDays < 1) {
      setValidationError('Duration must be at least 1 day');
      return false;
    }
    if (travellersCount < 1) {
      setValidationError('Number of travellers must be at least 1');
      return false;
    }
    setValidationError('');
    return true;
  };

  const validateStep2 = () => {
    if (transport < 0 || hotel < 0 || food < 0) {
      setValidationError('Costs cannot be negative');
      return false;
    }
    if (!story.trim()) {
      setValidationError('Please write a short summary of your Trip Experience / Story');
      return false;
    }
    setValidationError('');
    return true;
  };

  const validateStep3 = () => {
    if (images.length === 0) {
      setValidationError('Please upload or keep at least 1 photo of your trip');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setValidationError('');
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setValidationError('');

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          setImages((prev) => [...prev, { url: data.url, caption: files[i].name }]);
        } else {
          setValidationError(data.error || 'Upload failed');
        }
      } catch (err) {
        setValidationError('Failed to upload image');
      }
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (coverImageIndex >= images.length - 1) {
      setCoverImageIndex(Math.max(0, images.length - 2));
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!validateStep3()) return;

    setSubmitting(true);
    setValidationError('');

    const costBreakdown: ITripCost = {
      transport,
      hotel,
      food,
      localTransport,
      tickets,
      guide: 0,
      shopping,
      misc: 0,
      totalCost,
      perPersonCost,
    };

    const selectedCover = images[coverImageIndex]?.url || images[0]?.url || '/banner-one.png';

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          destinationName,
          latitude,
          longitude,
          googlePlaceId,
          travelDate,
          travelType,
          travellersCount,
          durationDays,
          summary: summary || story.slice(0, 160) + '...',
          story,
          tips,
          safetyNotes,
          costBreakdown,
          inputCurrency,
          itinerary,
          images,
          coverImage: selectedCover,
          status: isDraft ? 'draft' : 'pending',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedSuccess(true);
      } else {
        setValidationError(data.error || 'Failed to submit trip');
      }
    } catch (err) {
      setValidationError('An unexpected error occurred during submission');
    }
    setSubmitting(false);
  };

  if (checkingAuth) {
    return (
      <div className="w-full min-h-screen pt-32 pb-20 bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (submittedSuccess) {
    return (
      <div className="w-full min-h-screen pt-32 pb-20 bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900 p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 bg-brand-500/20 border border-brand-500/40 text-brand-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="font-display text-3xl font-extrabold uppercase text-white">
            Trip Submitted!
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Your trip story has been submitted successfully for admin review. Once approved, it will be published to the public All Trips feed and automatically synced to the Community Gallery!
          </p>
          <div className="pt-2 flex flex-col space-y-2.5">
            <Link
              href="/trips"
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase rounded-xl shadow-lg transition-all"
            >
              Browse All Trips
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl border border-white/10 transition-all"
            >
              View My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-28 pb-20 bg-slate-950 text-white min-h-screen">
      {/* Header Banner */}
      <div className="bg-darkslate-900 py-10 px-4 mb-8 border-b border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center space-x-2 px-3.5 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXACTLY 3-STEP TRIP CREATOR</span>
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white mt-1 mb-2">
            Share Your Travel Story
          </h1>
          <p className="text-slate-400 text-xs font-light max-w-lg mx-auto">
            Inspire Bangladesh and global explorers by sharing your real trip budget, itinerary, and photos.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* 3-Step Indicator Bar */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Trip Basics', stepText: 'Step 1 of 3' },
              { num: 2, label: 'Cost & Experience', stepText: 'Step 2 of 3' },
              { num: 3, label: 'Photos & Publish', stepText: 'Step 3 of 3' },
            ].map((s, idx) => (
              <div key={s.num} className="flex-1 flex items-center">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                      step === s.num
                        ? 'bg-brand-500 text-white shadow-lg ring-2 ring-brand-400/50'
                        : step > s.num
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-bold ${step === s.num ? 'text-white' : 'text-slate-400'}`}>
                      {s.label}
                    </p>
                    <p className="text-[10px] text-slate-500">{s.stepText}</p>
                  </div>
                </div>
                {idx < 2 && <div className="flex-1 h-0.5 bg-white/10 mx-3 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center space-x-3 text-rose-300 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* =========================================================================
              STEP 1: TRIP BASICS (Step 1 of 3)
             ========================================================================= */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-bold text-brand-300 uppercase tracking-widest block mb-1">
                  Step 1 of 3
                </span>
                <h2 className="font-display text-2xl font-bold text-white uppercase">Trip Basics</h2>
                <p className="text-xs text-slate-400">Core destination & trip parameters</p>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                  Trip Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 Days Magical Coastal Getaway in Cox's Bazar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Destination */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                  Destination Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Type destination name or choose below..."
                  value={destinationName}
                  onChange={(e) => handleDestinationSelect(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold self-center mr-1">Popular:</span>
                  {POPULAR_DESTINATIONS.map((d) => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => handleDestinationSelect(d.name)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                        destinationName.toLowerCase() === d.name.toLowerCase()
                          ? 'bg-brand-500 text-white border-brand-400 font-bold'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Date & Travel Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                    Travel Type *
                  </label>
                  <select
                    value={travelType}
                    onChange={(e) => setTravelType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Solo">Solo Explorer</option>
                    <option value="Couple">Couple Escapes</option>
                    <option value="Family">Family Holiday</option>
                    <option value="Group">Group Adventure</option>
                  </select>
                </div>
              </div>

              {/* Duration & Travellers Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                    Number of Travellers *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={travellersCount}
                    onChange={(e) => setTravellersCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Summary Overview */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                  Trip Summary (Brief Teaser)
                </label>
                <textarea
                  rows={2}
                  placeholder="A short 1-2 sentence highlight of what made this trip special..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Step 1 Actions */}
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <span>Next: Cost & Experience</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: COST & EXPERIENCE (Step 2 of 3)
             ========================================================================= */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-bold text-brand-300 uppercase tracking-widest block mb-1">
                  Step 2 of 3
                </span>
                <h2 className="font-display text-2xl font-bold text-white uppercase">Cost & Experience</h2>
                <p className="text-xs text-slate-400">Itemized budget breakdown & real trip story</p>
              </div>

              {/* Currency Selector */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white uppercase">Input Currency</p>
                  <p className="text-[10px] text-slate-400">Canonical base database values are saved in BDT</p>
                </div>
                <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setInputCurrency('BDT')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      inputCurrency === 'BDT' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    BDT ৳
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputCurrency('USD')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      inputCurrency === 'USD' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    USD $
                  </button>
                </div>
              </div>

              {/* Itemized Expenses Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                    Transport Cost * ({inputCurrency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={transport}
                    onChange={(e) => setTransport(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                    Hotel/Accommodation * ({inputCurrency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={hotel}
                    onChange={(e) => setHotel(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                    Food & Dining * ({inputCurrency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={food}
                    onChange={(e) => setFood(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                    Local Transport ({inputCurrency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={localTransport}
                    onChange={(e) => setLocalTransport(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                    Entry Tickets ({inputCurrency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={tickets}
                    onChange={(e) => setTickets(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                    Shopping & Misc ({inputCurrency})
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={shopping}
                    onChange={(e) => setShopping(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Total & Per Person Calculation Summary Card */}
              <div className="bg-brand-500/10 border border-brand-500/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-brand-300 uppercase tracking-widest block">
                    Calculated Total Cost (BDT)
                  </span>
                  <p className="text-2xl font-extrabold text-white">৳{totalCost.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brand-300 uppercase tracking-widest block">
                    Per Person Cost ({travellersCount} {travellersCount > 1 ? 'travellers' : 'traveller'})
                  </span>
                  <p className="text-2xl font-extrabold text-cyan-300">৳{perPersonCost.toLocaleString()}</p>
                </div>
              </div>

              {/* Story */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                  Trip Story / Experience *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Share your detailed travel experience, highlights, scenic spots visited, food recommendations, and overall vibes..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Travel Tips & Safety Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                    Travel Tips
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Best time to visit, secret photo spots, local bus routes..."
                    value={tips}
                    onChange={(e) => setTips(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
                    Safety & Caution Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tide warnings, high-altitude precautions, emergency numbers..."
                    value={safetyNotes}
                    onChange={(e) => setSafetyNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center space-x-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  <span>Next: Photos & Publish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: PHOTOS & PUBLISH (Step 3 of 3)
             ========================================================================= */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-bold text-brand-300 uppercase tracking-widest block mb-1">
                  Step 3 of 3
                </span>
                <h2 className="font-display text-2xl font-bold text-white uppercase">Photos & Publish</h2>
                <p className="text-xs text-slate-400">Upload high-res images, choose cover, and submit</p>
              </div>

              {/* Image Upload Dropzone */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase block mb-2">
                  Upload Trip Photos * (At least 1 required)
                </label>
                <label className="w-full border-2 border-dashed border-white/20 hover:border-brand-400/60 bg-white/5 hover:bg-white/10 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <Upload className="w-8 h-8 text-brand-300 mb-2 animate-bounce" />
                  <span className="text-sm font-bold text-white">Click to Upload Photos</span>
                  <span className="text-xs text-slate-400 mt-1">Cloudinary High-Resolution Storage</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {uploading && (
                  <p className="text-xs text-brand-300 font-semibold mt-2 animate-pulse">
                    Uploading images to Cloudinary...
                  </p>
                )}
              </div>

              {/* Photo Preview Grid */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase block">
                    Photo Previews & Cover Selection (Click star to select cover)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all group ${
                          coverImageIndex === idx ? 'border-brand-400 ring-2 ring-brand-400/40' : 'border-white/10'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.caption || `Trip photo ${idx + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setCoverImageIndex(idx)}
                            className={`p-1.5 rounded-full text-xs font-bold ${
                              coverImageIndex === idx ? 'bg-brand-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'
                            }`}
                            title="Set as cover image"
                          >
                            ★ Cover
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full"
                            title="Remove photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {coverImageIndex === idx && (
                          <span className="absolute top-2 left-2 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow">
                            Cover Photo
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Summary Card Preview */}
              <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-300 block">
                  Trip Summary Preview
                </span>
                <div className="flex items-start space-x-4">
                  {images[coverImageIndex]?.url && (
                    <img
                      src={images[coverImageIndex].url}
                      alt="Cover Preview"
                      className="w-20 h-20 rounded-xl object-cover border border-white/20 shrink-0"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-white text-base">{title || 'Untitled Trip'}</h4>
                    <p className="text-xs text-slate-300">{destinationName} • {durationDays} Days • {travelType}</p>
                    <p className="text-xs font-bold text-brand-300 mt-1">৳{totalCost.toLocaleString()} Total (৳{perPersonCost.toLocaleString()} / person)</p>
                  </div>
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center space-x-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit(true)}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs uppercase rounded-xl border border-white/10 transition-all cursor-pointer"
                  >
                    Save Draft
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleSubmit(false)}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    <span>{submitting ? 'Submitting...' : 'Submit Trip'}</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
