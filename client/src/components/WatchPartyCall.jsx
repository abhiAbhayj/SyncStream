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
  Radio
} from 'lucide-react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export default function WatchPartyCall({ roomCode }) {
  const socket = useSocket();
  const { user } = useAuth();

  const [inCall, setInCall] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [peers, setPeers] = useState({}); // { [socketId]: { socketId, user, stream, audioEnabled, videoEnabled, isSpeaking } }
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnectionsRef = useRef({}); // { [socketId]: RTCPeerConnection }
  const audioContextRef = useRef(null);
  const localAnalyserRef = useRef(null);

  // 1. Setup Audio Volume Analyser for speaking indicator
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
        onVolumeChange(average > 18); // Speaking threshold
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

  // 2. Create or reuse peer connection
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
      setPeers((prev) => ({
        ...prev,
        [remoteSocketId]: {
          ...(prev[remoteSocketId] || {}),
          socketId: remoteSocketId,
          user: remoteUser || prev[remoteSocketId]?.user || { username: 'Party Member', avatar_url: 'default_avatar.png' },
          stream: remoteStream,
          audioEnabled: prev[remoteSocketId]?.audioEnabled ?? true,
          videoEnabled: prev[remoteSocketId]?.videoEnabled ?? remoteStream.getVideoTracks().length > 0,
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

  // 3. Join Voice/Video Call
  const handleJoinCall = async () => {
    setPermissionError(null);
    setConnecting(true);

    try {
      let stream;
      try {
        // Try getting both audio and video
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: videoEnabled ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false
        });
      } catch (mediaErr) {
        console.warn('[WebRTC] Video/audio combo failed, falling back to audio only:', mediaErr);
        // Fallback to audio only if video device rejected or absent
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true }
        });
        setVideoEnabled(false);
      }

      localStreamRef.current = stream;

      // Handle local video playback
      if (localVideoRef.current && stream.getVideoTracks().length > 0) {
        localVideoRef.current.srcObject = stream;
      }

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
          videoEnabled: videoEnabled && stream.getVideoTracks().length > 0
        });
      }
    } catch (err) {
      console.error('[WebRTC] Media permission denied or unavailable:', err);
      setPermissionError('Microphone or Camera access was denied. Please allow device permissions in your browser.');
      setConnecting(false);
    }
  };

  // 4. Leave Call
  const handleLeaveCall = () => {
    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localAnalyserRef.current) {
      localAnalyserRef.current.close();
      localAnalyserRef.current = null;
    }

    // Close peer connections
    Object.keys(peerConnectionsRef.current).forEach(cleanupPeer);

    if (socket) {
      socket.emit('webrtc_leave_call', { roomCode });
    }

    setInCall(false);
    setPeers({});
    setLocalSpeaking(false);
  };

  // 5. Toggle Mic
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

  // 6. Toggle Camera
  const toggleVideo = async () => {
    if (!inCall) {
      setVideoEnabled(!videoEnabled);
      return;
    }

    if (videoEnabled) {
      // Turn camera off
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.stop();
          localStreamRef.current.removeTrack(track);
        });
      }
      setVideoEnabled(false);
      if (socket) {
        socket.emit('webrtc_media_toggle', {
          roomCode,
          audioEnabled: micEnabled,
          videoEnabled: false
        });
      }
    } else {
      // Turn camera on
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
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }

        setVideoEnabled(true);
        if (socket) {
          socket.emit('webrtc_media_toggle', {
            roomCode,
            audioEnabled: micEnabled,
            videoEnabled: true
          });
        }
      } catch (err) {
        console.warn('[WebRTC] Camera enable failed:', err);
      }
    }
  };

  // 7. Toggle Deafen (Mute incoming audio)
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

  // 8. Socket Signaling Listeners
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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      Object.keys(peerConnectionsRef.current).forEach(cleanupPeer);
    };
  }, [cleanupPeer]);

  const activePeerCount = Object.keys(peers).length + (inCall ? 1 : 0);

  return (
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
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              title={isMinimized ? 'Expand Video Grid' : 'Minimize Video Grid'}
            >
              {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          )}

          {!inCall ? (
            <button
              onClick={handleJoinCall}
              disabled={connecting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs shadow-lg hover:opacity-90 active:scale-95 transition disabled:opacity-50"
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

      {/* ── Active Video & Voice Grid ── */}
      {inCall && !isMinimized && (
        <div className="p-3 space-y-3">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 sm:max-h-60 overflow-y-auto custom-scrollbar pr-1">
            
            {/* 1. Local User Tile */}
            <div className={`relative aspect-video rounded-xl overflow-hidden border bg-black/50 shadow-md transition-all duration-300 flex items-center justify-center ${
              localSpeaking 
                ? 'border-emerald-400 shadow-[0_0_15px_rgba(50,240,160,0.4)] ring-2 ring-emerald-400/40' 
                : 'border-white/15'
            }`}>
              {videoEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 p-2">
                  <div className="relative">
                    <img
                      src={user?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Me'}
                      alt="You"
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/20 object-cover bg-darkBg ${
                        localSpeaking ? 'animate-bounce-subtle' : ''
                      }`}
                    />
                    {localSpeaking && (
                      <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping opacity-75 pointer-events-none" />
                    )}
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md">
                <span className="truncate max-w-[70px]">You {user ? `(${user.username})` : ''}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {!micEnabled && <MicOff className="w-3 h-3 text-red-400" />}
                  {!videoEnabled && <VideoOff className="w-3 h-3 text-gray-400" />}
                </div>
              </div>
            </div>

            {/* 2. Remote Peer Tiles */}
            {Object.values(peers).map((peer) => {
              const hasVideo = peer.videoEnabled && peer.stream && peer.stream.getVideoTracks().length > 0;
              return (
                <div
                  key={peer.socketId}
                  className={`relative aspect-video rounded-xl overflow-hidden border bg-black/50 shadow-md transition-all duration-300 flex items-center justify-center ${
                    peer.isSpeaking 
                      ? 'border-emerald-400 shadow-[0_0_15px_rgba(50,240,160,0.4)] ring-2 ring-emerald-400/40' 
                      : 'border-white/15'
                  }`}
                >
                  {/* Remote Video */}
                  {hasVideo ? (
                    <video
                      autoPlay
                      playsInline
                      ref={(el) => {
                        if (el && peer.stream && el.srcObject !== peer.stream) {
                          el.srcObject = peer.stream;
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 p-2">
                      <div className="relative">
                        <img
                          src={peer.user?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=Friend'}
                          alt={peer.user?.username || 'Peer'}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/20 object-cover bg-darkBg ${
                            peer.isSpeaking ? 'animate-bounce-subtle' : ''
                          }`}
                        />
                        {peer.isSpeaking && (
                          <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping opacity-75 pointer-events-none" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hidden Remote Audio Element for clean playback */}
                  {peer.stream && (
                    <audio
                      autoPlay
                      playsInline
                      ref={(el) => {
                        if (el && peer.stream && el.srcObject !== peer.stream) {
                          el.srcObject = peer.stream;
                        }
                      }}
                    />
                  )}

                  {/* Remote Badge */}
                  <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md">
                    <span className="truncate max-w-[70px]">{peer.user?.username || 'Member'}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {!peer.audioEnabled && <MicOff className="w-3 h-3 text-red-400" />}
                      {!peer.videoEnabled && <VideoOff className="w-3 h-3 text-gray-400" />}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

          {/* ── In-Call Controls Strip ── */}
          <div className="flex items-center justify-center gap-2 pt-1 border-t border-white/10">
            
            {/* Mic Toggle */}
            <button
              onClick={toggleMic}
              className={`p-2 rounded-xl transition active:scale-90 flex items-center gap-1.5 text-xs font-bold ${
                micEnabled 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
              }`}
              title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micEnabled ? <Mic className="w-4 h-4 text-accentCyan" /> : <MicOff className="w-4 h-4" />}
              <span>{micEnabled ? 'Mute' : 'Unmuted'}</span>
            </button>

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`p-2 rounded-xl transition active:scale-90 flex items-center gap-1.5 text-xs font-bold ${
                videoEnabled 
                  ? 'bg-accentPurple/20 text-accentPurple border border-accentPurple/40 hover:bg-accentPurple/30' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
              title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
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
  );
}
