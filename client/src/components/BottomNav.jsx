import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Tv, Search, Music, Heart, User } from 'lucide-react';

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Tv, iconClass: 'text-sky-400 fill-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' },
    { path: '/search', label: 'Search', icon: Search, iconClass: 'text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]' },
    { path: '/music', label: 'Music', icon: Music, iconClass: 'text-pink-500 fill-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.7)]' },
    { path: '/watchlist', label: 'Watchlist', icon: Heart, iconClass: 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]' },
    { path: user ? '/profile' : '/login', label: user ? 'Profile' : 'Sign In', icon: User, iconClass: 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]' },
  ];

  const containerRef = useRef(null);
  const itemRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });

  useEffect(() => {
    const activeLink = navLinks.find((l) => isActive(l.path));
    const updateIndicator = () => {
      if (!activeLink) {
        setIndicator((prev) => ({ ...prev, visible: false }));
        return;
      }
      const el = itemRefs.current[activeLink.path];
      if (el) {
        setIndicator({
          left: el.offsetLeft,
          width: el.offsetWidth,
          visible: true
        });
      }
    };

    updateIndicator();
    const raf = requestAnimationFrame(updateIndicator);
    window.addEventListener('resize', updateIndicator);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [location.pathname, user]);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 border-t border-white/[0.12] px-1.5 py-1 bg-[#090d1e]/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#090d1e]/90 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.7)] select-none">
      <div ref={containerRef} className="relative flex items-center justify-between w-full max-w-lg mx-auto">
        {/* Sliding Gooey Neon Active Pill & Top Notch */}
        {indicator.visible && (
          <div
            aria-hidden="true"
            className="absolute inset-y-0.5 rounded-2xl bg-gradient-to-b from-accentCyan/20 via-accentPurple/15 to-transparent border border-accentCyan/35 shadow-[0_0_18px_rgba(var(--accent-cyan),0.28)] pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex justify-center"
            style={{
              left: `${indicator.left}px`,
              width: `${indicator.width}px`
            }}
          >
            <span className="w-7 xs:w-8 h-[3px] -mt-[1px] rounded-full bg-gradient-to-r from-accentCyan via-accentPurple to-accentPink shadow-[0_0_12px_rgba(var(--accent-cyan),0.95)]" />
          </div>
        )}

        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              ref={(el) => { itemRefs.current[link.path] = el; }}
              to={link.path}
              className={`relative z-10 flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-2xl transition-colors duration-300 active:scale-95 ${
                active ? 'text-accentCyan' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all duration-300 ${active ? 'animate-nav-bounce' : ''}`}>
                <Icon className={`w-4 h-4 xs:w-[18px] xs:h-[18px] transition-transform duration-200 ${active ? 'scale-110 drop-shadow-[0_0_10px_currentColor]' : ''} ${link.iconClass}`} />
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
