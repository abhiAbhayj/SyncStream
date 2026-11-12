import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import EqualizerBars from './EqualizerBars';
import {
  Star,
  Play,
  Pause,
  BookOpen,
  Music,
  ArrowRight,
  Clock,
  Sparkles,
  FolderPlus,
  Plus,
  Check,
  Users,
  Loader2
} from 'lucide-react';
import { formatMediaPoster, handlePosterError } from '../utils/posterFallback';

const TYPE_CONFIG = {
  movie: {
    badge: 'badge-movie',
    label: 'Movie',
    hoverGlow: 'group-hover:shadow-[0_22px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(var(--accent-cyan),0.35)]',
    playBg: 'bg-accentCyan',
    titleHover: 'group-hover:from-accentCyan group-hover:to-accentPurple',
  },
  tv: {
    badge: 'badge-tv',
    label: 'TV Show',
    hoverGlow: 'group-hover:shadow-[0_22px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(var(--accent-green),0.35)]',
    playBg: 'bg-accentGreen',
    titleHover: 'group-hover:from-accentGreen group-hover:to-accentCyan',
  },
  anime: {
    badge: 'badge-anime',
    label: 'Anime',
    hoverGlow: 'group-hover:shadow-[0_22px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(var(--accent-purple),0.4)]',
    playBg: 'bg-accentPurple',
    titleHover: 'group-hover:from-accentPurple group-hover:to-accentPink',
  },
  manga: {
    badge: 'badge-manga',
    label: 'Manga',
    hoverGlow: 'group-hover:shadow-[0_22px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(var(--accent-pink),0.35)]',
    playBg: 'bg-accentPink',
    titleHover: 'group-hover:from-accentPink group-hover:to-accentGold',
  },
  music: {
    badge: 'badge-anime',
    label: 'Music',
    hoverGlow: 'group-hover:shadow-[0_22px_60px_rgba(0,0,0,0.8),0_0_0_1px_rgba(var(--accent-cyan),0.4)]',
    playBg: 'bg-accentCyan',
    titleHover: 'group-hover:from-accentCyan group-hover:to-accentPurple',
  }
};

const formatDuration = (mins, mediaType, episodesCount) => {
  const m = parseInt(mins, 10);
  if (!isNaN(m) && m > 0) {
    if (mediaType === 'movie') {
      const h = Math.floor(m / 60);
      const rem = m % 60;
      return h > 0 ? (rem > 0 ? `${h}h ${rem}m` : `${h}h`) : `${m}m`;
    }
    return `${m}m/ep`;
  }
  if (episodesCount && (mediaType === 'tv' || mediaType === 'anime')) {
    return `${episodesCount} eps`;
  }
  return null;
};

function useHoloTilt() {
  const cardRef = useRef(null);
  const glareRef = useRef(null);

  const handleMouseMove = (e) => {
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(pointer: fine)').matches) {
      return;
    }
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;

    if (glareRef.current) {
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      glareRef.current.style.background = `radial-gradient(circle at ${px.toFixed(1)}% ${py.toFixed(1)}%, rgba(255,255,255,0.26) 0%, rgba(var(--accent-cyan),0.14) 30%, transparent 70%)`;
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    if (glareRef.current) {
      glareRef.current.style.background = 'transparent';
    }
  };

  return { cardRef, glareRef, handleMouseMove, handleMouseLeave };
}

