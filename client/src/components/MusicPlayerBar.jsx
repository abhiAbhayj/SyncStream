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
        className="fixed left-2 right-2 sm:left-4 sm:right-4 bottom-[68px] sm:bottom-[72px] md:bottom-3 z-40 max-w-6xl mx-auto transition-all duration-300 pointer-events-auto select-none"
      >
        <div className="relative rounded-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.95)] backdrop-blur-2xl bg-[#0e1329]/95 overflow-hidden ring-1 ring-white/10">
          
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
              MOBILE MINI-PLAYER (< 768px)
             ══════════════════════════════════════════════════════════════════════ */}
          <div className="flex md:hidden items-center justify-between gap-2 px-2.5 py-1.5 h-13.5">
            
            {/* Left: Artwork + Title & Artist */}
            <div
              onClick={openPlayerModal}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer active:opacity-75 transition-opacity"
            >
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-black/40 shadow-sm">
                <img
                  src={currentTrack.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
                />
                {isPlaying && (
                  <div className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-accentCyan shadow-[0_0_6px_#fff]" />
                )}
              </div>

              <div className="min-w-0 flex-1 pr-1">
                <p className="text-xs font-bold text-white truncate font-outfit leading-snug">
                  {cleanText(currentTrack.title)}
                </p>
                <p className="text-[10.5px] text-gray-400 truncate leading-tight font-medium">
                  {cleanText(currentTrack.artist)}
                </p>
              </div>
            </div>

            {/* Right: Clean, Un-cluttered Action Controls */}
            <div className="flex items-center gap-1 shrink-0">
              
              {/* Add to Playlist Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openAddToPlaylist(currentTrack);
                }}
                className="p-1.5 rounded-lg text-gray-300 hover:text-accentCyan active:scale-90 transition hover:bg-white/5"
                title="Add to Playlist"
              >
                <FolderPlus className="w-4 h-4" />
              </button>

              {/* Favorite Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(currentTrack);
                }}
                className={`p-1.5 rounded-lg transition active:scale-90 ${
                  isFavorite(currentTrack.id)
                    ? 'text-red-400 bg-red-500/15'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                title={isFavorite(currentTrack.id) ? 'Liked' : 'Like Track'}
              >
                <Heart className={`w-4 h-4 ${isFavorite(currentTrack.id) ? 'fill-current text-red-400' : ''}`} />
              </button>

              {/* Play / Pause Hero Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                disabled={isLoading}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-[0_0_12px_rgba(99,210,255,0.4)] active:scale-90 transition mx-0.5 shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>

              {/* Expand to Full Player Modal */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openPlayerModal();
                }}
                className="p-1.5 text-gray-300 hover:text-accentCyan active:scale-90 rounded-lg transition hover:bg-white/5"
                title="Open Full Player"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Dismiss / Close Bar */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closePlayer();
                }}
                className="p-1.5 text-gray-400 hover:text-red-400 active:scale-90 rounded-lg transition hover:bg-white/5"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

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
                className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow-xl cursor-pointer group bg-black/40"
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
                    className="text-xs sm:text-sm font-bold text-white truncate font-outfit cursor-pointer hover:text-accentCyan transition-colors"
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
                    className="p-1 text-gray-400 hover:text-accentCyan hover:bg-accentCyan/10 rounded-lg transition shrink-0"
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
                    className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0"
                    title={isFavorite(currentTrack.id) ? 'Liked' : 'Like Track'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite(currentTrack.id) ? 'fill-current text-red-400' : ''}`} />
                  </button>

                  {currentTrack.language && (
                    <span className="hidden lg:inline-block uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-accentCyan/15 text-accentCyan border border-accentCyan/30 shrink-0">
                      {currentTrack.language}
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-gray-400 truncate hover:text-gray-300 font-medium">
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
                    ? 'text-accentCyan bg-accentCyan/15 shadow-[0_0_10px_rgba(99,210,255,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={isShuffling ? 'Shuffle On' : 'Shuffle Off'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Prev Track */}
              <button
                type="button"
                onClick={prevTrack}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition active:scale-90"
                title="Previous Track"
              >
                <SkipBack className="w-4.5 h-4.5" />
              </button>

              {/* Rewind 10s */}
              <button
                type="button"
                onClick={() => skipBackward(10)}
                className="group relative p-2 text-gray-300 hover:text-accentCyan hover:bg-accentCyan/10 rounded-xl transition active:scale-90 flex items-center justify-center"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="w-4.5 h-4.5 transition-transform group-hover:-rotate-45" />
                <span className="absolute text-[7.5px] font-extrabold text-accentCyan font-mono pointer-events-none">
                  10
                </span>
              </button>

              {/* Play / Pause Hero Button */}
              <button
                type="button"
                onClick={togglePlay}
                disabled={isLoading}
                className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-[0_0_20px_rgba(99,210,255,0.4)] hover:shadow-[0_0_30px_rgba(99,210,255,0.7)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 mx-1"
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
                className="group relative p-2 text-gray-300 hover:text-accentCyan hover:bg-accentCyan/10 rounded-xl transition active:scale-90 flex items-center justify-center"
                title="Forward 10 seconds"
              >
                <RotateCw className="w-4.5 h-4.5 transition-transform group-hover:rotate-45" />
                <span className="absolute text-[7.5px] font-extrabold text-accentCyan font-mono pointer-events-none">
                  10
                </span>
              </button>

              {/* Next Track */}
              <button
                type="button"
                onClick={nextTrack}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition active:scale-90"
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
                    ? 'text-accentCyan bg-accentCyan/15 shadow-[0_0_10px_rgba(99,210,255,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={`Loop Mode: ${isLooping}`}
              >
                {isLooping === 'track' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* 3. Right Extra Controls */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 md:gap-2.5 w-[28%] min-w-[160px] max-w-[260px] shrink-0">
              
              {/* Time Indicators */}
              <div className="hidden lg:block text-[11px] font-mono text-gray-400 font-semibold shrink-0">
                <span className="text-white">{formatTime(displayTime)}</span>
                <span className="text-gray-600 mx-1">/</span>
                <span className="text-gray-500">{formatTime(duration)}</span>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 group/vol">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white transition"
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
                  className="w-12 sm:w-16 md:w-20 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accentCyan hover:bg-white/20 transition-all"
                />
              </div>

              {/* Queue Toggle */}
              <button
                type="button"
                onClick={() => setShowQueueDrawer(!showQueueDrawer)}
                className={`relative p-2 rounded-xl transition ${
                  showQueueDrawer
                    ? 'text-accentCyan bg-accentCyan/15 border border-accentCyan/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Playlist Queue"
              >
                <ListMusic className="w-4 h-4" />
                {queue.length > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-accentCyan text-black font-extrabold text-[9px] rounded-full shadow">
                    {queue.length}
                  </span>
                )}
              </button>

              {/* Lyrics Modal */}
              <button
                type="button"
                onClick={() => openLyricsModal()}
                className="p-2 text-gray-400 hover:text-accentCyan hover:bg-accentCyan/10 rounded-xl transition"
                title="Lyrics View"
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* Fullscreen Expand */}
              <button
                type="button"
                onClick={() => openPlayerModal()}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition"
                title="Fullscreen Player"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={closePlayer}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition ml-0.5"
                title="Close / Stop Music"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </aside>

      {/* Queue Drawer Popup (Desktop) */}
      {showQueueDrawer && (
        <div className="hidden md:flex fixed bottom-24 right-4 z-40 w-80 sm:w-96 max-h-[60vh] glass-panel rounded-2xl border border-white/10 bg-darkCard/95 backdrop-blur-2xl shadow-2xl p-4 flex-col gap-3 animate-slide-up">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-accentCyan" />
              <h3 className="font-bold text-sm text-white font-outfit">Playing Queue ({queue.length})</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowQueueDrawer(false)}
              className="p-1 text-gray-400 hover:text-white"
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
                      ? 'bg-accentCyan/15 border border-accentCyan/30 text-white'
                      : 'hover:bg-white/5 text-gray-300'
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
