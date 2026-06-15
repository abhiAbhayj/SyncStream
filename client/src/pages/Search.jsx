import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MediaGrid from '../components/MediaGrid';
import { Search as SearchIcon, Film, Tv, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'movie';
  const initialGenre = searchParams.get('genre') || '';
  const initialCountry = searchParams.get('country') || '';

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [genre, setGenre] = useState(initialGenre);
  const [country, setCountry] = useState(initialCountry);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // If any filter or query exists on load, search immediately
    if (initialQuery || initialGenre || initialCountry) {
      executeSearch(initialQuery, initialType, initialGenre, initialCountry);
    }
  }, []);

  const getGenreId = (genreKey, mediaType) => {
    if (!genreKey) return '';
    if (mediaType === 'movie' || mediaType === 'tv') {
      const mapping = {
        action: mediaType === 'tv' ? '10759' : '28',
        comedy: '35',
        drama: '18',
        scifi: mediaType === 'tv' ? '10765' : '878',
        romance: '10749',
        horror: '27',
        animation: '16',
        mystery: '9648'
      };
      return mapping[genreKey] || '';
    }
    if (mediaType === 'anime') {
      const mapping = {
        action: '1',
        comedy: '4',
        fantasy: '10',
        romance: '22',
        scifi: '24'
      };
      return mapping[genreKey] || '';
    }
    if (mediaType === 'manga') {
      const mapping = {
        action: '391b0425-d6f1-456d-9f4f-d0e124572215',
        comedy: '4d32cc48-9f00-4cca-9b5a-a839f0764984',
        fantasy: 'cdc58593-abbf-46a0-a47f-99a385c20756',
        romance: '423e2eae-a7a2-4a8b-ac03-a05fc51b14dd',
        scifi: '256c8064-a9f8-4a54-a55b-5b3a13486a9a'
      };
      return mapping[genreKey] || '';
    }
    return '';
  };

  const executeSearch = async (searchQuery, searchType, activeGenre = genre, activeCountry = country) => {
    setLoading(true);
    setSearched(true);
    try {
      const genreId = getGenreId(activeGenre, searchType);
      const res = await axios.get('/api/media/search', {
        params: { 
          query: searchQuery.trim(), 
          type: searchType, 
          genre: genreId, 
          country: activeCountry 
        }
      });
      setResults(res.data || []);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query, type, genre, country });
    executeSearch(query, type, genre, country);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setGenre('');
    setCountry('');
    setSearchParams({ q: query, type: newType });
    executeSearch(query, newType, '', '');
  };

  const handleGenreChange = (newGenre) => {
    setGenre(newGenre);
    setSearchParams({ q: query, type, genre: newGenre, country });
    executeSearch(query, type, newGenre, country);
  };

  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
    setSearchParams({ q: query, type, genre, country: newCountry });
    executeSearch(query, type, genre, newCountry);
  };

  const handleResetFilters = () => {
    setGenre('');
    setCountry('');
    setSearchParams({ q: query, type });
    executeSearch(query, type, '', '');
  };

  const filterTabs = [
    { key: 'movie', label: 'Movies', icon: Film },
    { key: 'tv', label: 'TV Shows', icon: Tv },
    { key: 'anime', label: 'Anime', icon: Sparkles },
    { key: 'manga', label: 'Manga', icon: BookOpen }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-8 min-h-[75vh]">
      
      {/* Title */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-outfit">
          Federated Discovery Engine
        </h1>
        <p className="text-sm text-gray-400">
          Query multiple global catalogs simultaneously to stream videos or read chapters.
        </p>
      </div>

      {/* Category Toggle Tabs */}
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 border-b border-darkBorder pb-4">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = type === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTypeChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                isSelected
                  ? 'bg-accentCyan text-black font-extrabold shadow-lg shadow-accentCyan/15'
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
      <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto space-y-4 bg-darkCard/30 border border-darkBorder/60 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search for ${type === 'movie' ? 'movies' : type === 'tv' ? 'TV shows' : type === 'anime' ? 'anime titles' : 'manga entries'}...`}
              className="w-full bg-darkCard border border-darkBorder rounded-2xl pl-12 pr-4 py-3.5 text-base text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition shadow-inner placeholder:text-gray-600"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 hover:scale-102 transition flex items-center justify-center gap-2"
          >
            Search
          </button>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap gap-4 items-center justify-start text-xs pt-2">
          {/* Genre select */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-bold uppercase tracking-wider">Genre:</span>
            <select
              value={genre}
              onChange={(e) => handleGenreChange(e.target.value)}
              className="px-4 py-2 bg-darkCard border border-darkBorder rounded-xl text-gray-200 focus:outline-none focus:border-accentCyan transition cursor-pointer font-semibold"
            >
              <option value="">All Genres</option>
              {(type === 'movie' || type === 'tv'
                ? [
                    { key: 'action', label: 'Action' },
                    { key: 'comedy', label: 'Comedy' },
                    { key: 'drama', label: 'Drama' },
                    { key: 'scifi', label: 'Sci-Fi' },
                    { key: 'romance', label: 'Romance' },
                    { key: 'horror', label: 'Horror' },
                    { key: 'animation', label: 'Animation' },
                    { key: 'mystery', label: 'Mystery' }
                  ]
                : [
                    { key: 'action', label: 'Action' },
                    { key: 'comedy', label: 'Comedy' },
                    { key: 'fantasy', label: 'Fantasy' },
                    { key: 'romance', label: 'Romance' },
                    { key: 'scifi', label: 'Sci-Fi' }
                  ]
              ).map(g => (
                <option key={g.key} value={g.key} className="bg-darkBg">{g.label}</option>
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
                  { key: 'US', label: 'United States' },
                  { key: 'KR', label: 'South Korea' },
                  { key: 'JP', label: 'Japan' },
                  { key: 'IN', label: 'India' },
                  { key: 'GB', label: 'United Kingdom' },
                  { key: 'ES', label: 'Spain' },
                  { key: 'FR', label: 'France' },
                  { key: 'CA', label: 'Canada' }
                ].map(c => (
                  <option key={c.key} value={c.key} className="bg-darkBg">{c.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters button */}
          {(genre || country) && (
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
        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Quick Suggestions:</span>
        {(type === 'movie' || type === 'tv'
          ? [
              { label: 'Action', type: 'genre', value: 'action' },
              { label: 'Comedy', type: 'genre', value: 'comedy' },
              { label: 'Sci-Fi', type: 'genre', value: 'scifi' },
              { label: 'Animation', type: 'genre', value: 'animation' },
              { label: 'Korean', type: 'country', value: 'KR' },
              { label: 'Japan', type: 'country', value: 'JP' },
              { label: 'India', type: 'country', value: 'IN' },
              { label: 'Spanish', type: 'country', value: 'ES' }
            ]
          : type === 'anime'
          ? [
              { label: 'Action', type: 'genre', value: 'action' },
              { label: 'Comedy', type: 'genre', value: 'comedy' },
              { label: 'Fantasy', type: 'genre', value: 'fantasy' },
              { label: 'Romance', type: 'genre', value: 'romance' },
              { label: 'Sci-Fi', type: 'genre', value: 'scifi' }
            ]
          : [
              { label: 'Action', type: 'genre', value: 'action' },
              { label: 'Comedy', type: 'genre', value: 'comedy' },
              { label: 'Fantasy', type: 'genre', value: 'fantasy' },
              { label: 'Romance', type: 'genre', value: 'romance' },
              { label: 'Sci-Fi', type: 'genre', value: 'scifi' }
            ]
        ).map((shortcut) => (
          <button
            key={shortcut.label}
            type="button"
            onClick={() => {
              if (shortcut.type === 'genre') {
                setGenre(shortcut.value);
                setSearchParams({ q: query, type, genre: shortcut.value, country });
                executeSearch(query, type, shortcut.value, country);
              } else {
                setCountry(shortcut.value);
                setSearchParams({ q: query, type, genre, country: shortcut.value });
                executeSearch(query, type, genre, shortcut.value);
              }
            }}
            className="px-3 py-1 rounded-full text-xs font-bold border border-darkBorder bg-darkCard/40 text-gray-400 hover:text-white hover:border-accentCyan/30 hover:bg-accentCyan/5 transition"
          >
            {shortcut.label}
          </button>
        ))}
      </div>

      {/* Results Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-accentCyan" />
          <p className="text-gray-400 font-medium">Searching international datasets...</p>
        </div>
      ) : searched ? (
        <MediaGrid items={results} title={`Matches for "${query}"`} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-full text-gray-500">
            <SearchIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="font-bold text-gray-300">Start Your Discovery</h3>
            <p className="text-xs text-gray-500">Select a category above, type what you are looking for, and tap Search to check our aggregated database feeds.</p>
          </div>
        </div>
      )}

    </div>
  );
}
