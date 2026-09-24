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
  ChevronDown,
  FolderPlus,
  Trash2,
  X,
  ListMusic,
  Shuffle,
  Film,
  Tv,
  User,
  Check,
  Edit3,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const SEARCH_CATEGORIES = [
  { id: 'all', label: 'All Music', icon: Music2 },
  { id: 'artist', label: 'Artists', icon: User },
  { id: 'movie', label: 'Movie OSTs', icon: Film },
  { id: 'series', label: 'TV Series', icon: Tv },
  { id: 'anime', label: 'Anime OSTs', icon: Sparkles },
  { id: 'song', label: 'Songs', icon: Disc3 }
];

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

const SUGGESTIONS_BY_CATEGORY = {
  all: [
    'The Wild Theme', 'Big Dawgs', 'Arijit Singh Hits', 'Leo Tamil', 'Stranger Things', 'Naruto Blue Bird', 'Imagine Dragons', 'KGF Theme', 'Pushpa 2', 'Taylor Swift', 'Demon Slayer Gurenge'
  ],
  artist: [
    'Arijit Singh', 'Taylor Swift', 'Anirudh Ravichander', 'Sonu Nigam', 'Sanjith Hegde', 'Hanumankind', 'Sid Sriram', 'Shreya Ghoshal', 'Eminem', 'The Weeknd', 'A.R. Rahman', 'Ravi Basrur'
  ],
  movie: [
    'Leo Tamil', 'KGF Ravi Basrur', 'Pushpa 2', 'Animal Movie', 'Interstellar Theme', 'RRR Naatu Naatu', 'Salaar Theme', 'Oppenheimer Soundtrack', 'Jawan Songs', 'Kabir Singh'
  ],
  series: [
    'Stranger Things Soundtrack', 'Peaky Blinders Red Right Hand', 'Game of Thrones Theme', 'Money Heist Bella Ciao', 'Dark Soundtrack', 'Wednesday Paint It Black', 'The Witcher Toss A Coin'
  ],
  anime: [
    'Naruto Blue Bird', 'Demon Slayer Gurenge', 'Jujutsu Kaisen Kaikai Kitan', 'Attack on Titan Shinzo wo Sasageyo', 'Tokyo Ghoul Unravel', 'One Piece We Are', 'Chainsaw Man Kick Back', 'Your Name Sparkle'
  ],
  song: [
    'Big Dawgs Hanumankind', 'Hunt You Down Richardson', 'Starboy', 'Believer', 'Shape of You', 'Kesariya', 'Dandelions', 'Until I Found You'
  ]
};

