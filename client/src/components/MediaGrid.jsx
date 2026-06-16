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
              className="group glass-card rounded-2xl overflow-hidden flex flex-col relative h-full"
            >
              {/* Image Section */}
              <div className="relative w-full aspect-[2/3] overflow-hidden bg-darkBg">
                <img
                  src={item.poster_path || 'https://placehold.co/400x600/1e1e24/fff?text=No+Poster'}
                  alt={item.title || item.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Play/Read Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-accentCyan text-black p-4 rounded-full shadow-lg shadow-accentCyan/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    {item.media_type === 'manga' ? (
                      <BookOpen className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 fill-current" />
                    )}
                  </div>
                </div>

                {/* Rating Badge */}
                {rating && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-md text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg border border-white/5">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {rating}
                  </div>
                )}

                {/* Media Type Badge */}
                <div className={`absolute bottom-2 left-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${badgeStyle} backdrop-blur-md`}>
                  {mediaLabel}
                </div>
              </div>

              {/* Info Section */}
              <div className="p-3 flex flex-col justify-between flex-grow">
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-gray-100 group-hover:text-accentCyan transition duration-300 line-clamp-2 leading-tight">
                    {item.title || item.name}
                  </h3>
                  {item.release_date && (
                    <p className="text-xs text-gray-500">
                      {item.release_date.substring(0, 4)}
                    </p>
                  )}
                  {item.first_air_date && (
                    <p className="text-xs text-gray-500">
                      {item.first_air_date.substring(0, 4)}
                    </p>
                  )}
                  {showTimings && (item.broadcast || item.broadcast_day) && (
                    <div className="flex items-center gap-1 text-[11px] text-accentCyan font-bold mt-1">
                      <Clock className="w-3.5 h-3.5 text-accentCyan" />
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
