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
    <nav className="sticky top-0 z-50 glass-panel-glow border-b border-darkBorder/80 px-4 py-3.5 md:px-8 shadow-2xl backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-gradient-to-tr from-accentPurple to-accentCyan p-2.5 rounded-xl text-white shadow-lg shadow-accentPurple/30 group-hover:scale-110 transition-transform duration-300">
            <Tv className="w-6 h-6 animate-pulse-glow" />
          </div>
          <span className="font-extrabold text-2xl tracking-wider text-gradient-animated font-syne drop-shadow-md">
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
                className={`nav-link flex items-center gap-2 px-3.5 py-2 text-sm font-bold font-outfit transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-accentCyan active drop-shadow-[0_0_10px_rgba(0,240,255,0.9)]'
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
            className="flex items-center gap-2 px-4.5 py-2 rounded-xl text-sm font-extrabold font-outfit text-accentPurple border border-accentPurple/40 bg-accentPurple/10 hover:bg-accentPurple/25 hover:border-accentPurple hover:scale-105 transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)]"
          >
            <Users className="w-4 h-4 animate-pulse" />
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
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-darkBorder bg-darkCard shadow-2xl p-2 z-20 animate-fade-in">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition"
                    >
                      <User className="w-4 h-4 text-accentPurple" />
                      My Profile
                    </Link>
                    <hr className="border-darkBorder my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition text-left"
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
                className="px-4 py-2 text-sm font-semibold text-black bg-gradient-to-r from-accentCyan to-accentPurple rounded-lg hover:opacity-90 shadow-md shadow-accentPurple/25 transition btn-glow-purple"
              >
                Register
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Join Room Modal Overlay */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setShowJoinModal(false)}
          ></div>
          
          {/* Modal Panel */}
          <div className="relative w-full max-w-sm glass-panel border border-darkBorder rounded-3xl p-6 shadow-2xl animate-slide-up bg-darkCard/90">
            <button 
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-accentPurple/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-accentPurple/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Users className="w-6 h-6 text-accentPurple" />
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
                className="w-full bg-darkBg border border-darkBorder rounded-xl px-4 py-3 text-center text-lg font-bold text-white focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan transition tracking-widest placeholder:text-gray-600"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="w-1/3 py-3 rounded-xl border border-darkBorder bg-darkCard text-gray-400 font-bold hover:text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100 btn-glow-purple"
                >
                  Enter Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
