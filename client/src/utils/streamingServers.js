/**
 * Streaming Server Providers Configuration
 * Supports Movies, TV Series, and Anime with verified modern mirrors
 */

export const STREAMING_SERVERS = [
  { 
    key: 'vidlink', 
    label: 'Server 1 (VidLink)', 
    badge: 'Recommended',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Fast HD player with multi-subtitles and minimal ads'
  },
  { 
    key: 'autoembed', 
    label: 'Server 2 (AutoEmbed)', 
    badge: 'Multi-Source',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    description: 'Automatic fallback engine with high availability'
  },
  { 
    key: 'embedsu', 
    label: 'Server 3 (Embed.su)', 
    badge: '1080p HD',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'Fast CDN streams with 1080p support'
  },
  { 
    key: 'vidsrccc', 
    label: 'Server 4 (VidSrc CC)', 
    badge: 'Multi-Audio',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    description: 'VidSrc v2 cloud stream with multi-audio support'
  },
  { 
    key: 'vidsrcicu', 
    label: 'Server 5 (VidSrc ICU)', 
    badge: 'Mirror',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: 'Alternative VidSrc streaming mirror'
  },
  { 
    key: 'smashystream', 
    label: 'Server 6 (SmashyStream)', 
    badge: 'Aggregator',
    tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    description: 'Integrated multi-player source selector'
  },
  { 
    key: 'multiembed', 
    label: 'Server 7 (MultiEmbed)', 
    badge: 'Alternative',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    description: 'Multi-host streaming aggregator'
  },
  { 
    key: 'twoembed', 
    label: 'Server 8 (2Embed)', 
    badge: 'Backup',
    tagColor: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    description: 'Classic backup provider'
  },
];

export const getEmbedStreamUrl = ({ serverKey = 'vidlink', mediaType = 'movie', id, tmdbId, season = 1, episode = 1 }) => {
  const activeId = tmdbId || id;
  const s = season || 1;
  const ep = episode || 1;

  if (mediaType === 'movie') {
    switch (serverKey) {
      case 'vidlink':
        return `https://vidlink.pro/movie/${activeId}`;
      case 'autoembed':
        return `https://player.autoembed.cc/embed/movie/${activeId}`;
      case 'embedsu':
        return `https://embed.su/embed/movie/${activeId}`;
      case 'vidsrccc':
        return `https://vidsrc.cc/v2/embed/movie/${activeId}`;
      case 'vidsrcicu':
        return `https://vidsrc.icu/embed/movie/${activeId}`;
      case 'smashystream':
        return `https://player.smashy.stream/movie/${activeId}`;
      case 'multiembed':
        return `https://multiembed.mov/?video_id=${activeId}&tmdb=1`;
      case 'twoembed':
        return `https://www.2embed.cc/embed/${activeId}`;
      default:
        return `https://vidlink.pro/movie/${activeId}`;
    }
  }

  // TV Shows and Anime
  switch (serverKey) {
    case 'vidlink':
      return `https://vidlink.pro/tv/${activeId}/${s}/${ep}`;
    case 'autoembed':
      return `https://player.autoembed.cc/embed/tv/${activeId}/${s}/${ep}`;
    case 'embedsu':
      return `https://embed.su/embed/tv/${activeId}/${s}/${ep}`;
    case 'vidsrccc':
      return `https://vidsrc.cc/v2/embed/tv/${activeId}/${s}/${ep}`;
    case 'vidsrcicu':
      return `https://vidsrc.icu/embed/tv/${activeId}/${s}/${ep}`;
    case 'smashystream':
      return `https://player.smashy.stream/tv/${activeId}?s=${s}&e=${ep}`;
    case 'multiembed':
      return `https://multiembed.mov/?video_id=${activeId}&tmdb=1&s=${s}&e=${ep}`;
    case 'twoembed':
      return `https://www.2embed.cc/embedtv/${activeId}&s=${s}&e=${ep}`;
    default:
      return `https://vidlink.pro/tv/${activeId}/${s}/${ep}`;
  }
};
