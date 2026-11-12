import React, { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
  Music,
  Disc3,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  FolderPlus
} from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

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

const cleanSongTitle = (str) => {
  if (!str || typeof str !== 'string') return '';
  let cleaned = cleanText(str);
  // Remove common YouTube SEO / video clutter
  cleaned = cleaned
    .replace(/\s*(\(|\[)\s*(official\s*(music\s*)?video|video\s*song|lyric\s*video|audio|audio\s*song|4k|hd|full\s*song|visualizer|remastered)\s*(\)|\])/gi, '')
    .replace(/\s*\|\s*(official\s*(music\s*)?video|video\s*song|lyric\s*video|audio|audio\s*song|4k|hd|full\s*song|visualizer).*/gi, '')
    .replace(/\s*\|\s*.*$/gi, (match) => {
      return match.includes('|') && cleaned.split('|')[0].trim().length > 3 ? '' : match;
    })
    .replace(/\s*-\s*official\s*video.*/gi, '')
    .trim();
  return cleaned || cleanText(str);
};

const cleanArtistName = (str, track) => {
  let val = str;
  if (!val || typeof val !== 'string' || val.trim() === '' || val.toLowerCase() === 'unknown artist') {
    if (track) {
      val = track.subtitle || track.singers || track.primary_artists || track.music || '';
    }
  }
  if (!val || typeof val !== 'string' || val.trim() === '') return 'Various Artists';
  let cleaned = cleanText(val);
  return cleaned
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
  const [rippleTrigger, setRippleTrigger] = useState(0);
  const [seekFlashIdx, setSeekFlashIdx] = useState(null);
  const [tappedPlainIdx, setTappedPlainIdx] = useState(null);

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
  const spectrumCanvasRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Live Circular Canvas Audio Spectrum Visualizer (CORS-safe procedural harmonics matching active theme)
  useEffect(() => {
    if (!isExpanded || modalTab !== 'player') return;
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let phase = 0;

    const getRgbCssVar = (varName, fallback) => {
      const val = getComputedStyle(document.body).getPropertyValue(varName)?.trim();
      return val || fallback;
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.max(1, Math.round(rect.width * dpr));
      const targetH = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const baseRadius = Math.min(w, h) * 0.34;
      const maxBarLen = Math.min(w, h) * 0.14;
      const numBars = 48;

      const playing = isPlayingRef.current;
      phase += playing ? 0.055 : 0.008;

      const cyanRgb = getRgbCssVar('--accent-cyan', '0, 229, 255');
      const purpleRgb = getRgbCssVar('--accent-purple', '176, 38, 255');
      const pinkRgb = getRgbCssVar('--accent-pink', '255, 42, 133');

      for (let i = 0; i < numBars; i++) {
        const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2;
        const harmonic =
          Math.sin(phase * 1.9 + i * 0.45) * 0.36 +
          Math.cos(phase * 3.1 - i * 0.72) * 0.28 +
          Math.sin(phase * 0.9 + i * 1.15) * 0.22;
        const level = playing ? Math.max(0.14, (harmonic + 0.86) * 0.54) : 0.08 + Math.sin(i * 0.4 + phase) * 0.03;
        const barLen = level * maxBarLen;

        const x1 = cx + Math.cos(angle) * baseRadius;
        const y1 = cy + Math.sin(angle) * baseRadius;
        const x2 = cx + Math.cos(angle) * (baseRadius + barLen);
        const y2 = cy + Math.sin(angle) * (baseRadius + barLen);

        const mix = i / numBars;
        const strokeColor =
          mix < 0.33
            ? `rgba(${cyanRgb}, ${playing ? 0.88 : 0.3})`
            : mix < 0.66
            ? `rgba(${purpleRgb}, ${playing ? 0.88 : 0.3})`
            : `rgba(${pinkRgb}, ${playing ? 0.88 : 0.3})`;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(2 * dpr, (Math.min(w, h) / 145) * dpr);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isExpanded, modalTab, currentTrack?.id]);

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

  const handleTogglePlayWithRipple = () => {
    setRippleTrigger((n) => n + 1);
    togglePlay();
  };

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
      className="fixed inset-0 z-[9999] flex flex-col justify-between bg-gradient-to-b from-[#090b16] via-[#0f142b] to-[#070812] text-white p-2.5 xs:p-3 sm:p-5 md:p-6 select-none overflow-hidden animate-fade-in"
    >
      {/* Ambient Blurred Artwork Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 pointer-events-none scale-125 transition-all duration-1000"
        style={{ backgroundImage: `url(${trackImageUrl})` }}
      />

      {/* Synced Color Ambient Blur — Slow-Drifting Theme Nebula Blobs */}
      <div
        aria-hidden="true"
        className={`absolute -top-12 -left-16 w-72 sm:w-[28rem] h-72 sm:h-[28rem] rounded-full blur-[95px] pointer-events-none animate-nebula-a transition-opacity duration-700 ${
          isPlaying ? 'opacity-35' : 'opacity-15'
        }`}
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-cyan), 0.55), transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className={`absolute -bottom-16 -right-16 w-72 sm:w-[28rem] h-72 sm:h-[28rem] rounded-full blur-[100px] pointer-events-none animate-nebula-b transition-opacity duration-700 ${
          isPlaying ? 'opacity-35' : 'opacity-15'
        }`}
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-purple), 0.55), transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 h-64 sm:h-80 rounded-full blur-[110px] pointer-events-none animate-pulse transition-opacity duration-700 ${
          isPlaying ? 'opacity-25' : 'opacity-10'
        }`}
        style={{ background: 'radial-gradient(circle, rgba(var(--accent-pink), 0.5), transparent 70%)' }}
      />

      {/* ── TOP BAR: Navigation & Tabs ── */}
      <header className="relative z-20 flex items-center justify-between max-w-2xl mx-auto w-full shrink-0 gap-1 xs:gap-2 pt-[env(safe-area-inset-top,0.25rem)] pb-1">
        
        {/* Minimize Button */}
        <button
          type="button"
          onClick={handleMinimizeModal}
          className="flex items-center gap-1.5 px-2 xs:px-3 sm:px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition font-bold text-xs backdrop-blur-xl shrink-0 border border-white/15 shadow-md"
          title="Minimize to Floating Bar"
        >
          <ChevronDown className="w-4 h-4 text-accentCyan" />
          <span className="hidden sm:inline">Minimize</span>
        </button>

        {/* Center Tab Switcher */}
        <div className="flex items-center gap-0.5 xs:gap-1 bg-black/60 border border-white/20 p-0.5 xs:p-1 rounded-full backdrop-blur-2xl shadow-xl">
          <button
            type="button"
            onClick={() => setModalTab('player')}
            className={`flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 rounded-full text-[11px] xs:text-xs font-bold transition active:scale-95 ${
              modalTab === 'player'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow-[0_0_15px_rgba(var(--accent-cyan),0.4)]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Music2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" />
            <span>Player</span>
          </button>
          
          <button
            type="button"
            onClick={() => setModalTab('lyrics')}
            className={`flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 rounded-full text-[11px] xs:text-xs font-bold transition active:scale-95 ${
              modalTab === 'lyrics'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow-[0_0_15px_rgba(var(--accent-cyan),0.4)]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <FileText className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" />
            <span>Lyrics</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('queue')}
            className={`flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 rounded-full text-[11px] xs:text-xs font-bold transition active:scale-95 whitespace-nowrap ${
              modalTab === 'queue'
                ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-white shadow-[0_0_15px_rgba(var(--accent-cyan),0.4)]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <ListMusic className="w-3 h-3 xs:w-3.5 xs:h-3.5 shrink-0" />
            <span>Queue ({queue.length})</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleCloseModal}
          className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500/40 active:scale-95 text-white hover:text-red-200 transition border border-white/15 shadow-md shrink-0"
          title="Stop & Close Music"
        >
          <X className="w-3.5 h-3.5 xs:w-4 xs:h-4 stroke-[2.5]" />
        </button>
      </header>

      {/* ── MAIN STAGE AREA ── */}
      <main className="relative z-10 max-w-2xl mx-auto w-full flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden py-1">
        
        {/* 1. PLAYER VIEW */}
        {modalTab === 'player' && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-between gap-1.5 xs:gap-2 sm:gap-3 w-full animate-fade-in text-center px-2 py-1 my-auto overflow-y-auto scrollbar-none">
            
            {/* View Style Switcher */}
            <div className="flex items-center gap-1 bg-white/15 border-2 border-white/20 p-0.5 rounded-full text-[10.5px] xs:text-[11px] font-bold text-slate-200 backdrop-blur-md shrink-0 shadow-md">
              <button
                type="button"
                onClick={() => setViewStyle('poster')}
                className={`flex items-center gap-1 px-3 py-0.5 rounded-full transition ${viewStyle === 'poster' ? 'bg-accentCyan text-black font-black shadow-[0_0_10px_rgba(var(--accent-cyan),0.5)]' : 'hover:text-white'}`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Poster Art</span>
              </button>
              <button
                type="button"
                onClick={() => setViewStyle('vinyl')}
                className={`flex items-center gap-1 px-3 py-0.5 rounded-full transition ${viewStyle === 'vinyl' ? 'bg-accentCyan text-black font-black shadow-[0_0_10px_rgba(var(--accent-cyan),0.5)]' : 'hover:text-white'}`}
              >
                <Disc3 className="w-3.5 h-3.5" />
                <span>Vinyl Disc</span>
              </button>
            </div>

            {/* Artwork + Live Canvas Audio Spectrum Visualizer Stage */}
            <div className="relative flex items-center justify-center my-auto shrink-0 w-56 h-56 xs:w-64 xs:h-64 sm:w-80 sm:h-80 md:w-[22rem] md:h-[22rem] max-h-[34vh] sm:max-h-[42vh]">
              {/* Circular Audio Frequency Spectrum Canvas */}
              <canvas
                ref={spectrumCanvasRef}
                aria-hidden="true"
                className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-90"
              />

              {/* Poster Art View */}
              {viewStyle === 'poster' && (
                <div className="relative group shrink-0 flex items-center justify-center z-10">
                  {/* Ambient background glow matching album art */}
                  <div 
                    className="absolute -inset-4 rounded-3xl blur-2xl opacity-40 scale-95 transition-opacity duration-700 pointer-events-none hidden sm:block"
                    style={{
                      backgroundImage: `url(${trackImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 max-h-[24vh] sm:max-h-[30vh] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/25 shadow-[0_15px_40px_rgba(0,0,0,0.85)] relative bg-black/40 z-10">
                    <img
                      src={trackImageUrl}
                      alt={cleanSongTitle(currentTrack.title)}
                      className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                    {isPlaying && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-1 px-2.5 py-1 bg-black/85 backdrop-blur-xl rounded-full border border-white/25 shadow-[0_0_15px_rgba(var(--accent-cyan),0.7)] z-20 pointer-events-none">
                        <span className="w-1 rounded-full bg-gradient-to-t from-accentCyan to-accentPurple animate-eq-1" />
                        <span className="w-1 rounded-full bg-gradient-to-t from-accentPurple to-accentPink animate-eq-2" />
                        <span className="w-1 rounded-full bg-gradient-to-t from-accentPink to-accentGold animate-eq-3" />
                        <span className="w-1.5 rounded-full bg-gradient-to-t from-accentCyan via-accentPurple to-accentPink animate-eq-4" />
                        <span className="w-1 rounded-full bg-gradient-to-t from-accentGold to-accentPink animate-eq-5" />
                        <span className="w-1 rounded-full bg-gradient-to-t from-accentPink to-accentPurple animate-eq-6" />
                        <span className="w-1 rounded-full bg-gradient-to-t from-accentPurple to-accentCyan animate-eq-7" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Vinyl Disc View + Animated Tonearm Needle Drop */}
              {viewStyle === 'vinyl' && (
                <div className="relative group shrink-0 flex items-center justify-center z-10 px-5 sm:px-8">
                  {/* Ambient background glow */}
                  <div 
                    className="absolute -inset-4 rounded-full blur-2xl opacity-40 scale-95 transition-opacity duration-700 pointer-events-none hidden sm:block"
                    style={{
                      backgroundImage: `url(${trackImageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div
                    className={`w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 max-h-[24vh] sm:max-h-[30vh] aspect-square rounded-full p-2 bg-gradient-to-tr from-accentCyan/40 via-accentPurple/30 to-accentPink/40 transition-shadow duration-700 relative z-10 animate-spin-slow ${
                      isPlaying ? 'shadow-[0_0_50px_rgba(var(--accent-cyan),0.55)]' : 'shadow-[0_0_25px_rgba(var(--accent-cyan),0.25)]'
                    }`}
                    style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                  >
                    <div className="w-full h-full rounded-full vinyl-grooves border-2 border-white/20 relative flex items-center justify-center shadow-2xl overflow-hidden">
                      {/* Concentric Vinyl Grooves */}
                      <div className="absolute inset-2.5 sm:inset-4 rounded-full border border-white/[0.08] pointer-events-none" />
                      <div className="absolute inset-5 sm:inset-8 rounded-full border border-white/[0.06] pointer-events-none" />
                      <div className="absolute inset-8 sm:inset-12 rounded-full border border-white/[0.05] pointer-events-none" />
                      
                      {/* Vinyl Light Sheen Overlay */}
                      <div
                        className="absolute inset-0 rounded-full pointer-events-none opacity-30"
                        style={{
                          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.18) 45deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.18) 225deg, transparent 270deg)',
                        }}
                      />

                      {/* Centered Album Label */}
                      <div className="w-14 h-14 xs:w-[72px] xs:h-[72px] sm:w-[88px] sm:h-[88px] md:w-[104px] md:h-[104px] rounded-full overflow-hidden border-2 border-white/40 relative shadow-2xl shrink-0 flex items-center justify-center">
                        <img
                          src={trackImageUrl}
                          alt={cleanSongTitle(currentTrack.title)}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_IMAGE;
                          }}
                        />
                        {/* Spindle Hole */}
                        <div className="absolute inset-0 m-auto w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#0d0d12] border-2 border-white/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] z-10 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-white/40" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pivoting Metallic Tonearm / Stylus Assembly */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 right-0 sm:-right-2 md:right-0 w-12 h-24 xs:w-14 xs:h-28 sm:w-20 sm:h-36 z-20"
                  >
                    <svg
                      viewBox="0 0 80 140"
                      className="w-full h-full overflow-visible drop-shadow-[0_6px_14px_rgba(0,0,0,0.85)]"
                      style={{
                        transformOrigin: '60px 20px',
                        transform: isPlaying ? 'rotate(24deg)' : 'rotate(-4deg)',
                        transition: 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    >
                      {/* Pivot Gimbal Base */}
                      <circle cx="60" cy="20" r="14" fill="#141a30" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />
                      <circle cx="60" cy="20" r="6" fill="rgb(var(--accent-cyan))" opacity={isPlaying ? '0.95' : '0.45'} />
                      {/* Counterweight */}
                      <rect x="54" y="2" width="12" height="10" rx="2" fill="#2c3554" stroke="rgba(255,255,255,0.25)" />
                      {/* Tonearm Tube */}
                      <path
                        d="M60 22 L54 88 L38 112"
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="4.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Headshell & Glowing Stylus Tip */}
                      <path
                        d="M41 108 L31 124 L37 128 L46 112 Z"
                        fill="#1e293b"
                        stroke="rgba(var(--accent-cyan),0.8)"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="34"
                        cy="126"
                        r="2.8"
                        fill={isPlaying ? 'rgb(var(--accent-cyan))' : '#64748b'}
                      />
                    </svg>
                  </div>

                  {isPlaying && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-1 px-2.5 py-1 bg-black/85 backdrop-blur-xl rounded-full border border-white/25 shadow-[0_0_15px_rgba(var(--accent-cyan),0.7)] z-20 pointer-events-none">
                      <span className="w-1 rounded-full bg-gradient-to-t from-accentCyan to-accentPurple animate-eq-1" />
                      <span className="w-1 rounded-full bg-gradient-to-t from-accentPurple to-accentPink animate-eq-2" />
                      <span className="w-1 rounded-full bg-gradient-to-t from-accentPink to-accentGold animate-eq-3" />
                      <span className="w-1.5 rounded-full bg-gradient-to-t from-accentCyan via-accentPurple to-accentPink animate-eq-4" />
                      <span className="w-1 rounded-full bg-gradient-to-t from-accentGold to-accentPink animate-eq-5" />
                      <span className="w-1 rounded-full bg-gradient-to-t from-accentPink to-accentPurple animate-eq-6" />
                      <span className="w-1 rounded-full bg-gradient-to-t from-accentPurple to-accentCyan animate-eq-7" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Prominent Track Info (Song Title, Artist, Language, Source & Actions) */}
            <div className="space-y-1 xs:space-y-1.5 max-w-sm sm:max-w-md md:max-w-lg px-2 sm:px-4 shrink-0 w-full">
              
              {/* Badges & Actions row */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {/* Audio Engine Badge */}
                <span className={`uppercase text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border-2 tracking-wider font-mono shadow-sm ${
                  (currentTrack.source === 'youtube' || (typeof currentTrack.id === 'string' && currentTrack.id.startsWith('yt_')))
                    ? 'bg-red-500/25 text-red-300 border-red-500/50'
                    : 'bg-accentCyan/25 text-accentCyan border-accentCyan/50'
                }`}>
                  {(currentTrack.source === 'youtube' || (typeof currentTrack.id === 'string' && currentTrack.id.startsWith('yt_')))
                    ? 'YouTube Music'
                    : 'JioSaavn Studio HD'}
                </span>

                {/* Language / Regional Badge */}
                <span className="uppercase text-[8.5px] xs:text-[9.5px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-accentCyan/25 text-accentCyan border-2 border-accentCyan/50 tracking-wider font-mono shadow-sm">
                  {currentTrack.language || currentTrack.category || 'GLOBAL'}
                </span>

                {currentTrack.year && (
                  <span className="text-[10px] sm:text-xs text-slate-300 font-mono font-bold">&bull; {currentTrack.year}</span>
                )}
                
                {/* Add to Playlist button */}
                <button
                  type="button"
                  onClick={() => openAddToPlaylist(currentTrack)}
                  className="p-1.5 rounded-full transition active:scale-90 bg-white/15 border border-white/20 text-slate-200 hover:text-accentCyan hover:bg-accentCyan/25 shadow-sm"
                  title="Add to Playlist"
                >
                  <FolderPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* Favorite Heart button */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(currentTrack)}
                  className={`p-1.5 rounded-full transition active:scale-90 border border-white/20 shadow-sm ${
                    isFavorite(currentTrack.id)
                      ? 'bg-red-500 text-white border-red-400'
                      : 'bg-white/15 text-slate-200 hover:text-white hover:bg-white/25'
                  }`}
                  title={isFavorite(currentTrack.id) ? 'Liked' : 'Add to Favorites'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite(currentTrack.id) ? 'fill-current text-white' : ''}`} />
                </button>
              </div>

              {/* Song Title */}
              <h1 className="text-sm xs:text-base sm:text-xl md:text-2xl font-black font-outfit text-white tracking-tight leading-tight line-clamp-1 drop-shadow-md">
                {cleanSongTitle(currentTrack.title)}
              </h1>

              {/* Singer / Artist Subtitle */}
              <p className="text-[11px] xs:text-xs sm:text-sm text-slate-200 font-semibold truncate max-w-xs sm:max-w-sm md:max-w-md mx-auto block leading-tight">
                {cleanArtistName(currentTrack.artist, currentTrack)}
              </p>
            </div>

          </div>
        )}

        {/* 2. LYRICS VIEW */}
        {modalTab === 'lyrics' && (
          <div className="w-full h-full min-h-0 flex-1 flex flex-col glass-panel rounded-2xl sm:rounded-3xl border border-white/20 p-3 sm:p-5 backdrop-blur-3xl bg-[#12162d]/95 shadow-2xl overflow-hidden animate-fade-in">
            
            {/* Header / Track Mini Info */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 shrink-0 gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <img
                  src={trackImageUrl}
                  alt={cleanText(currentTrack.title)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/20 shadow-md shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h2 className="text-xs sm:text-sm md:text-base font-bold text-white font-outfit truncate flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-accentCyan shrink-0" />
                    <span className="truncate">{cleanText(currentTrack.title)}</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-400 truncate">{cleanArtistName(currentTrack.artist, currentTrack)}</p>
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
                  type="button"
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
                className="overflow-y-auto space-y-2.5 sm:space-y-3.5 flex-1 min-h-0 pr-1.5 sm:pr-3 custom-scrollbar py-4 select-none"
              >
                {lyricsData.syncedLyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  const dist = activeLyricIndex >= 0 ? Math.abs(idx - activeLyricIndex) : 2;
                  const isAdjacent = dist === 1;
                  const isSeeking = seekFlashIdx === idx;
                  return (
                    <div
                      key={`lyric-${idx}`}
                      onClick={() => {
                        setSeekFlashIdx(idx);
                        seek(line.time);
                        setTimeout(() => setSeekFlashIdx((cur) => (cur === idx ? null : cur)), 500);
                      }}
                      className={`relative overflow-hidden text-center sm:text-left transition-all duration-300 cursor-pointer rounded-xl px-3 py-2 sm:py-2.5 select-none ${
                        isActive
                          ? 'text-white font-extrabold text-base sm:text-xl md:text-2xl scale-[1.02] bg-gradient-to-r from-accentCyan/20 via-accentPurple/15 to-transparent border border-accentCyan/50 shadow-[0_0_24px_rgba(var(--accent-cyan),0.35)] opacity-100'
                          : isSeeking
                            ? 'text-accentCyan bg-accentCyan/15 border border-accentCyan/40 scale-[1.01] opacity-100'
                            : isAdjacent
                              ? 'text-gray-300 opacity-75 hover:opacity-100 hover:bg-white/5 text-sm sm:text-base md:text-lg font-semibold'
                              : 'text-gray-400 opacity-45 hover:opacity-85 hover:bg-white/5 text-xs sm:text-sm md:text-base font-medium'
                      }`}
                    >
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="hidden sm:block absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-to-b from-accentCyan to-accentPurple shadow-[0_0_10px_rgba(var(--accent-cyan),0.8)]"
                        />
                      )}
                      <p className={`leading-snug flex items-center justify-center sm:justify-start gap-2 ${isActive ? 'sm:pl-2 drop-shadow-[0_0_12px_rgba(var(--accent-cyan),0.55)]' : ''}`}>
                        {line?.text ? (
                          <span>{line.text}</span>
                        ) : (
                          <Music className="w-4 h-4 inline-block opacity-60" />
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : lyricsData.plainLyrics && !lyricsData.plainLyrics.toLowerCase().includes('no synchronized or plain lyrics') && !lyricsData.plainLyrics.toLowerCase().includes('no lyrics available') ? (
              <div className="overflow-y-auto space-y-1.5 flex-1 min-h-0 pr-1.5 sm:pr-3 custom-scrollbar py-4 text-center sm:text-left select-none">
                {lyricsData.plainLyrics.split(/\r?\n/).map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) {
                    return <div key={`plain-gap-${idx}`} className="h-3" />;
                  }
                  const isHighlighted = tappedPlainIdx === idx;
                  return (
                    <p
                      key={`plain-${idx}`}
                      onClick={() => setTappedPlainIdx((cur) => (cur === idx ? null : idx))}
                      className={`px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer leading-relaxed ${
                        isHighlighted
                          ? 'text-accentCyan font-bold text-sm sm:text-base md:text-lg bg-accentCyan/15 border border-accentCyan/40 shadow-[0_0_18px_rgba(var(--accent-cyan),0.25)] scale-[1.01]'
                          : 'text-gray-200/85 hover:text-white hover:bg-white/5 text-xs sm:text-sm md:text-base font-medium'
                      }`}
                    >
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 min-h-0 text-center p-4 sm:p-6 space-y-3 my-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/20 shadow-xl shrink-0">
                  <img
                    src={trackImageUrl}
                    alt={cleanText(currentTrack.title)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-sm sm:text-base font-bold text-white font-outfit">{cleanText(currentTrack.title)}</h3>
                  <p className="text-xs text-gray-400">{cleanText(currentTrack.artist)}</p>
                  <p className="text-xs text-accentCyan/90 font-mono pt-1 flex items-center justify-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-accentCyan shrink-0" />
                    <span>Synchronized lyrics are not available for this track yet.</span>
                  </p>
                </div>
                <button
                  type="button"
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
          <div className="w-full h-full min-h-0 flex-1 flex flex-col glass-panel rounded-2xl sm:rounded-3xl border border-white/20 p-3 sm:p-5 backdrop-blur-3xl bg-[#12162d]/95 shadow-2xl overflow-hidden animate-fade-in">
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
                        ? 'bg-accentCyan/20 border border-accentCyan/40 text-white shadow-[0_0_15px_rgba(var(--accent-cyan),0.25)]'
                        : 'hover:bg-white/10 text-gray-300 border border-transparent'
                    }`}
                  >
                    <div
                      onClick={() => playTrack(t, queue)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={t.image || FALLBACK_IMAGE}
                        alt={cleanText(t.title)}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0 shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isCurrent && <EqualizerBars isPlaying={isPlaying} size="sm" bars={3} />}
                          <p className={`font-bold text-xs sm:text-sm truncate ${isCurrent ? 'text-accentCyan' : 'text-white'}`}>
                            {cleanText(t.title)}
                          </p>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate">{cleanText(t.artist)}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-gray-400">{formatTime(t.duration)}</span>
                    <button
                      type="button"
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
      <footer className="relative z-20 max-w-lg mx-auto w-full shrink-0 space-y-2 pt-1 pb-[env(safe-area-inset-bottom,0.25rem)] px-3">
        
        {/* Scrubber Bar */}
        <div className="space-y-1 px-1">
          <div
            ref={scrubberRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            className="relative w-full h-2 rounded-full bg-white/20 cursor-pointer overflow-visible group/scrubber"
          >
            <div
              className="absolute top-0 bottom-0 left-0 rounded-full bg-gradient-to-r from-accentPurple via-accentCyan to-accentPink shadow-[0_0_12px_rgba(var(--accent-cyan),0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_#fff]"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-gray-300 px-0.5">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-0.5 xs:gap-2 sm:gap-4 md:gap-5">
          <button
            type="button"
            onClick={toggleShuffle}
            className={`p-1.5 xs:p-2 rounded-full transition active:scale-90 ${
              isShuffling ? 'text-accentCyan bg-accentCyan/20 shadow-[0_0_12px_rgba(var(--accent-cyan),0.4)]' : 'text-gray-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={prevTrack}
            className="p-1.5 xs:p-2 text-gray-200 hover:text-white rounded-full hover:bg-white/10 transition active:scale-90"
            title="Previous Track"
          >
            <SkipBack className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={() => skipBackward(10)}
            className="relative p-1.5 xs:p-2 text-gray-200 hover:text-accentCyan rounded-full hover:bg-accentCyan/10 transition active:scale-90 flex items-center justify-center group"
            title="Rewind 10s"
          >
            <RotateCcw className="w-[18px] h-[18px] transition-transform group-hover:-rotate-45" />
            <span className="absolute text-[7px] font-extrabold text-accentCyan font-mono pointer-events-none">10</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePlayWithRipple}
            disabled={isLoading}
            className="relative overflow-visible w-11 h-11 xs:w-12 xs:h-12 sm:w-[52px] sm:h-[52px] rounded-full bg-gradient-to-tr from-accentCyan via-accentPurple to-accentPink text-white flex items-center justify-center shadow-[0_0_25px_rgba(var(--accent-cyan),0.5)] hover:shadow-[0_0_35px_rgba(var(--accent-cyan),0.8)] active:scale-95 transition-all disabled:opacity-50 mx-0.5 xs:mx-1"
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
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => skipForward(10)}
            className="relative p-1.5 xs:p-2 text-gray-200 hover:text-accentCyan rounded-full hover:bg-accentCyan/10 transition active:scale-90 flex items-center justify-center group"
            title="Forward 10s"
          >
            <RotateCw className="w-[18px] h-[18px] transition-transform group-hover:rotate-45" />
            <span className="absolute text-[7px] font-extrabold text-accentCyan font-mono pointer-events-none">10</span>
          </button>

          <button
            type="button"
            onClick={nextTrack}
            className="p-1.5 xs:p-2 text-gray-200 hover:text-white rounded-full hover:bg-white/10 transition active:scale-90"
            title="Next Track"
          >
            <SkipForward className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={toggleLoop}
            className={`p-1.5 xs:p-2 rounded-full transition active:scale-90 ${
              isLooping !== 'none' ? 'text-accentCyan bg-accentCyan/20 shadow-[0_0_12px_rgba(var(--accent-cyan),0.4)]' : 'text-gray-400 hover:text-white'
            }`}
            title={`Loop: ${isLooping}`}
          >
            {isLooping === 'track' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Volume Slider (Mobile, Tablet & Desktop) */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-0.5">
          <button
            type="button"
            onClick={toggleMute}
            className="p-1 text-gray-300 hover:text-white rounded-md hover:bg-white/10 transition active:scale-90"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4 text-accentCyan" />
            ) : (
              <Volume2 className="w-4 h-4 text-accentCyan" />
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
            className="p-1 text-gray-300 hover:text-accentCyan rounded-md hover:bg-white/10 transition active:scale-90"
            title="Decrease Volume"
            aria-label="Decrease volume"
          >
            <Minus className="w-3.5 h-3.5" />
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
            className="w-28 xs:w-36 sm:w-32 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accentCyan"
          />
          <button
            type="button"
            onClick={() => {
              const base = isMuted ? 0 : volume;
              const next = Math.min(1, Math.round((base + 0.1) * 100) / 100);
              if (isMuted) toggleMute();
              setVolume(next);
            }}
            className="p-1 text-gray-300 hover:text-accentCyan rounded-md hover:bg-white/10 transition active:scale-90"
            title="Increase Volume"
            aria-label="Increase volume"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold text-gray-400 w-8 text-right shrink-0">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

      </footer>

    </div>
  );
}
