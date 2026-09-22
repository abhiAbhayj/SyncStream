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
  FolderPlus,
  ListMusic,
  Trash2,
  X,
  Check,
  Shuffle,
  ChevronDown,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const LANGUAGES = [
  { id: 'all', label: 'All Hits', flag: '🔥' },
  { id: 'english', label: 'English Pop', flag: '🌍' },
  { id: 'hindi', label: 'Hindi Bollywood', flag: '🇮🇳' },
  { id: 'telugu', label: 'Telugu Hits', flag: '🎬' },
  { id: 'tamil', label: 'Tamil Kollywood', flag: '⚡' },
  { id: 'punjabi', label: 'Punjabi Wave', flag: '🚜' },
  { id: 'kpop', label: 'K-Pop', flag: '🇰🇷' },
  { id: 'rap', label: 'Rap & Hip-Hop', flag: '🎤' },
  { id: 'anime', label: 'Anime & J-Pop', flag: '🌸' },
  { id: 'kannada', label: 'Kannada', flag: '🦁' },
  { id: 'malayalam', label: 'Malayalam', flag: '🌿' },
  { id: 'rock', label: 'Rock & Metal', flag: '🎸' },
  { id: 'marathi', label: 'Marathi', flag: '🚩' }
];

const FAMOUS_ARTISTS = [
  'Sabrina Carpenter',
  'Arijit Singh',
  'Hanumankind',
  'Lady Gaga',
  'Anirudh Ravichander',
  'Sid Sriram',
  'Karan Aujla',
  'Taylor Swift',
  'Eminem',
  'Billie Eilish',
  'Diljit Dosanjh',
  'BLACKPINK',
  'Imagine Dragons',
  'The Weeknd',
  'Devi Sri Prasad',
  'A.R. Rahman',
  'Shreya Ghoshal',
  'Sanjith Hegde',
  'Sonu Nigam',
  'Ravi Basrur'
];

const POPULAR_SEARCH_TAGS = [
  'Espresso Sabrina Carpenter',
  'Die With A Smile',
  'Big Dawgs Hanumankind',
  'Birds of a Feather',
  'Tauba Tauba Karan Aujla',
  'The Wild Theme OM Chapter 1',
  'Kesariya Arijit Singh',
  'Pushpa 2 The Rule',
  'Bling-Bang-Bang-Born',
  'Imagine Dragons Believer'
];

