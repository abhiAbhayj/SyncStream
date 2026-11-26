import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TORRENTIO_BASE_URL = 'https://torrentio.strem.fun';

const QUALITY_TTL_HD_MS = 12 * 60 * 60 * 1000;
const QUALITY_TTL_CAM_MS = 2 * 60 * 60 * 1000;
const THEATRICAL_CAM_FALLBACK_DAYS = 90;
const RECENT_MOVIE_WINDOW_DAYS = 150;

const CAM_PRINT_RE = /\b(cam|hdcam|hd-?cam|cam-?rip|telesync|hdts|hd-?ts|ts-?rip|telecine|hdtc|hd-?tc|\btc\b|scr|dvdscr|dvd-?scr|screener|workprint|predvd|pre-?dvd|hqcam|hq-?cam|clean-?cam)\b/i;
const CAM_NAME_RE = /\b(CAM|TeleSync|TeleCine|SCR|Workprint)\b/i;
const STRONG_HD_SOURCE_RE = /\b(web-?dl|webrip|hdrip|bluray|blu-?ray|bdrip|brrip|dvdrip|remux|atvp|amzn|nf|dsnp|hmax|pcok)\b/i;
const HD_RES_RE = /\b(4k|2160p|1080p|720p)\b/i;

const qualityCache = new Map();
const inflightQualityLookups = new Map();
const animeTmdbMovieCache = new Map();

const getTmdbKey = () => {
  const k = process.env.TMDB_API_KEY;
  if (!k || k === 'your_tmdb_api_key_here' || k === 'placeholder') return null;
  return k;
};

const getCachedEntry = (key) => {
  const entry = qualityCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    qualityCache.delete(key);
    return null;
  }
  return entry;
};

const setCachedEntry = (key, quality, releaseDate = null) => {
  if (!quality) return;
  if (qualityCache.size > 4000) {
    const firstKey = qualityCache.keys().next().value;
    if (firstKey) qualityCache.delete(firstKey);
  }
  const ttl = quality === 'HD' ? QUALITY_TTL_HD_MS : QUALITY_TTL_CAM_MS;
  qualityCache.set(key, {
    quality,
    releaseDate: releaseDate || null,
    expiresAt: Date.now() + ttl
  });
};

const extractRelStr = (item) =>
  String(item?.full_release_date || item?.release_date || item?.first_air_date || item?.air_date || '').trim();

const parseDaysSince = (relStr, now = Date.now()) => {
  if (!relStr) return null;
  if (/^\d{4}$/.test(relStr)) {
    const yr = parseInt(relStr, 10);
    const curYr = new Date(now).getUTCFullYear();
    if (yr > curYr) return -30;
    if (yr < curYr) return 365 * (curYr - yr);
    return null; // Same year without month/day is ambiguous
  }
  const ts = Date.parse(relStr);
  if (!Number.isFinite(ts)) return null;
  return (now - ts) / 86400000;
};

const hasReleasedDigitalOnTmdb = (releaseDatesResults, now = Date.now()) => {
  if (!Array.isArray(releaseDatesResults) || releaseDatesResults.length === 0) {
    return { hasDigital: false, hasAnyRelease: false, earliestTheatrical: Infinity };
  }
  let hasDigital = false;
  let hasAnyRelease = false;
  let earliestTheatrical = Infinity;

  for (const country of releaseDatesResults) {
    for (const rd of (country?.release_dates || [])) {
      if (!rd?.release_date) continue;
      const ts = Date.parse(rd.release_date);
      if (!Number.isFinite(ts)) continue;
      hasAnyRelease = true;
      // TMDB types: 4 = Digital, 5 = Physical, 6 = TV
      if ([4, 5, 6].includes(rd.type) && ts <= now) {
        hasDigital = true;
        break;
      }
      if ([1, 2, 3].includes(rd.type) && ts < earliestTheatrical) {
        earliestTheatrical = ts;
      }
    }
    if (hasDigital) break;
  }

  return { hasDigital, hasAnyRelease, earliestTheatrical };
};

/**
 * Synchronous quality resolution used as baseline and fallback.
 * Guarantees consistent 'HD' vs 'CAM' rules for both Movies and TV/Anime series.
 */
