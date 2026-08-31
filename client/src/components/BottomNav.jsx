import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, Search, Music, Heart, User } from 'lucide-react';

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Tv },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/music', label: 'Music', icon: Music },
    { path: '/watchlist', label: 'Watchlist', icon: Heart },
    { path: user ? '/profile' : '/login', label: user ? 'Profile' : 'Sign In', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] px-1 py-1 bg-darkBg/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-darkBg/80 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all duration-300 active:scale-95 ${
                active ? 'text-accentCyan' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${active ? 'bg-accentCyan/15 shadow-[0_0_10px_rgba(99,210,255,0.3)]' : ''}`}>
                <Icon className={`w-4.5 h-4.5 ${active ? 'fill-current opacity-30 stroke-2 text-accentCyan' : 'stroke-2'}`} />
              </div>
              <span className={`text-[9.5px] font-semibold tracking-tight ${active ? 'font-black text-accentCyan' : ''}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
