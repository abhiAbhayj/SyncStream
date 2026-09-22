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
  Heart,
  X,
  Loader2,
  Music2,
  Disc3,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  FolderPlus
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
    isFavorite,
    toggleFavorite,
    openAddToPlaylist,
    setIsExpanded,
    modalTab,
    setModalTab,
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

  // Function to fetch lyrics
  const fetchLyrics = useCallback(async (track) => {
    if (!track || !track.title) return;

    setLyricsData({
      loading: true,
      has_lyrics: false,
      synced: false,
      syncedLyrics: [],
      plainLyrics: '',
      source: null
    });

    try {
      const res = await axios.get('/api/music/lyrics', {
        params: {
          title: track.title,
          artist: track.artist || '',
          duration: track.duration || 0,
          songId: track.id || ''
        },
        timeout: 8000
      });

      setLyricsData({
        loading: false,
        has_lyrics: res.data?.has_lyrics || false,
        synced: res.data?.synced || false,
        syncedLyrics: res.data?.syncedLyrics || [],
        plainLyrics: res.data?.plainLyrics || '',
        source: res.data?.source || null
      });
    } catch (err) {
      setLyricsData({
        loading: false,
        has_lyrics: false,
        synced: false,
        syncedLyrics: [],
        plainLyrics: 'No synchronized lyrics available for this track.',
        source: null
      });
    }
  }, []);

  // Fetch lyrics whenever currentTrack changes or when modal is expanded
  useEffect(() => {
    if (isExpanded && currentTrack) {
      fetchLyrics(currentTrack);
    }
  }, [currentTrack?.id, isExpanded, fetchLyrics]);

  // Determine active lyric line index
  const activeLyricIndex = (lyricsData?.syncedLyrics || []).findIndex((line, i) => {
    const nextLine = lyricsData.syncedLyrics[i + 1];
    if (nextLine) {
      return currentTime >= line.time && currentTime < nextLine.time;
    }
    return currentTime >= line.time;
  });

  // Auto-scroll active lyric into center view
  useEffect(() => {
    if (modalTab === 'lyrics' && lyricsContainerRef.current && activeLyricIndex !== -1) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeLyricIndex, modalTab]);

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

  const handleMouseMove = (e) => {
    if (isDragging) {
      setDragTime(calculateSeekTime(e));
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      const target = calculateSeekTime(e);
      seek(target);
      setIsDragging(false);
    }
  };

  return (
    <div
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={isDragging ? handleMouseUp : undefined}
      onTouchMove={isDragging ? handleMouseMove : undefined}
      onTouchEnd={isDragging ? handleMouseUp : undefined}
      className="fixed inset-0 z-[9999] flex flex-col justify-between bg-gradient-to-b from-[#0b0d19] via-[#10152e] to-[#080a14] text-white p-2.5 sm:p-5 md:p-6 select-none overflow-hidden animate-fade-in"
    >
      {/* Ambient Blurred Artwork Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 pointer-events-none scale-125 transition-all duration-1000"
        style={{ backgroundImage: `url(${trackImageUrl})` }}
      />

      {/* Ambient Neon Lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accentPurple/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accentCyan/20 blur-3xl pointer-events-none animate-pulse [animation-delay:1s]" />

      {/* ── TOP BAR: Navigation & Tabs ── */}
      <header className="relative z-20 flex items-center justify-between max-w-4xl mx-auto w-full shrink-0 gap-2 pt-[env(safe-area-inset-top,0.25rem)] pb-1.5">
        
        {/* Minimize Button */}
        <button
          onClick={handleMinimizeModal}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition font-bold text-xs backdrop-blur-xl shrink-0 border border-white/15 shadow-md"
          title="Minimize to Floating Bar"
        >
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-accentCyan" />
          <span className="hidden sm:inline">Minimize</span>
        </button>

        {/* Center Tab Switcher */}
        <div className="flex items-center gap-1 bg-black/60 border border-white/20 p-1 rounded-full backdrop-blur-2xl shadow-xl">
          <button
            onClick={() => setModalTab('player')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
              modalTab === 'player'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow-[0_0_15px_rgba(99,210,255,0.4)]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Music2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Player</span>
          </button>
          
          <button
            onClick={() => setModalTab('lyrics')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
              modalTab === 'lyrics'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow-[0_0_15px_rgba(99,210,255,0.4)]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setModalTab('queue')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition active:scale-95 ${
              modalTab === 'queue'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow-[0_0_15px_rgba(99,210,255,0.4)]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Queue ({queue.length})</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500/40 active:scale-95 text-white hover:text-red-200 transition border border-white/15 shadow-md shrink-0"
          title="Stop & Close Music"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
      </header>

      {/* ── MAIN STAGE AREA ── */}
      <main className="relative z-10 max-w-4xl mx-auto w-full flex-1 min-h-0 flex flex-col items-stretch justify-start overflow-hidden py-1">
        
        {/* 1. PLAYER VIEW */}
        {modalTab === 'player' && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full animate-fade-in text-center my-auto">
            
            {/* View Style Switcher */}
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

            {/* Poster Art View */}
            {viewStyle === 'poster' && (
              <div className="relative group shrink-0 my-auto">
                <div className="w-[54vw] max-w-[210px] sm:max-w-none sm:w-64 sm:h-64 md:w-80 md:h-80 aspect-square max-h-[26vh] sm:max-h-none rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/25 shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative bg-black/40">
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
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-end gap-1 px-3 py-1 bg-black/90 backdrop-blur-md rounded-full border border-white/20 shadow-[0_0_15px_rgba(99,210,255,0.6)]">
                    <span className="w-1 h-3 bg-accentCyan rounded-full animate-pulse" />
                    <span className="w-1 h-5 bg-accentPurple rounded-full animate-pulse [animation-delay:0.2s]" />
                    <span className="w-1 h-3.5 bg-accentPink rounded-full animate-pulse [animation-delay:0.4s]" />
                    <span className="w-1 h-4 bg-accentCyan rounded-full animate-pulse [animation-delay:0.1s]" />
                  </div>
                )}
              </div>
            )}

            {/* Vinyl Disc View */}
            {viewStyle === 'vinyl' && (
              <div className="relative flex items-center justify-center shrink-0 my-auto">
                <div
                  className={`w-[50vw] max-w-[190px] sm:max-w-none sm:w-56 sm:h-56 md:w-72 md:h-72 aspect-square max-h-[24vh] sm:max-h-none rounded-full p-2 bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink shadow-[0_0_40px_rgba(99,210,255,0.4)] transition-all duration-700 ${
                    isPlaying ? 'animate-spin-slow shadow-[0_0_60px_rgba(99,210,255,0.6)]' : ''
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-black border-2 border-white/25 overflow-hidden relative flex items-center justify-center shadow-2xl">
                    <div className="absolute inset-2 sm:inset-3 rounded-full border border-white/10 pointer-events-none" />
                    <div className="absolute inset-4 sm:inset-6 rounded-full border border-white/10 pointer-events-none" />
                    <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-black relative shadow-2xl">
                      <img
                        src={trackImageUrl}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 m-auto w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-darkBg border-2 border-white/60 shadow-inner" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Track Info */}
            <div className="space-y-1.5 max-w-sm sm:max-w-lg px-2">
              <div className="flex items-center justify-center gap-1.5">
                <span className="uppercase text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-accentCyan/20 text-accentCyan border border-accentCyan/40 tracking-wider font-mono shadow-sm">
                  {currentTrack.language || 'Global'}
                </span>
                {currentTrack.year && (
                  <span className="text-[10px] sm:text-xs text-gray-400 font-mono">&bull; {currentTrack.year}</span>
                )}
                <button
                  type="button"
                  onClick={() => openAddToPlaylist(currentTrack)}
                  className="p-1.5 rounded-full transition active:scale-90 bg-white/10 text-gray-300 hover:text-accentCyan hover:bg-accentCyan/20"
                  title="Add to Playlist"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(currentTrack)}
                  className={`p-1.5 rounded-full transition active:scale-90 ${
                    isFavorite(currentTrack.id)
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-white/10 text-gray-300 hover:text-white'
                  }`}
                  title={isFavorite(currentTrack.id) ? 'Liked' : 'Add to Favorites'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite(currentTrack.id) ? 'fill-current text-red-400' : ''}`} />
                </button>
              </div>
              <h1 className="text-base sm:text-xl md:text-2xl font-extrabold font-outfit text-white tracking-tight leading-snug line-clamp-2 drop-shadow-md">
                {currentTrack.title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 font-medium truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>
        )}

        {/* 2. LYRICS VIEW */}
        {modalTab === 'lyrics' && (
          <div className="w-full h-full min-h-0 flex-1 flex flex-col glass-panel rounded-2xl sm:rounded-3xl border border-white/20 p-3.5 sm:p-6 backdrop-blur-3xl bg-[#12162d]/95 shadow-2xl overflow-hidden animate-fade-in">
            
            {/* Header / Track Mini Info */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 shrink-0 gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <img
                  src={trackImageUrl}
                  alt={currentTrack.title}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/20 shadow-md shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h2 className="text-xs sm:text-sm md:text-base font-bold text-white font-outfit truncate flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-accentCyan shrink-0" />
                    <span className="truncate">{currentTrack.title}</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-400 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {lyricsData.synced ? (
                  <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-accentCyan/20 text-accentCyan border border-accentCyan/40 font-mono shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-accentCyan" />
                    <span>Live Synced</span>
                  </span>
                ) : lyricsData.has_lyrics ? (
                  <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-accentPurple/20 text-accentPurple border border-accentPurple/40 font-mono shadow-md">
                    Plain Lyrics
                  </span>
                ) : null}

                <button
                  onClick={() => fetchLyrics(currentTrack)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-accentCyan hover:bg-white/10 transition"
                  title="Reload Lyrics"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${lyricsData.loading ? 'animate-spin text-accentCyan' : ''}`} />
                </button>
              </div>
            </div>

            {/* Lyrics Content Container */}
            {lyricsData.loading ? (
              <div className="flex flex-col items-center justify-center flex-1 min-h-0 gap-3 py-8">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-accentCyan animate-spin" />
                <p className="text-xs sm:text-sm font-bold text-gray-300 font-mono">Fetching synchronized lyrics...</p>
              </div>
            ) : lyricsData.synced && lyricsData.syncedLyrics.length > 0 ? (
              <div
                ref={lyricsContainerRef}
                className="overflow-y-auto space-y-3 sm:space-y-4 flex-1 min-h-0 pr-1.5 sm:pr-3 custom-scrollbar py-4 select-none"
              >
                {lyricsData.syncedLyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  return (
                    <div
                      key={`lyric-${idx}`}
                      onClick={() => seek(line.time)}
                      className={`text-center sm:text-left transition-all duration-300 cursor-pointer rounded-xl px-3 py-1.5 sm:py-2 select-none ${
                        isActive
                          ? 'text-accentCyan font-extrabold text-base sm:text-xl md:text-2xl scale-[1.02] bg-accentCyan/15 border border-accentCyan/40 shadow-[0_0_20px_rgba(99,210,255,0.35)]'
                          : 'text-gray-400/80 hover:text-white hover:bg-white/5 text-sm sm:text-base md:text-lg font-semibold'
                      }`}
                    >
                      <p className="leading-snug">{line?.text || '♪'}</p>
                    </div>
                  );
                })}
              </div>
            ) : lyricsData.plainLyrics && !lyricsData.plainLyrics.toLowerCase().includes('no synchronized or plain lyrics') && !lyricsData.plainLyrics.toLowerCase().includes('no lyrics available') ? (
              <div className="overflow-y-auto space-y-3 flex-1 min-h-0 pr-2 custom-scrollbar py-4 text-center sm:text-left">
                <pre className="text-xs sm:text-sm md:text-base font-sans text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                  {lyricsData.plainLyrics}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 min-h-0 text-center p-4 sm:p-6 space-y-3 my-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/20 shadow-xl shrink-0">
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
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-sm sm:text-base font-bold text-white font-outfit">{currentTrack.title}</h3>
                  <p className="text-xs text-gray-400">{currentTrack.artist}</p>
                  <p className="text-xs text-accentCyan/90 font-mono pt-1">
                    ♪ Synchronized lyrics are not available for this track yet.
                  </p>
                </div>
                <button
                  onClick={() => setModalTab('player')}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition border border-white/20 shadow"
                >
                  Return to Player View
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. QUEUE VIEW */}
        {modalTab === 'queue' && (
          <div className="w-full h-full min-h-0 flex-1 flex flex-col glass-panel rounded-2xl sm:rounded-3xl border border-white/20 p-3.5 sm:p-6 backdrop-blur-3xl bg-[#12162d]/95 shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 shrink-0">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-white font-outfit flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-accentCyan" />
                <span>Playing Queue ({queue.length})</span>
              </h2>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 min-h-0 pr-1.5 sm:pr-2 custom-scrollbar py-3">
              {queue.map((t, idx) => {
                const isCurrent = t.id === currentTrack.id;
                return (
                  <div
                    key={`${t.id}-${idx}`}
                    className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl transition ${
                      isCurrent
                        ? 'bg-accentCyan/20 border border-accentCyan/40 text-white shadow-[0_0_15px_rgba(99,210,255,0.25)]'
                        : 'hover:bg-white/10 text-gray-300 border border-transparent'
                    }`}
                  >
                    <div
                      onClick={() => playTrack(t, queue)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={t.image || FALLBACK_IMAGE}
                        alt={t.title}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0 shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold text-xs sm:text-sm truncate ${isCurrent ? 'text-accentCyan' : 'text-white'}`}>
                          {t.title}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">{t.artist}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-gray-400">{formatTime(t.duration)}</span>
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-400 active:scale-90"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* ── BOTTOM AUDIO CONTROLS & SCRUBBER ── */}
      <footer className="relative z-20 max-w-xl mx-auto w-full shrink-0 space-y-2 pt-1 pb-[env(safe-area-inset-bottom,0.25rem)]">
        
        {/* Scrubber Bar */}
        <div className="space-y-1">
          <div
            ref={scrubberRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            className="relative w-full h-2 sm:h-2.5 rounded-full bg-white/20 cursor-pointer overflow-visible group/scrubber"
          >
            <div
              className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-accentPurple via-accentCyan to-accentPink shadow-[0_0_12px_rgba(99,210,255,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-[0_0_10px_#fff]"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono font-bold text-gray-300 px-0.5">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition active:scale-90 ${
              isShuffling ? 'text-accentCyan bg-accentCyan/20 shadow-[0_0_12px_rgba(99,210,255,0.4)]' : 'text-gray-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          <button
            onClick={prevTrack}
            className="p-2 text-gray-200 hover:text-white rounded-full hover:bg-white/10 transition active:scale-90"
            title="Previous Track"
          >
            <SkipBack className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => skipBackward(10)}
            className="relative p-2 text-gray-200 hover:text-accentCyan rounded-full hover:bg-accentCyan/10 transition active:scale-90 flex items-center justify-center group"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform group-hover:-rotate-45" />
            <span className="absolute text-[6.5px] sm:text-[7.5px] font-extrabold text-accentCyan font-mono pointer-events-none">10</span>
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-[0_0_25px_rgba(99,210,255,0.5)] hover:shadow-[0_0_35px_rgba(99,210,255,0.8)] active:scale-95 transition-all disabled:opacity-50"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => skipForward(10)}
            className="relative p-2 text-gray-200 hover:text-accentCyan rounded-full hover:bg-accentCyan/10 transition active:scale-90 flex items-center justify-center group"
            title="Forward 10s"
          >
            <RotateCw className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform group-hover:rotate-45" />
            <span className="absolute text-[6.5px] sm:text-[7.5px] font-extrabold text-accentCyan font-mono pointer-events-none">10</span>
          </button>

          <button
            onClick={nextTrack}
            className="p-2 text-gray-200 hover:text-white rounded-full hover:bg-white/10 transition active:scale-90"
            title="Next Track"
          >
            <SkipForward className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={toggleLoop}
            className={`p-2.5 rounded-full transition active:scale-90 ${
              isLooping !== 'none' ? 'text-accentCyan bg-accentCyan/20 shadow-[0_0_12px_rgba(99,210,255,0.4)]' : 'text-gray-400 hover:text-white'
            }`}
            title={`Loop: ${isLooping}`}
          >
            {isLooping === 'track' ? <Repeat1 className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Repeat className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
          </button>
        </div>

        {/* Desktop Volume Slider */}
        <div className="hidden sm:flex items-center justify-center gap-3 pt-0.5">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white">
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
            className="w-28 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accentCyan"
          />
        </div>

      </footer>

    </div>
  );
}