function HoloMediaItem({ item, index, cfg, showTimings }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cardRef, glareRef, handleMouseMove, handleMouseLeave } = useHoloTilt();

  const [savedToWatchlist, setSavedToWatchlist] = useState(false);
  const [savingWatchlist, setSavingWatchlist] = useState(false);
  const [creatingParty, setCreatingParty] = useState(false);

  const rating = item.vote_average ? parseFloat(item.vote_average).toFixed(1) : null;
  const targetId = item.external_media_id || item.id;
  const posterSrc = formatMediaPoster(item);

  const rawTargetId = targetId;
  const hasQueryInId = String(rawTargetId).includes('?');
  let baseTargetId = rawTargetId;
  let seasonQuery = '';

  if (hasQueryInId) {
    const parts = String(rawTargetId).split('?');
    baseTargetId = parts[0];
    seasonQuery = `?${parts[1]}`;
  } else if (item.season_number && item.season_number > 1) {
    seasonQuery = `?season=${item.season_number}`;
  }

  const mediaType = item.media_type || 'movie';
  const mediaLink = `/media/${mediaType}/${baseTargetId}${seasonQuery}`;
  const playLink = `${mediaLink}${seasonQuery ? '&' : '?'}play=true`;

  const formatLabel = item.format || cfg.label;
  const isSeasonBadge = Boolean(item.format && item.format.toLowerCase().startsWith('season'));
  const isOvaOna = Boolean(item.format && ['ova', 'ona', 'special'].includes(item.format.toLowerCase()));
  const isMovieBadge = Boolean(item.format && item.format.toLowerCase() === 'movie');
  const durationText = formatDuration(item.runtime || item.duration, mediaType, item.episodes);
  const moviePillDuration = (item.runtime || item.duration) && (mediaType === 'movie' || isMovieBadge)
    ? formatDuration(item.runtime || item.duration, 'movie')
    : null;

  const handleQuickPlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(mediaType === 'manga' ? mediaLink : playLink);
  };

  const handleQuickWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (savingWatchlist) return;
    setSavingWatchlist(true);
    try {
      const cleanId = String(baseTargetId);
      if (savedToWatchlist) {
        await axios.delete(`/api/media/watchlist/${cleanId}`);
        setSavedToWatchlist(false);
      } else {
        const dbPoster = item.poster_path && typeof item.poster_path === 'string' && item.poster_path.length <= 250 && !item.poster_path.startsWith('data:')
          ? item.poster_path
          : null;
        await axios.post('/api/media/watchlist', {
          external_media_id: cleanId,
          media_type: ['movie', 'tv', 'anime', 'manga'].includes(mediaType) ? mediaType : 'movie',
          title: (item.title || item.name || 'Untitled').slice(0, 250),
          poster_path: dbPoster
        });
        setSavedToWatchlist(true);
      }
    } catch (err) {
      console.error('Quick watchlist toggle error:', err);
    } finally {
      setSavingWatchlist(false);
    }
  };

  const handleQuickParty = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (creatingParty) return;
    setCreatingParty(true);
    try {
      const res = await axios.post('/api/rooms/create', {
        external_media_id: String(baseTargetId),
        media_type: ['movie', 'tv', 'anime'].includes(mediaType) ? mediaType : 'movie'
      });
      const roomCode = res.data?.room?.room_code;
      if (roomCode) {
        navigate(`/room/${roomCode}`);
      }
    } catch (err) {
      console.error('Quick watch party error:', err);
    } finally {
      setCreatingParty(false);
    }
  };

  return (
    <div
      className="animate-cascade-card h-full"
      style={{ animationDelay: `${Math.min(index, 16) * 50}ms` }}
    >
      <Link
        ref={cardRef}
        to={mediaLink}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transition: 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease' }}
        className={`group media-card h-full will-change-transform ${cfg.hoverGlow}`}
      >
        {/* ── Poster Image ── */}
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-white/[0.03]">
          <img
            src={posterSrc}
            alt={item.title || item.name || 'Media Poster'}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
            referrerPolicy="no-referrer"
            onError={(e) => handlePosterError(e, item)}
          />

          {/* 3D Holographic Dynamic Glare Sheen */}
          <div
            ref={glareRef}
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen z-10"
          />

          {/* Diagonal Gloss Sweep on Hover */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden z-10">
            <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/[0.12] to-transparent rotate-12 translate-x-[-60%] group-hover:translate-x-[60%] transition-transform duration-1000 ease-out" />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

          {/* Center Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-none">
            <div
              className={`${cfg.playBg} text-black p-3.5 rounded-full shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75 -translate-y-3`}
              style={{ boxShadow: '0 0 30px currentColor' }}
            >
              {mediaType === 'manga'
                ? <BookOpen className="w-5 h-5" />
                : <Play className="w-5 h-5 fill-current" />
              }
            </div>
          </div>

          {/* Rating Pill */}
          {rating && parseFloat(rating) > 0 && (
            <div className="absolute top-2 right-2 rating-pill opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 z-10">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
              {rating}
            </div>
          )}

          {/* Format / Type badge (fades softly up on hover to reveal Rising Action Drawer) */}
          <div
            className={`badge ${
              isSeasonBadge
                ? 'bg-emerald-500/80 text-black font-extrabold border-emerald-400/50'
                : isOvaOna
                ? 'bg-purple-600/85 text-white font-extrabold border-purple-400/50'
                : isMovieBadge && mediaType === 'anime'
                ? 'bg-amber-500/80 text-black font-extrabold border-amber-400/50'
                : cfg.badge
            } absolute bottom-2 left-2 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 shadow-md transition-all duration-200 group-hover:opacity-0 group-hover:translate-y-2 z-10`}
          >
            {formatLabel}
          </div>

          {/* Duration / Episode count pill */}
          {item.episodes ? (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/80 text-accentCyan border border-accentCyan/30 backdrop-blur-md shadow-md transition-all duration-200 group-hover:opacity-0 group-hover:translate-y-2 z-10">
              {item.episodes} {item.episodes === 1 ? 'EP' : 'EPS'}
            </div>
          ) : moviePillDuration ? (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/80 text-accentCyan border border-accentCyan/30 backdrop-blur-md shadow-md transition-all duration-200 group-hover:opacity-0 group-hover:translate-y-2 z-10">
              {moviePillDuration}
            </div>
          ) : null}

          {/* ── Rising Frosted Quick-Action Drawer ── */}
          <div className="hidden md:flex absolute bottom-0 inset-x-0 z-20 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-black/75 backdrop-blur-xl border-t border-white/15 items-center justify-between gap-1.5">
            <button
              type="button"
              onClick={handleQuickPlay}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-accentCyan hover:opacity-90 text-black text-[10px] font-black transition active:scale-95 cursor-pointer shadow-sm"
              title={mediaType === 'manga' ? 'Read Now' : 'Play Now'}
            >
              {mediaType === 'manga' ? <BookOpen className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{mediaType === 'manga' ? 'Read' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickWatchlist}
              disabled={savingWatchlist}
              className={`p-1.5 rounded-lg border text-[10px] font-bold transition active:scale-95 cursor-pointer flex items-center justify-center ${
                savedToWatchlist
                  ? 'bg-emerald-500/25 border-emerald-400/60 text-emerald-300'
                  : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
              }`}
              title={savedToWatchlist ? 'Saved to Watchlist' : 'Add to Watchlist'}
            >
              {savingWatchlist ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : savedToWatchlist ? (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </button>

            {mediaType !== 'manga' && (
              <button
                type="button"
                onClick={handleQuickParty}
                disabled={creatingParty}
                className="p-1.5 rounded-lg bg-accentPurple/20 hover:bg-accentPurple hover:text-white border border-accentPurple/40 text-accentPurple text-[10px] font-bold transition active:scale-95 cursor-pointer flex items-center justify-center"
                title="Host Instant Watch Party"
              >
                {creatingParty ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Users className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Info ── */}
        <div className="p-3 flex flex-col gap-1">
          <h3 className={`font-dmsans font-semibold text-sm leading-snug line-clamp-2 transition-all duration-300 text-gray-200
                         group-hover:bg-gradient-to-r ${cfg.titleHover}
                         group-hover:bg-clip-text group-hover:text-transparent`}>
            {item.title || item.name}
          </h3>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {(item.release_date || item.first_air_date) && (
              <span className="text-[11px] text-gray-500 font-medium">
                {(item.release_date || item.first_air_date).substring(0, 4)}
              </span>
            )}
            {durationText && (
              <div className="flex items-center gap-1 text-[11px] text-accentCyan font-semibold">
                <Clock className="w-3 h-3 text-accentCyan" />
                <span>{durationText}</span>
              </div>
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
    </div>
  );
}

function HoloMusicItem({ item, index, cfg, isCurrent, isCurrentPlaying, onCardClick, openAddToPlaylist }) {
  const { cardRef, glareRef, handleMouseMove, handleMouseLeave } = useHoloTilt();
  const posterSrc = formatMediaPoster(item);

  return (
    <div
      className="animate-cascade-card h-full"
      style={{ animationDelay: `${Math.min(index, 16) * 50}ms` }}
    >
      <div
        ref={cardRef}
        onClick={onCardClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transition: 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease' }}
        className={`group media-card h-full rounded-2xl overflow-hidden cursor-pointer border will-change-transform ${cfg.hoverGlow} ${
          isCurrentPlaying
            ? 'border-accentCyan shadow-[0_0_24px_rgba(var(--accent-cyan),0.35)] bg-accentCyan/10'
            : 'border-white/10 bg-darkCard/60 hover:border-accentCyan/40'
        }`}
      >
        {/* ── Music Square Album Cover (1:1 Ratio) ── */}
        <div className="relative w-full aspect-square overflow-hidden bg-black/40">
          <img
            src={posterSrc}
            alt={item.title || item.name || 'Song Cover'}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => handlePosterError(e, item)}
          />

          {/* 3D Glare Sheen */}
          <div
            ref={glareRef}
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen z-10"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

          {/* Play / Pause button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
            <div className="bg-accentCyan text-black p-3 rounded-full shadow-[0_0_20px_rgba(var(--accent-cyan),0.8)] transform scale-90 group-hover:scale-100 transition-transform">
              {isCurrentPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </div>
          </div>

          <div className="badge badge-anime absolute bottom-2 left-2 text-[9px] px-2 py-0.5 backdrop-blur-md flex items-center gap-1 z-10">
            <Music className="w-2.5 h-2.5 text-accentPink fill-accentPink" />
            <span>Music</span>
          </div>

          {/* Add to playlist button overlay */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openAddToPlaylist(item);
            }}
            className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 hover:bg-accentCyan hover:text-black text-gray-200 border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-md z-20"
            title="Add to Playlist"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>

          {/* Live Equalizer Bars when track is active */}
          {isCurrent && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/75 border border-accentCyan/40 backdrop-blur-md flex items-center gap-1 z-10 shadow-md">
              <EqualizerBars isPlaying={isCurrentPlaying} size="sm" bars={4} />
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className="p-2.5 sm:p-3 flex flex-col gap-0.5">
          <h3 className={`font-bold text-xs sm:text-sm leading-snug truncate transition-colors text-white group-hover:text-accentCyan ${isCurrentPlaying ? 'text-accentCyan' : ''}`}>
            {item.title || item.name}
          </h3>
          {item.artist && (
            <p className="text-[11px] text-gray-400 truncate font-medium">{item.artist}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MediaGrid({ items, title, seeMoreLink, showTimings = false }) {
  const { playTrack, currentTrack, isPlaying, togglePlay, openAddToPlaylist } = useMusic();
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {items.map((item, index) => {
          const targetId = item.external_media_id || item.id;
          const isMusic = item.media_type === 'music' || Boolean(item.audio_url);
          const cfg = TYPE_CONFIG[isMusic ? 'music' : (item.media_type || 'movie')] || TYPE_CONFIG.movie;
          const itemTitle = (item.title || item.name || '').toLowerCase().trim();
          const isCurrent = isMusic && Boolean(currentTrack) && (
            String(currentTrack.id) === String(item.id) ||
            String(currentTrack.id) === String(targetId) ||
            (Boolean(currentTrack.audio_url) && Boolean(item.audio_url) && currentTrack.audio_url === item.audio_url) ||
            (Boolean(currentTrack.title) && Boolean(itemTitle) && currentTrack.title.toLowerCase().trim() === itemTitle)
          );
          const isCurrentPlaying = isCurrent && isPlaying;

          if (isMusic) {
            return (
              <HoloMusicItem
                key={`music-${targetId}-${index}`}
                item={item}
                index={index}
                cfg={cfg}
                isCurrent={isCurrent}
                isCurrentPlaying={isCurrentPlaying}
                openAddToPlaylist={openAddToPlaylist}
                onCardClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isCurrent) {
                    togglePlay();
                  } else {
                    const musicList = items.filter(i => i.media_type === 'music' || Boolean(i.audio_url));
                    playTrack(item, musicList.length > 0 ? musicList : [item]);
                  }
                }}
              />
            );
          }

          return (
            <HoloMediaItem
              key={`${item.media_type}-${targetId}-${index}`}
              item={item}
              index={index}
              cfg={cfg}
              showTimings={showTimings}
            />
          );
        })}
      </div>
    </div>
  );
}
