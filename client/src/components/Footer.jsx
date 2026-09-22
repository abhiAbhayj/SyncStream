import React from 'react';
import { useMusic } from '../context/MusicContext';

export default function Footer() {
  const { currentTrack } = useMusic();

  return (
    <footer
      className={`border-t border-darkBorder bg-black/40 px-4 mt-auto transition-all duration-300 ${
        currentTrack
          ? 'pt-8 pb-36 sm:pb-32 md:pb-28'
          : 'pt-8 pb-24 md:pb-8'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="SyncStream" className="w-6 h-6 rounded-lg object-cover border border-white/20" />
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent font-outfit">
            SyncStream
          </span>
        </div>
        <p className="text-sm text-gray-500 text-center md:text-right">
          &copy; {new Date().getFullYear()} SyncStream. Powered by Jikan, MangaDex, and TMDB APIs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

