import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const MusicContext = createContext();

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

// Helper: Check if track is sourced from YouTube
export const isYouTubeTrack = (track) => {
  if (!track) return false;
  return (
    track.source === 'youtube' ||
    (typeof track.id === 'string' && track.id.startsWith('yt_')) ||
    (typeof track.audio_url === 'string' && (track.audio_url.includes('youtube.com') || track.audio_url.includes('youtu.be'))) ||
    Boolean(track.youtube_id)
  );
};

// Helper: Extract 11-char YouTube Video ID
export const extractYouTubeId = (track) => {
  if (!track) return null;
  if (track.youtube_id) return track.youtube_id;
  if (typeof track.id === 'string' && track.id.startsWith('yt_')) {
    return track.id.replace('yt_', '');
  }
  if (typeof track.audio_url === 'string') {
    const match = track.audio_url.match(/(?:v=|\/embed\/|youtu\.be\/|\/v\/|\/e\/|watch\?v=)([^&?#/ ]{11})/);
    if (match) return match[1];
  }
  return null;
};

// Silent 1-second WAV data URI to keep background audio alive on mobile browsers during YouTube playback
const SILENT_AUDIO_URI = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

const cleanText = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
};

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const isYtReadyRef = useRef(false);
  const pendingYtIdRef = useRef(null);
  const ytPollingRef = useRef(null);

  // ── Favorites & Playlists State ──
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('syncstream_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('syncstream_user_playlists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentTrack, setCurrentTrack] = useState(() => {
    try {
      const saved = localStorage.getItem('syncstream_last_track');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('syncstream_music_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [volume, setVolumeState] = useState(() => {
    try {
      const saved = localStorage.getItem('syncstream_music_vol');
      if (saved) {
        const val = parseFloat(saved);
        return isNaN(val) ? 0.85 : val;
      }
      return 0.85;
    } catch {
      return 0.85;
    }
  });
  
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState('none'); // 'none' | 'track' | 'queue'
  const [isShuffling, setIsShuffling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);
  const [songForPlaylistModal, setSongForPlaylistModal] = useState(null);
  const [modalTab, setModalTabState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('syncstream_music_modal_tab');
      return saved && ['player', 'lyrics', 'queue'].includes(saved) ? saved : 'player';
    } catch {
      return 'player';
    }
  });

  const isLoopingRef = useRef(isLooping);
  isLoopingRef.current = isLooping;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentTrackRef = useRef(currentTrack);
  currentTrackRef.current = currentTrack;

  const openAddToPlaylist = useCallback((song) => {
    if (song) {
      setSongForPlaylistModal(song);
    }
  }, []);

  const closeAddToPlaylist = useCallback(() => {
    setSongForPlaylistModal(null);
  }, []);

  const setModalTab = useCallback((tab) => {
    const validTab = ['player', 'lyrics', 'queue'].includes(tab) ? tab : 'player';
    setModalTabState(validTab);
    try {
      sessionStorage.setItem('syncstream_music_modal_tab', validTab);
    } catch (e) {}
  }, []);

  const openPlayerModal = useCallback(() => {
    setModalTab('player');
    setIsExpanded(true);
  }, [setModalTab]);

  const openLyricsModal = useCallback(() => {
    setModalTab('lyrics');
    setIsExpanded(true);
  }, [setModalTab]);

  const openQueueModal = useCallback(() => {
    setModalTab('queue');
    setIsExpanded(true);
  }, [setModalTab]);

  // Next Track forward declaration
  const nextTrackRef = useRef(null);

  // Play a single track and set as active queue (Dual-Engine: YouTube + HTML5)
  const playTrack = useCallback((track, trackList = null) => {
    if (!track) return;

    setPlaybackError(null);
    setCurrentTrack(track);
    currentTrackRef.current = track;
    setCurrentTime(0);
    setDuration(track.duration || 0);

    if (trackList && trackList.length > 0) {
      setQueue(trackList);
      const idx = trackList.findIndex(t => t.id === track.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else {
      setQueue(prev => {
        const exists = prev.some(t => t.id === track.id);
        if (!exists) return [...prev, track];
        return prev;
      });
    }

    if (isYouTubeTrack(track)) {
      // Start background carrier on HTML5 audio for mobile lockscreen/background session
      if (audioRef.current) {
        try {
          audioRef.current.src = SILENT_AUDIO_URI;
          audioRef.current.loop = true;
          audioRef.current.volume = 0.0001;
          audioRef.current.play().catch(() => {});
        } catch (e) {}
      }

      const ytId = extractYouTubeId(track);
      if (ytId) {
        setIsLoading(true);
        if (isYtReadyRef.current && ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
          try {
            const safeVol = isNaN(volume) ? 0.85 : volume;
            ytPlayerRef.current.setVolume(isMuted ? 0 : safeVol * 100);
            ytPlayerRef.current.loadVideoById(ytId);
            ytPlayerRef.current.playVideo();
          } catch (e) {
            console.warn('[YT Load Error]:', e);
          }
        } else {
          pendingYtIdRef.current = ytId;
        }
      }
    } else {
      // JioSaavn / Direct Audio track -> Pause YouTube player
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch (e) {}
      }

      const audio = audioRef.current;
      if (audio && track.audio_url) {
        setIsLoading(true);
        audio.loop = false;
        const safeVol = isNaN(volume) ? 0.85 : volume;
        audio.volume = isMuted ? 0 : safeVol;
        if (audio.src !== track.audio_url) {
          audio.src = track.audio_url;
        }
        audio.currentTime = 0;
        audio.play().then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        }).catch(err => {
          console.warn('[Audio Playback Error]:', err.message);
          setIsPlaying(false);
          setIsLoading(false);
        });
      }
    }

    try {
      localStorage.setItem('syncstream_last_track', JSON.stringify(track));
    } catch (e) {}
  }, [volume, isMuted]);

  // Seek to specific second across both engines
  const seek = useCallback((time) => {
    const clamped = Math.max(0, Math.min(time, duration || 0));
    setCurrentTime(clamped);

    if (isYouTubeTrack(currentTrack)) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        try {
          ytPlayerRef.current.seekTo(clamped, true);
        } catch (e) {}
      }
    } else {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = clamped;
      }
    }
  }, [duration, currentTrack]);

  // 10s Skip Forward
  const skipForward = useCallback((seconds = 10) => {
    const target = Math.min(currentTime + seconds, duration || 0);
    seek(target);
  }, [currentTime, duration, seek]);

  // 10s Skip Backward
  const skipBackward = useCallback((seconds = 10) => {
    const target = Math.max(currentTime - seconds, 0);
    seek(target);
  }, [currentTime, seek]);

  // Play entire queue starting at specific index
  const playQueue = useCallback((trackList, startIndex = 0) => {
    if (!trackList || trackList.length === 0) return;
    const target = trackList[startIndex] || trackList[0];
    setQueue(trackList);
    setQueueIndex(startIndex);
    playTrack(target, trackList);
  }, [playTrack]);

  // Next Track
  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;
    if (isShuffling && queue.length > 1) {
      let rand = Math.floor(Math.random() * queue.length);
      while (rand === queueIndex && queue.length > 1) {
        rand = Math.floor(Math.random() * queue.length);
      }
      nextIndex = rand;
    } else if (nextIndex >= queue.length) {
      if (isLooping === 'queue') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIndex);
    const nxt = queue[nextIndex];
    if (nxt) {
      playTrack(nxt, queue);
    }
  }, [queue, queueIndex, isShuffling, isLooping, playTrack]);

  nextTrackRef.current = nextTrack;

  // Previous Track
  const prevTrack = useCallback(() => {
    if (currentTime > 3) {
      seek(0);
      return;
    }

    if (queue.length === 0) return;

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = isLooping === 'queue' ? queue.length - 1 : 0;
    }

    setQueueIndex(prevIndex);
    const prv = queue[prevIndex];
    if (prv) {
      playTrack(prv, queue);
    }
  }, [currentTime, queue, queueIndex, isLooping, seek, playTrack]);

  // Toggle Play / Pause for dual engine
  const togglePlay = useCallback(() => {
    if (!currentTrack && queue.length > 0) {
      playTrack(queue[0], queue);
      return;
    }

    if (!currentTrack) return;

    if (isYouTubeTrack(currentTrack)) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
        try {
          const state = ytPlayerRef.current.getPlayerState();
          if (state === 1 || isPlaying) {
            ytPlayerRef.current.pauseVideo();
            setIsPlaying(false);
            if (audioRef.current) {
              try { audioRef.current.pause(); } catch (e) {}
            }
          } else {
            ytPlayerRef.current.playVideo();
            setIsPlaying(true);
            if (audioRef.current) {
              try {
                audioRef.current.src = SILENT_AUDIO_URI;
                audioRef.current.loop = true;
                audioRef.current.volume = 0.0001;
                audioRef.current.play().catch(() => {});
              } catch (e) {}
            }
          }
        } catch (e) {
          console.warn('[YT Toggle Error]:', e);
        }
      }
    } else {
      const audio = audioRef.current;
      if (!audio) return;

      if (audio.paused) {
        audio.loop = false;
        const safeVol = isNaN(volume) ? 0.85 : volume;
        audio.volume = isMuted ? 0 : safeVol;
        if (!audio.src || audio.src !== currentTrack.audio_url) {
          audio.src = currentTrack.audio_url;
        }
        audio.play().then(() => setIsPlaying(true)).catch(console.error);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    }
  }, [currentTrack, queue, isPlaying, playTrack, volume, isMuted]);

  // Add Track to Queue
  const addToQueue = useCallback((track) => {
    if (!track) return;
    setQueue(prev => {
      const exists = prev.some(t => t.id === track.id);
      if (exists) return prev;
      return [...prev, track];
    });
  }, []);

  // Remove from Queue
  const removeFromQueue = useCallback((index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index < queueIndex) {
      setQueueIndex(prev => Math.max(0, prev - 1));
    }
  }, [queueIndex]);

  // Close / Dismiss Player completely
  const closePlayer = useCallback(() => {
    try {
      if (typeof document !== 'undefined') {
        const doc = document;
        if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
          const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
          if (exit) exit.call(doc);
        }
      }
    } catch (e) {}

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    }

    if (ytPlayerRef.current) {
      try {
        if (typeof ytPlayerRef.current.stopVideo === 'function') {
          ytPlayerRef.current.stopVideo();
        } else if (typeof ytPlayerRef.current.pauseVideo === 'function') {
          ytPlayerRef.current.pauseVideo();
        }
      } catch (e) {}
    }

    setCurrentTrack(null);
    currentTrackRef.current = null;
    setIsPlaying(false);
    setIsExpanded(false);
    setCurrentTime(0);
    setDuration(0);
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
    try {
      localStorage.removeItem('syncstream_last_track');
    } catch (e) {}
  }, []);

  // Clear Queue
  const clearQueue = useCallback(() => {
    setQueue(currentTrack ? [currentTrack] : []);
    setQueueIndex(0);
  }, [currentTrack]);

  // Volume Controller for both engines
  const setVolume = useCallback((val) => {
    const parsed = parseFloat(val);
    const clamped = isNaN(parsed) ? 0.85 : Math.max(0, Math.min(1, parsed));
    setVolumeState(clamped);

    if (audioRef.current && !isYouTubeTrack(currentTrack)) {
      audioRef.current.volume = clamped;
    }

    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try {
        ytPlayerRef.current.setVolume(clamped * 100);
      } catch (e) {}
    }

    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
    try {
      localStorage.setItem('syncstream_music_vol', clamped.toString());
    } catch (e) {}
  }, [isMuted, currentTrack]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    if (isMuted) {
      const safeVol = isNaN(volume) ? 0.85 : volume;
      if (audioRef.current && !isYouTubeTrack(currentTrack)) audioRef.current.volume = safeVol;
      if (ytPlayerRef.current && typeof ytPlayerRef.current.unMute === 'function') {
        try {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(safeVol * 100);
        } catch (e) {}
      }
      setIsMuted(false);
    } else {
      if (audioRef.current && !isYouTubeTrack(currentTrack)) audioRef.current.volume = 0;
      if (ytPlayerRef.current && typeof ytPlayerRef.current.mute === 'function') {
        try {
          ytPlayerRef.current.mute();
        } catch (e) {}
      }
      setIsMuted(true);
    }
  }, [isMuted, volume, currentTrack]);

  // Toggle Loop
  const toggleLoop = useCallback(() => {
    setIsLooping(prev => {
      if (prev === 'none') return 'track';
      if (prev === 'track') return 'queue';
      return 'none';
    });
  }, []);

  // Toggle Shuffle
  const toggleShuffle = useCallback(() => {
    setIsShuffling(prev => !prev);
  }, []);

  // ── MediaSession API: Mobile Lockscreen, Notification Controls & Background Playback ──
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (currentTrack) {
      const trackTitle = currentTrack.title ? cleanText(currentTrack.title) : 'SyncStream Music';
      const trackArtist = currentTrack.artist ? cleanText(currentTrack.artist) : 'SyncStream';
      const trackAlbum = currentTrack.album ? cleanText(currentTrack.album) : 'SyncStream';
      const trackArtwork = currentTrack.image ? [
        { src: currentTrack.image, sizes: '96x96', type: 'image/jpeg' },
        { src: currentTrack.image, sizes: '128x128', type: 'image/jpeg' },
        { src: currentTrack.image, sizes: '192x192', type: 'image/jpeg' },
        { src: currentTrack.image, sizes: '256x256', type: 'image/jpeg' },
        { src: currentTrack.image, sizes: '384x384', type: 'image/jpeg' },
        { src: currentTrack.image, sizes: '512x512', type: 'image/jpeg' }
      ] : [];

      try {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: trackTitle,
          artist: trackArtist,
          album: trackAlbum,
          artwork: trackArtwork
        });
      } catch (e) {
        console.warn('[MediaSession Metadata Error]:', e);
      }
    }

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    if (duration > 0 && typeof navigator.mediaSession.setPositionState === 'function') {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(duration, 0),
          playbackRate: 1,
          position: Math.max(0, Math.min(currentTime, duration))
        });
      } catch (e) {}
    }

    const actionHandlers = [
      ['play', () => {
        if (!isPlayingRef.current) togglePlay();
      }],
      ['pause', () => {
        if (isPlayingRef.current) togglePlay();
      }],
      ['previoustrack', () => {
        prevTrack();
      }],
      ['nexttrack', () => {
        nextTrack();
      }],
      ['seekbackward', (details) => {
        skipBackward(details.seekOffset || 10);
      }],
      ['seekforward', (details) => {
        skipForward(details.seekOffset || 10);
      }],
      ['seekto', (details) => {
        if (details.seekTime !== undefined && details.seekTime !== null) {
          seek(details.seekTime);
        }
      }],
      ['stop', () => {
        closePlayer();
      }]
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {}
    }
  }, [currentTrack, isPlaying, duration, currentTime, togglePlay, prevTrack, nextTrack, skipBackward, skipForward, seek, closePlayer]);

  // ── Mobile Background & Visibility State Guardian ──
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isPlayingRef.current && typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      } else if (document.visibilityState === 'visible') {
        // Recover if mobile browser throttled iframe during tab switch
        if (isPlayingRef.current) {
          if (isYouTubeTrack(currentTrackRef.current) && ytPlayerRef.current) {
            try {
              const state = ytPlayerRef.current.getPlayerState?.();
              if (state === 2) {
                ytPlayerRef.current.playVideo?.();
              }
            } catch (e) {}
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, []);

  // Initialize YouTube IFrame API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initYT = () => {
      if (ytPlayerRef.current || !window.YT || !window.YT.Player) return;
      try {
        ytPlayerRef.current = new window.YT.Player('syncstream-hidden-yt-iframe', {
          height: '200',
          width: '200',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              isYtReadyRef.current = true;
              const safeVol = isNaN(volume) ? 0.85 : volume;
              try {
                event.target.setVolume(isMuted ? 0 : safeVol * 100);
              } catch (e) {}
              if (pendingYtIdRef.current) {
                const vid = pendingYtIdRef.current;
                pendingYtIdRef.current = null;
                try {
                  event.target.loadVideoById(vid);
                  event.target.playVideo();
                } catch (e) {}
              }
            },
            onStateChange: (event) => {
              // 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
                setIsLoading(false);
                setPlaybackError(null);
                const d = ytPlayerRef.current?.getDuration?.();
                if (d && d > 0) setDuration(d);
                if (audioRef.current && audioRef.current.paused) {
                  try {
                    audioRef.current.src = SILENT_AUDIO_URI;
                    audioRef.current.loop = true;
                    audioRef.current.volume = 0.0001;
                    audioRef.current.play().catch(() => {});
                  } catch (e) {}
                }
              } else if (event.data === 2) {
                setIsPlaying(false);
                setIsLoading(false);
              } else if (event.data === 3) {
                setIsLoading(true);
              } else if (event.data === 0) {
                setIsPlaying(false);
                if (isLoopingRef.current === 'track') {
                  try {
                    ytPlayerRef.current.seekTo(0, true);
                    ytPlayerRef.current.playVideo();
                  } catch (e) {}
                } else if (nextTrackRef.current) {
                  nextTrackRef.current();
                }
              }
            },
            onError: (err) => {
              console.warn('[YouTube Player Event Error]:', err.data);
              setIsLoading(false);
              setIsPlaying(false);
              setPlaybackError('Unable to stream this YouTube track.');
            }
          }
        });
      } catch (err) {
        console.warn('YouTube Player init error:', err.message);
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => {
        initYT();
      };
    } else if (window.YT.loaded) {
      initYT();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initYT();
      };
    }
  }, [volume, isMuted]);

  // Polling for YouTube player playback time and duration
  useEffect(() => {
    if (isPlaying && isYouTubeTrack(currentTrack)) {
      ytPollingRef.current = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          try {
            const cur = ytPlayerRef.current.getCurrentTime() || 0;
            const dur = ytPlayerRef.current.getDuration() || currentTrack?.duration || 0;
            setCurrentTime(cur);
            if (dur > 0) setDuration(dur);
          } catch (e) {}
        }
      }, 250);
    } else {
      if (ytPollingRef.current) {
        clearInterval(ytPollingRef.current);
        ytPollingRef.current = null;
      }
    }
    return () => {
      if (ytPollingRef.current) {
        clearInterval(ytPollingRef.current);
        ytPollingRef.current = null;
      }
    };
  }, [isPlaying, currentTrack]);

  // Safe Mount & Initialization of HTML5 Audio Engine with Mobile PlaysInline
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
      audioRef.current.setAttribute('playsinline', 'true');
      audioRef.current.setAttribute('webkit-playsinline', 'true');
      audioRef.current.setAttribute('x-webkit-airplay', 'allow');
      const safeVol = isNaN(volume) ? 0.85 : volume;
      audioRef.current.volume = safeVol;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!isYouTubeTrack(currentTrackRef.current)) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handleLoadedMetadata = () => {
      if (!isYouTubeTrack(currentTrackRef.current)) {
        setDuration(audio.duration || currentTrackRef.current?.duration || 0);
        setIsLoading(false);
      }
    };
    const handleWaiting = () => {
      if (!isYouTubeTrack(currentTrackRef.current)) {
        setIsLoading(true);
      }
    };
    const handleCanPlay = () => {
      if (!isYouTubeTrack(currentTrackRef.current)) {
        setIsLoading(false);
      }
    };
    const handlePlaying = () => {
      if (!isYouTubeTrack(currentTrackRef.current)) {
        setIsPlaying(true);
        setIsLoading(false);
        setPlaybackError(null);
      }
    };
    const handlePause = () => {
      if (!isYouTubeTrack(currentTrackRef.current)) {
        setIsPlaying(false);
      }
    };
    const handleEnded = () => {
      if (!isYouTubeTrack(currentTrackRef.current)) {
        if (isLooping === 'track') {
          audio.currentTime = 0;
          audio.play().catch(console.error);
        } else {
          nextTrack();
        }
      }
    };
    const handleError = (e) => {
      if (!isYouTubeTrack(currentTrackRef.current) && audio.src && !audio.src.startsWith('data:audio/wav')) {
        console.warn('Audio playback stream error:', e);
        setIsLoading(false);
        setIsPlaying(false);
        setPlaybackError('Unable to stream this audio track.');
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isLooping, nextTrack, volume]);

  // Sync queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('syncstream_music_queue', JSON.stringify(queue));
    } catch (e) {}
  }, [queue]);

  // Fetch user favorites and playlists from server on mount / token change
  const refreshLibrary = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [favRes, playRes] = await Promise.allSettled([
        axios.get('/api/music/favorites'),
        axios.get('/api/music/playlists')
      ]);

      if (favRes.status === 'fulfilled' && Array.isArray(favRes.value.data)) {
        setFavorites(favRes.value.data);
        localStorage.setItem('syncstream_favorites', JSON.stringify(favRes.value.data));
      }

      if (playRes.status === 'fulfilled' && Array.isArray(playRes.value.data)) {
        setPlaylists(playRes.value.data);
        localStorage.setItem('syncstream_user_playlists', JSON.stringify(playRes.value.data));
      }
    } catch (e) {
      console.warn('Library sync failed:', e.message);
    }
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  // Is Favorite Check
  const isFavorite = useCallback((songId) => {
    if (!songId) return false;
    return favorites.some(f => f.id === songId);
  }, [favorites]);

  // Toggle Favorite
  const toggleFavorite = useCallback(async (song) => {
    if (!song || !song.id) return;
    const exists = favorites.some(f => f.id === song.id);
    let updated;
    if (exists) {
      updated = favorites.filter(f => f.id !== song.id);
    } else {
      updated = [{ ...song, media_type: 'music' }, ...favorites];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('syncstream_favorites', JSON.stringify(updated));
    } catch (e) {}

    const token = localStorage.getItem('token');
    if (token) {
      try {
        if (exists) {
          await axios.delete(`/api/music/favorites/${song.id}`);
        } else {
          await axios.post('/api/music/favorites', { song });
        }
      } catch (err) {
        console.warn('Failed to sync favorite on server:', err.message);
      }
    }
  }, [favorites]);

  // Create Playlist
  const createPlaylist = useCallback(async (name, description = '') => {
    if (!name || !name.trim()) return null;
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const res = await axios.post('/api/music/playlists', { name: name.trim(), description });
        const newPl = res.data;
        setPlaylists(prev => [newPl, ...prev]);
        return newPl;
      } catch (err) {
        console.warn('Server playlist creation failed, saving locally:', err.message);
      }
    }

    const localPl = {
      id: `pl-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      track_count: 0,
      cover_image: null,
      created_at: new Date().toISOString()
    };
    setPlaylists(prev => {
      const updated = [localPl, ...prev];
      try {
        localStorage.setItem('syncstream_user_playlists', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return localPl;
  }, []);

  // Delete Playlist
  const deletePlaylist = useCallback(async (playlistId) => {
    if (!playlistId) return;
    setPlaylists(prev => {
      const updated = prev.filter(p => p.id !== playlistId);
      try {
        localStorage.setItem('syncstream_user_playlists', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const token = localStorage.getItem('token');
    if (token && typeof playlistId === 'number') {
      try {
        await axios.delete(`/api/music/playlists/${playlistId}`);
      } catch (e) {}
    }
  }, []);

  // Update / Edit Playlist Name & Description
  const updatePlaylist = useCallback(async (playlistId, name, description = '') => {
    if (!playlistId || !name || !name.trim()) return false;
    const cleanName = name.trim();
    const cleanDesc = description.trim();

    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, name: cleanName, description: cleanDesc };
        }
        return p;
      });
      try {
        localStorage.setItem('syncstream_user_playlists', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const token = localStorage.getItem('token');
    if (token && typeof playlistId === 'number') {
      try {
        await axios.put(`/api/music/playlists/${playlistId}`, { name: cleanName, description: cleanDesc });
        return true;
      } catch (e) {
        console.warn('Failed to update playlist on server:', e.message);
      }
    }
    return true;
  }, []);

  // Add Song to Playlist
  const addSongToPlaylist = useCallback(async (playlistId, song) => {
    if (!playlistId || !song) return false;

    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          track_count: (p.track_count || 0) + 1,
          cover_image: song.image || song.poster_path || p.cover_image
        };
      }
      return p;
    }));

    const token = localStorage.getItem('token');
    if (token && typeof playlistId === 'number') {
      try {
        await axios.post(`/api/music/playlists/${playlistId}/songs`, { song });
        return true;
      } catch (err) {
        console.warn('Failed to add song to server playlist:', err.message);
      }
    }
    return true;
  }, []);

  // Remove Song from Playlist
  const removeSongFromPlaylist = useCallback(async (playlistId, songId) => {
    if (!playlistId || !songId) return;

    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          track_count: Math.max(0, (p.track_count || 1) - 1)
        };
      }
      return p;
    }));

    const token = localStorage.getItem('token');
    if (token && typeof playlistId === 'number') {
      try {
        await axios.delete(`/api/music/playlists/${playlistId}/songs/${songId}`);
      } catch (e) {}
    }
  }, []);

  const value = {
    currentTrack,
    queue,
    queueIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    isShuffling,
    isLoading,
    isExpanded,
    playbackError,
    modalTab,
    songForPlaylistModal,
    openAddToPlaylist,
    closeAddToPlaylist,
    favorites,
    playlists,
    isFavorite,
    toggleFavorite,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    refreshLibrary,
    setModalTab,
    openPlayerModal,
    openLyricsModal,
    openQueueModal,
    playTrack,
    playQueue,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    nextTrack,
    prevTrack,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    setIsExpanded,
    closePlayer
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      {/* Hidden YouTube Iframe for Native Background Audio Streaming */}
      <div
        id="syncstream-hidden-yt-container"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '2px',
          height: '2px',
          opacity: 0.01,
          pointerEvents: 'none',
          zIndex: -1
        }}
        aria-hidden="true"
      >
        <div id="syncstream-hidden-yt-iframe" />
      </div>
    </MusicContext.Provider>
  );
};
