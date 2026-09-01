import React, { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
  ChevronDown,
  ListMusic,
  FileText,
  Maximize,
  Minimize,
  X,
  Loader2,
  Sparkles,
  Music2
} from 'lucide-react';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function MusicModal() {
  const {
    currentTrack,
    queue,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    isShuffling,
    isLoading,
    isExpanded,
    setIsExpanded,
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
    playTrack,
    removeFromQueue,
    closePlayer
  } = useMusic();

  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [activeTab, setActiveTab] = useState(() => {
    // Check window flag first (set by mini-bar buttons for reliable tab targeting)
    try {
      const winTab = (typeof window !== 'undefined' && window.__musicModalTab) ? window.__musicModalTab : null;
      if (winTab) {
        window.__musicModalTab = null; // consume it
        return winTab;
      }
      return sessionStorage.getItem('syncstream_music_modal_tab') || 'player';
    } catch {
      return 'player';
    }
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Lyrics state
  const [lyricsData, setLyricsData] = useState({
    loading: false,
    has_lyrics: false,
    synced: false,
    syncedLyrics: [],
    plainLyrics: '',
    source: null
  });

  const scrubberRef = useRef(null);
  const lyricsContainerRef = useRef(null);

  // Robust cross-browser fullscreen toggle
  const toggleBrowserFullscreen = () => {
    try {
      const doc = document;
      const docEl = document.documentElement;
      const isFull = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);

      if (!isFull) {
        const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
        if (req) {
          req.call(docEl).then(() => setIsFullscreen(true)).catch(() => setIsFullscreen(true));
        } else {
          setIsFullscreen(true);
        }
      } else {
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
        if (exit) {
          exit.call(doc).then(() => setIsFullscreen(false)).catch(() => setIsFullscreen(false));
        } else {
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle:', err);
      setIsFullscreen(!isFullscreen);
    }
  };

  // Exit native browser fullscreen safely
  const exitNativeFullscreen = useCallback(() => {
    try {
      const doc = document;
      if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
        if (exit) exit.call(doc);
      }
    } catch (e) {}
  }, []);

  // Sync isExpanded changes: update activeTab when opening, exit native fullscreen when closing
  useEffect(() => {
    if (isExpanded) {
      try {
        const winTab = (typeof window !== 'undefined' && window.__musicModalTab) ? window.__musicModalTab : null;
        if (winTab) {
          window.__musicModalTab = null;
          setActiveTab(winTab);
        } else {
          const stored = sessionStorage.getItem('syncstream_music_modal_tab');
          if (stored) setActiveTab(stored);
        }
      } catch (e) {}
    } else {
      exitNativeFullscreen();
    }
  }, [isExpanded, exitNativeFullscreen]);

  // Sync fullscreen change events
  useEffect(() => {
    const handleFSChange = () => {
      const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      setIsFullscreen(isFull);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    document.addEventListener('mozfullscreenchange', handleFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
      document.removeEventListener('mozfullscreenchange', handleFSChange);
    };
  }, []);

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!currentTrack || !isExpanded) return;

    let isMounted = true;
    setLyricsData({
      loading: true,
      has_lyrics: false,
      synced: false,
      syncedLyrics: [],
      plainLyrics: '',
      source: null
    });

    axios
      .get('/api/music/lyrics', {
        params: {
          title: currentTrack.title,
          artist: currentTrack.artist,
          duration: currentTrack.duration,
          songId: currentTrack.id
        }
      })
      .then((res) => {
        if (isMounted) {
          setLyricsData({
            loading: false,
            has_lyrics: res.data?.has_lyrics || false,
            synced: res.data?.synced || false,
            syncedLyrics: res.data?.syncedLyrics || [],
            plainLyrics: res.data?.plainLyrics || '',
            source: res.data?.source || null
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setLyricsData({
            loading: false,
            has_lyrics: false,
            synced: false,
            syncedLyrics: [],
            plainLyrics: 'No lyrics available for this track.',
            source: null
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack?.id, isExpanded]);

  // Sync tab choice to sessionStorage
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    try {
      sessionStorage.setItem('syncstream_music_modal_tab', tab);
    } catch (e) {}
  };

  // Find active synced lyric index based on currentTime
  const activeLyricIndex = (lyricsData?.syncedLyrics || []).findIndex((line, i) => {
    const nextLine = lyricsData.syncedLyrics[i + 1];
    if (nextLine) {
      return currentTime >= line.time && currentTime < nextLine.time;
    }
    return currentTime >= line.time;
  });

  // Auto-scroll active lyric into view
  useEffect(() => {
    if (activeTab === 'lyrics' && lyricsContainerRef.current && activeLyricIndex !== -1) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeLyricIndex, activeTab]);

  if (!isExpanded || !currentTrack) return null;

  const displayTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;

  const calculateSeekTime = (e) => {
    if (!scrubberRef.current || duration <= 0) return 0;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (offsetX / rect.width) * duration;
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragTime(calculateSeekTime(e));
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

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#0b0b14] text-white p-3 sm:p-6 md:p-8 select-none overflow-hidden animate-fade-in">
      
      {/* ── Ambient Glowing Aurora Mesh Background ── */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-40 pointer-events-none scale-125 transition-all duration-1000"
        style={{ backgroundImage: `url(${currentTrack.image || ''})` }}
      />
      {/* Dynamic Animated Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accentPurple/25 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accentCyan/25 blur-3xl pointer-events-none animate-pulse [animation-delay:1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accentPink/15 blur-3xl pointer-events-none animate-pulse [animation-delay:0.5s]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/70 to-[#0d0d14]/30 pointer-events-none" />

      {/* ── Top Header Navigation ── */}
      <div className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full gap-2 pt-[env(safe-area-inset-top,0.5rem)]">
        
        {/* Minimize Button */}
        <button
          onClick={() => {
            exitNativeFullscreen();
            setIsExpanded(false);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-gray-200 hover:text-white transition font-bold text-xs backdrop-blur-md shrink-0 border border-white/10"
        >
          <ChevronDown className="w-4 h-4" />
          <span className="hidden sm:inline">Minimize</span>
        </button>

        {/* View Switcher Tabs (Player | Lyrics | Queue) */}
        <div className="flex items-center gap-1 bg-white/10 border border-white/15 p-1 rounded-full backdrop-blur-xl shadow-lg">
          <button
            onClick={() => handleTabChange('player')}
            className={`flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-bold transition active:scale-95 ${
              activeTab === 'player'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow-[0_0_15px_rgba(99,210,255,0.4)]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Player</span>
          </button>
          <button
            onClick={() => handleTabChange('lyrics')}
            className={`flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-bold transition active:scale-95 ${
              activeTab === 'lyrics'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow-[0_0_15px_rgba(99,210,255,0.4)]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>
          <button
            onClick={() => handleTabChange('queue')}
            className={`flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-bold transition active:scale-95 ${
              activeTab === 'queue'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow-[0_0_15px_rgba(99,210,255,0.4)]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Queue</span>
          </button>
        </div>

        {/* Fullscreen & Close Player Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleBrowserFullscreen}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition active:scale-95 border border-white/10"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              exitNativeFullscreen();
              closePlayer();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-red-500/20 active:scale-95 text-gray-200 hover:text-red-400 transition border border-white/10"
            title="Stop & Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main Stage ── */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center py-2 overflow-hidden">
        
        {/* ══════ 1. PLAYER VIEW ══════ */}
        {activeTab === 'player' && (
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 md:gap-8 w-full animate-fade-in text-center">
            
            {/* Glowing Spinning Vinyl Visual */}
            <div className="relative flex items-center justify-center shrink-0">
              <div
                className={`w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-full p-2.5 bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink shadow-[0_0_50px_rgba(99,210,255,0.35)] transition-all duration-700 ${
                  isPlaying ? 'animate-spin-slow shadow-[0_0_80px_rgba(99,210,255,0.6)]' : ''
                }`}
              >
                <div className="w-full h-full rounded-full bg-black border-2 sm:border-4 border-white/25 overflow-hidden relative flex items-center justify-center shadow-2xl">
                  {/* Vinyl Grooves */}
                  <div className="absolute inset-2 sm:inset-4 rounded-full border border-white/10 pointer-events-none" />
                  <div className="absolute inset-5 sm:inset-8 rounded-full border border-white/10 pointer-events-none" />
                  <div className="absolute inset-8 sm:inset-12 rounded-full border border-white/15 pointer-events-none" />

                  {/* Artwork Center */}
                  <div className="w-26 h-26 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-2 sm:border-4 border-black relative shadow-2xl">
                    <img
                      src={currentTrack.image || 'https://placehold.co/300x300/1e1e24/fff?text=Music'}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 m-auto w-5 h-5 rounded-full bg-darkBg border-2 border-white/60 shadow-inner" />
                  </div>
                </div>
              </div>

              {/* Live Audio Frequency Waves */}
              {isPlaying && (
                <div className="absolute -bottom-3 flex items-end gap-1 px-3 py-1 bg-black/90 backdrop-blur-md rounded-full border border-white/20 shadow-[0_0_20px_rgba(99,210,255,0.4)]">
                  <span className="w-1 h-3.5 bg-accentCyan rounded-full animate-pulse" />
                  <span className="w-1 h-6 bg-accentPurple rounded-full animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1 h-4 bg-accentPink rounded-full animate-pulse [animation-delay:0.4s]" />
                  <span className="w-1 h-5.5 bg-accentCyan rounded-full animate-pulse [animation-delay:0.1s]" />
                  <span className="w-1 h-3 bg-accentPurple rounded-full animate-pulse [animation-delay:0.3s]" />
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="space-y-1 max-w-sm sm:max-w-md px-2">
              <div className="flex items-center justify-center gap-2">
                <span className="uppercase text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-accentCyan/20 text-accentCyan border border-accentCyan/40 tracking-wider font-mono shadow-sm">
                  {currentTrack.language || 'Global'}
                </span>
                {currentTrack.year && (
                  <span className="text-[11px] text-gray-400 font-mono">&bull; {currentTrack.year}</span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-outfit text-white tracking-tight leading-snug line-clamp-2">
                {currentTrack.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 font-medium font-sans truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>
        )}

        {/* ══════ 2. LYRICS VIEW ══════ */}
        {activeTab === 'lyrics' && (
          <div className="w-full max-w-2xl h-[52vh] sm:h-[58vh] flex flex-col gap-3 animate-fade-in glass-panel rounded-2xl border border-white/20 p-4 sm:p-6 backdrop-blur-2xl bg-[#12121e]/90 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 shrink-0">
              <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                <h2 className="text-sm sm:text-base font-bold text-white font-outfit truncate flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-accentCyan shrink-0" />
                  <span className="truncate">{currentTrack.title}</span>
                </h2>
                <p className="text-[11px] text-gray-300 truncate">{currentTrack.artist}</p>
              </div>
              {lyricsData.synced ? (
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-accentCyan/20 text-accentCyan border border-accentCyan/40 font-mono shrink-0 shadow-sm">
                  Live Synced
                </span>
              ) : lyricsData.has_lyrics ? (
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-accentPurple/20 text-accentPurple border border-accentPurple/40 font-mono shrink-0 shadow-sm">
                  Plain Lyrics
                </span>
              ) : null}
            </div>

            {lyricsData.loading ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 py-8">
                <Loader2 className="w-8 h-8 text-accentCyan animate-spin" />
                <p className="text-xs font-bold text-gray-300 font-mono">Searching lyrics catalog...</p>
              </div>
            ) : lyricsData.synced && lyricsData.syncedLyrics.length > 0 ? (
              /* Synced Interactive Lyrics */
              <div
                ref={lyricsContainerRef}
                className="overflow-y-auto space-y-3.5 flex-1 pr-2 custom-scrollbar py-4"
              >
                {lyricsData.syncedLyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  return (
                    <p
                      key={`lyric-${idx}`}
                      onClick={() => seek(line.time)}
                      className={`text-sm sm:text-lg md:text-xl font-bold cursor-pointer transition-all duration-300 text-center select-none py-1.5 px-3 rounded-xl ${
                        isActive
                          ? 'text-accentCyan scale-105 font-black drop-shadow-[0_0_18px_rgba(99,210,255,0.9)] bg-white/10 border border-accentCyan/30'
                          : 'text-gray-400 hover:text-gray-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {line?.text || '♪'}
                    </p>
                  );
                })}
              </div>
            ) : lyricsData.plainLyrics && !lyricsData.plainLyrics.includes('No lyrics available') ? (
              /* Plain Text Lyrics */
              <div className="overflow-y-auto space-y-2 flex-1 pr-2 custom-scrollbar py-3 text-center">
                <pre className="text-xs sm:text-sm font-sans text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                  {lyricsData.plainLyrics}
                </pre>
              </div>
            ) : (
              /* High-Contrast Beautiful Fallback */
              <div className="flex flex-col items-center justify-center flex-1 text-center p-4 space-y-3 my-auto">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20 shadow-lg shrink-0">
                  <img
                    src={currentTrack.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-sm font-bold text-white font-outfit">{currentTrack.title}</h3>
                  <p className="text-xs text-gray-400">{currentTrack.artist}</p>
                  <p className="text-[11px] text-accentCyan/80 font-mono pt-1">
                    ♪ Synchronized lyrics are not available for this track yet. Enjoy the music!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════ 3. QUEUE VIEW ══════ */}
        {activeTab === 'queue' && (
          <div className="w-full max-w-2xl bg-darkCard/85 border border-white/15 rounded-2xl p-4 sm:p-6 backdrop-blur-2xl h-[52vh] sm:h-[58vh] flex flex-col gap-3 animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 shrink-0">
              <h2 className="text-sm sm:text-base font-bold text-white font-outfit flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-accentCyan" />
                <span>Playing Queue ({queue.length})</span>
              </h2>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1 custom-scrollbar">
              {queue.map((t, idx) => {
                const isCurrent = t.id === currentTrack.id;
                return (
                  <div
                    key={`${t.id}-${idx}`}
                    className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl transition ${
                      isCurrent
                        ? 'bg-accentCyan/15 border border-accentCyan/30 text-white shadow-[0_0_12px_rgba(99,210,255,0.2)]'
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <div
                      onClick={() => playTrack(t, queue)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={t.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
                        alt={t.title}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0 shadow-md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold text-xs truncate ${isCurrent ? 'text-accentCyan' : 'text-white'}`}>
                          {t.title}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">{t.artist}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-gray-500">{formatTime(t.duration)}</span>
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-1 text-gray-400 hover:text-red-400 active:scale-90"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── Bottom Controls & Timeline Scrubber ── */}
      <div className="relative z-10 max-w-2xl mx-auto w-full space-y-3 pb-[env(safe-area-inset-bottom,0.5rem)]">
        
        {/* Timeline Scrubber */}
        <div className="space-y-1">
          <div
            ref={scrubberRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            className="relative w-full h-2.5 sm:h-3 rounded-full bg-white/20 cursor-pointer overflow-visible group/scrubber"
          >
            <div
              className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-accentPurple via-accentCyan to-accentPink shadow-[0_0_15px_rgba(99,210,255,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-white shadow-[0_0_12px_#fff]"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-gray-300 px-0.5">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Master Control Buttons (Responsive Row) */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
          
          {/* Shuffle Toggle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition active:scale-90 ${
              isShuffling ? 'text-accentCyan bg-accentCyan/20 shadow-[0_0_12px_rgba(99,210,255,0.4)]' : 'text-gray-300 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Previous Track */}
          <button
            onClick={prevTrack}
            className="p-2 sm:p-2.5 text-gray-200 hover:text-white rounded-full hover:bg-white/10 transition active:scale-90"
            title="Previous Track"
          >
            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* -10s Backward Jump */}
          <button
            onClick={() => skipBackward(10)}
            className="relative p-2 sm:p-2.5 text-gray-200 hover:text-accentCyan rounded-full hover:bg-accentCyan/10 transition active:scale-90 flex items-center justify-center group"
            title="Rewind 10s"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-rotate-45" />
            <span className="absolute text-[7px] sm:text-[8px] font-extrabold text-accentCyan font-mono pointer-events-none">10</span>
          </button>

          {/* Master Play / Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-[0_0_35px_rgba(99,210,255,0.6)] hover:shadow-[0_0_50px_rgba(99,210,255,0.9)] active:scale-95 transition-all disabled:opacity-50"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
            )}
          </button>

          {/* +10s Forward Jump */}
          <button
            onClick={() => skipForward(10)}
            className="relative p-2 sm:p-2.5 text-gray-200 hover:text-accentCyan rounded-full hover:bg-accentCyan/10 transition active:scale-90 flex items-center justify-center group"
            title="Forward 10s"
          >
            <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-45" />
            <span className="absolute text-[7px] sm:text-[8px] font-extrabold text-accentCyan font-mono pointer-events-none">10</span>
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="p-2 sm:p-2.5 text-gray-200 hover:text-white rounded-full hover:bg-white/10 transition active:scale-90"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Loop Toggle */}
          <button
            onClick={toggleLoop}
            className={`p-2 rounded-full transition active:scale-90 ${
              isLooping !== 'none' ? 'text-accentCyan bg-accentCyan/20 shadow-[0_0_12px_rgba(99,210,255,0.4)]' : 'text-gray-300 hover:text-white'
            }`}
            title={`Loop: ${isLooping}`}
          >
            {isLooping === 'track' ? <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        {/* Volume Slider (Hidden on small mobile screens, available on tablet/desktop) */}
        <div className="hidden sm:flex items-center justify-center gap-3 pt-1">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white">
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
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
            className="w-32 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accentCyan"
          />
        </div>

      </div>

    </div>
  );
}
