import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  BookOpen, 
  X, 
  RotateCcw, 
  Film, 
  Tv, 
  Sparkles, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  Trash2,
  ChevronDown,
  Layers,
  Check,
  Server
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import QualityBadge from './QualityBadge';
import { 
  fetchContinueWatching, 
  removeContinueWatching, 
  recordContinueWatching,
  clearContinueWatching,
  restoreContinueWatchingBatch,
  getResumeUrl 
} from '../utils/continueWatching';
import { STREAMING_SERVERS } from '../utils/streamingServers';
import { formatMediaPoster, handlePosterError } from '../utils/posterFallback';

export default function ContinueWatchingSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showClearMenu, setShowClearMenu] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [bulkClearTarget, setBulkClearTarget] = useState(null); // { type: 'all'|'movie'|'tv'|'anime'|'manga', label: string, count: number }
  const [undoToast, setUndoToast] = useState(null); // { isBulk: boolean, item?: object, items?: object[], label: string }
  const undoToastRef = useRef(null);
  const undoTimerRef = useRef(null);
  const railRef = useRef(null);
  const clearMenuRef = useRef(null);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (clearMenuRef.current && !clearMenuRef.current.contains(e.target)) {
        setShowClearMenu(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowClearMenu(false);
      }
    };

    if (showClearMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showClearMenu]);

  // Load items from database / local storage while respecting pending undo state
  const loadItems = async () => {
    try {
      const data = await fetchContinueWatching();
      const raw = data || [];
      if (undoToastRef.current) {
        const toast = undoToastRef.current;
        if (toast.isBulk) {
          const bulkKeys = new Set((toast.items || []).map((i) => `${i.media_type}_${i.external_media_id}`));
          setItems(raw.filter((i) => !bulkKeys.has(`${i.media_type}_${i.external_media_id}`)));
        } else if (toast.item) {
          const targetKey = `${toast.item.media_type}_${toast.item.external_media_id}`;
          setItems(raw.filter((i) => `${i.media_type}_${i.external_media_id}` !== targetKey));
        } else {
          setItems(raw);
        }
      } else {
        setItems(raw);
      }
    } catch (e) {
      console.warn('[ContinueWatching] Failed to load:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();

    const handleUpdated = () => {
      loadItems();
    };

    window.addEventListener('syncstream:continue-watching-updated', handleUpdated);
    return () => {
      window.removeEventListener('syncstream:continue-watching-updated', handleUpdated);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  // Compute category counts
  const movieCount = items.filter((i) => i.media_type === 'movie').length;
  const tvCount = items.filter((i) => i.media_type === 'tv').length;
  const animeCount = items.filter((i) => i.media_type === 'anime').length;
  const mangaCount = items.filter((i) => i.media_type === 'manga').length;

  // Filter items for display
  const displayedItems = activeFilter === 'all'
    ? items
    : items.filter((i) => i.media_type === activeFilter);

  // If active filter has no items left, reset to 'all'
  useEffect(() => {
    if (activeFilter !== 'all' && displayedItems.length === 0 && items.length > 0) {
      setActiveFilter('all');
    }
  }, [items.length, activeFilter, displayedItems.length]);

  // Scroll rail left/right for tablet/desktop
  const scrollRail = (direction) => {
    if (!railRef.current) return;
    const amount = direction === 'left' ? -340 : 340;
    railRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // ── 1. Individual Removal Trigger ──
  const handleRequestDelete = (e, item) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setItemToDelete(item);
  };

  // Confirm Individual Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    setItemToDelete(null);

    // Optimistically remove from state immediately
    setItems((prev) => prev.filter((i) => i.id !== target.id && i.external_media_id !== target.external_media_id));

    // Provide 4.5s undo window
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const toastData = {
      isBulk: false,
      item: target,
      label: target.title
    };
    undoToastRef.current = toastData;
    setUndoToast(toastData);

    // Remove from MySQL database & local storage (awaited so backend is in sync)
    await removeContinueWatching(target, target.media_type, target.external_media_id);

    undoTimerRef.current = setTimeout(() => {
      undoToastRef.current = null;
      setUndoToast(null);
    }, 4500);
  };

  // ── 2. Bulk Removal Trigger ──
  const handleRequestBulkClear = (type, label, count) => {
    setShowClearMenu(false);
    if (count <= 0) return;
    setBulkClearTarget({ type, label, count });
  };

  // Confirm Bulk Clear
  const handleConfirmBulkClear = async () => {
    if (!bulkClearTarget) return;
    const { type, label } = bulkClearTarget;
    setBulkClearTarget(null);

    const removedItems = type === 'all'
      ? [...items]
      : items.filter((i) => i.media_type === type);

    // Optimistically update state immediately
    if (type === 'all') {
      setItems([]);
    } else {
      setItems((prev) => prev.filter((i) => i.media_type !== type));
    }

    // Provide 4.5s undo window
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const toastData = {
      isBulk: true,
      items: removedItems,
      label: label
    };
    undoToastRef.current = toastData;
    setUndoToast(toastData);

    // Call backend & local cache clear (awaited)
    await clearContinueWatching(type);

    undoTimerRef.current = setTimeout(() => {
      undoToastRef.current = null;
      setUndoToast(null);
    }, 4500);
  };

  // ── 3. Undo Handler (Supports Single & Bulk Restoration) ──
  const handleUndo = async () => {
    if (!undoToast) return;
    const toastData = undoToast;
    undoToastRef.current = null;
    setUndoToast(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    if (toastData.isBulk && Array.isArray(toastData.items)) {
      await restoreContinueWatchingBatch(toastData.items);
    } else if (toastData.item) {
      await recordContinueWatching(toastData.item);
    }
    await loadItems();
  };

  if (!loading && items.length === 0) {
    return null; // Don't take up space if nothing is in continue watching
  }

  const getServerLabel = (serverKey) => {
    if (!serverKey) return null;
    const found = STREAMING_SERVERS.find((s) => s.key === serverKey);
    return found ? (found.name || found.label) : null;
  };

  const formatProgressTime = (seconds) => {
    if (!seconds || Number(seconds) <= 0) return null;
    const total = Math.floor(Number(seconds));
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getMediaBadge = (type) => {
    switch (type) {
      case 'movie':
        return { label: 'Movie', icon: Film, color: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' };
      case 'tv':
        return { label: 'TV Series', icon: Tv, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' };
      case 'anime':
        return { label: 'Anime', icon: Sparkles, color: 'bg-purple-500/20 text-purple-300 border-purple-400/40' };
      case 'manga':
        return { label: 'Manga', icon: BookOpen, color: 'bg-pink-500/20 text-pink-300 border-pink-400/40' };
      default:
        return { label: type, icon: Film, color: 'bg-blue-500/20 text-blue-300 border-blue-400/40' };
    }
  };

  const getProgressLabel = (item) => {
    const timeFormatted = formatProgressTime(item.progress_seconds);
    const timeBadge = timeFormatted ? ` • ${timeFormatted}` : '';

    if (item.media_type === 'tv' || item.media_type === 'anime') {
      const s = item.season_number || 1;
      const ep = item.episode_number || 1;
      if (item.episode_title) {
        return `S${s} E${ep} • ${item.episode_title}${timeBadge}`;
      }
      return `Season ${s} • Episode ${ep}${timeBadge}`;
    }
    if (item.media_type === 'manga') {
      if (item.chapter_number) {
        return `Ch. ${item.chapter_number}${item.chapter_title ? `: ${item.chapter_title}` : ''}`;
      }
      if (item.chapter_title) {
        return item.chapter_title;
      }
      return 'Continue Reading';
    }
    return timeFormatted ? `At ${timeFormatted}` : 'Resume Movie';
  };

  return (
    <section className="relative w-full space-y-3 pt-1 pb-4 sm:pb-6 animate-fade-in overflow-hidden">
      {/* ── Top Header Row (Responsive for Mobile, Tablet & Laptop) ── */}
      <div className="flex items-center justify-between gap-2.5 px-0.5 sm:px-1 flex-wrap sm:flex-nowrap">
        {/* Title & Pulse Beacon */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-accentCyan/20 to-accentPurple/20 border border-accentCyan/40 text-accentCyan shadow-[0_0_15px_rgba(var(--accent-cyan),0.3)] shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm xs:text-base sm:text-xl font-black text-white uppercase tracking-wider font-josefin flex items-center gap-2 truncate">
              <span>Continue Watching</span>
            </h2>
            <p className="text-[10px] xs:text-[11px] sm:text-xs text-slate-400 font-dm truncate">
              Pick up where you left off. Stored permanently in your database.
            </p>
          </div>
        </div>

        {/* Action Controls: Clear / Manage Button & Scroll Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
          {/* ── Manage / Clear Dropdown Menu ── */}
          <div className="relative" ref={clearMenuRef}>
            <button
              type="button"
              onClick={() => setShowClearMenu(!showClearMenu)}
              className={`inline-flex items-center gap-1.5 px-2.5 xs:px-3 py-1.5 rounded-xl border-2 text-[11px] xs:text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer ${
                showClearMenu
                  ? 'bg-[#121c38] border-accentCyan text-white'
                  : 'bg-[#0d1428] border-slate-600 hover:bg-[#121c38] hover:border-accentCyan text-white'
              }`}
              aria-label="Manage or Clear Continue Watching"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Clear / Manage</span>
              <ChevronDown className={`w-3 h-3 text-slate-300 transition-transform duration-200 ${showClearMenu ? 'rotate-180 text-accentCyan' : ''}`} />
            </button>

            {/* 100% Solid High-Contrast Dropdown Card */}
            {showClearMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 xs:w-64 max-w-[calc(100vw-2rem)] rounded-xl bg-[#0c1224] border-2 border-accentCyan shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-hidden py-1.5 z-50 animate-fade-in">
                <div className="px-3 py-1.5 border-b border-slate-700 bg-[#090e1d] text-[10px] font-mono text-slate-300 uppercase tracking-wider font-bold">
                  Removal Options
                </div>

                {/* Clear All */}
                <button
                  type="button"
                  onClick={() => handleRequestBulkClear('all', 'All items', items.length)}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-rose-400 hover:text-white bg-[#0c1224] hover:bg-[#3a1220] flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Clear All Items</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#2a121b] text-rose-300 text-[10px] font-mono">
                    {items.length}
                  </span>
                </button>

                <div className="my-1 border-t border-slate-700" />

                {/* Clear Movies */}
                {movieCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRequestBulkClear('movie', 'Movies', movieCount)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-white hover:text-cyan-300 bg-[#0c1224] hover:bg-[#1a2648] flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Film className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Remove Movies Only</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#141d38] text-slate-300 text-[10px] font-mono">
                      {movieCount}
                    </span>
                  </button>
                )}

                {/* Clear TV Series */}
                {tvCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRequestBulkClear('tv', 'TV Series', tvCount)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-white hover:text-emerald-300 bg-[#0c1224] hover:bg-[#1a2648] flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Tv className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Remove Series Only</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#141d38] text-slate-300 text-[10px] font-mono">
                      {tvCount}
                    </span>
                  </button>
                )}

                {/* Clear Anime */}
                {animeCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRequestBulkClear('anime', 'Anime', animeCount)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-white hover:text-purple-300 bg-[#0c1224] hover:bg-[#1a2648] flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Remove Anime Only</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#141d38] text-slate-300 text-[10px] font-mono">
                      {animeCount}
                    </span>
                  </button>
                )}

                {/* Clear Manga */}
                {mangaCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRequestBulkClear('manga', 'Manga', mangaCount)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-white hover:text-pink-300 bg-[#0c1224] hover:bg-[#1a2648] flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-pink-400" />
                      <span>Remove Manga Only</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#141d38] text-slate-300 text-[10px] font-mono">
                      {mangaCount}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tablet & Desktop Scroll Buttons */}
          {displayedItems.length > 2 && (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollRail('left')}
                className="p-1.5 sm:p-2 rounded-xl border border-white/10 bg-darkCard/80 hover:bg-darkCard hover:border-accentCyan/50 text-gray-300 hover:text-white transition active:scale-95 cursor-pointer shadow-md"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollRail('right')}
                className="p-1.5 sm:p-2 rounded-xl border border-white/10 bg-darkCard/80 hover:bg-darkCard hover:border-accentCyan/50 text-gray-300 hover:text-white transition active:scale-95 cursor-pointer shadow-md"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Category Filter Pills (All, Movies, TV, Anime, Manga) ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x px-0.5">
        {[
          { id: 'all', label: 'All', count: items.length, icon: Layers },
          { id: 'movie', label: 'Movies', count: movieCount, icon: Film },
          { id: 'tv', label: 'Series', count: tvCount, icon: Tv },
          { id: 'anime', label: 'Anime', count: animeCount, icon: Sparkles },
          { id: 'manga', label: 'Manga', count: mangaCount, icon: BookOpen }
        ].map((tab) => {
          if (tab.id !== 'all' && tab.count === 0) return null; // Only show active categories
          const TabIcon = tab.icon;
          const isSelected = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-accentCyan text-black font-extrabold shadow-[0_0_15px_rgba(var(--accent-cyan),0.4)]'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              <TabIcon className="w-3 h-3" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? 'bg-black/25 text-black font-extrabold' : 'bg-white/10 text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Horizontal Scroll Rail (Fluid, Gutter-Free, Snap-Assisted for Mobile & Tablet) ── */}
      <div
        ref={railRef}
        className="w-full flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 px-0.5 sm:px-1 scrollbar-none scroll-smooth snap-x snap-mandatory touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {displayedItems.length === 0 ? (
          <div className="w-full py-8 text-center text-xs text-gray-400 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            No in-progress items found in this category.
          </div>
        ) : (
          displayedItems.map((item) => {
            const badge = getMediaBadge(item.media_type);
            const BadgeIcon = badge.icon;
            const resumeUrl = getResumeUrl(item);
            const progressLabel = getProgressLabel(item);
            const isManga = item.media_type === 'manga';
            const posterUrl = formatMediaPoster(item);
            const backdropUrl = item.backdrop_path || posterUrl;

            return (
              <div
                key={`${item.media_type}_${item.external_media_id}`}
                className="group relative snap-start shrink-0 w-[235px] xs:w-[260px] sm:w-[290px] md:w-[310px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#111728] to-[#0a0f1d] border border-white/10 hover:border-accentCyan/60 transition-all duration-300 shadow-lg hover:shadow-[0_8px_30px_rgba(var(--accent-cyan),0.2)] flex flex-col justify-between"
              >
                {/* Media Thumbnail Container */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black/80">
                  {/* Background Artwork */}
                  <img
                    src={backdropUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => handlePosterError(e, item)}
                    loading="lazy"
                  />

                  {/* Subtle Cinematic Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111728] via-black/25 to-black/50 pointer-events-none" />

                  {/* Center Hover/Touch Play Link (Z-10) */}
                  <Link
                    to={resumeUrl}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/45 backdrop-blur-[2px] z-10"
                    aria-label={`Resume ${item.title}`}
                  >
                    <div className="p-3.5 rounded-full bg-accentCyan text-black font-bold shadow-[0_0_25px_rgba(var(--accent-cyan),0.85)] transform scale-80 group-hover:scale-100 transition-transform duration-200 flex items-center justify-center">
                      {isManga ? (
                        <BookOpen className="w-5 h-5 fill-black" />
                      ) : (
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                      )}
                    </div>
                  </Link>

                  {/* ── TOP ACTION BAR (Z-30 - Sits strictly above the link to guarantee close button is clickable) ── */}
                  <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-1.5 z-30 pointer-events-none">
                    {/* Media Type Badge + HD/CAM Quality Tag */}
                    <div className="pointer-events-auto flex items-center gap-1 min-w-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] xs:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>
                      <QualityBadge item={item} size="xs" />
                    </div>

                    {/* ── TACTILE INDIVIDUAL CLOSE BUTTON (Z-30, Always Clickable & Visible on Mobile/Tablet) ── */}
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => handleRequestDelete(e, item)}
                      title={`Remove ${item.title} from Continue Watching`}
                      aria-label={`Remove ${item.title} from Continue Watching`}
                      className="pointer-events-auto w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-black/85 hover:bg-rose-600 active:scale-85 border border-white/25 hover:border-rose-400 text-white/90 hover:text-white transition-all duration-200 flex items-center justify-center shadow-xl backdrop-blur-md cursor-pointer touch-manipulation hover:ring-2 hover:ring-rose-500/50 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Progress Bar (Bottom of Media Frame) */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 overflow-hidden z-20 pointer-events-none">
                    <div 
                      className="h-full bg-gradient-to-r from-accentCyan via-emerald-400 to-accentPurple"
                      style={{ 
                        width: `${Math.max(25, Math.min(95, (item.progress_seconds && item.duration_seconds) ? (item.progress_seconds / item.duration_seconds) * 100 : 65))}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="p-2.5 xs:p-3 sm:p-3.5 flex flex-col justify-between flex-1 gap-2">
                  <div className="space-y-1">
                    <Link
                      to={resumeUrl}
                      className="block font-black text-xs sm:text-sm text-white hover:text-accentCyan transition-colors truncate font-outfit"
                      title={item.title}
                    >
                      {item.title}
                    </Link>

                    <p className="text-[10px] xs:text-[11px] sm:text-xs text-slate-300 truncate font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accentCyan shrink-0 animate-ping" />
                      <span className="truncate">{progressLabel}</span>
                    </p>

                    {item.server_key && item.media_type !== 'manga' && (
                      <div className="pt-0.5">
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold text-cyan-300/90 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-md truncate max-w-full">
                          <Server className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{getServerLabel(item.server_key) || item.server_key}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Direct Action Link Row */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-500 font-mono truncate">
                      {item.last_watched_at
                        ? new Date(item.last_watched_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : 'In Progress'}
                    </span>

                    <Link
                      to={resumeUrl}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accentCyan/15 hover:bg-accentCyan text-accentCyan hover:text-black text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <span>{isManga ? 'Read' : 'Resume'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── 1. Confirmation Modal for Individual Removal ── */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Remove from Continue Watching?"
        message="Are you sure you want to remove this item? It will be removed from your home page and account until you watch or read it again."
        confirmText="Remove from List"
        cancelText="Keep"
        confirmVariant="danger"
        iconType={itemToDelete?.media_type || 'trash'}
        itemPreview={itemToDelete ? {
          title: itemToDelete.title,
          subtitle: getProgressLabel(itemToDelete),
          image: itemToDelete.poster_path || itemToDelete.backdrop_path,
          badge: getMediaBadge(itemToDelete.media_type).label,
          badgeColor: itemToDelete.media_type === 'manga' ? 'bg-pink-500/20 text-pink-300' : 'bg-cyan-500/20 text-cyan-300'
        } : null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />

      {/* ── 2. Confirmation Modal for Bulk / Category Removal ── */}
      <ConfirmModal
        isOpen={Boolean(bulkClearTarget)}
        title={bulkClearTarget?.type === 'all' ? 'Clear All Continue Watching?' : `Remove All ${bulkClearTarget?.label}?`}
        message={
          bulkClearTarget?.type === 'all'
            ? `Are you sure you want to remove all ${items.length} items from Continue Watching? All in-progress movies, series, anime, and manga will be cleared from your database.`
            : `Are you sure you want to remove all ${bulkClearTarget?.count} ${bulkClearTarget?.label} from your continue watching list?`
        }
        confirmText={bulkClearTarget?.type === 'all' ? 'Yes, Clear All' : `Clear ${bulkClearTarget?.label}`}
        cancelText="Cancel"
        confirmVariant="danger"
        iconType={bulkClearTarget?.type === 'all' ? 'trash' : bulkClearTarget?.type || 'trash'}
        itemPreview={null}
        onConfirm={handleConfirmBulkClear}
        onCancel={() => setBulkClearTarget(null)}
      />

      {/* ── Floating Undo Toast (Supports Single & Bulk Removals, positioned safely above Mobile Nav) ── */}
      {undoToast && (
        <div className="fixed bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-darkCard/95 border border-white/20 text-white shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-fade-up max-w-[92vw]">
          <span className="text-xs text-gray-300 truncate max-w-[200px] xs:max-w-[260px]">
            {undoToast.isBulk ? (
              <>Cleared <strong>{undoToast.label}</strong> ({undoToast.items?.length || 0})</>
            ) : (
              <>Removed <strong>{undoToast.label}</strong></>
            )}
          </span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-accentCyan/20 hover:bg-accentCyan text-accentCyan hover:text-black text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        </div>
      )}
    </section>
  );
}
