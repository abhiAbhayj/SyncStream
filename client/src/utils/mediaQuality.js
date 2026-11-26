/**
 * Resolve stream print quality tag ('HD' vs 'CAM') for Movies, TV Series, and Anime.
 * - Uses explicit backend `item.quality` when available (backed by TMDB `release_dates` Digital/Physical/TV checks).
 * - Falls back cleanly for list cards: Movies within a 45-day theatrical window (or upcoming) are marked 'CAM';
 *   digital/older movies and aired TV/Anime series are marked 'HD'.
 */
export const getMediaQuality = (item) => {
  if (!item) return null;
  const mediaType = String(item.media_type || '').toLowerCase();
  if (mediaType === 'manga' || mediaType === 'music' || mediaType === 'person') return null;

  if (item.quality === 'HD' || item.quality === 'CAM') {
    return item.quality;
  }

  const formatUpper = String(item.format || '').toUpperCase();
  const isMovie = mediaType === 'movie' || formatUpper === 'MOVIE';
  const now = Date.now();
  const relStr = String(item.release_date || item.first_air_date || item.air_date || '').trim();

  if (!isMovie) {
    const status = String(item.status || '').toUpperCase();
    if (status === 'NOT_YET_RELEASED' || status === 'PLANNED' || status === 'IN PRODUCTION') {
      return 'CAM';
    }
    if (relStr && /^\d{4}-\d{2}-\d{2}/.test(relStr)) {
      const ts = Date.parse(relStr);
      if (Number.isFinite(ts) && ts - now > 86400000) {
        return 'CAM';
      }
    }
    return 'HD';
  }

  if (relStr) {
    if (/^\d{4}$/.test(relStr)) {
      const yr = parseInt(relStr, 10);
      return yr > new Date().getFullYear() ? 'CAM' : 'HD';
    }
    const ts = Date.parse(relStr);
    if (Number.isFinite(ts)) {
      const daysSince = (now - ts) / 86400000;
      return daysSince < 45 ? 'CAM' : 'HD';
    }
  }

  return 'HD';
};
