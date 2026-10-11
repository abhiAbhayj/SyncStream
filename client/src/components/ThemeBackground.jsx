import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Completely Distinct Geometric Visualizers:
 * 1. synthwave      — ⚡ Vibrant Synthwave Horizon: 3D perspective floor grid, distant horizon fog & glowing nodes
 * 2. aurora         — 🌌 Electric Twilight Aurora: Sweeping vertical curtain gradient ribbons morphing in deep space
 * 3. solar-flare    — 🔥 Crimson Solar Flare: Molten coronal base, magnetic prominence flare loops & lazy warm embers
 * 4. neon-frost     — 💎 Neon Frost Glassmorphism: Beveled prismatic glass facets, angular refraction planes & corner caustics
 * 5. plasma-web     — 🪐 Cyberpunk Plasma Web: Circuit vector mesh, triangular polygon fills & traveling electric data sparks
 * 6. abyssal-trench — 🌊 Neon Abyssal Trench: Volumetric oceanic caustic ribbons, underwater light shafts & deep sonar sweep
 * 7. nebula-drift   — 🚀 Quantum Nebula Drift: Volumetric gas dust clouds & exactly 10-12 brilliant diamond-cross diffraction stars
 * 8. citrus-arcade  — 🍊 Neon Citrus Arcade: 8-bit tetromino pixel art sprites, CRT scanline raster & digital static
 */

const VALID_THEMES = [
  'synthwave',
  'aurora',
  'solar-flare',
  'neon-frost',
  'plasma-web',
  'abyssal-trench',
  'nebula-drift',
  'citrus-arcade'
];

// Tetromino 8-bit shapes for Citrus Arcade
const ARCADE_SHAPES = [
  [[1, 1, 1, 1]], // I-bar
  [[1, 1], [1, 1]], // O-square
  [[0, 1, 0], [1, 1, 1]], // T-block
  [[1, 0, 0], [1, 1, 1]], // L-block
  [[0, 0, 1], [1, 1, 1]], // J-block
  [[0, 1, 1], [1, 1, 0]], // S-block
  [[1, 1, 0], [0, 1, 1]], // Z-block
  [[1]] // micro pixel
];

