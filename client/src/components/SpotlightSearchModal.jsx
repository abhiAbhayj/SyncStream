import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMusic } from '../context/MusicContext';
import { formatMediaPoster, handlePosterError } from '../utils/posterFallback';
import {
  Search,
  Film,
  Tv,
  Sparkles,
  BookOpen,
  Music,
  X,
  Star,
  Play,
  ArrowRight,
  Command,
  CornerDownLeft,
  Loader2
} from 'lucide-react';

const TYPE_PILLS = [
  { key: 'movie', label: 'Movies', icon: Film, activeClass: 'bg-accentCyan text-black border-accentCyan shadow-[0_0_14px_rgba(var(--accent-cyan),0.55)]' },
  { key: 'tv', label: 'TV Shows', icon: Tv, activeClass: 'bg-emerald-400 text-black border-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.55)]' },
  { key: 'anime', label: 'Anime', icon: Sparkles, activeClass: 'bg-purple-400 text-black border-purple-400 shadow-[0_0_14px_rgba(192,132,252,0.55)]' },
  { key: 'manga', label: 'Manga', icon: BookOpen, activeClass: 'bg-pink-400 text-black border-pink-400 shadow-[0_0_14px_rgba(244,114,182,0.55)]' },
  { key: 'music', label: 'Music', icon: Music, activeClass: 'bg-amber-400 text-black border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.55)]' },
];

const TYPEWRITER_HINTS = {
  movie: ['Search Interstellar...', 'Search Inception...', 'Search Dune: Part Two...', 'Search Avengers...'],
  tv: ['Search Stranger Things...', 'Search Breaking Bad...', 'Search Peaky Blinders...', 'Search The Last of Us...'],
  anime: ['Search Demon Slayer...', 'Search Jujutsu Kaisen...', 'Search Solo Leveling...', 'Search Attack on Titan...'],
  manga: ['Search Chainsaw Man...', 'Search One Piece...', 'Search Berserk...', 'Search Vagabond...'],
  music: ['Search Arijit Singh...', 'Search Starboy...', 'Search Blue Bird...', 'Search Big Dawgs...'],
};

