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

// ── Transliteration / Romanization Engine (Converts Hangul, Indic, Kana scripts to English Latin text) ──
const KANA_MAP = {
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'wo', 'ん': 'n',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
  'カ': 'ka', '키': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
  'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
  'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
  'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n'
};

const HANGUL_CHO = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
const HANGUL_JUNG = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
const HANGUL_JONG = ['','k','k','ks','n','nj','nh','d','l','lg','lm','lb','ls','lt','lp','lh','m','p','ps','s','ss','ng','j','ch','k','t','p','h'];

const INDIC_OFFSETS = {
  devanagari: 0x0900,
  bengali: 0x0980,
  gurmukhi: 0x0A00,
  gujarati: 0x0A80,
  oriya: 0x0B00,
  tamil: 0x0B80,
  telugu: 0x0C00,
  kannada: 0x0C80,
  malayalam: 0x0D00
};

const INDIC_MAP = {
  0x01: 'n', 0x02: 'm', 0x03: 'h',
  0x05: 'a', 0x06: 'aa', 0x07: 'i', 0x08: 'ee', 0x09: 'u', 0x0A: 'oo', 0x0B: 'ri', 0x0C: 'li',
  0x0E: 'e', 0x0F: 'e', 0x10: 'ai', 0x11: 'o', 0x12: 'o', 0x13: 'au', 0x14: 'au',
  0x15: 'k', 0x16: 'kh', 0x17: 'g', 0x18: 'gh', 0x19: 'ng',
  0x1A: 'ch', 0x1B: 'chh', 0x1C: 'j', 0x1D: 'jh', 0x1E: 'ny',
  0x1F: 't', 0x20: 'th', 0x21: 'd', 0x22: 'dh', 0x23: 'n',
  0x24: 't', 0x25: 'th', 0x26: 'd', 0x27: 'dh', 0x28: 'n', 0x29: 'nn',
  0x2A: 'p', 0x2B: 'ph', 0x2C: 'b', 0x2D: 'bh', 0x2E: 'm',
  0x2F: 'y', 0x30: 'r', 0x31: 'rr', 0x32: 'l', 0x33: 'l', 0x34: 'll', 0x35: 'v',
  0x36: 'sh', 0x37: 'sh', 0x38: 's', 0x39: 'h',
  0x3E: 'aa', 0x3F: 'i', 0x40: 'ee', 0x41: 'u', 0x42: 'oo', 0x43: 'ri', 0x44: 'rri',
  0x46: 'e', 0x47: 'e', 0x48: 'ai', 0x4A: 'o', 0x4B: 'o', 0x4C: 'au',
  0x4D: ''
};

export const toEnglishText = (text) => {
  if (!text) return '';
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = text.charCodeAt(i);

    // 1. Hangul (Korean) -> Revised Romanization English
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const idx = code - 0xAC00;
      const cho = Math.floor(idx / 588);
      const jung = Math.floor((idx % 588) / 28);
      const jong = idx % 28;
      out += HANGUL_CHO[cho] + HANGUL_JUNG[jung] + HANGUL_JONG[jong];
      continue;
    }

    // 2. Japanese Kana -> Romaji
    if (KANA_MAP[char]) {
      out += KANA_MAP[char];
      continue;
    }

    // 3. Indic Scripts (Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi)
    let isIndic = false;
    for (const [, base] of Object.entries(INDIC_OFFSETS)) {
      if (code >= base && code <= base + 0x7F) {
        const offset = code - base;
        const nextCode = i + 1 < text.length ? text.charCodeAt(i + 1) : 0;
        const nextOffset = nextCode >= base && nextCode <= base + 0x7F ? nextCode - base : -1;
        const isConsonant = (offset >= 0x15 && offset <= 0x39);
        const charStr = INDIC_MAP[offset] !== undefined ? INDIC_MAP[offset] : '';

        if (isConsonant) {
          out += charStr;
          if (nextOffset === 0x4D) {
            // Halant (virama), omit implicit 'a'
          } else if (nextOffset >= 0x3E && nextOffset <= 0x4C) {
            // Followed by vowel sign, omit implicit 'a'
          } else {
            out += 'a';
          }
        } else {
          out += charStr;
        }
        isIndic = true;
        break;
      }
    }
    if (isIndic) continue;

    out += char;
  }
  return out;
};

