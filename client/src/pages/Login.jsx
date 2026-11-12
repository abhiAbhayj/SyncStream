import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, Phone, Lock, LogIn, Loader2, Eye, EyeOff, Check } from 'lucide-react';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const infoMessage = location.state?.message;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [cardSpot, setCardSpot] = useState({ x: 50, y: 45, active: false });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    const res = await login(phoneNumber, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  const spotY = focusedField === 'phone' ? 44 : focusedField === 'password' ? 68 : cardSpot.y;
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
        className="w-full p-[1.5px] rounded-3xl relative shadow-2xl animate-fade-in transition-all duration-300"
        style={{
          background: spotVisible
            ? `radial-gradient(360px circle at ${spotX}% ${spotY}%, rgba(var(--accent-cyan), 0.72), rgba(var(--accent-purple), 0.36) 42%, rgba(255,255,255,0.1) 80%)`
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
              background: `radial-gradient(300px circle at ${spotX}% ${spotY}%, rgba(var(--accent-cyan), 0.14), rgba(var(--accent-purple), 0.06) 45%, transparent 72%)`
            }}
          />

          {/* Title / Logo */}
          <div className="relative z-10 text-center space-y-2">
            <img src="/logo.png" alt="SyncStream" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-2xl border border-white/20 mx-auto mb-2" />
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-outfit">
              Sign In to SyncStream
            </h2>
            <p className="text-xs text-gray-500">
              Access watch parties and save tracking watchlist profiles.
            </p>
          </div>

          {/* Notification Messages */}
          {infoMessage && (
            <div className="relative z-10 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold p-3.5 rounded-xl text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="relative z-10 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-3.5 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
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

            {/* Password */}
            <div className="space-y-1.5">
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
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
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
              <div className="flex justify-end pt-1">
                <Link to="/forgot-password" className="text-[11px] text-accentPurple hover:text-accentCyan transition-colors font-semibold">
                  Forgot Password?
                </Link>
              </div>
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
                  <LogIn className="w-4 h-4 fill-current" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Redirect */}
          <p className="relative z-10 text-xs text-gray-500 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-accentCyan hover:underline font-bold">
              Register for Free
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
