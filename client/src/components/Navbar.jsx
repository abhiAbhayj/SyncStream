import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, Search, Heart, User, LogOut, Menu, X, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-darkBorder px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-tr from-accentPurple to-accentCyan p-2 rounded-lg text-white shadow-md shadow-accentPurple/25">
            <Tv className="w-6 h-6 animate-pulse-glow" />
          </div>
          <span className="font-extrabold text-2xl tracking-wider bg-gradient-to-r from-white via-accentPurple to-accentCyan bg-clip-text text-transparent title-glow font-outfit">
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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-accentCyan bg-white/5 border border-white/10 shadow-lg shadow-accentCyan/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
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
    </nav>
  );
}
