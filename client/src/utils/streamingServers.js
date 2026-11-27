/**
 * Verified Streaming Server Providers Configuration
 * 15 active, free streaming servers for Movies, TV Series, and Anime.
 * VidFast PRO and top Vid* mirrors sit first, followed by CinemaOS and backup multi-audio nodes.
 */

export const DEFAULT_SERVER_KEY = 'vidfastpro';

export const normalizeServerKey = (serverKey) => {
  if (!serverKey || typeof serverKey !== 'string') return DEFAULT_SERVER_KEY;
  const key = serverKey.trim();
  if (key === 'vidlink' || key === 'videasy') return 'cinemaos';
  if (key === 'vidfast') return 'vidfastpro';
  return key || DEFAULT_SERVER_KEY;
};

export const STREAMING_SERVERS = [
  {
    key: 'vidfastpro',
    num: '01',
    name: 'VidFast PRO',
    label: 'Server 1 (VidFast PRO)',
    badge: '4K Node',
    tagColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    description: 'High-bitrate adaptive streaming mirror with rapid loading'
  },
  {
    key: 'vidprime',
    num: '02',
    name: 'VidPrime PRO',
    label: 'Server 2 (VidPrime PRO)',
    badge: 'Vidstack HD',
    tagColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    description: 'Next-gen Vidstack player with crisp HD playback and subtitle selection'
  },
  {
    key: 'vidrock',
    num: '03',
    name: 'VidRock',
    label: 'Server 3 (VidRock Multi-Audio)',
    badge: 'Multi-Audio',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'High-speed multi-audio stream engine with built-in audio track switcher and multi-language subtitles'
  },
  {
    key: 'vidsrcto',
    num: '04',
    name: 'VidSrc TO',
    label: 'Server 4 (VidSrc TO)',
    badge: 'Global HD',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    description: 'Extensive global cinema and television mirror with vast title catalog'
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
    key: 'cinemaos',
    num: '06',
    name: 'CinemaOS',
    label: 'Server 6 (CinemaOS Multi-Audio)',
    badge: 'Multi-Audio',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'Multi-audio player with Hindi & international tracks, multi-language subtitles, and multi-source failover'
  },
  {
    key: 'vidsrcru',
    num: '07',
    name: 'VidSrc RU',
    label: 'Server 7 (VidSrc RU)',
    badge: 'Multi-Sub',
    tagColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
    description: 'Fast cloud embed node with multi-language subtitles and broad catalog coverage'
  },
  {
    key: 'vidukimulti',
    num: '08',
    name: 'Viduki Multi',
    label: 'Server 8 (Viduki Multi-Audio)',
    badge: 'Multi-Audio',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    description: 'Multi-language audio (Hindi & regional tracks) with English subtitles & 4K auto-failover'
  },
  {
    key: 'vidnest',
    num: '09',
    name: 'VidNest',
    label: 'Server 9 (VidNest Cloud)',
    badge: 'Eng Sub',
    tagColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    description: 'Multi-node cloud player with English captions and sub/dub anime support'
  },
  {
    key: 'embedwave',
    num: '10',
    name: 'EmbedWave',
    label: 'Server 10 (EmbedWave Ultra)',
    badge: 'Zero Ads',
    tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    description: 'Modern clean player engine with crystal-clear bufferless playback'
  },
  {
    key: 'autoembed',
    num: '11',
    name: 'AutoEmbed PRO',
    label: 'Server 11 (AutoEmbed PRO)',
    badge: 'Multi-Node',
    tagColor: 'text-lime-400 bg-lime-500/10 border-lime-500/20',
    description: 'Auto-switching multi-server aggregator with fast backup sources'
  },
  {
    key: 'movietv',
    num: '12',
    name: 'MovieTV',
    label: 'Server 12 (MovieTV Cloud)',
    badge: 'Multi-Src',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: 'Multi-source failover architecture with responsive HTML5 playback'
  },
  {
    key: 'nontongo',
    num: '13',
    name: 'Nontongo',
    label: 'Server 13 (Nontongo Multi-Audio)',
    badge: 'Multi-Audio',
    tagColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    description: 'Dedicated multi-audio & Hindi dub streaming server with English subtitles'
  },
  {
    key: 'primesrc',
    num: '14',
    name: 'PrimeSrc',
    label: 'Server 14 (PrimeSrc Cloud)',
    badge: 'Multi-Src',
    tagColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    description: 'Multi-mirror cloud embed aggregator for movies and TV episodes'
  },
  {
    key: 'twoembed',
    num: '15',
    name: '2Embed',
    label: 'Server 15 (2Embed Ultra)',
    badge: 'Eng Sub',
    tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    description: 'Reliable multi-source mirror with fast HTML5 playback and English subtitles'
  }
];

