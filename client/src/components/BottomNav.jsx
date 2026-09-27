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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 border-t border-white/[0.12] px-1 py-1 bg-[#090d1e]/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#090d1e]/90 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.7)] select-none">
      <div className="flex items-center justify-between w-full max-w-md mx-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1 px-0.5 rounded-xl transition-all duration-300 active:scale-95 ${
                active ? 'text-accentCyan' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${active ? 'bg-accentCyan/20 shadow-[0_0_10px_rgba(99,210,255,0.4)]' : ''}`}>
                <Icon className={`w-4 h-4 xs:w-4.5 xs:h-4.5 ${active ? 'fill-current opacity-40 stroke-[2.5] text-accentCyan' : 'stroke-2'}`} />
              </div>
              <span className={`text-[9px] xs:text-[10px] font-semibold tracking-tight truncate max-w-full text-center ${active ? 'font-black text-accentCyan' : ''}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