export default function SpotlightSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState('movie');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Typewriter placeholder state
  const [hintText, setHintText] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { playTrack } = useMusic();

  // Global keyboard shortcut (Ctrl+K / Cmd+K) & custom trigger event
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleOpenEvent = (e) => {
      if (e?.detail?.query) setQuery(e.detail.query);
      if (e?.detail?.type) setMediaType(e.detail.type);
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-spotlight-search', handleOpenEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-spotlight-search', handleOpenEvent);
    };
  }, [isOpen]);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setSelectedIndex(-1);
    } else {
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Smart Typewriter placeholder cycling
  useEffect(() => {
    if (!isOpen || query.trim() !== '') return;

    const hints = TYPEWRITER_HINTS[mediaType] || TYPEWRITER_HINTS.movie;
    const fullWord = hints[hintIndex % hints.length];

    let timeout;
    if (!isDeleting && hintText.length < fullWord.length) {
      timeout = setTimeout(() => {
        setHintText(fullWord.slice(0, hintText.length + 1));
      }, 65);
    } else if (!isDeleting && hintText.length === fullWord.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1600);
    } else if (isDeleting && hintText.length > 0) {
      timeout = setTimeout(() => {
        setHintText(fullWord.slice(0, hintText.length - 1));
      }, 32);
    } else if (isDeleting && hintText.length === 0) {
      setIsDeleting(false);
      setHintIndex((prev) => (prev + 1) % hints.length);
    }

    return () => clearTimeout(timeout);
  }, [isOpen, query, mediaType, hintText, hintIndex, isDeleting]);

  // Reset typewriter when switching category
  useEffect(() => {
    setHintText('');
    setHintIndex(0);
    setIsDeleting(false);
  }, [mediaType]);

  // Debounced live search
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        if (mediaType === 'music') {
          const res = await axios.get('/api/music/search', {
            params: { query: trimmed, limit: 8 },
            signal: controller.signal
          });
          const songs = (res.data?.songs || []).slice(0, 8).map((s) => ({
            ...s,
            poster_path: s.image,
            media_type: 'music'
          }));
          setResults(songs);
        } else {
          const res = await axios.get('/api/media/search', {
            params: { query: trimmed, type: mediaType, page: 1 },
            signal: controller.signal
          });
          setResults((res.data || []).slice(0, 8));
        }
        setSelectedIndex(-1);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.warn('Spotlight search failed:', err.message);
        }
      } finally {
        setLoading(false);
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, mediaType, isOpen]);

  if (!isOpen) return null;

  const openItem = (item) => {
    if (!item) return;
    setIsOpen(false);
    if (item.media_type === 'music' || item.audio_url) {
      playTrack(item, results.length > 0 ? results : [item]);
      return;
    }
    const rawTargetId = item.external_media_id || item.id;
    let baseId = String(rawTargetId);
    let seasonQ = '';
    if (baseId.includes('?')) {
      const parts = baseId.split('?');
      baseId = parts[0];
      seasonQ = `?${parts[1]}`;
    } else if (item.season_number && item.season_number > 1) {
      seasonQ = `?season=${item.season_number}`;
    }
    navigate(`/media/${item.media_type || mediaType}/${baseId}${seasonQ}`);
  };

  const handleFullSearch = () => {
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}&type=${mediaType}`);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        openItem(results[selectedIndex]);
      } else {
        handleFullSearch();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-start justify-center pt-10 xs:pt-14 sm:pt-20 px-2.5 xs:px-3 sm:px-6 overflow-hidden">
      {/* Blurred dark backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xl animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Spotlight Floating Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick Spotlight Search"
        className="relative z-10 w-full max-w-2xl glass-panel border border-white/15 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.9),0_0_45px_rgba(var(--accent-cyan),0.2)] overflow-hidden animate-scale-in bg-[#0b1022]/95"
      >
        {/* Rotating Neon Beam Search Input Header */}
        <div className="p-3 xs:p-3.5 sm:p-4 border-b border-white/10 space-y-2.5 sm:space-y-3">
          <div className="neon-beam-wrapper">
            <div className="neon-beam-inner flex items-center gap-2 xs:gap-3 px-2.5 xs:px-3.5 py-2 sm:py-3">
              <Search className="w-4 h-4 xs:w-5 xs:h-5 text-accentCyan shrink-0 animate-pulse" />
              <div className="relative flex-1 min-w-0 flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  className="w-full bg-transparent text-white text-sm sm:text-base font-semibold focus:outline-none placeholder:text-transparent relative z-10"
                  placeholder="Search catalog"
                />
                {/* Smart Typewriter Animated Placeholder Overlay */}
                {query === '' && (
                  <div className="absolute inset-0 flex items-center pointer-events-none text-sm sm:text-base font-medium text-gray-400 truncate">
                    <span>{hintText || 'Search SyncStream...'}</span>
                    <span className="inline-block w-[2px] h-4 sm:h-5 bg-accentCyan ml-0.5 animate-cursor-blink shadow-[0_0_8px_rgba(var(--accent-cyan),0.9)]" />
                  </div>
                )}
              </div>

              {loading && <Loader2 className="w-4 h-4 text-accentCyan animate-spin shrink-0" />}
              {query && !loading && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition shrink-0"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-1 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition shrink-0"
                title="Close"
                aria-label="Close Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hidden sm:inline-flex items-center px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 hover:text-white transition shrink-0"
              >
                ESC
              </button>
            </div>
          </div>

          {/* Animated Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {TYPE_PILLS.map((pill) => {
              const Icon = pill.icon;
              const isSelected = mediaType === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setMediaType(pill.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all duration-200 whitespace-nowrap active:scale-95 cursor-pointer ${
                    isSelected
                      ? pill.activeClass
                      : 'bg-white/[0.04] border-white/10 text-gray-300 hover:text-white hover:border-white/25 hover:bg-white/[0.08]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Previews Body */}
        <div className="max-h-[58vh] overflow-y-auto p-3 sm:p-4 space-y-2 custom-scrollbar">
          {loading && results.length === 0 ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="w-11 h-14 rounded-xl skeleton-neon shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 skeleton-neon rounded-md" />
                    <div className="h-2.5 w-1/3 skeleton-neon rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim().length < 2 ? (
            <div className="py-10 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-accentCyan/10 border border-accentCyan/25 flex items-center justify-center mx-auto">
                <Command className="w-6 h-6 text-accentCyan animate-pulse" />
              </div>
              <p className="text-sm font-bold text-gray-200">Instant Spotlight Discovery</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Start typing at least 2 characters to search across movies, series, anime, manga, and music.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-semibold text-gray-300">No quick matches for &ldquo;{query}&rdquo;</p>
              <button
                type="button"
                onClick={handleFullSearch}
                className="btn-shimmer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accentCyan text-black text-xs font-black"
              >
                <span>Open Full Search Filters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {results.map((item, idx) => {
                const isHighlighted = idx === selectedIndex;
                const posterUrl = formatMediaPoster(item);
                const year = item.release_date ? String(item.release_date).split('-')[0] : '';
                const rating = item.vote_average ? parseFloat(item.vote_average).toFixed(1) : null;

                return (
                  <button
                    key={`${item.id}-${idx}`}
                    type="button"
                    onClick={() => openItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{ animationDelay: `${idx * 35}ms` }}
                    className={`w-full flex items-center gap-3 p-2 rounded-2xl border text-left transition-all duration-200 animate-cascade-card group cursor-pointer ${
                      isHighlighted
                        ? 'bg-accentCyan/15 border-accentCyan/60 shadow-[0_0_20px_rgba(var(--accent-cyan),0.2)]'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/15'
                    }`}
                  >
                    <img
                      src={posterUrl}
                      alt={item.title || item.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handlePosterError(e, item)}
                      className="w-11 h-14 rounded-xl object-cover shrink-0 border border-white/10 shadow-md"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className={`text-sm font-bold truncate transition-colors ${isHighlighted ? 'text-accentCyan' : 'text-white'}`}>
                        {item.title || item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                        <span className="uppercase text-[10px] font-black text-accentPurple">
                          {item.format || item.media_type || mediaType}
                        </span>
                        {year && <span>• {year}</span>}
                        {item.artist && <span className="truncate">• {item.artist}</span>}
                        {rating && parseFloat(rating) > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-amber-400 font-bold">
                            • <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {rating}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`p-2 rounded-xl transition-all shrink-0 ${
                      isHighlighted
                        ? 'bg-accentCyan text-black scale-105 shadow-md'
                        : 'bg-white/5 text-gray-400 group-hover:text-white'
                    }`}>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleFullSearch}
                className="w-full mt-2 py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-accentCyan/15 border border-white/10 hover:border-accentCyan/40 text-xs font-bold text-accentCyan flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>View all matches for &ldquo;{query}&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Keyboard Hints */}
        <div className="hidden sm:flex items-center justify-between px-4 py-2.5 bg-black/40 border-t border-white/10 text-[10px] text-gray-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-200">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><CornerDownLeft className="w-3 h-3" /> Open</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-200">ESC</kbd> Close</span>
          </div>
          <span className="text-accentCyan font-bold">SyncStream Spotlight</span>
        </div>
      </div>
    </div>
  );
}
