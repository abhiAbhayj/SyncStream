import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, BookOpen, ArrowRight, Clock } from 'lucide-react';

export default function MediaGrid({ items, title, seeMoreLink, showTimings = false }) {
  if (!items || items.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p className="text-lg">No content found matching this category.</p>
      </div>
    );
  }

  const getMediaTypeLabel = (type) => {
    switch (type) {
      case 'movie': return 'Movie';
      case 'tv': return 'TV Show';
      case 'anime': return 'Anime';
      case 'manga': return 'Manga';
      default: return type;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'movie': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'tv': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'anime': return 'bg-accentPurple/10 text-accentPurple border-accentPurple/20';
      case 'manga': return 'bg-accentPink/10 text-accentPink border-accentPink/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between border-l-4 border-accentCyan pl-3">
          <h2 className="text-2xl font-bold tracking-tight text-white font-outfit">
            {title}
          </h2>
          {seeMoreLink && (
            <Link
              to={seeMoreLink}
              className="flex items-center gap-1 text-xs font-bold text-accentCyan hover:text-accentPurple transition duration-300"
            >
              See More
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.map((item, index) => {
          const rating = item.vote_average ? parseFloat(item.vote_average).toFixed(1) : null;
          const mediaLabel = getMediaTypeLabel(item.media_type);
          const badgeStyle = getBadgeColor(item.media_type);
          const targetId = item.external_media_id || item.id;

          return (
            <Link
              to={`/media/${item.media_type}/${targetId}`}
              key={`${item.media_type}-${targetId}-${index}`}
              className="group glass-card rounded-2xl overflow-hidden flex flex-col relative h-full transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(0,240,255,0.35)] hover:-translate-y-2.5 hover:border-accentCyan/50"
            >
              {/* Image Section */}
              <div className="relative w-full aspect-[2/3] overflow-hidden bg-darkBg">
                <img
                  src={item.poster_path || 'https://placehold.co/400x600/1e1e24/fff?text=No+Poster'}
                  alt={item.title || item.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                
                {/* Play/Read Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-center justify-center translate-y-3 group-hover:translate-y-0 backdrop-blur-[2px]">
                  <div className="bg-gradient-to-tr from-accentCyan to-accentPurple text-black p-4 rounded-full shadow-[0_0_25px_rgba(0,240,255,0.9)] transform scale-50 group-hover:scale-100 transition-all duration-500 ease-out">
                    {item.media_type === 'manga' ? (
                      <BookOpen className="w-6 h-6 animate-pulse" />
                    ) : (
                      <Play className="w-6 h-6 fill-current animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Rating Badge */}
                {rating && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/80 backdrop-blur-md text-amber-400 text-xs font-extrabold px-2.5 py-1 rounded-xl border border-white/10 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                    {rating}
                  </div>
                )}

                {/* Media Type Badge */}
                <div className={`absolute bottom-2.5 left-2.5 text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-lg border ${badgeStyle} backdrop-blur-md shadow-md`}>
                  {mediaLabel}
                </div>
              </div>

              {/* Info Section */}
              <div className="p-3.5 flex flex-col justify-between flex-grow">
                <div className="space-y-1 relative z-10">
                  <h3 className="font-bold text-sm text-gray-100 font-syne group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accentCyan group-hover:to-accentPurple transition-all duration-300 line-clamp-2 leading-snug">
                    {item.title || item.name}
                  </h3>
                  {item.release_date && (
                    <p className="text-xs text-gray-500 font-medium">
                      {item.release_date.substring(0, 4)}
                    </p>
                  )}
                  {item.first_air_date && (
                    <p className="text-xs text-gray-500 font-medium">
                      {item.first_air_date.substring(0, 4)}
                    </p>
                  )}
                  {showTimings && (item.broadcast || item.broadcast_day) && (
                    <div className="flex items-center gap-1.5 text-[11px] text-accentCyan font-bold mt-1 bg-accentCyan/10 border border-accentCyan/20 px-2 py-0.5 rounded-lg w-fit">
                      <Clock className="w-3 h-3 text-accentCyan" />
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
