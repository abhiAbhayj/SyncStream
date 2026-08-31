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
  Volume2
} from 'lucide-react';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const LANGUAGES = [
  { id: 'all', label: '🔥 All Hits', flag: '🌍' },
  { id: 'hindi', label: 'Bollywood (Hindi)', flag: '🇮🇳' },
  { id: 'english', label: 'Global Pop (English)', flag: '🇬🇧' },
  { id: 'korean', label: 'K-Pop (Korean)', flag: '🇰🇷' },
  { id: 'tamil', label: 'Kollywood (Tamil)', flag: '⚡' },
  { id: 'telugu', label: 'Tollywood (Telugu)', flag: '💥' },
  { id: 'malayalam', label: 'Mollywood (Malayalam)', flag: '🌿' },
  { id: 'kannada', label: 'Sandalwood (Kannada)', flag: '🦁' },
  { id: 'punjabi', label: 'Punjabi Hits', flag: '🥁' },
  { id: 'lofi', label: 'Lo-Fi Chill', flag: '☕' },
  { id: 'anime', label: 'Anime & J-Pop', flag: '🌸' }
];

export default function Music() {
  const { currentTrack, isPlaying, playTrack, playQueue, togglePlay, addToQueue } = useMusic();

  const [selectedLang, setSelectedLang] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [featuredSong, setFeaturedSong] = useState(null);

  // Fetch trending songs by language
  const fetchTrending = async (lang = 'all') => {
    setLoading(true);
    try {
      const res = await axios.get('/api/music/trending', {
        params: { language: lang, limit: 24 }
      });
      const trackList = res.data.songs || [];
      setSongs(trackList);
      if (trackList.length > 0) {
        setFeaturedSong(trackList[0]);
      }
    } catch (err) {
      console.error('Error fetching trending music:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch curated charts
  const fetchCharts = async () => {
    try {
      const res = await axios.get('/api/music/charts');
      setCharts(res.data || []);
    } catch (err) {
      console.error('Error fetching charts:', err);
    }
  };

  // Handle Search
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      fetchTrending(selectedLang);
      return;
    }

    setSearching(true);
    setLoading(true);
    try {
      const res = await axios.get('/api/music/search', {
        params: { query: searchQuery.trim(), language: selectedLang, limit: 30 }
      });
      setSongs(res.data.songs || []);
    } catch (err) {
      console.error('Error searching music:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending(selectedLang);
    fetchCharts();
  }, [selectedLang]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-10 min-h-[85vh]">
      
      {/* ── Top Header Banner ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-darkBorder">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accentCyan/10 border border-accentCyan/20 text-accentCyan text-xs font-bold uppercase tracking-wider font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>High-Fidelity 320kbps Audio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit tracking-tight">
            Global & Regional Music Portal
          </h1>
          <p className="text-sm text-gray-400">
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
              className="w-full bg-darkCard/80 border border-darkBorder rounded-2xl pl-11 pr-24 py-3 text-sm text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition shadow-inner placeholder:text-gray-500 font-medium"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-white text-xs font-bold hover:shadow-[0_0_15px_rgba(99,210,255,0.4)] transition"
            >
              Search
            </button>
          </form>

          {/* Quick Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] text-gray-400">
            <span className="font-semibold text-gray-500 shrink-0">Try:</span>
            {['Hunt You Down', 'Kesariya', 'Believer', 'Illuminati', 'BTS', 'Anirudh'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  setSearching(true);
                  setLoading(true);
                  axios.get('/api/music/search', { params: { query: tag, limit: 30 } })
                    .then(res => setSongs(res.data.songs || []))
                    .catch(console.error)
                    .finally(() => setLoading(false));
                }}
                className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-accentCyan/10 hover:text-accentCyan border border-white/5 whitespace-nowrap transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Language Filter Selector Chips ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5 text-accentCyan" />
          <span>Select Language / Region</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  setSelectedLang(lang.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-accentCyan/20 to-accentPurple/20 border-accentCyan text-white shadow-[0_0_15px_rgba(99,210,255,0.25)] scale-105'
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

      {/* ── Featured Hero Spotlight (When available and not searching) ── */}
      {featuredSong && !searchQuery && (
        <div className="relative rounded-3xl overflow-hidden border border-white/10 p-6 sm:p-8 bg-gradient-to-r from-darkCard via-darkBg to-darkCard/80 shadow-2xl flex flex-col md:flex-row items-center gap-8 group">
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 pointer-events-none group-hover:opacity-35 transition-opacity"
            style={{ backgroundImage: `url(${featuredSong.image})` }}
          />

          {/* Hero Cover Art */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-500">
            <img
              src={featuredSong.image || 'https://placehold.co/200x200/1e1e24/fff?text=Music'}
              alt={featuredSong.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => playTrack(featuredSong, songs)}
                className="w-14 h-14 rounded-full bg-accentCyan text-black flex items-center justify-center shadow-[0_0_25px_rgba(99,210,255,0.8)] transform scale-90 group-hover:scale-100 transition-transform"
              >
                {currentTrack?.id === featuredSong.id && isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-1" />
                )}
              </button>
            </div>
          </div>

          {/* Hero Meta Details */}
          <div className="relative z-10 flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <span className="uppercase text-[11px] font-extrabold px-3 py-1 rounded-full bg-accentCyan/20 text-accentCyan border border-accentCyan/40 tracking-wider font-mono">
                Featured Spotlight &bull; {featuredSong.language}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-outfit tracking-tight">
                {featuredSong.title}
              </h2>
              <p className="text-base text-gray-300 font-medium font-sans">
                {featuredSong.artist}
              </p>
              {featuredSong.album && (
                <p className="text-xs text-gray-500 font-mono">
                  Album: {featuredSong.album}
                </p>
              )}
            </div>

            {/* Hero Quick Play Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                onClick={() => playTrack(featuredSong, songs)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accentCyan to-accentPurple text-white text-sm font-bold shadow-[0_0_20px_rgba(99,210,255,0.4)] hover:shadow-[0_0_30px_rgba(99,210,255,0.7)] transition active:scale-95"
              >
                {currentTrack?.id === featuredSong.id && isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Song</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Spotlight Track</span>
                  </>
                )}
              </button>

              <button
                onClick={() => playQueue(songs, 0)}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/10 transition active:scale-95"
              >
                <Disc3 className="w-4 h-4 text-accentCyan" />
                <span>Play All ({songs.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Songs Grid / List ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-white font-outfit flex items-center gap-2">
            <Flame className="w-5 h-5 text-accentPink" />
            <span>
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : `${LANGUAGES.find(l => l.id === selectedLang)?.label || 'Trending'} Tracks`}
            </span>
          </h3>

          <span className="text-xs font-mono text-gray-400">
            {songs.length} Tracks Available
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-accentCyan animate-spin" />
            <p className="text-xs font-bold text-gray-400 font-mono">Loading pristine audio streams...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-2xl border border-white/10 p-8 space-y-3">
            <Music2 className="w-12 h-12 text-gray-600 mx-auto" />
            <h4 className="text-lg font-bold text-gray-300">No tracks found</h4>
            <p className="text-xs text-gray-500">Try searching for a different song title, artist, or language category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {songs.map((song, idx) => {
              const isCurrent = currentTrack?.id === song.id;
              const isCurrentPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={`${song.id}-${idx}`}
                  className={`group relative glass-panel rounded-2xl border p-3 transition-all duration-300 flex items-center gap-3.5 overflow-hidden ${
                    isCurrent
                      ? 'bg-accentCyan/15 border-accentCyan/40 shadow-[0_0_20px_rgba(99,210,255,0.2)]'
                      : 'border-white/5 bg-darkCard/40 hover:border-accentCyan/30 hover:bg-darkCard/70 hover:shadow-xl'
                  }`}
                >
                  {/* Album Cover */}
                  <div
                    onClick={() => playTrack(song, songs)}
                    className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md cursor-pointer group-hover:scale-105 transition-transform"
                  >
                    <img
                      src={song.image || 'https://placehold.co/150x150/1e1e24/fff?text=Music'}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isCurrentPlaying ? (
                        <Pause className="w-5 h-5 text-accentCyan fill-current" />
                      ) : (
                        <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                      )}
                    </div>
                    {isCurrentPlaying && (
                      <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-accentCyan shadow-[0_0_6px_#fff]" />
                    )}
                  </div>

                  {/* Meta */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <h4
                        onClick={() => playTrack(song, songs)}
                        className={`text-sm font-bold truncate font-outfit cursor-pointer transition-colors ${
                          isCurrent ? 'text-accentCyan' : 'text-white group-hover:text-accentCyan'
                        }`}
                      >
                        {song.title}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-400 truncate font-medium">
                      {song.artist}
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[10px] font-mono font-bold text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-600" />
                        {formatTime(song.duration)}
                      </span>
                      {song.language && (
                        <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-white/5 text-gray-400 border border-white/10 font-mono">
                          {song.language}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Play & Add to Queue) */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      onClick={() => playTrack(song, songs)}
                      className={`p-2 rounded-full transition active:scale-90 ${
                        isCurrentPlaying
                          ? 'bg-accentCyan text-black shadow-[0_0_10px_rgba(99,210,255,0.6)]'
                          : 'bg-white/10 text-white hover:bg-accentCyan hover:text-black'
                      }`}
                      title={isCurrentPlaying ? 'Pause' : 'Play Now'}
                    >
                      {isCurrentPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    <button
                      onClick={() => addToQueue(song)}
                      className="p-1 text-gray-400 hover:text-accentCyan hover:bg-white/5 rounded-lg transition"
                      title="Add to queue"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Curated Playlists / Charts Showcase ── */}
      {charts.length > 0 && !searchQuery && (
        <div className="space-y-8 pt-6 border-t border-darkBorder">
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-white font-outfit flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-accentCyan" />
              <span>Curated Charts & Playlists</span>
            </h3>
            <p className="text-xs text-gray-400 font-medium">Explore hand-picked top trending regional and global playlists.</p>
          </div>

          <div className="space-y-8">
            {charts.slice(0, 4).map((chart) => (
              <div key={chart.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-white font-outfit">{chart.title}</h4>
                  <button
                    onClick={() => playQueue(chart.songs, 0)}
                    className="text-xs font-bold text-accentCyan hover:underline flex items-center gap-1"
                  >
                    <span>Play Playlist</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {chart.songs.map((s, idx) => (
                    <div
                      key={`${s.id}-${idx}`}
                      onClick={() => playTrack(s, chart.songs)}
                      className="group p-2.5 rounded-2xl glass-panel border border-white/5 hover:border-accentCyan/40 bg-darkCard/40 hover:bg-darkCard transition cursor-pointer space-y-2"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg">
                        <img
                          src={s.image || 'https://placehold.co/150x150/1e1e24/fff?text=Music'}
                          alt={s.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-accentCyan text-black flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-white truncate font-outfit group-hover:text-accentCyan transition-colors">
                          {s.title}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {s.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
