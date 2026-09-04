import React from 'react';
import { Tv } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-darkBorder bg-black/40 py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SyncStream" className="w-6 h-6 rounded-lg object-cover border border-white/20" />
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent font-outfit">
            SyncStream
          </span>
        </div>
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SyncStream. Powered by Jikan, MangaDex, and TMDB APIs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
