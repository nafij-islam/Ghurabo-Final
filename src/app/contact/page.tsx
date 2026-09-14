'use client';

import React, { useState } from 'react';
import { Send, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { contactApi } from '@/lib/api/contact.api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validations
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (trimmedSubject.length < 3) {
      setError('Message subject must be at least 3 characters.');
      return;
    }

    if (trimmedMessage.length < 10) {
      setError('Message body must be at least 10 characters.');
      return;
    }

    setLoading(true);

    try {
      await contactApi.submitMessage({
        name: trimmedName,
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
      });

      // Clear form and display success
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSent(true);
    } catch (err: any) {
      const serverMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to send message. Please check your connection and try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnother = () => {
    setSent(false);
    setError(null);
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
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-900 uppercase">Message Received</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for reaching out to Ghurabo! Our team has received your message and will review it promptly.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSendAnother}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Send Another Message</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    placeholder="e.g. Tanvir Islam"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder="tanvir@ghurabo.com"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Message Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={loading}
                  placeholder="e.g. Verification Request / Feedback"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Your Message</label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  placeholder="Type your message here..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <span>Send Message</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
