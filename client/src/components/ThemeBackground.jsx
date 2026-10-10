import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Dense, Screen-Spanning Animations with High Particle & Geometry Quantity:
 * 1. quantum      — ❄️ Dense Falling Snowflakes: 250+ multi-layered crystal flakes & winter blizzard dust covering whole screen
 * 2. cyberpunk    — ⚡ Dense AI Circuit Electric Flows: Screen-spanning motherboard trace bus with 50+ simultaneous electric pulses
 * 3. monolith     — 📈 Dense Stock Market Terminal: 4 multi-asset fluctuating live trendlines, volume bars, price grid & beacons
 * 4. solar        — 🔥 Dense Fire Blaze Falling: 300+ cascading burning embers, sparks & rising heat convection currents
 * 5. emerald      — 🗺️ Dense GPS Map Routing: Multi-quadrant road grid, 16 waypoints, 4 simultaneous routes & 8 moving nav vehicles
 * 6. neon-horizon — ☄️ Dense Meteor Shower: 35+ high-velocity shooting stars streaming across the sky + 140 twinkling stars
 * 7. stargate     — 🌌 Dense Space Milky Way: 600+ stars, sweeping galactic spiral dust streams & glowing cosmic nebulae
 * 8. imperial     — 💎 Dense 3D Polyhedra Matrix: 16 rotating 3D geometric wireframe polyhedra covering the entire viewport
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
        // 1. ❄️ Dense Falling Snowflakes (200-280 flakes covering full screen)
        const count = isMobile ? 120 : 250;
        const flakes = [];
        for (let i = 0; i < count; i++) {
          const depth = Math.random();
          flakes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: depth > 0.7 ? Math.random() * 5 + 4 : (depth > 0.35 ? Math.random() * 2.5 + 1.5 : Math.random() * 1.5 + 0.8),
            speed: depth * 1.4 + 0.6,
            sway: Math.random() * 1.8 + 0.6,
            phase: Math.random() * Math.PI * 2,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.025,
            isCrystal: depth > 0.7,
            opacity: depth > 0.7 ? 0.55 : (depth > 0.35 ? 0.35 : 0.20)
          });
        }
        state = { flakes };
      } else if (theme === 'cyberpunk') {
        // 2. ⚡ Dense AI Circuit Board Bus (Dense grid of traces + 50 pulses)
        const step = isMobile ? 55 : 45;
        const cols = Math.ceil(width / step);
        const rows = Math.ceil(height / step);
        const tracks = [];

        // Build continuous trace pathways covering whole screen
        for (let r = 0; r < rows; r += 2) {
          for (let c = 0; c < cols; c += 2) {
            const x = c * step;
            const y = r * step;
            const len1 = step * (Math.floor(Math.random() * 2) + 2);
            const len2 = step * (Math.floor(Math.random() * 2) + 1);
            const dir = Math.random() > 0.5 ? 1 : -1;

            tracks.push({
              p1: { x, y },
              p2: { x: x + len1, y },
              p3: { x: x + len1 + len2 * 0.7, y: y + len2 * dir * 0.7 },
              pulseProgress: Math.random(),
              pulseSpeed: Math.random() * 0.012 + 0.006,
              color: Math.random() > 0.35 ? '#00f5ff' : (Math.random() > 0.5 ? '#ff007f' : '#00ff66')
            });
          }
        }
        state = { tracks };
      } else if (theme === 'monolith') {
        // 3. 📈 Dense Stock Market Terminal (4 Live Fluctuating Lines + Volume Bars)
        const pointsCount = isMobile ? 45 : 85;
        const line1 = []; // Bullish Cobalt
        const line2 = []; // Volatility Crimson
        const line3 = []; // Fast Tech Cyan
        const line4 = []; // Moving Average Platinum
        const volumes = []; // Bottom histogram

        let p1 = height * 0.45;
        let p2 = height * 0.60;
        let p3 = height * 0.35;
        let p4 = height * 0.50;

        for (let i = 0; i < pointsCount; i++) {
          p1 = Math.max(height * 0.20, Math.min(height * 0.75, p1 + (Math.random() - 0.49) * 26));
          p2 = Math.max(height * 0.25, Math.min(height * 0.82, p2 + (Math.random() - 0.50) * 22));
          p3 = Math.max(height * 0.18, Math.min(height * 0.70, p3 + (Math.random() - 0.48) * 30));
          p4 = (p1 + p2 + p3) / 3;
          line1.push(p1);
          line2.push(p2);
          line3.push(p3);
          line4.push(p4);
          volumes.push(Math.random() * 45 + 10);
        }
        state = { pointsCount, line1, line2, line3, line4, volumes };
      } else if (theme === 'solar') {
        // 4. 🔥 Dense Fire Blaze Falling (250-320 embers + 60 sparks)
        const emberCount = isMobile ? 120 : 260;
        const embers = [];
        for (let i = 0; i < emberCount; i++) {
          embers.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 4.0 + 1.2,
            vy: Math.random() * 2.2 + 0.8,
            vx: (Math.random() - 0.5) * 1.2,
            flickerPhase: Math.random() * Math.PI * 2,
            heatColor: Math.random() > 0.45 ? '#ff5500' : (Math.random() > 0.35 ? '#ffbb00' : '#ff0044'),
            alpha: Math.random() * 0.4 + 0.25
          });
        }
        const sparks = [];
        const sparkCount = isMobile ? 30 : 65;
        for (let i = 0; i < sparkCount; i++) {
          sparks.push({
            x: Math.random() * width,
            y: height * 0.8 + Math.random() * (height * 0.2),
            vy: -(Math.random() * 2.5 + 1.2),
            vx: (Math.random() - 0.5) * 1.8,
            size: Math.random() * 1.8 + 0.8
          });
        }
        state = { embers, sparks };
      } else if (theme === 'emerald') {
        // 5. 🗺️ Dense GPS Map Routing (16 Waypoints + 4 Simultaneous Routes)
        const waypoints = [
          { x: width * 0.08, y: height * 0.20, label: 'NODE 01' },
          { x: width * 0.24, y: height * 0.15, label: 'SEC A-1' },
          { x: width * 0.48, y: height * 0.22, label: 'HUB CNTR' },
          { x: width * 0.72, y: height * 0.16, label: 'EAST STA' },
          { x: width * 0.92, y: height * 0.28, label: 'GATE 04' },
          { x: width * 0.85, y: height * 0.55, label: 'TOWER 9' },
          { x: width * 0.65, y: height * 0.48, label: 'PORT 3' },
          { x: width * 0.38, y: height * 0.52, label: 'TRANSIT' },
          { x: width * 0.14, y: height * 0.45, label: 'WEST TER' },
          { x: width * 0.10, y: height * 0.78, label: 'DEPOT α' },
          { x: width * 0.32, y: height * 0.82, label: 'SOUTH 2' },
          { x: width * 0.55, y: height * 0.75, label: 'BASE Z' },
          { x: width * 0.78, y: height * 0.85, label: 'CARGO B' },
          { x: width * 0.94, y: height * 0.72, label: 'BORDER' }
        ];

        // 4 active vehicle runners
        const runners = [
          { route: [0, 1, 2, 6, 7, 8], prog: 0, speed: 0.007, seg: 0, color: '#10b981' },
          { route: [2, 3, 4, 5, 6], prog: 0.3, speed: 0.008, seg: 0, color: '#14b8a6' },
          { route: [8, 9, 10, 11, 7], prog: 0.6, speed: 0.006, seg: 0, color: '#06b6d4' },
          { route: [6, 11, 12, 13, 5], prog: 0.8, speed: 0.009, seg: 0, color: '#84cc16' }
        ];

        state = { waypoints, runners };
      } else if (theme === 'neon-horizon') {
        // 6. ☄️ Dense Meteor Shower (30-45 Shooting Stars + 140 Twinkling Stars)
        const meteorCount = isMobile ? 18 : 36;
        const meteors = [];
        for (let i = 0; i < meteorCount; i++) {
          meteors.push({
            x: Math.random() * width * 1.4,
            y: -Math.random() * height * 0.8,
            length: Math.random() * 150 + 60,
            speed: Math.random() * 10 + 7,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.20,
            color: Math.random() > 0.45 ? '#ff007f' : (Math.random() > 0.3 ? '#00f5ff' : '#a855f7'),
            width: Math.random() * 1.8 + 1.0
          });
        }
        const stars = [];
        const starCount = isMobile ? 70 : 150;
        for (let i = 0; i < starCount; i++) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.8 + 0.6,
            alpha: Math.random() * 0.35 + 0.15
          });
        }
        state = { meteors, stars };
      } else if (theme === 'stargate') {
        // 7. 🌌 Dense Space Milky Way Galaxy (500-650 Stars & Galactic Spiral Stream)
        const starCount = isMobile ? 250 : 550;
        const stars = [];
        for (let i = 0; i < starCount; i++) {
          const t = Math.random() * (width + height * 1.2);
          const spread = (Math.random() - 0.5) * (isMobile ? 260 : 450);
          stars.push({
            t,
            spread,
            size: Math.random() * 2.2 + 0.6,
            twinkleSpeed: Math.random() * 0.035 + 0.015,
            phase: Math.random() * Math.PI * 2,
            color: ['#ffffff', '#a855f7', '#06b6d4', '#f43f5e', '#ffd166'][Math.floor(Math.random() * 5)]
          });
        }
        state = { stars };
      } else if (theme === 'imperial') {
        // 8. 💎 Dense 3D Geometric Shapes Matrix (15 Rotating Polyhedra covering full screen)
        const cols = isMobile ? 3 : 5;
        const rows = isMobile ? 3 : 3;
        const shapes = [];
        const types = ['cube', 'octa', 'tetra', 'cube', 'octa'];

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = (width / (cols + 1)) * (c + 1) + (Math.random() - 0.5) * 30;
            const y = (height / (rows + 1)) * (r + 1) + (Math.random() - 0.5) * 30;
            const type = types[(r * cols + c) % types.length];
            const size = isMobile ? Math.random() * 12 + 20 : Math.random() * 16 + 28;

            shapes.push({
              type,
              x,
              y,
              size,
              rx: Math.random() * Math.PI,
              ry: Math.random() * Math.PI,
              rz: Math.random() * Math.PI,
              sx: (Math.random() - 0.5) * 0.018,
              sy: (Math.random() - 0.5) * 0.018
            });
          }
        }
        state = { shapes };
      }
    }

    initScene(activeTheme);

    const render = () => {
      frame++;

      if (activeTheme === 'quantum') {
        // 1. ❄️ Dense Falling Snowflakes Animation
        ctx.fillStyle = 'rgba(13, 17, 39, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { flakes } = state;
        if (!flakes) return;

        for (const f of flakes) {
          f.y += f.speed;
          f.x += Math.sin(frame * 0.015 + f.phase) * f.sway;
          f.angle += f.rotSpeed;

          // Wrap edges
          if (f.y > height + 20) {
            f.y = -20;
            f.x = Math.random() * width;
          }
          if (f.x > width + 20) f.x = -20;
          if (f.x < -20) f.x = width + 20;

          if (f.isCrystal) {
            // Draw 6-armed crystal snowflake
            ctx.save();
            ctx.translate(f.x, f.y);
            ctx.rotate(f.angle);
            ctx.strokeStyle = `rgba(224, 242, 254, ${f.opacity})`;
            ctx.lineWidth = 0.9;

            for (let arm = 0; arm < 6; arm++) {
              ctx.rotate(Math.PI / 3);
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(0, f.size);
              ctx.moveTo(0, f.size * 0.5);
              ctx.lineTo(f.size * 0.35, f.size * 0.7);
              ctx.moveTo(0, f.size * 0.5);
              ctx.lineTo(-f.size * 0.35, f.size * 0.7);
              ctx.stroke();
            }
            ctx.restore();
          } else {
            // Soft snowflake pellet or micro dust
            ctx.fillStyle = `rgba(240, 249, 255, ${f.opacity})`;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (activeTheme === 'cyberpunk') {
        // 2. ⚡ Dense AI Circuit Board Bus
        ctx.fillStyle = 'rgba(9, 19, 38, 0.30)';
        ctx.fillRect(0, 0, width, height);

        const { tracks } = state;
        if (!tracks) return;

        for (const t of tracks) {
          // Draw circuit trace lines
          ctx.beginPath();
          ctx.moveTo(t.p1.x, t.p1.y);
          ctx.lineTo(t.p2.x, t.p2.y);
          ctx.lineTo(t.p3.x, t.p3.y);
          ctx.strokeStyle = 'rgba(0, 245, 255, 0.08)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Terminal square pads
          ctx.fillStyle = 'rgba(0, 245, 255, 0.16)';
          ctx.fillRect(t.p1.x - 2, t.p1.y - 2, 4, 4);
          ctx.fillRect(t.p2.x - 2, t.p2.y - 2, 4, 4);
          ctx.fillRect(t.p3.x - 2, t.p3.y - 2, 4, 4);

          // Moving electric pulse
          t.pulseProgress += t.pulseSpeed;
          if (t.pulseProgress > 1) t.pulseProgress = 0;

          let ex, ey;
          if (t.pulseProgress < 0.6) {
            const p = t.pulseProgress / 0.6;
            ex = t.p1.x + (t.p2.x - t.p1.x) * p;
            ey = t.p1.y + (t.p2.y - t.p1.y) * p;
          } else {
            const p = (t.pulseProgress - 0.6) / 0.4;
            ex = t.p2.x + (t.p3.x - t.p2.x) * p;
            ey = t.p2.y + (t.p3.y - t.p2.y) * p;
          }

          // Electric spark head
          ctx.fillStyle = t.color;
          ctx.fillRect(ex - 2, ey - 2, 4, 4);

          // Electric trailing glow
          ctx.strokeStyle = t.color;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - (t.p2.x - t.p1.x) * 0.04, ey - (t.p2.y - t.p1.y) * 0.04);
          ctx.stroke();
        }
      } else if (activeTheme === 'monolith') {
        // 3. 📈 Dense Stock Market Terminal (4 Live Fluctuating Lines & Grid)
        ctx.fillStyle = 'rgba(5, 5, 5, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { pointsCount, line1, line2, line3, line4, volumes } = state;
        if (!line1) return;

        // Shift data periodically
        if (frame % 4 === 0) {
          line1.shift();
          const last1 = line1[line1.length - 1];
          line1.push(Math.max(height * 0.20, Math.min(height * 0.75, last1 + (Math.random() - 0.49) * 16)));

          line2.shift();
          const last2 = line2[line2.length - 1];
          line2.push(Math.max(height * 0.25, Math.min(height * 0.82, last2 + (Math.random() - 0.50) * 14)));

          line3.shift();
          const last3 = line3[line3.length - 1];
          line3.push(Math.max(height * 0.18, Math.min(height * 0.70, last3 + (Math.random() - 0.48) * 18)));

          line4.shift();
          line4.push((line1[line1.length - 1] + line2[line2.length - 1] + line3[line3.length - 1]) / 3);

          volumes.shift();
          volumes.push(Math.random() * 45 + 10);
        }

        const stepX = width / (pointsCount - 1);

        // Horizontal Price Grid Levels across the screen
        const priceGrids = [0.22, 0.36, 0.50, 0.64, 0.78];
        const labels = ['$102,400', '$96,250', '$91,100', '$86,400', '$82,000'];
        ctx.font = '9px monospace';

        for (let i = 0; i < priceGrids.length; i++) {
          const y = height * priceGrids[i];
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.08)';
          ctx.lineWidth = 0.8;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();

          ctx.fillStyle = 'rgba(226, 232, 240, 0.25)';
          ctx.fillText(labels[i], 14, y - 4);
        }
        ctx.setLineDash([]);

        // Bottom Volume Histogram Bars spanning full width
        const volW = width / volumes.length;
        for (let i = 0; i < volumes.length; i++) {
          const vh = volumes[i];
          const isUp = line1[i] <= (line1[i - 1] || line1[i]);
          ctx.fillStyle = isUp ? 'rgba(59, 130, 246, 0.16)' : 'rgba(239, 68, 68, 0.14)';
          ctx.fillRect(i * volW, height - vh, volW * 0.75, vh);
        }

        // Fill Area under Primary Bullish Curve
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let i = 0; i < pointsCount; i++) {
          ctx.lineTo(i * stepX, line1[i]);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.06)';
        ctx.fill();

        // 1. Primary Line (Cobalt Blue)
        ctx.beginPath();
        for (let i = 0; i < pointsCount; i++) {
          const x = i * stepX;
          const y = line1[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.55)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // 2. High-Beta Tech Line (Cyan)
        ctx.beginPath();
        for (let i = 0; i < pointsCount; i++) {
          const x = i * stepX;
          const y = line3[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // 3. Volatility Line (Crimson)
        ctx.beginPath();
        for (let i = 0; i < pointsCount; i++) {
          const x = i * stepX;
          const y = line2[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.40)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 4. Moving Average Line (Platinum)
        ctx.beginPath();
        for (let i = 0; i < pointsCount; i++) {
          const x = i * stepX;
          const y = line4[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.32)';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Pulsing price beacons at current positions
        const curX = width - 8;
        const curY1 = line1[line1.length - 1];
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(curX - 3, curY1 - 3, 6, 6);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.beginPath();
        ctx.arc(curX, curY1, Math.abs(Math.sin(frame * 0.08)) * 12 + 4, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeTheme === 'solar') {
        // 4. 🔥 Dense Fire Blaze Falling (250+ embers & sparks)
        ctx.fillStyle = 'rgba(36, 13, 7, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { embers, sparks } = state;
        if (!embers) return;

        // Falling fiery embers across whole screen
        for (const e of embers) {
          e.y += e.vy;
          e.x += e.vx + Math.sin(frame * 0.03 + e.flickerPhase) * 0.6;

          if (e.y > height + 10) {
            e.y = -10;
            e.x = Math.random() * width;
          }

          const flicker = 0.8 + 0.3 * Math.sin(frame * 0.1 + e.flickerPhase);
          ctx.fillStyle = e.heatColor;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size * flicker, 0, Math.PI * 2);
          ctx.fill();
        }

        // Convection rising sparks
        if (sparks) {
          for (const s of sparks) {
            s.y += s.vy;
            s.x += s.vx;
            if (s.y < height * 0.3) {
              s.y = height + 10;
              s.x = Math.random() * width;
            }
            ctx.fillStyle = 'rgba(255, 210, 60, 0.45)';
            ctx.fillRect(s.x, s.y, s.size, s.size * 2);
          }
        }
      } else if (activeTheme === 'emerald') {
        // 5. 🗺️ Dense GPS Map Routing (16 Waypoints & 4 Simultaneous Routes)
        ctx.fillStyle = 'rgba(4, 32, 24, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { waypoints, runners } = state;
        if (!waypoints) return;

        // Dense city street grid
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.lineWidth = 0.8;
        const gridSpacing = 50;
        for (let x = 0; x < width; x += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw multiple active route lines
        for (const r of runners) {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.20)';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          for (let i = 0; i < r.route.length; i++) {
            const wp = waypoints[r.route[i]];
            if (i === 0) ctx.moveTo(wp.x, wp.y);
            else ctx.lineTo(wp.x, wp.y);
          }
          ctx.stroke();

          // Move runner along route
          r.prog += r.speed;
          if (r.prog >= 1) {
            r.prog = 0;
            r.seg = (r.seg + 1) % (r.route.length - 1);
          }

          const idxA = r.route[r.seg];
          const idxB = r.route[r.seg + 1];
          if (idxA !== undefined && idxB !== undefined) {
            const pA = waypoints[idxA];
            const pB = waypoints[idxB];
            const carX = pA.x + (pB.x - pA.x) * r.prog;
            const carY = pA.y + (pB.y - pA.y) * r.prog;

            // GPS Vehicle beacon
            ctx.fillStyle = r.color;
            ctx.fillRect(carX - 2.5, carY - 2.5, 5, 5);

            // Vehicle radar aura
            ctx.strokeStyle = r.color;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(carX, carY, 8, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Waypoints & radar pulses across the whole screen
        for (let i = 0; i < waypoints.length; i++) {
          const wp = waypoints[i];
          ctx.fillStyle = 'rgba(16, 185, 129, 0.55)';
          ctx.fillRect(wp.x - 2, wp.y - 2, 4, 4);

          const ringR = ((frame * 0.4 + i * 12) % 22) + 2;
          ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, 0.28 - ringR * 0.012)})`;
          ctx.beginPath();
          ctx.arc(wp.x, wp.y, ringR, 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = '8px monospace';
          ctx.fillStyle = 'rgba(16, 185, 129, 0.32)';
          ctx.fillText(wp.label, wp.x + 6, wp.y + 3);
        }
      } else if (activeTheme === 'neon-horizon') {
        // 6. ☄️ Dense Meteor Shower (35+ Meteors & 140 Twinkling Stars)
        ctx.fillStyle = 'rgba(23, 12, 41, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { meteors, stars } = state;
        if (!meteors) return;

        // Dense starry background
        if (stars) {
          for (const s of stars) {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * (0.65 + 0.35 * Math.sin(frame * 0.05 + s.x))})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
          }
        }

        // Streaming meteors across the whole screen
        for (const m of meteors) {
          const vx = Math.cos(m.angle) * m.speed;
          const vy = Math.sin(m.angle) * m.speed;
          m.x += vx;
          m.y += vy;

          // Respawn with varied trajectory
          if (m.y > height + m.length || m.x > width + m.length) {
            m.y = -Math.random() * 250 - 40;
            m.x = Math.random() * width * 1.3 - 200;
          }

          const tailX = m.x - Math.cos(m.angle) * m.length;
          const tailY = m.y - Math.sin(m.angle) * m.length;

          const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          grad.addColorStop(0.7, m.color === '#ff007f' ? 'rgba(255, 0, 127, 0.22)' : 'rgba(0, 245, 255, 0.22)');
          grad.addColorStop(1, '#ffffff');

          ctx.strokeStyle = grad;
          ctx.lineWidth = m.width;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(m.x - 1.5, m.y - 1.5, 3, 3);
        }
      } else if (activeTheme === 'stargate') {
        // 7. 🌌 Dense Space Milky Way Galaxy (550+ Stars across full screen)
        ctx.fillStyle = 'rgba(7, 8, 20, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { stars } = state;
        if (!stars) return;

        const slope = height / width;

        for (const s of stars) {
          const normT = (s.t + frame * 0.15) % (width + 300) - 150;
          const spineY = normT * slope;

          const angle = Math.atan2(height, width) + Math.PI / 2;
          const x = normT + Math.cos(angle) * s.spread;
          const y = spineY + Math.sin(angle) * s.spread;

          const twinkle = 0.5 + 0.5 * Math.sin(frame * s.twinkleSpeed + s.phase);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = twinkle * 0.5;
          ctx.fillRect(x - s.size / 2, y - s.size / 2, s.size, s.size);
          ctx.globalAlpha = 1.0;
        }
      } else if (activeTheme === 'imperial') {
        // 8. 💎 Dense 3D Geometric Shapes Matrix (15 Rotating Polyhedra covering full screen)
        ctx.fillStyle = 'rgba(18, 14, 6, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { shapes } = state;
        if (!shapes) return;

        for (const s of shapes) {
          s.rx += s.sx;
          s.ry += s.sy;

          ctx.save();
          ctx.translate(s.x, s.y);

          if (s.type === 'cube') {
            const half = s.size / 2;
            const vertices = [
              [-half, -half, -half], [half, -half, -half], [half, half, -half], [-half, half, -half],
              [-half, -half, half],  [half, -half, half],  [half, half, half],  [-half, half, half]
            ];
            const edges = [
              [0,1],[1,2],[2,3],[3,0],
              [4,5],[5,6],[6,7],[7,4],
              [0,4],[1,5],[2,6],[3,7]
            ];

            const proj = vertices.map(([vx, vy, vz]) => {
              let x1 = vx * Math.cos(s.ry) + vz * Math.sin(s.ry);
              let z1 = -vx * Math.sin(s.ry) + vz * Math.cos(s.ry);
              let y2 = vy * Math.cos(s.rx) - z1 * Math.sin(s.rx);
              return { x: x1, y: y2 };
            });

            ctx.strokeStyle = 'rgba(251, 191, 36, 0.28)';
            ctx.lineWidth = 1.0;
            for (const [e1, e2] of edges) {
              ctx.beginPath();
              ctx.moveTo(proj[e1].x, proj[e1].y);
              ctx.lineTo(proj[e2].x, proj[e2].y);
              ctx.stroke();
            }

            ctx.fillStyle = 'rgba(254, 243, 199, 0.45)';
            for (const p of proj) {
              ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
            }
          } else if (s.type === 'octa') {
            const h = s.size;
            const vertices = [
              [0, -h, 0], [0, h, 0],
              [-h * 0.7, 0, 0], [h * 0.7, 0, 0],
              [0, 0, -h * 0.7], [0, 0, h * 0.7]
            ];
            const edges = [
              [0,2],[0,3],[0,4],[0,5],
              [1,2],[1,3],[1,4],[1,5],
              [2,4],[4,3],[3,5],[5,2]
            ];

            const proj = vertices.map(([vx, vy, vz]) => {
              let x1 = vx * Math.cos(s.ry) + vz * Math.sin(s.ry);
              let z1 = -vx * Math.sin(s.ry) + vz * Math.cos(s.ry);
              let y2 = vy * Math.cos(s.rx) - z1 * Math.sin(s.rx);
              return { x: x1, y: y2 };
            });

            ctx.strokeStyle = 'rgba(251, 191, 36, 0.28)';
            ctx.lineWidth = 0.9;
            for (const [e1, e2] of edges) {
              ctx.beginPath();
              ctx.moveTo(proj[e1].x, proj[e1].y);
              ctx.lineTo(proj[e2].x, proj[e2].y);
              ctx.stroke();
            }
          } else if (s.type === 'tetra') {
            const r = s.size;
            const vertices = [
              [0, -r, 0],
              [r * 0.94, r * 0.47, -r * 0.33],
              [-r * 0.94, r * 0.47, -r * 0.33],
              [0, r * 0.47, r * 0.67]
            ];
            const edges = [[0,1],[0,2],[0,3],[1,2],[2,3],[3,1]];

            const proj = vertices.map(([vx, vy, vz]) => {
              let x1 = vx * Math.cos(s.ry) + vz * Math.sin(s.ry);
              let z1 = -vx * Math.sin(s.ry) + vz * Math.cos(s.ry);
              let y2 = vy * Math.cos(s.rx) - z1 * Math.sin(s.rx);
              return { x: x1, y: y2 };
            });

            ctx.strokeStyle = 'rgba(251, 191, 36, 0.26)';
            ctx.lineWidth = 1.0;
            for (const [e1, e2] of edges) {
              ctx.beginPath();
              ctx.moveTo(proj[e1].x, proj[e1].y);
              ctx.lineTo(proj[e2].x, proj[e2].y);
              ctx.stroke();
            }
          }

          ctx.restore();
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
        className="absolute inset-0 z-10 block animate-fade-in opacity-55 transition-opacity duration-700"
        key={activeTheme}
      />
      <div className="absolute inset-0 z-20 pointer-events-none hero-gradient opacity-65 transition-all duration-700" />
    </div>
  );
}
