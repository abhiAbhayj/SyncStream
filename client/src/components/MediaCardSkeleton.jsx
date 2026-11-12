import React from 'react';

export default function MediaCardSkeleton({ count = 10, titlePlaceholder = false, rows = 1 }) {
  const renderGrid = (rowIndex) => (
    <div key={rowIndex} className="space-y-5">
      {titlePlaceholder && (
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 skeleton-neon rounded-xl border border-white/5" />
          <div className="h-4 w-20 skeleton-neon rounded-lg border border-white/5" />
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: count }, (_, idx) => (
          <div
            key={idx}
            className="rounded-2xl overflow-hidden border border-white/[0.07] bg-darkCard/50 animate-cascade-card"
            style={{ animationDelay: `${Math.min(idx, 12) * 45}ms` }}
          >
            {/* Poster Skeleton */}
            <div className="aspect-[2/3] w-full skeleton-neon relative">
              <div className="absolute top-2.5 right-2.5 h-5 w-11 rounded-md bg-white/[0.06]" />
              <div className="absolute bottom-2.5 left-2.5 h-4 w-14 rounded-full bg-white/[0.06]" />
            </div>
            {/* Metadata Skeleton */}
            <div className="p-3 space-y-2 border-t border-white/[0.04]">
              <div className="h-3.5 w-4/5 skeleton-neon rounded-md" />
              <div className="flex items-center justify-between gap-2">
                <div className="h-2.5 w-1/3 skeleton-neon rounded-md" />
                <div className="h-2.5 w-1/4 skeleton-neon rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {Array.from({ length: rows }, (_, rIdx) => renderGrid(rIdx))}
    </div>
  );
}
