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
  Repeat,
  Repeat1,
  Shuffle,
  ChevronDown,
  ListMusic,
  FileText,
  X,
  Loader2,
  Music2,
  Disc3,
  Image as ImageIcon
} from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

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
  const [viewStyle, setViewStyle] = useState('poster');
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const winTab = (typeof window !== 'undefined' && window.__musicModalTab) ? window.__musicModalTab : null;
      if (winTab && ['player', 'lyrics', 'queue'].includes(winTab)) {
        window.__musicModalTab = null;
        return winTab;
      }
      const stored = sessionStorage.getItem('syncstream_music_modal_tab');
      return (stored && ['player', 'lyrics', 'queue'].includes(stored)) ? stored : 'player';
    } catch {
      return 'player';
    }
  });

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

  // Guarantee validTab is always player, lyrics, or queue
  const currentTab = ['player', 'lyrics', 'queue'].includes(activeTab) ? activeTab : 'player';

  // Sync tab when modal opens
  useEffect(() => {
    if (isExpanded) {
      try {
        const winTab = (typeof window !== 'undefined' && window.__musicModalTab) ? window.__musicModalTab : null;
        if (winTab && ['player', 'lyrics', 'queue'].includes(winTab)) {
          window.__musicModalTab = null;
          setActiveTab(winTab);
        } else {
          const stored = sessionStorage.getItem('syncstream_music_modal_tab');
          if (stored && ['player', 'lyrics', 'queue'].includes(stored)) {
            setActiveTab(stored);
          }
        }
      } catch (e) {}
    }
  }, [isExpanded]);

  // Fetch Lyrics when currentTrack changes
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    try {
      sessionStorage.setItem('syncstream_music_modal_tab', tab);
    } catch (e) {}
  };

  const activeLyricIndex = (lyricsData?.syncedLyrics || []).findIndex((line, i) => {
    const nextLine = lyricsData.syncedLyrics[i + 1];
    if (nextLine) {
      return currentTime >= line.time && currentTime < nextLine.time;
    }
    return currentTime >= line.time;
  });

  useEffect(() => {
    if (currentTab === 'lyrics' && lyricsContainerRef.current && activeLyricIndex !== -1) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeLyricIndex, currentTab]);

  const handleCloseModal = () => {
    setIsExpanded(false);
    closePlayer();
  };

  const handleMinimizeModal = () => {
    setIsExpanded(false);
  };

  if (!isExpanded || !currentTrack) return null;

  const displayTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;
  const trackImageUrl = currentTrack.image || FALLBACK_IMAGE;

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
    <div className="fixed inset-0 z-[9999] flex flex-col justify-between bg-gradient-to-b from-[#0f1224] via-[#141a38] to-[#0b0e1b] text-white p-3 sm:p-6 md:p-8 select-none overflow-hidden animate-fade-in">
      
      {/* Dynamic Blurred Album Background Glow */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-35 pointer-events-none scale-125 transition-all duration-1000"
        style={{ backgroundImage: `url(${trackImageUrl})` }}
      />

      {/* Ambient Neon Lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accentPurple/25 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accentCyan/25 blur-3xl pointer-events-none animate-pulse [animation-delay:1s]" />

      {/* ── Top Navigation Bar ── */}
      <div className="relative z-20 flex items-center justify-between max-w-5xl mx-auto w-full gap-2 pt-[env(safe-area-inset-top,0.5rem)]">
        
        {/* Minimize Button */}
        <button
          onClick={handleMinimizeModal}
          className="flex items-center gap-1.5 min-w-[48px] min-h-[48px] px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white transition font-bold text-xs backdrop-blur-xl shrink-0 border border-white/20 shadow-lg"
          title="Minimize to Floating Player Bar"
        >
          <ChevronDown className="w-5 h-5 text-accentCyan" />
          <span className="hidden sm:inline">Minimize</span>
        </button>

        {/* Center Tab Switcher */}
        <div className="flex items-center gap-1 bg-black/50 border border-white/20 p-1.5 rounded-full backdrop-blur-2xl shadow-2xl">
          <button
            onClick={() => handleTabChange('player')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
              currentTab === 'player'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow-[0_0_18px_rgba(99,210,255,0.5)]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Music2 className="w-4 h-4" />
            <span>Player</span>
          </button>
          <button
            onClick={() => handleTabChange('lyrics')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
              currentTab === 'lyrics'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow-[0_0_18px_rgba(99,210,255,0.5)]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Lyrics</span>
          </button>
          <button
            onClick={() => handleTabChange('queue')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
              currentTab === 'queue'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow-[0_0_18px_rgba(99,210,255,0.5)]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            <span>Queue ({queue.length})</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/15 hover:bg-red-500/40 active:scale-95 text-white hover:text-red-200 transition border border-white/20 shadow-lg shrink-0"
          title="Close Player"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* ── Main Stage ── */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center py-2 overflow-hidden">
        
        {/* 1. PLAYER VIEW */}
        {currentTab === 'player' && (
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-5 md:gap-6 w-full animate-fade-in text-center">
            
            {/* View Mode Switcher (Poster vs Vinyl) */}
            <div className="flex items-center gap-1 bg-white/10 border border-white/15 p-1 rounded-full text-[11px] font-bold text-gray-300 backdrop-blur-md">
              <button
                onClick={() => setViewStyle('poster')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${viewStyle === 'poster' ? 'bg-accentCyan text-black font-extrabold shadow' : 'hover:text-white'}`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Poster Art</span>
              </button>
              <button
                onClick={() => setViewStyle('vinyl')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition ${viewStyle === 'vinyl' ? 'bg-accentCyan text-black font-extrabold shadow' : 'hover:text-white'}`}
              >
                <Disc3 className="w-3.5 h-3.5" />
                <span>Vinyl Disc</span>
              </button>
            </div>

            {/* HD Poster View */}
            {viewStyle === 'poster' && (
              <div className="relative group shrink-0">
                <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-[350px] md:h-[350px] rounded-3xl overflow-hidden border-2 border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative bg-black/40">
                  <img
                    src={trackImageUrl}
                    alt={currentTrack.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                {isPlaying && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 px-4 py-1.5 bg-black/90 backdrop-blur-md rounded-full border border-white/20 shadow-[0_0_25px_rgba(99,210,255,0.6)]">
                    <span className="w-1.5 h-4 bg-accentCyan rounded-full animate-pulse" />
                    <span className="w-1.5 h-7 bg-accentPurple rounded-full animate-pulse [animation-delay:0.2s]" />
                    <span className="w-1.5 h-5 bg-accentPink rounded-full animate-pulse [animation-delay:0.4s]" />
                    <span className="w-1.5 h-6 bg-accentCyan rounded-full animate-pulse [animation-delay:0.1s]" />
                    <span className="w-1.5 h-3.5 bg-accentPurple rounded-full animate-pulse [animation-delay:0.3s]" />
                  </div>
                )}
              </div>
            )}

            {/* Vinyl View */}
            {viewStyle === 'vinyl' && (
              <div className="relative flex items-center justify-center shrink-0">
                <div
                  className={`w-52 h-52 sm:w-64 sm:h-64 md:w-76 md:h-76 rounded-full p-2.5 bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink shadow-[0_0_60px_rgba(99,210,255,0.45)] transition-all duration-700 ${
                    isPlaying ? 'animate-spin-slow shadow-[0_0_90px_rgba(99,210,255,0.7)]' : ''
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-black border-2 sm:border-4 border-white/25 overflow-hidden relative flex items-center justify-center shadow-2xl">
                    <div className="absolute inset-2 sm:inset-4 rounded-full border border-white/10 pointer-events-none" />
                    <div className="absolute inset-5 sm:inset-8 rounded-full border border-white/10 pointer-events-none" />
                    <div className="absolute inset-8 sm:inset-12 rounded-full border border-white/15 pointer-events-none" />
                    <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-2 sm:border-4 border-black relative shadow-2xl">
                      <img
                        src={trackImageUrl}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 m-auto w-5 h-5 rounded-full bg-darkBg border-2 border-white/60 shadow-inner" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Track Info */}
            <div className="space-y-1.5 max-w-sm sm:max-w-lg px-2">
              <div className="flex items-center justify-center gap-2">
                <span className="uppercase text-[10px] sm:text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-accentCyan/20 text-accentCyan border border-accentCyan/40 tracking-wider font-mono shadow-sm">
                  {currentTrack.language || 'Global'}
                </span>
                {currentTrack.year && (
                  <span className="text-xs text-gray-300 font-mono">&bull; {currentTrack.year}</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-outfit text-white tracking-tight leading-snug line-clamp-2 drop-shadow-md">
                {currentTrack.title}
              </h1>
              <p className="text-sm sm:text-base text-gray-200 font-medium font-sans truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>
        )}

        {/* 2. LYRICS VIEW */}
        {currentTab === 'lyrics' && (
          <div className="w-full max-w-4xl h-[68vh] sm:h-[74vh] flex flex-col gap-4 animate-fade-in glass-panel rounded-3xl border border-white/20 p-5 sm:p-8 backdrop-blur-3xl bg-[#12162d]/90 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                <img
                  src={trackImageUrl}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-md shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="space-y-0.5 min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-white font-outfit truncate flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-accentCyan shrink-0" />
                    <span className="truncate">{currentTrack.title}</span>
                  </h2>
                  <p className="text-xs text-gray-300 truncate">{currentTrack.artist}</p>
                </div>
              </div>
              {lyricsData.synced ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-accentCyan/20 text-accentCyan border border-accentCyan/40 font-mono shrink-0 shadow-md">
                  Live Synced
                </span>
              ) : lyricsData.has_lyrics ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-accentPurple/20 text-accentPurple border border-accentPurple/40 font-mono shrink-0 shadow-md">
                  Plain Lyrics
                </span>
              ) : null}
            </div>

            {lyricsData.loading ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 py-12">
                <Loader2 className="w-10 h-10 text-accentCyan animate-spin" />
                <p className="text-sm font-bold text-gray-300 font-mono">Fetching synchronized lyrics...</p>
              </div>
            ) : lyricsData.synced && lyricsData.syncedLyrics.length > 0 ? (
              <div
                ref={lyricsContainerRef}
                className="overflow-y-auto space-y-4 flex-1 pr-3 custom-scrollbar py-6"
              >
                {lyricsData.syncedLyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  return (
                    <p
                      key={`lyric-${idx}`}
                      onClick={() => seek(line.time)}
                      className={`text-base sm:text-xl md:text-2xl font-bold cursor-pointer transition-all duration-300 text-center select-none py-2 px-4 rounded-2xl ${
                        isActive
                          ? 'text-accentCyan scale-105 font-black drop-shadow-[0_0_25px_rgba(99,210,255,0.9)] bg-white/15 border border-accentCyan/40 shadow-xl'
                          : 'text-gray-400 hover:text-gray-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {line?.text || '♪'}
                    </p>
                  );
                })}
              </div>
            ) : lyricsData.plainLyrics && !lyricsData.plainLyrics.includes('No lyrics available') ? (
              <div className="overflow-y-auto space-y-3 flex-1 pr-3 custom-scrollbar py-4 text-center">
                <pre className="text-sm sm:text-base font-sans text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                  {lyricsData.plainLyrics}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center p-6 space-y-4 my-auto">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl shrink-0">
                  <img
                    src={trackImageUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-lg font-bold text-white font-outfit">{currentTrack.title}</h3>
                  <p className="text-xs text-gray-300">{currentTrack.artist}</p>
                  <p className="text-xs text-accentCyan/90 font-mono pt-2">
                    ♪ Synchronized lyrics are not available for this track yet. Enjoy the music!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. QUEUE VIEW */}
        {currentTab === 'queue' && (
          <div className="w-full max-w-4xl bg-[#12162d]/90 border border-white/20 rounded-3xl p-5 sm:p-8 backdrop-blur-3xl h-[68vh] sm:h-[74vh] flex flex-col gap-4 animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-white font-outfit flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-accentCyan" />
                <span>Playing Queue ({queue.length})</span>
              </h2>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-2 custom-scrollbar">
              {queue.map((t, idx) => {
                const isCurrent = t.id === currentTrack.id;
                return (
                  <div
                    key={`${t.id}-${idx}`}
                    className={`flex items-center justify-between gap-3 p-3 rounded-2xl transition ${
                      isCurrent
                        ? 'bg-accentCyan/20 border border-accentCyan/40 text-white shadow-[0_0_15px_rgba(99,210,255,0.25)]'
                        : 'hover:bg-white/10 text-gray-300 border border-transparent'
                    }`}
                  >
                    <div
                      onClick={() => playTrack(t, queue)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={t.image || FALLBACK_IMAGE}
                        alt={t.title}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0 shadow-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold text-xs sm:text-sm truncate ${isCurrent ? 'text-accentCyan' : 'text-white'}`}>
                          {t.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{t.artist}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-gray-400">{formatTime(t.duration)}</span>
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-2 text-gray-400 hover:text-red-400 active:scale-90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── Scrubber & Audio Controls ── */}
      <div className="relative z-20 max-w-2xl mx-auto w-full space-y-3 pb-[env(safe-area-inset-bottom,0.5rem)]">
        
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

        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-full transition active:scale-90 ${
              isShuffling ? 'text-accentCyan bg-accentCyan/20 shadow-[0_0_15px_rgba(99,210,255,0.4)]' : 'text-gray-300 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={prevTrack}
            className="p-2 sm:p-2.5 text-gray-200 hover:text-white rounded-full hover:bg-white/10 transition active:scale-90"
            title="Previous Track"
          >
            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={() => skipBackward(10)}
            className="relative p-2 sm:p-2.5 text-gray-200 hover:text-accentCyan rounded-full hover:bg-accentCyan/10 transition active:scale-90 flex items-center justify-center group"
            title="Rewind 10s"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-rotate-45" />
            <span className="absolute text-[7px] sm:text-[8px] font-extrabold text-accentCyan font-mono pointer-events-none">10</span>
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-[0_0_35px_rgba(99,210,255,0.6)] hover:shadow-[0_0_50px_rgba(99,210,255,0.9)] active:scale-95 transition-all disabled:opacity-50"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => skipForward(10)}
            className="relative p-2 sm:p-2.5 text-gray-200 hover:text-accentCyan rounded-full hover:bg-accentCyan/10 transition active:scale-90 flex items-center justify-center group"
            title="Forward 10s"
          >
            <RotateCw className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-45" />
            <span className="absolute text-[7px] sm:text-[8px] font-extrabold text-accentCyan font-mono pointer-events-none">10</span>
          </button>

          <button
            onClick={nextTrack}
            className="p-2 sm:p-2.5 text-gray-200 hover:text-white rounded-full hover:bg-white/10 transition active:scale-90"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={toggleLoop}
            className={`p-2.5 rounded-full transition active:scale-90 ${
              isLooping !== 'none' ? 'text-accentCyan bg-accentCyan/20 shadow-[0_0_15px_rgba(99,210,255,0.4)]' : 'text-gray-300 hover:text-white'
            }`}
            title={`Loop: ${isLooping}`}
          >
            {isLooping === 'track' ? <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

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
