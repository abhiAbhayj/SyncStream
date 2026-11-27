/**
 * Direct Browser Live Anime Engine (AniList GraphQL — CORS enabled: Access-Control-Allow-Origin: *)
 * Runs directly from the user's browser IP (90 req/min per user), completely eliminating
 * Render shared-IP rate-limiting and ensuring 100% live Trending, Ongoing, Latest Episode,
 * Schedule, and Upcoming anime across Home, Search, and Catalog pages.
 */

import { getMediaQuality, hydrateMediaQualities } from './mediaQuality';

const enrichRecentAnimeMovies = async (items) => {
  if (!Array.isArray(items) || items.length === 0) return items || [];
  const now = Date.now();
  const candidates = items.filter((it) => {
    if (!it || String(it.format || '').toUpperCase() !== 'MOVIE') return false;
    if (!it.release_date) return true;
    const ts = Date.parse(it.release_date);
    return !Number.isFinite(ts) || (now - ts) / 86400000 < 150;
  });
  if (candidates.length === 0) return items;
  const hydrated = await hydrateMediaQualities(candidates);
  const byId = new Map(hydrated.map((x) => [String(x.id), x]));
  return items.map((it) => byId.get(String(it?.id)) || it);
};

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';
const ANIME_DAYS_OF_WEEK = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const ANILIST_FIELDS = `
  id
  title { english romaji native }
  description(asHtml: false)
  coverImage { extraLarge large medium }
  bannerImage
  startDate { year month day }
  season
  seasonYear
  averageScore
  meanScore
  status
  format
  episodes
  duration
  genres
  nextAiringEpisode { episode airingAt timeUntilAiring }
`;

// Unified AniList Genre & Tag Filter Map (100% verified against live AniList GenreCollection + MediaTagCollection)
// Supports clean single genre names + legacy TMDB/MangaDex keys for backwards compatibility
const ANILIST_FILTER_MAP = {
  // Core Official AniList Genres (Single Genres)
  'action': { genre: 'Action' },
  'adventure': { genre: 'Adventure' },
  'comedy': { genre: 'Comedy' },
  'drama': { genre: 'Drama' },
  'ecchi': { genre: 'Ecchi' },
  'fantasy': { genre: 'Fantasy' },
  'horror': { genre: 'Horror' },
  'mahou shoujo': { genre: 'Mahou Shoujo' },
  'mecha': { genre: 'Mecha' },
  'music': { genre: 'Music' },
  'mystery': { genre: 'Mystery' },
  'psychological': { genre: 'Psychological' },
  'romance': { genre: 'Romance' },
  'sci-fi': { genre: 'Sci-Fi' },
  'slice of life': { genre: 'Slice of Life' },
  'sports': { genre: 'Sports' },
  'supernatural': { genre: 'Supernatural' },
  'thriller': { genre: 'Thriller' },
  'suspense': { genre: 'Thriller' },

  // Verified AniList Tags (Single Sub-Genres & Demographics)
  'avant garde': { tag: 'Philosophy' },
  'award winning': { sortOverride: ['SCORE_DESC', 'FAVOURITES_DESC'] },
  'boys love': { tag: "Boys' Love" },
  'shounen ai': { tag: "Boys' Love" },
  'cars': { tag: 'Cars' },
  'crime': { tag: 'Crime' },
  'cyberpunk': { tag: 'Cyberpunk' },
  'dementia': { tag: 'Denpa' },
  'demons': { tag: 'Demons' },
  'game': { tag: 'Video Games' },
  'girls love': { tag: 'Yuri' },
  'shoujo ai': { tag: 'Yuri' },
  'yuri': { tag: 'Yuri' },
  'gourmet': { tag: 'Food' },
  'food': { tag: 'Food' },
  'harem': { tag: 'Female Harem' },
  'historical': { tag: 'Historical' },
  'isekai': { tag: 'Isekai' },
  'josei': { tag: 'Josei' },
  'kids': { tag: 'Kids' },
  'magic': { tag: 'Magic' },
  'martial arts': { tag: 'Martial Arts' },
  'military': { tag: 'Military' },
  'parody': { tag: 'Parody' },
  'police': { tag: 'Police' },
  'post-apocalyptic': { tag: 'Post-Apocalyptic' },
  'reincarnation': { tag: 'Reincarnation' },
  'samurai': { tag: 'Samurai' },
  'school': { tag: 'School' },
  'school life': { tag: 'School' },
  'seinen': { tag: 'Seinen' },
  'shoujo': { tag: 'Shoujo' },
  'shounen': { tag: 'Shounen' },
  'space': { tag: 'Space' },
  'super power': { tag: 'Super Power' },
  'survival': { tag: 'Survival' },
  'tragedy': { tag: 'Tragedy' },
  'vampire': { tag: 'Vampire' },

  // Legacy TMDB / SyncStream Anime Keys (backwards compatibility)
  '10759': { genre: 'Action' },
  '28': { genre: 'Action' },
  '12': { genre: 'Adventure' },
  '35': { genre: 'Comedy' },
  '18': { genre: 'Drama' },
  '14': { genre: 'Fantasy' },
  '27': { genre: 'Horror' },
  '9648': { genre: 'Mystery' },
  '10749': { genre: 'Romance' },
  '878': { genre: 'Sci-Fi' },
  '10765': { genre: 'Fantasy' },
  '53': { genre: 'Thriller' },
  'g_10759': { genre: 'Action' },
  'g_35': { genre: 'Comedy' },
  'g_18': { genre: 'Drama' },
  'g_10765': { genre: 'Fantasy' },
  'g_9648': { genre: 'Mystery' },
  'g_10749': { genre: 'Romance' },
  'k_9840': { genre: 'Romance' },
  'k_195669': { genre: 'Ecchi' },
  'k_9194': { tag: 'Female Harem' },
  'k_237451': { tag: 'Isekai' },
  'k_6152': { genre: 'Supernatural' },
  'k_207826': { tag: 'Shounen' },
  'k_195668': { tag: 'Seinen' },
  'k_206437': { tag: 'Shoujo' },
  'k_10873': { tag: 'School' },
  'k_9914': { genre: 'Slice of Life' },
  'k_10046': { genre: 'Mecha' },
  'k_6075': { genre: 'Sports' },
  'k_315058': { genre: 'Horror' },
  'k_272553': { genre: 'Psychological' },
  'k_2343': { tag: 'Magic' },
  'k_779': { tag: 'Martial Arts' },
  'k_361426': { tag: 'Demons' },
  'k_283297': { genre: 'Music' },
  'k_3133': { tag: 'Vampire' },

  // Legacy MangaDex UUID & Demographic Keys (backwards compatibility)
  '391b0423-d847-456f-aff0-8b0cfc03066b': { genre: 'Action' },
  '87cc87cd-a395-47af-b27a-93258283bbc6': { genre: 'Adventure' },
  '4d32cc48-9f00-4cca-9b5a-a839f0764984': { genre: 'Comedy' },
  '423e2eae-a7a2-4a8b-ac03-a8351462d71d': { genre: 'Romance' },
  'cdc58593-87dd-415e-bbc0-2ec27bf404cc': { genre: 'Fantasy' },
  'b9af3a63-f058-46de-a9a0-e0c13906197a': { genre: 'Drama' },
  '256c8bd9-4904-4360-bf4f-508a76d67183': { genre: 'Sci-Fi' },
  'eabc5b4c-6aff-42f3-b657-3e90cbd00b75': { genre: 'Supernatural' },
  'ace04997-f6bd-436e-b261-779182193d3d': { tag: 'Isekai' },
  'aafb99c1-7f60-43fa-b75f-fc9502ce29c7': { tag: 'Female Harem' },
  '2d1f5d56-a1e5-4d0d-a961-29734e194866': { genre: 'Ecchi' },
  'ee968100-4191-4968-93d3-f82d72be7e46': { genre: 'Mystery' },
  'cdad7e68-1419-41dd-bdce-27753074a640': { genre: 'Horror' },
  '3b60b75c-a2d7-4860-ab56-05f391bb889c': { genre: 'Psychological' },
  'e5301a23-ebd9-49dd-a0cb-2add944c7fe9': { genre: 'Slice of Life' },
  '50880a9d-5440-4732-9afb-8f457127e836': { genre: 'Mecha' },
  '69964a64-2f90-4d33-beeb-f3ed2875eb4c': { genre: 'Sports' },
  '799c202e-7daa-44eb-9cf7-8a3c0441531e': { tag: 'Martial Arts' },
  'a1f53773-c69a-4ce5-8cab-fffcd90b1565': { tag: 'Magic' },
  '39730448-9a5f-48a2-85b0-a70db87b1233': { tag: 'Demons' },
  'd_shounen': { tag: 'Shounen' },
  'd_seinen': { tag: 'Seinen' },
  'd_shoujo': { tag: 'Shoujo' },
  'd_josei': { tag: 'Josei' }
};

const resolveAniListFilter = (rawKey) => {
  if (!rawKey) return { genre: null, tag: null, tagIn: null, sortOverride: null };
  const key = String(rawKey).trim();
  const mapped = ANILIST_FILTER_MAP[key] || ANILIST_FILTER_MAP[key.toLowerCase()];
  if (mapped) {
    return {
      genre: mapped.genre || null,
      tag: mapped.tag || null,
      tagIn: mapped.tagIn || null,
      sortOverride: mapped.sortOverride || null
    };
  }
  if (isNaN(Number(key)) && !key.startsWith('k_') && !key.startsWith('g_') && !key.startsWith('d_') && !key.includes('-')) {
    return { genre: key, tag: null, tagIn: null, sortOverride: null };
  }
  return { genre: null, tag: null, tagIn: null, sortOverride: null };
};

