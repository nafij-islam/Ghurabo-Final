'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Send, Heart, MapPin, Mail, ShieldCheck } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { t } = usePreferences();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="relative bg-darkslate-950 text-white pt-16 pb-12 overflow-hidden border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center group">
              <img
                src="/logo-ghurabo.png"
                alt="Ghurabo Logo"
                className="h-14 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>

            <p className="text-slate-400 text-sm font-light leading-relaxed max-w-sm">
              {t('footer.aboutText')}
            </p>

            <div className="pt-2 flex items-center space-x-2 text-xs text-brand-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Community-Verified Travel Guides</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/destinations" className="hover:text-brand-300 transition-colors">
                  {t('nav.destinations')}
                </Link>
              </li>
              <li>
                <Link href="/trips" className="hover:text-brand-300 transition-colors">
                  {t('nav.trips')}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-brand-300 transition-colors">
                  {t('nav.gallery')}
                </Link>
              </li>
              <li>
                <Link href="/trips/share" className="hover:text-brand-300 transition-colors font-medium text-cyan-300">
                  + {t('nav.shareTrip')}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-300 transition-colors">
                  {t('nav.admin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories & Types */}
          <div>
            <h4 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Travel Styles
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/trips?travelType=Solo" className="hover:text-brand-300 transition-colors">
                  Solo Backpacking
                </Link>
              </li>
              <li>
                <Link href="/trips?travelType=Couple" className="hover:text-brand-300 transition-colors">
                  Couple & Honeymoon
                </Link>
              </li>
              <li>
                <Link href="/trips?travelType=Family" className="hover:text-brand-300 transition-colors">
                  Family Vacation
                </Link>
              </li>
              <li>
                <Link href="/trips?travelType=Group" className="hover:text-brand-300 transition-colors">
                  Group & Friends Tour
                </Link>
              </li>
              <li>
                <Link href="/destinations?category=Beach" className="hover:text-brand-300 transition-colors">
                  Beach & Islands
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Newsletter
            </h4>
            <p className="text-slate-400 text-xs mb-3 font-light">
              Get weekly budget travel tips, new hidden destinations, and community highlights.
            </p>

            {subscribed ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-medium">
                ✓ Thank you for subscribing to Ghurabo!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/20">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent text-white text-xs px-3 focus:outline-none w-full placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} Ghurabo Travel Community. {t('footer.rights')}</p>
          <div className="flex items-center space-x-6">
            <Link href="/about" className="hover:text-white transition-colors">
              {t('nav.about')}
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
