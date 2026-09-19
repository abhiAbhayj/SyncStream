import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MediaGrid from '../components/MediaGrid';
import { Search as SearchIcon, Film, Tv, Sparkles, BookOpen, Music, Loader2, Globe } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';

const SEARCH_LANGUAGES = [
  { key: 'rock', label: 'Rock', flag: '🎸' },
  { key: 'kpop', label: 'K-Pop', flag: '🇰🇷' },
  { key: 'hindi', label: 'Hindi', flag: '🇮🇳' },
  { key: 'anime', label: 'Anime', flag: '🌸' },
  { key: 'english', label: 'English', flag: '🌍' },
  { key: 'kannada', label: 'Kannada', flag: '🦁' },
  { key: 'malayalam', label: 'Malayalam', flag: '🌿' },
  { key: 'telugu', label: 'Telugu', flag: '🎬' },
  { key: 'tamil', label: 'Tamil', flag: '⚡' },
  { key: 'marathi', label: 'Marathi', flag: '🚩' }
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { playTrack } = useMusic();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'movie';
  const initialLanguage = searchParams.get('lang') || searchParams.get('language') || '';
  const initialCountry = searchParams.get('country') || '';

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [language, setLanguage] = useState(initialLanguage);
  const [country, setCountry] = useState(initialCountry);
  const [sort, setSort] = useState('latest');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const MAX_PAGES = 30;

  useEffect(() => {
    // Search immediately on page load to display trending/discovered items
    executeSearch(initialQuery, initialType, initialLanguage, initialCountry, 1, sort);
  }, []);

  const executeSearch = async (searchQuery, searchType, activeLanguage = language, activeCountry = country, pageNum = 1, activeSort = sort) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setSearched(true);
    
    try {
      if (searchType === 'music') {
        const musicEndpoint = searchQuery.trim() ? '/api/music/search' : '/api/music/trending';
        const res = await axios.get(musicEndpoint, {
          params: {
            query: searchQuery.trim(),
            language: activeLanguage || 'all',
            page: pageNum,
            limit: 24
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
            language: activeLanguage, 
            country: activeCountry,
            sort: activeSort,
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
      executeSearch(query, type, language, country, nextPage);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ q: query, type, lang: language, country });
    executeSearch(query, type, language, country, 1);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setPage(1);
    setSearchParams({ q: query, type: newType, lang: language, country });
    executeSearch(query, newType, language, country, 1);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setPage(1);
    setSearchParams({ q: query, type, lang: newLang, country });
    executeSearch(query, type, newLang, country, 1);
  };

  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
    setPage(1);
    setSearchParams({ q: query, type, lang: language, country: newCountry });
    executeSearch(query, type, language, newCountry, 1);
  };

  const handleResetFilters = () => {
    setLanguage('');
    setCountry('');
    setPage(1);
    setSearchParams({ q: query, type });
    executeSearch(query, type, '', '', 1, sort);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
    executeSearch(query, type, language, country, 1, newSort);
  };

  const filterTabs = [
    { key: 'movie', label: 'Movies', icon: Film },
    { key: 'tv', label: 'TV Shows', icon: Tv },
    { key: 'anime', label: 'Anime', icon: Sparkles },
    { key: 'manga', label: 'Manga', icon: BookOpen },
    { key: 'music', label: 'Music', icon: Music }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8 min-h-[75vh]">
      
      {/* Title */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-outfit">
          Federated Discovery Engine
        </h1>
        <p className="text-sm text-gray-400">
          Query multiple global and regional catalogs simultaneously to stream videos, music, or manga.
        </p>
      </div>

      {/* Category Toggle Tabs (Scrollable on mobile) */}
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
              placeholder={`Search for ${type === 'movie' ? 'movies' : type === 'tv' ? 'TV shows' : type === 'anime' ? 'anime titles' : type === 'music' ? 'songs, artists' : 'manga entries'}...`}
              className="w-full bg-darkCard border border-darkBorder rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition shadow-inner placeholder:text-gray-600 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            Search
          </button>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap gap-4 items-center justify-start text-xs pt-2">
          
          {/* Sort selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-bold uppercase tracking-wider">Sort:</span>
            {[
              { key: 'latest', label: type === 'anime' ? '📅 Latest Episode' : type === 'manga' ? '📅 Latest Chapter' : type === 'tv' ? '📅 Latest Aired' : '📅 Latest Release' },
              { key: 'trending', label: '🔥 Trending' },
              { key: 'top_rated', label: '⭐ Top Rated' },
            ].map(s => (
              <button
                key={s.key}
                type="button"
                onClick={() => handleSortChange(s.key)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  sort === s.key
                    ? 'bg-accentPurple text-white'
                    : 'bg-darkCard border border-darkBorder text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Languages Dropdown (Replacing Genre) */}
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
              <option value="">All Languages</option>
              {SEARCH_LANGUAGES.map(lang => (
                <option key={lang.key} value={lang.key} className="bg-darkBg">
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>

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
                  { key: 'IN', label: 'India' },
                  { key: 'US', label: 'United States' },
                  { key: 'KR', label: 'South Korea' },
                  { key: 'JP', label: 'Japan' },
                  { key: 'GB', label: 'United Kingdom' },
                  { key: 'CN', label: 'China' },
                  { key: 'FR', label: 'France' },
                  { key: 'ES', label: 'Spain' },
                  { key: 'DE', label: 'Germany' }
                ].map(c => (
                  <option key={c.key} value={c.key} className="bg-darkBg">{c.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters button */}
          {(language || country) && (
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

      {/* Quick Suggestions / Shortcuts for Languages */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto pt-2 animate-fade-in">
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Languages:</span>
        {SEARCH_LANGUAGES.map((item) => {
          const isSelected = language === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleLanguageChange(isSelected ? '' : item.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition active:scale-95 ${
                isSelected
                  ? 'bg-accentCyan text-black border-accentCyan font-extrabold shadow-[0_0_12px_rgba(99,210,255,0.4)]'
                  : 'border-darkBorder bg-darkCard/40 text-gray-300 hover:text-white hover:border-accentCyan/40 hover:bg-accentCyan/5'
              }`}
            >
              <span>{item.flag}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
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
          <p className="text-gray-400 font-medium">No matches found. Try adjusting your search or language filter.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-full text-gray-500">
            <SearchIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="font-bold text-gray-300">Start Your Discovery</h3>
            <p className="text-xs text-gray-500">Select a category and language, type what you are looking for, and tap Search to check our aggregated database feeds.</p>
          </div>
        </div>
      )}

    </div>
  );
}
