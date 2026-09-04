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
  Disc3,
  FileText,
  X
} from 'lucide-react';

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
    removeFromQueue,
    playTrack,
    closePlayer
  } = useMusic();

  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(null);
  const progressBarRef = useRef(null);

  // If no track is loaded or full screen modal is open, keep bar completely unmounted
  if (!currentTrack || isExpanded) return null;

  const displayTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;

  // Handle Scrubbing (Mouse & Touch Drag)
  const calculateSeekTime = (e) => {
    if (!progressBarRef.current || duration <= 0) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (offsetX / rect.width) * duration;
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const target = calculateSeekTime(e);
    setDragTime(target);
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setDragTime(calculateSeekTime(e));
    }
  }, [isDragging, duration]);

  const handleMouseUp = useCallback((e) => {
    if (isDragging) {
      const target = calculateSeekTime(e);
      seek(target);
      setIsDragging(false);
    }
  }, [isDragging, seek]);

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
      {/* ── Floating Music Bar ── */}
      <aside
        aria-label="Floating Music Player"
        className="fixed left-0 right-0 z-40 px-2 sm:px-4 bottom-[52px] md:bottom-0 max-w-7xl mx-auto transition-all duration-300 pointer-events-auto select-none"
      >
        <div className="relative rounded-2xl md:rounded-t-2xl md:rounded-b-none border border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl bg-darkCard/95 md:bg-darkCard/90 overflow-hidden">
          
          {/* Top Edge Neon Progress Bar */}
          <div
            ref={progressBarRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onMouseMove={handleProgressBarHover}
            onMouseLeave={() => setHoverPosition(null)}
            className="relative w-full h-1.5 md:h-2 bg-white/10 cursor-pointer overflow-visible group/bar"
          >
            {/* Active Progress Gradient Fill */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-accentPurple via-accentCyan to-accentPink shadow-[0_0_8px_rgba(99,210,255,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Scrubber Knob (Desktop hover) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-white shadow-[0_0_8px_#fff] opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />
            {/* Hover Tooltip (Desktop) */}
            {hoverPosition && (
              <div
                className="hidden md:block absolute -top-7 -translate-x-1/2 bg-black/95 border border-white/20 text-[10px] font-mono font-bold text-accentCyan px-1.5 py-0.5 rounded shadow-xl pointer-events-none"
                style={{ left: `${hoverPosition.percent}%` }}
              >
                {hoverPosition.time}
              </div>
            )}
          </div>

          {/* ══════ MOBILE SLEEK MINI-PLAYER (< 768px) ══════ */}
          <div className="flex md:hidden items-center justify-between gap-2 px-2.5 py-1.5 h-13">
            
            {/* Left: Artwork + Track Title (Tap opens full-screen player modal) */}
            <div
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer active:opacity-75 transition-opacity"
            >
              <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/15 bg-black/40 shadow-sm">
                <img
                  src={currentTrack.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
                />
                {isPlaying && (
                  <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-accentCyan shadow-[0_0_4px_#fff]" />
                )}
              </div>

              <div className="min-w-0 flex-1 pr-1">
                <p className="text-xs font-bold text-white truncate font-outfit leading-snug">
                  {currentTrack.title}
                </p>
                <p className="text-[10px] text-gray-400 truncate leading-tight font-medium">
                  {currentTrack.artist}
                </p>
              </div>
            </div>

            {/* Right: Clean, un-crowded touch buttons */}
            <div className="flex items-center gap-0.5 shrink-0">
              
              {/* -10s Jump */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skipBackward(10);
                }}
                className="p-1.5 text-gray-300 active:text-accentCyan active:scale-90 rounded-lg transition relative flex items-center justify-center"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="absolute text-[6.5px] font-extrabold text-accentCyan font-mono pointer-events-none">10</span>
              </button>

              {/* Glowing Play / Pause Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                disabled={isLoading}
                className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-accentCyan to-accentPurple text-white flex items-center justify-center shadow-[0_0_12px_rgba(99,210,255,0.4)] active:scale-90 transition mx-0.5"
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

              {/* +10s Jump */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skipForward(10);
                }}
                className="p-1.5 text-gray-300 active:text-accentCyan active:scale-90 rounded-lg transition relative flex items-center justify-center"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
                <span className="absolute text-[6.5px] font-extrabold text-accentCyan font-mono pointer-events-none">10</span>
              </button>

              {/* Fullscreen Expand Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    window.__musicModalTab = 'player';
                    sessionStorage.setItem('syncstream_music_modal_tab', 'player');
                  } catch (e2) {}
                  setIsExpanded(true);
                }}
                className="p-1.5 text-gray-300 hover:text-accentCyan active:scale-90 rounded-lg transition"
                title="Expand Fullscreen Player"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closePlayer();
                }}
                className="p-1.5 text-gray-400 active:text-red-400 rounded-lg transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ══════ DESKTOP BAR (>= 768px) ══════ */}
          <div className="hidden md:flex flex-col gap-2 p-3 sm:p-4">
            
            {/* Timestamps */}
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 font-semibold px-0.5">
              <span>{formatTime(displayTime)}</span>
              <span className="text-gray-500">{formatTime(duration)}</span>
            </div>

            {/* Controls & Track Info Row */}
            <div className="flex items-center justify-between gap-4">
              
              {/* 1. Track Info (Left) */}
              <div className="flex items-center gap-3 min-w-0 max-w-[28%] shrink-0">
                <div
                  onClick={() => setIsExpanded(true)}
                  className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow-xl cursor-pointer group"
                >
                  <img
                    src={currentTrack.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
                    alt={currentTrack.title}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                      isPlaying ? 'animate-spin-slow' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4
                      onClick={() => setIsExpanded(true)}
                      className="text-sm font-bold text-white truncate font-outfit cursor-pointer hover:text-accentCyan transition-colors"
                    >
                      {currentTrack.title}
                    </h4>
                    {currentTrack.language && (
                      <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-accentCyan/15 text-accentCyan border border-accentCyan/30">
                        {currentTrack.language}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate hover:text-gray-300 font-medium">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>

              {/* 2. Center Audio Controls */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 flex-1">
                
                {/* Shuffle */}
                <button
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

                {/* Previous Track */}
                <button
                  onClick={prevTrack}
                  className="p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition active:scale-90"
                  title="Previous Song"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* 10s Backward Jump */}
                <button
                  onClick={() => skipBackward(10)}
                  className="group relative p-2 text-gray-300 hover:text-accentCyan hover:bg-accentCyan/10 rounded-xl transition active:scale-90 flex items-center justify-center"
                  title="Rewind 10 seconds"
                >
                  <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-45" />
                  <span className="absolute text-[8px] font-extrabold text-accentCyan font-mono pointer-events-none">
                    10
                  </span>
                </button>

                {/* Main Play / Pause Button */}
                <button
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-[0_0_25px_rgba(99,210,255,0.4)] hover:shadow-[0_0_35px_rgba(99,210,255,0.7)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* 10s Forward Jump */}
                <button
                  onClick={() => skipForward(10)}
                  className="group relative p-2 text-gray-300 hover:text-accentCyan hover:bg-accentCyan/10 rounded-xl transition active:scale-90 flex items-center justify-center"
                  title="Forward 10 seconds"
                >
                  <RotateCw className="w-5 h-5 transition-transform group-hover:rotate-45" />
                  <span className="absolute text-[8px] font-extrabold text-accentCyan font-mono pointer-events-none">
                    10
                  </span>
                </button>

                {/* Next Track */}
                <button
                  onClick={nextTrack}
                  className="p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition active:scale-90"
                  title="Next Song"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Loop Toggle */}
                <button
                  onClick={toggleLoop}
                  className={`p-2 rounded-xl text-xs transition-all ${
                    isLooping !== 'none'
                      ? 'text-accentCyan bg-accentCyan/15 shadow-[0_0_10px_rgba(99,210,255,0.3)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Loop: ${isLooping}`}
                >
                  {isLooping === 'track' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>
              </div>

              {/* 3. Right Extra Controls (Volume, Queue, Lyrics, Fullscreen, Close) */}
              <div className="flex items-center justify-end gap-2 min-w-0 max-w-[28%] shrink-0">
                
                {/* Volume Slider */}
                <div className="flex items-center gap-1.5 group/vol">
                  <button
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
                    className="w-16 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accentCyan hover:bg-white/20 transition-all"
                  />
                </div>

                {/* Queue Drawer Toggle */}
                <button
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

                {/* Lyrics Button */}
                <button
                  onClick={() => {
                    try {
                      window.__musicModalTab = 'lyrics';
                      sessionStorage.setItem('syncstream_music_modal_tab', 'lyrics');
                    } catch (e) {}
                    setIsExpanded(true);
                  }}
                  className="p-2 text-gray-400 hover:text-accentCyan hover:bg-accentCyan/10 rounded-xl transition"
                  title="Lyrics View"
                >
                  <FileText className="w-4 h-4" />
                </button>

                {/* Fullscreen Expand */}
                <button
                  onClick={() => {
                    try {
                      window.__musicModalTab = 'player';
                      sessionStorage.setItem('syncstream_music_modal_tab', 'player');
                    } catch (e) {}
                    setIsExpanded(true);
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition"
                  title="Fullscreen Player"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Close Player */}
                <button
                  onClick={closePlayer}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition ml-0.5"
                  title="Close / Stop Music"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </aside>

      {/* ── Queue Drawer Popup (Desktop) ── */}
      {showQueueDrawer && (
        <div className="hidden md:flex fixed bottom-28 right-4 z-40 w-80 sm:w-96 max-h-[60vh] glass-panel rounded-2xl border border-white/10 bg-darkCard/95 backdrop-blur-2xl shadow-2xl p-4 flex-col gap-3 animate-slide-up">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-accentCyan" />
              <h3 className="font-bold text-sm text-white font-outfit">Playing Queue ({queue.length})</h3>
            </div>
            <button
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
