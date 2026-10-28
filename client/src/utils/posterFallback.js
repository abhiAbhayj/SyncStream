// ── Robust Poster Resolution & Dynamic Fallback Engine ──
// Ensures every Movie, TV Show, Anime, Manga, and Music track ALWAYS has a gorgeous visual poster.

const escapeXml = (unsafe) => {
  if (!unsafe || typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const splitTitleIntoLines = (title, maxCharsPerLine = 18, maxLines = 3) => {
  if (!title) return ['SyncStream'];
  const words = title.trim().split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  // If there's still text truncated, add ellipsis to last line
  if (lines.length === maxLines && words.length > lines.join(' ').split(/\s+/).length) {
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, maxCharsPerLine - 3) + '...';
  }

  return lines.length > 0 ? lines : [title.slice(0, maxCharsPerLine)];
};

const THEMES = {
  movie: {
    bgFrom: '#070b19',
    bgTo: '#101b38',
    glowColor: '#00f5ff',
    accent: '#38bdf8',
    badgeText: 'MOVIE',
    iconPath: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 3h16M7 4v3m10-3v3M4 14h16M7 14v6m10-6v6'
  },
  tv: {
    bgFrom: '#041412',
    bgTo: '#0b2e25',
    glowColor: '#10b981',
    accent: '#34d399',
    badgeText: 'TV SERIES',
    iconPath: 'M21 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10-4l3 4h-6l3-4z'
  },
  anime: {
    bgFrom: '#120724',
    bgTo: '#2a1147',
    glowColor: '#a855f7',
    accent: '#c084fc',
    badgeText: 'ANIME',
    iconPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
  },
  manga: {
    bgFrom: '#1c0818',
    bgTo: '#3d1233',
    glowColor: '#ec4899',
    accent: '#f472b6',
    badgeText: 'MANGA',
    iconPath: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zm20 0h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'
  },
  music: {
    bgFrom: '#1a1005',
    bgTo: '#3a240a',
    glowColor: '#f59e0b',
    accent: '#fbbf24',
    badgeText: 'MUSIC',
    iconPath: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'
  }
};

/**
 * Generates an SVG Data URI that renders a high-end cinematic poster with title, badge, and glowing branding.
 */
export const generateFallbackPoster = (rawTitle = 'SyncStream', rawType = 'movie', rawYear = '') => {
  const cleanTitle = (rawTitle || 'SyncStream').toString().trim();
  const typeKey = (rawType || 'movie').toString().toLowerCase().trim();
  const theme = THEMES[typeKey] || THEMES.movie;
  
  let yearStr = '';
  if (rawYear) {
    const yMatch = String(rawYear).match(/\b(19\d\d|20\d\d)\b/);
    if (yMatch) yearStr = yMatch[1];
  }

  const lines = splitTitleIntoLines(cleanTitle, 16, 3);
  const escapedLines = lines.map(l => escapeXml(l));
  
  // Dynamic Y positioning based on line count
  const startY = lines.length === 1 ? 420 : (lines.length === 2 ? 400 : 380);
  const lineHeight = 46;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 750" width="500" height="750">
  <defs>
    <radialGradient id="ambGlow" cx="50%" cy="30%" r="65%">
      <stop offset="0%" stop-color="${theme.glowColor}" stop-opacity="0.28"/>
      <stop offset="60%" stop-color="${theme.bgTo}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${theme.bgFrom}" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bgTo}"/>
      <stop offset="100%" stop-color="${theme.bgFrom}"/>
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.glowColor}"/>
      <stop offset="100%" stop-color="${theme.accent}"/>
    </linearGradient>
    <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Deep Background -->
  <rect width="500" height="750" fill="${theme.bgFrom}"/>
  <rect width="500" height="750" fill="url(#ambGlow)"/>

  <!-- Elegant Inner Border -->
  <rect x="18" y="18" width="464" height="714" rx="20" fill="none" stroke="${theme.glowColor}" stroke-opacity="0.25" stroke-width="1.5"/>
  <rect x="24" y="24" width="452" height="702" rx="16" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="1"/>

  <!-- Decorative Background Watermark Icon -->
  <g transform="translate(175, 120) scale(6.2)" fill="none" stroke="${theme.glowColor}" stroke-opacity="0.14" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="${theme.iconPath}"/>
  </g>

  <!-- Top Logo / Brand Watermark -->
  <g transform="translate(40, 52)">
    <circle cx="10" cy="10" r="4" fill="${theme.glowColor}"/>
    <text x="24" y="15" fill="#ffffff" fill-opacity="0.75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" letter-spacing="3">SYNCSTREAM</text>
  </g>

  <!-- Type Badge -->
  <g transform="translate(40, 85)">
    <rect width="${theme.badgeText.length * 9 + 28}" height="24" rx="6" fill="${theme.glowColor}" fill-opacity="0.15" stroke="${theme.glowColor}" stroke-opacity="0.4" stroke-width="1"/>
    <text x="${(theme.badgeText.length * 9 + 28) / 2}" y="16" fill="${theme.glowColor}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" letter-spacing="1.5">${theme.badgeText}</text>
  </g>

  <!-- Central Title Typography -->
  <text x="250" y="${startY}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="36" fill="#ffffff" style="text-shadow: 0 4px 20px rgba(0,0,0,0.9);">
    ${escapedLines.map((line, idx) => `<tspan x="250" dy="${idx === 0 ? 0 : lineHeight}">${line}</tspan>`).join('')}
  </text>

  <!-- Divider Line -->
  <line x1="180" y1="560" x2="320" y2="560" stroke="${theme.glowColor}" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round"/>

  <!-- Year / Metadata Footer -->
  ${yearStr ? `
  <g transform="translate(250, 605)">
    <rect x="-40" y="-14" width="80" height="26" rx="13" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1"/>
    <text x="0" y="4" text-anchor="middle" fill="#ffffff" fill-opacity="0.9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" letter-spacing="1.5">${escapeXml(yearStr)}</text>
  </g>` : `
  <g transform="translate(250, 605)">
    <text x="0" y="0" text-anchor="middle" fill="#ffffff" fill-opacity="0.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" letter-spacing="2">OFFICIAL RELEASE</text>
  </g>`}

  <!-- Bottom Quality Mark -->
  <text x="250" y="680" text-anchor="middle" fill="#ffffff" fill-opacity="0.3" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="800" letter-spacing="3">4K ULTRA HD • HDR</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * Safely resolves and normalizes any media poster URL.
 * Prefixes TMDB relative paths, passes through external URLs, and falls back to dynamic SVG poster.
 */
export const formatMediaPoster = (item) => {
  if (!item) return generateFallbackPoster();

  const raw = item.poster_path || item.image || item.thumbnail || item.cover || item.backdrop_path;
  const title = item.title || item.name || '';
  const type = item.media_type || (item.audio_url ? 'music' : 'movie');
  const date = item.release_date || item.first_air_date || item.air_date || '';

  if (raw && typeof raw === 'string' && raw.trim() !== '') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${trimmed}`;
    }
    // Handle bare filenames like 'abc1234.jpg'
    return `https://image.tmdb.org/t/p/w500/${trimmed}`;
  }

  return generateFallbackPoster(title, type, date);
};

/**
 * Image onError handler to seamlessly inject generated fallback when a remote image 404s.
 */
export const handlePosterError = (event, item) => {
  if (!event || !event.currentTarget) return;
  const target = event.currentTarget;
  target.onerror = null; // Prevent loop
  target.src = generateFallbackPoster(
    item?.title || item?.name || 'SyncStream',
    item?.media_type || 'movie',
    item?.release_date || item?.first_air_date || ''
  );
};
