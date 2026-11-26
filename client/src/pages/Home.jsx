import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MediaGrid from '../components/MediaGrid';
import MediaCardSkeleton from '../components/MediaCardSkeleton';
import ContinueWatchingSection from '../components/ContinueWatchingSection';
import QualityBadge from '../components/QualityBadge';
import { formatMediaPoster, handlePosterError } from '../utils/posterFallback';
import { fetchClientLiveAnimeDashboard, fetchClientLiveMangaDashboard } from '../utils/liveAnime';
import { Tv, Sparkles, Search, MessageSquareCode, Users, Flame, Activity, Calendar, CalendarDays, BookOpen, Clock, Music, ArrowRight, Radio, RefreshCw, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  // Instant Stale-While-Revalidate: Load cached catalog immediately (0ms latency), update in background
  const [media, setMedia] = useState(() => {
    try {
      const cached = localStorage.getItem('syncstream_cached_home_catalog_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object' && parsed.trending) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(() => !media);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return sessionStorage.getItem('homeActiveTab') || 'trending';
    } catch {
      return 'trending';
    }
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem('homeActiveTab', tabId);
  };

  // Sliding Magnetic Tab Pill measurement
  const tabButtonRefs = useRef({});
  const [tabPillStyle, setTabPillStyle] = useState({ left: 0, width: 0, ready: false });

  // Clean Pull-to-Refresh
  const [pullDistance, setPullDistance] = useState(0);
  const pullStartYRef = useRef(null);

  const handleTouchStartPull = (e) => {
    if (window.scrollY <= 4 && e.touches?.length === 1) {
      pullStartYRef.current = e.touches[0].clientY;
    } else {
      pullStartYRef.current = null;
    }
  };

  const handleTouchMovePull = (e) => {
    if (pullStartYRef.current === null || loading) return;
    if (window.scrollY > 4) {
      pullStartYRef.current = null;
      setPullDistance(0);
      return;
    }
    const delta = e.touches[0].clientY - pullStartYRef.current;
    if (delta > 6) {
      setPullDistance(Math.min(84, Math.round(delta * 0.48)));
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEndPull = () => {
    if (pullDistance >= 54 && !loading) {
      fetchCatalog(true);
    }
    pullStartYRef.current = null;
    setPullDistance(0);
  };

  useEffect(() => {
    const updatePill = () => {
      const el = tabButtonRefs.current[activeTab];
      if (el) {
        setTabPillStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
          ready: true
        });
      }
    };
    updatePill();
    const raf = requestAnimationFrame(updatePill);
    window.addEventListener('resize', updatePill);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updatePill);
    };
  }, [activeTab]);

  const daysOfWeek = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  const [selectedDay, setSelectedDay] = useState(() => {
    const currentDayIndex = new Date().getDay();
    return daysOfWeek[currentDayIndex];
  });
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Live clock tick every 30s so Release Schedule clock & episode countdowns stay live
  useEffect(() => {
    if (activeTab !== 'schedule') return;
    setNowTick(Date.now());
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, [activeTab]);

  // Compute real calendar dates for the current week (Mon..Sun)
  const getWeekDayDates = (baseMs) => {
    const now = new Date(baseMs);
    const jsDay = now.getDay(); // 0=Sun..6=Sat
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() + mondayOffset);
    const order = [
      { key: 'Mondays', label: 'Mon', short: 'Monday' },
      { key: 'Tuesdays', label: 'Tue', short: 'Tuesday' },
      { key: 'Wednesdays', label: 'Wed', short: 'Wednesday' },
      { key: 'Thursdays', label: 'Thu', short: 'Thursday' },
      { key: 'Fridays', label: 'Fri', short: 'Friday' },
      { key: 'Saturdays', label: 'Sat', short: 'Saturday' },
      { key: 'Sundays', label: 'Sun', short: 'Sunday' }
    ];
    return order.map((d, idx) => {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + idx);
      return {
        ...d,
        dateNum: dt.getDate(),
        monthShort: dt.toLocaleDateString([], { month: 'short' }),
        isToday: dt.toDateString() === now.toDateString()
      };
    });
  };

  const formatCountdownPill = (airingAtSec, baseMs) => {
    if (!airingAtSec) return null;
    const diffSec = Math.floor(airingAtSec - baseMs / 1000);
    if (diffSec <= 0) {
      const agoMin = Math.max(1, Math.floor(Math.abs(diffSec) / 60));
      if (agoMin < 60) return { label: `Aired ${agoMin}m ago`, tone: 'aired' };
      const agoHr = Math.floor(agoMin / 60);
      if (agoHr < 24) return { label: `Aired ${agoHr}h ago`, tone: 'aired' };
      return { label: 'Recently Aired', tone: 'aired' };
    }
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return { label: `In ${mins}m`, tone: 'soon' };
    const hrs = Math.floor(mins / 60);
    const remMin = mins % 60;
    if (hrs < 24) return { label: remMin > 0 ? `In ${hrs}h ${remMin}m` : `In ${hrs}h`, tone: hrs <= 3 ? 'soon' : 'today' };
    const days = Math.floor(hrs / 24);
    const remHr = hrs % 24;
    return { label: remHr > 0 ? `In ${days}d ${remHr}h` : `In ${days}d`, tone: 'upcoming' };
  };

  const getSchedulesByDay = (animeList) => {
    const grouped = {
      Mondays: [],
      Tuesdays: [],
      Wednesdays: [],
      Thursdays: [],
      Fridays: [],
      Saturdays: [],
      Sundays: []
    };

    if (animeList) {
      animeList.forEach(item => {
        let matchedDay = null;

        if (item.airing_at) {
          const d = new Date(item.airing_at * 1000);
          if (!isNaN(d.getTime())) matchedDay = daysOfWeek[d.getDay()];
        }

        if (!matchedDay && item.broadcast_day && grouped[item.broadcast_day]) {
          matchedDay = item.broadcast_day;
        } else if (!matchedDay && item.broadcast) {
          const broadcastStr = String(typeof item.broadcast === 'string' ? item.broadcast : (item.broadcast?.string || item.broadcast?.day || '')).toLowerCase();
          const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          for (const day of dayNames) {
            if (broadcastStr.includes(day.toLowerCase())) {
              matchedDay = day + 's';
              break;
            }
          }
        }

        // Only use deterministic fallback if no real airing day exists
        if (!matchedDay || !grouped[matchedDay]) {
          const numericId = parseInt(String(item.id || '').replace(/\D/g, ''), 10) || 0;
          const dayIndex = numericId % 7;
          matchedDay = daysOfWeek[dayIndex];
        }

        grouped[matchedDay].push({
          ...item,
          broadcast: String(typeof item.broadcast === 'string' ? item.broadcast : (item.broadcast?.string || item.broadcast?.day || `Airs every ${matchedDay.slice(0, -1)}`))
        });
      });

      // Sort each day: exact-timestamp live anime first, ordered chronologically by local air time
      Object.keys(grouped).forEach((dayKey) => {
        grouped[dayKey].sort((a, b) => {
          const aExact = a.airing_at ? 1 : 0;
          const bExact = b.airing_at ? 1 : 0;
          if (aExact !== bExact) return bExact - aExact;
          if (a.airing_at && b.airing_at) {
            const da = new Date(a.airing_at * 1000);
            const db = new Date(b.airing_at * 1000);
            return (da.getHours() * 60 + da.getMinutes()) - (db.getHours() * 60 + db.getMinutes());
          }
          return (b.vote_average || 0) - (a.vote_average || 0);
        });
      });
    }
    return grouped;
  };

  const getCombinedAnimeSchedules = () => {
    if (!media) return [];
    const combined = [];
    const seen = new Set();
    
    const addItems = (list) => {
      if (!list) return;
      list.forEach(item => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      });
    };
    
    // Prioritize live currently-airing anime with real next-episode timestamps + just-aired today
    addItems(media.schedule?.anime);
    addItems(media.ongoing?.anime);
    addItems(media.latest?.anime);
    if (combined.length === 0) {
      addItems(media.trending?.anime);
    }
    
    return combined;
  };

  const getCombinedTvSchedules = () => {
    if (!media) return [];
    const combined = [];
    const seen = new Set();
    
    const addItems = (list) => {
      if (!list) return;
      list.forEach(item => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      });
    };
    
    // Only live airing & ongoing scripted TV series (never dump finished/upcoming clutter!)
    addItems(media.schedule?.tv);
    addItems(media.ongoing?.tv);
    if (combined.length < 7) {
      addItems(media.trending?.tv);
    }
    
    return combined;
  };

  const getTvSchedulesByDay = (tvList) => {
    const grouped = {
      Mondays: [],
      Tuesdays: [],
      Wednesdays: [],
      Thursdays: [],
      Fridays: [],
      Saturdays: [],
      Sundays: []
    };

    if (tvList) {
      tvList.forEach(item => {
        let matchedDay = null;
        if (item.broadcast_day && grouped[item.broadcast_day]) {
          matchedDay = item.broadcast_day;
        } else if (item.broadcast) {
          const broadcastStr = String(typeof item.broadcast === 'string' ? item.broadcast : (item.broadcast?.string || item.broadcast?.day || '')).toLowerCase();
          const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          for (const day of dayNames) {
            if (broadcastStr.includes(day.toLowerCase())) {
              matchedDay = day + 's';
              break;
            }
          }
        }

        if (!matchedDay || !grouped[matchedDay]) {
          const dayIndex = (parseInt(item.id, 10) || 0) % 7;
          matchedDay = daysOfWeek[dayIndex];
        }

        grouped[matchedDay].push({
          ...item,
          broadcast: String(typeof item.broadcast === 'string' ? item.broadcast : (item.broadcast?.string || item.broadcast?.day || `Airs every ${matchedDay.slice(0, -1)}`))
        });
      });

      Object.keys(grouped).forEach((dayKey) => {
        grouped[dayKey].sort((a, b) => {
          const aExact = a.has_exact_schedule ? 1 : 0;
          const bExact = b.has_exact_schedule ? 1 : 0;
          if (aExact !== bExact) return bExact - aExact;
          return (b.vote_average || 0) - (a.vote_average || 0);
        });
      });
    }
    return grouped;
  };

  const [lastUpdated, setLastUpdated] = useState(null);
  const lastFetchRef = React.useRef(0);
  const isFetchingRef = React.useRef(false);
  const STALE_AFTER = 5 * 60 * 1000; // 5 min — matches live backend cache TTL

  // Stable fetch function via ref — never goes stale, no dep issues
  const doFetch = async (force = false) => {
    if (isFetchingRef.current) return; // prevent concurrent fetches
    const now = Date.now();
    if (!force && now - lastFetchRef.current < STALE_AFTER) return;
    isFetchingRef.current = true;
    try {
      if (!media || force) {
        setLoading(true);
      }
      const url = force ? '/api/media/trending?refresh=1' : '/api/media/trending';
      // Fetch backend dashboard AND direct browser live AniList anime + manga in parallel
      // (Bypasses Render shared-IP AniList 429 rate-limits so anime & manga feeds are 100% live & distinct!)
      const [res, liveAnime, liveManga] = await Promise.all([
        axios.get(url),
        fetchClientLiveAnimeDashboard(force).catch(() => null),
        fetchClientLiveMangaDashboard(force).catch(() => null)
      ]);
      const merged = { ...(res.data || {}) };
      if (liveAnime && (liveAnime.trending?.length > 0 || liveAnime.ongoing?.length > 0)) {
        merged.trending = { ...(merged.trending || {}), anime: liveAnime.trending };
        merged.ongoing = { ...(merged.ongoing || {}), anime: liveAnime.ongoing };
        merged.latest = { ...(merged.latest || {}), anime: liveAnime.latest };
        merged.schedule = { ...(merged.schedule || {}), anime: liveAnime.schedule };
        merged.upcoming = { ...(merged.upcoming || {}), anime: liveAnime.upcoming };
      }
      if (liveManga && (liveManga.trending?.length > 0 || liveManga.ongoing?.length > 0)) {
        merged.trending = { ...(merged.trending || {}), manga: liveManga.trending };
        merged.ongoing = { ...(merged.ongoing || {}), manga: liveManga.ongoing };
        merged.latest = { ...(merged.latest || {}), manga: liveManga.latest };
        merged.schedule = { ...(merged.schedule || {}), manga: liveManga.schedule };
        merged.upcoming = { ...(merged.upcoming || {}), manga: liveManga.upcoming };
      }
      setMedia(merged);
      try {
        localStorage.setItem('syncstream_cached_home_catalog_v2', JSON.stringify(merged));
      } catch {}
      setLastUpdated(merged._fetchedAt ? new Date(merged._fetchedAt) : new Date());
      lastFetchRef.current = Date.now();
    } catch (err) {
      console.error('Failed to load home catalog:', err);
      if (!media) {
        setError('Could not connect to external media APIs. Retrying shortly...');
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Keep a ref to doFetch so effects always call the latest version
  const fetchRef = React.useRef(doFetch);
  fetchRef.current = doFetch;
  const fetchCatalog = React.useCallback((force = false) => fetchRef.current(force), []);

  // Initial fetch on mount
  useEffect(() => { fetchCatalog(); }, []);

  // Re-fetch when user returns to the tab (if data is stale)
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') fetchCatalog(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // Periodic refresh every 10 minutes
  useEffect(() => {
    const timer = setInterval(() => fetchCatalog(true), STALE_AFTER);
    return () => clearInterval(timer);
  }, []);

  const tabs = [
    { id: 'trending', label: 'Trending Hits', icon: Flame, color: 'text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' },
    { id: 'ongoing', label: 'Ongoing & Airing', icon: Activity, color: 'text-emerald-400 fill-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' },
    { id: 'schedule', label: 'Release Schedules', icon: Calendar, color: 'text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' },
    { id: 'upcoming', label: 'Upcoming Releases', icon: CalendarDays, color: 'text-fuchsia-400 fill-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]' }
  ];

  return (
    <div
      onTouchStart={handleTouchStartPull}
      onTouchMove={handleTouchMovePull}
      onTouchEnd={handleTouchEndPull}
      className="space-y-8 sm:space-y-14 py-4 sm:py-8 px-3.5 sm:px-6 md:px-8 max-w-7xl mx-auto"
    >
      {/* Clean Pull-to-Refresh Indicator */}
      {(pullDistance > 6 || (loading && media !== null)) && (
        <div
          aria-live="polite"
          style={{
            transform: `translateY(${loading ? 4 : Math.max(0, pullDistance - 24)}px) scale(${loading ? 1 : Math.min(1.04, 0.8 + pullDistance / 140)})`
          }}
          className="flex justify-center pointer-events-none transition-transform duration-150 -mb-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1326] border border-white/15 shadow-lg backdrop-blur-md">
            <RefreshCw
              className={`w-3.5 h-3.5 text-accentCyan ${loading ? 'animate-spin' : ''}`}
              style={!loading ? { transform: `rotate(${pullDistance * 4}deg)` } : undefined}
            />
            <span className="text-xs font-semibold text-white">
              {loading
                ? 'Updating...'
                : pullDistance >= 54
                  ? 'Release to Refresh'
                  : 'Pull to Sync'}
            </span>
          </div>
        </div>
      )}

      {/* ── Hero Banner (High-Performance Cinematic Hero) ── */}
      <section
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 text-center bg-gradient-to-b from-[#12182c] via-[#0b0e1b] to-[#070913] shadow-2xl"
      >
        {/* Subtle vignette lighting */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(56,189,248,0.12),transparent_70%)]"
        />

        {/* Noise grain overlay */}
        <div className="noise-overlay rounded-2xl sm:rounded-3xl pointer-events-none opacity-[0.015]" />

        {/* Content */}
        <div className="relative z-10 py-8 px-4 sm:py-16 sm:px-8 md:py-20 md:px-16 space-y-4 sm:space-y-6">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.05] border border-white/[0.1] rounded-full text-[11px] font-semibold text-gray-300 backdrop-blur-md tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-accentCyan" />
            <span>THE ULTIMATE STREAMING HUB</span>
          </div>

          <h1 className="text-[28px] xs:text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-josefin font-bold tracking-wide xs:tracking-wider leading-tight sm:leading-none uppercase">
            Discover, Stream &amp;
            <br />
            <span className="text-gradient">Watch Together</span>
          </h1>

          <p className="text-gray-400 max-w-xl mx-auto text-xs sm:text-base md:text-lg leading-relaxed font-dm">
            Movies, TV shows, anime &amp; manga — synced across devices in real-time. Host Watch Parties with live chat.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-1">
            <Link
              to="/search"
              className="btn-primary flex items-center gap-2 !text-white text-xs sm:text-sm !px-5 sm:!px-6 !py-2.5 sm:!py-3 active:scale-95 shadow-lg"
            >
              <Search className="w-4 h-4" />
              <span>Explore Catalog</span>
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-join-party'))}
              className="btn-ghost flex items-center gap-2 text-xs sm:text-sm !px-5 sm:!px-6 !py-2.5 sm:!py-3 active:scale-95 cursor-pointer border-accentPurple/40 text-gray-200 hover:text-white hover:border-accentPurple/70"
            >
              <Users className="w-4 h-4 text-accentPurple" />
              <span>Join a Party</span>
            </button>
          </div>

          {/* Feature highlights */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 max-w-3xl mx-auto border-t border-white/[0.06] mt-2">
            {[
              { icon: Tv, color: 'text-sky-400 fill-sky-400', bg: 'bg-sky-500/10 border-sky-400/30', title: 'Aggregated Catalog', desc: 'TMDB, Anime, MangaDex feeds in one dashboard.' },
              { icon: Sparkles, color: 'text-purple-400 fill-purple-400', bg: 'bg-purple-500/10 border-purple-400/30', title: 'Host Sync Players', desc: 'Control playback across all participants live.' },
              { icon: MessageSquareCode, color: 'text-pink-400 fill-pink-400', bg: 'bg-pink-500/10 border-pink-400/30', title: 'Lobby Chat', desc: 'Chat alongside streams with persistent history.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="flex flex-col items-center p-3 text-center space-y-1">
                <div className={`p-2.5 rounded-xl border ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <h3 className="font-semibold text-xs text-white">{title}</h3>
                <p className="text-[11px] text-gray-500 max-w-[180px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Continue Watching & Reading Rail ── */}
      <ContinueWatchingSection />

      {/* ── Discovery Feed Live Header Row ── */}
      <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-white/10 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-josefin">
            Discovery Feed
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[10px] xs:text-xs font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Live Catalog</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto sm:ml-0">
          {lastUpdated && (
            <span className="text-[11px] font-black text-slate-300 hidden sm:inline-block px-2.5 py-1.5 rounded-xl bg-darkCard/80 border border-white/15">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          <button
            onClick={() => fetchCatalog(true)}
            disabled={loading}
            title="Live Refresh"
            aria-label="Live Refresh"
            className="p-2 sm:p-2.5 rounded-xl border-2 border-accentCyan bg-[#0f1428] text-accentCyan hover:bg-accentCyan hover:text-black shadow-[0_0_15px_rgba(var(--accent-cyan),0.5)] transition active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Category Tabs (Sliding Magnetic Pill) ── */}
      <div className="w-full overflow-x-auto pb-1.5 scrollbar-none">
        <div className="relative inline-flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-darkCard/70 border border-white/10 backdrop-blur-xl shadow-lg">
          {/* Gliding Active Neon Pill */}
          {tabPillStyle.ready && (
            <div
              aria-hidden="true"
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-accentCyan/25 via-accentPurple/20 to-accentCyan/25 border-2 border-accentCyan shadow-[0_0_18px_rgba(var(--accent-cyan),0.45)] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                left: `${tabPillStyle.left}px`,
                width: `${tabPillStyle.width}px`
              }}
            />
          )}

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => { tabButtonRefs.current[tab.id] = el; }}
                onClick={() => handleTabChange(tab.id)}
                className={`group relative z-10 flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-colors duration-300 shrink-0 active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className={`relative w-4 h-4 transition-all duration-300 ${isSelected ? `${tab.color} scale-110` : `${tab.color} opacity-75 group-hover:opacity-100 group-hover:scale-110`}`} />
                <span className="relative font-black">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Grid Content */}
      {loading ? (
        <div className="py-4 animate-fade-in">
          <MediaCardSkeleton count={10} titlePlaceholder={true} rows={2} />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center space-y-4 max-w-md mx-auto">
          <p className="text-red-400 font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-darkCard border border-darkBorder hover:border-red-500/30 rounded-xl text-xs font-semibold text-gray-200 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : media ? (
        <div className="space-y-9 sm:space-y-12 transition-opacity duration-300">
          {activeTab === 'trending' && (
            <div className="space-y-10 sm:space-y-16 animate-fade-in">
              <MediaGrid items={media.trending?.movies?.slice(0, 10)} title="Trending Blockbuster Movies" seeMoreLink="/catalog/trending/movie" />
              <MediaGrid items={media.trending?.tv?.slice(0, 10)} title="Trending TV Shows" seeMoreLink="/catalog/trending/tv" />

              {/* ── Music Streaming Showcase Card ── */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-accentCyan/30 bg-gradient-to-r from-darkCard via-darkBg to-accentCyan/10 p-5 sm:p-8 shadow-[0_0_40px_rgba(99,210,255,0.15)] flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 group">
                <div className="space-y-2 text-center md:text-left max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accentCyan/10 border border-accentCyan/20 text-accentCyan text-[11px] sm:text-xs font-bold uppercase tracking-wider font-mono">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>New Feature: 320kbps Music Portal</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-extrabold text-white font-outfit tracking-tight">
                    Stream Songs Across All Languages
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Full-duration audio in Hindi, English, K-Pop, Tamil, Telugu, Malayalam, Kannada, & Punjabi with zero interruption.
                  </p>
                </div>
                <Link
                  to="/music"
                  className="btn-shimmer flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-accentCyan to-accentPurple text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(99,210,255,0.4)] hover:shadow-[0_0_30px_rgba(99,210,255,0.7)] transition active:scale-95 shrink-0"
                >
                  <Music className="w-4 h-4" />
                  <span>Open Music Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {media.trending?.music && media.trending.music.length > 0 && (
                <MediaGrid items={media.trending.music} title="Trending Music Hits" seeMoreLink="/music" />
              )}

              <MediaGrid items={media.trending?.anime?.slice(0, 10)} title="Top Trending Live Anime" seeMoreLink="/catalog/trending/anime" showTimings={true} />
              <MediaGrid items={media.trending?.manga?.slice(0, 10)} title="Top Trending Live Manga" seeMoreLink="/catalog/trending/manga" showTimings={true} />
            </div>
          )}

          {activeTab === 'ongoing' && (
            <div className="space-y-10 sm:space-y-16 animate-fade-in">
              <MediaGrid items={media.ongoing?.movies?.slice(0, 10)} title="Now Playing in Theaters" seeMoreLink="/catalog/ongoing/movie" />
              <MediaGrid items={media.ongoing?.tv?.slice(0, 10)} title="Ongoing TV Broadcasts" seeMoreLink="/catalog/ongoing/tv" showTimings={true} />
              <MediaGrid items={media.ongoing?.anime?.slice(0, 10)} title="Live Ongoing & Airing Anime" seeMoreLink="/catalog/ongoing/anime" showTimings={true} />
              <MediaGrid items={media.ongoing?.manga?.slice(0, 10)} title="Popular Ongoing Manga" seeMoreLink="/catalog/ongoing/manga" showTimings={true} />
            </div>
          )}

          {activeTab === 'schedule' && (() => {
            const weekDays = getWeekDayDates(nowTick);
            const tvByDay = getTvSchedulesByDay(getCombinedTvSchedules());
            const animeByDay = getSchedulesByDay(getCombinedAnimeSchedules());
            const selectedTvList = tvByDay[selectedDay] || [];
            const selectedAnimeList = animeByDay[selectedDay] || [];
            const liveMangaList = (media.schedule?.manga || media.latest?.manga || []).slice(0, 12);
            const selectedDayInfo = weekDays.find((d) => d.key === selectedDay);
            const nowDateObj = new Date(nowTick);
            const liveClockStr = nowDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const liveDateStr = nowDateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div className="space-y-6 sm:space-y-8 animate-fade-in">
                {/* ── Live Broadcast Timetable Header Panel ── */}
                <div className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d142a]/90 via-[#0a0f22]/95 to-[#13102b]/90 p-4 sm:p-6 shadow-2xl overflow-hidden">
                  <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-accentCyan/10 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-accentPurple/10 blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/70 text-emerald-300 text-[10px] font-mono font-black uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Live Broadcast
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-gray-200 text-[11px] font-mono font-bold">
                          <Clock className="w-3 h-3 text-accentCyan" />
                          <span>{liveDateStr} • {liveClockStr}</span>
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-outfit">
                        Weekly Release Schedules
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Real-time airing schedule synced to your local time across Anime, TV Series, and Manga.
                      </p>
                    </div>

                    {/* Section Filter Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { id: 'all', label: 'All Live', count: selectedAnimeList.length + selectedTvList.length + liveMangaList.length, activeCls: 'bg-accentCyan text-black border-accentCyan shadow-[0_0_14px_rgba(var(--accent-cyan),0.45)]' },
                        { id: 'anime', label: 'Anime', count: selectedAnimeList.length, activeCls: 'bg-purple-500 text-white border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.45)]' },
                        { id: 'tv', label: 'TV Series', count: selectedTvList.length, activeCls: 'bg-sky-400 text-black border-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.45)]' },
                        { id: 'manga', label: 'Manga', count: liveMangaList.length, activeCls: 'bg-pink-500 text-white border-pink-400 shadow-[0_0_14px_rgba(236,72,153,0.45)]' }
                      ].map((f) => {
                        const active = scheduleFilter === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setScheduleFilter(f.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition active:scale-95 cursor-pointer ${
                              active
                                ? f.activeCls
                                : 'bg-white/[0.04] border-white/15 text-gray-300 hover:text-white hover:border-white/35'
                            }`}
                          >
                            <span>{f.label}</span>
                            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${active ? 'bg-black/25' : 'bg-white/10 text-gray-300'}`}>
                              {f.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive 7-Day Calendar Strip */}
                  <div className="relative z-10 grid grid-cols-7 gap-1.5 sm:gap-2.5 mt-5 pt-4 border-t border-white/10">
                    {weekDays.map((day) => {
                      const isSelected = selectedDay === day.key;
                      const dayTotal = (animeByDay[day.key]?.length || 0) + (tvByDay[day.key]?.length || 0);
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => setSelectedDay(day.key)}
                          className={`group relative flex flex-col items-center justify-center py-2.5 sm:py-3.5 px-1 rounded-xl sm:rounded-2xl border transition-all duration-200 cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-gradient-to-br from-accentCyan via-sky-400 to-accentPurple text-black border-accentCyan shadow-[0_0_22px_rgba(var(--accent-cyan),0.4)] -translate-y-0.5'
                              : day.isToday
                              ? 'bg-accentCyan/10 border-accentCyan/45 text-white hover:bg-accentCyan/20'
                              : 'bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:bg-white/[0.08] hover:border-white/25'
                          }`}
                        >
                          {day.isToday && (
                            <span className={`text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-wider px-1.5 rounded-full mb-0.5 ${
                              isSelected ? 'bg-black/25 text-black' : 'bg-accentCyan/25 text-accentCyan'
                            }`}>
                              Today
                            </span>
                          )}
                          <span className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${isSelected ? 'text-black' : 'text-gray-400 group-hover:text-white'}`}>
                            {day.label}
                          </span>
                          <span className={`text-sm sm:text-lg font-black leading-tight tabular-nums ${isSelected ? 'text-black' : 'text-white'}`}>
                            {day.dateNum}
                          </span>
                          <span className={`mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-black/20 text-black'
                              : 'bg-white/[0.06] text-gray-400'
                          }`}>
                            {dayTotal} live
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Live Airing Lists for Selected Day ── */}
                <div className="space-y-8 sm:space-y-10">
                  {/* 1. Live Anime Schedule */}
                  {(scheduleFilter === 'all' || scheduleFilter === 'anime') && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-400/35 text-purple-300 shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-extrabold text-white font-outfit truncate">
                              Anime Airing on {selectedDayInfo?.short || selectedDay}
                              {selectedDayInfo ? ` • ${selectedDayInfo.monthShort} ${selectedDayInfo.dateNum}` : ''}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              Live AniList broadcast schedule in your local timezone
                            </p>
                          </div>
                        </div>
                        <Link
                          to="/catalog/ongoing/anime"
                          className="text-xs font-bold text-purple-300 hover:text-accentCyan inline-flex items-center gap-1 shrink-0 transition"
                        >
                          <span>All Ongoing</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {selectedAnimeList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {selectedAnimeList.slice(0, 12).map((anime) => {
                            const countdown = formatCountdownPill(anime.airing_at, nowTick);
                            const score = Number(anime.vote_average || 0);
                            return (
                              <Link
                                key={`schedule-anime-${anime.id}`}
                                to={`/media/anime/${anime.id}`}
                                className="group relative flex items-stretch gap-3.5 p-3 rounded-2xl bg-[#0b1124]/85 border border-white/[0.08] hover:border-purple-400/60 hover:bg-[#101834]/95 hover:shadow-[0_12px_32px_rgba(168,85,247,0.18)] hover:-translate-y-0.5 transition-all duration-200 min-w-0 overflow-hidden"
                              >
                                <div className="relative w-16 h-24 sm:w-[74px] sm:h-[108px] rounded-xl overflow-hidden border border-white/10 shrink-0 bg-darkBg">
                                  <img
                                    src={formatMediaPoster({ ...anime, media_type: 'anime' })}
                                    alt={anime.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => handlePosterError(e, { ...anime, media_type: 'anime' })}
                                  />
                                  {score > 0 && (
                                    <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-black text-amber-400">
                                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                      {score.toFixed(1)}
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/35 text-purple-200 text-[10px] font-mono font-bold uppercase">
                                        {anime.format || 'TV'}
                                      </span>
                                      <QualityBadge item={{ ...anime, media_type: 'anime' }} size="xs" />
                                      {anime.next_episode && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-accentCyan/15 border border-accentCyan/35 text-accentCyan text-[10px] font-mono font-extrabold">
                                          EP {anime.next_episode}
                                        </span>
                                      )}
                                      {anime.broadcast_time && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-gray-300 ml-auto">
                                          <Clock className="w-3 h-3 text-accentCyan" />
                                          {anime.broadcast_time}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-extrabold text-sm sm:text-[15px] text-white group-hover:text-accentCyan transition line-clamp-1">
                                      {anime.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                      {anime.overview || 'Currently airing this season.'}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between gap-2 pt-2">
                                    {countdown ? (
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wide border ${
                                        countdown.tone === 'soon'
                                          ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                                          : countdown.tone === 'aired'
                                          ? 'bg-amber-500/15 border-amber-400/45 text-amber-300'
                                          : 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          countdown.tone === 'soon' ? 'bg-emerald-400 animate-ping' : countdown.tone === 'aired' ? 'bg-amber-400' : 'bg-cyan-400'
                                        }`} />
                                        {countdown.label}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-300 truncate">
                                        <Clock className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{anime.broadcast}</span>
                                      </span>
                                    )}
                                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-accentCyan group-hover:translate-x-0.5 transition shrink-0" />
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-darkCard/50 border border-white/10 p-8 text-center text-gray-400">
                          <p className="text-sm font-medium">No anime broadcasts scheduled for {selectedDay}.</p>
                        </div>
                      )}
                    </section>
                  )}

                  {/* 2. Live TV Series Schedule */}
                  {(scheduleFilter === 'all' || scheduleFilter === 'tv') && (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-400/35 text-sky-300 shrink-0">
                            <Tv className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-extrabold text-white font-outfit truncate">
                              TV Series Airing on {selectedDayInfo?.short || selectedDay}
                              {selectedDayInfo ? ` • ${selectedDayInfo.monthShort} ${selectedDayInfo.dateNum}` : ''}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              Live scripted TV episodes &amp; network airings
                            </p>
                          </div>
                        </div>
                        <Link
                          to="/catalog/ongoing/tv"
                          className="text-xs font-bold text-sky-300 hover:text-accentCyan inline-flex items-center gap-1 shrink-0 transition"
                        >
                          <span>All Ongoing</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {selectedTvList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {selectedTvList.slice(0, 10).map((show) => {
                            const score = Number(show.vote_average || 0);
                            return (
                              <Link
                                key={`schedule-tv-${show.id}`}
                                to={`/media/tv/${show.id}`}
                                className="group relative flex items-stretch gap-3.5 p-3 rounded-2xl bg-[#0b1124]/85 border border-white/[0.08] hover:border-sky-400/60 hover:bg-[#101834]/95 hover:shadow-[0_12px_32px_rgba(56,189,248,0.16)] hover:-translate-y-0.5 transition-all duration-200 min-w-0 overflow-hidden"
                              >
                                <div className="relative w-16 h-24 sm:w-[74px] sm:h-[108px] rounded-xl overflow-hidden border border-white/10 shrink-0 bg-darkBg">
                                  <img
                                    src={formatMediaPoster({ ...show, media_type: 'tv' })}
                                    alt={show.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => handlePosterError(e, { ...show, media_type: 'tv' })}
                                  />
                                  {score > 0 && (
                                    <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-black text-amber-400">
                                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                      {score.toFixed(1)}
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {show.network ? (
                                        <span className="px-1.5 py-0.5 rounded-md bg-sky-500/20 border border-sky-400/35 text-sky-200 text-[10px] font-mono font-bold uppercase truncate max-w-[130px]">
                                          {show.network}
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 rounded-md bg-sky-500/15 border border-sky-400/30 text-sky-300 text-[10px] font-mono font-bold uppercase">
                                          TV Series
                                        </span>
                                      )}
                                      <QualityBadge item={{ ...show, media_type: 'tv' }} size="xs" />
                                      {show.episode_label && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-[10px] font-mono font-extrabold">
                                          {show.episode_label}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-extrabold text-sm sm:text-[15px] text-white group-hover:text-sky-300 transition line-clamp-1">
                                      {show.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                      {show.episode_name ? `Episode: "${show.episode_name}" — ${show.overview || ''}` : (show.overview || 'Currently airing new weekly episodes.')}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between gap-2 pt-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-black uppercase tracking-wide">
                                      <span className={`w-1.5 h-1.5 rounded-full bg-cyan-400 ${selectedDayInfo?.isToday ? 'animate-ping' : ''}`} />
                                      {selectedDayInfo?.isToday ? 'Airing Today' : (show.broadcast || `Airs ${selectedDayInfo?.short || selectedDay}`)}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-sky-300 group-hover:translate-x-0.5 transition shrink-0" />
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-darkCard/50 border border-white/10 p-8 text-center text-gray-400">
                          <p className="text-sm font-medium">No scripted TV series releases scheduled for {selectedDay}.</p>
                        </div>
                      )}
                    </section>
                  )}

                  {/* 3. Live Manga & Manhwa Updates */}
                  {(scheduleFilter === 'all' || scheduleFilter === 'manga') && (
                    <section className="space-y-4 pt-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-xl bg-pink-500/15 border border-pink-400/35 text-pink-300 shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-extrabold text-white font-outfit truncate">
                              Live Manga &amp; Manhwa Releases
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              Active ongoing serializations &amp; recent chapter drops
                            </p>
                          </div>
                        </div>
                        <Link
                          to="/catalog/ongoing/manga"
                          className="text-xs font-bold text-pink-300 hover:text-accentPink inline-flex items-center gap-1 shrink-0 transition"
                        >
                          <span>All Ongoing</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {liveMangaList.map((manga) => {
                          const score = Number(manga.vote_average || 0);
                          return (
                            <Link
                              key={`schedule-manga-${manga.id}`}
                              to={`/media/manga/${manga.id}`}
                              className="group relative flex items-stretch gap-3.5 p-3 rounded-2xl bg-[#0b1124]/85 border border-white/[0.08] hover:border-pink-400/60 hover:bg-[#101834]/95 hover:shadow-[0_12px_32px_rgba(236,72,153,0.16)] hover:-translate-y-0.5 transition-all duration-200 min-w-0 overflow-hidden"
                            >
                              <div className="relative w-16 h-24 sm:w-[74px] sm:h-[108px] rounded-xl overflow-hidden border border-white/10 shrink-0 bg-darkBg">
                                <img
                                  src={formatMediaPoster({ ...manga, media_type: 'manga' })}
                                  alt={manga.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => handlePosterError(e, { ...manga, media_type: 'manga' })}
                                />
                                {score > 0 && (
                                  <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-black text-amber-400">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    {score.toFixed(1)}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-1.5 py-0.5 rounded-md bg-pink-500/20 border border-pink-400/35 text-pink-200 text-[10px] font-mono font-bold uppercase">
                                      {manga.format || 'Manga'}
                                    </span>
                                    {manga.chapters_count && (
                                      <span className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-gray-200 text-[10px] font-mono font-bold">
                                        {manga.chapters_count} Ch
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-extrabold text-sm sm:text-[15px] text-white group-hover:text-pink-300 transition line-clamp-1">
                                    {manga.title}
                                  </h4>
                                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                    {manga.overview || 'Ongoing serialization with active chapter updates.'}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-2">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-400/45 text-pink-300 text-[10px] font-mono font-black uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                                    {manga.broadcast || 'Live Ongoing'}
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-pink-300 group-hover:translate-x-0.5 transition shrink-0" />
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            );
          })()}

          {activeTab === 'upcoming' && (
            <div className="space-y-10 sm:space-y-16 animate-fade-in">
              <MediaGrid items={media.upcoming?.movies?.slice(0, 10)} title="Upcoming Cinematic Movies" seeMoreLink="/catalog/upcoming/movie" />
              <MediaGrid items={media.upcoming?.tv?.slice(0, 10)} title="Upcoming TV Series" seeMoreLink="/catalog/upcoming/tv" showTimings={true} />
              <MediaGrid items={media.upcoming?.anime?.slice(0, 10)} title="Upcoming Anime Seasons" seeMoreLink="/catalog/upcoming/anime" showTimings={true} />
              {media.upcoming?.manga?.length > 0 && (
                <MediaGrid items={media.upcoming.manga.slice(0, 10)} title="Upcoming Manga Releases" seeMoreLink="/catalog/upcoming/manga" showTimings={true} />
              )}
            </div>
          )}
        </div>
      ) : null}

    </div>
  );
}
