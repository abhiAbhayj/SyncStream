import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, HeartCrack, Film, Tv, Sparkles, BookOpen, Music2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'warning' | 'info'
  iconType = 'trash', // 'trash' | 'warning' | 'heart' | 'movie' | 'tv' | 'anime' | 'manga' | 'music'
  itemPreview = null, // { title, subtitle, image, badge, badgeColor }
  onConfirm,
  onCancel
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (iconType) {
      case 'heart':
        return <HeartCrack className="w-7 h-7 text-rose-400 stroke-[2.2]" />;
      case 'movie':
        return <Film className="w-7 h-7 text-cyan-400 stroke-[2.2]" />;
      case 'tv':
        return <Tv className="w-7 h-7 text-emerald-400 stroke-[2.2]" />;
      case 'anime':
        return <Sparkles className="w-7 h-7 text-purple-400 stroke-[2.2]" />;
      case 'manga':
        return <BookOpen className="w-7 h-7 text-pink-400 stroke-[2.2]" />;
      case 'music':
        return <Music2 className="w-7 h-7 text-accentCyan stroke-[2.2]" />;
      case 'warning':
        return <AlertTriangle className="w-7 h-7 text-amber-400 stroke-[2.2]" />;
      case 'trash':
      default:
        return <Trash2 className="w-7 h-7 text-rose-400 stroke-[2.2]" />;
    }
  };

  const getGradientBorder = () => {
    if (confirmVariant === 'warning') return 'from-amber-500 via-rose-500 to-amber-400';
    if (confirmVariant === 'info') return 'from-cyan-500 via-accentPurple to-accentCyan';
    return 'from-rose-500 via-accentPurple to-accentCyan';
  };

  const getIconWrapperStyles = () => {
    if (confirmVariant === 'warning') {
      return 'bg-amber-500/15 border-amber-500/35 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)]';
    }
    if (confirmVariant === 'info') {
      return 'bg-cyan-500/15 border-cyan-500/35 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)]';
    }
    return 'bg-rose-500/15 border-rose-500/35 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.35)]';
  };

  const getConfirmButtonStyles = () => {
    if (confirmVariant === 'warning') {
      return 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black shadow-amber-500/35 border-amber-400/40';
    }
    if (confirmVariant === 'info') {
      return 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-cyan-500/35 border-cyan-400/40';
    }
    return 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-rose-500/40 border-rose-400/30';
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 xs:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Backdrop click handler */}
      <div 
        className="absolute inset-0"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0c1024]/95 border border-white/20 p-5 sm:p-6 shadow-[0_25px_80px_rgba(0,0,0,0.85)] animate-portal-pop overflow-hidden text-center z-10 backdrop-blur-2xl">
        {/* Top Glowing Gradient Accent Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getGradientBorder()}`} />

        {/* Close Corner Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center pt-1 mb-3.5">
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center relative overflow-hidden ${getIconWrapperStyles()}`}>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 h-3 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-cyber-shutter"
            />
            {renderIcon()}
          </div>
        </div>

        {/* Title & Message */}
        <div className="space-y-1.5 mb-4">
          <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit tracking-tight leading-snug">
            {title}
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed font-medium px-1">
            {message}
          </p>
        </div>

        {/* Item Preview Card (Poster / Cover + Title + Badge) */}
        {itemPreview && (
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/50 border border-white/10 mb-4 text-left shadow-inner">
            {itemPreview.image ? (
              <img
                src={itemPreview.image}
                alt={itemPreview.title || 'Item Preview'}
                referrerPolicy="no-referrer"
                className="w-11 h-14 rounded-lg object-cover border border-white/10 shrink-0 bg-darkBg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                {itemPreview.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${itemPreview.badgeColor || 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                    {itemPreview.badge}
                  </span>
                )}
                {itemPreview.subtitle && (
                  <span className="text-[10px] text-gray-400 font-mono truncate">
                    {itemPreview.subtitle}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white truncate" title={itemPreview.title}>
                {itemPreview.title}
              </h4>
            </div>
          </div>
        )}

        {/* Action Buttons (Cancel / Confirm) */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-gray-200 hover:text-white font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition shadow-lg active:scale-95 border cursor-pointer ${getConfirmButtonStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