export const resolveMediaQualitySync = (item, mediaType = null, releaseDatesResults = null) => {
  if (!item) return null;
  const type = String(mediaType || item?.media_type || item?.type || 'movie').toLowerCase();
  if (type === 'manga' || type === 'music' || type === 'person') return null;

  const formatUpper = String(item?.format || '').toUpperCase();
  const isMovie = type === 'movie' || formatUpper === 'MOVIE';
  const now = Date.now();
  const relStr = extractRelStr(item);

  if (!isMovie) {
    const status = String(item?.status || '').toUpperCase();
    if (status === 'NOT_YET_RELEASED' || status === 'PLANNED') {
      return 'CAM';
    }
    const hasAiredEpisodes = Boolean(item?.last_episode_to_air || item?.has_aired_episodes);
    if ((status === 'IN PRODUCTION' || status === 'PILOT') && !hasAiredEpisodes) {
      return 'CAM';
    }
    if (relStr && /^\d{4}-\d{2}-\d{2}/.test(relStr)) {
      const ts = Date.parse(relStr);
      if (Number.isFinite(ts) && ts - now > 86400000) {
        return 'CAM';
      }
    } else if (relStr && /^\d{4}$/.test(relStr)) {
      if (parseInt(relStr, 10) > new Date(now).getUTCFullYear()) {
        return 'CAM';
      }
    }
    return 'HD';
  }

  // 1. Check TMDB release_dates when available
  const { hasDigital, hasAnyRelease, earliestTheatrical } = hasReleasedDigitalOnTmdb(releaseDatesResults, now);
  if (hasDigital) return 'HD';
  if (hasAnyRelease && Number.isFinite(earliestTheatrical)) {
    const daysSinceTheatrical = (now - earliestTheatrical) / 86400000;
    return daysSinceTheatrical < THEATRICAL_CAM_FALLBACK_DAYS ? 'CAM' : 'HD';
  }

  // 2. Date-window heuristic (unified 90-day theatrical window)
  if (relStr) {
    if (/^\d{4}$/.test(relStr)) {
      const yr = parseInt(relStr, 10);
      return yr > new Date(now).getUTCFullYear() ? 'CAM' : 'HD';
    }
    const ts = Date.parse(relStr);
    if (Number.isFinite(ts)) {
      const daysSince = (now - ts) / 86400000;
      return daysSince < THEATRICAL_CAM_FALLBACK_DAYS ? 'CAM' : 'HD';
    }
  }

  return null;
};

/**
 * Probe public Torrentio stream metadata for an IMDb movie ID to check whether
 * genuine non-CAM HD releases (WEB-DL/WEBRip/HDRip/BluRay/clean 1080p) exist yet,
 * or only theater CAM/TeleSync/TeleCine/SCR prints exist.
 */