export const supportsDirectAnimeId = (serverKey, { hasMalId = false } = {}) => {
  const key = normalizeServerKey(serverKey);
  if (key === 'vidnest' || key === 'vidsrcpm') return true;
  if (key === 'vidprime' && hasMalId) return true;
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
    if (resolvedKey === 'vidnest' || resolvedKey === 'vidsrcpm') {
      return appendStartTime(`https://vidnest.fun/anime/${alNumericId}/${rawEp}/sub`, startTime);
    }
    if (resolvedKey === 'vidprime' && malNumericId) {
      return appendStartTime(`https://vidprime.top/anime/${malNumericId}/${rawEp}/sub`, startTime);
    }
    return null;
  }

  const activeId = cleanTmdbId || String(id || '').replace(/^tmdb_m_/i, '').replace(/_s\d+$/i, '').trim();
  if (!activeId) return null;

  let baseStreamUrl = '';

  if (mediaType === 'movie') {
    switch (resolvedKey) {
      case 'vidfastpro':
      case 'vidfast':
        baseStreamUrl = `https://vidfast.pro/movie/${activeId}`;
        break;
      case 'vidprime':
        baseStreamUrl = `https://vidprime.top/movie/${activeId}`;
        break;
      case 'vidrock':
        baseStreamUrl = `https://vidrock.net/embed/movie/${activeId}`;
        break;
      case 'vidsrcto':
        baseStreamUrl = `https://vidsrc.to/embed/movie/${activeId}`;
        break;
      case 'vidsrcme':
        baseStreamUrl = `https://vidsrc.me/embed/movie?tmdb=${activeId}`;
        break;
      case 'cinemaos':
      case 'vidlink':
      case 'videasy':
        baseStreamUrl = `https://cinemaos.tech/player/${activeId}`;
        break;
      case 'vidsrcru':
        baseStreamUrl = `https://vidsrc.ru/embed/movie/${activeId}`;
        break;
      case 'vidukimulti':
      case 'anyembed':
      case 'smashystream':
        baseStreamUrl = `https://www.viduki.net/2/movie/${activeId}`;
        break;
      case 'vidnest':
      case 'vidsrcpm':
        baseStreamUrl = `https://vidnest.fun/movie/${activeId}`;
        break;
      case 'embedwave':
      case 'movies111':
      case 'rgshows':
        baseStreamUrl = `https://embedwave.cc/embed/movie/${activeId}`;
        break;
      case 'autoembed':
      case 'autoembedco':
        baseStreamUrl = `https://player.autoembed.co/embed/movie/${activeId}`;
        break;
      case 'movietv':
      case 'vidsrcdev':
      case 'vidsrcnet':
        baseStreamUrl = `https://movietvapi.stream/embed/${activeId}`;
        break;
      case 'nontongo':
      case 'vidsrcsu':
        baseStreamUrl = `https://www.nontongo.win/embed/movie/${activeId}`;
        break;
      case 'primesrc':
        baseStreamUrl = `https://primesrc.me/embed/movie?tmdb=${activeId}`;
        break;
      case 'twoembed':
      case 'vidzy':
      case 'autoembedpro':
      case 'warezcdn':
      case 'vidsrcsh':
        baseStreamUrl = `https://www.2embed.cc/embed/${activeId}`;
        break;
      case 'twoembedskin':
        baseStreamUrl = `https://www.2embed.skin/embed/${activeId}`;
        break;
      default:
        baseStreamUrl = `https://vidfast.pro/movie/${activeId}`;
        break;
    }
  } else {
    // TV Shows and Anime
    switch (resolvedKey) {
      case 'vidfastpro':
      case 'vidfast':
        baseStreamUrl = `https://vidfast.pro/tv/${activeId}/${s}/${ep}`;
        break;
      case 'vidprime':
        baseStreamUrl = `https://vidprime.top/tv/${activeId}/${s}/${ep}`;
        break;
      case 'vidrock':
        baseStreamUrl = `https://vidrock.net/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'vidsrcto':
        baseStreamUrl = `https://vidsrc.to/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'vidsrcme':
        baseStreamUrl = `https://vidsrc.me/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
        break;
      case 'cinemaos':
      case 'vidlink':
      case 'videasy':
        baseStreamUrl = `https://cinemaos.tech/player/${activeId}/${s}/${ep}`;
        break;
      case 'vidsrcru':
        baseStreamUrl = `https://vidsrc.ru/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'vidukimulti':
      case 'anyembed':
      case 'smashystream':
        baseStreamUrl = `https://www.viduki.net/2/tv/${activeId}/${s}/${ep}`;
        break;
      case 'vidnest':
      case 'vidsrcpm':
        if (mediaType === 'anime' && alNumericId && (!cleanTmdbId || (!episodeOffset && Number(s) === 1))) {
          baseStreamUrl = `https://vidnest.fun/anime/${alNumericId}/${rawEp}/sub`;
        } else {
          baseStreamUrl = `https://vidnest.fun/tv/${activeId}/${s}/${ep}`;
        }
        break;
      case 'embedwave':
      case 'movies111':
      case 'rgshows':
        baseStreamUrl = `https://embedwave.cc/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'autoembed':
      case 'autoembedco':
        baseStreamUrl = `https://player.autoembed.co/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'movietv':
      case 'vidsrcdev':
      case 'vidsrcnet':
        baseStreamUrl = `https://movietvapi.stream/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'nontongo':
      case 'vidsrcsu':
        baseStreamUrl = `https://www.nontongo.win/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'primesrc':
        baseStreamUrl = `https://primesrc.me/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
        break;
      case 'twoembed':
      case 'vidzy':
      case 'autoembedpro':
      case 'warezcdn':
      case 'vidsrcsh':
        baseStreamUrl = `https://www.2embed.cc/embedtv/${activeId}?s=${s}&e=${ep}`;
        break;
      case 'twoembedskin':
        baseStreamUrl = `https://www.2embed.skin/embedtv/${activeId}?s=${s}&e=${ep}`;
        break;
      default:
        baseStreamUrl = `https://vidfast.pro/tv/${activeId}/${s}/${ep}`;
        break;
    }
  }

  return appendStartTime(baseStreamUrl, startTime);
};
