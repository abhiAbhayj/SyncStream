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
  Radio,
  X,
  Loader2,
  Sparkles
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
    return sessionStorage.getItem('syncstream_music_modal_tab') || 'player';
  }); // 'player' | 'lyrics' | 'queue'
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

  // Toggle true browser fullscreen
  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

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
            has_lyrics: res.data.has_lyrics,
            synced: res.data.synced,
            syncedLyrics: res.data.syncedLyrics || [],
            plainLyrics: res.data.plainLyrics || '',
            source: res.data.source
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
    sessionStorage.setItem('syncstream_music_modal_tab', tab);
  };

  // Find active synced lyric index based on currentTime
  const activeLyricIndex = lyricsData.syncedLyrics.findIndex((line, i) => {
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
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

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
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-darkBg/95 backdrop-blur-3xl overflow-hidden animate-fade-in text-white p-4 sm:p-8">
      
      {/* Blurred Backdrop Image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 pointer-events-none scale-125 transition-all duration-1000"
        style={{ backgroundImage: `url(${currentTrack.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-darkBg/85 to-darkBg/40 pointer-events-none" />

      {/* ── Top Header Navigation ── */}
      <div className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full gap-2">
        <button
          onClick={() => setIsExpanded(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition font-bold text-xs backdrop-blur-md shrink-0"
        >
          <ChevronDown className="w-4 h-4" />
          <span>Minimize</span>
        </button>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-md">
          <button
            onClick={() => handleTabChange('player')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              activeTab === 'player'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Player
          </button>
          <button
            onClick={() => handleTabChange('lyrics')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
              activeTab === 'lyrics'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Lyrics</span>
          </button>
          <button
            onClick={() => handleTabChange('queue')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
              activeTab === 'queue'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-3 h-3" />
            <span>Queue ({queue.length})</span>
          </button>
        </div>

        {/* Fullscreen & Close Player Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleBrowserFullscreen}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button
            onClick={closePlayer}
            className="p-2 rounded-full bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition"
            title="Stop and Close Music"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main Stage ── */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex flex-col items-center justify-center py-4 overflow-hidden">
        
        {/* ══════ 1. PLAYER VIEW ══════ */}
        {activeTab === 'player' && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full animate-fade-in">
            {/* Vinyl Record Visual */}
            <div className="relative group flex items-center justify-center shrink-0">
              <div
                className={`w-60 h-60 sm:w-80 sm:h-80 md:w-92 md:h-92 rounded-full p-2 bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink shadow-[0_0_60px_rgba(99,210,255,0.35)] transition-all duration-700 ${
                  isPlaying ? 'animate-spin-slow shadow-[0_0_90px_rgba(99,210,255,0.65)]' : ''
                }`}
              >
                <div className="w-full h-full rounded-full bg-black border-4 border-white/20 overflow-hidden relative flex items-center justify-center shadow-inner">
                  <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
                  <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
                  <div className="absolute inset-12 rounded-full border border-white/10 pointer-events-none" />
                  <div className="absolute inset-16 rounded-full border border-white/5 pointer-events-none" />

                  <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-black relative shadow-2xl">
                    <img
                      src={currentTrack.image || 'https://placehold.co/300x300/1e1e24/fff?text=Music'}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-darkBg border-2 border-white/40 shadow-inner" />
                  </div>
                </div>
              </div>

              {/* Equalizer Audio Waves */}
              {isPlaying && (
                <div className="absolute -bottom-4 flex items-end gap-1.5 px-4 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-white/10">
                  <span className="w-1.5 h-6 bg-accentCyan rounded-full animate-pulse" />
                  <span className="w-1.5 h-10 bg-accentPurple rounded-full animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-4 bg-accentPink rounded-full animate-pulse [animation-delay:0.4s]" />
                  <span className="w-1.5 h-8 bg-accentCyan rounded-full animate-pulse [animation-delay:0.1s]" />
                  <span className="w-1.5 h-5 bg-accentPurple rounded-full animate-pulse [animation-delay:0.3s]" />
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 text-center lg:text-left space-y-4 max-w-md w-full">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <span className="uppercase text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-accentCyan/20 text-accentCyan border border-accentCyan/40 tracking-wider font-mono">
                    {currentTrack.language || 'Global'}
                  </span>
                  {currentTrack.year && (
                    <span className="text-xs text-gray-400 font-mono">&bull; {currentTrack.year}</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold font-outfit text-white tracking-tight leading-snug drop-shadow-md">
                  {currentTrack.title}
                </h1>
                <p className="text-sm sm:text-base text-gray-300 font-medium font-sans">
                  {currentTrack.artist}
                </p>
                {currentTrack.album && currentTrack.album !== 'Single' && (
                  <p className="text-xs text-gray-500 font-mono">Album: {currentTrack.album}</p>
                )}
              </div>

              {/* Lyrics quick teaser button */}
              <button
                onClick={() => handleTabChange('lyrics')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-accentCyan transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full Synced Lyrics</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════ 2. LYRICS VIEW ══════ */}
        {activeTab === 'lyrics' && (
          <div className="w-full max-w-3xl h-[60vh] flex flex-col gap-4 animate-fade-in glass-panel rounded-2xl border border-white/10 p-6 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accentCyan" />
                  <span>Lyrics &bull; {currentTrack.title}</span>
                </h2>
                <p className="text-xs text-gray-400">{currentTrack.artist}</p>
              </div>
              {lyricsData.synced && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accentCyan/20 text-accentCyan border border-accentCyan/30 font-mono">
                  Live Synced
                </span>
              )}
            </div>

            {lyricsData.loading ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-2">
                <Loader2 className="w-8 h-8 text-accentCyan animate-spin" />
                <p className="text-xs text-gray-400 font-mono">Fetching synchronized lyrics...</p>
              </div>
            ) : lyricsData.synced && lyricsData.syncedLyrics.length > 0 ? (
              /* Synced Interactive Lyrics */
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
                      className={`text-base sm:text-2xl font-bold cursor-pointer transition-all duration-300 text-center select-none py-1.5 rounded-xl ${
                        isActive
                          ? 'text-accentCyan scale-105 font-extrabold drop-shadow-[0_0_15px_rgba(99,210,255,0.7)] bg-white/5'
                          : 'text-gray-400 hover:text-gray-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {line.text || '♪'}
                    </p>
                  );
                })}
              </div>
            ) : lyricsData.plainLyrics ? (
              /* Plain Text Lyrics */
              <div className="overflow-y-auto space-y-2 flex-1 pr-3 custom-scrollbar py-4 text-center">
                <pre className="text-sm sm:text-base font-sans text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {lyricsData.plainLyrics}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center text-gray-500 space-y-2">
                <Sparkles className="w-8 h-8 text-gray-600" />
                <p className="text-sm font-semibold">No lyrics found for this track.</p>
              </div>
            )}
          </div>
        )}

        {/* ══════ 3. QUEUE VIEW ══════ */}
        {activeTab === 'queue' && (
          <div className="w-full max-w-2xl bg-darkCard/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl h-[60vh] flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <h2 className="text-base font-bold text-white font-outfit flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-accentCyan" />
                <span>Upcoming Tracks ({queue.length})</span>
              </h2>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-2 custom-scrollbar">
              {queue.map((t, idx) => {
                const isCurrent = t.id === currentTrack.id;
                return (
                  <div
                    key={`${t.id}-${idx}`}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl transition ${
                      isCurrent
                        ? 'bg-accentCyan/20 border border-accentCyan/40 text-white'
                        : 'hover:bg-white/5 text-gray-300'
                    }`}
                  >
                    <div
                      onClick={() => playTrack(t, queue)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={t.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
                        alt={t.title}
                        className="w-11 h-11 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold text-xs sm:text-sm truncate ${isCurrent ? 'text-accentCyan' : 'text-white'}`}>
                          {t.title}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">{t.artist}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-gray-500">{formatTime(t.duration)}</span>
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-1 text-gray-400 hover:text-red-400"
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

      {/* ── Bottom Big Controls & Scrubber ── */}
      <div className="relative z-10 max-w-3xl mx-auto w-full space-y-4 pt-2">
        {/* Scrubber Progress Bar */}
        <div className="space-y-1.5">
          <div
            ref={scrubberRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            className="relative w-full h-3 rounded-full bg-white/15 cursor-pointer overflow-visible group"
          >
            <div
              className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-accentPurple via-accentCyan to-accentPink shadow-[0_0_15px_rgba(99,210,255,0.7)]"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_12px_#fff] transition-transform group-hover:scale-125"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-400">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Master Control Buttons */}
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-full transition ${
              isShuffling ? 'text-accentCyan bg-accentCyan/20' : 'text-gray-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={prevTrack}
            className="p-3 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition active:scale-90"
            title="Previous Track"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          {/* 10s Backward Jump */}
          <button
            onClick={() => skipBackward(10)}
            className="relative p-3 text-gray-300 hover:text-accentCyan rounded-full hover:bg-accentCyan/10 transition active:scale-90 flex items-center justify-center group"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-6 h-6 transition-transform group-hover:-rotate-45" />
            <span className="absolute text-[9px] font-extrabold text-accentCyan font-mono">10</span>
          </button>

          {/* Master Play / Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-[0_0_40px_rgba(99,210,255,0.6)] hover:shadow-[0_0_60px_rgba(99,210,255,0.9)] transform hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          {/* 10s Forward Jump */}
          <button
            onClick={() => skipForward(10)}
            className="relative p-3 text-gray-300 hover:text-accentCyan rounded-full hover:bg-accentCyan/10 transition active:scale-90 flex items-center justify-center group"
            title="Forward 10 seconds"
          >
            <RotateCw className="w-6 h-6 transition-transform group-hover:rotate-45" />
            <span className="absolute text-[9px] font-extrabold text-accentCyan font-mono">10</span>
          </button>

          <button
            onClick={nextTrack}
            className="p-3 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition active:scale-90"
            title="Next Track"
          >
            <SkipForward className="w-6 h-6" />
          </button>

          <button
            onClick={toggleLoop}
            className={`p-2.5 rounded-full transition ${
              isLooping !== 'none' ? 'text-accentCyan bg-accentCyan/20' : 'text-gray-400 hover:text-white'
            }`}
            title={`Loop: ${isLooping}`}
          >
            {isLooping === 'track' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume Row */}
        <div className="flex items-center justify-center gap-3 pt-1">
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
            className="w-36 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accentCyan"
          />
        </div>
      </div>

    </div>
  );
}
