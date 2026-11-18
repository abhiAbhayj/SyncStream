import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MediaGrid from '../components/MediaGrid';
import MediaCardSkeleton from '../components/MediaCardSkeleton';
import FilterDropdown from '../components/FilterDropdown';
import {
  Search as SearchIcon,
  Film,
  Tv,
  Sparkles,
  BookOpen,
  Music,
  Loader2,
  Globe,
  Filter,
  RefreshCw,
  ArrowLeft,
  Mic2,
  Radio,
  Headphones,
  Compass,
  Disc3,
  Volume2,
  Layers,
  Zap,
  Languages,
  Flame,
  Calendar,
  Rocket,
  Star,
  X
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { fetchClientLiveAnimePage, fetchClientLiveMangaPage, searchClientLiveAniListAnime, searchClientLiveAniListManga } from '../utils/liveAnime';

const MUSIC_LANGUAGES = [
  { key: 'blues_rap', label: 'Blues Rap', icon: Music },
  { key: 'rap', label: 'Rap & Hip-Hop', icon: Mic2 },
  { key: 'rock', label: 'Rock', icon: Radio },
  { key: 'kpop', label: 'K-Pop', icon: Headphones },
  { key: 'korean', label: 'Korean', icon: Compass },
  { key: 'hindi', label: 'Hindi', icon: Disc3 },
  { key: 'anime', label: 'Anime', icon: Sparkles },
  { key: 'english', label: 'English', icon: Globe },
  { key: 'kannada', label: 'Kannada', icon: Volume2 },
  { key: 'malayalam', label: 'Malayalam', icon: Layers },
  { key: 'telugu', label: 'Telugu', icon: Film },
  { key: 'tamil', label: 'Tamil', icon: Zap },
  { key: 'marathi', label: 'Marathi', icon: Languages }
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
  { key: 'tv_action', label: 'Action' },
  { key: 'tv_adventure', label: 'Adventure' },
  { key: '16', label: 'Animation' },
  { key: '35', label: 'Comedy' },
  { key: '80', label: 'Crime' },
  { key: '99', label: 'Documentary' },
  { key: '18', label: 'Drama' },
  { key: '10751', label: 'Family' },
  { key: 'tv_fantasy', label: 'Fantasy' },
  { key: 'tv_horror', label: 'Horror' },
  { key: '10762', label: 'Kids' },
  { key: 'k_10771', label: 'Legal Drama' },
  { key: 'k_10770', label: 'Medical Drama' },
  { key: '9648', label: 'Mystery' },
  { key: 'tv_politics', label: 'Politics' },
  { key: '10764', label: 'Reality' },
  { key: 'k_9840', label: 'Romance' },
  { key: 'tv_scifi', label: 'Sci-Fi' },
  { key: 'k_9755', label: 'Sitcom' },
  { key: 'k_9715', label: 'Superhero' },
  { key: 'k_6152', label: 'Supernatural' },
  { key: 'tv_thriller', label: 'Thriller' },
  { key: 'tv_war', label: 'War' },
  { key: '37', label: 'Western' }
];

const ANIME_MANGA_GENRES = [
  { key: 'Action', label: 'Action' },
  { key: 'Adventure', label: 'Adventure' },
  { key: 'Avant Garde', label: 'Avant Garde' },
  { key: 'Award Winning', label: 'Award Winning' },
  { key: 'Boys Love', label: 'Boys Love' },
  { key: 'Cars', label: 'Cars' },
  { key: 'Comedy', label: 'Comedy' },
  { key: 'Crime', label: 'Crime' },
  { key: 'Cyberpunk', label: 'Cyberpunk' },
  { key: 'Dementia', label: 'Dementia' },
  { key: 'Demons', label: 'Demons' },
  { key: 'Drama', label: 'Drama' },
  { key: 'Ecchi', label: 'Ecchi' },
  { key: 'Fantasy', label: 'Fantasy' },
  { key: 'Game', label: 'Game' },
  { key: 'Girls Love', label: 'Girls Love' },
  { key: 'Gourmet', label: 'Gourmet' },
  { key: 'Harem', label: 'Harem' },
  { key: 'Historical', label: 'Historical' },
  { key: 'Horror', label: 'Horror' },
  { key: 'Isekai', label: 'Isekai' },
  { key: 'Josei', label: 'Josei' },
  { key: 'Kids', label: 'Kids' },
  { key: 'Magic', label: 'Magic' },
  { key: 'Mahou Shoujo', label: 'Mahou Shoujo' },
  { key: 'Martial Arts', label: 'Martial Arts' },
  { key: 'Mecha', label: 'Mecha' },
  { key: 'Military', label: 'Military' },
  { key: 'Music', label: 'Music' },
  { key: 'Mystery', label: 'Mystery' },
  { key: 'Parody', label: 'Parody' },
  { key: 'Police', label: 'Police' },
  { key: 'Post-Apocalyptic', label: 'Post-Apocalyptic' },
  { key: 'Psychological', label: 'Psychological' },
  { key: 'Reincarnation', label: 'Reincarnation' },
  { key: 'Romance', label: 'Romance' },
  { key: 'Samurai', label: 'Samurai' },
  { key: 'School', label: 'School' },
  { key: 'Sci-Fi', label: 'Sci-Fi' },
  { key: 'Seinen', label: 'Seinen' },
  { key: 'Shoujo', label: 'Shoujo' },
  { key: 'Shoujo Ai', label: 'Shoujo Ai' },
  { key: 'Shounen', label: 'Shounen' },
  { key: 'Shounen Ai', label: 'Shounen Ai' },
  { key: 'Slice of Life', label: 'Slice of Life' },
  { key: 'Space', label: 'Space' },
  { key: 'Sports', label: 'Sports' },
  { key: 'Super Power', label: 'Super Power' },
  { key: 'Supernatural', label: 'Supernatural' },
  { key: 'Suspense', label: 'Suspense' },
  { key: 'Thriller', label: 'Thriller' },
  { key: 'Vampire', label: 'Vampire' }
];

const ANIME_GENRES = ANIME_MANGA_GENRES;
const MANGA_GENRES = ANIME_MANGA_GENRES;

const ANIME_TYPES = [
  { key: 'TV', label: 'TV' },
  { key: 'MOVIE', label: 'Movie' },
  { key: 'OVA', label: 'OVA' },
  { key: 'ONA', label: 'ONA' },
  { key: 'SPECIAL', label: 'Special' }
];

const MOVIE_TV_COUNTRIES = [
  { key: 'US', label: 'United States' },
  { key: 'IN', label: 'India' },
  { key: 'KR', label: 'South Korea' },
  { key: 'JP', label: 'Japan' },
  { key: 'GB', label: 'United Kingdom' },
  { key: 'ID', label: 'Indonesia' },
  { key: 'CN', label: 'China' },
  { key: 'TH', label: 'Thailand' },
  { key: 'PH', label: 'Philippines' },
  { key: 'TW', label: 'Taiwan' },
  { key: 'HK', label: 'Hong Kong' },
  { key: 'MY', label: 'Malaysia' },
  { key: 'VN', label: 'Vietnam' },
  { key: 'SG', label: 'Singapore' },
  { key: 'TR', label: 'Turkey' },
  { key: 'FR', label: 'France' },
  { key: 'ES', label: 'Spain' },
  { key: 'DE', label: 'Germany' },
  { key: 'IT', label: 'Italy' },
  { key: 'CA', label: 'Canada' },
  { key: 'AU', label: 'Australia' },
  { key: 'NZ', label: 'New Zealand' },
  { key: 'BR', label: 'Brazil' },
  { key: 'MX', label: 'Mexico' },
  { key: 'AR', label: 'Argentina' },
  { key: 'CO', label: 'Colombia' },
  { key: 'RU', label: 'Russia' },
  { key: 'SE', label: 'Sweden' },
  { key: 'NO', label: 'Norway' },
  { key: 'DK', label: 'Denmark' },
  { key: 'NL', label: 'Netherlands' },
  { key: 'BE', label: 'Belgium' },
  { key: 'PL', label: 'Poland' },
  { key: 'IE', label: 'Ireland' },
  { key: 'PT', label: 'Portugal' },
  { key: 'PK', label: 'Pakistan' },
  { key: 'EG', label: 'Egypt' },
  { key: 'IR', label: 'Iran' },
  { key: 'NG', label: 'Nigeria' },
  { key: 'ZA', label: 'South Africa' }
];

const ANIME_MANGA_COUNTRIES = [
  { key: 'JP', label: 'Japan' },
  { key: 'CN', label: 'China' },
  { key: 'KR', label: 'South Korea' }
];

const YEAR_OPTIONS = Array.from(
  { length: new Date().getFullYear() - 1949 },
  (_, i) => {
    const y = String(new Date().getFullYear() - i);
    return { key: y, label: y };
  }
);

const SEARCH_TYPEWRITER_HINTS = {
  movie: ['Search Interstellar...', 'Search Dune: Part Two...', 'Search Avengers: Endgame...', 'Search Oppenheimer...'],
  tv: ['Search Stranger Things...', 'Search Breaking Bad...', 'Search Peaky Blinders...', 'Search House of the Dragon...'],
  anime: ['Search Demon Slayer...', 'Search Jujutsu Kaisen...', 'Search Solo Leveling...', 'Search Attack on Titan...'],
  manga: ['Search Chainsaw Man...', 'Search One Piece...', 'Search Berserk...', 'Search Jujutsu Kaisen...'],
  music: ['Search Arijit Singh...', 'Search Anirudh...', 'Search Hanumankind...', 'Search Blue Bird Naruto...']
};

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [sort, setSort] = useState(searchParams.get('sort') || 'trending');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [animeFormat, setAnimeFormat] = useState(searchParams.get('format') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const horizonRef = useRef(null);
  const loadMoreRef = useRef(null);
  const MAX_PAGES = 30;

  // Smart Typewriter Placeholder Animation State
  const [hintText, setHintText] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [isDeletingHint, setIsDeletingHint] = useState(false);

  useEffect(() => {
    setHintText('');
    setHintIndex(0);
    setIsDeletingHint(false);
  }, [type]);

  useEffect(() => {
    if (query.trim() !== '') return;
    const hints = SEARCH_TYPEWRITER_HINTS[type] || SEARCH_TYPEWRITER_HINTS.movie;
    const targetWord = hints[hintIndex % hints.length];
    let timer;

    if (!isDeletingHint && hintText.length < targetWord.length) {
      timer = setTimeout(() => setHintText(targetWord.slice(0, hintText.length + 1)), 65);
    } else if (!isDeletingHint && hintText.length === targetWord.length) {
      timer = setTimeout(() => setIsDeletingHint(true), 1600);
    } else if (isDeletingHint && hintText.length > 0) {
      timer = setTimeout(() => setHintText(targetWord.slice(0, hintText.length - 1)), 30);
    } else if (isDeletingHint && hintText.length === 0) {
      setIsDeletingHint(false);
      setHintIndex((prev) => (prev + 1) % hints.length);
    }
    return () => clearTimeout(timer);
  }, [query, type, hintText, hintIndex, isDeletingHint]);

  // React to searchParams updates (e.g. from MediaDetail click or back navigation)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const t = searchParams.get('type') || 'movie';
    let g = searchParams.get('genre') || '';
    const l = searchParams.get('lang') || searchParams.get('language') || '';
    const c = searchParams.get('country') || '';
    const y = searchParams.get('year') || '';
    const f = searchParams.get('format') || '';
    const s = searchParams.get('sort') || sort || 'trending';

    // If genre was passed as a label (e.g. 'Action') or legacy key, normalize it to the active dropdown key
    if (g) {
      const allGenresForType = t === 'movie' ? MOVIE_GENRES : (t === 'tv' ? TV_GENRES : (t === 'anime' ? ANIME_GENRES : MANGA_GENRES));
      const exactKey = allGenresForType.find(x => x.key === g);
      if (!exactKey) {
        const matchedByLabel = allGenresForType.find(x => x.label.toLowerCase() === g.toLowerCase());
        if (matchedByLabel) {
          g = matchedByLabel.key;
        }
      }
    }

    setQuery(q);
    setType(t);
    setGenre(g);
    setLanguage(l);
    setCountry(c);
    setYear(y);
    setAnimeFormat(f);
    setSort(s);
    setPage(1);
    
    executeSearch(q, t, g, l, c, 1, s, 'all', y, false, f);
  }, [searchParams]);

  const executeSearch = async (searchQuery, searchType, activeGenre = genre, activeLanguage = language, activeCountry = country, pageNum = 1, activeSort = sort, activeMusicCat = musicCategory, activeYear = year, forceRefresh = false, activeFormat = animeFormat) => {
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
      } else if (searchType === 'anime' && !searchQuery.trim()) {
        // Direct Browser Live AniList Discover Engine (Trending, Ongoing, Latest Episode, Upcoming, Top Rated + 52 Genres + Type + Japan/China/Korea)
        const liveAnime = await fetchClientLiveAnimePage({
          category: activeSort || 'trending',
          page: pageNum,
          perPage: 24,
          year: activeYear || null,
          genre: activeGenre || null,
          format: activeFormat || null,
          country: activeCountry || null,
          forceRefresh
        });

        if (liveAnime && liveAnime.length > 0) {
          if (pageNum === 1) {
            setResults(liveAnime);
          } else {
            setResults(prev => {
              const seenIds = new Set(prev.map(x => x.id));
              return [...prev, ...liveAnime.filter(x => !seenIds.has(x.id))];
            });
          }
        } else {
          // Backend fallback if direct AniList is ever blocked by a corporate network
          const res = await axios.get('/api/media/search', {
            params: {
              query: '',
              type: 'anime',
              genre: activeGenre,
              format: activeFormat || undefined,
              language: activeLanguage,
              country: activeCountry,
              sort: activeSort,
              year: activeYear || undefined,
              page: pageNum,
              refresh: forceRefresh ? '1' : undefined
            }
          });
          if (pageNum === 1) setResults(res.data || []);
          else setResults(prev => [...prev, ...(res.data || [])]);
        }
      } else if (searchType === 'anime' && searchQuery.trim()) {
        // Direct Browser Live AniList Text Search (supports Type: TV/Movie/OVA/ONA/Special + Country: JP/CN/KR + Genre + Year!)
        const liveAnimeSearch = await searchClientLiveAniListAnime({
          query: searchQuery.trim(),
          page: pageNum,
          perPage: 24,
          year: activeYear || null,
          genre: activeGenre || null,
          format: activeFormat || null,
          country: activeCountry || null
        });

        if (liveAnimeSearch && liveAnimeSearch.length > 0) {
          if (pageNum === 1) {
            setResults(liveAnimeSearch);
          } else {
            setResults(prev => {
              const seenIds = new Set(prev.map(x => x.id));
              return [...prev, ...liveAnimeSearch.filter(x => !seenIds.has(x.id))];
            });
          }
        } else {
          const res = await axios.get('/api/media/search', {
            params: {
              query: searchQuery.trim(),
              type: 'anime',
              genre: activeGenre,
              format: activeFormat || undefined,
              language: activeLanguage,
              country: activeCountry,
              sort: activeSort,
              year: activeYear || undefined,
              page: pageNum,
              refresh: forceRefresh ? '1' : undefined
            }
          });
          if (pageNum === 1) setResults(res.data || []);
          else setResults(prev => [...prev, ...(res.data || [])]);
        }
      } else if (searchType === 'manga' && !searchQuery.trim()) {
        // Direct Browser Live AniList Manga Engine (Trending, Ongoing, Latest New Series, Upcoming, Top Rated + 52 Genres + Japan/China/Korea)
        const liveManga = await fetchClientLiveMangaPage({
          category: activeSort || 'trending',
          page: pageNum,
          perPage: 24,
          year: activeYear || null,
          genre: activeGenre || null,
          country: activeCountry || null,
          forceRefresh
        });

        if (liveManga && liveManga.length > 0) {
          if (pageNum === 1) {
            setResults(liveManga);
          } else {
            setResults(prev => {
              const seenIds = new Set(prev.map(x => x.id));
              return [...prev, ...liveManga.filter(x => !seenIds.has(x.id))];
            });
          }
        } else {
          const res = await axios.get('/api/media/search', {
            params: {
              query: '',
              type: 'manga',
              genre: activeGenre,
              language: activeLanguage,
              country: activeCountry,
              sort: activeSort,
              year: activeYear || undefined,
              page: pageNum,
              refresh: forceRefresh ? '1' : undefined
            }
          });
          if (pageNum === 1) setResults(res.data || []);
          else setResults(prev => [...prev, ...(res.data || [])]);
        }
      } else if (searchType === 'manga' && searchQuery.trim() && (activeCountry || activeGenre || activeYear)) {
        // Direct Browser Live AniList Manga Text Search when Country/Genre/Year filter is active
        const liveMangaSearch = await searchClientLiveAniListManga({
          query: searchQuery.trim(),
          page: pageNum,
          perPage: 24,
          year: activeYear || null,
          genre: activeGenre || null,
          country: activeCountry || null
        });

        if (liveMangaSearch && liveMangaSearch.length > 0) {
          if (pageNum === 1) {
            setResults(liveMangaSearch);
          } else {
            setResults(prev => {
              const seenIds = new Set(prev.map(x => x.id));
              return [...prev, ...liveMangaSearch.filter(x => !seenIds.has(x.id))];
            });
          }
        } else {
          const res = await axios.get('/api/media/search', {
            params: {
              query: searchQuery.trim(),
              type: 'manga',
              genre: activeGenre,
              language: activeLanguage,
              country: activeCountry,
              sort: activeSort,
              year: activeYear || undefined,
              page: pageNum,
              refresh: forceRefresh ? '1' : undefined
            }
          });
          if (pageNum === 1) setResults(res.data || []);
          else setResults(prev => [...prev, ...(res.data || [])]);
        }
      } else {
        const res = await axios.get('/api/media/search', {
          params: { 
            query: searchQuery.trim(), 
            type: searchType, 
            genre: activeGenre,
            format: activeFormat || undefined,
            language: activeLanguage, 
            country: activeCountry,
            sort: activeSort,
            year: activeYear || undefined,
            page: pageNum,
            refresh: forceRefresh ? '1' : undefined
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
    if (!loading && !loadingMore && page < MAX_PAGES) {
      const nextPage = page + 1;
      setPage(nextPage);
      executeSearch(query, type, genre, language, country, nextPage, sort, musicCategory, year, false, animeFormat);
    }
  };
  loadMoreRef.current = loadMore;

  useEffect(() => {
    const el = horizonRef.current;
    if (!el || loading || !searched || results.length === 0 || page >= MAX_PAGES) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreRef.current?.();
        }
      },
      { rootMargin: '160px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, searched, results.length, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ q: query, type, sort, genre, format: animeFormat, lang: language, country, year });
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setGenre('');
    setLanguage('');
    setCountry('');
    setYear('');
    setAnimeFormat('');
    setPage(1);
    setSearchParams({ q: query, type: newType, sort });
  };

  const handleGenreChange = (newGenre) => {
    setGenre(newGenre);
    setPage(1);
    setSearchParams({ q: query, type, sort, genre: newGenre, format: animeFormat, lang: language, country, year });
  };

  const handleFormatChange = (newFormat) => {
    setAnimeFormat(newFormat);
    setPage(1);
    setSearchParams({ q: query, type, sort, genre, format: newFormat, lang: language, country, year });
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setPage(1);
    setSearchParams({ q: query, type, sort, genre, format: animeFormat, lang: newLang, country, year });
  };

  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
    setPage(1);
    setSearchParams({ q: query, type, sort, genre, format: animeFormat, lang: language, country: newCountry, year });
  };

  const handleYearChange = (newYear) => {
    setYear(newYear);
    setPage(1);
    setSearchParams({ q: query, type, sort, genre, format: animeFormat, lang: language, country, year: newYear });
  };

  const handleClearQuery = () => {
    setQuery('');
    setPage(1);
    if (searchParams.get('q')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('q');
      setSearchParams(newParams);
    }
  };

  const handleResetFilters = () => {
    setGenre('');
    setLanguage('');
    setCountry('');
    setYear('');
    setAnimeFormat('');
    setPage(1);
    setSearchParams({ q: query, type, sort });
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
    // Clear active text query when picking a feed clip (Trending, Ongoing Anime, Latest Episode, etc.)
    if (query && query.trim()) setQuery('');
    const nextParams = { type, sort: newSort };
    if (genre) nextParams.genre = genre;
    if (animeFormat) nextParams.format = animeFormat;
    if (language) nextParams.lang = language;
    if (country) nextParams.country = country;
    if (year) nextParams.year = year;
    setSearchParams(nextParams);
  };

  const filterTabs = [
    { key: 'movie', label: 'Movies', icon: Film, color: 'text-amber-400 fill-amber-400/40 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]' },
    { key: 'tv', label: 'TV Shows', icon: Tv, color: 'text-sky-400 fill-sky-400/40 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]' },
    { key: 'anime', label: 'Anime', icon: Sparkles, color: 'text-pink-400 fill-pink-400 drop-shadow-[0_0_6px_rgba(244,114,182,0.6)]' },
    { key: 'manga', label: 'Manga', icon: BookOpen, color: 'text-emerald-400 fill-emerald-400/40 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]' },
    { key: 'music', label: 'Music', icon: Music, color: 'text-purple-400 fill-purple-400 drop-shadow-[0_0_6px_rgba(192,132,252,0.6)]' }
  ];

  const currentGenres = type === 'movie' 
    ? MOVIE_GENRES 
    : type === 'tv' 
    ? TV_GENRES 
    : type === 'anime' 
    ? ANIME_GENRES 
    : MANGA_GENRES;

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3.5 sm:px-6 md:px-8 space-y-6 sm:space-y-8 min-h-[75vh]">
      
      {/* ── Title, Live Status & Live Refresh Icon (Only Icon) ── */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white font-outfit">
              Federated Discovery Engine
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/25 border border-emerald-400 text-emerald-300 font-mono shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live
            </span>
            {searched && (
              <span
                key={`${type}-${genre}-${animeFormat}-${language}-${country}-${year}-${results.length}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#0f162d] border border-accentCyan/50 text-white font-mono tabular-nums animate-badge-pulse"
              >
                <span className="text-accentCyan animate-digit-roll">{results.length}</span>
                <span className="text-gray-300">Matches</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-300 hidden sm:block">
            Query multiple global and regional catalogs simultaneously across movies, TV series, anime, manga, and music.
          </p>
        </div>

        {/* Live Refresh Icon Button (Only Icon) */}
        <button
          type="button"
          onClick={() => {
            setPage(1);
            executeSearch(query, type, genre, language, country, 1, sort, musicCategory, year, true, animeFormat);
          }}
          disabled={loading}
          className="p-2 sm:p-2.5 rounded-xl border-2 border-accentCyan bg-[#0f1428] text-accentCyan hover:bg-accentCyan hover:text-black shadow-[0_0_15px_rgba(var(--accent-cyan),0.5)] transition active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
          title="Live Refresh"
          aria-label="Live Refresh"
        >
          <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} strokeWidth={2.5} />
        </button>
      </div>

      {/* Search and Filters Console (with integrated category tabs) */}
      <form onSubmit={handleSearchSubmit} className="relative z-30 max-w-4xl mx-auto space-y-4 bg-darkCard/90 border-2 border-accentCyan/40 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl shadow-2xl">
        
        {/* Category Selector Tabs (Movies, TV Shows, Anime, Manga, Music) */}
        <div className="space-y-1.5 border-b-2 border-white/10 pb-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-accentCyan">
              Select Category:
            </span>
            <span className="text-[10px] text-gray-400 font-semibold hidden sm:inline">
              Currently searching: <strong className="text-white capitalize">{type}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = type === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTypeChange(tab.key)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-200 active:scale-95 shrink-0 border-2 cursor-pointer shadow-md ${
                    isSelected
                      ? 'bg-accentCyan text-black border-accentCyan shadow-[0_0_16px_rgba(var(--accent-cyan),0.6)] ring-1 ring-accentCyan'
                      : 'text-white border-2 border-accentCyan/50 bg-[#12182f] hover:text-white hover:border-accentCyan hover:bg-accentCyan/20 shadow-[0_0_10px_rgba(var(--accent-cyan),0.2)]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-black stroke-[2.5]' : tab.color || ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input Row (Rotating Neon Beam Search Capsule + Smart Typewriter) */}
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3">
          <div className="neon-beam-wrapper flex-grow">
            <div className="neon-beam-inner relative flex items-center">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accentCyan w-4 sm:w-5 h-4 sm:h-5 pointer-events-none z-20" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder=""
                aria-label={`Search ${type}`}
                className="relative z-10 w-full bg-transparent pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-3.5 text-sm sm:text-base text-white focus:outline-none font-semibold"
              />
              {/* Smart Typewriter Animated Placeholder */}
              {query === '' && (
                <div className="absolute left-10 sm:left-12 right-16 sm:right-20 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-sm sm:text-base text-gray-400 font-medium truncate">
                  <span>{hintText || `Search ${type}...`}</span>
                  <span className="inline-block w-[2px] h-4 sm:h-5 bg-accentCyan ml-0.5 animate-cursor-blink shadow-[0_0_8px_rgba(var(--accent-cyan),0.9)]" />
                </div>
              )}

              <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 sm:gap-1.5">
                {query && (
                  <button
                    type="button"
                    onClick={handleClearQuery}
                    className="p-1 sm:p-1.5 rounded-full text-slate-300 hover:text-white bg-white/10 hover:bg-white/25 transition active:scale-90 cursor-pointer shadow-sm"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-spotlight-search', { detail: { query, type } }))}
                  className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-white/[0.08] hover:bg-accentCyan hover:text-black border border-white/15 text-[10px] font-mono font-bold text-gray-200 transition active:scale-95 cursor-pointer"
                  title="Open Spotlight Command Palette (Ctrl+K)"
                >
                  ⌘K
                </button>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="btn-shimmer px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-accentCyan hover:opacity-90 text-black font-black shadow-lg shadow-[0_0_20px_rgba(var(--accent-cyan),0.4)] active:scale-95 transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
          >
            Search
          </button>
        </div>

        {/* Music Category Selector Pills (Only when Music is active) */}
        {type === 'music' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {[
              { id: 'all', label: 'All Music', icon: Music, color: 'text-cyan-400 fill-cyan-400/40' },
              { id: 'artist', label: 'Artists', icon: Mic2, color: 'text-purple-400 fill-purple-400/40' },
              { id: 'movie', label: 'Movie OSTs', icon: Film, color: 'text-amber-400 fill-amber-400/40' },
              { id: 'series', label: 'TV Series', icon: Tv, color: 'text-sky-400 fill-sky-400/40' },
              { id: 'anime', label: 'Anime OSTs', icon: Sparkles, color: 'text-pink-400 fill-pink-400' },
              { id: 'song', label: 'Songs', icon: Disc3, color: 'text-emerald-400 fill-emerald-400/40' }
            ].map(cat => {
              const CatIcon = cat.icon;
              const isCatSelected = musicCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setMusicCategory(cat.id);
                    setPage(1);
                    executeSearch(query, type, genre, language, country, 1, sort, cat.id);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition active:scale-95 border-2 cursor-pointer shadow-sm ${
                    isCatSelected
                      ? 'bg-accentCyan text-black border-accentCyan shadow-[0_0_12px_rgba(var(--accent-cyan),0.5)]'
                      : 'bg-darkSurf/80 border-white/20 text-slate-200 hover:text-white hover:border-accentCyan'
                  }`}
                >
                  {CatIcon && <CatIcon className={`w-3.5 h-3.5 shrink-0 ${isCatSelected ? 'text-black stroke-[2.5]' : cat.color || ''}`} />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Feed Selector Clips (Trending, Ongoing Anime, Latest, Upcoming, Top Rated) */}
        {type !== 'music' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            <span className="text-accentCyan font-black uppercase tracking-wider shrink-0 mr-1 text-[11px]">Feed:</span>
            {[
              { key: 'trending', label: 'Trending Hits', icon: Flame, color: 'text-orange-500 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]' },
              { key: 'ongoing', label: type === 'anime' ? 'Ongoing Anime' : type === 'tv' ? 'Ongoing TV Shows' : type === 'manga' ? 'Ongoing Manga' : 'Now In Theaters', icon: Zap, color: 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]' },
              { key: 'latest', label: type === 'anime' ? 'Latest Episode' : type === 'manga' ? 'Latest Chapter' : type === 'tv' ? 'Latest Aired' : 'Latest Release', icon: Calendar, color: 'text-cyan-400 fill-cyan-400/40 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' },
              { key: 'upcoming', label: 'Upcoming Releases', icon: Rocket, color: 'text-fuchsia-400 fill-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]' },
              { key: 'top_rated', label: 'Top Rated', icon: Star, color: 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]' },
            ].map(s => {
              const SortIcon = s.icon;
              const isSortSelected = sort === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleSortChange(s.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition active:scale-95 border-2 cursor-pointer shadow-sm ${
                    isSortSelected
                      ? 'bg-accentCyan text-black border-accentCyan shadow-[0_0_12px_rgba(var(--accent-cyan),0.5)]'
                      : 'bg-darkSurf/80 border-white/20 text-slate-200 hover:text-white hover:border-accentCyan'
                  }`}
                >
                  {SortIcon && <SortIcon className={`w-3.5 h-3.5 shrink-0 ${isSortSelected ? 'text-black stroke-[2.5]' : s.color || ''}`} />}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Sleek Glassmorphic Filter Dropdowns Row */}
        <div className="pt-2 border-t border-white/10">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3">
            {/* 1. MUSIC: Language Filter */}
            {type === 'music' ? (
              <FilterDropdown
                label="Language"
                icon={Globe}
                value={language}
                onChange={handleLanguageChange}
                options={MUSIC_LANGUAGES}
                placeholder="All Languages"
                searchable={true}
                className="w-full sm:w-52"
              />
            ) : (
              /* 2. MOVIES / TV / ANIME / MANGA: Genre Filter */
              <FilterDropdown
                label="Genre"
                icon={Filter}
                value={genre}
                onChange={handleGenreChange}
                options={currentGenres}
                placeholder="All Genres"
                searchable={true}
                className="w-full sm:w-52"
              />
            )}

            {/* 3. ANIME: Type / Format Filter (TV, Movie, OVA, ONA, Special) */}
            {type === 'anime' && (
              <FilterDropdown
                label="Type"
                icon={Layers}
                value={animeFormat}
                onChange={handleFormatChange}
                options={ANIME_TYPES}
                placeholder="All Types"
                searchable={false}
                className="w-full sm:w-44"
              />
            )}

            {/* 4. Country Filter (40 Countries for Movie/TV; Japan, China, South Korea for Anime/Manga) */}
            {(type === 'movie' || type === 'tv' || type === 'anime' || type === 'manga') && (
              <FilterDropdown
                label="Country"
                icon={Globe}
                value={country}
                onChange={handleCountryChange}
                options={type === 'anime' || type === 'manga' ? ANIME_MANGA_COUNTRIES : MOVIE_TV_COUNTRIES}
                placeholder="All Countries"
                searchable={type === 'movie' || type === 'tv'}
                className="w-full sm:w-48"
              />
            )}

            {/* 5. Year Filter (Movies, TV, Anime, Manga) */}
            {(type === 'movie' || type === 'tv' || type === 'anime' || type === 'manga') && (
              <FilterDropdown
                label="Year"
                icon={Calendar}
                value={year}
                onChange={handleYearChange}
                options={YEAR_OPTIONS}
                placeholder="All Years"
                searchable={true}
                className="w-full sm:w-40"
              />
            )}

            {/* Active Filter Count + Clear Filters Pill */}
            {(genre || animeFormat || language || country || year) && (() => {
              const activeCount = [genre, animeFormat, language, country, year].filter(Boolean).length;
              return (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="col-span-full sm:ml-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-accentPink/15 hover:bg-accentPink/25 border border-accentPink/45 hover:border-accentPink text-accentPink text-xs font-extrabold transition active:scale-95 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Reset ({activeCount})</span>
                </button>
              );
            })()}
          </div>
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
            const ItemIcon = item.icon;
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
                {ItemIcon && <ItemIcon className="w-3.5 h-3.5 shrink-0" />}
                <span>{item.label}</span>
              </button>
            );
          })
        ) : (
          (() => {
            const quickList = type === 'movie'
              ? [
                  { label: 'Action', key: '28' },
                  { label: 'Adventure', key: '12' },
                  { label: 'Comedy', key: '35' },
                  { label: 'Sci-Fi', key: '878' },
                  { label: 'Fantasy', key: '14' },
                  { label: 'Horror', key: '27' },
                  { label: 'Romance', key: '10749' },
                  { label: 'Thriller', key: '53' },
                  { label: 'Animation', key: '16' },
                  { label: 'Superhero', key: 'k_9715' }
                ]
              : type === 'tv'
              ? [
                  { label: 'Action', key: 'tv_action' },
                  { label: 'Adventure', key: 'tv_adventure' },
                  { label: 'Sci-Fi', key: 'tv_scifi' },
                  { label: 'Fantasy', key: 'tv_fantasy' },
                  { label: 'Comedy', key: '35' },
                  { label: 'Drama', key: '18' },
                  { label: 'Crime', key: '80' },
                  { label: 'Mystery', key: '9648' },
                  { label: 'Horror', key: 'tv_horror' },
                  { label: 'Thriller', key: 'tv_thriller' },
                  { label: 'Romance', key: 'k_9840' }
                ]
              : type === 'anime'
              ? [
                  { label: 'Action', key: 'Action' },
                  { label: 'Adventure', key: 'Adventure' },
                  { label: 'Fantasy', key: 'Fantasy' },
                  { label: 'Sci-Fi', key: 'Sci-Fi' },
                  { label: 'Comedy', key: 'Comedy' },
                  { label: 'Romance', key: 'Romance' },
                  { label: 'Isekai', key: 'Isekai' },
                  { label: 'Harem', key: 'Harem' },
                  { label: 'Supernatural', key: 'Supernatural' },
                  { label: 'Shounen', key: 'Shounen' },
                  { label: 'Seinen', key: 'Seinen' },
                  { label: 'Slice of Life', key: 'Slice of Life' }
                ]
              : [
                  { label: 'Action', key: 'Action' },
                  { label: 'Adventure', key: 'Adventure' },
                  { label: 'Fantasy', key: 'Fantasy' },
                  { label: 'Sci-Fi', key: 'Sci-Fi' },
                  { label: 'Romance', key: 'Romance' },
                  { label: 'Comedy', key: 'Comedy' },
                  { label: 'Isekai', key: 'Isekai' },
                  { label: 'Harem', key: 'Harem' },
                  { label: 'Supernatural', key: 'Supernatural' },
                  { label: 'Shounen', key: 'Shounen' },
                  { label: 'Seinen', key: 'Seinen' },
                  { label: 'Psychological', key: 'Psychological' }
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
                    setSearchParams({ q: query, type, sort, genre: nextG, format: animeFormat, country, lang: language, year });
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-accentCyan text-black border-accentCyan font-extrabold shadow-[0_0_12px_rgba(99,210,255,0.4)]'
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
        <div className="py-4 animate-fade-in">
          <MediaCardSkeleton count={12} titlePlaceholder={true} />
        </div>
      ) : searched && results.length > 0 ? (
        <div className="animate-slide-up space-y-8">
          <MediaGrid
            items={results}
            showTimings={type === 'anime' || type === 'tv' || type === 'manga' || sort === 'ongoing' || sort === 'latest' || sort === 'upcoming'}
            title={
              query
                ? `Matches for "${query}"`
                : type === 'anime'
                ? (sort === 'trending'
                    ? 'Top Trending Live Anime'
                    : sort === 'ongoing'
                    ? 'Live Ongoing & Airing Anime'
                    : sort === 'latest'
                    ? 'Latest Aired Anime Episodes'
                    : sort === 'upcoming'
                    ? 'Upcoming Anime Releases'
                    : 'Top Rated Anime')
                : type === 'manga'
                ? (sort === 'trending'
                    ? 'Top Trending Live Manga'
                    : sort === 'ongoing'
                    ? 'Popular Ongoing Manga'
                    : sort === 'latest'
                    ? 'Latest New Manga Series'
                    : sort === 'upcoming'
                    ? 'Upcoming Manga Releases'
                    : 'Top Rated Manga')
                : type === 'tv'
                ? (sort === 'trending'
                    ? 'Top Trending TV Series'
                    : sort === 'ongoing'
                    ? 'Live Ongoing TV Series'
                    : sort === 'latest'
                    ? 'Latest Premiered TV Series'
                    : sort === 'upcoming'
                    ? 'Upcoming TV Series'
                    : 'Top Rated TV Series')
                : 'Discovered Results'
            }
          />
          
          {/* Infinite Scroll Horizon Beam (#4) */}
          {!loading && page < MAX_PAGES && (
            <div ref={horizonRef} className="flex flex-col items-center justify-center pt-4 pb-12 space-y-4">
              <div className="relative w-full max-w-md h-[3px] rounded-full bg-white/10 overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-accentCyan to-accentPurple shadow-[0_0_16px_rgba(var(--accent-cyan),0.8)] animate-horizon-beam" />
              </div>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-shimmer px-7 py-2.5 bg-white/[0.06] border border-accentCyan/35 hover:border-accentCyan hover:bg-accentCyan/15 text-white rounded-full font-bold text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer shadow-[0_0_18px_rgba(var(--accent-cyan),0.2)]"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-accentCyan" />
                    <span>Scanning Next Horizon...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-accentCyan" />
                    <span>Load More Results</span>
                  </>
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
