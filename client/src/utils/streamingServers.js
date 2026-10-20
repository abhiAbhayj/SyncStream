/**
 * Verified Streaming Server Providers Configuration
 * All servers load without sandbox errors and are protected by SyncStream's parent redirect neutralizer.
 */

export const STREAMING_SERVERS = [
  { 
    key: 'vidsrcsu', 
    label: 'Server 1 (VidSrc SU)', 
    badge: 'Recommended • Fast',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Fast VidSrc cloud mirror with instant bufferless playback'
  },
  { 
    key: 'vidsrcto', 
    label: 'Server 2 (VidSrc TO)', 
    badge: 'Ultra Fast',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    description: 'High-speed VidSrc TO video engine with instant playback'
  },
  { 
    key: 'vidsrcme', 
    label: 'Server 3 (VidSrc ME)', 
    badge: 'Global CDN',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    description: 'Official global VidSrc endpoint'
  },
  { 
    key: 'autoembedco', 
    label: 'Server 4 (AutoEmbed)', 
    badge: 'Cloud Player',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'AutoEmbed cloud streaming node with subtitle support'
  },
  { 
    key: 'videasy', 
    label: 'Server 5 (Videasy - HD & CC)', 
    badge: 'HD • Multi-Subtitles',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: 'Modern multi-source player with full multi-language subtitles (English, Spanish, etc.)'
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
      case 'vidsrcme':
        return `https://vidsrc.me/embed/movie?tmdb=${activeId}`;
      case 'autoembedco':
        return `https://autoembed.co/movie/tmdb/${activeId}`;
      case 'videasy':
      case 'vidlink':
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
    case 'vidsrcme':
      return `https://vidsrc.me/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
    case 'autoembedco':
      return `https://autoembed.co/tv/tmdb/${activeId}-${s}-${ep}`;
    case 'videasy':
    case 'vidlink':
      return `https://player.videasy.to/tv/${activeId}/${s}/${ep}`;
    default:
      return `https://vidsrc.su/embed/tv/${activeId}/${s}/${ep}`;
  }
};
