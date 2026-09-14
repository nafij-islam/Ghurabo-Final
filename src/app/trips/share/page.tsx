'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle, Sparkles, Compass } from 'lucide-react';
import { ITrip, ITripCost, ITripImage, TravelType } from '@/types';
import { usePreferences } from '@/context/PreferencesContext';
import { useAuth } from '@/hooks/useAuth';
import { tripsApi } from '@/lib/api/trips.api';
import { mediaApi } from '@/lib/api/media.api';
import { adaptBackendTripToITrip, toBackendTravelType } from '@/lib/api/adapters';
import StepBasics, { POPULAR_DESTINATIONS } from '@/components/trips/share/StepBasics';
import StepCosts from '@/components/trips/share/StepCosts';
import StepPhotosPublish from '@/components/trips/share/StepPhotosPublish';

export default function ShareTripPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { exchangeRate } = usePreferences();

  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdTrip, setCreatedTrip] = useState<ITrip | null>(null);

  // Authentication guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/trips/share');
    }
  }, [authLoading, isAuthenticated, router]);

  // STEP 1 STATE
  const [title, setTitle] = useState('');
  const [destinationName, setDestinationName] = useState("Cox's Bazar Beach");
  const [latitude, setLatitude] = useState<number | undefined>(21.4272);
  const [longitude, setLongitude] = useState<number | undefined>(92.0058);
  const [googlePlaceId, setGooglePlaceId] = useState<string | undefined>('ChIJjT0bX66SVDcRLB2a89Ww30s');
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [travelType, setTravelType] = useState<TravelType>('Solo');
  const [travellersCount, setTravellersCount] = useState(1);
  const [durationDays, setDurationDays] = useState(3);
  const [summary, setSummary] = useState('');

  // STEP 2 STATE
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

  // STEP 3 STATE
  const [images, setImages] = useState<ITripImage[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Computed Costs
  const rawTotal = transport + hotel + food + localTransport + tickets + shopping;
  const totalCost = inputCurrency === 'USD' ? Math.round(rawTotal * exchangeRate) : rawTotal;
  const perPersonCost = Math.round(totalCost / Math.max(1, travellersCount));

  const handleDestinationSelect = (name: string) => {
    setDestinationName(name);
    const foundPopular = POPULAR_DESTINATIONS.find((d) => d.name.toLowerCase() === name.toLowerCase());
    if (foundPopular) {
      setLatitude(foundPopular.lat);
      setLongitude(foundPopular.lng);
      setGooglePlaceId(foundPopular.placeId);
    } else {
      setLatitude(undefined);
      setLongitude(undefined);
      setGooglePlaceId(undefined);
    }
  };

  const handleNextStep = () => {
    setValidationError('');
    if (step === 1) {
      if (!title.trim()) {
        setValidationError('Please enter a trip title to continue.');
        return;
      }
      if (!destinationName.trim()) {
        setValidationError('Please specify your destination.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (rawTotal <= 0) {
        setValidationError('Please enter at least one estimated travel expense.');
        return;
      }
      if (!story.trim()) {
        setValidationError('Please provide your trip story / experience.');
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setValidationError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const fileList = Array.from(files);
    const uploadedImages: ITripImage[] = [];

    for (const file of fileList) {
      try {
        const uploadedAsset = await mediaApi.uploadMedia(file, 'ghurabo/trips', file.name.split('.')[0]);
        const mediaUrl = uploadedAsset.url || uploadedAsset.secureUrl;
        if (uploadedAsset && mediaUrl) {
          uploadedImages.push({
            url: mediaUrl,
            caption: uploadedAsset.caption || file.name.split('.')[0],
            publicId: uploadedAsset.publicId || uploadedAsset.cloudinaryPublicId,
          });
        }
      } catch (uploadErr) {
        console.warn('Real media upload failed, falling back to local object preview:', uploadErr);
        // Fallback to data URL or preview URL so user experience is not completely blocked
        const previewUrl = URL.createObjectURL(file);
        uploadedImages.push({
          url: previewUrl,
          caption: file.name.split('.')[0],
        });
      }
    }

    if (uploadedImages.length > 0) {
      setImages((prev) => [...prev, ...uploadedImages]);
    }
    setUploading(false);
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (coverImageIndex === indexToRemove) {
      setCoverImageIndex(0);
    } else if (coverImageIndex > indexToRemove) {
      setCoverImageIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async (isDraft = false) => {
    setValidationError('');
    if (!title.trim() || !destinationName.trim()) {
      setValidationError('Please provide title and destination.');
      return;
    }
    if (images.length === 0 && !isDraft) {
      setValidationError('Please upload at least 1 trip photo.');
      return;
    }

    setSubmitting(true);

    const rate = inputCurrency === 'USD' ? exchangeRate : 1;

    const defaultCover = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200';
    const selectedPhoto = images[coverImageIndex] || images[0];
    const isBlobUrl = (u?: string) => !u || u.startsWith('blob:') || u.startsWith('data:');

    // Find first non-blob photo if selected is a blob
    const validPhoto = !isBlobUrl(selectedPhoto?.url) 
      ? selectedPhoto 
      : images.find((img) => !isBlobUrl(img.url));

    const coverUrl = validPhoto?.url || defaultCover;
    const coverImageObj = {
      url: coverUrl,
      publicId: validPhoto?.publicId || '',
      caption: validPhoto?.caption || title.trim(),
    };

    const photosList = images.map((img, idx) => ({
      url: !isBlobUrl(img.url) ? img.url : coverUrl,
      publicId: img.publicId || '',
      caption: img.caption || `Photo ${idx + 1}`,
    }));

    const isValidCoord =
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      isFinite(latitude) &&
      isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;

    try {
      const backendTrip = await tripsApi.createTrip({
        title: title.trim(),
        destination: {
          name: destinationName.trim(),
          city: destinationName.trim(),
          country: 'Bangladesh',
          latitude: isValidCoord ? latitude : undefined,
          longitude: isValidCoord ? longitude : undefined,
        },
        summary: summary.trim() || title.trim(),
        story: story.trim(),
        travelType: toBackendTravelType(travelType),
        days: durationDays,
        nights: Math.max(1, durationDays - 1),
        costs: {
          transport: Math.round(transport * rate),
          lodging: Math.round(hotel * rate),
          food: Math.round(food * rate),
          sightseeing: Math.round(localTransport * rate),
          activities: Math.round(tickets * rate),
          miscellaneous: Math.round(shopping * rate),
        },
        itinerary: [
          {
            day: 1,
            title: `Arrival & Exploring ${destinationName}`,
            description: story.slice(0, 300) || `Exploring ${destinationName}`,
            locations: [
              {
                name: destinationName,
                latitude: isValidCoord ? latitude : undefined,
                longitude: isValidCoord ? longitude : undefined,
              },
            ],
          },
        ],
        coverImage: coverImageObj,
        photos: photosList,
      });

      const adapted = adaptBackendTripToITrip(backendTrip);
      setCreatedTrip(adapted);
    } catch (err: unknown) {
      console.error('Trip creation error:', err);
      const message = err instanceof Error ? err.message : 'Failed to create trip. Please try again.';
      setValidationError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="w-full pt-36 pb-20 bg-slate-950 text-white min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm">Checking authentication...</p>
      </div>
    );
  }

  // Success Confirmation Screen
  if (createdTrip) {
    return (
      <div className="w-full pt-32 pb-20 bg-slate-950 text-white min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-bold uppercase text-white">Trip Published!</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Your travel story &ldquo;{createdTrip.title}&rdquo; has been saved and is now visible in the community.
          </p>
          <div className="pt-2 space-y-2">
            <Link
              href={`/trips/${createdTrip.slug || createdTrip.id}`}
              className="w-full block py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              View Trip Story
            </Link>
            <Link
              href="/dashboard"
              className="w-full block py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl border border-white/10 transition-all"
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
          <p className="sm:hidden text-center text-xs font-bold text-brand-300 mt-3 pt-2 border-t border-white/5">
            Step {step} of 3: {step === 1 ? 'Trip Basics' : step === 2 ? 'Cost & Experience' : 'Photos & Publish'}
          </p>
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
          {step === 1 && (
            <StepBasics
              title={title}
              setTitle={setTitle}
              destinationName={destinationName}
              onDestinationSelect={handleDestinationSelect}
              travelDate={travelDate}
              setTravelDate={setTravelDate}
              travelType={travelType}
              setTravelType={setTravelType}
              durationDays={durationDays}
              setDurationDays={setDurationDays}
              travellersCount={travellersCount}
              setTravellersCount={setTravellersCount}
              summary={summary}
              setSummary={setSummary}
              onNext={handleNextStep}
            />
          )}

          {step === 2 && (
            <StepCosts
              inputCurrency={inputCurrency}
              setInputCurrency={setInputCurrency}
              transport={transport}
              setTransport={setTransport}
              hotel={hotel}
              setHotel={setHotel}
              food={food}
              setFood={setFood}
              localTransport={localTransport}
              setLocalTransport={setLocalTransport}
              tickets={tickets}
              setTickets={setTickets}
              shopping={shopping}
              setShopping={setShopping}
              totalCost={totalCost}
              perPersonCost={perPersonCost}
              travellersCount={travellersCount}
              story={story}
              setStory={setStory}
              tips={tips}
              setTips={setTips}
              safetyNotes={safetyNotes}
              setSafetyNotes={setSafetyNotes}
              onPrev={handlePrevStep}
              onNext={handleNextStep}
            />
          )}

          {step === 3 && (
            <StepPhotosPublish
              images={images}
              coverImageIndex={coverImageIndex}
              setCoverImageIndex={setCoverImageIndex}
              removeImage={removeImage}
              uploading={uploading}
              onFileUpload={handleFileUpload}
              title={title}
              destinationName={destinationName}
              durationDays={durationDays}
              travelType={travelType}
              totalCost={totalCost}
              perPersonCost={perPersonCost}
              submitting={submitting}
              onPrev={handlePrevStep}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
