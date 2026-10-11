import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MediaGrid from '../components/MediaGrid';
import { Heart, Search, Loader2, ArrowLeft, Film, Tv, Sparkles, BookOpen, Layers, ArrowRight } from 'lucide-react';
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
    { id: 'all', label: 'All Saved', count: watchlist.length, icon: Layers, activeBadge: 'bg-accentCyan text-black border-accentCyan', badge: 'bg-white/10 text-gray-300' },
    { id: 'movie', label: 'Movies', count: movies.length, icon: Film, activeBadge: 'bg-accentCyan text-black border-accentCyan', badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { id: 'tv', label: 'TV Series', count: tvSeries.length, icon: Tv, activeBadge: 'bg-[#10b981] text-black border-[#10b981]', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'anime', label: 'Anime', count: animes.length, icon: Sparkles, activeBadge: 'bg-accentPurple text-white border-accentPurple', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'manga', label: 'Manga', count: mangas.length, icon: BookOpen, activeBadge: 'bg-accentPink text-white border-accentPink', badge: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-36 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-accentCyan" />
        <p className="text-gray-400 font-medium">Loading your watchlist library...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-4 md:px-8 space-y-6 sm:space-y-8 min-h-[75vh]">
      
      {/* Back Button */}
      <div>
        <button
          onClick={() => { if (window.history.state && window.history.state.idx > 0) navigate(-1); else navigate('/'); }}
          className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 border-accentCyan bg-[#0f1428] text-white hover:bg-accentCyan hover:text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(var(--accent-cyan),0.5)] ring-1 ring-accentCyan/40 transition-all duration-200 active:scale-95 cursor-pointer z-30 group"
        >
          <span className="p-0.5 sm:p-1 rounded-lg bg-accentCyan text-black group-hover:bg-black group-hover:text-accentCyan transition-colors flex items-center justify-center shrink-0">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          </span>
          <span className="font-extrabold tracking-wider">Back</span>
        </button>
      </div>

      {/* Header with Library Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-darkBorder pb-6">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accentPink/15 border border-accentPink/30 text-accentPink shadow-[0_0_15px_rgba(255,85,173,0.3)]">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-outfit">
                My Library
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Organized bookmarks for Movies, TV Series, Anime, and Manga.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" /> {movies.length} Movies
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5" /> {tvSeries.length} TV Series
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> {animes.length} Anime
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> {mangas.length} Manga
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
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
                  ? 'border-accentCyan bg-[#151c38] text-white shadow-[0_0_20px_rgba(var(--accent-cyan),0.35)] ring-1 ring-accentCyan/40 scale-[1.02]'
                  : 'border-darkBorder bg-darkCard/60 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${isActive ? tab.activeBadge : tab.badge}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 max-w-md mx-auto glass-panel border border-darkBorder p-8 rounded-3xl">
          <div className="p-4 bg-accentPink/10 border border-accentPink/20 rounded-full text-accentPink shadow-[0_0_30px_rgba(255,85,173,0.3)]">
            <Heart className="w-10 h-10" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-lg text-white font-outfit">Your Library is Empty</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              You haven't bookmarked any titles yet. Explore movies, series, anime, and manga to start tracking content!
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
        <div className="space-y-10 sm:space-y-12">
          
          {/* 🎬 1. MOVIES SECTION */}
          {(activeTab === 'all' || activeTab === 'movie') && (
            movies.length > 0 ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-darkBorder/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center">
                      <Film className="w-5 h-5 stroke-[2.5]" />
                    </span>
                    <h2 className="font-extrabold text-lg sm:text-xl text-white font-outfit">
                      Movies
                    </h2>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase tracking-wider">
                      {movies.length} {movies.length === 1 ? 'Movie' : 'Movies'}
                    </span>
                  </div>
                  <Link
                    to="/catalog?type=movie"
                    className="text-xs font-bold text-gray-400 hover:text-accentCyan flex items-center gap-1 transition group"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <MediaGrid items={movies} />
              </section>
            ) : (
              activeTab === 'movie' && (
                <div className="py-12 text-center space-y-3 glass-panel border border-darkBorder rounded-2xl p-6 max-w-lg mx-auto">
                  <Film className="w-10 h-10 text-cyan-400 mx-auto" />
                  <h3 className="font-bold text-white text-base">No Saved Movies</h3>
                  <p className="text-xs text-gray-400">You don't have any movies in your watchlist yet.</p>
                  <Link to="/catalog?type=movie" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accentCyan text-black font-bold text-xs uppercase tracking-wider mt-2">
                    Explore Movies
                  </Link>
                </div>
              )
            )
          )}

          {/* 📺 2. TV SERIES SECTION */}
          {(activeTab === 'all' || activeTab === 'tv') && (
            tvSeries.length > 0 ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-darkBorder/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center">
                      <Tv className="w-5 h-5 stroke-[2.5]" />
                    </span>
                    <h2 className="font-extrabold text-lg sm:text-xl text-white font-outfit">
                      TV Series
                    </h2>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider">
                      {tvSeries.length} {tvSeries.length === 1 ? 'Show' : 'Shows'}
                    </span>
                  </div>
                  <Link
                    to="/catalog?type=tv"
                    className="text-xs font-bold text-gray-400 hover:text-[#10b981] flex items-center gap-1 transition group"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <MediaGrid items={tvSeries} />
              </section>
            ) : (
              activeTab === 'tv' && (
                <div className="py-12 text-center space-y-3 glass-panel border border-darkBorder rounded-2xl p-6 max-w-lg mx-auto">
                  <Tv className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h3 className="font-bold text-white text-base">No Saved TV Series</h3>
                  <p className="text-xs text-gray-400">You don't have any TV series in your watchlist yet.</p>
                  <Link to="/catalog?type=tv" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10b981] text-black font-bold text-xs uppercase tracking-wider mt-2">
                    Explore TV Series
                  </Link>
                </div>
              )
            )
          )}

          {/* ✨ 3. ANIME SECTION */}
          {(activeTab === 'all' || activeTab === 'anime') && (
            animes.length > 0 ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-darkBorder/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 stroke-[2.5]" />
                    </span>
                    <h2 className="font-extrabold text-lg sm:text-xl text-white font-outfit">
                      Anime
                    </h2>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 uppercase tracking-wider">
                      {animes.length} {animes.length === 1 ? 'Anime' : 'Animes'}
                    </span>
                  </div>
                  <Link
                    to="/catalog?type=anime"
                    className="text-xs font-bold text-gray-400 hover:text-accentPurple flex items-center gap-1 transition group"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <MediaGrid items={animes} />
              </section>
            ) : (
              activeTab === 'anime' && (
                <div className="py-12 text-center space-y-3 glass-panel border border-darkBorder rounded-2xl p-6 max-w-lg mx-auto">
                  <Sparkles className="w-10 h-10 text-purple-400 mx-auto" />
                  <h3 className="font-bold text-white text-base">No Saved Anime</h3>
                  <p className="text-xs text-gray-400">You don't have any anime in your watchlist yet.</p>
                  <Link to="/catalog?type=anime" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accentPurple text-white font-bold text-xs uppercase tracking-wider mt-2">
                    Explore Anime
                  </Link>
                </div>
              )
            )
          )}

          {/* 📖 4. MANGA SECTION */}
          {(activeTab === 'all' || activeTab === 'manga') && (
            mangas.length > 0 ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-darkBorder/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.3)] flex items-center justify-center">
                      <BookOpen className="w-5 h-5 stroke-[2.5]" />
                    </span>
                    <h2 className="font-extrabold text-lg sm:text-xl text-white font-outfit">
                      Manga
                    </h2>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/40 uppercase tracking-wider">
                      {mangas.length} {mangas.length === 1 ? 'Manga' : 'Mangas'}
                    </span>
                  </div>
                  <Link
                    to="/catalog?type=manga"
                    className="text-xs font-bold text-gray-400 hover:text-accentPink flex items-center gap-1 transition group"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <MediaGrid items={mangas} />
              </section>
            ) : (
              activeTab === 'manga' && (
                <div className="py-12 text-center space-y-3 glass-panel border border-darkBorder rounded-2xl p-6 max-w-lg mx-auto">
                  <BookOpen className="w-10 h-10 text-pink-400 mx-auto" />
                  <h3 className="font-bold text-white text-base">No Saved Manga</h3>
                  <p className="text-xs text-gray-400">You don't have any manga in your watchlist yet.</p>
                  <Link to="/catalog?type=manga" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accentPink text-white font-bold text-xs uppercase tracking-wider mt-2">
                    Explore Manga
                  </Link>
                </div>
              )
            )
          )}

          {/* 📦 5. OTHER SAVED ITEMS (If any) */}
          {activeTab === 'all' && others.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-darkBorder/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-gray-500/20 text-gray-300 border border-gray-500/40 flex items-center justify-center">
                    <Layers className="w-5 h-5 stroke-[2.5]" />
                  </span>
                  <h2 className="font-extrabold text-lg sm:text-xl text-white font-outfit">
                    Other Media
                  </h2>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-gray-500/20 text-gray-300 border border-gray-500/40 uppercase tracking-wider">
                    {others.length} Titles
                  </span>
                </div>
              </div>
              <MediaGrid items={others} />
            </section>
          )}

        </div>
      )}

    </div>
  );
}
