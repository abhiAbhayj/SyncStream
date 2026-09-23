import React, { useState, useRef, useEffect } from 'react';
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
  Bot,
  Gamepad2,
  Smile,
  Wand2,
  Plus,
  Trash2,
  Edit3,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ALL_THEME_CLASSES = [
  'theme-inferno',
  'theme-matrix',
  'theme-monochrome',
  'theme-arctic',
  'theme-tokyo',
  'theme-cyber',
  'theme-amethyst'
];

const THEME_OPTIONS = [
  {
    id: 'ocean',
    name: '🌌 Cosmic Stargate',
    desc: 'Deep space void, 3D chromatic wormhole vortex & multi-color cosmic filaments',
    animation: '3D chromatic wormhole vortex & cosmic dust',
    swatch: ['#05040a', '#a855f7', '#00f5d4', '#ff5964', '#ffd166'],
  },
  {
    id: 'inferno',
    name: '🌋 Inferno Solaris',
    desc: 'Smoked obsidian crucible, solar plasma prominences & coronal flare arcs',
    animation: 'Solar plasma prominence arcs & sparks',
    swatch: ['#0f0705', '#ff5500', '#ff0044', '#ffbb00', '#9900ff'],
  },
  {
    id: 'matrix',
    name: '⚡ Cyberpunk Holo-Matrix',
    desc: 'Carbon void, dynamic 3D hexagonal energy shield & laser ray conduits',
    animation: 'Hexagonal energy shield & laser network',
    swatch: ['#04070d', '#00f0ff', '#ff007f', '#00ff66', '#7000ff'],
  },
  {
    id: 'monochrome',
    name: '🌑 Monolith Chrono',
    desc: 'Pitch monolith, quantum gyroscope rings & floating liquid mercury drops',
    animation: 'Quantum gyroscope & liquid mercury drops',
    swatch: ['#050505', '#e2e8f0', '#3b82f6', '#ef4444', '#ffffff'],
  },
  {
    id: 'arctic',
    name: '🧊 Glacial Prism',
    desc: 'Deep glacial void, rotating 3D quartz crystals & refracting rainbow rays',
    animation: 'Rotating 3D quartz & prismatic rainbow rays',
    swatch: ['#030a16', '#38bdf8', '#ec4899', '#34d399', '#f0fdf4'],
  },
  {
    id: 'tokyo',
    name: '🪩 Retro Synthwave Highway',
    desc: 'Sunset plum, infinite 3D outrun wireframe road & striped neon sun',
    animation: '3D outrun wireframe road & striped sun',
    swatch: ['#12041a', '#ff455b', '#00f5ff', '#bf00ff', '#ffe600'],
  },
  {
    id: 'cyber',
    name: '👑 Imperial Gold Luxe',
    desc: 'Royal bronze noir, cascading liquid gold silk ribbons & 8-point diamond stars',
    animation: 'Liquid gold ribbons & diamond starbursts',
    swatch: ['#0e0b06', '#ffc700', '#e07a00', '#fff0aa', '#00d4aa'],
  },
  {
    id: 'amethyst',
    name: '🌿 Bio-Luminescent Pandora',
    desc: 'Deep alien night, sacred floating spores (Atokirina) & bioluminescent tendrils',
    animation: 'Sacred floating spores & bio tendrils',
    swatch: ['#020b08', '#00ff88', '#ff2a85', '#00e5ff', '#b4ff39'],
  },
];

