import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, Search, Music, Heart, User, Users, LogOut, X, Zap, ChevronDown, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Morphing search bar states
  const [morphOpen, setMorphOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [morphHint, setMorphHint] = useState('Stranger Things...');
  const morphInputRef = useRef(null);
  const morphFormRef = useRef(null);

  useEffect(() => {
    if (!morphOpen || quickQuery) return;
    const phrases = ['Stranger Things...', 'Demon Slayer...', 'Arijit Singh...', 'Solo Leveling...'];
    let pIdx = 0;
    let cIdx = 0;
    let deleting = false;
    let timer;
    const step = () => {
      const target = phrases[pIdx];
      if (!deleting) {
        cIdx += 1;
        setMorphHint(target.slice(0, cIdx));
        if (cIdx >= target.length) {
          deleting = true;
          timer = setTimeout(step, 1200);
          return;
        }
        timer = setTimeout(step, 70);
      } else {
        cIdx -= 1;
        setMorphHint(target.slice(0, Math.max(0, cIdx)));
        if (cIdx <= 0) {
          deleting = false;
          pIdx = (pIdx + 1) % phrases.length;
          timer = setTimeout(step, 260);
          return;
        }
        timer = setTimeout(step, 35);
      }
    };
    timer = setTimeout(step, 180);
    return () => clearTimeout(timer);
  }, [morphOpen, quickQuery]);

  useEffect(() => {
    if (!morphOpen) return;
    const handleOutside = (e) => {
      if (morphFormRef.current && !morphFormRef.current.contains(e.target) && !quickQuery) {
        setMorphOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [morphOpen, quickQuery]);

  useEffect(() => {
    const updateScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (y / docHeight) * 100)));
      } else {
        setScrollProgress(0);
      }
    };

    const openPartyHandler = () => setShowJoinModal(true);

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    window.addEventListener('open-join-party', openPartyHandler);

    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      window.removeEventListener('open-join-party', openPartyHandler);
    };
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    window.dispatchEvent(new CustomEvent('open-logout-confirm'));
    setDropdownOpen(false);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (joinCode.trim()) {
      setShowJoinModal(false);
      navigate(`/room/${joinCode.trim()}`);
      setJoinCode('');
    }
  };

  const handleMorphSearchSubmit = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickQuery.trim())}`);
      setMorphOpen(false);
      setQuickQuery('');
    } else {
      window.dispatchEvent(new CustomEvent('open-spotlight-search'));
    }
  };

  const openSpotlight = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    window.dispatchEvent(new CustomEvent('open-spotlight-search', {
      detail: { query: quickQuery }
    }));
  };

  const navLinks = [
    { path: '/', label: 'Discovery', icon: Tv, color: 'text-sky-400 fill-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' },
    { path: '/search', label: 'Search', icon: Search, color: 'text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' },
    { path: '/music', label: 'Music', icon: Music, color: 'text-pink-500 fill-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]' },
    { path: '/watchlist', label: 'Watchlist', icon: Heart, color: 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' },
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-[#060916]/90 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.55)]'
            : 'bg-[#060916]/55 hover:bg-[#080d20]/85 backdrop-blur-xl border-white/[0.06] hover:border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2.5 xs:px-3.5 sm:px-5 md:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2.5">

          {/* ── Brand Logo & Back Navigation ── */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
            {location.pathname !== '/' && (
              <button
                onClick={() => {
                  if (window.history.state && window.history.state.idx > 0) navigate(-1);
                  else navigate('/');
                }}
                className="p-1.5 sm:p-2 rounded-xl border border-accentCyan/50 bg-[#0d1428] text-accentCyan hover:bg-accentCyan hover:text-black shadow-[0_0_10px_rgba(var(--accent-cyan),0.25)] transition-all duration-200 active:scale-95 cursor-pointer group flex items-center justify-center shrink-0"
                title="Go Back"
                aria-label="Go Back"
              >
                <ArrowLeft className="w-4 h-4 text-accentCyan group-hover:text-black transition-colors" strokeWidth={2.5} />
              </button>
            )}

            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-accentPurple to-accentCyan blur-md opacity-55 group-hover:opacity-100 transition-opacity duration-300" />
                <img
                  src="/logo.png?v=2"
                  alt="SyncStream"
                  className="relative w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-xl object-cover shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className={`${location.pathname !== '/' ? 'hidden xs:inline' : 'inline'} font-josefin font-extrabold text-sm sm:text-base lg:text-lg tracking-wide text-gradient-aurora uppercase`}>
                SyncStream
              </span>
            </Link>
          </div>

          {/* ── Tablet & Desktop Nav (md+) with Frosted Glass Hover Pill ── */}
          <div className="hidden md:flex items-center gap-0.5 lg:gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group nav-link relative flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-xl font-manrope tracking-wider uppercase text-[11px] lg:text-xs font-bold border transition-all duration-200 ${
                    active
                      ? 'text-white bg-white/[0.11] border-white/20 backdrop-blur-md shadow-[0_4px_18px_rgba(var(--accent-cyan),0.18)]'
                      : 'text-gray-300 border-transparent hover:text-white hover:bg-white/[0.08] hover:border-white/15 hover:backdrop-blur-md hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 transition-transform duration-200 group-hover:scale-110 ${active ? (link.color || 'text-accentCyan') : 'text-gray-400 group-hover:text-accentCyan'}`} />
                  <span>{link.label}</span>
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-accentCyan shadow-[0_0_8px_rgba(99,210,255,0.9)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

            {/* Morphing Search Icon Capsule (All Screens: Mobile, Tablet & Desktop) */}
            <form
              ref={morphFormRef}
              onSubmit={handleMorphSearchSubmit}
              onMouseEnter={() => setMorphOpen(true)}
              onMouseLeave={() => {
                if (document.activeElement !== morphInputRef.current && !quickQuery) {
                  setMorphOpen(false);
                }
              }}
              className={`flex items-center rounded-full border transition-all duration-300 overflow-hidden shrink-0 ${
                morphOpen || quickQuery
                  ? 'max-sm:absolute max-sm:inset-x-2.5 max-sm:top-2 max-sm:h-10 max-sm:z-40 sm:w-44 md:w-48 lg:w-64 px-3 py-1.5 border-accentCyan bg-[#0c1224] shadow-[0_0_20px_rgba(var(--accent-cyan),0.32)]'
                  : 'w-8 h-8 sm:w-9 sm:h-9 px-0 justify-center border-white/15 bg-white/[0.06] hover:bg-white/[0.12] hover:border-accentCyan/70 cursor-pointer'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  if (morphOpen && quickQuery.trim()) {
                    handleMorphSearchSubmit({ preventDefault: () => {} });
                  } else {
                    setMorphOpen(true);
                    setTimeout(() => morphInputRef.current?.focus(), 60);
                  }
                }}
                className={`shrink-0 flex items-center justify-center text-accentCyan transition-transform duration-300 ${
                  morphOpen || quickQuery ? 'mr-2' : 'w-full h-full'
                }`}
                title="Quick Search (Ctrl+K)"
                aria-label="Expand Search Bar"
              >
                <Search className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
              </button>

              <div className={`relative flex-1 min-w-0 flex items-center transition-all duration-300 ${
                morphOpen || quickQuery ? 'w-full opacity-100' : 'w-0 opacity-0 pointer-events-none'
              }`}>
                <input
                  ref={morphInputRef}
                  type="text"
                  value={quickQuery}
                  onFocus={() => setMorphOpen(true)}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setMorphOpen(false);
                      morphInputRef.current?.blur();
                    }
                  }}
                  placeholder=""
                  aria-label="Quick search"
                  className="relative z-10 w-full bg-transparent text-xs text-white focus:outline-none py-0.5"
                />
                {!quickQuery && (morphOpen) && (
                  <div className="absolute inset-0 flex items-center pointer-events-none text-xs text-gray-400 truncate pr-1">
                    <span className="truncate">{morphHint ? `Search ${morphHint}` : 'Quick search...'}</span>
                    <span className="inline-block w-[1.5px] h-3.5 bg-accentCyan ml-0.5 animate-cursor-blink shrink-0" />
                  </div>
                )}
              </div>

              {(morphOpen || quickQuery) && (
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      setMorphOpen(false);
                      openSpotlight(e);
                    }}
                    className="px-1.5 py-0.5 rounded-md bg-accentCyan/15 hover:bg-accentCyan hover:text-black text-[9px] font-mono font-bold text-accentCyan transition border border-accentCyan/35 cursor-pointer"
                    title="Open Spotlight Modal (Ctrl+K)"
                  >
                    ⌘K
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickQuery('');
                      setMorphOpen(false);
                      morphInputRef.current?.blur();
                    }}
                    className="p-0.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Close Search"
                    aria-label="Close Search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </form>

            {/* Join Party (Sweep-Shimmer CTA) */}
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-shimmer flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all duration-200
                         border-accentPurple/45 text-purple-200 bg-accentPurple/[0.14]
                         hover:bg-accentPurple/[0.26] hover:border-accentPurple/80 hover:text-white active:scale-95 shrink-0 cursor-pointer"
              title="Join Watch Party by Code"
            >
              <Users className="w-3.5 h-3.5 text-purple-400 fill-purple-400 shrink-0" />
              <span className="hidden lg:inline">Join </span><span>Party</span>
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-1.5 p-0.5 pr-2 sm:p-1 sm:pr-2.5 rounded-full border transition-all duration-200 cursor-pointer ${
                    dropdownOpen
                      ? 'border-accentPurple bg-accentPurple/20 shadow-[0_0_14px_rgba(149,100,255,0.35)]'
                      : 'border-white/15 hover:border-accentPurple/60 bg-[#0d1428] hover:bg-[#131c38]'
                  }`}
                  aria-expanded={dropdownOpen}
                  aria-label="User profile menu"
                >
                  <div className="relative">
                    <img
                      src={user.avatar_url || 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f60e.png'}
                      alt={user.username}
                      referrerPolicy="no-referrer"
                      className={`w-7 h-7 rounded-full bg-gradient-to-br from-accentCyan/15 via-darkBg to-accentPurple/20 ring-1 ring-white/20 shadow-md ${
                        user.avatar_url?.includes('emoji-datasource-apple') ? 'object-contain p-1' : 'object-cover'
                      }`}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#0d1428]" />
                  </div>
                  <span className="hidden lg:inline text-xs font-bold text-white max-w-[100px] truncate">
                    {user.username}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180 text-accentPurple' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <>
                    {/* Click-away backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />

                    {/* Solid High-Contrast User Menu */}
                    <div className="absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-1.5rem)] rounded-2xl p-2 z-50 animate-scale-in shadow-[0_20px_50px_rgba(0,0,0,0.95)] border-2 border-slate-600 bg-[#0c1224]">
                      {/* User Info Header Card */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/5 mb-2">
                        <img
                          src={user.avatar_url || 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f60e.png'}
                          alt={user.username}
                          referrerPolicy="no-referrer"
                          className={`w-10 h-10 rounded-full bg-gradient-to-br from-accentCyan/15 via-darkBg to-accentPurple/20 border border-accentPurple/40 shadow-inner ${
                            user.avatar_url?.includes('emoji-datasource-apple') ? 'object-contain p-1.5' : 'object-cover'
                          }`}
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
                            <User className="w-4 h-4 text-purple-400 fill-purple-400" />
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
                          <LogOut className="w-4 h-4 fill-red-400/40" />
                        </div>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-3.5 py-2 text-sm font-semibold text-gray-400 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary btn-shimmer text-[11px] xs:text-xs sm:text-sm !py-1.5 !px-2.5 xs:!px-3 sm:!py-2 sm:!px-4 !text-white shrink-0"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Top Scroll Progress Neon Thread ── */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.04] pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-accentCyan via-accentPurple to-accentPink shadow-[0_0_10px_rgba(var(--accent-cyan),0.85)] transition-[width] duration-75"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </nav>

      {/* ── Join Room Modal ── */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={() => setShowJoinModal(false)}
          />
          <div className="relative w-full max-w-sm glass-panel rounded-3xl p-5 sm:p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-slide-up border border-white/[0.08]">
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
                  className="btn-primary btn-shimmer flex-[2] !py-3 !text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Zap className="w-4 h-4 inline mr-1.5 text-yellow-400 fill-yellow-400" />
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
