import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Rocket, X, Check, Server } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

const WAKE_STEPS = [
  { label: 'Connecting to Cloud', detail: 'Connecting to free backend...' },
  { label: 'Waking Render Server', detail: 'Spinning up container instance...' },
  { label: 'Syncing Database Feeds', detail: 'Establishing database connections...' }
];

/**
 * ServerWakeup — High-visibility, non-blocking mobile-friendly status pill
 * Shows a sleek, elegant floating alert when Render backend is cold.
 * Positioned cleanly under the Navbar on mobile so it NEVER covers Login/Register submit buttons or keyboards.
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
          setTimeout(() => setShow(false), 2400);
        }
      } catch (err) {
        if (cancelled) return;
        // Only show banner after first failed ping (avoids flash on fast servers)
        if (attempt === 0) setShow(true);
        setWakeStage(attempt < 1 ? 0 : attempt < 3 ? 1 : 2);

        if (attempt < 10) {
          timeoutId = setTimeout(() => ping(attempt + 1), 5000);
        } else {
          // After 50s give up silently without blocking user
          setShow(false);
        }
      }
    };

    // Delay first ping by 800ms
    showTimer = setTimeout(() => ping(0), 800);

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (showTimer) clearTimeout(showTimer);
    };
  }, []);

  if (!show) return null;

  const currentStep = WAKE_STEPS[wakeStage] || WAKE_STEPS[0];
  const progressPercent = ready ? 100 : wakeStage === 0 ? 35 : wakeStage === 1 ? 70 : 90;

  return (
    <aside
      aria-live="polite"
      aria-label="Server Connection Status"
      className={`fixed z-[200] left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-sm pointer-events-none transition-all duration-300 ${
        /* On Mobile: Floats right below top Navbar (top-16) so it NEVER covers the login/register card or keyboard!
           On Desktop (md+): Floats above bottom dock or music player bar cleanly */
        currentTrack
          ? 'top-[max(4.25rem,calc(env(safe-area-inset-top,0px)+3.75rem))] md:top-auto md:bottom-24'
          : 'top-[max(4.25rem,calc(env(safe-area-inset-top,0px)+3.75rem))] md:top-auto md:bottom-6'
      }`}
    >
      <div className="pointer-events-auto relative w-full p-2.5 sm:p-3 rounded-2xl border shadow-[0_16px_45px_rgba(0,0,0,0.88)] backdrop-blur-2xl flex items-center gap-2.5 sm:gap-3 bg-[#0a0f24]/95 border-accentCyan/45 text-gray-200 animate-spring-toast overflow-hidden select-none">
        
        {/* Subtle radial ambient backdrop glow */}
        <div
          aria-hidden="true"
          className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-accentCyan/15 blur-xl pointer-events-none"
        />

        {/* Status Indicator Icon */}
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center">
          {ready ? (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_18px_rgba(52,211,153,0.6)] animate-heart-spring">
              <Check className="w-5 h-5 text-emerald-300 stroke-[3]" />
            </div>
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accentCyan/10 border border-accentCyan/40 flex items-center justify-center shadow-[0_0_14px_rgba(var(--accent-cyan),0.35)] relative overflow-hidden">
              {/* Outer Orbit Pulse */}
              <div className="absolute inset-0 rounded-xl border border-dashed border-accentCyan/50 animate-orbit-cw opacity-60" />
              {/* Pulsing Rocket */}
              <Rocket className="w-4 h-4 text-accentCyan animate-levitate drop-shadow-[0_0_8px_rgba(var(--accent-cyan),0.9)] relative z-10" />
            </div>
          )}
        </div>

        {/* Content & Progress */}
        <div className="flex-1 min-w-0 space-y-1 text-left">
          {ready ? (
            <div>
              <p className="text-xs font-black text-emerald-300 tracking-tight font-outfit">
                Server Engine Online!
              </p>
              <p className="text-[10px] text-gray-300 leading-tight truncate">
                Feeds synced — ready to stream &amp; sign in.
              </p>
            </div>
          ) : (
            <>
              {/* Header: Title + Step Badge */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-accentCyan animate-ping shrink-0" />
                  <p className="text-xs font-extrabold text-white truncate font-outfit">
                    {currentStep.label}...
                  </p>
                </div>
                <span className="text-[9px] font-mono font-bold text-accentCyan bg-accentCyan/15 px-1.5 py-0.5 rounded-md border border-accentCyan/30 uppercase tracking-wider shrink-0">
                  {wakeStage + 1}/3
                </span>
              </div>

              {/* Smooth Continuous Neon Progress Bar */}
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accentCyan via-accentPurple to-accentPink shadow-[0_0_8px_rgba(var(--accent-cyan),0.9)] transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Explanatory helper subtitle */}
              <p className="text-[9.5px] text-gray-400 truncate">
                Render cold start (~15-30s) • You can still browse!
              </p>
            </>
          )}
        </div>

        {/* Easy Thumb-Friendly Dismiss Button */}
        <button
          onClick={() => setShow(false)}
          className="relative z-10 w-7 h-7 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center shrink-0 cursor-pointer active:scale-90 transition-transform touch-manipulation border border-white/5"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
