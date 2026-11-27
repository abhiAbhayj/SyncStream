import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const FRIBB_ANIME_LIST_URL = 'https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-mini.json';
const FRIBB_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAPPING_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

let fribbByAlId = null;
let fribbByMalId = null;
let fribbLoadedAt = 0;
let fribbLoadPromise = null;

const resolvedAnimeCache = new Map();
const tmdbTvSeasonsCache = new Map();

const getTmdbKey = () => {
  const k = process.env.TMDB_API_KEY;
  if (!k || k === '' || k === 'your_tmdb_api_key_here' || k === 'placeholder') return null;
  return k;
};

const normalizeTitle = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/['’`":;!?.,\-–—()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const stripSeasonSuffix = (str) =>
  String(str || '')
    .replace(/\b(season\s*\d+|\d+(?:st|nd|rd|th)\s*season|part\s*\d+|\d+(?:st|nd|rd|th)\s*cour|final\s*season|the\s*final\s*chapters)\b/gi, '')
    .replace(/[:\-–—]\s*(s\d+|ii|iii|iv|v)\s*$/i, '')
    .replace(/[:\-–—]\s*$/, '')
    .trim();

const detectSeasonNumberFromTitle = (title) => {
  const s = String(title || '');
  const m1 = s.match(/season\s*(\d+)|(\d+)(?:st|nd|rd|th)\s*season/i);
  if (m1) return parseInt(m1[1] || m1[2], 10) || 1;
  if (/\b(?:II|2)\s*$/.test(s)) return 2;
  if (/\b(?:III|3)\s*$/.test(s)) return 3;
  if (/\b(?:IV|4)\s*$/.test(s)) return 4;
  return null;
};

/**
 * Load and index Fribb's community anime-lists mapping (AniList ID / MAL ID -> exact TMDB ID & season).
 * Cached in memory for 24h so lookups are O(1) (~0ms).
 */
async function ensureFribbLoaded() {
  const now = Date.now();
  if (fribbByAlId && now - fribbLoadedAt < FRIBB_CACHE_TTL_MS) {
    return { fribbByAlId, fribbByMalId };
  }
  if (fribbLoadPromise) return fribbLoadPromise;

  fribbLoadPromise = (async () => {
    try {
      const res = await axios.get(FRIBB_ANIME_LIST_URL, { timeout: 6000 });
      const list = Array.isArray(res.data) ? res.data : [];
      const alMap = new Map();
      const malMap = new Map();
      for (const entry of list) {
        if (!entry || !entry.themoviedb_id) continue;
        if (entry.anilist_id) alMap.set(Number(entry.anilist_id), entry);
        if (entry.mal_id) malMap.set(Number(entry.mal_id), entry);
      }
      if (alMap.size > 0) {
        fribbByAlId = alMap;
        fribbByMalId = malMap;
        fribbLoadedAt = Date.now();
      }
    } catch (err) {
      console.warn('[AnimeMapper] Fribb list load notice:', err.message);
    } finally {
      fribbLoadPromise = null;
    }
    return { fribbByAlId, fribbByMalId };
  })();

  return fribbLoadPromise;
}

const extractFribbTmdbTarget = (entry) => {
  if (!entry || !entry.themoviedb_id) return null;
  const raw = entry.themoviedb_id;
  if (typeof raw === 'number' || typeof raw === 'string') {
    const isMovie = String(entry.type || '').toUpperCase() === 'MOVIE';
    return {
      tmdbId: String(raw),
      tmdbType: isMovie ? 'movie' : 'tv',
      tmdbSeason: entry.season?.tmdb ? parseInt(entry.season.tmdb, 10) : 1
    };
  }
  if (raw.tv) {
    return {
      tmdbId: String(raw.tv),
      tmdbType: 'tv',
      tmdbSeason: entry.season?.tmdb ? parseInt(entry.season.tmdb, 10) : 1
    };
  }
  if (raw.movie) {
    const movieId = Array.isArray(raw.movie) ? raw.movie[0] : raw.movie;
    if (movieId) {
      return { tmdbId: String(movieId), tmdbType: 'movie', tmdbSeason: 1 };
    }
  }
  return null;
};

const scoreTmdbCandidate = (cand, { queries, expectedYear, expectedLang, isMovie }) => {
  if (!cand || !cand.id) return -999;
  const genres = Array.isArray(cand.genre_ids) ? cand.genre_ids.map(Number) : [];

  // Hard filter: real anime entries must be Animation (genre 16) so we NEVER play live-action adaptations!
  if (!genres.includes(16)) return -999;
  // Never match pure documentaries
  if (genres.includes(99) && genres.length === 1) return -500;

  let score = 100; // Base score for Animation genre
  const origLang = String(cand.original_language || '').toLowerCase();
  if (origLang === expectedLang) {
    score += 65;
  } else if (origLang === 'ja' || origLang === 'zh' || origLang === 'cn' || origLang === 'ko') {
    score += 20;
  } else if (origLang === 'en' && expectedLang === 'ja') {
    score -= 75;
  }

  const candTitleNorm = normalizeTitle(cand.name || cand.title || '');
  const candOrigNorm = normalizeTitle(cand.original_name || cand.original_title || '');
  let bestTitleScore = 0;

  for (const q of queries) {
    const qNorm = normalizeTitle(q);
    if (!qNorm) continue;
    if (candTitleNorm === qNorm || candOrigNorm === qNorm) {
      bestTitleScore = Math.max(bestTitleScore, 60);
    } else if (
      candTitleNorm.startsWith(qNorm) ||
      qNorm.startsWith(candTitleNorm) ||
      candOrigNorm.startsWith(qNorm)
    ) {
      bestTitleScore = Math.max(bestTitleScore, 35);
    } else {
      const qTokens = new Set(qNorm.split(' ').filter((w) => w.length > 1));
      const cTokens = new Set(candTitleNorm.split(' ').filter((w) => w.length > 1));
      if (qTokens.size > 0 && cTokens.size > 0) {
        let overlap = 0;
        qTokens.forEach((tok) => {
          if (cTokens.has(tok)) overlap++;
        });
        const ratio = overlap / Math.max(qTokens.size, cTokens.size);
        bestTitleScore = Math.max(bestTitleScore, Math.round(ratio * 40));
      }
    }
  }

  if (bestTitleScore < 15) return -500;
  score += bestTitleScore;

  // Release year scoring (handles both Season 1 exact match and sequel parent TV shows)
  const dateStr = String(isMovie ? (cand.release_date || '') : (cand.first_air_date || ''));
  const candYear = /^\d{4}/.test(dateStr) ? parseInt(dateStr.slice(0, 4), 10) : null;
  if (expectedYear && candYear) {
    if (Math.abs(candYear - expectedYear) <= 1) {
      score += 35;
    } else if (!isMovie && candYear < expectedYear) {
      score += 10; // Parent series airing earlier is valid for sequels
    } else if (candYear > expectedYear + 1) {
      score -= 40;
    }
  }

  // Deprioritize Kids-only anthology shows (genre 10762)
  if (genres.includes(10762)) score -= 25;

  return score;
};

async function searchTmdbAnimeFallback({ queries, expectedYear, expectedLang, isMovie }) {
  const key = getTmdbKey();
  if (!key || queries.length === 0) return null;

  const endpoint = isMovie ? 'movie' : 'tv';
  let best = null;
  let bestScore = -1;

  for (const q of queries.slice(0, 4)) {
    try {
      const res = await axios.get(
        `${TMDB_BASE_URL}/search/${endpoint}?api_key=${key}&query=${encodeURIComponent(q)}`,
        { timeout: 4000 }
      );
      const list = Array.isArray(res.data?.results) ? res.data.results : [];
      for (const cand of list) {
        const s = scoreTmdbCandidate(cand, { queries, expectedYear, expectedLang, isMovie });
        if (s > bestScore) {
          bestScore = s;
          best = cand;
        }
      }
      if (bestScore >= 190) break;
    } catch {
      // Continue trying next candidate query
    }
  }

  if (best && bestScore >= 120) {
    return { tmdbId: String(best.id), tmdbType: endpoint, tmdbSeason: 1 };
  }
  return null;
}

/**
 * Fetch TMDB TV seasons (cached) and detect whether an AniList sequel season
 * maps to a dedicated TMDB season number or is flattened into TMDB Season 1 (episodeOffset > 0).
 */
async function verifyTmdbTvSeasonAndOffset(tmdbId, desiredSeason, startDateStr) {
  const key = getTmdbKey();
  const safeSeason = Math.max(1, parseInt(desiredSeason, 10) || 1);
  if (!key || !tmdbId) {
    return { tmdbSeason: safeSeason, episodeOffset: 0, tmdbSeasons: [] };
  }

  let tvData = tmdbTvSeasonsCache.get(tmdbId);
  if (!tvData || Date.now() - tvData.ts > MAPPING_CACHE_TTL_MS) {
    try {
      const res = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${key}`, { timeout: 4000 });
      tvData = {
        ts: Date.now(),
        seasons: Array.isArray(res.data?.seasons) ? res.data.seasons : [],
        runtime: (res.data?.episode_run_time && res.data.episode_run_time[0]) || res.data?.last_episode_to_air?.runtime || null
      };
      tmdbTvSeasonsCache.set(tmdbId, tvData);
    } catch {
      return { tmdbSeason: safeSeason, episodeOffset: 0, tmdbSeasons: [] };
    }
  }

  const formattedSeasons = tvData.seasons
    .filter((s) => s.season_number > 0)
    .map((s) => ({
      id: s.id,
      season_number: s.season_number,
      name: s.name || `Season ${s.season_number}`,
      overview: s.overview || '',
      poster_path: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
      air_date: s.air_date || '',
      episode_count: s.episode_count || 0
    }));

  // Direct match if TMDB actually has that season number
  const hasDirectSeason = formattedSeasons.some((s) => s.season_number === safeSeason && s.episode_count > 0);
  if (hasDirectSeason || safeSeason === 1) {
    return { tmdbSeason: safeSeason, episodeOffset: 0, tmdbSeasons: formattedSeasons, runtime: tvData.runtime };
  }

  // Fallback for flattened TMDB seasons (e.g., Jujutsu Kaisen S2 lives inside S1 Ep 25+ on TMDB)
  const fallbackSeason = formattedSeasons[formattedSeasons.length - 1]?.season_number || 1;
  let episodeOffset = 0;

  if (startDateStr && /^\d{4}-\d{2}-\d{2}/.test(startDateStr)) {
    const targetTs = Date.parse(startDateStr);
    if (Number.isFinite(targetTs)) {
      try {
        const sRes = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}/season/${fallbackSeason}?api_key=${key}`, { timeout: 4000 });
        const eps = Array.isArray(sRes.data?.episodes) ? sRes.data.episodes : [];
        let bestEp = null;
        let minDiffDays = Infinity;
        for (const ep of eps) {
          if (!ep?.air_date) continue;
          const epTs = Date.parse(ep.air_date);
          if (!Number.isFinite(epTs)) continue;
          const diffDays = Math.abs(epTs - targetTs) / 86400000;
          if (diffDays <= 7 && diffDays < minDiffDays) {
            minDiffDays = diffDays;
            bestEp = ep;
          }
        }
        if (bestEp && bestEp.episode_number > 1) {
          episodeOffset = bestEp.episode_number - 1;
        }
      } catch {
        // Ignore season episode alignment error and use fallbackSeason cleanly
      }
    }
  }

  return {
    tmdbSeason: fallbackSeason,
    episodeOffset,
    tmdbSeasons: formattedSeasons,
    runtime: tvData.runtime
  };
}

