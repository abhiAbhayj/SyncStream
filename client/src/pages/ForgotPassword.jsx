import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Key, CheckCircle2, Lock } from 'lucide-react';
import axios from 'axios';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // Steps: 1 = Email, 2 = OTP, 3 = New Password
  const [step, setStep] = useState(1);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureToken, setSecureToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const API_URL = import.meta.env.VITE_API_BASE_URL || '';

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Please enter your email address.');

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) return setError('Please enter a valid 6-digit OTP.');

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
      setSecureToken(res.data.secureResetToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters long.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, { secureResetToken: secureToken, newPassword });
      navigate('/login', { state: { message: 'Password has been successfully reset. You may now log in.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Your session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-500">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accentCyan to-accentPurple"></div>
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              {step === 1 && <Mail className="w-8 h-8 text-accentCyan animate-pulse" />}
              {step === 2 && <Key className="w-8 h-8 text-accentCyan animate-pulse" />}
              {step === 3 && <Lock className="w-8 h-8 text-accentCyan animate-pulse" />}
            </div>
            <h1 className="text-3xl font-extrabold text-white font-outfit mb-2">
              {step === 1 ? 'Reset Password' : step === 2 ? 'Enter Code' : 'New Password'}
            </h1>
            <p className="text-gray-400 text-center text-sm">
              {step === 1 && "Enter your email address and we'll send you a 6-digit code."}
              {step === 2 && `We've sent a 6-digit code to ${email}`}
              {step === 3 && "Please enter your new password below."}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm font-medium animate-fade-in text-center mb-6">
              {error}
            </div>
          )}

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <form onSubmit={handleSendEmail} className="space-y-6 animate-fade-in">
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
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 hover:scale-[1.02] transition flex items-center justify-center gap-2 disabled:opacity-50 btn-glow-purple"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Code'}
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 ml-1 text-center">6-Digit Code</label>
                <div className="relative flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-48 bg-darkBg border border-darkBorder rounded-2xl text-center text-3xl font-bold py-4 text-white focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition tracking-widest placeholder:text-gray-700"
                    placeholder="------"
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 hover:scale-[1.02] transition flex items-center justify-center gap-2 disabled:opacity-50 btn-glow-purple"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
              </button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6 animate-fade-in">
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
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 hover:scale-[1.02] transition flex items-center justify-center gap-2 disabled:opacity-50 btn-glow-purple"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
