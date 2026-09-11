'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, DollarSign, ChevronDown } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';

export default function PreferencesDropdown() {
  const { currency, language, setCurrency, setLanguage } = usePreferences();
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setLangOpen(false);
        setCurrOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="hidden md:flex items-center space-x-2">
      {/* Language Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setLangOpen((prev) => !prev);
            setCurrOpen(false);
          }}
          aria-expanded={langOpen}
          aria-label="Select Language"
          className="flex items-center space-x-1 text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-brand-300" />
          <span>{language === 'bn' ? 'BN' : 'EN'}</span>
          <ChevronDown className="w-3 h-3 text-white/60" />
        </button>

        {langOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-1.5 text-xs text-white z-50">
            <button
              onClick={() => {
                setLanguage('en');
                setLangOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                language === 'en' ? 'text-brand-300 font-bold' : 'text-slate-200'
              }`}
            >
              <span>English</span>
              <span>🇬🇧</span>
            </button>
            <button
              onClick={() => {
                setLanguage('bn');
                setLangOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                language === 'bn' ? 'text-brand-300 font-bold' : 'text-slate-200'
              }`}
            >
              <span>বাংলা</span>
              <span>🇧🇩</span>
            </button>
          </div>
        )}
      </div>

      {/* Currency Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setCurrOpen((prev) => !prev);
            setLangOpen(false);
          }}
          aria-expanded={currOpen}
          aria-label="Select Currency"
          className="flex items-center space-x-1 text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
        >
          <DollarSign className="w-3.5 h-3.5 text-brand-300" />
          <span>{currency === 'USD' ? 'USD $' : 'BDT ৳'}</span>
          <ChevronDown className="w-3 h-3 text-white/60" />
        </button>

        {currOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl py-1.5 text-xs text-white z-50">
            <button
              onClick={() => {
                setCurrency('BDT');
                setCurrOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                currency === 'BDT' ? 'text-brand-300 font-bold' : 'text-slate-200'
              }`}
            >
              <span>🇧🇩 BDT — ৳</span>
            </button>
            <button
              onClick={() => {
                setCurrency('USD');
                setCurrOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                currency === 'USD' ? 'text-brand-300 font-bold' : 'text-slate-200'
              }`}
            >
              <span>🇺🇸 USD — $</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
