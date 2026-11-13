/**
 * Verified Streaming Server Providers Configuration
 * 10 free, working high-speed streaming servers for Movies, Series, and Anime.
 * All servers load without sandbox errors and are protected by SyncStream's parent redirect neutralizer.
 */

export const STREAMING_SERVERS = [
  { 
    key: 'vidsrcsu', 
    label: 'Server 1 (VidSrc SU)', 
    badge: 'Recommended • Fast',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'High-speed global cloud mirror with instant bufferless playback'
  },
  { 
    key: 'vidsrcto', 
    label: 'Server 2 (VidSrc TO)', 
    badge: 'Ultra Fast',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    description: 'High-speed VidSrc TO video engine with instant playback'
  },
  { 
    key: 'vidlink', 
    label: 'Server 3 (VidLink PRO)', 
    badge: 'Multi-Subtitles • 4K',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'Next-gen streaming cloud with built-in multi-language subtitles and 4K sources'
  },
  { 
    key: 'vidsrcnet', 
    label: 'Server 4 (VidSrc NET)', 
    badge: 'Global CDN',
    tagColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    description: 'High-bandwidth global network node with adaptive bitrate'
  },
  { 
    key: 'autoembedco', 
    label: 'Server 5 (AutoEmbed)', 
    badge: 'Cloud Player',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    description: 'AutoEmbed cloud streaming node with subtitle support'
  },
  { 
    key: 'twoembed', 
    label: 'Server 6 (2Embed Global)', 
    badge: 'Multi-Source',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    description: 'Reliable global streaming server with extensive anime and cinema library'
  },
  { 
    key: 'rgshows', 
    label: 'Server 7 (RGShows Ultra)', 
    badge: 'Direct Stream',
    tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    description: 'Zero-delay direct streaming node optimized for latest releases and anime'
  },
  { 
    key: 'smashystream', 
    label: 'Server 8 (SmashyStream)', 
    badge: 'Multi-Server',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: 'Aggregated player with dynamic server failover and multi-audio tracks'
  },
  { 
    key: 'vidsrcme', 
    label: 'Server 9 (VidSrc ME)', 
    badge: 'Original Mirror',
    tagColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    description: 'Classic VidSrc cloud endpoint with high compatibility'
  },
  { 
    key: 'videasy', 
    label: 'Server 10 (Videasy HD)', 
    badge: 'HD • Multi-Audio',
    tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    description: 'Clean modern player with multi-language captions and crisp HD audio'
  }
];

export const getEmbedStreamUrl = ({ serverKey = 'vidsrcsu', mediaType = 'movie', id, tmdbId, season = 1, episode = 1 }) => {
  const activeId = tmdbId || id;
  const s = season || 1;
  const ep = episode || 1;

  if (mediaType === 'movie') {
    switch (serverKey) {
      case 'vidsrcsu':
      case 'vidsrcpm':
        return `https://vidsrc.su/embed/movie/${activeId}`;
      case 'vidsrcto':
        return `https://vidsrc.to/embed/movie/${activeId}`;
      case 'vidlink':
        return `https://vidlink.pro/movie/${activeId}`;
      case 'vidsrcnet':
        return `https://vidsrc.net/embed/movie/${activeId}`;
      case 'autoembedco':
        return `https://autoembed.co/movie/tmdb/${activeId}`;
      case 'twoembed':
      case 'twoembedskin':
        return `https://www.2embed.cc/embed/${activeId}`;
      case 'rgshows':
        return `https://api.rgshows.me/embed/movie/${activeId}`;
      case 'smashystream':
        return `https://embed.smashystream.com/playere.php?tmdb=${activeId}`;
      case 'vidsrcme':
        return `https://vidsrc.me/embed/movie?tmdb=${activeId}`;
      case 'videasy':
        return `https://player.videasy.to/movie/${activeId}`;
      default:
        return `https://vidsrc.su/embed/movie/${activeId}`;
    }
  }

  // TV Shows and Anime
  switch (serverKey) {
    case 'vidsrcsu':
    case 'vidsrcpm':
      return `https://vidsrc.su/embed/tv/${activeId}/${s}/${ep}`;
    case 'vidsrcto':
      return `https://vidsrc.to/embed/tv/${activeId}/${s}/${ep}`;
    case 'vidlink':
      return `https://vidlink.pro/tv/${activeId}/${s}/${ep}`;
    case 'vidsrcnet':
      return `https://vidsrc.net/embed/tv/${activeId}/${s}/${ep}`;
    case 'autoembedco':
      return `https://autoembed.co/tv/tmdb/${activeId}-${s}-${ep}`;
    case 'twoembed':
    case 'twoembedskin':
      return `https://www.2embed.cc/embedtv/${activeId}&s=${s}&e=${ep}`;
    case 'rgshows':
      return `https://api.rgshows.me/embed/tv/${activeId}/${s}/${ep}`;
    case 'smashystream':
      return `https://embed.smashystream.com/playere.php?tmdb=${activeId}&season=${s}&episode=${ep}`;
    case 'vidsrcme':
      return `https://vidsrc.me/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
    case 'videasy':
      return `https://player.videasy.to/tv/${activeId}/${s}/${ep}`;
    default:
      return `https://vidsrc.su/embed/tv/${activeId}/${s}/${ep}`;
  }
};
