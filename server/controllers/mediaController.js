import axios from 'axios';
import { db } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Highly detailed mock data for TMDB fallback
const MOCK_MOVIES = [
  {
    id: 'sintel',
    title: 'Sintel (Open Movie)',
    overview: 'A lone female warrior, Sintel, searches for her baby dragon companion, Scales. Along her journey, she faces challenges that force her to confront her own past and desires.',
    poster_path: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Sintel_poster.jpg',
    backdrop_path: 'https://durian.blender.org/wp-content/uploads/2010/10/sintel_concept_artwork.jpg',
    release_date: '2010-09-27',
    vote_average: 8.2,
    media_type: 'movie',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    youtube_trailer: 'eRsGyueVLvQ'
  },
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel (Open Movie)',
    overview: 'Set in a dystopian future Amsterdam, a group of scientists attempts to save the world from destructive giant robots by traveling back in time to change a critical decision in their past.',
    poster_path: 'https://mango.blender.org/wp-content/uploads/2012/09/poster_v2_small.jpg',
    backdrop_path: 'https://mango.blender.org/wp-content/uploads/2012/03/robot_concept_art.jpg',
    release_date: '2012-09-26',
    vote_average: 7.9,
    media_type: 'movie',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    youtube_trailer: 'R6MlUcmO1Mc'
  },
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny (Open Movie)',
    overview: 'A giant, friendly forest rabbit decides to take revenge on three bullying rodents who disrupted his peaceful morning routine and harmed his forest friends.',
    poster_path: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_Buck_Bunny_堅_2008_堅_Poster.jpg',
    backdrop_path: 'https://peach.blender.org/wp-content/uploads/peach_bunny_small.jpg',
    release_date: '2008-05-30',
    vote_average: 7.5,
    media_type: 'movie',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    youtube_trailer: 'YE7VzlLtp-4'
  },
  {
    id: 'elephants-dream',
    title: 'Elephants Dream (Open Movie)',
    overview: 'A surreal journey of two characters, Proog and Emo, inside a giant, chaotic machine that mirrors their psychological quirks and diverging visions of reality.',
    poster_path: 'https://orange.blender.org/wp-content/themes/orange/images/header_left.jpg',
    backdrop_path: 'https://orange.blender.org/wp-content/uploads/2006/03/production_design_02.jpg',
    release_date: '2006-03-24',
    vote_average: 7.0,
    media_type: 'movie',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    youtube_trailer: 'TLkA04hqLY0'
  }
];

const MOCK_TV = [
  {
    id: 'cosmos-laundromat',
    title: 'Cosmos Laundromat',
    name: 'Cosmos Laundromat',
    overview: 'On a desolate island, a depressed sheep named Franck meets a mysterious salesman who offers him a spiritual laundry service.',
    poster_path: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Cosmos_Laundromat_-_First_Cycle.webm.jpg',
    first_air_date: '2015-08-10',
    release_date: '2015-08-10',
    vote_average: 8.5,
    media_type: 'tv',
    broadcast_day: 'Sundays'
  },
  {
    id: 'sintel-series',
    title: 'Sintel Chronicles',
    name: 'Sintel Chronicles',
    overview: 'Follow Sintel across dragon domains in this fantasy series.',
    poster_path: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Sintel_poster.jpg',
    first_air_date: '2021-04-12',
    release_date: '2021-04-12',
    vote_average: 8.1,
    media_type: 'tv',
    broadcast_day: 'Fridays'
  }
];

const MOCK_ANIME = [
  {
    id: '1429',
    title: 'Attack on Titan',
    name: 'Attack on Titan',
    overview: 'Humans fight giant man-eating humanoids called Titans.',
    poster_path: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Sintel_poster.jpg',
    first_air_date: '2013-04-07',
    release_date: '2013-04-07',
    vote_average: 9.0,
    media_type: 'anime',
    broadcast: 'Sundays',
    broadcast_day: 'Sundays'
  },
  {
    id: '37854',
    title: 'Jujutsu Kaisen',
    name: 'Jujutsu Kaisen',
    overview: 'A boy swallows a cursed talisman and becomes cursed himself.',
    poster_path: 'https://mango.blender.org/wp-content/uploads/2012/09/poster_v2_small.jpg',
    first_air_date: '2020-10-03',
    release_date: '2020-10-03',
    vote_average: 8.8,
    media_type: 'anime',
    broadcast: 'Fridays',
    broadcast_day: 'Fridays'
  }
];

const MOCK_MANGA = [
  {
    id: 'a1c7c817-4e59-4f0b-938a-a1962c050a78',
    title: 'Chainsaw Man',
    overview: 'Denji has a simple dream—to live a happy and peaceful life with his devil pet Pochita.',
    poster_path: 'https://mango.blender.org/wp-content/uploads/2012/09/poster_v2_small.jpg',
    release_date: '2018',
    vote_average: 8.9,
    media_type: 'manga'
  },
  {
    id: '32d76d19-8a05-4db0-9fc2-e0b0648fe9d0',
    title: 'Solo Leveling',
    overview: 'In a world where hunters battle deadly monsters, an E-rank hunter gains a mysterious level-up system.',
    poster_path: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Sintel_poster.jpg',
    release_date: '2018',
    vote_average: 9.1,
    media_type: 'manga'
  }
];

