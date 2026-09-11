'use client';

import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepCostsProps {
  inputCurrency: 'BDT' | 'USD';
  setInputCurrency: (val: 'BDT' | 'USD') => void;
  transport: number;
  setTransport: (val: number) => void;
  hotel: number;
  setHotel: (val: number) => void;
  food: number;
  setFood: (val: number) => void;
  localTransport: number;
  setLocalTransport: (val: number) => void;
  tickets: number;
  setTickets: (val: number) => void;
  shopping: number;
  setShopping: (val: number) => void;
  totalCost: number;
  perPersonCost: number;
  travellersCount: number;
  story: string;
  setStory: (val: string) => void;
  tips: string;
  setTips: (val: string) => void;
  safetyNotes: string;
  setSafetyNotes: (val: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function StepCosts({
  inputCurrency,
  setInputCurrency,
  transport,
  setTransport,
  hotel,
  setHotel,
  food,
  setFood,
  localTransport,
  setLocalTransport,
  tickets,
  setTickets,
  shopping,
  setShopping,
  totalCost,
  perPersonCost,
  travellersCount,
  story,
  setStory,
  tips,
  setTips,
  safetyNotes,
  setSafetyNotes,
  onPrev,
  onNext,
}: StepCostsProps) {
  return (
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
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              inputCurrency === 'BDT' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            BDT ৳
          </button>
          <button
            type="button"
            onClick={() => setInputCurrency('USD')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
          onClick={onPrev}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <span>Next: Photos & Publish</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
