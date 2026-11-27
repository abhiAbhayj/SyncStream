/**
 * Verified Streaming Server Providers Configuration
 * 15 active, free streaming servers for Movies, TV Series, and Anime.
 * Top Vid* and multi-audio servers sit first, all verified against TMDB & IMDb endpoints.
 */

export const DEFAULT_SERVER_KEY = 'vidlink';

const KNOWN_SERVER_KEYS = new Set([
  'vidlink',
  'vidsrccc',
  'embedsu',
  'vidsrcto',
  'vidsrcme',
  'vidsrcxyz',
  'autoembedcc',
  'multiembed',
  'vidsrcnet',
  'twoembed',
  'vidsrcin',
  'vidsrcrip',
  'smashystream',
  'vidsrcpm',
  'twoembedskin'
]);

export const normalizeServerKey = (serverKey) => {
  if (!serverKey || typeof serverKey !== 'string') return DEFAULT_SERVER_KEY;
  const key = serverKey.trim();

  // Legacy & Alias mappings to ensure stored user preferences always resolve to working servers
  if (key === 'vidfastpro' || key === 'vidfast') return 'vidlink';
  if (key === 'vidprime') return 'vidlink';
  if (key === 'vidrock') return 'embedsu';
  if (key === 'cinemaos' || key === 'vidlink_old' || key === 'videasy') return 'vidsrcme';
  if (key === 'vidukimulti' || key === 'anyembed') return 'multiembed';
  if (key === 'vidnest') return 'vidsrcxyz';
  if (key === 'embedwave' || key === 'movies111' || key === 'rgshows') return 'vidsrcto';
  if (key === 'autoembed' || key === 'autoembedco' || key === 'autoembedpro') return 'autoembedcc';
  if (key === 'movietv' || key === 'vidsrcdev') return 'vidsrcnet';
  if (key === 'nontongo' || key === 'vidsrcsu') return 'multiembed';
  if (key === 'primesrc') return 'vidsrcin';
  if (key === 'superembed') return 'multiembed';
  if (key === 'moviesapi') return 'vidsrcrip';
  if (key === 'vidsrcicu') return 'vidsrcrip';
  if (key === 'vidzy' || key === 'warezcdn' || key === 'vidsrcsh') return 'twoembed';

  return KNOWN_SERVER_KEYS.has(key) ? key : DEFAULT_SERVER_KEY;
};

