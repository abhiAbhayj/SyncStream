import React from 'react';
import { Link } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { 
  Tv, 
  Film, 
  Music, 
  BookOpen, 
  Search, 
  Heart, 
  User, 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export default function Footer() {
  const { currentTrack } = useMusic();

  return (
    <footer
      className={`relative z-10 border-t-2 border-accentCyan/30 bg-darkCard/95 backdrop-blur-2xl px-4 sm:px-6 md:px-8 mt-auto transition-all duration-300 ${
        currentTrack
          ? 'pt-12 pb-44 sm:pb-36 md:pb-28'
          : 'pt-12 pb-28 md:pb-12'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Grid: Brand & Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Brand & Description Column (Spans 2 columns on large screens) */}
          <div className="sm:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <img 
                src="/logo.png" 
                alt="SyncStream" 
                className="w-8 h-8 rounded-xl object-cover border-2 border-accentCyan/60 shadow-[0_0_15px_rgba(var(--accent-cyan),0.4)] group-hover:scale-105 transition-transform" 
              />
              <span className="font-black text-2xl tracking-wider text-white font-outfit drop-shadow-md">
                Sync<span className="text-accentCyan">Stream</span>
              </span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-accentCyan/20 text-accentCyan border border-accentCyan/40 ml-1">
                v3.0 Live
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
              Next-generation federated streaming platform uniting blockbuster Movies, TV Series, ongoing Anime, MangaDex chapters, and studio-master 320kbps Music. Watch solo or connect in real-time synchronized Watch Parties.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>All CDN Nodes Online</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-accentPurple/20 text-accentPurple border border-accentPurple/40 font-mono">
                <Radio className="w-3 h-3 text-accentCyan animate-pulse" />
                <span>Dual-Engine Audio</span>
              </span>
            </div>
          </div>

          {/* Quick Links Column 1: Streaming & Media */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-accentCyan flex items-center gap-1.5">
              <Film className="w-4 h-4 text-accentCyan" />
              <span>Streaming</span>
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-gray-300">
              <li>
                <Link to="/catalog/trending/movie" className="hover:text-accentCyan transition-colors flex items-center gap-1.5">
                  <span>🎬 Blockbuster Movies</span>
                </Link>
              </li>
              <li>
                <Link to="/catalog/trending/tv" className="hover:text-accentCyan transition-colors flex items-center gap-1.5">
                  <span>📺 TV Series Hub</span>
                </Link>
              </li>
              <li>
                <Link to="/search?type=anime" className="hover:text-accentCyan transition-colors flex items-center gap-1.5">
                  <span>🌸 Anime Catalog</span>
                </Link>
              </li>
              <li>
                <Link to="/search?type=manga" className="hover:text-accentCyan transition-colors flex items-center gap-1.5">
                  <span>📖 MangaDex Reader</span>
                </Link>
              </li>
              <li>
                <Link to="/music" className="hover:text-accentCyan transition-colors flex items-center gap-1.5">
                  <span>🎵 320kbps Music Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Column 2: Navigation & Social */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-accentCyan flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accentCyan" />
              <span>Discovery</span>
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-gray-300">
              <li>
                <Link to="/" className="hover:text-accentCyan transition-colors flex items-center gap-1.5">
                  <span>🔥 Trending Discovery</span>
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-accentCyan transition-colors flex items-center gap-1.5">
                  <span>🔍 Global Search Engine</span>
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-accentCyan transition-colors flex items-center gap-1.5">
                  <span>❤️ Saved Watchlist</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-accentCyan transition-colors flex items-center gap-1.5">
                  <span>👤 Avatar &amp; Theme Studio</span>
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accentCyan transition-colors flex items-center gap-1.5">
                  <span>👥 Watch Party Rooms</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Column 3: Source Engines & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-accentCyan flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accentCyan" />
              <span>Data Feeds</span>
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-gray-300">
              <li className="flex items-center gap-1.5 text-gray-400">
                <span>TMDB Entertainment API</span>
              </li>
              <li className="flex items-center gap-1.5 text-gray-400">
                <span>Jikan / MyAnimeList Engine</span>
              </li>
              <li className="flex items-center gap-1.5 text-gray-400">
                <span>MangaDex Community Chapters</span>
              </li>
              <li className="flex items-center gap-1.5 text-gray-400">
                <span>YouTube Music Masters</span>
              </li>
              <li className="flex items-center gap-1.5 text-gray-400">
                <span>VidSrc PM/TO &amp; AutoEmbed CDN</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Horizontal Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} <strong className="text-white font-bold">SyncStream Network</strong>. Designed with dynamic theme harmony. Non-commercial personal media aggregator.
          </p>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
            <Link to="/" className="hover:text-accentCyan transition-colors">Home</Link>
            <span>&bull;</span>
            <Link to="/search" className="hover:text-accentCyan transition-colors">Search</Link>
            <span>&bull;</span>
            <Link to="/music" className="hover:text-accentCyan transition-colors">Music</Link>
            <span>&bull;</span>
            <Link to="/watchlist" className="hover:text-accentCyan transition-colors">Watchlist</Link>
            <span>&bull;</span>
            <Link to="/profile" className="hover:text-accentCyan transition-colors">Profile</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

