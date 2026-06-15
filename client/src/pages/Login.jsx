import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, Mail, Lock, LogIn, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-accentPurple/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel border border-darkBorder rounded-3xl p-8 shadow-2xl relative space-y-6 animate-fade-in">
        
        {/* Title / Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-gradient-to-tr from-accentPurple to-accentCyan p-3 rounded-2xl text-white shadow-lg shadow-accentPurple/20 mb-2">
            <Tv className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-outfit">
            Sign In to SyncStream
          </h2>
          <p className="text-xs text-gray-500">
            Access watch parties and save tracking watchlist profiles.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-3.5 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-darkBg border border-darkBorder rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full bg-darkBg border border-darkBorder rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold hover:opacity-90 transition shadow-lg shadow-accentPurple/25 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 mt-2 btn-glow-purple"
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
        <p className="text-xs text-gray-500 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-accentCyan hover:underline font-bold">
            Register for Free
          </Link>
        </p>

      </div>
    </div>
  );
}
