import axios from 'axios';
import { db } from '../config/db.js';
import dotenv from 'dotenv';
import { getSongDetails, getTrendingMusicDirect } from './musicController.js';
import {
  resolveMangaCovers,
  formatMangaDexItems,
  getAniListMangaDetail,
  healMangaWatchlistCovers,
  isValidCoverUrl,
  fetchMangaFeedWithCovers
} from '../utils/mangaCovers.js';

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
    genres: [{ id: '16', name: 'Animation' }, { id: '14', name: 'Fantasy' }, { id: '28', name: 'Action' }],
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
    genres: [{ id: '878', name: 'Science Fiction' }, { id: '28', name: 'Action' }],
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
    genres: [{ id: '16', name: 'Animation' }, { id: '35', name: 'Comedy' }, { id: '10751', name: 'Family' }],
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
    genres: [{ id: '16', name: 'Animation' }, { id: '878', name: 'Science Fiction' }],
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
    genres: [{ id: '16', name: 'Animation' }, { id: '10765', name: 'Sci-Fi & Fantasy' }, { id: '35', name: 'Comedy' }],
    media_type: 'tv',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', // Example video
    youtube_trailer: 'YOF538VwV6A'
  }
];

// Helper to check if TMDB is configured
const isTmdbConfigured = () => {
  return TMDB_API_KEY && TMDB_API_KEY !== '' && TMDB_API_KEY !== 'your_tmdb_api_key_here';
};

// Strict classifier for Japanese Animation to prevent TV/Anime leakage
export const isAnimeItem = (item) => {
  if (!item) return false;
  const isJapanese = item.original_language === 'ja' || item.origin_country?.includes('JP');
  const isAnimation = item.genre_ids?.includes(16) || item.genres?.some(g => g.id === 16 || g.id === '16' || g.name === 'Animation');
  return Boolean(isJapanese && isAnimation);
};

// Helper to search and map Anime titles to TMDB IDs
const getTmdbIdForAnime = async (title, titleEnglish, releaseDate) => {
  if (!isTmdbConfigured()) return null;
  const queries = [];
  if (titleEnglish) queries.push(titleEnglish);
  if (title && title !== titleEnglish) queries.push(title);
  
  // Also add clean base title (without "Season 2", "2nd Season", "Part 2", etc.)
  [titleEnglish, title].forEach(t => {
    if (t) {
      const base = t.replace(/season\s*\d+|\d+(?:nd|rd|th)?\s*season|part\s*\d+|cour\s*\d+/gi, '').trim();
      if (base && base.length >= 3 && !queries.includes(base)) {
        queries.push(base);
      }
    }
  });

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

// AniList Cache Maps
const anilistSearchCache = new Map();
const anilistDetailCache = new Map();

// Search AniList for all anime entries, sequels, prequels, movies, OVAs, ONAs
export const searchAniListAnime = async (query, page = 1) => {
  const cacheKey = `${query.toLowerCase().trim()}_p${page}`;
  if (anilistSearchCache.has(cacheKey)) {
    const cached = anilistSearchCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return cached.data;
    }
  }

  const gqlQuery = `
    query ($search: String, $page: Int) {
      Page(page: $page, perPage: 25) {
        media(search: $search, type: ANIME, sort: [SEARCH_MATCH, POPULARITY_DESC]) {
          id
          title { english romaji native }
          format
          episodes
          duration
          status
          season
          seasonYear
          averageScore
          description(asHtml: false)
          coverImage { large extraLarge }
          bannerImage
          genres
          relations {
            edges {
              relationType
              node {
                id
                title { english romaji native }
                format
                episodes
                coverImage { large extraLarge }
                seasonYear
                averageScore
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await axios.post('https://graphql.anilist.co', {
      query: gqlQuery,
      variables: { search: query.trim(), page }
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 6000
    });

    const rawList = res.data?.data?.Page?.media || [];
    const results = [];
    const seenIds = new Set();

    const addAnimeItem = (m) => {
      if (!m || seenIds.has(m.id)) return;
      seenIds.add(m.id);

      const title = m.title?.english || m.title?.romaji || 'Unknown Anime';
      const sMatch = title.match(/season\s*(\d+)|(\d+)(?:nd|rd|th)?\s*season/i);
      const seasonNumber = sMatch ? parseInt(sMatch[1] || sMatch[2], 10) : (m.format === 'TV' ? 1 : null);

      let fmt = m.format || 'Anime';
      if (fmt === 'TV' && seasonNumber && seasonNumber > 1) {
        fmt = `Season ${seasonNumber}`;
      } else if (fmt === 'MOVIE') {
        fmt = 'Movie';
      }

      results.push({
        id: `al_${m.id}`,
        external_media_id: `al_${m.id}`,
        title,
        title_romaji: m.title?.romaji,
        title_english: m.title?.english,
        overview: m.description ? m.description.replace(/<[^>]*>/g, '') : '',
        poster_path: m.coverImage?.extraLarge || m.coverImage?.large,
        backdrop_path: m.bannerImage || m.coverImage?.large,
        release_date: m.seasonYear ? `${m.seasonYear}-01-01` : '',
        vote_average: m.averageScore ? (m.averageScore / 10).toFixed(1) : 8.0,
        media_type: 'anime',
        format: fmt,
        episodes: m.episodes || null,
        season_number: seasonNumber,
        duration: m.duration || null,
        runtime: m.duration || null,
        genre_ids: []
      });
    };

    rawList.forEach(m => addAnimeItem(m));

    // Incorporate all related sequels, prequels, movies, OVAs, ONAs from relations
    rawList.forEach(m => {
      if (m.relations?.edges?.length) {
        m.relations.edges.forEach(edge => {
          const relType = edge.relationType;
          const node = edge.node;
          if (['SEQUEL', 'PREQUEL', 'SIDE_STORY', 'SPIN_OFF', 'ALTERNATIVE'].includes(relType) && node.format !== 'MANGA') {
            addAnimeItem(node);
          }
        });
      }
    });

    anilistSearchCache.set(cacheKey, { data: results, timestamp: Date.now() });
    return results;
  } catch (err) {
    console.warn('AniList anime search error:', err.message);
    return [];
  }
};

// Fetch rich AniList anime details by ID
export const getAniListMediaDetail = async (alId) => {
  const numId = parseInt(alId, 10);
  if (anilistDetailCache.has(numId)) {
    const cached = anilistDetailCache.get(numId);
    if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return cached.data;
    }
  }

  const gqlQuery = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { english romaji native }
        format
        episodes
        duration
        status
        season
        seasonYear
        averageScore
        description(asHtml: false)
        coverImage { large extraLarge }
        bannerImage
        genres
        trailer { id site }
        studios(isMain: true) { nodes { name } }
        characters(perPage: 25, sort: [ROLE, RELEVANCE, ID]) {
          edges {
            role
            voiceActors(language: JAPANESE, sort: RELEVANCE) {
              id
              name { full }
              image { large medium }
            }
            node {
              id
              name { full }
              image { large medium }
            }
          }
        }
        staff(perPage: 20, sort: RELEVANCE) {
          edges {
            role
            node {
              id
              name { full }
              image { large medium }
            }
          }
        }
        recommendations(sort: RATING_DESC, perPage: 6) {
          nodes {
            mediaRecommendation {
              id
              title { english romaji }
              coverImage { large }
              format
            }
          }
        }
        relations {
          edges {
            relationType
            node {
              id
              title { english romaji native }
              format
              episodes
              coverImage { large extraLarge }
              seasonYear
              averageScore
            }
          }
        }
      }
    }
  `;

  try {
    const res = await axios.post('https://graphql.anilist.co', {
      query: gqlQuery,
      variables: { id: numId }
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 6000
    });

    const m = res.data?.data?.Media;
    if (!m) return null;

    const titleEnglish = m.title?.english;
    const titleRomaji = m.title?.romaji;
    const fullTitle = titleEnglish || titleRomaji || 'Unknown Anime';

    const sMatch = fullTitle.match(/season\s*(\d+)|(\d+)(?:nd|rd|th)?\s*season/i);
    const detectedSeason = sMatch ? parseInt(sMatch[1] || sMatch[2], 10) : 1;

    // Resolve TMDB ID for video streaming
    const tmdbMapping = await getTmdbIdForAnime(titleRomaji, titleEnglish, m.seasonYear?.toString());

    // If mapped to a TMDB TV show, fetch full TV details to get all seasons and runtime
    let tmdbTvData = null;
    if (tmdbMapping?.id && tmdbMapping.type === 'tv' && isTmdbConfigured()) {
      try {
        const tmdbTvRes = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbMapping.id}?api_key=${TMDB_API_KEY}`, { timeout: 4000 });
        tmdbTvData = tmdbTvRes.data;
      } catch (err) {
        console.warn('TMDB TV lookup in getAniListMediaDetail failed:', err.message);
      }
    }

    // Map relations (sequels, prequels, movies, OVAs, ONAs, manga)
    const relatedFranchise = [];
    if (m.relations?.edges?.length) {
      m.relations.edges.forEach(edge => {
        const node = edge.node;
        const relTitle = node.title?.english || node.title?.romaji || 'Related Title';
        const isManga = node.format === 'MANGA';
        relatedFranchise.push({
          id: isManga ? node.id.toString() : `al_${node.id}`,
          title: relTitle,
          badge: edge.relationType,
          type: isManga ? 'manga' : 'anime',
          release_date: node.seasonYear ? node.seasonYear.toString() : '',
          poster_path: node.coverImage?.extraLarge || node.coverImage?.large,
          overview: ''
        });
      });
    }

    const epCount = m.episodes || 14;
    const currentPoster = m.coverImage?.extraLarge || m.coverImage?.large;

    // Build complete multi-season list for Season Filter dropdown & episodes
    const seasonsMap = new Map();

    // 1. If TMDB has seasons (Season 1, Season 2, etc.), populate all of them
    if (tmdbTvData?.seasons && tmdbTvData.seasons.length > 0) {
      tmdbTvData.seasons.forEach((s) => {
        if (s.season_number > 0) {
          seasonsMap.set(s.season_number, {
            id: s.id,
            season_number: s.season_number,
            name: s.name || `Season ${s.season_number}`,
            episode_count: s.episode_count || epCount,
            poster_path: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : currentPoster,
            air_date: s.air_date || (m.seasonYear ? `${m.seasonYear}-01-01` : '')
          });
        }
      });
    }

    // 2. Ensure current anime entry is placed at detectedSeason
    const activeSeasonObj = seasonsMap.get(detectedSeason) || {
      id: m.id,
      season_number: detectedSeason,
      name: fullTitle.includes(`Season ${detectedSeason}`) ? fullTitle : `Season ${detectedSeason}`,
      episode_count: epCount,
      poster_path: currentPoster,
      air_date: m.seasonYear ? `${m.seasonYear}-01-01` : ''
    };
    activeSeasonObj.id = m.id;
    activeSeasonObj.poster_path = currentPoster;
    if (m.episodes) activeSeasonObj.episode_count = m.episodes;
    seasonsMap.set(detectedSeason, activeSeasonObj);

    // 3. Scan AniList relations for sequels, prequels and other seasons
    if (m.relations?.edges?.length) {
      m.relations.edges.forEach((edge) => {
        const node = edge.node;
        if (!node || node.format === 'MANGA') return;
        const relTitle = node.title?.english || node.title?.romaji || '';
        const relMatch = relTitle.match(/season\s*(\d+)|(\d+)(?:nd|rd|th)?\s*season/i);
        let sNum = relMatch ? parseInt(relMatch[1] || relMatch[2], 10) : null;

        if (!sNum) {
          if (edge.relationType === 'SEQUEL') {
            sNum = detectedSeason + 1;
          } else if (edge.relationType === 'PREQUEL' && detectedSeason > 1) {
            sNum = detectedSeason - 1;
          }
        }

        if (sNum && !seasonsMap.has(sNum)) {
          seasonsMap.set(sNum, {
            id: `al_${node.id}`,
            season_number: sNum,
            name: relTitle || `Season ${sNum}`,
            episode_count: node.episodes || 12,
            poster_path: node.coverImage?.extraLarge || node.coverImage?.large,
            air_date: node.seasonYear ? `${node.seasonYear}-01-01` : ''
          });
        }
      });
    }

    // 4. If current is Season > 1 but Season 1 wasn't mapped, ensure Season 1 exists
    if (detectedSeason > 1 && !seasonsMap.has(1)) {
      seasonsMap.set(1, {
        id: 1,
        season_number: 1,
        name: 'Season 1',
        episode_count: 12,
        poster_path: currentPoster,
        air_date: ''
      });
    }

    const seasons = Array.from(seasonsMap.values()).sort((a, b) => a.season_number - b.season_number);

    const cast = [];
    const seenPersonKeys = new Set();

    (m.characters?.edges || []).forEach(c => {
      const va = c.voiceActors?.[0] || null;
      const charName = c.node?.name?.full || 'Character';
      if (va?.id) {
        const key = `al_staff_${va.id}`;
        if (!seenPersonKeys.has(key)) {
          seenPersonKeys.add(key);
          cast.push({
            id: String(va.id),
            source: 'anilist_staff',
            name: va.name?.full || charName,
            character: va.name?.full ? `Voice of ${charName}` : (c.role || 'Voice Actor'),
            role_type: 'Cast',
            profile_path: c.node?.image?.large || va.image?.large || c.node?.image?.medium || null,
            person_avatar: va.image?.large || va.image?.medium || null
          });
        }
      } else if (c.node?.id) {
        cast.push({
          id: String(c.node.id),
          source: 'anilist_char',
          name: charName,
          character: c.role || 'Character',
          role_type: 'Cast',
          profile_path: c.node?.image?.large || c.node?.image?.medium || null
        });
      }
    });

    (m.staff?.edges || []).forEach(s => {
      if (!s.node?.id) return;
      const key = `al_staff_${s.node.id}`;
      if (seenPersonKeys.has(key)) return;
      seenPersonKeys.add(key);
      cast.push({
        id: String(s.node.id),
        source: 'anilist_staff',
        name: s.node.name?.full || 'Staff',
        character: s.role || 'Staff',
        role_type: 'Crew',
        profile_path: s.node.image?.large || s.node.image?.medium || null
      });
    });

    const recommendations = (m.recommendations?.nodes || [])
      .filter(r => r.mediaRecommendation)
      .map(r => ({
        id: `al_${r.mediaRecommendation.id}`,
        title: r.mediaRecommendation.title?.english || r.mediaRecommendation.title?.romaji || 'Anime',
        poster_path: r.mediaRecommendation.coverImage?.large,
        media_type: 'anime'
      }));

    const animeDuration = m.duration || (tmdbTvData?.episode_run_time && tmdbTvData.episode_run_time[0]) || null;

    const details = {
      id: `al_${m.id}`,
      external_media_id: `al_${m.id}`,
      tmdb_id: tmdbMapping?.id || null,
      title: fullTitle,
      overview: m.description ? m.description.replace(/<[^>]*>/g, '') : '',
      poster_path: currentPoster,
      backdrop_path: m.bannerImage || currentPoster,
      release_date: m.seasonYear ? `${m.seasonYear}-01-01` : '',
      vote_average: m.averageScore ? (m.averageScore / 10).toFixed(1) : 8.0,
      genres: (m.genres || []).map(g => ({ id: g, name: g })),
      media_type: 'anime',
      format: m.format === 'TV' && detectedSeason > 1 ? `Season ${detectedSeason}` : (m.format === 'MOVIE' ? 'Movie' : (m.format || 'Anime')),
      episodes_count: epCount,
      duration: animeDuration,
      runtime: animeDuration,
      number_of_seasons: seasons.filter(s => s.season_number > 0).length || 1,
      number_of_episodes: tmdbTvData?.number_of_episodes || m.episodes || null,
      default_season: detectedSeason,
      seasons,
      related_franchise: relatedFranchise,
      youtube_trailer: m.trailer?.site?.toLowerCase() === 'youtube' ? m.trailer.id : null,
      cast,
      recommendations,
      video_url: null,
      embed_url: tmdbMapping?.id
        ? (m.format === 'MOVIE'
            ? `https://vidsrc.to/embed/movie/${tmdbMapping.id}`
            : `https://vidsrc.to/embed/tv/${tmdbMapping.id}/${detectedSeason}/1`)
        : null
    };

    anilistDetailCache.set(numId, { data: details, timestamp: Date.now() });
    return details;
  } catch (err) {
    console.warn('AniList getMediaDetail error:', err.message);
    return null;
  }
};

