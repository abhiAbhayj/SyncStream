import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Loader2, KeyRound } from 'lucide-react';
import axios from 'axios';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || '';
      await axios.post(`${API_URL}/api/auth/reset-password`, { token, newPassword });
      navigate('/login', { state: { message: 'Password has been successfully reset. You may now log in.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may be expired or invalid.');
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
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <KeyRound className="w-8 h-8 text-accentCyan" />
            </div>
            <h1 className="text-3xl font-extrabold text-white font-outfit mb-2">New Password</h1>
            <p className="text-gray-400 text-center text-sm">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm font-medium animate-fade-in text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-darkBg border border-darkBorder rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition placeholder:text-gray-600"
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-darkBg border border-darkBorder rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition placeholder:text-gray-600"
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 hover:scale-[1.02] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 btn-glow-purple"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