const VALID_ANIME_FORMATS = new Set(['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'TV_SHORT', 'MUSIC']);
const VALID_ANILIST_COUNTRIES = new Set(['JP', 'CN', 'KR', 'TW']);

const ANILIST_MANGA_FIELDS = `
  id
  title { english romaji native }
  description(asHtml: false)
  coverImage { extraLarge large medium }
  bannerImage
  startDate { year month day }
  updatedAt
  averageScore
  meanScore
  status
  format
  chapters
  volumes
  countryOfOrigin
  genres
`;

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let dashboardCache = null;
let dashboardCacheTs = 0;
let dashboardInflight = null;
const pageCache = new Map();

let mangaDashboardCache = null;
let mangaDashboardCacheTs = 0;
let mangaDashboardInflight = null;
const mangaPageCache = new Map();
const mangaDetailCache = new Map();

export const getCurrentAnimeSeason = () => {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();
  const season = month <= 3 ? 'WINTER' : month <= 6 ? 'SPRING' : month <= 9 ? 'SUMMER' : 'FALL';
  return { season, year };
};

export const getNextAnimeSeason = () => {
  const { season, year } = getCurrentAnimeSeason();
  if (season === 'WINTER') return { season: 'SPRING', year };
  if (season === 'SPRING') return { season: 'SUMMER', year };
  if (season === 'SUMMER') return { season: 'FALL', year };
  return { season: 'WINTER', year: year + 1 };
};

const getFuzzyDateInt = (dateObj) => {
  const y = dateObj.getUTCFullYear();
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getUTCDate()).padStart(2, '0');
  return parseInt(`${y}${m}${d}`, 10);
};

const formatPremiereLabel = (startDate, season, seasonYear) => {
  if (startDate?.year) {
    if (startDate.month && startDate.day) {
      const mon = MONTH_SHORT[startDate.month - 1] || '';
      return `Premieres ${mon} ${startDate.day}, ${startDate.year}`;
    }
    if (startDate.month) {
      const mon = MONTH_SHORT[startDate.month - 1] || '';
      return `Premieres ${mon} ${startDate.year}`;
    }
    if (season) {
      const sCap = season.charAt(0) + season.slice(1).toLowerCase();
      return `${sCap} ${startDate.year}`;
    }
    return `Coming ${startDate.year}`;
  }
  if (season && seasonYear) {
    const sCap = season.charAt(0) + season.slice(1).toLowerCase();
    return `${sCap} ${seasonYear}`;
  }
  return seasonYear ? `Coming ${seasonYear}` : 'Upcoming Release';
};

const formatDate = (startDate, seasonYear) => {
  if (startDate?.year) {
    const y = String(startDate.year);
    const m = startDate.month ? String(startDate.month).padStart(2, '0') : '01';
    const d = startDate.day ? String(startDate.day).padStart(2, '0') : '01';
    return `${y}-${m}-${d}`;
  }
  return seasonYear ? `${seasonYear}-01-01` : '';
};

const mapAniListCard = (m) => {
  const title = m.title?.english || m.title?.romaji || m.title?.native || 'Untitled Anime';
  const cleanOverview = m.description
    ? m.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    : '';
  const score = m.averageScore
    ? Number((m.averageScore / 10).toFixed(1))
    : (m.meanScore ? Number((m.meanScore / 10).toFixed(1)) : 0);

  let broadcastDay = null;
  let broadcastText = null;
  let broadcastTime = null;
  let hasExactSchedule = false;
  if (m.status === 'NOT_YET_RELEASED') {
    broadcastText = formatPremiereLabel(m.startDate, m.season, m.seasonYear);
  } else if (m.nextAiringEpisode?.airingAt) {
    const airDate = new Date(m.nextAiringEpisode.airingAt * 1000);
    if (!isNaN(airDate.getTime())) {
      hasExactSchedule = true;
      broadcastDay = ANIME_DAYS_OF_WEEK[airDate.getDay()];
      broadcastTime = airDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dayShort = broadcastDay.slice(0, -1);
      const nextEp = m.nextAiringEpisode.episode;
      broadcastText = nextEp ? `Ep ${nextEp} • ${dayShort} ${broadcastTime}` : `Airs ${dayShort} ${broadcastTime}`;
    }
  } else if (m.status === 'RELEASING') {
    broadcastDay = ANIME_DAYS_OF_WEEK[(parseInt(m.id, 10) || 0) % 7];
    broadcastText = `Live Ongoing • ${broadcastDay}`;
  }

  const releaseDate = formatDate(m.startDate, m.seasonYear);

  return {
    id: `al_${m.id}`,
    external_media_id: `al_${m.id}`,
    anilist_id: m.id,
    title,
    name: title,
    overview: cleanOverview,
    poster_path: m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium || null,
    backdrop_path: m.bannerImage || m.coverImage?.extraLarge || m.coverImage?.large || null,
    release_date: releaseDate,
    first_air_date: releaseDate,
    vote_average: score,
    media_type: 'anime',
    status: m.status || null,
    format: m.format || 'TV',
    episodes_count: m.episodes || null,
    next_episode: m.nextAiringEpisode?.episode || null,
    airing_at: m.nextAiringEpisode?.airingAt || null,
    time_until_airing: m.nextAiringEpisode?.timeUntilAiring || null,
    broadcast_time: broadcastTime,
    has_exact_schedule: hasExactSchedule,
    duration: m.duration || null,
    runtime: m.duration || null,
    genres: (m.genres || []).map((g) => ({ id: g, name: g })),
    broadcast_day: broadcastDay,
    broadcast: broadcastText
  };
};

const formatLatestAiredCard = (entry, nowSec) => {
  const card = mapAniListCard(entry.media);
  const diffSec = Math.max(60, nowSec - (entry.airingAt || nowSec));
  const hrs = Math.floor(diffSec / 3600);
  let agoLabel = 'Just now';
  if (hrs < 1) {
    agoLabel = `${Math.max(1, Math.floor(diffSec / 60))}m ago`;
  } else if (hrs < 24) {
    agoLabel = `${hrs}h ago`;
  } else {
    const days = Math.floor(hrs / 24);
    agoLabel = days === 1 ? 'Yesterday' : `${days}d ago`;
  }
  card.latest_episode = entry.episode;
  card.broadcast = `Ep ${entry.episode} • Aired ${agoLabel}`;
  return card;
};

const queryAniList = async (query, variables = {}) => {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) {
    throw new Error(`AniList HTTP ${res.status}`);
  }
  const json = await res.json();
  if (json.errors && !json.data) {
    throw new Error(json.errors[0]?.message || 'AniList GraphQL error');
  }
  return json.data;
};

/**
 * Fetch ALL 5 live anime feeds directly from AniList in 2 slim parallel GraphQL calls:
 * - trending (Global live trending spikes, strictly deduplicated against Top 10 Ongoing)
 * - ongoing (Current season live releasing hits sorted by popularity & score)
 * - latest (Real episodes that literally just aired minutes/hours ago)
 * - schedule (Weekly airing calendar)
 * - upcoming (Most anticipated upcoming releases)
 */
