import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Rocket, X, Check } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

const WAKE_STEPS = [
  'Connecting',
  'Waking Render Engine',
  'Syncing Feeds'
];

/**
 * ServerWakeup — shows a cinematic orbital "waking up" notice when Render backend is cold.
 * Never blocks the user. Auto-dismisses when server is ready.
 */
export default function ServerWakeup() {
  const { currentTrack } = useMusic();
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);
  const [wakeStage, setWakeStage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timeoutId = null;
    let showTimer = null;

    const ping = async (attempt = 0) => {
      try {
        await axios.get('/api/health', { timeout: 7000 });
        if (!cancelled) {
          setWakeStage(2);
          setReady(true);
          // Auto-hide after brief "ready" flash
          setTimeout(() => setShow(false), 2000);
        }
      } catch (err) {
        if (cancelled) return;
        // Only show the banner after the FIRST failed attempt (avoids flicker on fast servers)
        if (attempt === 0) setShow(true);
        setWakeStage(attempt < 1 ? 0 : attempt < 3 ? 1 : 2);

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
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-1.5rem)] max-w-sm p-3.5 sm:p-4 rounded-2xl border shadow-[0_18px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex items-center gap-3.5 bg-[#0b1024]/95 border-accentCyan/40 text-gray-200 animate-spring-toast overflow-hidden transition-all duration-300 ${
        currentTrack
          ? 'bottom-[calc(9.75rem+env(safe-area-inset-bottom,0px))] md:bottom-24'
          : 'bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6'
      }`}
    >
      {/* Subtle orbital glow backdrop */}
      <div
        aria-hidden="true"
        className="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-accentCyan/15 blur-2xl pointer-events-none"
      />

      {/* Cinematic Orbital Loader / Check */}
      <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
        {ready ? (
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.6)] animate-heart-spring">
            <Check className="w-5 h-5 text-emerald-300 stroke-[3]" />
          </div>
        ) : (
          <>
            {/* Outer Orbit Ring */}
            <div className="absolute inset-0 rounded-full border border-dashed border-accentCyan/60 animate-orbit-cw">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accentCyan shadow-[0_0_8px_#00e5ff]" />
            </div>
            {/* Inner Counter-Orbit Ring */}
            <div className="absolute inset-1.5 rounded-full border border-accentPurple/60 animate-orbit-ccw">
              <span className="absolute -bottom-0.5 right-1 w-1.5 h-1.5 rounded-full bg-accentPink shadow-[0_0_6px_#ff2a85]" />
            </div>
            {/* Rocket Core */}
            <Rocket className="relative z-10 w-4 h-4 text-accentCyan animate-levitate drop-shadow-[0_0_8px_rgba(var(--accent-cyan),0.9)]" />
          </>
        )}
      </div>

      {/* Status + Progressive Steps */}
      <div className="flex-1 min-w-0 relative z-10 space-y-1.5">
        {ready ? (
          <div>
            <p className="text-xs font-extrabold text-emerald-300">Server Engine Online!</p>
            <p className="text-[10.5px] text-gray-400">Feeds synced — ready to stream &amp; sign in.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-white truncate">
                {WAKE_STEPS[wakeStage]}...
              </p>
              <span className="text-[9px] font-mono font-bold text-accentCyan uppercase tracking-wider shrink-0">
                Step {wakeStage + 1}/3
              </span>
            </div>

            {/* 3-Step Segmented Orbital Progress */}
            <div className="grid grid-cols-3 gap-1">
              {WAKE_STEPS.map((label, idx) => (
                <div key={label} className="space-y-0.5">
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx < wakeStage
                          ? 'w-full bg-accentCyan'
                          : idx === wakeStage
                          ? 'w-full bg-gradient-to-r from-accentCyan to-accentPurple animate-pulse'
                          : 'w-0'
                      }`}
                    />
                  </div>
                  <p className={`text-[8.5px] truncate font-semibold ${idx <= wakeStage ? 'text-accentCyan' : 'text-gray-500'}`}>
                    {label.split(' ')[0]}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => setShow(false)}
        className="relative z-10 shrink-0 text-gray-500 hover:text-white transition p-1 cursor-pointer"
        title="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
