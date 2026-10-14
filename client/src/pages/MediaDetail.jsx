import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import MediaGrid from '../components/MediaGrid';
import MangaReader from '../components/MangaReader';
import VideoPlayer from '../components/VideoPlayer';
import EmbedPlayer from '../components/EmbedPlayer';
import { STREAMING_SERVERS, getEmbedStreamUrl } from '../utils/streamingServers';
import { Star, Heart, Tv, BookOpen, Loader2, Play, Users, Film, AlertTriangle, ShieldCheck, Sparkles, Layers, Clock } from 'lucide-react';

const formatDuration = (mins, mediaType, episodesCount) => {
  const m = parseInt(mins, 10);
  if (!isNaN(m) && m > 0) {
    if (mediaType === 'movie') {
      const h = Math.floor(m / 60);
      const rem = m % 60;
      return h > 0 ? (rem > 0 ? `${h}h ${rem}m` : `${h}h`) : `${m}m`;
    }
    if (m >= 60 && mediaType !== 'anime') {
      const h = Math.floor(m / 60);
      const rem = m % 60;
      return `${h > 0 ? `${h}h ${rem}m` : `${m}m`} / ep`;
    }
    return `${m}m / ep`;
  }
  if (episodesCount) {
    return `${episodesCount} eps`;
  }
  return null;
};

