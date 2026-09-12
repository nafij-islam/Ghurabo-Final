'use client';

import React from 'react';
import Image from 'next/image';
import { Upload, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import { ITripImage } from '@/types';

interface StepPhotosPublishProps {
  images: ITripImage[];
  coverImageIndex: number;
  setCoverImageIndex: (idx: number) => void;
  removeImage: (idx: number) => void;
  uploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
  destinationName: string;
  durationDays: number;
  travelType: string;
  totalCost: number;
  perPersonCost: number;
  submitting: boolean;
  onPrev: () => void;
  onSubmit: (isDraft: boolean) => void;
}

export default function StepPhotosPublish({
  images,
  coverImageIndex,
  setCoverImageIndex,
  removeImage,
  uploading,
  onFileUpload,
  title,
  destinationName,
  durationDays,
  travelType,
  totalCost,
  perPersonCost,
  submitting,
  onPrev,
  onSubmit,
}: StepPhotosPublishProps) {
  return (
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
          <span className="text-xs text-slate-400 mt-1">High-Resolution Photo Gallery</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onFileUpload}
            className="hidden"
          />
        </label>
        {uploading && (
          <p className="text-xs text-brand-300 font-semibold mt-2 animate-pulse">
            Loading images...
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
                className={`relative h-32 rounded-xl overflow-hidden border-2 transition-all group ${
                  coverImageIndex === idx ? 'border-brand-400 ring-2 ring-brand-400/40' : 'border-white/10'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.caption || `Trip photo ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  unoptimized={img.url.startsWith('blob:') || img.url.startsWith('data:')}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setCoverImageIndex(idx)}
                    className={`p-1.5 rounded-full text-xs font-bold cursor-pointer ${
                      coverImageIndex === idx ? 'bg-brand-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'
                    }`}
                    title="Set as cover image"
                  >
                    ★ Cover
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full cursor-pointer"
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
            <Image
              src={images[coverImageIndex].url}
              alt="Cover Preview"
              width={80}
              height={80}
              unoptimized={images[coverImageIndex].url.startsWith('blob:') || images[coverImageIndex].url.startsWith('data:')}
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
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => onSubmit(true)}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs uppercase rounded-xl border border-white/10 transition-all cursor-pointer disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => onSubmit(false)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? 'Submitting...' : 'Submit Trip'}</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
