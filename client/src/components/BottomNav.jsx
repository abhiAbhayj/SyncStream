import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, Search, Heart, User } from 'lucide-react';

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Tv },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/watchlist', label: 'Watchlist', icon: Heart },
    { path: user ? '/profile' : '/login', label: user ? 'Profile' : 'Sign In', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-darkBorder/60 px-2 py-2 bg-darkBg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-darkBg/60 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                active ? 'text-accentCyan scale-105' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-accentCyan/10 shadow-lg shadow-accentCyan/10' : ''}`}>
                <Icon className={`w-5 h-5 ${active ? 'fill-current opacity-20 stroke-2 text-accentCyan' : 'stroke-2'}`} />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide ${active ? 'font-extrabold text-accentCyan' : ''}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
