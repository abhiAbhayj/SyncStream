import React, { useState, useEffect, useRef } from 'react';
import { Loader2, MonitorOff, HelpCircle, ShieldCheck, Maximize, Minimize } from 'lucide-react';

export default function EmbedPlayer({ embedUrl, title }) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [strictShield, setStrictShield] = useState(true);

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

  // ── Redirect Blocker ────────────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {};

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = function (...args) {
      const url = args[2];
      if (url && typeof url === 'string' && !url.startsWith('/') && !url.startsWith(window.location.origin)) {
        console.warn('[EmbedPlayer] Blocked external pushState redirect:', url);
        return;
      }
      return originalPushState(...args);
    };

    window.history.replaceState = function (...args) {
      const url = args[2];
      if (url && typeof url === 'string' && !url.startsWith('/') && !url.startsWith(window.location.origin)) {
        console.warn('[EmbedPlayer] Blocked external replaceState redirect:', url);
        return;
      }
      return originalReplaceState(...args);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
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
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-darkBg flex flex-col items-center justify-center gap-3 z-10">
          <Loader2 className="w-10 h-10 animate-spin text-accentCyan" />
          <p className="text-sm text-gray-400">Connecting to streaming wrapper...</p>
        </div>
      )}

      {/* Embedded Player Iframe with Complete Fullscreen & Media Permissions */}
      <iframe
        key={`${embedUrl}-${strictShield ? 'shielded' : 'open'}`}
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
        {...(strictShield ? {
          sandbox: "allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock"
        } : {})}
        onLoad={() => setLoading(false)}
      />

      {/* Floating Controls Bar (Top Right) */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        {/* Anti-Redirect Shield Toggle */}
        <button
          onClick={() => setStrictShield(!strictShield)}
          title={strictShield ? 'Anti-Redirect Shield ON (Tap to toggle)' : 'Anti-Redirect Shield OFF'}
          className={`p-2 rounded-xl backdrop-blur-md border shadow-lg transition flex items-center gap-1.5 text-xs font-bold ${
            strictShield
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">{strictShield ? 'Shield Active' : 'Shield Off'}</span>
        </button>

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
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="absolute right-0 mt-2 w-64 bg-darkCard border border-darkBorder rounded-xl p-3 text-xs text-gray-300 opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none shadow-2xl z-40 font-medium">
            Shield Active: Prevents mobile tabs and redirects. Use Server 1 (VidLink) for full multi-language subtitles.
          </div>
        </div>
      </div>
    </div>
  );
}

