import React, { useState, useEffect, useRef } from 'react';
import { Loader2, MonitorOff, HelpCircle, ShieldCheck, Maximize, Minimize } from 'lucide-react';

export default function EmbedPlayer({ embedUrl, title }) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Trigger matrix shutter overlay whenever stream source / server changes
  useEffect(() => {
    if (embedUrl) {
      setLoading(true);
    }
  }, [embedUrl]);

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
    // 1. Intercept popup windows (window.open)
    const originalOpen = window.open;
    window.open = function (...args) {
      console.warn('[SyncStream Shield] Blocked external popup redirect attempt:', args[0]);
      return null;
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

    const handleBeforeUnload = () => {};
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.open = originalOpen;
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
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
      {/* Animated Cyber-Shutter Matrix Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#050814]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10 overflow-hidden select-none">
          {/* Subtle matrix grid backdrop */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(var(--accent-cyan), 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--accent-purple), 0.14) 1px, transparent 1px)',
              backgroundSize: '28px 28px'
            }}
          />
          {/* Horizontal Cyber-Shutter Scan Beam */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-accentCyan/25 to-transparent border-y border-accentCyan/35 animate-cyber-shutter pointer-events-none"
          />
          <div className="relative z-10 flex flex-col items-center gap-2.5 px-4 text-center">
            <div className="relative p-3 rounded-2xl bg-black/70 border border-accentCyan/40 shadow-[0_0_24px_rgba(var(--accent-cyan),0.3)]">
              <Loader2 className="w-7 h-7 sm:w-9 sm:h-9 animate-spin text-accentCyan" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/80 border border-accentCyan/30 text-[11px] sm:text-xs font-mono font-bold text-accentCyan shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-accentCyan animate-ping" />
              <span>Locking Stream Mirror...</span>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Player Iframe with Complete Media Permissions and NO sandbox blocking */}
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
          className="bg-black/70 hover:bg-black/90 text-gray-300 hover:text-white p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg transition hover:scale-105 active:scale-95"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 text-accentCyan" />
          ) : (
            <Maximize className="w-4 h-4 text-accentCyan" />
          )}
        </button>

        {/* Info Popover */}
        <div className="group/info relative">
          <div className="bg-black/70 hover:bg-black/90 text-gray-400 hover:text-white p-2 rounded-xl cursor-help backdrop-blur-md border border-white/10 transition shadow-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="absolute right-0 mt-2 w-64 bg-darkCard border border-darkBorder rounded-xl p-3 text-xs text-gray-300 opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none shadow-2xl z-40 font-medium">
            Shield Active: Browser redirects and popups are neutralized. Use the fullscreen icon if native fullscreen is unresponsive.
          </div>
        </div>
      </div>
    </div>
  );
}