// Helper to check if TMDB is configured
const isTmdbConfigured = () => {
  return TMDB_API_KEY && TMDB_API_KEY !== '' && TMDB_API_KEY !== 'your_tmdb_api_key_here';
};

// Helper to search and map Anime titles to TMDB IDs
const getTmdbIdForAnime = async (title, titleEnglish, releaseDate) => {
  if (!isTmdbConfigured()) return null;
  const queries = [];
  if (titleEnglish) queries.push(titleEnglish);
  if (title && title !== titleEnglish) queries.push(title);
  
  // Extract year from releaseDate
  let year = null;
  if (releaseDate) {
    const match = releaseDate.match(/\b\d{4}\b/);
    if (match) year = match[0];
  }

  for (const q of queries) {
    try {
      // 1. Search TV Shows
      let tvUrl = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}`;
      if (year) tvUrl += `&first_air_date_year=${year}`;
      let searchRes = await axios.get(tvUrl);
      if (searchRes.data.results && searchRes.data.results.length > 0) {
        return { id: searchRes.data.results[0].id.toString(), type: 'tv' };
      }
      
      // If we used a year and got no results, try without year
      if (year) {
        tvUrl = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}`;
        searchRes = await axios.get(tvUrl);
        if (searchRes.data.results && searchRes.data.results.length > 0) {
          return { id: searchRes.data.results[0].id.toString(), type: 'tv' };
        }
      }

      // 2. Search Movies
      let movieUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}`;
      if (year) movieUrl += `&primary_release_year=${year}`;
      let movieRes = await axios.get(movieUrl);
      if (movieRes.data.results && movieRes.data.results.length > 0) {
        return { id: movieRes.data.results[0].id.toString(), type: 'movie' };
      }
      
      if (year) {
        movieUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}`;
        movieRes = await axios.get(movieUrl);
        if (movieRes.data.results && movieRes.data.results.length > 0) {
          return { id: movieRes.data.results[0].id.toString(), type: 'movie' };
        }
      }
    } catch (err) {
      console.warn(`TMDB Anime lookup query "${q}" failed:`, err.message);
    }
  }
  return null;
};


let dashboardCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in-memory cache
let dashboardPromise = null;