const DEFAULT_AVATAR_COLLECTIONS = {
  bots: {
    label: 'Cyber Bots',
    icon: Bot,
    items: [
      { id: 'bot-optimus', name: 'Optimus', prompt: 'Cyberpunk mecha robot Optimus with neon cyan optics', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Optimus' },
      { id: 'bot-shadow', name: 'Shadow', prompt: 'Stealth black ninja bot with violet visor', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow' },
      { id: 'bot-ruby', name: 'Ruby', prompt: 'Crimson red armored combat droid', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ruby' },
      { id: 'bot-spike', name: 'Spike', prompt: 'Heavy mecha mech robot with gold antenna', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Spike' },
      { id: 'bot-alpha', name: 'Alpha', prompt: 'Futuristic AI command unit with laser core', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alpha' },
      { id: 'bot-matrix', name: 'Matrix', prompt: 'Terminal cyber bot with emerald code matrix stream', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Matrix' },
      { id: 'bot-nexus', name: 'Nexus', prompt: 'High-tech cyber android with holographic visor', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nexus' },
      { id: 'bot-titan', name: 'Titan', prompt: 'Heavy armored titanium war machine', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Titan' }
    ]
  },
  anime: {
    label: 'Anime Personas',
    icon: Wand2,
    items: [
      { id: 'ani-aoi', name: 'Aoi', prompt: 'Anime hero with electric blue hair and glowing katana', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aoi' },
      { id: 'ani-ren', name: 'Ren', prompt: 'Cool anime rogue with dark crimson cloak', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ren' },
      { id: 'ani-sakura', name: 'Sakura', prompt: 'Kawaii anime blossom mage with pink aura', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sakura' },
      { id: 'ani-ryu', name: 'Ryu', prompt: 'Anime martial artist with dragon aura', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ryu' },
      { id: 'ani-kenji', name: 'Kenji', prompt: 'Cyberpunk samurai with neon headband', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kenji' },
      { id: 'ani-kaori', name: 'Kaori', prompt: 'Anime priestess with sacred star staff', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kaori' },
      { id: 'ani-yuki', name: 'Yuki', prompt: 'Frost anime warrior with silver hair', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Yuki' },
      { id: 'ani-hikaru', name: 'Hikaru', prompt: 'Golden sun anime paladin with solar armor', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Hikaru' }
    ]
  },
  pixel: {
    label: 'Retro Pixel',
    icon: Gamepad2,
    items: [
      { id: 'pix-hero', name: 'Pixel Hero', prompt: '16-bit retro arcade hero with blue sword', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelHero' },
      { id: 'pix-arcade', name: 'Arcade84', prompt: 'Classic 80s arcade pilot with helmet', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Arcade84' },
      { id: 'pix-knight', name: 'Retro Knight', prompt: 'Pixel art paladin with shining armor', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroKnight' },
      { id: 'pix-byte', name: 'Byte', prompt: 'Cyber pixel hacker sprite with green visor', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Byte' },
      { id: 'pix-voxel', name: 'Voxel', prompt: 'Blocky voxel explorer with torch', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Voxel' },
      { id: 'pix-mage', name: 'Pixel Mage', prompt: 'Purple wizard sprite with glowing orb', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelMage' },
      { id: 'pix-ninja', name: 'Pixel Ninja', prompt: 'Shadow stealth ninja with dual blades', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelNinja' },
      { id: 'pix-chiptune', name: 'Chiptune', prompt: 'Synthwave pixel DJ with headphones', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Chiptune' }
    ]
  },
  emojis: {
    label: '3D Emojis',
    icon: Smile,
    items: [
      { id: 'emo-sparky', name: 'Sparky', prompt: 'Cute 3D cartoon emoji smiling with star eyes', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Sparky' },
      { id: 'emo-cosmo', name: 'Cosmo', prompt: 'Cute 3D astronaut emoji with bubble helmet', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Cosmo' },
      { id: 'emo-nova', name: 'Nova', prompt: 'Cool 3D sunglasses emoji with gold chains', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Nova' },
      { id: 'emo-blaze', name: 'Blaze', prompt: 'Fiery 3D flame emoji with cheeky grin', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Blaze' },
      { id: 'emo-aurora', name: 'Aurora', prompt: 'Sweet 3D angel emoji with glowing halo', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Aurora' },
      { id: 'emo-eclipse', name: 'Eclipse', prompt: 'Dark 3D moon emoji with mysterious smile', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Eclipse' },
      { id: 'emo-zenith', name: 'Zenith', prompt: '3D golden crown king emoji with royal robe', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Zenith' },
      { id: 'emo-pulse', name: 'Pulse', prompt: '3D neon gaming emoji with cyber headset', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Pulse' }
    ]
  }
};

const MAX_AVATARS_PER_CATEGORY = 16;
const MIN_AVATARS_PER_CATEGORY = 1;

const AI_STYLE_PRESETS = [
  { id: 'bots', label: '🤖 Cyber Bot', suffix: 'cyberpunk mecha robot bot avatar, futuristic neon lighting, crisp vector icon style, dark background' },
  { id: 'anime', label: '🌸 Anime Persona', suffix: 'vibrant anime character portrait avatar, detailed manga art style, studio anime aesthetic' },
  { id: 'pixel', label: '👾 Retro Pixel', suffix: '16-bit retro pixel art character avatar, clean pixelated sprite, arcade game style' },
  { id: 'emojis', label: '✨ 3D Emoji', suffix: 'cute 3D cartoon character avatar, Pixar 3D render, glossy studio lighting, fun expression' },
  { id: 'scifi', label: '🚀 Sci-Fi Hero', suffix: 'futuristic space hero profile avatar, glowing visor, cinematic concept art, octane render' }
];

const PROMPT_SUGGESTIONS = [
  'Neon Cyber Samurai with katana',
  'Kawaii Anime Mage with cat ears',
  '16-Bit Arcade Knight with shield',
  'Golden Crown 3D Emoji King',
  'Cyberpunk Hacker with glowing visor',
  'Cosmic Galaxy Astronaut with star reflections'
];

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState(user?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Optimus');
  const [activeAvatarTab, setActiveAvatarTab] = useState('bots');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isCustomUploaded, setIsCustomUploaded] = useState(() => {
    return Boolean(user?.avatar_url && user.avatar_url.startsWith('data:image/'));
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('syncstream_theme') || 'ocean';
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // ── Universal Avatar Collections State (Supports Add / Edit / Delete in all categories) ──
  const [avatarCollections, setAvatarCollections] = useState(() => {
    try {
      const saved = localStorage.getItem(`syncstream_avatar_collections_${user?.id || 'guest'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure icon components are re-attached
        const merged = { ...DEFAULT_AVATAR_COLLECTIONS };
        Object.keys(merged).forEach((cat) => {
          if (parsed[cat] && Array.isArray(parsed[cat].items)) {
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
      localStorage.setItem(`syncstream_avatar_collections_${user?.id || 'guest'}`, JSON.stringify(avatarCollections));
    } catch (e) {}
  }, [avatarCollections, user?.id]);

  // ── AI Prompt Generation State ──
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('bots');
  const [aiTargetCategory, setAiTargetCategory] = useState('bots');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreviewUrl, setAiPreviewUrl] = useState(null);
  const [editingAvatarTarget, setEditingAvatarTarget] = useState(null); // { category, id, name }

  // Live preview theme selection and apply to DOM immediately
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    ALL_THEME_CLASSES.forEach((cls) => document.body.classList.remove(cls));
    if (newTheme !== 'ocean') {
      document.body.classList.add(`theme-${newTheme}`);
    }
  };

  React.useEffect(() => {
    return () => {
      const currentPersisted = localStorage.getItem('syncstream_theme') || 'ocean';
      ALL_THEME_CLASSES.forEach((cls) => document.body.classList.remove(cls));
      if (currentPersisted !== 'ocean') {
        document.body.classList.add(`theme-${currentPersisted}`);
      }
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
    setAiStyle(categoryKey || 'bots');
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

  // Generate avatar through AI Prompt
  const handleGenerateAiAvatar = async (e) => {
    e?.preventDefault?.();
    if (!aiPrompt.trim()) {
      setError('Please enter a prompt to generate your AI avatar.');
      return;
    }

    setAiGenerating(true);
    setError(null);

    try {
      const styleConfig = AI_STYLE_PRESETS.find((s) => s.id === aiStyle) || AI_STYLE_PRESETS[0];
      const fullPrompt = `${aiPrompt.trim()}, ${styleConfig.suffix}`;
      const seed = Math.floor(Math.random() * 1000000);
      const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=300&height=300&nologo=true&seed=${seed}`;

      const testImg = new Image();
      testImg.crossOrigin = 'anonymous';
      testImg.onload = () => {
        setAiPreviewUrl(generatedUrl);
        setAiGenerating(false);
      };
      testImg.onerror = () => {
        const fallbackSeed = encodeURIComponent(aiPrompt.trim());
        const dicebearFallback = aiStyle === 'anime'
          ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${fallbackSeed}`
          : aiStyle === 'pixel'
          ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fallbackSeed}`
          : aiStyle === 'emojis'
          ? `https://api.dicebear.com/7.x/thumbs/svg?seed=${fallbackSeed}`
          : `https://api.dicebear.com/7.x/bottts/svg?seed=${fallbackSeed}`;
        setAiPreviewUrl(dicebearFallback);
        setAiGenerating(false);
      };
      testImg.src = generatedUrl;
    } catch (err) {
      setError('AI generation encountered an issue. Please try again.');
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
      setAvatarCollections((prev) => {
        const updatedCat = { ...prev[categoryKey] };
        updatedCat.items = updatedCat.items.filter((it) => it.id !== avatarId);
        return { ...prev, [categoryKey]: updatedCat };
      });

      if (selectedAvatar.includes(avatarId)) {
        const fallback = avatarCollections[categoryKey]?.items[0]?.url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Optimus';
        setSelectedAvatar(fallback);
      }
    }
  };

  // Restore Default Avatars for current category
  const handleRestoreDefaults = (categoryKey) => {
    if (window.confirm(`Reset "${avatarCollections[categoryKey]?.label}" back to original defaults?`)) {
      setAvatarCollections((prev) => ({
        ...prev,
        [categoryKey]: { ...prev[categoryKey], items: DEFAULT_AVATAR_COLLECTIONS[categoryKey].items }
      }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    }
  };

  const handleSelectAvatar = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
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
    if (theme !== 'ocean') {
      document.body.classList.add(`theme-${theme}`);
    }

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
    logout();
    navigate('/login');
  };

  const currentCategory = avatarCollections[activeAvatarTab] || avatarCollections.bots;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-6 md:px-8 space-y-5 sm:space-y-8 min-h-[75vh] pb-28 sm:pb-12">
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
          <div className="relative inline-block">
            <img
              src={selectedAvatar}
              alt="Profile avatar preview"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-accentCyan bg-darkBg object-cover mx-auto p-1 shadow-2xl"
            />
            <div className="absolute bottom-0 right-0 bg-accentPurple text-white p-1.5 sm:p-2 rounded-full shadow-lg">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
            </div>
          </div>

          <div className="space-y-0.5 sm:space-y-1">
            <h3 className="font-bold text-base sm:text-lg text-white truncate">{user?.username}</h3>
            <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
              {isCustomUploaded ? '✨ Custom / AI Avatar' : '🎨 Preset Identity'}
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
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold p-3 sm:p-4 rounded-xl text-center shadow-lg animate-fade-in">
              ✨ Profile settings &amp; custom avatars saved successfully!
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
                    <Icon className="w-3.5 h-3.5 text-accentCyan" />
                    <span>{col.label} ({col.items.length})</span>
                  </button>
                );
              })}
            </div>

            {/* Category Avatar Grid with Add, Edit, Delete Actions */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/10">
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
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectAvatar(item.url)}
                    className={`group relative aspect-square rounded-xl overflow-hidden border p-1 bg-darkBg/90 transition-all duration-300 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'border-accentCyan shadow-[0_0_15px_rgba(99,210,255,0.4)] ring-2 ring-accentCyan/50'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-accentCyan text-black p-0.5 rounded-full shadow">
                        <Check className="w-2.5 h-2.5 stroke-[4]" />
                      </div>
                    )}

                    {/* Quick Edit & Delete Action Pill */}
                    <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1 p-0.5 rounded-lg bg-black/80 backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
                    onClick={() => handleThemeChange(t.id)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 overflow-hidden active:scale-[0.98] ${
                      isSelected
                        ? 'border-accentPurple/80 bg-white/[0.08] shadow-[0_0_20px_rgba(149,100,255,0.2)] ring-1 ring-accentPurple/40'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15'
                    }`}
                  >
                    {/* Color swatch bar */}
                    <div className="flex gap-1.5 mb-2">
                      {t.swatch.map((color) => (
                        <div
                          key={color}
                          className="h-2 flex-1 rounded-full"
                          style={{ background: color, boxShadow: `0 0 8px ${color}66` }}
                        />
                      ))}
                    </div>
                    <p className="font-bold text-sm text-white flex items-center justify-between">
                      <span>{t.name}</span>
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">{t.desc}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-accentCyan">
                      <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                      <span>{t.animation}</span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accentPurple text-white flex items-center justify-center shadow-[0_0_10px_rgba(149,100,255,0.6)]">
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
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold hover:opacity-90 transition shadow-lg shadow-accentPurple/25 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-95 cursor-pointer"
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {Object.entries(avatarCollections).map(([key, col]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setAiTargetCategory(key);
                        setAiStyle(key);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-center border active:scale-95 ${
                        aiTargetCategory === key
                          ? 'bg-gradient-to-r from-accentPurple/30 to-accentCyan/30 border-accentCyan text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
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
                      placeholder="e.g. Cyberpunk samurai robot with glowing katana..."
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
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-accentCyan shadow-[0_0_15px_rgba(99,210,255,0.4)] shrink-0 bg-darkBg"
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
