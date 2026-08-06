'use client';

import React from 'react';
import { Compass, ShieldCheck, Heart, Users, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-darkslate-900 text-white py-16 px-4 mb-12 border-b border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="px-3.5 py-1 bg-brand-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
            ABOUT GHURABO
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase mt-3 mb-4">
            Our Mission & Vision
          </h1>
          <p className="text-slate-300 text-sm font-light max-w-2xl mx-auto leading-relaxed">
            Building a trusted worldwide travel community where real explorers share authentic trip stories, verified cost breakdowns, and day-by-day itineraries.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-display text-3xl font-bold text-slate-900 uppercase">Why Ghurabo Was Created</h2>
          <p className="text-slate-600 text-sm leading-relaxed font-light">
            Traditional travel booking sites and blog articles are often filled with sponsored recommendations, outdated pricing, and vague estimates. Ghurabo was built from the ground up as a user-generated travel community platform where actual travellers share their exact receipts, daily schedules, local safety warnings, and honest opinions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-slate-900 uppercase mb-1">100% Authentic</h3>
            <p className="text-slate-500 text-xs font-light">Verified community submissions with proof option.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
            <Compass className="w-10 h-10 text-brand-500 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-slate-900 uppercase mb-1">Exact Costs</h3>
            <p className="text-slate-500 text-xs font-light">Itemized per-person expense breakdowns.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
            <Users className="w-10 h-10 text-cyan-500 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-slate-900 uppercase mb-1">Community First</h3>
            <p className="text-slate-500 text-xs font-light">Connect with Solo, Couple, Family, & Group travellers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
