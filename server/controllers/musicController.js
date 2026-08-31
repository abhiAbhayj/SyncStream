import axios from 'axios';
import CryptoJS from 'crypto-js';

const JIOSAAVN_BASE = 'https://www.jiosaavn.com/api.php';
const DES_KEY = '38346591';

// Helper to clean HTML entities
const decodeHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&copy;/g, '©');
};

// Decrypt DES-ECB encrypted media URL to direct 320kbps stream
const decryptMediaUrl = (encryptedMediaUrl) => {
  if (!encryptedMediaUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse(DES_KEY);
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedMediaUrl) },
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    ).toString(CryptoJS.enc.Utf8);

    if (!decrypted) return null;

    // Enhance audio stream to 320kbps if available
    const highQuality = decrypted.replace(
      /_96\.mp4|_160\.mp4|_96\.m4a|_160\.m4a/,
      '_320.mp4'
    );
    return highQuality;
  } catch (err) {
    console.error('Audio decryption error:', err.message);
    return null;
  }
};

// High-res album image helper (500x500)
const formatImage = (imgUrl) => {
  if (!imgUrl) return null;
  return imgUrl
    .replace('150x150', '500x500')
    .replace('50x50', '500x500')
    .replace('http:', 'https:');
};

// Map raw JioSaavn song object to clean unified schema
const formatSong = (song) => {
  if (!song) return null;
  const moreInfo = song.more_info || {};
  const encryptedUrl = moreInfo.encrypted_media_url || song.encrypted_media_url;
  const audioUrl = decryptMediaUrl(encryptedUrl);

  // Extract artist string
  let artistName = moreInfo.music || song.music || '';
  if (!artistName && moreInfo.artistMap?.primary_artists?.length) {
    artistName = moreInfo.artistMap.primary_artists.map(a => a.name).join(', ');
  } else if (!artistName && moreInfo.singers) {
    artistName = moreInfo.singers;
  }

  const durationSec = parseInt(moreInfo.duration || song.duration || '0', 10);

  return {
    id: song.id || song.song_id,
    title: decodeHtml(song.title || song.song || 'Unknown Track'),
    artist: decodeHtml(artistName || 'Unknown Artist'),
    album: decodeHtml(moreInfo.album || song.album || 'Single'),
    album_id: moreInfo.album_id || song.album_id || null,
    duration: durationSec,
    image: formatImage(song.image || moreInfo.image),
    audio_url: audioUrl,
    language: song.language || moreInfo.language || 'Global',
    year: song.year || moreInfo.year || '',
    play_count: song.play_count || moreInfo.play_count || '0',
    has_lyrics: moreInfo.has_lyrics === 'true',
    copyright: decodeHtml(moreInfo.copyright_text || ''),
    media_type: 'music'
  };
};

// Language specific trending search queries
const TRENDING_QUERIES = {
  all: 'Top 50 Hits',
  hindi: 'Hindi Top Hits Bollywood',
  english: 'English Pop Top Hits',
  korean: 'K-Pop BTS BLACKPINK',
  kpop: 'K-Pop Korean Hits',
  tamil: 'Tamil Hits Anirudh',
  telugu: 'Telugu Hits Sid Sriram',
  malayalam: 'Malayalam Hits Sushin Shyam',
  kannada: 'Kannada Hits Ravi Basrur',
  punjabi: 'Punjabi Hits',
  lofi: 'Lofi Chill Beats',
  anime: 'Anime Japanese OST'
};