// Safely normalize TMDB relative poster/backdrop paths to full CDN URLs
export const normalizePosterUrl = (posterPath, backdropPath) => {
  const clean = (p) => {
    if (!p || typeof p !== 'string' || p.trim() === '') return null;
    const s = p.trim();
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')) return s;
    return `https://image.tmdb.org/t/p/w500${s.startsWith('/') ? '' : '/'}${s}`;
  };
  return clean(posterPath) || clean(backdropPath) || null;
};

// Expand TV series results into multi-season entries if number_of_seasons > 1
const expandTvSeasons = async (tvResults) => {
  if (!tvResults || tvResults.length === 0) return [];
  const expanded = [];
  const topShows = tvResults.slice(0, 6);
  const remainingShows = tvResults.slice(6);

  const detailPromises = topShows.map(async (r) => {
    const normPoster = normalizePosterUrl(r.poster_path, r.backdrop_path);
    const normBackdrop = normalizePosterUrl(r.backdrop_path, r.poster_path);
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/tv/${r.id}?api_key=${TMDB_API_KEY}`, { timeout: 3500 });
      const d = res.data;
      const episodeRuntime = (d.episode_run_time && d.episode_run_time[0]) || d.last_episode_to_air?.runtime || null;
      if (d.seasons && d.seasons.length > 1) {
        const seasonEntries = [];
        d.seasons.forEach((s) => {
          if (s.season_number > 0) {
            seasonEntries.push({
              id: `${r.id}_s${s.season_number}`,
              external_media_id: r.id.toString(),
              tmdb_id: r.id.toString(),
              title: s.season_number === 1 ? (r.name || r.title) : `${r.name || r.title} Season ${s.season_number}`,
              overview: s.overview || r.overview || '',
              poster_path: normalizePosterUrl(s.poster_path, normPoster),
              backdrop_path: normBackdrop,
              release_date: s.air_date || r.first_air_date || '',
              vote_average: r.vote_average || 0,
              genre_ids: r.genre_ids || [],
              media_type: 'tv',
              format: `Season ${s.season_number}`,
              episodes: s.episode_count || null,
              season_number: s.season_number,
              runtime: episodeRuntime,
              duration: episodeRuntime
            });
          }
        });
        return seasonEntries.length > 0 ? seasonEntries : [{
          ...r,
          id: r.id.toString(),
          title: r.name || r.title,
          poster_path: normPoster,
          backdrop_path: normBackdrop,
          media_type: 'tv',
          runtime: episodeRuntime,
          duration: episodeRuntime
        }];
      }
      return [{
        ...r,
        id: r.id.toString(),
        title: r.name || r.title,
        poster_path: normPoster,
        backdrop_path: normBackdrop,
        media_type: 'tv',
        runtime: episodeRuntime,
        duration: episodeRuntime
      }];
    } catch {
      return [{
        ...r,
        id: r.id.toString(),
        title: r.name || r.title,
        poster_path: normPoster,
        backdrop_path: normBackdrop,
        media_type: 'tv'
      }];
    }
  });

  const resolved = await Promise.all(detailPromises);
  resolved.forEach(items => expanded.push(...items));
  remainingShows.forEach(r => {
    expanded.push({
      ...r,
      id: r.id.toString(),
      title: r.name || r.title,
      poster_path: normalizePosterUrl(r.poster_path, r.backdrop_path),
      backdrop_path: normalizePosterUrl(r.backdrop_path, r.poster_path),
      media_type: 'tv'
    });
  });
  return expanded;
};

// Expand movie results with franchise collection sequels/prequels
const expandMovieCollections = async (movieResults) => {
  if (!movieResults || movieResults.length === 0) return [];
  const expanded = [];
  const seenIds = new Set();

  const topMovies = movieResults.slice(0, 6);
  const remainingMovies = movieResults.slice(6);

  const colPromises = topMovies.map(async (m) => {
    const normPoster = normalizePosterUrl(m.poster_path, m.backdrop_path);
    const normBackdrop = normalizePosterUrl(m.backdrop_path, m.poster_path);
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/movie/${m.id}?api_key=${TMDB_API_KEY}`, { timeout: 3500 });
      const mRuntime = res.data?.runtime || null;
      const baseMovie = {
        ...m,
        id: m.id.toString(),
        title: m.title || m.name,
        poster_path: normPoster,
        backdrop_path: normBackdrop,
        media_type: 'movie',
        runtime: mRuntime,
        duration: mRuntime
      };
      const col = res.data?.belongs_to_collection;
      if (col && col.id) {
        const colRes = await axios.get(`${TMDB_BASE_URL}/collection/${col.id}?api_key=${TMDB_API_KEY}`, { timeout: 3500 });
        const parts = colRes.data?.parts || [];
        const extraParts = parts.filter(p => p.id.toString() !== m.id.toString()).map(p => ({
          id: p.id.toString(),
          external_media_id: p.id.toString(),
          title: p.title || p.name,
          overview: p.overview || '',
          poster_path: normalizePosterUrl(p.poster_path, p.backdrop_path),
          backdrop_path: normalizePosterUrl(p.backdrop_path, p.poster_path),
          release_date: p.release_date || '',
          vote_average: p.vote_average || 0,
          genre_ids: p.genre_ids || [],
          media_type: 'movie',
          format: 'Movie',
          runtime: null,
          duration: null
        }));
        return [baseMovie, ...extraParts];
      }
      return [baseMovie];
    } catch {
      return [{
        ...m,
        id: m.id.toString(),
        title: m.title || m.name,
        poster_path: normPoster,
        backdrop_path: normBackdrop,
        media_type: 'movie'
      }];
    }
  });

  const resolved = await Promise.all(colPromises);
  resolved.forEach(group => {
    group.forEach(it => {
      if (!seenIds.has(it.id.toString())) {
        seenIds.add(it.id.toString());
        expanded.push(it);
      }
    });
  });

  remainingMovies.forEach(it => {
    if (!seenIds.has(it.id.toString())) {
      seenIds.add(it.id.toString());
      expanded.push({
        ...it,
        id: it.id.toString(),
        title: it.title || it.name,
        poster_path: normalizePosterUrl(it.poster_path, it.backdrop_path),
        backdrop_path: normalizePosterUrl(it.backdrop_path, it.poster_path),
        media_type: 'movie'
      });
    }
  });

  return expanded;
};



let dashboardCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 min cache — TMDB trending refreshes multiple times/day
let dashboardPromise = null;

// 1. Get Trending/Dashboard Grid Content
export const getTrending = async (req, res) => {
  const forceRefresh = req.query.refresh === '1';
  try {
    // Return cached dashboard data if available and fresh (unless force-refresh requested)
    if (!forceRefresh && dashboardCache && (Date.now() - lastCacheTime < CACHE_DURATION)) {
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
    let ongoingMovies = [];
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
      poster_path: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      release_date: m.release_date || '',
      vote_average: m.vote_average,
      media_type: 'movie',
      runtime: m.runtime || null,
      duration: m.runtime || null
    });

    const mapTv = t => ({
      id: t.id.toString(),
      title: t.name,
      overview: t.overview,
      poster_path: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : null,
      release_date: t.first_air_date || '',
      vote_average: t.vote_average,
      media_type: 'tv',
      runtime: t.runtime || (t.episode_run_time && t.episode_run_time[0]) || null,
      duration: t.runtime || (t.episode_run_time && t.episode_run_time[0]) || null
    });

    if (isTmdbConfigured()) {
      try {
        const todayObj = new Date();
        const today = todayObj.toISOString().split('T')[0];
        const nextMonth = new Date(todayObj.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const lastMonth = new Date(todayObj.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [
          trendingMoviesRes, trendingTvRes, ongoingTvRes, airingTodayTvRes, upcomingMoviesRes, upcomingTvRes,
          trendingAnimeRes, ongoingAnimeRes, upcomingAnimeRes, airingTodayAnimeRes, nowPlayingMoviesRes,
          airingTodayTvPage2, airingTodayAnimePage2
        ] = await Promise.all([
          // Trending: refreshes daily by TMDB
          axios.get(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`),
          axios.get(`${TMDB_BASE_URL}/trending/tv/day?api_key=${TMDB_API_KEY}`),
          // Ongoing TV: on_the_air = currently airing in next 7 days
          axios.get(`${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}`),
          // Schedule: airing TODAY (Page 1 & Page 2 for rich weekly schedule)
          axios.get(`${TMDB_BASE_URL}/tv/airing_today?api_key=${TMDB_API_KEY}&page=1`),
          // Upcoming movies
          axios.get(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}`),
          // Upcoming TV shows (first air date in future)
          axios.get(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&first_air_date.gte=${today}&sort_by=popularity.desc`),
          // Anime: Trending (weekly popular Japanese animation)
          axios.get(`${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16`),
          // Ongoing Anime: currently on_the_air + Japanese animation genre
          axios.get(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&air_date.gte=${lastMonth}&air_date.lte=${nextMonth}&with_status=0&sort_by=popularity.desc`),
          // Upcoming Anime: first_air_date in the future
          axios.get(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&first_air_date.gte=${today}&sort_by=first_air_date.asc`),
          // Airing Anime: airing this month (Page 1 & 2 for full 7-day calendar)
          axios.get(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&air_date.gte=${today}&air_date.lte=${nextMonth}&sort_by=popularity.desc&page=1`),
          // Now playing movies
          axios.get(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}`),
          axios.get(`${TMDB_BASE_URL}/tv/airing_today?api_key=${TMDB_API_KEY}&page=2`).catch(() => ({ data: { results: [] } })),
          axios.get(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&air_date.gte=${today}&air_date.lte=${nextMonth}&sort_by=popularity.desc&page=2`).catch(() => ({ data: { results: [] } }))
        ]);

        tmdbMovies = trendingMoviesRes.data.results.slice(0, 20).map(mapMovie);
        // Exclude Japanese animation from TV shows so they don't get mixed up!
        tmdbTv = trendingTvRes.data.results.filter(item => !isAnimeItem(item)).slice(0, 20).map(mapTv);
        ongoingMovies = nowPlayingMoviesRes.data.results.slice(0, 20).map(mapMovie);
        upcomingMovies = upcomingMoviesRes.data.results.slice(0, 20).map(mapMovie);
        upcomingTv = upcomingTvRes.data.results.filter(item => !isAnimeItem(item)).slice(0, 20).map(mapTv);
        
        trendingAnime = trendingAnimeRes.data.results
          .filter(isAnimeItem)
          .slice(0, 20)
          .map(a => ({...mapTv(a), media_type: 'anime'}));
        upcomingAnime = upcomingAnimeRes.data.results
          .filter(isAnimeItem)
          .slice(0, 20)
          .map(a => ({...mapTv(a), media_type: 'anime'}));

        // Combine Page 1 and Page 2 for TV and Anime schedules, strictly separating them
        const allAiringTv = [
          ...(airingTodayTvRes.data.results || []),
          ...(airingTodayTvPage2.data?.results || [])
        ].filter(item => !isAnimeItem(item));

        const allAiringAnime = [
          ...(airingTodayAnimeRes.data.results || []),
          ...(airingTodayAnimePage2.data?.results || [])
        ].filter(isAnimeItem);

        // Enhance ongoing and scheduled TV/Anime shows with EXACT broadcast days from TMDB details
        const tvListToEnrich = [
          ...ongoingTvRes.data.results.filter(item => !isAnimeItem(item)).slice(0, 15), 
          ...allAiringTv.slice(0, 25),
          ...ongoingAnimeRes.data.results.filter(isAnimeItem).slice(0, 15),
          ...allAiringAnime.slice(0, 25)
        ];
        const uniqueTvIds = [...new Set(tvListToEnrich.map(t => t.id))];
        
        const tvDetailsPromises = uniqueTvIds.map(id => 
          axios.get(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`).catch(() => null)
        );
        const tvDetailsResponses = await Promise.all(tvDetailsPromises);
        
        const daysOfWeek = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
        const tvAirDays = {};
        tvDetailsResponses.forEach(res => {
          if (res && res.data) {
            // Prefer next_episode_to_air for accurate airing day, fallback to last_episode_to_air
            const ep = res.data.next_episode_to_air || res.data.last_episode_to_air;
            if (ep && ep.air_date) {
              const date = new Date(ep.air_date);
              if (!isNaN(date.getTime())) {
                tvAirDays[res.data.id] = daysOfWeek[date.getDay()];
              }
            }
          }
        });

        const mapTvWithDay = item => {
          const mapped = mapTv(item);
          const day = tvAirDays[item.id] || daysOfWeek[(parseInt(item.id, 10) || 0) % 7];
          mapped.broadcast_day = day;
          mapped.broadcast = `Airs every ${day.slice(0, -1)}`;
          return mapped;
        };

        const mapAnimeWithDay = item => {
          const mapped = mapTv(item);
          mapped.media_type = 'anime';
          const day = tvAirDays[item.id] || daysOfWeek[(parseInt(item.id, 10) || 0) % 7];
          mapped.broadcast_day = day;
          mapped.broadcast = `Airs every ${day.slice(0, -1)}`;
          return mapped;
        };

        ongoingTv = ongoingTvRes.data.results.filter(item => !isAnimeItem(item)).slice(0, 20).map(mapTvWithDay);
        airingTodayTv = allAiringTv.slice(0, 35).map(mapTvWithDay);
        ongoingAnime = ongoingAnimeRes.data.results.filter(isAnimeItem).slice(0, 20).map(mapAnimeWithDay);
        scheduleAnime = allAiringAnime.slice(0, 35).map(mapAnimeWithDay);
      } catch (err) {
        console.warn('TMDB dashboard fetch failed:', err.message);
        // No mock fallback — leave arrays empty
      }
    } else {
      console.warn('TMDB API key not configured. Dashboard will show empty sections.');
      // No mock fallback — leave arrays empty
    }

    // C. Fetch Manga (MangaDex API metadata + browser-safe AniList/Kitsu/MU covers)
    let trendingManga = [];
    let ongoingManga = [];
    let latestManga = [];

    try {
      const [trendingMangaRes, ongoingMangaRes, latestMangaRes] = await Promise.all([
        axios.get('https://api.mangadex.org/manga?limit=25&order[followedCount]=desc'),
        axios.get('https://api.mangadex.org/manga?limit=25&status[]=ongoing&order[followedCount]=desc'),
        axios.get('https://api.mangadex.org/manga?limit=25&availableTranslatedLanguage[]=en&order[latestUploadedChapter]=desc')
      ]);

      const trendingRaw = trendingMangaRes.data?.data || [];
      const ongoingRaw = ongoingMangaRes.data?.data || [];
      const latestRaw = latestMangaRes.data?.data || [];

      // Warm cover cache across all 3 lists in a single batched lookup
      await resolveMangaCovers([...trendingRaw, ...ongoingRaw, ...latestRaw]);

      const [tAll, oAll, lAll] = await Promise.all([
        formatMangaDexItems(trendingRaw, { dateMode: 'created' }),
        formatMangaDexItems(ongoingRaw, { dateMode: 'created' }),
        formatMangaDexItems(latestRaw, { dateMode: 'latest' })
      ]);

      const keepCovered = (arr) => {
        const covered = arr.filter((item) => isValidCoverUrl(item.poster_path));
        return (covered.length > 0 ? covered : arr).slice(0, 20);
      };

      trendingManga = keepCovered(tAll);
      ongoingManga = keepCovered(oAll);
      latestManga = keepCovered(lAll);
    } catch (err) {
      console.error('MangaDex API dashboard query error:', err.message);
      const fallback = [
        {
          id: 'f84b6f89-8d77-4c3e-a4b5-ea9ef076d54d',
          title: 'Sample Manga (MangaDex Down)',
          overview: 'A beautiful manga placeholder. Please check back when MangaDex returns.',
          poster_path: null,
          release_date: '2026',
          vote_average: 8.0,
          media_type: 'manga'
        }
      ];
      trendingManga = fallback;
      ongoingManga = fallback;
      latestManga = fallback;
    }

    // D. Fetch Trending Music (Live Daily Hits)
    let trendingMusic = [];
    try {
      trendingMusic = await getTrendingMusicDirect(12);
    } catch (err) {
      console.warn('Trending music fetch in dashboard failed:', err.message);
    }

    // Merge Dashboard response
    const dashboardData = {
      trending: {
        movies: tmdbMovies,
        tv: tmdbTv,
        music: trendingMusic,
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
      },
      _fetchedAt: new Date().toISOString()
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
    res.status(500).json({ error: 'Failed to fetch catalog content.' });
  }
};

export const searchMedia = async (req, res) => {
  const { query, type = 'movie', genre, country, language, sort, year } = req.query;
  const page = parseInt(req.query.page || '1', 10);
  const today = new Date().toISOString().split('T')[0];

  // Map language codes
  const langToIso = {
    'hindi': 'hi',
    'kpop': 'ko',
    'korean': 'ko',
    'anime': 'ja',
    'japanese': 'ja',
    'english': 'en',
    'kannada': 'kn',
    'malayalam': 'ml',
    'telugu': 'te',
    'tamil': 'ta',
    'marathi': 'mr',
    'rock': 'en'
  };

  const selectedIso = language ? (langToIso[language.toLowerCase()] || language.toLowerCase()) : null;

  // Determine TMDB sort_by value:
  const getSortBy = (mediaType) => {
    if (sort === 'trending') return 'popularity.desc';
    if (sort === 'top_rated') return 'vote_average.desc';
    if (sort === 'latest') {
      return mediaType === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc';
    }
    // Default to popularity for best discovery experience
    return 'popularity.desc';
  };

  try {
    let results = [];

    if (type === 'movie' || type === 'tv' || type === 'anime') {
      if (isTmdbConfigured()) {
        try {
          const hasQuery = query && query.trim() !== '';
          const tmdbType = type === 'anime' ? 'tv' : type;
          
          if (!hasQuery) {
            // Discover Mode with dedicated live endpoints for ongoing, upcoming, latest, trending, top_rated
            let url = '';
            const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            if (sort === 'ongoing') {
              if (type === 'anime') {
                url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&air_date.gte=${lastMonth}&air_date.lte=${nextMonth}&with_status=0&sort_by=popularity.desc&page=${page}`;
              } else if (tmdbType === 'tv') {
                url = `${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=${page}`;
              } else {
                url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`;
              }
            } else if (sort === 'upcoming') {
              if (type === 'anime') {
                url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&first_air_date.gte=${today}&sort_by=first_air_date.asc&page=${page}`;
              } else if (tmdbType === 'tv') {
                url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&first_air_date.gte=${today}&sort_by=popularity.desc&page=${page}`;
              } else {
                url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`;
              }
            } else if (sort === 'trending') {
              if (type === 'anime') {
                url = `${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&page=${page}`;
              } else {
                url = `${TMDB_BASE_URL}/trending/${tmdbType}/day?api_key=${TMDB_API_KEY}&page=${page}`;
              }
            } else if (sort === 'top_rated') {
              url = `${TMDB_BASE_URL}/discover/${tmdbType}?api_key=${TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`;
            } else {
              // 'latest' or default: currently airing or newly released
              if (type === 'anime') {
                url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&air_date.gte=${lastMonth}&air_date.lte=${today}&sort_by=popularity.desc&page=${page}`;
              } else if (tmdbType === 'tv') {
                url = `${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=${page}`;
              } else {
                url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`;
              }
            }

            // If user applied custom filters (year, genre, language, country), convert to discover URL
            if (year || genre || selectedIso || country) {
              const sortBy = getSortBy(tmdbType);
              url = `${TMDB_BASE_URL}/discover/${tmdbType}?api_key=${TMDB_API_KEY}&sort_by=${sortBy}&page=${page}`;

              if (year && !isNaN(parseInt(year, 10))) {
                const y = parseInt(year, 10);
                if (tmdbType === 'movie') url += `&primary_release_year=${y}`;
                else url += `&first_air_date_year=${y}`;
              } else {
                if (sort === 'ongoing') {
                  url += `&air_date.gte=${lastMonth}&air_date.lte=${nextMonth}`;
                } else if (sort === 'upcoming') {
                  if (tmdbType === 'movie') url += `&primary_release_date.gte=${today}`;
                  else url += `&first_air_date.gte=${today}`;
                } else {
                  if (tmdbType === 'movie') url += `&primary_release_date.lte=${today}`;
                  else url += `&first_air_date.lte=${today}`;
                }
              }
              
              if (type === 'anime') {
                url += `&with_original_language=ja&with_genres=16`;
                if (genre) {
                  if (genre.startsWith('k_')) url += `&with_keywords=${genre.replace('k_', '')}`;
                  else if (genre.startsWith('g_')) url += `,${genre.replace('g_', '')}`;
                  else url += `,${genre}`;
                }
              } else {
                if (selectedIso) url += `&with_original_language=${selectedIso}`;
                if (genre) {
                  if (genre.startsWith('k_')) url += `&with_keywords=${genre.replace('k_', '')}`;
                  else if (genre.startsWith('g_')) url += `&with_genres=${genre.replace('g_', '')}`;
                  else url += `&with_genres=${genre}`;
                }
                if (country === 'IN') {
                  url += `&with_origin_country=IN&with_original_language=ta|te|kn|ml|hi|mr`;
                } else if (country) {
                  url += `&with_origin_country=${country}`;
                }
              }
            }
            
            const searchRes = await axios.get(url);
            let discoverResults = searchRes.data.results || [];
            
            // Strictly enforce separation: TV never contains anime, anime only contains anime
            if (type === 'anime') {
              discoverResults = discoverResults.filter(isAnimeItem);
            } else if (type === 'tv') {
              discoverResults = discoverResults.filter(r => !isAnimeItem(r));
            }
            
            results = discoverResults.map(r => ({
              id: r.id.toString(),
              title: r.title || r.name,
              overview: r.overview || '',
              poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : (r.backdrop_path ? `https://image.tmdb.org/t/p/w500${r.backdrop_path}` : null),
              release_date: r.release_date || r.first_air_date || '',
              vote_average: r.vote_average || 0,
              genre_ids: r.genre_ids || [],
              media_type: type
            }));
          } else {
            // Search Mode (Text query)
            if (type === 'anime') {
              // 1. ANIME: Search AniList for all seasons, sequels, prequels, movies, OVAs, ONAs, specials
              const aniListMatches = await searchAniListAnime(query, page);

              // 2. Concurrently search TMDB for Anime TV series and Anime Movies
              const [tmdbTvRes, tmdbMovieRes] = await Promise.all([
                axios.get(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query.trim())}&page=${page}`).catch(() => ({ data: {} })),
                axios.get(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query.trim())}&page=${page}`).catch(() => ({ data: {} }))
              ]);

              const tmdbTv = (tmdbTvRes.data?.results || []).filter(isAnimeItem);
              const tmdbMovies = (tmdbMovieRes.data?.results || []).filter(isAnimeItem);

              const merged = [...aniListMatches];
              const seenTitles = new Set(aniListMatches.map(m => (m.title || '').toLowerCase().trim()));

              [...tmdbTv, ...tmdbMovies].forEach(r => {
                const title = r.title || r.name || '';
                const clean = title.toLowerCase().trim();
                if (clean && !seenTitles.has(clean)) {
                  seenTitles.add(clean);
                  merged.push({
                    id: r.id.toString(),
                    title,
                    overview: r.overview || '',
                    poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : (r.backdrop_path ? `https://image.tmdb.org/t/p/w500${r.backdrop_path}` : null),
                    release_date: r.release_date || r.first_air_date || '',
                    vote_average: r.vote_average || 0,
                    genre_ids: r.genre_ids || [],
                    media_type: 'anime',
                    format: r.title ? 'Movie' : 'TV'
                  });
                }
              });

              results = merged;
            } else if (type === 'tv') {
              // TV Shows
              let url = `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query.trim())}&page=${page}`;
              if (year && !isNaN(parseInt(year, 10))) {
                url += `&first_air_date_year=${parseInt(year, 10)}`;
              }
              const searchRes = await axios.get(url);
              let combinedResults = (searchRes.data.results || []).filter(r => !isAnimeItem(r));

              if (selectedIso) {
                combinedResults = combinedResults.filter(r => r.original_language === selectedIso);
              }
              if (genre) {
                const gId = parseInt(genre.replace('k_', '').replace('g_', ''), 10);
                if (!isNaN(gId)) combinedResults = combinedResults.filter(r => r.genre_ids?.includes(gId));
              }
              if (country) {
                if (country === 'IN') {
                  const allowedLangs = ['ta', 'te', 'kn', 'ml', 'hi', 'mr'];
                  combinedResults = combinedResults.filter(r => r.origin_country?.includes('IN') || allowedLangs.includes(r.original_language));
                } else {
                  const countryToLang = { 'KR': 'ko', 'JP': 'ja', 'ES': 'es', 'FR': 'fr', 'CN': 'zh', 'IT': 'it', 'DE': 'de' };
                  const expectedLang = countryToLang[country];
                  combinedResults = combinedResults.filter(r => r.origin_country?.includes(country) || (expectedLang && r.original_language === expectedLang));
                }
              }

              // Expand TV series seasons so Season 1, Season 2, Season 3 appear as distinct cards
              results = await expandTvSeasons(combinedResults);
            } else {
              // Movies
              let url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query.trim())}&page=${page}`;
              if (year && !isNaN(parseInt(year, 10))) {
                url += `&primary_release_year=${parseInt(year, 10)}`;
              }
              const searchRes = await axios.get(url);
              let combinedResults = searchRes.data.results || [];

              if (selectedIso) {
                combinedResults = combinedResults.filter(r => r.original_language === selectedIso);
              }
              if (genre) {
                const gId = parseInt(genre.replace('k_', '').replace('g_', ''), 10);
                if (!isNaN(gId)) combinedResults = combinedResults.filter(r => r.genre_ids?.includes(gId));
              }
              if (country) {
                if (country === 'IN') {
                  const allowedLangs = ['ta', 'te', 'kn', 'ml', 'hi', 'mr'];
                  combinedResults = combinedResults.filter(r => r.origin_country?.includes('IN') || allowedLangs.includes(r.original_language));
                } else {
                  const countryToLang = { 'KR': 'ko', 'JP': 'ja', 'ES': 'es', 'FR': 'fr', 'CN': 'zh', 'IT': 'it', 'DE': 'de' };
                  const expectedLang = countryToLang[country];
                  combinedResults = combinedResults.filter(r => r.origin_country?.includes(country) || (expectedLang && r.original_language === expectedLang));
                }
              }

              // Expand movie collections so franchise sequels & prequels are included
              results = await expandMovieCollections(combinedResults);
            }

            // Sort search results if requested
            if (sort === 'latest') {
              results.sort((a, b) => {
                const dateA = new Date(a.release_date || '1900-01-01').getTime();
                const dateB = new Date(b.release_date || '1900-01-01').getTime();
                return dateB - dateA;
              });
            }
          }
        } catch (err) {
          console.warn('TMDB search/discover error:', err.message);
          results = [];
        }
      } else {
        console.warn('TMDB API key not configured. No search results available.');
        results = [];
      }
    } else if (type === 'manga') {
      try {
        results = await fetchMangaFeedWithCovers({
          query,
          mode: sort || 'latest',
          genre,
          year,
          page,
          dateMode: 'latest'
        });
      } catch (err) {
        console.error('Manga search error:', err.message);
        results = [];
      }
    }

    // Ensure every single search result has normalized poster and backdrop paths
    const normalizedResults = (results || []).map(item => {
      if (!item) return item;
      return {
        ...item,
        poster_path: normalizePosterUrl(item.poster_path, item.backdrop_path || item.cover || item.image || item.thumbnail),
        backdrop_path: normalizePosterUrl(item.backdrop_path, item.poster_path)
      };
    });

    res.json(normalizedResults);
  } catch (error) {
    console.error('Unified Search Error:', error);
    res.status(500).json({ error: 'Failed to search media catalog' });
  }
};

// In-memory caching to bypass external API rate limits (e.g. Jikan v4 limit of 3 req/sec)
const jikanCache = new Map();
const mangadexCache = new Map();

// 3. Get Media Detail
export const getMediaDetail = async (req, res) => {
  const { type, id } = req.params;

  if (type === 'music') {
    return getSongDetails(req, res);
  }

  // Intercept AniList Anime details
  if (id.startsWith('al_') || (type === 'anime' && isNaN(parseInt(id, 10)))) {
    const alId = id.replace('al_', '');
    const alDetail = await getAniListMediaDetail(alId);
    if (alDetail) {
      return res.json(alDetail);
    }
  }

  try {
    let details = null;

    if (type === 'movie' || type === 'tv' || type === 'anime') {
      if (isTmdbConfigured()) {
        try {
          const tmdbType = type === 'anime' ? 'tv' : type;
          const appendFields = tmdbType === 'tv'
            ? 'videos,recommendations,credits,aggregate_credits,keywords'
            : 'videos,recommendations,credits,keywords';
          const detailRes = await axios.get(`${TMDB_BASE_URL}/${tmdbType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=${appendFields}`);
          const d = detailRes.data;
          
          const trailer = d.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')?.key;
          const seenTmdbCastIds = new Set();
          const rawCastSource = tmdbType === 'tv' && d.aggregate_credits?.cast?.length
            ? [...d.aggregate_credits.cast, ...(d.credits?.cast || [])]
            : (d.credits?.cast || []);

          const tmdbCast = [];
          for (const c of rawCastSource) {
            if (!c?.id) continue;
            const pid = String(c.id);
            if (seenTmdbCastIds.has(pid)) continue;
            seenTmdbCastIds.add(pid);
            const charLabel = c.character || c.roles?.[0]?.character || 'Actor';
            tmdbCast.push({
              id: pid,
              source: 'tmdb',
              name: c.name,
              character: charLabel,
              role_type: 'Cast',
              profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
            });
            if (tmdbCast.length >= 60) break;
          }

          const rawCrewSource = [
            ...(d.created_by || []).map(cr => ({ ...cr, job: 'Creator', priority: 100 })),
            ...((d.credits?.crew || []).map(cr => ({ ...cr, priority: 80 }))),
            ...((d.aggregate_credits?.crew || []).map(cr => ({
              ...cr,
              job: cr.jobs?.[0]?.job || cr.department || 'Crew',
              priority: 60
            })))
          ];

          const crewJobPriority = {
            Creator: 1,
            Director: 2,
            Screenplay: 3,
            Writer: 4,
            Story: 5,
            'Original Music Composer': 6,
            Music: 6,
            Producer: 7,
            'Executive Producer': 8,
            'Director of Photography': 9,
            Cinematography: 9,
            Editor: 10,
            'Production Design': 11,
            'Visual Effects Supervisor': 12
          };

          const crewMap = new Map();
          for (const cr of rawCrewSource) {
            if (!cr?.id) continue;
            const pid = String(cr.id);
            const jobName = cr.job || cr.department || 'Crew';
            const existing = crewMap.get(pid);
            if (existing) {
              if (jobName && !existing.jobs.includes(jobName)) {
                existing.jobs.push(jobName);
              }
            } else {
              crewMap.set(pid, {
                id: pid,
                source: 'tmdb',
                name: cr.name,
                jobs: [jobName],
                profile_path: cr.profile_path ? `https://image.tmdb.org/t/p/w185${cr.profile_path}` : null,
                rank: crewJobPriority[jobName] || 50
              });
            }
          }

          const tmdbCrew = Array.from(crewMap.values())
            .filter(cr => !seenTmdbCastIds.has(cr.id) || cr.rank <= 5)
            .sort((a, b) => a.rank - b.rank)
            .slice(0, 24)
            .map(cr => ({
              id: cr.id,
              source: 'tmdb',
              name: cr.name,
              character: cr.jobs.slice(0, 2).join(' • '),
              role_type: 'Crew',
              profile_path: cr.profile_path
            }));

          const cast = [...tmdbCast, ...tmdbCrew];
          const recommendations = d.recommendations?.results?.slice(0, 5).map(r => ({
            id: r.id.toString(),
            title: r.title || r.name,
            poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w200${r.poster_path}` : null,
            media_type: type
          })) || [];

          const tmdbGenres = (d.genres || []).map(g => ({
            id: g.id.toString(),
            name: g.name
          }));

          const keywordsList = d.keywords?.keywords || d.keywords?.results || [];
          const subGenreKeywords = {
            'ecchi': 'Ecchi',
            'harem': 'Harem',
            'isekai': 'Isekai',
            'mecha': 'Mecha',
            'supernatural': 'Supernatural',
            'slice of life': 'Slice of Life',
            'school': 'School Life',
            'school life': 'School Life',
            'high school': 'School Life',
            'magic': 'Magic',
            'martial arts': 'Martial Arts',
            'sports': 'Sports',
            'shounen': 'Shounen',
            'seinen': 'Seinen',
            'shoujo': 'Shoujo',
            'demons': 'Demons',
            'vampire': 'Vampire',
            'superhero': 'Superhero',
            'dark fantasy': 'Dark Fantasy',
            'cyberpunk': 'Cyberpunk',
            'psychological': 'Psychological'
          };

          const extraGenres = [];
          for (const kw of keywordsList) {
            const kwName = (kw.name || '').toLowerCase().trim();
            if (subGenreKeywords[kwName]) {
              const label = subGenreKeywords[kwName];
              if (!tmdbGenres.some(g => g.name.toLowerCase() === label.toLowerCase()) && !extraGenres.some(g => g.name === label)) {
                extraGenres.push({ id: `k_${kw.id}`, name: label });
              }
            }
          }

          const genres = [...tmdbGenres, ...extraGenres];

          const formattedSeasons = (d.seasons || []).map(s => ({
            id: s.id,
            season_number: s.season_number,
            name: s.name,
            overview: s.overview || '',
            poster_path: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : (d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null),
            air_date: s.air_date || '',
            episode_count: s.episode_count || 0
          }));

          // Ensure all seasons 1..d.number_of_seasons are represented in formattedSeasons
          if (type === 'tv' && d.number_of_seasons && d.number_of_seasons > 1) {
            const existingNums = new Set(formattedSeasons.map(s => s.season_number));
            for (let sNum = 1; sNum <= d.number_of_seasons; sNum++) {
              if (!existingNums.has(sNum)) {
                formattedSeasons.push({
                  id: `s_${d.id}_${sNum}`,
                  season_number: sNum,
                  name: `Season ${sNum}`,
                  overview: d.overview || '',
                  poster_path: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
                  air_date: '',
                  episode_count: Math.round((d.number_of_episodes || 12) / d.number_of_seasons) || 10
                });
              }
            }
            formattedSeasons.sort((a, b) => a.season_number - b.season_number);
          }

          let relatedFranchise = [];
          try {
            const rawTitle = d.title || d.name || '';
            const baseTitle = rawTitle.split(':')[0].split('-')[0].trim();

            // A. If movie belongs to an official TMDB collection (e.g. Spider-Man, Avengers, Batman, etc.)
            if (d.belongs_to_collection && d.belongs_to_collection.id) {
              try {
                const colRes = await axios.get(`${TMDB_BASE_URL}/collection/${d.belongs_to_collection.id}?api_key=${TMDB_API_KEY}`);
                const parts = (colRes.data?.parts || []).map(p => ({
                  id: p.id.toString(),
                  title: p.title || p.name,
                  badge: 'MOVIE',
                  type: 'movie',
                  release_date: p.release_date ? p.release_date.split('-')[0] : '',
                  poster_path: p.poster_path ? `https://image.tmdb.org/t/p/w500${p.poster_path}` : null,
                  overview: p.overview || ''
                }));
                parts.sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));
                relatedFranchise.push(...parts);
              } catch (colErr) {
                console.warn('Collection fetch error:', colErr.message);
              }
            }

            // B. Search by base title for franchise movies and series
            if (baseTitle && baseTitle.length >= 3) {
              const [tvSearch, movieSearch] = await Promise.all([
                axios.get(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(baseTitle)}`).catch(() => ({ data: {} })),
                axios.get(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(baseTitle)}`).catch(() => ({ data: {} }))
              ]);

              const existingIds = new Set(relatedFranchise.map(rf => rf.id.toString()));

              const matchedMovies = (movieSearch.data?.results || [])
                .filter(r => !existingIds.has(r.id.toString()) && r.id.toString() !== d.id.toString())
                .slice(0, 8)
                .map(r => ({
                  id: r.id.toString(),
                  title: r.title,
                  badge: 'MOVIE',
                  type: 'movie',
                  release_date: r.release_date ? r.release_date.split('-')[0] : '',
                  poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null,
                  overview: r.overview || ''
                }));

              const matchedTv = (tvSearch.data?.results || [])
                .filter(r => !existingIds.has(r.id.toString()) && r.id.toString() !== d.id.toString())
                .slice(0, 4)
                .map(r => ({
                  id: r.id.toString(),
                  title: r.name,
                  badge: 'TV',
                  type: 'tv',
                  release_date: r.first_air_date ? r.first_air_date.split('-')[0] : '',
                  poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null,
                  overview: r.overview || ''
                }));

              if (type === 'movie') {
                relatedFranchise.push(...matchedMovies, ...matchedTv);
              } else {
                relatedFranchise.push(...matchedTv, ...matchedMovies);
              }
            }

            // C. Fallback to recommendations if franchise list is still empty
            if (relatedFranchise.length === 0 && d.recommendations?.results && d.recommendations.results.length > 0) {
              const recs = d.recommendations.results.slice(0, 6).map(r => ({
                id: r.id.toString(),
                title: r.title || r.name,
                badge: r.media_type === 'tv' ? 'TV' : 'MOVIE',
                type: r.media_type || (type === 'tv' ? 'tv' : 'movie'),
                release_date: (r.release_date || r.first_air_date || '').split('-')[0],
                poster_path: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : null,
                overview: r.overview || ''
              }));
              relatedFranchise.push(...recs);
            }
          } catch (relErr) {
            console.warn('Franchise search error:', relErr.message);
          }

          const mediaDuration = type === 'movie'
            ? (d.runtime || null)
            : ((d.episode_run_time && d.episode_run_time[0]) || d.last_episode_to_air?.runtime || d.runtime || null);

          details = {
            id: d.id.toString(),
            title: d.title || d.name,
            overview: d.overview,
            poster_path: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : (d.backdrop_path ? `https://image.tmdb.org/t/p/w500${d.backdrop_path}` : null),
            backdrop_path: d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : null,
            release_date: d.release_date || d.first_air_date,
            vote_average: d.vote_average,
            genres,
            duration: mediaDuration,
            runtime: mediaDuration,
            number_of_seasons: type === 'tv' ? (d.number_of_seasons || (formattedSeasons.filter(s => s.season_number > 0).length || 1)) : null,
            number_of_episodes: d.number_of_episodes || null,
            seasons: (type === 'movie')
              ? []
              : (formattedSeasons.length > 0 ? formattedSeasons : [{
                  id: 1,
                  season_number: 1,
                  name: 'Season 1',
                  overview: d.overview || '',
                  poster_path: d.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : null,
                  air_date: d.first_air_date || d.release_date || '',
                  episode_count: d.number_of_episodes || 12
                }]),
            related_franchise: relatedFranchise,
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

      // If TMDB detail lookup failed or is not configured
      if (!details) {
        return res.status(404).json({ error: 'Media not found. TMDB may be temporarily unavailable.' });
      }
    } else if (type === 'manga') {
      try {
        // Check cache first (ignore stale entries without valid browser-accessible covers)
        if (mangadexCache.has(id)) {
          const cached = mangadexCache.get(id);
          if (!cached?.poster_path || isValidCoverUrl(cached.poster_path)) {
            return res.json(cached);
          }
        }

        // If numeric AniList ID (e.g. linked from Anime related_franchise), resolve via AniList Manga API
        if (/^\d+$/.test(String(id))) {
          const alMangaDetail = await getAniListMangaDetail(id);
          if (alMangaDetail) {
            mangadexCache.set(id, alMangaDetail);
            return res.json(alMangaDetail);
          }
        }

        const mangaRes = await axios.get(`https://api.mangadex.org/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`);
        const m = mangaRes.data.data;

        const coverMap = await resolveMangaCovers([m]);
        const resolved = coverMap.get(m.id) || { poster_path: null, backdrop_path: null };

        const title = m.attributes?.title?.en || Object.values(m.attributes?.title || {})[0] || 'Unknown Manga';
        const overview = m.attributes?.description?.en || 'No description available.';

        const mangaGenres = (m.attributes.tags || []).map(t => ({
          id: t.id,
          name: t.attributes?.name?.en || t.attributes?.name?.['ja-ro'] || 'Genre'
        }));
        if (m.attributes?.publicationDemographic) {
          const demo = m.attributes.publicationDemographic;
          const demoName = demo.charAt(0).toUpperCase() + demo.slice(1);
          mangaGenres.unshift({ id: `d_${demo}`, name: demoName });
        }

        details = {
          id: m.id,
          title,
          overview,
          poster_path: resolved.poster_path,
          backdrop_path: resolved.backdrop_path,
          release_date: m.attributes.createdAt?.split('T')[0],
          vote_average: 8.0,
          genres: mangaGenres,
          youtube_trailer: null,
          cast: (() => {
            const seenMdPeople = new Set();
            return (m.relationships || [])
              .filter(r => r.type === 'author' || r.type === 'artist')
              .reduce((acc, a) => {
                if (!a?.id || seenMdPeople.has(a.id)) return acc;
                seenMdPeople.add(a.id);
                acc.push({
                  id: a.id,
                  source: 'mangadex',
                  name: a.attributes?.name || (a.type === 'artist' ? 'Artist' : 'Author'),
                  character: a.type === 'artist' ? 'Artist' : 'Author',
                  role_type: 'Creator',
                  profile_path: null
                });
                return acc;
              }, []);
          })(),
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
    const sNum = parseInt(season_number, 10) || 1;

    // Handle AniList Anime episode requests
    if (id.startsWith('al_') || isNaN(parseInt(id, 10))) {
      const alId = id.replace('al_', '');
      const alDetail = await getAniListMediaDetail(alId);

      // If mapped to a TMDB TV show, try fetching official TMDB season first
      if (alDetail?.tmdb_id && isTmdbConfigured()) {
        try {
          const tmdbRes = await axios.get(`${TMDB_BASE_URL}/tv/${alDetail.tmdb_id}/season/${sNum}?api_key=${TMDB_API_KEY}`);
          if (tmdbRes.data?.episodes?.length > 0) {
            return res.json(tmdbRes.data);
          }
        } catch {
          // If TMDB does not have this specific season number, fall through to synthetic episodes
        }
      }

      // Generate episodes for this anime season based on season-specific episode count
      const targetSeason = alDetail?.seasons?.find(s => s.season_number === sNum);
      const epCount = targetSeason?.episode_count || alDetail?.episodes_count || 12;
      const seasonPoster = targetSeason?.poster_path || alDetail?.backdrop_path || alDetail?.poster_path || null;
      const seasonTitle = targetSeason?.name || (alDetail?.title ? `${alDetail.title} Season ${sNum}` : `Season ${sNum}`);

      const syntheticEpisodes = [];
      for (let ep = 1; ep <= epCount; ep++) {
        syntheticEpisodes.push({
          id: `al_${alId}_s${sNum}_e${ep}`,
          episode_number: ep,
          season_number: sNum,
          name: `Episode ${ep}`,
          overview: `${seasonTitle} Episode ${ep}`,
          still_path: seasonPoster,
          air_date: targetSeason?.air_date || alDetail?.release_date || ''
        });
      }

      return res.json({
        _id: id,
        name: seasonTitle,
        overview: targetSeason?.overview || alDetail?.overview || '',
        season_number: sNum,
        poster_path: seasonPoster,
        episodes: syntheticEpisodes
      });
    }

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

  // Non-UUID IDs (e.g., AniList upcoming manga with no MangaDex entry yet) have no chapter feed
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id || ''))) {
    return res.json([]);
  }

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
        },
        validateStatus: (s) => s < 500
      });

      if (feedRes.status === 400 || feedRes.status === 404 || !feedRes.data?.data) {
        break;
      }

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
    const healedList = await healMangaWatchlistCovers(list);
    res.json(healedList);
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
    const safePoster = (media_type !== 'manga' || isValidCoverUrl(poster_path)) ? (poster_path || null) : null;
    await db.query(
      'INSERT INTO user_watchlists (user_id, external_media_id, media_type, title, poster_path) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title = title',
      [req.user.id, external_media_id, media_type, title, safePoster]
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
      poster_path: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : (m.backdrop_path ? `https://image.tmdb.org/t/p/w500${m.backdrop_path}` : null),
      release_date: m.release_date || '',
      vote_average: m.vote_average,
      media_type: 'movie'
    });

    const mapTv = t => ({
      id: t.id.toString(),
      title: t.name,
      overview: t.overview,
      poster_path: t.poster_path ? `https://image.tmdb.org/t/p/w500${t.poster_path}` : (t.backdrop_path ? `https://image.tmdb.org/t/p/w500${t.backdrop_path}` : null),
      release_date: t.first_air_date || '',
      vote_average: t.vote_average,
      media_type: 'tv'
    });

    const mapAnime = item => ({
      id: item.mal_id.toString(),
      title: item.title_english || item.title,
      overview: item.synopsis,
      poster_path: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || null,
      release_date: item.aired?.string || '',
      vote_average: item.score,
      media_type: 'anime',
      broadcast: item.broadcast?.string || null
    });

    if ((type === 'movie' || type === 'tv' || type === 'anime') && isTmdbConfigured()) {
      let endpoint = '';
      const todayObj = new Date();
      const today = todayObj.toISOString().split('T')[0];
      const nextMonth = new Date(todayObj.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const lastMonth = new Date(todayObj.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const year = req.query.year && !isNaN(parseInt(req.query.year, 10)) ? parseInt(req.query.year, 10) : null;

      if (type === 'anime') {
        // Trending anime: weekly trending Japanese animation
        if (category === 'trending') {
          endpoint = `${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&page=${page}`;
        }
        // Ongoing: currently airing within 30-day window
        else if (category === 'ongoing') {
          endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&air_date.gte=${lastMonth}&air_date.lte=${nextMonth}&with_status=0&sort_by=popularity.desc&page=${page}`;
        }
        // Upcoming: first air date in the future, sorted by soonest first
        else if (category === 'upcoming') {
          endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&first_air_date.gte=${today}&sort_by=first_air_date.asc&page=${page}`;
        }
        // Schedule: airing this month (dynamic)
        else if (category === 'schedule') {
          endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&air_date.gte=${today}&air_date.lte=${nextMonth}&sort_by=popularity.desc&page=${page}`;
        }
        else {
          endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc&page=${page}`;
        }

        // Apply year filter if provided
        if (year) {
          if (!endpoint.includes('trending/')) {
            endpoint += `&first_air_date_year=${year}`;
          }
        }
        
        const tmdbRes = await axios.get(endpoint);
        results = tmdbRes.data.results
          .filter(isAnimeItem)
          .filter(item => !year || (item.first_air_date && item.first_air_date.startsWith(String(year))))
          .map(item => {
            const mapped = mapTv(item);
            mapped.media_type = 'anime';
            return mapped;
          });
      } else {
        // Trending: uses daily trending API for freshest data
        if (category === 'trending') endpoint = `${TMDB_BASE_URL}/trending/${type}/day?api_key=${TMDB_API_KEY}&page=${page}`;
        // Ongoing TV: on_the_air (currently airing in next 7 days)
        else if (category === 'ongoing' && type === 'tv') endpoint = `${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=${page}`;
        // Ongoing movies = now_playing (in theaters)
        else if (category === 'ongoing' && type === 'movie') endpoint = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`;
        // Upcoming movies
        else if (category === 'upcoming' && type === 'movie') endpoint = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`;
        // Upcoming TV
        else if (category === 'upcoming' && type === 'tv') endpoint = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&first_air_date.gte=${today}&sort_by=popularity.desc&page=${page}`;
        // Schedule = airing today
        else if (category === 'schedule' && type === 'tv') endpoint = `${TMDB_BASE_URL}/tv/airing_today?api_key=${TMDB_API_KEY}&page=${page}`;
        // Latest = now playing
        else if (category === 'latest') endpoint = `${TMDB_BASE_URL}/${type === 'movie' ? 'movie/now_playing' : 'tv/on_the_air'}?api_key=${TMDB_API_KEY}&page=${page}`;
        else endpoint = `${TMDB_BASE_URL}/discover/${type}?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}`;

        // Apply year filter if provided
        if (year && endpoint.includes('/discover/')) {
          if (type === 'movie') {
            endpoint += `&primary_release_year=${year}`;
          } else {
            endpoint += `&first_air_date_year=${year}`;
          }
        }
        
        const tmdbRes = await axios.get(endpoint);
        let rawResults = tmdbRes.data.results;
        
        // Post-filter by year if needed (for non-discover endpoints)
        if (year && !endpoint.includes('/discover/')) {
          rawResults = rawResults.filter(item => {
            const d = item.release_date || item.first_air_date || '';
            return d.startsWith(String(year));
          });
        }

        // Strictly exclude Japanese animation from TV catalog so they never get mixed up!
        if (type === 'tv') {
          rawResults = rawResults.filter(item => !isAnimeItem(item));
        }

        results = type === 'movie' ? rawResults.map(mapMovie) : rawResults.map(mapTv);
      }
    } 
    else if (type === 'manga') {
      const yearParam = req.query.year && !isNaN(parseInt(req.query.year, 10)) ? parseInt(req.query.year, 10) : '';
      results = await fetchMangaFeedWithCovers({
        mode: category || 'trending',
        year: yearParam,
        page,
        dateMode: 'year'
      });
    } else if (type === 'music') {
      const musicItems = await getTrendingMusicDirect(24);
      results = musicItems.map(s => ({
        ...s,
        poster_path: s.image,
        vote_average: '9.0',
        media_type: 'music'
      }));
    }

    res.json({ results, page, category, type });
  } catch (err) {
    console.error(`Catalog fetch error for ${category}/${type}:`, err.message);
    res.status(500).json({ error: 'Failed to fetch catalog', results: [] });
  }
};

const personCreditsCache = new Map();

// 8. Get Cast / Crew / Creator Filmography & All Related Credits
export const getPersonCredits = async (req, res) => {
  const { source, personId } = req.params;
  const fallbackName = (req.query.name || '').trim();
  const cacheKey = `${source}:${personId}:${fallbackName.toLowerCase()}`;

  try {
    if (personCreditsCache.has(cacheKey)) {
      const cached = personCreditsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
        return res.json(cached.data);
      }
    }

    let person = {
      id: personId,
      source,
      name: fallbackName || 'Cast & Crew',
      known_for_department: 'Artist',
      biography: '',
      birthday: '',
      place_of_birth: '',
      profile_path: null
    };
    let credits = [];

    if (source === 'tmdb' && isTmdbConfigured()) {
      let resolvedId = /^\d+$/.test(String(personId)) ? String(personId) : null;

      if (!resolvedId && fallbackName) {
        const searchRes = await axios.get(
          `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(fallbackName)}`,
          { timeout: 5000 }
        );
        const firstHit = searchRes.data?.results?.[0];
        if (firstHit?.id) resolvedId = String(firstHit.id);
      }

      if (resolvedId) {
        const pRes = await axios.get(
          `${TMDB_BASE_URL}/person/${resolvedId}?api_key=${TMDB_API_KEY}&append_to_response=combined_credits`,
          { timeout: 6500 }
        );
        const d = pRes.data;
        person = {
          id: String(d.id),
          source: 'tmdb',
          name: d.name || fallbackName || 'Cast & Crew',
          known_for_department: d.known_for_department || 'Acting',
          biography: d.biography || '',
          birthday: d.birthday || '',
          place_of_birth: d.place_of_birth || '',
          profile_path: d.profile_path ? `https://image.tmdb.org/t/p/w500${d.profile_path}` : null
        };

        const creditMap = new Map();
        const addCredit = (item, roleLabel) => {
          if (!item || (item.media_type !== 'movie' && item.media_type !== 'tv')) return;
          const mType = item.media_type === 'tv' && isAnimeItem(item) ? 'anime' : item.media_type;
          const key = `${mType}_${item.id}`;
          const existing = creditMap.get(key);
          if (existing) {
            if (roleLabel && !existing.roles.includes(roleLabel)) {
              existing.roles.push(roleLabel);
            }
            return;
          }
          creditMap.set(key, {
            id: String(item.id),
            title: item.title || item.name || 'Untitled',
            overview: item.overview || '',
            poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : (item.backdrop_path ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}` : null),
            backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}` : null,
            release_date: item.release_date || item.first_air_date || '',
            vote_average: item.vote_average || 0,
            media_type: mType,
            popularity: item.popularity || 0,
            roles: roleLabel ? [roleLabel] : []
          });
        };

        (d.combined_credits?.cast || []).forEach(c => addCredit(c, c.character || 'Cast'));
        (d.combined_credits?.crew || []).forEach(cr => addCredit(cr, cr.job || cr.department || 'Crew'));

        credits = Array.from(creditMap.values())
          .map(entry => ({
            ...entry,
            credit_role: entry.roles.slice(0, 2).join(' • ')
          }))
          .sort((a, b) => {
            const posterScore = (b.poster_path ? 1 : 0) - (a.poster_path ? 1 : 0);
            if (posterScore !== 0) return posterScore;
            return (b.popularity || 0) - (a.popularity || 0);
          });
      }
    } else if (source === 'anilist_staff') {
      const alId = parseInt(personId, 10);
      if (!isNaN(alId)) {
        const query = `
          query ($id: Int) {
            Staff(id: $id) {
              id
              name { full native }
              image { large }
              description(asHtml: false)
              primaryOccupations
              staffMedia(page: 1, perPage: 30, sort: POPULARITY_DESC) {
                edges {
                  staffRole
                  node {
                    id
                    type
                    title { english romaji }
                    coverImage { extraLarge large }
                    bannerImage
                    seasonYear
                    averageScore
                    episodes
                    format
                    description(asHtml: false)
                  }
                }
              }
              characterMedia(page: 1, perPage: 30, sort: POPULARITY_DESC) {
                edges {
                  characterRole
                  characters { name { full } }
                  node {
                    id
                    type
                    title { english romaji }
                    coverImage { extraLarge large }
                    bannerImage
                    seasonYear
                    averageScore
                    episodes
                    format
                    description(asHtml: false)
                  }
                }
              }
            }
          }
        `;
        const alRes = await axios.post(
          'https://graphql.anilist.co',
          { query, variables: { id: alId } },
          { headers: { 'Content-Type': 'application/json' }, timeout: 6500 }
        );
        const s = alRes.data?.data?.Staff;
        if (s) {
          person = {
            id: String(s.id),
            source: 'anilist_staff',
            name: s.name?.full || fallbackName || 'Staff & Voice Actor',
            known_for_department: (s.primaryOccupations || []).join(', ') || 'Anime Staff',
            biography: s.description || '',
            birthday: '',
            place_of_birth: '',
            profile_path: s.image?.large || null
          };

          const mediaMap = new Map();
          const pushAlNode = (node, roleLabel) => {
            if (!node?.id) return;
            const isManga = node.type === 'MANGA';
            const mappedId = isManga ? String(node.id) : `al_${node.id}`;
            const mappedType = isManga ? 'manga' : 'anime';
            const key = `${mappedType}_${mappedId}`;
            const existing = mediaMap.get(key);
            if (existing) {
              if (roleLabel && !existing.roles.includes(roleLabel)) existing.roles.push(roleLabel);
              return;
            }
            mediaMap.set(key, {
              id: mappedId,
              title: node.title?.english || node.title?.romaji || 'Untitled',
              overview: node.description ? node.description.replace(/<[^>]*>/g, '') : '',
              poster_path: node.coverImage?.extraLarge || node.coverImage?.large || null,
              backdrop_path: node.bannerImage || node.coverImage?.large || null,
              release_date: node.seasonYear ? `${node.seasonYear}-01-01` : '',
              vote_average: node.averageScore ? (node.averageScore / 10).toFixed(1) : 8.0,
              media_type: mappedType,
              episodes: node.episodes || null,
              format: node.format || (isManga ? 'Manga' : 'Anime'),
              roles: roleLabel ? [roleLabel] : []
            });
          };

          (s.characterMedia?.edges || []).forEach(e => {
            const charNames = (e.characters || []).map(c => c?.name?.full).filter(Boolean).join(', ');
            pushAlNode(e.node, charNames ? `Voice: ${charNames}` : e.characterRole || 'Voice Actor');
          });
          (s.staffMedia?.edges || []).forEach(e => {
            pushAlNode(e.node, e.staffRole || 'Staff');
          });

          credits = Array.from(mediaMap.values()).map(entry => ({
            ...entry,
            credit_role: entry.roles.slice(0, 2).join(' • ')
          }));
        }
      }
    } else if (source === 'anilist_char') {
      const charId = parseInt(personId, 10);
      if (!isNaN(charId)) {
        const query = `
          query ($id: Int) {
            Character(id: $id) {
              id
              name { full native }
              image { large }
              description(asHtml: false)
              media(page: 1, perPage: 28, sort: POPULARITY_DESC) {
                edges {
                  characterRole
                  node {
                    id
                    type
                    title { english romaji }
                    coverImage { extraLarge large }
                    bannerImage
                    seasonYear
                    averageScore
                    episodes
                    format
                    description(asHtml: false)
                  }
                }
              }
            }
          }
        `;
        const alRes = await axios.post(
          'https://graphql.anilist.co',
          { query, variables: { id: charId } },
          { headers: { 'Content-Type': 'application/json' }, timeout: 6500 }
        );
        const c = alRes.data?.data?.Character;
        if (c) {
          person = {
            id: String(c.id),
            source: 'anilist_char',
            name: c.name?.full || fallbackName || 'Character',
            known_for_department: 'Featured Character',
            biography: c.description || '',
            birthday: '',
            place_of_birth: '',
            profile_path: c.image?.large || null
          };
          const seen = new Set();
          credits = (c.media?.edges || []).reduce((acc, e) => {
            const node = e.node;
            if (!node?.id) return acc;
            const isManga = node.type === 'MANGA';
            const mappedId = isManga ? String(node.id) : `al_${node.id}`;
            const mappedType = isManga ? 'manga' : 'anime';
            const key = `${mappedType}_${mappedId}`;
            if (seen.has(key)) return acc;
            seen.add(key);
            acc.push({
              id: mappedId,
              title: node.title?.english || node.title?.romaji || 'Untitled',
              overview: node.description ? node.description.replace(/<[^>]*>/g, '') : '',
              poster_path: node.coverImage?.extraLarge || node.coverImage?.large || null,
              backdrop_path: node.bannerImage || node.coverImage?.large || null,
              release_date: node.seasonYear ? `${node.seasonYear}-01-01` : '',
              vote_average: node.averageScore ? (node.averageScore / 10).toFixed(1) : 8.0,
              media_type: mappedType,
              episodes: node.episodes || null,
              format: node.format || (isManga ? 'Manga' : 'Anime'),
              credit_role: e.characterRole || 'Character'
            });
            return acc;
          }, []);
        }
      }
    } else if (source === 'mangadex') {
      const [authorInfoRes, authoredRes, artistRes] = await Promise.all([
        axios.get(`https://api.mangadex.org/author/${personId}`, { timeout: 5000 }).catch(() => null),
        axios.get(`https://api.mangadex.org/manga?authors[]=${personId}&limit=24&includes[]=cover_art&order[followedCount]=desc`, { timeout: 6000 }).catch(() => ({ data: { data: [] } })),
        axios.get(`https://api.mangadex.org/manga?artists[]=${personId}&limit=24&includes[]=cover_art&order[followedCount]=desc`, { timeout: 6000 }).catch(() => ({ data: { data: [] } }))
      ]);

      const aData = authorInfoRes?.data?.data;
      if (aData) {
        person = {
          id: aData.id,
          source: 'mangadex',
          name: aData.attributes?.name || fallbackName || 'Manga Creator',
          known_for_department: 'Author & Mangaka',
          biography: aData.attributes?.biography?.en || '',
          birthday: '',
          place_of_birth: '',
          profile_path: null
        };
      }

      const rawMap = new Map();
      [...(authoredRes.data?.data || []), ...(artistRes.data?.data || [])].forEach(item => {
        if (item?.id && !rawMap.has(item.id)) {
          rawMap.set(item.id, item);
        }
      });
      const rawManga = Array.from(rawMap.values());
      if (rawManga.length > 0) {
        await resolveMangaCovers(rawManga);
        credits = await formatMangaDexItems(rawManga, { dateMode: 'created' });
      }
    }

    const payload = { person, credits };
    personCreditsCache.set(cacheKey, { data: payload, timestamp: Date.now() });
    res.json(payload);
  } catch (err) {
    console.error('[Media Controller Person Credits Error]:', err.message);
    res.status(500).json({
      error: 'Failed to load person filmography.',
      person: { id: personId, source, name: fallbackName || 'Cast & Crew', profile_path: null },
      credits: []
    });
  }
};

