import React, { useState, useRef, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import axios from 'axios';
import ALL_WHATSAPP_EMOJIS from '../data/whatsapp_emojis.json';
import { searchClientLiveAnimeCharacters, fetchClientLiveIconicAnimeCharacters } from '../utils/liveAnime';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Settings,
  Check,
  Sparkles,
  LogOut,
  Loader2,
  Upload,
  RefreshCw,
  X,
  Palette,
  Smile,
  Wand2,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Zap,
  Snowflake,
  Flame,
  Activity,
  Atom,
  Crown,
  Moon,
  Layers,
  Compass,
  Search,
  Film
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ALL_THEME_CLASSES = [
  'theme-cinema-slate',
  'theme-midnight-velvet',
  'theme-nordic-monolith',
  'theme-emerald-noir',
  'theme-royal-amethyst',
  'theme-cryo-glacial',
  'theme-magma-thermal',
  'theme-emerald-biogrid',
  'theme-cobalt-quantum',
  'theme-golden-sunfire',
  'theme-obsidian-void',
  'theme-cyberpunk-synthwave',
  'theme-mystic-amethyst',
  'theme-storm-thunder',
  'theme-synthwave',
  'theme-cryo-vault',
  'theme-solar-flare',
  'theme-cosmic-singularity',
  'theme-plasma-web',
  'theme-cyber-foundry',
  'theme-bioluminescent-trench',
  'theme-windy-sakura',
  'theme-yokohama-night'
];

const THEME_OPTIONS = [
  {
    id: 'cinema-slate',
    name: 'Cinema Slate',
    vibe: 'Apple TV+ Minimalist',
    icon: Film,
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/10 border-sky-400/30',
    desc: 'Deep slate studio dark theme with sky blue accents. Crisp typography and maximum movie poster focus.',
    swatch: ['#0b0f17', '#151b26', '#38bdf8', '#f8fafc', '#f59e0b']
  },
  {
    id: 'midnight-velvet',
    name: 'Midnight Velvet',
    vibe: 'Netflix Luxe',
    icon: Flame,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10 border-red-500/30',
    desc: 'Pitch matte black background with cinema red accents. Bold, authoritative, and theatrical.',
    swatch: ['#09090b', '#18181b', '#ef4444', '#fafafa', '#fbbf24']
  },
  {
    id: 'nordic-monolith',
    name: 'Nordic Monolith',
    vibe: 'Linear / Vercel Clean',
    icon: Compass,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-400/30',
    desc: 'True void black with electric frost cyan. High-contrast monochromatic precision with zero visual noise.',
    swatch: ['#000000', '#111111', '#06b6d4', '#ededed', '#10b981']
  },
  {
    id: 'emerald-noir',
    name: 'Emerald Noir',
    vibe: 'Spotify Premium',
    icon: Sparkles,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    desc: 'Deep dark night forest with fresh mint emerald accents. Relaxing, organic, and ultra-smooth on the eyes.',
    swatch: ['#080e0d', '#121c1a', '#10b981', '#f1f5f9', '#facc15']
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    vibe: 'Disney+ / Twitch Studio',
    icon: Crown,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10 border-purple-500/30',
    desc: 'Deep cosmic abyss navy with royal violet and ice white accents. Rich, modern, and cinematic.',
    swatch: ['#0a0a16', '#131428', '#8b5cf6', '#ffffff', '#f43f5e']
  }
];

const EMOJI_CDN = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64';
const DEFAULT_EMOJI_AVATAR = `${EMOJI_CDN}/1f60e.png`;

const isEmojiAvatarUrl = (url) =>
  typeof url === 'string' && url.includes('emoji-datasource-apple');

const EMOJI_CATEGORIES = [
  { id: 'All', label: 'All', icon: '✨' },
  { id: 'Smileys & Emotion', label: 'Smileys', icon: '😀' },
  { id: 'People & Body', label: 'People', icon: '🥷' },
  { id: 'Animals & Nature', label: 'Animals', icon: '🦊' },
  { id: 'Food & Drink', label: 'Food', icon: '🍕' },
  { id: 'Activities', label: 'Activities', icon: '🎮' },
  { id: 'Travel & Places', label: 'Travel', icon: '🚀' },
  { id: 'Objects', label: 'Objects', icon: '💎' },
  { id: 'Symbols', label: 'Symbols', icon: '⚡' }
];

const DEFAULT_AVATAR_COLLECTIONS = {
  emojis: {
    label: 'WhatsApp Emojis',
    icon: Smile,
    iconColor: 'text-amber-400 fill-amber-400/40',
    items: [
      { id: 'wa-cool', name: 'Cool 😎', prompt: '3D glossy sunglasses emoji smiling cool vibe', url: `${EMOJI_CDN}/1f60e.png` },
      { id: 'wa-fireheart', name: 'Fire ❤️‍🔥', prompt: '3D glossy glowing heart on fire emoji', url: `${EMOJI_CDN}/2764-fe0f-200d-1f525.png` },
      { id: 'wa-starstruck', name: 'Star-Struck 🤩', prompt: '3D star-struck excited smiley emoji', url: `${EMOJI_CDN}/1f929.png` },
      { id: 'wa-laugh', name: 'LOL 😂', prompt: '3D laughing with tears of joy emoji', url: `${EMOJI_CDN}/1f602.png` },
      { id: 'wa-ghost', name: 'Ghost 👻', prompt: '3D playful glowing ghost emoji', url: `${EMOJI_CDN}/1f47b.png` },
      { id: 'wa-devil', name: 'Devil 😈', prompt: '3D cheeky purple devil grin emoji', url: `${EMOJI_CDN}/1f608.png` },
      { id: 'wa-headphones', name: 'Music 🎧', prompt: '3D studio headphones neon music vibe emoji', url: `${EMOJI_CDN}/1f3a7.png` },
      { id: 'wa-alien', name: 'Arcade 👾', prompt: '3D cosmic purple alien gamer emoji', url: `${EMOJI_CDN}/1f47e.png` },
      { id: 'wa-cat', name: 'Kitty 🐱', prompt: '3D cute cat face emoji sticker', url: `${EMOJI_CDN}/1f431.png` },
      { id: 'wa-party', name: 'Party 🥳', prompt: '3D party popper celebration face emoji', url: `${EMOJI_CDN}/1f973.png` },
      { id: 'wa-crown', name: 'King 👑', prompt: '3D golden royal crown emoji', url: `${EMOJI_CDN}/1f451.png` },
      { id: 'wa-flame', name: 'Lit 🔥', prompt: '3D vibrant orange neon flame emoji', url: `${EMOJI_CDN}/1f525.png` }
    ]
  },
  anime: {
    label: 'Anime & Manga',
    icon: Wand2,
    iconColor: 'text-pink-400 fill-pink-400/30',
    items: [
      { id: 'ani-seed-gojo', name: 'Satoru Gojo', series: 'Jujutsu Kaisen', prompt: 'Anime character Satoru Gojo Jujutsu Kaisen portrait', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Gojo' },
      { id: 'ani-seed-luffy', name: 'Monkey D. Luffy', series: 'One Piece', prompt: 'Anime character Luffy One Piece portrait', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Luffy' },
      { id: 'ani-seed-naruto', name: 'Naruto Uzumaki', series: 'Naruto', prompt: 'Anime character Naruto Uzumaki portrait', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Naruto' },
      { id: 'ani-seed-levi', name: 'Levi Ackerman', series: 'Attack on Titan', prompt: 'Anime character Levi Ackerman portrait', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Levi' },
      { id: 'ani-seed-tanjiro', name: 'Tanjiro', series: 'Demon Slayer', prompt: 'Anime character Tanjiro Kamado portrait', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Tanjiro' },
      { id: 'ani-seed-nezuko', name: 'Nezuko', series: 'Demon Slayer', prompt: 'Anime character Nezuko Kamado portrait', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Nezuko' },
      { id: 'ani-seed-zoro', name: 'Roronoa Zoro', series: 'One Piece', prompt: 'Anime character Roronoa Zoro portrait', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Zoro' },
      { id: 'ani-seed-anya', name: 'Anya Forger', series: 'Spy x Family', prompt: 'Anime character Anya Forger portrait', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Anya' }
    ]
  }
};

const MAX_AVATARS_PER_CATEGORY = 24;
const MIN_AVATARS_PER_CATEGORY = 1;

const AI_STYLE_PRESETS = [
  { id: 'emojis', label: '3D Emoji', icon: Smile, iconColor: 'text-amber-400 fill-amber-400/40', suffix: 'high resolution glossy 3D WhatsApp Apple-style emoji reaction sticker, 3D smooth plastic render, vibrant colors, studio rim lighting, dark neon background' },
  { id: 'anime', label: 'Anime & Manga', icon: Sparkles, iconColor: 'text-pink-400 fill-pink-400', suffix: 'masterpiece anime and manga character portrait avatar, vibrant colors, detailed anime face and expressive eyes, studio anime aesthetic, sharp focus' }
];

const PROMPT_SUGGESTIONS = [
  'Gojo Satoru anime portrait',
  'Koharu Sato anime portrait',
  '3D Cool Sunglasses Emoji with neon cyan glow',
  'Sung Jin-Woo shadow monarch purple aura',
  'Levi Ackerman anime portrait',
  '3D Fire Heart Emoji glossy sticker'
];

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState(user?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    const current = user?.avatar_url;
    if (!current || current.includes('dicebear.com/7.x/bottts') || current.includes('dicebear.com/7.x/pixel-art')) {
      return DEFAULT_EMOJI_AVATAR;
    }
    return current;
  });
  const [activeAvatarTab, setActiveAvatarTab] = useState('emojis');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatarBurstKey, setAvatarBurstKey] = useState(0);
  const [isCustomUploaded, setIsCustomUploaded] = useState(() => {
    return Boolean(user?.avatar_url && user.avatar_url.startsWith('data:image/'));
  });

  const [theme, setTheme] = useState(() => {
    let saved = localStorage.getItem('syncstream_theme');
    const legacy = {
      'cryo-glacial': 'cinema-slate',
      'cryo-vault': 'cinema-slate',
      'obsidian-void': 'nordic-monolith',
      'magma-thermal': 'midnight-velvet',
      'solar-flare': 'midnight-velvet',
      'emerald-biogrid': 'emerald-noir',
      'plasma-web': 'emerald-noir',
      'cobalt-quantum': 'royal-amethyst',
      'storm-thunder': 'royal-amethyst',
      'mystic-amethyst': 'royal-amethyst',
      'golden-sunfire': 'cinema-slate',
      'cyberpunk-synthwave': 'royal-amethyst',
      synthwave: 'royal-amethyst'
    };
    if (legacy[saved]) saved = legacy[saved];
    if (saved && THEME_OPTIONS.some(t => t.id === saved)) return saved;
    return 'cinema-slate';
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // ── Universal Avatar Collections State (Supports Add / Edit / Delete in all categories) ──
  const [avatarCollections, setAvatarCollections] = useState(() => {
    try {
      const saved = localStorage.getItem(`syncstream_avatar_collections_v3_${user?.id || 'guest'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure icon components are re-attached and only currently supported categories are loaded
        const merged = { ...DEFAULT_AVATAR_COLLECTIONS };
        Object.keys(merged).forEach((cat) => {
          if (parsed[cat] && Array.isArray(parsed[cat].items) && parsed[cat].items.length > 0) {
            merged[cat] = { ...merged[cat], items: parsed[cat].items };
          }
        });
        return merged;
      }
      return DEFAULT_AVATAR_COLLECTIONS;
    } catch {
      return DEFAULT_AVATAR_COLLECTIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`syncstream_avatar_collections_v3_${user?.id || 'guest'}`, JSON.stringify(avatarCollections));
    } catch (e) {}
  }, [avatarCollections, user?.id]);

  // ── Live WhatsApp / Apple 3D Emoji Search State ──
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');
  const [emojiSelectedCategory, setEmojiSelectedCategory] = useState('All');
  const [emojiVisibleCount, setEmojiVisibleCount] = useState(60);

  // ── Live AniList Anime & Manga Character Search & Iconic Preload ──
  const [animeSearchQuery, setAnimeSearchQuery] = useState('');
  const [animeSearchResults, setAnimeSearchResults] = useState([]);
  const [animeSearchLoading, setAnimeSearchLoading] = useState(false);
  const [animeSearchTouched, setAnimeSearchTouched] = useState(false);
  const [animeIconicLoading, setAnimeIconicLoading] = useState(false);
  const [animeFilterType, setAnimeFilterType] = useState('All');
  const [animeVisibleCount, setAnimeVisibleCount] = useState(25);
  const animePreloadedRef = useRef(false);

  const isMangaItem = (c) => {
    const t = String(c?.type || '').toLowerCase();
    const f = String(c?.format || '').toLowerCase();
    return t === 'manga' || f === 'manga' || f === 'novel' || f === 'one_shot' || f === 'manhwa' || f === 'manhua';
  };

  const filteredAnimeSearchResults = useMemo(() => {
    if (animeFilterType === 'All') return animeSearchResults;
    if (animeFilterType === 'Manga') {
      return animeSearchResults.filter(isMangaItem);
    }
    return animeSearchResults.filter((c) => !isMangaItem(c));
  }, [animeSearchResults, animeFilterType]);

  useEffect(() => {
    if (animePreloadedRef.current) return;
    animePreloadedRef.current = true;

    let cancelled = false;
    const loadIconicAnimeCharacters = async () => {
      try {
        setAnimeIconicLoading(true);
        let iconicPicks = [];

        // 1. Primary: Direct browser AniList engine (0% Render 429 throttling)
        try {
          iconicPicks = await fetchClientLiveIconicAnimeCharacters();
        } catch {}

        // 2. Fallback: Backend endpoint
        if (!Array.isArray(iconicPicks) || iconicPicks.length === 0) {
          try {
            const res = await axios.get('/api/media/anime/characters');
            if (Array.isArray(res.data) && res.data.length > 0) {
              iconicPicks = res.data;
            }
          } catch {}
        }

        if (cancelled || !Array.isArray(iconicPicks) || iconicPicks.length === 0) return;

        const picks = iconicPicks.slice(0, 12);
        setAvatarCollections((prev) => {
          const currentItems = prev.anime?.items || [];
          const hasOnlySeedsOrFewReal =
            currentItems.every((it) => String(it.id).startsWith('ani-seed-')) ||
            currentItems.filter((it) => String(it.id).startsWith('al-char-')).length < 4;

          if (!hasOnlySeedsOrFewReal) return prev;

          const customOrPinned = currentItems.filter(
            (it) => !String(it.id).startsWith('ani-seed-') && !picks.some((p) => p.id === it.id)
          );
          const mergedItems = [...customOrPinned, ...picks].slice(0, MAX_AVATARS_PER_CATEGORY);

          return {
            ...prev,
            anime: {
              ...prev.anime,
              items: mergedItems
            }
          };
        });
      } catch (err) {
        // Silently keep offline seed fallback items if AniList is unavailable
      } finally {
        if (!cancelled) setAnimeIconicLoading(false);
      }
    };

    loadIconicAnimeCharacters();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── AI Prompt Generation State ──
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('emojis');
  const [aiTargetCategory, setAiTargetCategory] = useState('emojis');
  const [aiEngineMode, setAiEngineMode] = useState('turbo'); // 'turbo' (2s) | 'instant' (0.1s)
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreviewUrl, setAiPreviewUrl] = useState(null);
  const [editingAvatarTarget, setEditingAvatarTarget] = useState(null); // { category, id, name }

  // Clean, instant theme selection (zero animations)
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('syncstream_theme', newTheme);
    ALL_THEME_CLASSES.forEach((cls) => document.body.classList.remove(cls));
    document.body.classList.add(`theme-${newTheme}`);
  };

  React.useEffect(() => {
    return () => {
      let currentPersisted = localStorage.getItem('syncstream_theme') || 'cinema-slate';
      if (!THEME_OPTIONS.some(t => t.id === currentPersisted)) {
        currentPersisted = 'cinema-slate';
      }
      ALL_THEME_CLASSES.forEach((cls) => document.body.classList.remove(cls));
      document.body.classList.add(`theme-${currentPersisted}`);
    };
  }, []);

  // Convert image URL to compact Base64 JPEG for robust database storage
  const convertToDataUrl = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 256;
        let width = img.width || 256;
        let height = img.height || 256;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Failed to convert image.'));
      img.src = url;
    });
  };

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large (max 10MB).');
      return;
    }

    setUploadingImage(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedAvatar(dataUrl);
        setAvatarBurstKey((k) => k + 1);
        setIsCustomUploaded(true);
        setUploadingImage(false);
      };
      img.onerror = () => {
        setError('Failed to process the uploaded image.');
        setUploadingImage(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setError('Could not read image file.');
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // Open AI Prompt Modal to generate or edit avatar in target category
  const openAiGeneratorForCategory = (categoryKey, existingAvatar = null) => {
    setAiTargetCategory(categoryKey || activeAvatarTab);
    setAiStyle(categoryKey || 'emojis');
    if (existingAvatar) {
      setEditingAvatarTarget({ category: categoryKey, id: existingAvatar.id });
      setAiPrompt(existingAvatar.prompt || existingAvatar.name);
      setAiPreviewUrl(existingAvatar.url);
    } else {
      setEditingAvatarTarget(null);
      setAiPrompt('');
      setAiPreviewUrl(null);
    }
    setShowAiModal(true);
  };

  // Live AniList Anime & Manga Character Search (Runs directly in browser with backend fallback)
  const runAnimeCharacterSearch = async (queryText) => {
    const trimmed = (queryText || '').trim();
    if (!trimmed) {
      setAnimeSearchResults([]);
      setAnimeSearchTouched(false);
      return;
    }

    setAnimeSearchLoading(true);
    setAnimeSearchTouched(true);
    setAnimeVisibleCount(25);
    // Auto-reset to 'All' so results aren't hidden if user previously clicked Anime/Manga filter
    setAnimeFilterType('All');

    try {
      // 1. Direct Browser Client-Side AniList Character Search (100% case-insensitive, zero Render 429 rate-limiting)
      let results = await searchClientLiveAnimeCharacters(trimmed);

      // 2. Fallback to server endpoint if direct client search returns empty or fails
      if (!Array.isArray(results) || results.length === 0) {
        try {
          const res = await axios.get(`/api/media/anime/characters?q=${encodeURIComponent(trimmed)}`);
          if (Array.isArray(res.data) && res.data.length > 0) {
            results = res.data;
          }
        } catch {}
      }

      setAnimeSearchResults(Array.isArray(results) ? results : []);
    } catch (err) {
      setAnimeSearchResults([]);
    } finally {
      setAnimeSearchLoading(false);
    }
  };

  useEffect(() => {
    if (activeAvatarTab !== 'anime') return;
    const trimmed = animeSearchQuery.trim();
    if (!trimmed) {
      setAnimeSearchResults([]);
      setAnimeSearchTouched(false);
      return;
    }
    if (trimmed.length < 2) return;

    const timer = setTimeout(() => {
      runAnimeCharacterSearch(trimmed);
    }, 380);
    return () => clearTimeout(timer);
  }, [animeSearchQuery, activeAvatarTab]);

  // Select and/or Pin a live-searched anime character to the Anime Characters collection
  const handlePinAnimeCharacter = (charItem, e) => {
    e?.stopPropagation?.();
    if (!charItem?.url) return;

    const existing = avatarCollections.anime?.items || [];
    const alreadyPinned = existing.some((it) => it.id === charItem.id || it.url === charItem.url);
    if (alreadyPinned) {
      handleSelectAvatar(charItem.url);
      return;
    }

    if (existing.length >= MAX_AVATARS_PER_CATEGORY) {
      setError(`Anime Characters limit reached (${MAX_AVATARS_PER_CATEGORY} max). Delete an avatar slot first or click the card to use directly.`);
      return;
    }

    setAvatarCollections((prev) => ({
      ...prev,
      anime: {
        ...prev.anime,
        items: [charItem, ...(prev.anime?.items || [])]
      }
    }));
    handleSelectAvatar(charItem.url);
  };

  // Compute matched WhatsApp emojis with instant zero-latency client-side search & filtering
  const filteredEmojis = useMemo(() => {
    const q = emojiSearchQuery.trim().toLowerCase();
    const cat = emojiSelectedCategory;

    let pool = ALL_WHATSAPP_EMOJIS;
    if (cat && cat !== 'All') {
      pool = pool.filter(
        (e) => e.category && e.category.toLowerCase() === cat.toLowerCase()
      );
    }

    if (!q) {
      return pool;
    }

    const scored = [];
    for (const item of pool) {
      let score = 0;
      const lowerName = item.name.toLowerCase();
      const lowerShort = item.short_name.toLowerCase();

      if (lowerShort === q || lowerName === q) {
        score += 100;
      } else if (item.keywords && item.keywords.includes(q)) {
        score += 90;
      } else if (lowerShort.startsWith(q)) {
        score += 70;
      } else if (lowerName.startsWith(q)) {
        score += 55;
      } else if (item.keywords && item.keywords.some((k) => k.startsWith(q))) {
        score += 45;
      } else if (lowerShort.includes(q) || lowerName.includes(q)) {
        score += 25;
      } else if (item.keywords && item.keywords.some((k) => k.includes(q))) {
        score += 15;
      }

      if (score > 0) {
        if (item.category === 'Smileys & Emotion' || item.category === 'People & Body') {
          score += 12;
        }
        scored.push({ item, score });
      }
    }

    scored.sort((a, b) => b.score - a.score || ((a.item.sort_order || 9999) - (b.item.sort_order || 9999)));
    return scored.map((s) => s.item);
  }, [emojiSearchQuery, emojiSelectedCategory]);

  useEffect(() => {
    setEmojiVisibleCount(60);
  }, [emojiSearchQuery, emojiSelectedCategory]);

  // Select and/or Pin a searched WhatsApp emoji to the WhatsApp Emojis collection
  const handlePinEmoji = (emojiItem, e) => {
    e?.stopPropagation?.();
    if (!emojiItem) return;

    const emojiUrl = emojiItem.url || `${EMOJI_CDN}/${emojiItem.image}`;
    const existing = avatarCollections.emojis?.items || [];
    const alreadyPinned = existing.some((it) => it.id === emojiItem.id || it.url === emojiUrl);
    if (alreadyPinned) {
      handleSelectAvatar(emojiUrl);
      return;
    }

    if (existing.length >= MAX_AVATARS_PER_CATEGORY) {
      setError(`WhatsApp Emojis limit reached (${MAX_AVATARS_PER_CATEGORY} max). Delete an avatar slot first or click the card to use directly.`);
      return;
    }

    const newItem = {
      id: emojiItem.id,
      name: emojiItem.name,
      prompt: emojiItem.prompt || `3D glossy WhatsApp ${emojiItem.name} emoji reaction`,
      url: emojiUrl
    };

    setAvatarCollections((prev) => ({
      ...prev,
      emojis: {
        ...prev.emojis,
        items: [newItem, ...(prev.emojis?.items || [])]
      }
    }));
    handleSelectAvatar(emojiUrl);
  };

  // Generate avatar through AI Prompt (Intelligent Multi-Tier AI Synthesis)
  const handleGenerateAiAvatar = async (e) => {
    e?.preventDefault?.();
    const cleanPrompt = aiPrompt.trim();
    if (!cleanPrompt) {
      setError('Please enter a prompt to generate your AI avatar.');
      return;
    }

    setAiGenerating(true);
    setError(null);

    const fallbackSeed = encodeURIComponent(cleanPrompt);
    // Authentic style-appropriate fallback (Lorelei manga/anime or 3D Apple emoji, NOT medieval adventurer!)
    const authenticFallback = aiStyle === 'anime'
      ? `https://api.dicebear.com/7.x/lorelei/svg?seed=${fallbackSeed}`
      : `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f60e.png`;

    // Instant Vector Mode
    if (aiEngineMode === 'instant') {
      setAiPreviewUrl(authenticFallback);
      setAiGenerating(false);
      return;
    }

    // Step 1: Call our intelligent backend AI avatar endpoint
    try {
      const res = await axios.post('/api/media/ai/avatar', {
        prompt: cleanPrompt,
        style: aiStyle || aiTargetCategory || 'anime'
      }, { timeout: 13000 });

      if (res.data?.url) {
        setAiPreviewUrl(res.data.url);
        setAiGenerating(false);
        return;
      }
    } catch (backendErr) {
      console.warn('[AI Avatar Studio] Backend route fallback:', backendErr.message);
    }

    // Step 2: Client-side AI Diffusion (with safe 12s timeout and authentic fallbacks)
    try {
      const styleConfig = AI_STYLE_PRESETS.find((s) => s.id === aiStyle) || AI_STYLE_PRESETS[0];
      const fullPrompt = `${cleanPrompt}, ${styleConfig.suffix}`;
      const seed = Math.floor(Math.random() * 1000000);
      // NOTE: Free tier does not use &model=turbo to avoid 402 payment limit
      const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=384&height=384&nologo=true&seed=${seed}`;

      let hasFinished = false;
      const finishWith = (url) => {
        if (hasFinished) return;
        hasFinished = true;
        setAiPreviewUrl(url);
        setAiGenerating(false);
      };

      const timeoutId = setTimeout(() => {
        finishWith(authenticFallback);
      }, 12000);

      const testImg = new Image();
      testImg.onload = () => {
        clearTimeout(timeoutId);
        finishWith(generatedUrl);
      };
      testImg.onerror = () => {
        clearTimeout(timeoutId);
        finishWith(authenticFallback);
      };
      testImg.src = generatedUrl;
    } catch (err) {
      setAiPreviewUrl(authenticFallback);
      setAiGenerating(false);
    }
  };

  // Save generated/edited AI avatar into target category collection
  const handleSaveAiAvatar = async () => {
    if (!aiPreviewUrl) return;

    const targetCat = aiTargetCategory || activeAvatarTab;
    const catItems = avatarCollections[targetCat]?.items || [];

    // Limit check on create
    if (!editingAvatarTarget && catItems.length >= MAX_AVATARS_PER_CATEGORY) {
      setError(`Category limit reached (${MAX_AVATARS_PER_CATEGORY} max per category). Delete an unwanted avatar first.`);
      return;
    }

    try {
      setLoading(true);
      let finalDataUrl = aiPreviewUrl;
      try {
        finalDataUrl = await convertToDataUrl(aiPreviewUrl);
      } catch (e) {
        // use url directly as fallback
      }

      setAvatarCollections((prev) => {
        const updatedCat = { ...prev[targetCat] };
        if (editingAvatarTarget) {
          // Edit existing item
          updatedCat.items = updatedCat.items.map((it) =>
            it.id === editingAvatarTarget.id
              ? { ...it, url: finalDataUrl, prompt: aiPrompt.trim(), name: aiPrompt.trim().slice(0, 16) }
              : it
          );
        } else {
          // Create new item
          const newEntry = {
            id: `gen-${Date.now()}`,
            name: aiPrompt.trim().slice(0, 16) || 'AI Avatar',
            prompt: aiPrompt.trim(),
            url: finalDataUrl
          };
          updatedCat.items = [newEntry, ...updatedCat.items];
        }
        return { ...prev, [targetCat]: updatedCat };
      });

      setSelectedAvatar(finalDataUrl);
      setAvatarBurstKey((k) => k + 1);
      setIsCustomUploaded(true);
      setShowAiModal(false);
      setEditingAvatarTarget(null);
      setAiPrompt('');
      setAiPreviewUrl(null);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save AI avatar.');
      setLoading(false);
    }
  };

  // Delete an avatar from any category (with limit check)
  const handleDeleteAvatar = (categoryKey, avatarId, e) => {
    e?.stopPropagation?.();
    const catItems = avatarCollections[categoryKey]?.items || [];
    if (catItems.length <= MIN_AVATARS_PER_CATEGORY) {
      setError(`Cannot delete the last remaining avatar in this category (${MIN_AVATARS_PER_CATEGORY} min).`);
      return;
    }

    if (window.confirm('Delete this avatar from your collection?')) {
      const remaining = catItems.filter((it) => it.id !== avatarId);
      setAvatarCollections((prev) => {
        const updatedCat = { ...prev[categoryKey] };
        updatedCat.items = remaining;
        return { ...prev, [categoryKey]: updatedCat };
      });

      const deletedItem = catItems.find((it) => it.id === avatarId);
      if (selectedAvatar.includes(avatarId) || (deletedItem && selectedAvatar === deletedItem.url)) {
        const fallback = remaining[0]?.url || DEFAULT_EMOJI_AVATAR;
        setSelectedAvatar(fallback);
      }
    }
  };

  // Restore Default Avatars for current category
  const handleRestoreDefaults = async (categoryKey) => {
    if (!window.confirm(`Reset "${avatarCollections[categoryKey]?.label}" back to original defaults?`)) {
      return;
    }

    if (categoryKey === 'anime') {
      try {
        setAnimeIconicLoading(true);
        const res = await axios.get('/api/media/anime/characters');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setAvatarCollections((prev) => ({
            ...prev,
            anime: { ...prev.anime, items: res.data.slice(0, 12) }
          }));
          setSuccess(true);
          setTimeout(() => setSuccess(false), 2500);
          return;
        }
      } catch (err) {
        // Fallback below
      } finally {
        setAnimeIconicLoading(false);
      }
    }

    setAvatarCollections((prev) => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], items: DEFAULT_AVATAR_COLLECTIONS[categoryKey].items }
    }));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  const handleSelectAvatar = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
    setAvatarBurstKey((k) => k + 1);
    setIsCustomUploaded(Boolean(avatarUrl.startsWith('data:image/')));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      setLoading(false);
      return;
    }

    localStorage.setItem('syncstream_theme', theme);
    ALL_THEME_CLASSES.forEach((cls) => document.body.classList.remove(cls));
    document.body.classList.add(`theme-${theme}`);

    const res = await updateProfile(username, selectedAvatar);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } else {
      setError(res.error || 'Failed to update profile settings.');
    }
  };

  const handleSignOut = () => {
    window.dispatchEvent(new CustomEvent('open-logout-confirm'));

  };

  const currentCategory = avatarCollections[activeAvatarTab] || avatarCollections.emojis;

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6 px-3 sm:px-5 md:px-6 lg:px-8 space-y-4 sm:space-y-6 min-h-[75vh] pb-8 sm:pb-12">
      {/* Title */}
      <div className="space-y-0.5">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-outfit flex items-center gap-2">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-accentPurple shrink-0" />
          <span>Profile &amp; Avatar Studio</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Customize your identity, manage avatars with AI prompts, and switch animated themes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Side: Active Avatar & Studio Controls (Horizontal Banner on Tablet, Sidebar on Desktop) */}
        <div className="lg:col-span-4 glass-panel border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row lg:flex-col items-center sm:justify-between lg:justify-center gap-4 text-center sm:text-left lg:text-center">
          <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 sm:gap-4">
            {/* Orbit Aura Studio Preview */}
            <div className="relative inline-flex items-center justify-center p-2 shrink-0">
              {/* Ambient radial glow */}
              <div
                aria-hidden="true"
                className="absolute inset-1 rounded-full bg-gradient-to-tr from-accentCyan/25 via-accentPurple/20 to-accentPink/25 blur-xl animate-pulse pointer-events-none"
              />
              {/* Outer Orbit Ring (CW) */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-dashed border-accentCyan/55 animate-orbit-cw pointer-events-none"
              >
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accentCyan shadow-[0_0_10px_rgba(var(--accent-cyan),0.95)]" />
              </div>
              {/* Inner Orbit Ring (CCW) */}
              <div
                aria-hidden="true"
                className="absolute inset-1.5 rounded-full border border-accentPurple/45 border-t-accentPink/85 animate-orbit-ccw pointer-events-none"
              >
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accentPink shadow-[0_0_8px_rgba(var(--accent-pink),0.9)]" />
              </div>
              {/* Selection Shockwave Burst */}
              {avatarBurstKey > 0 && (
                <span
                  key={avatarBurstKey}
                  aria-hidden="true"
                  className="absolute inset-2 rounded-full border-2 border-accentCyan/80 animate-shockwave pointer-events-none"
                />
              )}

              <img
                src={selectedAvatar}
                alt="Profile avatar preview"
                referrerPolicy="no-referrer"
                className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-2 border-accentCyan mx-auto shadow-2xl transition-transform duration-300 ${
                  isEmojiAvatarUrl(selectedAvatar)
                    ? 'bg-gradient-to-br from-accentCyan/20 via-[#0d142c] to-accentPurple/25 object-contain p-2.5 sm:p-3 shadow-[inset_0_0_24px_rgba(var(--accent-cyan),0.22),0_0_28px_rgba(var(--accent-purple),0.28)]'
                    : 'bg-darkBg object-cover p-1'
                }`}
              />
              <div className="z-20 absolute bottom-1.5 right-1.5 bg-accentPurple text-white p-1.5 rounded-full shadow-lg border border-white/20">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
              </div>
            </div>

            <div className="space-y-0.5 min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-white truncate">{user?.username}</h3>
              <p className="text-[11px] sm:text-xs text-gray-300 font-medium flex items-center justify-center sm:justify-start lg:justify-center gap-1.5">
                {isCustomUploaded ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-accentGold shrink-0" />
                    <span>Custom / AI Avatar</span>
                  </>
                ) : (
                  <>
                    <Palette className="w-3.5 h-3.5 text-accentCyan shrink-0" />
                    <span>Preset Identity</span>
                  </>
                )}
              </p>
              {user?.created_at && (
                <p className="text-[10px] text-gray-400">Joined {new Date(user.created_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {/* Quick Studio Actions */}
          <div className="w-full sm:w-52 lg:w-full space-y-2 pt-3 sm:pt-0 lg:pt-3 border-t sm:border-t-0 lg:border-t border-white/10 shrink-0">
            {/* AI Generator Trigger */}
            <button
              type="button"
              onClick={() => openAiGeneratorForCategory(activeAvatarTab)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-accentPurple to-accentCyan text-black font-extrabold text-xs transition flex items-center justify-center gap-1.5 active:scale-95 shadow-md hover:opacity-90 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-black" />
              <span>Generate AI Avatar</span>
            </button>

            {/* Custom Photo Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>Upload Photo File</span>
            </button>

            <button
              onClick={handleSignOut}
              className="w-full py-2 px-3 rounded-xl border border-red-500/25 text-red-400 hover:text-red-200 hover:bg-red-500/15 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Side: Form, Avatar Studio & Animated Themes */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-8 glass-panel border border-white/10 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl"
        >
          {/* Notifications */}
          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold p-3 sm:p-4 rounded-xl text-center shadow-lg animate-fade-in flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Profile settings &amp; custom avatars saved successfully!</span>
            </div>
          )}
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold p-3 sm:p-4 rounded-xl text-center shadow-lg animate-fade-in">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
              Display Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-darkBg/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition shadow-inner font-medium"
              />
            </div>
          </div>

          {/* Avatar Studio: Categories + Manageable Grid */}
          <div className="space-y-3">
            {/* Category header & tools */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                  Avatar Studio
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accentCyan/15 text-accentCyan font-mono font-bold border border-accentCyan/30">
                  {currentCategory.items.length} / {MAX_AVATARS_PER_CATEGORY} Slots
                </span>
              </div>

              {/* Restore Defaults button */}
              <button
                type="button"
                onClick={() => handleRestoreDefaults(activeAvatarTab)}
                className="self-end sm:self-auto text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-white/5 active:scale-95"
              >
                <RotateCcw className="w-3 h-3 text-accentPurple" />
                <span>Reset {currentCategory.label}</span>
              </button>
            </div>

            {/* Category selector chips (Swipeable on mobile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {Object.entries(avatarCollections).map(([key, col]) => {
                const Icon = col.icon;
                const isActive = activeAvatarTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveAvatarTab(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 border shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-accentPurple/30 to-accentCyan/30 border-accentCyan text-white shadow-sm'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${col.iconColor || 'text-accentCyan'}`} />
                    <span>{col.label} ({col.items.length})</span>
                  </button>
                );
              })}
            </div>

            {/* Live WhatsApp / Apple 3D Emoji Search Bar (Emojis Tab Only) */}
            {activeAvatarTab === 'emojis' && (
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-black/40 to-accentCyan/[0.08] border border-amber-500/25 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                    <Smile className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Live WhatsApp &amp; 3D Emoji Search (1,900+ Emojis)</span>
                  </span>
                  <span className="text-[10px] text-accentCyan font-mono">
                    All Categories • Instant 0ms
                  </span>
                </div>

                {/* Search Input Row */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={emojiSearchQuery}
                      onChange={(e) => setEmojiSearchQuery(e.target.value)}
                      placeholder="Search all 1,900+ WhatsApp emojis (skull, cat, party, laugh, ghost, fire)..."
                      className="w-full bg-darkBg/90 border border-white/15 rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition"
                    />
                    {emojiSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setEmojiSearchQuery('')}
                        title="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {emojiSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setEmojiSearchQuery('')}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs shrink-0 transition cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Category Filter Chips with live count badges */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {EMOJI_CATEGORIES.map((cat) => {
                    const isCatActive = emojiSelectedCategory === cat.id;
                    const catCount = cat.id === 'All'
                      ? ALL_WHATSAPP_EMOJIS.length
                      : ALL_WHATSAPP_EMOJIS.filter((e) => e.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setEmojiSelectedCategory(cat.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shrink-0 transition active:scale-95 border cursor-pointer flex items-center gap-1 ${
                          isCatActive
                            ? 'bg-amber-400/25 border-amber-400 text-amber-200 shadow-sm'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label} ({catCount})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Popular Emoji Query Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {[
                    { q: 'skull', label: 'Skull 💀' },
                    { q: 'cat', label: 'Cat 🐱' },
                    { q: 'party', label: 'Party 🥳' },
                    { q: 'laugh', label: 'Laugh 😂' },
                    { q: 'ghost', label: 'Ghost 👻' },
                    { q: 'fire', label: 'Fire 🔥' },
                    { q: 'cool', label: 'Cool 😎' },
                    { q: 'ninja', label: 'Ninja 🥷' },
                    { q: 'gaming', label: 'Gaming 🎮' },
                    { q: 'crown', label: 'Crown 👑' },
                    { q: 'dog', label: 'Dog 🐶' }
                  ].map((item) => (
                    <button
                      key={item.q}
                      type="button"
                      onClick={() => {
                        setEmojiSearchQuery(item.q);
                      }}
                      className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold whitespace-nowrap shrink-0 transition active:scale-95 cursor-pointer ${
                        emojiSearchQuery === item.q
                          ? 'bg-amber-400/30 border-amber-400 text-amber-100 shadow'
                          : 'bg-white/5 hover:bg-amber-400/20 border-white/10 hover:border-amber-400/40 text-gray-300 hover:text-amber-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Instant Emoji Results Grid */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>
                      {emojiSearchQuery
                        ? `Found ${filteredEmojis.length} emojis matching "${emojiSearchQuery}"`
                        : `Showing ${Math.min(filteredEmojis.length, emojiVisibleCount)} of ${filteredEmojis.length} emojis`}
                    </span>
                    {emojiSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setEmojiSearchQuery('')}
                        className="text-accentCyan hover:underline cursor-pointer"
                      >
                        Reset Search
                      </button>
                    )}
                  </div>

                  {filteredEmojis.length === 0 ? (
                    <div className="py-6 text-center space-y-2 bg-black/30 rounded-xl border border-white/5">
                      <p className="text-xs text-gray-400">
                        No WhatsApp emojis found for &quot;{emojiSearchQuery}&quot;.
                      </p>
                      <button
                        type="button"
                        onClick={() => setEmojiSearchQuery('')}
                        className="px-3 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-xs font-bold text-amber-200 border border-amber-400/40"
                      >
                        Show All WhatsApp Emojis
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-0.5 scrollbar-thin">
                        {filteredEmojis.slice(0, emojiVisibleCount).map((emoji) => {
                          const emojiUrl = `${EMOJI_CDN}/${emoji.image}`;
                          const isSelected = selectedAvatar === emojiUrl;
                          const isPinned = (avatarCollections.emojis?.items || []).some(
                            (it) => it.id === emoji.id || it.url === emojiUrl
                          );
                          return (
                            <div
                              key={emoji.id}
                              onClick={() => handleSelectAvatar(emojiUrl)}
                              className={`group relative rounded-xl overflow-hidden border p-1 bg-gradient-to-br from-accentCyan/15 via-[#0e1530] to-accentPurple/20 transition-all cursor-pointer active:scale-95 ${
                                isSelected
                                  ? 'border-accentCyan ring-2 ring-accentCyan/55 shadow-[0_0_14px_rgba(var(--accent-cyan),0.45)]'
                                  : 'border-white/10 hover:border-amber-400/50'
                              }`}
                            >
                              <div className="aspect-square w-full overflow-hidden rounded-lg bg-black/40 relative flex items-center justify-center p-2.5">
                                <img
                                  src={emojiUrl}
                                  alt={emoji.name}
                                  referrerPolicy="no-referrer"
                                  loading="lazy"
                                  className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                                />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 bg-accentCyan text-black p-0.5 rounded-full shadow">
                                    <Check className="w-2.5 h-2.5 stroke-[4]" />
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => handlePinEmoji(emoji, e)}
                                  title={isPinned ? 'Saved in WhatsApp Emojis' : 'Pin to WhatsApp Emojis'}
                                  className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold transition shadow ${
                                    isPinned
                                      ? 'bg-emerald-500/90 text-black'
                                      : 'bg-black/80 hover:bg-amber-400 text-amber-200 hover:text-black border border-amber-400/30'
                                  }`}
                                >
                                  {isPinned ? 'Pinned' : '+ Pin'}
                                </button>
                              </div>
                              <div className="pt-1 px-0.5">
                                <p className="text-[10px] font-bold text-white truncate">{emoji.name}</p>
                                <p className="text-[9px] text-gray-400 truncate">{emoji.category}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {filteredEmojis.length > emojiVisibleCount && (
                        <button
                          type="button"
                          onClick={() => setEmojiVisibleCount((c) => c + 60)}
                          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <span>+ Show More Emojis</span>
                          <span className="text-accentCyan font-mono text-[11px]">
                            ({filteredEmojis.length - emojiVisibleCount} remaining)
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Live AniList Character Search Bar (Anime Tab Only) */}
            {activeAvatarTab === 'anime' && (
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-gradient-to-br from-pink-500/[0.08] via-black/40 to-accentPurple/[0.08] border border-pink-500/25 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-[11px] font-bold text-pink-300 flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>Live AniList Anime & Manga Universal Search</span>
                  </span>
                  {animeIconicLoading && (
                    <span className="text-[10px] text-accentCyan flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Syncing iconic picks...
                    </span>
                  )}
                </div>

                {/* Search Input Row (using div + Enter key handler to avoid nested form) */}
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={animeSearchQuery}
                      onChange={(e) => setAnimeSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          runAnimeCharacterSearch(animeSearchQuery);
                        }
                      }}
                      placeholder="Search character or anime/manga (Miki, Koyun, Yota, Ramparts of Ice, Berserk, Sato)..."
                      className="w-full bg-darkBg/90 border border-white/15 rounded-xl pl-8 pr-7 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/50 transition"
                    />
                    {animeSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setAnimeSearchQuery('');
                          setAnimeSearchResults([]);
                          setAnimeSearchTouched(false);
                        }}
                        title="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={animeSearchLoading || !animeSearchQuery.trim()}
                    onClick={() => runAnimeCharacterSearch(animeSearchQuery)}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-accentPurple text-white font-bold text-xs shrink-0 hover:opacity-90 active:scale-95 disabled:opacity-45 transition cursor-pointer flex items-center gap-1"
                  >
                    {animeSearchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span className="hidden xs:inline">Find</span>
                  </button>
                </div>

                {/* Quick Popular Anime & Manga Character & Series Queries */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {[
                    'Grid',
                    'Sung Jin-Woo',
                    'Overgeared',
                    'Ramparts of Ice',
                    'Koyun',
                    'Miki',
                    'Gojo',
                    'Levi',
                    'Luffy',
                    'Zoro',
                    'Sakamoto Days'
                  ].map((quickName) => (
                    <button
                      key={quickName}
                      type="button"
                      onClick={() => {
                        setAnimeSearchQuery(quickName);
                        runAnimeCharacterSearch(quickName);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-400/40 text-[10px] font-semibold text-gray-300 hover:text-pink-200 whitespace-nowrap shrink-0 transition active:scale-95 cursor-pointer"
                    >
                      {quickName}
                    </button>
                  ))}
                </div>

                {/* Medium Type Filter Pills (All / Anime / Manga) */}
                {animeSearchResults.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                    {[
                      { id: 'All', label: 'All Media', count: animeSearchResults.length },
                      {
                        id: 'Anime',
                        label: 'Anime Only',
                        count: animeSearchResults.filter((c) => !isMangaItem(c)).length
                      },
                      {
                        id: 'Manga',
                        label: 'Manga Only',
                        count: animeSearchResults.filter(isMangaItem).length
                      }
                    ].map((flt) => (
                      <button
                        key={flt.id}
                        type="button"
                        onClick={() => {
                          setAnimeFilterType(flt.id);
                          setAnimeVisibleCount(25);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap shrink-0 transition active:scale-95 border cursor-pointer flex items-center gap-1 ${
                          animeFilterType === flt.id
                            ? 'bg-pink-500/30 border-pink-400 text-pink-100 shadow-sm'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{flt.label}</span>
                        <span className="font-mono text-[9px] opacity-75">({flt.count})</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Search Results */}
                {animeSearchLoading ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                    <span>Searching AniList anime & manga characters...</span>
                  </div>
                ) : animeSearchTouched && animeSearchResults.length === 0 ? (
                  <p className="text-[11px] text-gray-400 text-center py-2">
                    No anime or manga characters found for &quot;{animeSearchQuery}&quot;. Try searching by series title (e.g. &quot;Overgeared&quot;, &quot;Ramparts of Ice&quot;) or character name!
                  </p>
                ) : animeSearchResults.length > 0 && filteredAnimeSearchResults.length === 0 ? (
                  <div className="text-center py-3 space-y-1.5">
                    <p className="text-[11px] text-gray-300">
                      No characters found under <span className="font-bold text-pink-300">&quot;{animeFilterType}&quot;</span> for &quot;{animeSearchQuery}&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAnimeFilterType('All')}
                      className="px-3 py-1 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-200 text-xs font-semibold hover:bg-pink-500/30 transition cursor-pointer"
                    >
                      Show all {animeSearchResults.length} results in All Media
                    </button>
                  </div>
                ) : animeSearchResults.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>
                        Showing {Math.min(filteredAnimeSearchResults.length, animeVisibleCount)} of {filteredAnimeSearchResults.length} characters — tap to use or + Pin
                      </span>
                      {animeSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setAnimeSearchQuery('');
                            setAnimeSearchResults([]);
                            setAnimeSearchTouched(false);
                          }}
                          className="text-pink-300 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-0.5 scrollbar-thin">
                      {filteredAnimeSearchResults.slice(0, animeVisibleCount).map((char) => {
                        const isSelected = selectedAvatar === char.url;
                        const isPinned = (avatarCollections.anime?.items || []).some(
                          (it) => it.id === char.id || it.url === char.url
                        );
                        const isManga = isMangaItem(char);

                        return (
                          <div
                            key={char.id}
                            onClick={() => handleSelectAvatar(char.url)}
                            className={`group relative rounded-xl overflow-hidden border p-1 bg-darkBg/90 transition-all cursor-pointer active:scale-95 ${
                              isSelected
                                ? 'border-accentCyan ring-2 ring-accentCyan/55 shadow-[0_0_14px_rgba(var(--accent-cyan),0.45)]'
                                : 'border-white/10 hover:border-pink-400/50'
                            }`}
                          >
                            <div className="aspect-square w-full overflow-hidden rounded-lg bg-darkBg relative">
                              <img
                                src={char.url}
                                alt={char.name}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                              {isSelected && (
                                <div className="absolute top-1 right-1 bg-accentCyan text-black p-0.5 rounded-full shadow">
                                  <Check className="w-2.5 h-2.5 stroke-[4]" />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handlePinAnimeCharacter(char, e)}
                                title={isPinned ? 'Saved in Anime & Manga' : 'Pin to Anime & Manga'}
                                className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold transition shadow ${
                                  isPinned
                                    ? 'bg-emerald-500/90 text-black'
                                    : 'bg-black/80 hover:bg-pink-500 text-pink-200 hover:text-white border border-pink-400/30'
                                }`}
                              >
                                {isPinned ? 'Pinned' : '+ Pin'}
                              </button>
                              <div className="absolute bottom-1 right-1">
                                {isManga ? (
                                  <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-emerald-500/90 text-black shadow">
                                    Manga
                                  </span>
                                ) : (
                                  <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-pink-500/90 text-white shadow">
                                    Anime
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="pt-1 px-0.5">
                              <p className="text-[10px] font-bold text-white truncate" title={char.name}>{char.name}</p>
                              <p className="text-[9px] text-gray-400 truncate" title={char.series}>{char.series}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {filteredAnimeSearchResults.length > animeVisibleCount && (
                      <button
                        type="button"
                        onClick={() => setAnimeVisibleCount((c) => c + 30)}
                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <span>+ Show More Characters</span>
                        <span className="text-pink-300 font-mono text-[11px]">
                          ({filteredAnimeSearchResults.length - animeVisibleCount} remaining)
                        </span>
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {/* Category Avatar Grid with Add, Edit, Delete Actions */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-2xl bg-black/40 border border-white/10">
              {/* Add New AI Avatar Tile in this category */}
              <button
                type="button"
                disabled={currentCategory.items.length >= MAX_AVATARS_PER_CATEGORY}
                onClick={() => openAiGeneratorForCategory(activeAvatarTab)}
                className={`aspect-square rounded-xl border border-dashed flex flex-col items-center justify-center p-2 text-center transition group active:scale-95 ${
                  currentCategory.items.length >= MAX_AVATARS_PER_CATEGORY
                    ? 'border-white/10 opacity-40 cursor-not-allowed'
                    : 'border-accentCyan/40 hover:border-accentCyan bg-accentCyan/5 hover:bg-accentCyan/15'
                }`}
              >
                <Plus className="w-5 h-5 text-accentCyan group-hover:scale-110 transition-transform mb-0.5" />
                <span className="text-[10px] font-bold text-accentCyan leading-tight">+ AI Avatar</span>
                <span className="text-[9px] text-gray-500">to {currentCategory.label.split(' ')[0]}</span>
              </button>

              {/* Avatar Cards */}
              {currentCategory.items.map((item) => {
                const isSelected = selectedAvatar === item.url;
                const isEmoji = isEmojiAvatarUrl(item.url);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectAvatar(item.url)}
                    className={`group relative aspect-square rounded-xl overflow-hidden border p-1 transition-all duration-300 active:scale-95 cursor-pointer ${
                      isEmoji
                        ? 'bg-gradient-to-br from-accentCyan/15 via-[#0e1530] to-accentPurple/20'
                        : 'bg-darkBg/90'
                    } ${
                      isSelected
                        ? 'border-accentCyan shadow-[0_0_18px_rgba(var(--accent-cyan),0.48)] ring-2 ring-accentCyan/55 scale-[1.02]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {/* Orbit Aura Ring around Selected Avatar Tile */}
                    {isSelected && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-4 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(var(--accent-cyan),0.65)_90deg,transparent_180deg,rgba(var(--accent-purple),0.65)_270deg,transparent_360deg)] animate-orbit-cw opacity-60"
                      />
                    )}
                    <img
                      src={item.url}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className={`relative z-10 w-full h-full rounded-lg transition-transform duration-300 group-hover:scale-105 ${
                        isEmoji
                          ? 'object-contain p-2.5 sm:p-3 bg-black/35 border border-white/10 shadow-[inset_0_0_16px_rgba(var(--accent-cyan),0.14)]'
                          : 'object-cover bg-darkBg'
                      }`}
                      loading="lazy"
                    />

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="z-20 absolute top-1 right-1 bg-accentCyan text-black p-0.5 rounded-full shadow-[0_0_10px_rgba(var(--accent-cyan),0.9)]">
                        <Check className="w-2.5 h-2.5 stroke-[4]" />
                      </div>
                    )}

                    {/* Quick Edit & Delete Action Pill */}
                    <div className="z-20 absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1 p-0.5 rounded-lg bg-black/80 backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        title="Edit Avatar via Prompt"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAiGeneratorForCategory(activeAvatarTab, item);
                        }}
                        className="p-1 rounded-md bg-accentCyan/20 hover:bg-accentCyan text-accentCyan hover:text-black transition"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <span className="text-[9px] font-bold text-gray-300 truncate max-w-[42px]">
                        {item.name}
                      </span>
                      <button
                        type="button"
                        title="Delete Avatar"
                        onClick={(e) => handleDeleteAvatar(activeAvatarTab, item.id, e)}
                        className="p-1 rounded-md bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dashboard Theme Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                <Palette className="w-3.5 h-3.5 text-accentCyan" />
                <span>Dashboard Theme ({THEME_OPTIONS.length} Studio Palettes)</span>
              </div>
              <span className="text-[11px] font-mono text-gray-400">Instant Preview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEME_OPTIONS.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleThemeChange(t.id)}
                    className={`group relative p-3.5 sm:p-4 rounded-xl border text-left transition-colors duration-150 overflow-hidden cursor-pointer ${
                      isSelected
                        ? 'border-accentCyan/80 bg-white/[0.06] shadow-lg ring-1 ring-accentCyan/40'
                        : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                    }`}
                  >
                    {/* Top Row: Icon + Name & Vibe + Active Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${t.iconBg || 'bg-white/5 border-white/10'}`}>
                          {t.icon && <t.icon className={`w-4 h-4 ${t.iconColor || 'text-accentCyan'} shrink-0`} />}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-white tracking-tight block truncate">
                            {t.name}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 block truncate">
                            {t.vibe}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border border-accentCyan/50 bg-accentCyan/15 text-accentCyan shrink-0">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Select
                        </span>
                      )}
                    </div>

                    {/* 5-Color Palette Strip */}
                    <div className="mb-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                        <span>Palette</span>
                        <span className="text-gray-500">5-Tone Colorway</span>
                      </div>
                      <div className="flex h-3 w-full rounded-md overflow-hidden border border-white/10 shadow-inner">
                        {t.swatch.map((color, cIdx) => (
                          <div
                            key={`${color}-${cIdx}`}
                            title={color}
                            className="flex-1 h-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Clean Description */}
                    <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed">
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-shimmer w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold hover:opacity-90 transition shadow-lg shadow-accentPurple/25 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-95 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : 'Save Profile & Dashboard Changes'}
          </button>
        </form>
      </div>

      {/* ── Mobile-Optimized AI Avatar Generator Modal / Sheet ── */}
      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-hidden">
          <div className="relative w-full max-w-lg glass-panel border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-darkCard/95 border-b-0 sm:border-b">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 shrink-0 bg-darkBg/60 rounded-t-3xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accentPurple/20 border border-accentPurple/40">
                  <Wand2 className="w-5 h-5 text-accentCyan animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit">
                    {editingAvatarTarget ? 'Edit Avatar with AI' : 'AI Prompt Avatar Studio'}
                  </h3>
                  <p className="text-[11px] text-gray-400">Target Category: <span className="text-accentCyan font-semibold">{avatarCollections[aiTargetCategory]?.label}</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setEditingAvatarTarget(null);
                }}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition active:scale-95 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable with safe bottom padding) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-12 sm:pb-6">
              {/* Target Category Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider font-mono">
                  Save Target Style &amp; Category
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(avatarCollections).map(([key, col]) => {
                    const ColIcon = col.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setAiTargetCategory(key);
                          setAiStyle(key);
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border active:scale-95 ${
                          aiTargetCategory === key
                            ? 'bg-gradient-to-r from-accentPurple/30 to-accentCyan/30 border-accentCyan text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {ColIcon && <ColIcon className={`w-3.5 h-3.5 ${col.iconColor || ''}`} />}
                        <span>{col.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Engine Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>AI Synthesis Engine</span>
                  <span className="text-[10px] text-accentCyan font-normal flex items-center gap-1">
                    {aiEngineMode === 'instant' ? (
                      <>
                        <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span>Ultra Fast (0.1s)</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3 h-3 text-pink-400 fill-pink-400/40" />
                        <span>Turbo Diffusion (2s)</span>
                      </>
                    )}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiEngineMode('instant')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 active:scale-95 ${
                      aiEngineMode === 'instant'
                        ? 'bg-accentCyan/20 border-accentCyan text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                    <span>Instant AI (0.1s)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiEngineMode('turbo')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 active:scale-95 ${
                      aiEngineMode === 'turbo'
                        ? 'bg-accentPurple/25 border-accentPurple text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40 shrink-0" />
                    <span>Turbo Diffusion (2s)</span>
                  </button>
                </div>
              </div>

              {/* Prompt Input Form */}
              <form onSubmit={handleGenerateAiAvatar} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider font-mono">
                    Avatar Prompt Description
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Gojo Satoru neon glow or 3D sunglasses emoji..."
                      className="w-full bg-darkBg border border-white/15 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition"
                    />
                  </div>
                </div>

                {/* Quick Inspiration Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider">Quick Ideas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setAiPrompt(sug)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-accentCyan/15 border border-white/10 hover:border-accentCyan/30 text-[10px] font-medium text-gray-300 hover:text-accentCyan transition active:scale-95"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Action Button */}
                <button
                  type="submit"
                  disabled={aiGenerating || !aiPrompt.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 active:scale-95 cursor-pointer mt-1 hover:opacity-95"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Synthesizing AI Artwork...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>{editingAvatarTarget ? 'Regenerate Artwork' : 'Generate AI Avatar'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Result Preview & Save Action */}
              {aiPreviewUrl && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-black/70 border-2 border-accentCyan/40 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 shadow-xl animate-scale-in">
                  <img
                    src={aiPreviewUrl}
                    alt="AI Avatar Preview"
                    referrerPolicy="no-referrer"
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-accentCyan shadow-[0_0_15px_rgba(var(--accent-cyan),0.4)] shrink-0 ${
                      isEmojiAvatarUrl(aiPreviewUrl)
                        ? 'object-contain p-2.5 bg-gradient-to-br from-accentCyan/15 via-[#0e1530] to-accentPurple/20'
                        : 'object-cover bg-darkBg'
                    }`}
                  />
                  <div className="space-y-2 flex-1 w-full text-center sm:text-left min-w-0">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white truncate">{aiPrompt || 'Generated Avatar'}</h4>
                      <p className="text-[10px] text-accentCyan font-mono">
                        Will be saved to: {avatarCollections[aiTargetCategory]?.label}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveAiAvatar}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Save &amp; Apply Avatar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