export default function Music() {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    playQueue,
    togglePlay,
    addToQueue,
    favorites,
    isFavorite,
    toggleFavorite,
    playlists,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist
  } = useMusic();

  // Navigation & State
  const [activeTab, setActiveTab] = useState('trending'); // 'trending' | 'charts' | 'favorites' | 'playlists'
  const [selectedLang, setSelectedLang] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [featuredSong, setFeaturedSong] = useState(null);
  const [chartsLoading, setChartsLoading] = useState(true);

  // Selected Chart Modal State
  const [selectedChart, setSelectedChart] = useState(null);
  const [chartDetailLoading, setChartDetailLoading] = useState(false);

  // Selected Custom Playlist View State
  const [selectedPlaylistView, setSelectedPlaylistView] = useState(null);

  // Playlist Add Modal State
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [playlistActionFeedback, setPlaylistActionFeedback] = useState('');

  // Fetch trending songs by language
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

  // Fetch Spotify & Billboard Charts
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

  // Open Full Tracklist for a Chart
  const handleOpenChartDetail = async (chart) => {
    setSelectedChart({ ...chart, songs: [] });
    setChartDetailLoading(true);
    try {
      const res = await axios.get(`/api/music/charts/${chart.id}`);
      setSelectedChart(res.data);
    } catch (err) {
      console.error('Error fetching chart tracks:', err);
    } finally {
      setChartDetailLoading(false);
    }
  };

  // Multi-pass Search
  const handleSearchWithQuery = async (queryText, pageNum = 1) => {
    if (!queryText || !queryText.trim()) {
      fetchTrending(selectedLang, 1);
      return;
    }

    if (pageNum === 1) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await axios.get('/api/music/search', {
        params: { query: queryText.trim(), language: selectedLang, page: pageNum, limit: 30 }
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

  const handleSearch = (e) => {
    e?.preventDefault?.();
    setActiveTab('trending');
    setPage(1);
    handleSearchWithQuery(searchQuery, 1);
  };

  const handleArtistClick = (artist) => {
    setSearchQuery(artist);
    setActiveTab('trending');
    setPage(1);
    setHasMore(true);
    handleSearchWithQuery(artist, 1);
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    setActiveTab('trending');
    setPage(1);
    setHasMore(true);
    handleSearchWithQuery(tag, 1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    if (searchQuery.trim()) {
      handleSearchWithQuery(searchQuery, nextPage);
    } else {
      fetchTrending(selectedLang, nextPage);
    }
  };

  // Create Playlist Form submit
  const handleCreatePlaylistSubmit = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName, newPlaylistDesc);
    if (songToAddToPlaylist && pl) {
      addToPlaylist(pl.id, songToAddToPlaylist);
    }
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreatePlaylistModal(false);
    setPlaylistActionFeedback(`Created "${pl.name}" successfully!`);
    setTimeout(() => setPlaylistActionFeedback(''), 3000);
  };

  // Add song to selected playlist
  const handleAddSongToTargetPlaylist = (playlistId, playlistName) => {
    if (!songToAddToPlaylist) return;
    const added = addToPlaylist(playlistId, songToAddToPlaylist);
    setPlaylistActionFeedback(added ? `Added to "${playlistName}"!` : `Already in "${playlistName}"`);
    setTimeout(() => {
      setPlaylistActionFeedback('');
      setSongToAddToPlaylist(null);
    }, 1500);
  };

  useEffect(() => {
    if (activeTab === 'trending') {
      setSearchQuery('');
      setPage(1);
      fetchTrending(selectedLang, 1);
    }
  }, [selectedLang, activeTab]);

  useEffect(() => {
    fetchCharts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 md:px-8 space-y-5 sm:space-y-8 min-h-[85vh] pb-32">
      
      {/* ── Top Header Banner & Unified Search ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-2 border-b border-darkBorder">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Spotify Charts &bull; Universal Multi-Pass Search &bull; 320kbps Lossless</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-outfit tracking-tight">
            SyncStream Music Hub &amp; Library
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Stream Top Global &amp; Regional Spotify/Billboard charts, discover viral hits, and build your personal playlists with free lossless audio.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="flex flex-col gap-2 max-w-md w-full">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any song, artist, album (e.g. Sabrina Carpenter, Arijit)..."
              className="w-full bg-darkCard/90 border border-white/10 rounded-2xl pl-10 pr-20 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition shadow-inner placeholder:text-gray-500 font-medium"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold text-xs transition active:scale-95 cursor-pointer shadow-md"
            >
              Search
            </button>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] text-gray-400 py-0.5">
            <span className="font-semibold text-gray-500 shrink-0">Viral:</span>
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-accentCyan/15 hover:text-accentCyan hover:border-accentCyan/30 border border-white/10 whitespace-nowrap transition active:scale-95 text-[10px] font-semibold cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Navigation Hub Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-white/10">
        <button
          type="button"
          onClick={() => { setActiveTab('trending'); setSelectedPlaylistView(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all border active:scale-95 shrink-0 ${
            activeTab === 'trending'
              ? 'bg-gradient-to-r from-accentCyan/20 to-accentPurple/20 border-accentCyan text-white shadow-lg shadow-accentCyan/10'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Flame className="w-4 h-4 text-accentCyan" />
          <span>🔥 Trending Hits</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('charts'); setSelectedPlaylistView(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all border active:scale-95 shrink-0 ${
            activeTab === 'charts'
              ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>🏆 Spotify &amp; Billboard Top 50</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('favorites'); setSelectedPlaylistView(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all border active:scale-95 shrink-0 ${
            activeTab === 'favorites'
              ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-400 text-white shadow-lg shadow-pink-500/10'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Heart className="w-4 h-4 text-pink-400 fill-pink-400/30" />
          <span>❤️ Liked Songs ({favorites.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('playlists'); setSelectedPlaylistView(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all border active:scale-95 shrink-0 ${
            activeTab === 'playlists'
              ? 'bg-gradient-to-r from-accentPurple/20 to-indigo-500/20 border-accentPurple text-white shadow-lg shadow-accentPurple/10'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <ListMusic className="w-4 h-4 text-accentPurple" />
          <span>📁 My Playlists ({playlists.length})</span>
        </button>
      </div>

      {/* ── Feedback Notification ── */}
      {playlistActionFeedback && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold p-3 rounded-xl text-center shadow-lg animate-fade-in flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          <span>{playlistActionFeedback}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── TAB 1: TRENDING HITS & SEARCH ── */}
      {/* ========================================================================= */}
      {activeTab === 'trending' && (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          {/* Language Filter Selector Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-accentCyan" />
              <span>Select Language / Genre Feed</span>
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

          {/* Quick Artists Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider font-mono shrink-0">Popular Artists:</span>
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

          {/* Featured Spotlight Track */}
          {featuredSong && !searchQuery && (
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 p-3.5 sm:p-7 bg-gradient-to-r from-darkCard via-darkBg to-darkCard/80 shadow-2xl flex flex-col sm:flex-row items-center gap-3 sm:gap-6 group">
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity"
                style={{ backgroundImage: `url(${featuredSong.image})` }}
              />

              {/* Cover Art */}
              <div className="relative w-28 h-28 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-500 bg-black/60">
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
                    className="w-12 h-12 rounded-full bg-accentCyan text-black flex items-center justify-center shadow-[0_0_20px_rgba(99,210,255,0.8)] transform scale-90 group-hover:scale-100 transition-transform active:scale-95"
                  >
                    {currentTrack?.id === featuredSong.id && isPlaying ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Hero Meta */}
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

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                  <button
                    onClick={() => {
                      if (currentTrack?.id === featuredSong.id) {
                        togglePlay();
                      } else {
                        playTrack(featuredSong, songs);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-accentCyan to-accentPurple text-black text-xs sm:text-sm font-extrabold shadow-lg transition active:scale-95"
                  >
                    {currentTrack?.id === featuredSong.id && isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        <span>Play Now</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => playQueue(songs, 0)}
                    className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/10 transition active:scale-95"
                  >
                    <Disc3 className="w-4 h-4 text-accentCyan" />
                    <span>Play All ({songs.length})</span>
                  </button>

                  <button
                    onClick={() => toggleFavorite(featuredSong)}
                    className={`p-2.5 rounded-full border transition active:scale-95 ${
                      isFavorite(featuredSong.id)
                        ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                    title={isFavorite(featuredSong.id) ? 'Liked' : 'Like'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(featuredSong.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Songs Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-xl font-extrabold text-white font-outfit flex items-center gap-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-accentPink" />
                <span>
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : `${LANGUAGES.find(l => l.id === selectedLang)?.label || 'Trending'} Hits`}
                </span>
              </h3>
              <span className="text-[11px] font-mono text-gray-400">{songs.length} Tracks</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-accentCyan animate-spin" />
                <p className="text-xs font-bold text-gray-400 font-mono">Resolving 320kbps streams...</p>
              </div>
            ) : songs.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-2xl border border-white/10 p-6 space-y-2">
                <Music2 className="w-10 h-10 text-gray-600 mx-auto" />
                <h4 className="text-base font-bold text-gray-300">No tracks found</h4>
                <p className="text-xs text-gray-500">Try searching for a different song title or artist.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
                  {songs.map((song, idx) => (
                    <SongCard
                      key={`${song.id}-${idx}`}
                      song={song}
                      allSongs={songs}
                      currentTrack={currentTrack}
                      isPlaying={isPlaying}
                      playTrack={playTrack}
                      togglePlay={togglePlay}
                      addToQueue={addToQueue}
                      isFavorite={isFavorite(song.id)}
                      toggleFavorite={() => toggleFavorite(song)}
                      onAddToPlaylist={() => setSongToAddToPlaylist(song)}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center pt-3 pb-2">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-accentCyan/20 to-accentPurple/20 hover:from-accentCyan/30 hover:to-accentPurple/30 border border-accentCyan/40 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 text-accentCyan animate-spin" />
                          <span>Loading More Songs...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-accentCyan" />
                          <span>View More Songs</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── TAB 2: SPOTIFY & BILLBOARD TOP 50 CHARTS ── */}
      {/* ========================================================================= */}
      {activeTab === 'charts' && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-outfit flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <span>Official Spotify &amp; Billboard Curated Charts</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              Live streaming charts updated with the most streamed tracks globally, in Bollywood, Tollywood, K-Pop, Punjabi &amp; EDM.
            </p>
          </div>

          {chartsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs font-bold text-gray-400 font-mono">Fetching Spotify Top Charts &amp; Audio Resolvers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {charts.map((chart) => (
                <div
                  key={chart.id}
                  onClick={() => handleOpenChartDetail(chart)}
                  className="group relative rounded-3xl border border-white/15 overflow-hidden bg-darkCard/80 hover:border-emerald-400/50 transition-all duration-300 shadow-xl cursor-pointer hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] flex flex-col"
                >
                  {/* Banner Image & Gradient Overlay */}
                  <div className="relative h-36 sm:h-40 overflow-hidden bg-black">
                    <img
                      src={chart.image}
                      alt={chart.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-darkCard via-darkCard/40 to-transparent" />
                    
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-[10px] font-extrabold font-mono uppercase tracking-wider backdrop-blur-md">
                      {chart.badge}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenChartDetail(chart);
                      }}
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>

                  {/* Details & Song Preview */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base sm:text-lg text-white font-outfit group-hover:text-emerald-300 transition-colors">
                        {chart.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-medium">
                        {chart.subtitle}
                      </p>
                    </div>

                    {/* Preview Track Chips */}
                    {chart.previewSongs && chart.previewSongs.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-white/10">
                        <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-wider">Top Chart Preview:</span>
                        <div className="space-y-1">
                          {chart.previewSongs.slice(0, 3).map((s, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-300 truncate">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold">#{idx + 1}</span>
                              <span className="truncate font-medium">{s.title}</span>
                              <span className="text-[10px] text-gray-500 shrink-0">&bull; {s.artist}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-xs font-bold text-emerald-400">
                      <span>Explore Top 50 Tracklist</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── TAB 3: LIKED SONGS (FAVORITES) ── */}
      {/* ========================================================================= */}
      {activeTab === 'favorites' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white font-outfit flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
                <span>My Liked Songs &amp; Favorites</span>
              </h3>
              <p className="text-xs text-gray-400">All the tracks you loved across all charts, albums &amp; genres.</p>
            </div>

            {favorites.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playQueue(favorites, 0)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-extrabold shadow-md active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play All ({favorites.length})</span>
                </button>
              </div>
            )}
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-3xl border border-white/10 p-8 space-y-3">
              <Heart className="w-12 h-12 text-gray-600 mx-auto" />
              <h4 className="text-lg font-bold text-gray-300">No liked songs yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Tap the heart icon ❤️ on any song across the Trending feeds, Spotify charts or the music player to build your collection!
              </p>
              <button
                onClick={() => setActiveTab('trending')}
                className="mt-2 px-4 py-2 rounded-xl bg-accentCyan/20 text-accentCyan border border-accentCyan/30 text-xs font-bold transition active:scale-95"
              >
                Browse Trending Hits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
              {favorites.map((song, idx) => (
                <SongCard
                  key={`${song.id}-${idx}`}
                  song={song}
                  allSongs={favorites}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  playTrack={playTrack}
                  togglePlay={togglePlay}
                  addToQueue={addToQueue}
                  isFavorite={true}
                  toggleFavorite={() => toggleFavorite(song)}
                  onAddToPlaylist={() => setSongToAddToPlaylist(song)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── TAB 4: MY PLAYLISTS (USER LIBRARY) ── */}
      {/* ========================================================================= */}
      {activeTab === 'playlists' && !selectedPlaylistView && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white font-outfit flex items-center gap-2">
                <ListMusic className="w-6 h-6 text-accentPurple" />
                <span>My Custom Playlists</span>
              </h3>
              <p className="text-xs text-gray-400">Organize your favorite music into custom playlists and play anytime.</p>
            </div>

            <button
              onClick={() => setShowCreatePlaylistModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accentPurple to-accentCyan text-black font-extrabold text-xs transition active:scale-95 shadow-md"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create New Playlist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylistView(pl)}
                className="group relative rounded-3xl border border-white/10 overflow-hidden bg-darkCard/90 hover:border-accentPurple/50 transition-all duration-300 p-5 shadow-xl cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-accentPurple/20 border border-accentPurple/40 flex items-center justify-center shrink-0 shadow-md">
                      <Disc3 className="w-7 h-7 text-accentCyan group-hover:rotate-90 transition-transform duration-500" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-white font-outfit group-hover:text-accentCyan transition-colors">
                        {pl.name}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono font-medium">
                        {pl.songs.length} Tracks
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete playlist "${pl.name}"?`)) {
                        deletePlaylist(pl.id);
                      }
                    }}
                    className="p-1.5 rounded-xl hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {pl.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 font-medium">
                    {pl.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-[10px] text-gray-500 font-mono">
                    Created {new Date(pl.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accentCyan">
                    <span>Open Playlist</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Single Playlist Details View ── */}
      {activeTab === 'playlists' && selectedPlaylistView && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPlaylistView(null)}
              className="text-xs font-bold text-gray-400 hover:text-white transition flex items-center gap-1"
            >
              <span>&larr; Back to All Playlists</span>
            </button>
          </div>

          <div className="glass-panel border border-white/15 rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-accentPurple/40 to-accentCyan/40 border border-accentCyan/40 flex items-center justify-center shrink-0">
                <Disc3 className="w-8 h-8 sm:w-10 sm:h-10 text-accentCyan" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white font-outfit">
                  {selectedPlaylistView.name}
                </h3>
                <p className="text-xs text-gray-300 font-medium">{selectedPlaylistView.description || 'Custom playlist'}</p>
                <p className="text-[11px] text-accentCyan font-mono font-bold">{selectedPlaylistView.songs.length} Tracks in Library</p>
              </div>
            </div>

            {selectedPlaylistView.songs.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playQueue(selectedPlaylistView.songs, 0)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold text-xs transition active:scale-95 shadow-md"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play Playlist</span>
                </button>
              </div>
            )}
          </div>

          {selectedPlaylistView.songs.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-3xl border border-white/10 p-8 space-y-3">
              <Music2 className="w-10 h-10 text-gray-600 mx-auto" />
              <h4 className="text-base font-bold text-gray-300">Playlist is empty</h4>
              <p className="text-xs text-gray-500">
                Browse any song in Trending or Spotify Charts and click the <strong>+</strong> button to add it here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
              {selectedPlaylistView.songs.map((song, idx) => (
                <div key={`${song.id}-${idx}`} className="relative group">
                  <SongCard
                    song={song}
                    allSongs={selectedPlaylistView.songs}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    playTrack={playTrack}
                    togglePlay={togglePlay}
                    addToQueue={addToQueue}
                    isFavorite={isFavorite(song.id)}
                    toggleFavorite={() => toggleFavorite(song)}
                    onAddToPlaylist={() => setSongToAddToPlaylist(song)}
                  />
                  <button
                    onClick={() => {
                      removeFromPlaylist(selectedPlaylistView.id, song.id);
                      setSelectedPlaylistView(prev => ({
                        ...prev,
                        songs: prev.songs.filter(s => s.id !== song.id)
                      }));
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-red-500 text-gray-400 hover:text-white transition opacity-90 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                    title="Remove from playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── MODAL: FULL CHART TRACKLIST EXPLORER ── */}
      {/* ========================================================================= */}
      {selectedChart && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-hidden">
          <div className="relative w-full max-w-3xl glass-panel border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-darkCard/95">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0 bg-darkBg/60 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-400/40 shrink-0">
                  <img src={selectedChart.image} alt={selectedChart.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit">
                    {selectedChart.title}
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-mono font-bold">
                    {selectedChart.badge} &bull; {selectedChart.songs?.length || 0} Tracks Available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedChart(null)}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Bar */}
            {selectedChart.songs?.length > 0 && (
              <div className="px-4 sm:px-6 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    playQueue(selectedChart.songs, 0);
                    setSelectedChart(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition active:scale-95 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play Full Chart ({selectedChart.songs.length})</span>
                </button>
                <span className="text-xs text-gray-400 font-mono">320kbps Lossless CDN</span>
              </div>
            )}

            {/* Tracklist Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 pb-8">
              {chartDetailLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-xs font-bold text-gray-400 font-mono">Resolving chart audio tracks...</p>
                </div>
              ) : selectedChart.songs?.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No tracks loaded for this chart.</div>
              ) : (
                selectedChart.songs.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isCurrentPlaying = isCurrent && isPlaying;
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      onClick={() => {
                        if (isCurrent) {
                          togglePlay();
                        } else {
                          playTrack(track, selectedChart.songs);
                        }
                      }}
                      className={`flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-500/15 border-emerald-400/40 text-white'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-5 text-center font-mono text-xs font-bold text-gray-500">
                          {idx + 1}
                        </span>
                        <img
                          src={track.image}
                          alt={track.title}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs sm:text-sm font-bold truncate font-outfit ${isCurrent ? 'text-emerald-400' : 'text-white'}`}>
                            {track.title}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400 truncate">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-gray-500">{formatTime(track.duration)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track);
                          }}
                          className={`p-1.5 rounded-lg transition ${
                            isFavorite(track.id) ? 'text-pink-400 fill-pink-400' : 'text-gray-500 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(track.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSongToAddToPlaylist(track);
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10"
                          title="Add to custom playlist"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ── MODAL: ADD TO PLAYLIST / CREATE PLAYLIST ── */}
      {/* ========================================================================= */}
      {songToAddToPlaylist && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md glass-panel border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 bg-darkCard/95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <ListMusic className="w-5 h-5 text-accentCyan" />
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-white font-outfit">Add to Custom Playlist</h4>
                  <p className="text-[11px] text-gray-400 truncate max-w-[240px]">{songToAddToPlaylist.title}</p>
                </div>
              </div>
              <button onClick={() => setSongToAddToPlaylist(null)} className="p-1.5 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleAddSongToTargetPlaylist(pl.id, pl.name)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-accentCyan/15 border border-white/10 hover:border-accentCyan/40 text-left transition active:scale-95 group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white group-hover:text-accentCyan truncate">{pl.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{pl.songs.length} Tracks</p>
                  </div>
                  <Plus className="w-4 h-4 text-accentCyan" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCreatePlaylistModal(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-accentPurple/50 text-accentPurple font-bold text-xs hover:bg-accentPurple/10 transition flex items-center justify-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Create Brand New Playlist</span>
            </button>
          </div>
        </div>
      )}

      {/* ── CREATE NEW PLAYLIST DIALOG ── */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleCreatePlaylistSubmit}
            className="w-full max-w-sm glass-panel border border-white/15 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl bg-darkCard"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="font-extrabold text-base text-white font-outfit flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-accentPurple" />
                <span>Create New Playlist</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowCreatePlaylistModal(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300 font-mono uppercase">Playlist Name</label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. Chill Late Night Beats"
                  className="w-full bg-darkBg border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-accentPurple"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300 font-mono uppercase">Description (Optional)</label>
                <input
                  type="text"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="e.g. My favorite road trip anthems"
                  className="w-full bg-darkBg border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-accentPurple"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accentPurple to-accentCyan text-black font-extrabold text-xs sm:text-sm shadow-lg active:scale-95 cursor-pointer"
            >
              Create Playlist
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

// ── Reusable Song Card Component ──
function SongCard({
  song,
  allSongs,
  currentTrack,
  isPlaying,
  playTrack,
  togglePlay,
  addToQueue,
  isFavorite,
  toggleFavorite,
  onAddToPlaylist
}) {
  const isCurrent = currentTrack?.id === song.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  return (
    <div
      className={`group relative glass-panel rounded-xl sm:rounded-2xl border p-2 sm:p-3 transition-all duration-300 flex flex-col gap-2 overflow-hidden ${
        isCurrent
          ? 'bg-accentCyan/15 border-accentCyan/40 shadow-[0_0_15px_rgba(99,210,255,0.2)]'
          : 'border-white/5 bg-darkCard/40 hover:border-accentCyan/30 hover:bg-darkCard/70'
      }`}
    >
      {/* Square Album Cover */}
      <div
        onClick={() => {
          if (isCurrent) {
            togglePlay();
          } else {
            playTrack(song, allSongs);
          }
        }}
        className="relative w-full aspect-square rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md cursor-pointer group-hover:scale-102 transition-transform bg-black/40"
      >
        <img
          src={song.image || 'https://placehold.co/150x150/1e1e24/fff?text=Music'}
          alt={song.title}
          className="w-full h-full object-cover"
          loading="lazy"
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

        {/* Quick Heart Icon on top-right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite();
          }}
          className={`absolute top-1.5 right-1.5 p-1.5 rounded-full backdrop-blur-md transition ${
            isFavorite ? 'bg-pink-500/80 text-white' : 'bg-black/60 text-gray-300 hover:text-white opacity-0 group-hover:opacity-100'
          }`}
          title={isFavorite ? 'Liked' : 'Like'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Meta */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <h4
          onClick={() => {
            if (isCurrent) {
              togglePlay();
            } else {
              playTrack(song, allSongs);
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
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist();
              }}
              className="p-1 text-gray-400 hover:text-accentPurple hover:bg-white/10 rounded-md transition active:scale-90"
              title="Add to Playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                addToQueue(song);
              }}
              className="p-1 text-gray-400 hover:text-accentCyan hover:bg-white/10 rounded-md transition active:scale-90"
              title="Add to Queue"
            >
              <Disc3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (isCurrent) {
                  togglePlay();
                } else {
                  playTrack(song, allSongs);
                }
              }}
              className={`p-1.5 rounded-full transition active:scale-90 ${
                isCurrentPlaying
                  ? 'bg-accentCyan text-black shadow-[0_0_8px_rgba(99,210,255,0.6)]'
                  : 'bg-white/10 text-white hover:bg-accentCyan hover:text-black'
              }`}
            >
              {isCurrentPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