export const checkTorrentioMoviePrint = async (imdbId) => {
  if (!imdbId || !/^tt\d+$/i.test(String(imdbId).trim())) return null;
  try {
    const res = await axios.get(`${TORRENTIO_BASE_URL}/stream/movie/${String(imdbId).trim()}.json`, {
      timeout: 2200,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const streams = Array.isArray(res.data?.streams) ? res.data.streams : [];
    if (streams.length === 0) return null;

    let hdCount = 0;
    let strongHdSource = false;
    let camCount = 0;

    for (const s of streams.slice(0, 35)) {
      const nameStr = String(s?.name || '');
      const titleStr = String(s?.title || '');
      const combined = `${nameStr} ${titleStr}`;

      if (CAM_NAME_RE.test(nameStr) || CAM_PRINT_RE.test(combined)) {
        camCount++;
        continue;
      }

      if (STRONG_HD_SOURCE_RE.test(combined)) {
        strongHdSource = true;
        hdCount++;
      } else if (HD_RES_RE.test(nameStr)) {
        hdCount++;
      }
    }

    if (strongHdSource || hdCount >= 2 || (hdCount >= 1 && camCount === 0)) {
      return 'HD';
    }
    if (camCount > 0) {
      return 'CAM';
    }
    return null;
  } catch {
    return null;
  }
};

const extractNumericTmdbId = (item) => {
  if (item?.tmdb_id && /^\d+$/.test(String(item.tmdb_id).trim())) {
    return String(item.tmdb_id).trim();
  }
  const raw = String(item?.external_media_id || item?.id || '').trim();
  if (!raw || /^al_/i.test(raw)) return null;
  if (/^\d+$/.test(raw)) return raw;
  const seasonPrefix = raw.match(/^(\d+)_s\d+$/);
  if (seasonPrefix) return seasonPrefix[1];
  return null;
};

const resolveMovieTmdbIdByTitle = async (title, year) => {
  const key = getTmdbKey();
  if (!key || !title) return null;
  const cacheKey = `${String(title).toLowerCase().trim()}_${year || ''}`;
  if (animeTmdbMovieCache.has(cacheKey)) {
    return animeTmdbMovieCache.get(cacheKey);
  }
  try {
    const clean = String(title)
      .replace(/[:\-–—]\s*the\s*movie$/i, '')
      .trim();
    let url = `${TMDB_BASE_URL}/search/movie?api_key=${key}&query=${encodeURIComponent(clean || title)}`;
    if (year && /^\d{4}$/.test(String(year))) {
      url += `&primary_release_year=${year}`;
    }
    const res = await axios.get(url, { timeout: 3000 });
    const firstId = res.data?.results?.[0]?.id ? String(res.data.results[0].id) : null;
    animeTmdbMovieCache.set(cacheKey, firstId);
    return firstId;
  } catch {
    return null;
  }
};

/**
 * Authoritative async quality resolver shared across ALL SyncStream endpoints
 * (Dashboard Trending, Search, Catalog, Media Detail, Watchlist, Continue Watching, Person Credits).
 */
export const resolveMediaQualityAsync = async (item, mediaType = null, options = {}) => {
  if (!item) return null;
  const type = String(mediaType || item?.media_type || item?.type || 'movie').toLowerCase();
  if (type === 'manga' || type === 'music' || type === 'person') return null;

  const formatUpper = String(item?.format || '').toUpperCase();
  const isMovie = type === 'movie' || formatUpper === 'MOVIE';
  const relStr = extractRelStr(item);
  const now = Date.now();
  const daysSince = parseDaysSince(relStr, now);

  let numericId = extractNumericTmdbId(item);
  const rawId = String(item?.external_media_id || item?.id || '').trim();
  const cacheBucket = isMovie ? 'movie' : 'tv';
  const cacheId = numericId || rawId;

  // TV & Anime Series resolution
  if (!isMovie) {
    // Future date > 24h is immediately CAM
    if (daysSince !== null && daysSince < -1) {
      return 'CAM';
    }
    const statusUpper = String(item?.status || '').toUpperCase();
    if (statusUpper === 'NOT_YET_RELEASED' || statusUpper === 'PLANNED') {
      return 'CAM';
    }
    const hasAired = Boolean(item?.last_episode_to_air || item?.has_aired_episodes);
    if ((statusUpper === 'IN PRODUCTION' || statusUpper === 'PILOT') && !hasAired) {
      return 'CAM';
    }

    // If TMDB TV card has blank date or no status and could be unreleased In Production / Planned
    if (numericId && !options.existingDetail && (!relStr || (!statusUpper && daysSince !== null && daysSince < 14))) {
      const cacheKey = `tv:${numericId}`;
      const cached = getCachedEntry(cacheKey);
      if (cached) {
        if (!item.release_date && cached.releaseDate) item.release_date = cached.releaseDate;
        return cached.quality;
      }
      if (inflightQualityLookups.has(cacheKey)) {
        return inflightQualityLookups.get(cacheKey);
      }
      const key = getTmdbKey();
      if (key) {
        const lookupPromise = (async () => {
          try {
            const det = await axios.get(`${TMDB_BASE_URL}/tv/${numericId}?api_key=${key}`, { timeout: 3000 });
            const d = det.data;
            if (!item.release_date && d.first_air_date) {
              item.release_date = d.first_air_date;
            }
            const q = resolveMediaQualitySync(
              {
                ...item,
                status: d.status,
                last_episode_to_air: d.last_episode_to_air,
                release_date: item.release_date || d.first_air_date
              },
              'tv'
            );
            setCachedEntry(cacheKey, q, d.first_air_date);
            return q;
          } catch {
            return resolveMediaQualitySync(item, type);
          } finally {
            inflightQualityLookups.delete(cacheKey);
          }
        })();
        inflightQualityLookups.set(cacheKey, lookupPromise);
        return lookupPromise;
      }
    }

    return resolveMediaQualitySync(item, type);
  }

  // Movie fast paths (older than 150 days -> HD; > 7 days in future -> CAM)
  if (daysSince !== null && daysSince >= RECENT_MOVIE_WINDOW_DAYS) {
    return 'HD';
  }
  if (daysSince !== null && daysSince < -7 && !options.releaseDatesResults) {
    return 'CAM';
  }

  // Resolve TMDB numeric ID for recent/ambiguous AniList Anime Movies when needed
  if (!numericId && type === 'anime' && isMovie) {
    const yrMatch = relStr.match(/\b(\d{4})\b/);
    numericId = await resolveMovieTmdbIdByTitle(item.title || item.name, yrMatch?.[1]);
  }

  const effectiveCacheId = numericId || cacheId;
  const cacheKey = effectiveCacheId ? `${cacheBucket}:${effectiveCacheId}` : null;

  if (cacheKey && !options.force) {
    const cached = getCachedEntry(cacheKey);
    if (cached) {
      if (!item.release_date && cached.releaseDate) item.release_date = cached.releaseDate;
      return cached.quality;
    }
    if (inflightQualityLookups.has(cacheKey)) {
      return inflightQualityLookups.get(cacheKey);
    }
  }

  const runMovieLookup = async () => {
    let rdResults = options.releaseDatesResults || options.existingDetail?.release_dates?.results || null;
    let imdbId = options.imdbId || options.existingDetail?.external_ids?.imdb_id || item?.imdb_id || null;
    let resolvedRelDate = relStr || options.existingDetail?.release_date || '';

    const key = getTmdbKey();
    if (numericId && key && (!rdResults || !imdbId)) {
      try {
        const res = await axios.get(
          `${TMDB_BASE_URL}/movie/${numericId}?api_key=${key}&append_to_response=release_dates,external_ids`,
          { timeout: 3500 }
        );
        const d = res.data;
        if (!rdResults) rdResults = d?.release_dates?.results || null;
        if (!imdbId) imdbId = d?.external_ids?.imdb_id || d?.imdb_id || null;
        if (d?.release_date) {
          resolvedRelDate = d.release_date;
          if (!item.release_date) item.release_date = d.release_date;
        }
      } catch {
        // Proceed cleanly with whatever partial signals exist
      }
    }

    const updatedDaysSince = parseDaysSince(resolvedRelDate, now);
    if (updatedDaysSince !== null && updatedDaysSince >= RECENT_MOVIE_WINDOW_DAYS) {
      if (cacheKey) setCachedEntry(cacheKey, 'HD', resolvedRelDate);
      return 'HD';
    }

    // 1. TMDB official Digital / Physical / TV release date on or before today => confirmed HD
    const { hasDigital } = hasReleasedDigitalOnTmdb(rdResults, now);
    if (hasDigital) {
      if (cacheKey) setCachedEntry(cacheKey, 'HD', resolvedRelDate);
      return 'HD';
    }

    // 2. Check live Torrentio stream print availability (WEB-DL/HDRip/BluRay vs CAM/TS/HDTC/SCR)
    if (imdbId) {
      const streamPrint = await checkTorrentioMoviePrint(imdbId);
      if (streamPrint === 'HD' || streamPrint === 'CAM') {
        if (cacheKey) setCachedEntry(cacheKey, streamPrint, resolvedRelDate);
        return streamPrint;
      }
    }

    // 3. Fallback to unified synchronous TMDB theatrical/release-date rule (90-day window)
    const fallbackQuality = resolveMediaQualitySync(
      { ...item, release_date: resolvedRelDate || item.release_date },
      'movie',
      rdResults
    );
    if (cacheKey && fallbackQuality) {
      setCachedEntry(cacheKey, fallbackQuality, resolvedRelDate);
    }
    return fallbackQuality;
  };

  if (!cacheKey) {
    return runMovieLookup();
  }

  const lookupPromise = runMovieLookup().finally(() => {
    inflightQualityLookups.delete(cacheKey);
  });
  inflightQualityLookups.set(cacheKey, lookupPromise);
  return lookupPromise;
};

/**
 * Batch-enrich a list of media objects in-place (with bounded concurrency) so every
 * card and detail view shows the exact same verified 'HD' | 'CAM' tag.
 */
export const enrichMediaQualityList = async (items, defaultMediaType = null, concurrency = 8) => {
  if (!Array.isArray(items) || items.length === 0) return items || [];

  let cursor = 0;
  const workerCount = Math.min(concurrency, items.length);

  const workers = Array.from({ length: workerCount }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      const item = items[idx];
      if (!item || typeof item !== 'object') continue;
      const q = await resolveMediaQualityAsync(item, defaultMediaType || item.media_type || item.type);
      if (q === 'HD' || q === 'CAM') {
        item.quality = q;
      }
    }
  });

  await Promise.all(workers);
  return items;
};
