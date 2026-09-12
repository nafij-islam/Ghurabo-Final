'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Compass } from 'lucide-react';
import { useNewsletterModal } from '@/context/NewsletterModalContext';

export default function FloatingShareTripCTA() {
  const pathname = usePathname();
  const { isOpen: isNewsletterOpen } = useNewsletterModal();

  const [showBubble, setShowBubble] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Periodic speech bubble cycle
  useEffect(() => {
    let isMounted = true;

    const cycleBubble = () => {
      // Show bubble after 2.5s
      timerRef.current = setTimeout(() => {
        if (!isMounted) return;
        setShowBubble(true);

        // Keep visible for 3.5s
        timerRef.current = setTimeout(() => {
          if (!isMounted) return;
          setShowBubble(false);

          // Wait 8s before repeating
          timerRef.current = setTimeout(() => {
            if (!isMounted) return;
            cycleBubble();
          }, 8000);
        }, 3500);
      }, 2500);
    };

    cycleBubble();

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Excluded routes & modals
  if (
    !pathname ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname === '/trips/share' ||
    isNewsletterOpen
  ) {
    return null;
  }

  const isBubbleVisible = showBubble || isHovered;

  return (
    <div
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 flex items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Small Text Bubble (Beside the Icon to the left) */}
      <div
        className={`mr-3 transition-all duration-300 transform pointer-events-none ${
          isBubbleVisible
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 translate-x-2 scale-95'
        }`}
        aria-hidden={!isBubbleVisible}
      >
        <div className="relative bg-darkslate-900 text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-full shadow-xl border border-white/15 whitespace-nowrap flex items-center space-x-1.5 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping inline-block motion-reduce:hidden" />
          <span>SHARE YOUR TRIP</span>

          {/* Tiny pointer arrow toward circular button */}
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-darkslate-900 border-t border-r border-white/15 transform rotate-45" />
        </div>
      </div>

      {/* Main Floating Button */}
      <Link
        href="/trips/share"
        aria-label="Share your travel trip"
        className="group relative w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-xl shadow-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/45 transition-all duration-300 hover:scale-105 active:scale-95 animate-float motion-reduce:animate-none focus:outline-none focus:ring-4 focus:ring-brand-400/40"
      >
        {/* Subtle breathing glow ring */}
        <span className="absolute inset-0 rounded-full bg-brand-400 opacity-20 group-hover:opacity-40 animate-ping motion-reduce:hidden pointer-events-none" />

        {/* Travel / Share Icon */}
        <div className="relative flex items-center justify-center">
          <Compass className="w-6 h-6 transition-transform duration-300 group-hover:rotate-45" />
          <span className="absolute -top-1 -right-1 bg-white text-brand-700 rounded-full p-0.5 shadow-sm">
            <Plus className="w-3 h-3 stroke-[3]" />
          </span>
        </div>
      </Link>
    </div>
  );
}
