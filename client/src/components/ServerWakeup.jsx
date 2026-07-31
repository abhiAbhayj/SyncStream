import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ServerCrash, Loader2, Wifi } from 'lucide-react';

/**
 * ServerWakeup Component
 * 
 * On Render's free tier, the backend sleeps after 15 minutes of inactivity.
 * This component pings the /api/health endpoint when the app loads.
 * If the server is cold-starting, it shows a friendly banner instead of
 * crashing with a cryptic "server error" message.
 */
export default function ServerWakeup() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'waking' | 'ready' | 'error'
  const [retries, setRetries] = useState(0);
  const MAX_RETRIES = 8;
  const RETRY_DELAY_MS = 5000;

  useEffect(() => {
    let timeoutId = null;
    let cancelled = false;

    const ping = async (attempt = 0) => {
      try {
        const res = await axios.get('/api/health', { timeout: 8000 });
        // Only mark ready when DB is also connected
        if (res.data?.db === true) {
          if (!cancelled) setStatus('ready');
        } else {
          // Server up but DB still connecting — keep retrying
          throw new Error('DB not ready yet');
        }
      } catch (err) {
        if (cancelled) return;

        if (attempt < MAX_RETRIES) {
          setStatus('waking');
          setRetries(attempt + 1);
          timeoutId = setTimeout(() => ping(attempt + 1), RETRY_DELAY_MS);
        } else {
          setStatus('error');
        }
      }
    };

    ping(0);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Server is up — render nothing
  if (status === 'ready') return null;

  // Server is checking or waking up — show banner
  return (
    <div
      className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md
        px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 transition-all duration-500
        ${status === 'error'
          ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-darkCard/90 border-accentCyan/30 text-gray-200'
        }`}
    >
      {status === 'error' ? (
        <ServerCrash className="w-5 h-5 shrink-0 text-red-400" />
      ) : (
        <Loader2 className="w-5 h-5 shrink-0 text-accentCyan animate-spin" />
      )}

      <div className="flex-1 min-w-0">
        {status === 'error' ? (
          <>
            <p className="text-xs font-bold">Backend Unreachable</p>
            <p className="text-[11px] text-red-300/70 truncate">
              Login/Register will not work until the server responds.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold text-accentCyan">
              {status === 'checking' ? 'Connecting to server...' : 'Server is starting up...'}
            </p>
            <p className="text-[11px] text-gray-400 truncate">
              {status === 'waking'
                ? `Please wait (~${Math.max(0, (MAX_RETRIES - retries) * 5)}s remaining). Login will be ready shortly.`
                : 'Checking backend connection...'}
            </p>
          </>
        )}
      </div>

      <span className="text-[10px] font-bold text-gray-500 shrink-0">
        {status !== 'error' && retries > 0 && `${retries}/${MAX_RETRIES}`}
      </span>
    </div>
  );
}
