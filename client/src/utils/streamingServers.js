/**
 * Sandbox-Safe & Verified Streaming Server Providers Configuration
 * All servers in this list work with strict iframe sandboxing:
 * - ZERO redirects
 * - ZERO popup tabs
 * - NO "blocked remove sandbox" errors
 * - Works on both Mobile and Laptop
 */

export const STREAMING_SERVERS = [
  { 
    key: 'vidsrcpm', 
    label: 'Server 1 (VidSrc PM - No Ads)', 
    badge: '100% Sandbox Protected',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Primary clean server: Works with strict sandbox protection, zero popups or redirects'
  },
  { 
    key: 'vidsrcto', 
    label: 'Server 2 (VidSrc TO)', 
    badge: 'Fast • Sandbox Safe',
    tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    description: 'High-speed VidSrc TO video engine, fully sandbox compatible'
  },
  { 
    key: 'vidsrcme', 
    label: 'Server 3 (VidSrc ME)', 
    badge: 'Global CDN',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    description: 'Official global VidSrc endpoint, sandbox safe'
  },
  { 
    key: 'autoembedco', 
    label: 'Server 4 (AutoEmbed)', 
    badge: 'Cloud Player',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'AutoEmbed cloud streaming node with subtitle support'
  }
];

export const getEmbedStreamUrl = ({ serverKey = 'vidsrcpm', mediaType = 'movie', id, tmdbId, season = 1, episode = 1 }) => {
  const activeId = tmdbId || id;
  const s = season || 1;
  const ep = episode || 1;

  if (mediaType === 'movie') {
    switch (serverKey) {
      case 'vidsrcpm':
        return `https://vidsrc.pm/embed/movie/${activeId}`;
      case 'vidsrcto':
        return `https://vidsrc.to/embed/movie/${activeId}`;
      case 'vidsrcme':
        return `https://vidsrc.me/embed/movie?tmdb=${activeId}`;
      case 'autoembedco':
        return `https://autoembed.co/movie/tmdb/${activeId}`;
      default:
        return `https://vidsrc.pm/embed/movie/${activeId}`;
    }
  }

  // TV Shows and Anime
  switch (serverKey) {
    case 'vidsrcpm':
      return `https://vidsrc.pm/embed/tv/${activeId}/${s}/${ep}`;
    case 'vidsrcto':
      return `https://vidsrc.to/embed/tv/${activeId}/${s}/${ep}`;
    case 'vidsrcme':
      return `https://vidsrc.me/embed/tv?tmdb=${activeId}&season=${s}&episode=${ep}`;
    case 'autoembedco':
      return `https://autoembed.co/tv/tmdb/${activeId}-${s}-${ep}`;
    default:
      return `https://vidsrc.pm/embed/tv/${activeId}/${s}/${ep}`;
  }
};
