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
  ArrowRight
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { 
  fetchContinueWatching, 
  removeContinueWatching, 
  recordContinueWatching,
  getResumeUrl 
} from '../utils/continueWatching';
import { formatMediaPoster, handlePosterError } from '../utils/posterFallback';

export default function ContinueWatchingSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [undoToast, setUndoToast] = useState(null);
  const undoTimerRef = useRef(null);
  const railRef = useRef(null);

  // Load items from database / local storage
  const loadItems = async () => {
    try {
      const data = await fetchContinueWatching();
      setItems(data || []);
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

  // Scroll rail left/right for tablet/desktop
  const scrollRail = (direction) => {
    if (!railRef.current) return;
    const amount = direction === 'left' ? -340 : 340;
    railRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Trigger delete confirmation modal
  const handleRequestDelete = (e, item) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setItemToDelete(item);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    setItemToDelete(null);

    // Optimistically remove from state
    setItems((prev) => prev.filter((i) => i.id !== target.id && i.external_media_id !== target.external_media_id));

    // Remove from MySQL database & local storage
    await removeContinueWatching(target.id, target.media_type);

    // Provide 4.5s undo window
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoToast(target);
    undoTimerRef.current = setTimeout(() => {
      setUndoToast(null);
    }, 4500);
  };

  // Undo delete
  const handleUndo = async () => {
    if (!undoToast) return;
    const restored = undoToast;
    setUndoToast(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    // Re-record to MySQL and local storage
    await recordContinueWatching(restored);
    loadItems();
  };

  if (!loading && items.length === 0) {
    return null; // Don't take up space if nothing is in continue watching
  }

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
    if (item.media_type === 'tv' || item.media_type === 'anime') {
      const s = item.season_number || 1;
      const ep = item.episode_number || 1;
      if (item.episode_title) {
        return `S${s} E${ep} • ${item.episode_title}`;
      }
      return `Season ${s} • Episode ${ep}`;
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
    return 'Resume Movie';
  };

  return (
    <section className="relative w-full space-y-3.5 sm:space-y-4 pt-1 pb-4 sm:pb-6 animate-fade-in overflow-hidden">
      {/* Header Row (Responsive for Mobile & Tablet) */}
      <div className="flex items-center justify-between gap-2.5 px-0.5 sm:px-1">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-accentCyan/20 to-accentPurple/20 border border-accentCyan/40 text-accentCyan shadow-[0_0_15px_rgba(var(--accent-cyan),0.3)] shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm xs:text-base sm:text-xl font-black text-white uppercase tracking-wider font-josefin flex items-center gap-2 truncate">
              <span>Continue Watching</span>
            </h2>
            <p className="text-[10px] xs:text-[11px] sm:text-xs text-slate-400 font-dm truncate">
              Pick up right where you left off. Stored permanently until you remove it.
            </p>
          </div>
          <span className="hidden xs:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accentCyan/15 border border-accentCyan/30 text-accentCyan font-mono text-[10px] sm:text-xs font-bold shadow-[0_0_10px_rgba(var(--accent-cyan),0.2)] shrink-0">
            <span>{items.length} active</span>
          </span>
        </div>

        {/* Scroll Controls (Tablet & Desktop) */}
        {items.length > 2 && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => scrollRail('left')}
              className="p-2 rounded-xl border border-white/10 bg-darkCard/80 hover:bg-darkCard hover:border-accentCyan/50 text-gray-300 hover:text-white transition active:scale-95 cursor-pointer shadow-md"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollRail('right')}
              className="p-2 rounded-xl border border-white/10 bg-darkCard/80 hover:bg-darkCard hover:border-accentCyan/50 text-gray-300 hover:text-white transition active:scale-95 cursor-pointer shadow-md"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Scroll Rail (Fluid, Gutter-Free, Snap-Assisted for Mobile & Tablet) */}
      <div
        ref={railRef}
        className="w-full flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 px-0.5 sm:px-1 scrollbar-none scroll-smooth snap-x snap-mandatory touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((item) => {
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
                  {/* Media Type Badge */}
                  <span className={`pointer-events-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] xs:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${badge.color}`}>
                    <BadgeIcon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>

                  {/* ── TACTILE CLOSE BUTTON (Z-30, Always Clickable & Visible on Mobile/Tablet) ── */}
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
        })}
      </div>

      {/* Confirmation Modal for Removal */}
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

      {/* Floating Undo Toast (Positioned safely above Mobile Navigation Bar) */}
      {undoToast && (
        <div className="fixed bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-darkCard/95 border border-white/20 text-white shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-fade-up max-w-[90vw]">
          <span className="text-xs text-gray-300 truncate max-w-[200px] xs:max-w-[260px]">
            Removed <strong className="text-white">{undoToast.title}</strong>
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
