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

let dashboardCache = null;
let dashboardCacheTs = 0;
let dashboardInflight = null;
const pageCache = new Map();

export const getCurrentAnimeSeason = () => {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();
  const season = month <= 3 ? 'WINTER' : month <= 6 ? 'SPRING' : month <= 9 ? 'SUMMER' : 'FALL';
  return { season, year };
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
  if (m.nextAiringEpisode?.airingAt) {
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
  } else if (m.status === 'NOT_YET_RELEASED') {
    const sLabel = [m.season, m.seasonYear].filter(Boolean).join(' ');
    broadcastText = sLabel ? `Upcoming • ${sLabel}` : 'Upcoming Release';
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
      const nowSec = Math.floor(Date.now() / 1000);
      const twoWeeksAgoSec = nowSec - 14 * 24 * 3600;

      const mainQuery = `
        query ($season: MediaSeason, $year: Int) {
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
          upcoming: Page(page: 1, perPage: 24) {
            media(type: ANIME, status: NOT_YET_RELEASED, sort: [POPULARITY_DESC, TRENDING_DESC], isAdult: false) {
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
        queryAniList(mainQuery, { season, year }),
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

      const upcoming = (mainData?.upcoming?.media || []).map(mapAniListCard);

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
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus, $statusIn: [MediaStatus], $season: MediaSeason, $seasonYear: Int, $genre: String, $tag: String) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: $sort, status: $status, status_in: $statusIn, season: $season, seasonYear: $seasonYear, genre: $genre, tag: $tag, isAdult: false) {
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
  }
  if (filterGenre) variables.genre = filterGenre;
  if (filterTag) variables.tag = filterTag;

  try {
    const data = await queryAniList(query, variables);
    let items = data?.Page?.media || [];
    if (items.length === 0 && useCurrentSeason) {
      delete variables.season;
      delete variables.seasonYear;
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
