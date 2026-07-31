import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Key } from 'lucide-react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || '';
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accentCyan to-accentPurple"></div>
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Key className="w-8 h-8 text-accentCyan" />
            </div>
            <h1 className="text-3xl font-extrabold text-white font-outfit mb-2">Reset Password</h1>
            <p className="text-gray-400 text-center text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-6 rounded-2xl mb-6 text-center animate-fade-in">
              <p className="font-semibold mb-2">Check your email!</p>
              <p className="text-sm">A password reset link has been sent to {email}</p>
              <Link 
                to="/login"
                className="inline-block mt-4 text-white bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl transition"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm font-medium animate-fade-in text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-darkBg border border-darkBorder rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition placeholder:text-gray-600"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 hover:scale-[1.02] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 btn-glow-purple"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-8 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
