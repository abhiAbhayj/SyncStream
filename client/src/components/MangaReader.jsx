import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Layout, ZoomIn, ZoomOut, RotateCcw, Loader2 } from 'lucide-react';

export default function MangaReader({ chapterId, onChapterComplete }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Settings states
  const [currentPage, setCurrentPage] = useState(0);
  const [isVerticalMode, setIsVerticalMode] = useState(true); // true = Vertical scroll, false = Single page
  const [zoom, setZoom] = useState(100); // percentage

  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      setError(null);
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

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else if (onChapterComplete) {
      onChapterComplete();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const adjustZoom = (amount) => {
    setZoom(prev => Math.min(Math.max(prev + amount, 50), 200));
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
    <div className="flex flex-col items-center space-y-6">
      
      {/* Floating Reader Settings Bar */}
      <div className="sticky top-20 z-40 w-full max-w-4xl glass-panel border border-darkBorder rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 text-sm font-semibold">
          <span className="text-accentCyan bg-accentCyan/10 px-3 py-1 rounded-lg border border-accentCyan/20">
            {isVerticalMode ? 'Vertical Scroll' : `Page ${currentPage + 1} of ${pages.length}`}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Layout Toggle */}
          <button
            onClick={() => setIsVerticalMode(!isVerticalMode)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-darkBorder transition flex items-center gap-1.5 text-xs font-semibold"
            title="Toggle Reader Mode"
          >
            <Layout className="w-4 h-4" />
            {isVerticalMode ? 'Switch to Page-by-Page' : 'Switch to Webtoon'}
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border border-darkBorder rounded-xl p-1 bg-black/20">
            <button
              onClick={() => adjustZoom(-15)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs px-1 text-gray-400 min-w-[36px] text-center font-bold">{zoom}%</span>
            <button
              onClick={() => adjustZoom(15)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1 rounded-lg text-gray-500 hover:text-white transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Page Nav controls (Only visible in Single Page Mode) */}
        {!isVerticalMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="p-2 rounded-xl bg-white/5 border border-darkBorder text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPage}
              className="p-2 rounded-xl bg-accentCyan text-black font-bold hover:bg-accentCyan/80 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Pages Container */}
      <div className="w-full flex justify-center py-4">
        {isVerticalMode ? (
          /* Webtoon Vertical Mode */
          <div 
            className="flex flex-col gap-4 w-full max-w-4xl"
            style={{ width: `${zoom}%` }}
          >
            {pages.map((pageUrl, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden border border-darkBorder shadow-lg">
                <img
                  src={pageUrl}
                  alt={`Manga page ${idx + 1}`}
                  className="w-full h-auto select-none object-contain"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-gray-400 pointer-events-none font-bold">
                  Page {idx + 1}
                </div>
              </div>
            ))}
            {onChapterComplete && (
              <button
                onClick={onChapterComplete}
                className="mt-8 px-6 py-3 rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-95 transition"
              >
                Finished Chapter? View Chapters List
              </button>
            )}
          </div>
        ) : (
          /* Page-by-Page Mode */
          <div 
            className="relative flex flex-col items-center max-w-3xl border border-darkBorder rounded-2xl overflow-hidden bg-black/40 shadow-2xl p-4"
            style={{ width: `${zoom}%` }}
          >
            <div className="w-full h-auto flex items-center justify-center min-h-[500px]">
              <img
                src={pages[currentPage]}
                alt={`Manga page ${currentPage + 1}`}
                className="max-h-[85vh] w-auto select-none object-contain rounded"
                onClick={(e) => {
                  // Clicking right half goes next, left half goes prev
                  const rect = e.target.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  if (x > rect.width / 2) {
                    handleNextPage();
                  } else {
                    handlePrevPage();
                  }
                }}
              />
            </div>
            
            {/* Click assistance hint */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              Click the left side of the page to go back, right side to go forward.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