export const STREAMING_SERVERS = [
  {
    key: 'vidlink',
    num: '01',
    name: 'VidLink PRO',
    label: 'Server 1 (VidLink PRO)',
    badge: 'HD Clean',
    tagColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    description: 'Clean ad-light player with crystal-clear HD playback and multi-language subtitles'
  },
  {
    key: 'vidsrccc',
    num: '02',
    name: 'VidSrc CC',
    label: 'Server 2 (VidSrc CC)',
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
    description: 'Stable multi-language audio and subtitle player with built-in source failover'
  },
  {
    key: 'vidsrcto',
    num: '04',
    name: 'VidSrc TO',
    label: 'Server 4 (VidSrc TO)',
    badge: 'Global HD',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    description: 'Extensive global cinema and television mirror with massive media catalog'
  },
  {
    key: 'vidsrcme',
    num: '05',
    name: 'VidSrc ME',
    label: 'Server 5 (VidSrc ME)',
    badge: 'Multi-Audio',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    description: 'Official VidSrc core engine with multi-language audio and subtitle tracks'
  },
  {
    key: 'vidsrcxyz',
    num: '06',
    name: 'VidSrc XYZ',
    label: 'Server 6 (VidSrc XYZ — Anime & Multi-Audio)',
    badge: 'Multi-Audio',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'High-availability node with Hindi & international audio plus native Anime support'
  },
  {
    key: 'autoembedcc',
    num: '07',
    name: 'AutoEmbed CC',
    label: 'Server 7 (AutoEmbed CC)',
    badge: 'Multi-Node',
    tagColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
    description: 'Auto-switching multi-server aggregator with fast backup sources and subtitles'
  },
  {
    key: 'multiembed',
    num: '08',
    name: 'MultiEmbed',
    label: 'Server 8 (MultiEmbed — Multi-Audio)',
    badge: 'Multi-Audio',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    description: 'Multi-source aggregator with Hindi & regional audio tracks plus English subtitles'
  },
  {
    key: 'vidsrcnet',
    num: '09',
    name: 'VidSrc NET',
    label: 'Server 9 (VidSrc NET)',
    badge: 'Eng Sub',
    tagColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    description: 'High-speed cloud embed node with broad catalog coverage and English captions'
  },
  {
    key: 'twoembed',
    num: '10',
    name: '2Embed',
    label: 'Server 10 (2Embed)',
    badge: 'Zero Ads',
    tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    description: 'Reliable multi-source mirror with fast HTML5 playback and English subtitles'
  },
  {
    key: 'vidsrcin',
    num: '11',
    name: 'VidSrc IN',
    label: 'Server 11 (VidSrc IN)',
    badge: 'Multi-Src',
    tagColor: 'text-lime-400 bg-lime-500/10 border-lime-500/20',
    description: 'Indian CDN optimized VidSrc mirror with multi-source failover'
  },
  {
    key: 'vidsrcrip',
    num: '12',
    name: 'VidSrc RIP',
    label: 'Server 12 (VidSrc RIP)',
    badge: 'Multi-Src',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: 'VidSrc RIP cloud node with responsive HTML5 playback'
  },
  {
    key: 'smashystream',
    num: '13',
    name: 'SmashyStream',
    label: 'Server 13 (SmashyStream)',
    badge: 'Multi-Src',
    tagColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    description: 'High-uptime multi-mirror streaming aggregator with adaptive HTML5 player'
  },
  {
    key: 'vidsrcpm',
    num: '14',
    name: 'VidSrc PM',
    label: 'Server 14 (VidSrc PM)',
    badge: 'Multi-Src',
    tagColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    description: 'Direct high-bandwidth VidSrc cloud node for movies and series'
  },
  {
    key: 'twoembedskin',
    num: '15',
    name: '2Embed Skin',
    label: 'Server 15 (2Embed Skin)',
    badge: 'Eng Sub',
    tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    description: 'Alternative 2Embed player with clean UI and multi-language subtitles'
  }
];