// 1. Get Trending/Dashboard Grid Content
export const getTrending = async (req, res) => {
  try {
    // Return cached dashboard data if available and fresh
    if (dashboardCache && (Date.now() - lastCacheTime < CACHE_DURATION)) {
      return res.json(dashboardCache);
    }

    // Await existing fetch if another user is already generating the dashboard
    if (dashboardPromise) {
      try {
        const data = await dashboardPromise;
        return res.json(data);
      } catch (err) {
        // Fallthrough if the promise failed, we'll try again
      }
    }

    dashboardPromise = (async () => {
      // A. Fetch Movies & TV (TMDB or Fallback)
    let tmdbMovies = [];
    let tmdbTv = [];
    let ongoingTv = [];
    let airingTodayTv = [];
    let upcomingMovies = [];
    let upcomingTv = [];
    let trendingAnime = [];
    let ongoingAnime = [];
    let upcomingAnime = [];
    let scheduleAnime = [];

    const mapMovie = m => ({
      id: m.id.toString(),
      title: m.title,
      overview: m.overview,
      poster_path: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://placehold.co/400x600/1e1e24/fff?text=No+Poster',
      release_date: m.release_date || '',
      vote_average: m.vote_average,
      media_type: 'movie'
    });

    const mapTv = t => ({
      id: t.id.toString(),
      title: t.name,
      overview: t.overview,
      poster_path: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : 'https://placehold.co/400x600/1e1e24/fff?text=No+Poster',
      release_date: t.first_air_date || '',
      vote_average: t.vote_average,
      media_type: 'tv'
    });

    if (isTmdbConfigured()) {
      try {
        const todayObj = new Date();
        const today = todayObj.toISOString().split('T')[0];
        const lastWeek = new Date(todayObj.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const nextWeek = new Date(todayObj.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        let ongoingMovies = [];

        const tmdbAxios = axios.create({ timeout: 7000 });

        const [
          trendingMoviesRes, trendingTvRes, ongoingTvRes, airingTodayTvRes, upcomingMoviesRes, upcomingTvRes,
          trendingAnimeRes, ongoingAnimeRes, upcomingAnimeRes, airingTodayAnimeRes, nowPlayingMoviesRes
        ] = await Promise.all([
          tmdbAxios.get(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`).catch(e => ({ data: { results: [] } })),
          tmdbAxios.get(`${TMDB_BASE_URL}/trending/tv/day?api_key=${TMDB_API_KEY}`).catch(e => ({ data: { results: [] } })),
          tmdbAxios.get(`${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}`).catch(e => ({ data: { results: [] } })),
          tmdbAxios.get(`${TMDB_BASE_URL}/tv/airing_today?api_key=${TMDB_API_KEY}`).catch(e => ({ data: { results: [] } })),
          tmdbAxios.get(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`).catch(e => ({ data: { results: [] } })),
          tmdbAxios.get(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&first_air_date.gte=${today}&sort_by=popularity.desc`).catch(e => ({ data: { results: [] } })),
          // Anime Queries via TMDB (Animation genre 16 + Japanese language)
          tmdbAxios.get(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc`).catch(e => ({ data: { results: [] } })),
          tmdbAxios.get(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&air_date.gte=${lastWeek}&air_date.lte=${nextWeek}&sort_by=popularity.desc`).catch(e => ({ data: { results: [] } })),
          tmdbAxios.get(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&first_air_date.gte=${today}&sort_by=popularity.desc`).catch(e => ({ data: { results: [] } })),
          tmdbAxios.get(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&air_date.gte=${today}&air_date.lte=${nextWeek}&sort_by=popularity.desc`).catch(e => ({ data: { results: [] } })),
          tmdbAxios.get(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}`).catch(e => ({ data: { results: [] } }))
        ]);

        tmdbMovies = (trendingMoviesRes.data?.results || []).slice(0, 20).map(mapMovie);
        ongoingMovies = (nowPlayingMoviesRes.data?.results || []).slice(0, 20).map(mapMovie);
        tmdbTv = (trendingTvRes.data?.results || []).slice(0, 20).map(mapTv);
        upcomingMovies = (upcomingMoviesRes.data?.results || []).slice(0, 20).map(mapMovie);
        upcomingTv = (upcomingTvRes.data?.results || []).slice(0, 20).map(mapTv);
        
        trendingAnime = (trendingAnimeRes.data?.results || []).slice(0, 20).map(a => ({...mapTv(a), media_type: 'anime'}));
        upcomingAnime = (upcomingAnimeRes.data?.results || []).slice(0, 20).map(a => ({...mapTv(a), media_type: 'anime'}));

        // Enhance ongoing and scheduled TV/Anime shows with EXACT broadcast days from TMDB details
        const tvListToEnrich = [
          ...(ongoingTvRes.data?.results || []).slice(0, 20), 
          ...(airingTodayTvRes.data?.results || []).slice(0, 20),
          ...(ongoingAnimeRes.data?.results || []).slice(0, 20),
          ...(airingTodayAnimeRes.data?.results || []).slice(0, 20)
        ];
        const uniqueTvIds = [...new Set(tvListToEnrich.map(t => t.id))];
        
        const tvDetailsPromises = uniqueTvIds.map(id => 
          axios.get(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`).catch(() => null)
        );
        const tvDetailsResponses = await Promise.all(tvDetailsPromises);
        
        const tvAirDays = {};
        tvDetailsResponses.forEach(res => {
          if (res && res.data) {
            const ep = res.data.next_episode_to_air || res.data.last_episode_to_air;
            if (ep && ep.air_date) {
              const date = new Date(ep.air_date);
              if (!isNaN(date.getTime())) {
                const daysOfWeek = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
                tvAirDays[res.data.id] = daysOfWeek[date.getDay()];
              }
            }
          }
        });

        const mapTvWithDay = item => {
          const mapped = mapTv(item);
          mapped.broadcast_day = tvAirDays[item.id] || null;
          return mapped;
        };

        const mapAnimeWithDay = item => {
          const mapped = mapTv(item);
          mapped.media_type = 'anime';
          mapped.broadcast = tvAirDays[item.id] || null; // For UI compatibility
          return mapped;
        };

        ongoingTv = (ongoingTvRes.data?.results || []).slice(0, 20).map(mapTvWithDay);
        airingTodayTv = (airingTodayTvRes.data?.results || []).slice(0, 20).map(mapTvWithDay);
        ongoingAnime = (ongoingAnimeRes.data?.results || []).slice(0, 20).map(mapAnimeWithDay);
        scheduleAnime = (airingTodayAnimeRes.data?.results || []).slice(0, 20).map(mapAnimeWithDay);

        // Fallback guarantees if any individual query returned 0 items
        if (tmdbMovies.length === 0) tmdbMovies = MOCK_MOVIES.map(mapMovie);
        if (ongoingMovies.length === 0) ongoingMovies = tmdbMovies;
        if (tmdbTv.length === 0) tmdbTv = MOCK_TV;
        if (upcomingMovies.length === 0) upcomingMovies = tmdbMovies;
        if (upcomingTv.length === 0) upcomingTv = MOCK_TV;
        if (trendingAnime.length === 0) trendingAnime = MOCK_ANIME;
        if (ongoingAnime.length === 0) ongoingAnime = MOCK_ANIME;
        if (upcomingAnime.length === 0) upcomingAnime = MOCK_ANIME;
        if (ongoingTv.length === 0) ongoingTv = MOCK_TV;
        if (airingTodayTv.length === 0) airingTodayTv = MOCK_TV;
        if (scheduleAnime.length === 0) scheduleAnime = MOCK_ANIME;
      } catch (err) {
        console.warn('TMDB dashboard fetch failed, falling back to mocks:', err.message);
        tmdbMovies = MOCK_MOVIES.map(mapMovie);
        tmdbTv = MOCK_TV.map(mapTv);
        ongoingTv = tmdbTv;
        airingTodayTv = tmdbTv;
        upcomingMovies = tmdbMovies;
        upcomingTv = tmdbTv;
        trendingAnime = tmdbTv.map(t => ({...t, media_type: 'anime'}));
        ongoingAnime = trendingAnime;
        upcomingAnime = trendingAnime;
        scheduleAnime = trendingAnime;
      }
    } else {
      tmdbMovies = MOCK_MOVIES.map(mapMovie);
      tmdbTv = MOCK_TV.map(mapTv);
      ongoingTv = tmdbTv;
      airingTodayTv = tmdbTv;
      upcomingMovies = tmdbMovies;
      upcomingTv = tmdbTv;
      trendingAnime = tmdbTv.map(t => ({...t, media_type: 'anime'}));
      ongoingAnime = trendingAnime;
      upcomingAnime = trendingAnime;
      scheduleAnime = trendingAnime;
    }

    // The old Jikan block has been fully replaced by TMDB!

    // C. Fetch Manga (MangaDex API)
    let trendingManga = [];
    let ongoingManga = [];
    let latestManga = [];

    const mapManga = m => {
      const coverRel = m.relationships?.find(r => r.type === 'cover_art');
      const coverFile = coverRel?.attributes?.fileName;
      const posterUrl = coverFile
        ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}`
        : 'https://placehold.co/400x600/1e1e24/fff?text=No+Cover';

      const title = m.attributes?.title?.en || Object.values(m.attributes?.title || {})[0] || 'Unknown Manga';
      const overview = m.attributes?.description?.en || 'No description available.';

      return {
        id: m.id,
        title,
        overview,
        poster_path: posterUrl,
        release_date: m.attributes?.createdAt || '',
        vote_average: 8.0,
        media_type: 'manga'
      };
    };

    try {
      const mangaAxios = axios.create({ timeout: 6000 });
      const trendingMangaRes = await mangaAxios.get('https://api.mangadex.org/manga?limit=20&includes[]=cover_art&order[followedCount]=desc').catch(e => ({ data: { data: [] } }));
      trendingManga = (trendingMangaRes.data?.data || []).map(mapManga);

      const ongoingMangaRes = await mangaAxios.get('https://api.mangadex.org/manga?limit=20&includes[]=cover_art&status[]=ongoing&order[followedCount]=desc').catch(e => ({ data: { data: [] } }));
      ongoingManga = (ongoingMangaRes.data?.data || []).map(mapManga);

      const latestMangaRes = await mangaAxios.get('https://api.mangadex.org/manga?limit=20&includes[]=cover_art&order[latestUploadedChapter]=desc').catch(e => ({ data: { data: [] } }));
      latestManga = (latestMangaRes.data?.data || []).map(mapManga);

      if (trendingManga.length === 0) trendingManga = MOCK_MANGA;
      if (ongoingManga.length === 0) ongoingManga = MOCK_MANGA;
      if (latestManga.length === 0) latestManga = MOCK_MANGA;
    } catch (err) {
      console.error('MangaDex API dashboard query error:', err.message);
      const fallback = [
        {
          id: 'f84b6f89-8d77-4c3e-a4b5-ea9ef076d54d',
          title: 'Sample Manga (MangaDex Down)',
          overview: 'A beautiful manga placeholder. Please check back when MangaDex returns.',
          poster_path: 'https://placehold.co/400x600/1e1e24/fff?text=MangaDex+Offline',
          release_date: '2026',
          vote_average: 8.0,
          media_type: 'manga'
        }
      ];
      trendingManga = fallback;
      ongoingManga = fallback;
      latestManga = fallback;
    }

    // Merge Dashboard response
    const dashboardData = {
      trending: {
        movies: tmdbMovies,
        tv: tmdbTv,
        anime: trendingAnime,
        manga: trendingManga
      },
      ongoing: {
        movies: ongoingMovies,
        tv: ongoingTv,
        anime: ongoingAnime,
        manga: ongoingManga
      },
      upcoming: {
        movies: upcomingMovies,
        tv: upcomingTv,
        anime: upcomingAnime
      },
      schedule: {
        tv: airingTodayTv,
        anime: scheduleAnime
      },
      latest: {
        manga: latestManga
      }
    };

    // Save in-memory cache
    dashboardCache = dashboardData;
    
    // If TMDB failed and gave us the Sintel fallback, only cache for 30 seconds to allow retry later
    // without completely spamming the dead API right now.
    if (!isTmdbConfigured() || (tmdbMovies.length > 0 && tmdbMovies[0].id === 'sintel')) {
      lastCacheTime = Date.now() - CACHE_DURATION + 30000;
    } else {
      lastCacheTime = Date.now();
    }

    return dashboardData;
    })();

    const data = await dashboardPromise;
    dashboardPromise = null;
    res.json(data);
  } catch (error) {
    dashboardPromise = null;
    console.error('[Media Controller Trending Error]:', error);

    // Fallback response if everything fails to guarantee homepage never crashes
    const fallbackMovies = MOCK_MOVIES.map(m => ({
      id: m.id, title: m.title, overview: m.overview, poster_path: m.poster_path, release_date: m.release_date, vote_average: m.vote_average, media_type: 'movie'
    }));

    res.json({
      trending: { movies: fallbackMovies, tv: [], anime: [], manga: [] },
      ongoing: { movies: fallbackMovies, tv: [], anime: [], manga: [] },
      upcoming: { movies: fallbackMovies, tv: [], anime: [] },
      schedule: { tv: [], anime: [] },
      latest: { manga: [] }
    });
  }
};

export const searchMedia = async (req, res) => {
  const { query, type, genre, country, sort } = req.query;
  const page = parseInt(req.query.page || '1', 10);

  // Determine TMDB sort_by value:
  //  - Discover (no query): default to latest release date
  //  - Search (has query): default to relevance (TMDB handles it), then we sort by date client-side
  const getSortBy = (mediaType) => {
    if (sort === 'trending')  return 'popularity.desc';
    if (sort === 'top_rated') return 'vote_average.desc';
    // Default: latest first
    return mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc';
  };

  try {
    let results = [];

    if (type === 'movie' || type === 'tv' || type === 'anime') {
      if (isTmdbConfigured()) {
        try {
          let url = '';
          const hasQuery = query && query.trim() !== '';
          const tmdbType = type === 'anime' ? 'tv' : type;
          
          if (!hasQuery) {
            // Discover Mode (No text query, only filters or default — LATEST FIRST)
            const tmdbType = type === 'anime' ? 'tv' : type;
            const sortBy = getSortBy(tmdbType);
            url = `${TMDB_BASE_URL}/discover/${tmdbType}?api_key=${TMDB_API_KEY}&sort_by=${sortBy}&page=${page}`;

            // Exclude future release dates so upcoming films don't clog latest
            if (type === 'movie') {
              const today = new Date().toISOString().split('T')[0];
              url += `&primary_release_date.lte=${today}`;
            }
            
            if (type === 'anime') {
              url += `&with_original_language=ja`;
              if (genre) {
                if (genre.startsWith('k_')) {
                  url += `&with_genres=16&with_keywords=${genre.replace('k_', '')}`;
                } else if (genre.startsWith('g_')) {
                  url += `&with_genres=16,${genre.replace('g_', '')}`;
                } else {
                  url += `&with_genres=16`;
                }
              } else {
                url += `&with_genres=16`;
              }
            } else {
              if (genre) {
                if (genre.startsWith('k_')) {
                  url += `&with_keywords=${genre.replace('k_', '')}`;
                } else {
                  url += `&with_genres=${genre}`;
                }
              }
              if (country) url += `&with_origin_country=${country}`;
            }
            
            const searchRes = await axios.get(url);
            results = searchRes.data.results.map(r => ({
              id: r.id.toString(),
              title: r.title || r.name,
              overview: r.overview,
              poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : 'https://placehold.co/400x600/1e1e24/fff?text=No+Poster',
              release_date: r.release_date || r.first_air_date,
              vote_average: r.vote_average,
              media_type: type
            }));
          } else {
            // Search Mode (Text query takes priority)
            // Fetch two TMDB pages per requested page to increase local filtering density
            url = `${TMDB_BASE_URL}/search/${tmdbType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query.trim())}`;
            const tmdbPage1 = (page * 2) - 1;
            const tmdbPage2 = page * 2;
            const [res1, res2] = await Promise.all([
              axios.get(`${url}&page=${tmdbPage1}`),
              axios.get(`${url}&page=${tmdbPage2}`).catch(() => ({ data: { results: [] } }))
            ]);
            
            let combinedResults = [...res1.data.results, ...res2.data.results];
            
            // Apply strict local filtering for Genre and Country
            if (type === 'anime') {
              // Ensure it's Japanese Animation
              combinedResults = combinedResults.filter(r => r.genre_ids?.includes(16) && r.origin_country?.includes('JP'));
              if (genre && genre.startsWith('g_')) {
                const genreIdInt = parseInt(genre.replace('g_', ''), 10);
                combinedResults = combinedResults.filter(r => r.genre_ids?.includes(genreIdInt));
              }
            } else {
              if (genre) {
                const genreIdInt = parseInt(genre, 10);
                combinedResults = combinedResults.filter(r => r.genre_ids?.includes(genreIdInt));
              }
              if (country) {
                combinedResults = combinedResults.filter(r => r.origin_country?.includes(country));
              }
            }

            results = combinedResults.slice(0, 20).map(r => ({
              id: r.id.toString(),
              title: r.title || r.name,
              overview: r.overview,
              poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : 'https://placehold.co/400x600/1e1e24/fff?text=No+Poster',
              release_date: r.release_date || r.first_air_date,
              vote_average: r.vote_average,
              media_type: type
            }));

            // Sort search results: latest first by default, unless trending/top_rated requested
            if (!sort || sort === 'latest') {
              results.sort((a, b) => {
                const dateA = new Date(a.release_date || '1900-01-01').getTime();
                const dateB = new Date(b.release_date || '1900-01-01').getTime();
                return dateB - dateA;
              });
            } else if (sort === 'top_rated') {
              results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
            }
          }
        } catch (err) {
          console.warn('TMDB search/discover error, using mock fallback:', err.message);
          const mockSource = type === 'movie' ? MOCK_MOVIES : MOCK_TV;
          results = mockSource.filter(item => {
            const titleText = item.title || item.name || '';
            return !query || titleText.toLowerCase().includes(query.toLowerCase());
          });
        }
      } else {
        const mockSource = type === 'movie' ? MOCK_MOVIES : MOCK_TV;
        results = mockSource.filter(item => {
          const titleText = item.title || item.name || '';
          return !query || titleText.toLowerCase().includes(query.toLowerCase());
        });
      }
    } else if (type === 'manga') {
      try {
        const limit = 20;
        const offset = (page - 1) * limit;

        // Sort manga by latest updated chapter by default
        const mangaOrder = sort === 'trending'
          ? 'order[followedCount]=desc'
          : sort === 'top_rated'
          ? 'order[rating]=desc'
          : 'order[latestUploadedChapter]=desc'; // latest updated first

        let endpoint = `https://api.mangadex.org/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&${mangaOrder}`;
        if (query && query.trim() !== '') endpoint += `&title=${encodeURIComponent(query.trim())}`;
        
        if (genre) {
          if (genre.startsWith('d_')) {
            endpoint += `&publicationDemographic[]=${genre.replace('d_', '')}`;
          } else {
            endpoint += `&includedTags[]=${genre}`;
          }
        }
        
        const mangaRes = await axios.get(endpoint);
        results = mangaRes.data.data.map(m => {
          const coverRel = m.relationships.find(r => r.type === 'cover_art');
          const coverFile = coverRel?.attributes?.fileName;
          const posterUrl = coverFile
            ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}`
            : 'https://placehold.co/400x600/1e1e24/fff?text=No+Cover';

          const title = m.attributes.title.en || Object.values(m.attributes.title)[0] || 'Unknown Manga';
          const overview = m.attributes.description.en || 'No description available.';
          const lastChapterDate = m.attributes.updatedAt || m.attributes.createdAt || null;

          return {
            id: m.id,
            title,
            overview,
            poster_path: posterUrl,
            release_date: lastChapterDate,
            vote_average: 8.0,
            media_type: 'manga'
          };
        });
      } catch (err) {
        console.error('MangaDex search error:', err.message);
        results = [];
      }
    }

    res.json(results);
  } catch (error) {
    console.error('[Media Controller Search Error]:', error);
    res.status(500).json({ error: 'Search query failed.' });
  }
};

// In-memory caching to bypass external API rate limits (e.g. Jikan v4 limit of 3 req/sec)
const jikanCache = new Map();
const mangadexCache = new Map();

// 3. Get Media Detail
export const getMediaDetail = async (req, res) => {
  const { type, id } = req.params;

  try {
    let details = null;

    if (type === 'movie' || type === 'tv' || type === 'anime') {
      if (isTmdbConfigured()) {
        try {
          const tmdbType = type === 'anime' ? 'tv' : type;
          const detailRes = await axios.get(`${TMDB_BASE_URL}/${tmdbType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,recommendations,credits`);
          const d = detailRes.data;
          
          const trailer = d.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key;
          const cast = d.credits?.cast?.slice(0, 10).map(c => ({ name: c.name, character: c.character })) || [];
          const recommendations = d.recommendations?.results?.slice(0, 5).map(r => ({
            id: r.id.toString(),
            title: r.title || r.name,
            poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w200${r.poster_path}` : null,
            media_type: type
          })) || [];

          details = {
            id: d.id.toString(),
            title: d.title || d.name,
            overview: d.overview,
            poster_path: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : 'https://placehold.co/400x600/1e1e24/fff?text=No+Poster',
            backdrop_path: d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : null,
            release_date: d.release_date || d.first_air_date,
            vote_average: d.vote_average,
            seasons: d.seasons || null, // Map TMDB TV seasons structure
            youtube_trailer: trailer || null,
            cast,
            recommendations,
            media_type: type,
            // Dynamic streaming embeds
            video_url: null, // Host will supply custom or fall back to open movie in player
            embed_url: type === 'movie' 
              ? `https://vidsrc.to/embed/movie/${d.id}` 
              : `https://vidsrc.to/embed/tv/${d.id}/1/1` // Default Season 1 Episode 1
          };
        } catch (err) {
          console.warn('TMDB detail fetch failed, falling back to mock:', err.message);
        }
      }

      // If TMDB detail lookup failed or is not configured, load from mock list
      if (!details) {
        const mockSource = type === 'movie' ? MOCK_MOVIES : MOCK_TV;
        const matched = mockSource.find(item => item.id === id);
        if (matched) {
          details = {
            ...matched,
            cast: [{ name: 'Blender Foundation', character: 'Production' }],
            recommendations: mockSource.filter(m => m.id !== id).map(m => ({ id: m.id, title: m.title || m.name, poster_path: m.poster_path, media_type: type }))
          };
        } else {
          // If not in standard list, return dynamic fallback mock
          details = {
            id,
            title: `Fallback ${type === 'movie' ? 'Movie' : 'TV Show'} #${id}`,
            overview: 'Detailed media synopsis placeholder. TMDB is not fully configured, playing mock fallback stream.',
            poster_path: 'https://placehold.co/400x600/1e1e24/fff?text=No+Poster',
            release_date: '2026-06-14',
            vote_average: 8.0,
            youtube_trailer: 'eRsGyueVLvQ',
            cast: [{ name: 'Jane Doe', character: 'Protagonist' }],
            recommendations: [],
            media_type: type,
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            embed_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          };
        }
      }
    } else if (type === 'manga') {
      try {
        // Check cache first
        if (mangadexCache.has(id)) {
          return res.json(mangadexCache.get(id));
        }

        const mangaRes = await axios.get(`https://api.mangadex.org/manga/${id}?includes[]=cover_art`);
        const m = mangaRes.data.data;
        
        const coverRel = m.relationships.find(r => r.type === 'cover_art');
        const coverFile = coverRel?.attributes?.fileName;
        const posterUrl = coverFile
          ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}`
          : 'https://placehold.co/400x600/1e1e24/fff?text=No+Cover';

        const title = m.attributes.title.en || Object.values(m.attributes.title)[0] || 'Unknown Manga';
        const overview = m.attributes.description.en || 'No description available.';

        details = {
          id: m.id,
          title,
          overview,
          poster_path: posterUrl,
          backdrop_path: posterUrl,
          release_date: m.attributes.createdAt?.split('T')[0],
          vote_average: 8.0,
          youtube_trailer: null,
          cast: m.relationships.filter(r => r.type === 'author').map(a => ({ name: 'Author', character: a.id })),
          recommendations: [],
          media_type: 'manga'
        };

        mangadexCache.set(id, details);
      } catch (err) {
        console.error('MangaDex detail error:', err.message);
        return res.status(500).json({ error: 'Failed to fetch manga details.' });
      }
    }

    if (!details) {
      return res.status(404).json({ error: 'Content not found.' });
    }

    res.json(details);
  } catch (error) {
    console.error('[Media Controller Details Error]:', error);
    res.status(500).json({ error: 'Failed to fetch details.' });
  }
};

// 3.5 Fetch TV Season Details for Episode Names
export const getTvSeason = async (req, res) => {
  const { id, season_number } = req.params;

  try {
    if (!isTmdbConfigured()) {
      return res.json({ episodes: [] });
    }

    const response = await axios.get(`${TMDB_BASE_URL}/tv/${id}/season/${season_number}?api_key=${TMDB_API_KEY}`);
    res.json(response.data);
  } catch (error) {
    console.error(`[Media Controller TV Season Error]:`, error.message);
    res.status(500).json({ error: 'Failed to fetch season details.' });
  }
};

// 4. MangaDex Chapter Feed lookup
export const getMangaChapters = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch all English chapters natively using pagination to bypass the 500 limit
    let allFeedData = [];
    let offset = 0;
    const limit = 500;
    
    while (offset < 5000) {
      const feedRes = await axios.get(`https://api.mangadex.org/manga/${id}/feed`, {
        params: {
          'translatedLanguage[]': 'en',
          'limit': limit,
          'offset': offset,
          'order[chapter]': 'asc',
          'order[volume]': 'asc'
        }
      });
      
      allFeedData.push(...feedRes.data.data);
      
      if (offset + limit >= feedRes.data.total) {
        break; // Reached the end
      }
      
      offset += limit;
      await new Promise(r => setTimeout(r, 200)); // Respect MangaDex 5 req/s rate limit
    }

    // Deduplicate chapters to avoid multiple uploads of the same chapter number by different groups
    const uniqueChapters = [];
    const seenChapters = new Set();

    for (const ch of allFeedData) {
      const chNum = ch.attributes.chapter || '0';
      if (!seenChapters.has(chNum)) {
        seenChapters.add(chNum);
        uniqueChapters.push({
          id: ch.id,
          chapter: chNum,
          title: ch.attributes.title || `Chapter ${chNum}`,
          volume: ch.attributes.volume,
          publishAt: ch.attributes.publishAt
        });
      }
    }

    res.json(uniqueChapters);
  } catch (error) {
    console.error('[Media Controller Manga Chapters Error]:', error.message);
    res.status(500).json({ error: 'Failed to load chapter list.' });
  }
};

// 5. MangaDex Chapter Pages details
export const getMangaPages = async (req, res) => {
  const { chapterId } = req.params;

  try {
    const pagesRes = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
    const { baseUrl, chapter } = pagesRes.data;

    // Build the high-resolution images list
    const images = chapter.data.map(fileName => `${baseUrl}/data/${chapter.hash}/${fileName}`);
    res.json({
      hash: chapter.hash,
      pages: images
    });
  } catch (error) {
    console.error('[Media Controller Manga Pages Error]:', error.message);
    res.status(500).json({ error: 'Failed to load chapter pages.' });
  }
};

// 6. Get User Watchlist
export const getWatchlist = async (req, res) => {
  try {
    const [list] = await db.query(
      'SELECT id, external_media_id, media_type, title, poster_path, saved_at FROM user_watchlists WHERE user_id = ? ORDER BY saved_at DESC',
      [req.user.id]
    );
    res.json(list);
  } catch (error) {
    console.error('[Watchlist GET Error]:', error);
    res.status(500).json({ error: 'Failed to retrieve watchlist.' });
  }
};

// 7. Add to User Watchlist
export const addToWatchlist = async (req, res) => {
  const { external_media_id, media_type, title, poster_path } = req.body;

  if (!external_media_id || !media_type || !title) {
    return res.status(400).json({ error: 'Missing watchlist details (id, type, title).' });
  }

  try {
    await db.query(
      'INSERT INTO user_watchlists (user_id, external_media_id, media_type, title, poster_path) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = title',
      [req.user.id, external_media_id, media_type, title, poster_path]
    );

    res.status(201).json({ message: 'Added to watchlist.' });
  } catch (error) {
    console.error('[Watchlist POST Error]:', error);
    res.status(500).json({ error: 'Failed to update watchlist.' });
  }
};

// 8. Remove from Watchlist
export const removeFromWatchlist = async (req, res) => {
  const { id } = req.params; // watchlist item ID or media ID

  try {
    // Support removing by watchlist ID or external_media_id + user_id mapping
    await db.query(
      'DELETE FROM user_watchlists WHERE user_id = ? AND (id = ? OR external_media_id = ?)',
      [req.user.id, id, id]
    );
    res.json({ message: 'Removed from watchlist.' });
  } catch (error) {
    console.error('[Watchlist DELETE Error]:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist.' });
  }
};


