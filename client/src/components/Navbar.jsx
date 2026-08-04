import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, Search, Heart, User, Users, LogOut, Menu, X, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Join Room Modal State
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Discovery', icon: Tv },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/watchlist', label: 'My Watchlist', icon: Heart },
  ];

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      setShowJoinModal(false);
      navigate(`/room/${joinCode.trim()}`);
      setJoinCode('');
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <nav className="glass-panel border border-white/10 rounded-full px-4 py-2.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-2xl bg-darkCard/70">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group ml-2">
            <div className="bg-gradient-to-tr from-accentPrimary to-accentSecondary p-2 rounded-full text-white shadow-lg shadow-accentPrimary/20">
              <Tv className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-wider text-gradient font-outfit drop-shadow-md">
              SyncStream
            </span>
          </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-accentPrimary active drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          
          {/* Join Party Button */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-accentSecondary border border-accentSecondary/30 bg-accentSecondary/10 hover:bg-accentSecondary/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)]"
          >
            <Users className="w-4 h-4" />
            Join Party
          </button>
        </div>

        {/* Profile / Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-darkBorder hover:border-accentCyan transition-all duration-300 bg-black/20"
              >
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover bg-darkCard"
                />
                <span className="text-sm font-medium pr-2 hidden lg:inline">{user.username}</span>
              </button>

              {dropdownOpen && (
                <>
                  {/* Overlay background to dismiss */}
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-4 w-48 rounded-2xl border border-white/10 bg-darkCard/90 backdrop-blur-xl shadow-2xl p-2 z-20 animate-fade-in">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
                    >
                      <User className="w-4 h-4 text-accentPrimary" />
                      My Profile
                    </Link>
                    <hr className="border-white/5 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-accentPrimary to-accentSecondary rounded-full hover:opacity-90 shadow-lg shadow-accentPrimary/25 transition btn-glow-crimson"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>

      {/* Join Room Modal Overlay */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setShowJoinModal(false)}
          ></div>
          
          {/* Modal Panel */}
          <div className="relative w-full max-w-sm glass-panel border border-white/10 rounded-3xl p-6 shadow-2xl animate-slide-up bg-[#0a0a0c]/90">
            <button 
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-accentPrimary/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-accentPrimary/30 shadow-[0_0_15px_rgba(225,29,72,0.3)]">
                <Users className="w-6 h-6 text-accentPrimary" />
              </div>
              <h3 className="text-xl font-extrabold text-white font-outfit">Join Watch Party</h3>
              <p className="text-xs text-gray-400 mt-1">Enter a room code to sync up.</p>
            </div>
            
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="e.g. 8f7a9b"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-bold text-white focus:outline-none focus:border-accentPrimary focus:ring-1 focus:ring-accentPrimary transition tracking-widest placeholder:text-gray-600"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="w-1/3 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-400 font-bold hover:text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accentPrimary to-accentSecondary text-white font-extrabold shadow-lg shadow-accentPrimary/25 hover:opacity-90 hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100 btn-glow-crimson"
                >
                  Enter Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
