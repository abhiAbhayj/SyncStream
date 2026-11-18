/**
 * Direct Browser Live Anime Engine (AniList GraphQL — CORS enabled: Access-Control-Allow-Origin: *)
 * Runs directly from the user's browser IP (90 req/min per user), completely eliminating
 * Render shared-IP rate-limiting and ensuring 100% live Trending, Ongoing, Latest Episode,
 * Schedule, and Upcoming anime across Home, Search, and Catalog pages.
 */

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

const ANIME_FILTER_MAP = {
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
  'k_9194': { tag: 'Harem' },
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
  'k_3133': { tag: 'Vampire' }
};

const ANILIST_MANGA_FIELDS = `
  id
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
`;

const MANGA_FILTER_MAP = {
  '391b0423-d847-456f-aff0-8b0cfc03066b': { genre: 'Action' },
  '87cc87cd-a395-47af-b27a-93258283bbc6': { genre: 'Adventure' },
  '4d32cc48-9f00-4cca-9b5a-a839f0764984': { genre: 'Comedy' },
  '423e2eae-a7a2-4a8b-ac03-a8351462d71d': { genre: 'Romance' },
  'cdc58593-87dd-415e-bbc0-2ec27bf404cc': { genre: 'Fantasy' },
  'b9af3a63-f058-46de-a9a0-e0c13906197a': { genre: 'Drama' },
  '256c8bd9-4904-4360-bf4f-508a76d67183': { genre: 'Sci-Fi' },
  'eabc5b4c-6aff-42f3-b657-3e90cbd00b75': { genre: 'Supernatural' },
  'ace04997-f6bd-436e-b261-779182193d3d': { tag: 'Isekai' },
  'aafb99c1-7f60-43fa-b75f-fc9502ce29c7': { tag: 'Harem' },
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
  if (m.status === 'NOT_YET_RELEASED') {
    broadcastText = formatPremiereLabel(m.startDate, m.season, m.seasonYear);
  } else if (m.nextAiringEpisode?.airingAt) {
    const airDate = new Date(m.nextAiringEpisode.airingAt * 1000);
    if (!isNaN(airDate.getTime())) {
      broadcastDay = ANIME_DAYS_OF_WEEK[airDate.getDay()];
      const dayShort = broadcastDay.slice(0, -1);
      const nextEp = m.nextAiringEpisode.episode;
      broadcastText = nextEp ? `Ep ${nextEp} • Airs ${dayShort}` : `Airs every ${dayShort}`;
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
          schedule: Page(page: 1, perPage: 36) {
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

      const schedule = (schedData?.schedule?.media || []).map(mapAniListCard);
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

      const bundle = {
        trending,
        ongoing: ongoing.slice(0, 24),
        latest: latest.length > 0 ? latest : ongoing.slice(0, 24),
        schedule: schedule.length > 0 ? schedule : ongoing,
        upcoming
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
  forceRefresh = false
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const normCat = category || 'trending';
  const hasFilters = Boolean(year || genre);

  // Instant cached path for page 1 without custom filters
  if (pageNum === 1 && !hasFilters && ['trending', 'ongoing', 'latest', 'upcoming', 'schedule'].includes(normCat)) {
    const bundle = await fetchClientLiveAnimeDashboard(forceRefresh);
    if (bundle && bundle[normCat] && bundle[normCat].length > 0) {
      return bundle[normCat];
    }
  }

  const cacheKey = `${normCat}_${pageNum}_${year || ''}_${genre || ''}`;
  const cached = pageCache.get(cacheKey);
  if (!forceRefresh && cached && (Date.now() - cached.ts < CACHE_TTL)) {
    return cached.data;
  }

  let filterGenre = null;
  let filterTag = null;
  if (genre) {
    const mapped = ANIME_FILTER_MAP[String(genre)];
    if (mapped) {
      filterGenre = mapped.genre || null;
      filterTag = mapped.tag || null;
    } else if (isNaN(Number(genre)) && !String(genre).startsWith('k_') && !String(genre).startsWith('g_')) {
      filterGenre = String(genre);
    }
  }

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
    if (!year && !filterGenre && !filterTag && pageNum <= 2) {
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

  const query = `
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus, $statusIn: [MediaStatus], $season: MediaSeason, $seasonYear: Int, $startDateGreater: FuzzyDateInt, $genre: String, $tag: String) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: $sort, status: $status, status_in: $statusIn, season: $season, seasonYear: $seasonYear, startDate_greater: $startDateGreater, genre: $genre, tag: $tag, isAdult: false) {
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
      const mapped = items.map(mapAniListCard);
      pageCache.set(cacheKey, { data: mapped, ts: Date.now() });
      return mapped;
    }
  } catch (err) {
    console.warn(`[ClientLiveAnime:${normCat}] Direct AniList failed:`, err.message);
    if (cached?.data) return cached.data;
  }
  return null;
};

const detailCache = new Map();

// Helper: Resolve numeric TMDB ID for an AniList anime via backend TMDB search (never blocked!)
const resolveTmdbIdForAnimeTitle = async (titleEnglish, titleRomaji, format) => {
  const candidates = [];
  const addCandidate = (t) => {
    if (!t) return;
    const clean = t
      .replace(/season\s*\d+|\d+(?:nd|rd|th)?\s*season|part\s*\d+|\d+(?:nd|rd|th)?\s*cour|final\s*season/gi, '')
      .replace(/[:\-–—]\s*$/, '')
      .trim();
    if (clean && clean.length >= 2 && !candidates.includes(clean)) candidates.push(clean);
    if (t.trim() && !candidates.includes(t.trim())) candidates.push(t.trim());
  };
  addCandidate(titleEnglish);
  addCandidate(titleRomaji);

  const searchType = format === 'MOVIE' ? 'movie' : 'anime';
  for (const q of candidates.slice(0, 3)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(
        `/api/media/search?type=${encodeURIComponent(searchType)}&query=${encodeURIComponent(q)}&page=1`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (!res.ok) continue;
      const list = await res.json();
      if (Array.isArray(list)) {
        // Prefer numeric TMDB ID (not al_ prefixed)
        const numericMatch = list.find((item) => item?.id && /^\d+$/.test(String(item.id)));
        if (numericMatch) {
          return String(numericMatch.id);
        }
      }
    } catch {
      // Ignore abort / network hiccup and try next candidate
    }
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
              episodes
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

    // Detect season number from title (e.g. "Season 3", "2nd Season", "3rd Season")
    const sMatch = fullTitle.match(/season\s*(\d+)|(\d+)(?:nd|rd|th)?\s*season/i);
    const detectedSeason = sMatch ? parseInt(sMatch[1] || sMatch[2], 10) : 1;

    // Resolve TMDB ID for all 10 streaming mirrors (safe, never throws)
    const tmdbId = await resolveTmdbIdForAnimeTitle(m.title?.english, m.title?.romaji, m.format);

    // Build seasons map from current entry + AniList relations
    const seasonsMap = new Map();
    seasonsMap.set(detectedSeason, {
      id: m.id,
      season_number: detectedSeason,
      name: fullTitle.toLowerCase().includes('season') ? fullTitle : `Season ${detectedSeason}`,
      episode_count: epCount,
      poster_path: currentPoster,
      air_date: formatDate(m.startDate, m.seasonYear)
    });

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
      .map((r) => ({
        id: `al_${r.mediaRecommendation.id}`,
        title: r.mediaRecommendation.title?.english || r.mediaRecommendation.title?.romaji || 'Anime',
        poster_path: r.mediaRecommendation.coverImage?.large || r.mediaRecommendation.coverImage?.medium || null,
        media_type: 'anime'
      }));

    const details = {
      id: `al_${m.id}`,
      external_media_id: `al_${m.id}`,
      anilist_id: m.id,
      mal_id: m.idMal || null,
      tmdb_id: tmdbId || null,
      title: fullTitle,
      name: fullTitle,
      overview: m.description ? m.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '',
      poster_path: currentPoster,
      backdrop_path: m.bannerImage || currentPoster,
      release_date: formatDate(m.startDate, m.seasonYear),
      vote_average: m.averageScore ? Number((m.averageScore / 10).toFixed(1)) : (m.meanScore ? Number((m.meanScore / 10).toFixed(1)) : 8.0),
      genres: (m.genres || []).map((g) => ({ id: g, name: g })),
      media_type: 'anime',
      status: m.status || null,
      format: m.format === 'TV' && detectedSeason > 1 ? `Season ${detectedSeason}` : (m.format === 'MOVIE' ? 'Movie' : (m.format || 'Anime')),
      episodes_count: epCount,
      duration: m.duration || 24,
      runtime: m.duration || 24,
      number_of_seasons: seasons.filter((s) => s.season_number > 0).length || 1,
      number_of_episodes: epCount,
      default_season: detectedSeason,
      seasons,
      related_franchise: relatedFranchise,
      youtube_trailer: m.trailer?.site?.toLowerCase() === 'youtube' ? m.trailer.id : null,
      cast,
      recommendations,
      video_url: null,
      embed_url: tmdbId
        ? (m.format === 'MOVIE'
            ? `https://vidsrc.to/embed/movie/${tmdbId}`
            : `https://vidsrc.to/embed/tv/${tmdbId}/${detectedSeason}/1`)
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

      const bundle = {
        trending,
        ongoing,
        latest,
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
  forceRefresh = false
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const normCat = category || 'trending';
  const hasFilters = Boolean(year || genre);

  if (pageNum === 1 && !hasFilters && ['trending', 'ongoing', 'latest', 'upcoming'].includes(normCat)) {
    const bundle = await fetchClientLiveMangaDashboard(forceRefresh);
    if (bundle && bundle[normCat] && bundle[normCat].length > 0) {
      return bundle[normCat];
    }
  }

  const cacheKey = `manga_${normCat}_${pageNum}_${year || ''}_${genre || ''}`;
  const cached = mangaPageCache.get(cacheKey);
  if (!forceRefresh && cached && (Date.now() - cached.ts < CACHE_TTL)) {
    return cached.data;
  }

  let filterGenre = null;
  let filterTag = null;
  if (genre) {
    const mapped = MANGA_FILTER_MAP[String(genre)];
    if (mapped) {
      filterGenre = mapped.genre || null;
      filterTag = mapped.tag || null;
    } else if (!String(genre).includes('-') && !String(genre).startsWith('d_')) {
      filterGenre = String(genre);
    }
  }

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

  if (year && !isNaN(parseInt(year, 10))) {
    const y = parseInt(year, 10);
    startDateGreater = parseInt(`${y}0000`, 10);
    startDateLesser = parseInt(`${y}9999`, 10);
  }

  const query = `
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus, $statusIn: [MediaStatus], $startDateGreater: FuzzyDateInt, $startDateLesser: FuzzyDateInt, $genre: String, $tag: String) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, format_in: [MANGA, ONE_SHOT], sort: $sort, status: $status, status_in: $statusIn, startDate_greater: $startDateGreater, startDate_lesser: $startDateLesser, genre: $genre, tag: $tag, isAdult: false) {
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
