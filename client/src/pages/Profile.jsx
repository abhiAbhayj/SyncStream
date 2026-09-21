import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Settings, Check, Sparkles, LogOut, Loader2, Upload, Image as ImageIcon, RefreshCw, X, Palette, Bot, Gamepad2, Smile, Wand2 } from 'lucide-react';
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
      { id: 'bot-titan', name: 'Titan', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Titan' }
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
      { id: 'ani-hikaru', name: 'Hikaru', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Hikaru' }
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
      { id: 'pix-chiptune', name: 'Chiptune', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Chiptune' }
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
      { id: 'emo-pulse', name: 'Pulse', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Pulse' }
    ]
  }
};

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

  // Live preview theme selection and apply to DOM immediately
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    ALL_THEME_CLASSES.forEach(cls => document.body.classList.remove(cls));
    if (newTheme !== 'ocean') {
      document.body.classList.add(`theme-${newTheme}`);
    }
  };

  // Revert body classes to saved theme if user leaves page without saving
  React.useEffect(() => {
    return () => {
      const currentPersisted = localStorage.getItem('syncstream_theme') || 'ocean';
      ALL_THEME_CLASSES.forEach(cls => document.body.classList.remove(cls));
      if (currentPersisted !== 'ocean') {
        document.body.classList.add(`theme-${currentPersisted}`);
      }
    };
  }, []);

  // Handle image upload with canvas resizing (max 256x256, lightweight JPEG)
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

    // 1. Save theme to localStorage and apply to DOM on explicit save
    localStorage.setItem('syncstream_theme', theme);
    ALL_THEME_CLASSES.forEach(cls => document.body.classList.remove(cls));
    if (theme !== 'ocean') {
      document.body.classList.add(`theme-${theme}`);
    }

    // 2. Save username and avatar
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
          Profile Customization
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Upload custom photos, choose creative avatar personas, and style your dashboard theme.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
        
        {/* Left Side: Avatar Preview & Actions */}
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
              {isCustomUploaded ? '📸 Custom Uploaded Photo' : '🎨 Preset Identity'}
            </p>
            {user?.created_at && (
              <p className="text-[10px] text-gray-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
            )}
          </div>

          {/* Quick Photo Upload Button */}
          <div className="space-y-2 pt-2 border-t border-white/5">
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
              className="w-full py-2.5 px-3 rounded-xl bg-accentCyan/15 hover:bg-accentCyan/25 border border-accentCyan/40 text-accentCyan font-bold text-xs transition flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>Upload Custom Photo</span>
            </button>

            {isCustomUploaded && (
              <button
                type="button"
                onClick={() => {
                  handleSelectPresetAvatar('https://api.dicebear.com/7.x/bottts/svg?seed=Optimus');
                }}
                className="w-full py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-[11px] font-semibold transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                Reset to Preset Avatar
              </button>
            )}
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

        {/* Right Side: Configuration form */}
        <form onSubmit={handleSave} className="md:col-span-2 glass-panel border border-white/10 rounded-3xl p-4 sm:p-6 md:p-8 space-y-6 shadow-xl">
          
          {/* Notifications */}
          {success && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold p-4 rounded-xl text-center shadow-lg animate-fade-in">
              ✨ Profile settings &amp; dashboard theme updated successfully!
            </div>
          )}
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold p-4 rounded-xl text-center shadow-lg animate-fade-in">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">Display Username</label>
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

          {/* Avatar Selector Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
                Creative Avatar Identities (28+ Options)
              </label>
              
              {/* Category tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
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

            {/* Avatar Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 p-3 rounded-2xl bg-black/30 border border-white/5">
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
          </div>

          {/* Dashboard Theme Picker */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 uppercase tracking-wider font-mono">
              <Palette className="w-3.5 h-3.5 text-accentCyan" />
              <span>Dashboard Theme ({THEME_OPTIONS.length} Color Combos)</span>
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
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              'Save Profile & Dashboard Changes'
            )}
          </button>

        </form>

      </div>

    </div>
  );
}
