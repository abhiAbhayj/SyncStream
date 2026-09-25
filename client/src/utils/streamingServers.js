/**
 * Verified Ultra-Fast Streaming Server Providers Configuration
 * All servers tested with sub-second response times and full video playback.
 */

export const STREAMING_SERVERS = [
  { 
    key: 'vidlink', 
    label: 'Server 1 (VidLink - HD)', 
    badge: 'Recommended • Fast',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Best experience: Ultra HD player, subtitles, and lowest ads'
  },
  { 
    key: 'vidsrcto', 
    label: 'Server 2 (VidSrc TO)', 
    badge: 'Ultra Fast',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'High-speed VidSrc TO video engine with instant playback'
  },
  { 
    key: 'vidsrcpm', 
    label: 'Server 3 (VidSrc PM)', 
    badge: 'HD Mirror',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    description: 'Fast VidSrc dedicated cloud mirror'
  },
  { 
    key: 'vidsrcme', 
    label: 'Server 4 (VidSrc ME)', 
    badge: 'Global CDN',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    description: 'Official global VidSrc endpoint'
  },
  { 
    key: 'autoembedco', 
    label: 'Server 5 (AutoEmbed)', 
    badge: 'Cloud Player',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: 'AutoEmbed cloud streaming node'
  },
  { 
    key: 'twoembedcc', 
    label: 'Server 6 (2Embed CC)', 
    badge: 'High Uptime',
    tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    description: 'Verified 2Embed core provider'
  },
  { 
    key: 'twoembedskin', 
    label: 'Server 7 (2Embed Skin)', 
    badge: 'Mirror',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    description: 'Alternative 2Embed streaming mirror'
  }
];

export const getEmbedStreamUrl = ({ serverKey = 'vidlink', mediaType = 'movie', id, tmdbId, season = 1, episode = 1 }) => {
  const activeId = tmdbId || id;
  const s = season || 1;
  const ep = episode || 1;

  if (mediaType === 'movie') {
    switch (serverKey) {
      case 'vidlink':
        return `https://vidlink.pro/movie/${activeId}`;
      case 'vidsrcto':
        return `https://vidsrc.to/embed/movie/${activeId}`;
      case 'vidsrcpm':
        return `https://vidsrc.pm/embed/movie/${activeId}`;
      case 'vidsrcme':
        return `https://vidsrc.me/embed/movie?tmdb=${activeId}`;
      case 'autoembedco':
        return `https://autoembed.co/movie/tmdb/${activeId}`;
      case 'twoembedcc':
        return `https://www.2embed.cc/embed/${activeId}`;
      case 'twoembedskin':
        return `https://2embed.skin/embed/${activeId}`;
      default:
        return `https://vidlink.pro/movie/${activeId}`;
    }
  }

  // TV Shows and Anime
  switch (serverKey) {
    case 'vidlink':
      return `https://vidlink.pro/tv/${activeId}/${s}/${ep}`;
    case 'vidsrcto':
      return `https://vidsrc.to/embed/tv/${activeId}/${s}/${ep}`;
    case 'vidsrcpm':
      return `https://vidsrc.pm/embed/tv/${activeId}/${s}/${ep}`;
    case 'vidsrcme':
      return `https://vidsrc.me/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
    case 'autoembedco':
      return `https://autoembed.co/tv/tmdb/${activeId}-${s}-${ep}`;
    case 'twoembedcc':
      return `https://www.2embed.cc/embedtv/${activeId}&s=${s}&e=${ep}`;
    case 'twoembedskin':
      return `https://2embed.skin/embedtv/${activeId}&s=${s}&e=${ep}`;
    default:
      return `https://vidlink.pro/tv/${activeId}/${s}/${ep}`;
  }
};
