import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, Search, Music, Heart, User, Users, LogOut, X, Zap, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    const openPartyHandler = () => setShowJoinModal(true);
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('open-join-party', openPartyHandler);
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('open-join-party', openPartyHandler);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      setShowJoinModal(false);
      navigate(`/room/${joinCode.trim()}`);
      setJoinCode('');
    }
  };

  const navLinks = [
    { path: '/', label: 'Discovery', icon: Tv },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/music', label: 'Music', icon: Music },
    { path: '/watchlist', label: 'Watchlist', icon: Heart },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[rgba(5,5,12,0.85)] backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-accentPurple to-accentCyan blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              <img
                src="/logo.png"
                alt="SyncStream"
                className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="font-orbitron font-extrabold text-base sm:text-xl tracking-widest text-gradient-aurora uppercase">
              SyncStream
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 font-rajdhani tracking-wide uppercase text-[13px] ${
                    active
                      ? 'text-white bg-white/[0.07]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-accentCyan' : ''}`} />
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accentCyan shadow-[0_0_6px_rgba(99,210,255,0.8)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5 sm:gap-3">

            {/* Join Party */}
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-300
                         border-accentPurple/40 text-accentPurple bg-accentPurple/[0.10]
                         hover:bg-accentPurple/[0.22] hover:border-accentPurple/60 hover:shadow-[0_0_20px_rgba(149,100,255,0.25)] active:scale-95"
              title="Join Watch Party by Code"
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accentPurple" />
              <span>Join Party</span>
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 p-1 pr-2.5 sm:pr-3 rounded-full border transition-all duration-300 ${
                    dropdownOpen
                      ? 'border-accentPurple/80 bg-accentPurple/15 shadow-[0_0_15px_rgba(149,100,255,0.35)] ring-1 ring-accentPurple/50'
                      : 'border-white/10 hover:border-accentPurple/50 bg-darkCard/80 hover:bg-darkCard'
                  }`}
                  aria-expanded={dropdownOpen}
                  aria-label="User profile menu"
                >
                  <div className="relative">
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-darkBg ring-1 ring-white/20 shadow-md"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-darkBg" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white max-w-[90px] sm:max-w-[120px] truncate">
                    {user.username}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${
                      dropdownOpen ? 'rotate-180 text-accentPurple' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <>
                    {/* Click-away backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />

                    {/* Prominent High-Contrast Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2.5 w-64 rounded-2xl p-2.5 z-50 animate-scale-in shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_25px_rgba(0,0,0,0.8)] border border-white/20 bg-[#0e1222] bg-opacity-98 backdrop-blur-2xl ring-1 ring-white/10">
                      {/* User Info Header Card */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/5 mb-2">
                        <img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover bg-darkBg border border-accentPurple/40 shadow-inner"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-accentCyan">Signed in as</p>
                          <p className="text-sm font-extrabold text-white truncate">{user.username}</p>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-1">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-accentPurple/15 text-accentPurple flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User className="w-4 h-4" />
                          </div>
                          <span>My Profile &amp; Themes</span>
                        </Link>
                      </div>

                      <div className="h-px bg-white/10 my-2 mx-1" />

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-200 hover:bg-red-500/20 transition text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm !py-2 !px-4 !text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Join Room Modal ── */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={() => setShowJoinModal(false)}
          />
          <div className="relative w-full max-w-sm glass-panel rounded-3xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-slide-up border border-white/[0.08]">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/10 text-gray-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-7">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-accentPurple to-accentCyan blur-xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-accentPurple/20 to-accentCyan/20 border border-accentPurple/30 flex items-center justify-center">
                  <Users className="w-7 h-7 text-accentPurple" />
                </div>
              </div>
              <h3 className="text-2xl font-display font-extrabold text-white">Join Watch Party</h3>
              <p className="text-sm text-gray-400 mt-1">Enter a room code to sync up with friends</p>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="e.g. 8f7a9b"
                className="input-field text-center text-xl font-bold tracking-[0.25em]"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="btn-ghost flex-1 !py-3 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="btn-primary flex-[2] !py-3 !text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Zap className="w-4 h-4 inline mr-1.5" />
                  Enter Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