export const supportsDirectAnimeId = (serverKey, { hasMalId = false } = {}) => {
  const key = normalizeServerKey(serverKey);
  // vidsrcxyz natively supports MAL IDs for anime titles
  if (key === 'vidsrcxyz' && hasMalId) return true;
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
  const alNumericId = isPrefixedAniList
    ? id.replace(/^al_/i, '').trim()
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
    if (resolvedKey === 'vidsrcxyz' && malNumericId) {
      return appendStartTime(`https://vidsrc.xyz/embed/anime?mal=${malNumericId}&ep=${rawEp}`, startTime);
    }
    return null;
  }

  // Active identifier priority: verified TMDB ID -> clean IMDb ID -> raw numeric ID
  const activeId = cleanTmdbId || cleanImdbId || String(id || '').replace(/^tmdb_m_/i, '').replace(/_s\d+$/i, '').trim();
  if (!activeId) return null;

  let baseStreamUrl = '';

  if (mediaType === 'movie') {
    switch (resolvedKey) {
      // ── Tier 1: Highest Reliability & Cleanest Playback ───────────────────────
      case 'vidlink':
        baseStreamUrl = `https://vidlink.pro/movie/${activeId}`;
        break;
      case 'vidsrccc':
        baseStreamUrl = `https://vidsrc.cc/v2/embed/movie/${activeId}`;
        break;
      case 'embedsu':
        baseStreamUrl = `https://embed.su/embed/movie/${activeId}`;
        break;
      case 'vidsrcto':
        baseStreamUrl = `https://vidsrc.to/embed/movie/${activeId}`;
        break;
      case 'vidsrcme':
        baseStreamUrl = `https://vidsrc.me/embed/movie?tmdb=${activeId}`;
        break;

      // ── Tier 2: Solid Multi-Audio & Mirror Aggregators ─────────────────────────
      case 'vidsrcxyz':
        baseStreamUrl = `https://vidsrc.xyz/embed/movie?tmdb=${activeId}`;
        break;
      case 'autoembedcc':
        baseStreamUrl = `https://player.autoembed.cc/embed/movie/${activeId}`;
        break;
      case 'multiembed':
        baseStreamUrl = `https://multiembed.mov/?video_id=${activeId}&tmdb=1`;
        break;
      case 'vidsrcnet':
        baseStreamUrl = `https://vidsrc.net/embed/movie?tmdb=${activeId}`;
        break;
      case 'twoembed':
        baseStreamUrl = `https://www.2embed.cc/embed/${activeId}`;
        break;

      // ── Tier 3: High-Uptime Backup Mirrors ────────────────────────────────────
      case 'vidsrcin':
        baseStreamUrl = `https://vidsrc.in/embed/movie?tmdb=${activeId}`;
        break;
      case 'vidsrcrip':
        baseStreamUrl = `https://vidsrc.rip/embed/movie/${activeId}`;
        break;
      case 'smashystream':
        baseStreamUrl = `https://embed.smashystream.xyz/playere.php?tmdb=${activeId}`;
        break;
      case 'vidsrcpm':
        baseStreamUrl = `https://vidsrc.pm/embed/movie?tmdb=${activeId}`;
        break;
      case 'twoembedskin':
        baseStreamUrl = `https://www.2embed.skin/embed/${activeId}`;
        break;

      default:
        baseStreamUrl = `https://vidlink.pro/movie/${activeId}`;
        break;
    }
  } else {
    // TV Shows and Anime
    switch (resolvedKey) {
      // ── Tier 1: Highest Reliability & Cleanest Playback ───────────────────────
      case 'vidlink':
        baseStreamUrl = `https://vidlink.pro/tv/${activeId}/${s}/${ep}`;
        break;
      case 'vidsrccc':
        baseStreamUrl = `https://vidsrc.cc/v2/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'embedsu':
        baseStreamUrl = `https://embed.su/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'vidsrcto':
        baseStreamUrl = `https://vidsrc.to/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'vidsrcme':
        baseStreamUrl = `https://vidsrc.me/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
        break;

      // ── Tier 2: Solid Multi-Audio & Mirror Aggregators ─────────────────────────
      case 'vidsrcxyz':
        if (mediaType === 'anime' && alNumericId && malNumericId) {
          baseStreamUrl = `https://vidsrc.xyz/embed/anime?mal=${malNumericId}&ep=${rawEp}`;
        } else {
          baseStreamUrl = `https://vidsrc.xyz/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
        }
        break;
      case 'autoembedcc':
        baseStreamUrl = `https://player.autoembed.cc/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'multiembed':
        baseStreamUrl = `https://multiembed.mov/?video_id=${activeId}&tmdb=1&s=${s}&e=${ep}`;
        break;
      case 'vidsrcnet':
        baseStreamUrl = `https://vidsrc.net/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
        break;
      case 'twoembed':
        baseStreamUrl = `https://www.2embed.cc/embedtv/${activeId}&s=${s}&e=${ep}`;
        break;

      // ── Tier 3: High-Uptime Backup Mirrors ────────────────────────────────────
      case 'vidsrcin':
        baseStreamUrl = `https://vidsrc.in/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
        break;
      case 'vidsrcrip':
        baseStreamUrl = `https://vidsrc.rip/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'smashystream':
        baseStreamUrl = `https://embed.smashystream.xyz/playere.php?tmdb=${activeId}&season=${s}&episode=${ep}`;
        break;
      case 'vidsrcpm':
        baseStreamUrl = `https://vidsrc.pm/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
        break;
      case 'twoembedskin':
        baseStreamUrl = `https://www.2embed.skin/embedtv/${activeId}&s=${s}&e=${ep}`;
        break;

      default:
        baseStreamUrl = `https://vidlink.pro/tv/${activeId}/${s}/${ep}`;
        break;
    }
  }

  return appendStartTime(baseStreamUrl, startTime);
};
