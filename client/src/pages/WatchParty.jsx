import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import VideoPlayer from '../components/VideoPlayer';
import EmbedPlayer from '../components/EmbedPlayer';
import ChatSidebar from '../components/ChatSidebar';
import WatchPartyCall from '../components/WatchPartyCall';
import { STREAMING_SERVERS, getEmbedStreamUrl } from '../utils/streamingServers';
import { Copy, Users, Tv, ShieldAlert, Loader2, ArrowLeft, Play, Film, Radio, Sparkles, Layers, Star } from 'lucide-react';

export default function WatchParty() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const socket = useSocket();

  const [room, setRoom] = useState(null);
  const [mediaDetail, setMediaDetail] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantsCount, setParticipantsCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [partyNotifications, setPartyNotifications] = useState([]);

  const addNotification = (text, type = 'join') => {
    const id = Date.now() + Math.random();
    setPartyNotifications(prev => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      setPartyNotifications(prev => prev.filter(n => n.id !== id));
    }, 4500);
  };

  // Streaming console states (Default: VidSrc PM - 100% Sandbox Protected)
  const [playbackMode, setPlaybackMode] = useState('trailer');
  const [embedServer, setEmbedServer] = useState('vidsrcpm');
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [customUrl, setCustomUrl] = useState('');

  // Anime episodes metadata list
  const [episodes, setEpisodes] = useState([]);

  // TV episodes metadata list (for titles)
  const [seasonEpisodes, setSeasonEpisodes] = useState([]);
  const [currentSeasonData, setCurrentSeasonData] = useState(null);

  // Incoming sync state from host socket
  const [inboundSyncEvent, setInboundSyncEvent] = useState(null);

  // 1. Fetch Room and Media Info
  useEffect(() => {
    const initRoom = async () => {
      setLoading(true);
      setError(null);
      try {
        // A. Fetch Room Details
        const roomRes = await axios.get(`/api/rooms/${code}`);
        const roomData = roomRes.data.room;
        setRoom(roomData);

        // B. Fetch Media details
        const mediaRes = await axios.get(`/api/media/detail/${roomData.media_type}/${roomData.external_media_id}`);
        const detailData = mediaRes.data;
        setMediaDetail(detailData);

        // Set default playback mode based on trailer presence
        if (detailData.youtube_trailer) {
          setPlaybackMode('trailer');
        } else {
          setPlaybackMode('solo-embed');
        }

        // TV / Anime series seasons initialization
        if ((roomData.media_type === 'tv' || roomData.media_type === 'anime') && detailData.seasons && detailData.seasons.length > 0) {
          const firstSeason = detailData.seasons.find(s => s.season_number > 0) || detailData.seasons[0];
          setActiveSeason(firstSeason.season_number);
        }

        // Anime episodes list loading
        if (roomData.media_type === 'anime') {
          try {
            const epsRes = await axios.get(`/api/media/anime/episodes/${roomData.external_media_id}`);
            setEpisodes(epsRes.data || []);
          } catch (epsErr) {
            console.warn('Failed to load anime episodes list:', epsErr.message);
          }
        }
      } catch (err) {
        console.error('Watch party init failed:', err);
        setError(err.response?.data?.error || 'Room not found or has been closed.');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      initRoom();
    }
  }, [code]);

  // 1.5 Fetch Season Episodes for TV & Anime
  useEffect(() => {
    if ((room?.media_type === 'tv' || room?.media_type === 'anime') && activeSeason !== null) {
      const fetchSeason = async () => {
        try {
          const res = await axios.get(`/api/media/tv/${room.external_media_id}/season/${activeSeason}`);
          setCurrentSeasonData(res.data);
          setSeasonEpisodes(res.data.episodes || []);
        } catch (err) {
          console.error('Failed to load season details:', err);
        }
      };
      fetchSeason();
    }
  }, [room, activeSeason]);

  // 2. Join socket room & register event listeners
  useEffect(() => {
    if (!socket || !room || !user) return;

    // A. Join room tunnel
    socket.emit('join_room', { roomCode: code, username: user.username });

    // B. Register listeners
    socket.on('media_sync_initial', (state) => {
      console.log('[Socket] Initial media state synced:', state);
      setInboundSyncEvent({ ...state, trigger: Date.now() });
      if (state.playbackMode) setPlaybackMode(state.playbackMode);
      if (state.embedServer) setEmbedServer(state.embedServer);
      if (state.activeSeason) setActiveSeason(state.activeSeason);
      if (state.activeEpisode) setActiveEpisode(state.activeEpisode);
      if (state.customUrl) setCustomUrl(state.customUrl);
    });

    socket.on('media_sync', (state) => {
      // Ignore sync events if we are the host (to prevent cycles)
      if (user.id === room.host_id) return;
      console.log('[Socket] Media sync request received:', state);
      setInboundSyncEvent({ ...state, trigger: Date.now() });
      if (state.playbackMode) setPlaybackMode(state.playbackMode);
      if (state.embedServer) setEmbedServer(state.embedServer);
      if (state.activeSeason) setActiveSeason(state.activeSeason);
      if (state.activeEpisode) setActiveEpisode(state.activeEpisode);
      if (state.customUrl) setCustomUrl(state.customUrl);
    });

    socket.on('user_joined', ({ username }) => {
      setParticipantsCount(prev => prev + 1);
      if (username !== user.username) {
        addNotification(`👋 ${username} joined the watch party!`, 'join');
      }
    });

    socket.on('user_left', ({ username }) => {
      setParticipantsCount(prev => Math.max(prev - 1, 1));
      if (username !== user.username) {
        addNotification(`🚪 ${username} left the room`, 'leave');
      }
    });

    // C. Leave room cleanup
    return () => {
      socket.emit('leave_room', { roomCode: code, username: user.username });
      socket.off('media_sync_initial');
      socket.off('media_sync');
      socket.off('user_joined');
      socket.off('user_left');
    };
  }, [socket, room, user, code]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = user?.id === room?.host_id;

  const emitRoomState = (changes = {}) => {
    if (!socket || !user || !room || !isHost) return;
    
    const payload = {
      roomCode: code,
      sender: user.username,
      playbackMode: changes.playbackMode !== undefined ? changes.playbackMode : playbackMode,
      embedServer: changes.embedServer !== undefined ? changes.embedServer : embedServer,
      activeSeason: changes.activeSeason !== undefined ? changes.activeSeason : activeSeason,
      activeEpisode: changes.activeEpisode !== undefined ? changes.activeEpisode : activeEpisode,
      customUrl: changes.customUrl !== undefined ? changes.customUrl : customUrl,
      event: changes.event || 'update_state',
      time: changes.time !== undefined ? changes.time : (inboundSyncEvent?.time || 0)
    };
    
    socket.emit('media_sync', payload);
  };

  const handleHostStateChange = (event, time) => {
    emitRoomState({ event, time });
  };

  const handlePlaybackModeChange = (mode) => {
    setPlaybackMode(mode);
    emitRoomState({ playbackMode: mode });
  };

  const handleServerChange = (serverKey) => {
    setEmbedServer(serverKey);
    emitRoomState({ embedServer: serverKey });
  };

  const handleSeasonChange = (seasonNum) => {
    setActiveSeason(seasonNum);
    setActiveEpisode(1);
    emitRoomState({ activeSeason: seasonNum, activeEpisode: 1 });
  };

  const handleEpisodeChange = (epNum) => {
    setActiveEpisode(epNum);
    emitRoomState({ activeEpisode: epNum });
  };

  const handleCustomUrlChange = (url) => {
    setCustomUrl(url);
    emitRoomState({ customUrl: url });
  };

  const getEmbedUrl = () => {
    if (!mediaDetail || !room) return null;
    const type = room.media_type;
    const id = room.external_media_id;
    const tmdbId = mediaDetail.tmdb_id || id;
    const isTmdbMovie = mediaDetail.tmdb_type === 'movie' || type === 'movie';
    const activeType = (type === 'anime' && isTmdbMovie) ? 'movie' : type;

    return getEmbedStreamUrl({
      serverKey: embedServer,
      mediaType: activeType,
      id,
      tmdbId,
      season: activeSeason || 1,
      episode: activeEpisode || 1
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-36 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-accentCyan" />
        <p className="text-gray-400 font-medium">Entering Watch Party lobby...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-lg mx-auto text-center space-y-4 my-12">
        <p className="text-red-400 font-bold">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-darkCard border border-darkBorder hover:border-white/20 rounded-xl text-sm font-semibold text-gray-200 transition flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Discovery
        </button>
      </div>
    );
  }



  const isEpisodic = (room?.media_type === 'tv' || room?.media_type === 'anime');
  const currentSeason = isEpisodic ? (mediaDetail?.seasons?.find(s => s.season_number === activeSeason) || mediaDetail?.seasons?.[0]) : null;
  const activeOverview = (isEpisodic && (currentSeasonData?.overview || currentSeason?.overview)) ? (currentSeasonData?.overview || currentSeason?.overview) : (mediaDetail?.overview || 'No synopsis available for this title.');
  const activePoster = (isEpisodic && currentSeasonData?.poster_path)
    ? (currentSeasonData.poster_path.startsWith('http') ? currentSeasonData.poster_path : `https://image.tmdb.org/t/p/w500${currentSeasonData.poster_path}`)
    : (isEpisodic && currentSeason?.poster_path ? currentSeason.poster_path : mediaDetail?.poster_path);
  const activeSeasonName = isEpisodic ? (currentSeason?.name || `Season ${activeSeason}`) : '';

  const seasonsList = isEpisodic
    ? ((mediaDetail?.seasons && mediaDetail.seasons.length > 0)
        ? mediaDetail.seasons
        : [{ id: 1, season_number: 1, name: 'Season 1', episode_count: mediaDetail?.episodes_count || 12 }])
    : [];

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const relatedEntries = (() => {
    if (!mediaDetail) return [];
    const list = [];
    
    // 1. All seasons from mediaDetail.seasons (only for TV & Anime)
    if (isEpisodic && mediaDetail.seasons && mediaDetail.seasons.length > 0) {
      mediaDetail.seasons.forEach((s) => {
        let badge = `SEASON ${s.season_number}`;
        if (s.season_number === 0) badge = 'SPECIAL';
        else if (s.name && s.name.toLowerCase().includes('ova')) badge = 'OVA';
        else if (s.name && s.name.toLowerCase().includes('special')) badge = 'SPECIAL';
        else if (s.name && s.name.toLowerCase() !== `season ${s.season_number}` && s.name.length <= 12) badge = s.name.toUpperCase();

        list.push({
          id: `season_${s.season_number}`,
          season_number: s.season_number,
          title: s.name || `${mediaDetail.title} Season ${s.season_number}`,
          badge,
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          type: 'tv',
          release_date: s.air_date ? s.air_date.split('-')[0] : (mediaDetail.release_date?.split('-')[0] || ''),
          poster_path: s.poster_path || mediaDetail.poster_path,
          isSeason: true,
          isActive: (activeSeason || 1) === s.season_number
        });
      });
    }

    // 2. Any related franchise movies/series from mediaDetail.related_franchise
    if (mediaDetail.related_franchise && mediaDetail.related_franchise.length > 0) {
      const hasCurrent = mediaDetail.related_franchise.some(rf => String(rf.id) === String(mediaDetail.id));

      if (!isEpisodic && !hasCurrent) {
        list.push({
          id: mediaDetail.id,
          title: mediaDetail.title,
          badge: 'NOW PLAYING',
          badgeColor: 'bg-[#10b981] text-black border-[#10b981]',
          type: 'movie',
          release_date: mediaDetail.release_date ? mediaDetail.release_date.split('-')[0] : '',
          poster_path: mediaDetail.poster_path,
          isSeason: false,
          isActive: true
        });
      }

      mediaDetail.related_franchise.forEach((rf) => {
        const isCurrentActive = String(rf.id) === String(mediaDetail.id);
        list.push({
          id: rf.id,
          title: rf.title,
          badge: isCurrentActive ? 'NOW PLAYING' : (rf.badge || (rf.type === 'movie' ? 'MOVIE' : 'TV')),
          badgeColor: isCurrentActive 
            ? 'bg-[#10b981] text-black border-[#10b981]' 
            : (rf.type === 'movie' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'),
          type: rf.type || 'movie',
          release_date: rf.release_date ? rf.release_date.split('-')[0] : '',
          poster_path: rf.poster_path || mediaDetail.poster_path,
          isSeason: false,
          isActive: isCurrentActive
        });
      });
    }

    return list;
  })();

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8 space-y-5 sm:space-y-6 relative">
      
      {/* ── Floating Room Join/Leave Toast Notifications ── */}
      {partyNotifications.length > 0 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] flex flex-col gap-2 pointer-events-none items-center px-4 w-full max-w-md">
          {partyNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`px-3.5 py-2 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-2.5 text-xs font-bold animate-fade-in pointer-events-auto ${
                notif.type === 'join'
                  ? 'bg-darkCard/95 border-emerald-500/40 text-emerald-400 shadow-[0_0_25px_rgba(50,240,160,0.35)]'
                  : 'bg-darkCard/95 border-amber-500/40 text-amber-400 shadow-[0_0_25px_rgba(255,200,0,0.25)]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-accentCyan shrink-0" />
              <span className="truncate">{notif.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Top Controls Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 glass-panel border border-darkBorder p-3.5 sm:p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={handleBack}
            className="shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border-2 border-accentCyan bg-[#0f1428] text-white hover:bg-accentCyan hover:text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(var(--accent-cyan),0.5)] ring-1 ring-accentCyan/40 transition-all duration-200 active:scale-95 cursor-pointer z-30 group"
            title="Go Back"
          >
            <span className="p-0.5 sm:p-1 rounded-lg bg-accentCyan text-black group-hover:bg-black group-hover:text-accentCyan transition-colors flex items-center justify-center shrink-0">
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            </span>
            <span className="font-extrabold tracking-wider">Back</span>
          </button>
          
          <div className="space-y-0.5 min-w-0 flex-1">
            <h1 className="font-extrabold text-base sm:text-lg md:text-xl text-white font-outfit truncate">
              Watch Party: {mediaDetail.title}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1 truncate">
              Host: <span className="text-accentCyan font-semibold truncate">{room.host_username}</span>
            </p>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
          {/* Active Participants count */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-darkBg border border-darkBorder px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs text-gray-400 font-semibold shrink-0">
            <Users className="w-3.5 h-3.5 text-accentPurple shrink-0" />
            <span>{participantsCount} in Room</span>
          </div>

          {/* Share Room Code Button */}
          <button
            onClick={handleCopyCode}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition border cursor-pointer shrink-0 ${
              copied
                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                : 'border-darkBorder text-gray-300 bg-darkCard/50 hover:bg-white/5'
            }`}
          >
            <Copy className="w-3.5 h-3.5 shrink-0" />
            <span>{copied ? 'Code Copied!' : `Share Code: ${code}`}</span>
          </button>
        </div>
      </div>

      {/* ── Media Details Overview Card AT THE TOP (Requested by User) ── */}
      <div className="glass-panel border border-darkBorder p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-5 md:gap-6 items-start">
        <div className="w-[120px] sm:w-[150px] md:w-[180px] aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-darkCard shrink-0 mx-auto md:mx-0">
          {activePoster ? (
            <img 
              src={activePoster} 
              alt={mediaDetail.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-tr from-gray-800 to-gray-900">
              <span className="font-bold text-sm mb-1 text-white">{mediaDetail.title}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">No Poster</span>
            </div>
          )}
        </div>

        <div className="flex-grow space-y-3 text-left w-full">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-outfit">
                {mediaDetail.title}
              </h2>
              {isEpisodic && activeSeason && (
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider">
                  {activeSeasonName}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-semibold">
              <span className="capitalize text-accentCyan bg-accentCyan/10 border border-accentCyan/20 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider">
                {room.media_type}
              </span>
              {currentSeason?.air_date ? (
                <span>• Season Air: {currentSeason.air_date}</span>
              ) : (
                mediaDetail.release_date && <span>• {mediaDetail.release_date}</span>
              )}
              {mediaDetail.vote_average && (
                <span className="flex items-center gap-1 text-yellow-400">
                  • <Star className="w-3.5 h-3.5 fill-current" /> {parseFloat(mediaDetail.vote_average).toFixed(1)}
                </span>
              )}
            </div>

            {/* Genres */}
            {mediaDetail.genres && mediaDetail.genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {mediaDetail.genres.map((g, idx) => (
                  <span
                    key={g.id || `${g.name}-${idx}`}
                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/5 text-gray-300 border border-white/10"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Synopsis (Displays the active season's synopsis!) */}
          <div className="space-y-1">
            <h3 className="font-bold text-gray-200 text-xs uppercase tracking-wider">
              {isEpisodic && activeSeasonName ? `${activeSeasonName} Synopsis` : 'Synopsis'}
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-4xl font-normal">
              {activeOverview}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Player on left, Chat on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Video Block */}
        <div className="lg:col-span-2 space-y-4 text-left">
          
          {/* Playback Mode tabs for host / Indicators for participants */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-darkBorder pb-3 gap-3">
            <div className="flex items-center gap-1 sm:gap-2 border border-darkBorder p-1 rounded-xl bg-black/20 font-semibold overflow-x-auto max-w-full">
              {mediaDetail.youtube_trailer && (
                <button
                  disabled={!isHost}
                  onClick={() => handlePlaybackModeChange('trailer')}
                  className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                    playbackMode === 'trailer' ? 'bg-accentCyan/10 text-accentCyan font-extrabold' : 'text-gray-400 hover:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  YouTube Trailer
                </button>
              )}
              <button
                disabled={!isHost}
                onClick={() => handlePlaybackModeChange('solo-embed')}
                className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  playbackMode === 'solo-embed' ? 'bg-accentCyan/10 text-accentCyan font-extrabold' : 'text-gray-400 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Standard Embed
              </button>
              <button
                disabled={!isHost}
                onClick={() => handlePlaybackModeChange('solo-html5')}
                className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  playbackMode === 'solo-html5' ? 'bg-accentCyan/10 text-accentCyan font-extrabold' : 'text-gray-400 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Custom Video/Embed
              </button>
            </div>
            
            {!isHost && (
              <span className="text-[10px] text-accentCyan bg-accentCyan/10 border border-accentCyan/20 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider self-start sm:self-auto shrink-0">
                Sync Mode: Active
              </span>
            )}
          </div>

          {/* Streaming Server Selector (only for Standard Embed) */}
          {playbackMode === 'solo-embed' && (
            <div className="space-y-2 border border-darkBorder bg-black/30 p-3 sm:p-4 rounded-2xl">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accentCyan shrink-0" />
                  <span className="text-[11px] sm:text-xs text-gray-300 font-bold uppercase tracking-wider">Streaming Server:</span>
                </div>
                {!isHost ? (
                  <span className="text-[10px] sm:text-[11px] text-gray-400">Host controls active streaming server</span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] text-gray-400">Switch server if stream buffers</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-1">
                {STREAMING_SERVERS.map((server) => (
                  <button
                    key={server.key}
                    disabled={!isHost}
                    onClick={() => handleServerChange(server.key)}
                    className={`group relative px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 sm:gap-2 ${
                      embedServer === server.key
                        ? 'border-accentCyan bg-accentCyan/15 text-accentCyan shadow-lg shadow-accentCyan/10 ring-1 ring-accentCyan/30'
                        : 'border-darkBorder bg-darkCard/60 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed'
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
            <div className="flex flex-col gap-2 border border-darkBorder bg-black/20 p-4 rounded-2xl">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {isHost ? 'Paste Direct Video URL (.mp4, .m3u8) or Custom Embed URL:' : 'Custom Stream Source (Selected by Host):'}
              </label>
              <input
                disabled={!isHost}
                type="text"
                placeholder={isHost ? "e.g. https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" : "No stream source has been loaded yet."}
                value={customUrl}
                onChange={(e) => handleCustomUrlChange(e.target.value)}
                className="w-full px-4 py-2 bg-darkCard border border-darkBorder rounded-xl text-sm text-gray-200 focus:outline-none focus:border-accentCyan transition disabled:opacity-75"
              />
            </div>
          )}

          {/* Players Rendering */}
          <div className="max-w-5xl mx-auto w-full">
            {playbackMode === 'trailer' && mediaDetail.youtube_trailer && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-darkBorder shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${mediaDetail.youtube_trailer}`}
                  title={`${mediaDetail.title} Trailer`}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            )}

            {playbackMode === 'solo-embed' && (
              <EmbedPlayer
                embedUrl={getEmbedUrl()}
                title={mediaDetail.title}
              />
            )}

            {playbackMode === 'solo-html5' && (() => {
              const videoSrc = customUrl || mediaDetail.video_url || '';
              if (!videoSrc) {
                return (
                  <div className="flex flex-col items-center justify-center aspect-video w-full rounded-2xl bg-darkCard border border-darkBorder text-center p-6 gap-3">
                    <Tv className="w-12 h-12 text-gray-500" />
                    <h4 className="text-lg font-bold text-gray-300">Awaiting stream source...</h4>
                    <p className="text-sm text-gray-500 max-w-sm">The host must load a custom media stream URL to start synchronized playback.</p>
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
                    isHost={isHost}
                    socketEvent={inboundSyncEvent}
                    onStateChange={handleHostStateChange}
                  />
                );
              } else {
                return (
                  <EmbedPlayer embedUrl={videoSrc} title={mediaDetail.title} />
                );
              }
            })()}
          </div>

          {/* Season and Episode selector Directory for TV/Anime ONLY - NEVER FOR MOVIES */}
          {isEpisodic && (
            <div className="border border-darkBorder bg-black/10 rounded-2xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-darkBorder/60 pb-3">
                <h4 className="font-bold text-sm text-gray-300 flex items-center gap-1.5 font-outfit">
                  <Play className="w-4 h-4 text-accentCyan fill-current" />
                  Episodes Directory
                </h4>

                {/* Season selector (TV shows & Anime - ALWAYS VISIBLE!) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Season:</span>
                  <select
                    disabled={!isHost}
                    value={activeSeason || 1}
                    onChange={(e) => handleSeasonChange(parseInt(e.target.value, 10))}
                    className="px-3 py-1.5 bg-darkCard border border-darkBorder rounded-xl text-xs font-semibold text-gray-200 focus:outline-none focus:border-accentCyan cursor-pointer disabled:opacity-75"
                    title={!isHost ? "Host controls active season" : "Select season"}
                  >
                    {seasonsList.map((s) => (
                      <option key={s.id || s.season_number} value={s.season_number} className="bg-darkBg font-medium">
                        {s.name || `Season ${s.season_number}`} ({s.episode_count || 12} eps)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vertical Scrollbar Episodes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accentCyan/50 scrollbar-track-black/40">
                {(() => {
                  const currentSeasonInfo = mediaDetail.seasons?.find(s => s.season_number === activeSeason);
                  const epCount = seasonEpisodes.length > 0
                    ? seasonEpisodes.length
                    : (currentSeasonInfo ? currentSeasonInfo.episode_count : (mediaDetail.episodes_count || 12));

                  return Array.from({ length: Math.max(epCount, 1) }, (_, i) => {
                    const epNum = i + 1;
                    const isSelected = activeEpisode === epNum;
                    const epDetail = seasonEpisodes.find(e => e.episode_number === epNum);
                    const matchedAnimeEp = episodes.find(e => parseInt(e.episode || e.number, 10) === epNum);
                    const epTitle = epDetail?.name || matchedAnimeEp?.title || `Episode ${epNum}`;

                    return (
                      <button
                        key={epNum}
                        disabled={!isHost}
                        onClick={() => handleEpisodeChange(epNum)}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 group ${
                          isSelected
                            ? 'border-accentCyan bg-accentCyan/15 text-accentCyan'
                            : 'border-darkBorder bg-darkCard/30 text-gray-400 hover:text-white disabled:opacity-50'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold text-accentPurple group-hover:text-accentCyan transition">
                          Episode {epNum}
                        </span>
                        <span className="text-[11px] font-semibold truncate w-full text-gray-200 group-hover:text-white" title={epTitle}>
                          {epTitle}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* ── RELATED SEASONS & SERIES / MOVIES in WatchParty ── */}
          {relatedEntries.length > 0 && (
            <div className="glass-panel border border-darkBorder p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-darkBorder/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#10b981]/20 text-[#10b981] flex items-center justify-center">
                    <Layers className="w-4 h-4 stroke-[2.5]" />
                  </span>
                  <h3 className="font-black text-sm uppercase tracking-wider text-white font-outfit">
                    {room.media_type === 'movie' ? 'Related Movies & Franchise' : 'Related Seasons & Series'}
                  </h3>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">
                  {relatedEntries.length} Entries
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                {relatedEntries.map((item) => (
                  <button
                    key={item.id}
                    disabled={!isHost && item.isSeason}
                    onClick={() => {
                      if (item.isSeason) {
                        handleSeasonChange(item.season_number);
                      }
                    }}
                    className={`relative overflow-hidden rounded-xl p-2.5 sm:p-3 text-left transition-all duration-200 group flex flex-col justify-between min-h-[85px] sm:min-h-[90px] ${
                      isHost ? 'cursor-pointer active:scale-95' : 'cursor-default'
                    } ${
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

          {/* Sync status footer */}
          <div className="bg-black/20 border border-darkBorder/40 p-4 rounded-xl space-y-1">
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              {isHost 
                ? "💡 You are the room host. Switching players, streaming servers, seasons, episodes, or pasting custom links will synchronize participants automatically."
                : "💡 Live synchronized session active. Standard players, seasons, episodes, and stream wraps are synchronized. Enjoy the show!"}
            </p>
          </div>
        </div>

        {/* Interactive Call & Chat Block */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <WatchPartyCall roomCode={code} />
          <div className="h-[450px] lg:h-[500px]">
            <ChatSidebar roomCode={code} />
          </div>
        </div>

      </div>

    </div>
  );
}