// Filter ONLY spam karaoke/tribute practice tracks. Remixes, BGM, Soundtracks, and Album versions ARE ALLOWED!
const isSpamTrack = (song) => {
  if (!song) return false;
  const text = `${song.title || ''} ${song.album || ''} ${song.artist || ''} ${song.subtitle || ''}`.toLowerCase();
  return /\b(zzang karaoke|melody karaoke version|piano tutorial practice|ringtone download)\b/i.test(text);
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
    artist: decodeHtml(artistName || song.subtitle || 'Unknown Artist'),
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

// Multi-language & genre trending search queries continuously updated with latest 2026 hits
const TRENDING_QUERIES = {
  all: [
    'The Wild Theme OM Chapter 1',
    'Arijit Singh Hits',
    'Imagine Dragons',
    'Lady Gaga',
    'Big Dawgs Hanumankind',
    'Alan Walker',
    'DJ Snake',
    'BLACKPINK',
    'Harrdy Sandhu Hits',
    'Guru Randhawa',
    'Hunt You Down Richardson',
    'Sia Hits',
    'Ed Sheeran',
    'Ellie Goulding',
    'Ravi Basrur Hits',
    'Aish Songs'
  ],
  blues_rap: [
    'Hunt You Down Richardson',
    'Lee Richardson Blues Rap',
    'Blues Rap Rock',
    'Back Alley Blues Rap',
    'Gravel Heart Gospel Blues Rap'
  ],
  rap: [
    'Big Dawgs Hanumankind',
    'Eminem Rap God',
    'Divine Hindi Rap',
    'Kendrick Lamar',
    'Travis Scott',
    'Drake Hits',
    'Karan Aujla Rap'
  ],
  rock: [
    'The Wild Theme OM Chapter 1',
    'Imagine Dragons',
    'Linkin Park',
    'Queen Bohemian Rhapsody',
    'Coldplay',
    'Hunt You Down Richardson',
    'Lee Richardson',
    'Bon Jovi'
  ],
  kpop: [
    'BLACKPINK Hits',
    'BTS Dynamite',
    'Stray Kids',
    'NewJeans Hype Boy',
    'TWICE Feel Special'
  ],
  korean: [
    'Korean Drama OST 2026',
    'IU Korean Hits',
    'BLACKPINK',
    'BTS',
    'NewJeans',
    'K-Drama Soundtracks'
  ],
  hindi: [
    'Latest Bollywood 2026 Hits',
    'Arijit Singh Hits',
    'Harrdy Sandhu Hits',
    'Guru Randhawa Hits',
    'Pritam Hits',
    'Hanumankind',
    'Aish Songs',
    'Shreya Ghoshal Hits'
  ],
  anime: [
    'Anime Opening OST',
    'LiSA Gurenge',
    'Kenshi Yonezu Peace Sign',
    'Naruto Blue Bird Opening',
    'Attack on Titan Opening'
  ],
  english: [
    'Latest English Pop 2026',
    'Lady Gaga',
    'Alan Walker',
    'DJ Snake',
    'Ed Sheeran',
    'Imagine Dragons',
    'Sia',
    'Ellie Goulding',
    'Taylor Swift',
    'The Weeknd'
  ],
  kannada: [
    'Kannada Film Hits 2026',
    'Ravi Basrur KGF Salaar',
    'Kantara Songs',
    'Sonu Nigam Kannada Hits',
    'Vijay Prakash Kannada'
  ],
  malayalam: [
    'Malayalam Film Hits 2026',
    'Sushin Shyam Hits',
    'Jassie Gift Malayalam',
    'Vineeth Sreenivasan Hits',
    'Hanumankind'
  ],
  telugu: [
    'Telugu Film Hits 2026',
    'The Wild Theme OM Chapter 1 Telugu',
    'Ravi Basrur Telugu',
    'DSP Telugu Hits',
    'Thaman S Telugu Hits',
    'Anirudh Telugu Hits',
    'Pushpa Telugu Songs'
  ],
  tamil: [
    'The Wild Theme OM Chapter 1 Tamil',
    'Sai Abhyankkar OM Chapter 1',
    'Tamil Film Hits 2026',
    'Anirudh Tamil Hits',
    'AR Rahman Tamil Hits',
    'Harris Jayaraj Tamil',
    'Ravi Basrur Tamil',
    'Yuvan Shankar Raja Tamil'
  ],
  marathi: [
    'Marathi Film Hits 2026',
    'Ajay Atul Marathi Hits',
    'Sairat Marathi Songs',
    'Avadhoot Gupte Marathi',
    'Swapnil Bandodkar Marathi'
  ]
};

// Helper: fetch songs from JioSaavn by query
export const fetchSaavnSongs = async (query, n = 8) => {
  const url = `${JIOSAAVN_BASE}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=${n}&p=1&q=${encodeURIComponent(query)}`;
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 10000
  });
  return (response.data.results || [])
    .map(formatSong)
    .filter(s => s && s.audio_url && !isSpamTrack(s));
};

