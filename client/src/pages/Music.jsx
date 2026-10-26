import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  ChevronDown,
  FolderPlus,
  Trash2,
  Edit3,
  AlertTriangle,
  X,
  ListMusic,
  Shuffle,
  Film,
  Tv,
  User,
  Check,
  RefreshCw,
  Globe,
  Mic2,
  Headphones,
  Zap,
  Compass,
  Layers,
  Languages,
  LayoutGrid,
  List,
  ArrowUpDown,
  GripVertical
} from 'lucide-react';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const SEARCH_CATEGORIES = [
  { id: 'all', label: 'All Music', icon: Music2, color: 'text-cyan-400 fill-cyan-400/40' },
  { id: 'artist', label: 'Artists', icon: User, color: 'text-purple-400 fill-purple-400/40' },
  { id: 'movie', label: 'Movie OSTs', icon: Film, color: 'text-amber-400 fill-amber-400/40' },
  { id: 'series', label: 'TV Series', icon: Tv, color: 'text-sky-400 fill-sky-400/40' },
  { id: 'anime', label: 'Anime OSTs', icon: Sparkles, color: 'text-pink-400 fill-pink-400' },
  { id: 'song', label: 'Songs', icon: Disc3, color: 'text-emerald-400 fill-emerald-400/40' }
];

const LANGUAGES = [
  { id: 'all', label: 'All Hits', icon: Flame, color: 'text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' },
  { id: 'blues_rap', label: 'Blues Rap', icon: Music2, color: 'text-indigo-400 fill-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' },
  { id: 'rap', label: 'Rap & Hip-Hop', icon: Mic2, color: 'text-purple-400 fill-purple-400/40 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]' },
  { id: 'rock', label: 'Rock', icon: Zap, color: 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]' },
  { id: 'kpop', label: 'K-Pop', icon: Headphones, color: 'text-pink-400 fill-pink-400/40 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]' },
  { id: 'korean', label: 'Korean', icon: Compass, color: 'text-teal-400 fill-teal-400/40 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]' },
  { id: 'hindi', label: 'Hindi', icon: Disc3, color: 'text-amber-400 fill-amber-400/40 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' },
  { id: 'anime', label: 'Anime', icon: Sparkles, color: 'text-rose-400 fill-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]' },
  { id: 'english', label: 'English', icon: Globe, color: 'text-sky-400 fill-sky-400/40 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]' },
  { id: 'kannada', label: 'Kannada', icon: Volume2, color: 'text-red-400 fill-red-400/40 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' },
  { id: 'malayalam', label: 'Malayalam', icon: Layers, color: 'text-emerald-400 fill-emerald-400/40 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' },
  { id: 'telugu', label: 'Telugu', icon: Film, color: 'text-orange-400 fill-orange-400/40 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]' },
  { id: 'tamil', label: 'Tamil', icon: Zap, color: 'text-yellow-300 fill-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.7)]' },
  { id: 'marathi', label: 'Marathi', icon: Languages, color: 'text-amber-500 fill-amber-500/40 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' }
];

