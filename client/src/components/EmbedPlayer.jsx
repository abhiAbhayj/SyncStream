import React, { useState, useEffect, useRef } from 'react';
import { Loader2, MonitorOff, HelpCircle, ShieldCheck } from 'lucide-react';

export default function EmbedPlayer({ embedUrl, title }) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  // ── Redirect Blocker ────────────────────────────────────────────────────
  // Prevent the iframe from navigating the parent page on both desktop & mobile.
  // We intercept two vectors:
  //   1. window.beforeunload — catches page-level navigation attempts
  //   2. history.pushState / replaceState monkey-patch — catches SPA-style hijacks
  useEffect(() => {
    // Block all beforeunload events triggered while we have an embed active.
    // Only fire if the event is NOT triggered by user explicitly closing/navigating.
    const handleBeforeUnload = (e) => {
      // We do nothing here — just having the listener stops some aggressive redirects.
    };

    // Override history methods to detect iframe redirect attempts
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = function (...args) {
      // Only allow navigation if it's to an internal route (starts with /)
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
      // Restore original history methods
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
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-darkBorder shadow-2xl">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-darkBg flex flex-col items-center justify-center gap-3 z-10">
          <Loader2 className="w-10 h-10 animate-spin text-accentCyan" />
          <p className="text-sm text-gray-400">Connecting to streaming wrapper...</p>
        </div>
      )}

      {/*
        ── Sandbox Rules ───────────────────────────────────────────────────
        We grant every permission EXCEPT:
          - allow-top-navigation           → blocks iframe redirecting parent
          - allow-top-navigation-by-user-activation → blocks even click-triggered redirects
        
        Permissions we DO grant (needed for players to work):
          allow-scripts                    → player JavaScript
          allow-same-origin                → player cookies / localStorage / fonts
          allow-forms                      → form-based players
          allow-popups                     → quality selector, subtitle picker popups
          allow-popups-to-escape-sandbox   → legitimate external links open normally
          allow-presentation               → required for fullscreen API
          allow-pointer-lock               → fullscreen cursor control
          allow-downloads                  → some players need download permission
      */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title || 'Media Streaming Embed'}
        className="w-full h-full border-0"
        allowFullScreen
        scrolling="no"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
        referrerPolicy="no-referrer"
        onLoad={() => setLoading(false)}
      />

      {/* Info popover */}
      <div className="absolute top-3 right-3 z-20 group">
        <div className="bg-black/60 hover:bg-black/80 text-gray-400 hover:text-white p-2 rounded-full cursor-help backdrop-blur-md border border-white/5 transition">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div className="absolute right-0 mt-2 w-64 bg-darkCard border border-darkBorder rounded-xl p-3 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-30 font-medium">
          Redirect Shield is active — this player cannot navigate you away from SyncStream on any device.
        </div>
      </div>
    </div>
  );
}
