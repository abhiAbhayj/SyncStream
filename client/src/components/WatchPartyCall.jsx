import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Users,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Sparkles,
  Radio,
  Grid,
  X,
  Settings2
} from 'lucide-react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

// Sub-component to guarantee video playback and proper stream attachment
function StreamVideoTile({ stream, isLocal = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.warn('[Video Play]', err));
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      className={`w-full h-full object-cover ${isLocal ? 'transform -scale-x-100' : ''}`}
    />
  );
}

export default function WatchPartyCall({ roomCode }) {
  const socket = useSocket();
  const { user } = useAuth();

  const [inCall, setInCall] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpandedModal, setIsExpandedModal] = useState(false);
  const [gridSize, setGridSize] = useState('medium'); // 'compact' | 'medium' | 'large'
  const [peers, setPeers] = useState({}); // { [socketId]: { socketId, user, stream, audioEnabled, videoEnabled, isSpeaking } }
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // { [socketId]: RTCPeerConnection }
  const audioContextRef = useRef(null);
  const localAnalyserRef = useRef(null);

  // 1. Setup Audio Volume Analyser for speaking detection
  const setupAudioAnalyser = useCallback((stream, onVolumeChange) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;

      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let animFrameId = null;

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        onVolumeChange(average > 18);
        animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();

      return {
        close: () => {
          if (animFrameId) cancelAnimationFrame(animFrameId);
          try { audioCtx.close(); } catch (e) {}
        }
      };
    } catch (err) {
      console.warn('[WebRTC] Audio analyser error:', err);
      return null;
    }
  }, []);

  // 2. Renegotiate with all peers when tracks change (e.g. Camera toggled)
  const renegotiateAllPeers = useCallback(async () => {
    for (const remoteSocketId in peerConnectionsRef.current) {
      const pc = peerConnectionsRef.current[remoteSocketId];
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (socket) {
          socket.emit('webrtc_signal', {
            to: remoteSocketId,
            signal: { sdp: pc.localDescription },
            user: user ? { id: user.id, username: user.username, avatar_url: user.avatar_url } : null
          });
        }
      } catch (err) {
        console.error('[WebRTC] Renegotiation error:', err);
      }
    }
  }, [socket, user]);

  // 3. Create or reuse peer connection
  const createPeerConnection = useCallback((remoteSocketId, remoteUser) => {
    if (peerConnectionsRef.current[remoteSocketId]) {
      return peerConnectionsRef.current[remoteSocketId];
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current[remoteSocketId] = pc;

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc_signal', {
          to: remoteSocketId,
          signal: { candidate: event.candidate },
          user: user ? { id: user.id, username: user.username, avatar_url: user.avatar_url } : null
        });
      }
    };

    // Handle remote track
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      const hasVideo = remoteStream.getVideoTracks().length > 0;

      setPeers((prev) => ({
        ...prev,
        [remoteSocketId]: {
          ...(prev[remoteSocketId] || {}),
          socketId: remoteSocketId,
          user: remoteUser || prev[remoteSocketId]?.user || { username: 'Party Member', avatar_url: 'default_avatar.png' },
          stream: remoteStream,
          audioEnabled: prev[remoteSocketId]?.audioEnabled ?? true,
          videoEnabled: hasVideo,
          isSpeaking: false
        }
      }));

      // Remote audio analyser for speaking detection
      setupAudioAnalyser(remoteStream, (isSpeaking) => {
        setPeers((prev) => {
          if (!prev[remoteSocketId] || prev[remoteSocketId].isSpeaking === isSpeaking) return prev;
          return {
            ...prev,
            [remoteSocketId]: { ...prev[remoteSocketId], isSpeaking }
          };
        });
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        cleanupPeer(remoteSocketId);
      }
    };

    return pc;
  }, [socket, user, setupAudioAnalyser]);

  const cleanupPeer = useCallback((socketId) => {
    if (peerConnectionsRef.current[socketId]) {
      try { peerConnectionsRef.current[socketId].close(); } catch (e) {}
      delete peerConnectionsRef.current[socketId];
    }
    setPeers((prev) => {
      const next = { ...prev };
      delete next[socketId];
      return next;
    });
  }, []);

  // 4. Join Voice/Video Call
  const handleJoinCall = async () => {
    setPermissionError(null);
    setConnecting(true);

    try {
      let stream;
      try {
        // Attempt getting both camera and microphone
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
        setVideoEnabled(true);
      } catch (videoErr) {
        console.warn('[WebRTC] Video request failed, trying audio-only:', videoErr);
        // Fallback to audio only
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true }
        });
        setVideoEnabled(false);
      }

      localStreamRef.current = stream;
      setLocalStream(stream);

      // Local speaking detection
      localAnalyserRef.current = setupAudioAnalyser(stream, setLocalSpeaking);

      setInCall(true);
      setConnecting(false);

      // Notify socket server of joining call
      if (socket) {
        socket.emit('webrtc_join_call', {
          roomCode,
          user: user ? { id: user.id, username: user.username, avatar_url: user.avatar_url } : null,
          audioEnabled: micEnabled,
          videoEnabled: stream.getVideoTracks().length > 0
        });
      }
    } catch (err) {
      console.error('[WebRTC] Media permission error:', err);
      setPermissionError('Microphone or Camera access was denied. Please allow permissions in your browser.');
      setConnecting(false);
    }
  };

  // 5. Leave Call
  const handleLeaveCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);

    if (localAnalyserRef.current) {
      localAnalyserRef.current.close();
      localAnalyserRef.current = null;
    }

    Object.keys(peerConnectionsRef.current).forEach(cleanupPeer);

    if (socket) {
      socket.emit('webrtc_leave_call', { roomCode });
    }

    setInCall(false);
    setPeers({});
    setLocalSpeaking(false);
    setIsExpandedModal(false);
  };

  // 6. Toggle Mic
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks[0].enabled = nextState;
        setMicEnabled(nextState);

        if (socket) {
          socket.emit('webrtc_media_toggle', {
            roomCode,
            audioEnabled: nextState,
            videoEnabled
          });
        }
      }
    }
  };

  // 7. Toggle Camera
  const toggleVideo = async () => {
    if (!inCall) {
      setVideoEnabled(!videoEnabled);
      return;
    }

    if (videoEnabled) {
      // Disable camera tracks
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
          localStreamRef.current.removeTrack(track);
        });
      }
      setVideoEnabled(false);
      setLocalStream(new MediaStream(localStreamRef.current ? localStreamRef.current.getTracks() : []));

      if (socket) {
        socket.emit('webrtc_media_toggle', {
          roomCode,
          audioEnabled: micEnabled,
          videoEnabled: false
        });
      }
      renegotiateAllPeers();
    } else {
      // Enable camera
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        const videoTrack = videoStream.getVideoTracks()[0];

        if (localStreamRef.current) {
          localStreamRef.current.addTrack(videoTrack);
          // Add track to all existing peer connections
          Object.values(peerConnectionsRef.current).forEach((pc) => {
            pc.addTrack(videoTrack, localStreamRef.current);
          });
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }

        setVideoEnabled(true);
        if (socket) {
          socket.emit('webrtc_media_toggle', {
            roomCode,
            audioEnabled: micEnabled,
            videoEnabled: true
          });
        }
        renegotiateAllPeers();
      } catch (err) {
        console.warn('[WebRTC] Camera enable failed:', err);
      }
    }
  };

  // 8. Toggle Deafen (Mute incoming audio)
  const toggleDeafen = () => {
    const nextState = !isDeafened;
    setIsDeafened(nextState);
    Object.values(peers).forEach((p) => {
      if (p.stream) {
        p.stream.getAudioTracks().forEach((track) => {
          track.enabled = !nextState;
        });
      }
    });
  };

  // 9. Socket Signaling Listeners
  useEffect(() => {
    if (!socket || !inCall) return;

    // A. Received existing peers when joining
    const handleExistingPeers = async (existingPeers) => {
      for (const peerInfo of existingPeers) {
        const pc = createPeerConnection(peerInfo.socketId, peerInfo.user);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc_signal', {
            to: peerInfo.socketId,
            signal: { sdp: pc.localDescription },
            user: user ? { id: user.id, username: user.username, avatar_url: user.avatar_url } : null
          });
        } catch (err) {
          console.error('[WebRTC] Create offer error:', err);
        }
      }
    };

    // B. New user joined call
    const handleUserJoinedCall = (peerInfo) => {
      setPeers((prev) => ({
        ...prev,
        [peerInfo.socketId]: {
          socketId: peerInfo.socketId,
          user: peerInfo.user,
          audioEnabled: peerInfo.audioEnabled,
          videoEnabled: peerInfo.videoEnabled,
          stream: null,
          isSpeaking: false
        }
      }));
    };

    // C. WebRTC Signal exchange (Offer, Answer, Candidate)
    const handleSignal = async ({ from, signal, user: remoteUser }) => {
      const pc = createPeerConnection(from, remoteUser);

      try {
        if (signal.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          if (signal.sdp.type === 'offer') {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc_signal', {
              to: from,
              signal: { sdp: pc.localDescription },
              user: user ? { id: user.id, username: user.username, avatar_url: user.avatar_url } : null
            });
          }
        } else if (signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.error('[WebRTC] Signal handling error:', err);
      }
    };

    // D. Remote media toggle (mute/camera)
    const handleMediaToggle = ({ socketId, audioEnabled, videoEnabled }) => {
      setPeers((prev) => {
        if (!prev[socketId]) return prev;
        return {
          ...prev,
          [socketId]: {
            ...prev[socketId],
            audioEnabled: audioEnabled !== undefined ? audioEnabled : prev[socketId].audioEnabled,
            videoEnabled: videoEnabled !== undefined ? videoEnabled : prev[socketId].videoEnabled
          }
        };
      });
    };

    // E. User left call
    const handleUserLeftCall = ({ socketId }) => {
      cleanupPeer(socketId);
    };

    socket.on('webrtc_existing_peers', handleExistingPeers);
    socket.on('webrtc_user_joined_call', handleUserJoinedCall);
    socket.on('webrtc_signal', handleSignal);
    socket.on('webrtc_user_media_toggle', handleMediaToggle);
    socket.on('webrtc_user_left_call', handleUserLeftCall);

    return () => {
      socket.off('webrtc_existing_peers', handleExistingPeers);
      socket.off('webrtc_user_joined_call', handleUserJoinedCall);
      socket.off('webrtc_signal', handleSignal);
      socket.off('webrtc_user_media_toggle', handleMediaToggle);
      socket.off('webrtc_user_left_call', handleUserLeftCall);
    };
  }, [socket, inCall, createPeerConnection, cleanupPeer, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      Object.keys(peerConnectionsRef.current).forEach(cleanupPeer);
    };
  }, [cleanupPeer]);

  const activePeerCount = Object.keys(peers).length + (inCall ? 1 : 0);

  // Render Video Grid Tile
  const renderTile = (socketId, peerUser, stream, hasVideo, isMicOn, isTalking, isLocal = false) => {
    return (
      <div
        key={socketId}
        className={`relative aspect-video rounded-2xl overflow-hidden border bg-[#0d1020] shadow-xl transition-all duration-300 flex items-center justify-center group ${
          isTalking 
            ? 'border-emerald-400 shadow-[0_0_20px_rgba(50,240,160,0.5)] ring-2 ring-emerald-400/50' 
            : 'border-white/15 hover:border-white/30'
        }`}
      >
        {/* Video stream rendering */}
        {hasVideo && stream ? (
          <StreamVideoTile stream={stream} isLocal={isLocal} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 p-3">
            <div className="relative">
              <img
                src={peerUser?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Party'}
                alt={peerUser?.username || 'User'}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white/20 object-cover bg-darkBg shadow-lg ${
                  isTalking ? 'animate-bounce-subtle' : ''
                }`}
              />
              {isTalking && (
                <span className="absolute -inset-1.5 rounded-full border-2 border-emerald-400 animate-ping opacity-75 pointer-events-none" />
              )}
            </div>
          </div>
        )}

        {/* Remote audio playback for peer */}
        {!isLocal && stream && (
          <audio
            autoPlay
            playsInline
            ref={(el) => {
              if (el && el.srcObject !== stream) {
                el.srcObject = stream;
              }
            }}
          />
        )}

        {/* Badges & Name Tag */}
        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[11px] font-bold text-white bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 shadow-md">
          <span className="truncate max-w-[100px]">
            {isLocal ? `You (${peerUser?.username || 'Me'})` : (peerUser?.username || 'Member')}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {!isMicOn && <MicOff className="w-3.5 h-3.5 text-red-400" />}
            {!hasVideo && <VideoOff className="w-3.5 h-3.5 text-gray-400" />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-darkCard/95 transition-all duration-300">
        
        {/* ── Call Header Bar ── */}
        <div className="px-3.5 py-2.5 bg-black/30 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative">
              <Radio className={`w-4 h-4 ${inCall ? 'text-accentCyan animate-pulse' : 'text-gray-400'}`} />
              {inCall && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_6px_#32f0a0]" />
              )}
            </div>
            <span className="text-xs font-bold text-white font-outfit uppercase tracking-wider truncate">
              Party Voice &amp; Video
            </span>
            {inCall && (
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {activePeerCount} in call
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {inCall && (
              <>
                <button
                  onClick={() => setIsExpandedModal(true)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-accentCyan hover:bg-white/10 transition"
                  title="Expand to Full Video Theatre Mode"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                  title={isMinimized ? 'Expand Video Strip' : 'Minimize Video Strip'}
                >
                  {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </>
            )}

            {!inCall ? (
              <button
                onClick={handleJoinCall}
                disabled={connecting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs shadow-lg hover:opacity-90 active:scale-95 transition disabled:opacity-50"
              >
                <PhoneCall className="w-3.5 h-3.5 fill-current" />
                <span>{connecting ? 'Connecting...' : 'Join Call'}</span>
              </button>
            ) : (
              <button
                onClick={handleLeaveCall}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 text-xs font-bold transition active:scale-95"
                title="Leave Call"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            )}
          </div>
        </div>

        {/* Permission Warning */}
        {permissionError && (
          <div className="p-3 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs text-center font-medium">
            {permissionError}
          </div>
        )}

        {/* ── Active Video & Voice Grid (Sidebar Strip) ── */}
        {inCall && !isMinimized && (
          <div className="p-3 space-y-3">
            
            {/* Grid Size Switcher */}
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 pb-1 border-b border-white/5">
              <span>Video Grid</span>
              <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                <button
                  onClick={() => setGridSize('compact')}
                  className={`px-2 py-0.5 rounded text-[10px] transition ${gridSize === 'compact' ? 'bg-accentCyan text-black font-extrabold shadow' : 'hover:text-white'}`}
                >
                  Compact
                </button>
                <button
                  onClick={() => setGridSize('medium')}
                  className={`px-2 py-0.5 rounded text-[10px] transition ${gridSize === 'medium' ? 'bg-accentCyan text-black font-extrabold shadow' : 'hover:text-white'}`}
                >
                  Expanded
                </button>
              </div>
            </div>

            <div className={`grid gap-2.5 max-h-56 sm:max-h-72 overflow-y-auto custom-scrollbar pr-1 ${
              gridSize === 'compact' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
            }`}>
              {/* Local User Tile */}
              {renderTile(
                'local-user',
                user,
                localStream,
                videoEnabled && localStream && localStream.getVideoTracks().length > 0,
                micEnabled,
                localSpeaking,
                true
              )}

              {/* Remote Peer Tiles */}
              {Object.values(peers).map((peer) => {
                const hasVideo = peer.videoEnabled && peer.stream && peer.stream.getVideoTracks().length > 0;
                return renderTile(
                  peer.socketId,
                  peer.user,
                  peer.stream,
                  hasVideo,
                  peer.audioEnabled,
                  peer.isSpeaking,
                  false
                );
              })}
            </div>

            {/* ── In-Call Controls Strip ── */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
              
              {/* Mic Toggle */}
              <button
                onClick={toggleMic}
                className={`px-3 py-1.5 rounded-xl transition active:scale-90 flex items-center gap-1.5 text-xs font-bold ${
                  micEnabled 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                }`}
                title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micEnabled ? <Mic className="w-3.5 h-3.5 text-accentCyan" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{micEnabled ? 'Mute' : 'Unmuted'}</span>
              </button>

              {/* Video Toggle */}
              <button
                onClick={toggleVideo}
                className={`px-3 py-1.5 rounded-xl transition active:scale-90 flex items-center gap-1.5 text-xs font-bold ${
                  videoEnabled 
                    ? 'bg-accentPurple/20 text-accentPurple border border-accentPurple/40 hover:bg-accentPurple/30' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
                title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
              >
                {videoEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                <span>{videoEnabled ? 'Cam On' : 'Cam Off'}</span>
              </button>

              {/* Deafen Toggle */}
              <button
                onClick={toggleDeafen}
                className={`p-2 rounded-xl transition active:scale-90 flex items-center gap-1.5 text-xs font-bold ${
                  !isDeafened 
                    ? 'bg-white/10 text-gray-300 hover:bg-white/20' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                }`}
                title={isDeafened ? 'Undeafen Audio' : 'Deafen (Mute Call Audio)'}
              >
                {isDeafened ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-accentCyan" />}
              </button>

              {/* Maximize to Modal */}
              <button
                onClick={() => setIsExpandedModal(true)}
                className="p-2 rounded-xl bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition"
                title="Fullscreen Video Grid"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

            </div>

          </div>
        )}

        {/* When not in call hint */}
        {!inCall && (
          <div className="p-3 text-center bg-black/10">
            <p className="text-[11px] text-gray-400">
              🎙️ Connect your microphone and camera to talk with watch party members live!
            </p>
          </div>
        )}

      </div>

      {/* ── EXPANDED FULLSCREEN THEATRE MODAL (Large Screen Size Mode) ── */}
      {isExpandedModal && inCall && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-2xl flex flex-col p-4 md:p-8 animate-fade-in">
          
          {/* Modal Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/15 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-accentCyan animate-pulse" />
              <div>
                <h3 className="font-outfit font-extrabold text-lg sm:text-xl text-white">
                  Watch Party Video Theatre
                </h3>
                <p className="text-xs text-gray-400">{activePeerCount} members active in video call</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpandedModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
                title="Minimize Theatre View"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Large Video Grid */}
          <div className="flex-1 max-w-7xl mx-auto w-full py-6 flex items-center justify-center overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full auto-rows-fr max-h-[75vh]">
              {/* Local User */}
              {renderTile(
                'modal-local-user',
                user,
                localStream,
                videoEnabled && localStream && localStream.getVideoTracks().length > 0,
                micEnabled,
                localSpeaking,
                true
              )}

              {/* Remote Peers */}
              {Object.values(peers).map((peer) => {
                const hasVideo = peer.videoEnabled && peer.stream && peer.stream.getVideoTracks().length > 0;
                return renderTile(
                  `modal-${peer.socketId}`,
                  peer.user,
                  peer.stream,
                  hasVideo,
                  peer.audioEnabled,
                  peer.isSpeaking,
                  false
                );
              })}
            </div>
          </div>

          {/* Modal Bottom Controls */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/15 max-w-xl mx-auto w-full">
            <button
              onClick={toggleMic}
              className={`px-4 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition active:scale-95 ${
                micEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {micEnabled ? <Mic className="w-4 h-4 text-accentCyan" /> : <MicOff className="w-4 h-4" />}
              <span>{micEnabled ? 'Mute Mic' : 'Unmute'}</span>
            </button>

            <button
              onClick={toggleVideo}
              className={`px-4 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition active:scale-95 ${
                videoEnabled ? 'bg-accentPurple/20 text-accentPurple border border-accentPurple/40' : 'bg-white/10 text-gray-300'
              }`}
            >
              {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              <span>{videoEnabled ? 'Camera On' : 'Camera Off'}</span>
            </button>

            <button
              onClick={toggleDeafen}
              className={`p-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition active:scale-95 ${
                !isDeafened ? 'bg-white/10 text-gray-300' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
              title="Deafen Audio"
            >
              {isDeafened ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-accentCyan" />}
            </button>

            <button
              onClick={handleLeaveCall}
              className="px-5 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Call</span>
            </button>
          </div>

        </div>
      )}
    </>
  );
}
