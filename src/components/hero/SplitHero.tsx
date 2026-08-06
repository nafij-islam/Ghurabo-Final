'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Plane, MapPin } from 'lucide-react';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000',
    title: 'EXPLORE THE WORLD',
    subtitle: 'WORLDWIDE TRAVEL COMMUNITY',
    description: 'Share your real travel stories, itemized budget breakdowns, day-by-day itineraries, and connect with passionate solo, couple, family, and group explorers around the globe.',
    location: "Cox's Bazar Beach, Bangladesh",
  },
  {
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000',
    title: 'TOUCH THE CLOUDS',
    subtitle: 'AUTHENTIC MOUNTAIN ESCAPES',
    description: 'Discover high-altitude valleys, misty morning ridges, scenic 4x4 jeep trails, and local tribal culture with real cost insights from fellow travellers.',
    location: 'Sajek Valley Hilltop, Rangamati',
  },
  {
    image: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&q=80&w=2000',
    title: 'CRYSTAL PARADISE',
    subtitle: 'UNSPOILED ISLAND ADVENTURES',
    description: 'Uncover crystal blue coral waters, secluded coconut palm beaches, seafood markets, and verified budget guides created by real community members.',
    location: 'Saint Martin Coral Island',
  }
];

export default function SplitHero() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slide = HERO_SLIDES[currentSlideIndex];

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section className="relative w-full min-h-screen bg-brand-500 overflow-hidden flex items-center pt-20 lg:pt-0">
      {/* Background Split Layout */}
      <div className="absolute inset-0 flex flex-col lg:flex-row w-full h-full">
        {/* Left Side: Vibrant Turquoise Container */}
        <div className="w-full lg:w-1/2 h-full bg-brand-500 relative flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16 lg:py-0 z-20 overflow-hidden">
          {/* Layered Background Watermark Text */}
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 watermark-text select-none opacity-10 pointer-events-none font-display">
            GHURABO
          </div>

          {/* Dotted Airplane Path SVG Overlay */}
          <div className="absolute top-12 left-10 w-72 h-36 opacity-30 pointer-events-none hidden sm:block">
            <svg viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path
                d="M10 120 C 80 20, 200 40, 280 10"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            </svg>
            <Plane className="w-6 h-6 text-white absolute top-0 right-4 transform rotate-45 animate-float" />
          </div>

          {/* Landmark Vector Silhouettes Watermark Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-44 opacity-20 pointer-events-none flex items-end justify-between px-4">
            <svg viewBox="0 0 1000 200" fill="white" className="w-full h-auto">
              {/* Eiffel Tower, Big Ben, Torii Gate, Windmill, Pyramids Silhouettes */}
              <path d="M50 200 L70 100 L65 100 L65 70 L75 70 L75 0 L85 0 L85 70 L95 70 L95 100 L90 100 L110 200 Z" />
              <path d="M200 200 L200 60 L220 20 L240 60 L240 200 Z M210 80 H230 M210 120 H230" stroke="white" strokeWidth="2" />
              <path d="M400 200 L400 90 H460 L460 200 M390 110 H470 M390 80 H470" stroke="white" strokeWidth="4" />
              <path d="M600 200 L630 110 L660 200 M630 110 L590 70 M630 110 L670 70 M630 110 L590 150 M630 110 L670 150" stroke="white" strokeWidth="3" />
              <path d="M800 200 L850 120 L900 200 Z M880 200 L920 140 L960 200 Z" />
            </svg>
          </div>

          {/* Left Content Column */}
          <div className="relative z-30 max-w-xl">
            {/* Tagline */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3.5 py-1 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse"></span>
              <span>{slide.subtitle}</span>
            </div>

            {/* Huge Display Headline matching reference font */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white leading-none tracking-tight text-shadow-hero mb-6">
              {slide.title}
            </h1>

            {/* Supporting Description */}
            <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-8 max-w-lg font-light">
              {slide.description}
            </p>

            {/* CTA Buttons matching reference design */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Translucent filled Discover Button */}
              <Link
                href="/trips"
                className="inline-flex items-center space-x-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold px-7 py-3.5 rounded-full border border-white/40 transition-all shadow-lg transform hover:-translate-y-0.5"
              >
                <span className="text-sm uppercase tracking-wider">Discover</span>
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </Link>

              {/* White Outlined Rectangular Button */}
              <Link
                href="/about"
                className="inline-flex items-center justify-center text-white font-semibold text-sm uppercase tracking-wider px-7 py-3.5 rounded-md border-2 border-white hover:bg-white hover:text-brand-700 transition-all shadow-md"
              >
                Know More
              </Link>
            </div>

            {/* Location Tag */}
            <div className="mt-8 flex items-center space-x-2 text-white/80 text-xs font-medium">
              <MapPin className="w-4 h-4 text-cyan-300" />
              <span>Current Featured Location: {slide.location}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Cinematic Photograph with Paint-Brush Mask Overlay */}
        <div className="w-full lg:w-1/2 h-[450px] lg:h-full relative overflow-hidden">
          {/* Main Cinematic Image */}
          <div
            className="w-full h-full bg-cover bg-center transition-all duration-700 transform scale-105"
            style={{ backgroundImage: `url(${slide.image})` }}
          />

          {/* Organic Torn Edge Brush Mask Divider overlaying the left boundary on desktop */}
          <div className="hidden lg:block absolute -left-1 top-0 bottom-0 w-24 z-20 pointer-events-none">
            <svg
              viewBox="0 0 100 1000"
              preserveAspectRatio="none"
              className="w-full h-full text-brand-500 fill-current"
            >
              {/* Organic Brush Torn Edge SVG Path */}
              <path d="M0,0 Q30,50 10,120 T25,250 T5,380 T30,500 T10,620 T25,750 T5,880 T20,1000 L0,1000 Z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Slider Controls: Circular Arrow Buttons matching reference image */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full border-2 border-white/80 text-white flex items-center justify-center backdrop-blur-sm bg-black/10 hover:bg-white hover:text-brand-700 transition-all transform hover:scale-110 shadow-xl"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-4 lg:right-20 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full border-2 border-white/80 text-white flex items-center justify-center backdrop-blur-sm bg-black/10 hover:bg-white hover:text-brand-700 transition-all transform hover:scale-110 shadow-xl"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
}
