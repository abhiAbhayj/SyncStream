import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMusic } from '../context/MusicContext';
import EqualizerBars from './EqualizerBars';
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
  Minus,
  Plus,
  Maximize2,
  ListMusic,
  FileText,
  Heart,
  FolderPlus,
  X
} from 'lucide-react';

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

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
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
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
  const [rippleTrigger, setRippleTrigger] = useState(0);
  const [flyingCovers, setFlyingCovers] = useState([]);
  const [discPulse, setDiscPulse] = useState(false);
  const progressBarRef = useRef(null);
  const flyTimersRef = useRef([]);

  // Flying Cover-Art Arc Listener (#6)
  useEffect(() => {
    const handleFlyCover = (e) => {
      const { src, fromRect } = e.detail || {};
      if (!src) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const startX = fromRect ? fromRect.left + fromRect.width / 2 - 24 : vw / 2 - 24;
      const startY = fromRect ? fromRect.top + fromRect.height / 2 - 24 : vh / 2 - 24;
      const isMobile = vw < 640;
      const targetX = isMobile ? 30 : Math.max(40, Math.min(vw * 0.14, 180));
      const targetY = isMobile ? vh - 96 : vh - 48;
      const uid = `${Date.now()}-${Math.random()}`;

      setFlyingCovers((prev) => [
        ...prev.slice(-4),
        { id: uid, src, startX, startY, dx: targetX - startX, dy: targetY - startY, active: false }
      ]);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlyingCovers((prev) => prev.map((f) => (f.id === uid ? { ...f, active: true } : f)));
        });
      });

      const arrivalTimer = setTimeout(() => {
        setDiscPulse(true);
        setTimeout(() => setDiscPulse(false), 550);
        setFlyingCovers((prev) => prev.filter((f) => f.id !== uid));
      }, 540);
      flyTimersRef.current.push(arrivalTimer);
    };

    window.addEventListener('syncstream:fly-cover', handleFlyCover);
    return () => {
      window.removeEventListener('syncstream:fly-cover', handleFlyCover);
      flyTimersRef.current.forEach(clearTimeout);
    };
  }, []);

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

  const flyingOverlay = flyingCovers.length > 0 ? (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-[140] overflow-hidden">
      {flyingCovers.map((fly) => (
        <div
          key={fly.id}
          style={{
            left: `${fly.startX}px`,
            top: `${fly.startY}px`,
            transform: fly.active
              ? `translate3d(${fly.dx}px, ${fly.dy}px, 0) scale(0.42) rotate(14deg)`
              : 'translate3d(0, -18px, 0) scale(1.08) rotate(-4deg)',
            opacity: fly.active ? 0.18 : 1,
            transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 520ms ease-out'
          }}
          className="fixed w-12 h-12 rounded-xl overflow-hidden border-2 border-accentCyan shadow-[0_0_24px_rgba(var(--accent-cyan),0.75)] bg-darkBg"
        >
          <img
            src={fly.src}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
          />
        </div>
      ))}
    </div>
  ) : null;

  // ALL hooks are above this line. Conditional returns are safe below.
  if (!currentTrack || isExpanded) return flyingOverlay;

  const displayTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;

  const trackTitle = cleanText(currentTrack.title);
  const trackArtist = cleanArtist(currentTrack.artist, currentTrack);
  const isLongTitleMobile = trackTitle.length > 15;
  const isLongTitleDesktop = trackTitle.length > 17;
  const isLongArtist = trackArtist.length > 18;

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

  const handleTogglePlayWithRipple = () => {
    setRippleTrigger((n) => n + 1);
    togglePlay();
  };

  return (
    <>
      {flyingOverlay}
      {/* Floating Music Player Bar */}
      <aside
        aria-label="Floating Music Player"
        className="fixed left-2 right-2 sm:left-4 sm:right-4 bottom-[calc(3.85rem+env(safe-area-inset-bottom,0px))] md:bottom-3 z-40 max-w-5xl mx-auto transition-all duration-300 pointer-events-auto select-none"
      >
        <div className="relative rounded-xl sm:rounded-2xl border border-white/20 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl bg-[#0e1329]/95 overflow-visible">

          {/* Top Edge Neon Progress Bar */}
          <div
            ref={progressBarRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onMouseMove={handleProgressBarHover}
            onMouseLeave={() => setHoverPosition(null)}
            className="relative w-full h-1 sm:h-1.5 bg-white/10 cursor-pointer overflow-visible group/bar transition-all rounded-t-xl sm:rounded-t-2xl"
          >
            <div
              className="absolute top-0 bottom-0 left-0 rounded-tl-xl sm:rounded-tl-2xl bg-gradient-to-r from-accentCyan via-accentPurple to-accentPink shadow-[0_0_8px_rgba(var(--accent-cyan),0.8)]"
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
          <div className="flex sm:hidden flex-col gap-1 px-2 xs:px-2.5 py-1.5 w-full">
            {/* Row 1: Spinning Vinyl + Kinetic Marquee Metadata + Timestamp / Close */}
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                {/* Circular Spinning Vinyl Record (Mobile) */}
                <div
                  onClick={openPlayerModal}
                  className={`relative w-8 h-8 xs:w-9 xs:h-9 rounded-full shrink-0 p-[3px] vinyl-grooves border cursor-pointer group transition-shadow duration-500 ${
                    isPlaying
                      ? 'border-accentCyan/80 shadow-[0_0_12px_rgba(var(--accent-cyan),0.5)]'
                      : 'border-white/25 shadow-md'
                  } ${discPulse ? 'animate-disc-pulse' : ''}`}
                  title="Tap to open full player"
                >
                  {/* Vinyl sheen overlay */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none opacity-35"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.22) 45deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.22) 225deg, transparent 270deg)'
                    }}
                  />
                  <div
                    className="relative w-full h-full rounded-full overflow-hidden animate-spin-slow"
                    style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                  >
                    <img
                      src={currentTrack.image || FALLBACK_COVER}
                      alt={trackTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
                    />
                    {/* Spindle Hole */}
                    <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#090d1c] border border-white/80 shadow-inner" />
                  </div>
                </div>

                {/* Title (Kinetic Marquee if long) + Equalizer + Artist */}
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-center gap-1 min-w-0">
                    {isPlaying && (
                      <EqualizerBars isPlaying={true} size="sm" bars={3} className="shrink-0 mr-0.5" />
                    )}
                    {isLongTitleMobile ? (
                      <div
                        onClick={openPlayerModal}
                        className="marquee-mask min-w-0 flex-1 cursor-pointer"
                        title={trackTitle}
                      >
                        <div className="animate-kinetic-marquee text-[11px] xs:text-xs font-bold text-white font-outfit hover:text-accentCyan transition-colors leading-tight">
                          <span className="pr-8">{trackTitle}</span>
                          <span aria-hidden="true" className="pr-8 opacity-90">{trackTitle}</span>
                        </div>
                      </div>
                    ) : (
                      <h4
                        onClick={openPlayerModal}
                        className="text-[11px] xs:text-xs font-bold text-white truncate font-outfit cursor-pointer hover:text-accentCyan transition-colors leading-tight"
                        title={trackTitle}
                      >
                        {trackTitle}
                      </h4>
                    )}
                    <span className="hidden xs:inline-block uppercase text-[7.5px] font-black px-1.5 py-0.5 rounded bg-accentCyan/20 text-accentCyan border border-accentCyan/40 shrink-0">
                      {currentTrack.language || currentTrack.category || 'GLOBAL'}
                    </span>
                  </div>

                  {isLongArtist ? (
                    <div className="marquee-mask min-w-0">
                      <div className="animate-kinetic-marquee text-[9.5px] text-slate-300 font-medium leading-tight">
                        <span className="pr-8">{trackArtist}</span>
                        <span aria-hidden="true" className="pr-8 opacity-90">{trackArtist}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[9.5px] text-slate-300 font-medium truncate leading-tight">
                      {trackArtist}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Timestamp, Lyrics, Close */}
              <div className="flex items-center gap-0.5 xs:gap-1 shrink-0">
                <div className="text-[8px] xs:text-[8.5px] font-mono font-medium text-slate-300 px-1 xs:px-1.5 py-0.5 rounded bg-white/10 border border-white/15 shrink-0">
                  <span className="text-white">{formatTime(displayTime)}</span>
                  <span className="text-slate-400 mx-0.5">/</span>
                  <span className="text-slate-300">{formatTime(duration)}</span>
                </div>

                <button
                  type="button"
                  onClick={openLyricsModal}
                  className="p-1 text-slate-300 hover:text-accentCyan hover:bg-white/10 rounded-md transition active:scale-90"
                  title="Lyrics"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={closePlayer}
                  className="p-1 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-md transition active:scale-90"
                  title="Close / Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Row 2: Library/Fav + Centered 5 Controls + Volume */}
            <div className="flex items-center justify-between gap-0.5 xs:gap-1 pt-0.5 pb-0.5">
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openAddToPlaylist(currentTrack)}
                  className="p-1 text-slate-300 hover:text-accentCyan hover:bg-white/10 rounded-md transition active:scale-90"
                  title="Add to Playlist / Library"
                >
                  <FolderPlus className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(currentTrack)}
                  className={`p-1 rounded-md transition active:scale-90 ${
                    isFavorite(currentTrack.id)
                      ? 'text-red-400'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={isFavorite(currentTrack.id) ? 'Liked' : 'Add to Favorites'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite(currentTrack.id) ? 'fill-current text-red-500' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-center gap-0.5 xs:gap-2">
                <button
                  type="button"
                  onClick={prevTrack}
                  className="p-1 text-slate-300 hover:text-white rounded-lg transition active:scale-90"
                  title="Previous Track"
                >
                  <SkipBack className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => skipBackward(10)}
                  className="group relative p-1 text-slate-300 hover:text-accentCyan rounded-lg transition active:scale-90 flex items-center justify-center"
                  title="Rewind 10 Seconds"
                >
                  <RotateCcw className="w-3.5 h-3.5 xs:w-4 xs:h-4 transition-transform group-hover:-rotate-45" />
                  <span className="absolute text-[6px] font-black text-accentCyan font-mono pointer-events-none">
                    10
                  </span>
                </button>

                {/* Play/Pause with Shockwave Ripple */}
                <button
                  type="button"
                  onClick={handleTogglePlayWithRipple}
                  disabled={isLoading}
                  className="relative overflow-visible w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 mx-0.5 border border-white/30 shrink-0"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {rippleTrigger > 0 && (
                    <span
                      key={rippleTrigger}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full border-2 border-accentCyan animate-shockwave pointer-events-none"
                    />
                  )}
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
                  title="Forward 10 Seconds"
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
                  title="Next Track"
                >
                  <SkipForward className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                </button>
              </div>

              <div className="flex items-center gap-0.5 xs:gap-1 shrink-0">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1 text-slate-300 hover:text-accentCyan rounded-md transition active:scale-90"
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
                <button
                  type="button"
                  onClick={() => {
                    const base = isMuted ? 0 : volume;
                    const next = Math.max(0, Math.round((base - 0.1) * 100) / 100);
                    if (isMuted && next > 0) toggleMute();
                    setVolume(next);
                  }}
                  className="p-0.5 text-slate-300 hover:text-accentCyan hover:bg-white/10 rounded transition active:scale-90"
                  title="Decrease Volume"
                  aria-label="Decrease volume"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    if (isMuted) toggleMute();
                    setVolume(parseFloat(e.target.value));
                  }}
                  aria-label="Volume"
                  className="w-9 xs:w-14 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accentCyan"
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const base = isMuted ? 0 : volume;
                    const next = Math.min(1, Math.round((base + 0.1) * 100) / 100);
                    if (isMuted) toggleMute();
                    setVolume(next);
                  }}
                  className="p-0.5 text-slate-300 hover:text-accentCyan hover:bg-white/10 rounded transition active:scale-90"
                  title="Increase Volume"
                  aria-label="Increase volume"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              2. TABLET & DESKTOP VIEW (>= sm / >= 640px) — Studio Row Layout
             ══════════════════════════════════════════════════════════════════════ */}
          <div className="hidden sm:flex items-center justify-between gap-2 md:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 w-full">
            {/* 1. Track Info & Vinyl Disc (Left) */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 overflow-hidden">
              {/* Circular Spinning Vinyl Record (Desktop) */}
              <div
                onClick={openPlayerModal}
                className={`relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full shrink-0 p-[4px] vinyl-grooves border cursor-pointer group transition-shadow duration-500 ${
                  isPlaying
                    ? 'border-accentCyan/80 shadow-[0_0_18px_rgba(var(--accent-cyan),0.45)]'
                    : 'border-white/25 shadow-md'
                } ${discPulse ? 'animate-disc-pulse' : ''}`}
                title="Tap to open full player"
              >
                {/* Vinyl sheen overlay */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-35"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.22) 45deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.22) 225deg, transparent 270deg)'
                  }}
                />
                {/* Rotating center disc */}
                <div
                  className="relative w-full h-full rounded-full overflow-hidden border border-white/30 animate-spin-slow"
                  style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                >
                  <img
                    src={currentTrack.image || FALLBACK_COVER}
                    alt={trackTitle}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
                  />
                  {/* Center Spindle */}
                  <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-[#0a0d1a] border border-white/85 shadow-inner flex items-center justify-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-white/50" />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
              </div>

              {/* Title + Equalizer + Kinetic Marquee + Artist */}
              <div className="min-w-0 flex-1 overflow-hidden pr-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  {isPlaying && (
                    <EqualizerBars isPlaying={true} size="sm" bars={4} className="shrink-0" />
                  )}
                  {isLongTitleDesktop ? (
                    <div
                      onClick={openPlayerModal}
                      className="marquee-mask min-w-0 flex-1 cursor-pointer"
                      title={trackTitle}
                    >
                      <div className="animate-kinetic-marquee text-xs sm:text-[13px] md:text-sm font-bold text-white font-outfit hover:text-accentCyan transition-colors leading-tight">
                        <span className="pr-10">{trackTitle}</span>
                        <span aria-hidden="true" className="pr-10 opacity-90">{trackTitle}</span>
                      </div>
                    </div>
                  ) : (
                    <h4
                      onClick={openPlayerModal}
                      className="text-xs sm:text-[13px] md:text-sm font-bold text-white truncate font-outfit cursor-pointer hover:text-accentCyan transition-colors leading-tight"
                      title={trackTitle}
                    >
                      {trackTitle}
                    </h4>
                  )}
                  <span className="uppercase text-[7.5px] sm:text-[8px] md:text-[8.5px] font-black px-1.5 py-0.5 rounded-md bg-accentCyan/20 text-accentCyan border border-accentCyan/40 shrink-0">
                    {currentTrack.language || currentTrack.category || 'GLOBAL'}
                  </span>
                </div>

                {isLongArtist ? (
                  <div className="marquee-mask min-w-0">
                    <div className="animate-kinetic-marquee text-[10px] sm:text-[11px] md:text-xs text-slate-300 font-medium leading-tight hover:text-white transition-colors">
                      <span className="pr-10">{trackArtist}</span>
                      <span aria-hidden="true" className="pr-10 opacity-90">{trackArtist}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] sm:text-[11px] md:text-xs text-slate-300 truncate font-medium leading-tight hover:text-white transition-colors">
                    {trackArtist}
                  </p>
                )}
              </div>

              {/* Add to Playlist & Favorite Heart on Tablet/Desktop */}
              <div className="flex items-center gap-0.5 shrink-0 pl-1 border-l border-white/10">
                <button
                  type="button"
                  onClick={() => openAddToPlaylist(currentTrack)}
                  className="p-1.5 text-slate-300 hover:text-accentCyan hover:bg-white/10 rounded-lg transition active:scale-90"
                  title="Add to Playlist / Library"
                >
                  <FolderPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(currentTrack)}
                  className={`p-1.5 rounded-lg transition active:scale-90 ${
                    isFavorite(currentTrack.id)
                      ? 'text-red-400'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={isFavorite(currentTrack.id) ? 'Liked' : 'Add to Favorites'}
                >
                  <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite(currentTrack.id) ? 'fill-current text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* 2. Center Playback Controls */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
              <button
                type="button"
                onClick={prevTrack}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition active:scale-90"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </button>

              <button
                type="button"
                onClick={() => skipBackward(10)}
                className="group relative p-1.5 text-slate-300 hover:text-accentCyan hover:bg-accentCyan/15 rounded-lg transition active:scale-90 flex items-center justify-center"
                title="Rewind 10 Seconds"
              >
                <RotateCcw className="w-4 h-4 md:w-[18px] md:h-[18px] transition-transform group-hover:-rotate-45" />
                <span className="absolute text-[7px] font-black text-accentCyan font-mono pointer-events-none">
                  10
                </span>
              </button>

              {/* Play/Pause with Shockwave Ripple */}
              <button
                type="button"
                onClick={handleTogglePlayWithRipple}
                disabled={isLoading}
                className="relative overflow-visible w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-[0_0_14px_rgba(var(--accent-cyan),0.5)] hover:shadow-[0_0_22px_rgba(var(--accent-cyan),0.8)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 mx-0.5 sm:mx-1 border border-white/30 shrink-0"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {rippleTrigger > 0 && (
                  <span
                    key={rippleTrigger}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border-2 border-accentCyan animate-shockwave pointer-events-none"
                  />
                )}
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
                title="Forward 10 Seconds"
              >
                <RotateCw className="w-4 h-4 md:w-[18px] md:h-[18px] transition-transform group-hover:rotate-45" />
                <span className="absolute text-[7px] font-black text-accentCyan font-mono pointer-events-none">
                  10
                </span>
              </button>

              <button
                type="button"
                onClick={nextTrack}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition active:scale-90"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </button>
            </div>

            {/* 3. Right Extra Controls & Volume */}
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
                title="Lyrics"
              >
                <FileText className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-1 pl-1 border-l border-white/10">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 text-slate-300 hover:text-accentCyan rounded-md transition active:scale-90"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    if (isMuted) toggleMute();
                    setVolume(parseFloat(e.target.value));
                  }}
                  className="w-14 sm:w-16 md:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accentCyan"
                  title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
              </div>

              <button
                type="button"
                onClick={closePlayer}
                className="p-1.5 md:p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/15 rounded-lg transition active:scale-90"
                title="Close / Dismiss"
              >
                <X className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Queue Drawer Popup (Desktop & Mobile) */}
      {showQueueDrawer && (
        <div className="fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom,0px))] md:bottom-24 left-2 right-2 sm:left-auto sm:right-4 z-50 w-auto sm:w-96 max-h-[60vh] rounded-3xl border-2 border-white/20 bg-[#141a33]/98 backdrop-blur-2xl shadow-2xl p-4 flex flex-col gap-3 animate-slide-up">
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
                      src={track.image || FALLBACK_COVER}
                      alt={track.title}
                      className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
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
