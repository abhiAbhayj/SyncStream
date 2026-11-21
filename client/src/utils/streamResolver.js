import axios from 'axios';

/**
 * Resolve direct ad-free HLS (.m3u8) or MP4 stream and subtitles for any media
 * @param {Object} params
 * @param {string|number} params.tmdbId - TMDB identifier or ID
 * @param {string} [params.imdbId] - IMDB identifier (e.g. tt1234567)
 * @param {string} [params.type='movie'] - 'movie' | 'tv' | 'anime'
 * @param {string} [params.title=''] - Media title
 * @param {number} [params.releaseYear] - Release year
 * @param {number} [params.season=1] - TV show season
 * @param {number} [params.episode=1] - TV show episode
 * @returns {Promise<{ success: boolean, streamUrl?: string, subtitles?: Array, quality?: string, provider?: string, fallbackRequired?: boolean }>}
 */
export async function resolveDirectStream({
  tmdbId,
  imdbId,
  type = 'movie',
  title = '',
  releaseYear,
  season = 1,
  episode = 1
}) {
  try {
    const res = await axios.get('/api/stream/resolve', {
      params: {
        tmdbId: String(tmdbId || ''),
        imdbId: imdbId ? String(imdbId) : undefined,
        type: String(type || 'movie'),
        title: String(title || ''),
        releaseYear: releaseYear || undefined,
        season: Number(season) || 1,
        episode: Number(episode) || 1
      },
      timeout: 7500
    });

    if (res.data && res.data.success && res.data.streamUrl) {
      return res.data;
    }

    return {
      success: false,
      fallbackRequired: true,
      message: res.data?.message || 'Direct stream unavailable'
    };
  } catch (error) {
    console.warn('[StreamResolver] Resolution request error:', error.message);
    return {
      success: false,
      fallbackRequired: true,
      message: error.message
    };
  }
}
