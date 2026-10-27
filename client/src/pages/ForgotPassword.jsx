import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Loader2, Key, Check, Lock, Eye, EyeOff, Copy, ArrowLeft, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // Steps: 1 = Enter Identifier (Phone/Username), 2 = Enter OTP, 3 = New Password
  const [step, setStep] = useState(1);
  
  const [identifier, setIdentifier] = useState('');
  const [matchedPhone, setMatchedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureToken, setSecureToken] = useState('');
  const [displayedMockOtp, setDisplayedMockOtp] = useState(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getApiUrl = (endpoint) => {
    const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
    return `${base}${endpoint}`;
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    const cleanId = identifier.trim();
    if (!cleanId) return setError('Please enter your mobile number or username.');

    setLoading(true);
    try {
      const response = await axios.post(getApiUrl('/api/auth/forgot-password'), {
        phone_number: cleanId,
        identifier: cleanId
      });

      setStep(2);
      if (response.data.phone_number) {
        setMatchedPhone(response.data.phone_number);
      }
      if (response.data.mockOtp) {
        setDisplayedMockOtp(response.data.mockOtp);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request. Please check your username/phone number.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOtp = () => {
    if (!displayedMockOtp) return;
    navigator.clipboard.writeText(displayedMockOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const handleAutoFillOtp = () => {
    if (!displayedMockOtp) return;
    setOtp(displayedMockOtp);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) return setError('Please enter a valid 6-digit OTP code.');

    setLoading(true);
    try {
      const res = await axios.post(getApiUrl('/api/auth/verify-otp'), {
        phone_number: matchedPhone || identifier.trim(),
        identifier: matchedPhone || identifier.trim(),
        otp: cleanOtp
      });
      setSecureToken(res.data.secureResetToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP code.');
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
      await axios.post(getApiUrl('/api/auth/reset-password'), {
        secureResetToken: secureToken,
        newPassword
      });
      navigate('/login', {
        state: { message: 'Password has been successfully updated. You may now log in.' }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Your reset session may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 max-w-md mx-auto space-y-4">
      <div className="w-full animate-slide-up">
        <div className="glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-all duration-500">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accentCyan to-accentPurple"></div>
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              {step === 1 && <Phone className="w-8 h-8 text-accentCyan animate-pulse" />}
              {step === 2 && <Key className="w-8 h-8 text-accentCyan animate-pulse" />}
              {step === 3 && <Lock className="w-8 h-8 text-accentCyan animate-pulse" />}
            </div>
            <h1 className="text-3xl font-extrabold text-white font-outfit mb-2">
              {step === 1 ? 'Reset Password' : step === 2 ? 'Enter Code' : 'New Password'}
            </h1>
            <p className="text-gray-400 text-center text-sm">
              {step === 1 && "Enter your mobile number or username and we'll generate your 6-digit reset code."}
              {step === 2 && `We've generated a 6-digit verification code for ${matchedPhone || identifier}`}
              {step === 3 && "Please choose a secure new password for your account."}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm font-medium animate-fade-in text-center mb-6">
              {error}
            </div>
          )}

          {/* STEP 1: MOBILE NUMBER OR USERNAME */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 ml-1">Mobile Number or Username</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-darkBg border border-darkBorder rounded-2xl pl-12 pr-4 py-3.5 text-white focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition placeholder:text-gray-600"
                    placeholder="e.g. 9876543210 or your_username"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 hover:scale-[1.02] transition flex items-center justify-center gap-2 disabled:opacity-50 btn-glow-purple"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
              {displayedMockOtp && (
                <div className="bg-accentPurple/15 border border-accentPurple/30 rounded-2xl p-4 text-center animate-fade-in space-y-3">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-accentCyan font-bold tracking-widest uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Your Verification OTP</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl font-extrabold text-white tracking-[0.25em] font-mono bg-black/40 px-4 py-1.5 rounded-xl border border-white/10">
                      {displayedMockOtp}
                    </span>
                    <button 
                      type="button" 
                      onClick={handleCopyOtp}
                      className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
                      title="Copy OTP"
                    >
                      {copiedOtp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="text-xs text-accentCyan hover:underline font-semibold"
                  >
                    Click to Auto-fill Code into Input
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 ml-1 text-center">Enter 6-Digit Code</label>
                <div className="relative flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-52 bg-darkBg border border-darkBorder rounded-2xl text-center text-3xl font-bold py-4 text-white focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition tracking-widest placeholder:text-gray-700 font-mono"
                    placeholder="------"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 hover:scale-[1.02] transition flex items-center justify-center gap-2 disabled:opacity-50 btn-glow-purple"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  className="text-xs text-gray-400 hover:text-white transition text-center py-1"
                >
                  Change phone number or username
                </button>
              </div>
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
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-darkBg border border-darkBorder rounded-2xl pl-12 pr-12 py-3.5 text-white focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition placeholder:text-gray-600"
                      placeholder="Enter new password (min. 6 characters)"
                      disabled={loading}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-darkBg border border-darkBorder rounded-2xl pl-12 pr-12 py-3.5 text-white focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition placeholder:text-gray-600"
                      placeholder="Confirm new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
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
              <span>Back to Login</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