export const fetchClientLiveAnimeDashboard = async (forceRefresh = false) => {
  const nowMs = Date.now();
  if (!forceRefresh && dashboardCache && (nowMs - dashboardCacheTs < CACHE_TTL)) {
    return dashboardCache;
  }
  if (dashboardInflight) {
    return dashboardInflight;
  }

  dashboardInflight = (async () => {
    try {
      const { season, year } = getCurrentAnimeSeason();
      const { season: nextSeason, year: nextYear } = getNextAnimeSeason();
      const todayInt = getFuzzyDateInt(new Date());
      const nowSec = Math.floor(Date.now() / 1000);
      const twoWeeksAgoSec = nowSec - 14 * 24 * 3600;

      const mainQuery = `
        query ($season: MediaSeason, $year: Int, $nextSeason: MediaSeason, $nextYear: Int, $todayInt: FuzzyDateInt) {
          trending: Page(page: 1, perPage: 34) {
            media(type: ANIME, status_in: [RELEASING, FINISHED], sort: [TRENDING_DESC, POPULARITY_DESC], isAdult: false) {
              ${ANILIST_FIELDS}
            }
          }
          ongoingSeason: Page(page: 1, perPage: 24) {
            media(type: ANIME, status: RELEASING, season: $season, seasonYear: $year, sort: [POPULARITY_DESC, SCORE_DESC], isAdult: false) {
              ${ANILIST_FIELDS}
            }
          }
          upcomingNextSeason: Page(page: 1, perPage: 24) {
            media(type: ANIME, status: NOT_YET_RELEASED, season: $nextSeason, seasonYear: $nextYear, sort: [POPULARITY_DESC, TRENDING_DESC], isAdult: false) {
              ${ANILIST_FIELDS}
            }
          }
          upcomingDated: Page(page: 1, perPage: 24) {
            media(type: ANIME, status: NOT_YET_RELEASED, startDate_greater: $todayInt, sort: [POPULARITY_DESC, TRENDING_DESC], isAdult: false) {
              ${ANILIST_FIELDS}
            }
          }
        }
      `;

      const scheduleQuery = `
        query ($now: Int, $from: Int) {
          latestAired: Page(page: 1, perPage: 45) {
            airingSchedules(airingAt_greater: $from, airingAt_lesser: $now, sort: [TIME_DESC]) {
              episode
              airingAt
              media {
                isAdult
                popularity
                ${ANILIST_FIELDS}
              }
            }
          }
          schedule: Page(page: 1, perPage: 50) {
            media(type: ANIME, status: RELEASING, sort: [POPULARITY_DESC, TRENDING_DESC], isAdult: false) {
              ${ANILIST_FIELDS}
            }
          }
          scheduleMore: Page(page: 2, perPage: 35) {
            media(type: ANIME, status: RELEASING, sort: [POPULARITY_DESC, TRENDING_DESC], isAdult: false) {
              ${ANILIST_FIELDS}
            }
          }
        }
      `;

      const [mainData, schedData] = await Promise.all([
        queryAniList(mainQuery, { season, year, nextSeason, nextYear, todayInt }),
        queryAniList(scheduleQuery, { now: nowSec, from: twoWeeksAgoSec }).catch(() => ({}))
      ]);

      const rawSchedule = [
        ...(schedData?.schedule?.media || []),
        ...(schedData?.scheduleMore?.media || [])
      ].map(mapAniListCard);
      const scheduleSeen = new Set();
      const schedule = [];
      for (const item of rawSchedule) {
        if (!scheduleSeen.has(item.id)) {
          scheduleSeen.add(item.id);
          schedule.push(item);
        }
      }
      const seasonOngoing = (mainData?.ongoingSeason?.media || []).map(mapAniListCard);
      const ongoingIds = new Set(seasonOngoing.map((a) => a.id));
      const ongoing = [...seasonOngoing];
      for (const item of schedule) {
        if (ongoing.length >= 24) break;
        if (!ongoingIds.has(item.id)) {
          ongoingIds.add(item.id);
          ongoing.push(item);
        }
      }

      // Deduplicate Top Trending against Top 10 Ongoing so Home & Search tabs are completely distinct!
      const topOngoingIds = new Set(ongoing.slice(0, 10).map((a) => a.id));
      const rawTrending = (mainData?.trending?.media || []).map(mapAniListCard);
      const distinctTrending = rawTrending.filter((a) => !topOngoingIds.has(a.id));
      const trending = (distinctTrending.length >= 10 ? distinctTrending : rawTrending).slice(0, 24);

      const seenLatest = new Set();
      const latest = [];
      for (const entry of (schedData?.latestAired?.airingSchedules || [])) {
        const m = entry?.media;
        if (!m || m.isAdult || (m.popularity || 0) < 1200 || seenLatest.has(m.id)) continue;
        seenLatest.add(m.id);
        latest.push(formatLatestAiredCard(entry, nowSec));
        if (latest.length >= 24) break;
      }

      // Prioritize NEXT broadcast season premieres first, then dated near-future premieres (no undated TBA spam at top)
      const nextSeasonUpcoming = (mainData?.upcomingNextSeason?.media || []).map(mapAniListCard);
      const datedUpcoming = (mainData?.upcomingDated?.media || []).map(mapAniListCard);
      const upcomingSeen = new Set();
      const upcoming = [];
      for (const item of [...nextSeasonUpcoming, ...datedUpcoming]) {
        if (!upcomingSeen.has(item.id)) {
          upcomingSeen.add(item.id);
          upcoming.push(item);
          if (upcoming.length >= 24) break;
        }
      }

      const [tEnriched, oEnriched, lEnriched, sEnriched, uEnriched] = await Promise.all([
        enrichRecentAnimeMovies(trending),
        enrichRecentAnimeMovies(ongoing.slice(0, 24)),
        enrichRecentAnimeMovies(latest.length > 0 ? latest : ongoing.slice(0, 24)),
        enrichRecentAnimeMovies(schedule.length > 0 ? schedule : ongoing),
        enrichRecentAnimeMovies(upcoming)
      ]);

      const bundle = {
        trending: tEnriched,
        ongoing: oEnriched,
        latest: lEnriched,
        schedule: sEnriched,
        upcoming: uEnriched
      };

      dashboardCache = bundle;
      dashboardCacheTs = Date.now();
      return bundle;
    } catch (err) {
      console.warn('[ClientLiveAnime] Direct AniList dashboard fetch failed:', err.message);
      return dashboardCache || null;
    } finally {
      dashboardInflight = null;
    }
  })();

  return dashboardInflight;
};

/**
 * Fetch a paginated live anime feed for Search Discover Mode and Catalog "View All" pages.
 */
