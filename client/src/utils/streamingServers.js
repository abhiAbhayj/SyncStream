/**
 * Verified Streaming Server Providers Configuration
 * 10 100% verified, active, free streaming servers with valid global SSL for Movies, TV Series, and Anime.
 * All servers load without sandbox errors and are protected by SyncStream's parent redirect neutralizer.
 */

export const DEFAULT_SERVER_KEY = 'cinemaos';

export const normalizeServerKey = (serverKey) => {
  if (!serverKey || typeof serverKey !== 'string') return DEFAULT_SERVER_KEY;
  const key = serverKey.trim();
  if (key === 'vidlink' || key === 'videasy') return 'cinemaos';
  if (key === 'vidfast') return 'vidrock';
  return key || DEFAULT_SERVER_KEY;
};

export const STREAMING_SERVERS = [
  { 
    key: 'cinemaos', 
    num: '01',
    name: 'CinemaOS Multi-Audio',
    label: 'Server 1 (CinemaOS Multi-Audio)', 
    badge: 'Multi-Audio • Multi-Sub',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'Multi-audio player with Hindi & international tracks, multi-language subtitles, and multi-source failover'
  },
  { 
    key: 'vidrock', 
    num: '02',
    name: 'VidRock Multi-Audio',
    label: 'Server 2 (VidRock Multi-Audio)', 
    badge: 'Multi-Audio • Multi-Sub',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'High-speed multi-audio stream engine with built-in audio track switcher and multi-language subtitles'
  },
  { 
    key: 'embedwave', 
    num: '03',
    name: 'EmbedWave Ultra',
    label: 'Server 3 (EmbedWave Ultra)', 
    badge: 'Zero Ads Node',
    tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    description: 'Modern clean player engine with crystal-clear bufferless playback'
  },
  { 
    key: 'vidsrcto', 
    num: '04',
    name: 'VidSrc TO',
    label: 'Server 4 (VidSrc TO)', 
    badge: 'Global Cinema',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    description: 'Extensive global cinema and television mirror with vast title catalog'
  },
  { 
    key: 'vidsrcme', 
    num: '05',
    name: 'VidSrc ME',
    label: 'Server 5 (VidSrc ME)', 
    badge: 'Multi-Audio • 1080p',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    description: 'Official VidSrc core engine with multi-language audio and subtitle tracks'
  },
  { 
    key: 'vidukimulti', 
    num: '06',
    name: 'Viduki Multi-Audio',
    label: 'Server 6 (Viduki Multi-Audio)', 
    badge: 'Multi-Audio • Eng Sub',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    description: 'Multi-language audio (Hindi & regional tracks) with English subtitles & 4K auto-failover'
  },
  { 
    key: 'movietv', 
    num: '07',
    name: 'MovieTV Cloud',
    label: 'Server 7 (MovieTV Cloud)', 
    badge: 'Multi-Source',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: 'Multi-source failover architecture with responsive HTML5 playback'
  },
  { 
    key: 'nontongo', 
    num: '08',
    name: 'Nontongo Multi-Audio',
    label: 'Server 8 (Nontongo Multi-Audio)', 
    badge: 'Multi-Audio • Eng Sub',
    tagColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    description: 'Dedicated multi-audio & Hindi dub streaming server with English subtitles'
  },
  { 
    key: 'vidnest', 
    num: '09',
    name: 'VidNest Cloud',
    label: 'Server 9 (VidNest Cloud)', 
    badge: 'Ad-Free • Eng Sub',
    tagColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    description: 'Multi-node cloud player with English captions and sub/dub anime support'
  },
  { 
    key: 'twoembed', 
    num: '10',
    name: '2Embed Ultra',
    label: 'Server 10 (2Embed Ultra)', 
    badge: 'Multi-Source • Eng Sub',
    tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    description: 'Reliable multi-source mirror with fast HTML5 playback and English subtitles'
  }
];

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
  season = 1,
  episode = 1,
  episodeOffset = 0,
  startTime = 0
}) => {
  const cleanTmdbId = (tmdbId && !String(tmdbId).startsWith('al_'))
    ? String(tmdbId).replace(/^tmdb_m_/i, '').replace(/_s\d+$/i, '')
    : null;
  const alNumericId = typeof id === 'string' && id.startsWith('al_')
    ? id.replace(/^al_/i, '')
    : null;

  let activeId = cleanTmdbId || String(id || '').replace(/^tmdb_m_/i, '').replace(/_s\d+$/i, '');
  if (typeof activeId === 'string' && activeId.startsWith('al_')) {
    activeId = activeId.replace(/^al_/, '');
  }

  const s = season || 1;
  const rawEp = episode || 1;
  const ep = cleanTmdbId ? rawEp + (Number(episodeOffset) || 0) : rawEp;

  let baseStreamUrl = '';

  if (mediaType === 'movie') {
    switch (serverKey) {
      case 'vidsrcto':
        baseStreamUrl = `https://vidsrc.to/embed/movie/${activeId}`;
        break;
      case 'cinemaos':
      case 'vidlink':
      case 'videasy':
        baseStreamUrl = `https://cinemaos.tech/player/${activeId}`;
        break;
      case 'vidrock':
      case 'vidfast':
        baseStreamUrl = `https://vidrock.net/embed/movie/${activeId}`;
        break;
      case 'embedwave':
      case 'movies111':
      case 'rgshows':
        baseStreamUrl = `https://embedwave.cc/embed/movie/${activeId}`;
        break;
      case 'vidsrcme':
        baseStreamUrl = `https://vidsrc.me/embed/movie?tmdb=${activeId}`;
        break;
      case 'vidukimulti':
      case 'anyembed':
      case 'smashystream':
        baseStreamUrl = `https://www.viduki.net/2/movie/${activeId}`;
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
      case 'vidnest':
      case 'vidsrcpm':
        baseStreamUrl = `https://vidnest.fun/movie/${activeId}`;
        break;
      case 'twoembed':
      case 'vidzy':
      case 'autoembedpro':
      case 'autoembedco':
      case 'warezcdn':
      case 'vidsrcsh':
        baseStreamUrl = `https://www.2embed.cc/embed/${activeId}`;
        break;
      case 'twoembedskin':
        baseStreamUrl = `https://www.2embed.skin/embed/${activeId}`;
        break;
      default:
        baseStreamUrl = `https://vidsrc.to/embed/movie/${activeId}`;
        break;
    }
  } else {
    // TV Shows and Anime
    switch (serverKey) {
      case 'vidsrcto':
        baseStreamUrl = `https://vidsrc.to/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'cinemaos':
      case 'vidlink':
      case 'videasy':
        baseStreamUrl = `https://cinemaos.tech/player/${activeId}/${s}/${ep}`;
        break;
      case 'vidrock':
      case 'vidfast':
        baseStreamUrl = `https://vidrock.net/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'embedwave':
      case 'movies111':
      case 'rgshows':
        baseStreamUrl = `https://embedwave.cc/embed/tv/${activeId}/${s}/${ep}`;
        break;
      case 'vidsrcme':
        baseStreamUrl = `https://vidsrc.me/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
        break;
      case 'vidukimulti':
      case 'anyembed':
      case 'smashystream':
        baseStreamUrl = `https://www.viduki.net/2/tv/${activeId}/${s}/${ep}`;
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
      case 'vidnest':
      case 'vidsrcpm':
        if (mediaType === 'anime' && alNumericId && !cleanTmdbId) {
          baseStreamUrl = `https://vidnest.fun/anime/${alNumericId}/${rawEp}/sub`;
        } else {
          baseStreamUrl = `https://vidnest.fun/tv/${activeId}/${s}/${ep}`;
        }
        break;
      case 'twoembed':
      case 'vidzy':
      case 'autoembedpro':
      case 'autoembedco':
      case 'warezcdn':
      case 'vidsrcsh':
        baseStreamUrl = `https://www.2embed.cc/embedtv/${activeId}?s=${s}&e=${ep}`;
        break;
      case 'twoembedskin':
        baseStreamUrl = `https://www.2embed.skin/embedtv/${activeId}?s=${s}&e=${ep}`;
        break;
      default:
        baseStreamUrl = `https://vidsrc.to/embed/tv/${activeId}/${s}/${ep}`;
        break;
    }
  }

  return appendStartTime(baseStreamUrl, startTime);
};