/**
 * Authoritative AniList -> TMDB resolver combining Fribb anime-lists (39k+ exact mappings),
 * strict animation-verified TMDB scoring fallback, and flattened-season episode offset detection.
 */
export async function resolveAnimeTmdbMapping({
  alId = null,
  malId = null,
  titleEnglish = '',
  titleRomaji = '',
  titleNative = '',
  format = '',
  startDate = '',
  seasonYear = null,
  countryOfOrigin = 'JP',
  prequelTitles = []
} = {}) {
  const numAlId = alId ? parseInt(String(alId).replace(/^al_/i, ''), 10) : null;
  const numMalId = malId ? parseInt(String(malId), 10) : null;
  const normFormat = String(format || '').toUpperCase();
  const cacheKey = numAlId
    ? `al_${numAlId}`
    : `q_${normalizeTitle(titleEnglish || titleRomaji)}_${normFormat}_${seasonYear || ''}`;

  const cached = resolvedAnimeCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < MAPPING_CACHE_TTL_MS) {
    return cached.data;
  }

  let baseMapping = null;
  let matchedVia = 'none';

  // 1. Primary: Fribb exact AniList / MAL ID mapping (eliminates Death Note / Solo Leveling / One Piece live-action collisions)
  if (numAlId || numMalId) {
    const { fribbByAlId: alMap, fribbByMalId: malMap } = await ensureFribbLoaded();
    const fribbEntry = (numAlId && alMap?.get(numAlId)) || (numMalId && malMap?.get(numMalId)) || null;
    if (fribbEntry) {
      baseMapping = extractFribbTmdbTarget(fribbEntry);
      if (baseMapping) matchedVia = 'fribb';
    }
  }

  // 2. Secondary: Animation-verified TMDB scored search
  if (!baseMapping) {
    const queries = [];
    const addQuery = (t) => {
      if (!t || typeof t !== 'string') return;
      const trimmed = t.trim();
      const base = stripSeasonSuffix(trimmed);
      if (base && base.length >= 2 && !queries.includes(base)) queries.push(base);
      if (trimmed && trimmed.length >= 2 && !queries.includes(trimmed)) queries.push(trimmed);
    };

    (Array.isArray(prequelTitles) ? prequelTitles : []).forEach(addQuery);
    addQuery(titleEnglish);
    addQuery(titleRomaji);
    addQuery(titleNative);

    const country = String(countryOfOrigin || 'JP').toUpperCase();
    const expectedLang = country === 'CN' ? 'zh' : (country === 'KR' ? 'ko' : 'ja');
    const isMovie = normFormat === 'MOVIE';
    const yearMatch = String(startDate || seasonYear || '').match(/\b(\d{4})\b/);
    const expectedYear = yearMatch ? parseInt(yearMatch[1], 10) : null;

    baseMapping = await searchTmdbAnimeFallback({ queries, expectedYear, expectedLang, isMovie });
    if (baseMapping) {
      const detected =
        detectSeasonNumberFromTitle(titleEnglish) ||
        detectSeasonNumberFromTitle(titleRomaji) ||
        1;
      baseMapping.tmdbSeason = detected;
      matchedVia = 'tmdb_scored';
    }
  }

  if (!baseMapping) {
    return null;
  }

  let finalResult = {
    tmdbId: baseMapping.tmdbId,
    tmdbType: baseMapping.tmdbType,
    tmdbSeason: baseMapping.tmdbSeason || 1,
    episodeOffset: 0,
    tmdbSeasons: [],
    runtime: null,
    matchedVia
  };

  if (baseMapping.tmdbType === 'tv') {
    const seasonInfo = await verifyTmdbTvSeasonAndOffset(
      baseMapping.tmdbId,
      baseMapping.tmdbSeason || 1,
      startDate
    );
    finalResult = {
      ...finalResult,
      tmdbSeason: seasonInfo.tmdbSeason,
      episodeOffset: seasonInfo.episodeOffset,
      tmdbSeasons: seasonInfo.tmdbSeasons,
      runtime: seasonInfo.runtime || null
    };
  }

  if (resolvedAnimeCache.size > 3000) {
    const first = resolvedAnimeCache.keys().next().value;
    if (first) resolvedAnimeCache.delete(first);
  }
  resolvedAnimeCache.set(cacheKey, { ts: Date.now(), data: finalResult });
  return finalResult;
}
