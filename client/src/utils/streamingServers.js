/**
 * Verified Streaming Server Providers Configuration
 * 5 curated, rock-solid, verified streaming servers for Movies, TV Series, and Anime.
 * All 5 servers tested & confirmed 200 OK with NO X-Frame-Options or CSP blocking.
 * Server 1 (VidSrc ME) features Multi-Audio (Hindi, English, etc.) and Multi-Subtitles.
 */

export const DEFAULT_SERVER_KEY = 'vidsrcme';

const KNOWN_SERVER_KEYS = new Set([
  'vidsrcme',
  'vidsrcto',
  'twoembed',
  'autoembed',
  'twoembedskin'
]);

export const normalizeServerKey = (serverKey) => {
  if (!serverKey || typeof serverKey !== 'string') return DEFAULT_SERVER_KEY;
  const key = serverKey.trim();

  // Legacy & Alias mappings: every past server key cleanly resolves to one of the 5 working servers
  if (key === 'vidsrcme' || key === 'vidlink' || key === 'vidfast' || key === 'vidfastpro' || key === 'vidprime' || key === 'vidnest') {
    return 'vidsrcme';
  }
  if (key === 'vidsrcto' || key === 'vidsrccc' || key === 'vidsrcnet' || key === 'vidsrcin' || key === 'vidsrcrip' || key === 'vidsrcxyz') {
    return 'vidsrcto';
  }
  if (key === 'twoembed' || key === 'smashystream' || key === 'anyembed' || key === 'vidzy' || key === 'warezcdn' || key === 'vidsrcsh' || key === 'moviesapi') {
    return 'twoembed';
  }
  if (key === 'autoembed' || key === 'autoembedcc' || key === 'autoembedco' || key === 'autoembedpro' || key === 'embedsu' || key === 'vidrock' || key === 'cinemaos' || key === 'videasy') {
    return 'autoembed';
  }
  if (key === 'twoembedskin' || key === 'multiembed' || key === 'nontongo' || key === 'superembed' || key === 'vidsrcpm' || key === 'vidsrcicu') {
    return 'twoembedskin';
  }

  return KNOWN_SERVER_KEYS.has(key) ? key : DEFAULT_SERVER_KEY;
};

export const STREAMING_SERVERS = [
  {
    key: 'vidsrcme',
    num: '01',
    name: 'VidSrc ME',
    label: 'Server 1 (VidSrc ME Multi-Audio)',
    badge: 'Multi-Audio & Sub',
    tagColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    description: 'Official VidSrc core engine with multi-language audio (Hindi, English, etc.) & multi-subtitles'
  },
  {
    key: 'vidsrcto',
    num: '02',
    name: 'VidSrc TO',
    label: 'Server 2 (VidSrc TO Global HD)',
    badge: 'Global HD',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    description: 'High-bitrate global cinema and television mirror with multi-language subtitle tracks'
  },
  {
    key: 'twoembed',
    num: '03',
    name: '2Embed PRO',
    label: 'Server 3 (2Embed PRO)',
    badge: 'Zero Ads',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Reliable HTML5 streaming mirror with fast bufferless playback and multi-subtitles'
  },
  {
    key: 'autoembed',
    num: '04',
    name: 'AutoEmbed PRO',
    label: 'Server 4 (AutoEmbed PRO Multi-Node)',
    badge: 'Multi-Node',
    tagColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
    description: 'Auto-switching multi-server aggregator with automated failover and English captions'
  },
  {
    key: 'twoembedskin',
    num: '05',
    name: '2Embed Skin',
    label: 'Server 5 (2Embed Skin Multi-Sub)',
    badge: 'Multi-Sub',
    tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    description: 'Clean alternative skin mirror with fast video decoding and subtitle selection'
  }
];

export const supportsDirectAnimeId = (serverKey) => {
  return true;
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

  const s = season || 1;
  const rawEp = episode || 1;
  const ep = cleanTmdbId ? rawEp + (Number(episodeOffset) || 0) : rawEp;

  // Active identifier priority: verified TMDB ID -> clean IMDb ID -> raw numeric ID
  const activeId = cleanTmdbId || cleanImdbId || String(id || '').replace(/^tmdb_m_/i, '').replace(/_s\d+$/i, '').trim();

  // Safety guard: if an AniList anime has not resolved a TMDB ID yet, do not pass unmapped string to TMDB servers
  if (isPrefixedAniList && !cleanTmdbId) {
    return null;
  }

  if (!activeId) return null;

  let baseStreamUrl = '';

  if (mediaType === 'movie') {
    switch (resolvedKey) {
      // ── Server 1: VidSrc ME (Multi-Audio, Multi-Subtitles) ────────────────────
      case 'vidsrcme':
        baseStreamUrl = `https://vidsrc.me/embed/movie?tmdb=${activeId}`;
        break;

      // ── Server 2: VidSrc TO (Global HD, Multi-Subtitles) ──────────────────────
      case 'vidsrcto':
        baseStreamUrl = `https://vidsrc.to/embed/movie/${activeId}`;
        break;

      // ── Server 3: 2Embed PRO (HTML5, Zero Ads, Multi-Subtitles) ───────────────
      case 'twoembed':
        baseStreamUrl = `https://www.2embed.cc/embed/${activeId}`;
        break;

      // ── Server 4: AutoEmbed PRO (Multi-Server Cloud Aggregator) ───────────────
      case 'autoembed':
        baseStreamUrl = `https://player.autoembed.co/embed/movie/${activeId}`;
        break;

      // ── Server 5: 2Embed Skin (Alternative HTML5 Skin Mirror) ─────────────────
      case 'twoembedskin':
        baseStreamUrl = `https://www.2embed.skin/embed/${activeId}`;
        break;

      default:
        baseStreamUrl = `https://vidsrc.me/embed/movie?tmdb=${activeId}`;
        break;
    }
  } else {
    // TV Shows and Anime
    switch (resolvedKey) {
      // ── Server 1: VidSrc ME (Multi-Audio, Multi-Subtitles) ────────────────────
      case 'vidsrcme':
        baseStreamUrl = `https://vidsrc.me/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
        break;

      // ── Server 2: VidSrc TO (Global HD, Multi-Subtitles) ──────────────────────
      case 'vidsrcto':
        baseStreamUrl = `https://vidsrc.to/embed/tv/${activeId}/${s}/${ep}`;
        break;

      // ── Server 3: 2Embed PRO (HTML5, Zero Ads, Multi-Subtitles) ───────────────
      case 'twoembed':
        baseStreamUrl = `https://www.2embed.cc/embedtv/${activeId}&s=${s}&e=${ep}`;
        break;

      // ── Server 4: AutoEmbed PRO (Multi-Server Cloud Aggregator) ───────────────
      case 'autoembed':
        baseStreamUrl = `https://player.autoembed.co/embed/tv/${activeId}/${s}/${ep}`;
        break;

      // ── Server 5: 2Embed Skin (Alternative HTML5 Skin Mirror) ─────────────────
      case 'twoembedskin':
        baseStreamUrl = `https://www.2embed.skin/embedtv/${activeId}&s=${s}&e=${ep}`;
        break;

      default:
        baseStreamUrl = `https://vidsrc.me/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
        break;
    }
  }

  return appendStartTime(baseStreamUrl, startTime);
};
