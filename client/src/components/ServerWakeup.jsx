import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, X } from 'lucide-react';

/**
 * ServerWakeup — shows a soft "waking up" notice when Render backend is cold.
 * Never blocks the user. Auto-dismisses when server is ready.
 */
export default function ServerWakeup() {
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId = null;
    let showTimer = null;

    const ping = async (attempt = 0) => {
      try {
        const res = await axios.get('/api/health', { timeout: 7000 });
        if (!cancelled) {
          setReady(true);
          // Auto-hide after brief "ready" flash
          setTimeout(() => setShow(false), 2000);
        }
      } catch (err) {
        if (cancelled) return;
        // Only show the banner after the FIRST failed attempt (avoids flicker on fast servers)
        if (attempt === 0) setShow(true);

        if (attempt < 10) {
          timeoutId = setTimeout(() => ping(attempt + 1), 5000);
        } else {
          // After 50s give up silently — don't block the user
          setShow(false);
        }
      }
    };

    // Delay first ping by 1s so it doesn't flash on fast connections
    showTimer = setTimeout(() => ping(0), 1000);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (showTimer) clearTimeout(showTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm
      px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3
      bg-darkCard/95 border-accentCyan/30 text-gray-200 animate-fade-in">
      
      {ready ? (
        <span className="text-accentCyan text-lg">✓</span>
      ) : (
        <Loader2 className="w-4 h-4 shrink-0 text-accentCyan animate-spin" />
      )}

      <div className="flex-1 min-w-0">
        {ready ? (
          <p className="text-xs font-bold text-accentCyan">Server ready! You can now log in.</p>
        ) : (
          <>
            <p className="text-xs font-bold text-accentCyan">Server is warming up...</p>
            <p className="text-[11px] text-gray-400">Login may take a few extra seconds. Please try — it will auto-retry!</p>
          </>
        )}
      </div>

      <button onClick={() => setShow(false)} className="shrink-0 text-gray-500 hover:text-white transition p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