const animeCharactersCache = new Map();

// 9. Get Iconic & Live-Searchable Anime Character Avatars (AniList GraphQL)
export const getAnimeCharacters = async (req, res) => {
  const q = (req.query.q || '').trim();
  const cacheKey = q ? `search:${q.toLowerCase()}` : 'popular_iconic';

  try {
    if (animeCharactersCache.has(cacheKey)) {
      const cached = animeCharactersCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 30 * 60 * 1000) {
        return res.json(cached.data);
      }
    }

    const gqlQuery = q
      ? `
        query ($search: String) {
          Page(page: 1, perPage: 20) {
            characters(search: $search, sort: [SEARCH_MATCH, FAVOURITES_DESC]) {
              id
              name { full native }
              favourites
              image { large medium }
              media(page: 1, perPage: 1, sort: POPULARITY_DESC) {
                nodes { title { english romaji } }
              }
            }
          }
        }
      `
      : `
        query {
          Page(page: 1, perPage: 24) {
            characters(sort: FAVOURITES_DESC) {
              id
              name { full native }
              favourites
              image { large medium }
              media(page: 1, perPage: 1, sort: POPULARITY_DESC) {
                nodes { title { english romaji } }
              }
            }
          }
        }
      `;

    const alRes = await axios.post(
      'https://graphql.anilist.co',
      { query: gqlQuery, variables: q ? { search: q } : {} },
      { headers: { 'Content-Type': 'application/json' }, timeout: 6500 }
    );

    const rawChars = alRes.data?.data?.Page?.characters || [];
    const formatted = rawChars
      .filter((c) => {
        const imgUrl = c?.image?.large || c?.image?.medium || '';
        return Boolean(imgUrl && !imgUrl.includes('default.jpg'));
      })
      .map((c) => {
        const series =
          c.media?.nodes?.[0]?.title?.english ||
          c.media?.nodes?.[0]?.title?.romaji ||
          'Anime';
        const fullName = c.name?.full || 'Anime Character';
        return {
          id: `al-char-${c.id}`,
          name: fullName,
          series,
          prompt: `Anime character ${fullName} from ${series}, studio anime portrait`,
          url: c.image.large || c.image.medium
        };
      });

    animeCharactersCache.set(cacheKey, { data: formatted, timestamp: Date.now() });
    res.json(formatted);
  } catch (err) {
    console.warn('[Media Controller Anime Characters Error]:', err.message);
    res.json([]);
  }
};
