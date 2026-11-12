import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, User, Phone, Lock, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [cardSpot, setCardSpot] = useState({ x: 50, y: 45, active: false });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = () => {
    setIsShaking(false);
    requestAnimationFrame(() => setIsShaking(true));
    setTimeout(() => setIsShaking(false), 440);
  };

  const passwordScore = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 9) score += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;
    return Math.min(4, Math.max(password.length > 0 ? 1 : 0, score));
  })();

  const strengthMeta = [
    { label: '', color: 'bg-white/10', text: 'text-gray-500' },
    { label: 'Weak — add more chars', color: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.65)]', text: 'text-rose-400' },
    { label: 'Fair — add numbers/caps', color: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.65)]', text: 'text-amber-300' },
    { label: 'Strong Neon Security', color: 'bg-accentCyan shadow-[0_0_12px_rgba(var(--accent-cyan),0.75)]', text: 'text-accentCyan' },
    { label: 'Ultra Vault Shield', color: 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.85)]', text: 'text-emerald-300' }
  ][passwordScore];

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      setLoading(false);
      triggerShake();
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      triggerShake();
      return;
    }

    const res = await register(username, phoneNumber, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
      triggerShake();
    }
  };

  const spotY = focusedField === 'username' ? 35 : focusedField === 'phone' ? 54 : focusedField === 'password' ? 74 : cardSpot.y;
  const spotX = focusedField ? 50 : cardSpot.x;
  const spotVisible = Boolean(focusedField) || cardSpot.active;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-3.5 sm:px-4 py-6 sm:py-8 max-w-md mx-auto space-y-4 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-accentPurple/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setCardSpot({
            x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
            y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)),
            active: true
          });
        }}
        onMouseLeave={() => setCardSpot((p) => ({ ...p, active: false }))}
        className={`w-full p-[1.5px] rounded-3xl relative shadow-2xl animate-fade-in transition-all duration-300 ${isShaking ? 'animate-auth-shake' : ''}`}
        style={{
          background: isShaking
            ? 'radial-gradient(400px circle at 50% 45%, rgba(244, 63, 94, 0.85), rgba(244, 63, 94, 0.25) 60%, rgba(255,255,255,0.1))'
            : spotVisible
              ? `radial-gradient(380px circle at ${spotX}% ${spotY}%, rgba(var(--accent-cyan), 0.72), rgba(var(--accent-purple), 0.36) 42%, rgba(255,255,255,0.1) 80%)`
              : 'rgba(255,255,255,0.1)'
        }}
      >
        <div className="w-full glass-panel rounded-[calc(1.5rem-1.5px)] p-6 sm:p-8 relative overflow-hidden space-y-6 bg-[#0a0f22]/95">
          {/* Inner Focus Spotlight Aura */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none transition-all duration-500"
            style={{
              opacity: spotVisible ? 1 : 0.35,
              background: `radial-gradient(310px circle at ${spotX}% ${spotY}%, rgba(var(--accent-cyan), 0.14), rgba(var(--accent-purple), 0.06) 45%, transparent 72%)`
            }}
          />

          {/* Title / Logo */}
          <div className="relative z-10 text-center space-y-2">
            <img src="/logo.png" alt="SyncStream" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-2xl border border-white/20 mx-auto mb-2" />
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-outfit">
              Create Free Account
            </h2>
            <p className="text-xs text-gray-500">
              Join SyncStream to sync media playback with friends.
            </p>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="relative z-10 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-3.5 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400">Username</label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'username' ? 'text-accentCyan drop-shadow-[0_0_6px_rgba(var(--accent-cyan),0.8)]' : 'text-gray-500'}`} />
                <input
                  type="text"
                  required
                  value={username}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="party_host"
                  className="w-full bg-darkBg/90 border border-darkBorder rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-2 focus:ring-accentCyan/25 focus:shadow-[0_0_18px_rgba(var(--accent-cyan),0.2)] transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400">Mobile Number</label>
              <div className="relative">
                <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'phone' ? 'text-accentCyan drop-shadow-[0_0_6px_rgba(var(--accent-cyan),0.8)]' : 'text-gray-500'}`} />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 555-1234"
                  className="w-full bg-darkBg/90 border border-darkBorder rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-2 focus:ring-accentCyan/25 focus:shadow-[0_0_18px_rgba(var(--accent-cyan),0.2)] transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            {/* Password + Animated Segmented Neon Strength Pulse Bar */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400">Password</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-accentCyan drop-shadow-[0_0_6px_rgba(var(--accent-cyan),0.8)]' : 'text-gray-500'}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-darkBg/90 border border-darkBorder rounded-xl pl-11 pr-12 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-2 focus:ring-accentCyan/25 focus:shadow-[0_0_18px_rgba(var(--accent-cyan),0.2)] transition-all placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Segmented Neon Strength Pulse Bar */}
              {password.length > 0 && (
                <div className="space-y-1.5 pt-0.5 animate-fade-in">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((seg) => {
                      const filled = passwordScore >= seg;
                      return (
                        <div
                          key={seg}
                          className="h-1.5 rounded-full bg-white/10 overflow-hidden"
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-400 ${
                              filled ? `${strengthMeta.color} w-full ${seg === passwordScore ? 'animate-pulse' : ''}` : 'w-0'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className={strengthMeta.text}>{strengthMeta.label}</span>
                    <span className="text-gray-500 font-mono">{password.length} chars</span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold hover:opacity-95 transition shadow-lg shadow-accentPurple/25 text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 mt-2 btn-glow-purple cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register Account
                </>
              )}
            </button>
          </form>

          {/* Redirect */}
          <p className="relative z-10 text-xs text-gray-500 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-accentCyan hover:underline font-bold">
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