// Direct helper for Home page live trending music feed
export const getTrendingMusicDirect = async (limit = 12) => {
  const queries = [
    'The Wild Theme OM Chapter 1',
    'Big Dawgs Hanumankind',
    'Hunt You Down Richardson',
    'Latest Bollywood 2026 Hits',
    'Tamil Film Hits 2026',
    'Telugu Film Hits 2026',
    'Imagine Dragons'
  ];
  const seen = new Set();
  const songs = [];
  for (const q of queries) {
    try {
      const results = await fetchSaavnSongs(q, 4);
      for (const s of results) {
        const key = `${(s.title || '').toLowerCase().trim()}_${(s.artist || '').toLowerCase().trim()}`;
        if (!seen.has(key) && !seen.has(s.id)) {
          seen.add(key);
          seen.add(s.id);
          songs.push({
            ...s,
            poster_path: s.image,
            media_type: 'music'
          });
        }
      }
      if (songs.length >= limit) break;
    } catch (e) {}
  }
  return songs.slice(0, limit);
};

// Delay helper to avoid JioSaavn rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 1. Get Trending / Featured Songs by Language / Genre
export const getTrendingMusic = async (req, res) => {
  const language = (req.query.language || 'all').toLowerCase();
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '24', 10);

  const queryList = TRENDING_QUERIES[language] || [`${language} Hits 2026`];

  try {
    const fetchPromises = queryList.map(async (q) => {
      const url = `${JIOSAAVN_BASE}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=12&p=${page}&q=${encodeURIComponent(q)}`;
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 8000
        });
        const rawResults = response.data.results || [];
        return rawResults
          .map(formatSong)
          .filter(s => s && s.audio_url && s.duration > 20 && s.duration < 800 && !isSpamTrack(s));
      } catch (err) {
        return [];
      }
    });

    const resultsArray = await Promise.all(fetchPromises);
    const combined = resultsArray.flat();

    // Deduplicate songs by title/id
    const seen = new Set();
    const uniqueSongs = [];
    for (const song of combined) {
      const key = `${(song.title || '').toLowerCase().trim()}_${(song.artist || '').toLowerCase().trim()}`;
      if (!seen.has(key) && !seen.has(song.id)) {
        seen.add(key);
        seen.add(song.id);
        uniqueSongs.push(song);
      }
    }

    res.json({
      language,
      page,
      total: uniqueSongs.length,
      songs: uniqueSongs.slice(0, limit)
    });
  } catch (error) {
    console.error('[Music Controller Trending Error]:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending music', songs: [] });
  }
};

