/**
 * Verified Streaming Server Providers Configuration
 * 5 curated, rock-solid, verified streaming servers for Movies, TV Series, and Anime.
 * All 5 servers support Multi-Audio and/or Multi-Subtitles with high uptime and rapid loading.
 */

export const DEFAULT_SERVER_KEY = 'vidlink';

const KNOWN_SERVER_KEYS = new Set([
  'vidlink',
  'vidsrccc',
  'embedsu',
  'multiembed',
  'twoembed'
]);

export const normalizeServerKey = (serverKey) => {
  if (!serverKey || typeof serverKey !== 'string') return DEFAULT_SERVER_KEY;
  const key = serverKey.trim();

  // Legacy & Alias mappings to ensure stored user preferences always resolve to one of the 5 working servers
  if (key === 'vidfastpro' || key === 'vidfast' || key === 'vidprime' || key === 'vidnest') return 'vidlink';
  if (key === 'vidsrccc' || key === 'vidsrcto' || key === 'vidsrcme' || key === 'vidsrcxyz' || key === 'vidsrcnet' || key === 'vidsrcin' || key === 'vidsrcrip' || key === 'vidsrcpm') return 'vidsrccc';
  if (key === 'vidrock' || key === 'embedsu' || key === 'embedwave' || key === 'cinemaos' || key === 'videasy') return 'embedsu';
  if (key === 'multiembed' || key === 'nontongo' || key === 'superembed' || key === 'autoembed' || key === 'autoembedcc' || key === 'autoembedco' || key === 'autoembedpro') return 'multiembed';
  if (key === 'twoembed' || key === 'twoembedskin' || key === 'smashystream' || key === 'anyembed' || key === 'vidzy' || key === 'warezcdn' || key === 'vidsrcsh' || key === 'moviesapi') return 'twoembed';

  return KNOWN_SERVER_KEYS.has(key) ? key : DEFAULT_SERVER_KEY;
};

export const STREAMING_SERVERS = [
  {
    key: 'vidlink',
    num: '01',
    name: 'VidLink PRO',
    label: 'Server 1 (VidLink PRO Multi-Audio)',
    badge: 'Multi-Audio & Sub',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    description: 'Ultra-fast HD player with multi-language audio, subtitle selection, and native anime support'
  },
  {
    key: 'vidsrccc',
    num: '02',
    name: 'VidSrc CC',
    label: 'Server 2 (VidSrc CC Multi-Audio)',
    badge: 'Multi-Audio',
    tagColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    description: 'Premier VidSrc core mirror — multi-language audio tracks and English subtitles'
  },
  {
    key: 'embedsu',
    num: '03',
    name: 'Embed SU',
    label: 'Server 3 (Embed.SU Multi-Audio)',
    badge: 'Multi-Audio',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Stable multi-language audio and subtitle player with built-in multi-source failover'
  },
  {
    key: 'multiembed',
    num: '04',
    name: 'MultiEmbed',
    label: 'Server 4 (MultiEmbed Hindi/Eng)',
    badge: 'Multi-Audio',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    description: 'Dedicated multi-audio aggregator with Hindi dubs, regional tracks, and English subtitles'
  },
  {
    key: 'twoembed',
    num: '05',
    name: '2Embed PRO',
    label: 'Server 5 (2Embed PRO)',
    badge: 'Multi-Sub',
    tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    description: 'Reliable responsive HTML5 player with multi-language subtitles and zero buffering'
  }
];

export const supportsDirectAnimeId = (serverKey, { hasMalId = false } = {}) => {
  const key = normalizeServerKey(serverKey);
  // VidLink natively supports MAL IDs for anime titles
  if (key === 'vidlink' && hasMalId) return true;
  return false;
};