export default function MediaDetail() {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack } = useMusic();

  const urlSeason = searchParams.get('season');
  const urlEpisode = searchParams.get('episode');
  const urlPlay = searchParams.get('play');

  const [detail, setDetail] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activeChapterTitle, setActiveChapterTitle] = useState('');
  
  // Anime episodes tracking
  const [episodes, setEpisodes] = useState([]);
  const [activeSeason, setActiveSeason] = useState(urlSeason ? parseInt(urlSeason, 10) : 1);
  const [activeEpisode, setActiveEpisode] = useState(urlEpisode ? parseInt(urlEpisode, 10) : 1);
  
  // Streaming server source tracking (Default: VidSrc PM - 100% Sandbox Protected)
  const [embedServer, setEmbedServer] = useState('vidsrcpm');
  const [customUrl, setCustomUrl] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [watchlist, setWatchlist] = useState([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [currentSeasonData, setCurrentSeasonData] = useState(null);

  // Playback modes for Video Content
  // 'trailer' | 'solo-html5' | 'solo-embed'
  const [playbackMode, setPlaybackMode] = useState(
    urlPlay === 'true' || urlEpisode ? 'solo-embed' : 'trailer'
  );

  // Dynamic voice event listener for next/previous episode commands
  useEffect(() => {
    const handleEpisodeChange = (e) => {
      const { delta, episode, season } = e.detail || {};
      if (season && typeof season === 'number') {
        setActiveSeason(season);
      }
      if (typeof episode === 'number') {
        setActiveEpisode(episode);
        setPlaybackMode('solo-embed');
      } else if (typeof delta === 'number') {
        setActiveEpisode((prev) => {
          const next = Math.max(1, prev + delta);
          return next;
        });
        setPlaybackMode('solo-embed');
      }
    };
    window.addEventListener('syncstream:change-episode', handleEpisodeChange);
    return () => window.removeEventListener('syncstream:change-episode', handleEpisodeChange);
  }, []);

  // Update state when URL query params change
  useEffect(() => {
    if (urlSeason) {
      setActiveSeason(parseInt(urlSeason, 10));
    }
    if (urlEpisode) {
      setActiveEpisode(parseInt(urlEpisode, 10));
      setPlaybackMode('solo-embed');
    }
    if (urlPlay === 'true') {
      setPlaybackMode('solo-embed');
    }
  }, [urlSeason, urlEpisode, urlPlay]);

  // Fetch all details
  useEffect(() => {
    const fetchDetails = async () => {
      if (type === 'music') {
        try {
          const res = await axios.get(`/api/music/song/${id}`);
          if (res.data) {
            playTrack(res.data, [res.data]);
          }
        } catch (e) {}
        navigate('/music');
        return;
      }

      setLoading(true);
      setError(null);
      setActiveChapterId(null);
      try {
        const detailRes = await axios.get(`/api/media/detail/${type}/${id}`);
        const detailData = detailRes.data;
        setDetail(detailData);
        
        if ((type === 'tv' || type === 'anime') && detailData.seasons && detailData.seasons.length > 0) {
          if (!urlSeason) {
            const firstSeason = detailData.seasons.find(s => s.season_number > 0) || detailData.seasons[0];
            setActiveSeason(detailData.default_season || firstSeason.season_number);
          }
        }

        // Anime episodes list loading
        if (type === 'anime') {
          try {
            const epsRes = await axios.get(`/api/media/anime/episodes/${id}`);
            setEpisodes(epsRes.data || []);
          } catch (epsErr) {
            console.warn('Failed to load anime episodes list:', epsErr.message);
          }
        }

        // Set default playback mode based on trailer presence
        if (detailData.youtube_trailer && !urlPlay && !urlEpisode) {
          setPlaybackMode('trailer');
        } else if (type !== 'manga') {
          setPlaybackMode('solo-embed');
        }

        // If manga, fetch chapters list
        if (type === 'manga') {
          const chaptersRes = await axios.get(`/api/media/manga/chapters/${id}`);
          setChapters(chaptersRes.data || []);
        }

        // If logged in, check watchlist
        if (user) {
          fetchWatchlistStatus();
        }
      } catch (err) {
        console.error('Error loading media details:', err);
        setError('Failed to fetch details for this title. Please check your network or try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [type, id, user]);

  useEffect(() => {
    if ((type === 'tv' || type === 'anime') && activeSeason !== null) {
      const fetchSeason = async () => {
        try {
          const res = await axios.get(`/api/media/tv/${id}/season/${activeSeason}`);
          setCurrentSeasonData(res.data);
          setSeasonEpisodes(res.data.episodes || []);
        } catch (err) {
          console.error('Failed to load season details:', err);
        }
      };
      fetchSeason();
    }
  }, [type, id, activeSeason]);

  const fetchWatchlistStatus = async () => {
    try {
      const res = await axios.get('/api/media/watchlist');
      setWatchlist(res.data || []);
      const match = res.data.some(
        item => item.external_media_id === id.toString() && item.media_type === type
      );
      setInWatchlist(match);
    } catch (err) {
      console.warn('Watchlist query error:', err.message);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setWatchlistLoading(true);
    try {
      if (inWatchlist) {
        await axios.delete(`/api/media/watchlist/${id}`);
        setInWatchlist(false);
      } else {
        await axios.post('/api/media/watchlist', {
          external_media_id: id,
          media_type: type,
          title: detail.title,
          poster_path: detail.poster_path
        });
        setInWatchlist(true);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleCreateWatchParty = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.post('/api/rooms/create', {
        external_media_id: id,
        media_type: type
      });
      const { room_code } = res.data.room;
      navigate(`/room/${room_code}`);
    } catch (err) {
      console.error('Failed to instantiate Watch Party:', err);
      alert('Could not start watch party lobby. Please try again.');
    }
  };

  const getEmbedUrl = () => {
    return getEmbedStreamUrl({
      serverKey: embedServer,
      mediaType: type,
      id,
      tmdbId: detail?.tmdb_id || id,
      season: activeSeason || 1,
      episode: activeEpisode || 1
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-36 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-accentCyan" />
        <p className="text-gray-400 font-medium">Downloading global title assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-lg mx-auto text-center space-y-4 my-12">
        <p className="text-red-400 font-bold">{error}</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-2.5 bg-darkCard border border-darkBorder hover:border-white/20 rounded-xl text-sm font-semibold text-gray-200 transition"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isEpisodic = (type === 'tv' || type === 'anime');
  const durationLabel = formatDuration(detail?.runtime || detail?.duration, type, detail?.episodes_count);

  const seasonsList = (() => {
    if (!isEpisodic) return [];
    const list = [];
    const seenSeasonNums = new Set();

    if (detail?.seasons && detail.seasons.length > 0) {
      detail.seasons.forEach((s) => {
        if (!seenSeasonNums.has(s.season_number)) {
          seenSeasonNums.add(s.season_number);
          list.push(s);
        }
      });
    }

    // Fallback: If only 1 season was returned but number_of_seasons > 1
    if (detail?.number_of_seasons && detail.number_of_seasons > list.length) {
      for (let sNum = 1; sNum <= detail.number_of_seasons; sNum++) {
        if (!seenSeasonNums.has(sNum)) {
          seenSeasonNums.add(sNum);
          list.push({
            id: sNum,
            season_number: sNum,
            name: `Season ${sNum}`,
            episode_count: Math.round((detail.number_of_episodes || 12) / detail.number_of_seasons) || 12,
            poster_path: detail.poster_path
          });
        }
      }
    }

    // Check related_franchise for other seasons if still only 1
    if (list.length <= 1 && detail?.related_franchise?.length > 0) {
      detail.related_franchise.forEach((rf) => {
        const match = (rf.title || '').match(/season\s*(\d+)|(\d+)(?:nd|rd|th)?\s*season/i);
        const sNum = match ? parseInt(match[1] || match[2], 10) : null;
        if (sNum && !seenSeasonNums.has(sNum)) {
          seenSeasonNums.add(sNum);
          list.push({
            id: rf.id,
            season_number: sNum,
            name: rf.title || `Season ${sNum}`,
            episode_count: 12,
            poster_path: rf.poster_path
          });
        }
      });
    }

    if (list.length === 0) {
      list.push({ id: 1, season_number: 1, name: 'Season 1', episode_count: detail?.episodes_count || 12 });
    }

    return list.sort((a, b) => a.season_number - b.season_number);
  })();

  const currentSeason = isEpisodic ? (seasonsList.find(s => s.season_number === activeSeason) || seasonsList[0]) : null;
  const activeOverview = (isEpisodic && (currentSeasonData?.overview || currentSeason?.overview)) ? (currentSeasonData?.overview || currentSeason?.overview) : (detail?.overview || 'No synopsis available for this title.');
  const activePoster = (isEpisodic && currentSeasonData?.poster_path)
    ? (currentSeasonData.poster_path.startsWith('http') ? currentSeasonData.poster_path : `https://image.tmdb.org/t/p/w500${currentSeasonData.poster_path}`)
    : (isEpisodic && currentSeason?.poster_path ? currentSeason.poster_path : detail?.poster_path);
  const activeSeasonName = isEpisodic ? (currentSeason?.name || `Season ${activeSeason}`) : '';

  const relatedEntries = (() => {
    if (!detail) return [];
    const list = [];
    
    // 1. All seasons from seasonsList (only for TV & Anime)
    if (isEpisodic && seasonsList.length > 0) {
      seasonsList.forEach((s) => {
        let badge = `SEASON ${s.season_number}`;
        if (s.season_number === 0) badge = 'SPECIAL';
        else if (s.name && s.name.toLowerCase().includes('ova')) badge = 'OVA';
        else if (s.name && s.name.toLowerCase().includes('special')) badge = 'SPECIAL';
        else if (s.name && s.name.toLowerCase() !== `season ${s.season_number}` && s.name.length <= 12) badge = s.name.toUpperCase();

        list.push({
          id: `season_${s.season_number}`,
          season_number: s.season_number,
          title: s.name || `${detail.title} Season ${s.season_number}`,
          badge,
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          type: 'tv',
          release_date: s.air_date ? s.air_date.split('-')[0] : (detail.release_date?.split('-')[0] || ''),
          poster_path: s.poster_path || detail.poster_path,
          isSeason: true,
          isActive: (activeSeason || 1) === s.season_number
        });
      });
    }

    // 2. Any related franchise movies/series from detail.related_franchise (for movies, tv, anime)
    if (detail.related_franchise && detail.related_franchise.length > 0) {
      const hasCurrent = detail.related_franchise.some(rf => String(rf.id) === String(detail.id));

      if (!isEpisodic && !hasCurrent) {
        list.push({
          id: detail.id,
          title: detail.title,
          badge: 'NOW PLAYING',
          badgeColor: 'bg-[#10b981] text-black border-[#10b981]',
          type: 'movie',
          release_date: detail.release_date ? detail.release_date.split('-')[0] : '',
          poster_path: detail.poster_path,
          isSeason: false,
          isActive: true
        });
      }

      detail.related_franchise.forEach((rf) => {
        const isCurrentActive = String(rf.id) === String(detail.id);
        list.push({
          id: rf.id,
          title: rf.title,
          badge: isCurrentActive ? 'NOW PLAYING' : (rf.badge || (rf.type === 'movie' ? 'MOVIE' : 'TV')),
          badgeColor: isCurrentActive 
            ? 'bg-[#10b981] text-black border-[#10b981]' 
            : (rf.type === 'movie' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'),
          type: rf.type || 'movie',
          release_date: rf.release_date ? rf.release_date.split('-')[0] : '',
          poster_path: rf.poster_path || detail.poster_path,
          isSeason: false,
          isActive: isCurrentActive
        });
      });
    }

    return list;
  })();

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8 space-y-4 sm:space-y-6 relative">
      
      {/* Top Controls Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 glass-panel border border-darkBorder p-3.5 sm:p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
            <h1 className="font-extrabold text-base sm:text-lg md:text-xl text-white font-outfit truncate">
              Watch: {detail.title}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
              <span className="text-accentCyan font-semibold capitalize">Solo Stream</span>
              <span>•</span>
              <span className="capitalize">{type}</span>
              {detail.release_date && <span>• {detail.release_date}</span>}
              {durationLabel && (
                <span className="flex items-center gap-1 text-accentCyan font-bold">
                  • <Clock className="w-3 h-3 text-accentCyan" /> {durationLabel}
                </span>
              )}
              {detail.vote_average && (
                <span className="flex items-center gap-1 text-yellow-400">
                  • <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" /> {parseFloat(detail.vote_average).toFixed(1)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
          <button
            onClick={handleWatchlistToggle}
            disabled={watchlistLoading}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              inWatchlist
                ? 'border-accentPink text-accentPink bg-accentPink/15 hover:bg-accentPink/25'
                : 'border-darkBorder text-gray-300 bg-darkCard/50 hover:bg-white/5'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-current' : ''}`} />
            <span>{inWatchlist ? 'Saved in Library' : 'Add to Library'}</span>
          </button>

          {type !== 'manga' && (
            <button
              onClick={handleCreateWatchParty}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition border border-accentCyan/40 bg-accentCyan/15 text-accentCyan hover:bg-accentCyan hover:text-black shadow-lg shadow-accentCyan/10 cursor-pointer active:scale-95"
            >
              <Users className="w-3.5 h-3.5 fill-accentCyan/30" />
              <span>Watch Party</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Media Overview Card AT THE TOP (Requested by User) ── */}
      <div className="glass-panel border border-darkBorder p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 items-start">
        <div className="w-[120px] sm:w-[150px] md:w-[200px] aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-darkCard shrink-0 mx-auto sm:mx-0">
          {activePoster ? (
            <img 
              src={activePoster} 
              alt={detail.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-tr from-gray-800 to-gray-900">
              <span className="font-bold text-sm sm:text-base mb-1 text-white">{detail.title}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">No Poster</span>
            </div>
          )}
        </div>

        <div className="flex-grow space-y-3 sm:space-y-4 text-left w-full min-w-0">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-outfit break-words">
                {detail.title}
              </h2>
              {(type === 'tv' || type === 'anime') && activeSeason && (
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider">
                  {activeSeasonName}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400 font-semibold">
              <span className="capitalize text-accentCyan bg-accentCyan/10 border border-accentCyan/20 px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                {type}
              </span>
              {currentSeason?.air_date ? (
                <span>• Season Air: {currentSeason.air_date}</span>
              ) : (
                detail.release_date && <span>• {detail.release_date}</span>
              )}
              {durationLabel && (
                <span className="flex items-center gap-1 text-accentCyan font-bold">
                  • <Clock className="w-3.5 h-3.5 text-accentCyan" /> {durationLabel}
                </span>
              )}
              {isEpisodic && (seasonsList.length > 1 || detail.number_of_seasons > 1) && (
                <span>• {seasonsList.length || detail.number_of_seasons} Seasons</span>
              )}
              {detail.episodes_count && (
                <span>• {detail.episodes_count} Eps</span>
              )}
              {detail.vote_average && (
                <span className="flex items-center gap-1 text-yellow-400">
                  • <Star className="w-3.5 h-3.5 fill-current" /> {parseFloat(detail.vote_average).toFixed(1)}
                </span>
              )}
            </div>

            {/* Genres */}
            {detail.genres && detail.genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {detail.genres.map((g, idx) => (
                  <button
                    key={g.id || `${g.name}-${idx}`}
                    type="button"
                    onClick={() => navigate(`/search?type=${type}&genre=${g.id || encodeURIComponent(g.name)}`)}
                    className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-semibold bg-white/5 hover:bg-accentCyan/20 text-gray-300 hover:text-accentCyan border border-white/10 hover:border-accentCyan/40 transition-all cursor-pointer backdrop-blur-md active:scale-95 shadow-sm"
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Synopsis (Displays the active season's synopsis!) */}
          <div className="space-y-1">
            <h3 className="font-bold text-gray-200 text-xs sm:text-sm uppercase tracking-wider">
              {activeSeasonName ? `${activeSeasonName} Synopsis` : 'Synopsis'}
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-4xl font-normal">
              {activeOverview}
            </p>
          </div>
        </div>
      </div>

      {/* Video Block & Theater Controls */}
      {type !== 'manga' && (
        <div className="space-y-4 text-left">
          {/* Playback Mode tabs */}
          <div className="flex items-center justify-between border-b border-darkBorder pb-3 flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 border border-darkBorder p-1 rounded-xl bg-black/20 font-semibold overflow-x-auto max-w-full scrollbar-none">
              {detail.youtube_trailer && (
                <button
                  onClick={() => setPlaybackMode('trailer')}
                  className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap shrink-0 ${
                    playbackMode === 'trailer' ? 'bg-accentCyan/10 text-accentCyan font-extrabold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  YouTube Trailer
                </button>
              )}
              <button
                onClick={() => setPlaybackMode('solo-embed')}
                className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap shrink-0 ${
                  playbackMode === 'solo-embed' ? 'bg-accentCyan/10 text-accentCyan font-extrabold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Standard Embed
              </button>
              <button
                onClick={() => setPlaybackMode('solo-html5')}
                className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap shrink-0 ${
                  playbackMode === 'solo-html5' ? 'bg-accentCyan/10 text-accentCyan font-extrabold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Custom Video/Embed
              </button>
            </div>
            
            <span className="text-[10px] text-accentCyan bg-accentCyan/10 border border-accentCyan/20 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider shrink-0">
              Solo Stream: Active
            </span>
          </div>

          {/* Streaming Server Selector (only for Standard Embed) */}
          {playbackMode === 'solo-embed' && (
            <div className="space-y-2 border border-darkBorder bg-black/30 p-3 sm:p-4 rounded-2xl">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accentCyan" />
                  <span className="text-xs sm:text-sm text-gray-300 font-bold uppercase tracking-wider">Streaming Server:</span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-gray-400">Switch server if stream buffers</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-1">
                {STREAMING_SERVERS.map((server) => (
                  <button
                    key={server.key}
                    onClick={() => setEmbedServer(server.key)}
                    className={`group relative px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 sm:gap-2 cursor-pointer ${
                      embedServer === server.key
                        ? 'border-accentCyan bg-accentCyan/15 text-accentCyan shadow-lg shadow-accentCyan/10 ring-1 ring-accentCyan/30'
                        : 'border-darkBorder bg-darkCard/60 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span>{server.label}</span>
                    {server.badge && (
                      <span className={`text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-md border font-semibold ${
                        embedServer === server.key
                          ? 'border-accentCyan/30 bg-accentCyan/20 text-accentCyan'
                          : server.tagColor || 'text-gray-400 bg-white/5 border-white/10'
                      }`}>
                        {server.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Stream Input Box (only for Custom mode) */}
          {playbackMode === 'solo-html5' && (
            <div className="flex flex-col gap-2 border border-darkBorder bg-black/20 p-3.5 sm:p-4 rounded-2xl">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Paste Direct Video URL (.mp4, .m3u8) or Custom Embed URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-grow px-3 sm:px-4 py-2 bg-darkCard border border-darkBorder rounded-xl text-xs sm:text-sm text-gray-200 focus:outline-none focus:border-accentCyan transition"
                />
                {customUrl && (
                  <button
                    onClick={() => setCustomUrl('')}
                    className="px-3 py-2 bg-darkCard border border-darkBorder hover:border-red-500/30 hover:text-red-400 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Players Rendering */}
          <div className="max-w-5xl mx-auto w-full">
            {playbackMode === 'trailer' && detail.youtube_trailer && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-darkBorder shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${detail.youtube_trailer}`}
                  title={`${detail.title} Trailer`}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            )}

            {playbackMode === 'solo-embed' && (
              <EmbedPlayer
                embedUrl={getEmbedUrl()}
                title={detail.title}
              />
            )}

            {playbackMode === 'solo-html5' && (() => {
              const videoSrc = customUrl || detail.video_url || '';
              if (!videoSrc) {
                return (
                  <div className="flex flex-col items-center justify-center aspect-video w-full rounded-2xl bg-darkCard border border-darkBorder text-center p-6 gap-3">
                    <Tv className="w-12 h-12 text-gray-500" />
                    <h4 className="text-lg font-bold text-gray-300">Awaiting stream source...</h4>
                    <p className="text-sm text-gray-500 max-w-sm">Please paste a video URL or embed link above to start playback.</p>
                  </div>
                );
              }

              const isDirectStream = videoSrc.match(/\.(mp4|m3u8|webm|ogg|mp3)(\?.*)?$/i) || 
                                    videoSrc.includes('gtv-videos-bucket') || 
                                    videoSrc.includes('stream') ||
                                    videoSrc.includes('.m3u8');
              
              if (isDirectStream) {
                return (
                  <VideoPlayer
                    src={videoSrc}
                    isHost={true}
                  />
                );
              } else {
                return (
                  <EmbedPlayer embedUrl={videoSrc} title={detail.title} />
                );
              }
            })()}
          </div>

          {/* Season and Episode selector Directory for TV/Anime ONLY - NEVER FOR MOVIES */}
          {isEpisodic && (
            <div className="border border-darkBorder bg-black/10 rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b border-darkBorder/60 pb-3">
                <h4 className="font-bold text-xs sm:text-sm text-gray-300 flex items-center gap-1.5 font-outfit truncate">
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accentCyan fill-current shrink-0" />
                  <span>Episodes Directory</span>
                </h4>

                {/* Season selector (TV shows & Anime - ALWAYS VISIBLE!) */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Season:</span>
                  <select
                    value={activeSeason || 1}
                    onChange={(e) => {
                      const sNum = parseInt(e.target.value, 10);
                      setActiveSeason(sNum);
                      setActiveEpisode(1);
                    }}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-darkCard border border-darkBorder rounded-xl text-xs font-semibold text-gray-200 focus:outline-none focus:border-accentCyan cursor-pointer"
                  >
                    {seasonsList.map((s) => (
                      <option key={s.id || s.season_number} value={s.season_number} className="bg-darkBg font-medium">
                        {s.name || `Season ${s.season_number}`} ({s.episode_count || detail.episodes_count || 12} eps)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vertical Scrollbar Episodes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5 max-h-[300px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-accentCyan/50 scrollbar-track-black/40">
                {(() => {
                  const currentSeasonInfo = detail.seasons?.find(s => s.season_number === activeSeason);
                  const epCount = seasonEpisodes.length > 0
                    ? seasonEpisodes.length
                    : (currentSeasonInfo ? currentSeasonInfo.episode_count : (detail.episodes_count || 12));

                  return Array.from({ length: Math.max(epCount, 1) }, (_, i) => {
                    const epNum = i + 1;
                    const isSelected = activeEpisode === epNum;
                    const epDetail = seasonEpisodes.find(e => e.episode_number === epNum);
                    const matchedAnimeEp = episodes.find(e => parseInt(e.episode || e.number, 10) === epNum);
                    const epTitle = epDetail?.name || matchedAnimeEp?.title || `Episode ${epNum}`;

                    return (
                      <button
                        key={epNum}
                        onClick={() => {
                          setActiveEpisode(epNum);
                          setPlaybackMode('solo-embed');
                        }}
                        className={`p-2 sm:p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 group cursor-pointer ${
                          isSelected
                            ? 'border-accentCyan bg-accentCyan/15 text-accentCyan shadow-md shadow-accentCyan/10 ring-1 ring-accentCyan/30'
                            : 'border-darkBorder bg-darkCard/30 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold text-accentPurple group-hover:text-accentCyan transition">
                          Episode {epNum}
                        </span>
                        <span className="text-[11px] sm:text-xs font-semibold truncate w-full text-gray-200 group-hover:text-white" title={epTitle}>
                          {epTitle}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* ── RELATED SEASONS & SERIES / MOVIES ── */}
          {relatedEntries.length > 0 && (
            <div className="glass-panel border border-darkBorder p-3.5 sm:p-5 rounded-2xl shadow-xl space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between border-b border-darkBorder/60 pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-1 sm:p-1.5 rounded-lg bg-[#10b981]/20 text-[#10b981] flex items-center justify-center shrink-0">
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                  </span>
                  <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-white font-outfit truncate">
                    {type === 'movie' ? 'Related Movies & Franchise' : 'Related Seasons & Series'}
                  </h3>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider font-mono shrink-0">
                  {relatedEntries.length} Entries
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
                {relatedEntries.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.isSeason) {
                        setActiveSeason(item.season_number);
                        setActiveEpisode(1);
                        setPlaybackMode('solo-embed');
                      } else {
                        navigate(`/media/${item.type}/${item.id}`);
                      }
                    }}
                    className={`relative overflow-hidden rounded-xl p-2.5 sm:p-3 text-left transition-all duration-200 group flex flex-col justify-between min-h-[90px] sm:min-h-[95px] cursor-pointer active:scale-95 ${
                      item.isActive
                        ? 'border-2 border-[#10b981] bg-[#10b981]/15 text-white shadow-[0_0_20px_rgba(16,185,129,0.45)] ring-1 ring-[#10b981]'
                        : 'border border-darkBorder bg-darkCard/70 hover:border-white/30 hover:bg-darkCard text-gray-300'
                    }`}
                  >
                    {item.poster_path && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 pointer-events-none transition-opacity"
                        style={{ backgroundImage: `url(${item.poster_path})` }}
                      />
                    )}
                    
                    <div className="relative z-10 space-y-1">
                      <span className={`inline-block text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-md border tracking-wider ${
                        item.isActive
                          ? 'bg-[#10b981] text-black border-[#10b981]'
                          : item.badgeColor
                      }`}>
                        {item.badge}
                      </span>
                      <h4 className="text-[11px] sm:text-xs font-bold line-clamp-2 text-white group-hover:text-accentCyan transition">
                        {item.title}
                      </h4>
                    </div>

                    <div className="relative z-10 pt-2 flex items-center justify-between text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase">
                      <span>{item.type} {item.release_date ? `• ${item.release_date}` : ''}</span>
                      {item.isActive && (
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10b981] animate-ping" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manga Chapters List (Manga content) */}
      {type === 'manga' && (
        <section className="space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 font-outfit">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-accentCyan" />
            MangaDex Chapters Directory
          </h2>

          {activeChapterId ? (
            /* Render Reader inline */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-darkBorder pb-3 flex-wrap gap-2">
                <h3 className="font-semibold text-base sm:text-lg text-accentCyan truncate">
                  Reading: {activeChapterTitle}
                </h3>
                <button
                  onClick={() => {
                    setActiveChapterId(null);
                    setActiveChapterTitle('');
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-darkCard border border-darkBorder hover:border-white/20 rounded-xl text-xs font-semibold text-gray-200 transition"
                >
                  Close Reader & View Chapters
                </button>
              </div>
              
              <MangaReader 
                chapterId={activeChapterId} 
                chapters={chapters}
                onChapterSelect={(chId, chTitle) => {
                  setActiveChapterId(chId);
                  setActiveChapterTitle(chTitle);
                }}
                onChapterComplete={() => {
                  setActiveChapterId(null);
                  setActiveChapterTitle('');
                }}
              />
            </div>
          ) : (
            /* Renders grid of chapters */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-h-[420px] overflow-y-auto pr-2">
              {chapters.length === 0 ? (
                <div className="col-span-full py-8 text-center text-gray-300 border-2 border-dashed border-white/20 rounded-2xl bg-darkCard/80">
                  No English chapters found for this manga.
                </div>
              ) : (
                chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveChapterId(ch.id);
                      setActiveChapterTitle(`Chapter ${ch.chapter}: ${ch.title}`);
                    }}
                    className="bg-[#12182f] border-2 border-accentCyan/50 hover:border-accentCyan hover:bg-accentCyan/20 text-left p-3 sm:p-4 rounded-xl flex items-center justify-between group shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-black text-accentCyan">Chapter {ch.chapter}</p>
                      <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px]">
                        {ch.title}
                      </p>
                    </div>
                    <Play className="w-4 h-4 text-accentCyan group-hover:scale-110 transition-transform fill-current shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {/* Recommendations */}
      {detail.recommendations && detail.recommendations.length > 0 && (
        <section className="border-t border-darkBorder/40 pt-8 sm:pt-12">
          <MediaGrid items={detail.recommendations} title="Suggested Recommendations" />
        </section>
      )}

    </div>
  );
}
