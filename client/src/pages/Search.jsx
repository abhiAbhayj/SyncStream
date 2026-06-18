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
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const MAX_PAGES = 30;

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
        adventure: mediaType === 'tv' ? '10759' : '12',
        animation: '16',
        comedy: '35',
        crime: '80',
        documentary: '99',
        drama: '18',
        family: '10751',
        fantasy: mediaType === 'tv' ? '10765' : '14',
        history: '36',
        horror: mediaType === 'tv' ? '18' : '27',
        music: '10402',
        mystery: '9648',
        romance: '10749',
        scifi: mediaType === 'tv' ? '10765' : '878',
        thriller: mediaType === 'tv' ? '10768' : '53',
        war: mediaType === 'tv' ? '10768' : '10752',
        western: '37'
      };
      return mapping[genreKey] || '';
    }
    if (mediaType === 'anime') {
      const mapping = {
        action: '1',
        adventure: '2',
        avant_garde: '5',
        boys_love: '28',
        comedy: '4',
        drama: '8',
        fantasy: '10',
        girls_love: '26',
        gourmet: '47',
        horror: '14',
        mystery: '7',
        romance: '22',
        scifi: '24',
        slice_of_life: '36',
        sports: '30',
        supernatural: '37',
        suspense: '41'
      };
      return mapping[genreKey] || '';
    }
    if (mediaType === 'manga') {
      const mapping = {
        action: '391b0425-d6f1-456d-9f4f-d0e124572215',
        comedy: '4d32cc48-9f00-4cca-9b5a-a839f0764984',
        drama: 'b9af3a63-f058-46de-a9a0-e0c13906197a',
        fantasy: 'cdc58593-abbf-46a0-a47f-99a385c20756',
        horror: 'cdad7e68-1419-41dd-bdce-27753074a640',
        isekai: 'ace04997-f6bd-436e-b261-779182193def',
        mecha: '50880a9f-5440-4731-9961-d1467453d2e1',
        mystery: 'ee968100-4191-4968-93d3-f82d72be7e46',
        romance: '423e2eae-a7a2-4a8b-ac03-a05fc51b14dd',
        scifi: '256c8064-a9f8-4a54-a55b-5b3a13486a9a',
        slice_of_life: 'e5301a23-ebd9-49dd-a0cb-2add944c7fe9',
        sports: '69964a64-2428-4ce5-b687-b05c62441d08',
        thriller: '07251805-a27e-4d59-b468-1bd29e0843df'
      };
      return mapping[genreKey] || '';
    }
    return '';
  };

  const executeSearch = async (searchQuery, searchType, activeGenre = genre, activeCountry = country, pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setSearched(true);
    
    try {
      const genreId = getGenreId(activeGenre, searchType);
      const res = await axios.get('/api/media/search', {
        params: { 
          query: searchQuery.trim(), 
          type: searchType, 
          genre: genreId, 
          country: activeCountry,
          page: pageNum
        }
      });
      
      if (pageNum === 1) {
        setResults(res.data || []);
      } else {
        setResults(prev => [...prev, ...(res.data || [])]);
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
      executeSearch(query, type, genre, country, nextPage);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ q: query, type, genre, country });
    executeSearch(query, type, genre, country, 1);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setGenre('');
    setCountry('');
    setPage(1);
    setSearchParams({ q: query, type: newType });
    executeSearch(query, newType, '', '', 1);
  };

  const handleGenreChange = (newGenre) => {
    setGenre(newGenre);
    setPage(1);
    setSearchParams({ q: query, type, genre: newGenre, country });
    executeSearch(query, type, newGenre, country, 1);
  };

  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
    setPage(1);
    setSearchParams({ q: query, type, genre, country: newCountry });
    executeSearch(query, type, genre, newCountry, 1);
  };

  const handleResetFilters = () => {
    setGenre('');
    setCountry('');
    setPage(1);
    setSearchParams({ q: query, type });
    executeSearch(query, type, '', '', 1);
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
              {(type === 'movie'
                ? [
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
                    { key: '878', label: 'Sci-Fi' },
                    { key: '53', label: 'Thriller' },
                    { key: '10752', label: 'War' },
                    { key: '37', label: 'Western' }
                  ]
                : type === 'tv' ? [
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
                    { key: '37', label: 'Western' }
                  ]
                : type === 'anime' ? [
                    { key: 'g_10759', label: 'Action & Adventure' },
                    { key: 'g_35', label: 'Comedy' },
                    { key: 'g_18', label: 'Drama' },
                    { key: 'k_242095', label: 'Ecchi' },
                    { key: 'k_9194', label: 'Harem' },
                    { key: 'k_242094', label: 'Isekai' },
                    { key: 'k_11130', label: 'Mecha' },
                    { key: 'g_9648', label: 'Mystery' },
                    { key: 'g_10765', label: 'Sci-Fi & Fantasy' },
                    { key: 'k_210024', label: 'Shounen' },
                    { key: 'k_158718', label: 'Slice of Life' }
                  ]
                : [
                    { key: 'action', label: 'Action' },
                    { key: 'comedy', label: 'Comedy' },
                    { key: 'drama', label: 'Drama' },
                    { key: 'fantasy', label: 'Fantasy' },
                    { key: 'horror', label: 'Horror' },
                    { key: 'isekai', label: 'Isekai' },
                    { key: 'mecha', label: 'Mecha' },
                    { key: 'mystery', label: 'Mystery' },
                    { key: 'romance', label: 'Romance' },
                    { key: 'scifi', label: 'Sci-Fi' },
                    { key: 'slice_of_life', label: 'Slice of Life' },
                    { key: 'sports', label: 'Sports' },
                    { key: 'thriller', label: 'Thriller' }
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
                executeSearch(query, type, shortcut.value, country, 1);
              } else {
                setCountry(shortcut.value);
                setSearchParams({ q: query, type, genre, country: shortcut.value });
                executeSearch(query, type, genre, shortcut.value, 1);
              }
            }}
            className="px-3 py-1 rounded-full text-xs font-bold border border-darkBorder bg-darkCard/40 text-gray-400 hover:text-white hover:border-accentCyan/30 hover:bg-accentCyan/5 transition"
          >
            {shortcut.label}
          </button>
        ))}
      </div>

      {/* Results Display */}
      {loading && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-accentCyan" />
          <p className="text-gray-400 font-medium">Searching international datasets...</p>
        </div>
      ) : searched && results.length > 0 ? (
        <div className="animate-fade-in space-y-8">
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
          <p className="text-gray-400 font-medium">No matches found. Try adjusting your filters.</p>
        </div>
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
