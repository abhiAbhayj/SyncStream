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
        className="fixed left-2 right-2 sm:left-4 sm:right-4 bottom-[58px] xs:bottom-[60px] md:bottom-3 z-40 max-w-6xl mx-auto transition-all duration-300 pointer-events-auto select-none"
      >
        <div className="relative rounded-2xl border-2 border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl bg-[#12172f]/95 overflow-hidden">
          
          {/* Top Edge Neon Progress Bar */}
          <div
            ref={progressBarRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onMouseMove={handleProgressBarHover}
            onMouseLeave={() => setHoverPosition(null)}
            className="relative w-full h-1.5 md:h-2 bg-white/10 cursor-pointer overflow-visible group/bar transition-all"
          >
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-accentCyan via-accentPurple to-accentPink shadow-[0_0_8px_rgba(99,210,255,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-white shadow-[0_0_8px_#fff] opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none"
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
              MOBILE VIEW (< 768px) — All Exact Menu Buttons & Controls (2 Balanced Compact Rows)
             ══════════════════════════════════════════════════════════════════════ */}
          <div className="flex md:hidden flex-col gap-1.5 p-2 w-full">
            {/* Row 1: Track Info + Extra Tools (Time, Queue, Lyrics, Fullscreen, Close) */}
            <div className="flex items-center justify-between gap-1.5 w-full">
              {/* Left: Artwork + Title + Quick Actions + Artist */}
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <div
                  onClick={openPlayerModal}
                  className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-white/20 bg-black/40 shadow-sm cursor-pointer"
                >
                  <img
                    src={currentTrack.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
                    alt={cleanText(currentTrack.title)}
                    className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
                  />
                  {isPlaying && (
                    <div className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-accentCyan shadow-[0_0_6px_#fff]" />
                  )}
                </div>

                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <h4
                      onClick={openPlayerModal}
                      className="text-xs font-black text-white truncate font-outfit leading-tight cursor-pointer hover:text-accentCyan"
                    >
                      {cleanText(currentTrack.title)}
                    </h4>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddToPlaylist(currentTrack);
                      }}
                      className="p-0.5 text-slate-300 hover:text-accentCyan shrink-0"
                      title="Add to Playlist"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(currentTrack);
                      }}
                      className={`p-0.5 transition shrink-0 ${
                        isFavorite(currentTrack.id) ? 'text-red-400' : 'text-slate-300 hover:text-white'
                      }`}
                      title={isFavorite(currentTrack.id) ? 'Liked' : 'Like Track'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(currentTrack.id) ? 'fill-current text-red-400' : ''}`} />
                    </button>
                    {currentTrack.language && (
                      <span className="uppercase text-[8px] font-black px-1 py-0.2 rounded bg-accentCyan/20 text-accentCyan border border-accentCyan/40 shrink-0">
                        {currentTrack.language}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-300 truncate font-semibold leading-tight">
                    {cleanText(currentTrack.artist)}
                  </p>
                </div>
              </div>

              {/* Right: Time, Queue, Lyrics, Fullscreen, Close */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="text-[9.5px] font-mono font-bold text-slate-300 px-1.5 py-0.5 rounded bg-white/10 shrink-0">
                  <span className="text-white">{formatTime(displayTime)}</span>
                  <span className="text-slate-500 mx-0.5">/</span>
                  <span className="text-slate-400">{formatTime(duration)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQueueDrawer(!showQueueDrawer)}
                  className={`relative p-1 rounded-lg transition ${
                    showQueueDrawer ? 'text-accentCyan bg-accentCyan/20' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Queue"
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  {queue.length > 0 && (
                    <span className="absolute -top-1 -right-1 px-1 text-[7.5px] font-black bg-accentCyan text-black rounded-full shadow">
                      {queue.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={openLyricsModal}
                  className="p-1 text-slate-300 hover:text-accentCyan rounded-lg transition"
                  title="Lyrics"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={openPlayerModal}
                  className="p-1 text-slate-300 hover:text-white rounded-lg transition"
                  title="Fullscreen Player"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={closePlayer}
                  className="p-1 text-slate-400 hover:text-red-400 rounded-lg transition"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Row 2: Playback Controls (Shuffle, Prev, Rewind 10s, Hero Play/Pause, Forward 10s, Next, Loop) + Volume */}
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10 w-full">
              <div className="flex items-center justify-center gap-1.5 xs:gap-2 flex-1">
                {/* Shuffle */}
                <button
                  type="button"
                  onClick={toggleShuffle}
                  className={`p-1 rounded-lg text-xs transition ${
                    isShuffling ? 'text-accentCyan bg-accentCyan/20' : 'text-slate-300 hover:text-white'
                  }`}
                  title={isShuffling ? 'Shuffle On' : 'Shuffle Off'}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>

                {/* Prev */}
                <button
                  type="button"
                  onClick={prevTrack}
                  className="p-1 text-slate-200 hover:text-white active:scale-90 transition"
                  title="Previous Track"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                {/* Rewind 10s */}
                <button
                  type="button"
                  onClick={() => skipBackward(10)}
                  className="group relative p-1 text-slate-200 hover:text-accentCyan active:scale-90 transition flex items-center justify-center"
                  title="Rewind 10 seconds"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="absolute text-[6.5px] font-black text-accentCyan font-mono pointer-events-none">
                    10
                  </span>
                </button>

                {/* Hero Play/Pause */}
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-[0_0_12px_rgba(99,210,255,0.5)] active:scale-90 transition border border-white/30 shrink-0 mx-0.5"
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

                {/* Forward 10s */}
                <button
                  type="button"
                  onClick={() => skipForward(10)}
                  className="group relative p-1 text-slate-200 hover:text-accentCyan active:scale-90 transition flex items-center justify-center"
                  title="Forward 10 seconds"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="absolute text-[6.5px] font-black text-accentCyan font-mono pointer-events-none">
                    10
                  </span>
                </button>

                {/* Next */}
                <button
                  type="button"
                  onClick={nextTrack}
                  className="p-1 text-slate-200 hover:text-white active:scale-90 transition"
                  title="Next Track"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                {/* Loop */}
                <button
                  type="button"
                  onClick={toggleLoop}
                  className={`p-1 rounded-lg text-xs transition ${
                    isLooping !== 'none' ? 'text-accentCyan bg-accentCyan/20' : 'text-slate-300 hover:text-white'
                  }`}
                  title={`Loop: ${isLooping}`}
                >
                  {isLooping === 'track' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Volume Slider on Mobile */}
              <div className="flex items-center gap-1 shrink-0 pl-1.5 border-l border-white/10">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-slate-300 hover:text-white transition p-0.5"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-accentCyan" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-10 xs:w-14 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-accentCyan"
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              DESKTOP / TABLET BAR (>= 768px)
             ══════════════════════════════════════════════════════════════════════ */}
          <div className="hidden md:flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 gap-2 sm:gap-4">
            
            {/* 1. Track Info (Left) */}
            <div className="flex items-center gap-2.5 w-[28%] min-w-[160px] max-w-[260px] shrink-0">
              <div
                onClick={() => setIsExpanded(true)}
                className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border-2 border-white/20 shadow-xl cursor-pointer group bg-black/40"
              >
                <img
                  src={currentTrack.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
                  alt={cleanText(currentTrack.title)}
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                    isPlaying ? 'animate-spin-slow' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <h4
                    onClick={() => setIsExpanded(true)}
                    className="text-xs sm:text-sm font-black text-white truncate font-outfit cursor-pointer hover:text-accentCyan transition-colors"
                  >
                    {cleanText(currentTrack.title)}
                  </h4>

                  {/* Add to Playlist button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddToPlaylist(currentTrack);
                    }}
                    className="p-1 text-slate-300 hover:text-accentCyan hover:bg-accentCyan/15 rounded-lg transition shrink-0"
                    title="Add to Playlist"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>

                  {/* Favorite button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(currentTrack);
                    }}
                    className="p-1 text-slate-300 hover:text-red-400 hover:bg-red-500/15 rounded-lg transition shrink-0"
                    title={isFavorite(currentTrack.id) ? 'Liked' : 'Like Track'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite(currentTrack.id) ? 'fill-current text-red-400' : ''}`} />
                  </button>

                  {currentTrack.language && (
                    <span className="hidden lg:inline-block uppercase text-[9px] font-black px-1.5 py-0.2 rounded bg-accentCyan/20 text-accentCyan border border-accentCyan/40 shrink-0">
                      {currentTrack.language}
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 truncate hover:text-white font-semibold">
                  {cleanText(currentTrack.artist)}
                </p>
              </div>
            </div>

            {/* 2. Center Audio Controls */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3 flex-1">
              
              {/* Shuffle */}
              <button
                type="button"
                onClick={toggleShuffle}
                className={`p-2 rounded-xl text-xs transition-all ${
                  isShuffling
                    ? 'text-accentCyan bg-accentCyan/20 shadow-[0_0_10px_rgba(99,210,255,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title={isShuffling ? 'Shuffle On' : 'Shuffle Off'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Prev Track */}
              <button
                type="button"
                onClick={prevTrack}
                className="p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition active:scale-90"
                title="Previous Track"
              >
                <SkipBack className="w-4.5 h-4.5" />
              </button>

              {/* Rewind 10s */}
              <button
                type="button"
                onClick={() => skipBackward(10)}
                className="group relative p-2 text-slate-200 hover:text-accentCyan hover:bg-accentCyan/15 rounded-xl transition active:scale-90 flex items-center justify-center"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="w-4.5 h-4.5 transition-transform group-hover:-rotate-45" />
                <span className="absolute text-[7.5px] font-black text-accentCyan font-mono pointer-events-none">
                  10
                </span>
              </button>

              {/* Play / Pause Hero Button */}
              <button
                type="button"
                onClick={togglePlay}
                disabled={isLoading}
                className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-[0_0_20px_rgba(99,210,255,0.5)] hover:shadow-[0_0_30px_rgba(99,210,255,0.8)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 mx-1 border border-white/30"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4.5 h-4.5 fill-current" />
                ) : (
                  <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
                )}
              </button>

              {/* Forward 10s */}
              <button
                type="button"
                onClick={() => skipForward(10)}
                className="group relative p-2 text-slate-200 hover:text-accentCyan hover:bg-accentCyan/15 rounded-xl transition active:scale-90 flex items-center justify-center"
                title="Forward 10 seconds"
              >
                <RotateCw className="w-4.5 h-4.5 transition-transform group-hover:rotate-45" />
                <span className="absolute text-[7.5px] font-black text-accentCyan font-mono pointer-events-none">
                  10
                </span>
              </button>

              {/* Next Track */}
              <button
                type="button"
                onClick={nextTrack}
                className="p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition active:scale-90"
                title="Next Track"
              >
                <SkipForward className="w-4.5 h-4.5" />
              </button>

              {/* Loop */}
              <button
                type="button"
                onClick={toggleLoop}
                className={`p-2 rounded-xl text-xs transition-all ${
                  isLooping !== 'none'
                    ? 'text-accentCyan bg-accentCyan/20 shadow-[0_0_10px_rgba(99,210,255,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title={`Loop Mode: ${isLooping}`}
              >
                {isLooping === 'track' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* 3. Right Extra Controls */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 md:gap-2.5 w-[28%] min-w-[160px] max-w-[260px] shrink-0">
              
              {/* Time Indicators */}
              <div className="hidden lg:block text-[11px] font-mono text-slate-300 font-bold shrink-0">
                <span className="text-white">{formatTime(displayTime)}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-400">{formatTime(duration)}</span>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-slate-300 hover:text-white transition"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-accentCyan" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-12 sm:w-16 md:w-20 h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-accentCyan hover:bg-white/25 transition-all"
                />
              </div>

              {/* Queue Toggle */}
              <button
                type="button"
                onClick={() => setShowQueueDrawer(!showQueueDrawer)}
                className={`relative p-2 rounded-xl transition ${
                  showQueueDrawer
                    ? 'text-accentCyan bg-accentCyan/20 border border-accentCyan/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Playlist Queue"
              >
                <ListMusic className="w-4 h-4" />
                {queue.length > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-accentCyan text-black font-black text-[9px] rounded-full shadow">
                    {queue.length}
                  </span>
                )}
              </button>

              {/* Lyrics Modal */}
              <button
                type="button"
                onClick={() => openLyricsModal()}
                className="p-2 text-slate-300 hover:text-accentCyan hover:bg-accentCyan/15 rounded-xl transition"
                title="Lyrics View"
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* Fullscreen Expand */}
              <button
                type="button"
                onClick={() => openPlayerModal()}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
                title="Fullscreen Player"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={closePlayer}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/15 rounded-xl transition ml-0.5"
                title="Close / Stop Music"
              >
                <X className="w-4 h-4" />
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