export const fetchClientLiveAnimePage = async ({
  category = 'trending',
  page = 1,
  perPage = 24,
  year = null,
  genre = null,
  format = null,
  country = null,
  forceRefresh = false
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const normCat = category || 'trending';
  const normFormat = format && VALID_ANIME_FORMATS.has(String(format).toUpperCase())
    ? String(format).toUpperCase()
    : null;
  const normCountry = country && VALID_ANILIST_COUNTRIES.has(String(country).toUpperCase())
    ? String(country).toUpperCase()
    : null;
  const hasFilters = Boolean(year || genre || normFormat || normCountry);

  // Instant cached path for page 1 without custom filters
  if (pageNum === 1 && !hasFilters && ['trending', 'ongoing', 'latest', 'upcoming', 'schedule'].includes(normCat)) {
    const bundle = await fetchClientLiveAnimeDashboard(forceRefresh);
    if (bundle && bundle[normCat] && bundle[normCat].length > 0) {
      return bundle[normCat];
    }
  }

  const cacheKey = `${normCat}_${pageNum}_${year || ''}_${genre || ''}_${normFormat || ''}_${normCountry || ''}`;
  const cached = pageCache.get(cacheKey);
  if (!forceRefresh && cached && (Date.now() - cached.ts < CACHE_TTL)) {
    return cached.data;
  }

  const { genre: filterGenre, tag: filterTag, tagIn: filterTagIn, sortOverride } = resolveAniListFilter(genre);

  // Dedicated Live Airing Schedule query for "Latest Episode" deeper pages
  if (normCat === 'latest' && !hasFilters) {
    try {
      const nowSec = Math.floor(Date.now() / 1000);
      const monthAgoSec = nowSec - 30 * 24 * 3600;
      const latestQuery = `
        query ($page: Int, $now: Int, $from: Int) {
          Page(page: $page, perPage: 45) {
            airingSchedules(airingAt_greater: $from, airingAt_lesser: $now, sort: [TIME_DESC]) {
              episode
              airingAt
              media {
                isAdult
                popularity
                ${ANILIST_FIELDS}
              }
            }
          }
        }
      `;
      const data = await queryAniList(latestQuery, { page: pageNum, now: nowSec, from: monthAgoSec });
      const seen = new Set();
      const cards = [];
      for (const entry of (data?.Page?.airingSchedules || [])) {
        const m = entry?.media;
        if (!m || m.isAdult || (m.popularity || 0) < 1200 || seen.has(m.id)) continue;
        seen.add(m.id);
        cards.push(formatLatestAiredCard(entry, nowSec));
        if (cards.length >= perPage) break;
      }
      if (cards.length > 0) {
        pageCache.set(cacheKey, { data: cards, ts: Date.now() });
        return cards;
      }
    } catch (err) {
      console.warn('[ClientLiveAnime] Latest episodes page failed:', err.message);
      if (cached?.data) return cached.data;
    }
  }

  const { season: curSeason, year: curYear } = getCurrentAnimeSeason();
  let sort = ['TRENDING_DESC', 'POPULARITY_DESC'];
  let status = null;
  let statusIn = null;
  let useCurrentSeason = false;

  if (normCat === 'ongoing') {
    status = 'RELEASING';
    sort = ['POPULARITY_DESC', 'SCORE_DESC'];
    if (!year && !filterGenre && !filterTag && !filterTagIn && !normFormat && !normCountry && pageNum <= 2) {
      useCurrentSeason = true;
    }
  } else if (normCat === 'latest') {
    status = 'RELEASING';
    sort = ['TRENDING_DESC', 'POPULARITY_DESC'];
  } else if (normCat === 'schedule') {
    status = 'RELEASING';
    sort = ['POPULARITY_DESC', 'TRENDING_DESC'];
  } else if (normCat === 'upcoming') {
    status = 'NOT_YET_RELEASED';
    sort = ['POPULARITY_DESC', 'TRENDING_DESC'];
  } else if (normCat === 'top_rated') {
    sort = ['SCORE_DESC', 'POPULARITY_DESC'];
  } else {
    statusIn = ['RELEASING', 'FINISHED'];
    sort = ['TRENDING_DESC', 'POPULARITY_DESC'];
  }

  if (sortOverride && normCat !== 'upcoming') {
    sort = sortOverride;
  }

  const query = `
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus, $statusIn: [MediaStatus], $season: MediaSeason, $seasonYear: Int, $startDateGreater: FuzzyDateInt, $genre: String, $tag: String, $tagIn: [String], $format: MediaFormat, $countryOfOrigin: CountryCode) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: $sort, status: $status, status_in: $statusIn, season: $season, seasonYear: $seasonYear, startDate_greater: $startDateGreater, genre: $genre, tag: $tag, tag_in: $tagIn, format: $format, countryOfOrigin: $countryOfOrigin, isAdult: false) {
          ${ANILIST_FIELDS}
        }
      }
    }
  `;

  const variables = {
    page: pageNum,
    perPage: Math.min(50, perPage || 24),
    sort
  };
  if (status) variables.status = status;
  if (statusIn) variables.statusIn = statusIn;
  if (useCurrentSeason) {
    variables.season = curSeason;
    variables.seasonYear = curYear;
  } else if (year && !isNaN(parseInt(year, 10))) {
    variables.seasonYear = parseInt(year, 10);
  } else if (normCat === 'upcoming') {
    variables.startDateGreater = getFuzzyDateInt(new Date());
  }
  if (filterGenre) variables.genre = filterGenre;
  if (filterTag) variables.tag = filterTag;
  if (filterTagIn) variables.tagIn = filterTagIn;
  if (normFormat) variables.format = normFormat;
  if (normCountry) variables.countryOfOrigin = normCountry;

  try {
    const data = await queryAniList(query, variables);
    let items = data?.Page?.media || [];
    if (items.length === 0 && (useCurrentSeason || variables.startDateGreater)) {
      delete variables.season;
      delete variables.seasonYear;
      delete variables.startDateGreater;
      const retryData = await queryAniList(query, variables);
      items = retryData?.Page?.media || [];
    }
    if (items.length > 0) {
      const mapped = await enrichRecentAnimeMovies(items.map(mapAniListCard));
      pageCache.set(cacheKey, { data: mapped, ts: Date.now() });
      return mapped;
    }
  } catch (err) {
    console.warn(`[ClientLiveAnime:${normCat}] Direct AniList failed:`, err.message);
    if (cached?.data) return cached.data;
  }
  return null;
};

/**
 * Direct Browser Live AniList Text Search for Anime (supports Type: TV/MOVIE/OVA/ONA/SPECIAL + Country: JP/CN/KR + Genre + Year).
 */
export const searchClientLiveAniListAnime = async ({
  query = '',
  page = 1,
  perPage = 24,
  year = null,
  genre = null,
  format = null,
  country = null
}) => {
  const q = String(query || '').trim();
  if (!q) return null;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const normFormat = format && VALID_ANIME_FORMATS.has(String(format).toUpperCase())
    ? String(format).toUpperCase()
    : null;
  const normCountry = country && VALID_ANILIST_COUNTRIES.has(String(country).toUpperCase())
    ? String(country).toUpperCase()
    : null;
  const { genre: filterGenre, tag: filterTag, tagIn: filterTagIn } = resolveAniListFilter(genre);

  const gql = `
    query ($search: String, $page: Int, $perPage: Int, $seasonYear: Int, $genre: String, $tag: String, $tagIn: [String], $format: MediaFormat, $countryOfOrigin: CountryCode) {
      Page(page: $page, perPage: $perPage) {
        media(search: $search, type: ANIME, sort: [SEARCH_MATCH, POPULARITY_DESC], seasonYear: $seasonYear, genre: $genre, tag: $tag, tag_in: $tagIn, format: $format, countryOfOrigin: $countryOfOrigin, isAdult: false) {
          ${ANILIST_FIELDS}
        }
      }
    }
  `;

  const variables = {
    search: q,
    page: pageNum,
    perPage: Math.min(50, perPage || 24)
  };
  if (year && !isNaN(parseInt(year, 10))) variables.seasonYear = parseInt(year, 10);
  if (filterGenre) variables.genre = filterGenre;
  if (filterTag) variables.tag = filterTag;
  if (filterTagIn) variables.tagIn = filterTagIn;
  if (normFormat) variables.format = normFormat;
  if (normCountry) variables.countryOfOrigin = normCountry;

  try {
    const data = await queryAniList(gql, variables);
    const items = data?.Page?.media || [];
    return await enrichRecentAnimeMovies(items.map(mapAniListCard));
  } catch (err) {
    console.warn('[ClientLiveAnime:search] Direct AniList search failed:', err.message);
    return null;
  }
};

const detailCache = new Map();

// Helper: Resolve authoritative TMDB ID, type ('tv'|'movie'), target season & episode offset via backend mapper
const resolveAnimeTmdbFromBackend = async ({
  alId,
  malId,
  titleEnglish,
  titleRomaji,
  titleNative,
  format,
  startDate,
  seasonYear,
  countryOfOrigin,
  prequels = []
}) => {
  try {
    const params = new URLSearchParams();
    if (alId) params.set('alId', String(alId));
    if (malId) params.set('malId', String(malId));
    if (titleEnglish) params.set('titleEnglish', titleEnglish);
    if (titleRomaji) params.set('titleRomaji', titleRomaji);
    if (titleNative) params.set('titleNative', titleNative);
    if (format) params.set('format', format);
    if (startDate) params.set('startDate', startDate);
    if (seasonYear) params.set('seasonYear', String(seasonYear));
    if (countryOfOrigin) params.set('countryOfOrigin', countryOfOrigin);
    if (prequels.length > 0) params.set('prequels', prequels.join('|'));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);
    const res = await fetch(`/api/media/anime/resolve-tmdb?${params.toString()}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.tmdbId) {
      return data;
    }
  } catch {
    // Graceful fallback handled downstream
  }
  return null;
};

/**
 * Fetch complete rich anime details directly from AniList GraphQL in the browser (0% Render IP throttling!)
 * Automatically resolves numeric TMDB ID in parallel so all 10 streaming servers work seamlessly.
 */
export const fetchClientAniListDetail = async (rawId) => {
  const cleanId = String(rawId || '').replace(/^al_/i, '');
  const numId = parseInt(cleanId, 10);
  if (!numId || isNaN(numId)) return null;

  const cached = detailCache.get(numId);
  if (cached && (Date.now() - cached.ts < 15 * 60 * 1000)) {
    return cached.data;
  }

  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        countryOfOrigin
        title { english romaji native }
        description(asHtml: false)
        coverImage { extraLarge large medium }
        bannerImage
        startDate { year month day }
        season
        seasonYear
        averageScore
        meanScore
        status
        format
        episodes
        duration
        genres
        trailer { id site }
        nextAiringEpisode { episode airingAt timeUntilAiring }
        relations {
          edges {
            relationType
            node {
              id
              title { english romaji }
              format
              status
              episodes
              startDate { year month day }
              seasonYear
              coverImage { extraLarge large }
            }
          }
        }
        characters(sort: [ROLE, RELEVANCE], perPage: 20) {
          edges {
            role
            node {
              id
              name { full }
              image { large medium }
            }
            voiceActors(language: JAPANESE, sort: [RELEVANCE]) {
              id
              name { full }
              image { large medium }
            }
          }
        }
        staff(perPage: 10) {
          edges {
            role
            node {
              id
              name { full }
              image { large medium }
            }
          }
        }
        recommendations(sort: [RATING_DESC], perPage: 10) {
          nodes {
            mediaRecommendation {
              id
              title { english romaji }
              coverImage { large medium }
              format
              status
              seasonYear
              startDate { year month day }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await queryAniList(query, { id: numId });
    const m = data?.Media;
    if (!m) return null;

    const fullTitle = m.title?.english || m.title?.romaji || m.title?.native || 'Untitled Anime';
    const currentPoster = m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium || null;
    const epCount = m.episodes || (m.nextAiringEpisode?.episode ? Math.max(12, m.nextAiringEpisode.episode) : 12);
    const relDateStr = formatDate(m.startDate, m.seasonYear);
    const prequelTitles = (m.relations?.edges || [])
      .filter((e) => e?.relationType === 'PREQUEL' && e.node && e.node.format !== 'MANGA' && e.node.format !== 'NOVEL')
      .map((e) => e.node.title?.english || e.node.title?.romaji || '')
      .filter(Boolean);

    // Resolve authoritative TMDB ID, type ('tv'|'movie'), target season, and episode offset
    const mappedTmdb = await resolveAnimeTmdbFromBackend({
      alId: m.id,
      malId: m.idMal,
      titleEnglish: m.title?.english,
      titleRomaji: m.title?.romaji,
      titleNative: m.title?.native,
      format: m.format,
      startDate: relDateStr,
      seasonYear: m.seasonYear,
      countryOfOrigin: m.countryOfOrigin || 'JP',
      prequels: prequelTitles
    });
    const tmdbId = mappedTmdb?.tmdbId || null;
    const tmdbType = mappedTmdb?.tmdbType || (m.format === 'MOVIE' ? 'movie' : 'tv');
    const episodeOffset = mappedTmdb?.episodeOffset || 0;

    // Detect season number from verified Fribb/TMDB mapping or title fallback
    const sMatch = fullTitle.match(/season\s*(\d+)|(\d+)(?:nd|rd|th)?\s*season/i);
    const detectedSeason = mappedTmdb?.tmdbSeason || (sMatch ? parseInt(sMatch[1] || sMatch[2], 10) : 1);

    // Build seasons map from TMDB seasons (when non-flattened TV) + current entry + AniList relations
    const seasonsMap = new Map();
    if (tmdbType === 'tv' && episodeOffset === 0 && Array.isArray(mappedTmdb?.tmdbSeasons)) {
      mappedTmdb.tmdbSeasons.forEach((s) => {
        if (s.season_number > 0) {
          seasonsMap.set(s.season_number, {
            id: s.id,
            season_number: s.season_number,
            name: s.name || `Season ${s.season_number}`,
            episode_count: s.episode_count || epCount,
            poster_path: s.poster_path || currentPoster,
            air_date: s.air_date || relDateStr
          });
        }
      });
    }
    if (!seasonsMap.has(detectedSeason) || episodeOffset > 0) {
      seasonsMap.set(detectedSeason, {
        id: m.id,
        season_number: detectedSeason,
        name: fullTitle.toLowerCase().includes('season') ? fullTitle : `Season ${detectedSeason}`,
        episode_count: epCount,
        poster_path: currentPoster,
        air_date: relDateStr
      });
    }

    const relatedFranchise = [];
    const seenRel = new Set([m.id]);
    (m.relations?.edges || []).forEach((edge) => {
      const node = edge?.node;
      if (!node || node.format === 'MANGA' || node.format === 'NOVEL' || node.format === 'ONE_SHOT') return;
      const relTitle = node.title?.english || node.title?.romaji || '';
      if (!seenRel.has(node.id)) {
        seenRel.add(node.id);
        relatedFranchise.push({
          id: `al_${node.id}`,
          title: relTitle,
          badge: node.format === 'MOVIE' ? 'MOVIE' : (edge.relationType || 'ANIME'),
          type: 'anime',
          format: node.format || null,
          status: node.status || null,
          full_release_date: formatDate(node.startDate, node.seasonYear),
          release_date: node.seasonYear ? String(node.seasonYear) : '',
          poster_path: node.coverImage?.extraLarge || node.coverImage?.large || null,
          overview: ''
        });
      }

      const relMatch = relTitle.match(/season\s*(\d+)|(\d+)(?:nd|rd|th)?\s*season/i);
      let sNum = relMatch ? parseInt(relMatch[1] || relMatch[2], 10) : null;
      if (!sNum) {
        if (edge.relationType === 'SEQUEL') sNum = detectedSeason + 1;
        else if (edge.relationType === 'PREQUEL' && detectedSeason > 1) sNum = detectedSeason - 1;
      }
      if (sNum && !seasonsMap.has(sNum)) {
        seasonsMap.set(sNum, {
          id: `al_${node.id}`,
          season_number: sNum,
          name: relTitle || `Season ${sNum}`,
          episode_count: node.episodes || 12,
          poster_path: node.coverImage?.extraLarge || node.coverImage?.large || currentPoster,
          air_date: node.seasonYear ? `${node.seasonYear}-01-01` : ''
        });
      }
    });

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

    // Build Cast & Crew
    const cast = [];
    const seenPersonKeys = new Set();
    (m.characters?.edges || []).forEach((c) => {
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

    (m.staff?.edges || []).forEach((s) => {
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
      .filter((r) => r?.mediaRecommendation)
      .map((r) => {
        const rec = r.mediaRecommendation;
        return {
          id: `al_${rec.id}`,
          title: rec.title?.english || rec.title?.romaji || 'Anime',
          poster_path: rec.coverImage?.large || rec.coverImage?.medium || null,
          media_type: 'anime',
          format: rec.format || null,
          status: rec.status || null,
          release_date: formatDate(rec.startDate, rec.seasonYear)
        };
      });

    let resolvedQuality = getMediaQuality({
      media_type: 'anime',
      status: m.status || null,
      format: m.format,
      release_date: relDateStr
    });

    if (m.format === 'MOVIE' && tmdbId) {
      const hydrated = await hydrateMediaQualities([
        {
          id: `al_${m.id}`,
          tmdb_id: tmdbId,
          title: fullTitle,
          media_type: 'anime',
          format: m.format,
          status: m.status || null,
          release_date: relDateStr
        }
      ]);
      if (hydrated[0]?.quality) {
        resolvedQuality = hydrated[0].quality;
      }
    }

    const [enrichedRel, enrichedRec] = await Promise.all([
      enrichRecentAnimeMovies(relatedFranchise),
      enrichRecentAnimeMovies(recommendations)
    ]);

    const details = {
      id: `al_${m.id}`,
      external_media_id: `al_${m.id}`,
      anilist_id: m.id,
      mal_id: m.idMal || null,
      tmdb_id: tmdbId || null,
      tmdb_type: tmdbType,
      episode_offset: episodeOffset,
      title: fullTitle,
      name: fullTitle,
      overview: m.description ? m.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '',
      poster_path: currentPoster,
      backdrop_path: m.bannerImage || currentPoster,
      release_date: relDateStr,
      vote_average: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : (m.meanScore ? Number((m.meanScore / 10).toFixed(1)) : 8.0),
      genres: (m.genres || []).map((g) => ({ id: g, name: g })),
      media_type: 'anime',
      status: m.status || null,
      quality: resolvedQuality,
      format: m.format === 'TV' && detectedSeason > 1 ? `Season ${detectedSeason}` : (m.format === 'MOVIE' ? 'Movie' : (m.format || 'Anime')),
      episodes_count: epCount,
      duration: m.duration || mappedTmdb?.runtime || 24,
      runtime: m.duration || mappedTmdb?.runtime || 24,
      number_of_seasons: seasons.filter((s) => s.season_number > 0).length || 1,
      number_of_episodes: epCount,
      default_season: detectedSeason,
      seasons,
      related_franchise: enrichedRel,
      youtube_trailer: m.trailer?.site?.toLowerCase() === 'youtube' ? m.trailer.id : null,
      cast,
      recommendations: enrichedRec,
      video_url: null,
      embed_url: tmdbId
        ? (tmdbType === 'movie' || m.format === 'MOVIE'
            ? `https://vidsrc.to/embed/movie/${tmdbId}`
            : `https://vidsrc.to/embed/tv/${tmdbId}/${detectedSeason}/${1 + episodeOffset}`)
        : null
    };

    detailCache.set(numId, { data: details, ts: Date.now() });
    return details;
  } catch (err) {
    console.warn('[ClientLiveAnime] Direct detail fetch failed:', err.message);
    return null;
  }
};