// 1. Get Trending / Featured Songs by Language
export const getTrendingMusic = async (req, res) => {
  const language = (req.query.language || 'all').toLowerCase();
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);

  const query = TRENDING_QUERIES[language] || `${language} Top Hits 2026`;

  try {
    const url = `${JIOSAAVN_BASE}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=${limit}&p=${page}&q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const rawResults = response.data.results || [];
    const songs = rawResults
      .map(formatSong)
      .filter(s => s && s.audio_url);

    res.json({
      language,
      page,
      total: response.data.total || songs.length,
      songs
    });
  } catch (error) {
    console.error('[Music Controller Trending Error]:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending music', songs: [] });
  }
};

// 2. Search Music (Songs, Artists, Albums)
export const searchMusic = async (req, res) => {
  const { query, language } = req.query;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '25', 10);

  if (!query || query.trim() === '') {
    return getTrendingMusic(req, res);
  }

  let finalQuery = query.trim();
  if (language && language !== 'all') {
    finalQuery += ` ${language}`;
  }

  try {
    const url = `${JIOSAAVN_BASE}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=${limit}&p=${page}&q=${encodeURIComponent(finalQuery)}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const rawResults = response.data.results || [];
    const songs = rawResults
      .map(formatSong)
      .filter(s => s && s.audio_url);

    res.json({
      query: finalQuery,
      page,
      total: response.data.total || songs.length,
      songs
    });
  } catch (error) {
    console.error('[Music Controller Search Error]:', error.message);
    res.status(500).json({ error: 'Failed to search music catalog', songs: [] });
  }
};

// 3. Get Curated Playlists / Charts
export const getMusicCharts = async (req, res) => {
  try {
    const categories = [
      { id: 'all', title: '🔥 Global Top 20', query: 'Global Top Hits 2026' },
      { id: 'hindi', title: '🇮🇳 Bollywood Trending', query: 'Bollywood Top Hits 2026' },
      { id: 'english', title: '🌍 Global Pop Hits', query: 'Top Pop Hits 2026' },
      { id: 'korean', title: '🇰🇷 K-Pop Worldwide', query: 'K-Pop Top Hits 2026' },
      { id: 'tamil', title: '⚡ Kollywood Explosive', query: 'Tamil Top Hits Anirudh 2026' },
      { id: 'telugu', title: '💥 Tollywood Party', query: 'Telugu Top Hits Sid Sriram 2026' },
      { id: 'malayalam', title: '🌿 Mollywood Melodies', query: 'Malayalam Melodies Sushin Shyam' },
      { id: 'kannada', title: '🦁 Sandalwood BGM & Hits', query: 'Kannada Hits Ravi Basrur' },
      { id: 'lofi', title: '☕ Midnight Lo-Fi & Chill', query: 'Lofi Chill Study Sleep' },
      { id: 'anime', title: '🌸 Anime & Japanese OSTs', query: 'Anime Openings Japanese OST' }
    ];

    const promises = categories.map(async (cat) => {
      try {
        const url = `${JIOSAAVN_BASE}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=8&p=1&q=${encodeURIComponent(cat.query)}`;
        const r = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 8000
        });
        const songs = (r.data.results || []).map(formatSong).filter(s => s && s.audio_url);
        return {
          id: cat.id,
          title: cat.title,
          songs: songs.slice(0, 8)
        };
      } catch (e) {
        return { id: cat.id, title: cat.title, songs: [] };
      }
    });

    const charts = await Promise.all(promises);
    res.json(charts);
  } catch (error) {
    console.error('[Music Controller Charts Error]:', error.message);
    res.status(500).json({ error: 'Failed to fetch music charts' });
  }
};

// 4. Get Song Details by ID
export const getSongDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const url = `${JIOSAAVN_BASE}?__call=song.getDetails&_format=json&_marker=0&api_version=4&ctx=web6dot0&pids=${id}`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });

    const songData = response.data[id] || Object.values(response.data || {})[0];
    if (!songData) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const formatted = formatSong(songData);

    let recommendations = [];
    try {
      const recQuery = formatted.artist ? `${formatted.artist} hits` : formatted.title;
      const recUrl = `${JIOSAAVN_BASE}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=8&p=1&q=${encodeURIComponent(recQuery)}`;
      const recRes = await axios.get(recUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 });
      recommendations = (recRes.data.results || [])
        .map(formatSong)
        .filter(s => s && s.audio_url && s.id !== formatted.id)
        .slice(0, 6);
    } catch (e) {
      // Recommendations non-blocking
    }

    res.json({
      ...formatted,
      recommendations
    });
  } catch (error) {
    console.error('[Music Controller Song Detail Error]:', error.message);
    res.status(500).json({ error: 'Failed to fetch song details' });
  }
};
