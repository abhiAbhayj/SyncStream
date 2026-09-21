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
  Zap,
  Sliders,
  Image as ImageIcon
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
    name: '🌊 Ocean Abyss',
    desc: 'Deep oceanic trench & undulating sine-wave currents',
    animation: 'Tidal current waves & sonar ripples',
    swatch: ['#0f1224', '#63d2ff', '#9564ff'],
  },
  {
    id: 'inferno',
    name: '🔥 Inferno Magma',
    desc: 'Volcanic obsidian lake, turbulent lava & flame shards',
    animation: 'Molten lava waves & fire burst shards',
    swatch: ['#ff1e27', '#ff4500', '#ffaa00'],
  },
  {
    id: 'matrix',
    name: '⚡ Matrix Terminal',
    desc: 'Pitch void black & calm cyber circuit grid radar pulse',
    animation: 'Cyber circuit grid & radar beam',
    swatch: ['#00ff88', '#10b981', '#39ff14'],
  },
  {
    id: 'monochrome',
    name: '⚪ Lunar Noir (Black & White)',
    desc: 'High-contrast charcoal & connected constellation stardust',
    animation: 'Constellation stardust & noir',
    swatch: ['#0a0a0c', '#ffffff', '#94a3b8'],
  },
  {
    id: 'arctic',
    name: '❄️ Arctic Frost & Ice',
    desc: 'Glacial frosted navy, ice cyan & drifting crystalline snow',
    animation: 'Drifting snowflakes & ice crystals',
    swatch: ['#06101e', '#38bdf8', '#f8fafc'],
  },
  {
    id: 'tokyo',
    name: '🌸 Tokyo Vaporwave Neon',
    desc: 'Ultraviolet midnight & moving 80s synthwave perspective grid',
    animation: 'Synthwave moving grid & neon motes',
    swatch: ['#140224', '#ff007f', '#00f5d4'],
  },
  {
    id: 'cyber',
    name: '👑 Solar Gold Luxe',
    desc: 'Royal onyx gunmetal, 24K gold stars & sweeping light shafts',
    animation: 'Rotating diamond stars & gold rays',
    swatch: ['#0d0c07', '#ffd700', '#ff9900'],
  },
  {
    id: 'amethyst',
    name: '🔮 Cosmic Nebula Void',
    desc: 'Deep space cosmic starfield & shooting meteors',
    animation: 'Twinkling stars & shooting meteors',
    swatch: ['#0b041c', '#a855f7', '#f43f5e'],
  },
];

