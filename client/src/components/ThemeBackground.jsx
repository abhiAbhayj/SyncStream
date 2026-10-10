import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Completely Non-Circular, Viewport-Spanning, 100% Unique Mathematical Simulation Engines:
 * 1. quantum      — 🌌 3D Isometric Wave Lattice: Full-screen diamond/hex matrix oscillating with standing waves
 * 2. cyberpunk    — ⚡ PCB Cyber Circuit Bus: Rectangular circuit tracks with 45°/90° routing & digital logic pulses
 * 3. monolith     — 🌑 Wall Street Chrono Terminal: Real-time candlestick charts, trend channels, volume histograms & 3D pyramids
 * 4. solar        — 🔥 Diagonal Solar Wind Streamers: Corner-to-corner sweeping radiation ribbons & angular heat vectors
 * 5. emerald      — 🌿 Neural Dendrite Fractal Highway: Branching organic axons & synaptic impulses spreading from edges
 * 6. neon-horizon — 🏎️ Vector Skyline & Audio Equalizer: Full-width horizontal frequency spectrum bars & neon mountain ridges
 * 7. stargate     — 🌀 Relativistic Hyperdrive Warp: Linear perspective star-streaks & streaming chromatic warp rays
 * 8. imperial     — 👑 Art Deco Diamond Tessellation: Interlocking geometric gold chevrons & cascading vertical silk streamers
 */
