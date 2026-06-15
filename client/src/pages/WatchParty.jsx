import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import VideoPlayer from '../components/VideoPlayer';
import EmbedPlayer from '../components/EmbedPlayer';
import ChatSidebar from '../components/ChatSidebar';
import { Copy, Users, Tv, ShieldAlert, Loader2, ArrowLeft, Play, Film } from 'lucide-react';

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

  // Streaming console states
  const [playbackMode, setPlaybackMode] = useState('trailer');
  const [embedServer, setEmbedServer] = useState('vidsrc.to');
  const [activeSeason, setActiveSeason] = useState(1);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [customUrl, setCustomUrl] = useState('');

  // Anime episodes metadata list
  const [episodes, setEpisodes] = useState([]);

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

        // TV series seasons initialization
        if (roomData.media_type === 'tv' && detailData.seasons && detailData.seasons.length > 0) {
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
    });

    socket.on('user_left', ({ username }) => {
      setParticipantsCount(prev => Math.max(prev - 1, 1));
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

    if (type === 'movie' || (type === 'anime' && isTmdbMovie)) {
      const activeId = type === 'anime' ? tmdbId : id;
      if (embedServer === 'vidsrc.to') return `https://vidsrc.to/embed/movie/${activeId}`;
      if (embedServer === 'vidsrc.me') return `https://vidsrc.me/embed/movie/${activeId}`;
      if (embedServer === 'vidsrc.xyz') return `https://vidsrc.xyz/embed/movie/${activeId}`;
      if (embedServer === 'vidsrc.pm') return `https://vidsrc.pm/embed/movie/${activeId}`;
      if (embedServer === 'vidsrc.net') return `https://vidsrc.net/embed/movie/${activeId}`;
      return null;
    }
    if (type === 'tv') {
      const season = activeSeason || 1;
      const episode = activeEpisode || 1;
      if (embedServer === 'vidsrc.to') return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
      if (embedServer === 'vidsrc.me') return `https://vidsrc.me/embed/tv/${id}/${season}/${episode}`;
      if (embedServer === 'vidsrc.xyz') return `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`;
      if (embedServer === 'vidsrc.pm') return `https://vidsrc.pm/embed/tv/${id}/${season}/${episode}`;
      if (embedServer === 'vidsrc.net') return `https://vidsrc.net/embed/tv/${id}/${season}/${episode}`;
      return null;
    }
    if (type === 'anime') {
      const episode = activeEpisode || 1;
      if (embedServer === 'vidsrc.to') return `https://vidsrc.to/embed/tv/${tmdbId}/1/${episode}`;
      if (embedServer === 'vidsrc.me') return `https://vidsrc.me/embed/tv/${tmdbId}/1/${episode}`;
      if (embedServer === 'vidsrc.xyz') return `https://vidsrc.xyz/embed/tv/${tmdbId}/1/${episode}`;
      if (embedServer === 'vidsrc.pm') return `https://vidsrc.pm/embed/tv/${tmdbId}/1/${episode}`;
      if (embedServer === 'vidsrc.net') return `https://vidsrc.net/embed/tv/${tmdbId}/1/${episode}`;
      return null;
    }
    return null;
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



  return (
    <div className="max-w-7xl mx-auto py-6 px-4 md:px-8 space-y-6">
      
      {/* Top Controls Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel border border-darkBorder p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/media/${room.media_type}/${room.external_media_id}`)}
            className="p-2 border border-darkBorder hover:border-white/10 hover:bg-white/5 rounded-xl transition"
            title="Go Back to Detail Page"
          >
            <ArrowLeft className="w-4 h-4 text-gray-300" />
          </button>
          
          <div className="space-y-1">
            <h1 className="font-extrabold text-lg md:text-xl text-white font-outfit line-clamp-1">
              Watch Party: {mediaDetail.title}
            </h1>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              Host: <span className="text-accentCyan font-semibold">{room.host_username}</span>
            </p>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Participants count */}
          <div className="flex items-center gap-2 bg-darkBg border border-darkBorder px-3 py-2 rounded-xl text-xs text-gray-400 font-semibold">
            <Users className="w-4 h-4 text-accentPurple" />
            {participantsCount} in Room
          </div>

          {/* Share Room Code Button */}
          <button
            onClick={handleCopyCode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
              copied
                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                : 'border-darkBorder text-gray-300 bg-darkCard/50 hover:bg-white/5'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Code Copied!' : `Share Code: ${code}`}
          </button>
        </div>
      </div>

      {/* Main Grid: Player on left, Chat on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Video Block */}
        <div className="lg:col-span-2 space-y-4 text-left">
          
          {/* Playback Mode tabs for host / Indicators for participants */}
          <div className="flex items-center justify-between border-b border-darkBorder pb-3 flex-wrap gap-4">
            <div className="flex items-center gap-2 border border-darkBorder p-1 rounded-xl bg-black/20 font-semibold">
              {mediaDetail.youtube_trailer && (
                <button
                  disabled={!isHost}
                  onClick={() => handlePlaybackModeChange('trailer')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                    playbackMode === 'trailer' ? 'bg-accentCyan/10 text-accentCyan' : 'text-gray-400 hover:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  YouTube Trailer
                </button>
              )}
              <button
                disabled={!isHost}
                onClick={() => handlePlaybackModeChange('solo-embed')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                  playbackMode === 'solo-embed' ? 'bg-accentCyan/10 text-accentCyan' : 'text-gray-400 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Standard Embed
              </button>
              <button
                disabled={!isHost}
                onClick={() => handlePlaybackModeChange('solo-html5')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                  playbackMode === 'solo-html5' ? 'bg-accentCyan/10 text-accentCyan' : 'text-gray-400 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Custom Video/Embed
              </button>
            </div>
            
            {!isHost && (
              <span className="text-[10px] text-accentCyan bg-accentCyan/10 border border-accentCyan/20 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
                Sync Mode: Active
              </span>
            )}
          </div>

          {/* Streaming Server Selector (only for Standard Embed) */}
          {playbackMode === 'solo-embed' && (
            <div className="flex items-center gap-3 flex-wrap text-sm border border-darkBorder bg-black/20 p-3 rounded-2xl">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Streaming Server:</span>
              {[
                { key: 'vidsrc.to', label: 'Server 1 (VidSrc.to)' },
                { key: 'vidsrc.me', label: 'Server 2 (VidSrc.me)' },
                { key: 'vidsrc.xyz', label: 'Server 3 (VidSrc.xyz)' },
                { key: 'vidsrc.pm', label: 'Server 4 (VidSrc.pm)' },
                { key: 'vidsrc.net', label: 'Server 5 (VidSrc.net)' }
              ].map((server) => (
                <button
                  key={server.key}
                  disabled={!isHost}
                  onClick={() => handleServerChange(server.key)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition border ${
                    embedServer === server.key
                      ? 'border-accentCyan bg-accentCyan/15 text-accentCyan shadow-md'
                      : 'border-darkBorder bg-darkCard/50 text-gray-400 hover:text-white disabled:opacity-50'
                  }`}
                >
                  {server.label}
                </button>
              ))}
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

          {/* Season and Episode selector Directory for TV/Anime */}
          {(room.media_type === 'tv' || room.media_type === 'anime') && (
            <div className="border border-darkBorder bg-black/10 rounded-2xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-darkBorder/60 pb-3">
                <h4 className="font-bold text-sm text-gray-300 flex items-center gap-1.5 font-outfit">
                  <Play className="w-4 h-4 text-accentCyan fill-current" />
                  Episodes Directory
                </h4>

                {/* Season selector (TV shows only) */}
                {room.media_type === 'tv' && mediaDetail.seasons && mediaDetail.seasons.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Season:</span>
                    <select
                      disabled={!isHost}
                      value={activeSeason}
                      onChange={(e) => handleSeasonChange(parseInt(e.target.value, 10))}
                      className="px-3 py-1.5 bg-darkCard border border-darkBorder rounded-xl text-xs font-semibold text-gray-200 focus:outline-none focus:border-accentCyan cursor-pointer disabled:opacity-75"
                    >
                      {mediaDetail.seasons.map((s) => (
                        <option key={s.id} value={s.season_number} className="bg-darkBg font-medium">
                          {s.name} ({s.episode_count} eps)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[200px] overflow-y-auto pr-2">
                {(() => {
                  if (room.media_type === 'anime') {
                    const totalCount = mediaDetail.episodes_count || 12;
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
                          disabled={!isHost}
                          onClick={() => handleEpisodeChange(epNum)}
                          className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 group ${
                            isSelected
                              ? 'border-accentCyan bg-accentCyan/15 text-accentCyan'
                              : 'border-darkBorder bg-darkCard/30 text-gray-400 hover:text-white disabled:opacity-50'
                          }`}
                        >
                          <span className="text-[9px] uppercase font-bold text-accentPurple group-hover:text-accentCyan transition">
                            Episode {ep.episode}
                          </span>
                          <span className="text-[11px] font-semibold truncate w-full text-gray-200 group-hover:text-white">
                            {ep.title}
                          </span>
                        </button>
                      );
                    });
                  } else {
                    const currentSeasonInfo = mediaDetail.seasons?.find(s => s.season_number === activeSeason);
                    const epCount = currentSeasonInfo ? currentSeasonInfo.episode_count : 1;
                    
                    return Array.from({ length: epCount }, (_, i) => {
                      const epNum = i + 1;
                      const isSelected = activeEpisode === epNum;
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
                          <span className="text-[11px] font-semibold truncate w-full text-gray-200 group-hover:text-white">
                            Episode {epNum}
                          </span>
                        </button>
                      );
                    });
                  }
                })()}
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

        {/* Interactive Chat Block */}
        <div className="lg:col-span-1 h-[550px] lg:h-auto">
          <ChatSidebar roomCode={code} />
        </div>

      </div>

    </div>
  );
}
