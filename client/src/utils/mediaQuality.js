import axios from 'axios';

const THEATRICAL_CAM_FALLBACK_DAYS = 90;

/**
 * Resolve stream print quality tag ('HD' vs 'CAM') for Movies, TV Series, and Anime.
 * - Uses authoritative backend `item.quality` when available (TMDB `release_dates` Digital/Physical/TV + Torrentio stream check).
 * - Matches backend fallback rules consistently: Movies within a 90-day theatrical window are 'CAM';
 *   digital/older movies and aired TV/Anime series are 'HD'.
 */
export const getMediaQuality = (item) => {
  if (!item) return null;
  const mediaType = String(item.media_type || item.type || '').toLowerCase();
  if (mediaType === 'manga' || mediaType === 'music' || mediaType === 'person') return null;

  if (item.quality === 'HD' || item.quality === 'CAM') {
    return item.quality;
  }

  const formatUpper = String(item.format || '').toUpperCase();
  const isMovie = mediaType === 'movie' || formatUpper === 'MOVIE';
  const now = Date.now();
  const relStr = String(item.full_release_date || item.release_date || item.first_air_date || item.air_date || '').trim();

  if (!isMovie) {
    const status = String(item.status || '').toUpperCase();
    if (status === 'NOT_YET_RELEASED' || status === 'PLANNED') {
      return 'CAM';
    }
    const hasAiredEpisodes = Boolean(item.last_episode_to_air || item.has_aired_episodes);
    if ((status === 'IN PRODUCTION' || status === 'PILOT') && !hasAiredEpisodes) {
      return 'CAM';
    }
    if (relStr && /^\d{4}-\d{2}-\d{2}/.test(relStr)) {
      const ts = Date.parse(relStr);
      if (Number.isFinite(ts) && ts - now > 86400000) {
        return 'CAM';
      }
    } else if (relStr && /^\d{4}$/.test(relStr)) {
      if (parseInt(relStr, 10) > new Date().getFullYear()) {
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
      return daysSince < THEATRICAL_CAM_FALLBACK_DAYS ? 'CAM' : 'HD';
    }
  }

  return null;
};

/**
 * Hydrate an array of media items with authoritative backend quality tags & release dates.
 * Used for guest Continue Watching and browser-direct AniList Movie cards/details so
 * outside badges always match inside MediaDetail badges 1:1.
 */
export const hydrateMediaQualities = async (items) => {
  if (!Array.isArray(items) || items.length === 0) return items || [];

  const payload = items
    .filter((it) => {
      const t = String(it?.media_type || it?.type || '').toLowerCase();
      return t === 'movie' || t === 'tv' || t === 'anime';
    })
    .slice(0, 50)
    .map((it) => ({
      id: it.id || it.external_media_id,
      external_media_id: it.external_media_id || it.id,
      tmdb_id: it.tmdb_id || null,
      title: it.title || it.name || '',
      media_type: it.media_type || it.type || 'movie',
      format: it.format || null,
      status: it.status || null,
      release_date: it.full_release_date || it.release_date || it.first_air_date || ''
    }));

  if (payload.length === 0) return items;

  try {
    const res = await axios.post('/api/media/qualities', { items: payload }, { timeout: 6000 });
    const qualities = res.data?.qualities || {};
    const releaseDates = res.data?.releaseDates || {};

    return items.map((it) => {
      const typeKey = String(it?.media_type || it?.type || 'movie').toLowerCase();
      const idKey = String(it?.external_media_id || it?.id || '');
      const k = `${typeKey}:${idKey}`;
      const q = qualities[k];
      const rel = releaseDates[k];
      if (!q && !rel) return it;
      return {
        ...it,
        quality: q || it.quality,
        release_date: it.release_date || rel || it.release_date
      };
    });
  } catch {
    return items;
  }
};
