'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="w-full pt-28 pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-darkslate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl border border-white/10 mb-10 text-center">
          <span className="px-3.5 py-1 bg-brand-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
            GET IN TOUCH
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold uppercase mt-3 mb-3">
            Contact Ghurabo Team
          </h1>
          <p className="text-slate-300 text-xs font-light max-w-md mx-auto">
            Have questions, feedback, or verification requests? Send us a message and our community team will reply within 24 hours.
          </p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-100">
          {sent ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-900 uppercase">Message Received</h3>
              <p className="text-xs text-slate-500">Thank you for reaching out to Ghurabo!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Islam"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="tanvir@ghurabo.com"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Message Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verification Request / Feedback"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Your Message</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Type your message here..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