const AVATAR_COLLECTIONS = {
  bots: {
    label: 'Cyber Bots',
    icon: Bot,
    items: [
      { id: 'bot-optimus', name: 'Optimus', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Optimus' },
      { id: 'bot-shadow', name: 'Shadow', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow' },
      { id: 'bot-ruby', name: 'Ruby', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ruby' },
      { id: 'bot-spike', name: 'Spike', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Spike' },
      { id: 'bot-alpha', name: 'Alpha', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alpha' },
      { id: 'bot-matrix', name: 'Matrix', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Matrix' },
      { id: 'bot-nexus', name: 'Nexus', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nexus' },
      { id: 'bot-titan', name: 'Titan', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Titan' },
      { id: 'bot-glitch', name: 'Glitch', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=GlitchBot' },
      { id: 'bot-cyberv', name: 'CyberV', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberVortex' },
      { id: 'bot-pulse', name: 'Pulse', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PulseBot' },
      { id: 'bot-echo', name: 'Echo', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=EchoMech' }
    ]
  },
  anime: {
    label: 'Anime Personas',
    icon: Wand2,
    items: [
      { id: 'ani-aoi', name: 'Aoi', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aoi' },
      { id: 'ani-ren', name: 'Ren', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ren' },
      { id: 'ani-sakura', name: 'Sakura', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sakura' },
      { id: 'ani-ryu', name: 'Ryu', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ryu' },
      { id: 'ani-kenji', name: 'Kenji', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kenji' },
      { id: 'ani-kaori', name: 'Kaori', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kaori' },
      { id: 'ani-yuki', name: 'Yuki', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Yuki' },
      { id: 'ani-hikaru', name: 'Hikaru', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Hikaru' },
      { id: 'ani-shin', name: 'Shin', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ShinKage' },
      { id: 'ani-mei', name: 'Mei', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MeiSakuraba' },
      { id: 'ani-kaito', name: 'Kaito', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=KaitoNeon' },
      { id: 'ani-riko', name: 'Riko', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=RikoMage' }
    ]
  },
  pixel: {
    label: 'Retro Pixel',
    icon: Gamepad2,
    items: [
      { id: 'pix-hero', name: 'Pixel Hero', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelHero' },
      { id: 'pix-arcade', name: 'Arcade84', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Arcade84' },
      { id: 'pix-knight', name: 'Retro Knight', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroKnight' },
      { id: 'pix-byte', name: 'Byte', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Byte' },
      { id: 'pix-voxel', name: 'Voxel', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Voxel' },
      { id: 'pix-mage', name: 'Pixel Mage', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelMage' },
      { id: 'pix-ninja', name: 'Pixel Ninja', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelNinja' },
      { id: 'pix-chiptune', name: 'Chiptune', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Chiptune' },
      { id: 'pix-cyber', name: 'CyberPixel', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=CyberPixel8' },
      { id: 'pix-quest', name: 'QuestKing', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=QuestKing' },
      { id: 'pix-boss', name: 'FinalBoss', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=FinalBoss' },
      { id: 'pix-rogue', name: 'PixelRogue', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelRogue' }
    ]
  },
  emojis: {
    label: '3D Emojis',
    icon: Smile,
    items: [
      { id: 'emo-sparky', name: 'Sparky', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Sparky' },
      { id: 'emo-cosmo', name: 'Cosmo', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Cosmo' },
      { id: 'emo-nova', name: 'Nova', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Nova' },
      { id: 'emo-blaze', name: 'Blaze', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Blaze' },
      { id: 'emo-aurora', name: 'Aurora', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Aurora' },
      { id: 'emo-eclipse', name: 'Eclipse', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Eclipse' },
      { id: 'emo-zenith', name: 'Zenith', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Zenith' },
      { id: 'emo-pulse', name: 'Pulse', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Pulse' },
      { id: 'emo-sol', name: 'Sol', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=SolKing' },
      { id: 'emo-orbit', name: 'Orbit', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=OrbitGuy' },
      { id: 'emo-astro', name: 'Astro', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=AstroSmile' },
      { id: 'emo-comet', name: 'Comet', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=CometWink' }
    ]
  }
};

const MAX_CUSTOM_AVATARS = 10;

const AI_STYLE_PRESETS = [
  { id: 'bots', label: '🤖 Cyber Bot', suffix: 'cyberpunk mecha robot bot avatar, futuristic neon lighting, crisp vector icon style, dark background' },
  { id: 'anime', label: '🌸 Anime Persona', suffix: 'vibrant anime character portrait avatar, detailed manga art style, studio ghibli anime aesthetic' },
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
  const [activeAvatarTab, setActiveAvatarTab] = useState('custom');
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

  // ── Custom User Avatars Management ──
  const [customAvatars, setCustomAvatars] = useState(() => {
    try {
      const saved = localStorage.getItem(`syncstream_custom_avatars_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`syncstream_custom_avatars_${user?.id || 'guest'}`, JSON.stringify(customAvatars));
    } catch (e) {}
  }, [customAvatars, user?.id]);

  // ── AI Prompt Generation State ──
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('bots');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreviewUrl, setAiPreviewUrl] = useState(null);
  const [editingAvatarId, setEditingAvatarId] = useState(null);

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

  // Helper to convert any image URL to clean Base64 JPEG
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

  // ── AI Prompt Avatar Generation ──
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

      // Pre-load image to verify validity
      const testImg = new Image();
      testImg.crossOrigin = 'anonymous';
      testImg.onload = () => {
        setAiPreviewUrl(generatedUrl);
        setAiGenerating(false);
      };
      testImg.onerror = () => {
        // Fallback to high-quality procedural seed
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
      setError('AI generation error. Please try again.');
      setAiGenerating(false);
    }
  };

  // Save AI Avatar to Custom Collection
  const handleSaveAiAvatarToCollection = async () => {
    if (!aiPreviewUrl) return;

    if (!editingAvatarId && customAvatars.length >= MAX_CUSTOM_AVATARS) {
      setError(`Custom avatar limit reached (${MAX_CUSTOM_AVATARS} max). Please delete an existing custom avatar first.`);
      return;
    }

    try {
      setLoading(true);
      let finalDataUrl = aiPreviewUrl;
      try {
        finalDataUrl = await convertToDataUrl(aiPreviewUrl);
      } catch (e) {
        // use url as fallback
      }

      if (editingAvatarId) {
        // Edit existing avatar
        setCustomAvatars((prev) =>
          prev.map((av) =>
            av.id === editingAvatarId
              ? { ...av, url: finalDataUrl, prompt: aiPrompt.trim(), style: aiStyle, name: aiPrompt.trim().slice(0, 18) }
              : av
          )
        );
      } else {
        // Add new avatar
        const newEntry = {
          id: `ai-${Date.now()}`,
          name: aiPrompt.trim().slice(0, 18) || 'AI Avatar',
          prompt: aiPrompt.trim(),
          style: aiStyle,
          url: finalDataUrl,
          created_at: Date.now()
        };
        setCustomAvatars((prev) => [newEntry, ...prev]);
      }

      setSelectedAvatar(finalDataUrl);
      setIsCustomUploaded(true);
      setShowAiModal(false);
      setAiPrompt('');
      setAiPreviewUrl(null);
      setEditingAvatarId(null);
      setActiveAvatarTab('custom');
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save AI avatar.');
      setLoading(false);
    }
  };

  const handleEditCustomAvatar = (avatar) => {
    setEditingAvatarId(avatar.id);
    setAiPrompt(avatar.prompt || avatar.name);
    setAiStyle(avatar.style || 'bots');
    setAiPreviewUrl(avatar.url);
    setShowAiModal(true);
  };

  const handleDeleteCustomAvatar = (id, e) => {
    e?.stopPropagation?.();
    if (window.confirm('Are you sure you want to delete this custom avatar from your collection?')) {
      setCustomAvatars((prev) => prev.filter((av) => av.id !== id));
      if (selectedAvatar.includes(id)) {
        setSelectedAvatar('https://api.dicebear.com/7.x/bottts/svg?seed=Optimus');
      }
    }
  };

  const handleSelectPresetAvatar = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
    setIsCustomUploaded(false);
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

  return (
    <div className="max-w-4xl mx-auto py-5 sm:py-8 px-3.5 sm:px-6 md:px-8 space-y-6 sm:space-y-8 min-h-[75vh]">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-outfit flex items-center gap-2">
          <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-accentPurple" />
          Profile &amp; AI Avatar Studio
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Generate custom avatars via AI prompts, manage your avatar collection, and style your live animated dashboard theme.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left Side: Active Avatar Preview & Action Hub */}
        <div className="md:col-span-1 glass-panel border border-white/10 rounded-3xl p-5 sm:p-6 text-center space-y-4 shadow-xl">
          <div className="relative inline-block">
            <img
              src={selectedAvatar}
              alt="Profile avatar preview"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-accentCyan bg-darkBg object-cover mx-auto p-1 shadow-2xl"
            />
            <div className="absolute bottom-0 right-0 bg-accentPurple text-white p-2 rounded-full shadow-lg">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1">
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
              onClick={() => {
                setEditingAvatarId(null);
                setAiPrompt('');
                setAiPreviewUrl(null);
                setShowAiModal(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-accentPurple to-accentCyan text-black font-extrabold text-xs transition flex items-center justify-center gap-2 active:scale-95 shadow-md hover:opacity-90"
            >
              <Wand2 className="w-4 h-4 text-black" />
              <span>Generate Avatar with AI Prompt</span>
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
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 font-bold text-xs transition flex items-center justify-center gap-2 active:scale-95"
            >
              {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Upload Photo from Device</span>
            </button>
          </div>

          <div className="pt-2 border-t border-white/5">
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Account
            </button>
          </div>
        </div>

        {/* Right Side: Form, Custom Gallery & Theme Studio */}
        <form
          onSubmit={handleSave}
          className="md:col-span-2 glass-panel border border-white/10 rounded-3xl p-4 sm:p-6 md:p-8 space-y-6 shadow-xl"
        >
          {/* Notifications */}
          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold p-4 rounded-xl text-center shadow-lg animate-fade-in">
              ✨ Profile settings &amp; custom avatars saved successfully!
            </div>
          )}
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold p-4 rounded-xl text-center shadow-lg animate-fade-in">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-2">
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

          {/* Avatar Gallery Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                  Avatar Studio
                </label>
                {activeAvatarTab === 'custom' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accentPurple/20 text-accentPurple font-mono font-bold border border-accentPurple/30">
                    {customAvatars.length} / {MAX_CUSTOM_AVATARS} Slots
                  </span>
                )}
              </div>

              {/* Category selector tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveAvatarTab('custom')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition active:scale-95 border ${
                    activeAvatarTab === 'custom'
                      ? 'bg-gradient-to-r from-accentPurple/30 to-accentCyan/30 border-accentCyan text-white shadow-sm'
                      : 'bg-white/5 border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-accentCyan" />
                  <span>My AI Avatars ({customAvatars.length})</span>
                </button>

                {Object.entries(AVATAR_COLLECTIONS).map(([key, col]) => {
                  const Icon = col.icon;
                  const isActive = activeAvatarTab === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveAvatarTab(key)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition active:scale-95 border ${
                        isActive
                          ? 'bg-accentPurple/25 border-accentPurple text-white shadow-sm'
                          : 'bg-white/5 border-transparent text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-3 h-3 text-accentCyan" />
                      <span>{col.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom AI Avatar Collection Grid */}
            {activeAvatarTab === 'custom' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/10">
                  {/* Create New AI Avatar Tile */}
                  <button
                    type="button"
                    disabled={customAvatars.length >= MAX_CUSTOM_AVATARS}
                    onClick={() => {
                      setEditingAvatarId(null);
                      setAiPrompt('');
                      setAiPreviewUrl(null);
                      setShowAiModal(true);
                    }}
                    className={`aspect-square rounded-xl border border-dashed flex flex-col items-center justify-center p-2 text-center transition group active:scale-95 ${
                      customAvatars.length >= MAX_CUSTOM_AVATARS
                        ? 'border-white/10 opacity-40 cursor-not-allowed'
                        : 'border-accentCyan/40 hover:border-accentCyan bg-accentCyan/5 hover:bg-accentCyan/15'
                    }`}
                  >
                    <Plus className="w-5 h-5 text-accentCyan group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-bold text-accentCyan">New AI Avatar</span>
                    <span className="text-[9px] text-gray-500">via Prompt</span>
                  </button>

                  {/* Saved Custom Avatars */}
                  {customAvatars.map((av) => {
                    const isSelected = selectedAvatar === av.url;
                    return (
                      <div
                        key={av.id}
                        onClick={() => {
                          setSelectedAvatar(av.url);
                          setIsCustomUploaded(true);
                        }}
                        className={`group relative aspect-square rounded-xl overflow-hidden border p-1 bg-darkBg/90 transition-all duration-300 active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'border-accentCyan shadow-[0_0_15px_rgba(99,210,255,0.4)] ring-2 ring-accentCyan/50'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded-lg" />

                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-accentCyan text-black p-0.5 rounded-full shadow">
                            <Check className="w-2.5 h-2.5 stroke-[4]" />
                          </div>
                        )}

                        {/* Hover Quick Edit / Delete Controls */}
                        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 rounded-xl backdrop-blur-xs">
                          <button
                            type="button"
                            title="Edit AI Prompt"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCustomAvatar(av);
                            }}
                            className="p-1.5 rounded-lg bg-accentCyan/20 hover:bg-accentCyan text-accentCyan hover:text-black transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Delete Avatar"
                            onClick={(e) => handleDeleteCustomAvatar(av.id, e)}
                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {customAvatars.length === 0 && (
                  <p className="text-[11px] text-gray-500 text-center py-1">
                    No custom AI avatars generated yet. Click <strong>New AI Avatar</strong> to create your first one!
                  </p>
                )}
              </div>
            )}

            {/* Built-in Preset Avatar Categories */}
            {activeAvatarTab !== 'custom' && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 p-3 rounded-2xl bg-black/30 border border-white/5">
                {AVATAR_COLLECTIONS[activeAvatarTab]?.items.map((item) => {
                  const isSelected = selectedAvatar === item.url;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(item.url)}
                      title={item.name}
                      className={`group relative aspect-square rounded-xl overflow-hidden border p-1 bg-darkBg/80 transition-all duration-300 active:scale-95 ${
                        isSelected
                          ? 'border-accentCyan shadow-[0_0_15px_rgba(99,210,255,0.4)] ring-2 ring-accentCyan/50 scale-105'
                          : 'border-white/10 hover:border-white/30 hover:scale-105'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-accentCyan text-black p-0.5 rounded-full shadow">
                          <Check className="w-2.5 h-2.5 stroke-[4]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dashboard Theme Picker */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
              <Palette className="w-3.5 h-3.5 text-accentCyan" />
              <span>Live Animated Dashboard Themes ({THEME_OPTIONS.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="flex gap-1.5 mb-2.5">
                      {t.swatch.map((color) => (
                        <div
                          key={color}
                          className="h-2.5 flex-1 rounded-full"
                          style={{ background: color, boxShadow: `0 0 8px ${color}66` }}
                        />
                      ))}
                    </div>
                    <p className="font-bold text-sm text-white flex items-center justify-between">
                      <span>{t.name}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
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

      {/* ── AI Avatar Generator Modal ── */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg glass-panel border border-white/15 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-accentPurple/20 border border-accentPurple/40">
                  <Wand2 className="w-5 h-5 text-accentCyan animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white font-outfit">
                    {editingAvatarId ? 'Edit AI Avatar Prompt' : 'AI Prompt Avatar Studio'}
                  </h3>
                  <p className="text-xs text-gray-400">Describe any avatar identity to generate in real time</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setEditingAvatarId(null);
                }}
                className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Style Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                Select Art Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AI_STYLE_PRESETS.map((preset) => {
                  const isChosen = aiStyle === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAiStyle(preset.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-left border ${
                        isChosen
                          ? 'bg-accentPurple/30 border-accentCyan text-white shadow-sm'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt Input */}
            <form onSubmit={handleGenerateAiAvatar} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                  Avatar Description Prompt
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Cyberpunk samurai robot with glowing neon blue katana..."
                    className="w-full bg-darkBg border border-white/15 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition"
                  />
                </div>
              </div>

              {/* Quick Inspiration Chips */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400">Inspiration:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setAiPrompt(sug)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-accentCyan/15 border border-white/10 hover:border-accentCyan/30 text-[10px] font-medium text-gray-300 hover:text-accentCyan transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Trigger Button */}
              <button
                type="submit"
                disabled={aiGenerating || !aiPrompt.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Synthesizing AI Artwork...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>{editingAvatarId ? 'Regenerate Artwork' : 'Generate AI Avatar'}</span>
                  </>
                )}
              </button>
            </form>

            {/* AI Generated Result Preview */}
            {aiPreviewUrl && (
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center gap-4 animate-scale-in">
                <img
                  src={aiPreviewUrl}
                  alt="AI Avatar Preview"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-accentCyan shadow-lg"
                />
                <div className="space-y-2 flex-1">
                  <div>
                    <h4 className="font-bold text-sm text-white line-clamp-1">{aiPrompt}</h4>
                    <p className="text-[10px] text-accentCyan uppercase tracking-wider font-mono">
                      Generated via AI Studio
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAiAvatarToCollection}
                    className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save to My Avatar Collection</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
