'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Check, ArrowRight, ArrowLeft, Upload, Plus, Trash2, DollarSign, Calendar,
  MapPin, Clock, FileText, Image as ImageIcon, ShieldCheck, Compass
} from 'lucide-react';
import { ITripCost, IItineraryDay } from '@/types';

export default function ShareTripPage() {
  const [step, setStep] = useState(1);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  React.useEffect(() => {
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

  // Form State
  const [title, setTitle] = useState('');
  const [destinationName, setDestinationName] = useState("Cox's Bazar Beach");
  const [travelDate, setTravelDate] = useState('2026-02-01');
  const [travelType, setTravelType] = useState<'Solo' | 'Couple' | 'Family' | 'Group'>('Solo');
  const [travellersCount, setTravellersCount] = useState(1);
  const [durationDays, setDurationDays] = useState(3);
  const [summary, setSummary] = useState('');

  // Step 2: Story
  const [story, setStory] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [tips, setTips] = useState('');
  const [safetyNotes, setSafetyNotes] = useState('');

  // Step 3: Expenses
  const [inputCurrency, setInputCurrency] = useState<'BDT' | 'USD'>('BDT');
  const [transport, setTransport] = useState(3000);
  const [hotel, setHotel] = useState(5000);
  const [food, setFood] = useState(2500);
  const [localTransport, setLocalTransport] = useState(1000);
  const [tickets, setTickets] = useState(500);
  const [shopping, setShopping] = useState(1000);

  const totalCost = transport + hotel + food + localTransport + tickets + shopping;
  const perPersonCost = Math.round(totalCost / Math.max(1, travellersCount));

  // Step 4: Itinerary
  const [itinerary, setItinerary] = useState<IItineraryDay[]>([
    {
      dayNumber: 1,
      title: 'Arrival & Beach Walk',
      activities: ['Hotel Check-in', 'Sunset photography'],
      locations: ['Main Beach'],
      estimatedCost: 30,
    },
  ]);

  // Step 5: Images
  const [images, setImages] = useState<Array<{ url: string; caption?: string }>>([
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
      caption: 'Sunset vista ocean view',
    },
  ]);
  const [uploading, setUploading] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const addItineraryDay = () => {
    setItinerary([
      ...itinerary,
      {
        dayNumber: itinerary.length + 1,
        title: `Day ${itinerary.length + 1} Exploration`,
        activities: ['Morning sightseeing', 'Local lunch'],
        locations: ['Destination Center'],
        estimatedCost: 40,
      },
    ]);
  };

  const removeItineraryDay = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setItinerary(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
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
        }
      } catch (err) {}
    }
    setUploading(false);
  };

  const handleSubmit = async (isDraft: boolean) => {
    setSubmitting(true);
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

    const highlights = highlightsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          destinationName,
          travelDate,
          travelType,
          travellersCount,
          durationDays,
          summary,
          story,
          highlights,
          tips,
          safetyNotes,
          costBreakdown,
          inputCurrency,
          itinerary,
          images,
          coverImage: images[0]?.url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
          isDraft,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedSuccess(true);
      }
    } catch (err) {}
    setSubmitting(false);
  };

  if (checkingAuth) {
    return (
      <div className="w-full min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Verifying Authentication...</p>
        </div>
      </div>
    );
  }

  if (submittedSuccess) {
    return (
      <div className="w-full min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="font-display text-3xl font-bold text-slate-900 uppercase">
            Trip Submitted Successfully!
          </h2>
          <p className="text-slate-600 text-xs leading-relaxed">
            Your trip story has been submitted. After moderation review, it will be published to the All Trips feed and your photos will auto-sync to the Community Gallery!
          </p>
          <div className="pt-4 flex flex-col space-y-2">
            <Link
              href="/trips"
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase rounded-full shadow"
            >
              Browse All Community Trips
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase rounded-full"
            >
              View My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      {/* Banner */}
      <div className="bg-darkslate-900 text-white py-12 px-4 mb-10 border-b border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="px-3.5 py-1 bg-brand-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
            COMMUNITY TRIP CREATOR
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold uppercase mt-2 mb-3">
            Share Your Travel Story
          </h1>
          <p className="text-slate-300 text-xs font-light max-w-xl mx-auto">
            Step-by-step wizard: Share your itinerary, itemized expenses, and high-res photos.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
          {[
            { id: 1, label: 'Basic Info' },
            { id: 2, label: 'Story & Tips' },
            { id: 3, label: 'Cost Breakdown' },
            { id: 4, label: 'Itinerary' },
            { id: 5, label: 'Photos' },
            { id: 6, label: 'Review' },
          ].map((s) => (
            <div
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex items-center space-x-2 cursor-pointer px-3 py-1.5 rounded-full transition-all text-xs font-bold uppercase whitespace-nowrap ${
                step === s.id
                  ? 'bg-brand-500 text-white shadow'
                  : step > s.id
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {s.id}
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Form Body Container */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-slate-900 uppercase">Step 1: Basic Information</h2>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Trip Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4 Days Untamed Solo Expedition Along Marine Drive"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Destination Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cox's Bazar Beach"
                    value={destinationName}
                    onChange={(e) => setDestinationName(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Travel Date *</label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Travel Style *</label>
                  <select
                    value={travelType}
                    onChange={(e) => setTravelType(e.target.value as any)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="Solo">Solo</option>
                    <option value="Couple">Couple</option>
                    <option value="Family">Family</option>
                    <option value="Group">Group</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Travellers Count</label>
                  <input
                    type="number"
                    min="1"
                    value={travellersCount}
                    onChange={(e) => setTravellersCount(Number(e.target.value))}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Short Summary *</label>
                <textarea
                  rows={3}
                  placeholder="Give a quick overview of your experience..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Story & Tips */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-slate-900 uppercase">Step 2: Trip Story & Local Tips</h2>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Full Travel Experience Story *</label>
                <textarea
                  rows={6}
                  placeholder="Write your complete narrative, places visited, emotions, recommendations..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Trip Highlights (One per line)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Scooter ride along Marine Drive&#10;Seafood market dinner"
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Local Tips</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Rent scooters early morning..."
                    value={tips}
                    onChange={(e) => setTips(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Safety Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Avoid unlit roads after 9 PM..."
                    value={safetyNotes}
                    onChange={(e) => setSafetyNotes(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Cost Breakdown */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 uppercase">Step 3: Itemized Expense Breakdown</h2>
                  <p className="text-xs text-slate-500 font-light">
                    Provide costs for your trip. Costs will be normalized in BDT for database storage.
                  </p>
                </div>

                <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-full border border-slate-200 self-start sm:self-auto">
                  <span className="text-xs font-bold text-slate-600 pl-2">Input Currency:</span>
                  <button
                    type="button"
                    onClick={() => setInputCurrency('BDT')}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      inputCurrency === 'BDT' ? 'bg-brand-500 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🇧🇩 BDT (৳)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputCurrency('USD')}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      inputCurrency === 'USD' ? 'bg-brand-500 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🇺🇸 USD ($)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Transport / Flights ({inputCurrency === 'BDT' ? '৳ BDT' : '$ USD'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={transport}
                    onChange={(e) => setTransport(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Hotel / Stay ({inputCurrency === 'BDT' ? '৳ BDT' : '$ USD'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={hotel}
                    onChange={(e) => setHotel(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Food & Dining ({inputCurrency === 'BDT' ? '৳ BDT' : '$ USD'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={food}
                    onChange={(e) => setFood(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Local Rides / Rental ({inputCurrency === 'BDT' ? '৳ BDT' : '$ USD'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={localTransport}
                    onChange={(e) => setLocalTransport(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Entry Tickets ({inputCurrency === 'BDT' ? '৳ BDT' : '$ USD'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={tickets}
                    onChange={(e) => setTickets(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Shopping & Misc ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={shopping}
                    onChange={(e) => setShopping(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-6 bg-brand-500 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-white/80 uppercase tracking-wider block">Calculated Total</span>
                  <span className="font-display text-3xl font-extrabold">${totalCost}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/80 uppercase tracking-wider block">Cost / Person</span>
                  <span className="font-display text-4xl font-extrabold text-cyan-300">${perPersonCost}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Itinerary Builder */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-slate-900 uppercase">Step 4: Itinerary Builder</h2>
                <button
                  onClick={addItineraryDay}
                  className="flex items-center space-x-1 px-4 py-2 bg-brand-500 text-white rounded-full text-xs font-bold uppercase shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Day</span>
                </button>
              </div>

              <div className="space-y-4">
                {itinerary.map((day, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display text-lg font-bold text-brand-600">Day {day.dayNumber}</span>
                      {itinerary.length > 1 && (
                        <button
                          onClick={() => removeItineraryDay(idx)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Day Title e.g. Himchari & Inani Coral Walk"
                      value={day.title}
                      onChange={(e) => {
                        const updated = [...itinerary];
                        updated[idx].title = e.target.value;
                        setItinerary(updated);
                      }}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold mb-2"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Images Upload */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-slate-900 uppercase">Step 5: Trip Photography</h2>
              <p className="text-xs text-slate-500 font-light">
                Upload photos taken during your trip. These photos will automatically be synced to the public Community Gallery upon approval!
              </p>

              <div className="border-2 border-dashed border-slate-300 p-8 rounded-3xl text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <Upload className="w-10 h-10 text-brand-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Click to upload photos (Multiple allowed)</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="mt-4 text-xs"
                />
                {uploading && <p className="text-xs text-brand-600 font-semibold mt-2">Uploading images...</p>}
              </div>

              {/* Uploaded Images Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative h-36 rounded-2xl overflow-hidden group bg-slate-100">
                    <img src={img.url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full text-xs shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-brand-500 text-white text-[9px] font-bold rounded-full uppercase">
                        Cover Image
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Review & Publish */}
          {step === 6 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl font-bold text-slate-900 uppercase">Step 6: Review & Publish</h2>
              <div className="p-6 bg-slate-50 rounded-2xl space-y-3 text-xs text-slate-700">
                <p><strong>Title:</strong> {title || 'Untitled Trip'}</p>
                <p><strong>Destination:</strong> {destinationName}</p>
                <p><strong>Travel Style:</strong> {travelType} ({travellersCount} person)</p>
                <p><strong>Calculated Per-Person Cost:</strong> ${perPersonCost}</p>
                <p><strong>Uploaded Photos:</strong> {images.length} photos ready for Gallery auto-sync</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="flex-1 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm uppercase rounded-full shadow-lg transition-all"
                >
                  {submitting ? 'Submitting...' : 'Submit Trip for Approval'}
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="py-4 px-8 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm uppercase rounded-full transition-all"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          )}

          {/* Wizard Controls */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold uppercase"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {step < 6 && (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center space-x-1.5 bg-brand-500 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase shadow hover:bg-brand-600 transition-all"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
