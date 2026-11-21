import React, { useState, useEffect, useRef } from 'react';
import { Loader2, MonitorOff, HelpCircle, ShieldCheck, Maximize, Minimize } from 'lucide-react';

export default function EmbedPlayer({ embedUrl, title, initialTime = 0, syncEvent = null, onProgressUpdate = null }) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // PostMessage listener for external streaming embeds (VidLink, VidFast, Playerjs, Plyr)
  useEffect(() => {
    const handleWindowMessage = (e) => {
      try {
        let payload = e.data;
        if (typeof payload === 'string' && (payload.startsWith('{') || payload.startsWith('['))) {
          payload = JSON.parse(payload);
        }
        if (!payload) return;

        // VidLink / VidFast / JW / Playerjs time extraction
        const timeVal = payload.currentTime ?? payload.time ?? payload.progress ?? payload.data?.currentTime ?? payload.data?.time;
        const durVal = payload.duration ?? payload.data?.duration;

        if (typeof timeVal === 'number' && timeVal >= 0 && onProgressUpdate) {
          onProgressUpdate(Math.floor(timeVal), durVal ? Math.floor(durVal) : 0);
        }
      } catch (err) {
        // Silently ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [onProgressUpdate]);

  // Trigger matrix shutter overlay whenever stream source / server changes
  // With 2.0s safety timeout so loading screen never gets stuck
  useEffect(() => {
    if (embedUrl) {
      setLoading(true);
      const safetyTimer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(safetyTimer);
    }
  }, [embedUrl]);

  // Relay playback synchronization commands (Play, Pause, Seek) to embed iframe
  useEffect(() => {
    if (!syncEvent || !iframeRef.current?.contentWindow) return;
    try {
      const cw = iframeRef.current.contentWindow;
      const { event, time } = syncEvent;

      if (event === 'play') {
        cw.postMessage({ type: 'MEDIA_PLAY' }, '*');
        cw.postMessage({ type: 'PLAYER_EVENT', data: { event: 'play' } }, '*');
        cw.postMessage('{"event":"play"}', '*');
      } else if (event === 'pause') {
        cw.postMessage({ type: 'MEDIA_PAUSE' }, '*');
        cw.postMessage({ type: 'PLAYER_EVENT', data: { event: 'pause' } }, '*');
        cw.postMessage('{"event":"pause"}', '*');
      } else if (event === 'seek' && typeof time === 'number') {
        cw.postMessage({ type: 'MEDIA_SEEK', time }, '*');
        cw.postMessage({ type: 'PLAYER_EVENT', data: { event: 'seek', time } }, '*');
        cw.postMessage(JSON.stringify({ event: 'seek', time }), '*');
      }
    } catch (err) {
      // Ignored for cross-origin safety
    }
  }, [syncEvent]);

  // Track Fullscreen state changes (ESC key, browser exit, etc.)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(err => console.error(err));
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.error(err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // ── Redirect & Popup Neutralizer ──────────────────────────────────────────
  useEffect(() => {
    // 1. Intercept popup windows (window.open) with safe dummy proxy
    // Prevents ad scripts from triggering fallback top-level navigation on null
    const originalOpen = window.open;
    const dummyWindow = {
      closed: true,
      focus: () => {},
      blur: () => {},
      close: () => {},
      postMessage: () => {},
      location: { href: '', replace: () => {}, assign: () => {} }
    };

    window.open = function (...args) {
      console.warn('[SyncStream Shield] Neutralized external popup redirect:', args[0]);
      return dummyWindow;
    };

    // 2. Prevent top-level navigation / pushState hijacking
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = function (...args) {
      const url = args[2];
      if (url && typeof url === 'string' && !url.startsWith('/') && !url.startsWith(window.location.origin)) {
        console.warn('[SyncStream Shield] Blocked external pushState redirect:', url);
        return;
      }
      return originalPushState(...args);
    };

    window.history.replaceState = function (...args) {
      const url = args[2];
      if (url && typeof url === 'string' && !url.startsWith('/') && !url.startsWith(window.location.origin)) {
        console.warn('[SyncStream Shield] Blocked external replaceState redirect:', url);
        return;
      }
      return originalReplaceState(...args);
    };

    // 3. Navigation API trap (Intercepts cross-origin top navigation from iframe)
    const handleNavigation = (e) => {
      try {
        const dest = e.destination?.url;
        if (dest && typeof dest === 'string' && !dest.startsWith(window.location.origin) && !dest.startsWith('about:')) {
          console.warn('[SyncStream Shield] Blocked unauthorized top redirect:', dest);
          if (e.canIntercept) {
            e.preventDefault();
          } else {
            e.preventDefault();
          }
        }
      } catch (err) {
        // Ignored
      }
    };

    if (window.navigation && window.navigation.addEventListener) {
      window.navigation.addEventListener('navigate', handleNavigation);
    }

    // 4. Safe beforeunload guard against external top.location navigation
    let isUserNavigating = false;
    const handleDocClick = (e) => {
      const a = e.target.closest('a');
      if (a && a.href && a.href.startsWith(window.location.origin)) {
        isUserNavigating = true;
        setTimeout(() => { isUserNavigating = false; }, 1200);
      }
    };
    document.addEventListener('click', handleDocClick, true);

    const handleBeforeUnload = (e) => {
      if (!isUserNavigating) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.open = originalOpen;
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      if (window.navigation && window.navigation.removeEventListener) {
        window.navigation.removeEventListener('navigate', handleNavigation);
      }
      document.removeEventListener('click', handleDocClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (!embedUrl) {
    return (
      <div className="flex flex-col items-center justify-center aspect-video w-full rounded-2xl bg-darkCard border border-darkBorder text-center p-6 gap-3">
        <MonitorOff className="w-12 h-12 text-gray-500" />
        <h4 className="text-lg font-bold text-gray-300">No Streaming URL Provided</h4>
        <p className="text-sm text-gray-500 max-w-sm">No streaming configuration is available for this content type.</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? 'h-screen' : 'aspect-video'} rounded-2xl overflow-hidden bg-black border border-darkBorder shadow-2xl transition-all duration-300 group`}
    >
      {/* High-End Clean Loading Overlay */}
      {loading && (
        <div 
          onClick={() => setLoading(false)}
          className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10 select-none cursor-pointer"
          title="Click to dismiss overlay"
        >
          <div className="relative p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-xl">
            <Loader2 className="w-8 h-8 animate-spin text-accentCyan" />
          </div>
          <div className="flex flex-col items-center gap-1 px-4 text-center">
            <span className="text-sm font-semibold text-white tracking-wide">
              Loading Player...
            </span>
            <span className="text-[11px] text-gray-400">
              Click anywhere to dismiss &bull; Or select mirrors below
            </span>
          </div>
        </div>
      )}

      {/* Embedded Player Iframe with Complete Media Permissions and NO sandbox attribute */}
      {/* Streaming servers detect sandbox and throw "Disable sandbox in all server"; parent neutralizer handles popups */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title || 'Media Streaming Embed'}
        className="w-full h-full border-0"
        allowFullScreen={true}
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        scrolling="no"
        allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *; accelerometer *; gyroscope *; screen-wake-lock *; display-capture *; clipboard-write *"
        referrerPolicy="origin-when-cross-origin"
        onLoad={() => setLoading(false)}
      />

      {/* Floating Controls Bar (Top Right) */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
          className="bg-black/70 hover:bg-black/90 text-gray-300 hover:text-white p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 text-accentCyan" />
          ) : (
            <Maximize className="w-4 h-4 text-accentCyan" />
          )}
        </button>
      </div>
    </div>
  );
}

