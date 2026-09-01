import React from 'react';
import { Link } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import { Star, Play, BookOpen, Music, ArrowRight, Clock, Sparkles } from 'lucide-react';

const TYPE_CONFIG = {
  movie: {
    badge: 'badge-movie',
    label: 'Movie',
    hoverGlow: 'group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(99,210,255,0.2)]',
    playBg: 'bg-accentCyan',
    titleHover: 'group-hover:from-accentCyan group-hover:to-accentPurple',
  },
  tv: {
    badge: 'badge-tv',
    label: 'TV Show',
    hoverGlow: 'group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(72,240,180,0.2)]',
    playBg: 'bg-accentGreen',
    titleHover: 'group-hover:from-accentGreen group-hover:to-accentCyan',
  },
  anime: {
    badge: 'badge-anime',
    label: 'Anime',
    hoverGlow: 'group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(149,100,255,0.25)]',
    playBg: 'bg-accentPurple',
    titleHover: 'group-hover:from-accentPurple group-hover:to-accentPink',
  },
  manga: {
    badge: 'badge-manga',
    label: 'Manga',
    hoverGlow: 'group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,85,173,0.2)]',
    playBg: 'bg-accentPink',
    titleHover: 'group-hover:from-accentPink group-hover:to-accentGold',
  },
  music: {
    badge: 'badge-anime',
    label: 'Music',
    hoverGlow: 'group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(99,210,255,0.3)]',
    playBg: 'bg-accentCyan',
    titleHover: 'group-hover:from-accentCyan group-hover:to-accentPurple',
  }
};

export default function MediaGrid({ items, title, seeMoreLink, showTimings = false }) {
  const { playTrack, currentTrack, isPlaying } = useMusic();
  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center">
        <Sparkles className="w-10 h-10 text-gray-700 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No content found for this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="section-title text-xl font-display font-bold text-white">
            {title}
          </h2>
          {seeMoreLink && (
            <Link
              to={seeMoreLink}
              className="group flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-accentCyan transition-all duration-300"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
        {items.map((item, index) => {
          const rating = item.vote_average ? parseFloat(item.vote_average).toFixed(1) : null;
          const targetId = item.external_media_id || item.id;
          const cfg = TYPE_CONFIG[item.media_type] || TYPE_CONFIG.movie;
          const isMusic = item.media_type === 'music';
          const isCurrentPlaying = isMusic && currentTrack?.id === item.id && isPlaying;

          if (isMusic) {
            return (
              <div
                key={`music-${targetId}-${index}`}
                onClick={() => {
                  const musicList = items.filter(i => i.media_type === 'music');
                  playTrack(item, musicList.length > 0 ? musicList : [item]);
                }}
                className={`group media-card h-full transition-all duration-500 ${cfg.hoverGlow} animate-fade-up cursor-pointer ${isCurrentPlaying ? 'border-accentCyan shadow-[0_0_20px_rgba(99,210,255,0.3)]' : ''}`}
                style={{ animationDelay: `${index * 0.04}s`, animationFillMode: 'both' }}
              >
                {/* ── Poster Image ── */}
                <div className="relative w-full aspect-[2/3] overflow-hidden bg-white/[0.03]">
                  {item.poster_path ? (
                    <img
                      src={item.poster_path}
                      alt={item.title || item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center transition-all duration-700 group-hover:scale-110 group-hover:brightness-75 ${cfg.bg} bg-opacity-20`}>
                      <span className={`font-bold text-lg mb-2 ${cfg.color} drop-shadow-md`}>{item.title || item.name}</span>
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">No Poster</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  {/* Play / Pause button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400">
                    <div className={`${cfg.playBg} text-black p-3.5 rounded-full shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75`}
                         style={{ boxShadow: '0 0 30px currentColor' }}>
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className={`badge ${cfg.badge} absolute bottom-2 left-2 backdrop-blur-md`}>
                    {cfg.label}
                  </div>
                </div>

                {/* ── Info ── */}
                <div className="p-3 flex flex-col gap-1">
                  <h3 className={`font-semibold text-sm leading-snug line-clamp-2 transition-all duration-300 text-gray-200
                                 group-hover:bg-gradient-to-r ${cfg.titleHover}
                                 group-hover:bg-clip-text group-hover:text-transparent ${isCurrentPlaying ? 'text-accentCyan' : ''}`}>
                    {item.title || item.name}
                  </h3>
                  {item.artist && (
                    <p className="text-xs text-gray-400 truncate">{item.artist}</p>
                  )}
                </div>
              </div>
            );
          }

          return (
            <Link
              to={`/media/${item.media_type}/${targetId}`}
              key={`${item.media_type}-${targetId}-${index}`}
              className={`group media-card h-full transition-all duration-500 ${cfg.hoverGlow} animate-fade-up`}
              style={{ animationDelay: `${index * 0.04}s`, animationFillMode: 'both' }}
            >
              {/* ── Poster Image ── */}
              <div className="relative w-full aspect-[2/3] overflow-hidden bg-white/[0.03]">
                {item.poster_path ? (
                  <img
                    src={item.poster_path}
                    alt={item.title || item.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center transition-all duration-700 group-hover:scale-110 group-hover:brightness-75 ${cfg.bg} bg-opacity-20`}>
                    <span className={`font-bold text-lg mb-2 ${cfg.color} drop-shadow-md`}>{item.title || item.name}</span>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">No Poster</span>
                  </div>
                )}

                {/* Gradient overlay — always present subtly, stronger on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400">
                  <div className={`${cfg.playBg} text-black p-3.5 rounded-full shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75`}
                       style={{ boxShadow: '0 0 30px currentColor' }}>
                    {item.media_type === 'manga'
                      ? <BookOpen className="w-5 h-5" />
                      : <Play className="w-5 h-5 fill-current" />
                    }
                  </div>
                </div>

                {/* Rating */}
                {rating && (
                  <div className="absolute top-2 right-2 rating-pill opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    <Star className="w-3 h-3 fill-current" />
                    {rating}
                  </div>
                )}

                {/* Type badge */}
                <div className={`badge ${cfg.badge} absolute bottom-2 left-2 backdrop-blur-md`}>
                  {cfg.label}
                </div>
              </div>

              {/* ── Info ── */}
              <div className="p-3 flex flex-col gap-1">
                <h3 className={`font-semibold text-sm leading-snug line-clamp-2 transition-all duration-300 text-gray-200
                               group-hover:bg-gradient-to-r ${cfg.titleHover}
                               group-hover:bg-clip-text group-hover:text-transparent`}>
                  {item.title || item.name}
                </h3>

                <div className="flex items-center gap-2 mt-0.5">
                  {(item.release_date || item.first_air_date) && (
                    <span className="text-[11px] text-gray-600 font-medium">
                      {(item.release_date || item.first_air_date).substring(0, 4)}
                    </span>
                  )}
                  {showTimings && (item.broadcast || item.broadcast_day) && (
                    <div className="flex items-center gap-1 text-[11px] text-accentCyan font-semibold">
                      <Clock className="w-3 h-3" />
                      <span className="line-clamp-1">{item.broadcast || item.broadcast_day}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