export default function ThemeBackground() {
  const canvasRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('syncstream_theme') || 'quantum';
  });

  // Track body class changes to switch simulation mode instantly
  useEffect(() => {
    const detectTheme = () => {
      const classList = document.body.classList;
      if (classList.contains('theme-cyberpunk')) return 'cyberpunk';
      if (classList.contains('theme-monolith')) return 'monolith';
      if (classList.contains('theme-solar')) return 'solar';
      if (classList.contains('theme-emerald')) return 'emerald';
      if (classList.contains('theme-neon-horizon')) return 'neon-horizon';
      if (classList.contains('theme-stargate')) return 'stargate';
      if (classList.contains('theme-imperial')) return 'imperial';
      return localStorage.getItem('syncstream_theme') || 'quantum';
    };

    setActiveTheme(detectTheme());

    const observer = new MutationObserver(() => {
      setActiveTheme(detectTheme());
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const handleStorage = (e) => {
      if (e.key === 'syncstream_theme') {
        setActiveTheme(e.newValue || 'quantum');
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initScene(activeTheme);
    };
    window.addEventListener('resize', handleResize);

    let state = {};
    let frame = 0;

    function initScene(theme) {
      state = {};
      frame = 0;
      const isMobile = width < 768;

      if (theme === 'quantum') {
        // 1. Full-Screen 3D Isometric Wave Lattice (NO circles, edge-to-edge grid)
        const spacing = isMobile ? 55 : 70;
        const cols = Math.ceil(width / spacing) + 2;
        const rows = Math.ceil(height / spacing) + 2;
        state = { spacing, cols, rows };
      } else if (theme === 'cyberpunk') {
        // 2. Rectangular PCB Cyber Circuit Bus (45° and 90° straight circuit traces)
        const traceCount = isMobile ? 12 : 24;
        const traces = [];
        for (let i = 0; i < traceCount; i++) {
          const startX = Math.random() * width;
          const startY = Math.random() * height;
          const length1 = Math.random() * 120 + 60;
          const length2 = Math.random() * 100 + 40;
          const dir = Math.random() > 0.5 ? 1 : -1;
          traces.push({
            x: startX,
            y: startY,
            x2: startX + length1,
            y2: startY,
            x3: startX + length1 + length2 * 0.7,
            y3: startY + length2 * dir * 0.7,
            pulseProgress: Math.random(),
            speed: Math.random() * 0.008 + 0.004,
            color: Math.random() > 0.5 ? 'rgba(0, 245, 255, 0.45)' : 'rgba(247, 37, 133, 0.4)'
          });
        }
        state = { traces };
      } else if (theme === 'monolith') {
        // 3. Wall Street Stock Terminal: Candlesticks, Moving Averages, Volume Bars & 3D Pyramids
        const count = isMobile ? 18 : 36;
        const candles = [];
        let price = height * 0.48;
        for (let i = 0; i < count; i++) {
          const change = (Math.random() - 0.49) * 32;
          const open = price;
          const close = Math.max(height * 0.2, Math.min(height * 0.7, open + change));
          const high = Math.min(open, close) - Math.random() * 16;
          const low = Math.max(open, close) + Math.random() * 16;
          const volume = Math.random() * 50 + 15;
          candles.push({ open, close, high, low, volume });
          price = close;
        }

        // Tumbling sharp 3D wireframe pyramids (Tetrahedrons) in corners
        const pyramids = [
          { x: width * 0.15, y: height * 0.25, size: isMobile ? 26 : 38, rotX: 0, rotY: 0, speed: 0.008 },
          { x: width * 0.85, y: height * 0.35, size: isMobile ? 30 : 44, rotX: 0.4, rotY: 0.2, speed: -0.006 }
        ];

        state = { candles, pyramids, shift: 0 };
      } else if (theme === 'solar') {
        // 4. Diagonal Solar Wind Radiation Streamers (Corner-to-corner sweeping ribbons)
        const ribbonCount = isMobile ? 5 : 9;
        const ribbons = [];
        for (let i = 0; i < ribbonCount; i++) {
          ribbons.push({
            offset: (i / ribbonCount) * (width + height),
            speed: Math.random() * 0.6 + 0.4,
            amp: Math.random() * 40 + 20,
            freq: Math.random() * 0.004 + 0.002,
            color: Math.random() > 0.4 ? 'rgba(249, 115, 22, 0.22)' : 'rgba(225, 29, 72, 0.18)'
          });
        }
        state = { ribbons };
      } else if (theme === 'emerald') {
        // 5. Neural Dendrite Fractal Highway (Branching organic tree corridors from edges)
        const branchCount = isMobile ? 7 : 14;
        const branches = [];
        for (let i = 0; i < branchCount; i++) {
          const startFromLeft = i % 2 === 0;
          const startX = startFromLeft ? 0 : width;
          const startY = (height / branchCount) * i + Math.random() * 30;
          const segments = [];
          let curX = startX;
          let curY = startY;
          const segCount = isMobile ? 4 : 6;
          for (let s = 0; s < segCount; s++) {
            const nextX = curX + (startFromLeft ? 1 : -1) * (Math.random() * 80 + 50);
            const nextY = curY + (Math.random() - 0.5) * 70;
            segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });
            curX = nextX;
            curY = nextY;
          }
          branches.push({ segments, pulseSeg: 0, pulseProgress: Math.random(), speed: 0.015 });
        }
        state = { branches };
      } else if (theme === 'neon-horizon') {
        // 6. Vector Mountain Skyline & Full-Width Audio Frequency Spectrum Bars
        const barCount = isMobile ? 24 : 48;
        const bars = [];
        for (let i = 0; i < barCount; i++) {
          bars.push({
            height: Math.random() * 60 + 15,
            speed: Math.random() * 0.08 + 0.04,
            phase: Math.random() * Math.PI * 2
          });
        }
        state = { bars };
      } else if (theme === 'stargate') {
        // 7. Relativistic Star-Streaks & Hyper-Speed Linear Warp Rays (Full-width horizontal flight)
        const streakCount = isMobile ? 35 : 70;
        const streaks = [];
        for (let i = 0; i < streakCount; i++) {
          streaks.push({
            x: Math.random() * width,
            y: Math.random() * height,
            length: Math.random() * 100 + 40,
            speed: Math.random() * 6 + 3,
            color: ['rgba(147, 51, 234, 0.4)', 'rgba(6, 182, 212, 0.4)', 'rgba(244, 63, 94, 0.3)'][Math.floor(Math.random() * 3)]
          });
        }
        state = { streaks };
      } else if (theme === 'imperial') {
        // 8. Art Deco Geometric Diamond Chevrons & Cascading Vertical Silk Ribbons
        const ribbonCount = isMobile ? 6 : 12;
        const ribbons = [];
        for (let i = 0; i < ribbonCount; i++) {
          ribbons.push({
            x: (width / (ribbonCount + 1)) * (i + 1),
            width: Math.random() * 14 + 8,
            speed: Math.random() * 0.4 + 0.2,
            offset: Math.random() * height
          });
        }
        state = { ribbons };
      }
    }

    initScene(activeTheme);

    const render = () => {
      frame++;

      if (activeTheme === 'quantum') {
        // 1. Full-Screen 3D Isometric Wave Lattice (NO circles)
        ctx.fillStyle = 'rgba(13, 17, 39, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { spacing, cols, rows } = state;
        if (!cols) return;

        ctx.lineWidth = 0.6;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = c * spacing;
            const waveY = Math.sin(c * 0.3 + frame * 0.015) * 12 + Math.cos(r * 0.3 + frame * 0.012) * 10;
            const y = r * spacing + waveY;

            // Draw isometric diagonal grid diamonds
            if (c < cols - 1) {
              const nextWaveY = Math.sin((c + 1) * 0.3 + frame * 0.015) * 12 + Math.cos(r * 0.3 + frame * 0.012) * 10;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + spacing, r * spacing + nextWaveY);
              ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
              ctx.stroke();
            }

            if (r < rows - 1) {
              const downWaveY = Math.sin(c * 0.3 + frame * 0.015) * 12 + Math.cos((r + 1) * 0.3 + frame * 0.012) * 10;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x, (r + 1) * spacing + downWaveY);
              ctx.strokeStyle = 'rgba(6, 182, 212, 0.10)';
              ctx.stroke();
            }

            // Small diamond nodes
            if ((c + r) % 3 === 0) {
              ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
              ctx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
            }
          }
        }
      } else if (activeTheme === 'cyberpunk') {
        // 2. Rectangular PCB Cyber Circuit Bus (NO circles)
        ctx.fillStyle = 'rgba(9, 19, 38, 0.30)';
        ctx.fillRect(0, 0, width, height);

        const { traces } = state;
        if (!traces) return;

        ctx.lineWidth = 0.8;
        for (const t of traces) {
          // Draw circuit trace lines
          ctx.beginPath();
          ctx.moveTo(t.x, t.y);
          ctx.lineTo(t.x2, t.y2);
          ctx.lineTo(t.x3, t.y3);
          ctx.strokeStyle = 'rgba(0, 245, 255, 0.12)';
          ctx.stroke();

          // Square chip pads at joints
          ctx.fillStyle = 'rgba(0, 245, 255, 0.25)';
          ctx.fillRect(t.x - 2, t.y - 2, 4, 4);
          ctx.fillRect(t.x3 - 2, t.y3 - 2, 4, 4);

          // Moving logic data pulse along the trace
          t.pulseProgress += t.speed;
          if (t.pulseProgress > 1) t.pulseProgress = 0;

          let px, py;
          if (t.pulseProgress < 0.6) {
            const p = t.pulseProgress / 0.6;
            px = t.x + (t.x2 - t.x) * p;
            py = t.y;
          } else {
            const p = (t.pulseProgress - 0.6) / 0.4;
            px = t.x2 + (t.x3 - t.x2) * p;
            py = t.y2 + (t.y3 - t.y2) * p;
          }

          ctx.fillStyle = t.color;
          ctx.fillRect(px - 2, py - 2, 4, 4);
        }
      } else if (activeTheme === 'monolith') {
        // 3. Wall Street Stock Terminal: Candlesticks, Moving Averages & 3D Pyramids (NO circles)
        ctx.fillStyle = 'rgba(5, 5, 5, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { candles, pyramids } = state;
        if (!candles) return;

        const candleW = width / candles.length;
        const baseline = height * 0.88;

        // Draw Volume Histogram Bars rising from bottom edge
        for (let i = 0; i < candles.length; i++) {
          const c = candles[i];
          const x = i * candleW + candleW * 0.15;
          const isBull = c.close >= c.open;
          ctx.fillStyle = isBull ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.14)';
          ctx.fillRect(x, baseline - c.volume, candleW * 0.7, c.volume);
        }

        // Draw Candlestick Price Bars
        for (let i = 0; i < candles.length; i++) {
          const c = candles[i];
          const x = i * candleW + candleW * 0.2;
          const isBull = c.close >= c.open;
          const color = isBull ? 'rgba(59, 130, 246, 0.35)' : 'rgba(239, 68, 68, 0.32)';

          // Upper & Lower Wicks
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(x + candleW * 0.3, c.high);
          ctx.lineTo(x + candleW * 0.3, c.low);
          ctx.stroke();

          // Real Rectangular Candle Body
          const top = Math.min(c.open, c.close);
          const h = Math.max(3, Math.abs(c.close - c.open));
          ctx.fillStyle = isBull ? 'rgba(59, 130, 246, 0.25)' : 'rgba(239, 68, 68, 0.22)';
          ctx.fillRect(x, top, candleW * 0.6, h);
        }

        // Moving Average Trend Lines
        ctx.beginPath();
        for (let i = 0; i < candles.length; i++) {
          const x = i * candleW + candleW * 0.5;
          const y = (candles[i].open + candles[i].close) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.30)';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Tumbling 3D Wireframe Pyramids (Sharp triangles/quads)
        if (pyramids) {
          for (const p of pyramids) {
            p.rotX += p.speed;
            p.rotY += p.speed * 0.7;

            ctx.save();
            ctx.translate(p.x, p.y);

            // 4 vertices of a 3D pyramid (tetrahedron)
            const v = [
              { x: 0, y: -p.size, z: 0 },
              { x: p.size * 0.86, y: p.size * 0.5, z: -p.size * 0.5 },
              { x: -p.size * 0.86, y: p.size * 0.5, z: -p.size * 0.5 },
              { x: 0, y: p.size * 0.5, z: p.size }
            ];

            const pv = v.map((pt) => {
              const x1 = pt.x * Math.cos(p.rotY) - pt.z * Math.sin(p.rotY);
              const z1 = pt.x * Math.sin(p.rotY) + pt.z * Math.cos(p.rotY);
              const y2 = pt.y * Math.cos(p.rotX) - z1 * Math.sin(p.rotX);
              return { x: x1, y: y2 };
            });

            ctx.strokeStyle = 'rgba(226, 232, 240, 0.22)';
            ctx.lineWidth = 0.8;
            const edges = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1]];
            for (const [e1, e2] of edges) {
              ctx.beginPath();
              ctx.moveTo(pv[e1].x, pv[e1].y);
              ctx.lineTo(pv[e2].x, pv[e2].y);
              ctx.stroke();
            }
            ctx.restore();
          }
        }
      } else if (activeTheme === 'solar') {
        // 4. Diagonal Solar Wind Radiation Streamers (Corner-to-corner waves, NO circles)
        ctx.fillStyle = 'rgba(36, 13, 7, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { ribbons } = state;
        if (!ribbons) return;

        ctx.lineWidth = 1.0;
        for (const r of ribbons) {
          ctx.beginPath();
          // Draw diagonal sinusoidal wave across entire screen
          for (let d = -100; d < width + height + 100; d += 25) {
            const wave = Math.sin(d * r.freq + frame * 0.02) * r.amp;
            const x = d * 0.6 + wave;
            const y = d * 0.4 - wave;
            if (d === -100) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = r.color;
          ctx.stroke();
        }
      } else if (activeTheme === 'emerald') {
        // 5. Neural Dendrite Fractal Highway (Branching organic tree corridors from edges, NO circles)
        ctx.fillStyle = 'rgba(4, 32, 24, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { branches } = state;
        if (!branches) return;

        ctx.lineWidth = 0.7;
        for (const b of branches) {
          // Draw connected dendritic tree segments
          for (const s of b.segments) {
            ctx.beginPath();
            ctx.moveTo(s.x1, s.y1);
            ctx.lineTo(s.x2, s.y2);
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.16)';
            ctx.stroke();
          }

          // Electric action potential pulse traveling along the branch
          b.pulseProgress += b.speed;
          if (b.pulseProgress > 1) {
            b.pulseProgress = 0;
            b.pulseSeg = (b.pulseSeg + 1) % b.segments.length;
          }

          const curSeg = b.segments[b.pulseSeg];
          if (curSeg) {
            const px = curSeg.x1 + (curSeg.x2 - curSeg.x1) * b.pulseProgress;
            const py = curSeg.y1 + (curSeg.y2 - curSeg.y1) * b.pulseProgress;
            ctx.fillStyle = 'rgba(217, 249, 157, 0.55)';
            ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
          }
        }
      } else if (activeTheme === 'neon-horizon') {
        // 6. Vector Mountain Skyline & Full-Width Audio Equalizer (NO circles)
        ctx.fillStyle = 'rgba(23, 12, 41, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { bars } = state;
        if (!bars) return;

        // Draw Full-Width Vector Mountain Skyline
        const groundY = height * 0.78;
        ctx.strokeStyle = 'rgba(255, 0, 127, 0.22)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        const peaks = [
          { x: 0, y: groundY },
          { x: width * 0.15, y: groundY - 55 },
          { x: width * 0.30, y: groundY - 20 },
          { x: width * 0.48, y: groundY - 75 },
          { x: width * 0.65, y: groundY - 35 },
          { x: width * 0.82, y: groundY - 60 },
          { x: width, y: groundY }
        ];
        for (let i = 0; i < peaks.length; i++) {
          ctx.lineTo(peaks[i].x, peaks[i].y);
        }
        ctx.stroke();

        // Draw Full-Width Equalizer Spectrum Bars across the bottom
        const barW = width / bars.length;
        for (let i = 0; i < bars.length; i++) {
          const b = bars[i];
          const dynamicH = Math.abs(Math.sin(frame * b.speed + b.phase)) * b.height;
          const x = i * barW + barW * 0.2;
          const y = height - dynamicH - 10;

          ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 0, 127, 0.22)' : 'rgba(0, 223, 216, 0.20)';
          ctx.fillRect(x, y, barW * 0.6, dynamicH);
        }
      } else if (activeTheme === 'stargate') {
        // 7. Relativistic Hyper-Speed Linear Warp Rays (Full-screen horizontal flight, NO circles)
        ctx.fillStyle = 'rgba(7, 8, 20, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { streaks } = state;
        if (!streaks) return;

        for (const s of streaks) {
          s.x -= s.speed;
          if (s.x < -s.length) {
            s.x = width + 50;
            s.y = Math.random() * height;
          }

          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + s.length, s.y);
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }
      } else if (activeTheme === 'imperial') {
        // 8. Art Deco Geometric Diamond Chevrons & Cascading Vertical Silk Ribbons (NO circles)
        ctx.fillStyle = 'rgba(18, 14, 6, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { ribbons } = state;
        if (!ribbons) return;

        // Draw Interlocking Art Deco Chevrons across the background
        const chevronW = 80;
        const chevronH = 35;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.12)';
        ctx.lineWidth = 0.8;
        for (let x = 0; x <= width + chevronW; x += chevronW) {
          for (let y = 0; y <= height + chevronH; y += chevronH) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + chevronW / 2, y + chevronH / 2);
            ctx.lineTo(x + chevronW, y);
            ctx.stroke();
          }
        }

        // Cascading Vertical Silk Ribbons
        for (const r of ribbons) {
          r.offset = (r.offset + r.speed) % height;
          ctx.fillStyle = 'rgba(251, 191, 36, 0.10)';
          ctx.fillRect(r.x, 0, r.width, height);

          // Moving gold highlight beam
          ctx.fillStyle = 'rgba(254, 243, 199, 0.22)';
          ctx.fillRect(r.x, r.offset, r.width, 35);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTheme]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-darkBg transition-all duration-700 ease-in-out">
      <div className="absolute inset-0 z-0 noise-overlay opacity-15"></div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 block animate-fade-in opacity-40 transition-opacity duration-700"
        key={activeTheme}
      />
      <div className="absolute inset-0 z-20 pointer-events-none hero-gradient opacity-80 transition-all duration-700" />
    </div>
  );
}
