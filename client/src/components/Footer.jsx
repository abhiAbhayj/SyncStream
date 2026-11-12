import React from 'react';
import { Link } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';

export default function Footer() {
  const { currentTrack } = useMusic();

  return (
    <footer
      className={`relative z-10 bg-[#0a0e1e]/90 backdrop-blur-xl px-3.5 sm:px-6 md:px-8 mt-auto transition-all duration-300 ${
        currentTrack
          ? 'pt-8 pb-40 md:pb-24'
          : 'pt-8 pb-20 md:pb-8 md:pt-8'
      }`}
    >
      {/* Interactive Aurora Wave Separator */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-5 overflow-hidden pointer-events-none select-none -translate-y-[1px]"
      >
        <div
          className="w-[200%] h-full flex animate-aurora-wave-1"
          style={{ color: 'rgb(var(--accent-cyan))' }}
        >
          <svg viewBox="0 0 1200 24" preserveAspectRatio="none" className="w-1/2 h-full">
            <path
              d="M0,12 C150,2 300,22 450,12 C600,2 750,22 900,12 C1050,2 1125,18 1200,12"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.48"
              strokeWidth="1.6"
            />
          </svg>
          <svg viewBox="0 0 1200 24" preserveAspectRatio="none" className="w-1/2 h-full">
            <path
              d="M0,12 C150,2 300,22 450,12 C600,2 750,22 900,12 C1050,2 1125,18 1200,12"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.48"
              strokeWidth="1.6"
            />
          </svg>
        </div>
        <div
          className="absolute inset-0 w-[200%] h-full flex animate-aurora-wave-2"
          style={{ color: 'rgb(var(--accent-purple))' }}
        >
          <svg viewBox="0 0 1200 24" preserveAspectRatio="none" className="w-1/2 h-full">
            <path
              d="M0,14 C180,22 360,4 540,14 C720,22 900,4 1080,14 C1140,18 1170,12 1200,14"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.38"
              strokeWidth="1.4"
            />
          </svg>
          <svg viewBox="0 0 1200 24" preserveAspectRatio="none" className="w-1/2 h-full">
            <path
              d="M0,14 C180,22 360,4 540,14 C720,22 900,4 1080,14 C1140,18 1170,12 1200,14"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.38"
              strokeWidth="1.4"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">
        
        {/* Main Row: Logo + Tagline & Quick Nav */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
          
          {/* Brand & Mini Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <Link to="/" className="inline-flex items-center gap-2 group shrink-0">
              <img 
                src="/logo.png" 
                alt="SyncStream" 
                className="w-7 h-7 rounded-xl object-cover border border-accentCyan/50 shadow-[0_0_12px_rgba(var(--accent-cyan),0.35)] group-hover:scale-105 transition-transform" 
              />
              <span className="font-extrabold text-lg tracking-wider text-white font-outfit">
                Sync<span className="text-accentCyan">Stream</span>
              </span>
            </Link>
            
            <span className="hidden sm:inline text-gray-600">•</span>
            
            <p className="text-xs text-gray-400 font-medium">
              Universal media streaming &amp; synchronized watch parties
            </p>
          </div>

          {/* Quick Nav Links */}
          <nav className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs font-semibold text-gray-300">
            <Link to="/catalog/trending/movies" className="px-2.5 py-1 rounded-full border border-transparent hover:border-accentCyan/35 hover:bg-accentCyan/10 hover:text-accentCyan active:scale-95 transition-all">
              Movies
            </Link>
            <Link to="/catalog/trending/tv" className="px-2.5 py-1 rounded-full border border-transparent hover:border-emerald-400/35 hover:bg-emerald-500/10 hover:text-[#10b981] active:scale-95 transition-all">
              TV Series
            </Link>
            <Link to="/catalog/trending/anime" className="px-2.5 py-1 rounded-full border border-transparent hover:border-accentPurple/35 hover:bg-accentPurple/10 hover:text-accentPurple active:scale-95 transition-all">
              Anime
            </Link>
            <Link to="/catalog/trending/manga" className="px-2.5 py-1 rounded-full border border-transparent hover:border-accentPink/35 hover:bg-accentPink/10 hover:text-accentPink active:scale-95 transition-all">
              Manga
            </Link>
            <Link to="/music" className="px-2.5 py-1 rounded-full border border-transparent hover:border-accentCyan/35 hover:bg-accentCyan/10 hover:text-accentCyan active:scale-95 transition-all">
              Music
            </Link>
            <Link to="/watchlist" className="px-2.5 py-1 rounded-full border border-transparent hover:border-accentPink/35 hover:bg-accentPink/10 hover:text-accentPink active:scale-95 transition-all">
              Watchlist
            </Link>
            <Link to="/profile" className="px-2.5 py-1 rounded-full border border-transparent hover:border-accentPurple/35 hover:bg-accentPurple/10 hover:text-accentPurple active:scale-95 transition-all">
              Profile
            </Link>
          </nav>

        </div>

        {/* Bottom Bar: Copyright & Minimal Feed Attributions */}
        <div className="pt-3.5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-500 font-medium text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} <span className="text-gray-300 font-semibold">SyncStream</span>. Non-commercial media aggregator.
          </p>

          <div className="flex items-center gap-2 flex-wrap justify-center text-[10px] text-gray-400 font-mono">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live CDN
            </span>
            <span>•</span>
            <span>TMDB</span>
            <span>•</span>
            <span>Jikan</span>
            <span>•</span>
            <span>MangaDex</span>
            <span>•</span>
            <span>YT Music</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