// ── Curated Spotify & Billboard Top Charts Registry ──
export const SPOTIFY_BILLBOARD_CHARTS = [
  {
    id: 'spotify_top_50',
    title: '🏆 Spotify Top 50 - Global',
    subtitle: 'The biggest and most streamed tracks in the world right now',
    badge: 'Spotify Official',
    gradient: 'from-emerald-600 via-teal-700 to-black',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    query: 'Sabrina Carpenter Espresso Birds of a Feather Billie Eilish Die With A Smile Lady Gaga Bruno Mars Hanumankind Big Dawgs The Weeknd Taylor Swift'
  },
  {
    id: 'todays_top_hits',
    title: "🔥 Today's Top Hits",
    subtitle: 'Global chart toppers, viral streaming phenomenons & pop anthems',
    badge: 'Trending Now',
    gradient: 'from-pink-600 via-purple-700 to-black',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    query: 'Sabrina Carpenter Taste Chappell Roan Good Luck Babe Post Malone I Had Some Help Dua Lipa Houdini Benson Boone Beautiful Things'
  },
  {
    id: 'billboard_hot_100',
    title: '🌟 Billboard Hot 100 Hits',
    subtitle: 'The definitive standard of the most popular global tracks',
    badge: 'Billboard 2026',
    gradient: 'from-amber-600 via-orange-700 to-black',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    query: 'Billboard Hot 100 Eminem Houdini Kendrick Lamar Not Like Us Shaboozey Teddy Swims Lose Control Hozier Too Sweet'
  },
  {
    id: 'viral_50',
    title: '⚡ Global Viral 50',
    subtitle: 'Catchiest viral anthems taking over Reels, TikTok & social media',
    badge: 'Viral Trends',
    gradient: 'from-cyan-600 via-blue-700 to-black',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    query: 'Big Dawgs Hanumankind Million Dollar Baby Tommy Richman Gata Only FloyyMenor Artemas I Like the Way You Kiss Me'
  },
  {
    id: 'bollywood_top_50',
    title: '🇮🇳 Bollywood Top 50',
    subtitle: 'The undisputed chartbusters of Hindi cinema & Indian pop',
    badge: 'Bollywood',
    gradient: 'from-red-600 via-rose-700 to-black',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    query: 'Latest Bollywood 2026 Hits Arijit Singh Shreya Ghoshal Pritam Vishal Mishra Badshah Diljit Dosanjh Karan Aujla'
  },
  {
    id: 'tollywood_top_50',
    title: '🎬 Tollywood Top 50 (Telugu)',
    subtitle: 'High-octane mass beats, soulful melodies & cinema anthems',
    badge: 'Tollywood',
    gradient: 'from-yellow-600 via-amber-700 to-black',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    query: 'Telugu Film Hits 2026 Devi Sri Prasad Pushpa Thaman S Anirudh Telugu Ram Miriyala Sid Sriram Telugu'
  },
  {
    id: 'kollywood_top_50',
    title: '⚡ Kollywood Top 50 (Tamil)',
    subtitle: 'Electrifying Tamil cinema anthems & viral chartbusters',
    badge: 'Kollywood',
    gradient: 'from-purple-600 via-indigo-700 to-black',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    query: 'The Wild Theme OM Chapter 1 Tamil Film Hits 2026 Anirudh Tamil AR Rahman Sai Abhyankkar Yuvan Shankar Raja'
  },
  {
    id: 'punjabi_top_50',
    title: '🚜 Punjabi Wave Top 50',
    subtitle: 'Bhangra swagger, hip-hop fusion & Punjabi chart bangers',
    badge: 'Punjabi Hits',
    gradient: 'from-orange-500 via-red-600 to-black',
    image: 'https://images.unsplash.com/photo-1520523839898-5071282543e2?w=600&auto=format&fit=crop&q=80',
    query: 'Karan Aujla Tauba Tauba Diljit Dosanjh AP Dhillon Sidhu Moosewala Shubh Punjabi Hits 2026 Harrdy Sandhu'
  },
  {
    id: 'kpop_top_50',
    title: '🇰🇷 K-Pop Global Top 50',
    subtitle: 'World-dominating Korean pop sensations & addictive dance choreo',
    badge: 'K-Pop Top',
    gradient: 'from-fuchsia-600 via-pink-700 to-black',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    query: 'BLACKPINK BTS Stray Kids NewJeans LE SSERAFIM aespa IVE TWICE Jungkook ILLIT Magnetic'
  },
  {
    id: 'anime_top_50',
    title: '🌸 Anime & J-Pop Global Hits',
    subtitle: 'Iconic anime openings, hype battle themes & Japanese pop',
    badge: 'Anime OST',
    gradient: 'from-violet-600 via-purple-800 to-black',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    query: 'Bling-Bang-Bang-Born Creepy Nuts YOASOBI Idol LiSA Gurenge Kenshi Yonezu Kick Back Anime Opening OST'
  },
  {
    id: 'hiphop_top_50',
    title: '🎤 Hip-Hop & Rap Top 50',
    subtitle: 'Raw lyricism, 808 heavy bass and undisputed hip-hop icons',
    badge: 'Hip-Hop Hits',
    gradient: 'from-emerald-700 via-slate-800 to-black',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    query: 'Big Dawgs Hanumankind Eminem Rap God Kendrick Lamar Not Like Us Travis Scott FE!N Drake Future Metro Boomin'
  },
  {
    id: 'rock_top_50',
    title: '🎸 Rock & Heavy Anthems',
    subtitle: 'Cinematic guitar riffs, stadium anthems & timeless rock legends',
    badge: 'Rock Legends',
    gradient: 'from-blue-700 via-indigo-900 to-black',
    image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    query: 'The Wild Theme Imagine Dragons Believer Linkin Park In The End Queen Bohemian Rhapsody Coldplay Bon Jovi'
  }
];

