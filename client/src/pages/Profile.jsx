import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Settings, Check, Sparkles, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || '');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('syncstream_theme') || 'standard';
  });

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('syncstream_theme', newTheme);
    if (newTheme === 'cosmic') {
      document.body.classList.add('theme-cosmic');
    } else {
      document.body.classList.remove('theme-cosmic');
    }
  };
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Dicebear avatar templates with seed values
  const AVATAR_SEEDS = [
    'Optimus', 'Shadow', 'Ruby', 'Spike', 
    'Alpha', 'Beta', 'Neon', 'Widget'
  ];

  const getDicebearUrl = (seed) => {
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
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

    const res = await updateProfile(username, selectedAvatar);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:px-8 space-y-8 min-h-[75vh]">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-outfit flex items-center gap-2">
          <Settings className="w-8 h-8 text-accentPurple" />
          Profile Customization
        </h1>
        <p className="text-sm text-gray-400">
          Modify your watch party credentials and choose your gaming bot identity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Avatar Preview */}
        <div className="md:col-span-1 glass-panel border border-darkBorder rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="relative inline-block">
            <img
              src={selectedAvatar}
              alt="Profile avatar preview"
              className="w-32 h-32 rounded-full border-2 border-accentCyan bg-darkBg object-cover mx-auto p-1 shadow-2xl"
            />
            <div className="absolute bottom-0 right-0 bg-accentPurple text-white p-2 rounded-full shadow-lg">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white">{user?.username}</h3>
            <p className="text-xs text-gray-500 font-medium">Joined {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Account
          </button>
        </div>

        {/* Right Side: Configuration form */}
        <form onSubmit={handleSave} className="md:col-span-2 glass-panel border border-darkBorder rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          
          {/* Notifications */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold p-4 rounded-xl text-center">
              Settings updated successfully!
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400">Display Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-darkBg border border-darkBorder rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition"
              />
            </div>
          </div>

          {/* Avatar Selector Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 block">Choose Bot Avatar Identity</label>
            
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {AVATAR_SEEDS.map((seed) => {
                const avatarUrl = getDicebearUrl(seed);
                const isSelected = selectedAvatar === avatarUrl;
                
                return (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => setSelectedAvatar(avatarUrl)}
                    className={`relative aspect-square rounded-xl overflow-hidden border p-1 bg-black/40 hover:scale-105 transition-all duration-300 ${
                      isSelected 
                        ? 'border-accentCyan shadow-lg shadow-accentCyan/20' 
                        : 'border-darkBorder hover:border-white/20'
                    }`}
                  >
                    <img
                      src={avatarUrl}
                      alt={seed}
                      className="w-full h-full object-cover rounded-lg"
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

          {/* Layout Mode selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 block">Dashboard Theme Palette</label>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleThemeChange('standard')}
                className={`flex-grow py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  theme === 'standard'
                    ? 'border-accentCyan bg-accentCyan/5 text-accentCyan'
                    : 'border-darkBorder bg-darkBg text-gray-400 hover:text-white hover:border-white/10'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-accentCyan"></div>
                Standard Neon Dark
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('cosmic')}
                className={`flex-grow py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  theme === 'cosmic'
                    ? 'border-accentCyan bg-accentCyan/5 text-accentCyan'
                    : 'border-darkBorder bg-darkBg text-gray-400 hover:text-white hover:border-white/10'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-accentPurple"></div>
                Midnight Cosmic
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold hover:opacity-90 transition shadow-lg shadow-accentPurple/25 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2 btn-glow-purple"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              'Save Profile Settings'
            )}
          </button>

        </form>

      </div>

    </div>
  );
}