const SUGGESTIONS_BY_CATEGORY = {
  all: [
    'Big Dawgs', 'Arijit Singh Hits', 'Leo Tamil', 'Stranger Things', 'Naruto Blue Bird', 'Imagine Dragons', 'KGF Theme', 'Pushpa 2', 'Taylor Swift', 'Demon Slayer Gurenge'
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

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

const getChartIcon = (id) => {
  switch (id) {
    case 'trending_global': return <Flame className="w-4 h-4 text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />;
    case 'blues_rap': return <Mic2 className="w-4 h-4 text-amber-400 fill-amber-400/40 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />;
    case 'rap': return <Headphones className="w-4 h-4 text-purple-400 fill-purple-400/40 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]" />;
    case 'rock': return <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]" />;
    case 'kpop':
    case 'korean': return <Sparkles className="w-4 h-4 text-pink-400 fill-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]" />;
    case 'bollywood': return <Film className="w-4 h-4 text-amber-400 fill-amber-400/40 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />;
    case 'anime': return <Sparkles className="w-4 h-4 text-rose-400 fill-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]" />;
    case 'global_pop': return <Globe className="w-4 h-4 text-sky-400 fill-sky-400/40 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />;
    case 'kannada':
    case 'malayalam':
    case 'telugu':
    case 'tamil':
    case 'marathi': return <Music2 className="w-4 h-4 text-cyan-400 fill-cyan-400/40 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />;
    default: return <Disc3 className="w-4 h-4 text-cyan-400 fill-cyan-400/40" />;
  }
};

export default function Music() {
  const navigate = useNavigate();
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
    reorderFavorites,
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Playlists UI State
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [selectedPlaylistDetails, setSelectedPlaylistDetails] = useState(null);
  const [playlistSongsLoading, setPlaylistSongsLoading] = useState(false);
  const [playlistSongs, setPlaylistSongs] = useState([]);

  // Edit Playlist Modal State
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editPlaylistName, setEditPlaylistName] = useState('');
  const [editPlaylistDesc, setEditPlaylistDesc] = useState('');
  const [editPlaylistSaving, setEditPlaylistSaving] = useState(false);

  // In-App Confirmation Modal State ("Are you sure?" Dialog)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    confirmVariant: 'danger',
    onConfirm: null
  });

  // Add to Playlist Modal State
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState(null);
  const [playlistAddedSuccess, setPlaylistAddedSuccess] = useState(null);

  // View mode for songs: 'card' (Card Grid) | 'list' (Compact List View)
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('syncstream_music_view') || 'card';
    } catch {
      return 'card';
    }
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('syncstream_music_view', mode);
    } catch {}
  };

  const [chartsViewMode, setChartsViewMode] = useState(() => {
    try {
      return localStorage.getItem('syncstream_charts_view') || 'card';
    } catch {
      return 'card';
    }
  });

  const handleSetChartsViewMode = (mode) => {
    setChartsViewMode(mode);
    try {
      localStorage.setItem('syncstream_charts_view', mode);
    } catch {}
  };

  // Playlist internal search & sort state
  const [playlistSearch, setPlaylistSearch] = useState('');
  const [playlistSort, setPlaylistSort] = useState('default');

  // Filtered & Sorted playlist songs
  const displayedPlaylistSongs = useMemo(() => {
    let list = [...playlistSongs];

    if (playlistSearch.trim()) {
      const q = playlistSearch.toLowerCase().trim();
      list = list.filter(song =>
        (song.title && song.title.toLowerCase().includes(q)) ||
        (song.artist && song.artist.toLowerCase().includes(q)) ||
        (song.album && song.album.toLowerCase().includes(q))
      );
    }

    switch (playlistSort) {
      case 'title_asc':
        list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'title_desc':
        list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'artist_asc':
        list.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
        break;
      case 'duration_asc':
        list.sort((a, b) => (parseInt(a.duration, 10) || 0) - (parseInt(b.duration, 10) || 0));
        break;
      case 'duration_desc':
        list.sort((a, b) => (parseInt(b.duration, 10) || 0) - (parseInt(a.duration, 10) || 0));
        break;
      case 'newest':
        list.sort((a, b) => {
          if (a.added_at && b.added_at) return new Date(b.added_at) - new Date(a.added_at);
          return 0;
        });
        break;
      case 'default':
      default:
        break;
    }

    return list;
  }, [playlistSongs, playlistSearch, playlistSort]);

  // Manual drag & drop sorting state for playlist songs
  const [draggedSongIndex, setDraggedSongIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const touchDragRef = useRef({ fromIndex: null, targetIndex: null });

  const handleReorderPlaylistSongs = (fromIndex, toIndex) => {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;

    const sourceSong = displayedPlaylistSongs[fromIndex];
    const targetSong = displayedPlaylistSongs[toIndex];
    if (!sourceSong || !targetSong) return;

    setPlaylistSongs(prev => {
      let baseList = [...prev];
      if (playlistSort !== 'default') {
        baseList = [...displayedPlaylistSongs];
      }

      const actualFrom = baseList.findIndex(s => s.id === sourceSong.id);
      const actualTo = baseList.findIndex(s => s.id === targetSong.id);
      if (actualFrom === -1 || actualTo === -1) return prev;

      const updated = [...baseList];
      const [moved] = updated.splice(actualFrom, 1);
      updated.splice(actualTo, 0, moved);

      // Save custom order to localStorage for persistence
      if (selectedPlaylistDetails?.id) {
        try {
          localStorage.setItem(
            `syncstream_playlist_order_${selectedPlaylistDetails.id}`,
            JSON.stringify(updated.map(s => s.id))
          );
        } catch (e) {}
      }
      return updated;
    });

    if (playlistSort !== 'default') {
      setPlaylistSort('default');
    }
  };

  const handleDragStart = (idx, e) => {
    setDraggedSongIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', idx.toString());
    } catch {}
  };

  const handleDragOver = (idx, e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== idx) {
      setDragOverIndex(idx);
    }
  };

  const handleDragLeave = (idx) => {
    if (dragOverIndex === idx) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (toIndex, e) => {
    e.preventDefault();
    const fromIndex = draggedSongIndex;
    if (fromIndex !== null && fromIndex !== toIndex) {
      handleReorderPlaylistSongs(fromIndex, toIndex);
    }
    setDraggedSongIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedSongIndex(null);
    setDragOverIndex(null);
  };

  // Touch Drag Support for Mobile devices (all sort options)
  const handleTouchStart = (idx) => {
    touchDragRef.current = { fromIndex: idx, targetIndex: idx };
    setDraggedSongIndex(idx);
  };

  const handleTouchMove = (e) => {
    if (touchDragRef.current.fromIndex === null) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const songCard = element?.closest('[data-song-index]');
    if (songCard) {
      const overIdx = parseInt(songCard.getAttribute('data-song-index'), 10);
      if (!isNaN(overIdx) && overIdx !== touchDragRef.current.targetIndex) {
        touchDragRef.current.targetIndex = overIdx;
        setDragOverIndex(overIdx);
      }
    }
  };

  const handleTouchEnd = () => {
    const { fromIndex, targetIndex } = touchDragRef.current;
    if (fromIndex !== null && targetIndex !== null && fromIndex !== targetIndex) {
      handleReorderPlaylistSongs(fromIndex, targetIndex);
    }
    touchDragRef.current = { fromIndex: null, targetIndex: null };
    setDraggedSongIndex(null);
    setDragOverIndex(null);
  };

  // ── Favorites Internal Search, Sort & Drag Reorder State ──
  const [favoriteSearch, setFavoriteSearch] = useState('');
  const [favoriteSort, setFavoriteSort] = useState('default');
  const [draggedFavIndex, setDraggedFavIndex] = useState(null);
  const [dragOverFavIndex, setDragOverFavIndex] = useState(null);
  const touchFavDragRef = useRef({ fromIndex: null, targetIndex: null });

  // Filtered & Sorted favorite songs
  const displayedFavorites = useMemo(() => {
    let list = [...favorites];

    if (favoriteSearch.trim()) {
      const q = favoriteSearch.toLowerCase().trim();
      list = list.filter(song =>
        (song.title && song.title.toLowerCase().includes(q)) ||
        (song.artist && song.artist.toLowerCase().includes(q)) ||
        (song.album && song.album.toLowerCase().includes(q))
      );
    }

    switch (favoriteSort) {
      case 'title_asc':
        list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'title_desc':
        list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'artist_asc':
        list.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
        break;
      case 'duration_asc':
        list.sort((a, b) => (parseInt(a.duration, 10) || 0) - (parseInt(b.duration, 10) || 0));
        break;
      case 'duration_desc':
        list.sort((a, b) => (parseInt(b.duration, 10) || 0) - (parseInt(a.duration, 10) || 0));
        break;
      case 'newest':
        list.sort((a, b) => {
          if (a.added_at && b.added_at) return new Date(b.added_at) - new Date(a.added_at);
          return 0;
        });
        break;
      case 'default':
      default:
        break;
    }

    return list;
  }, [favorites, favoriteSearch, favoriteSort]);

  const handleReorderFavorites = (fromIndex, toIndex) => {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;

    const sourceSong = displayedFavorites[fromIndex];
    const targetSong = displayedFavorites[toIndex];
    if (!sourceSong || !targetSong) return;

    let baseList = [...favorites];
    if (favoriteSort !== 'default') {
      baseList = [...displayedFavorites];
    }

    const actualFrom = baseList.findIndex(s => s.id === sourceSong.id);
    const actualTo = baseList.findIndex(s => s.id === targetSong.id);
    if (actualFrom === -1 || actualTo === -1) return;

    const updated = [...baseList];
    const [moved] = updated.splice(actualFrom, 1);
    updated.splice(actualTo, 0, moved);

    reorderFavorites(updated);

    if (favoriteSort !== 'default') {
      setFavoriteSort('default');
    }
  };

  const handleFavDragStart = (idx, e) => {
    setDraggedFavIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', idx.toString());
    } catch {}
  };

  const handleFavDragOver = (idx, e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFavIndex !== idx) {
      setDragOverFavIndex(idx);
    }
  };

  const handleFavDragLeave = (idx) => {
    if (dragOverFavIndex === idx) {
      setDragOverFavIndex(null);
    }
  };

  const handleFavDrop = (toIndex, e) => {
    e.preventDefault();
    const fromIndex = draggedFavIndex;
    if (fromIndex !== null && fromIndex !== toIndex) {
      handleReorderFavorites(fromIndex, toIndex);
    }
    setDraggedFavIndex(null);
    setDragOverFavIndex(null);
  };

  const handleFavDragEnd = () => {
    setDraggedFavIndex(null);
    setDragOverFavIndex(null);
  };

  const handleFavTouchStart = (idx) => {
    touchFavDragRef.current = { fromIndex: idx, targetIndex: idx };
    setDraggedFavIndex(idx);
  };

  const handleFavTouchMove = (e) => {
    if (touchFavDragRef.current.fromIndex === null) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const songCard = element?.closest('[data-fav-index]');
    if (songCard) {
      const overIdx = parseInt(songCard.getAttribute('data-fav-index'), 10);
      if (!isNaN(overIdx) && overIdx !== touchFavDragRef.current.targetIndex) {
        touchFavDragRef.current.targetIndex = overIdx;
        setDragOverFavIndex(overIdx);
      }
    }
  };

  const handleFavTouchEnd = () => {
    const { fromIndex, targetIndex } = touchFavDragRef.current;
    if (fromIndex !== null && targetIndex !== null && fromIndex !== targetIndex) {
      handleReorderFavorites(fromIndex, targetIndex);
    }
    touchFavDragRef.current = { fromIndex: null, targetIndex: null };
    setDraggedFavIndex(null);
    setDragOverFavIndex(null);
  };

  // Fetch trending songs by language with pagination (Dual-Engine live updated)
  const fetchTrending = async (lang = 'all', pageNum = 1, forceRefresh = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const res = await axios.get('/api/music/trending', {
        params: {
          language: lang,
          page: pageNum,
          limit: 24,
          refresh: forceRefresh ? 'true' : undefined
        }
      });
      const trackList = res.data.songs || [];
      if (pageNum === 1) {
        setSongs(trackList);
        if (trackList.length > 0) {
          setFeaturedSong(trackList[0]);
        } else {
          setFeaturedSong(null);
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

  // Fetch curated charts (Dual-Engine live updated)
  const fetchCharts = async (forceRefresh = false) => {
    setChartsLoading(true);
    try {
      const res = await axios.get('/api/music/charts', {
        params: { refresh: forceRefresh ? 'true' : undefined }
      });
      setCharts(res.data || []);
    } catch (err) {
      console.error('Error fetching charts:', err);
    } finally {
      setChartsLoading(false);
    }
  };

  // Full manual/auto refresh of all hits & trending charts
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        fetchTrending(selectedLang, 1, true),
        fetchCharts(true)
      ]);
    } finally {
      setIsRefreshing(false);
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

  // Handle Search Input Change with instant auto-reset on backspace / erase
  const handleSearchInputChange = (value) => {
    setSearchQuery(value);
    if (!value || !value.trim()) {
      setPage(1);
      fetchTrending(selectedLang, 1);
    }
  };

  // Clear search bar and immediately restore all hits feed
  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
    fetchTrending(selectedLang, 1);
  };

  // Handle Search submit
  const handleSearch = (e) => {
    e?.preventDefault?.();
    setActiveTab('discover');
    setPage(1);
    if (!searchQuery || !searchQuery.trim()) {
      fetchTrending(selectedLang, 1);
    } else {
      handleSearchWithQuery(searchQuery, searchCategory, 1);
    }
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
    setPlaylistSearch('');
    setPlaylistSort('default');
    setPlaylistSongsLoading(true);
    try {
      const token = localStorage.getItem('token');
      let fetchedSongs = [];
      if (token && typeof playlist.id === 'number') {
        const res = await axios.get(`/api/music/playlists/${playlist.id}/songs`);
        fetchedSongs = res.data.songs || [];
      } else {
        // Guest fallback or cached
        fetchedSongs = playlist.songs || [];
      }

      // Restore custom user manual drag-and-drop order if saved
      try {
        const savedOrderStr = localStorage.getItem(`syncstream_playlist_order_${playlist.id}`);
        if (savedOrderStr) {
          const orderIds = JSON.parse(savedOrderStr);
          if (Array.isArray(orderIds) && orderIds.length > 0) {
            const orderMap = new Map();
            orderIds.forEach((id, idx) => orderMap.set(String(id), idx));
            fetchedSongs.sort((a, b) => {
              const idxA = orderMap.has(String(a.id)) ? orderMap.get(String(a.id)) : 999999;
              const idxB = orderMap.has(String(b.id)) ? orderMap.get(String(b.id)) : 999999;
              return idxA - idxB;
            });
          }
        }
      } catch (e) {}

      setPlaylistSongs(fetchedSongs);
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

  // ── Confirmation Modal Helpers ──
  const askConfirmation = ({ title, message, confirmText = 'Delete', confirmVariant = 'danger', onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      confirmVariant,
      onConfirm
    });
  };

  const closeConfirmation = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  };

  // Delete song from current playlist with in-app confirmation
  const handleRemoveSongFromCurrentPlaylist = (song, e) => {
    e?.stopPropagation?.();
    if (!selectedPlaylistDetails || !song) return;

    askConfirmation({
      title: 'Remove Song from Playlist',
      message: `Are you sure you want to remove "${song.title}" from "${selectedPlaylistDetails.name}"?`,
      confirmText: 'Remove Song',
      confirmVariant: 'danger',
      onConfirm: async () => {
        await removeSongFromPlaylist(selectedPlaylistDetails.id, song.id);
        setPlaylistSongs(prev => prev.filter(s => s.id !== song.id));
        closeConfirmation();
      }
    });
  };

  // Delete playlist with in-app confirmation
  const handleDeletePlaylist = (playlist, e) => {
    e?.stopPropagation?.();
    if (!playlist) return;

    askConfirmation({
      title: 'Delete Playlist',
      message: `Are you sure you want to delete "${playlist.name}"? All tracks in this collection will be removed. This cannot be undone.`,
      confirmText: 'Delete Playlist',
      confirmVariant: 'danger',
      onConfirm: async () => {
        await deletePlaylist(playlist.id);
        if (selectedPlaylistDetails?.id === playlist.id) {
          setSelectedPlaylistDetails(null);
        }
        closeConfirmation();
      }
    });
  };

  // Open Edit Playlist Modal
  const handleOpenEditPlaylist = (playlist, e) => {
    e?.stopPropagation?.();
    if (!playlist) return;
    setEditingPlaylist(playlist);
    setEditPlaylistName(playlist.name || '');
    setEditPlaylistDesc(playlist.description || '');
  };

  // Save Edited Playlist Submit
  const handleSaveEditPlaylist = async (e) => {
    e.preventDefault();
    if (!editingPlaylist || !editPlaylistName.trim()) return;

    setEditPlaylistSaving(true);
    const updatedName = editPlaylistName.trim();
    const updatedDesc = editPlaylistDesc.trim();

    await updatePlaylist(editingPlaylist.id, updatedName, updatedDesc);

    if (selectedPlaylistDetails?.id === editingPlaylist.id) {
      setSelectedPlaylistDetails(prev => ({
        ...prev,
        name: updatedName,
        description: updatedDesc
      }));
    }

    setEditPlaylistSaving(false);
    setEditingPlaylist(null);
  };

  const [searchParams] = useSearchParams();

  // Listen to incoming URL search params (?q=... or ?search=...)
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search');
    if (q && q.trim()) {
      setSearchQuery(q.trim());
      setActiveTab('discover');
      setPage(1);
      handleSearchWithQuery(q.trim(), 'all', 1);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'discover') {
      const q = searchParams.get('q') || searchParams.get('search');
      if (!q || !q.trim()) {
        setSearchQuery('');
        setPage(1);
        fetchTrending(selectedLang, 1);
      }
    }
  }, [selectedLang]);

  useEffect(() => {
    fetchCharts();
  }, []);

  // Periodic automatic background refresh (every 4 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'discover' && !searchQuery.trim()) {
        fetchTrending(selectedLang, 1, true);
        fetchCharts(true);
      }
    }, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeTab, selectedLang, searchQuery]);

  // Auto-refresh when tab becomes visible again
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && activeTab === 'discover' && !searchQuery.trim()) {
        fetchTrending(selectedLang, 1, true);
        fetchCharts(true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [activeTab, selectedLang, searchQuery]);

  return (
    <div className="relative max-w-7xl mx-auto py-4 sm:py-8 px-3.5 sm:px-6 md:px-8 space-y-5 sm:space-y-6 min-h-[85vh] pb-24 overflow-x-hidden">
      {/* Radiant Background Ambient Aurora Glows (Contained to prevent horizontal scrolling) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 left-10 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-cyan-500/15 blur-[100px]" />
        <div className="absolute top-1/3 -right-10 w-72 sm:w-[450px] h-72 sm:h-[450px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-20 left-1/3 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-pink-500/15 blur-[100px]" />
      </div>

      {/* ── Top Header Banner & Navigation Tabs ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-3 border-b border-white/20">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-accentCyan/30 to-accentPurple/30 border border-accentCyan/60 text-white text-[11px] font-black uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(99,210,255,0.35)]">
              <Radio className="w-3.5 h-3.5 animate-pulse text-accentCyan" />
              <span>Dual-Engine: YouTube Music + Studio Masters 320kbps</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-mono text-[11px] font-black shadow-[0_0_12px_rgba(16,185,129,0.35)] shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Hits
            </span>
            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isRefreshing || loading}
              className="p-1.5 sm:p-2 rounded-xl border-2 border-accentCyan bg-[#0f1428] text-accentCyan hover:bg-accentCyan hover:text-black shadow-[0_0_15px_rgba(var(--accent-cyan),0.4)] transition active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
              title="Live Refresh Hits & Charts"
              aria-label="Live Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2.5} />
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-outfit tracking-tight drop-shadow-md">
            SyncStream Music &amp; Playlists
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 font-medium">
            Search by Artist, Movie, TV Series, Anime or Song name &bull; Universal Catalog auto-updated with latest hits.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="flex flex-col gap-2 max-w-md w-full">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder="Search by Artist, Movie, Anime, Series or Song..."
              className="w-full bg-[#1a2242] border-2 border-white/25 rounded-2xl pl-10 pr-24 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-accentCyan focus:ring-2 focus:ring-accentCyan/30 transition shadow-lg placeholder:text-slate-300 font-semibold"
            />
            <Search className="w-4 h-4 text-accentCyan absolute left-3.5 top-1/2 -translate-y-1/2" />
            
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-20 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-200 hover:text-white hover:bg-white/20 transition"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}

            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-accentCyan via-[#38bdf8] to-accentPurple text-black text-xs font-black hover:shadow-[0_0_18px_rgba(99,210,255,0.7)] transition active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Quick Search Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] text-slate-200 py-0.5">
            <span className="font-extrabold text-slate-300 shrink-0">Popular:</span>
            {(SUGGESTIONS_BY_CATEGORY[searchCategory] || SUGGESTIONS_BY_CATEGORY.all).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleSuggestionClick(tag)}
                className="px-2.5 py-0.5 rounded-full bg-[#20294d] hover:bg-accentCyan hover:text-black border border-white/25 hover:border-accentCyan whitespace-nowrap transition active:scale-95 text-[10.5px] font-bold text-slate-100 shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Navigation Switcher (Discover, Liked Songs, My Playlists) ── */}
      <div className="flex items-center gap-2 border-b border-white/20 pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => { setActiveTab('discover'); setSelectedPlaylistDetails(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition active:scale-95 border shrink-0 ${
            activeTab === 'discover'
              ? 'bg-gradient-to-r from-accentCyan/40 via-[#38bdf8]/30 to-accentPurple/40 border-2 border-accentCyan text-white shadow-[0_0_20px_rgba(99,210,255,0.45)]'
              : 'bg-[#1c2446] border border-white/25 text-slate-100 hover:text-white hover:bg-[#283460] hover:border-white/40 shadow-md'
          }`}
        >
          <Flame className="w-4 h-4 text-accentCyan" />
          <span>Discover &amp; Charts</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('favorites'); setSelectedPlaylistDetails(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition active:scale-95 border shrink-0 ${
            activeTab === 'favorites'
              ? 'bg-gradient-to-r from-red-500/40 via-pink-500/30 to-purple-500/40 border-2 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.45)]'
              : 'bg-[#1c2446] border border-white/25 text-slate-100 hover:text-white hover:bg-[#283460] hover:border-white/40 shadow-md'
          }`}
        >
          <Heart className="w-4 h-4 text-red-400 fill-current" />
          <span>Liked Songs / Favorites ({favorites.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('playlists'); setSelectedPlaylistDetails(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition active:scale-95 border shrink-0 ${
            activeTab === 'playlists'
              ? 'bg-gradient-to-r from-purple-500/40 via-indigo-500/30 to-accentCyan/30 border-2 border-accentPurple text-white shadow-[0_0_20px_rgba(168,85,247,0.45)]'
              : 'bg-[#1c2446] border border-white/25 text-slate-100 hover:text-white hover:bg-[#283460] hover:border-white/40 shadow-md'
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
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-200 uppercase tracking-wider font-mono">
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
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-200 border active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-accentCyan via-[#38bdf8] to-accentPurple text-black border-2 border-white shadow-[0_0_20px_rgba(99,210,255,0.7)]'
                        : 'bg-[#1c2548] border border-white/25 text-slate-100 hover:text-white hover:border-accentCyan/70 hover:bg-[#283564] shadow-md'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black stroke-[2.5]' : cat.color || ''}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
              <button
                type="button"
                onClick={handleRefreshAll}
                disabled={isRefreshing || loading}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black transition-all border-2 border-accentCyan/70 bg-accentCyan/30 hover:bg-accentCyan/45 text-white active:scale-95 shrink-0 shadow-[0_0_15px_rgba(99,210,255,0.4)]"
                title="Refresh live trending hits & charts"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-accentCyan ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={2.5} />
                <span>Live Refresh</span>
              </button>

              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.id;
                const IconComponent = lang.icon;
                return (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setSelectedLang(lang.id);
                      setFeaturedSong(null);
                      setSearchQuery('');
                      setPage(1);
                      setHasMore(true);
                      fetchTrending(lang.id, 1, true);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all duration-300 border active:scale-95 shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-r from-accentCyan/40 to-accentPurple/40 border-2 border-accentCyan text-white shadow-[0_0_18px_rgba(99,210,255,0.45)]'
                        : 'bg-[#1a2244] border border-white/25 text-slate-100 hover:text-white hover:border-accentCyan/60 hover:bg-[#26325e] shadow-sm'
                    }`}
                  >
                    {IconComponent && <IconComponent className={`w-3.5 h-3.5 shrink-0 ${lang.color || 'text-accentCyan'}`} />}
                    <span>{lang.label}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5 shrink-0" title="Live Regularly Updated" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured Spotlight (when no search query) */}
          {featuredSong && !searchQuery && (
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/25 p-4 sm:p-7 bg-gradient-to-r from-[#1c2548] via-[#141b36] to-[#1c2548] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row items-center gap-4 sm:gap-6 group">
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 pointer-events-none group-hover:opacity-40 transition-opacity"
                style={{ backgroundImage: `url(${featuredSong.image || FALLBACK_COVER})` }}
              />

              {/* Cover Art */}
              <div className="relative w-28 h-28 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shrink-0 border-2 border-white/30 shadow-2xl group-hover:scale-105 transition-transform duration-500 bg-black">
                <img
                  src={featuredSong.image || FALLBACK_COVER}
                  alt={featuredSong.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
                />
              </div>

              {/* Meta Details */}
              <div className="relative z-10 flex-1 text-center sm:text-left space-y-2.5 sm:space-y-3.5">
                <div className="space-y-1 sm:space-y-1.5">
                  <span className="uppercase text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full bg-accentCyan/30 text-white border border-accentCyan/60 tracking-wider font-mono shadow-sm">
                    Featured Spotlight &bull; {featuredSong.language}
                  </span>
                  <h2 className="text-base sm:text-2xl font-black text-white font-outfit tracking-tight leading-snug drop-shadow-md">
                    {featuredSong.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 font-semibold truncate">
                    {featuredSong.artist}
                  </p>
                </div>

                {/* Quick Play & Action Buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-0.5">
                  <button
                    onClick={() => {
                      if (currentTrack?.id === featuredSong.id) {
                        togglePlay();
                      } else {
                        playTrack(featuredSong, songs);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-accentCyan to-accentPurple text-black text-xs sm:text-sm font-black shadow-[0_0_20px_rgba(99,210,255,0.6)] hover:shadow-[0_0_30px_rgba(99,210,255,0.8)] transition active:scale-95"
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
                    className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-black border border-white/25 transition active:scale-95 shadow-sm"
                  >
                    <Disc3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accentCyan" />
                    <span>Play All ({songs.length})</span>
                  </button>

                  <button
                    onClick={() => toggleFavorite(featuredSong)}
                    className={`p-2.5 rounded-full border-2 transition active:scale-95 shadow-sm ${
                      isFavorite(featuredSong.id)
                        ? 'bg-red-500/30 border-red-500/70 text-red-300'
                        : 'bg-white/15 border-white/25 text-slate-100 hover:text-white hover:bg-white/25'
                    }`}
                    title={isFavorite(featuredSong.id) ? 'Liked' : 'Add to Favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(featuredSong.id) ? 'fill-current text-red-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => setSongToAddToPlaylist(featuredSong)}
                    className="p-2.5 rounded-full bg-white/15 border-2 border-white/25 text-slate-100 hover:text-white hover:bg-white/25 transition active:scale-95 shadow-sm"
                    title="Add to Playlist"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Songs Grid */}
          <div id="music-songs-section" className="space-y-3 sm:space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base sm:text-xl font-black text-white font-outfit flex items-center gap-2">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-accentPink" />
                  <span>
                    {searchQuery
                      ? `Results for "${searchQuery}" (${SEARCH_CATEGORIES.find(c => c.id === searchCategory)?.label || 'All'})`
                      : `${LANGUAGES.find(l => l.id === selectedLang)?.label || 'Trending'} Hits`}
                  </span>
                </h3>
                {!searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live &bull; Regularly Updated
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle: Card vs Compact List */}
                <div className="flex items-center gap-1 bg-[#12182f] p-1 rounded-xl border border-white/20">
                  <button
                    type="button"
                    onClick={() => handleSetViewMode('card')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'card'
                        ? 'bg-accentCyan text-black font-bold shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="Card (Grid) View"
                    aria-label="Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-accentCyan text-black font-bold shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="Compact List View"
                    aria-label="Compact List View"
                  >
                    <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <span className="text-xs font-mono font-black text-white px-3.5 py-1.5 rounded-full bg-white/15 border-2 border-white/25 shadow-md">
                  {songs.length} Tracks
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-accentCyan animate-spin" />
                <p className="text-xs font-bold text-slate-200 font-mono">Loading pristine audio streams...</p>
              </div>
            ) : songs.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-3xl border-2 border-white/25 p-6 space-y-2 bg-[#18203c]/95 shadow-xl">
                <Music2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-base font-black text-white">No tracks found</h4>
                <p className="text-xs text-slate-300 font-medium">Try searching with a broader name, artist, or movie title.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {viewMode === 'card' ? (
                  /* ── Card (Grid) View ── */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                    {songs.map((song, idx) => {
                      const isCurrent = currentTrack?.id === song.id;
                      const isCurrentPlaying = isCurrent && isPlaying;
                      const isFav = isFavorite(song.id);

                      return (
                        <div
                          key={`${song.id}-${idx}`}
                          className={`group relative rounded-xl sm:rounded-2xl border-2 p-2 sm:p-3 transition-all duration-300 flex flex-col gap-2 overflow-hidden shadow-xl backdrop-blur-md ${
                            isCurrent
                              ? 'bg-accentCyan/25 border-accentCyan shadow-[0_0_25px_rgba(99,210,255,0.45)] ring-2 ring-accentCyan/60'
                              : 'border-white/20 bg-[#18203c]/95 hover:border-accentCyan/70 hover:bg-[#202b52] hover:shadow-[0_10px_30px_rgba(0,245,255,0.25)]'
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
                            className="relative w-full aspect-square rounded-xl overflow-hidden shrink-0 border-2 border-white/20 shadow-md cursor-pointer group-hover:scale-102 transition-transform bg-black/40"
                          >
                            <img
                              src={song.image || FALLBACK_COVER}
                              alt={song.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {isCurrentPlaying ? (
                                <Pause className="w-6 h-6 text-accentCyan fill-current" />
                              ) : (
                                <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                              )}
                            </div>
                            {isCurrentPlaying && (
                              <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-accentCyan shadow-[0_0_8px_#fff]" />
                            )}
                          </div>

                          {/* Meta & Action Controls */}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <h4
                              onClick={() => {
                                if (currentTrack?.id === song.id) {
                                  togglePlay();
                                } else {
                                  playTrack(song, songs);
                                }
                              }}
                              className={`text-xs sm:text-sm font-black truncate font-outfit cursor-pointer transition-colors ${
                                isCurrent ? 'text-accentCyan' : 'text-white group-hover:text-accentCyan'
                              }`}
                              title={song.title}
                            >
                              {song.title}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-200 truncate font-semibold">
                              {song.artist}
                            </p>
                            <div className="flex items-center justify-between gap-1 pt-1 mt-auto min-w-0">
                              <span className="text-[9px] font-mono font-bold text-slate-300 shrink-0">
                                {formatTime(song.duration)}
                              </span>
                              
                              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                                {/* Always Visible Heart Icon */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(song);
                                  }}
                                  className={`p-1 sm:p-1.5 rounded-lg border transition active:scale-90 shrink-0 ${
                                    isFav
                                      ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.35)]'
                                      : 'bg-white/5 border-white/10 text-slate-300 hover:text-red-400 hover:bg-white/15'
                                  }`}
                                  title={isFav ? 'Liked' : 'Add to Favorites'}
                                  aria-label="Add to Favorites"
                                >
                                  <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFav ? 'fill-current text-red-400' : ''}`} />
                                </button>

                                {/* Always Visible Folder Icon */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSongToAddToPlaylist(song);
                                  }}
                                  className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/50 text-purple-300 hover:text-purple-200 transition active:scale-90 shrink-0"
                                  title="Add to Playlist"
                                  aria-label="Add to Playlist"
                                >
                                  <FolderPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
                                </button>

                                {/* Play / Pause Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (currentTrack?.id === song.id) {
                                      togglePlay();
                                    } else {
                                      playTrack(song, songs);
                                    }
                                  }}
                                  className={`p-1 sm:p-1.5 rounded-full transition active:scale-90 border shrink-0 ${
                                    isCurrentPlaying
                                      ? 'bg-accentCyan text-black border-white shadow-[0_0_12px_rgba(99,210,255,0.7)] font-black'
                                      : 'bg-white/20 border-white/25 text-white hover:bg-accentCyan hover:text-black hover:border-accentCyan'
                                  }`}
                                  title={isCurrentPlaying ? 'Pause' : 'Play'}
                                  aria-label={isCurrentPlaying ? 'Pause' : 'Play'}
                                >
                                  {isCurrentPlaying ? <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" /> : <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ── Compact List View ── */
                  <div className="space-y-1.5">
                    {songs.map((song, idx) => {
                      const isCurrent = currentTrack?.id === song.id;
                      const isCurrentPlaying = isCurrent && isPlaying;
                      const isFav = isFavorite(song.id);

                      return (
                        <div
                          key={`${song.id}-${idx}`}
                          className={`group flex items-center justify-between gap-2.5 sm:gap-4 px-3 py-2 sm:py-2.5 rounded-xl border transition-all duration-200 ${
                            isCurrent
                              ? 'bg-accentCyan/20 border-accentCyan shadow-[0_0_20px_rgba(99,210,255,0.35)] ring-1 ring-accentCyan/60'
                              : 'bg-[#18203c]/90 border-white/10 hover:border-accentCyan/50 hover:bg-[#202b52] hover:shadow-md'
                          }`}
                        >
                          {/* Left: Index / Play Button + Thumbnail + Title/Artist */}
                          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => isCurrent ? togglePlay() : playTrack(song, songs)}
                              className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg hover:bg-white/10 text-xs font-mono font-bold cursor-pointer transition active:scale-90"
                            >
                              {isCurrentPlaying ? (
                                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accentCyan fill-accentCyan animate-pulse" />
                              ) : isCurrent ? (
                                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accentCyan fill-accentCyan ml-0.5" />
                              ) : (
                                <>
                                  <span className="text-slate-400 group-hover:hidden">{idx + 1}</span>
                                  <Play className="w-3.5 h-3.5 text-white fill-white hidden group-hover:block ml-0.5" />
                                </>
                              )}
                            </button>

                            <div
                              onClick={() => isCurrent ? togglePlay() : playTrack(song, songs)}
                              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden shrink-0 border border-white/20 bg-black/40 cursor-pointer shadow-sm group-hover:scale-105 transition-transform"
                            >
                              <img
                                src={song.image || FALLBACK_COVER}
                                alt={song.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
                              />
                            </div>

                            <div className="min-w-0 flex-1 space-y-0.5">
                              <h4
                                onClick={() => isCurrent ? togglePlay() : playTrack(song, songs)}
                                className={`text-xs sm:text-sm font-black truncate cursor-pointer transition-colors ${
                                  isCurrent ? 'text-accentCyan' : 'text-white group-hover:text-accentCyan'
                                }`}
                                title={song.title}
                              >
                                {song.title}
                              </h4>
                              <p className="text-[10px] sm:text-xs text-slate-300 truncate font-semibold">
                                {song.artist}
                              </p>
                            </div>
                          </div>

                          {/* Right: Duration + Heart + Folder + Play */}
                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300 hidden xs:inline-block">
                              {formatTime(song.duration)}
                            </span>

                            {/* Always Visible Heart Icon */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(song);
                              }}
                              className={`p-1.5 rounded-lg border transition active:scale-90 ${
                                isFav
                                  ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.35)]'
                                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-red-400 hover:bg-white/15 hover:border-red-400/40'
                              }`}
                              title={isFav ? 'Liked (Click to Remove)' : 'Add to Favorites'}
                              aria-label="Add to Favorites"
                            >
                              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>

                            {/* Always Visible Folder Icon */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSongToAddToPlaylist(song);
                              }}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/25 border border-white/10 hover:border-purple-400/60 text-purple-300 hover:text-purple-200 transition active:scale-90 shadow-sm"
                              title="Add to Playlist"
                              aria-label="Add to Playlist"
                            >
                              <FolderPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                            </button>

                            {/* Play / Pause button in list view */}
                            <button
                              type="button"
                              onClick={() => {
                                if (currentTrack?.id === song.id) {
                                  togglePlay();
                                } else {
                                  playTrack(song, songs);
                                }
                              }}
                              className={`p-1.5 rounded-full transition active:scale-90 border ${
                                isCurrentPlaying
                                  ? 'bg-accentCyan text-black border-white shadow-[0_0_12px_rgba(99,210,255,0.7)] font-black'
                                  : 'bg-white/15 border-white/20 text-white hover:bg-accentCyan hover:text-black hover:border-accentCyan'
                              }`}
                              title={isCurrentPlaying ? 'Pause' : 'Play'}
                            >
                              {isCurrentPlaying ? (
                                <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-3 pb-2">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-accentCyan/30 to-accentPurple/30 hover:from-accentCyan/45 hover:to-accentPurple/45 border-2 border-accentCyan text-white font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(99,210,255,0.35)] hover:shadow-[0_0_30px_rgba(99,210,255,0.6)] transition active:scale-95 disabled:opacity-50"
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
                          <ChevronDown className="w-4 h-4 text-accentCyan" />
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
            <div className="space-y-8 pt-6 border-t-2 border-white/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-2xl font-black text-white font-outfit flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accentCyan" />
                      <span>Curated Regional Charts &amp; Soundtracks</span>
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live &bull; Regularly Updating
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-semibold">Real-time regional soundscapes: Telugu, Tamil, Kannada, Bollywood, K-Pop, Anime, Mollywood, Marathi &amp; Global Hits &bull; Live Updated.</p>
                </div>
                
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  {/* View Mode Toggle: Card vs Compact List */}
                  <div className="flex items-center gap-1 bg-[#12182f] p-1 rounded-xl border border-white/20">
                    <button
                      type="button"
                      onClick={() => handleSetChartsViewMode('card')}
                      className={`p-1.5 rounded-lg transition-all ${
                        chartsViewMode === 'card'
                          ? 'bg-accentCyan text-black font-bold shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                      title="Card Carousel View"
                      aria-label="Card Carousel View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetChartsViewMode('list')}
                      className={`p-1.5 rounded-lg transition-all ${
                        chartsViewMode === 'list'
                          ? 'bg-accentCyan text-black font-bold shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                      title="Compact List View"
                      aria-label="Compact List View"
                    >
                      <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchCharts(true)}
                    disabled={chartsLoading || isRefreshing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-accentCyan/30 to-accentPurple/30 hover:from-accentCyan/45 hover:to-accentPurple/45 text-white border-2 border-accentCyan/70 text-xs font-black transition active:scale-95 shrink-0 shadow-[0_0_15px_rgba(99,210,255,0.3)]"
                    title="Force refresh live charts"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-accentCyan ${chartsLoading || isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Live Refresh Charts</span>
                  </button>
                </div>
              </div>

              {chartsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-7 h-7 text-accentCyan animate-spin" />
                  <p className="text-xs font-bold text-slate-200 font-mono">Loading live regional charts...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {charts.map((chart) => {
                    if (!chart.songs || chart.songs.length === 0) return null;
                    return (
                      <div key={chart.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {getChartIcon(chart.id)}
                              <h4 className="text-sm sm:text-base font-black text-white font-outfit">{chart.title}</h4>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                Live Chart
                              </span>
                            </div>
                            {chart.subtitle && <p className="text-[11px] text-slate-300 font-semibold">{chart.subtitle}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400 hidden xs:inline-block">
                              {chart.songs.length} tracks
                            </span>
                            <button
                              onClick={() => { if (chart.songs.length > 0) playQueue(chart.songs, 0); }}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accentCyan/25 hover:bg-accentCyan/40 text-accentCyan border-2 border-accentCyan/60 text-xs font-black transition active:scale-95 shadow-md"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Play All</span>
                            </button>
                          </div>
                        </div>

                        {/* View Mode 1: Card Carousel View */}
                        {chartsViewMode === 'card' ? (
                          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
                            {chart.songs.map((s, idx) => {
                              const isCur = currentTrack?.id === s.id;
                              const isCurrentPlaying = isCur && isPlaying;
                              const isFav = isFavorite(s.id);
                              return (
                                <div
                                  key={`${s.id}-${idx}`}
                                  className={`group relative flex flex-col gap-2 shrink-0 w-36 sm:w-44 p-2 sm:p-2.5 rounded-2xl border-2 transition-all duration-300 shadow-lg overflow-hidden ${
                                    isCur ? 'bg-accentCyan/25 border-accentCyan shadow-[0_0_20px_rgba(99,210,255,0.4)]' : 'border-white/20 bg-[#18203c]/95 hover:bg-[#202b52] hover:border-accentCyan/60'
                                  }`}
                                >
                                  <div
                                    onClick={() => {
                                      if (isCur) {
                                        togglePlay();
                                      } else {
                                        playTrack(s, chart.songs);
                                      }
                                    }}
                                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-white/20 shadow-md bg-black cursor-pointer"
                                  >
                                    <img
                                      src={s.image || FALLBACK_COVER}
                                      alt={s.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <div className="w-9 h-9 rounded-full bg-accentCyan text-black flex items-center justify-center shadow-lg font-bold">
                                        {isCurrentPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                      </div>
                                    </div>
                                    {isCurrentPlaying && (
                                      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-accentCyan shadow-[0_0_8px_#fff]" />
                                    )}
                                  </div>
                                  <div className="space-y-0.5 min-w-0">
                                    <p
                                      onClick={() => {
                                        if (isCur) {
                                          togglePlay();
                                        } else {
                                          playTrack(s, chart.songs);
                                        }
                                      }}
                                      className={`text-xs font-black truncate font-outfit cursor-pointer transition-colors ${
                                        isCur ? 'text-accentCyan' : 'text-white group-hover:text-accentCyan'
                                      }`}
                                      title={s.title}
                                    >
                                      {s.title}
                                    </p>
                                    <p className="text-[10px] text-slate-200 truncate font-semibold" title={s.artist}>{s.artist}</p>

                                    {/* Action Row: Clock + Heart + Playlist */}
                                    <div className="flex items-center justify-between gap-1 pt-1 mt-auto min-w-0">
                                      <span className="text-[9px] font-mono font-bold text-slate-300 shrink-0">
                                        {formatTime(s.duration)}
                                      </span>
                                      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                                        {/* Single Favorite Heart Icon */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(s);
                                          }}
                                          className={`p-1 sm:p-1.5 rounded-lg border transition active:scale-90 shrink-0 ${
                                            isFav
                                              ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.35)]'
                                              : 'bg-white/5 border-white/10 text-slate-300 hover:text-red-400 hover:bg-white/15'
                                          }`}
                                          title={isFav ? 'Liked (Click to Remove)' : 'Add to Favorites'}
                                          aria-label="Add to Favorites"
                                        >
                                          <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFav ? 'fill-current text-red-400' : ''}`} />
                                        </button>

                                        {/* Single Add to Playlist Icon */}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSongToAddToPlaylist(s);
                                          }}
                                          className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/50 text-purple-300 hover:text-purple-200 transition active:scale-90 shrink-0"
                                          title="Add to Playlist"
                                          aria-label="Add to Playlist"
                                        >
                                          <FolderPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* View Mode 2: Compact List View */
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {chart.songs.map((s, idx) => {
                              const isCur = currentTrack?.id === s.id;
                              const isCurrentPlaying = isCur && isPlaying;
                              const isFav = isFavorite(s.id);
                              return (
                                <div
                                  key={`chart-list-${s.id}-${idx}`}
                                  className={`group flex items-center justify-between p-2 sm:p-2.5 rounded-xl border-2 transition-all duration-200 ${
                                    isCur
                                      ? 'bg-accentCyan/20 border-accentCyan shadow-[0_0_15px_rgba(99,210,255,0.35)]'
                                      : 'border-white/15 bg-[#18203c]/90 hover:bg-[#202b52] hover:border-accentCyan/50'
                                  }`}
                                >
                                  {/* Left: Rank + Thumbnail + Title/Artist */}
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <span className="w-5 text-center font-mono font-black text-xs text-slate-400 group-hover:text-accentCyan shrink-0">
                                      {idx + 1}
                                    </span>
                                    <div
                                      onClick={() => isCur ? togglePlay() : playTrack(s, chart.songs)}
                                      className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden shrink-0 border border-white/20 bg-black cursor-pointer shadow-sm"
                                    >
                                      <img
                                        src={s.image || FALLBACK_COVER}
                                        alt={s.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        loading="lazy"
                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
                                      />
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isCurrentPlaying ? (
                                          <Pause className="w-4 h-4 text-accentCyan fill-current" />
                                        ) : (
                                          <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                                        )}
                                      </div>
                                      {isCurrentPlaying && (
                                        <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-accentCyan shadow-[0_0_6px_#fff]" />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                      <h4
                                        onClick={() => isCur ? togglePlay() : playTrack(s, chart.songs)}
                                        className={`text-xs sm:text-sm font-black truncate cursor-pointer transition-colors ${
                                          isCur ? 'text-accentCyan' : 'text-white group-hover:text-accentCyan'
                                        }`}
                                        title={s.title}
                                      >
                                        {s.title}
                                      </h4>
                                      <p className="text-[10px] sm:text-xs text-slate-300 truncate font-semibold" title={s.artist}>
                                        {s.artist}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Right: Duration + Heart + Folder + Play */}
                                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                                    <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300 hidden xs:inline-block">
                                      {formatTime(s.duration)}
                                    </span>

                                    {/* Single Heart button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(s);
                                      }}
                                      className={`p-1.5 rounded-lg border transition active:scale-90 ${
                                        isFav
                                          ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.35)]'
                                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-red-400 hover:bg-white/15 hover:border-red-400/40'
                                      }`}
                                      title={isFav ? 'Liked (Click to Remove)' : 'Add to Favorites'}
                                      aria-label="Add to Favorites"
                                    >
                                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                                    </button>

                                    {/* Single FolderPlus button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSongToAddToPlaylist(s);
                                      }}
                                      className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/25 border border-white/10 hover:border-purple-400/60 text-purple-300 hover:text-purple-200 transition active:scale-90 shadow-sm"
                                      title="Add to Playlist"
                                      aria-label="Add to Playlist"
                                    >
                                      <FolderPlus className="w-3.5 h-3.5 stroke-[2.2]" />
                                    </button>

                                    {/* Play / Pause button */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (isCur) {
                                          togglePlay();
                                        } else {
                                          playTrack(s, chart.songs);
                                        }
                                      }}
                                      className={`p-1.5 rounded-full transition active:scale-90 border ${
                                        isCurrentPlaying
                                          ? 'bg-accentCyan text-black border-white shadow-[0_0_10px_rgba(99,210,255,0.7)]'
                                          : 'bg-white/15 border-white/20 text-white hover:bg-accentCyan hover:text-black hover:border-accentCyan'
                                      }`}
                                      title={isCurrentPlaying ? 'Pause' : 'Play'}
                                    >
                                      {isCurrentPlaying ? (
                                        <Pause className="w-3 h-3 fill-current" />
                                      ) : (
                                        <Play className="w-3 h-3 fill-current ml-0.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border-2 border-red-500/50 bg-gradient-to-r from-red-950/60 via-[#261633] to-[#18203c] shadow-[0_10px_35px_rgba(239,68,68,0.25)]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/40 text-white shrink-0 border-2 border-white/30">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-outfit">Liked Songs</h2>
                <p className="text-xs sm:text-sm text-slate-200 font-semibold">{favorites.length} favorite songs in your library</p>
              </div>
            </div>

            {favorites.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => playQueue(displayedFavorites, 0)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-red-500/50 hover:opacity-95 transition active:scale-95 border border-white/25"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play All ({displayedFavorites.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const listToShuffle = displayedFavorites.length > 0 ? displayedFavorites : favorites;
                    const shuffled = [...listToShuffle].sort(() => Math.random() - 0.5);
                    playQueue(shuffled, 0);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-black border-2 border-white/25 transition active:scale-95 shadow-md"
                >
                  <Shuffle className="w-4 h-4 text-red-400" />
                  <span>Shuffle</span>
                </button>
              </div>
            )}
          </div>

          {favorites.length > 0 && (
            /* ── Favorites Controls Toolbar: Search Songs, Sort Options, View Mode ── */
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#18203c]/90 border border-white/15 shadow-xl">
              {/* Search Inside Favorites */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400 pointer-events-none" />
                <input
                  type="text"
                  value={favoriteSearch}
                  onChange={(e) => setFavoriteSearch(e.target.value)}
                  placeholder="Search liked songs..."
                  className="w-full bg-[#12182f] border border-white/20 focus:border-red-400 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-400 transition font-semibold"
                />
                {favoriteSearch && (
                  <button
                    type="button"
                    onClick={() => setFavoriteSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
                {favoriteSearch && (
                  <span className="text-xs font-mono font-bold text-slate-300 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                    Found {displayedFavorites.length} of {favorites.length}
                  </span>
                )}

                {/* Drag & drop helper pill (available in all sort options) */}
                {favorites.length > 1 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/40 text-[11px] font-black text-red-400 shrink-0 shadow-sm">
                    <GripVertical className="w-3.5 h-3.5 text-red-400" />
                    <span>Drag songs to reorder</span>
                  </div>
                )}

                {/* Sort Options Dropdown */}
                <div className="flex items-center gap-1.5 bg-[#12182f] px-3 py-1.5 rounded-xl border border-white/20">
                  <ArrowUpDown className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-300 hidden md:inline">Sort:</span>
                  <select
                    value={favoriteSort}
                    onChange={(e) => setFavoriteSort(e.target.value)}
                    className="bg-transparent text-white text-xs font-black focus:outline-none cursor-pointer"
                  >
                    <option value="default" className="bg-[#18203c] text-white">Default (Custom)</option>
                    <option value="newest" className="bg-[#18203c] text-white">Recently Liked</option>
                    <option value="title_asc" className="bg-[#18203c] text-white">Title (A &rarr; Z)</option>
                    <option value="title_desc" className="bg-[#18203c] text-white">Title (Z &rarr; A)</option>
                    <option value="artist_asc" className="bg-[#18203c] text-white">Artist (A &rarr; Z)</option>
                    <option value="duration_desc" className="bg-[#18203c] text-white">Duration (Longest)</option>
                    <option value="duration_asc" className="bg-[#18203c] text-white">Duration (Shortest)</option>
                  </select>
                </div>

                {/* View Mode Toggle: Card vs Compact List */}
                <div className="flex items-center gap-1 bg-[#12182f] p-1 rounded-xl border border-white/20">
                  <button
                    type="button"
                    onClick={() => handleSetViewMode('card')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'card'
                        ? 'bg-accentCyan text-black font-bold shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="Card (Grid) View"
                    aria-label="Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-accentCyan text-black font-bold shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="Compact List View"
                    aria-label="Compact List View"
                  >
                    <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {favorites.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border-2 border-white/25 p-8 space-y-3 bg-[#18203c]/95 shadow-2xl">
              <Heart className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
              <h3 className="text-lg font-black text-white">No liked songs yet</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto font-medium flex items-center justify-center gap-1 flex-wrap">
                <span>Tap the heart icon</span>
                <Heart className="w-3.5 h-3.5 inline text-red-500 fill-red-500" />
                <span>on any song card while exploring to add it to your permanent Favorite Library.</span>
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                className="mt-2 px-6 py-2.5 rounded-xl bg-accentCyan text-black font-black text-xs transition active:scale-95 shadow-lg"
              >
                Explore Songs
              </button>
            </div>
          ) : displayedFavorites.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border-2 border-white/20 bg-[#18203c]/90 p-8 space-y-3 shadow-xl">
              <Search className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-white">No liked songs found</h3>
              <p className="text-xs text-slate-300">No songs in your liked library matched "{favoriteSearch}"</p>
              <button
                type="button"
                onClick={() => setFavoriteSearch('')}
                className="mt-2 px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition"
              >
                Clear Search
              </button>
            </div>
          ) : viewMode === 'card' ? (
            /* ── Favorites Card (Grid) View ── */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {displayedFavorites.map((song, idx) => {
                const isCurrent = currentTrack?.id === song.id;
                const isCurrentPlaying = isCurrent && isPlaying;
                const isDragging = draggedFavIndex === idx;
                const isDragOver = dragOverFavIndex === idx && draggedFavIndex !== idx;
                const isReorderable = displayedFavorites.length > 1;

                return (
                  <div
                    key={`${song.id}-${idx}`}
                    data-fav-index={idx}
                    draggable={isReorderable}
                    onDragStart={(e) => handleFavDragStart(idx, e)}
                    onDragOver={(e) => handleFavDragOver(idx, e)}
                    onDragLeave={() => handleFavDragLeave(idx)}
                    onDrop={(e) => handleFavDrop(idx, e)}
                    onDragEnd={handleFavDragEnd}
                    className={`group relative rounded-xl sm:rounded-2xl border-2 p-2 sm:p-2.5 transition-all duration-300 flex flex-col gap-2 shadow-xl backdrop-blur-md overflow-hidden select-none ${
                      isDragging
                        ? 'opacity-30 scale-95 border-dashed border-red-400'
                        : isDragOver
                        ? 'border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.7)] ring-2 ring-red-400 bg-red-500/20 scale-[1.02]'
                        : isCurrent
                        ? 'bg-red-500/25 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.45)] ring-2 ring-red-500/60'
                        : 'border-white/20 bg-[#18203c]/95 hover:border-red-500/60 hover:bg-[#221c38] hover:shadow-[0_10px_30px_rgba(239,68,68,0.25)]'
                    }`}
                  >
                    {/* Drag Handle for Card View (all sort options) */}
                    {isReorderable && (
                      <div
                        onTouchStart={() => handleFavTouchStart(idx)}
                        onTouchMove={handleFavTouchMove}
                        onTouchEnd={handleFavTouchEnd}
                        className="absolute top-2 left-2 z-10 p-1 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-slate-300 hover:text-white cursor-grab active:cursor-grabbing shadow-sm touch-none"
                        title="Touch & drag to reorder"
                      >
                        <GripVertical className="w-3 h-3 text-red-400" />
                      </div>
                    )}

                    <div
                      onClick={() => {
                        if (currentTrack?.id === song.id) {
                          togglePlay();
                        } else {
                          playTrack(song, displayedFavorites);
                        }
                      }}
                      className="relative w-full aspect-square rounded-xl overflow-hidden shrink-0 border-2 border-white/20 shadow-md cursor-pointer group-hover:scale-102 transition-transform bg-black"
                    >
                      <img
                        src={song.image || FALLBACK_COVER}
                        alt={song.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCurrentPlaying ? (
                          <Pause className="w-6 h-6 text-red-400 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <h4
                        onClick={() => {
                          if (currentTrack?.id === song.id) {
                            togglePlay();
                          } else {
                            playTrack(song, displayedFavorites);
                          }
                        }}
                        className={`text-xs sm:text-sm font-black truncate font-outfit cursor-pointer ${
                          isCurrent ? 'text-red-400' : 'text-white group-hover:text-red-300'
                        }`}
                        title={song.title}
                      >
                        {song.title}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-200 truncate font-semibold" title={song.artist}>
                        {song.artist}
                      </p>
                      <div className="flex items-center justify-between gap-1 pt-1 mt-auto min-w-0">
                        <span className="text-[9px] font-mono font-bold text-slate-300 shrink-0">{formatTime(song.duration)}</span>
                        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                          {/* Heart Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(song);
                            }}
                            className="p-1 sm:p-1.5 rounded-lg border border-red-500/60 bg-red-500/20 text-red-400 transition active:scale-90 shrink-0"
                            title="Remove from favorites"
                          >
                            <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                          </button>

                          {/* Folder Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSongToAddToPlaylist(song);
                            }}
                            className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/50 text-purple-300 hover:text-purple-200 transition active:scale-90 shrink-0"
                            title="Add to Playlist"
                          >
                            <FolderPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
                          </button>

                          {/* Play / Pause button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (currentTrack?.id === song.id) {
                                togglePlay();
                              } else {
                                playTrack(song, displayedFavorites);
                              }
                            }}
                            className={`p-1 sm:p-1.5 rounded-full transition active:scale-90 border shrink-0 ${
                              isCurrentPlaying
                                ? 'bg-red-500 text-white border-white shadow-[0_0_12px_rgba(239,68,68,0.7)] font-black'
                                : 'bg-white/20 border-white/25 text-white hover:bg-red-500 hover:border-red-500'
                            }`}
                            title={isCurrentPlaying ? 'Pause' : 'Play'}
                          >
                            {isCurrentPlaying ? <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" /> : <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Favorites Compact List View ── */
            <div className="space-y-1.5">
              {displayedFavorites.map((song, idx) => {
                const isCurrent = currentTrack?.id === song.id;
                const isCurrentPlaying = isCurrent && isPlaying;
                const isDragging = draggedFavIndex === idx;
                const isDragOver = dragOverFavIndex === idx && draggedFavIndex !== idx;
                const isReorderable = displayedFavorites.length > 1;

                return (
                  <div
                    key={`${song.id}-${idx}`}
                    data-fav-index={idx}
                    draggable={isReorderable}
                    onDragStart={(e) => handleFavDragStart(idx, e)}
                    onDragOver={(e) => handleFavDragOver(idx, e)}
                    onDragLeave={() => handleFavDragLeave(idx)}
                    onDrop={(e) => handleFavDrop(idx, e)}
                    onDragEnd={handleFavDragEnd}
                    className={`group flex items-center justify-between gap-2.5 sm:gap-4 px-3 py-2 sm:py-2.5 rounded-xl border transition-all duration-200 select-none ${
                      isDragging
                        ? 'opacity-30 scale-[0.98] border-dashed border-red-400'
                        : isDragOver
                        ? 'border-red-400 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.5)] ring-2 ring-red-400'
                        : isCurrent
                        ? 'bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)] ring-1 ring-red-500/60'
                        : 'bg-[#18203c]/90 border-white/10 hover:border-red-500/50 hover:bg-[#202b52] hover:shadow-md'
                    }`}
                  >
                    {/* Left: Drag Handle + Index / Play Button + Thumbnail + Title/Artist */}
                    <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
                      {isReorderable && (
                        <div
                          onTouchStart={() => handleFavTouchStart(idx)}
                          onTouchMove={handleFavTouchMove}
                          onTouchEnd={handleFavTouchEnd}
                          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400 transition shrink-0 touch-none"
                          title="Touch & drag to reorder"
                        >
                          <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400/80 group-hover:text-red-400" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => isCurrent ? togglePlay() : playTrack(song, displayedFavorites)}
                        className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg hover:bg-white/10 text-xs font-mono font-bold cursor-pointer transition active:scale-90"
                      >
                        {isCurrentPlaying ? (
                          <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 fill-red-400 animate-pulse" />
                        ) : isCurrent ? (
                          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 fill-red-400 ml-0.5" />
                        ) : (
                          <>
                            <span className="text-slate-400 group-hover:hidden">{idx + 1}</span>
                            <Play className="w-3.5 h-3.5 text-white fill-white hidden group-hover:block ml-0.5" />
                          </>
                        )}
                      </button>

                      <div
                        onClick={() => isCurrent ? togglePlay() : playTrack(song, displayedFavorites)}
                        className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden shrink-0 border border-white/20 bg-black/40 cursor-pointer shadow-sm group-hover:scale-105 transition-transform"
                      >
                        <img
                          src={song.image || FALLBACK_COVER}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4
                          onClick={() => isCurrent ? togglePlay() : playTrack(song, displayedFavorites)}
                          className={`text-xs sm:text-sm font-black truncate cursor-pointer transition-colors ${
                            isCurrent ? 'text-red-400' : 'text-white group-hover:text-red-300'
                          }`}
                          title={song.title}
                        >
                          {song.title}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-slate-300 truncate font-semibold">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    {/* Right: Duration + Heart + Folder + Play */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300 hidden xs:inline-block">
                        {formatTime(song.duration)}
                      </span>

                      {/* Always Visible Heart Icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song);
                        }}
                        className="p-1.5 rounded-lg border border-red-500/60 bg-red-500/20 text-red-400 transition active:scale-90 shadow-[0_0_8px_rgba(239,68,68,0.35)]"
                        title="Remove from favorites"
                        aria-label="Remove from favorites"
                      >
                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-red-500 text-red-500" />
                      </button>

                      {/* Always Visible Folder Icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSongToAddToPlaylist(song);
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/25 border border-white/10 hover:border-purple-400/60 text-purple-300 hover:text-purple-200 transition active:scale-90 shadow-sm"
                        title="Add to Playlist"
                        aria-label="Add to Playlist"
                      >
                        <FolderPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                      </button>

                      {/* Play / Pause button in list view */}
                      <button
                        type="button"
                        onClick={() => {
                          if (currentTrack?.id === song.id) {
                            togglePlay();
                          } else {
                            playTrack(song, displayedFavorites);
                          }
                        }}
                        className={`p-1.5 rounded-full transition active:scale-90 border ${
                          isCurrentPlaying
                            ? 'bg-red-500 text-white border-white shadow-[0_0_12px_rgba(239,68,68,0.7)] font-black'
                            : 'bg-white/15 border-white/20 text-white hover:bg-red-500 hover:text-white hover:border-red-500'
                        }`}
                        title={isCurrentPlaying ? 'Pause' : 'Play'}
                      >
                        {isCurrentPlaying ? (
                          <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
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
          {/* Header & Create Playlist Button (Solid high-contrast card) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border-2 border-purple-500/40 bg-gradient-to-r from-purple-950/60 via-[#22193d] to-[#18203c] backdrop-blur-2xl shadow-[0_10px_35px_rgba(168,85,247,0.25)]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/50 text-white shrink-0 border-2 border-white/30">
                <ListMusic className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-outfit">My Custom Playlists</h2>
                <p className="text-xs sm:text-sm text-slate-200 font-semibold">Create, rename, organize, and stream your personalized music collections.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreatePlaylistModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black text-xs sm:text-sm font-black shadow-lg shadow-accentPurple/40 hover:opacity-95 transition active:scale-95 shrink-0 border-2 border-white"
            >
              <FolderPlus className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Create New Playlist</span>
            </button>
          </div>

          {/* If Playlist is Selected, show Playlist Details View */}
          {selectedPlaylistDetails ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-white/20">
                <button
                  type="button"
                  onClick={() => setSelectedPlaylistDetails(null)}
                  className="flex items-center gap-1.5 text-xs text-accentCyan hover:text-white font-black transition active:scale-95"
                >
                  &larr; Back to all playlists
                </button>

                <div className="flex items-center gap-2">
                  {playlistSongs.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => playQueue(displayedPlaylistSongs, 0)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accentCyan text-black font-black text-xs transition active:scale-95 shadow-lg border border-white"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play All ({displayedPlaylistSongs.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const listToShuffle = displayedPlaylistSongs.length > 0 ? displayedPlaylistSongs : playlistSongs;
                          const shuffled = [...listToShuffle].sort(() => Math.random() - 0.5);
                          playQueue(shuffled, 0);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white border-2 border-white/25 text-xs font-black transition active:scale-95 shadow-md"
                        title="Shuffle Playlist"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-accentCyan" />
                        <span>Shuffle</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleOpenEditPlaylist(selectedPlaylistDetails, e)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white border-2 border-white/25 text-xs font-black transition active:scale-95 shadow-md"
                    title="Edit Playlist Name & Details"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-accentCyan" />
                    <span>Edit Name</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeletePlaylist(selectedPlaylistDetails, e)}
                    className="p-2 rounded-xl bg-red-500/25 hover:bg-red-500/40 text-red-300 hover:text-white border-2 border-red-500/50 transition active:scale-95 shadow-md"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Playlist Details Banner */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#18203c]/95 border-2 border-white/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-outfit flex items-center gap-2">
                    <span>{selectedPlaylistDetails.name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditPlaylist(selectedPlaylistDetails, e)}
                      className="p-1.5 rounded-lg hover:bg-white/20 text-slate-200 hover:text-accentCyan transition"
                      title="Edit Name"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </h3>
                  {selectedPlaylistDetails.description ? (
                    <p className="text-xs text-slate-200 mt-1 font-semibold">{selectedPlaylistDetails.description}</p>
                  ) : (
                    <p className="text-xs text-slate-400 italic mt-0.5">No description added.</p>
                  )}
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  {playlistSearch && (
                    <span className="text-xs font-mono font-bold text-slate-300 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                      Found {displayedPlaylistSongs.length} of {playlistSongs.length}
                    </span>
                  )}
                  <span className="text-xs font-mono font-black text-accentCyan px-3.5 py-1.5 rounded-full bg-accentCyan/25 border-2 border-accentCyan/50 shadow-md">
                    {playlistSongs.length} Tracks
                  </span>
                </div>
              </div>

              {/* Playlist Controls Toolbar: Search Songs, Sort Options, View Mode */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-[#18203c]/90 border border-white/15 shadow-xl">
                {/* Search Inside Playlist */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accentCyan pointer-events-none" />
                  <input
                    type="text"
                    value={playlistSearch}
                    onChange={(e) => setPlaylistSearch(e.target.value)}
                    placeholder="Search songs in this playlist..."
                    className="w-full bg-[#12182f] border border-white/20 focus:border-accentCyan rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accentCyan transition font-semibold"
                  />
                  {playlistSearch && (
                    <button
                      type="button"
                      onClick={() => setPlaylistSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
                  {/* Drag & drop helper pill (available in all sort options) */}
                  {playlistSongs.length > 1 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accentCyan/15 border border-accentCyan/40 text-[11px] font-black text-accentCyan shrink-0 shadow-sm">
                      <GripVertical className="w-3.5 h-3.5 text-accentCyan" />
                      <span>Drag songs to reorder</span>
                    </div>
                  )}

                  {/* Manual Sort Options Dropdown */}
                  <div className="flex items-center gap-1.5 bg-[#12182f] px-3 py-1.5 rounded-xl border border-white/20">
                    <ArrowUpDown className="w-3.5 h-3.5 text-accentCyan shrink-0" />
                    <span className="text-xs font-bold text-slate-300 hidden md:inline">Sort:</span>
                    <select
                      value={playlistSort}
                      onChange={(e) => setPlaylistSort(e.target.value)}
                      className="bg-transparent text-white text-xs font-black focus:outline-none cursor-pointer"
                    >
                      <option value="default" className="bg-[#18203c] text-white">Default (Custom)</option>
                      <option value="title_asc" className="bg-[#18203c] text-white">Title (A &rarr; Z)</option>
                      <option value="title_desc" className="bg-[#18203c] text-white">Title (Z &rarr; A)</option>
                      <option value="artist_asc" className="bg-[#18203c] text-white">Artist (A &rarr; Z)</option>
                      <option value="duration_asc" className="bg-[#18203c] text-white">Duration (Shortest)</option>
                      <option value="duration_desc" className="bg-[#18203c] text-white">Duration (Longest)</option>
                      <option value="newest" className="bg-[#18203c] text-white">Recently Added</option>
                    </select>
                  </div>

                  {/* View Mode Toggle: Card vs Compact List */}
                  <div className="flex items-center gap-1 bg-[#12182f] p-1 rounded-xl border border-white/20">
                    <button
                      type="button"
                      onClick={() => handleSetViewMode('card')}
                      className={`p-1.5 rounded-lg transition-all ${
                        viewMode === 'card'
                          ? 'bg-accentCyan text-black font-bold shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                      title="Card View"
                      aria-label="Card View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetViewMode('list')}
                      className={`p-1.5 rounded-lg transition-all ${
                        viewMode === 'list'
                          ? 'bg-accentCyan text-black font-bold shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                      title="Compact List View"
                      aria-label="Compact List View"
                    >
                      <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {playlistSongsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-accentCyan animate-spin" />
                </div>
              ) : playlistSongs.length === 0 ? (
                <div className="text-center py-16 rounded-3xl border-2 border-white/25 bg-[#18203c]/95 p-6 space-y-2 shadow-2xl">
                  <Music2 className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="text-base font-black text-white">Playlist is empty</h4>
                  <p className="text-xs text-slate-300 font-medium">Add songs to this playlist by clicking the folder icon on any track!</p>
                </div>
              ) : displayedPlaylistSongs.length === 0 ? (
                <div className="text-center py-12 rounded-3xl border border-white/20 bg-[#18203c]/95 p-6 space-y-3 shadow-xl">
                  <Search className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-base font-black text-white">No songs match "{playlistSearch}"</h4>
                  <p className="text-xs text-slate-300 font-medium">Try searching with a different keyword or title.</p>
                  <button
                    type="button"
                    onClick={() => setPlaylistSearch('')}
                    className="px-4 py-1.5 rounded-xl bg-accentCyan text-black font-black text-xs transition active:scale-95 shadow"
                  >
                    Clear Search Filter
                  </button>
                </div>
              ) : viewMode === 'card' ? (
                /* ── Playlist Card (Grid) View ── */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {displayedPlaylistSongs.map((song, idx) => {
                    const isCurrent = currentTrack?.id === song.id;
                    const isCurrentPlaying = isCurrent && isPlaying;
                    const isFav = isFavorite(song.id);
                    const isReorderable = displayedPlaylistSongs.length > 1;
                    const isDragging = draggedSongIndex === idx;
                    const isDragOver = dragOverIndex === idx && draggedSongIndex !== idx;

                    return (
                      <div
                        key={`${song.id}-${idx}`}
                        data-song-index={idx}
                        draggable={isReorderable}
                        onDragStart={(e) => handleDragStart(idx, e)}
                        onDragOver={(e) => handleDragOver(idx, e)}
                        onDragLeave={() => handleDragLeave(idx)}
                        onDrop={(e) => handleDrop(idx, e)}
                        onDragEnd={handleDragEnd}
                        className={`group relative rounded-xl sm:rounded-2xl border-2 p-2 sm:p-2.5 transition-all duration-300 flex flex-col gap-2 bg-[#18203c]/95 shadow-xl overflow-hidden select-none ${
                          isDragging
                            ? 'opacity-30 scale-95 border-dashed border-accentCyan'
                            : isDragOver
                            ? 'border-accentCyan shadow-[0_0_25px_rgba(99,210,255,0.7)] ring-2 ring-accentCyan bg-accentCyan/20 scale-[1.02]'
                            : isCurrent
                            ? 'border-accentPurple shadow-lg shadow-accentPurple/35 ring-2 ring-accentPurple/60'
                            : 'border-white/20 hover:border-accentPurple/70 hover:bg-[#202b52]'
                        }`}
                      >
                        {/* Drag Handle for Card View when in default sort */}
                        {isReorderable && (
                          <div
                            onTouchStart={() => handleTouchStart(idx)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            className="absolute top-2 left-2 z-10 p-1 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-slate-300 hover:text-white cursor-grab active:cursor-grabbing shadow-sm"
                            title="Touch & drag to reorder"
                          >
                            <GripVertical className="w-3 h-3 text-accentCyan" />
                          </div>
                        )}

                        <div
                          onClick={() => {
                            if (currentTrack?.id === song.id) {
                              togglePlay();
                            } else {
                              playTrack(song, displayedPlaylistSongs);
                            }
                          }}
                          className="relative w-full aspect-square rounded-xl overflow-hidden shrink-0 border-2 border-white/20 shadow-md cursor-pointer group-hover:scale-102 transition-transform bg-black"
                        >
                          <img
                            src={song.image || FALLBACK_COVER}
                            alt={song.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isCurrentPlaying ? (
                              <Pause className="w-6 h-6 text-accentCyan fill-current" />
                            ) : (
                              <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4
                            onClick={() => {
                              if (currentTrack?.id === song.id) {
                                togglePlay();
                              } else {
                                playTrack(song, displayedPlaylistSongs);
                              }
                            }}
                            className={`text-xs sm:text-sm font-black truncate font-outfit cursor-pointer ${
                              isCurrent ? 'text-accentCyan' : 'text-white'
                            }`}
                            title={song.title}
                          >
                            {song.title}
                          </h4>
                          <p className="text-[10px] sm:text-[11px] text-slate-200 truncate font-semibold" title={song.artist}>
                            {song.artist}
                          </p>
                          <div className="flex items-center justify-between gap-1 pt-1 mt-auto min-w-0">
                            <span className="text-[9px] font-mono font-bold text-slate-300 shrink-0">{formatTime(song.duration)}</span>
                            
                            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                              {/* Always Visible Heart Icon */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(song);
                                }}
                                className={`p-1 sm:p-1.5 rounded-lg border transition active:scale-90 shrink-0 ${
                                  isFav
                                    ? 'bg-red-500/20 border-red-500/60 text-red-400'
                                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-red-400 hover:bg-white/15'
                                }`}
                                title={isFav ? 'Liked' : 'Add to Favorites'}
                                aria-label="Add to Favorites"
                              >
                                <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFav ? 'fill-current text-red-400' : ''}`} />
                              </button>

                              {/* Always Visible Folder Icon */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSongToAddToPlaylist(song);
                                }}
                                className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/50 text-purple-300 hover:text-purple-200 transition active:scale-90 shrink-0"
                                title="Add to Another Playlist"
                                aria-label="Add to Playlist"
                              >
                                <FolderPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
                              </button>

                              {/* Remove from playlist button */}
                              <button
                                type="button"
                                onClick={(e) => handleRemoveSongFromCurrentPlaylist(song, e)}
                                className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-400/50 text-slate-300 hover:text-red-400 transition active:scale-90 shrink-0"
                                title="Remove from playlist"
                                aria-label="Remove from playlist"
                              >
                                <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              </button>

                              {/* Play / Pause button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentTrack?.id === song.id) {
                                    togglePlay();
                                  } else {
                                    playTrack(song, displayedPlaylistSongs);
                                  }
                                }}
                                className={`p-1 sm:p-1.5 rounded-full transition active:scale-90 border shrink-0 ${
                                  isCurrentPlaying
                                    ? 'bg-accentCyan text-black border-white shadow-[0_0_10px_rgba(99,210,255,0.7)] font-black'
                                    : 'bg-white/20 border-white/25 text-white hover:bg-accentCyan hover:text-black hover:border-accentCyan'
                                }`}
                                title={isCurrentPlaying ? 'Pause' : 'Play'}
                                aria-label={isCurrentPlaying ? 'Pause' : 'Play'}
                              >
                                {isCurrentPlaying ? <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" /> : <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ── Playlist Compact List View ── */
                <div className="space-y-1.5">
                  {displayedPlaylistSongs.map((song, idx) => {
                    const isCurrent = currentTrack?.id === song.id;
                    const isCurrentPlaying = isCurrent && isPlaying;
                    const isFav = isFavorite(song.id);
                    const isReorderable = displayedPlaylistSongs.length > 1;
                    const isDragging = draggedSongIndex === idx;
                    const isDragOver = dragOverIndex === idx && draggedSongIndex !== idx;

                    return (
                      <div
                        key={`${song.id}-${idx}`}
                        data-song-index={idx}
                        draggable={isReorderable}
                        onDragStart={(e) => handleDragStart(idx, e)}
                        onDragOver={(e) => handleDragOver(idx, e)}
                        onDragLeave={() => handleDragLeave(idx)}
                        onDrop={(e) => handleDrop(idx, e)}
                        onDragEnd={handleDragEnd}
                        className={`group flex items-center justify-between gap-2 sm:gap-4 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border transition-all duration-200 select-none ${
                          isDragging
                            ? 'opacity-30 scale-[0.98] border-dashed border-accentCyan'
                            : isDragOver
                            ? 'border-accentCyan bg-accentCyan/20 shadow-[0_0_20px_rgba(99,210,255,0.5)] ring-2 ring-accentCyan'
                            : isCurrent
                            ? 'bg-accentPurple/25 border-accentPurple shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-1 ring-accentPurple/60'
                            : 'bg-[#18203c]/90 border-white/10 hover:border-accentPurple/50 hover:bg-[#202b52] hover:shadow-md'
                        }`}
                      >
                        {/* Left: Drag Handle + Index / Play Button + Thumbnail + Title/Artist */}
                        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
                          {isReorderable && (
                            <div
                              onTouchStart={() => handleTouchStart(idx)}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/10 text-slate-400 hover:text-accentCyan transition shrink-0"
                              title="Touch & drag to reorder"
                            >
                              <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accentCyan/80 group-hover:text-accentCyan" />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => isCurrent ? togglePlay() : playTrack(song, displayedPlaylistSongs)}
                            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg hover:bg-white/10 text-xs font-mono font-bold cursor-pointer transition active:scale-90"
                          >
                            {isCurrentPlaying ? (
                              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accentCyan fill-accentCyan animate-pulse" />
                            ) : isCurrent ? (
                              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accentCyan fill-accentCyan ml-0.5" />
                            ) : (
                              <>
                                <span className="text-slate-400 group-hover:hidden">{idx + 1}</span>
                                <Play className="w-3.5 h-3.5 text-white fill-white hidden group-hover:block ml-0.5" />
                              </>
                            )}
                          </button>

                          <div
                            onClick={() => isCurrent ? togglePlay() : playTrack(song, displayedPlaylistSongs)}
                            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden shrink-0 border border-white/20 bg-black/40 cursor-pointer shadow-sm group-hover:scale-105 transition-transform"
                          >
                            <img
                              src={song.image || FALLBACK_COVER}
                              alt={song.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <h4
                              onClick={() => isCurrent ? togglePlay() : playTrack(song, displayedPlaylistSongs)}
                              className={`text-xs sm:text-sm font-black truncate cursor-pointer transition-colors ${
                                isCurrent ? 'text-accentCyan' : 'text-white group-hover:text-accentCyan'
                              }`}
                              title={song.title}
                            >
                              {song.title}
                            </h4>
                            <p className="text-[10px] sm:text-xs text-slate-300 truncate font-semibold">
                              {song.artist}
                            </p>
                          </div>
                        </div>

                        {/* Right: Duration + Actions (Heart, Folder, Remove, Play) */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300 hidden xs:inline-block">
                            {formatTime(song.duration)}
                          </span>

                          {/* Always Visible Heart Icon */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(song);
                            }}
                            className={`p-1.5 rounded-lg border transition active:scale-90 ${
                              isFav
                                ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.35)]'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:text-red-400 hover:bg-white/15 hover:border-red-400/40'
                            }`}
                            title={isFav ? 'Liked (Click to Remove)' : 'Add to Favorites'}
                            aria-label="Add to Favorites"
                          >
                            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>

                          {/* Always Visible Folder Icon */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSongToAddToPlaylist(song);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/25 border border-white/10 hover:border-purple-400/60 text-purple-300 hover:text-purple-200 transition active:scale-90 shadow-sm"
                            title="Add to Another Playlist"
                            aria-label="Add to Playlist"
                          >
                            <FolderPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                          </button>

                          {/* Remove from playlist button */}
                          <button
                            type="button"
                            onClick={(e) => handleRemoveSongFromCurrentPlaylist(song, e)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/25 border border-white/10 hover:border-red-400/50 text-slate-300 hover:text-red-400 transition active:scale-90"
                            title="Remove from playlist"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>

                          {/* Play / Pause button in list view */}
                          <button
                            type="button"
                            onClick={() => {
                              if (currentTrack?.id === song.id) {
                                togglePlay();
                              } else {
                                playTrack(song, displayedPlaylistSongs);
                              }
                            }}
                            className={`p-1.5 rounded-full transition active:scale-90 border ${
                              isCurrentPlaying
                                ? 'bg-accentCyan text-black border-white shadow-[0_0_12px_rgba(99,210,255,0.7)] font-black'
                                : 'bg-white/15 border-white/20 text-white hover:bg-accentCyan hover:text-black hover:border-accentCyan'
                            }`}
                            title={isCurrentPlaying ? 'Pause' : 'Play'}
                          >
                            {isCurrentPlaying ? (
                              <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
                            )}
                          </button>
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
                <div className="text-center py-20 rounded-3xl border-2 border-white/25 bg-[#18203c]/95 p-8 space-y-3 shadow-2xl">
                  <ListMusic className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
                  <h3 className="text-lg font-black text-white">No playlists yet</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto font-medium">
                    Create your first playlist and start gathering your favorite tracks for parties, gym, chill, and study.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCreatePlaylistModal(true)}
                    className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-black text-xs transition active:scale-95 shadow-lg border border-white"
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
                      className="group rounded-3xl border-2 border-white/25 bg-[#18203c]/95 p-4 transition-all duration-300 hover:border-accentPurple/80 hover:bg-[#202b52] shadow-xl hover:shadow-[0_10px_30px_rgba(168,85,247,0.35)] cursor-pointer space-y-3 flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600/60 to-cyan-500/60 flex items-center justify-center shrink-0 border-2 border-white/25 shadow-md">
                          {pl.cover_image ? (
                            <img src={pl.cover_image} alt={pl.name} className="w-full h-full object-cover" />
                          ) : (
                            <ListMusic className="w-6 h-6 text-accentCyan" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-sm sm:text-base text-white truncate group-hover:text-accentCyan transition-colors">
                            {pl.name}
                          </h4>
                          <p className="text-xs text-slate-200 font-bold">{pl.track_count || 0} Tracks</p>
                        </div>
                      </div>

                      {pl.description && (
                        <p className="text-[11px] text-slate-300 truncate font-semibold">{pl.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t-2 border-white/20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPlaylistDetails(pl);
                          }}
                          className="text-xs font-black text-accentCyan hover:text-white flex items-center gap-1 transition"
                        >
                          <span>Open Playlist</span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        <div className="flex items-center gap-1">
                          {/* Edit Playlist Button */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditPlaylist(pl, e)}
                            className="p-1.5 rounded-lg hover:bg-white/20 text-slate-200 hover:text-accentCyan transition active:scale-95"
                            title="Edit Playlist Name"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Playlist Button (with confirmation) */}
                          <button
                            type="button"
                            onClick={(e) => handleDeletePlaylist(pl, e)}
                            className="p-1.5 rounded-lg hover:bg-red-500/40 text-slate-200 hover:text-red-400 transition active:scale-95"
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

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: CREATE PLAYLIST
         ══════════════════════════════════════════════════════════════════════ */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md border-2 border-white/25 rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl bg-[#141a33]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-white/20">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-accentCyan stroke-[2.5]" />
                <h3 className="font-black text-base sm:text-lg text-white font-outfit">Create New Playlist</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePlaylistModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-slate-200 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-100 uppercase tracking-wider font-mono">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. Chill Beats, Gym Hype, Anime OSTs..."
                  className="w-full bg-[#1c2445] border-2 border-white/25 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-300 focus:outline-none focus:border-accentCyan focus:ring-2 focus:ring-accentCyan/50 font-semibold transition shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-100 uppercase tracking-wider font-mono">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="What's this playlist vibe about?"
                  className="w-full bg-[#1c2445] border-2 border-white/25 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-300 focus:outline-none focus:border-accentCyan focus:ring-2 focus:ring-accentCyan/50 font-semibold transition resize-none shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer hover:opacity-95 border border-white"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Create Playlist</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: EDIT PLAYLIST (NAME & DESCRIPTION)
         ══════════════════════════════════════════════════════════════════════ */}
      {editingPlaylist && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md border-2 border-white/25 rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl bg-[#141a33]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-white/20">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-accentCyan" />
                <h3 className="font-black text-base sm:text-lg text-white font-outfit">Edit Playlist</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlaylist(null)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-slate-200 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPlaylist} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-100 uppercase tracking-wider font-mono">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  required
                  value={editPlaylistName}
                  onChange={(e) => setEditPlaylistName(e.target.value)}
                  placeholder="Enter new playlist name..."
                  className="w-full bg-[#1c2445] border-2 border-white/25 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-300 focus:outline-none focus:border-accentCyan focus:ring-2 focus:ring-accentCyan/50 font-semibold transition shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-100 uppercase tracking-wider font-mono">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editPlaylistDesc}
                  onChange={(e) => setEditPlaylistDesc(e.target.value)}
                  placeholder="Update playlist description..."
                  className="w-full bg-[#1c2445] border-2 border-white/25 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-300 focus:outline-none focus:border-accentCyan focus:ring-2 focus:ring-accentCyan/50 font-semibold transition resize-none shadow-inner"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlaylist(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border-2 border-white/25 text-white text-xs font-black transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editPlaylistSaving || !editPlaylistName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-black text-xs transition flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 border border-white"
                >
                  {editPlaylistSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3: IN-APP CONFIRMATION MODAL ("ARE YOU SURE?")
         ══════════════════════════════════════════════════════════════════════ */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm border-2 border-white/25 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl bg-[#141a33] text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/25 border-2 border-red-500/50 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/35">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-black text-base sm:text-lg text-white font-outfit">
                {confirmModal.title || 'Are you sure?'}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                {confirmModal.message || 'Are you sure you want to proceed with this action?'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={closeConfirmation}
                className="flex-1 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border-2 border-white/25 text-white text-xs font-black transition active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof confirmModal.onConfirm === 'function') {
                    confirmModal.onConfirm();
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs transition shadow-lg shadow-red-500/50 active:scale-95 border border-white/30"
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 4: ADD TO PLAYLIST
         ══════════════════════════════════════════════════════════════════════ */}
      {songToAddToPlaylist && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md border-2 border-white/25 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl bg-[#141a33]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-white/20">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-accentCyan stroke-[2.5]" />
                <h3 className="font-black text-base sm:text-lg text-white font-outfit">Add Track to Playlist</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSongToAddToPlaylist(null);
                  setPlaylistAddedSuccess(null);
                }}
                className="p-1.5 rounded-xl hover:bg-white/20 text-slate-200 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Song Preview Banner */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/60 border-2 border-white/20">
              <img
                src={songToAddToPlaylist.image || FALLBACK_COVER}
                alt={songToAddToPlaylist.title}
                className="w-12 h-12 rounded-xl object-cover border border-white/20"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_COVER; }}
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-black text-white truncate">{songToAddToPlaylist.title}</h4>
                <p className="text-[10px] text-slate-200 truncate font-semibold">{songToAddToPlaylist.artist}</p>
              </div>
            </div>

            {playlistAddedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/30 border-2 border-emerald-500/60 text-emerald-200 text-xs font-black text-center animate-scale-in shadow-md flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{playlistAddedSuccess}</span>
              </div>
            )}

            {/* Existing Playlists List */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-100 uppercase tracking-wider font-mono">
                Select Destination Playlist
              </label>

              {playlists.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-white/25 rounded-2xl p-4 space-y-2">
                  <p className="text-xs text-slate-200 font-semibold">You don't have any playlists yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePlaylistModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-accentCyan text-black font-black text-xs transition active:scale-95 shadow-md"
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
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/15 hover:bg-accentCyan/25 border-2 border-white/20 hover:border-accentCyan/60 text-left transition group active:scale-98 shadow-md"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ListMusic className="w-4 h-4 text-accentCyan stroke-[2.5]" />
                        <span className="text-xs font-black text-white group-hover:text-accentCyan truncate">{pl.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-200 font-bold">{pl.track_count || 0} songs</span>
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
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-white/30 hover:border-accentCyan/70 text-slate-100 hover:text-accentCyan font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Create New Playlist for this Song</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
