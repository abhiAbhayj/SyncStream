import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useMusic } from '../context/MusicContext';
import {
  Music2,
  Play,
  Pause,
  Plus,
  Search,
  Sparkles,
  Flame,
  Radio,
  Disc3,
  Loader2,
  Clock,
  Heart,
  TrendingUp,
  Volume2,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const LANGUAGES = [
  { id: 'all', label: 'All Hits', flag: '🔥' },
  { id: 'blues_rap', label: 'Blues Rap', flag: '🎷' },
  { id: 'rap', label: 'Rap & Hip-Hop', flag: '🎤' },
  { id: 'rock', label: 'Rock', flag: '🎸' },
  { id: 'kpop', label: 'K-Pop', flag: '🇰🇷' },
  { id: 'korean', label: 'Korean', flag: '🇰🇷' },
  { id: 'hindi', label: 'Hindi', flag: '🇮🇳' },
  { id: 'anime', label: 'Anime', flag: '🌸' },
  { id: 'english', label: 'English', flag: '🌍' },
  { id: 'kannada', label: 'Kannada', flag: '🦁' },
  { id: 'malayalam', label: 'Malayalam', flag: '🌿' },
  { id: 'telugu', label: 'Telugu', flag: '🎬' },
  { id: 'tamil', label: 'Tamil', flag: '⚡' },
  { id: 'marathi', label: 'Marathi', flag: '🚩' }
];

const FAMOUS_ARTISTS = [
  'Sonu Nigam',
  'Sanjith Hegde',
  'Sai Abhyankkar',
  'Arijit Singh',
  'Sid Sriram',
  'Shreya Ghoshal',
  'Anirudh Ravichander',
  'A.R. Rahman',
  'Armaan Malik',
  'Ravi Basrur',
  'Vijay Prakash',
  'Sushin Shyam',
  'Devi Sri Prasad',
  'Imagine Dragons',
  'Lady Gaga',
  'Alan Walker',
  'DJ Snake',
  'BLACKPINK',
  'BTS',
  'Harrdy Sandhu',
  'Guru Randhawa',
  'Hanumankind',
  'Sia',
  'Ed Sheeran',
  'Ellie Goulding',
  'Aish',
  'Lee Richardson',
  'Taylor Swift',
  'The Weeknd',
  'Eminem',
  'Kendrick Lamar',
  'Coldplay',
  'Linkin Park'
];

const POPULAR_SEARCH_TAGS = [
  'Sonu Nigam Hits',
  'Sanjith Hegde',
  'The Wild Theme',
  'Hunt You Down',
  'Imagine Dragons',
  'Big Dawgs',
  'Sai Abhyankkar',
  'Arijit Singh',
  'Sid Sriram',
  'Shreya Ghoshal',
  'Lady Gaga',
  'Alan Walker',
  'DJ Snake',
  'BLACKPINK',
  'Ravi Basrur',
  'Harrdy Sandhu',
  'Guru Randhawa',
  'Hanumankind',
  'Sia',
  'Ed Sheeran',
  'Ellie Goulding',
  'Aish',
  'Lee Richardson'
];

export default function Music() {
  const { currentTrack, isPlaying, playTrack, playQueue, togglePlay, addToQueue } = useMusic();

  const [selectedLang, setSelectedLang] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(false);
  const [featuredSong, setFeaturedSong] = useState(null);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Fetch trending songs by language with pagination
  const fetchTrending = async (lang = 'all', pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await axios.get('/api/music/trending', {
        params: { language: lang, page: pageNum, limit: 24 }
      });
      const trackList = res.data.songs || [];
      if (pageNum === 1) {
        setSongs(trackList);
        if (trackList.length > 0) {
          setFeaturedSong(trackList[0]);
        }
      } else {
        setSongs(prev => {
          const seen = new Set(prev.map(p => p.id));
          const newUnique = trackList.filter(t => !seen.has(t.id));
          return [...prev, ...newUnique];
        });
      }
      setHasMore(trackList.length >= 8);
    } catch (err) {
      console.error('Error fetching trending music:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch curated charts
  const fetchCharts = async () => {
    setChartsLoading(true);
    try {
      const res = await axios.get('/api/music/charts');
      setCharts(res.data || []);
    } catch (err) {
      console.error('Error fetching charts:', err);
    } finally {
      setChartsLoading(false);
    }
  };

  // Search with explicit query and pagination
  const handleSearchWithQuery = async (queryText, pageNum = 1, langParam = 'all') => {
    if (!queryText || !queryText.trim()) {
      fetchTrending(selectedLang, 1);
      return;
    }

    if (pageNum === 1) {
      setSearching(true);
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await axios.get('/api/music/search', {
        params: { query: queryText.trim(), language: langParam, page: pageNum, limit: 30 }
      });
      const trackList = res.data.songs || [];
      if (pageNum === 1) {
        setSongs(trackList);
      } else {
        setSongs(prev => {
          const seen = new Set(prev.map(p => p.id));
          const newUnique = trackList.filter(t => !seen.has(t.id));
          return [...prev, ...newUnique];
        });
      }
      setHasMore(trackList.length >= 8);
    } catch (err) {
      console.error('Error searching music:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle Search submit
  const handleSearch = (e) => {
    e?.preventDefault?.();
    setPage(1);
    handleSearchWithQuery(searchQuery, 1, selectedLang);
  };

  const handleArtistClick = (artist) => {
    setSelectedLang('all');
    setSearchQuery(artist);
    setSearching(true);
    setPage(1);
    setHasMore(true);
    handleSearchWithQuery(artist, 1, 'all');
    const songsEl = document.getElementById('music-songs-section');
    if (songsEl) {
      songsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTagClick = (tag) => {
    setSelectedLang('all');
    setSearchQuery(tag);
    setSearching(true);
    setPage(1);
    setHasMore(true);
    handleSearchWithQuery(tag, 1, 'all');
    const songsEl = document.getElementById('music-songs-section');
    if (songsEl) {
      songsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    if (searchQuery.trim()) {
      handleSearchWithQuery(searchQuery, nextPage, selectedLang);
    } else {
      fetchTrending(selectedLang, nextPage);
    }
  };

  const handleLanguageSelect = (langId) => {
    setSelectedLang(langId);
    setSearchQuery('');
    setPage(1);
    setHasMore(true);
  };

  const handleViewMoreChart = (chartId) => {
    const chartToLang = {
      trending_global: 'all',
      blues_rap: 'blues_rap',
      rap: 'rap',
      rock: 'rock',
      kpop: 'kpop',
      korean: 'korean',
      bollywood: 'hindi',
      anime: 'anime',
      global_pop: 'english',
      kannada: 'kannada',
      malayalam: 'malayalam',
      telugu: 'telugu',
      tamil: 'tamil',
      marathi: 'marathi'
    };
    const targetLang = chartToLang[chartId] || chartId;
    setSelectedLang(targetLang);
    setSearchQuery('');
    setPage(1);
    setHasMore(true);
    const songsEl = document.getElementById('music-songs-section');
    if (songsEl) {
      songsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setSearchQuery('');
    setPage(1);
    fetchTrending(selectedLang, 1);
  }, [selectedLang]);

  useEffect(() => {
    fetchCharts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-5 sm:py-8 px-3.5 sm:px-6 md:px-8 space-y-6 sm:space-y-10 min-h-[85vh]">
      
      {/* ── Top Header Banner ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-2 border-b border-darkBorder">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-accentCyan/10 border border-accentCyan/20 text-accentCyan text-[11px] font-bold uppercase tracking-wider font-mono">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>High-Fidelity 320kbps Audio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-outfit tracking-tight">
            Global & Regional Music Portal
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Stream full-duration songs in Hindi, English, K-Pop, Tamil, Telugu, Malayalam, Kannada, & more with zero interruption.
          </p>
        </div>

        {/* Search Bar & Quick Suggestions */}
        <div className="flex flex-col gap-2 max-w-md w-full">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs, artists (e.g. Hunt You Down, Kesariya)..."
              className="w-full bg-darkCard/80 border border-darkBorder rounded-2xl pl-10 pr-20 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition shadow-inner placeholder:text-gray-500 font-medium"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-white text-xs font-bold hover:shadow-[0_0_15px_rgba(99,210,255,0.4)] transition active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Quick Search Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] text-gray-400 py-0.5">
            <span className="font-semibold text-gray-500 shrink-0">Popular:</span>
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-accentCyan/15 hover:text-accentCyan hover:border-accentCyan/30 border border-white/10 whitespace-nowrap transition active:scale-95 text-[10px] font-semibold"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Language Filter Selector Chips (Touch-friendly Horizontal Scroll) ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5 text-accentCyan" />
          <span>Select Language / Genre</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  setSelectedLang(lang.id);
                  setSearchQuery('');
                  setPage(1);
                  setHasMore(true);
                }}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-accentCyan/20 to-accentPurple/20 border-accentCyan text-white shadow-[0_0_12px_rgba(99,210,255,0.25)]'
                    : 'bg-darkCard/50 border-darkBorder text-gray-400 hover:text-white hover:border-white/20 hover:bg-darkCard'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Quick Artists Bar ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider font-mono shrink-0">Artists:</span>
        {FAMOUS_ARTISTS.map((artist) => {
          const isSelected = searchQuery.toLowerCase() === artist.toLowerCase();
          return (
            <button
              key={artist}
              type="button"
              onClick={() => handleArtistClick(artist)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap transition text-xs font-semibold shrink-0 active:scale-95 border ${
                isSelected
                  ? 'bg-accentCyan text-black border-accentCyan font-bold shadow-[0_0_10px_rgba(99,210,255,0.4)]'
                  : 'bg-darkCard/60 hover:bg-accentCyan/10 hover:border-accentCyan/40 text-gray-300 hover:text-white border-darkBorder'
              }`}
            >
              {artist}
            </button>
          );
        })}
      </div>

      {/* ── Featured Hero Spotlight (Mobile & Desktop Responsive) ── */}
      {/* ── Featured Hero Spotlight (Mobile & Desktop Responsive) ── */}
      {featuredSong && !searchQuery && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 p-3.5 sm:p-7 bg-gradient-to-r from-darkCard via-darkBg to-darkCard/80 shadow-2xl flex flex-col sm:flex-row items-center gap-3 sm:gap-6 group">
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity"
            style={{ backgroundImage: `url(${featuredSong.image})` }}
          />

          {/* Hero Cover Art */}
          <div className="relative w-24 h-24 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-500">
            <img
              src={featuredSong.image || 'https://placehold.co/200x200/1e1e24/fff?text=Music'}
              alt={featuredSong.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  if (currentTrack?.id === featuredSong.id) {
                    togglePlay();
                  } else {
                    playTrack(featuredSong, songs);
                  }
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accentCyan text-black flex items-center justify-center shadow-[0_0_20px_rgba(99,210,255,0.8)] transform scale-90 group-hover:scale-100 transition-transform active:scale-95"
              >
                {currentTrack?.id === featuredSong.id && isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Hero Meta Details */}
          <div className="relative z-10 flex-1 text-center sm:text-left space-y-2 sm:space-y-3">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="uppercase text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-accentCyan/20 text-accentCyan border border-accentCyan/40 tracking-wider font-mono">
                Featured Spotlight &bull; {featuredSong.language}
              </span>
              <h2 className="text-base sm:text-3xl font-extrabold text-white font-outfit tracking-tight leading-snug">
                {featuredSong.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-medium font-sans truncate">
                {featuredSong.artist}
              </p>
            </div>

            {/* Hero Quick Play Actions */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              <button
                onClick={() => {
                  if (currentTrack?.id === featuredSong.id) {
                    togglePlay();
                  } else {
                    playTrack(featuredSong, songs);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-accentCyan to-accentPurple text-white text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(99,210,255,0.4)] hover:shadow-[0_0_30px_rgba(99,210,255,0.7)] transition active:scale-95"
              >
                {currentTrack?.id === featuredSong.id && isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    <span>Play Now</span>
                  </>
                )}
              </button>

              <button
                onClick={() => playQueue(songs, 0)}
                className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/10 transition active:scale-95"
              >
                <Disc3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accentCyan" />
                <span>Play All ({songs.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Songs Grid / List ── */}
      <div id="music-songs-section" className="space-y-3 sm:space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-xl font-extrabold text-white font-outfit flex items-center gap-2">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-accentPink" />
            <span>
              {searchQuery
                ? `Results for "${searchQuery}"`
                : `${LANGUAGES.find(l => l.id === selectedLang)?.label || 'Trending'} Tracks`}
            </span>
          </h3>

          <span className="text-[11px] font-mono text-gray-400">
            {songs.length} Tracks
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-accentCyan animate-spin" />
            <p className="text-xs font-bold text-gray-400 font-mono">Loading pristine audio streams...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl border border-white/10 p-6 space-y-2">
            <Music2 className="w-10 h-10 text-gray-600 mx-auto" />
            <h4 className="text-base font-bold text-gray-300">No tracks found</h4>
            <p className="text-xs text-gray-500">Try searching for a different song title, artist, or language category.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {songs.map((song, idx) => {
                const isCurrent = currentTrack?.id === song.id;
                const isCurrentPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={`${song.id}-${idx}`}
                    className={`group relative glass-panel rounded-xl sm:rounded-2xl border p-2 sm:p-3 transition-all duration-300 flex flex-col gap-2 overflow-hidden ${
                      isCurrent
                        ? 'bg-accentCyan/15 border-accentCyan/40 shadow-[0_0_15px_rgba(99,210,255,0.2)]'
                        : 'border-white/5 bg-darkCard/40 hover:border-accentCyan/30 hover:bg-darkCard/70'
                    }`}
                  >
                    {/* Square Album Cover */}
                    <div
                      onClick={() => {
                        if (currentTrack?.id === song.id) {
                          togglePlay();
                        } else {
                          playTrack(song, songs);
                        }
                      }}
                      className="relative w-full aspect-square rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md cursor-pointer group-hover:scale-102 transition-transform bg-black/40"
                    >
                      <img
                        src={song.image || 'https://placehold.co/150x150/1e1e24/fff?text=Music'}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCurrentPlaying ? (
                          <Pause className="w-6 h-6 text-accentCyan fill-current" />
                        ) : (
                          <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                        )}
                      </div>
                      {isCurrentPlaying && (
                        <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-accentCyan shadow-[0_0_6px_#fff]" />
                      )}
                    </div>

                    {/* Meta */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4
                        onClick={() => {
                          if (currentTrack?.id === song.id) {
                            togglePlay();
                          } else {
                            playTrack(song, songs);
                          }
                        }}
                        className={`text-xs sm:text-sm font-bold truncate font-outfit cursor-pointer transition-colors ${
                          isCurrent ? 'text-accentCyan' : 'text-white group-hover:text-accentCyan'
                        }`}
                        title={song.title}
                      >
                        {song.title}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 truncate font-medium">
                        {song.artist}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-600" />
                          {formatTime(song.duration)}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => addToQueue(song)}
                            className="p-1 text-gray-400 hover:text-accentCyan hover:bg-white/10 rounded-md transition active:scale-90"
                            title="Add to queue"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (currentTrack?.id === song.id) {
                                togglePlay();
                              } else {
                                playTrack(song, songs);
                              }
                            }}
                            className={`p-1.5 rounded-full transition active:scale-90 ${
                              isCurrentPlaying
                                ? 'bg-accentCyan text-black shadow-[0_0_8px_rgba(99,210,255,0.6)]'
                                : 'bg-white/10 text-white hover:bg-accentCyan hover:text-black'
                            }`}
                            title={isCurrentPlaying ? 'Pause' : 'Play Now'}
                          >
                            {isCurrentPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.2" />}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Load More / View More Tracks Button */}
            {hasMore && (
              <div className="flex justify-center pt-3 pb-2">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-accentCyan/20 to-accentPurple/20 hover:from-accentCyan/30 hover:to-accentPurple/30 border border-accentCyan/40 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(99,210,255,0.2)] hover:shadow-[0_0_25px_rgba(99,210,255,0.4)] transition active:scale-95 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 text-accentCyan animate-spin" />
                      <span>Loading More Songs...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-accentCyan" />
                      <span>View More {LANGUAGES.find(l => l.id === selectedLang)?.label || ''} Songs</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Curated Regional Charts */}
      {!searchQuery && (
        <div className="space-y-8 pt-4 border-t border-darkBorder">
          <div className="space-y-0.5">
            <h3 className="text-lg sm:text-2xl font-extrabold text-white font-outfit flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accentCyan" />
              <span>Curated Charts &amp; Playlists</span>
            </h3>
            <p className="text-xs text-gray-400 font-medium">Hand-picked trending charts by region — Telugu, Tamil, Kannada, Bollywood, K-Pop &amp; more.</p>
          </div>

          {chartsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-7 h-7 text-accentCyan animate-spin" />
              <p className="text-xs font-bold text-gray-400 font-mono">Loading regional charts... may take a few seconds</p>
            </div>
          ) : (
            <div className="space-y-8">
              {charts.map((chart) => {
                if (!chart.songs || chart.songs.length === 0) return null;
                return (
                  <div key={chart.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-white font-outfit">{chart.title}</h4>
                        {chart.subtitle && <p className="text-[11px] text-gray-500">{chart.subtitle}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewMoreChart(chart.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white border border-white/10 text-xs font-bold transition active:scale-95"
                        >
                          <span>View More</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (chart.songs.length > 0) playQueue(chart.songs, 0); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accentCyan/10 hover:bg-accentCyan/20 text-accentCyan border border-accentCyan/20 text-xs font-bold transition active:scale-95"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Play All</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
                      {chart.songs.map((s, idx) => {
                        const isCur = currentTrack?.id === s.id;
                        const mins = Math.floor((s.duration||0)/60);
                        const secs = String((s.duration||0)%60).padStart(2,'0');
                        return (
                          <div
                            key={`${s.id}-${idx}`}
                            onClick={() => {
                              if (currentTrack?.id === s.id) {
                                togglePlay();
                              } else {
                                playTrack(s, chart.songs);
                              }
                            }}
                            className={`group relative flex flex-col gap-2 shrink-0 w-36 sm:w-40 cursor-pointer p-2 rounded-xl border transition-all duration-300 ${isCur ? 'bg-accentCyan/15 border-accentCyan/40' : 'border-white/5 bg-darkCard/50 hover:bg-darkCard hover:border-accentCyan/25'}`}
                          >
                            <div className="relative aspect-square rounded-lg overflow-hidden border border-white/10 shadow-md">
                              <img src={s.image || 'https://placehold.co/150x150/1e1e24/fff?text=Music'} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-9 h-9 rounded-full bg-accentCyan text-black flex items-center justify-center shadow-lg">
                                  {isCur && isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                </div>
                              </div>
                              {isCur && isPlaying && (
                                <div className="absolute bottom-1.5 right-1.5 flex items-end gap-0.5">
                                  <span className="w-0.5 h-2 bg-accentCyan rounded-full animate-pulse" />
                                  <span className="w-0.5 h-3 bg-accentCyan rounded-full animate-pulse [animation-delay:0.2s]" />
                                  <span className="w-0.5 h-1.5 bg-accentCyan rounded-full animate-pulse [animation-delay:0.4s]" />
                                </div>
                              )}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <p className={`text-xs font-bold truncate font-outfit transition-colors ${isCur ? 'text-accentCyan' : 'text-white group-hover:text-accentCyan'}`}>{s.title}</p>
                              <p className="text-[10px] text-gray-400 truncate">{s.artist}</p>
                              <p className="text-[9px] font-mono text-gray-600">{mins}:{secs}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
