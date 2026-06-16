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
    name: 'Cosmos Laundromat',
    overview: 'On a desolate island, a depressed sheep named Franck meets a mysterious salesman who offers him a spiritual, dimension-hopping laundry service to alter his destiny.',
    poster_path: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Cosmos_Laundromat_-_First_Cycle.webm.jpg',
    backdrop_path: 'https://gooseberry.blender.org/wp-content/uploads/2015/03/laundromat_inside.jpg',
    first_air_date: '2015-08-10',
    vote_average: 8.5,
    media_type: 'tv',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', // Example video
    youtube_trailer: 'YOF538VwV6A'
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

// 1. Get Trending/Dashboard Grid Content
export const getTrending = async (req, res) => {
  try {
    // Return cached dashboard data if available and fresh
    if (dashboardCache && (Date.now() - lastCacheTime < CACHE_DURATION)) {
      return res.json(dashboardCache);
    }

    // A. Fetch Movies & TV (TMDB or Fallback)
    let tmdbMovies = [];
    let tmdbTv = [];
    let ongoingTv = [];
    let airingTodayTv = [];
    let upcomingMovies = [];
    let upcomingTv = [];

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
        const today = new Date().toISOString().split('T')[0];
        const [trendingMoviesRes, trendingTvRes, ongoingTvRes, airingTodayTvRes, upcomingMoviesRes, upcomingTvRes] = await Promise.all([
          axios.get(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`),
          axios.get(`${TMDB_BASE_URL}/trending/tv/day?api_key=${TMDB_API_KEY}`),
          axios.get(`${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}`),
          axios.get(`${TMDB_BASE_URL}/tv/airing_today?api_key=${TMDB_API_KEY}`),
          axios.get(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`),
          axios.get(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&first_air_date.gte=${today}&sort_by=popularity.desc`)
        ]);

        tmdbMovies = trendingMoviesRes.data.results.slice(0, 20).map(mapMovie);
        tmdbTv = trendingTvRes.data.results.slice(0, 20).map(mapTv);
        upcomingMovies = upcomingMoviesRes.data.results.slice(0, 20).map(mapMovie);
        upcomingTv = upcomingTvRes.data.results.slice(0, 20).map(mapTv);

        // Enhance ongoing and scheduled TV shows with EXACT broadcast days from TMDB details
        const tvListToEnrich = [...ongoingTvRes.data.results.slice(0, 20), ...airingTodayTvRes.data.results.slice(0, 20)];
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

        ongoingTv = ongoingTvRes.data.results.slice(0, 20).map(mapTvWithDay);
        airingTodayTv = airingTodayTvRes.data.results.slice(0, 20).map(mapTvWithDay);
      } catch (err) {
        console.warn('TMDB dashboard fetch failed, falling back to mocks:', err.message);
        tmdbMovies = MOCK_MOVIES.map(mapMovie);
        tmdbTv = MOCK_TV.map(mapTv);
        ongoingTv = tmdbTv;
        airingTodayTv = tmdbTv;
        upcomingMovies = tmdbMovies;
        upcomingTv = tmdbTv;
      }
    } else {
      tmdbMovies = MOCK_MOVIES.map(mapMovie);
      tmdbTv = MOCK_TV.map(mapTv);
      ongoingTv = tmdbTv;
      airingTodayTv = tmdbTv;
      upcomingMovies = tmdbMovies;
      upcomingTv = tmdbTv;
    }

    // B. Fetch Anime (Jikan API v4) with staggered delays to bypass Jikan 3 req/sec limit
    let trendingAnime = [];
    let ongoingAnime = [];
    let upcomingAnime = [];
    let scheduleAnime = [];

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

    try {
      const trendingAnimeRes = await axios.get('https://api.jikan.moe/v4/top/anime?limit=20');
      trendingAnime = trendingAnimeRes.data.data.map(mapAnime);

      await new Promise(resolve => setTimeout(resolve, 400));

      const ongoingAnimeRes = await axios.get('https://api.jikan.moe/v4/seasons/now?limit=20');
      ongoingAnime = ongoingAnimeRes.data.data.map(mapAnime);

      await new Promise(resolve => setTimeout(resolve, 400));

      const upcomingAnimeRes = await axios.get('https://api.jikan.moe/v4/seasons/upcoming?limit=20');
      upcomingAnime = upcomingAnimeRes.data.data.map(mapAnime);

      await new Promise(resolve => setTimeout(resolve, 400));

      const scheduleAnimeRes = await axios.get('https://api.jikan.moe/v4/schedules');
      scheduleAnime = scheduleAnimeRes.data.data.map(mapAnime);
    } catch (err) {
      console.error('Jikan Anime API dashboard query error:', err.message);
      const fallback = [
        {
          id: '1',
          title: 'Cowboy Bebop',
          overview: 'The futuristic misadventures of an easygoing bounty hunter and his partners.',
          poster_path: 'https://cdn.myanimelist.net/images/anime/4/19644.jpg',
          release_date: '1998',
          vote_average: 8.75,
          media_type: 'anime'
        }
      ];
      trendingAnime = fallback;
      ongoingAnime = fallback;
      upcomingAnime = fallback;
      scheduleAnime = fallback;
    }

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
      const trendingMangaRes = await axios.get('https://api.mangadex.org/manga?limit=20&includes[]=cover_art&order[followedCount]=desc');
      trendingManga = trendingMangaRes.data.data.map(mapManga);

      const ongoingMangaRes = await axios.get('https://api.mangadex.org/manga?limit=20&includes[]=cover_art&status[]=ongoing&order[followedCount]=desc');
      ongoingManga = ongoingMangaRes.data.data.map(mapManga);

      const latestMangaRes = await axios.get('https://api.mangadex.org/manga?limit=20&includes[]=cover_art&order[latestUploadedChapter]=desc');
      latestManga = latestMangaRes.data.data.map(mapManga);
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
    lastCacheTime = Date.now();

    res.json(dashboardData);
  } catch (error) {
    console.error('[Media Controller Trending Error]:', error);
    res.status(500).json({ error: 'Failed to fetch catalog content.' });
  }
};

export const searchMedia = async (req, res) => {
  const { query, type, genre, country } = req.query; // type can be 'movie', 'tv', 'anime', 'manga'
  const page = parseInt(req.query.page || '1', 10);

  try {
    let results = [];

    if (type === 'movie' || type === 'tv') {
      if (isTmdbConfigured()) {
        try {
          let url = '';
          const hasQuery = query && query.trim() !== '';
          
          if (!hasQuery) {
            // Discover Mode (No text query, only filters or default popular)
            url = `${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}`;
            if (genre) url += `&with_genres=${genre}`;
            if (country) url += `&with_origin_country=${country}`;
            
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
            url = `${TMDB_BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query.trim())}`;
            const tmdbPage1 = (page * 2) - 1;
            const tmdbPage2 = page * 2;
            const [res1, res2] = await Promise.all([
              axios.get(`${url}&page=${tmdbPage1}`),
              axios.get(`${url}&page=${tmdbPage2}`).catch(() => ({ data: { results: [] } }))
            ]);
            
            let combinedResults = [...res1.data.results, ...res2.data.results];
            
            // Apply strict local filtering for Genre and Country
            if (genre) {
              const genreIdInt = parseInt(genre, 10);
              combinedResults = combinedResults.filter(r => r.genre_ids?.includes(genreIdInt));
            }
            if (country) {
              combinedResults = combinedResults.filter(r => r.origin_country?.includes(country));
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
    } else if (type === 'anime') {
      try {
        let endpoint = `https://api.jikan.moe/v4/anime`;
        const params = [];
        if (query && query.trim() !== '') params.push(`q=${encodeURIComponent(query.trim())}`);
        if (genre) params.push(`genres=${genre}`);
        
        // Ensure anime search results prioritize modern/popular titles
        params.push('order_by=popularity');
        params.push('sort=asc');
        params.push(`page=${page}`);
        
        if (params.length > 0) {
          endpoint += `?${params.join('&')}&limit=20`;
        } else {
          endpoint += `?limit=20&page=${page}`;
        }

        const animeRes = await axios.get(endpoint);
        results = animeRes.data.data.map(item => ({
          id: item.mal_id.toString(),
          title: item.title_english || item.title,
          overview: item.synopsis,
          poster_path: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
          vote_average: item.score,
          media_type: 'anime'
        }));
      } catch (err) {
        console.error('Jikan search error:', err.message);
        results = [];
      }
    } else if (type === 'manga') {
      try {
        const limit = 20;
        const offset = (page - 1) * limit;
        let endpoint = `https://api.mangadex.org/manga?limit=${limit}&offset=${offset}&includes[]=cover_art`;
        if (query && query.trim() !== '') endpoint += `&title=${encodeURIComponent(query.trim())}`;
        if (genre) endpoint += `&includedTags[]=${genre}`;
        
        const mangaRes = await axios.get(endpoint);
        results = mangaRes.data.data.map(m => {
          const coverRel = m.relationships.find(r => r.type === 'cover_art');
          const coverFile = coverRel?.attributes?.fileName;
          const posterUrl = coverFile
            ? `https://uploads.mangadex.org/covers/${m.id}/${coverFile}`
            : 'https://placehold.co/400x600/1e1e24/fff?text=No+Cover';

          const title = m.attributes.title.en || Object.values(m.attributes.title)[0] || 'Unknown Manga';
          const overview = m.attributes.description.en || 'No description available.';

          return {
            id: m.id,
            title,
            overview,
            poster_path: posterUrl,
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

    if (type === 'movie' || type === 'tv') {
      if (isTmdbConfigured()) {
        try {
          const detailRes = await axios.get(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,recommendations,credits`);
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
    } else if (type === 'anime') {
      try {
        // Check cache first to prevent Jikan 429 rate limit
        if (jikanCache.has(id)) {
          return res.json(jikanCache.get(id));
        }

        const animeRes = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
        
        let recs = [];
        try {
          // Add a tiny delay to separate Jikan requests
          await new Promise(resolve => setTimeout(resolve, 500));
          const recommendationsRes = await axios.get(`https://api.jikan.moe/v4/anime/${id}/recommendations`);
          recs = recommendationsRes.data.data?.slice(0, 5).map(r => ({
            id: r.entry.mal_id.toString(),
            title: r.entry.title,
            poster_path: r.entry.images?.jpg?.image_url,
            media_type: 'anime'
          })) || [];
        } catch (recErr) {
          console.warn('Jikan recommendations fetch failed (likely rate-limited), proceeding without recommendations:', recErr.message);
        }

        const item = animeRes.data.data;
        const tmdbMapping = await getTmdbIdForAnime(item.title, item.title_english, item.aired?.string);

        details = {
          id: item.mal_id.toString(),
          tmdb_id: tmdbMapping?.id || null,
          tmdb_type: tmdbMapping?.type || 'tv',
          title: item.title_english || item.title,
          overview: item.synopsis,
          poster_path: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
          backdrop_path: item.images?.jpg?.large_image_url, // fallback
          release_date: item.aired?.string,
          vote_average: item.score,
          episodes_count: item.episodes || null, // Map total episode count
          youtube_trailer: item.trailer?.youtube_id || null,
          cast: item.studios?.map(s => ({ name: s.name, character: 'Studio' })) || [],
          recommendations: recs,
          media_type: 'anime',
          // Since Jikan has no free streams, we supply a public open video link as a playable stream
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          embed_url: item.trailer?.embed_url || null
        };

        // Cache details response
        jikanCache.set(id, details);
      } catch (err) {
        console.error('Jikan detail error:', err.message);
        return res.status(500).json({ error: 'Failed to fetch anime details. API might be rate-limited or down.' });
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

// 4. MangaDex Chapter Feed lookup
export const getMangaChapters = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch chapters: English translations, sorted by chapter ascending
    // Increased limit to 500 to fetch a larger range
    const feedRes = await axios.get(`https://api.mangadex.org/manga/${id}/feed`, {
      params: {
        'translatedLanguage[]': 'en',
        'limit': 500,
        'order[chapter]': 'asc',
        'order[volume]': 'asc'
      }
    });

    // Deduplicate chapters to avoid multiple uploads of the same chapter number by different groups
    const uniqueChapters = [];
    const seenChapters = new Set();

    for (const ch of feedRes.data.data) {
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

// 9. Fetch Anime Episodes List from Jikan
export const getAnimeEpisodes = async (req, res) => {
  const { id } = req.params;

  try {
    const cacheKey = `anime-episodes-${id}`;
    if (jikanCache.has(cacheKey)) {
      return res.json(jikanCache.get(cacheKey));
    }

    const epsRes = await axios.get(`https://api.jikan.moe/v4/anime/${id}/episodes`);
    const episodes = epsRes.data.data.map(ep => ({
      id: ep.mal_id,
      episode: ep.mal_id.toString(),
      title: ep.title || `Episode ${ep.mal_id}`
    }));

    jikanCache.set(cacheKey, episodes);
    res.json(episodes);
  } catch (error) {
    console.error('[Media Controller Anime Episodes Error]:', error.message);
    // Return empty list so client falls back to generating list from main details
    res.json([]);
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

    if ((type === 'movie' || type === 'tv') && isTmdbConfigured()) {
      let endpoint = '';
      if (category === 'trending') endpoint = `${TMDB_BASE_URL}/trending/${type}/day?api_key=${TMDB_API_KEY}&page=${page}`;
      else if (category === 'ongoing' && type === 'tv') endpoint = `${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=${page}`;
      else if (category === 'upcoming' && type === 'movie') endpoint = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`;
      else if (category === 'latest') endpoint = `${TMDB_BASE_URL}/${type}/now_playing?api_key=${TMDB_API_KEY}&page=${page}`;
      else endpoint = `${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}`;
      
      const tmdbRes = await axios.get(endpoint);
      results = type === 'movie' ? tmdbRes.data.results.map(mapMovie) : tmdbRes.data.results.map(mapTv);
    } 
    else if (type === 'anime') {
      let endpoint = '';
      if (category === 'trending') endpoint = `https://api.jikan.moe/v4/top/anime?page=${page}`;
      else if (category === 'ongoing') endpoint = `https://api.jikan.moe/v4/seasons/now?page=${page}`;
      else if (category === 'upcoming') endpoint = `https://api.jikan.moe/v4/seasons/upcoming?page=${page}`;
      else if (category === 'schedule') endpoint = `https://api.jikan.moe/v4/schedules?page=${page}`;
      else endpoint = `https://api.jikan.moe/v4/anime?order_by=popularity&sort=asc&page=${page}`;
      
      const animeRes = await axios.get(endpoint);
      results = animeRes.data.data.map(mapAnime);
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
