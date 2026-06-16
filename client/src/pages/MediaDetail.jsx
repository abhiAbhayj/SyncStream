import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MediaGrid from '../components/MediaGrid';
import MangaReader from '../components/MangaReader';
import VideoPlayer from '../components/VideoPlayer';
import EmbedPlayer from '../components/EmbedPlayer';
import { Star, Heart, Tv, BookOpen, Loader2, Play, Users, Film, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function MediaDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [detail, setDetail] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activeChapterTitle, setActiveChapterTitle] = useState('');
  
  // Anime episodes tracking
  const [episodes, setEpisodes] = useState([]);
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeEpisode, setActiveEpisode] = useState(1);
  
  // Streaming server source tracking
  const [embedServer, setEmbedServer] = useState('vidlink');
  const [customUrl, setCustomUrl] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [watchlist, setWatchlist] = useState([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Playback modes for Video Content
  // 'trailer' | 'solo-html5' | 'solo-embed'
  const [playbackMode, setPlaybackMode] = useState('trailer');

  // Fetch all details
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      setActiveChapterId(null);
      try {
        const detailRes = await axios.get(`/api/media/detail/${type}/${id}`);
        const detailData = detailRes.data;
        setDetail(detailData);
        
        if (type === 'tv' && detailData.seasons && detailData.seasons.length > 0) {
          const firstSeason = detailData.seasons.find(s => s.season_number > 0) || detailData.seasons[0];
          setActiveSeason(firstSeason.season_number);
        }

        // If movie/tv we default to trailer, but if no trailer is present, fallback to Embed player
        if (type !== 'manga') {
          if (detailData.youtube_trailer) {
            setPlaybackMode('trailer');
          } else {
            setPlaybackMode('solo-embed');
          }
        }

        // If manga, fetch chapters list
        if (type === 'manga') {
          const chaptersRes = await axios.get(`/api/media/manga/chapters/${id}`);
          setChapters(chaptersRes.data || []);
        }

        // If anime, fetch episodes list
        if (type === 'anime') {
          try {
            const epsRes = await axios.get(`/api/media/anime/episodes/${id}`);
            setEpisodes(epsRes.data || []);
          } catch (epsErr) {
            console.warn('Failed to load anime episodes list:', epsErr.message);
          }
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
    const tmdbId = detail?.tmdb_id || id;
    const isTmdbMovie = detail?.tmdb_type === 'movie' || type === 'movie';

    if (type === 'movie' || (type === 'anime' && isTmdbMovie)) {
      const activeId = type === 'anime' ? tmdbId : id;
      if (embedServer === 'vidlink') return `https://vidlink.pro/movie/${activeId}`;
      if (embedServer === 'vidsrc') return `https://vidsrc.to/embed/movie/${activeId}`;
      if (embedServer === 'vidsrcpm') return `https://vidsrc.pm/embed/movie/${activeId}`;
      if (embedServer === 'vidsrcme') return `https://vidsrc.me/embed/movie/${activeId}`;
      return null;
    }
    if (type === 'tv') {
      const season = activeSeason || 1;
      const episode = activeEpisode || 1;
      if (embedServer === 'vidlink') return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
      if (embedServer === 'vidsrc') return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
      if (embedServer === 'vidsrcpm') return `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`;
      if (embedServer === 'vidsrcme') return `https://vidsrc.me/embed/tv/${id}/${season}/${episode}`;
      return null;
    }
    if (type === 'anime') {
      const episode = activeEpisode || 1;
      if (embedServer === 'vidlink') return `https://vidlink.pro/tv/${tmdbId}/1/${episode}`;
      if (embedServer === 'vidsrc') return `https://vidsrc.to/embed/tv/${tmdbId}/1/${episode}`;
      if (embedServer === 'vidsrcpm') return `https://vidsrc.pm/embed/tv/${tmdbId}/1/${episode}`;
      if (embedServer === 'vidsrcme') return `https://vidsrc.me/embed/tv/${tmdbId}/1/${episode}`;
      return null;
    }
    return null;
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

  return (
    <div className="space-y-12 pb-16">
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-darkBorder bg-darkCard/40 text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 text-xs font-bold uppercase tracking-wider shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-accentCyan" />
          <span>Back</span>
        </button>
      </div>
      
      {/* Media Jumbotron Header with Blur Backdrop */}
      <div className="relative w-full min-h-[40vh] py-12 px-4 md:px-8 border-b border-darkBorder overflow-hidden flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${detail.backdrop_path || detail.poster_path})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-darkBg/80 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-center md:items-start z-10 w-full">
          {/* Poster */}
          <div className="w-[200px] sm:w-[240px] md:w-[280px] aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-darkCard">
            <img 
              src={detail.poster_path || 'https://placehold.co/400x600/1e1e24/fff?text=No+Poster'} 
              alt={detail.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Details */}
          <div className="flex-grow space-y-6 text-center md:text-left">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-outfit">
                {detail.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-semibold text-gray-400">
                <span className="capitalize text-accentCyan bg-accentCyan/10 border border-accentCyan/20 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {type}
                </span>
                {detail.release_date && <span>&bull; {detail.release_date}</span>}
                {detail.vote_average && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    &bull; <Star className="w-4 h-4 fill-current" /> {parseFloat(detail.vote_average).toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-200">Synopsis</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-4xl">
                {detail.overview}
              </p>
            </div>

            {/* Dynamic Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              {/* Watch watchlist */}
              <button
                onClick={handleWatchlistToggle}
                disabled={watchlistLoading}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition border ${
                  inWatchlist
                    ? 'border-accentPink text-accentPink bg-accentPink/15 hover:bg-accentPink/25'
                    : 'border-darkBorder text-gray-300 hover:text-white hover:bg-white/5 bg-black/20'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
                {inWatchlist ? 'Saved in Watchlist' : 'Add to Watchlist'}
              </button>

              {/* Watch party (Only video content) */}
              {type !== 'manga' && (
                <button
                  onClick={handleCreateWatchParty}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-accentCyan to-accentPurple text-black font-extrabold shadow-lg shadow-accentPurple/25 hover:opacity-90 hover:scale-102 transition btn-glow-purple"
                >
                  <Users className="w-4 h-4 text-black fill-current" />
                  Host watch Party
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Player Console (Video content) */}
      {type !== 'manga' && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-darkBorder pb-3 flex-wrap gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-outfit">
              <Film className="w-5 h-5 text-accentCyan" />
              Solo Stream Player Console
            </h2>

            {/* Tab selection */}
            <div className="flex items-center gap-2 border border-darkBorder p-1 rounded-xl bg-black/20">
              {detail.youtube_trailer && (
                <button
                  onClick={() => setPlaybackMode('trailer')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                    playbackMode === 'trailer' ? 'bg-accentCyan/10 text-accentCyan' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  YouTube Trailer
                </button>
              )}
              <button
                onClick={() => setPlaybackMode('solo-embed')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                  playbackMode === 'solo-embed' ? 'bg-accentCyan/10 text-accentCyan' : 'text-gray-400 hover:text-white'
                }`}
              >
                Standard Embed
              </button>
              <button
                onClick={() => setPlaybackMode('solo-html5')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                  playbackMode === 'solo-html5' ? 'bg-accentCyan/10 text-accentCyan' : 'text-gray-400 hover:text-white'
                }`}
              >
                Custom Video/Embed
              </button>
            </div>
          </div>

          {/* Server Mirror Selection Buttons (Only for standard embeds) */}
          {playbackMode === 'solo-embed' && (
            <div className="flex items-center gap-3 flex-wrap text-sm border border-darkBorder bg-black/20 p-3 rounded-2xl">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Streaming Server:</span>
              {[
                { key: 'vidlink', label: 'Server 1 (VidLink)' },
                { key: 'vidsrc', label: 'Server 2 (VidSrc)' },
                { key: 'vidsrcpm', label: 'Server 3 (VidSrc.pm)' },
                { key: 'vidsrcme', label: 'Server 4 (VidSrc.me)' }
              ].map((server) => {
                return (
                <button
                  key={server.key}
                  onClick={() => setEmbedServer(server.key)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition border ${
                    embedServer === server.key
                      ? 'border-accentCyan bg-accentCyan/15 text-accentCyan shadow-md shadow-accentCyan/5'
                      : 'border-darkBorder bg-darkCard/50 text-gray-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  {server.label}
                </button>
              );
              })}
            </div>
          )}

          {/* Render Player based on mode */}
          <div className="max-w-5xl mx-auto">
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
            
            {playbackMode === 'solo-html5' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2 border border-darkBorder bg-black/20 p-4 rounded-2xl max-w-3xl mx-auto text-left">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Paste Direct Video URL (.mp4, .m3u8) or Custom Embed URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="flex-grow px-4 py-2 bg-darkCard border border-darkBorder rounded-xl text-sm text-gray-200 focus:outline-none focus:border-accentCyan transition"
                    />
                    {customUrl && (
                      <button
                        onClick={() => setCustomUrl('')}
                        className="px-3 py-2 bg-darkCard border border-darkBorder hover:border-red-500/30 hover:text-red-400 rounded-xl text-xs font-bold transition"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">
                    Direct video formats will use the native HTML5 player. Other URLs (including custom embeds) will load in an isolated iframe.
                  </p>
                </div>

                <div className="max-w-5xl mx-auto">
                  {(() => {
                    const videoSrc = customUrl || detail.video_url || '';
                    if (!videoSrc) {
                      return (
                        <div className="flex flex-col items-center justify-center aspect-video w-full rounded-2xl bg-darkCard border border-darkBorder text-center p-6 gap-3">
                          <Play className="w-12 h-12 text-gray-500" />
                          <h4 className="text-lg font-bold text-gray-300">Enter a video or embed URL above</h4>
                          <p className="text-sm text-gray-500 max-w-sm">Paste a stream source to start watching.</p>
                        </div>
                      );
                    }

                    // Check if it looks like an embed URL rather than a direct stream
                    const isDirectStream = videoSrc.match(/\.(mp4|m3u8|webm|ogg|mp3)(\?.*)?$/i) || 
                                          videoSrc.includes('gtv-videos-bucket') || 
                                          videoSrc.includes('stream') ||
                                          videoSrc.includes('.m3u8');
                    
                    if (isDirectStream) {
                      return (
                        <div className="space-y-4">
                          <VideoPlayer src={videoSrc} isHost={true} />
                          <p className="text-xs text-gray-500 text-center">
                            Playing direct HTML5 stream source. In watch parties, this mode supports real-time sync.
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <EmbedPlayer embedUrl={videoSrc} title={detail.title} />
                      );
                    }
                  })()}
                </div>
              </div>
            )}

            {playbackMode === 'solo-embed' && (
              <EmbedPlayer
                embedUrl={getEmbedUrl()}
                title={detail.title}
              />
            )}
          </div>
        </section>
      )}

      {/* Manga Chapters List (Manga content) */}
      {type === 'manga' && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 font-outfit">
            <BookOpen className="w-5 h-5 text-accentCyan" />
            MangaDex Chapters Directory
          </h2>

          {activeChapterId ? (
            /* Render Reader inline */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-darkBorder pb-3">
                <h3 className="font-semibold text-lg text-accentCyan">
                  Reading: {activeChapterTitle}
                </h3>
                <button
                  onClick={() => {
                    setActiveChapterId(null);
                    setActiveChapterTitle('');
                  }}
                  className="px-4 py-2 bg-darkCard border border-darkBorder hover:border-white/20 rounded-xl text-xs font-semibold text-gray-200 transition"
                >
                  Close Reader & View Chapters
                </button>
              </div>
              
              <MangaReader 
                chapterId={activeChapterId} 
                onChapterComplete={() => {
                  setActiveChapterId(null);
                  setActiveChapterTitle('');
                }}
              />
            </div>
          ) : (
            /* Renders grid of chapters */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {chapters.length === 0 ? (
                <div className="col-span-full py-8 text-center text-gray-500 border border-dashed border-darkBorder rounded-2xl bg-darkCard/10">
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
                    className="glass-card text-left p-4 rounded-xl border border-darkBorder flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-accentCyan">Chapter {ch.chapter}</p>
                      <p className="text-sm font-semibold text-gray-200 truncate max-w-[180px] group-hover:text-white">
                        {ch.title}
                      </p>
                    </div>
                    <Play className="w-4 h-4 text-gray-500 group-hover:text-accentCyan transition-colors fill-current" />
                  </button>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {/* Episodes List (Anime and TV content) */}
      {(type === 'anime' || type === 'tv') && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-darkBorder pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-outfit">
              <Tv className="w-5 h-5 text-accentCyan" />
              {type === 'anime' ? 'Anime Episodes Directory' : 'TV Shows Episodes Directory'}
            </h2>

            {/* Season Selector for TV Shows */}
            {type === 'tv' && detail.seasons && detail.seasons.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Season:</span>
                <select
                  value={activeSeason}
                  onChange={(e) => {
                    setActiveSeason(parseInt(e.target.value, 10));
                    setActiveEpisode(1); // Reset to ep 1 on season change
                  }}
                  className="px-4 py-2 bg-darkCard border border-darkBorder rounded-xl text-xs font-semibold text-gray-200 focus:outline-none focus:border-accentCyan transition cursor-pointer"
                >
                  {detail.seasons.map((s) => (
                    <option key={s.id} value={s.season_number} className="bg-darkBg">
                      {s.name} ({s.episode_count} eps)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[300px] overflow-y-auto pr-2 text-left">
            {(() => {
              if (type === 'anime') {
                const totalCount = detail.episodes_count || 12;
                const generatedEpisodes = Array.from({ length: totalCount }, (_, i) => {
                  const epNum = i + 1;
                  const matchedEp = episodes.find(e => parseInt(e.episode, 10) === epNum);
                  return {
                    id: epNum,
                    episode: epNum.toString(),
                    title: matchedEp?.title || `Episode ${epNum}`
                  };
                });

                return generatedEpisodes.map((ep) => {
                  const epNum = ep.id;
                  const isSelected = activeEpisode === epNum;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => {
                        setActiveEpisode(epNum);
                        setPlaybackMode('solo-embed');
                      }}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 group ${
                        isSelected
                          ? 'border-accentCyan bg-accentCyan/15 text-accentCyan'
                          : 'border-darkBorder bg-darkCard/50 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-accentPurple group-hover:text-accentCyan transition">
                        Episode {ep.episode}
                      </span>
                      <span className="text-xs font-semibold truncate w-full text-gray-200 group-hover:text-white">
                        {ep.title}
                      </span>
                    </button>
                  );
                });
              } else {
                // TV Shows episode list
                const currentSeasonInfo = detail.seasons?.find(s => s.season_number === activeSeason);
                const epCount = currentSeasonInfo ? currentSeasonInfo.episode_count : 1;
                
                return Array.from({ length: epCount }, (_, i) => {
                  const epNum = i + 1;
                  const isSelected = activeEpisode === epNum;
                  return (
                    <button
                      key={epNum}
                      onClick={() => {
                        setActiveEpisode(epNum);
                        setPlaybackMode('solo-embed');
                      }}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 group ${
                        isSelected
                          ? 'border-accentCyan bg-accentCyan/15 text-accentCyan'
                          : 'border-darkBorder bg-darkCard/50 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-accentPurple group-hover:text-accentCyan transition">
                        Episode {epNum}
                      </span>
                      <span className="text-xs font-semibold truncate w-full text-gray-200 group-hover:text-white">
                        Episode {epNum}
                      </span>
                    </button>
                  );
                });
              }
            })()}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {detail.recommendations && detail.recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 border-t border-darkBorder/40 pt-12">
          <MediaGrid items={detail.recommendations} title="Suggested Recommendations" />
        </section>
      )}

    </div>
  );
}
