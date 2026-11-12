import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw, ShieldAlert, Loader2, Gauge } from 'lucide-react';
import Hls from 'hls.js';

export default function VideoPlayer({ 
  src, 
  isHost = true, 
  socketEvent = null, // { event: 'play'|'pause'|'seek', time: number, trigger: number }
  onStateChange = null // callback: (event, time) => {}
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const isSyncingRef = useRef(false); // Ref to break recursive sync loops
  const hlsRef = useRef(null);
  const tapTimerRef = useRef(null);
  const lastTapRef = useRef({ time: 0, side: null });
  const skipTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [skipRipple, setSkipRipple] = useState(null); // { side: 'left'|'right', key: number, delta: number }

  // 0. Attach HLS.js for .m3u8 streams or native video for MP4
  useEffect(() => {
    if (!src || !videoRef.current) return;
    setIsLoading(true);

    // Cleanup any existing Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls = src.includes('.m3u8') || src.includes('application/x-mpegURL') || src.includes('m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('[HLS] Network error encountered, attempting recovery...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('[HLS] Media error encountered, recovering...');
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src;
    } else {
      videoRef.current.src = src;
    }

    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // 1. Sync playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // 2. Respond to inbound Socket Sync events
  useEffect(() => {
    if (!videoRef.current || !socketEvent) return;

    const { event, time } = socketEvent;
    
    // Set sync flag to ignore outbound triggers
    isSyncingRef.current = true;
    
    console.log(`[Player] Applying socket sync event: '${event}' at ${time}s`);
    
    // Set time
    if (Math.abs(videoRef.current.currentTime - time) > 1.5) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }

    // Set state
    if (event === 'play') {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.warn('Play interrupted:', err));
    } else if (event === 'pause') {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    // Reset sync flag shortly after events settle
    setTimeout(() => {
      isSyncingRef.current = false;
    }, 400);

  }, [socketEvent]);

  // 2.5 Listen for Global Voice Commands
  useEffect(() => {
    const handleVoiceCommand = (e) => {
      if (!videoRef.current) return;
      const { action } = e.detail;

      if (action === 'play') {
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
            triggerOutboundSync('play', videoRef.current.currentTime);
          })
          .catch(err => console.error('Voice play failed:', err));
      } else if (action === 'pause') {
        videoRef.current.pause();
        setIsPlaying(false);
        triggerOutboundSync('pause', videoRef.current.currentTime);
      } else if (action === 'speed') {
        const { value } = e.detail;
        setPlaybackSpeed(value);
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand);
    return () => window.removeEventListener('voice-command', handleVoiceCommand);
  }, []);

  // 3. User interaction triggers (Host only)
  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      triggerOutboundSync('pause', videoRef.current.currentTime);
    } else {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          triggerOutboundSync('play', videoRef.current.currentTime);
        })
        .catch(err => console.error(err));
    }
  };

  const handleSeekChange = (e) => {
    if (!videoRef.current) return;
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    triggerOutboundSync('seek', newTime);
  };

  const seekRelative = (delta) => {
    if (!videoRef.current) return;
    const maxDur = Number.isFinite(videoRef.current.duration) && videoRef.current.duration > 0
      ? videoRef.current.duration
      : Infinity;
    const nextTime = Math.max(0, Math.min(maxDur, (videoRef.current.currentTime || 0) + delta));
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
    triggerOutboundSync('seek', nextTime);

    const side = delta < 0 ? 'left' : 'right';
    setSkipRipple({ side, key: Date.now(), delta: Math.abs(delta) });
    if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    skipTimeoutRef.current = setTimeout(() => setSkipRipple(null), 700);
  };

  // Single-tap Play/Pause + Double-Tap/Click -10s / +10s
  const handleViewportTap = (e) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const side = e.clientX - rect.left < rect.width / 2 ? 'left' : 'right';
    const now = Date.now();

    if (now - lastTapRef.current.time < 280 && lastTapRef.current.side === side) {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }
      lastTapRef.current = { time: 0, side: null };
      seekRelative(side === 'left' ? -10 : 10);
      return;
    }

    lastTapRef.current = { time: now, side };
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapTimerRef.current = null;
      handlePlayPause();
    }, 240);
  };

  const triggerOutboundSync = (event, time) => {
    // Only emit state changes if NOT currently processing an inbound sync event
    if (!isSyncingRef.current && onStateChange) {
      onStateChange(event, time);
    }
  };

  // 4. Video event listeners
  const onPlay = () => {
    setIsPlaying(true);
    if (!isSyncingRef.current) {
      triggerOutboundSync('play', videoRef.current.currentTime);
    }
  };

  const onPause = () => {
    setIsPlaying(false);
    if (!isSyncingRef.current) {
      triggerOutboundSync('pause', videoRef.current.currentTime);
    }
  };

  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);
  };

  // 5. Volume control
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (videoRef.current) {
      videoRef.current.muted = nextMute;
      videoRef.current.volume = nextMute ? 0 : volume;
    }
  };

  // 6. Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error(err));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-darkBorder group flex flex-col items-center justify-center select-none"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
      />

      {/* Interactive Single-Tap / Double-Tap Surface Overlay */}
      <div
        onClick={handleViewportTap}
        aria-label="Tap to play or pause; double tap left or right to seek 10 seconds"
        className="absolute inset-0 bottom-14 sm:bottom-16 z-10 cursor-pointer"
      />

      {/* Double-Tap -10s / +10s Translucent Ripple Arc Feedback */}
      {skipRipple && (
        <div
          key={skipRipple.key}
          aria-hidden="true"
          className={`pointer-events-none absolute top-0 bottom-0 w-1/2 z-20 flex flex-col items-center justify-center bg-accentCyan/15 border-accentCyan/35 backdrop-blur-[2px] animate-skip-ripple ${
            skipRipple.side === 'left'
              ? 'left-0 rounded-r-full border-r'
              : 'right-0 rounded-l-full border-l'
          }`}
        >
          <div className="flex flex-col items-center gap-1 text-white drop-shadow-[0_0_14px_rgba(var(--accent-cyan),0.8)]">
            {skipRipple.side === 'left' ? (
              <RotateCcw className="w-7 h-7 sm:w-9 sm:h-9 text-accentCyan" />
            ) : (
              <RotateCw className="w-7 h-7 sm:w-9 sm:h-9 text-accentCyan" />
            )}
            <span className="text-xs sm:text-sm font-black tracking-wider font-mono text-accentCyan">
              {skipRipple.side === 'left' ? `-${skipRipple.delta}s` : `+${skipRipple.delta}s`}
            </span>
          </div>
        </div>
      )}

      {/* Animated Buffering Matrix Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#050814]/80 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2.5 pointer-events-none z-20 overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(var(--accent-cyan), 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--accent-purple), 0.14) 1px, transparent 1px)',
              backgroundSize: '26px 26px'
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-transparent via-accentCyan/25 to-transparent border-y border-accentCyan/30 animate-cyber-shutter"
          />
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-accentCyan animate-spin relative z-10" />
          <span className="relative z-10 px-2.5 py-1 rounded-full bg-black/75 border border-accentCyan/35 text-[10px] sm:text-xs font-mono font-bold text-accentCyan">
            Buffering Stream...
          </span>
        </div>
      )}

      {/* Party Sync Status label */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/75 backdrop-blur-md text-accentCyan border border-accentCyan/30 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold shadow-lg">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Shared Party Sync</span>
      </div>

      {/* Custom Control Bar overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col gap-1.5 sm:gap-3 z-20">
        
        {/* Progress seek slider */}
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <span className="text-[10px] sm:text-xs font-bold text-gray-300 font-mono">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            className="flex-grow h-1.5 rounded-lg appearance-none bg-white/20 transition-all cursor-pointer hover:h-2 accent-accentCyan"
          />
          <span className="text-[10px] sm:text-xs font-bold text-gray-300 font-mono">{formatTime(duration)}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="p-1.5 sm:p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 hover:border-white/25 active:scale-95 text-white transition cursor-pointer"
              title="Play / Pause stream (Syncs with all party members)"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={toggleMute}
                className="p-1.5 sm:p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="hidden xs:block w-14 sm:w-16 h-1 rounded-lg cursor-pointer bg-white/20 accent-accentCyan"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Playback speed selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] sm:text-xs font-bold text-gray-300 transition"
              >
                <Gauge className="w-3.5 h-3.5" />
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSpeedMenu(false)}></div>
                  <div className="absolute bottom-10 right-0 w-24 bg-darkCard border border-darkBorder rounded-xl p-1 shadow-2xl flex flex-col z-20">
                    {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          setShowSpeedMenu(false);
                        }}
                        className={`text-xs text-left px-2 py-1.5 rounded-lg transition ${
                          playbackSpeed === speed 
                            ? 'bg-accentCyan/10 text-accentCyan font-bold' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition"
            >
              <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