export default function ThemeBackground() {
  const canvasRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem('syncstream_theme');
    if (saved && VALID_THEMES.includes(saved)) return saved;
    return 'synthwave';
  });

  // Track body class changes to switch simulation mode instantly
  useEffect(() => {
    const detectTheme = () => {
      const classList = document.body.classList;
      for (const t of VALID_THEMES) {
        if (classList.contains(`theme-${t}`)) return t;
      }
      const saved = localStorage.getItem('syncstream_theme');
      if (saved && VALID_THEMES.includes(saved)) return saved;
      return 'synthwave';
    };

    setActiveTheme(detectTheme());

    const observer = new MutationObserver(() => {
      setActiveTheme(detectTheme());
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const handleStorage = (e) => {
      if (e.key === 'syncstream_theme') {
        const val = e.newValue;
        if (val && VALID_THEMES.includes(val)) {
          setActiveTheme(val);
        } else {
          setActiveTheme('synthwave');
        }
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

      if (theme === 'synthwave') {
        // 1. ⚡ Vibrant Synthwave Horizon
        // Slow-gliding perspective grid floor + distant foggy horizon + pulsing ambient nodes
        const horizonY = height * 0.58;
        const nodesCount = isMobile ? 3 : 5;
        const glowNodes = [];
        for (let i = 0; i < nodesCount; i++) {
          glowNodes.push({
            x: width * (0.15 + (0.7 / Math.max(nodesCount - 1, 1)) * i),
            y: horizonY + (Math.random() - 0.5) * 8,
            baseRadius: isMobile ? 18 : 28,
            color: i % 2 === 0 ? '#ff007f' : '#00f0ff',
            pulsePhase: (i * Math.PI) / 2
          });
        }
        state = { horizonY, glowNodes, gridSpeed: 0.003 };
      } else if (theme === 'aurora') {
        // 2. 🌌 Electric Twilight Aurora
        // Soft, ultra-slow morphing gradient wash / northern lights ribbons
        const ribbonCount = isMobile ? 3 : 4;
        const ribbons = [];
        for (let i = 0; i < ribbonCount; i++) {
          ribbons.push({
            baseY: height * (0.18 + i * 0.16),
            amplitude: isMobile ? 35 : 55,
            wavelength: isMobile ? 350 : 550,
            phase: i * 1.5,
            speed: 0.0025 + i * 0.0008,
            color: i % 2 === 0 ? 'rgba(139, 92, 246, ' : 'rgba(16, 185, 129, ',
            baseAlpha: 0.14 - i * 0.02
          });
        }
        state = { ribbons };
      } else if (theme === 'solar-flare') {
        // 3. 🔥 Crimson Solar Flare (Completely Unique: Coronal Prominence Arches & Molten Base)
        // Dynamic magnetic loops rising from the bottom edge + warm ember motes
        const loopCount = isMobile ? 4 : 6;
        const loops = [];
        for (let i = 0; i < loopCount; i++) {
          const x1 = width * (0.05 + (i / loopCount) * 0.85 + (Math.random() - 0.5) * 0.08);
          const span = (isMobile ? 120 : 220) + Math.random() * (isMobile ? 60 : 120);
          loops.push({
            x1,
            x2: Math.min(width, x1 + span),
            maxHeight: (isMobile ? 90 : 190) + Math.random() * (isMobile ? 50 : 100),
            swaySpeed: 0.006 + Math.random() * 0.004,
            swayPhase: i * 1.3,
            color: i % 2 === 0 ? '#ff5e00' : '#ffb703',
            lineWidth: isMobile ? 1.5 : 2.2
          });
        }

        // Warm lazy embers rising out of the coronal field
        const moteCount = isMobile ? 16 : 28;
        const motes = [];
        for (let i = 0; i < moteCount; i++) {
          motes.push({
            x: Math.random() * width,
            y: height * (0.6 + Math.random() * 0.4),
            radius: Math.random() * 1.6 + 0.9,
            vy: -(Math.random() * 0.45 + 0.25),
            swayAmp: Math.random() * 0.5 + 0.25,
            swaySpeed: Math.random() * 0.015 + 0.007,
            phase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.4 ? '#ff5e00' : (Math.random() > 0.5 ? '#ffb703' : '#e11d48'),
            alphaBase: Math.random() * 0.28 + 0.22
          });
        }
        state = { loops, motes };
      } else if (theme === 'neon-frost') {
        // 4. 💎 Neon Frost Glassmorphism (Completely Unique: Prismatic Beveled Glass Facets & Caustic Shears)
        // Angular geometric frosted facet polygons in corner + sweeping chromatic dispersion light beams
        const facetCount = isMobile ? 5 : 8;
        const facets = [];
        const cornerOriginX = width * 0.15;
        const cornerOriginY = height * 0.18;

        for (let i = 0; i < facetCount; i++) {
          const angle = (i / facetCount) * Math.PI * 0.75 + 0.1;
          const dist = (isMobile ? 80 : 140) + i * (isMobile ? 40 : 65);
          const size = (isMobile ? 45 : 75) + Math.random() * 25;
          const cx = cornerOriginX + Math.cos(angle) * dist;
          const cy = cornerOriginY + Math.sin(angle) * dist;

          facets.push({
            cx,
            cy,
            size,
            rot: angle + Math.PI / 4,
            phase: i * 0.9,
            speed: 0.006 + i * 0.002,
            colorType: i % 2 === 0 ? 'cyan' : 'lavender'
          });
        }

        state = {
          facets,
          cornerOriginX,
          cornerOriginY,
          cycleDurationMs: 22000
        };
      } else if (theme === 'plasma-web') {
        // 5. 🪐 Cyberpunk Plasma Web (Completely Unique: Circuit Vector Mesh with Traveling Electric Data Sparks)
        // Vector nodes + semi-transparent triangle mesh polygons + active electric data packets firing along lines
        const nodeCount = isMobile ? 18 : 34;
        const nodes = [];
        for (let i = 0; i < nodeCount; i++) {
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.32,
            vy: (Math.random() - 0.5) * 0.32,
            radius: Math.random() * 1.3 + 0.9,
            color: Math.random() > 0.45 ? '#00ff66' : '#2563eb',
            pulsePhase: Math.random() * Math.PI * 2
          });
        }

        const maxDistance = isMobile ? 100 : 145;

        // Traveling electric data packets
        const packetCount = isMobile ? 8 : 14;
        const packets = [];
        for (let i = 0; i < packetCount; i++) {
          packets.push({
            from: Math.floor(Math.random() * nodeCount),
            to: (Math.floor(Math.random() * nodeCount) + 1) % nodeCount,
            progress: Math.random(),
            speed: 0.012 + Math.random() * 0.016,
            color: Math.random() > 0.5 ? '#00ff66' : '#2563eb'
          });
        }

        state = { nodes, packets, maxDistance };
      } else if (theme === 'abyssal-trench') {
        // 6. 🌊 Neon Abyssal Trench (Completely Unique: Volumetric Oceanic Caustic Ribbons & Sonar Sweep)
        // Translucent flowing water wave ribbons with depth gradient fills + sweeping horizontal sonar beam
        const ribbonCount = isMobile ? 4 : 5;
        const ribbons = [];
        for (let i = 0; i < ribbonCount; i++) {
          ribbons.push({
            baseY: height * (0.2 + (i * 0.6) / ribbonCount),
            thickness: (isMobile ? 35 : 55) + i * 12,
            amplitude: (isMobile ? 18 : 32) + i * 4,
            wavelength: (isMobile ? 380 : 580) + i * 40,
            speed: 0.005 + i * 0.0015,
            phase: i * 1.6,
            color: i % 2 === 0 ? 'rgba(6, 182, 212, ' : 'rgba(99, 102, 241, ',
            alpha: 0.08 - i * 0.01
          });
        }
        state = { ribbons, sonarY: 0, sonarSpeed: isMobile ? 0.4 : 0.6 };
      } else if (theme === 'nebula-drift') {
        // 7. 🚀 Quantum Nebula Drift (Completely Unique: Deep Space Gas Clouds & 10-12 Diamond Cross Stars)
        // Volumetric astronomical dust clouds + STRICTLY 10-12 major stars with 4-point & 8-point diffraction spikes
        const cloudCount = isMobile ? 3 : 5;
        const clouds = [];
        for (let i = 0; i < cloudCount; i++) {
          clouds.push({
            x: width * (0.15 + (i / cloudCount) * 0.7),
            y: height * (0.2 + ((i * 1.7) % 1) * 0.6),
            rx: (isMobile ? 160 : 320) + Math.random() * 80,
            ry: (isMobile ? 120 : 220) + Math.random() * 60,
            color: i % 2 === 0 ? 'rgba(236, 72, 153, ' : 'rgba(168, 85, 247, ',
            alpha: 0.055,
            phase: i * 1.4,
            speed: 0.003
          });
        }

        // STRICTLY 10-12 distinct diamond-cross diffraction stars on screen
        const starCount = isMobile ? 10 : 12;
        const stars = [];
        for (let i = 0; i < starCount; i++) {
          stars.push({
            x: width * (0.06 + ((i * 0.082) % 0.88)),
            y: height * (0.08 + (((i * 7) % starCount) / starCount) * 0.84),
            coreRadius: Math.random() * 1.2 + 1.2,
            twinkleSpeed: 0.006 + Math.random() * 0.006,
            phase: Math.random() * Math.PI * 2,
            color: i % 3 === 0 ? '#ec4899' : (i % 3 === 1 ? '#a855f7' : '#ffffff'),
            isSuperStar: i % 3 === 0, // 8-point diffraction spike
            spikeLen: (isMobile ? 12 : 20) + Math.random() * 10
          });
        }
        state = { clouds, stars };
      } else if (theme === 'citrus-arcade') {
        // 8. 🍊 Neon Citrus Arcade (Completely Unique: 8-Bit Tetromino Sprites & CRT Scanline)
        // Recognizable retro arcade geometric blocks (I, O, T, L, Z) falling in tangerine & yellow
        const spriteCount = isMobile ? 14 : 24;
        const sprites = [];
        for (let i = 0; i < spriteCount; i++) {
          const shape = ARCADE_SHAPES[i % ARCADE_SHAPES.length];
          sprites.push({
            shape,
            x: Math.random() * width,
            y: Math.random() * height,
            blockSize: isMobile ? 5 : 7,
            vy: 0.38 + Math.random() * 0.35,
            color: Math.random() > 0.45 ? '#ff7a00' : '#ffd600',
            alpha: 0.16 + Math.random() * 0.14,
            pulsePhase: Math.random() * Math.PI * 2
          });
        }
        state = { sprites, scanlineY: 0, scanlineSpeed: 0.55 };
      }
    }

    initScene(activeTheme);

    function render(timestamp) {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (activeTheme === 'synthwave') {
        // 1. ⚡ Vibrant Synthwave Horizon
        const horizonY = state.horizonY || height * 0.58;
        const gridFloorHeight = height - horizonY;
        const offset = (frame * (state.gridSpeed || 0.003)) % 1;

        // Distant horizon glow wash
        const horizonGrad = ctx.createLinearGradient(0, horizonY - 90, 0, horizonY + 90);
        horizonGrad.addColorStop(0, 'rgba(10, 10, 12, 0)');
        horizonGrad.addColorStop(0.5, 'rgba(255, 0, 127, 0.14)');
        horizonGrad.addColorStop(0.52, 'rgba(0, 240, 255, 0.10)');
        horizonGrad.addColorStop(1, 'rgba(10, 10, 12, 0)');
        ctx.fillStyle = horizonGrad;
        ctx.fillRect(0, horizonY - 90, width, 180);

        // Faint, slow-pulsing ambient glow nodes along the horizon
        (state.glowNodes || []).forEach((node) => {
          const pulse = Math.sin(frame * 0.02 + node.pulsePhase);
          const r = node.baseRadius * (0.85 + pulse * 0.25);
          const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r);
          grad.addColorStop(0, node.color === '#ff007f' ? 'rgba(255, 0, 127, 0.35)' : 'rgba(0, 240, 255, 0.30)');
          grad.addColorStop(0.5, node.color === '#ff007f' ? 'rgba(255, 0, 127, 0.08)' : 'rgba(0, 240, 255, 0.06)');
          grad.addColorStop(1, 'rgba(10, 10, 12, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.fill();
        });

        // 3D Perspective Grid: Horizontal Cross-lines moving towards camera
        ctx.lineWidth = 1;
        const totalLines = 14;
        for (let i = 0; i < totalLines; i++) {
          const progress = (i + offset) / totalLines;
          const y = horizonY + gridFloorHeight * Math.pow(progress, 2.6);
          const lineAlpha = Math.min(0.24, progress * 0.26);
          ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // 3D Perspective Grid: Vertical vanishing lines
        const vanishingX = width / 2;
        const colCount = width < 768 ? 12 : 22;
        ctx.strokeStyle = 'rgba(255, 0, 127, 0.14)';
        for (let i = -colCount / 2; i <= colCount / 2; i++) {
          const bottomX = vanishingX + i * (width / (colCount * 0.45));
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizonY);
          ctx.lineTo(bottomX, height);
          ctx.stroke();
        }

        // Horizon fog line fade
        const fog = ctx.createLinearGradient(0, horizonY - 4, 0, horizonY + 20);
        fog.addColorStop(0, 'rgba(10, 10, 12, 0.95)');
        fog.addColorStop(1, 'rgba(10, 10, 12, 0)');
        ctx.fillStyle = fog;
        ctx.fillRect(0, horizonY - 4, width, 24);
      } else if (activeTheme === 'aurora') {
        // 2. 🌌 Electric Twilight Aurora
        // Soft, ultra-slow morphing gradient wash
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        (state.ribbons || []).forEach((r) => {
          const phaseOffset = frame * r.speed + r.phase;
          const alpha = r.baseAlpha + Math.sin(phaseOffset * 0.6) * 0.04;

          ctx.beginPath();
          ctx.moveTo(0, r.baseY);

          const step = width < 768 ? 40 : 25;
          for (let x = 0; x <= width + step; x += step) {
            const waveY =
              r.baseY +
              Math.sin((x / r.wavelength) * Math.PI * 2 + phaseOffset) * r.amplitude +
              Math.cos((x / (r.wavelength * 0.6)) * Math.PI * 2 + phaseOffset * 0.8) * (r.amplitude * 0.4);
            ctx.lineTo(x, waveY);
          }
          ctx.lineTo(width, r.baseY + 120);
          ctx.lineTo(0, r.baseY + 120);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, r.baseY - r.amplitude, 0, r.baseY + 120);
          grad.addColorStop(0, `${r.color}0)`);
          grad.addColorStop(0.4, `${r.color}${alpha.toFixed(3)})`);
          grad.addColorStop(1, `${r.color}0)`);

          ctx.fillStyle = grad;
          ctx.fill();
        });

        ctx.restore();
      } else if (activeTheme === 'solar-flare') {
        // 3. 🔥 Crimson Solar Flare (Unique: Coronal Prominence Arches & Molten Bottom Base)
        // 1. Molten Sun Corona Glow along the bottom
        const coronaGrad = ctx.createLinearGradient(0, height - 120, 0, height);
        coronaGrad.addColorStop(0, 'rgba(15, 8, 10, 0)');
        coronaGrad.addColorStop(0.5, 'rgba(255, 94, 0, 0.08)');
        coronaGrad.addColorStop(1, 'rgba(255, 183, 3, 0.18)');
        ctx.fillStyle = coronaGrad;
        ctx.fillRect(0, height - 120, width, 120);

        // 2. Coronal Magnetic Prominence Loops (Curved Arches)
        (state.loops || []).forEach((loop) => {
          const sway = Math.sin(frame * loop.swaySpeed + loop.swayPhase);
          const currentHeight = loop.maxHeight * (0.86 + sway * 0.14);
          const peakY = height - currentHeight;
          const midX = (loop.x1 + loop.x2) / 2 + sway * 30;

          ctx.save();
          // Outer halo of loop
          ctx.strokeStyle = loop.color === '#ff5e00' ? 'rgba(255, 94, 0, 0.12)' : 'rgba(255, 183, 3, 0.12)';
          ctx.lineWidth = loop.lineWidth * 2.8;
          ctx.beginPath();
          ctx.moveTo(loop.x1, height);
          ctx.bezierCurveTo(loop.x1, peakY, midX, peakY, midX, peakY);
          ctx.bezierCurveTo(midX, peakY, loop.x2, peakY, loop.x2, height);
          ctx.stroke();

          // Inner intense magnetic filament
          ctx.strokeStyle = loop.color === '#ff5e00' ? 'rgba(255, 94, 0, 0.35)' : 'rgba(255, 183, 3, 0.32)';
          ctx.lineWidth = loop.lineWidth;
          ctx.beginPath();
          ctx.moveTo(loop.x1, height);
          ctx.bezierCurveTo(loop.x1, peakY, midX, peakY, midX, peakY);
          ctx.bezierCurveTo(midX, peakY, loop.x2, peakY, loop.x2, height);
          ctx.stroke();
          ctx.restore();
        });

        // 3. Lazy rising ember motes drifting up out of the corona
        (state.motes || []).forEach((m) => {
          m.y += m.vy;
          m.x += Math.sin(frame * m.swaySpeed + m.phase) * m.swayAmp;

          // Wrap around top to bottom
          if (m.y < -10) {
            m.y = height + 10;
            m.x = Math.random() * width;
          }

          const pulse = Math.sin(frame * 0.02 + m.phase);
          const alpha = Math.max(0.08, Math.min(0.65, m.alphaBase + pulse * 0.15));

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = m.color;
          ctx.shadowColor = m.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (activeTheme === 'neon-frost') {
        // 4. 💎 Neon Frost Glassmorphism (Unique: Prismatic Frosted Glass Facets & Caustic Shears)
        const now = timestamp || performance.now();
        const cycleProgress = (now % (state.cycleDurationMs || 22000)) / (state.cycleDurationMs || 22000);
        const leakX = width * (0.2 + Math.sin(cycleProgress * Math.PI * 2) * 0.28);
        const leakY = height * (0.16 + Math.cos(cycleProgress * Math.PI * 2) * 0.12);
        const leakRadius = Math.max(width, height) * 0.52;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // 1. Diagonal Prismatic Caustic Leak (Cyan & Lavender)
        const gradCyan = ctx.createRadialGradient(leakX, leakY, 0, leakX, leakY, leakRadius);
        gradCyan.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
        gradCyan.addColorStop(0.4, 'rgba(56, 189, 248, 0.04)');
        gradCyan.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = gradCyan;
        ctx.fillRect(0, 0, width, height);

        const gradLav = ctx.createRadialGradient(leakX + 80, leakY - 40, 0, leakX + 80, leakY - 40, leakRadius * 0.65);
        gradLav.addColorStop(0, 'rgba(192, 132, 252, 0.12)');
        gradLav.addColorStop(0.5, 'rgba(192, 132, 252, 0.03)');
        gradLav.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = gradLav;
        ctx.fillRect(0, 0, width, height);

        // 2. Beveled Geometric Frosted Glass Facets
        (state.facets || []).forEach((facet) => {
          const shimmer = (Math.sin(frame * facet.speed + facet.phase) + 1) * 0.5;
          const facetAlpha = 0.06 + shimmer * 0.14;
          const s = facet.size * (0.95 + shimmer * 0.1);

          ctx.save();
          ctx.translate(facet.cx, facet.cy);
          ctx.rotate(facet.rot + shimmer * 0.05);

          // Facet fill: Frosted Glass Tint
          ctx.fillStyle = facet.colorType === 'cyan'
            ? `rgba(56, 189, 248, ${(facetAlpha * 0.45).toFixed(3)})`
            : `rgba(192, 132, 252, ${(facetAlpha * 0.45).toFixed(3)})`;

          // Rhombus / Diamond Glass Facet geometry
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.6);
          ctx.lineTo(s * 0.8, 0);
          ctx.lineTo(0, s * 0.6);
          ctx.lineTo(-s * 0.8, 0);
          ctx.closePath();
          ctx.fill();

          // Beveled cut glass edge highlight
          ctx.strokeStyle = `rgba(255, 255, 255, ${(facetAlpha * 0.8).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.restore();
        });

        ctx.restore();
      } else if (activeTheme === 'plasma-web') {
        // 5. 🪐 Cyberpunk Plasma Web (Unique: Circuit Vector Mesh, Triangular Facets & Electric Data Packets)
        const nodes = state.nodes || [];
        const maxDist = state.maxDistance || 120;

        // 1. Update node physics
        nodes.forEach((n) => {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        });

        // 2. Triangular Cyber Mesh Facets (Connect triplets with low-opacity fill)
        ctx.save();
        for (let i = 0; i < Math.min(nodes.length, 14); i++) {
          for (let j = i + 1; j < Math.min(nodes.length, 18); j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            if (dx * dx + dy * dy < maxDist * maxDist) {
              for (let k = j + 1; k < Math.min(nodes.length, 22); k++) {
                const dx2 = nodes[j].x - nodes[k].x;
                const dy2 = nodes[j].y - nodes[k].y;
                if (dx2 * dx2 + dy2 * dy2 < maxDist * maxDist) {
                  // Render subtle cyber mesh triangle
                  ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 255, 102, 0.022)' : 'rgba(37, 99, 235, 0.025)';
                  ctx.beginPath();
                  ctx.moveTo(nodes[i].x, nodes[i].y);
                  ctx.lineTo(nodes[j].x, nodes[j].y);
                  ctx.lineTo(nodes[k].x, nodes[k].y);
                  ctx.closePath();
                  ctx.fill();
                  break;
                }
              }
            }
          }
        }
        ctx.restore();

        // 3. Vector Connection Lines
        ctx.lineWidth = 0.7;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
              const lineAlpha = (1 - dist / maxDist) * 0.16;
              ctx.strokeStyle = `rgba(0, 255, 102, ${lineAlpha.toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }
        }

        // 4. Electric Data Packets (High-speed sparks traveling along lines)
        (state.packets || []).forEach((pkt) => {
          pkt.progress += pkt.speed;
          if (pkt.progress >= 1) {
            pkt.progress = 0;
            pkt.from = pkt.to;
            pkt.to = Math.floor(Math.random() * nodes.length);
          }

          const n1 = nodes[pkt.from];
          const n2 = nodes[pkt.to];
          if (n1 && n2) {
            const px = n1.x + (n2.x - n1.x) * pkt.progress;
            const py = n1.y + (n2.y - n1.y) * pkt.progress;

            ctx.save();
            ctx.fillStyle = pkt.color;
            ctx.shadowColor = pkt.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });

        // 5. Nodes with concentric cyber halos
        nodes.forEach((n) => {
          const pulse = (Math.sin(frame * 0.03 + n.pulsePhase) + 1) * 0.5;

          ctx.save();
          // Outer pulse ring
          ctx.strokeStyle = n.color === '#00ff66' ? 'rgba(0, 255, 102, 0.22)' : 'rgba(37, 99, 235, 0.22)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 3 + pulse * 4, 0, Math.PI * 2);
          ctx.stroke();

          // Center core
          ctx.fillStyle = n.color;
          ctx.globalAlpha = 0.6 + pulse * 0.35;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (activeTheme === 'abyssal-trench') {
        // 6. 🌊 Neon Abyssal Trench (Unique: Volumetric Oceanic Caustic Ribbons & Sonar Sweep)
        // 1. Horizontal Sonar Line Reflection
        state.sonarY = ((state.sonarY || 0) + (state.sonarSpeed || 0.5)) % height;
        const sonarGrad = ctx.createLinearGradient(0, state.sonarY - 12, 0, state.sonarY + 12);
        sonarGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
        sonarGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
        sonarGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = sonarGrad;
        ctx.fillRect(0, state.sonarY - 12, width, 24);

        // 2. Volumetric Caustic Ribbons (Filled gradient bands between paired wave limits)
        (state.ribbons || []).forEach((w) => {
          const phaseOffset = frame * w.speed + w.phase;
          const step = width < 768 ? 35 : 20;

          ctx.save();
          ctx.beginPath();
          // Upper crest
          ctx.moveTo(0, w.baseY + Math.sin(phaseOffset) * w.amplitude);
          for (let x = 0; x <= width + step; x += step) {
            const yTop =
              w.baseY +
              Math.sin((x / w.wavelength) * Math.PI * 2 + phaseOffset) * w.amplitude +
              Math.cos((x / (w.wavelength * 0.5)) * Math.PI * 2 + phaseOffset * 0.7) * (w.amplitude * 0.3);
            ctx.lineTo(x, yTop);
          }
          // Lower trough (reverse path to form closed ribbon)
          for (let x = width; x >= -step; x -= step) {
            const yBottom =
              w.baseY +
              w.thickness +
              Math.sin((x / w.wavelength) * Math.PI * 2 + phaseOffset + 0.5) * w.amplitude +
              Math.cos((x / (w.wavelength * 0.5)) * Math.PI * 2 + phaseOffset * 0.7) * (w.amplitude * 0.3);
            ctx.lineTo(x, yBottom);
          }
          ctx.closePath();

          // Fill with rich deep-sea laser aqua / electric indigo gradient
          const ribbonGrad = ctx.createLinearGradient(0, w.baseY - w.amplitude, 0, w.baseY + w.thickness + w.amplitude);
          ribbonGrad.addColorStop(0, `${w.color}0)`);
          ribbonGrad.addColorStop(0.5, `${w.color}${w.alpha.toFixed(3)})`);
          ribbonGrad.addColorStop(1, `${w.color}0)`);
          ctx.fillStyle = ribbonGrad;
          ctx.fill();

          // Thin sharp caustics crest
          ctx.strokeStyle = `${w.color}${(w.alpha * 1.5).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.restore();
        });
      } else if (activeTheme === 'nebula-drift') {
        // 7. 🚀 Quantum Nebula Drift (Unique: Volumetric Gas Clouds & 10-12 Diamond Cross Stars)
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // 1. Organic Interstellar Dust Clouds
        (state.clouds || []).forEach((c) => {
          const sway = Math.sin(frame * c.speed + c.phase);
          const rx = c.rx * (0.95 + sway * 0.08);
          const ry = c.ry * (0.95 - sway * 0.08);

          const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, Math.max(rx, ry));
          grad.addColorStop(0, `${c.color}${c.alpha})`);
          grad.addColorStop(0.6, `${c.color}${(c.alpha * 0.35).toFixed(3)})`);
          grad.addColorStop(1, `${c.color}0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(c.x, c.y, rx, ry, sway * 0.2, 0, Math.PI * 2);
          ctx.fill();
        });

        // 2. STRICTLY 10-12 Diamond Cross Diffraction Stars
        (state.stars || []).forEach((s) => {
          const twinkle = (Math.sin(frame * s.twinkleSpeed + s.phase) + 1) * 0.5;
          const alpha = 0.2 + twinkle * 0.8;
          const currentSpike = s.spikeLen * (0.6 + twinkle * 0.7);

          ctx.save();
          ctx.globalAlpha = alpha;

          // Primary Horizontal & Vertical Diamond Cross-Diffraction Spikes
          ctx.fillStyle = s.color;
          // Horizontal diamond ray
          ctx.beginPath();
          ctx.moveTo(s.x - currentSpike, s.y);
          ctx.lineTo(s.x, s.y - 1.2);
          ctx.lineTo(s.x + currentSpike, s.y);
          ctx.lineTo(s.x, s.y + 1.2);
          ctx.closePath();
          ctx.fill();

          // Vertical diamond ray
          ctx.beginPath();
          ctx.moveTo(s.x, s.y - currentSpike);
          ctx.lineTo(s.x + 1.2, s.y);
          ctx.lineTo(s.x, s.y + currentSpike);
          ctx.lineTo(s.x - 1.2, s.y);
          ctx.closePath();
          ctx.fill();

          // 8-point secondary 45-degree spikes for major stars
          if (s.isSuperStar && twinkle > 0.4) {
            const diagSpike = currentSpike * 0.55;
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(-diagSpike, 0);
            ctx.lineTo(0, -1);
            ctx.lineTo(diagSpike, 0);
            ctx.lineTo(0, 1);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          // Pure white star core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.coreRadius * (0.8 + twinkle * 0.4), 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });

        ctx.restore();
      } else if (activeTheme === 'citrus-arcade') {
        // 8. 🍊 Neon Citrus Arcade (Unique: 8-Bit Tetromino Sprites, Scanline & Static Grid)
        // 1. CRT Raster Scanline sweep
        state.scanlineY = ((state.scanlineY || 0) + (state.scanlineSpeed || 0.55)) % height;
        const crtGrad = ctx.createLinearGradient(0, state.scanlineY - 14, 0, state.scanlineY + 14);
        crtGrad.addColorStop(0, 'rgba(255, 122, 0, 0)');
        crtGrad.addColorStop(0.5, 'rgba(255, 214, 0, 0.08)');
        crtGrad.addColorStop(1, 'rgba(255, 122, 0, 0)');
        ctx.fillStyle = crtGrad;
        ctx.fillRect(0, state.scanlineY - 14, width, 28);

        // 2. Cascading 8-bit Tetromino Pixel Art Sprites
        (state.sprites || []).forEach((spr) => {
          spr.y += spr.vy;
          if (spr.y > height + 40) {
            spr.y = -40;
            spr.x = Math.random() * width;
          }

          const pulse = (Math.sin(frame * 0.025 + spr.pulsePhase) + 1) * 0.5;
          const alpha = spr.alpha + pulse * 0.08;

          ctx.save();
          ctx.fillStyle = spr.color;
          ctx.globalAlpha = alpha;

          // Render exact 8-bit block matrix
          const rows = spr.shape.length;
          const cols = spr.shape[0].length;
          const b = spr.blockSize;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (spr.shape[r][c] === 1) {
                // Crisp retro arcade pixel block with 1px grid separator
                ctx.fillRect(
                  Math.round(spr.x + c * b),
                  Math.round(spr.y + r * b),
                  b - 1,
                  b - 1
                );
              }
            }
          }

          ctx.restore();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
}