// 7. Get Deep Catalog Pagination
export const getCatalog = async (req, res) => {
  const { category, type } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  
  try {
    let results = [];
    const mapMovie = m => ({
      id: m.id.toString(),
      title: m.title,
      overview: m.overview,
      poster_path: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://placehold.co/400x600/1e1e24/fff?text=No+Poster',
      release_date: m.release_date || '',
      vote_average: m.vote_average,
      media_type: 'movie'
    });

    const mapTv = t => ({
      id: t.id.toString(),
      title: t.name,
      overview: t.overview,
      poster_path: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : 'https://placehold.co/400x600/1e1e24/fff?text=No+Poster',
      release_date: t.first_air_date || '',
      vote_average: t.vote_average,
      media_type: 'tv'
    });

    const mapAnime = item => ({
      id: item.mal_id.toString(),
      title: item.title_english || item.title,
      overview: item.synopsis,
      poster_path: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || 'https://placehold.co/400x600/1e1e24/fff?text=No+Poster',
      release_date: item.aired?.string || '',
      vote_average: item.score,
      media_type: 'anime',
      broadcast: item.broadcast?.string || null
    });

    if ((type === 'movie' || type === 'tv' || type === 'anime') && isTmdbConfigured()) {
      let endpoint = '';
      const todayObj = new Date();
      const today = todayObj.toISOString().split('T')[0];
      const lastWeek = new Date(todayObj.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const nextWeek = new Date(todayObj.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      if (type === 'anime') {
        if (category === 'trending') endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc&page=${page}`;
        else if (category === 'ongoing') endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&air_date.gte=${lastWeek}&air_date.lte=${nextWeek}&sort_by=popularity.desc&page=${page}`;
        else if (category === 'upcoming') endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&first_air_date.gte=${today}&sort_by=popularity.desc&page=${page}`;
        else if (category === 'schedule') endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&air_date.gte=${today}&air_date.lte=${nextWeek}&sort_by=popularity.desc&page=${page}`;
        else endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc&page=${page}`;
        
        const tmdbRes = await axios.get(endpoint);
        results = tmdbRes.data.results.map(item => {
          const mapped = mapTv(item);
          mapped.media_type = 'anime';
          return mapped;
        });
      } else {
        if (category === 'trending') endpoint = `${TMDB_BASE_URL}/trending/${type}/day?api_key=${TMDB_API_KEY}&page=${page}`;
        else if (category === 'ongoing' && type === 'tv') endpoint = `${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=${page}`;
        else if (category === 'ongoing' && type === 'movie') endpoint = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`;
        else if (category === 'upcoming' && type === 'movie') endpoint = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`;
        else if (category === 'latest') endpoint = `${TMDB_BASE_URL}/${type}/now_playing?api_key=${TMDB_API_KEY}&page=${page}`;
        else endpoint = `${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}`;
        
        const tmdbRes = await axios.get(endpoint);
        results = type === 'movie' ? tmdbRes.data.results.map(mapMovie) : tmdbRes.data.results.map(mapTv);
      }
    } 
    else if (type === 'manga') {
      const limit = 20;
      const offset = (page - 1) * limit;
      let endpoint = `https://api.mangadex.org/manga?limit=${limit}&offset=${offset}&includes[]=cover_art`;
      if (category === 'trending' || category === 'latest') endpoint += '&order[rating]=desc';
      
      const mangaRes = await axios.get(endpoint);
      results = mangaRes.data.data.map(m => {
        const coverRel = m.relationships.find(r => r.type === 'cover_art');
        const coverFile = coverRel?.attributes?.fileName;
        const posterUrl = coverFile ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}` : 'https://placehold.co/400x600/1e1e24/fff?text=No+Cover';
        return {
          id: m.id,
          title: m.attributes.title.en || Object.values(m.attributes.title)[0],
          overview: m.attributes.description.en || '',
          poster_path: posterUrl,
          release_date: m.attributes.year?.toString() || '',
          vote_average: null,
          media_type: 'manga'
        };
      });
    }

    res.json({ results, page, category, type });
  } catch (err) {
    console.error(`Catalog fetch error for ${category}/${type}:`, err.message);
    res.status(500).json({ error: 'Failed to fetch catalog', results: [] });
  }
};