// 2. Search Music with Multi-Pass Universal Fallback Engine
export const searchMusic = async (req, res) => {
  const { query, language } = req.query;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '25', 10);

  if (!query || query.trim() === '') {
    return getTrendingMusic(req, res);
  }

  const rawQuery = query.trim();

  // Multi-Pass Candidate Queries Strategy
  const candidateQueries = [];

  // Pass 1: Exact raw query
  candidateQueries.push(rawQuery);

  // Pass 2: Cleaned query (strip out 'feat', 'ft', '(official audio)', etc.)
  const cleanTitle = rawQuery
    .replace(/\s*\((?:from|feat|ft|with|official|video|audio|remix|version|ost)[^\)]*\)/gi, '')
    .replace(/\s*\[(?:from|feat|ft|with|official|video|audio|remix|version|ost)[^\]]*\]/gi, '')
    .replace(/\s*-\s*(?:from|feat|ft|with|official|video|audio|remix|version|original).*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleanTitle && cleanTitle !== rawQuery) {
    candidateQueries.push(cleanTitle);
  }

  // Pass 3: Romanized / transliterated query for Non-Latin scripts
  const romanized = toEnglishText(rawQuery);
  if (romanized && romanized !== rawQuery) {
    candidateQueries.push(romanized);
  }

  // Pass 4: Artist and song permutations
  if (rawQuery.includes('-')) {
    const parts = rawQuery.split('-').map(p => p.trim());
    if (parts.length >= 2) {
      candidateQueries.push(`${parts[1]} ${parts[0]}`);
      candidateQueries.push(parts[0]);
      candidateQueries.push(parts[1]);
    }
  }

  // Pass 5: Fallback general keyword search
  candidateQueries.push(`${rawQuery} song`);
  candidateQueries.push(`${rawQuery} hits`);

  try {
    const seen = new Set();
    const collectedSongs = [];
    let totalCount = 0;

    for (const q of candidateQueries) {
      let searchQuery = q;
      if (language && language !== 'all' && !searchQuery.toLowerCase().includes(language)) {
        searchQuery += ` ${language}`;
      }

      const url = `${JIOSAAVN_BASE}?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=${limit}&p=${page}&q=${encodeURIComponent(searchQuery)}`;

      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 8000
        });

        const rawResults = response.data.results || [];
        const validSongs = rawResults
          .map(formatSong)
          .filter(s => s && s.audio_url && !isSpamTrack(s));

        for (const s of validSongs) {
          const key = `${(s.title || '').toLowerCase().trim()}_${(s.artist || '').toLowerCase().trim()}`;
          if (!seen.has(key) && !seen.has(s.id)) {
            seen.add(key);
            seen.add(s.id);
            collectedSongs.push(s);
          }
        }

        totalCount = Math.max(totalCount, response.data.total || collectedSongs.length);
        if (collectedSongs.length >= limit) break;
      } catch (err) {
        // Continue to next candidate query on error
      }
    }

    res.json({
      query: rawQuery,
      page,
      total: totalCount || collectedSongs.length,
      songs: collectedSongs.slice(0, limit)
    });
  } catch (error) {
    console.error('[Music Controller Search Error]:', error.message);
    res.status(500).json({ error: 'Failed to search music catalog', songs: [] });
  }
};

