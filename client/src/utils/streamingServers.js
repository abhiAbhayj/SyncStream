/**
 * Verified Streaming Server Providers Configuration
 * 5 curated, rock-solid, verified streaming servers for Movies, TV Series, and Anime.
 * All 5 servers tested & confirmed 200 OK with NO X-Frame-Options or CSP blocking.
 * Completely free of unstable/blocked "vid" servers, featuring Multi-Audio & Multi-Subtitles.
 */

export const DEFAULT_SERVER_KEY = 'twoembed';

const KNOWN_SERVER_KEYS = new Set([
  'twoembed',
  'autoembed',
  'nontongo',
  'twoembedskin',
  'smashystream'
]);

export const normalizeServerKey = (serverKey) => {
  if (!serverKey || typeof serverKey !== 'string') return DEFAULT_SERVER_KEY;
  const key = serverKey.trim().toLowerCase();

  // Primary active servers
  if (key === 'twoembed') return 'twoembed';
  if (key === 'autoembed' || key === 'autoembedco' || key === 'autoembedcc' || key === 'autoembedpro') return 'autoembed';
  if (key === 'nontongo' || key === 'nontongowin' || key === 'nontongoorg') return 'nontongo';
  if (key === 'twoembedskin') return 'twoembedskin';
  if (key === 'smashystream' || key === 'smashy' || key === 'embedsmashy') return 'smashystream';

  // Legacy mappings: map old / "vid" servers cleanly into these 5 working servers
  if (key === 'vidsrcme' || key === 'vidlink' || key === 'vidfast' || key === 'vidfastpro' || key === 'vidprime' || key === 'vidnest' || key === 'anyembed') {
    return 'twoembed';
  }
  if (key === 'vidsrcto' || key === 'vidsrccc' || key === 'vidsrcnet' || key === 'vidsrcin' || key === 'vidsrcrip' || key === 'vidsrcxyz' || key === 'embedsu') {
    return 'autoembed';
  }
  if (key === 'cinemaos' || key === 'vidrock' || key === 'videasy' || key === 'moviesapi') {
    return 'nontongo';
  }
  if (key === 'multiembed' || key === 'superembed' || key === 'vidsrcpm' || key === 'vidsrcicu' || key === 'vidsrcsh') {
    return 'twoembedskin';
  }

  return KNOWN_SERVER_KEYS.has(key) ? key : DEFAULT_SERVER_KEY;
};

export const STREAMING_SERVERS = [
  {
    key: 'twoembed',
    num: '01',
    name: '2Embed PRO',
    label: 'Server 1 (2Embed PRO Zero Ads)',
    badge: 'HTML5 • Zero Ads',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Ultra-fast HTML5 streaming player with multi-language subtitle tracks and zero intrusive ads'
  },
  {
    key: 'autoembed',
    num: '02',
    name: 'AutoEmbed Cloud',
    label: 'Server 2 (AutoEmbed Cloud Multi-Audio)',
    badge: 'Multi-Audio & Sub',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    description: 'Auto-switching cloud aggregator with automatic failover, international multi-audio and subtitles'
  },
  {
    key: 'nontongo',
    num: '03',
    name: 'NontonGo Multi-Audio',
    label: 'Server 3 (NontonGo Multi-Audio)',
    badge: 'Multi-Audio • Full HD',
    tagColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    description: 'Full HD player with multi-language audio tracks, soft subtitles, and open iframe access'
  },
  {
    key: 'twoembedskin',
    num: '04',
    name: '2Embed Skin',
    label: 'Server 4 (2Embed Skin Multi-Sub)',
    badge: 'Clean Skin • Multi-Sub',
    tagColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
    description: 'Alternative clean skin mirror with customizable subtitle appearance and fast video decoding'
  },
  {
    key: 'smashystream',
    num: '05',
    name: 'SmashyStream PRO',
    label: 'Server 5 (SmashyStream PRO Multi-Server)',
    badge: 'Multi-Server Backup',
    tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    description: 'Multi-server aggregator player with built-in backup streams, audio tracks, and subtitles'
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
      // ── Server 1: 2Embed PRO (HTML5, Zero Ads, Multi-Subtitles) ───────────────
      case 'twoembed':
        baseStreamUrl = `https://www.2embed.cc/embed/${activeId}`;
        break;

      // ── Server 2: AutoEmbed Cloud (Multi-Audio, Multi-Subtitles) ──────────────
      case 'autoembed':
        baseStreamUrl = cleanImdbId
          ? `https://autoembed.co/movie/imdb/${activeId}`
          : `https://autoembed.co/movie/tmdb/${activeId}`;
        break;

      // ── Server 3: NontonGo Multi-Audio (Multi-Audio, Soft Subs) ────────────────
      case 'nontongo':
        baseStreamUrl = `https://www.nontongo.win/embed/movie/${activeId}`;
        break;

      // ── Server 4: 2Embed Skin (Alternative HTML5 Skin Mirror) ─────────────────
      case 'twoembedskin':
        baseStreamUrl = `https://www.2embed.skin/embed/${activeId}`;
        break;

      // ── Server 5: SmashyStream PRO (Multi-Server, Audio/Subs) ─────────────────
      case 'smashystream':
        baseStreamUrl = `https://player.smashystream.com/playere.php?${cleanImdbId ? 'imdb' : 'tmdb'}=${activeId}`;
        break;

      default:
        baseStreamUrl = `https://www.2embed.cc/embed/${activeId}`;
        break;
    }
  } else {
    // TV Shows and Anime
    switch (resolvedKey) {
      // ── Server 1: 2Embed PRO (HTML5, Zero Ads, Multi-Subtitles) ───────────────
      case 'twoembed':
        baseStreamUrl = `https://www.2embed.cc/embedtv/${activeId}&s=${s}&e=${ep}`;
        break;

      // ── Server 2: AutoEmbed Cloud (Multi-Audio, Multi-Subtitles) ──────────────
      case 'autoembed':
        baseStreamUrl = cleanImdbId
          ? `https://autoembed.co/tv/imdb/${activeId}-${s}-${ep}`
          : `https://autoembed.co/tv/tmdb/${activeId}-${s}-${ep}`;
        break;

      // ── Server 3: NontonGo Multi-Audio (Multi-Audio, Soft Subs) ────────────────
      case 'nontongo':
        baseStreamUrl = `https://www.nontongo.win/embed/tv/${activeId}/${s}/${ep}`;
        break;

      // ── Server 4: 2Embed Skin (Alternative HTML5 Skin Mirror) ─────────────────
      case 'twoembedskin':
        baseStreamUrl = `https://www.2embed.skin/embedtv/${activeId}&s=${s}&e=${ep}`;
        break;

      // ── Server 5: SmashyStream PRO (Multi-Server, Audio/Subs) ─────────────────
      case 'smashystream':
        baseStreamUrl = `https://player.smashystream.com/playere.php?${cleanImdbId ? 'imdb' : 'tmdb'}=${activeId}&season=${s}&episode=${ep}`;
        break;

      default:
        baseStreamUrl = `https://www.2embed.cc/embedtv/${activeId}&s=${s}&e=${ep}`;
        break;
    }
  }

  return appendStartTime(baseStreamUrl, startTime);
};
