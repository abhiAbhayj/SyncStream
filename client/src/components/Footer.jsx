import React from 'react';
import { Link } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';

export default function Footer() {
  const { currentTrack } = useMusic();

  return (
    <footer
      className={`relative z-10 border-t border-accentCyan/20 bg-[#0a0e1e]/90 backdrop-blur-xl px-4 sm:px-6 md:px-8 mt-auto transition-all duration-300 ${
        currentTrack
          ? 'pt-6 pb-28 sm:pb-24'
          : 'py-6 sm:py-8'
      }`}
    >
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
          <nav className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5 gap-y-2 text-xs font-semibold text-gray-300">
            <Link to="/catalog?type=movie" className="hover:text-accentCyan transition-colors">
              Movies
            </Link>
            <Link to="/catalog?type=tv" className="hover:text-[#10b981] transition-colors">
              TV Series
            </Link>
            <Link to="/catalog?type=anime" className="hover:text-accentPurple transition-colors">
              Anime
            </Link>
            <Link to="/catalog?type=manga" className="hover:text-accentPink transition-colors">
              Manga
            </Link>
            <Link to="/music" className="hover:text-accentCyan transition-colors">
              Music
            </Link>
            <Link to="/watchlist" className="hover:text-accentPink transition-colors">
              Watchlist
            </Link>
            <Link to="/profile" className="hover:text-accentPurple transition-colors">
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

