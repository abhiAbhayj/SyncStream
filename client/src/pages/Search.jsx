import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MediaGrid from '../components/MediaGrid';
import { Search as SearchIcon, Film, Tv, Sparkles, BookOpen, Music, Loader2, Globe, Filter, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';

const MUSIC_LANGUAGES = [
  { key: 'blues_rap', label: 'Blues Rap', flag: '🎷' },
  { key: 'rap', label: 'Rap & Hip-Hop', flag: '🎤' },
  { key: 'rock', label: 'Rock', flag: '🎸' },
  { key: 'kpop', label: 'K-Pop', flag: '🇰🇷' },
  { key: 'korean', label: 'Korean', flag: '🇰🇷' },
  { key: 'hindi', label: 'Hindi', flag: '🇮🇳' },
  { key: 'anime', label: 'Anime', flag: '🌸' },
  { key: 'english', label: 'English', flag: '🌍' },
  { key: 'kannada', label: 'Kannada', flag: '🦁' },
  { key: 'malayalam', label: 'Malayalam', flag: '🌿' },
  { key: 'telugu', label: 'Telugu', flag: '🎬' },
  { key: 'tamil', label: 'Tamil', flag: '⚡' },
  { key: 'marathi', label: 'Marathi', flag: '🚩' }
];

const MOVIE_GENRES = [
  { key: '28', label: 'Action' },
  { key: '12', label: 'Adventure' },
  { key: '16', label: 'Animation' },
  { key: '35', label: 'Comedy' },
  { key: '80', label: 'Crime' },
  { key: '99', label: 'Documentary' },
  { key: '18', label: 'Drama' },
  { key: '10751', label: 'Family' },
  { key: '14', label: 'Fantasy' },
  { key: '36', label: 'History' },
  { key: '27', label: 'Horror' },
  { key: '10402', label: 'Music' },
  { key: '9648', label: 'Mystery' },
  { key: '10749', label: 'Romance' },
  { key: '878', label: 'Science Fiction' },
  { key: '53', label: 'Thriller' },
  { key: '10752', label: 'War' },
  { key: '37', label: 'Western' },
  { key: 'k_9715', label: 'Superhero' },
  { key: 'k_779', label: 'Martial Arts' },
  { key: 'k_272553', label: 'Psychological' },
  { key: 'k_6152', label: 'Supernatural' },
  { key: 'k_12377', label: 'Zombie' }
];

const TV_GENRES = [
  { key: '10759', label: 'Action & Adventure' },
  { key: '16', label: 'Animation' },
  { key: '35', label: 'Comedy' },
  { key: '80', label: 'Crime' },
  { key: '99', label: 'Documentary' },
  { key: '18', label: 'Drama' },
  { key: '10751', label: 'Family' },
  { key: '10762', label: 'Kids' },
  { key: '9648', label: 'Mystery' },
  { key: '10764', label: 'Reality' },
  { key: '10765', label: 'Sci-Fi & Fantasy' },
  { key: 'k_9840', label: 'Romance' },
  { key: 'k_315058', label: 'Horror & Thriller' },
  { key: 'k_9715', label: 'Superhero' },
  { key: 'k_6152', label: 'Supernatural' },
  { key: 'k_10770', label: 'Medical Drama' },
  { key: 'k_10771', label: 'Legal Drama' },
  { key: '10768', label: 'War & Politics' },
  { key: '37', label: 'Western' },
  { key: 'k_9755', label: 'Sitcom' }
];

const ANIME_GENRES = [
  { key: 'g_10759', label: 'Action' },
  { key: 'g_35', label: 'Comedy' },
  { key: 'g_18', label: 'Drama' },
  { key: 'g_10765', label: 'Sci-Fi & Fantasy' },
  { key: 'k_9840', label: 'Romance' },
  { key: 'k_195669', label: 'Ecchi' },
  { key: 'k_9194', label: 'Harem' },
  { key: 'k_237451', label: 'Isekai' },
  { key: 'k_6152', label: 'Supernatural' },
  { key: 'k_207826', label: 'Shounen' },
  { key: 'k_195668', label: 'Seinen' },
  { key: 'k_206437', label: 'Shoujo' },
  { key: 'k_10873', label: 'School Life' },
  { key: 'k_9914', label: 'Slice of Life' },
  { key: 'k_10046', label: 'Mecha' },
  { key: 'k_6075', label: 'Sports' },
  { key: 'g_9648', label: 'Mystery' },
  { key: 'k_315058', label: 'Horror' },
  { key: 'k_272553', label: 'Psychological' },
  { key: 'k_2343', label: 'Magic' },
  { key: 'k_779', label: 'Martial Arts' },
  { key: 'k_361426', label: 'Demons' },
  { key: 'k_283297', label: 'Music' },
  { key: 'k_3133', label: 'Vampire' }
];

const MANGA_GENRES = [
  { key: '391b0423-d847-456f-aff0-8b0cfc03066b', label: 'Action' },
  { key: '87cc87cd-a395-47af-b27a-93258283bbc6', label: 'Adventure' },
  { key: '4d32cc48-9f00-4cca-9b5a-a839f0764984', label: 'Comedy' },
  { key: '423e2eae-a7a2-4a8b-ac03-a8351462d71d', label: 'Romance' },
  { key: 'cdc58593-87dd-415e-bbc0-2ec27bf404cc', label: 'Fantasy' },
  { key: 'b9af3a63-f058-46de-a9a0-e0c13906197a', label: 'Drama' },
  { key: '256c8bd9-4904-4360-bf4f-508a76d67183', label: 'Sci-Fi' },
  { key: 'eabc5b4c-6aff-42f3-b657-3e90cbd00b75', label: 'Supernatural' },
  { key: 'ace04997-f6bd-436e-b261-779182193d3d', label: 'Isekai' },
  { key: 'aafb99c1-7f60-43fa-b75f-fc9502ce29c7', label: 'Harem' },
  { key: '2d1f5d56-a1e5-4d0d-a961-29734e194866', label: 'Ecchi' },
  { key: 'ee968100-4191-4968-93d3-f82d72be7e46', label: 'Mystery' },
  { key: 'cdad7e68-1419-41dd-bdce-27753074a640', label: 'Horror' },
  { key: '3b60b75c-a2d7-4860-ab56-05f391bb889c', label: 'Psychological' },
  { key: 'e5301a23-ebd9-49dd-a0cb-2add944c7fe9', label: 'Slice of Life' },
  { key: '50880a9d-5440-4732-9afb-8f457127e836', label: 'Mecha' },
  { key: '69964a64-2f90-4d33-beeb-f3ed2875eb4c', label: 'Sports' },
  { key: '799c202e-7daa-44eb-9cf7-8a3c0441531e', label: 'Martial Arts' },
  { key: 'a1f53773-c69a-4ce5-8cab-fffcd90b1565', label: 'Magic' },
  { key: '39730448-9a5f-48a2-85b0-a70db87b1233', label: 'Demons' },
  { key: 'd_shounen', label: 'Shounen' },
  { key: 'd_seinen', label: 'Seinen' },
  { key: 'd_shoujo', label: 'Shoujo' },
  { key: 'd_josei', label: 'Josei' }
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { playTrack } = useMusic();
  
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'movie';
  const initialGenre = searchParams.get('genre') || '';
  const initialLanguage = searchParams.get('lang') || searchParams.get('language') || '';
  const initialCountry = searchParams.get('country') || '';

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [musicCategory, setMusicCategory] = useState('all');
  const [genre, setGenre] = useState(initialGenre);
  const [language, setLanguage] = useState(initialLanguage);
  const [country, setCountry] = useState(initialCountry);
  const [sort, setSort] = useState('latest');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const MAX_PAGES = 30;

  // React to searchParams updates (e.g. from MediaDetail click or back navigation)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const t = searchParams.get('type') || 'movie';
    let g = searchParams.get('genre') || '';
    const l = searchParams.get('lang') || searchParams.get('language') || '';
    const c = searchParams.get('country') || '';
    const y = searchParams.get('year') || '';

    // If genre was passed as a label (e.g. 'Action'), resolve it to key
    if (g && !g.startsWith('k_') && !g.startsWith('g_') && !g.startsWith('d_') && isNaN(parseInt(g, 10))) {
      const allGenresForType = t === 'movie' ? MOVIE_GENRES : (t === 'tv' ? TV_GENRES : (t === 'anime' ? ANIME_GENRES : MANGA_GENRES));
      const matched = allGenresForType.find(x => x.label.toLowerCase() === g.toLowerCase());
      if (matched) {
        g = matched.key;
      }
    }

    setQuery(q);
    setType(t);
    setGenre(g);
    setLanguage(l);
    setCountry(c);
    setYear(y);
    setPage(1);
    
    executeSearch(q, t, g, l, c, 1, sort, 'all', y);
  }, [searchParams]);

  const executeSearch = async (searchQuery, searchType, activeGenre = genre, activeLanguage = language, activeCountry = country, pageNum = 1, activeSort = sort, activeMusicCat = musicCategory, activeYear = year, forceRefresh = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setSearched(true);
    
    try {
      if (searchType === 'music') {
        const musicEndpoint = searchQuery.trim() ? '/api/music/search' : '/api/music/trending';
        const res = await axios.get(musicEndpoint, {
          params: {
            query: searchQuery.trim(),
            category: activeMusicCat || 'all',
            language: activeLanguage || 'all',
            page: pageNum,
            limit: 24,
            refresh: forceRefresh ? 'true' : undefined
          }
        });
        const musicItems = (res.data.songs || []).map(s => ({
          ...s,
          poster_path: s.image,
          vote_average: '9.0',
          media_type: 'music'
        }));
        if (pageNum === 1) {
          setResults(musicItems);
        } else {
          setResults(prev => [...prev, ...musicItems]);
        }
      } else {
        const res = await axios.get('/api/media/search', {
          params: { 
            query: searchQuery.trim(), 
            type: searchType, 
            genre: activeGenre,
            language: activeLanguage, 
            country: activeCountry,
            sort: activeSort,
            year: activeYear || undefined,
            page: pageNum
          }
        });
        
        if (pageNum === 1) {
          setResults(res.data || []);
        } else {
          setResults(prev => [...prev, ...(res.data || [])]);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      if (pageNum === 1) setResults([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (page < MAX_PAGES) {
      const nextPage = page + 1;
      setPage(nextPage);
      executeSearch(query, type, genre, language, country, nextPage, sort, musicCategory, year);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ q: query, type, genre, lang: language, country, year });
    executeSearch(query, type, genre, language, country, 1, sort, musicCategory, year);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setGenre('');
    setLanguage('');
    setCountry('');
    setYear('');
    setPage(1);
    setSearchParams({ q: query, type: newType });
    executeSearch(query, newType, '', '', '', 1, sort, musicCategory, '');
  };

  const handleGenreChange = (newGenre) => {
    setGenre(newGenre);
    setPage(1);
    setSearchParams({ q: query, type, genre: newGenre, lang: language, country, year });
    executeSearch(query, type, newGenre, language, country, 1, sort, musicCategory, year);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setPage(1);
    setSearchParams({ q: query, type, genre, lang: newLang, country, year });
    executeSearch(query, type, genre, newLang, country, 1, sort, musicCategory, year);
  };

  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
    setPage(1);
    setSearchParams({ q: query, type, genre, lang: language, country: newCountry, year });
    executeSearch(query, type, genre, language, newCountry, 1, sort, musicCategory, year);
  };

  const handleYearChange = (newYear) => {
    setYear(newYear);
    setPage(1);
    setSearchParams({ q: query, type, genre, lang: language, country, year: newYear });
    executeSearch(query, type, genre, language, country, 1, sort, musicCategory, newYear);
  };

  const handleResetFilters = () => {
    setGenre('');
    setLanguage('');
    setCountry('');
    setYear('');
    setPage(1);
    setSearchParams({ q: query, type });
    executeSearch(query, type, '', '', '', 1, sort, musicCategory, '');
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
    // If user clicks a feed clip (e.g. Ongoing Anime, Trending) while a text query is present,
    // clear the text query so the full category feed is loaded cleanly
    if (query && query.trim()) {
      setQuery('');
      setSearchParams({ type, genre, lang: language, country, year });
      executeSearch('', type, genre, language, country, 1, newSort, musicCategory, year);
    } else {
      executeSearch(query, type, genre, language, country, 1, newSort, musicCategory, year);
    }
  };

  const filterTabs = [
    { key: 'movie', label: 'Movies', icon: Film },
    { key: 'tv', label: 'TV Shows', icon: Tv },
    { key: 'anime', label: 'Anime', icon: Sparkles },
    { key: 'manga', label: 'Manga', icon: BookOpen },
    { key: 'music', label: 'Music', icon: Music }
  ];

  const currentGenres = type === 'movie' 
    ? MOVIE_GENRES 
    : type === 'tv' 
    ? TV_GENRES 
    : type === 'anime' 
    ? ANIME_GENRES 
    : MANGA_GENRES;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8 min-h-[75vh]">
      
      {/* Title with Live Indicator and Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-outfit">
              Federated Discovery Engine
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Query multiple global and regional catalogs simultaneously to stream movies, series, anime, manga, and music.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setPage(1);
            executeSearch(query, type, genre, language, country, 1, sort, musicCategory, year, true);
          }}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition active:scale-95 shrink-0 self-center sm:self-auto"
          title="Refresh current live feed"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-accentCyan ${loading ? 'animate-spin' : ''}`} />
          <span>Live Refresh</span>
        </button>
      </div>

      {/* Category Toggle Tabs */}
      <div className="flex items-center justify-start gap-2 border-b border-darkBorder pb-3 overflow-x-auto scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = type === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTypeChange(tab.key)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-accentCyan text-black font-extrabold shadow-lg shadow-accentCyan/20'
                  : 'text-gray-400 border border-darkBorder bg-darkCard/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search and Filters Console */}
      <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto space-y-4 bg-darkCard/30 border border-darkBorder/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 sm:w-5 h-4 sm:h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search for ${type === 'movie' ? 'movies' : type === 'tv' ? 'TV shows' : type === 'anime' ? 'anime titles' : type === 'music' ? 'Artist, Movie, Series, Anime, or Song name' : 'manga entries'}...`}
              className="w-full bg-darkCard border border-darkBorder rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition shadow-inner placeholder:text-gray-600 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
          >
            Search
          </button>
        </div>

        {/* Music Category Selector Pills (Only when Music is active) */}
        {type === 'music' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {[
              { id: 'all', label: 'All Music' },
              { id: 'artist', label: '🎤 Artists' },
              { id: 'movie', label: '🎬 Movie OSTs' },
              { id: 'series', label: '📺 TV Series' },
              { id: 'anime', label: '🌸 Anime OSTs' },
              { id: 'song', label: '🎶 Songs' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setMusicCategory(cat.id);
                  setPage(1);
                  executeSearch(query, type, genre, language, country, 1, sort, cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 border ${
                  musicCategory === cat.id
                    ? 'bg-accentCyan text-black border-accentCyan shadow-[0_0_10px_rgba(var(--accent-cyan),0.4)]'
                    : 'bg-darkCard/60 border-darkBorder text-gray-300 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Feed Selector Clips (Trending, Ongoing Anime, Latest, Upcoming, Top Rated) */}
        {type !== 'music' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            <span className="text-gray-400 font-bold uppercase tracking-wider shrink-0 mr-1 text-[11px]">Feed:</span>
            {[
              { key: 'trending', label: '🔥 Trending Hits' },
              { key: 'ongoing', label: type === 'anime' ? '⚡ Ongoing Anime' : type === 'tv' ? '⚡ Ongoing TV Shows' : type === 'manga' ? '⚡ Ongoing Manga' : '⚡ Now In Theaters' },
              { key: 'latest', label: type === 'anime' ? '📅 Latest Episode' : type === 'manga' ? '📅 Latest Chapter' : type === 'tv' ? '📅 Latest Aired' : '📅 Latest Release' },
              { key: 'upcoming', label: '🚀 Upcoming Releases' },
              { key: 'top_rated', label: '⭐ Top Rated' },
            ].map(s => (
              <button
                key={s.key}
                type="button"
                onClick={() => handleSortChange(s.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 border ${
                  sort === s.key
                    ? 'bg-gradient-to-r from-accentCyan to-accentPurple text-black border-transparent shadow-[0_0_14px_rgba(var(--accent-cyan),0.45)] font-extrabold'
                    : 'bg-darkCard/60 border-darkBorder text-gray-300 hover:text-white hover:border-white/25'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Filter controls row */}
        <div className="flex flex-wrap gap-4 items-center justify-start text-xs pt-1">

          {/* 1. MUSIC: Show Languages Dropdown */}
          {type === 'music' ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-accentCyan" />
                <span>Language:</span>
              </span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-4 py-2 bg-darkCard border border-darkBorder rounded-xl text-gray-200 focus:outline-none focus:border-accentCyan transition cursor-pointer font-semibold"
              >
                <option value="">All Hits</option>
                {MUSIC_LANGUAGES.map(lang => (
                  <option key={lang.key} value={lang.key} className="bg-darkBg">
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* 2. MOVIES/TV/ANIME/MANGA: Show Genre Dropdown */
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-accentCyan" />
                <span>Genre:</span>
              </span>
              <select
                value={genre}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="px-4 py-2 bg-darkCard border border-darkBorder rounded-xl text-gray-200 focus:outline-none focus:border-accentCyan transition cursor-pointer font-semibold max-w-[200px] truncate"
              >
                <option value="">All Genres</option>
                {currentGenres.map(g => (
                  <option key={g.key} value={g.key} className="bg-darkBg">{g.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Country select (only for Movie/TV) */}
          {(type === 'movie' || type === 'tv') && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold uppercase tracking-wider">Country:</span>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="px-4 py-2 bg-darkCard border border-darkBorder rounded-xl text-gray-200 focus:outline-none focus:border-accentCyan transition cursor-pointer font-semibold"
              >
                <option value="">All Countries</option>
                {[
                  { key: 'US', label: 'United States' },
                  { key: 'KR', label: 'South Korea' },
                  { key: 'JP', label: 'Japan' },
                  { key: 'IN', label: 'India' },
                  { key: 'GB', label: 'United Kingdom' },
                  { key: 'CN', label: 'China' },
                  { key: 'FR', label: 'France' },
                  { key: 'ES', label: 'Spain' },
                  { key: 'CA', label: 'Canada' },
                  { key: 'DE', label: 'Germany' },
                  { key: 'IT', label: 'Italy' },
                  { key: 'AU', label: 'Australia' },
                  { key: 'TH', label: 'Thailand' }
                ].map(c => (
                  <option key={c.key} value={c.key} className="bg-darkBg">{c.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Year filter (for movie/tv/anime/manga, not music) */}
          {(type === 'movie' || type === 'tv' || type === 'anime' || type === 'manga') && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold uppercase tracking-wider">Year:</span>
              <select
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
                className="px-4 py-2 bg-darkCard border border-darkBorder rounded-xl text-gray-200 focus:outline-none focus:border-accentCyan transition cursor-pointer font-semibold"
              >
                <option value="">All Years</option>
                {Array.from({ length: new Date().getFullYear() - 1949 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={String(y)} className="bg-darkBg">{y}</option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters button */}
          {(genre || language || country || year) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-accentPink hover:underline ml-auto"
            >
              Clear Filters
            </button>
          )}
        </div>
      </form>

      {/* Quick Suggestions / Shortcuts */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto pt-2 animate-fade-in">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
          {type === 'music' ? 'Languages:' : 'Quick Genres:'}
        </span>
        
        {type === 'music' ? (
          MUSIC_LANGUAGES.map((item) => {
            const isSelected = language === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleLanguageChange(isSelected ? '' : item.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition active:scale-95 ${
                  isSelected
                    ? 'bg-accentCyan text-black border-accentCyan font-extrabold shadow-[0_0_12px_rgba(var(--accent-cyan),0.4)]'
                    : 'border-darkBorder bg-darkCard/40 text-gray-300 hover:text-white hover:border-accentCyan/40 hover:bg-accentCyan/5'
                }`}
              >
                <span>{item.flag}</span>
                <span>{item.label}</span>
              </button>
            );
          })
        ) : (
          (() => {
            const quickList = type === 'movie'
              ? [
                  { label: 'Action', key: '28' },
                  { label: 'Comedy', key: '35' },
                  { label: 'Sci-Fi', key: '878' },
                  { label: 'Horror', key: '27' },
                  { label: 'Romance', key: '10749' },
                  { label: 'Thriller', key: '53' },
                  { label: 'Animation', key: '16' },
                  { label: 'Superhero', key: 'k_9715' },
                  { label: 'Fantasy', key: '14' }
                ]
              : type === 'tv'
              ? [
                  { label: 'Action & Adventure', key: '10759' },
                  { label: 'Comedy', key: '35' },
                  { label: 'Sci-Fi & Fantasy', key: '10765' },
                  { label: 'Drama', key: '18' },
                  { label: 'Crime', key: '80' },
                  { label: 'Mystery', key: '9648' },
                  { label: 'Romance', key: 'k_9840' },
                  { label: 'Horror & Thriller', key: 'k_315058' },
                  { label: 'Superhero', key: 'k_9715' }
                ]
              : type === 'anime'
              ? [
                  { label: 'Action', key: 'g_10759' },
                  { label: 'Comedy', key: 'g_35' },
                  { label: 'Romance', key: 'k_9840' },
                  { label: 'Ecchi', key: 'k_195669' },
                  { label: 'Harem', key: 'k_9194' },
                  { label: 'Isekai', key: 'k_237451' },
                  { label: 'Supernatural', key: 'k_6152' },
                  { label: 'Shounen', key: 'k_207826' },
                  { label: 'Slice of Life', key: 'k_9914' },
                  { label: 'Mecha', key: 'k_10046' }
                ]
              : [
                  { label: 'Action', key: '391b0423-d847-456f-aff0-8b0cfc03066b' },
                  { label: 'Romance', key: '423e2eae-a7a2-4a8b-ac03-a8351462d71d' },
                  { label: 'Comedy', key: '4d32cc48-9f00-4cca-9b5a-a839f0764984' },
                  { label: 'Fantasy', key: 'cdc58593-87dd-415e-bbc0-2ec27bf404cc' },
                  { label: 'Isekai', key: 'ace04997-f6bd-436e-b261-779182193d3d' },
                  { label: 'Harem', key: 'aafb99c1-7f60-43fa-b75f-fc9502ce29c7' },
                  { label: 'Ecchi', key: '2d1f5d56-a1e5-4d0d-a961-29734e194866' },
                  { label: 'Supernatural', key: 'eabc5b4c-6aff-42f3-b657-3e90cbd00b75' },
                  { label: 'Shounen', key: 'd_shounen' }
                ];

            return quickList.map((item) => {
              const isSelected = genre === item.key;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    const nextG = isSelected ? '' : item.key;
                    setGenre(nextG);
                    setSearchParams({ q: query, type, genre: nextG, country, lang: language });
                    executeSearch(query, type, nextG, language, country, 1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-accentCyan text-black border-accentCyan font-extrabold shadow-[0_0_12px_rgba(var(--accent-cyan),0.4)]'
                      : 'border-darkBorder bg-darkCard/40 text-gray-300 hover:text-white hover:border-accentCyan/40 hover:bg-accentCyan/5'
                  }`}
                >
                  {item.label}
                </button>
              );
            });
          })()
        )}
      </div>

      {/* Results Display */}
      {loading && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-accentCyan" />
          <p className="text-gray-400 font-medium">Searching catalog...</p>
        </div>
      ) : searched && results.length > 0 ? (
        <div className="animate-slide-up space-y-8">
          <MediaGrid items={results} title={query ? `Matches for "${query}"` : "Discovered Results"} />
          
          {/* Load More Button */}
          {!loading && page < MAX_PAGES && (
            <div className="flex justify-center pt-4 pb-12">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-bold transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-accentCyan" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </div>
      ) : searched && results.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-gray-400 font-medium">No matches found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-full text-gray-500">
            <SearchIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="font-bold text-gray-300">Start Your Discovery</h3>
            <p className="text-xs text-gray-500">Select a category and filters, type what you are looking for, and tap Search to check our aggregated database feeds.</p>
          </div>
        </div>
      )}

    </div>
  );
}
