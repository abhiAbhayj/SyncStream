import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Exclusive, Fully Unique Mathematical Simulation Engines (Dull & Ambient for 100% UI Clarity):
 * 1. quantum      — 🌌 Quantum Harmonic Wave Lattice: 3D standing wave interference grid & probability nodes
 * 2. cyberpunk    — ⚡ Holographic Polyhedral Radar: Rotating 3D cyber-core with radar sweep & data conduits
 * 3. monolith     — 🌑 Space Geometry & Stock Market Matrix: 3D space polyhedra, live candlesticks, trend tickers & reticles
 * 4. solar        — 🔥 Heliocentric Eclipse Rings: Concentric eccentric solar rings & coronal plasma prominence arches
 * 5. emerald      — 🌿 Sacred Geometry Circuit Lattice: Rotating Metatron mandala & bioluminescent phosphor traces
 * 6. neon-horizon — 🏎️ Infinite Outrun 3D Wireframe Highway: Rolling 3D vector terrain road leading to a retro horizon sun
 * 7. stargate     — 🌀 3D Wormhole Stargate: Relativistic warp vortex with accretion disc stardust filaments
 * 8. imperial     — 👑 3D Golden Armillary Astrolabe: Concentric tilted orbital rings with planetary beads & gold leaf dust
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

    // Simulation state containers
    let state = {};
    let frame = 0;

    function initScene(theme) {
      state = {};
      frame = 0;
      const isMobile = width < 768;

      if (theme === 'quantum') {
        // 1. 3D Quantum Harmonic Wave Lattice
        const cols = isMobile ? 12 : 22;
        const rows = isMobile ? 8 : 14;
        state = { cols, rows };
      } else if (theme === 'cyberpunk') {
        // 2. Holographic Polyhedral Radar & Rising Hex Conduits
        const beams = [];
        const beamCount = isMobile ? 8 : 16;
        for (let i = 0; i < beamCount; i++) {
          beams.push({
            x: Math.random() * width,
            y: height + Math.random() * 200,
            speed: Math.random() * 1.5 + 0.8,
            length: Math.random() * 60 + 30,
            color: Math.random() > 0.4 ? 'rgba(0, 245, 255, 0.45)' : 'rgba(247, 37, 133, 0.4)'
          });
        }
        state = { rot: 0, beams };
      } else if (theme === 'monolith') {
        // 3. Space Geometric Shapes & Stock Market Chrono Matrix
        // Live Financial Candlesticks
        const candleCount = isMobile ? 16 : 32;
        const candles = [];
        let price = height * 0.55;
        for (let i = 0; i < candleCount; i++) {
          const change = (Math.random() - 0.48) * 35;
          const open = price;
          const close = Math.max(height * 0.25, Math.min(height * 0.75, open + change));
          const high = Math.min(open, close) - Math.random() * 18;
          const low = Math.max(open, close) + Math.random() * 18;
          candles.push({ open, close, high, low });
          price = close;
        }

        // Space Wireframe Geometric Polyhedra
        const polyhedra = [
          { x: width * 0.22, y: height * 0.32, size: isMobile ? 28 : 42, rotX: 0, rotY: 0, speedX: 0.008, speedY: 0.006, type: 'octa' },
          { x: width * 0.80, y: height * 0.40, size: isMobile ? 32 : 50, rotX: 0.5, rotY: 0.3, speedX: -0.006, speedY: 0.009, type: 'cube' }
        ];

        // Architectural Crosshair Grid Reticles
        const reticles = [
          { x: width * 0.5, y: height * 0.25, size: 26 },
          { x: width * 0.15, y: height * 0.80, size: 20 },
          { x: width * 0.88, y: height * 0.82, size: 22 }
        ];

        state = { candles, polyhedra, reticles, tickerShift: 0 };
      } else if (theme === 'solar') {
        // 4. Heliocentric Eclipse Rings & Coronal Prominence Arches
        const rings = [
          { rx: Math.min(width, height) * 0.22, ry: Math.min(width, height) * 0.12, rot: 0.3, speed: 0.004, color: 'rgba(249, 115, 22, 0.3)' },
          { rx: Math.min(width, height) * 0.30, ry: Math.min(width, height) * 0.18, rot: -0.4, speed: -0.003, color: 'rgba(250, 204, 21, 0.25)' },
          { rx: Math.min(width, height) * 0.38, ry: Math.min(width, height) * 0.24, rot: 0.6, speed: 0.002, color: 'rgba(225, 29, 72, 0.2)' }
        ];
        const flares = [];
        for (let i = 0; i < (isMobile ? 18 : 35); i++) {
          flares.push({
            angle: Math.random() * Math.PI * 2,
            dist: Math.random() * Math.min(width, height) * 0.35 + 40,
            speed: (Math.random() * 0.004 + 0.002),
            r: Math.random() * 1.8 + 0.8,
            color: Math.random() > 0.4 ? 'rgba(250, 204, 21, 0.4)' : 'rgba(249, 115, 22, 0.35)'
          });
        }
        state = { rings, flares };
      } else if (theme === 'emerald') {
        // 5. Sacred Geometry & Metatron Circuit Lattice
        const sacredRadius = Math.min(width, height) * (isMobile ? 0.26 : 0.34);
        const spores = [];
        for (let i = 0; i < (isMobile ? 16 : 30); i++) {
          spores.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.5 + 0.8
          });
        }
        state = { sacredRadius, rot: 0, spores };
      } else if (theme === 'neon-horizon') {
        // 6. Infinite Outrun 3D Wireframe Retro Highway
        const roadPoints = isMobile ? 12 : 20;
        state = { roadPoints, time: 0 };
      } else if (theme === 'stargate') {
        // 7. 3D Wormhole Stargate Vortex
        const ringCount = isMobile ? 5 : 8;
        const rings = [];
        for (let i = 0; i < ringCount; i++) {
          rings.push({
            r: (Math.min(width, height) * 0.42 / ringCount) * (i + 1),
            speed: (i % 2 === 0 ? 1 : -1) * (0.004 + (ringCount - i) * 0.0015),
            rot: Math.random() * Math.PI * 2
          });
        }
        const particles = [];
        for (let i = 0; i < (isMobile ? 30 : 60); i++) {
          particles.push({
            angle: Math.random() * Math.PI * 2,
            dist: Math.random() * Math.min(width, height) * 0.45 + 20,
            speed: Math.random() * 0.012 + 0.005,
            inwardSpeed: Math.random() * 0.4 + 0.2,
            size: Math.random() * 1.4 + 0.6
          });
        }
        state = { rings, particles };
      } else if (theme === 'imperial') {
        // 8. 3D Golden Armillary Astrolabe & Planetary Spheres
        const astrolabeRings = [
          { r: Math.min(width, height) * 0.32, tiltX: 0.8, tiltY: 0.2, speed: 0.004, beadAngle: 0 },
          { r: Math.min(width, height) * 0.24, tiltX: -0.6, tiltY: 0.5, speed: -0.006, beadAngle: Math.PI / 3 },
          { r: Math.min(width, height) * 0.16, tiltX: 0.4, tiltY: -0.7, speed: 0.008, beadAngle: Math.PI }
        ];
        const goldLeaf = [];
        for (let i = 0; i < (isMobile ? 15 : 30); i++) {
          goldLeaf.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: Math.random() * 0.4 + 0.2,
            vx: (Math.random() - 0.5) * 0.3,
            rot: Math.random() * Math.PI,
            size: Math.random() * 3 + 2
          });
        }
        state = { astrolabeRings, goldLeaf };
      }
    }

    initScene(activeTheme);

    const render = () => {
      frame++;

      if (activeTheme === 'quantum') {
        // 1. Quantum Harmonic Wave Lattice
        ctx.fillStyle = 'rgba(13, 17, 39, 0.25)';
        ctx.fillRect(0, 0, width, height);

        const { cols, rows } = state;
        if (!cols) return;

        const cellW = width / cols;
        const cellH = height / rows;

        ctx.lineWidth = 0.6;
        for (let r = 0; r <= rows; r++) {
          ctx.beginPath();
          for (let c = 0; c <= cols; c++) {
            const x = c * cellW;
            const baseY = r * cellH;
            const wave = Math.sin(c * 0.4 + frame * 0.02) * Math.cos(r * 0.5 + frame * 0.015) * 16;
            const y = baseY + wave;
            if (c === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            // Small probability amplitude node
            if (c % 2 === 0 && r % 2 === 0) {
              ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
              ctx.fillRect(x - 1, y - 1, 2, 2);
            }
          }
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.08 + Math.sin(r + frame * 0.02) * 0.04})`;
          ctx.stroke();
        }
      } else if (activeTheme === 'cyberpunk') {
        // 2. Holographic Polyhedral Radar
        ctx.fillStyle = 'rgba(9, 19, 38, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { beams } = state;
        state.rot = (state.rot || 0) + 0.008;

        // Rising hex data conduits
        if (beams) {
          for (const b of beams) {
            b.y -= b.speed;
            if (b.y < -50) {
              b.y = height + 50;
              b.x = Math.random() * width;
            }
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(b.x, b.y - b.length);
            ctx.strokeStyle = b.color;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }

        // Rotating 3D wireframe cyber-cube at center
        const cx = width / 2;
        const cy = height * 0.45;
        const s = Math.min(width, height) * 0.14;
        const a = state.rot;

        const vertices = [
          { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 },
          { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
          { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 },
          { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
        ];

        const projected = vertices.map((v) => {
          let x1 = v.x * Math.cos(a) - v.z * Math.sin(a);
          let z1 = v.x * Math.sin(a) + v.z * Math.cos(a);
          let y2 = v.y * Math.cos(a * 0.7) - z1 * Math.sin(a * 0.7);
          return { x: cx + x1 * s, y: cy + y2 * s };
        });

        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        ctx.lineWidth = 0.9;
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.28)';
        for (const [i1, i2] of edges) {
          ctx.beginPath();
          ctx.moveTo(projected[i1].x, projected[i1].y);
          ctx.lineTo(projected[i2].x, projected[i2].y);
          ctx.stroke();
        }

        // Radar sweep circle
        ctx.beginPath();
        ctx.arc(cx, cy, s * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.10)';
        ctx.stroke();
      } else if (activeTheme === 'monolith') {
        // 3. Space Geometric Shapes & Stock Market Chrono Matrix
        ctx.fillStyle = 'rgba(5, 5, 5, 0.26)';
        ctx.fillRect(0, 0, width, height);

        const { candles, polyhedra, reticles } = state;
        if (!candles) return;

        state.tickerShift += 0.35;
        const candleW = width / candles.length;

        // Render Animated Stock Candlestick Chart (Subtle / Low Opacity)
        for (let i = 0; i < candles.length; i++) {
          const c = candles[i];
          const x = i * candleW + candleW * 0.2;
          const isBull = c.close >= c.open;
          const color = isBull ? 'rgba(59, 130, 246, 0.30)' : 'rgba(239, 68, 68, 0.28)';

          // Wick
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(x + candleW * 0.3, c.high);
          ctx.lineTo(x + candleW * 0.3, c.low);
          ctx.stroke();

          // Body
          const top = Math.min(c.open, c.close);
          const h = Math.max(3, Math.abs(c.close - c.open));
          ctx.fillStyle = isBull ? 'rgba(59, 130, 246, 0.22)' : 'rgba(239, 68, 68, 0.20)';
          ctx.fillRect(x, top, candleW * 0.6, h);
        }

        // Trend ticker line overlay
        ctx.beginPath();
        for (let i = 0; i < candles.length; i++) {
          const x = i * candleW + candleW * 0.5;
          const y = (candles[i].open + candles[i].close) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.25)';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // 3D Space Geometric Polyhedra
        if (polyhedra) {
          for (const poly of polyhedra) {
            poly.rotX += poly.speedX;
            poly.rotY += poly.speedY;

            ctx.save();
            ctx.translate(poly.x, poly.y);

            // Simple 3D Octahedron projection
            const verts = [
              { x: 0, y: -poly.size, z: 0 },
              { x: poly.size, y: 0, z: 0 },
              { x: 0, y: 0, z: poly.size },
              { x: -poly.size, y: 0, z: 0 },
              { x: 0, y: 0, z: -poly.size },
              { x: 0, y: poly.size, z: 0 }
            ];

            const pVerts = verts.map((v) => {
              const x1 = v.x * Math.cos(poly.rotY) - v.z * Math.sin(poly.rotY);
              const z1 = v.x * Math.sin(poly.rotY) + v.z * Math.cos(poly.rotY);
              const y2 = v.y * Math.cos(poly.rotX) - z1 * Math.sin(poly.rotX);
              return { x: x1, y: y2 };
            });

            const pEdges = [
              [0, 1], [0, 2], [0, 3], [0, 4],
              [5, 1], [5, 2], [5, 3], [5, 4],
              [1, 2], [2, 3], [3, 4], [4, 1]
            ];

            ctx.strokeStyle = 'rgba(226, 232, 240, 0.22)';
            ctx.lineWidth = 0.8;
            for (const [v1, v2] of pEdges) {
              ctx.beginPath();
              ctx.moveTo(pVerts[v1].x, pVerts[v1].y);
              ctx.lineTo(pVerts[v2].x, pVerts[v2].y);
              ctx.stroke();
            }
            ctx.restore();
          }
        }

        // Crosshairs & financial coordinate telemetry
        if (reticles) {
          for (const r of reticles) {
            ctx.strokeStyle = 'rgba(226, 232, 240, 0.15)';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(r.x - r.size, r.y);
            ctx.lineTo(r.x + r.size, r.y);
            ctx.moveTo(r.x, r.y - r.size);
            ctx.lineTo(r.x, r.y + r.size);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.size * 0.4, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      } else if (activeTheme === 'solar') {
        // 4. Heliocentric Eclipse Rings & Coronal Prominence Arches
        ctx.fillStyle = 'rgba(36, 13, 7, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { rings, flares } = state;
        const cx = width / 2;
        const cy = height * 0.45;

        // Eccentric coronal rings
        if (rings) {
          for (const r of rings) {
            r.rot += r.speed;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(r.rot);
            ctx.beginPath();
            ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2);
            ctx.strokeStyle = r.color;
            ctx.lineWidth = 1.0;
            ctx.stroke();
            ctx.restore();
          }
        }

        // Floating coronal mass flares
        if (flares) {
          for (const f of flares) {
            f.angle += f.speed;
            const fx = cx + Math.cos(f.angle) * f.dist;
            const fy = cy + Math.sin(f.angle) * (f.dist * 0.6);
            ctx.beginPath();
            ctx.arc(fx, fy, f.r, 0, Math.PI * 2);
            ctx.fillStyle = f.color;
            ctx.fill();
          }
        }
      } else if (activeTheme === 'emerald') {
        // 5. Sacred Geometry & Metatron Circuit Lattice
        ctx.fillStyle = 'rgba(4, 32, 24, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { sacredRadius, spores } = state;
        state.rot += 0.003;
        const cx = width / 2;
        const cy = height * 0.45;
        const R = sacredRadius || 120;

        // Nested Metatron Sacred Hexagon / Star
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(state.rot);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.16)';
        ctx.lineWidth = 0.8;

        const hexPts = [];
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          hexPts.push({ x: Math.cos(a) * R, y: Math.sin(a) * R });
        }

        // Outer hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          if (i === 0) ctx.moveTo(hexPts[i].x, hexPts[i].y);
          else ctx.lineTo(hexPts[i].x, hexPts[i].y);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner interconnecting chords (Metatron's cube)
        for (let i = 0; i < 6; i++) {
          for (let j = i + 1; j < 6; j++) {
            ctx.beginPath();
            ctx.moveTo(hexPts[i].x, hexPts[i].y);
            ctx.lineTo(hexPts[j].x, hexPts[j].y);
            ctx.stroke();
          }
        }

        ctx.restore();

        // Bioluminescent spores
        if (spores) {
          for (const s of spores) {
            s.x += s.vx;
            s.y += s.vy;
            if (s.x < 0 || s.x > width) s.vx *= -1;
            if (s.y < 0 || s.y > height) s.vy *= -1;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(52, 211, 153, 0.35)';
            ctx.fill();
          }
        }
      } else if (activeTheme === 'neon-horizon') {
        // 6. Infinite Outrun 3D Wireframe Retro Highway
        ctx.fillStyle = 'rgba(23, 12, 41, 0.28)';
        ctx.fillRect(0, 0, width, height);

        state.time += 0.02;
        const horizon = height * 0.42;
        const cx = width / 2;

        // Retro striped horizon sun
        const sunRadius = Math.min(width, height) * 0.12;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, horizon, sunRadius, Math.PI, 0);
        ctx.fillStyle = 'rgba(255, 0, 127, 0.22)';
        ctx.fill();

        // Striped sun horizontal bars
        for (let y = horizon - sunRadius; y < horizon; y += 8) {
          ctx.fillStyle = 'rgba(23, 12, 41, 0.85)';
          ctx.fillRect(cx - sunRadius, y, sunRadius * 2, 2);
        }
        ctx.restore();

        // 3D Perspective Road Grid
        ctx.strokeStyle = 'rgba(255, 0, 127, 0.18)';
        ctx.lineWidth = 0.7;

        // Perspective longitudinal lines
        const roadW = width * 0.75;
        const lines = 10;
        for (let i = 0; i <= lines; i++) {
          const bx = cx - roadW / 2 + (roadW / lines) * i;
          ctx.beginPath();
          ctx.moveTo(cx, horizon);
          ctx.lineTo(bx, height);
          ctx.stroke();
        }

        // Horizontal undulating scan lines
        for (let i = 1; i <= 8; i++) {
          const t = Math.pow((i / 8 + (state.time % 0.125)) % 1, 2.2);
          const y = horizon + t * (height - horizon);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.strokeStyle = `rgba(0, 223, 216, ${t * 0.25})`;
          ctx.stroke();
        }
      } else if (activeTheme === 'stargate') {
        // 7. 3D Wormhole Stargate Vortex
        ctx.fillStyle = 'rgba(7, 8, 20, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { rings, particles } = state;
        const cx = width / 2;
        const cy = height * 0.45;

        // Concentric Stargate rings
        if (rings) {
          ctx.lineWidth = 0.9;
          for (const r of rings) {
            r.rot += r.speed;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(r.rot);
            ctx.beginPath();
            ctx.ellipse(0, 0, r.r, r.r * 0.55, 0, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(147, 51, 234, 0.24)';
            ctx.stroke();
            ctx.restore();
          }
        }

        // Inward spiraling accretion disc stardust
        if (particles) {
          for (const p of particles) {
            p.angle += p.speed;
            p.dist -= p.inwardSpeed;
            if (p.dist < 15) {
              p.dist = Math.min(width, height) * 0.42;
            }
            const px = cx + Math.cos(p.angle) * p.dist;
            const py = cy + Math.sin(p.angle) * (p.dist * 0.55);
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
            ctx.fill();
          }
        }
      } else if (activeTheme === 'imperial') {
        // 8. 3D Golden Armillary Astrolabe
        ctx.fillStyle = 'rgba(18, 14, 6, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { astrolabeRings, goldLeaf } = state;
        const cx = width / 2;
        const cy = height * 0.45;

        // Tilted concentric astrolabe rings
        if (astrolabeRings) {
          for (const a of astrolabeRings) {
            a.beadAngle += a.speed;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.beginPath();
            ctx.ellipse(0, 0, a.r, a.r * Math.abs(a.tiltX), a.tiltY, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.24)';
            ctx.lineWidth = 1.0;
            ctx.stroke();

            // Orbiting golden bead
            const bx = Math.cos(a.beadAngle) * a.r;
            const by = Math.sin(a.beadAngle) * (a.r * Math.abs(a.tiltX));
            ctx.beginPath();
            ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#fbbf24';
            ctx.fill();

            ctx.restore();
          }
        }

        // Drifting gold leaf particles
        if (goldLeaf) {
          for (const g of goldLeaf) {
            g.y += g.vy;
            g.x += g.vx;
            if (g.y > height) {
              g.y = -10;
              g.x = Math.random() * width;
            }
            ctx.save();
            ctx.translate(g.x, g.y);
            ctx.rotate(g.rot);
            ctx.fillStyle = 'rgba(251, 191, 36, 0.22)';
            ctx.fillRect(-g.size / 2, -g.size / 2, g.size, g.size * 0.6);
            ctx.restore();
          }
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