// 3. Get Spotify / Billboard Curated Charts Overview
export const getMusicCharts = async (req, res) => {
  try {
    const chartsWithPreviews = [];

    for (const chart of SPOTIFY_BILLBOARD_CHARTS) {
      try {
        const sampleSongs = await fetchSaavnSongs(chart.query, 6);
        chartsWithPreviews.push({
          id: chart.id,
          title: chart.title,
          subtitle: chart.subtitle,
          badge: chart.badge,
          gradient: chart.gradient,
          image: chart.image,
          songCount: 50,
          previewSongs: sampleSongs.slice(0, 4)
        });
      } catch (e) {
        chartsWithPreviews.push({
          id: chart.id,
          title: chart.title,
          subtitle: chart.subtitle,
          badge: chart.badge,
          gradient: chart.gradient,
          image: chart.image,
          songCount: 50,
          previewSongs: []
        });
      }
    }

    res.json(chartsWithPreviews);
  } catch (err) {
    console.error('[Music Controller Charts Error]:', err.message);
    res.status(500).json({ error: 'Failed to fetch charts', charts: [] });
  }
};

// 4. Get Full Tracklist for a Specific Spotify / Billboard Chart
export const getChartById = async (req, res) => {
  const { chartId } = req.params;
  const targetChart = SPOTIFY_BILLBOARD_CHARTS.find(c => c.id === chartId);

  if (!targetChart) {
    return res.status(404).json({ error: 'Chart not found' });
  }

  try {
    const songs = await fetchSaavnSongs(targetChart.query, 30);
    res.json({
      ...targetChart,
      songs
    });
  } catch (err) {
    console.error(`[Music Controller Chart ${chartId} Error]:`, err.message);
    res.status(500).json({ error: 'Failed to load chart songs', songs: [] });
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
        .filter(s => s && s.audio_url && s.id !== formatted.id && !isSpamTrack(s))
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

// 5. Get Lyrics (Synced & Plain) Transliterated into English Latin Text
export const getLyrics = async (req, res) => {
  const { title, artist, duration, songId } = req.query;

  if (!title) {
    return res.status(400).json({ error: 'Title is required for lyrics lookup' });
  }

  // Clean title (remove (From "Movie"), (Feat...), etc.)
  const cleanTitle = title
    .replace(/\s*\((?:from|feat|ft|with|official|video|audio|remix|version)[^\)]*\)/gi, '')
    .replace(/\s*\[(?:from|feat|ft|with|official|video|audio|remix|version)[^\]]*\]/gi, '')
    .replace(/\s*-\s*(?:from|feat|ft|with|official|video|audio|remix|version|original).*$/gi, '')
    .replace(/\s*-\s*.*$/gi, '')
    .trim();

  const cleanArtist = (artist || '').split(',')[0].split('&')[0].trim();

  const parseSyncedLyrics = (lrcString) => {
    if (!lrcString) return [];
    return lrcString
      .split('\n')
      .map((line) => {
        const match = line.match(/\[(\d+):(\d+\.?\d*)\](.*)/);
        if (!match) return null;
        return {
          time: parseInt(match[1], 10) * 60 + parseFloat(match[2]),
          text: toEnglishText(match[3].trim())
        };
      })
      .filter(Boolean);
  };

  try {
    // 1. Try LRCLIB exact get
    try {
      let lrcUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
      if (duration) lrcUrl += `&duration=${parseInt(duration, 10)}`;

      const lrcRes = await axios.get(lrcUrl, {
        headers: { 'User-Agent': 'SyncStream/1.0 (https://github.com/abhiAbhayj/SyncStream)' },
        timeout: 4500
      });

      if (lrcRes.data && (lrcRes.data.syncedLyrics || lrcRes.data.plainLyrics)) {
        const parsedLines = parseSyncedLyrics(lrcRes.data.syncedLyrics);
        return res.json({
          has_lyrics: true,
          synced: parsedLines.length > 0,
          syncedLyrics: parsedLines,
          plainLyrics: toEnglishText(lrcRes.data.plainLyrics || ''),
          source: 'LRCLIB'
        });
      }
    } catch (e) {}

    // 2. Try LRCLIB search endpoint with cleanTitle + cleanArtist
    try {
      const searchLrcUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}`;
      const sRes = await axios.get(searchLrcUrl, {
        headers: { 'User-Agent': 'SyncStream/1.0' },
        timeout: 4500
      });

      const firstMatch = sRes.data?.[0];
      if (firstMatch && (firstMatch.syncedLyrics || firstMatch.plainLyrics)) {
        const parsedLines = parseSyncedLyrics(firstMatch.syncedLyrics);
        return res.json({
          has_lyrics: true,
          synced: parsedLines.length > 0,
          syncedLyrics: parsedLines,
          plainLyrics: toEnglishText(firstMatch.plainLyrics || ''),
          source: 'LRCLIB'
        });
      }
    } catch (e) {}

    // 3. Try LRCLIB search endpoint with cleanTitle only
    try {
      const searchLrcUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle)}`;
      const sRes = await axios.get(searchLrcUrl, {
        headers: { 'User-Agent': 'SyncStream/1.0' },
        timeout: 4500
      });

      const firstMatch = sRes.data?.[0];
      if (firstMatch && (firstMatch.syncedLyrics || firstMatch.plainLyrics)) {
        const parsedLines = parseSyncedLyrics(firstMatch.syncedLyrics);
        return res.json({
          has_lyrics: true,
          synced: parsedLines.length > 0,
          syncedLyrics: parsedLines,
          plainLyrics: toEnglishText(firstMatch.plainLyrics || ''),
          source: 'LRCLIB'
        });
      }
    } catch (e) {}

    // 4. Fallback to JioSaavn native lyrics if songId provided
    if (songId) {
      try {
        const jioLyrUrl = `${JIOSAAVN_BASE}?__call=lyrics.getLyrics&_format=json&_marker=0&api_version=4&ctx=web6dot0&lyrics_id=${songId}`;
        const jioRes = await axios.get(jioLyrUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 4500
        });

        if (jioRes.data?.lyrics) {
          const rawPlain = jioRes.data.lyrics.replace(/<br\s*[\/]?>/gi, '\n');
          return res.json({
            has_lyrics: true,
            synced: false,
            syncedLyrics: [],
            plainLyrics: toEnglishText(rawPlain),
            source: 'JioSaavn'
          });
        }
      } catch (e) {}
    }

    res.json({
      has_lyrics: false,
      synced: false,
      syncedLyrics: [],
      plainLyrics: 'No synchronized or plain lyrics were found for this track. Enjoy the music!',
      source: null
    });
  } catch (err) {
    console.error('[Music Controller Lyrics Error]:', err.message);
    res.status(500).json({ error: 'Failed to retrieve lyrics' });
  }
};
