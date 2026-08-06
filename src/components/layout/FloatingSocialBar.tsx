'use client';

import React from 'react';
import { Twitter, Facebook, Instagram, Youtube } from 'lucide-react';

export default function FloatingSocialBar() {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center bg-darkslate-900/90 text-white rounded-full py-5 px-3 shadow-2xl backdrop-blur-md border border-white/10 space-y-5">
      <a
        href="https://twitter.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitter"
        className="p-2 rounded-full hover:bg-brand-500 text-white/80 hover:text-white transition-all transform hover:scale-110"
      >
        <Twitter className="w-4 h-4" />
      </a>
      <a
        href="https://facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="p-2 rounded-full hover:bg-brand-500 text-white/80 hover:text-white transition-all transform hover:scale-110"
      >
        <Facebook className="w-4 h-4" />
      </a>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="p-2 rounded-full hover:bg-brand-500 text-white/80 hover:text-white transition-all transform hover:scale-110"
      >
        <Instagram className="w-4 h-4" />
      </a>
      <a
        href="https://youtube.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        className="p-2 rounded-full hover:bg-brand-500 text-white/80 hover:text-white transition-all transform hover:scale-110"
      >
        <Youtube className="w-4 h-4" />
      </a>
    </div>
  );
}
