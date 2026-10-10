import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Completely Unique, Requested Animation Engines:
 * 1. quantum      — ❄️ Realistic Falling Snowflakes: Multi-layered 6-arm crystal snowflakes drifting with winter physics
 * 2. cyberpunk    — ⚡ Cyberpunk AI Circuit Electric Flows: PCB motherboard tracks with high-voltage electric currents & spark nodes
 * 3. monolith     — 📈 Real-Time Stock Market Lines: Fluctuating multi-asset price lines, support/resistance grids & pulsing beacons
 * 4. solar        — 🔥 Fire Blaze Falling: Cascading burning embers, glowing flame sparks with heat turbulence & convection
 * 5. emerald      — 🗺️ GPS Map Type Routing Effect: Futuristic vector city roadmap with waypoint pins & animated route tracing
 * 6. neon-horizon — ☄️ Meteor Beam Star Falling: Diagonal hyper-velocity shooting stars with ionization tails & stardust bursts
 * 7. stargate     — 🌌 Space Milky Way Galaxy: Diagonal celestial galactic dust river, shimmering star clusters & nebula clouds
 * 8. imperial     — 💎 Static 3D Geometric Shapes Rotating: Polyhedra (cubes, octahedrons, icosahedrons) rotating on 3D axes
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
        // 1. ❄️ Falling Snowflakes (Crystalline 6-arm dendrites, pellets & dust)
        const count = isMobile ? 55 : 95;
        const flakes = [];
        for (let i = 0; i < count; i++) {
          const depth = Math.random(); // 0: far dust, 1: large crystalline foreground
          flakes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: depth > 0.65 ? Math.random() * 5 + 4 : Math.random() * 2.5 + 1,
            speed: depth * 1.2 + 0.5,
            sway: Math.random() * 1.5 + 0.5,
            phase: Math.random() * Math.PI * 2,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            isCrystal: depth > 0.65,
            opacity: depth > 0.65 ? 0.45 : 0.22
          });
        }
        state = { flakes };
      } else if (theme === 'cyberpunk') {
        // 2. ⚡ Cyberpunk AI Circuit Electric Flows
        const segmentCount = isMobile ? 18 : 36;
        const tracks = [];
        for (let i = 0; i < segmentCount; i++) {
          const startX = Math.floor(Math.random() * (width / 50)) * 50;
          const startY = Math.floor(Math.random() * (height / 50)) * 50;
          const len1 = (Math.floor(Math.random() * 3) + 2) * 50;
          const len2 = (Math.floor(Math.random() * 2) + 1) * 50;
          const horizontalFirst = Math.random() > 0.5;
          const p1 = { x: startX, y: startY };
          const p2 = horizontalFirst ? { x: startX + len1, y: startY } : { x: startX, y: startY + len1 };
          const p3 = horizontalFirst ? { x: p2.x + len2 * 0.7, y: p2.y + len2 * 0.7 } : { x: p2.x + len2 * 0.7, y: p2.y + len2 * 0.7 };
          tracks.push({
            p1, p2, p3,
            pulseProgress: Math.random(),
            pulseSpeed: Math.random() * 0.009 + 0.005,
            color: Math.random() > 0.4 ? '#00f5ff' : '#ff007f'
          });
        }
        state = { tracks };
      } else if (theme === 'monolith') {
        // 3. 📈 Stock Market Lines Up Down (Fluctuating price curves, grid & beacons)
        const pointsCount = isMobile ? 35 : 65;
        const line1 = [];
        const line2 = [];
        let p1 = height * 0.5;
        let p2 = height * 0.58;
        for (let i = 0; i < pointsCount; i++) {
          p1 = Math.max(height * 0.22, Math.min(height * 0.78, p1 + (Math.random() - 0.49) * 28));
          p2 = Math.max(height * 0.25, Math.min(height * 0.82, p2 + (Math.random() - 0.50) * 22));
          line1.push(p1);
          line2.push(p2);
        }
        state = { pointsCount, line1, line2, lastShift: 0 };
      } else if (theme === 'solar') {
        // 4. 🔥 Fire Blaze Falling (Cascading burning embers & flame sparks)
        const emberCount = isMobile ? 65 : 120;
        const embers = [];
        for (let i = 0; i < emberCount; i++) {
          embers.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 3.5 + 1.2,
            vy: Math.random() * 1.8 + 0.8,
            vx: (Math.random() - 0.5) * 0.8,
            flickerPhase: Math.random() * Math.PI * 2,
            heatColor: Math.random() > 0.5 ? '#ff5500' : (Math.random() > 0.5 ? '#ffbb00' : '#ff0044'),
            alpha: Math.random() * 0.35 + 0.25
          });
        }
        // Micro-sparks rising from heat
        const sparks = [];
        for (let i = 0; i < 25; i++) {
          sparks.push({
            x: Math.random() * width,
            y: height * 0.85 + Math.random() * (height * 0.15),
            vy: -(Math.random() * 2.2 + 1.2),
            vx: (Math.random() - 0.5) * 1.5,
            size: Math.random() * 1.5 + 0.8
          });
        }
        state = { embers, sparks };
      } else if (theme === 'emerald') {
        // 5. 🗺️ GPS Map Type Routing Effect (Road network, waypoints & route tracking)
        const waypoints = [
          { x: width * 0.12, y: height * 0.30, label: 'NODE 01' },
          { x: width * 0.35, y: height * 0.22, label: 'SECTOR A' },
          { x: width * 0.62, y: height * 0.45, label: 'STATION 3' },
          { x: width * 0.84, y: height * 0.28, label: 'HUB EAST' },
          { x: width * 0.78, y: height * 0.75, label: 'TARGET B' },
          { x: width * 0.42, y: height * 0.78, label: 'WAYPOINT X' },
          { x: width * 0.18, y: height * 0.68, label: 'ORIGIN 0' }
        ];
        state = { waypoints, routeProgress: 0, activeSegment: 0 };
      } else if (theme === 'neon-horizon') {
        // 6. ☄️ Meteor Beam Star Falling (High-speed shooting star shower)
        const meteorCount = isMobile ? 8 : 16;
        const meteors = [];
        for (let i = 0; i < meteorCount; i++) {
          meteors.push({
            x: Math.random() * width * 1.3,
            y: -Math.random() * height * 0.5,
            length: Math.random() * 140 + 70,
            speed: Math.random() * 9 + 7,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.15, // ~45 degrees diagonal
            color: Math.random() > 0.4 ? '#ff007f' : '#00f5ff',
            width: Math.random() * 1.6 + 1.0
          });
        }
        // Ambient background stars
        const stars = [];
        for (let i = 0; i < 50; i++) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.3 + 0.1
          });
        }
        state = { meteors, stars };
      } else if (theme === 'stargate') {
        // 7. 🌌 Space Milky Way Galaxy (Diagonal cosmic dust stream & star clusters)
        const starCount = isMobile ? 120 : 240;
        const stars = [];
        for (let i = 0; i < starCount; i++) {
          // Clustered along a diagonal galactic river (y = x * 0.7 + offset)
          const t = Math.random() * (width + height);
          const spread = (Math.random() - 0.5) * (isMobile ? 180 : 320);
          stars.push({
            t,
            spread,
            size: Math.random() * 1.8 + 0.6,
            twinkleSpeed: Math.random() * 0.03 + 0.01,
            phase: Math.random() * Math.PI * 2,
            color: ['#ffffff', '#a855f7', '#06b6d4', '#f43f5e'][Math.floor(Math.random() * 4)]
          });
        }
        state = { stars };
      } else if (theme === 'imperial') {
        // 8. 💎 Static 3D Geometric Shapes Rotating (Wireframe polyhedra anchored in space)
        const shapes = [
          { type: 'cube', x: width * 0.18, y: height * 0.28, size: isMobile ? 28 : 42, rx: 0, ry: 0, rz: 0, sx: 0.008, sy: 0.012 },
          { type: 'octa', x: width * 0.82, y: height * 0.25, size: isMobile ? 32 : 46, rx: 0.5, ry: 0, rz: 0.2, sx: -0.010, sy: 0.008 },
          { type: 'tetra', x: width * 0.15, y: height * 0.72, size: isMobile ? 30 : 44, rx: 0.2, ry: 0.4, rz: 0, sx: 0.009, sy: -0.011 },
          { type: 'cube', x: width * 0.85, y: height * 0.70, size: isMobile ? 26 : 38, rx: 0.4, ry: 0.2, rz: 0.5, sx: -0.007, sy: 0.013 },
          { type: 'octa', x: width * 0.50, y: height * 0.48, size: isMobile ? 36 : 52, rx: 0.1, ry: 0.3, rz: 0, sx: 0.006, sy: 0.007 }
        ];
        state = { shapes };
      }
    }

    initScene(activeTheme);

    const render = () => {
      frame++;

      if (activeTheme === 'quantum') {
        // 1. ❄️ Falling Snowflakes Animation
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
              // Mini side barbs
              ctx.moveTo(0, f.size * 0.5);
              ctx.lineTo(f.size * 0.3, f.size * 0.7);
              ctx.moveTo(0, f.size * 0.5);
              ctx.lineTo(-f.size * 0.3, f.size * 0.7);
              ctx.stroke();
            }
            ctx.restore();
          } else {
            // Simple soft snowflake pellet
            ctx.fillStyle = `rgba(240, 249, 255, ${f.opacity})`;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (activeTheme === 'cyberpunk') {
        // 2. ⚡ Cyberpunk AI Circuit Electric Flows
        ctx.fillStyle = 'rgba(9, 19, 38, 0.30)';
        ctx.fillRect(0, 0, width, height);

        const { tracks } = state;
        if (!tracks) return;

        for (const t of tracks) {
          // Draw faint background circuit traces
          ctx.beginPath();
          ctx.moveTo(t.p1.x, t.p1.y);
          ctx.lineTo(t.p2.x, t.p2.y);
          ctx.lineTo(t.p3.x, t.p3.y);
          ctx.strokeStyle = 'rgba(0, 245, 255, 0.08)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Square IC pads at joints
          ctx.fillStyle = 'rgba(0, 245, 255, 0.18)';
          ctx.fillRect(t.p1.x - 2, t.p1.y - 2, 4, 4);
          ctx.fillRect(t.p2.x - 2, t.p2.y - 2, 4, 4);
          ctx.fillRect(t.p3.x - 2, t.p3.y - 2, 4, 4);

          // Electric flow pulse moving through tracks
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

          // Electric glow trail
          ctx.strokeStyle = t.color;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - (t.p2.x - t.p1.x) * 0.05, ey - (t.p2.y - t.p1.y) * 0.05);
          ctx.stroke();
        }
      } else if (activeTheme === 'monolith') {
        // 3. 📈 Real-Time Stock Market Lines Up Down
        ctx.fillStyle = 'rgba(5, 5, 5, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { pointsCount, line1, line2 } = state;
        if (!line1) return;

        // Shift and fluctuate stock lines periodically
        if (frame % 4 === 0) {
          line1.shift();
          const last1 = line1[line1.length - 1];
          line1.push(Math.max(height * 0.22, Math.min(height * 0.78, last1 + (Math.random() - 0.49) * 18)));

          line2.shift();
          const last2 = line2[line2.length - 1];
          line2.push(Math.max(height * 0.25, Math.min(height * 0.82, last2 + (Math.random() - 0.50) * 14)));
        }

        const stepX = width / (pointsCount - 1);

        // Support & Resistance horizontal dashed lines
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.12)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(0, height * 0.32);
        ctx.lineTo(width, height * 0.32);
        ctx.moveTo(0, height * 0.70);
        ctx.lineTo(width, height * 0.70);
        ctx.stroke();
        ctx.setLineDash([]);

        // Price markers
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(226, 232, 240, 0.30)';
        ctx.fillText('RES $94,820.00', 16, height * 0.31);
        ctx.fillText('SUP $88,400.00', 16, height * 0.69);

        // Primary Stock Line (Bullish Cobalt/Cyan)
        ctx.beginPath();
        for (let i = 0; i < pointsCount; i++) {
          const x = i * stepX;
          const y = line1[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.50)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Secondary Stock Line (High-Volatility Crimson)
        ctx.beginPath();
        for (let i = 0; i < pointsCount; i++) {
          const x = i * stepX;
          const y = line2[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.38)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Pulsing price beacon at the leading right edge
        const curX = width - 10;
        const curY = line1[line1.length - 1];
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(curX - 3, curY - 3, 6, 6);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.beginPath();
        ctx.arc(curX, curY, Math.abs(Math.sin(frame * 0.08)) * 14 + 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeTheme === 'solar') {
        // 4. 🔥 Fire Blaze Falling (Cascading burning embers & flame sparks)
        ctx.fillStyle = 'rgba(36, 13, 7, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { embers, sparks } = state;
        if (!embers) return;

        // Falling fiery embers
        for (const e of embers) {
          e.y += e.vy;
          e.x += e.vx + Math.sin(frame * 0.03 + e.flickerPhase) * 0.6;

          if (e.y > height + 10) {
            e.y = -10;
            e.x = Math.random() * width;
          }

          // Blazing flame particle with flicker
          const flicker = 0.8 + 0.3 * Math.sin(frame * 0.1 + e.flickerPhase);
          ctx.fillStyle = e.heatColor;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size * flicker, 0, Math.PI * 2);
          ctx.fill();
        }

        // Rising convection sparks
        if (sparks) {
          for (const s of sparks) {
            s.y += s.vy;
            s.x += s.vx;
            if (s.y < height * 0.4) {
              s.y = height + 10;
              s.x = Math.random() * width;
            }
            ctx.fillStyle = 'rgba(255, 200, 50, 0.45)';
            ctx.fillRect(s.x, s.y, s.size, s.size * 2);
          }
        }
      } else if (activeTheme === 'emerald') {
        // 5. 🗺️ GPS Map Type Routing Effect (Road network & active path tracing)
        ctx.fillStyle = 'rgba(4, 32, 24, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { waypoints } = state;
        if (!waypoints) return;

        // Draw street network grid lines
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.09)';
        ctx.lineWidth = 0.8;
        const gridSpacing = 60;
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

        // Draw GPS Route connecting waypoints
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i < waypoints.length; i++) {
          if (i === 0) ctx.moveTo(waypoints[i].x, waypoints[i].y);
          else ctx.lineTo(waypoints[i].x, waypoints[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        // Route progress runner (vehicle / GPS packet)
        state.routeProgress += 0.005;
        if (state.routeProgress >= 1) {
          state.routeProgress = 0;
          state.activeSegment = (state.activeSegment + 1) % waypoints.length;
        }

        const nextSeg = (state.activeSegment + 1) % waypoints.length;
        const pA = waypoints[state.activeSegment];
        const pB = waypoints[nextSeg];
        const carX = pA.x + (pB.x - pA.x) * state.routeProgress;
        const carY = pA.y + (pB.y - pA.y) * state.routeProgress;

        // Draw animated GPS vehicle beacon
        ctx.fillStyle = '#10b981';
        ctx.fillRect(carX - 3, carY - 3, 6, 6);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.beginPath();
        ctx.arc(carX, carY, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Waypoint pins with radar pulses
        for (let i = 0; i < waypoints.length; i++) {
          const wp = waypoints[i];
          ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
          ctx.fillRect(wp.x - 2.5, wp.y - 2.5, 5, 5);

          // Radar concentric ring
          const ringR = ((frame * 0.4 + i * 15) % 25) + 3;
          ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, 0.3 - ringR * 0.01)})`;
          ctx.beginPath();
          ctx.arc(wp.x, wp.y, ringR, 0, Math.PI * 2);
          ctx.stroke();

          // Waypoint labels
          ctx.font = '8px monospace';
          ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
          ctx.fillText(wp.label, wp.x + 8, wp.y + 3);
        }
      } else if (activeTheme === 'neon-horizon') {
        // 6. ☄️ Meteor Beam Star Falling (High-speed diagonal shooting stars)
        ctx.fillStyle = 'rgba(23, 12, 41, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { meteors, stars } = state;
        if (!meteors) return;

        // Background twinkling stars
        if (stars) {
          for (const s of stars) {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * (0.7 + 0.3 * Math.sin(frame * 0.05 + s.x))})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
          }
        }

        // Falling diagonal meteor beams
        for (const m of meteors) {
          const vx = Math.cos(m.angle) * m.speed;
          const vy = Math.sin(m.angle) * m.speed;
          m.x += vx;
          m.y += vy;

          // Respawn at top
          if (m.y > height + m.length || m.x > width + m.length) {
            m.y = -Math.random() * 200 - 50;
            m.x = Math.random() * width * 1.2 - 200;
          }

          // Draw tapered luminous meteor streak
          const tailX = m.x - Math.cos(m.angle) * m.length;
          const tailY = m.y - Math.sin(m.angle) * m.length;

          const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          grad.addColorStop(0.7, m.color === '#ff007f' ? 'rgba(255, 0, 127, 0.2)' : 'rgba(0, 245, 255, 0.2)');
          grad.addColorStop(1, '#ffffff');

          ctx.strokeStyle = grad;
          ctx.lineWidth = m.width;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();

          // Luminous meteor core head
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(m.x - 1.5, m.y - 1.5, 3, 3);
        }
      } else if (activeTheme === 'stargate') {
        // 7. 🌌 Space Milky Way Galaxy (Diagonal cosmic dust stream & stars)
        ctx.fillStyle = 'rgba(7, 8, 20, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { stars } = state;
        if (!stars) return;

        // Galactic core angle across canvas
        const slope = height / width;

        for (const s of stars) {
          // Calculate diagonal spine coordinate
          const normT = (s.t + frame * 0.15) % (width + 200) - 100;
          const spineY = normT * slope;

          // Normal offset perpendicular to spine
          const angle = Math.atan2(height, width) + Math.PI / 2;
          const x = normT + Math.cos(angle) * s.spread;
          const y = spineY + Math.sin(angle) * s.spread;

          // Twinkling starlight
          const twinkle = 0.5 + 0.5 * Math.sin(frame * s.twinkleSpeed + s.phase);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = twinkle * 0.45;
          ctx.fillRect(x - s.size / 2, y - s.size / 2, s.size, s.size);
          ctx.globalAlpha = 1.0;
        }
      } else if (activeTheme === 'imperial') {
        // 8. 💎 Static 3D Geometric Shapes Rotating (Wireframe polyhedra)
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
            // 8 vertices of a 3D Cube
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

            // 3D rotation
            const proj = vertices.map(([vx, vy, vz]) => {
              // Rotate Y
              let x1 = vx * Math.cos(s.ry) + vz * Math.sin(s.ry);
              let z1 = -vx * Math.sin(s.ry) + vz * Math.cos(s.ry);
              // Rotate X
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

            // Vertex dots
            ctx.fillStyle = 'rgba(254, 243, 199, 0.45)';
            for (const p of proj) {
              ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
            }
          } else if (s.type === 'octa') {
            // 6 vertices of an Octahedron
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
            // 4 vertices of a Tetrahedron
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

            ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
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
        className="absolute inset-0 z-10 block animate-fade-in opacity-50 transition-opacity duration-700"
        key={activeTheme}
      />
      <div className="absolute inset-0 z-20 pointer-events-none hero-gradient opacity-75 transition-all duration-700" />
    </div>
  );
}
