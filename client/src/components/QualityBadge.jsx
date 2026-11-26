import React from 'react';
import { getMediaQuality } from '../utils/mediaQuality';

export default function QualityBadge({ item, className = '', size = 'sm' }) {
  const quality = getMediaQuality(item);
  if (!quality) return null;

  const isHD = quality === 'HD';
  const sizeClasses =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[8.5px] sm:text-[9px] rounded-md'
      : 'px-2 py-0.5 text-[9.5px] sm:text-[10px] rounded-md';

  return (
    <span
      title={isHD ? 'HD Digital Quality Available' : 'CAM / Theatrical Print'}
      className={`inline-flex items-center justify-center font-black uppercase tracking-wider shrink-0 select-none ${sizeClasses} ${
        isHD
          ? 'bg-emerald-500 text-black border border-emerald-300/70 shadow-[0_0_10px_rgba(16,185,129,0.55)]'
          : 'bg-amber-500 text-black border border-amber-300/70 shadow-[0_0_10px_rgba(245,158,11,0.55)]'
      } ${className}`}
    >
      {quality}
    </span>
  );
}
