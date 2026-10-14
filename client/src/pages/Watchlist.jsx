import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MediaGrid from '../components/MediaGrid';
import { Heart, Search, Loader2, Film, Tv, Sparkles, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Watchlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/media/watchlist');
        setWatchlist(res.data || []);
      } catch (err) {
        console.error('Failed to load watchlist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user, navigate]);

  // Separate media by type
  const movies = watchlist.filter(item => item.media_type === 'movie');
  const tvSeries = watchlist.filter(item => item.media_type === 'tv');
  const animes = watchlist.filter(item => item.media_type === 'anime');
  const mangas = watchlist.filter(item => item.media_type === 'manga');
  const others = watchlist.filter(item => !['movie', 'tv', 'anime', 'manga'].includes(item.media_type));

  const tabs = [
    { id: 'all', label: 'All Saved', count: watchlist.length, icon: Layers, activeColor: 'border-accentCyan bg-[#151c38] text-white shadow-[0_0_15px_rgba(var(--accent-cyan),0.35)]', iconColor: 'text-cyan-400 fill-cyan-400/40' },
    { id: 'movie', label: 'Movies', count: movies.length, icon: Film, activeColor: 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)]', iconColor: 'text-amber-400 fill-amber-400/40' },
    { id: 'tv', label: 'TV Series', count: tvSeries.length, icon: Tv, activeColor: 'border-emerald-400 bg-emerald-950/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]', iconColor: 'text-sky-400 fill-sky-400/40' },
    { id: 'anime', label: 'Anime', count: animes.length, icon: Sparkles, activeColor: 'border-purple-400 bg-purple-950/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.35)]', iconColor: 'text-pink-400 fill-pink-400/40' },
    { id: 'manga', label: 'Manga', count: mangas.length, icon: BookOpen, activeColor: 'border-pink-400 bg-pink-950/40 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.35)]', iconColor: 'text-emerald-400 fill-emerald-400/40' },
  ];

  const sections = [
    {
      id: 'movie',
      title: 'MOVIES SECTION',
      items: movies,
      icon: Film,
      tagBg: 'from-cyan-500/25 via-cyan-500/15 to-transparent',
      tagBorder: 'border-cyan-400/50',
      tagText: 'text-cyan-300',
      tagShadow: 'shadow-[0_0_20px_rgba(6,182,212,0.25)]',
      badgeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
      glowBg: 'bg-cyan-500/5',
      exploreLink: '/catalog?type=movie',
      exploreLabel: 'Explore Movies',
      emptyTitle: 'No Saved Movies',
      emptyDesc: "You haven't bookmarked any movies yet. Explore trending and popular movies to build your library.",
      itemUnit: 'Movie',
      itemUnitPlural: 'Movies',
    },
    {
      id: 'tv',
      title: 'TV SERIES SECTION',
      items: tvSeries,
      icon: Tv,
      tagBg: 'from-emerald-500/25 via-emerald-500/15 to-transparent',
      tagBorder: 'border-emerald-400/50',
      tagText: 'text-emerald-300',
      tagShadow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      glowBg: 'bg-emerald-500/5',
      exploreLink: '/catalog?type=tv',
      exploreLabel: 'Explore TV Series',
      emptyTitle: 'No Saved TV Series',
      emptyDesc: "You haven't bookmarked any TV shows yet. Browse binge-worthy series to track your episodes.",
      itemUnit: 'Show',
      itemUnitPlural: 'Shows',
    },
    {
      id: 'anime',
      title: 'ANIME SECTION',
      items: animes,
      icon: Sparkles,
      tagBg: 'from-purple-500/25 via-purple-500/15 to-transparent',
      tagBorder: 'border-purple-400/50',
      tagText: 'text-purple-300',
      tagShadow: 'shadow-[0_0_20px_rgba(168,85,247,0.25)]',
      badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
      glowBg: 'bg-purple-500/5',
      exploreLink: '/catalog?type=anime',
      exploreLabel: 'Explore Anime',
      emptyTitle: 'No Saved Anime',
      emptyDesc: "You haven't bookmarked any anime series yet. Find top broadcast and seasonal anime titles.",
      itemUnit: 'Anime',
      itemUnitPlural: 'Animes',
    },
    {
      id: 'manga',
      title: 'MANGA SECTION',
      items: mangas,
      icon: BookOpen,
      tagBg: 'from-pink-500/25 via-pink-500/15 to-transparent',
      tagBorder: 'border-pink-400/50',
      tagText: 'text-pink-300',
      tagShadow: 'shadow-[0_0_20px_rgba(236,72,153,0.25)]',
      badgeBg: 'bg-pink-500/15 border-pink-500/30 text-pink-300',
      glowBg: 'bg-pink-500/5',
      exploreLink: '/catalog?type=manga',
      exploreLabel: 'Explore Manga',
      emptyTitle: 'No Saved Manga',
      emptyDesc: "You haven't bookmarked any manga volumes yet. Explore Japanese manga, manhwa, and manhua.",
      itemUnit: 'Manga',
      itemUnitPlural: 'Mangas',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8 space-y-5 sm:space-y-6 min-h-[75vh]">
      
      {/* ── Header with Library Title & Stats ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-2xl bg-accentPink/15 border border-accentPink/30 text-accentPink shadow-[0_0_20px_rgba(255,85,173,0.3)] shrink-0">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white font-outfit truncate">
              My Library
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 truncate">
              Personal bookmarked collection across Movies, TV Series, Anime, and Manga.
            </p>
          </div>
        </div>

        {/* Total Bookmarks Counter Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-2 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-accentCyan animate-pulse shadow-[0_0_8px_#00e5ff]" />
            <span>Total Bookmarks:</span>
            <span className="font-extrabold text-white font-outfit">{watchlist.length}</span>
          </div>
        </div>
      </div>

      {/* ── Category Filter Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 cursor-pointer ${
                isActive
                  ? `${tab.activeColor} scale-[1.02]`
                  : 'border-darkBorder bg-darkCard/60 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform ${tab.iconColor}`} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                isActive ? 'bg-white/20 border-white/30 text-white' : 'bg-white/5 border-white/10 text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main Content Area ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-accentCyan" />
          <p className="text-gray-300 font-medium text-sm">Loading your library...</p>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-5 max-w-md mx-auto bg-[#0b0f24]/90 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
          <div className="p-4 bg-accentPink/15 border border-accentPink/30 rounded-2xl text-accentPink shadow-[0_0_30px_rgba(255,85,173,0.3)]">
            <Heart className="w-10 h-10 fill-current" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-lg text-white font-outfit">Your Library is Empty</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              You haven't bookmarked any titles yet. Explore movies, series, anime, and manga to start tracking your favorites!
            </p>
          </div>
          <Link
            to="/search"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-accentPurple/25 hover:opacity-95 transition"
          >
            <Search className="w-4 h-4 text-black fill-current" />
            Discover Titles Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          
          {/* Active category sections */}
          {sections.map((sec) => {
            const isMatch = activeTab === 'all' || activeTab === sec.id;
            if (!isMatch) return null;

            // In "All" tab, only render sections that have items
            if (activeTab === 'all' && sec.items.length === 0) return null;

            const Icon = sec.icon;

            // In single category tab when empty, render a dedicated clean empty state card
            if (sec.items.length === 0) {
              return (
                <div
                  key={sec.id}
                  className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0b0f24]/90 border border-white/10 p-8 sm:p-12 shadow-2xl backdrop-blur-md text-center max-w-lg mx-auto"
                >
                  <div className={`p-4 rounded-2xl w-fit mx-auto border ${sec.tagBorder} bg-gradient-to-b ${sec.tagBg} ${sec.tagText} ${sec.tagShadow} mb-4`}>
                    <Icon className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <h3 className="font-outfit font-extrabold text-white text-lg sm:text-xl mb-1.5">
                    {sec.emptyTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed">
                    {sec.emptyDesc}
                  </p>
                  <Link
                    to={sec.exploreLink}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accentCyan text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-accentCyan/25"
                  >
                    <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                    {sec.exploreLabel}
                  </Link>
                </div>
              );
            }

            // Render Section with Prominent Name Tag & Grid
            return (
              <section
                key={sec.id}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0b0f24]/90 border border-white/10 p-4 sm:p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-white/20"
              >
                {/* Ambient glow matching category color in background */}
                <div className={`absolute -top-12 -right-12 w-64 h-48 ${sec.glowBg} blur-3xl pointer-events-none rounded-full`} />

                {/* Section Header with Bold Distinct NAME TAG */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-white/10">
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    {/* Glowing Name Tag Pill */}
                    <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r ${sec.tagBg} border ${sec.tagBorder} ${sec.tagText} ${sec.tagShadow}`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                      <span className="font-orbitron font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                        {sec.title}
                      </span>
                    </div>

                    {/* Count Pill */}
                    <span className={`px-2.5 py-1 rounded-lg ${sec.badgeBg} text-[11px] sm:text-xs font-bold`}>
                      {sec.items.length} {sec.items.length === 1 ? sec.itemUnit : sec.itemUnitPlural} Saved
                    </span>
                  </div>

                  {/* Explore Link */}
                  <Link
                    to={sec.exploreLink}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition group self-start sm:self-auto"
                  >
                    <span>{sec.exploreLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Media Grid inside the framed card */}
                <div className="relative z-10">
                  <MediaGrid items={sec.items} />
                </div>
              </section>
            );
          })}

          {/* Other Media Section (if any uncategorized items exist) */}
          {activeTab === 'all' && others.length > 0 && (
            <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0b0f24]/90 border border-white/10 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
              <div className="relative z-10 flex items-center justify-between gap-3 pb-3 sm:pb-4 mb-4 sm:mb-5 border-b border-white/10">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gray-500/20 border border-gray-400/40 text-gray-200">
                    <Layers className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    <span className="font-orbitron font-extrabold text-xs sm:text-sm tracking-wider uppercase">
                      OTHER MEDIA
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-500/15 border border-gray-500/30 text-gray-300 text-[11px] sm:text-xs font-bold">
                    {others.length} Titles Saved
                  </span>
                </div>
              </div>
              <div className="relative z-10">
                <MediaGrid items={others} />
              </div>
            </section>
          )}

        </div>
      )}

    </div>
  );
}