export default function Music() {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    playQueue,
    togglePlay,
    addToQueue,
    favorites,
    playlists,
    isFavorite,
    toggleFavorite,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
  } = useMusic();

  // Navigation Tabs: 'discover' | 'favorites' | 'playlists'
  const [activeTab, setActiveTab] = useState('discover');

  // Search & Category State
  const [searchCategory, setSearchCategory] = useState('all');
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

  // Playlists UI State
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [selectedPlaylistDetails, setSelectedPlaylistDetails] = useState(null);
  const [playlistSongsLoading, setPlaylistSongsLoading] = useState(false);
  const [playlistSongs, setPlaylistSongs] = useState([]);

  // Playlist Edit & Delete Confirmation States
  const [editingPlaylist, setEditingPlaylist] = useState(null); // { id, name, description }
  const [editPlaylistName, setEditPlaylistName] = useState('');
  const [editPlaylistDesc, setEditPlaylistDesc] = useState('');
  const [deletePlaylistConfirm, setDeletePlaylistConfirm] = useState(null); // { id, name }
  const [deleteSongConfirm, setDeleteSongConfirm] = useState(null); // { songId, title, playlistId, playlistName }
  const [playlistActionToast, setPlaylistActionToast] = useState(null);

  // Add to Playlist Modal State
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState(null);
  const [playlistAddedSuccess, setPlaylistAddedSuccess] = useState(null);

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

  // Search with explicit query, category, and pagination
  const handleSearchWithQuery = async (queryText, cat = searchCategory, pageNum = 1) => {
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
        params: {
          query: queryText.trim(),
          category: cat,
          language: selectedLang,
          page: pageNum,
          limit: 30
        }
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
    setActiveTab('discover');
    setPage(1);
    handleSearchWithQuery(searchQuery, searchCategory, 1);
  };

  const handleSuggestionClick = (tag) => {
    setSearchQuery(tag);
    setActiveTab('discover');
    setPage(1);
    setHasMore(true);
    handleSearchWithQuery(tag, searchCategory, 1);
    const songsEl = document.getElementById('music-songs-section');
    if (songsEl) {
      songsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryChange = (catId) => {
    setSearchCategory(catId);
    if (searchQuery.trim()) {
      setPage(1);
      handleSearchWithQuery(searchQuery, catId, 1);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    if (searchQuery.trim()) {
      handleSearchWithQuery(searchQuery, searchCategory, nextPage);
    } else {
      fetchTrending(selectedLang, nextPage);
    }
  };

  // Load songs for a specific playlist
  const handleOpenPlaylistDetails = async (playlist) => {
    setSelectedPlaylistDetails(playlist);
    setPlaylistSongsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token && typeof playlist.id === 'number') {
        const res = await axios.get(`/api/music/playlists/${playlist.id}/songs`);
        setPlaylistSongs(res.data.songs || []);
      } else {
        // Guest fallback or cached
        setPlaylistSongs(playlist.songs || []);
      }
    } catch (err) {
      console.error('Error fetching playlist songs:', err);
      setPlaylistSongs([]);
    } finally {
      setPlaylistSongsLoading(false);
    }
  };

  // Create playlist submission
  const handleCreatePlaylistSubmit = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const created = await createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreatePlaylistModal(false);
    if (created && songToAddToPlaylist) {
      await addSongToPlaylist(created.id, songToAddToPlaylist);
      setPlaylistAddedSuccess(`Added to "${created.name}"`);
      setTimeout(() => {
        setPlaylistAddedSuccess(null);
        setSongToAddToPlaylist(null);
      }, 1500);
    }
  };

  // Add song to selected playlist
  const handleAddSongToTargetPlaylist = async (playlistId, playlistName) => {
    if (!songToAddToPlaylist) return;
    await addSongToPlaylist(playlistId, songToAddToPlaylist);
    setPlaylistAddedSuccess(`Saved to "${playlistName}"`);
    setTimeout(() => {
      setPlaylistAddedSuccess(null);
      setSongToAddToPlaylist(null);
    }, 1500);
  };

  // Open Edit Playlist Modal
  const handleOpenEditPlaylistModal = (pl, e) => {
    e?.stopPropagation?.();
    setEditingPlaylist(pl);
    setEditPlaylistName(pl.name || '');
    setEditPlaylistDesc(pl.description || '');
  };

  // Save Edit Playlist
  const handleSaveEditPlaylist = async (e) => {
    e.preventDefault();
    if (!editingPlaylist || !editPlaylistName.trim()) return;
    await updatePlaylist(editingPlaylist.id, editPlaylistName.trim(), editPlaylistDesc.trim());
    if (selectedPlaylistDetails?.id === editingPlaylist.id) {
      setSelectedPlaylistDetails(prev => ({
        ...prev,
        name: editPlaylistName.trim(),
        description: editPlaylistDesc.trim()
      }));
    }
    setEditingPlaylist(null);
    setPlaylistActionToast('Playlist updated successfully!');
    setTimeout(() => setPlaylistActionToast(null), 2500);
  };

  // Request Delete Playlist (Opens Confirmation Modal)
  const handleRequestDeletePlaylist = (pl, e) => {
    e?.stopPropagation?.();
    setDeletePlaylistConfirm({ id: pl.id, name: pl.name });
  };

  // Execute Delete Playlist (after user confirms in modal)
  const handleExecuteDeletePlaylist = async () => {
    if (!deletePlaylistConfirm) return;
    const { id, name } = deletePlaylistConfirm;
    await deletePlaylist(id);
    if (selectedPlaylistDetails?.id === id) {
      setSelectedPlaylistDetails(null);
    }
    setDeletePlaylistConfirm(null);
    setPlaylistActionToast(`Deleted playlist "${name}"`);
    setTimeout(() => setPlaylistActionToast(null), 2500);
  };

  // Request Remove Song from Playlist (Opens Confirmation Modal)
  const handleRequestRemoveSong = (song, e) => {
    e?.stopPropagation?.();
    if (!selectedPlaylistDetails) return;
    setDeleteSongConfirm({
      songId: song.id,
      title: song.title,
      playlistId: selectedPlaylistDetails.id,
      playlistName: selectedPlaylistDetails.name
    });
  };

  // Execute Remove Song from Playlist (after user confirms in modal)
  const handleExecuteRemoveSong = async () => {
    if (!deleteSongConfirm) return;
    const { songId, title, playlistId } = deleteSongConfirm;
    await removeSongFromPlaylist(playlistId, songId);
    setPlaylistSongs(prev => prev.filter(s => s.id !== songId));
    setDeleteSongConfirm(null);
    setPlaylistActionToast(`Removed "${title}" from playlist`);
    setTimeout(() => setPlaylistActionToast(null), 2500);
  };

  useEffect(() => {
    if (activeTab === 'discover') {
      setSearchQuery('');
      setPage(1);
      fetchTrending(selectedLang, 1);
    }
  }, [selectedLang]);

  useEffect(() => {
    fetchCharts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-5 sm:py-8 px-3.5 sm:px-6 md:px-8 space-y-6 sm:space-y-8 min-h-[85vh] pb-24">
      
      {/* ── Top Header Banner & Navigation Tabs ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-2 border-b border-darkBorder">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-accentCyan/10 border border-accentCyan/20 text-accentCyan text-[11px] font-bold uppercase tracking-wider font-mono">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>High-Fidelity 320kbps Audio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-outfit tracking-tight">
            SyncStream Music &amp; Playlists
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Search by Artist, Movie, TV Series, Anime or Song name &bull; Create your favorite library &amp; custom playlists.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="flex flex-col gap-2 max-w-md w-full">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Artist, Movie, Anime, Series or Song..."
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
            {(SUGGESTIONS_BY_CATEGORY[searchCategory] || SUGGESTIONS_BY_CATEGORY.all).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSuggestionClick(tag)}
                className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-accentCyan/15 hover:text-accentCyan hover:border-accentCyan/30 border border-white/10 whitespace-nowrap transition active:scale-95 text-[10px] font-semibold"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Navigation Switcher (Discover, Liked Songs, My Playlists) ── */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => { setActiveTab('discover'); setSelectedPlaylistDetails(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition active:scale-95 border shrink-0 ${
            activeTab === 'discover'
              ? 'bg-gradient-to-r from-accentCyan/20 to-accentPurple/20 border-accentCyan text-white shadow-md'
              : 'bg-darkCard/50 border-darkBorder text-gray-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4 text-accentCyan" />
          <span>Discover &amp; Charts</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('favorites'); setSelectedPlaylistDetails(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition active:scale-95 border shrink-0 ${
            activeTab === 'favorites'
              ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400 text-white shadow-md'
              : 'bg-darkCard/50 border-darkBorder text-gray-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4 text-red-400 fill-current" />
          <span>Liked Songs / Favorites ({favorites.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('playlists'); setSelectedPlaylistDetails(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition active:scale-95 border shrink-0 ${
            activeTab === 'playlists'
              ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-accentPurple text-white shadow-md'
              : 'bg-darkCard/50 border-darkBorder text-gray-400 hover:text-white'
          }`}
        >
          <ListMusic className="w-4 h-4 text-accentPurple" />
          <span>My Playlists ({playlists.length})</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: DISCOVER & CHARTS
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'discover' && (
        <div className="space-y-6 sm:space-y-8">
          {/* Multi-Faceted Category Filter Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
                <Sparkles className="w-3.5 h-3.5 text-accentCyan" />
                <span>Search by Category</span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SEARCH_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = searchCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 border active:scale-95 ${
                      isSelected
                        ? 'bg-accentCyan text-black border-accentCyan shadow-[0_0_12px_rgba(99,210,255,0.4)]'
                        : 'bg-darkCard/60 border-darkBorder text-gray-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
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
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border active:scale-95 shrink-0 ${
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

          {/* Featured Spotlight (when no search query) */}
          {featuredSong && !searchQuery && (
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 p-3.5 sm:p-7 bg-gradient-to-r from-darkCard via-darkBg to-darkCard/80 shadow-2xl flex flex-col sm:flex-row items-center gap-3 sm:gap-6 group">
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity"
                style={{ backgroundImage: `url(${featuredSong.image})` }}
              />

              {/* Cover Art */}
              <div className="relative w-24 h-24 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-500 bg-black">
                <img
                  src={featuredSong.image || 'https://placehold.co/200x200/1e1e24/fff?text=Music'}
                  alt={featuredSong.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Meta Details */}
              <div className="relative z-10 flex-1 text-center sm:text-left space-y-2 sm:space-y-3">
                <div className="space-y-0.5 sm:space-y-1">
                  <span className="uppercase text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-accentCyan/20 text-accentCyan border border-accentCyan/40 tracking-wider font-mono">
                    Featured Spotlight &bull; {featuredSong.language}
                  </span>
                  <h2 className="text-base sm:text-2xl font-extrabold text-white font-outfit tracking-tight leading-snug">
                    {featuredSong.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium truncate">
                    {featuredSong.artist}
                  </p>
                </div>

                {/* Quick Play & Action Buttons */}
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

                  <button
                    onClick={() => toggleFavorite(featuredSong)}
                    className={`p-2.5 rounded-full border transition active:scale-95 ${
                      isFavorite(featuredSong.id)
                        ? 'bg-red-500/20 border-red-500/50 text-red-400'
                        : 'bg-white/10 border-white/15 text-gray-300 hover:text-white'
                    }`}
                    title={isFavorite(featuredSong.id) ? 'Liked' : 'Add to Favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(featuredSong.id) ? 'fill-current text-red-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => setSongToAddToPlaylist(featuredSong)}
                    className="p-2.5 rounded-full bg-white/10 border border-white/15 text-gray-300 hover:text-white transition active:scale-95"
                    title="Add to Playlist"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Songs Grid */}
          <div id="music-songs-section" className="space-y-3 sm:space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-xl font-extrabold text-white font-outfit flex items-center gap-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-accentPink" />
                <span>
                  {searchQuery
                    ? `Results for "${searchQuery}" (${SEARCH_CATEGORIES.find(c => c.id === searchCategory)?.label || 'All'})`
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
                <p className="text-xs text-gray-500">Try searching with a broader name, artist, or movie title.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                  {songs.map((song, idx) => {
                    const isCurrent = currentTrack?.id === song.id;
                    const isCurrentPlaying = isCurrent && isPlaying;
                    const isFav = isFavorite(song.id);

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

                          {/* Quick Heart on Cover */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(song);
                            }}
                            className={`absolute top-1.5 right-1.5 p-1.5 rounded-full backdrop-blur-md transition active:scale-90 ${
                              isFav
                                ? 'bg-red-500/80 text-white'
                                : 'bg-black/50 text-gray-300 hover:text-white opacity-80 sm:opacity-0 sm:group-hover:opacity-100'
                            }`}
                            title={isFav ? 'Liked' : 'Like'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current text-white' : ''}`} />
                          </button>
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
                                type="button"
                                onClick={() => setSongToAddToPlaylist(song)}
                                className="p-1 text-gray-400 hover:text-accentPurple hover:bg-white/10 rounded-md transition active:scale-90"
                                title="Add to Playlist"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
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
                                title={isCurrentPlaying ? 'Pause' : 'Play'}
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

                {/* Load More Button */}
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
                          <span>View More Tracks</span>
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
                  <span>Curated Regional Charts &amp; Soundtracks</span>
                </h3>
                <p className="text-xs text-gray-400 font-medium">Hand-picked charts from Telugu, Tamil, Kannada, Bollywood, K-Pop, Anime &amp; Global Hits.</p>
              </div>

              {chartsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-7 h-7 text-accentCyan animate-spin" />
                  <p className="text-xs font-bold text-gray-400 font-mono">Loading charts...</p>
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
                                className={`group relative flex flex-col gap-2 shrink-0 w-36 sm:w-40 cursor-pointer p-2 rounded-xl border transition-all duration-300 ${
                                  isCur ? 'bg-accentCyan/15 border-accentCyan/40' : 'border-white/5 bg-darkCard/50 hover:bg-darkCard hover:border-accentCyan/25'
                                }`}
                              >
                                <div className="relative aspect-square rounded-lg overflow-hidden border border-white/10 shadow-md bg-black">
                                  <img src={s.image || 'https://placehold.co/150x150/1e1e24/fff?text=Music'} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-9 h-9 rounded-full bg-accentCyan text-black flex items-center justify-center shadow-lg">
                                      {isCur && isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <p className={`text-xs font-bold truncate font-outfit transition-colors ${isCur ? 'text-accentCyan' : 'text-white group-hover:text-accentCyan'}`}>{s.title}</p>
                                  <p className="text-[10px] text-gray-400 truncate">{s.artist}</p>
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
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: LIKED SONGS (FAVORITE LIBRARY)
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-red-500/20 bg-gradient-to-r from-red-950/30 to-darkCard">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/30 text-white shrink-0">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-outfit">Liked Songs</h2>
                <p className="text-xs text-gray-300">{favorites.length} favorite songs in your library</p>
              </div>
            </div>

            {favorites.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playQueue(favorites, 0)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-500/30 hover:opacity-95 transition active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play All</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const shuffled = [...favorites].sort(() => Math.random() - 0.5);
                    playQueue(shuffled, 0);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold border border-white/10 transition active:scale-95"
                >
                  <Shuffle className="w-4 h-4 text-red-400" />
                  <span>Shuffle</span>
                </button>
              </div>
            )}
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-2xl border border-white/10 p-8 space-y-3">
              <Heart className="w-12 h-12 text-gray-600 mx-auto stroke-1" />
              <h3 className="text-lg font-bold text-gray-200">No liked songs yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Tap the heart icon ❤️ on any song card while exploring to add it to your permanent Favorite Library.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                className="mt-2 px-4 py-2 rounded-xl bg-accentCyan text-black font-bold text-xs transition active:scale-95"
              >
                Explore Songs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {favorites.map((song, idx) => {
                const isCurrent = currentTrack?.id === song.id;
                const isCurrentPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={`${song.id}-${idx}`}
                    className={`group relative glass-panel rounded-xl sm:rounded-2xl border p-2.5 transition-all duration-300 flex flex-col gap-2 ${
                      isCurrent
                        ? 'bg-red-500/15 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : 'border-white/5 bg-darkCard/40 hover:border-red-500/30 hover:bg-darkCard/70'
                    }`}
                  >
                    <div
                      onClick={() => {
                        if (currentTrack?.id === song.id) {
                          togglePlay();
                        } else {
                          playTrack(song, favorites);
                        }
                      }}
                      className="relative w-full aspect-square rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md cursor-pointer group-hover:scale-102 transition-transform bg-black"
                    >
                      <img
                        src={song.image || 'https://placehold.co/150x150/1e1e24/fff?text=Music'}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCurrentPlaying ? (
                          <Pause className="w-6 h-6 text-red-400 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song);
                        }}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-red-500 text-white shadow-md transition active:scale-90"
                        title="Remove from favorites"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4
                        onClick={() => {
                          if (currentTrack?.id === song.id) {
                            togglePlay();
                          } else {
                            playTrack(song, favorites);
                          }
                        }}
                        className={`text-xs sm:text-sm font-bold truncate font-outfit cursor-pointer ${
                          isCurrent ? 'text-red-400' : 'text-white'
                        }`}
                        title={song.title}
                      >
                        {song.title}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 truncate font-medium">
                        {song.artist}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] font-mono text-gray-500">{formatTime(song.duration)}</span>
                        <button
                          type="button"
                          onClick={() => setSongToAddToPlaylist(song)}
                          className="p-1 text-gray-400 hover:text-accentPurple hover:bg-white/10 rounded-md transition"
                          title="Add to Playlist"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: MY PLAYLISTS
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'playlists' && (
        <div className="space-y-6">
          {/* Header & Create Playlist Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-accentPurple/20 bg-gradient-to-r from-purple-950/30 to-darkCard">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30 text-white shrink-0">
                <ListMusic className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-outfit">My Custom Playlists</h2>
                <p className="text-xs text-gray-300">Create, organize, and play your personalized collections.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreatePlaylistModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black text-xs sm:text-sm font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-95 transition active:scale-95 shrink-0"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create New Playlist</span>
            </button>
          </div>

          {/* If Playlist is Selected, show Playlist Details View */}
          {selectedPlaylistDetails ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedPlaylistDetails(null)}
                  className="flex items-center gap-1.5 text-xs text-accentCyan hover:text-white font-bold transition active:scale-95"
                >
                  &larr; Back to all playlists
                </button>

                <div className="flex items-center gap-2">
                  {playlistSongs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => playQueue(playlistSongs, 0)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accentCyan text-black font-extrabold text-xs transition active:scale-95 shadow-md"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Playlist ({playlistSongs.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleOpenEditPlaylistModal(selectedPlaylistDetails, e)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-accentCyan/20 text-gray-300 hover:text-accentCyan border border-white/10 transition active:scale-95 text-xs font-bold"
                    title="Edit Playlist Name & Description"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleRequestDeletePlaylist(selectedPlaylistDetails, e)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition active:scale-95 text-xs font-bold"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-darkCard/60 border border-white/10">
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-outfit flex items-center gap-2">
                    <span>{selectedPlaylistDetails.name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditPlaylistModal(selectedPlaylistDetails, e)}
                      className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-accentCyan transition"
                      title="Edit Name"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </h3>
                  {selectedPlaylistDetails.description ? (
                    <p className="text-xs text-gray-300 mt-1">{selectedPlaylistDetails.description}</p>
                  ) : (
                    <p className="text-xs text-gray-500 italic mt-0.5">No description added.</p>
                  )}
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-accentPurple/20 text-accentPurple border border-accentPurple/30 self-start sm:self-auto">
                  {playlistSongs.length} Tracks
                </span>
              </div>

              {playlistSongsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-accentCyan animate-spin" />
                </div>
              ) : playlistSongs.length === 0 ? (
                <div className="text-center py-16 glass-panel rounded-2xl border border-white/10 p-6 space-y-2">
                  <Music2 className="w-10 h-10 text-gray-600 mx-auto" />
                  <h4 className="text-base font-bold text-gray-300">Playlist is empty</h4>
                  <p className="text-xs text-gray-500">Add songs to this playlist by clicking the "+" button on any track!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {playlistSongs.map((song, idx) => {
                    const isCurrent = currentTrack?.id === song.id;
                    const isCurrentPlaying = isCurrent && isPlaying;

                    return (
                      <div
                        key={`${song.id}-${idx}`}
                        className={`group relative glass-panel rounded-xl sm:rounded-2xl border p-2.5 transition-all duration-300 flex flex-col gap-2 ${
                          isCurrent
                            ? 'bg-accentPurple/20 border-accentPurple/50 shadow-md'
                            : 'border-white/5 bg-darkCard/40 hover:border-accentPurple/30'
                        }`}
                      >
                        <div
                          onClick={() => {
                            if (currentTrack?.id === song.id) {
                              togglePlay();
                            } else {
                              playTrack(song, playlistSongs);
                            }
                          }}
                          className="relative w-full aspect-square rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md cursor-pointer group-hover:scale-102 transition-transform bg-black"
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

                          {/* Remove from playlist button with confirmation trigger */}
                          <button
                            type="button"
                            onClick={(e) => handleRequestRemoveSong(song, e)}
                            className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/70 hover:bg-red-500 text-gray-300 hover:text-white transition active:scale-90 shadow-md"
                            title="Remove from playlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4
                            onClick={() => {
                              if (currentTrack?.id === song.id) {
                                togglePlay();
                              } else {
                                playTrack(song, playlistSongs);
                              }
                            }}
                            className={`text-xs sm:text-sm font-bold truncate font-outfit cursor-pointer ${
                              isCurrent ? 'text-accentCyan' : 'text-white'
                            }`}
                            title={song.title}
                          >
                            {song.title}
                          </h4>
                          <p className="text-[10px] sm:text-[11px] text-gray-400 truncate font-medium">
                            {song.artist}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[9px] font-mono text-gray-500">{formatTime(song.duration)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Playlist Cards Grid */
            <div>
              {playlists.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-2xl border border-white/10 p-8 space-y-3">
                  <ListMusic className="w-12 h-12 text-gray-600 mx-auto stroke-1" />
                  <h3 className="text-lg font-bold text-gray-200">No playlists yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Create your first playlist and start gathering your favorite tracks for parties, gym, chill, and study.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCreatePlaylistModal(true)}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold text-xs transition active:scale-95"
                  >
                    Create Playlist
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {playlists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => handleOpenPlaylistDetails(pl)}
                      className="group glass-panel rounded-2xl border border-white/10 p-4 transition-all duration-300 hover:border-accentPurple/50 hover:bg-darkCard/80 cursor-pointer space-y-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-tr from-accentPurple/40 to-accentCyan/40 flex items-center justify-center shrink-0 border border-white/10">
                          {pl.cover_image ? (
                            <img src={pl.cover_image} alt={pl.name} className="w-full h-full object-cover" />
                          ) : (
                            <ListMusic className="w-6 h-6 text-accentCyan" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-sm sm:text-base text-white truncate group-hover:text-accentCyan transition-colors">
                            {pl.name}
                          </h4>
                          <p className="text-xs text-gray-400">{pl.track_count || 0} Tracks</p>
                        </div>
                      </div>

                      {pl.description && (
                        <p className="text-[11px] text-gray-400 truncate">{pl.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPlaylistDetails(pl);
                          }}
                          className="text-xs font-bold text-accentCyan hover:underline flex items-center gap-1"
                        >
                          <span>Open Playlist</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditPlaylistModal(pl, e)}
                            className="p-1.5 rounded-lg hover:bg-accentCyan/20 text-gray-400 hover:text-accentCyan transition"
                            title="Edit Playlist Name"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleRequestDeletePlaylist(pl, e)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"
                            title="Delete Playlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Toast Notifications ── */}
      {playlistActionToast && (
        <div className="fixed bottom-24 right-6 z-[130] bg-[#11162a] border border-accentCyan/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-accentCyan shrink-0" />
          <span className="text-xs font-bold">{playlistActionToast}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: CREATE PLAYLIST
         ══════════════════════════════════════════════════════════════════════ */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md glass-panel border border-white/15 rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl bg-darkCard">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-accentCyan" />
                <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit">Create New Playlist</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePlaylistModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. Chill Beats, Gym Hype, Anime OSTs..."
                  className="w-full bg-darkBg border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="What's this playlist vibe about?"
                  className="w-full bg-darkBg border border-white/15 rounded-xl px-3.5 py-2 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition resize-none font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer hover:opacity-90"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Create Playlist</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: EDIT PLAYLIST (Name & Description)
         ══════════════════════════════════════════════════════════════════════ */}
      {editingPlaylist && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md glass-panel border border-accentCyan/30 rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl bg-[#0f1428]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-accentCyan" />
                <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit">Edit Playlist Name</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlaylist(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPlaylist} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  required
                  value={editPlaylistName}
                  onChange={(e) => setEditPlaylistName(e.target.value)}
                  placeholder="Enter playlist name"
                  className="w-full bg-darkBg border border-white/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editPlaylistDesc}
                  onChange={(e) => setEditPlaylistDesc(e.target.value)}
                  placeholder="Playlist description"
                  className="w-full bg-darkBg border border-white/20 rounded-xl px-3.5 py-2 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition resize-none font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingPlaylist(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg active:scale-95 hover:opacity-90"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3: DELETE PLAYLIST CONFIRMATION
         ══════════════════════════════════════════════════════════════════════ */}
      {deletePlaylistConfirm && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm glass-panel border border-red-500/40 rounded-3xl p-6 space-y-4 shadow-2xl bg-[#140b0e] text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-white font-outfit">Delete Playlist?</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-red-400">"{deletePlaylistConfirm.name}"</span>? All tracks saved inside will be removed.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletePlaylistConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs transition active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDeletePlaylist}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition shadow-lg shadow-red-600/30 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 4: DELETE SONG FROM PLAYLIST CONFIRMATION
         ══════════════════════════════════════════════════════════════════════ */}
      {deleteSongConfirm && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm glass-panel border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl bg-[#161208] text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-white font-outfit">Remove Track from Playlist?</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-amber-300">"{deleteSongConfirm.title}"</span> from <span className="font-bold text-white">"{deleteSongConfirm.playlistName}"</span>?
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteSongConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs transition active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRemoveSong}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition shadow-lg shadow-amber-500/30 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 5: ADD TO PLAYLIST
         ══════════════════════════════════════════════════════════════════════ */}
      {songToAddToPlaylist && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md glass-panel border border-white/15 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl bg-darkCard">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-accentCyan" />
                <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit">Add Track to Playlist</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSongToAddToPlaylist(null);
                  setPlaylistAddedSuccess(null);
                }}
                className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Song Preview Banner */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/10">
              <img
                src={songToAddToPlaylist.image || 'https://placehold.co/100x100/1e1e24/fff?text=Music'}
                alt={songToAddToPlaylist.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">{songToAddToPlaylist.title}</h4>
                <p className="text-[10px] text-gray-400 truncate">{songToAddToPlaylist.artist}</p>
              </div>
            </div>

            {playlistAddedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-scale-in">
                ✨ {playlistAddedSuccess}
              </div>
            )}

            {/* Existing Playlists List */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                Select Destination Playlist
              </label>

              {playlists.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/15 rounded-2xl p-4 space-y-2">
                  <p className="text-xs text-gray-400">You don't have any playlists yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePlaylistModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-accentCyan text-black font-bold text-xs transition active:scale-95"
                  >
                    + Create First Playlist
                  </button>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={() => handleAddSongToTargetPlaylist(pl.id, pl.name)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-accentCyan/15 border border-white/10 hover:border-accentCyan/40 text-left transition group active:scale-98"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ListMusic className="w-4 h-4 text-accentCyan" />
                        <span className="text-xs font-bold text-white group-hover:text-accentCyan truncate">{pl.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">{pl.track_count || 0} songs</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick create new playlist trigger */}
            {playlists.length > 0 && (
              <button
                type="button"
                onClick={() => setShowCreatePlaylistModal(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-accentCyan/50 text-gray-300 hover:text-accentCyan font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Playlist for this Song</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