const appendStartTime = (url, startTime) => {
  if (!startTime || Number(startTime) <= 5) return url;
  const t = Math.floor(Number(startTime));
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}start=${t}&time=${t}&startAt=${t}`;
};

export const getEmbedStreamUrl = ({
  serverKey = DEFAULT_SERVER_KEY,
  mediaType = 'movie',
  id,
  tmdbId,
  imdbId = null,
  malId = null,
  season = 1,
  episode = 1,
  episodeOffset = 0,
  startTime = 0
}) => {
  const resolvedKey = normalizeServerKey(serverKey);
  const isPrefixedAniList = typeof id === 'string' && /^al_/i.test(id);
  const cleanTmdbId = (tmdbId && !/^al_/i.test(String(tmdbId)))
    ? String(tmdbId).replace(/^tmdb_m_/i, '').replace(/_s\d+$/i, '').trim()
    : null;
  const cleanImdbId = imdbId && /^tt\d+/i.test(String(imdbId).trim())
    ? String(imdbId).trim()
    : null;
  const malNumericId = malId && /^\d+$/.test(String(malId).trim())
    ? String(malId).trim()
    : null;

  const s = season || 1;
  const rawEp = episode || 1;
  const ep = cleanTmdbId ? rawEp + (Number(episodeOffset) || 0) : rawEp;

  // Critical Safety Guard:
  // If an AniList entry (al_*) has no verified TMDB ID yet (e.g. cold backend or OVA/Special),
  // ONLY route to native AniList/MAL servers — NEVER pass an AniList ID to TMDB-only servers!
  if (isPrefixedAniList && !cleanTmdbId) {
    if (resolvedKey === 'vidlink' && malNumericId) {
      return appendStartTime(`https://vidlink.pro/anime/${malNumericId}/${rawEp}/sub?primaryColor=06b6d4&secondaryColor=a855f7`, startTime);
    }
    return null;
  }

  // Active identifier priority: verified TMDB ID -> clean IMDb ID -> raw numeric ID
  const activeId = cleanTmdbId || cleanImdbId || String(id || '').replace(/^tmdb_m_/i, '').replace(/_s\d+$/i, '').trim();
  if (!activeId) return null;

  let baseStreamUrl = '';

  if (mediaType === 'movie') {
    switch (resolvedKey) {
      // ── Server 1: VidLink PRO (Multi-Audio, Multi-Sub, Clean HD) ──────────────
      case 'vidlink':
        baseStreamUrl = `https://vidlink.pro/movie/${activeId}?primaryColor=06b6d4&secondaryColor=a855f7`;
        break;

      // ── Server 2: VidSrc CC (Multi-Audio, Multi-Sub, VidSrc v2 Core) ──────────
      case 'vidsrccc':
        baseStreamUrl = `https://vidsrc.cc/v2/embed/movie/${activeId}`;
        break;

      // ── Server 3: Embed.SU (Multi-Audio, Multi-Sub, Fast Failover) ─────────────
      case 'embedsu':
        baseStreamUrl = `https://embed.su/embed/movie/${activeId}`;
        break;

      // ── Server 4: MultiEmbed (Hindi Dubs, Regional Multi-Audio, Eng Sub) ───────
      case 'multiembed':
        baseStreamUrl = `https://multiembed.mov/?video_id=${activeId}&tmdb=1`;
        break;

      // ── Server 5: 2Embed PRO (HTML5 Multi-Sub Mirror) ─────────────────────────
      case 'twoembed':
        baseStreamUrl = `https://www.2embed.cc/embed/${activeId}`;
        break;

      default:
        baseStreamUrl = `https://vidlink.pro/movie/${activeId}?primaryColor=06b6d4&secondaryColor=a855f7`;
        break;
    }
  } else {
    // TV Shows and Anime
    switch (resolvedKey) {
      // ── Server 1: VidLink PRO (Multi-Audio, Multi-Sub, Clean HD) ──────────────
      case 'vidlink':
        baseStreamUrl = `https://vidlink.pro/tv/${activeId}/${s}/${ep}?primaryColor=06b6d4&secondaryColor=a855f7`;
        break;

      // ── Server 2: VidSrc CC (Multi-Audio, Multi-Sub, VidSrc v2 Core) ──────────
      case 'vidsrccc':
        baseStreamUrl = `https://vidsrc.cc/v2/embed/tv/${activeId}/${s}/${ep}`;
        break;

      // ── Server 3: Embed.SU (Multi-Audio, Multi-Sub, Fast Failover) ─────────────
      case 'embedsu':
        baseStreamUrl = `https://embed.su/embed/tv/${activeId}/${s}/${ep}`;
        break;

      // ── Server 4: MultiEmbed (Hindi Dubs, Regional Multi-Audio, Eng Sub) ───────
      case 'multiembed':
        baseStreamUrl = `https://multiembed.mov/?video_id=${activeId}&tmdb=1&s=${s}&e=${ep}`;
        break;

      // ── Server 5: 2Embed PRO (HTML5 Multi-Sub Mirror) ─────────────────────────
      case 'twoembed':
        baseStreamUrl = `https://www.2embed.cc/embedtv/${activeId}&s=${s}&e=${ep}`;
        break;

      default:
        baseStreamUrl = `https://vidlink.pro/tv/${activeId}/${s}/${ep}?primaryColor=06b6d4&secondaryColor=a855f7`;
        break;
    }
  }

  return appendStartTime(baseStreamUrl, startTime);
};
