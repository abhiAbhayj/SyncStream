import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useNavigationType } from 'react-router-dom';
import axios from 'axios';
import MediaGrid from '../components/MediaGrid';
import MediaCardSkeleton from '../components/MediaCardSkeleton';
import { Loader2, Film, Tv, Sparkles, BookOpen, Flame, Activity, Calendar, CalendarDays, RefreshCw } from 'lucide-react';

const CACHE_TTL = 10 * 60 * 1000; // 10 min — discard stale session cache

export default function Catalog() {
  const { category, type } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(null);
  const isFetchingRef = useRef(false);
  const horizonRef = useRef(null);
  const loadMoreRef = useRef(null);
  const MAX_PAGES = 30;

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'trending': return 'Trending Hits';
      case 'ongoing': return 'Ongoing & Airing';
      case 'schedule': return 'Release Schedules';
      case 'upcoming': return 'Upcoming Releases';
      case 'latest': return 'Latest Updates';
      default: return cat;
    }
  };

  const getTypeLabel = (t) => {
    switch (t) {
      case 'movie':
      case 'movies': return 'Movies';
      case 'tv': return 'TV Shows';
      case 'anime': return 'Anime';
      case 'manga': return 'Manga';
      default: return t;
    }
  };

  const getCategoryConfig = (cat) => {
    switch (cat) {
      case 'trending': return { icon: Flame, color: 'text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' };
      case 'ongoing': return { icon: Activity, color: 'text-emerald-400 fill-emerald-400/35 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' };
      case 'schedule': return { icon: Calendar, color: 'text-cyan-400 fill-cyan-400/35 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' };
      case 'upcoming': return { icon: CalendarDays, color: 'text-fuchsia-400 fill-fuchsia-400/35 drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]' };
      case 'latest': return { icon: Sparkles, color: 'text-pink-400 fill-pink-400/35 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]' };
      default: return { icon: Film, color: 'text-amber-400 fill-amber-400/35 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' };
    }
  };

  const navType = useNavigationType();

  const fetchCatalogData = useCallback(async (pageNum, force = false) => {
    if (isFetchingRef.current && pageNum === 1) return;
    const cacheKey = `catalog-${category}-${type}`;

    // On back-navigation, restore from cache only if it's still fresh
    if (!force && pageNum === 1 && navType === 'POP') {
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          const age = Date.now() - (parsed.fetchedAt || 0);
          const hasBlockedMangaDexPoster = (parsed.items || []).some(
            item => typeof item?.poster_path === 'string' && item.poster_path.includes('uploads.mangadex.org')
          );
          if (age < CACHE_TTL && !hasBlockedMangaDexPoster) {
            setItems(parsed.items);
            setPage(parsed.page);
            setLastUpdated(new Date(parsed.fetchedAt));
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Cache parse failed');
        }
      }
    }

    if (pageNum === 1) isFetchingRef.current = true;
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await axios.get(`/api/media/catalog/${category}/${type}?page=${pageNum}`);
      const now = Date.now();

      setItems(prev => {
        const newItems = pageNum === 1
          ? (res.data.results || [])
          : [...prev, ...(res.data.results || [])];

        // Cache with timestamp for TTL check
        sessionStorage.setItem(cacheKey, JSON.stringify({ items: newItems, page: pageNum, fetchedAt: now }));
        return newItems;
      });
      setLastUpdated(new Date(now));
      setError(null);
    } catch (err) {
      console.error('Failed to load catalog:', err);
      setError('Failed to retrieve catalog details. Please check your network connection.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      if (pageNum === 1) isFetchingRef.current = false;
    }
  }, [category, type, navType]);

  // Initial load / category change
  useEffect(() => {
    setItems([]);
    setPage(1);
    setError(null);
    fetchCatalogData(1);
  }, [category, type]);

  // Auto-refresh on tab visibility (if data is stale)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        const cacheKey = `catalog-${category}-${type}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Date.now() - (parsed.fetchedAt || 0) > CACHE_TTL) {
              fetchCatalogData(1, true);
            }
          } catch {
            fetchCatalogData(1, true);
          }
        }
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [category, type, fetchCatalogData]);

  // Periodic auto-refresh every 10 minutes while page is open
  useEffect(() => {
    const timer = setInterval(() => fetchCatalogData(1, true), CACHE_TTL);
    return () => clearInterval(timer);
  }, [fetchCatalogData]);

  const loadMore = () => {
    if (!loading && !loadingMore && page < MAX_PAGES) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCatalogData(nextPage);
    }
  };
  loadMoreRef.current = loadMore;

  // Auto-load next page when Infinite Scroll Horizon Beam enters viewport
  useEffect(() => {
    const el = horizonRef.current;
    if (!el || loading || error || items.length === 0 || page >= MAX_PAGES) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreRef.current?.();
        }
      },
      { rootMargin: '160px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, error, items.length, page]);

  const categoryConfig = getCategoryConfig(category);
  const IconComponent = categoryConfig.icon;

  return (
    <div className="max-w-7xl mx-auto py-5 sm:py-8 px-3.5 sm:px-6 md:px-8 space-y-6 sm:space-y-8 min-h-[75vh]">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-darkBorder pb-5 sm:pb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="space-y-0.5 sm:space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <IconComponent className={`w-3.5 h-3.5 shrink-0 ${categoryConfig.color}`} />
              <span className="truncate">{getCategoryLabel(category)}</span>
              {/* Live indicator */}
              <span className="flex items-center gap-1 text-emerald-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Live
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-outfit truncate">
              All {getTypeLabel(type)}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
          {lastUpdated && (
            <span className="hidden sm:block text-[10px] text-gray-600">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchCatalogData(1, true)}
            disabled={loading}
            title="Refresh now"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-500 hover:text-accentCyan border border-white/[0.06] transition active:scale-90 disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span
            key={items.length}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-accentCyan/35 text-xs font-bold text-gray-200 tabular-nums animate-badge-pulse"
          >
            <span className="animate-digit-roll text-accentCyan font-extrabold">{items.length}</span>
            <span>entries</span>
          </span>
        </div>
      </div>

      {/* Grid Content */}
      {loading && items.length === 0 ? (
        <div className="py-4 animate-fade-in">
          <MediaCardSkeleton count={12} />
        </div>
      ) : (
        <div className="animate-fade-in space-y-8">
          <MediaGrid items={items} showTimings={category === 'ongoing'} />
          
          {/* Infinite Scroll Horizon Beam (#4) */}
          {!loading && !error && items.length > 0 && page < MAX_PAGES && (
            <div ref={horizonRef} className="flex flex-col items-center justify-center pt-6 pb-12 space-y-4">
              <div className="relative w-full max-w-md h-[3px] rounded-full bg-white/10 overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-accentCyan to-accentPurple shadow-[0_0_16px_rgba(var(--accent-cyan),0.8)] animate-horizon-beam" />
              </div>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-shimmer px-7 py-2.5 bg-white/[0.06] border border-accentCyan/35 hover:border-accentCyan hover:bg-accentCyan/15 text-white rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer shadow-[0_0_18px_rgba(var(--accent-cyan),0.2)]"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-accentCyan" />
                    <span>Scanning Next Horizon...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-accentCyan" />
                    <span>Load More Entries</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center space-y-4 max-w-md mx-auto">
          <p className="text-red-400 font-semibold">{error}</p>
          <Link 
            to="/" 
            className="inline-block px-4 py-2 bg-darkCard border border-darkBorder hover:border-red-500/30 rounded-xl text-xs font-semibold text-gray-200 transition"
          >
            Go Back Home
          </Link>
        </div>
      )}
    </div>
  );
}
