'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { setCurrencyRate } from '@/lib/clientStore';

export default function CurrencyControlCard() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const rateInput = e.currentTarget.elements.namedItem('rate') as HTMLInputElement;
    const targetRate = Number(rateInput?.value || 130);
    setCurrencyRate(targetRate);
    alert(`Exchange rate updated! 1 USD = ৳${targetRate}`);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 uppercase flex items-center space-x-2">
            <Compass className="w-6 h-6 text-brand-500" />
            <span>USD / BDT Currency Exchange Rate Control</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure the platform conversion rate used when converting BDT costs into USD presentation.
          </p>
        </div>
        <span className="px-3.5 py-1 bg-brand-100 text-brand-800 text-xs font-bold rounded-full uppercase self-start sm:self-auto">
          Canonical Base: BDT (৳)
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-slate-50 p-6 rounded-2xl border border-slate-200"
      >
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
            Exchange Rate (1 USD = X BDT)
          </label>
          <input
            name="rate"
            type="number"
            step="0.1"
            min="1"
            defaultValue={130}
            required
            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
            Calculation Mode
          </label>
          <select
            name="mode"
            defaultValue="manual"
            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none"
          >
            <option value="manual">Manual Rate</option>
            <option value="automatic">Automatic (Live API Rate)</option>
          </select>
        </div>

        <button
          type="submit"
          className="py-3 px-6 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all cursor-pointer"
        >
          Update Exchange Rate
        </button>
      </form>
    </div>
  );
}
