import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Layout, ZoomIn, ZoomOut, RotateCcw, Loader2, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function MangaReader({ chapterId, chapters = [], onChapterSelect, onChapterComplete }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Settings states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageDirection, setPageDirection] = useState('next');
  const [isVerticalMode, setIsVerticalMode] = useState(true); // true = Vertical scroll, false = Single page
  const [zoom, setZoom] = useState(100); // percentage
  const [zoomHudKey, setZoomHudKey] = useState(0);
  const [tapFlash, setTapFlash] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reachedEndToast, setReachedEndToast] = useState(false);

  const verticalContainerRef = useRef(null);
  const celebratedChapterRef = useRef(null);

  // Determine next chapter in sequence (handle both asc/desc chapter lists cleanly)
  const currentChapterIdx = chapters.findIndex(c => c.id === chapterId);
  const nextChapter = (() => {
    if (!chapters || chapters.length <= 1 || currentChapterIdx === -1) return null;
    const firstNum = parseFloat(chapters[0]?.chapter);
    const lastNum = parseFloat(chapters[chapters.length - 1]?.chapter);
    const isDescending = !isNaN(firstNum) && !isNaN(lastNum) && firstNum > lastNum;
    const targetIdx = isDescending ? currentChapterIdx - 1 : currentChapterIdx + 1;
    return targetIdx >= 0 && targetIdx < chapters.length ? chapters[targetIdx] : null;
  })();

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      setError(null);
      setScrollProgress(0);
      setReachedEndToast(false);
      celebratedChapterRef.current = null;
      try {
        const res = await axios.get(`/api/media/manga/pages/${chapterId}`);
        setPages(res.data.pages || []);
        setCurrentPage(0);
      } catch (err) {
        console.error('Failed to load manga pages:', err);
        setError('Failed to retrieve manga pages from MangaDex. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) {
      fetchPages();
    }
  }, [chapterId]);

  // Track vertical reading progress % + chapter end toast
  useEffect(() => {
    if (!isVerticalMode) {
      const pct = pages.length > 0 ? Math.round(((currentPage + 1) / pages.length) * 100) : 0;
      setScrollProgress(pct);
      if (pages.length > 0 && currentPage === pages.length - 1 && celebratedChapterRef.current !== chapterId) {
        celebratedChapterRef.current = chapterId;
        setReachedEndToast(true);
        const timer = setTimeout(() => setReachedEndToast(false), 3800);
        return () => clearTimeout(timer);
      }
      return;
    }

    const handleScroll = () => {
      const el = verticalContainerRef.current;
      if (!el || pages.length === 0) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || document.documentElement.clientHeight;
      const totalScrollable = Math.max(el.offsetHeight - viewportH * 0.5, 1);
      const passed = Math.max(0, viewportH * 0.55 - rect.top);
      const pct = Math.min(100, Math.max(0, Math.round((passed / totalScrollable) * 100)));
      setScrollProgress(pct);

      if (pct >= 96 && celebratedChapterRef.current !== chapterId) {
        celebratedChapterRef.current = chapterId;
        setReachedEndToast(true);
        setTimeout(() => setReachedEndToast(false), 4000);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isVerticalMode, pages.length, currentPage, chapterId]);

  const triggerTapFlash = (side) => {
    setTapFlash({ side, key: Date.now() });
    setTimeout(() => {
      setTapFlash((prev) => (prev && Date.now() - prev.key >= 420 ? null : prev));
    }, 450);
  };

  const handleNextPage = () => {
    triggerTapFlash('right');
    if (currentPage < pages.length - 1) {
      setPageDirection('next');
      setCurrentPage(prev => prev + 1);
    } else if (nextChapter && onChapterSelect) {
      onChapterSelect(nextChapter.id, `Chapter ${nextChapter.chapter}: ${nextChapter.title}`);
    } else if (onChapterComplete) {
      onChapterComplete();
    }
  };

  const handlePrevPage = () => {
    triggerTapFlash('left');
    if (currentPage > 0) {
      setPageDirection('prev');
      setCurrentPage(prev => prev - 1);
    }
  };

  const adjustZoom = (amount) => {
    setZoom(prev => {
      const next = Math.min(Math.max(prev + amount, 50), 200);
      return next;
    });
    setZoomHudKey(k => k + 1);
  };

  const resetZoom = () => {
    setZoom(100);
    setZoomHudKey(k => k + 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-accentCyan" />
        <p className="text-gray-400 font-medium">Downloading chapter images from MangaDex...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-lg mx-auto text-center space-y-4 my-12">
        <p className="text-red-400 font-semibold">{error}</p>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>This chapter contains no pages.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-5 sm:space-y-6 relative">

      {/* ── Floating Edge Reading Progress Neon Spine (Tablet & Laptop) ── */}
      <div
        aria-hidden="true"
        className="hidden md:flex fixed right-3 lg:right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2 pointer-events-none select-none"
      >
        <div className="px-2 py-0.5 rounded-full bg-darkCard/90 border border-accentCyan/40 text-[10px] font-black text-accentCyan font-mono shadow-[0_0_12px_rgba(var(--accent-cyan),0.35)] backdrop-blur-md">
          {scrollProgress}%
        </div>
        <div className="w-1.5 h-36 lg:h-44 rounded-full bg-white/10 border border-white/10 overflow-hidden relative p-[1px]">
          <div
            className="w-full rounded-full bg-gradient-to-b from-accentCyan via-accentPurple to-accentPink shadow-[0_0_10px_rgba(var(--accent-cyan),0.8)] transition-all duration-200"
            style={{ height: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* ── Chapter Complete Floating Toast Notification ── */}
      {reachedEndToast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[140] px-4 py-2.5 rounded-2xl bg-[#0e1429]/95 border border-accentCyan/50 shadow-[0_0_28px_rgba(var(--accent-cyan),0.4)] backdrop-blur-xl flex items-center gap-2.5 animate-spring-toast pointer-events-auto">
          <Sparkles className="w-4 h-4 text-accentCyan animate-pulse shrink-0" />
          <span className="text-xs font-extrabold text-white whitespace-nowrap">
            Chapter Finished! 🎉
          </span>
          {nextChapter && onChapterSelect && (
            <button
              type="button"
              onClick={() => onChapterSelect(nextChapter.id, `Chapter ${nextChapter.chapter}: ${nextChapter.title}`)}
              className="ml-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-accentCyan to-accentPurple text-black text-[11px] font-black flex items-center gap-1 hover:opacity-90 active:scale-95 transition"
            >
              <span>Next Ch. {nextChapter.chapter}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Floating Reader Settings Bar */}
      <div className="sticky top-16 sm:top-20 z-40 w-full max-w-4xl glass-panel border border-darkBorder rounded-2xl px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2 flex flex-col gap-2 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 w-full">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold">
            <span className="text-accentCyan bg-accentCyan/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-accentCyan/20 whitespace-nowrap">
              {isVerticalMode ? `Scroll • ${scrollProgress}%` : `Page ${currentPage + 1} / ${pages.length}`}
            </span>
            
            {chapters && chapters.length > 0 && onChapterSelect && (
              <select
                value={chapterId}
                onChange={(e) => {
                  const selectedChId = e.target.value;
                  const ch = chapters.find(c => c.id === selectedChId);
                  if (ch) {
                    onChapterSelect(selectedChId, `Chapter ${ch.chapter}: ${ch.title}`);
                  }
                }}
                className="bg-darkCard text-[11px] sm:text-xs font-bold text-gray-200 border border-darkBorder rounded-lg px-2.5 sm:px-3 py-1.5 focus:outline-none focus:border-accentCyan cursor-pointer transition max-w-[130px] sm:max-w-[180px] md:max-w-[220px]"
              >
                {chapters.map(ch => (
                  <option key={ch.id} value={ch.id} className="bg-darkBg">
                    Ch. {ch.chapter} - {ch.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Layout Toggle */}
            <button
              onClick={() => setIsVerticalMode(!isVerticalMode)}
              className="px-2.5 py-1.5 sm:p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 border border-darkBorder transition flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold cursor-pointer active:scale-95"
              title="Toggle Reader Mode"
            >
              <Layout className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accentCyan" />
              <span className="hidden xs:inline">{isVerticalMode ? 'Page-by-Page' : 'Webtoon'}</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 sm:gap-1 border border-darkBorder rounded-xl p-1 bg-black/25">
              <button
                onClick={() => adjustZoom(-15)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] sm:text-xs px-1 text-gray-300 min-w-[34px] text-center font-bold">{zoom}%</span>
              <button
                onClick={() => adjustZoom(15)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetZoom}
                className="p-1 rounded-lg text-gray-500 hover:text-white transition cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Page Nav controls (Only visible in Single Page Mode) */}
            {!isVerticalMode && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-darkBorder text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  className="p-1.5 sm:p-2 rounded-xl bg-accentCyan text-black font-bold hover:bg-accentCyan/80 transition cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Reading Progress Neon Rail (visible across mobile, tablet, laptop) */}
        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accentCyan via-accentPurple to-accentPink shadow-[0_0_10px_rgba(var(--accent-cyan),0.7)] transition-all duration-200"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {/* Pages Container */}
      <div className="w-full overflow-x-auto py-2 sm:py-4 relative">
        {/* Auto-fading Zoom HUD Pill */}
        {zoomHudKey > 0 && (
          <div
            key={zoomHudKey}
            aria-hidden="true"
            className="fixed top-1/2 left-1/2 z-[120] px-4 py-2 rounded-2xl bg-black/85 border border-accentCyan/50 text-accentCyan font-mono font-black text-sm sm:text-base shadow-[0_0_24px_rgba(var(--accent-cyan),0.5)] backdrop-blur-xl pointer-events-none animate-zoom-hud"
          >
            {zoom}%
          </div>
        )}

        {isVerticalMode ? (
          /* Webtoon Vertical Mode */
          <div
            ref={verticalContainerRef}
            className="flex flex-col gap-3 sm:gap-4 max-w-4xl mx-auto transition-[width] duration-200"
            style={{ width: zoom === 100 ? '100%' : `${zoom}%` }}
          >
            {pages.map((pageUrl, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-darkBorder shadow-lg bg-black/20">
                <img
                  src={pageUrl}
                  alt={`Manga page ${idx + 1}`}
                  className="w-full h-auto select-none object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs text-gray-300 pointer-events-none font-bold border border-white/10">
                  Page {idx + 1} / {pages.length}
                </div>
              </div>
            ))}

            {/* Animated Celebratory Chapter Complete Banner */}
            <div className="mt-6 sm:mt-8 relative overflow-hidden rounded-2xl sm:rounded-3xl border border-accentCyan/35 bg-gradient-to-br from-darkCard/95 via-accentPurple/15 to-accentCyan/15 p-5 sm:p-7 text-center shadow-[0_0_35px_rgba(var(--accent-cyan),0.2)] space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Chapter Complete!</span>
              </div>
              <div className="space-y-1">
                <h4 className="text-lg sm:text-xl font-extrabold text-white font-outfit flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-accentCyan animate-pulse" />
                  <span>You finished all {pages.length} pages</span>
                  <Sparkles className="w-4 h-4 text-accentPink animate-pulse" />
                </h4>
                <p className="text-xs sm:text-sm text-gray-400">
                  Ready to continue the story or pick another chapter?
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                {nextChapter && onChapterSelect && (
                  <button
                    type="button"
                    onClick={() => onChapterSelect(nextChapter.id, `Chapter ${nextChapter.chapter}: ${nextChapter.title}`)}
                    className="btn-shimmer px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(var(--accent-cyan),0.45)] flex items-center gap-2 cursor-pointer active:scale-95 animate-pulse"
                  >
                    <span>Next: Chapter {nextChapter.chapter}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {onChapterComplete && (
                  <button
                    type="button"
                    onClick={onChapterComplete}
                    className="px-5 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition cursor-pointer active:scale-95"
                  >
                    View Chapters List
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Page-by-Page Mode */
          <div
            className="relative flex flex-col items-center max-w-3xl mx-auto border border-darkBorder rounded-2xl overflow-hidden bg-black/40 shadow-2xl p-2.5 sm:p-4 transition-[width] duration-200"
            style={{ width: zoom === 100 ? '100%' : `${zoom}%` }}
          >
            <div className="relative w-full h-auto flex items-center justify-center min-h-[340px] sm:min-h-[480px] md:min-h-[540px] overflow-hidden rounded-xl">
              {/* Left Tap-Zone Chevron Ripple Feedback */}
              {tapFlash?.side === 'left' && (
                <div
                  key={`left-${tapFlash.key}`}
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-1/3 flex items-center justify-start pl-3 sm:pl-6 bg-gradient-to-r from-accentCyan/20 to-transparent pointer-events-none z-20 animate-tap-flash"
                >
                  <div className="p-2.5 sm:p-3 rounded-full bg-black/70 border border-accentCyan/50 text-accentCyan shadow-[0_0_20px_rgba(var(--accent-cyan),0.6)]">
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              )}

              {/* Right Tap-Zone Chevron Ripple Feedback */}
              {tapFlash?.side === 'right' && (
                <div
                  key={`right-${tapFlash.key}`}
                  aria-hidden="true"
                  className="absolute inset-y-0 right-0 w-1/3 flex items-center justify-end pr-3 sm:pr-6 bg-gradient-to-l from-accentPurple/20 to-transparent pointer-events-none z-20 animate-tap-flash"
                >
                  <div className="p-2.5 sm:p-3 rounded-full bg-black/70 border border-accentPurple/50 text-accentCyan shadow-[0_0_20px_rgba(var(--accent-purple),0.6)]">
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              )}

              <img
                key={`${chapterId}-${currentPage}`}
                src={pages[currentPage]}
                alt={`Manga page ${currentPage + 1}`}
                className={`max-h-[75vh] sm:max-h-[85vh] w-auto select-none object-contain rounded cursor-pointer ${
                  pageDirection === 'next' ? 'animate-page-next' : 'animate-page-prev'
                }`}
                referrerPolicy="no-referrer"
                onClick={(e) => {
                  // Clicking right half goes next, left half goes prev
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  if (x > rect.width / 2) {
                    handleNextPage();
                  } else {
                    handlePrevPage();
                  }
                }}
              />
            </div>

            {/* Bottom Single-Page End CTA if on last page */}
            {currentPage === pages.length - 1 && (nextChapter || onChapterComplete) && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {nextChapter && onChapterSelect && (
                  <button
                    type="button"
                    onClick={() => onChapterSelect(nextChapter.id, `Chapter ${nextChapter.chapter}: ${nextChapter.title}`)}
                    className="btn-shimmer px-4 py-2 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-black text-xs flex items-center gap-1.5 shadow-lg cursor-pointer active:scale-95"
                  >
                    <span>Next: Ch. {nextChapter.chapter}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            
            {/* Click assistance hint */}
            <p className="text-[11px] sm:text-xs text-gray-500 mt-3 text-center">
              Tap or click the left side of the page to go back, right side to go forward.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
