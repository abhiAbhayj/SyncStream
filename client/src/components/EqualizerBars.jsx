import React from 'react';

export default function EqualizerBars({ isPlaying = false, size = 'sm', bars = 4, className = '' }) {
  const animClasses = ['animate-eq-1', 'animate-eq-2', 'animate-eq-3', 'animate-eq-4', 'animate-eq-5'];
  const barWidth = size === 'lg' ? 'w-1' : size === 'md' ? 'w-[3px]' : 'w-[2.5px]';
  const maxContainerHeight = size === 'lg' ? 'h-5' : size === 'md' ? 'h-4' : 'h-3.5';

  return (
    <span
      className={`inline-flex items-end gap-[2px] ${maxContainerHeight} shrink-0 ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: bars }, (_, idx) => (
        <span
          key={idx}
          className={`${barWidth} rounded-full bg-gradient-to-t from-accentCyan via-accentPurple to-accentPink transition-all duration-300 ${
            isPlaying ? animClasses[idx % animClasses.length] : '!h-[4px] opacity-40'
          }`}
          style={{
            maxHeight: size === 'lg' ? '20px' : size === 'md' ? '16px' : '14px',
            minHeight: '3px',
            animationPlayState: isPlaying ? 'running' : 'paused'
          }}
        />
      ))}
    </span>
  );
}
