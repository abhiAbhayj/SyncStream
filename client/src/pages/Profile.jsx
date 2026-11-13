import React, { useState, useRef, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import axios from 'axios';
import ALL_WHATSAPP_EMOJIS from '../data/whatsapp_emojis.json';
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
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ALL_THEME_CLASSES = [
  'theme-cryo-glacial',
  'theme-magma-thermal',
  'theme-emerald-biogrid',
  'theme-cobalt-quantum',
  'theme-golden-sunfire',
  'theme-obsidian-void',
  'theme-cyberpunk-synthwave',
  'theme-mystic-amethyst',
  // Legacy aliases
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
    id: 'cryo-glacial',
    name: 'Cryo-Prismatic Glacial Shatter',
    vibe: 'Ice / Light Blue',
    icon: Snowflake,
    iconColor: 'text-sky-400 fill-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]',
    iconBg: 'bg-sky-400/10 border-sky-400/30',
    desc: 'Sub-Zero Frost Prism Refraction with translucent rotating ice geometric shards that refract soft rainbow light beams',
    animation: 'Sub-Zero Frost Prism Refraction',
    swatch: ['#020617', '#38bdf8', '#22d3ee', '#0f172a', '#ffffff'],
  },
  {
    id: 'magma-thermal',
    name: 'Magma Thermal Convection Waves',
    vibe: 'Red',
    icon: Flame,
    iconColor: 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]',
    iconBg: 'bg-red-500/10 border-red-500/30',
    desc: 'Molten Core Heat-Haze Distortion with atmospheric heat shimmer and molten convective waves rising from volcanic ash',
    animation: 'Molten Core Heat-Haze Distortion',
    swatch: ['#090505', '#ef4444', '#f97316', '#170a0a', '#fafafa'],
  },
  {
    id: 'emerald-biogrid',
    name: 'Emerald Matrix Biogrid',
    vibe: 'Cyber Jade & Electric Mint',
    icon: Activity,
    iconColor: 'text-emerald-400 fill-emerald-400 drop-shadow-[0_0_8px_rgba(0,245,160,0.7)]',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    desc: 'Full-Screen Cyber Matrix Synapse Flow with cascading bio-digital rain, horizontal laser bus highways, and branching Tesla arcs',
    animation: 'Cyber Matrix Synapse Flow',
    swatch: ['#020905', '#00f5a0', '#2dd4bf', '#061d10', '#ffffff'],
  },
  {
    id: 'cobalt-quantum',
    name: 'Cobalt Quantum Wave',
    vibe: 'Blue',
    icon: Atom,
    iconColor: 'text-blue-500 fill-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]',
    iconBg: 'bg-blue-500/10 border-blue-500/30',
    desc: 'Full-Screen 3D Spacetime Harmonic Topology with undulating quantum wave fabric and dynamic proximity particle entanglement lines',
    animation: '3D Spacetime Wave & Entanglement Web',
    swatch: ['#030712', '#3b82f6', '#06b6d4', '#0f172a', '#f8fafc'],
  },
  {
    id: 'golden-sunfire',
    name: 'Golden Sunfire Monolith',
    vibe: 'Golden',
    icon: Crown,
    iconColor: 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.7)]',
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    desc: 'Opposing Thermal Gradient Streams with descending frost-vapor and rising golden solar micro-ember dust',
    animation: 'Opposing Thermal Gradient Streams',
    swatch: ['#060606', '#eab308', '#f59e0b', '#141414', '#ffffff'],
  },
  {
    id: 'obsidian-void',
    name: 'Obsidian Shadow Void',
    vibe: 'Stealth Platinum & Phantom Violet',
    icon: Moon,
    iconColor: 'text-indigo-400 fill-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.7)]',
    iconBg: 'bg-indigo-500/10 border-indigo-500/30',
    desc: 'Full-Canvas Dark-Matter Polygon Shards tumbling with ghost-chrome glints and corner-to-corner freezing stealth quantum circuits',
    animation: 'Dark-Matter Shards & Crystal Lattice',
    swatch: ['#000000', '#818cf8', '#cbd5e1', '#0c0c12', '#f8fafc'],
  },
  {
    id: 'cyberpunk-synthwave',
    name: 'Cyberpunk Synthwave Neon',
    vibe: 'Neon Pink & Teal',
    icon: Layers,
    iconColor: 'text-pink-500 fill-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.7)]',
    iconBg: 'bg-pink-500/10 border-pink-500/30',
    desc: 'Slow-Gliding Neon Horizon Grid with retro-futuristic wireframe floor sliding forward with magenta horizon glow',
    animation: 'Slow-Gliding Neon Horizon Grid',
    swatch: ['#05050c', '#ec4899', '#06b6d4', '#121022', '#ffffff'],
  },
  {
    id: 'mystic-amethyst',
    name: 'Mystic Amethyst Portal',
    vibe: 'Royal Purple & Emerald',
    icon: Compass,
    iconColor: 'text-purple-400 fill-purple-400 drop-shadow-[0_0_8px_rgba(147,51,234,0.7)]',
    iconBg: 'bg-purple-500/10 border-purple-500/30',
    desc: 'Full-Screen Cosmic Nebula Filament Web with sinuous corner-to-corner arcane energy currents and resonating emerald constellations',
    animation: 'Cosmic Nebula Web & Arcane Currents',
    swatch: ['#040208', '#9333ea', '#10b981', '#110c1d', '#f8fafc'],
  },
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
    label: 'Anime Characters',
    icon: Wand2,
    iconColor: 'text-pink-400 fill-pink-400/30',
    items: [
      { id: 'ani-seed-gojo', name: 'Satoru Gojo', series: 'Jujutsu Kaisen', prompt: 'Anime character Satoru Gojo Jujutsu Kaisen portrait', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gojo' },
      { id: 'ani-seed-luffy', name: 'Monkey D. Luffy', series: 'One Piece', prompt: 'Anime character Luffy One Piece portrait', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luffy' },
      { id: 'ani-seed-naruto', name: 'Naruto Uzumaki', series: 'Naruto', prompt: 'Anime character Naruto Uzumaki portrait', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Naruto' },
      { id: 'ani-seed-levi', name: 'Levi Ackerman', series: 'Attack on Titan', prompt: 'Anime character Levi Ackerman portrait', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Levi' },
      { id: 'ani-seed-tanjiro', name: 'Tanjiro', series: 'Demon Slayer', prompt: 'Anime character Tanjiro Kamado portrait', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Tanjiro' },
      { id: 'ani-seed-nezuko', name: 'Nezuko', series: 'Demon Slayer', prompt: 'Anime character Nezuko Kamado portrait', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Nezuko' },
      { id: 'ani-seed-zoro', name: 'Roronoa Zoro', series: 'One Piece', prompt: 'Anime character Roronoa Zoro portrait', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoro' },
      { id: 'ani-seed-anya', name: 'Anya Forger', series: 'Spy x Family', prompt: 'Anime character Anya Forger portrait', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Anya' }
    ]
  }
};

const MAX_AVATARS_PER_CATEGORY = 24;
const MIN_AVATARS_PER_CATEGORY = 1;

const AI_STYLE_PRESETS = [
  { id: 'emojis', label: '3D Emoji', icon: Smile, iconColor: 'text-amber-400 fill-amber-400/40', suffix: 'glossy 3D WhatsApp Apple-style emoji reaction sticker, studio rim lighting, crisp icon, dark neon background' },
  { id: 'anime', label: 'Anime Character', icon: Sparkles, iconColor: 'text-pink-400 fill-pink-400', suffix: 'vibrant iconic anime character portrait avatar, detailed manga art style, studio anime aesthetic' }
];

const PROMPT_SUGGESTIONS = [
  'Gojo Satoru infinity glow anime portrait',
  '3D Cool Sunglasses Emoji with neon cyan aura',
  'Sung Jin-Woo shadow monarch purple aura portrait',
  'Spider-Verse comic style cyberpunk hero',
  'Itachi Uchiha sharingan glowing eye portrait',
  '3D Laughing Tears Joy Emoji with holographic ring'
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
      'storm-thunder': 'cobalt-quantum',
      synthwave: 'cyberpunk-synthwave',
      'cryo-vault': 'cryo-glacial',
      'solar-flare': 'magma-thermal',
      'cosmic-singularity': 'mystic-amethyst',
      'plasma-web': 'emerald-biogrid',
      'cyber-foundry': 'golden-sunfire',
      'bioluminescent-trench': 'mystic-amethyst',
      'windy-sakura': 'cyberpunk-synthwave',
      'yokohama-night': 'cyberpunk-synthwave'
    };
    if (legacy[saved]) saved = legacy[saved];
    if (saved && THEME_OPTIONS.some(t => t.id === saved)) return saved;
    return 'cryo-glacial';
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

  // ── Live AniList Anime Character Search & Iconic Preload ──
  const [animeSearchQuery, setAnimeSearchQuery] = useState('');
  const [animeSearchResults, setAnimeSearchResults] = useState([]);
  const [animeSearchLoading, setAnimeSearchLoading] = useState(false);
  const [animeSearchTouched, setAnimeSearchTouched] = useState(false);
  const [animeIconicLoading, setAnimeIconicLoading] = useState(false);
  const animePreloadedRef = useRef(false);

  useEffect(() => {
    if (animePreloadedRef.current) return;
    animePreloadedRef.current = true;

    let cancelled = false;
    const loadIconicAnimeCharacters = async () => {
      try {
        setAnimeIconicLoading(true);
        const res = await axios.get('/api/media/anime/characters');
        if (cancelled || !Array.isArray(res.data) || res.data.length === 0) return;

        const iconicPicks = res.data.slice(0, 12);
        setAvatarCollections((prev) => {
          const currentItems = prev.anime?.items || [];
          const hasOnlySeedsOrFewReal =
            currentItems.every((it) => String(it.id).startsWith('ani-seed-')) ||
            currentItems.filter((it) => String(it.id).startsWith('al-char-')).length < 4;

          if (!hasOnlySeedsOrFewReal) return prev;

          const customOrPinned = currentItems.filter(
            (it) => !String(it.id).startsWith('ani-seed-') && !iconicPicks.some((p) => p.id === it.id)
          );
          const mergedItems = [...customOrPinned, ...iconicPicks].slice(0, MAX_AVATARS_PER_CATEGORY);

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

  const [themeRipple, setThemeRipple] = useState(null);
  const rippleTimerRef = useRef(null);

  // Live preview theme selection with expanding Radial Theme Ripple Switch
  const handleThemeChange = (newTheme, e) => {
    const rect = e?.currentTarget?.getBoundingClientRect?.();
    const touchPoint = e?.touches?.[0] || e?.changedTouches?.[0];
    const x = e?.clientX || touchPoint?.clientX || (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
    const y = e?.clientY || touchPoint?.clientY || (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const matchedOption = THEME_OPTIONS.find((t) => t.id === newTheme);
    const rippleColor = matchedOption?.swatch?.[1] || matchedOption?.swatch?.[0] || '#00f5ff';
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsViewTransition = !reduceMotion && typeof document.startViewTransition === 'function';

    setThemeRipple({ id: Date.now(), x, y, color: rippleColor, fallbackCurtain: !supportsViewTransition && !reduceMotion });
    if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
    rippleTimerRef.current = setTimeout(() => setThemeRipple(null), 820);

    const applyThemeDom = () => {
      flushSync(() => {
        setTheme(newTheme);
      });
      ALL_THEME_CLASSES.forEach((cls) => document.body.classList.remove(cls));
      document.body.classList.add(`theme-${newTheme}`);
    };

    if (supportsViewTransition) {
      try {
        const transition = document.startViewTransition(() => {
          applyThemeDom();
        });
        transition.ready
          .then(() => {
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${endRadius}px at ${x}px ${y}px)`
                ]
              },
              {
                duration: 620,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                pseudoElement: '::view-transition-new(root)'
              }
            );
          })
          .catch(() => {});
        return;
      } catch {
        // Fallback to instant application + radial shockwave
      }
    }

    applyThemeDom();
  };

  React.useEffect(() => {
    return () => {
      let currentPersisted = localStorage.getItem('syncstream_theme') || 'cryo-glacial';
      const legacy = {
        'storm-thunder': 'cobalt-quantum',
        synthwave: 'cyberpunk-synthwave',
        'cryo-vault': 'cryo-glacial',
        'solar-flare': 'magma-thermal',
        'cosmic-singularity': 'mystic-amethyst',
        'plasma-web': 'emerald-biogrid',
        'cyber-foundry': 'golden-sunfire',
        'bioluminescent-trench': 'mystic-amethyst',
        'windy-sakura': 'cyberpunk-synthwave',
        'yokohama-night': 'cyberpunk-synthwave'
      };
      if (legacy[currentPersisted]) currentPersisted = legacy[currentPersisted];
      if (!THEME_OPTIONS.some(t => t.id === currentPersisted)) {
        currentPersisted = 'cryo-glacial';
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

  // Live AniList Anime Character Search
  const runAnimeCharacterSearch = async (queryText) => {
    const trimmed = (queryText || '').trim();
    if (!trimmed) {
      setAnimeSearchResults([]);
      setAnimeSearchTouched(false);
      return;
    }

    setAnimeSearchLoading(true);
    setAnimeSearchTouched(true);
    try {
      const res = await axios.get(`/api/media/anime/characters?q=${encodeURIComponent(trimmed)}`);
      setAnimeSearchResults(Array.isArray(res.data) ? res.data : []);
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

  // Generate avatar through AI Prompt (Turbo Speed with Fast Watchdog)
  const handleGenerateAiAvatar = async (e) => {
    e?.preventDefault?.();
    if (!aiPrompt.trim()) {
      setError('Please enter a prompt to generate your AI avatar.');
      return;
    }

    setAiGenerating(true);
    setError(null);

    const fallbackSeed = encodeURIComponent(aiPrompt.trim());
    const dicebearFallback = aiStyle === 'anime'
      ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${fallbackSeed}`
      : `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${fallbackSeed}`;

    // Instant Vector Mode
    if (aiEngineMode === 'instant') {
      setAiPreviewUrl(dicebearFallback);
      setAiGenerating(false);
      return;
    }

    // Fast Turbo Diffusion Mode with Strict Watchdog
    try {
      const styleConfig = AI_STYLE_PRESETS.find((s) => s.id === aiStyle) || AI_STYLE_PRESETS[0];
      const fullPrompt = `${aiPrompt.trim()}, ${styleConfig.suffix}`;
      const seed = Math.floor(Math.random() * 1000000);
      const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=256&height=256&nologo=true&seed=${seed}&model=turbo`;

      let hasFinished = false;

      const finishWith = (url) => {
        if (hasFinished) return;
        hasFinished = true;
        setAiPreviewUrl(url);
        setAiGenerating(false);
      };

      // 4.5-second watchdog so user never hangs waiting for remote queues
      const timeoutId = setTimeout(() => {
        finishWith(dicebearFallback);
      }, 4500);

      const testImg = new Image();
      testImg.crossOrigin = 'anonymous';
      testImg.onload = () => {
        clearTimeout(timeoutId);
        finishWith(generatedUrl);
      };
      testImg.onerror = () => {
        clearTimeout(timeoutId);
        finishWith(dicebearFallback);
      };
      testImg.src = generatedUrl;
    } catch (err) {
      setAiPreviewUrl(dicebearFallback);
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
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3.5 sm:px-6 md:px-8 space-y-4 sm:space-y-6 min-h-[75vh] pb-8 sm:pb-12">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-outfit flex items-center gap-2">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-accentPurple" />
          Profile &amp; Avatar Studio
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Create, edit, and manage avatars across all styles with AI prompts, and customize your animated theme.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 items-start">
        {/* Left Side: Active Avatar & Studio Controls */}
        <div className="md:col-span-1 glass-panel border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center space-y-3.5 sm:space-y-4 shadow-xl">
          {/* Orbit Aura Studio Preview */}
          <div className="relative inline-flex items-center justify-center p-2.5 sm:p-3">
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
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accentCyan shadow-[0_0_10px_rgba(var(--accent-cyan),0.95)]" />
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
              className={`relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-accentCyan mx-auto shadow-2xl transition-transform duration-300 ${
                isEmojiAvatarUrl(selectedAvatar)
                  ? 'bg-gradient-to-br from-accentCyan/20 via-[#0d142c] to-accentPurple/25 object-contain p-3 sm:p-4 shadow-[inset_0_0_24px_rgba(var(--accent-cyan),0.22),0_0_28px_rgba(var(--accent-purple),0.28)]'
                  : 'bg-darkBg object-cover p-1'
              }`}
            />
            <div className="z-20 absolute bottom-2 right-2 bg-accentPurple text-white p-1.5 sm:p-2 rounded-full shadow-lg border border-white/20">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
            </div>
          </div>

          <div className="space-y-0.5 sm:space-y-1">
            <h3 className="font-bold text-base sm:text-lg text-white truncate">{user?.username}</h3>
            <p className="text-[11px] sm:text-xs text-gray-400 font-medium flex items-center justify-center gap-1.5">
              {isCustomUploaded ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-accentGold" />
                  <span>Custom / AI Avatar</span>
                </>
              ) : (
                <>
                  <Palette className="w-3.5 h-3.5 text-accentCyan" />
                  <span>Preset Identity</span>
                </>
              )}
            </p>
            {user?.created_at && (
              <p className="text-[10px] text-gray-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
            )}
          </div>

          {/* Quick Studio Actions */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            {/* AI Generator Trigger */}
            <button
              type="button"
              onClick={() => openAiGeneratorForCategory(activeAvatarTab)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-accentPurple to-accentCyan text-black font-extrabold text-xs transition flex items-center justify-center gap-2 active:scale-95 shadow-md hover:opacity-90"
            >
              <Wand2 className="w-4 h-4 text-black" />
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
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 font-bold text-xs transition flex items-center justify-center gap-2 active:scale-95"
            >
              {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>Upload Photo File</span>
            </button>
          </div>

          <div className="pt-2 border-t border-white/5">
            <button
              onClick={handleSignOut}
              className="w-full py-2 sm:py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Sign Out Account
            </button>
          </div>
        </div>

        {/* Right Side: Form, Avatar Studio & Animated Themes */}
        <form
          onSubmit={handleSave}
          className="md:col-span-2 glass-panel border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 shadow-xl"
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
                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-0.5 scrollbar-thin">
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
                    <span>Live AniList Character Search</span>
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
                      placeholder="Search any anime character (Itachi, Mikasa, Gojo)..."
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

                {/* Quick Popular Character Queries */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {['Itachi', 'Mikasa', 'Sung Jin-Woo', 'Levi', 'Goku', 'Killua', 'Gojo'].map((quickName) => (
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

                {/* Live Search Results */}
                {animeSearchLoading ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                    <span>Searching AniList characters...</span>
                  </div>
                ) : animeSearchTouched && animeSearchResults.length === 0 ? (
                  <p className="text-[11px] text-gray-400 text-center py-2">
                    No anime characters found for &quot;{animeSearchQuery}&quot;. Try another name!
                  </p>
                ) : animeSearchResults.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>Found {animeSearchResults.length} characters — tap to use or + Pin</span>
                    </div>
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-0.5">
                      {animeSearchResults.map((char) => {
                        const isSelected = selectedAvatar === char.url;
                        const isPinned = (avatarCollections.anime?.items || []).some(
                          (it) => it.id === char.id || it.url === char.url
                        );
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
                                className="w-full h-full object-cover"
                              />
                              {isSelected && (
                                <div className="absolute top-1 right-1 bg-accentCyan text-black p-0.5 rounded-full shadow">
                                  <Check className="w-2.5 h-2.5 stroke-[4]" />
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handlePinAnimeCharacter(char, e)}
                                title={isPinned ? 'Saved in Anime Characters' : 'Pin to Anime Characters'}
                                className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold transition shadow ${
                                  isPinned
                                    ? 'bg-emerald-500/90 text-black'
                                    : 'bg-black/80 hover:bg-pink-500 text-pink-200 hover:text-white border border-pink-400/30'
                                }`}
                              >
                                {isPinned ? 'Pinned' : '+ Pin'}
                              </button>
                            </div>
                            <div className="pt-1 px-0.5">
                              <p className="text-[10px] font-bold text-white truncate">{char.name}</p>
                              <p className="text-[9px] text-gray-400 truncate">{char.series}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Category Avatar Grid with Add, Edit, Delete Actions */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-black/40 border border-white/10">
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
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
              <Palette className="w-3.5 h-3.5 text-accentCyan" />
              <span>Live Animated Dashboard Themes ({THEME_OPTIONS.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {THEME_OPTIONS.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={(e) => handleThemeChange(t.id, e)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 overflow-hidden active:scale-[0.98] ${
                      isSelected
                        ? 'border-accentCyan/80 bg-accentCyan/[0.08] shadow-[0_0_20px_rgba(var(--accent-cyan),0.25)] ring-1 ring-accentCyan/50'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15'
                    }`}
                  >
                    {/* Animated Theme Preview Mini-Mockup */}
                    <div
                      aria-hidden="true"
                      className="relative mb-2.5 h-12 rounded-xl border border-white/10 bg-[#050814]/95 p-1.5 flex flex-col justify-between overflow-hidden shadow-inner"
                    >
                      {/* Subtle theme ambient glow */}
                      <div
                        className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-35 transition-opacity duration-500"
                        style={{ background: t.swatch[1] || t.swatch[0] }}
                      />
                      {/* Mini Navbar row */}
                      <div className="relative z-10 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ background: t.swatch[0], boxShadow: `0 0 6px ${t.swatch[0]}` }}
                          />
                          <span className="h-1 w-6 rounded-full bg-white/20" />
                        </div>
                        <div className="flex gap-1">
                          <span className="h-1 w-3 rounded-full bg-white/15" />
                          <span
                            className="h-1 w-4 rounded-full"
                            style={{ background: t.swatch[2] || t.swatch[1] || t.swatch[0] }}
                          />
                        </div>
                      </div>
                      {/* Mini Hero + Cards row */}
                      <div className="relative z-10 flex items-center gap-1.5">
                        <div
                          className="h-4 flex-1 rounded-md border border-white/10 relative overflow-hidden"
                          style={{
                            background: `linear-gradient(120deg, ${t.swatch[0]}33, ${t.swatch[1] || t.swatch[0]}28)`
                          }}
                        >
                          <div
                            className="h-full w-1/2 animate-horizon-beam opacity-80"
                            style={{
                              background: `linear-gradient(90deg, transparent, ${t.swatch[0]}aa, transparent)`
                            }}
                          />
                        </div>
                        <div
                          className="h-4 w-5 rounded-md border border-white/10"
                          style={{ background: `${t.swatch[1] || t.swatch[0]}30` }}
                        />
                        <div
                          className="h-4 w-5 rounded-md border border-white/10"
                          style={{ background: `${t.swatch[2] || t.swatch[0]}30` }}
                        />
                      </div>
                    </div>

                    {/* Color swatch bar */}
                    <div className="flex gap-1.5 mb-2">
                      {t.swatch.map((color) => (
                        <div
                          key={color}
                          className="h-1.5 flex-1 rounded-full"
                          style={{ background: color, boxShadow: `0 0 8px ${color}66` }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${t.iconBg || 'bg-white/5 border-white/10'}`}>
                        {t.icon && <t.icon className={`w-4 h-4 ${t.iconColor || 'text-accentCyan'} shrink-0`} />}
                      </span>
                      <span className="font-bold text-sm text-white">{t.name}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">{t.desc}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-accentCyan">
                      <Sparkles className="w-2.5 h-2.5 animate-pulse text-accentCyan" />
                      <span>{t.animation}</span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accentCyan text-black flex items-center justify-center shadow-[0_0_12px_rgba(var(--accent-cyan),0.6)] font-black">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
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

      {/* Radial Theme Switch Shockwave Flash & Mobile Fallback Curtain Overlay */}
      {themeRipple && (
        <>
          {themeRipple.fallbackCurtain && (
            <div
              key={`curtain-${themeRipple.id}`}
              aria-hidden="true"
              className="fixed inset-0 pointer-events-none z-[9998] animate-theme-curtain"
              style={{
                '--wipe-x': `${themeRipple.x}px`,
                '--wipe-y': `${themeRipple.y}px`,
                background: `radial-gradient(circle at ${themeRipple.x}px ${themeRipple.y}px, ${themeRipple.color}44 0%, ${themeRipple.color}18 48%, rgba(4, 7, 18, 0.55) 100%)`
              }}
            />
          )}
          <div
            key={themeRipple.id}
            aria-hidden="true"
            className="fixed w-72 h-72 rounded-full pointer-events-none z-[9999] animate-theme-shockwave"
            style={{
              left: `${themeRipple.x}px`,
              top: `${themeRipple.y}px`,
              background: `radial-gradient(circle, ${themeRipple.color}55 0%, ${themeRipple.color}22 45%, transparent 72%)`,
              boxShadow: `0 0 60px ${themeRipple.color}88`,
              border: `2px solid ${themeRipple.color}`
            }}
          />
        </>
      )}
    </div>
  );
}
