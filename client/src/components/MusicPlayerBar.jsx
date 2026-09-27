import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMusic } from '../context/MusicContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Repeat,
  Repeat1,
  Shuffle,
  Maximize2,
  ListMusic,
  FileText,
  Heart,
  FolderPlus,
  X
} from 'lucide-react';

const cleanText = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\\"/g, '"')
    .trim();
};

const cleanArtist = (str, track) => {
  let val = str;
  if (!val || typeof val !== 'string' || val.trim() === '' || val.toLowerCase() === 'unknown artist') {
    if (track) {
      val = track.subtitle || track.singers || track.primary_artists || track.music || '';
    }
  }
  if (!val || typeof val !== 'string' || val.trim() === '') return 'Various Artists';
  return cleanText(val)
    .replace(/\s*-\s*topic$/i, '')
    .replace(/,\s*$/, '')
    .trim() || 'Various Artists';
};

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function MusicPlayerBar() {
  const {
    currentTrack,
    queue,
    queueIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    isShuffling,
    isLoading,
    isExpanded,
    isFavorite,
    toggleFavorite,
    openAddToPlaylist,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    setIsExpanded,
    openPlayerModal,
    openLyricsModal,
    removeFromQueue,
    playTrack,
    closePlayer
  } = useMusic();

  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(null);
  const progressBarRef = useRef(null);

  const calculateSeekTime = useCallback((e) => {
    if (!progressBarRef.current || duration <= 0) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (offsetX / rect.width) * duration;
  }, [duration]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setDragTime(calculateSeekTime(e));
    }
  }, [isDragging, calculateSeekTime]);

  const handleMouseUp = useCallback((e) => {
    if (isDragging) {
      const target = calculateSeekTime(e);
      seek(target);
      setIsDragging(false);
    }
  }, [isDragging, seek, calculateSeekTime]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // ALL hooks are above this line. Conditional returns are safe below.
  if (!currentTrack || isExpanded) return null;

  const displayTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const target = calculateSeekTime(e);
    setDragTime(target);
  };

  const handleProgressBarHover = (e) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const hoverTime = (offsetX / rect.width) * duration;
    setHoverPosition({
      percent: (offsetX / rect.width) * 100,
      time: formatTime(hoverTime)
    });
  };

  return (
    <>
      {/* Floating Music Player Bar */}
      <aside
        aria-label="Floating Music Player"
        className="fixed left-2 right-2 sm:left-4 sm:right-4 bottom-[56px] xs:bottom-[58px] md:bottom-3 z-40 max-w-5xl mx-auto transition-all duration-300 pointer-events-auto select-none"
      >
        <div className="relative rounded-xl sm:rounded-2xl border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl bg-[#0e1329]/95 overflow-hidden">
          
          {/* Top Edge Neon Progress Bar */}
          <div
            ref={progressBarRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onMouseMove={handleProgressBarHover}
            onMouseLeave={() => setHoverPosition(null)}
            className="relative w-full h-1 sm:h-1.5 bg-white/10 cursor-pointer overflow-visible group/bar transition-all"
          >
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-accentCyan via-accentPurple to-accentPink shadow-[0_0_8px_rgba(99,210,255,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shadow-[0_0_6px_#fff] opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />
            {hoverPosition && (
              <div
                className="hidden md:block absolute -top-7 -translate-x-1/2 bg-black/95 border border-white/20 text-[10px] font-mono font-bold text-accentCyan px-1.5 py-0.5 rounded shadow-xl pointer-events-none"
                style={{ left: `${hoverPosition.percent}%` }}
              >
                {hoverPosition.time}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              1. MOBILE VIEW (< sm / < 640px) — Ultra Compact & Clean 2-Tier Dock
             ══════════════════════════════════════════════════════════════════════ */}
          <div className="flex sm:hidden flex-col gap-1 px-2.5 py-1.5 w-full">
            {/* Row 1: Track Metadata (Left) + Timestamps / Quick Actions (Right) */}
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              {/* Left: Artwork + Title + Language Badge + Artist */}
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <div
                  onClick={openPlayerModal}
                  className="relative w-7 h-7 xs:w-8 xs:h-8 rounded-lg overflow-hidden shrink-0 border border-white/25 shadow-md cursor-pointer group bg-black/40"
                  title="Tap to open full player"
                >
                  <img
                    src={currentTrack.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
                    alt={cleanText(currentTrack.title)}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                      isPlaying ? 'animate-spin-slow' : ''
                    }`}
                  />
                  {isPlaying && (
                    <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-accentCyan shadow-[0_0_4px_#fff]" />
                  )}
                </div>

                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-center gap-1 min-w-0">
                    <h4
                      onClick={openPlayerModal}
                      className="text-[11px] xs:text-xs font-bold text-white truncate font-outfit cursor-pointer hover:text-accentCyan transition-colors leading-tight"
                      title={cleanText(currentTrack.title)}
                    >
                      {cleanText(currentTrack.title)}
                    </h4>
                    <span className="uppercase text-[7px] xs:text-[7.5px] font-black px-1 py-0.2 rounded bg-accentCyan/20 text-accentCyan border border-accentCyan/40 shrink-0">
                      {currentTrack.language || currentTrack.category || 'GLOBAL'}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-300 font-medium truncate leading-tight">
                    {cleanArtist(currentTrack.artist, currentTrack)}
                  </p>
                </div>
              </div>

              {/* Right: Timestamp, Lyrics, Close */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="text-[8.5px] font-mono font-medium text-slate-300 px-1.5 py-0.5 rounded bg-white/10 border border-white/15 shrink-0">
                  <span className="text-white">{formatTime(displayTime)}</span>
                  <span className="text-slate-400 mx-0.5">/</span>
                  <span className="text-slate-300">{formatTime(duration)}</span>
                </div>

                <button
                  type="button"
                  onClick={openLyricsModal}
                  className="p-1 text-slate-300 hover:text-accentCyan hover:bg-white/10 rounded-md transition active:scale-90"
                  title="Lyrics (📄)"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={closePlayer}
                  className="p-1 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-md transition active:scale-90"
                  title="Close / Dismiss (✕)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Row 2: Centered 5 Playback Controls */}
            <div className="flex items-center justify-center gap-2 xs:gap-3 pt-0.5 pb-0.5">
              <button
                type="button"
                onClick={prevTrack}
                className="p-1 text-slate-300 hover:text-white rounded-lg transition active:scale-90"
                title="Previous Track (⏮)"
              >
                <SkipBack className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
              </button>

              <button
                type="button"
                onClick={() => skipBackward(10)}
                className="group relative p-1 text-slate-300 hover:text-accentCyan rounded-lg transition active:scale-90 flex items-center justify-center"
                title="Rewind 10 Seconds (↺10)"
              >
                <RotateCcw className="w-3.5 h-3.5 xs:w-4 xs:h-4 transition-transform group-hover:-rotate-45" />
                <span className="absolute text-[6px] font-black text-accentCyan font-mono pointer-events-none">
                  10
                </span>
              </button>

              <button
                type="button"
                onClick={togglePlay}
                disabled={isLoading}
                className="relative w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 mx-0.5 border border-white/30 shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => skipForward(10)}
                className="group relative p-1 text-slate-300 hover:text-accentCyan rounded-lg transition active:scale-90 flex items-center justify-center"
                title="Forward 10 Seconds (↻10)"
              >
                <RotateCw className="w-3.5 h-3.5 xs:w-4 xs:h-4 transition-transform group-hover:rotate-45" />
                <span className="absolute text-[6px] font-black text-accentCyan font-mono pointer-events-none">
                  10
                </span>
              </button>

              <button
                type="button"
                onClick={nextTrack}
                className="p-1 text-slate-300 hover:text-white rounded-lg transition active:scale-90"
                title="Next Track (⏭)"
              >
                <SkipForward className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              2. TABLET & DESKTOP VIEW (>= sm / >= 640px) — Studio Row Layout
             ══════════════════════════════════════════════════════════════════════ */}
          <div className="hidden sm:flex items-center justify-between gap-2.5 md:gap-4 px-3 sm:px-4 py-1.5 sm:py-2 w-full">
            {/* 1. Track Info (Left) */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-hidden">
              <div
                onClick={openPlayerModal}
                className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl overflow-hidden shrink-0 border border-white/25 shadow-md cursor-pointer group bg-black/40"
                title="Tap to open full player"
              >
                <img
                  src={currentTrack.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
                  alt={cleanText(currentTrack.title)}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                    isPlaying ? 'animate-spin-slow' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1 overflow-hidden pr-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h4
                    onClick={openPlayerModal}
                    className="text-xs sm:text-[13px] md:text-sm font-bold text-white truncate font-outfit cursor-pointer hover:text-accentCyan transition-colors leading-tight"
                    title={cleanText(currentTrack.title)}
                  >
                    {cleanText(currentTrack.title)}
                  </h4>
                  <span className="uppercase text-[7.5px] sm:text-[8px] md:text-[8.5px] font-black px-1.5 py-0.2 rounded-md bg-accentCyan/20 text-accentCyan border border-accentCyan/40 shrink-0">
                    {currentTrack.language || currentTrack.category || 'GLOBAL'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] md:text-xs text-slate-300 truncate font-medium leading-tight hover:text-white transition-colors">
                  {cleanArtist(currentTrack.artist, currentTrack)}
                </p>
              </div>
            </div>

            {/* 2. Center Playback Controls */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
              <button
                type="button"
                onClick={prevTrack}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition active:scale-90"
                title="Previous Track (⏮)"
              >
                <SkipBack className="w-4 h-4 md:w-4.5 md:h-4.5" />
              </button>

              <button
                type="button"
                onClick={() => skipBackward(10)}
                className="group relative p-1.5 text-slate-300 hover:text-accentCyan hover:bg-accentCyan/15 rounded-lg transition active:scale-90 flex items-center justify-center"
                title="Rewind 10 Seconds (↺10)"
              >
                <RotateCcw className="w-4 h-4 md:w-4.5 md:h-4.5 transition-transform group-hover:-rotate-45" />
                <span className="absolute text-[7px] font-black text-accentCyan font-mono pointer-events-none">
                  10
                </span>
              </button>

              <button
                type="button"
                onClick={togglePlay}
                disabled={isLoading}
                className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-[0_0_14px_rgba(99,210,255,0.5)] hover:shadow-[0_0_22px_rgba(99,210,255,0.8)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 mx-0.5 sm:mx-1 border border-white/30 shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => skipForward(10)}
                className="group relative p-1.5 text-slate-300 hover:text-accentCyan hover:bg-accentCyan/15 rounded-lg transition active:scale-90 flex items-center justify-center"
                title="Forward 10 Seconds (↻10)"
              >
                <RotateCw className="w-4 h-4 md:w-4.5 md:h-4.5 transition-transform group-hover:rotate-45" />
                <span className="absolute text-[7px] font-black text-accentCyan font-mono pointer-events-none">
                  10
                </span>
              </button>

              <button
                type="button"
                onClick={nextTrack}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition active:scale-90"
                title="Next Track (⏭)"
              >
                <SkipForward className="w-4 h-4 md:w-4.5 md:h-4.5" />
              </button>
            </div>

            {/* 3. Right Extra Controls */}
            <div className="flex items-center justify-end gap-1 sm:gap-1.5 md:gap-2 shrink-0">
              <div className="text-[9px] sm:text-[9.5px] md:text-[10.5px] font-mono font-medium text-slate-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-white/10 border border-white/15 shrink-0 shadow-sm">
                <span className="text-white">{formatTime(displayTime)}</span>
                <span className="text-slate-400 mx-0.5 sm:mx-1">/</span>
                <span className="text-slate-300">{formatTime(duration)}</span>
              </div>

              <button
                type="button"
                onClick={openLyricsModal}
                className="p-1.5 md:p-2 text-slate-300 hover:text-accentCyan hover:bg-accentCyan/15 rounded-lg transition active:scale-90"
                title="Lyrics (📄)"
              >
                <FileText className="w-4 h-4 md:w-4.5 md:h-4.5" />
              </button>

              <button
                type="button"
                onClick={closePlayer}
                className="p-1.5 md:p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/15 rounded-lg transition active:scale-90"
                title="Close / Dismiss (✕)"
              >
                <X className="w-4 h-4 md:w-4.5 md:h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Queue Drawer Popup (Desktop & Mobile) */}
      {showQueueDrawer && (
        <div className="fixed bottom-36 md:bottom-24 left-3 right-3 sm:left-auto sm:right-4 z-50 w-auto sm:w-96 max-h-[60vh] rounded-3xl border-2 border-white/20 bg-[#141a33]/98 backdrop-blur-2xl shadow-2xl p-4 flex flex-col gap-3 animate-slide-up">
          <div className="flex items-center justify-between pb-2 border-b border-white/15">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-accentCyan" />
              <h3 className="font-black text-sm text-white font-outfit">Playing Queue ({queue.length})</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowQueueDrawer(false)}
              className="p-1 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto space-y-2 flex-1 pr-1 custom-scrollbar max-h-80">
            {queue.map((track, idx) => {
              const isCurrent = track.id === currentTrack.id;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  className={`flex items-center justify-between gap-2 p-2 rounded-xl transition ${
                    isCurrent
                      ? 'bg-accentCyan/20 border border-accentCyan/40 text-white'
                      : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <div
                    onClick={() => playTrack(track, queue)}
                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  >
                    <img
                      src={track.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
                      alt={track.title}
                      className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${isCurrent ? 'text-accentCyan' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromQueue(idx)}
                    className="p-1 text-gray-400 hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