/**
 * Generate clean fallback episodes array when TMDB doesn't have a brand-new anime season yet.
 */
export const buildSyntheticAnimeEpisodes = (detail, seasonNum) => {
  const sNum = parseInt(seasonNum, 10) || 1;
  const targetSeason = detail?.seasons?.find((s) => s.season_number === sNum);
  const epCount = Math.min(200, targetSeason?.episode_count || detail?.episodes_count || 12);
  const still = targetSeason?.poster_path || detail?.backdrop_path || detail?.poster_path || null;
  const eps = [];
  for (let ep = 1; ep <= epCount; ep++) {
    eps.push({
      id: `${detail?.id || 'anime'}_s${sNum}_e${ep}`,
      episode_number: ep,
      season_number: sNum,
      name: `Episode ${ep}`,
      overview: '',
      still_path: still
    });
  }
  return {
    name: targetSeason?.name || `Season ${sNum}`,
    season_number: sNum,
    poster_path: still,
    overview: detail?.overview || '',
    episodes: eps
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// DIRECT BROWSER LIVE MANGA ENGINE (AniList GraphQL — CORS enabled, 0% Render 429!)
// ─────────────────────────────────────────────────────────────────────────────

const getMangaFormatLabel = (m) => {
  if (m?.countryOfOrigin === 'KR') return 'Manhwa';
  if (m?.countryOfOrigin === 'CN') return 'Manhua';
  if (m?.format === 'ONE_SHOT') return 'One-Shot';
  return 'Manga';
};

const mapAniListMangaCard = (m, feedMode = 'trending') => {
  const title = m.title?.english || m.title?.romaji || m.title?.native || 'Untitled Manga';
  const cleanOverview = m.description
    ? m.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    : '';
  const score = m.averageScore
    ? Number((m.averageScore / 10).toFixed(1))
    : (m.meanScore ? Number((m.meanScore / 10).toFixed(1)) : 0);
  const formatLabel = getMangaFormatLabel(m);
  const releaseDate = formatDate(m.startDate, m.startDate?.year);

  let badgeText = `${formatLabel} • Live`;
  if (feedMode === 'upcoming' || m.status === 'NOT_YET_RELEASED') {
    badgeText = m.startDate?.year
      ? formatPremiereLabel(m.startDate, null, m.startDate.year)
      : `Upcoming • ${formatLabel}`;
  } else if (feedMode === 'latest') {
    if (m.startDate?.year && m.startDate?.month) {
      const mon = MONTH_SHORT[m.startDate.month - 1] || '';
      badgeText = `New ${mon} ${m.startDate.year} • ${formatLabel}`;
    } else if (m.startDate?.year) {
      badgeText = `New ${m.startDate.year} • ${formatLabel}`;
    } else {
      badgeText = `Fresh • ${formatLabel}`;
    }
  } else if (feedMode === 'ongoing') {
    badgeText = m.chapters ? `Ongoing • ${m.chapters} Ch` : `Ongoing • ${formatLabel}`;
  } else {
    badgeText = m.status === 'RELEASING' ? `Trending • Ongoing` : `Trending • ${formatLabel}`;
  }

  return {
    id: `al_m_${m.id}`,
    external_media_id: `al_m_${m.id}`,
    anilist_id: m.id,
    title,
    name: title,
    overview: cleanOverview,
    poster_path: m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium || null,
    backdrop_path: m.bannerImage || m.coverImage?.extraLarge || m.coverImage?.large || null,
    release_date: releaseDate,
    first_air_date: releaseDate,
    vote_average: score,
    media_type: 'manga',
    status: m.status || null,
    format: formatLabel,
    chapters_count: m.chapters || null,
    volumes_count: m.volumes || null,
    genres: (m.genres || []).map((g) => ({ id: g, name: g })),
    broadcast: badgeText
  };
};

/**
 * Fetch ALL 4 live manga feeds directly from AniList in a single batched CORS GraphQL call:
 * - trending (Global live trending manga & manhwa spikes)
 * - ongoing (Top ongoing serializations, strictly deduplicated against Top 10 Trending)
 * - latest (Fresh 2025-2026 hit serializations, deduplicated against Top 10 Trending/Ongoing)
 * - upcoming (Upcoming NOT_YET_RELEASED manga & newly launching current-year titles)
 */
export const fetchClientLiveMangaDashboard = async (forceRefresh = false) => {
  const nowMs = Date.now();
  if (!forceRefresh && mangaDashboardCache && (nowMs - mangaDashboardCacheTs < CACHE_TTL)) {
    return mangaDashboardCache;
  }
  if (mangaDashboardInflight) {
    return mangaDashboardInflight;
  }

  mangaDashboardInflight = (async () => {
    try {
      const now = new Date();
      const eighteenMonthsAgo = new Date(now.getTime() - 540 * 24 * 3600 * 1000);
      const recentStartInt = getFuzzyDateInt(eighteenMonthsAgo);
      const thisYearStartInt = parseInt(`${now.getUTCFullYear()}0101`, 10);

      const query = `
        query ($recentStartInt: FuzzyDateInt, $thisYearStartInt: FuzzyDateInt) {
          trending: Page(page: 1, perPage: 34) {
            media(type: MANGA, format_in: [MANGA, ONE_SHOT], status_in: [RELEASING, FINISHED], sort: [TRENDING_DESC, POPULARITY_DESC], isAdult: false) {
              ${ANILIST_MANGA_FIELDS}
            }
          }
          ongoing: Page(page: 1, perPage: 34) {
            media(type: MANGA, format_in: [MANGA, ONE_SHOT], status: RELEASING, sort: [POPULARITY_DESC, SCORE_DESC], isAdult: false) {
              ${ANILIST_MANGA_FIELDS}
            }
          }
          latest: Page(page: 1, perPage: 34) {
            media(type: MANGA, format_in: [MANGA, ONE_SHOT], status: RELEASING, startDate_greater: $recentStartInt, sort: [POPULARITY_DESC, TRENDING_DESC], isAdult: false) {
              ${ANILIST_MANGA_FIELDS}
            }
          }
          upcoming: Page(page: 1, perPage: 24) {
            media(type: MANGA, format_in: [MANGA, ONE_SHOT], status: NOT_YET_RELEASED, sort: [POPULARITY_DESC, TRENDING_DESC], isAdult: false) {
              ${ANILIST_MANGA_FIELDS}
            }
          }
          upcomingLaunching: Page(page: 1, perPage: 20) {
            media(type: MANGA, format_in: [MANGA, ONE_SHOT], status: RELEASING, startDate_greater: $thisYearStartInt, sort: [START_DATE_DESC, POPULARITY_DESC], isAdult: false) {
              ${ANILIST_MANGA_FIELDS}
            }
          }
        }
      `;

      const data = await queryAniList(query, { recentStartInt, thisYearStartInt });

      const trending = (data?.trending?.media || []).slice(0, 24).map((m) => mapAniListMangaCard(m, 'trending'));
      const topTrendingIds = new Set(trending.slice(0, 10).map((m) => m.id));

      const rawOngoing = (data?.ongoing?.media || []).map((m) => mapAniListMangaCard(m, 'ongoing'));
      const distinctOngoing = rawOngoing.filter((m) => !topTrendingIds.has(m.id));
      const ongoing = (distinctOngoing.length >= 10 ? distinctOngoing : rawOngoing).slice(0, 24);
      const topOngoingIds = new Set(ongoing.slice(0, 10).map((m) => m.id));

      const minRecentYear = now.getUTCFullYear() - 1;
      const rawLatest = (data?.latest?.media || [])
        .filter((m) => !m.startDate?.year || m.startDate.year >= minRecentYear)
        .map((m) => mapAniListMangaCard(m, 'latest'));
      const distinctLatest = rawLatest.filter((m) => !topTrendingIds.has(m.id) && !topOngoingIds.has(m.id));
      const latest = (distinctLatest.length >= 10 ? distinctLatest : rawLatest).slice(0, 24);

      const rawUpcoming = (data?.upcoming?.media || []).map((m) => mapAniListMangaCard(m, 'upcoming'));
      const upcomingSeen = new Set(rawUpcoming.map((m) => m.id));
      const upcoming = [...rawUpcoming];
      if (upcoming.length < 16) {
        const launching = (data?.upcomingLaunching?.media || []).map((m) => mapAniListMangaCard(m, 'latest'));
        for (const item of launching) {
          if (upcoming.length >= 24) break;
          if (!upcomingSeen.has(item.id)) {
            upcomingSeen.add(item.id);
            upcoming.push(item);
          }
        }
      }

      const formatMangaRelativeUpdate = (updatedAtSec) => {
        if (!updatedAtSec) return 'Live Ongoing';
        const diffSec = Math.max(60, Math.floor(Date.now() / 1000) - updatedAtSec);
        const mins = Math.floor(diffSec / 60);
        if (mins < 60) return `Updated ${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `Updated ${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return days === 1 ? 'Updated Yesterday' : `Updated ${days}d ago`;
      };

      const scheduleManga = (data?.trending?.media || [])
        .filter((m) => m.status === 'RELEASING')
        .slice(0, 16)
        .map((m) => ({
          ...mapAniListMangaCard(m, 'ongoing'),
          updated_at: m.updatedAt || null,
          broadcast: formatMangaRelativeUpdate(m.updatedAt)
        }));

      const bundle = {
        trending,
        ongoing,
        latest,
        schedule: scheduleManga.length > 0 ? scheduleManga : ongoing.slice(0, 16),
        upcoming: upcoming.slice(0, 24)
      };

      mangaDashboardCache = bundle;
      mangaDashboardCacheTs = Date.now();
      return bundle;
    } catch (err) {
      console.warn('[ClientLiveManga] Direct AniList manga dashboard fetch failed:', err.message);
      return mangaDashboardCache || null;
    } finally {
      mangaDashboardInflight = null;
    }
  })();

  return mangaDashboardInflight;
};

/**
 * Fetch a paginated live manga feed for Search Discover Mode and Catalog "View All" pages.
 */
export const fetchClientLiveMangaPage = async ({
  category = 'trending',
  page = 1,
  perPage = 24,
  year = null,
  genre = null,
  country = null,
  forceRefresh = false
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const normCat = category || 'trending';
  const normCountry = country && VALID_ANILIST_COUNTRIES.has(String(country).toUpperCase())
    ? String(country).toUpperCase()
    : null;
  const hasFilters = Boolean(year || genre || normCountry);

  if (pageNum === 1 && !hasFilters && ['trending', 'ongoing', 'latest', 'upcoming'].includes(normCat)) {
    const bundle = await fetchClientLiveMangaDashboard(forceRefresh);
    if (bundle && bundle[normCat] && bundle[normCat].length > 0) {
      return bundle[normCat];
    }
  }

  const cacheKey = `manga_${normCat}_${pageNum}_${year || ''}_${genre || ''}_${normCountry || ''}`;
  const cached = mangaPageCache.get(cacheKey);
  if (!forceRefresh && cached && (Date.now() - cached.ts < CACHE_TTL)) {
    return cached.data;
  }

  const { genre: filterGenre, tag: filterTag, tagIn: filterTagIn, sortOverride } = resolveAniListFilter(genre);

  let sort = ['TRENDING_DESC', 'POPULARITY_DESC'];
  let status = null;
  let statusIn = null;
  let startDateGreater = null;
  let startDateLesser = null;

  if (normCat === 'ongoing') {
    status = 'RELEASING';
    sort = ['POPULARITY_DESC', 'SCORE_DESC'];
  } else if (normCat === 'latest') {
    status = 'RELEASING';
    sort = ['POPULARITY_DESC', 'TRENDING_DESC'];
    if (!year) {
      const eighteenMonthsAgo = new Date(Date.now() - 540 * 24 * 3600 * 1000);
      startDateGreater = getFuzzyDateInt(eighteenMonthsAgo);
    }
  } else if (normCat === 'upcoming') {
    status = 'NOT_YET_RELEASED';
    sort = ['POPULARITY_DESC', 'TRENDING_DESC'];
  } else if (normCat === 'top_rated') {
    sort = ['SCORE_DESC', 'POPULARITY_DESC'];
  } else {
    statusIn = ['RELEASING', 'FINISHED'];
    sort = ['TRENDING_DESC', 'POPULARITY_DESC'];
  }

  if (sortOverride && normCat !== 'upcoming') {
    sort = sortOverride;
  }

  if (year && !isNaN(parseInt(year, 10))) {
    const y = parseInt(year, 10);
    startDateGreater = parseInt(`${y}0000`, 10);
    startDateLesser = parseInt(`${y}9999`, 10);
  }

  const query = `
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus, $statusIn: [MediaStatus], $startDateGreater: FuzzyDateInt, $startDateLesser: FuzzyDateInt, $genre: String, $tag: String, $tagIn: [String], $countryOfOrigin: CountryCode) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, format_in: [MANGA, ONE_SHOT], sort: $sort, status: $status, status_in: $statusIn, startDate_greater: $startDateGreater, startDate_lesser: $startDateLesser, genre: $genre, tag: $tag, tag_in: $tagIn, countryOfOrigin: $countryOfOrigin, isAdult: false) {
          ${ANILIST_MANGA_FIELDS}
        }
      }
    }
  `;

  const variables = {
    page: pageNum,
    perPage: Math.min(50, perPage || 24),
    sort
  };
  if (status) variables.status = status;
  if (statusIn) variables.statusIn = statusIn;
  if (startDateGreater) variables.startDateGreater = startDateGreater;
  if (startDateLesser) variables.startDateLesser = startDateLesser;
  if (filterGenre) variables.genre = filterGenre;
  if (filterTag) variables.tag = filterTag;
  if (filterTagIn) variables.tagIn = filterTagIn;
  if (normCountry) variables.countryOfOrigin = normCountry;

  try {
    const data = await queryAniList(query, variables);
    let items = data?.Page?.media || [];
    if (items.length === 0 && normCat === 'upcoming' && pageNum === 1) {
      delete variables.status;
      variables.status = 'RELEASING';
      variables.sort = ['START_DATE_DESC', 'POPULARITY_DESC'];
      const retryData = await queryAniList(query, variables);
      items = retryData?.Page?.media || [];
    }
    if (items.length > 0) {
      const mapped = items.map((m) => mapAniListMangaCard(m, normCat));
      mangaPageCache.set(cacheKey, { data: mapped, ts: Date.now() });
      return mapped;
    }
  } catch (err) {
    console.warn(`[ClientLiveManga:${normCat}] Direct AniList failed:`, err.message);
    if (cached?.data) return cached.data;
  }
  return null;
};

/**
 * Direct Browser Live AniList Text Search for Manga (supports Country: JP/CN/KR + Genre + Year).
 */
export const searchClientLiveAniListManga = async ({
  query = '',
  page = 1,
  perPage = 24,
  year = null,
  genre = null,
  country = null
}) => {
  const q = String(query || '').trim();
  if (!q) return null;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const normCountry = country && VALID_ANILIST_COUNTRIES.has(String(country).toUpperCase())
    ? String(country).toUpperCase()
    : null;
  const { genre: filterGenre, tag: filterTag, tagIn: filterTagIn } = resolveAniListFilter(genre);

  let startDateGreater = null;
  let startDateLesser = null;
  if (year && !isNaN(parseInt(year, 10))) {
    const y = parseInt(year, 10);
    startDateGreater = parseInt(`${y}0000`, 10);
    startDateLesser = parseInt(`${y}9999`, 10);
  }

  const gql = `
    query ($search: String, $page: Int, $perPage: Int, $startDateGreater: FuzzyDateInt, $startDateLesser: FuzzyDateInt, $genre: String, $tag: String, $tagIn: [String], $countryOfOrigin: CountryCode) {
      Page(page: $page, perPage: $perPage) {
        media(search: $search, type: MANGA, format_in: [MANGA, ONE_SHOT], sort: [SEARCH_MATCH, POPULARITY_DESC], startDate_greater: $startDateGreater, startDate_lesser: $startDateLesser, genre: $genre, tag: $tag, tag_in: $tagIn, countryOfOrigin: $countryOfOrigin, isAdult: false) {
          ${ANILIST_MANGA_FIELDS}
        }
      }
    }
  `;

  const variables = {
    search: q,
    page: pageNum,
    perPage: Math.min(50, perPage || 24)
  };
  if (startDateGreater) variables.startDateGreater = startDateGreater;
  if (startDateLesser) variables.startDateLesser = startDateLesser;
  if (filterGenre) variables.genre = filterGenre;
  if (filterTag) variables.tag = filterTag;
  if (filterTagIn) variables.tagIn = filterTagIn;
  if (normCountry) variables.countryOfOrigin = normCountry;

  try {
    const data = await queryAniList(gql, variables);
    const items = data?.Page?.media || [];
    return items.map((m) => mapAniListMangaCard(m, 'trending'));
  } catch (err) {
    console.warn('[ClientLiveManga:search] Direct AniList manga search failed:', err.message);
    return null;
  }
};

// Helper: Resolve MangaDex UUID for a live AniList manga title so chapters load seamlessly in MangaReader
const resolveMangaDexIdForTitle = async (titleEnglish, titleRomaji) => {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const candidates = [];
  [titleEnglish, titleRomaji].forEach((t) => {
    if (t && t.trim().length >= 2 && !candidates.includes(t.trim())) {
      candidates.push(t.trim());
    }
  });

  for (const q of candidates.slice(0, 2)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(
        `/api/media/search?type=manga&query=${encodeURIComponent(q)}&page=1`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (!res.ok) continue;
      const list = await res.json();
      if (Array.isArray(list)) {
        const lowerQ = q.toLowerCase();
        const exact = list.find((item) => UUID_RE.test(String(item?.id || '')) && (item.title || '').toLowerCase() === lowerQ);
        if (exact) return String(exact.id);
        const firstUuid = list.find((item) => UUID_RE.test(String(item?.id || '')));
        if (firstUuid) return String(firstUuid.id);
      }
    } catch {
      // Ignore timeout/network blip and try next candidate
    }
  }
  return null;
};

/**
 * Fetch complete rich manga details directly from AniList GraphQL in the browser (0% Render 429!),
 * automatically resolving MangaDex UUID in parallel so chapters load directly in MangaReader.
 */
export const fetchClientAniListMangaDetail = async (rawId) => {
  const cleanId = String(rawId || '').replace(/^al_m_/i, '').replace(/^al_/i, '');
  const numId = parseInt(cleanId, 10);
  if (!numId || isNaN(numId)) return null;

  const cached = mangaDetailCache.get(numId);
  if (cached && (Date.now() - cached.ts < 15 * 60 * 1000)) {
    return cached.data;
  }

  const query = `
    query ($id: Int) {
      Media(id: $id, type: MANGA) {
        id
        idMal
        title { english romaji native }
        description(asHtml: false)
        coverImage { extraLarge large medium }
        bannerImage
        startDate { year month day }
        averageScore
        meanScore
        status
        format
        chapters
        volumes
        countryOfOrigin
        genres
        staff(perPage: 12) {
          edges {
            role
            node {
              id
              name { full }
              image { large medium }
            }
          }
        }
        characters(sort: [ROLE, RELEVANCE], perPage: 16) {
          edges {
            role
            node {
              id
              name { full }
              image { large medium }
            }
          }
        }
        relations {
          edges {
            relationType
            node {
              id
              type
              title { english romaji }
              format
              seasonYear
              startDate { year }
              coverImage { extraLarge large }
            }
          }
        }
        recommendations(sort: [RATING_DESC], perPage: 10) {
          nodes {
            mediaRecommendation {
              id
              title { english romaji }
              coverImage { large medium }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await queryAniList(query, { id: numId });
    const m = data?.Media;
    if (!m) return null;

    const fullTitle = m.title?.english || m.title?.romaji || m.title?.native || 'Untitled Manga';
    const currentPoster = m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium || null;
    const formatLabel = getMangaFormatLabel(m);

    // Resolve MangaDex UUID so readable chapters load automatically
    const mangadexId = await resolveMangaDexIdForTitle(m.title?.english, m.title?.romaji);

    const cast = [];
    const seenPeople = new Set();
    (m.staff?.edges || []).forEach((s) => {
      if (!s?.node?.id) return;
      const key = `al_staff_${s.node.id}`;
      if (seenPeople.has(key)) return;
      seenPeople.add(key);
      cast.push({
        id: String(s.node.id),
        source: 'anilist_staff',
        name: s.node.name?.full || 'Author',
        character: s.role || 'Story & Art',
        role_type: 'Crew',
        profile_path: s.node.image?.large || s.node.image?.medium || null
      });
    });

    (m.characters?.edges || []).forEach((c) => {
      if (!c?.node?.id) return;
      cast.push({
        id: String(c.node.id),
        source: 'anilist_char',
        name: c.node.name?.full || 'Character',
        character: c.role || 'Character',
        role_type: 'Cast',
        profile_path: c.node.image?.large || c.node.image?.medium || null
      });
    });

    const relatedFranchise = [];
    const seenRel = new Set([m.id]);
    (m.relations?.edges || []).forEach((edge) => {
      const node = edge?.node;
      if (!node || seenRel.has(node.id)) return;
      seenRel.add(node.id);
      const isAnime = node.type === 'ANIME';
      relatedFranchise.push({
        id: isAnime ? `al_${node.id}` : `al_m_${node.id}`,
        title: node.title?.english || node.title?.romaji || 'Related Title',
        badge: isAnime ? 'ANIME' : (edge.relationType || 'MANGA'),
        type: isAnime ? 'anime' : 'manga',
        release_date: String(node.seasonYear || node.startDate?.year || ''),
        poster_path: node.coverImage?.extraLarge || node.coverImage?.large || null,
        overview: ''
      });
    });

    const recommendations = (m.recommendations?.nodes || [])
      .filter((r) => r?.mediaRecommendation)
      .map((r) => ({
        id: `al_m_${r.mediaRecommendation.id}`,
        title: r.mediaRecommendation.title?.english || r.mediaRecommendation.title?.romaji || 'Manga',
        poster_path: r.mediaRecommendation.coverImage?.large || r.mediaRecommendation.coverImage?.medium || null,
        media_type: 'manga'
      }));

    const details = {
      id: `al_m_${m.id}`,
      external_media_id: `al_m_${m.id}`,
      anilist_id: m.id,
      mal_id: m.idMal || null,
      mangadex_id: mangadexId || null,
      title: fullTitle,
      name: fullTitle,
      overview: m.description ? m.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : 'No description available.',
      poster_path: currentPoster,
      backdrop_path: m.bannerImage || currentPoster,
      release_date: formatDate(m.startDate, m.startDate?.year),
      vote_average: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : (m.meanScore ? Number((m.meanScore / 10).toFixed(1)) : 8.0),
      genres: (m.genres || []).map((g) => ({ id: g, name: g })),
      media_type: 'manga',
      status: m.status || null,
      format: formatLabel,
      chapters_count: m.chapters || null,
      volumes_count: m.volumes || null,
      youtube_trailer: null,
      cast,
      related_franchise: relatedFranchise,
      recommendations
    };

    mangaDetailCache.set(numId, { data: details, ts: Date.now() });
    return details;
  } catch (err) {
    console.warn('[ClientLiveManga] Direct manga detail fetch failed:', err.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Direct Browser Anime & Manga Character Search Engine (AniList GraphQL)
// Runs directly from the user's browser IP (CORS: Access-Control-Allow-Origin: *)
// Zero Render IP 429 throttling, 100% case-insensitive, supports character names,
// aliases, alternative names (e.g. "Grid", "Greed", "Sung Jin-Woo"), and series titles.
// ─────────────────────────────────────────────────────────────────────────────

const clientAnimeCharCache = new Map();

/**
 * Live search anime & manga characters directly from AniList
 * Fully case-insensitive, checks full names, aliases/alternative names, and media titles
 * @param {string} queryText Character or series query (e.g. "grid", "Grid", "overgeared", "ramparts of ice")
 * @returns {Promise<Array>} Array of character avatar objects
 */
export const searchClientLiveAnimeCharacters = async (queryText) => {
  const rawQuery = (queryText || '').trim();
  if (!rawQuery) return [];

  const normalized = rawQuery.toLowerCase();
  const cacheKey = `char_${normalized}`;

  if (clientAnimeCharCache.has(cacheKey)) {
    const cached = clientAnimeCharCache.get(cacheKey);
    if (Date.now() - cached.ts < 10 * 60 * 1000) {
      return cached.data;
    }
  }

  // Dual search query: character search + media character nodes search
  const gql = `
    query($q: String) {
      charSearch: Page(page: 1, perPage: 40) {
        characters(search: $q, sort: [SEARCH_MATCH, FAVOURITES_DESC]) {
          id
          name { full userPreferred native alternative first last }
          image { large medium }
          favourites
          media(page: 1, perPage: 4, sort: POPULARITY_DESC) {
            nodes {
              id
              type
              format
              title { english romaji native userPreferred }
              synonyms
            }
          }
        }
      }
      mediaSearch: Page(page: 1, perPage: 8) {
        media(search: $q, sort: [SEARCH_MATCH, POPULARITY_DESC]) {
          id
          type
          format
          title { english romaji native userPreferred }
          synonyms
          characters(page: 1, perPage: 25, sort: [ROLE, FAVOURITES_DESC]) {
            nodes {
              id
              name { full userPreferred native alternative first last }
              image { large medium }
              favourites
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(ANILIST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query: gql, variables: { q: rawQuery } })
    });

    if (!res.ok) {
      throw new Error(`AniList HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json.errors && !json.data) {
      throw new Error(json.errors[0]?.message || 'AniList GraphQL error');
    }

    const seen = new Set();
    const results = [];
    const tokens = normalized.split(/\s+/).filter((t) => t.length >= 2);

    const ingestChar = (c, defaultSeries = null, defaultType = 'anime', defaultFormat = 'TV', boost = 0) => {
      if (!c || !c.id || seen.has(c.id)) return;
      const imgUrl = c.image?.large || c.image?.medium || '';
      if (!imgUrl || imgUrl.includes('default.jpg')) return;
      seen.add(c.id);

      const fullName = c.name?.full || c.name?.userPreferred || 'Anime Character';
      const altNames = Array.isArray(c.name?.alternative)
        ? c.name.alternative.filter(Boolean)
        : [];
      const mediaNodes = c.media?.nodes || [];

      const isManga =
        String(defaultType).toLowerCase() === 'manga' ||
        String(defaultFormat).toLowerCase() === 'manga' ||
        String(defaultFormat).toLowerCase() === 'novel' ||
        String(defaultFormat).toLowerCase() === 'one_shot' ||
        String(defaultFormat).toLowerCase() === 'manhwa' ||
        String(defaultFormat).toLowerCase() === 'manhua' ||
        mediaNodes.some((m) => {
          const t = String(m?.type || '').toLowerCase();
          const f = String(m?.format || '').toLowerCase();
          return t === 'manga' || f === 'manga' || f === 'novel' || f === 'one_shot';
        });

      const primaryMedia = mediaNodes[0];
      const seriesTitle =
        defaultSeries ||
        primaryMedia?.title?.english ||
        primaryMedia?.title?.romaji ||
        primaryMedia?.title?.userPreferred ||
        'Anime & Manga';

      const formatTag = isManga ? 'Manga' : (primaryMedia?.format || defaultFormat || 'Anime');
      const typeTag = isManga ? 'manga' : 'anime';

      // 100% case-insensitive relevance scoring
      let score = boost;
      const lowerFull = fullName.toLowerCase();
      const lowerAlts = altNames.map((a) => String(a).toLowerCase());
      const lowerSeries = seriesTitle.toLowerCase();

      // Check exact query match in full name or alternative names (e.g. "grid", "Grid", "GRID")
      if (lowerFull === normalized || lowerAlts.includes(normalized)) {
        score += 500;
      } else if (lowerFull.includes(normalized) || lowerAlts.some((a) => a.includes(normalized))) {
        score += 250;
      }

      // Check query tokens
      for (const tok of tokens) {
        if (lowerFull.includes(tok)) score += 60;
        if (lowerAlts.some((a) => a.includes(tok))) score += 70;
        if (lowerSeries.includes(tok)) score += 40;
      }

      // Popularity bonus
      score += Math.min(Math.floor((c.favourites || 0) / 20), 50);

      results.push({
        id: `al-char-${c.id}`,
        name: fullName,
        series: seriesTitle,
        format: formatTag,
        type: typeTag,
        url: imgUrl,
        score,
        prompt: `${formatTag} character ${fullName} from ${seriesTitle}, high quality artwork portrait`
      });
    };

    // 1. Ingest direct character search results
    (json.data?.charSearch?.characters || []).forEach((c, idx) => {
      ingestChar(c, null, 'anime', 'TV', 120 - Math.min(idx * 2, 40));
    });

    // 2. Ingest series/media match characters
    (json.data?.mediaSearch?.media || []).forEach((m, mIdx) => {
      const sTitle = m.title?.english || m.title?.romaji || m.title?.userPreferred || 'Anime';
      const isMangaMedia =
        m.type === 'MANGA' ||
        m.format === 'MANGA' ||
        m.format === 'NOVEL' ||
        m.format === 'ONE_SHOT';

      (m.characters?.nodes || []).forEach((c, cIdx) => {
        ingestChar(
          c,
          sTitle,
          isMangaMedia ? 'manga' : 'anime',
          m.format || (isMangaMedia ? 'Manga' : 'TV'),
          150 - Math.min(mIdx * 15 + cIdx * 3, 60)
        );
      });
    });

    // Sort by relevance score descending
    results.sort((a, b) => b.score - a.score);

    const finalResults = results.slice(0, 80);
    clientAnimeCharCache.set(cacheKey, { data: finalResults, ts: Date.now() });
    return finalResults;
  } catch (err) {
    console.warn('[searchClientLiveAnimeCharacters] Direct search error:', err.message);
    return [];
  }
};

/**
 * Fetch top iconic anime and manga characters for profile studio initial load
 */
export const fetchClientLiveIconicAnimeCharacters = async () => {
  const cacheKey = 'iconic_characters';
  if (clientAnimeCharCache.has(cacheKey)) {
    const cached = clientAnimeCharCache.get(cacheKey);
    if (Date.now() - cached.ts < 30 * 60 * 1000) {
      return cached.data;
    }
  }

  const gql = `
    query {
      Page(page: 1, perPage: 30) {
        characters(sort: FAVOURITES_DESC) {
          id
          name { full native userPreferred alternative }
          favourites
          image { large medium }
          media(page: 1, perPage: 2, sort: POPULARITY_DESC) {
            nodes {
              type
              format
              title { english romaji native userPreferred }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(ANILIST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query: gql })
    });

    if (!res.ok) throw new Error(`AniList HTTP ${res.status}`);
    const json = await res.json();
    const rawChars = json.data?.Page?.characters || [];

    const formatted = rawChars
      .filter((c) => {
        const img = c?.image?.large || c?.image?.medium || '';
        return Boolean(img && !img.includes('default.jpg'));
      })
      .map((c) => {
        const primaryMedia = c.media?.nodes?.[0];
        const series =
          primaryMedia?.title?.english ||
          primaryMedia?.title?.romaji ||
          primaryMedia?.title?.userPreferred ||
          'Anime';
        const fullName = c.name?.full || c.name?.userPreferred || 'Anime Character';
        const isManga =
          primaryMedia?.type === 'MANGA' ||
          primaryMedia?.format === 'MANGA' ||
          primaryMedia?.format === 'NOVEL';
        const formatTag = isManga ? 'Manga' : (primaryMedia?.format || 'Anime');
        return {
          id: `al-char-${c.id}`,
          name: fullName,
          series,
          format: formatTag,
          type: isManga ? 'manga' : 'anime',
          prompt: `${formatTag} character ${fullName} from ${series}, high quality studio portrait`,
          url: c.image.large || c.image.medium
        };
      });

    clientAnimeCharCache.set(cacheKey, { data: formatted, ts: Date.now() });
    return formatted;
  } catch (err) {
    console.warn('[fetchClientLiveIconicAnimeCharacters] Error:', err.message);
    return [];
  }
};
