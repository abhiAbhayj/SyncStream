import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import MediaGrid from '../components/MediaGrid';
import { ArrowLeft, Loader2, Film, Tv, Sparkles, BookOpen, Flame, Activity, Calendar, CalendarDays, Zap, RefreshCw } from 'lucide-react';

const TIME_PERIODS = [
  { id: 'day', label: 'Today (Live)', icon: Zap },
  { id: 'week', label: 'This Week', icon: Flame },
  { id: 'month', label: 'This Month', icon: Calendar },
  { id: 'year', label: 'This Year', icon: Sparkles },
  { id: 'all', label: 'All-Time Top', icon: Activity }
];

export default function Catalog() {
  const { category, type } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentPeriod = searchParams.get('period') || 'day';
  const [period, setPeriod] = useState(currentPeriod);
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const MAX_PAGES = 30;

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'trending': return 'Trending Hits';
      case 'ongoing': return 'Ongoing & Airing';
      case 'schedule': return 'Release Schedules';
      case 'upcoming': return 'Upcoming Releases';
      case 'latest': return 'Latest Updates';
      default: return cat;
      case 'top_rated': return 'Top Rated Releases';
    }
  };

  const getTypeLabel = (t) => {
    switch (t) {
      case 'movies': case 'movie': return 'Movies';
      case 'tv': return 'TV Shows';
      case 'anime': return 'Anime';
      case 'manga': return 'Manga';
      case 'music': return 'Music';
      default: return t;
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'trending': return Flame;
      case 'ongoing': return Activity;
      case 'schedule': return Calendar;
      case 'upcoming': return CalendarDays;
      case 'latest': return Sparkles;
      default: return Film;
    }
  };

  const navType = useNavigationType();

  useEffect(() => {
    const urlPeriod = searchParams.get('period') || 'day';
    setPeriod(urlPeriod);
  }, [searchParams]);

  useEffect(() => {
    const cacheKey = `catalog-${category}-${type}-${period}`;
    
    // If user clicked 'Back' and we have cached data, restore it instantly
    if (navType === 'POP') {
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setItems(parsed.items);
          setPage(parsed.page);
          setLoading(false);
          return;
        } catch (e) {
          console.warn('Cache parse failed');
        }
      }
    }
    
    // Otherwise fetch fresh data
    setItems([]);
    setPage(1);
    fetchCatalogData(1, period, false);
  }, [category, type, period, navType]);

  const fetchCatalogData = async (pageNum, activePeriod = period, isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await axios.get(`/api/media/catalog/${category}/${type}`, {
        params: {
          page: pageNum,
          period: activePeriod,
          fresh: isManualRefresh ? 'true' : undefined
        }
      });
      
      const newResults = res.data.results || [];
      setItems(prev => {
        const merged = pageNum === 1 ? newResults : [...prev, ...newResults];
        const cacheKey = `catalog-${category}-${type}-${activePeriod}`;
        sessionStorage.setItem(cacheKey, JSON.stringify({ items: merged, page: pageNum }));
        return merged;
      });
      setLastUpdated(res.data.lastUpdated ? new Date(res.data.lastUpdated) : new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to load catalog:', err);
      setError('Failed to retrieve catalog details. Please check your network connection.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setSearchParams({ period: newPeriod });
  };

  const loadMore = () => {
    if (page < MAX_PAGES) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCatalogData(nextPage, period, false);
    }
  };

  const IconComponent = getCategoryIcon(category);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-6 min-h-[75vh]">
      
      {/* Header with Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-darkBorder pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-2xl border border-darkBorder bg-darkCard/40 text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
              <IconComponent className="w-3.5 h-3.5 text-accentCyan" />
              <span>{getCategoryLabel(category)}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-outfit">
              All {getTypeLabel(type)}
            </h1>
          </div>
        </div>
        
        {/* Live sync tag & refresh button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-[11px] text-gray-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white tracking-wider">LIVE</span>
            <span className="text-gray-500">•</span>
            <span className="text-accentCyan">
              {isRefreshing ? 'Syncing...' : (lastUpdated ? `${items.length} items` : 'Live')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => fetchCatalogData(1, period, true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 transition active:scale-95 disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accentCyan ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Live Time Period Filter Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {TIME_PERIODS.map((tp) => {
          const isSelected = period === tp.id;
          const Icon = tp.icon;
          return (
            <button
              key={tp.id}
              onClick={() => handlePeriodChange(tp.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-accentCyan/20 text-accentCyan border border-accentCyan/40 shadow-sm shadow-accentCyan/20'
                  : 'text-gray-400 hover:text-white bg-black/30 border border-white/5 hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid Content */}
      {loading && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-accentCyan" />
          <p className="text-gray-400 font-medium">Loading live catalog content...</p>
        </div>
      ) : (
        <div className="animate-fade-in space-y-8">
          <MediaGrid items={items} showTimings={category === 'ongoing' || category === 'schedule'} />
          
          {/* Load More Button */}
          {!loading && !error && items.length > 0 && page < MAX_PAGES && (
            <div className="flex justify-center pt-8 pb-12">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-bold transition-all duration-300 flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer shadow-lg"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-accentCyan" />
                    Loading...
                  </>
                ) : (
                  'Load More'
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
