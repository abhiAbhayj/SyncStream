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
  all: 'Top 50 Hits 2026',
  hindi: 'Hindi Top Hits Bollywood 2026',
  english: 'English Pop Top Hits 2026',
  korean: 'K-Pop BTS BLACKPINK 2026',
  kpop: 'K-Pop Korean Hits BTS',
  tamil: 'Tamil Hits Anirudh 2026',
  telugu: 'Telugu Hits 2026',
  malayalam: 'Malayalam Hits 2026',
  kannada: 'Kannada Hits 2026',
  punjabi: 'Punjabi Hits Diljit Dosanjh 2026',
  lofi: 'Lofi Chill Beats Study',
  anime: 'Anime Japanese OST Opening'
};

// Helper: fetch songs from JioSaavn by query
const fetchSaavnSongs = async (query, n = 8) => {
  const url = `${JIOSAAVN_BASE}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=${n}&p=1&q=${encodeURIComponent(query)}`;
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 10000
  });
  return (response.data.results || []).map(formatSong).filter(s => s && s.audio_url);
};

// Delay helper to avoid JioSaavn rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

// 2. Search Music (Songs, Artists, Albums) with Smart Progressive Fallback
export const searchMusic = async (req, res) => {
  const { query, language } = req.query;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '25', 10);

  if (!query || query.trim() === '') {
    return getTrendingMusic(req, res);
  }

  const rawQuery = query.trim();
  // Generate cleaned candidate queries for complex searches like "hunt you down a rock music from teach you a lesson"
  const cleaned = rawQuery
    .replace(/\b(a|the|song|songs|music|from|track|audio|mp3|rock|pop|soundtrack)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const shortKeywords = cleaned.split(' ').slice(0, 3).join(' ');

  const candidateQueries = [rawQuery];
  if (cleaned && cleaned !== rawQuery) candidateQueries.push(cleaned);
  if (shortKeywords && shortKeywords !== cleaned && shortKeywords !== rawQuery) {
    candidateQueries.push(shortKeywords);
  }

  try {
    let finalSongs = [];
    let totalCount = 0;

    for (const q of candidateQueries) {
      let searchQuery = q;
      if (language && language !== 'all') {
        searchQuery += ` ${language}`;
      }

      const url = `${JIOSAAVN_BASE}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=${limit}&p=${page}&q=${encodeURIComponent(searchQuery)}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const rawResults = response.data.results || [];
      const validSongs = rawResults
        .map(formatSong)
        .filter(s => s && s.audio_url);

      if (validSongs.length > 0) {
        finalSongs = validSongs;
        totalCount = response.data.total || validSongs.length;
        break;
      }
    }

    res.json({
      query: rawQuery,
      page,
      total: totalCount,
      songs: finalSongs
    });
  } catch (error) {
    console.error('[Music Controller Search Error]:', error.message);
    res.status(500).json({ error: 'Failed to search music catalog', songs: [] });
  }
};

// 3. Get Curated Regional Playlists / Charts
// IMPORTANT: Sequential fetching with delays to avoid JioSaavn rate limiting.
// Parallel Promise.all() caused rate limiting which returned garbage mixed results.
export const getMusicCharts = async (req, res) => {
  const CHART_CATEGORIES = [
    {
      id: 'trending_global',
      title: '🔥 Trending Globally',
      subtitle: 'Top songs across all languages right now',
      query: 'Top Trending Songs 2026 Hits'
    },
    {
      id: 'recently_released',
      title: '🆕 Recently Released',
      subtitle: 'Freshest drops of 2026',
      query: 'New Songs 2026 Latest Release Hindi English'
    },
    {
      id: 'bollywood',
      title: '🇮🇳 Bollywood Hits',
      subtitle: "Hindi cinema's biggest tracks",
      query: 'Bollywood Hindi Film Songs 2026 Arijit Singh'
    },
    {
      id: 'telugu',
      title: '🎬 Telugu Tollywood',
      subtitle: 'Trending Telugu cinema songs',
      query: 'Telugu Film Songs 2026 DSP Devi Sri Prasad'
    },
    {
      id: 'tamil',
      title: '⚡ Tamil Kollywood',
      subtitle: 'Chart-toppers from Tamil cinema',
      query: 'Tamil Film Songs 2026 Anirudh Vijay Thalapathy'
    },
    {
      id: 'kannada',
      title: '🦁 Kannada Sandalwood',
      subtitle: 'Hottest Kannada movie songs',
      query: 'Kannada Film Songs 2026 Ravi Basrur'
    },
    {
      id: 'malayalam',
      title: '🌿 Malayalam Mollywood',
      subtitle: 'Soulful Malayalam tracks',
      query: 'Malayalam Film Songs 2026 Sushin Shyam'
    },
    {
      id: 'punjabi',
      title: '🥁 Punjabi Bangers',
      subtitle: 'Desi beats from Punjab',
      query: 'Punjabi Songs 2026 Diljit Dosanjh AP Dhillon'
    },
    {
      id: 'kpop',
      title: '🇰🇷 K-Pop Worldwide',
      subtitle: 'Global K-Pop chart toppers',
      query: 'BTS BLACKPINK Stray Kids K-Pop 2026'
    },
    {
      id: 'global_pop',
      title: '🌍 Global English Pop',
      subtitle: 'International English hits',
      query: 'English Pop Hits Olivia Rodrigo Sabrina Carpenter Taylor Swift 2026'
    },
    {
      id: 'lofi',
      title: '☕ Lo-Fi & Chill',
      subtitle: 'Study, sleep and relax vibes',
      query: 'Lofi Chill Study Beats Relaxing Hindi English'
    },
    {
      id: 'anime',
      title: '🌸 Anime & J-Pop',
      subtitle: 'Japanese anime openings & OSTs',
      query: 'Anime Opening Song Japanese OST Naruto'
    },
    {
      id: 'devotional',
      title: '🕉️ Devotional & Bhajans',
      subtitle: 'Spiritual melodies & prayers',
      query: 'Devotional Bhajan Mantra Songs Hanuman'
    }
  ];

  const charts = [];

  // Sequential fetching — one at a time with 250ms delay to avoid rate limiting
  for (const cat of CHART_CATEGORIES) {
    try {
      const songs = await fetchSaavnSongs(cat.query, 8);
      charts.push({
        id: cat.id,
        title: cat.title,
        subtitle: cat.subtitle,
        songs: songs.slice(0, 8)
      });
    } catch (e) {
      console.warn(`[Charts] Failed to fetch ${cat.id}:`, e.message);
      charts.push({ id: cat.id, title: cat.title, subtitle: cat.subtitle, songs: [] });
    }
    // 250ms gap between each request
    await delay(250);
  }

  res.json(charts);
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

// 5. Get Lyrics (Synced & Plain) via LRCLIB & JioSaavn
export const getLyrics = async (req, res) => {
  const { title, artist, duration, songId } = req.query;

  if (!title) {
    return res.status(400).json({ error: 'Title is required for lyrics lookup' });
  }

  // Clean title (remove (From "Movie"), (Feat...), etc.)
  const cleanTitle = title
    .replace(/\s*\(From.*?\)/gi, '')
    .replace(/\s*\(Feat.*?\)/gi, '')
    .replace(/\s*\[.*?\]/gi, '')
    .replace(/\s*-\s*.*$/gi, '')
    .trim();

  const cleanArtist = (artist || '').split(',')[0].trim();

  try {
    // 1. Try LRCLIB for synchronized and plain lyrics
    let lrcUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
    if (duration) lrcUrl += `&duration=${parseInt(duration, 10)}`;

    try {
      const lrcRes = await axios.get(lrcUrl, {
        headers: { 'User-Agent': 'SyncStream/1.0 (https://github.com/abhiAbhayj/SyncStream)' },
        timeout: 5000
      });

      if (lrcRes.data && (lrcRes.data.syncedLyrics || lrcRes.data.plainLyrics)) {
        // Parse synced lyrics into timestamped array
        let parsedLines = [];
        if (lrcRes.data.syncedLyrics) {
          parsedLines = lrcRes.data.syncedLyrics
            .split('\n')
            .map((line) => {
              const match = line.match(/\[(\d+):(\d+\.?\d*)\](.*)/);
              if (!match) return null;
              return {
                time: parseInt(match[1], 10) * 60 + parseFloat(match[2]),
                text: match[3].trim()
              };
            })
            .filter(Boolean);
        }

        return res.json({
          has_lyrics: true,
          synced: parsedLines.length > 0,
          syncedLyrics: parsedLines,
          plainLyrics: lrcRes.data.plainLyrics || '',
          source: 'LRCLIB'
        });
      }
    } catch (e) {
      // Fall through to search or JioSaavn
    }

    // 2. Try LRCLIB search endpoint if exact get failed
    try {
      const searchLrcUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}`;
      const sRes = await axios.get(searchLrcUrl, {
        headers: { 'User-Agent': 'SyncStream/1.0' },
        timeout: 5000
      });

      const firstMatch = sRes.data?.[0];
      if (firstMatch && (firstMatch.syncedLyrics || firstMatch.plainLyrics)) {
        let parsedLines = [];
        if (firstMatch.syncedLyrics) {
          parsedLines = firstMatch.syncedLyrics
            .split('\n')
            .map((line) => {
              const match = line.match(/\[(\d+):(\d+\.?\d*)\](.*)/);
              if (!match) return null;
              return {
                time: parseInt(match[1], 10) * 60 + parseFloat(match[2]),
                text: match[3].trim()
              };
            })
            .filter(Boolean);
        }

        return res.json({
          has_lyrics: true,
          synced: parsedLines.length > 0,
          syncedLyrics: parsedLines,
          plainLyrics: firstMatch.plainLyrics || '',
          source: 'LRCLIB'
        });
      }
    } catch (e) {
      // Fall through to JioSaavn
    }

    // 3. Fallback to JioSaavn native lyrics if songId provided
    if (songId) {
      try {
        const jioLyrUrl = `${JIOSAAVN_BASE}?__call=lyrics.getLyrics&_format=json&_marker=0&api_version=4&ctx=web6dot0&lyrics_id=${songId}`;
        const jioRes = await axios.get(jioLyrUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 5000
        });

        if (jioRes.data?.lyrics) {
          const rawPlain = jioRes.data.lyrics.replace(/<br\s*[\/]?>/gi, '\n');
          return res.json({
            has_lyrics: true,
            synced: false,
            syncedLyrics: [],
            plainLyrics: rawPlain,
            source: 'JioSaavn'
          });
        }
      } catch (e) {}
    }

    res.json({
      has_lyrics: false,
      synced: false,
      syncedLyrics: [],
      plainLyrics: 'No lyrics found for this track. Enjoy the instrumental vibe!',
      source: null
    });
  } catch (err) {
    console.error('[Music Controller Lyrics Error]:', err.message);
    res.status(500).json({ error: 'Failed to retrieve lyrics' });
  }
};
