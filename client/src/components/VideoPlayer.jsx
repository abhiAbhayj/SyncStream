import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, ShieldAlert, Loader2, Gauge } from 'lucide-react';

export default function VideoPlayer({ 
  src, 
  isHost = true, 
  socketEvent = null, // { event: 'play'|'pause'|'seek', time: number, trigger: number }
  onStateChange = null // callback: (event, time) => {}
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const isSyncingRef = useRef(false); // Ref to break recursive sync loops

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

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
    if (!videoRef.current || !isHost) return;
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    triggerOutboundSync('seek', newTime);
  };

  const triggerOutboundSync = (event, time) => {
    // Only emit state changes if we are the host and NOT currently processing an inbound sync event
    if (isHost && !isSyncingRef.current && onStateChange) {
      onStateChange(event, time);
    }
  };

  // 4. Video event listeners
  const onPlay = () => {
    setIsPlaying(true);
    if (!isSyncingRef.current && isHost) {
      triggerOutboundSync('play', videoRef.current.currentTime);
    }
  };

  const onPause = () => {
    setIsPlaying(false);
    if (!isSyncingRef.current && isHost) {
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
        src={src}
        className="w-full h-full object-contain cursor-pointer"
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onClick={isHost ? handlePlayPause : undefined}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none z-10">
          <Loader2 className="w-12 h-12 text-accentCyan animate-spin" />
        </div>
      )}

      {/* Sync Warning banner (For non-hosts) */}
      {!isHost && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-accentPurple/20 backdrop-blur-md text-accentPurple border border-accentPurple/30 px-3 py-1.5 rounded-xl text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          Synchronized to Host controls
        </div>
      )}

      {/* Host Control Status label */}
      {isHost && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-accentCyan/20 backdrop-blur-md text-accentCyan border border-accentCyan/30 px-3 py-1.5 rounded-xl text-xs font-semibold">
          <Play className="w-3 h-3 fill-current" />
          Watch Host Controls Active
        </div>
      )}

      {/* Custom Control Bar overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col gap-3 z-20">
        
        {/* Progress seek slider */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-xs font-bold text-gray-300 font-mono">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            disabled={!isHost}
            onChange={handleSeekChange}
            className={`flex-grow h-1.5 rounded-lg appearance-none bg-white/20 transition-all ${
              isHost ? 'cursor-pointer hover:h-2 accent-accentCyan' : 'cursor-not-allowed opacity-75'
            }`}
          />
          <span className="text-xs font-bold text-gray-300 font-mono">{formatTime(duration)}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={isHost ? handlePlayPause : undefined}
              disabled={!isHost}
              className={`p-2 rounded-xl border text-white transition ${
                isHost 
                  ? 'border-white/10 bg-white/5 hover:bg-white/15 hover:border-white/25 active:scale-95' 
                  : 'border-transparent bg-transparent opacity-50 cursor-not-allowed'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 rounded-lg cursor-pointer bg-white/20 accent-accentCyan"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Playback speed selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition"
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
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
