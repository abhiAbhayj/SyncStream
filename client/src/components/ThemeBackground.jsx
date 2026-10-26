import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Brand-New Themes:
 * 1. cryo-glacial          — Cryo-Prismatic Glacial Shatter (Sub-Zero Frost Prism Refraction)
 * 2. magma-thermal         — Magma Thermal Convection Waves (Molten Core Heat-Haze Distortion)
 * 3. emerald-biogrid       — Emerald Matrix Biogrid (Inward Orbiting Lightning Rings)
 * 4. cobalt-quantum        — Cobalt Quantum Wave (Warped Space-Time Ripple Grid)
 * 5. golden-sunfire        — Golden Sunfire Monolith (Opposing Thermal Gradient Streams)
 * 6. obsidian-void         — Obsidian Shadow Void (Freezing Circuit Crystal Growth)
 * 7. cyberpunk-synthwave   — Cyberpunk Synthwave Neon (Slow-Gliding Neon Horizon Grid)
 * 8. mystic-amethyst       — Mystic Amethyst Portal (Concentric Portal Energy Rings)
 */

const VALID_THEMES = [
  'cryo-glacial',
  'magma-thermal',
  'emerald-biogrid',
  'cobalt-quantum',
  'golden-sunfire',
  'obsidian-void',
  'cyberpunk-synthwave',
  'mystic-amethyst'
];

const LEGACY_THEME_MAP = {
  'storm-thunder': 'cobalt-quantum',
  synthwave: 'cyberpunk-synthwave',
  'cryo-vault': 'cryo-glacial',
  'solar-flare': 'magma-thermal',
  'cosmic-singularity': 'mystic-amethyst',
  'plasma-web': 'emerald-biogrid',
  'cyber-foundry': 'golden-sunfire',
  'bioluminescent-trench': 'mystic-amethyst',
  'windy-sakura': 'cyberpunk-synthwave',
  'yokohama-night': 'cyberpunk-synthwave',
  aurora: 'cryo-glacial',
  'neon-frost': 'cobalt-quantum',
  'abyssal-trench': 'mystic-amethyst',
  'nebula-drift': 'mystic-amethyst',
  'citrus-arcade': 'golden-sunfire'
};

export default function ThemeBackground() {
  const canvasRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem('syncstream_theme');
    if (saved && VALID_THEMES.includes(saved)) return saved;
    if (saved && LEGACY_THEME_MAP[saved]) return LEGACY_THEME_MAP[saved];
    return 'cryo-glacial';
  });

  // Track body class changes to switch simulation mode instantly
  useEffect(() => {
    const detectTheme = () => {
      const classList = document.body.classList;
      for (const t of VALID_THEMES) {
        if (classList.contains(`theme-${t}`)) return t;
      }
      for (const [oldKey, newKey] of Object.entries(LEGACY_THEME_MAP)) {
        if (classList.contains(`theme-${oldKey}`)) return newKey;
      }
      const saved = localStorage.getItem('syncstream_theme');
      if (saved && VALID_THEMES.includes(saved)) return saved;
      if (saved && LEGACY_THEME_MAP[saved]) return LEGACY_THEME_MAP[saved];
      return 'cryo-glacial';
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
        } else if (val && LEGACY_THEME_MAP[val]) {
          setActiveTheme(LEGACY_THEME_MAP[val]);
        } else {
          setActiveTheme('cryo-glacial');
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

    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    let targetMouseX = width * 0.5;
    let targetMouseY = height * 0.5;

    const handlePointerMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

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

      if (theme === 'cryo-glacial') {
        // 1. Cryo-Prismatic Glacial Shatter (Sub-Zero Frost Prism Refraction)
        // A. Translucent rotating ice shards
        const shardCount = isMobile ? 14 : 26;
        const shards = [];
        for (let i = 0; i < shardCount; i++) {
          const vertices = [];
          const sides = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5-sided ice shards
          const baseRadius = (isMobile ? 12 : 18) + Math.random() * (isMobile ? 24 : 36);
          for (let s = 0; s < sides; s++) {
            const angle = (s / sides) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
            const r = baseRadius * (0.65 + Math.random() * 0.7);
            vertices.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
          }
          shards.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: 0.15 + Math.random() * 0.35,
            angle: Math.random() * Math.PI * 2,
            vAngle: (Math.random() - 0.5) * 0.008,
            vertices,
            baseRadius,
            alpha: 0.12 + Math.random() * 0.22,
            prismHue: Math.random() > 0.5 ? '#38bdf8' : '#22d3ee'
          });
        }

        // B. Prismatic Refraction Light Beams
        const beamCount = isMobile ? 3 : 5;
        const beams = [];
        for (let b = 0; b < beamCount; b++) {
          beams.push({
            originX: (b / (beamCount - 1 || 1)) * width + (Math.random() - 0.5) * 150,
            angle: (Math.PI * 0.25) + (Math.random() - 0.5) * 0.35,
            vAngle: (Math.random() - 0.5) * 0.002,
            width: (isMobile ? 120 : 220) + Math.random() * 140,
            phase: Math.random() * Math.PI * 2,
            speed: 0.01 + Math.random() * 0.012
          });
        }

        // C. Micro-ice crystals & spark glints
        const glintCount = isMobile ? 24 : 45;
        const glints = [];
        for (let g = 0; g < glintCount; g++) {
          glints.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2.2 + 0.8,
            phase: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.03,
            color: g % 2 === 0 ? '#38bdf8' : (g % 3 === 0 ? '#22d3ee' : '#ffffff')
          });
        }

        state = { shards, beams, glints };
      } else if (theme === 'magma-thermal') {
        // 2. Magma Thermal Convection Waves (Molten Core Heat-Haze Distortion & Tectonic Fissure Caldera)
        // A. Jagged branching tectonic fissures along the volcanic abyss
        const fissureCount = isMobile ? 3 : 5;
        const fissures = [];
        for (let f = 0; f < fissureCount; f++) {
          const rootX = (f + 0.5) * (width / fissureCount) + (Math.random() - 0.5) * (width / (fissureCount * 2));
          const rootY = height + 10;
          const segCount = isMobile ? 5 : 7;
          let currX = rootX;
          let currY = rootY;
          const points = [{ x: currX, y: currY }];
          const branches = [];
          for (let s = 0; s < segCount; s++) {
            currX += (Math.random() - 0.5) * (isMobile ? 35 : 55);
            currY -= (isMobile ? 22 : 36) + Math.random() * 20;
            points.push({ x: currX, y: currY });
            // Secondary side crack
            if (s > 1 && Math.random() > 0.45) {
              const bLen = (isMobile ? 20 : 35) + Math.random() * 25;
              const bAngle = -Math.PI * 0.5 + (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.5);
              branches.push({
                x1: currX,
                y1: currY,
                x2: currX + Math.cos(bAngle) * bLen,
                y2: currY + Math.sin(bAngle) * bLen
              });
            }
          }
          fissures.push({ points, branches, pulsePhase: Math.random() * Math.PI * 2 });
        }

        // B. Non-linear atmospheric heat-haze convection waves
        const waveCount = isMobile ? 8 : 15;
        const waves = [];
        for (let w = 0; w < waveCount; w++) {
          waves.push({
            baseX: (w / (waveCount - 1 || 1)) * width,
            amp1: (isMobile ? 10 : 20) + Math.random() * 14,
            amp2: (isMobile ? 5 : 10) + Math.random() * 8,
            freq1: 0.005 + Math.random() * 0.004,
            freq2: 0.012 + Math.random() * 0.008,
            speed1: 0.025 + Math.random() * 0.02,
            speed2: 0.04 + Math.random() * 0.025,
            phase1: Math.random() * Math.PI * 2,
            phase2: Math.random() * Math.PI * 2,
            color: w % 2 === 0 ? 'rgba(239, 68, 68, ' : 'rgba(249, 115, 22, '
          });
        }

        // C. Buoyant incandescent magma embers & molten plasma blobs
        const emberCount = isMobile ? 30 : 65;
        const embers = [];
        for (let e = 0; e < emberCount; e++) {
          embers.push({
            x: Math.random() * width,
            y: height + Math.random() * 120,
            vy: -(0.7 + Math.random() * 1.5),
            vx: (Math.random() - 0.5) * 0.5,
            swayAmp: 1.5 + Math.random() * 3.0,
            swaySpeed: 0.02 + Math.random() * 0.035,
            phase: Math.random() * Math.PI * 2,
            size: Math.random() * 3.2 + 1.2,
            maxLife: 180 + Math.random() * 240,
            life: Math.random() * 180,
            color: e % 4 === 0 ? '#fef08a' : (e % 2 === 0 ? '#f97316' : '#ef4444')
          });
        }

        state = { fissures, waves, embers };
      } else if (theme === 'emerald-biogrid') {
        // 3. Emerald Matrix Biogrid (3D Cyber Neural Matrix + Branching Tesla Lightning Rings)
        const horizonY = height * 0.62;
        const groundHeight = height - horizonY;
        const gridCols = isMobile ? 12 : 22;
        const gridRows = isMobile ? 10 : 16;

        // Concentric techno-orbital telemetry rings
        const ringCount = isMobile ? 5 : 7;
        const rings = [];
        const maxRadius = Math.min(width, height) * (isMobile ? 0.65 : 0.55);
        for (let i = 0; i < ringCount; i++) {
          const r = (maxRadius / ringCount) * (i + 1);
          rings.push({
            radius: r,
            angle: Math.random() * Math.PI * 2,
            speed: (i % 2 === 0 ? 1 : -1) * (0.002 + (ringCount - i) * 0.0012),
            dashArray: [16 + i * 4, 12 + i * 3],
            nodes: [
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2
            ],
            color: i % 2 === 0 ? '#10b981' : '#34d399',
            alpha: 0.2 + (i / ringCount) * 0.25
          });
        }

        // Floating bio-matrix data bits
        const bitCount = isMobile ? 22 : 45;
        const floatingBits = [];
        for (let b = 0; b < bitCount; b++) {
          floatingBits.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: -(0.25 + Math.random() * 0.6),
            vx: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2.2 + 0.8,
            phase: Math.random() * Math.PI * 2,
            speed: 0.03 + Math.random() * 0.04
          });
        }

        state = {
          horizonY,
          groundHeight,
          gridCols,
          gridRows,
          rings,
          floatingBits,
          sparks: [],
          nextBoltTimer: 20
        };
      } else if (theme === 'cobalt-quantum') {
        // 4. Cobalt Quantum Wave (3D Warped Spacetime Topological Mesh & Singularity Vortex)
        const spacing = isMobile ? 48 : 36;
        const cols = Math.ceil(width / spacing) + 2;
        const rows = Math.ceil(height / spacing) + 2;

        // 3D Orbital quantum star clusters
        const starCount = isMobile ? 40 : 80;
        const stars = [];
        for (let s = 0; s < starCount; s++) {
          stars.push({
            radius: 25 + Math.random() * (Math.min(width, height) * 0.48),
            angle: Math.random() * Math.PI * 2,
            angularSpeed: (0.004 + Math.random() * 0.012) * (s % 2 === 0 ? 1 : -1),
            orbitPlane: s % 3,
            size: Math.random() * 2.4 + 0.8,
            color: s % 3 === 0 ? '#f8fafc' : (s % 2 === 0 ? '#3b82f6' : '#06b6d4'),
            pulsePhase: Math.random() * Math.PI * 2
          });
        }

        // Lensing beams
        const beamCount = isMobile ? 4 : 8;
        const beams = [];
        for (let b = 0; b < beamCount; b++) {
          beams.push({
            angle: (b / beamCount) * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.003,
            length: Math.min(width, height) * (0.6 + Math.random() * 0.4),
            phase: Math.random() * Math.PI * 2
          });
        }

        state = { spacing, cols, rows, stars, beams };
      } else if (theme === 'golden-sunfire') {
        // 5. Golden Sunfire Monolith (Rotating Sacred Sun Mandala & Opposing Thermal Vortices)
        const mandalaRays = isMobile ? 12 : 24;
        const mandalaMaxR = Math.min(width, height) * (isMobile ? 0.38 : 0.32);

        // Stream A: Descending crystalline gold-frost needles (top -> down)
        const frostCount = isMobile ? 24 : 48;
        const frostStream = [];
        for (let f = 0; f < frostCount; f++) {
          frostStream.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: 0.4 + Math.random() * 0.8,
            vx: (Math.random() - 0.5) * 0.25,
            length: (isMobile ? 22 : 38) + Math.random() * 28,
            width: Math.random() * 2.0 + 0.8,
            alpha: 0.15 + Math.random() * 0.25,
            color: f % 3 === 0 ? '#ffffff' : (f % 2 === 0 ? '#fef08a' : '#eab308')
          });
        }

        // Stream B: Ascending incandescent solar plasma embers (bottom -> up)
        const emberCount = isMobile ? 25 : 52;
        const solarStream = [];
        for (let e = 0; e < emberCount; e++) {
          solarStream.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: -(0.5 + Math.random() * 1.1),
            vx: (Math.random() - 0.5) * 0.35,
            size: Math.random() * 2.8 + 1.0,
            swayAmp: 1.5 + Math.random() * 3.0,
            swaySpeed: 0.02 + Math.random() * 0.03,
            phase: Math.random() * Math.PI * 2,
            alpha: 0.2 + Math.random() * 0.35,
            color: e % 3 === 0 ? '#f59e0b' : (e % 2 === 0 ? '#eab308' : '#ffffff')
          });
        }

        state = { mandalaRays, mandalaMaxR, frostStream, solarStream };
      } else if (theme === 'obsidian-void') {
        // 6. Obsidian Shadow Void (Freezing Circuit Crystal Growth)
        // Generate dendritic crystal growth paths from corners & edges
        const paths = [];
        const cornerRoots = [
          { x: 0, y: 0, dirX: 1, dirY: 1 },
          { x: width, y: 0, dirX: -1, dirY: 1 },
          { x: 0, y: height, dirX: 1, dirY: -1 },
          { x: width, y: height, dirX: -1, dirY: -1 },
          { x: width * 0.5, y: 0, dirX: 0, dirY: 1 },
          { x: width * 0.5, y: height, dirX: 0, dirY: -1 }
        ];

        cornerRoots.forEach((root) => {
          let cx = root.x;
          let cy = root.y;
          const segments = [];
          const depth = isMobile ? 5 : 8;
          for (let d = 0; d < depth; d++) {
            const stepLen = (isMobile ? 25 : 45) + Math.random() * 30;
            // Strict 0, 45, 90 degree step
            const mode = Math.floor(Math.random() * 3);
            let nx = cx;
            let ny = cy;
            if (mode === 0) {
              nx = cx + root.dirX * stepLen;
            } else if (mode === 1) {
              ny = cy + root.dirY * stepLen;
            } else {
              nx = cx + root.dirX * stepLen * 0.707;
              ny = cy + root.dirY * stepLen * 0.707;
            }
            segments.push({ x1: cx, y1: cy, x2: nx, y2: ny, node: Math.random() > 0.4 });
            cx = nx;
            cy = ny;
          }
          paths.push(segments);
        });

        // Floating spark nodes
        const nodeCount = isMobile ? 18 : 35;
        const nodes = [];
        for (let n = 0; n < nodeCount; n++) {
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 1,
            phase: Math.random() * Math.PI * 2,
            speed: 0.025 + Math.random() * 0.025,
            color: n % 2 === 0 ? '#94a3b8' : '#475569'
          });
        }

        state = { paths, nodes };
      } else if (theme === 'cyberpunk-synthwave') {
        // 7. Cyberpunk Synthwave Neon (Slow-Gliding Neon Horizon Grid)
        const horizonY = height * 0.56;
        const gridRungs = isMobile ? 14 : 22;
        const gridLines = isMobile ? 12 : 24;

        // Distant synthwave neon sky stars
        const stars = [];
        const starCount = isMobile ? 30 : 60;
        for (let s = 0; s < starCount; s++) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * horizonY,
            size: Math.random() * 1.6 + 0.6,
            phase: Math.random() * Math.PI * 2,
            color: s % 2 === 0 ? '#06b6d4' : '#ec4899'
          });
        }

        state = { horizonY, gridRungs, gridLines, stars, scrollOffset: 0 };
      } else if (theme === 'mystic-amethyst') {
        // 8. Mystic Amethyst Portal (Sacred Arcane Stargate & Swirling Logarithmic Vortex)
        const portalRadius = Math.min(width, height) * (isMobile ? 0.42 : 0.36);
        const ringCount = isMobile ? 6 : 9;
        const maxR = Math.max(width, height) * (isMobile ? 0.9 : 0.8);

        // Logarithmic spiral stardust particles
        const particleCount = isMobile ? 35 : 75;
        const particles = [];
        for (let p = 0; p < particleCount; p++) {
          particles.push({
            spiralAngle: Math.random() * Math.PI * 8,
            dist: 20 + Math.random() * maxR,
            angularSpeed: 0.008 + Math.random() * 0.014,
            radialSpeed: -(0.3 + Math.random() * 0.7),
            size: Math.random() * 2.4 + 0.8,
            color: p % 4 === 0 ? '#10b981' : (p % 2 === 0 ? '#9333ea' : (p % 3 === 0 ? '#c084fc' : '#f8fafc')),
            phase: Math.random() * Math.PI * 2
          });
        }

        // Resonating emerald ley-line nodes
        const leyNodeCount = isMobile ? 6 : 8;
        const leyNodes = [];
        for (let l = 0; l < leyNodeCount; l++) {
          leyNodes.push({
            baseAngle: (l / leyNodeCount) * Math.PI * 2,
            radius: portalRadius * (0.75 + (l % 2) * 0.3),
            speed: (l % 2 === 0 ? 1 : -1) * 0.005,
            phase: Math.random() * Math.PI * 2
          });
        }

        state = { portalRadius, ringCount, maxR, particles, leyNodes };
      }
    }

    initScene(activeTheme);

    function render() {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Smooth pointer follow for subtle inertia
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      if (activeTheme === 'cryo-glacial') {
        // 1. Cryo-Prismatic Glacial Shatter (Sub-Zero Frost Prism Refraction)
        ctx.save();

        // Refracted rainbow light beams
        if (state.beams) {
          state.beams.forEach((beam) => {
            beam.angle += beam.vAngle;
            if (beam.angle < Math.PI * 0.15 || beam.angle > Math.PI * 0.35) {
              beam.vAngle *= -1;
            }
            const pulse = 0.5 + Math.sin(frame * beam.speed + beam.phase) * 0.5;
            const grad = ctx.createLinearGradient(
              beam.originX,
              0,
              beam.originX + Math.cos(beam.angle) * width,
              height
            );
            grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
            grad.addColorStop(0.35, `rgba(56, 189, 248, ${0.035 * pulse})`);
            grad.addColorStop(0.55, `rgba(34, 211, 238, ${0.045 * pulse})`);
            grad.addColorStop(0.75, `rgba(168, 85, 247, ${0.03 * pulse})`);
            grad.addColorStop(1, 'rgba(234, 179, 8, 0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(beam.originX - beam.width * 0.5, 0);
            ctx.lineTo(beam.originX + beam.width * 0.5, 0);
            ctx.lineTo(beam.originX + Math.cos(beam.angle) * width + beam.width, height);
            ctx.lineTo(beam.originX + Math.cos(beam.angle) * width - beam.width, height);
            ctx.closePath();
            ctx.fill();
          });
        }

        // Translucent Ice Shards
        if (state.shards) {
          state.shards.forEach((s) => {
            s.x += s.vx;
            s.y += s.vy;
            s.angle += s.vAngle;
            if (s.y > height + 50) s.y = -50;
            if (s.x < -50) s.x = width + 50;
            if (s.x > width + 50) s.x = -50;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.angle);

            ctx.beginPath();
            s.vertices.forEach((v, idx) => {
              if (idx === 0) ctx.moveTo(v.x, v.y);
              else ctx.lineTo(v.x, v.y);
            });
            ctx.closePath();

            // Translucent frosted fill
            ctx.fillStyle = `rgba(56, 189, 248, ${s.alpha * 0.28})`;
            ctx.fill();

            // Crisp prismatic boundary stroke
            ctx.strokeStyle = s.prismHue === '#38bdf8' ? `rgba(56, 189, 248, ${s.alpha})` : `rgba(34, 211, 238, ${s.alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.restore();
          });
        }

        // Micro-ice crystal glints
        if (state.glints) {
          state.glints.forEach((g) => {
            const glow = 0.35 + Math.sin(frame * g.speed + g.phase) * 0.35;
            ctx.fillStyle = g.color;
            ctx.globalAlpha = glow;
            ctx.beginPath();
            ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        ctx.restore();
      } else if (activeTheme === 'magma-thermal') {
        // 2. Magma Thermal Convection Waves (Molten Core Heat-Haze Distortion & Tectonic Fissure Caldera)
        ctx.save();

        // Molten core radiant base glow
        const coreGrad = ctx.createRadialGradient(width * 0.5, height, 10, width * 0.5, height, width * 0.7);
        const pulse = 0.7 + Math.sin(frame * 0.02) * 0.3;
        coreGrad.addColorStop(0, `rgba(249, 115, 22, ${0.28 * pulse})`);
        coreGrad.addColorStop(0.4, `rgba(239, 68, 68, ${0.16 * pulse})`);
        coreGrad.addColorStop(1, 'rgba(9, 5, 5, 0)');
        ctx.fillStyle = coreGrad;
        ctx.fillRect(0, height * 0.35, width, height * 0.65);

        // A. Branching Tectonic Fissures
        if (state.fissures) {
          state.fissures.forEach((fis) => {
            const fPulse = 0.65 + Math.sin(frame * 0.025 + fis.pulsePhase) * 0.35;

            // Pass 1: Outer heat glow
            ctx.beginPath();
            fis.points.forEach((pt, idx) => {
              if (idx === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.22 * fPulse})`;
            ctx.lineWidth = 9;
            ctx.stroke();

            // Pass 2: Magma artery
            ctx.beginPath();
            fis.points.forEach((pt, idx) => {
              if (idx === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = `rgba(249, 115, 22, ${0.75 * fPulse})`;
            ctx.lineWidth = 3.2;
            ctx.stroke();

            // Pass 3: Incandescent molten core
            ctx.beginPath();
            fis.points.forEach((pt, idx) => {
              if (idx === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = `rgba(254, 240, 138, ${0.9 * fPulse})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Side fissure branches
            if (fis.branches) {
              fis.branches.forEach((br) => {
                ctx.beginPath();
                ctx.moveTo(br.x1, br.y1);
                ctx.lineTo(br.x2, br.y2);
                ctx.strokeStyle = `rgba(249, 115, 22, ${0.55 * fPulse})`;
                ctx.lineWidth = 1.8;
                ctx.stroke();
              });
            }
          });
        }

        // B. Non-linear Atmospheric Heat-Haze Shimmer Waves
        if (state.waves) {
          state.waves.forEach((w) => {
            ctx.beginPath();
            const segments = 26;
            const stepY = height / segments;
            for (let i = 0; i <= segments; i++) {
              const cy = i * stepY;
              const waveOffset =
                Math.sin(cy * w.freq1 - frame * w.speed1 + w.phase1) * w.amp1 +
                Math.sin(cy * w.freq2 + frame * w.speed2 + w.phase2) * w.amp2;
              const cx = w.baseX + waveOffset;
              if (i === 0) ctx.moveTo(cx, cy);
              else ctx.lineTo(cx, cy);
            }
            ctx.strokeStyle = `${w.color}0.08)`;
            ctx.lineWidth = 3.0;
            ctx.stroke();
          });
        }

        // C. Buoyant Molten Plasma Embers
        if (state.embers) {
          state.embers.forEach((emb) => {
            emb.y += emb.vy;
            emb.x += Math.sin(frame * emb.swaySpeed + emb.phase) * (emb.swayAmp * 0.6);
            emb.life++;
            if (emb.y < 0 || emb.life > emb.maxLife) {
              emb.y = height + 10;
              emb.x = Math.random() * width;
              emb.life = 0;
            }

            const progress = emb.life / emb.maxLife;
            const alpha = (1 - progress) * 0.85;

            // Halo glow
            ctx.beginPath();
            ctx.arc(emb.x, emb.y, emb.size * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = emb.color === '#fef08a' ? 'rgba(254, 240, 138, 0.15)' : 'rgba(239, 68, 68, 0.12)';
            ctx.fill();

            // Ember nucleus
            ctx.fillStyle = emb.color;
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.beginPath();
            ctx.arc(emb.x, emb.y, emb.size * (1 - progress * 0.35), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }

        ctx.restore();
      } else if (activeTheme === 'emerald-biogrid') {
        // 3. Emerald Matrix Biogrid (3D Cyber Neural Matrix + Branching Tesla Lightning Rings)
        ctx.save();
        const cx = width * 0.5;
        const cy = height * 0.5;
        const { horizonY, groundHeight, gridCols, gridRows, rings, floatingBits } = state;

        // A. Perspective 3D Cyber Neural Grid
        const vpX = width * 0.5 + (mouseX - width * 0.5) * 0.12;

        // Longitudinal grid lines
        for (let c = 0; c <= gridCols; c++) {
          const bottomX = (c / gridCols) * (width * 1.8) - width * 0.4;
          ctx.beginPath();
          ctx.moveTo(vpX, horizonY);
          ctx.lineTo(bottomX, height);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Transverse gliding grid rungs
        const rungProgress = (frame * 0.003) % 1;
        for (let r = 0; r < gridRows; r++) {
          const z = (r / gridRows + rungProgress) % 1;
          const y = horizonY + Math.pow(z, 2.0) * groundHeight;
          const alpha = Math.pow(z, 1.6) * 0.35;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
          ctx.lineWidth = 1 + z * 1.2;
          ctx.stroke();
        }

        // B. Concentric Techno-Orbital Rings with Orbiting Telemetry Nodes
        if (rings) {
          rings.forEach((ring) => {
            ring.angle += ring.speed;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(ring.angle);

            ctx.beginPath();
            ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = ring.color;
            ctx.globalAlpha = ring.alpha;
            ctx.lineWidth = 1.5;
            ctx.setLineDash(ring.dashArray);
            ctx.stroke();

            // Orbiting data nodes
            ring.nodes.forEach((nAngle) => {
              const nx = Math.cos(nAngle) * ring.radius;
              const ny = Math.sin(nAngle) * ring.radius;
              ctx.beginPath();
              ctx.arc(nx, ny, 2.8, 0, Math.PI * 2);
              ctx.fillStyle = '#34d399';
              ctx.globalAlpha = Math.min(1, ring.alpha * 2.8);
              ctx.fill();

              // Spark halo
              ctx.beginPath();
              ctx.arc(nx, ny, 6, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(52, 211, 153, 0.2)';
              ctx.fill();
            });

            ctx.restore();
          });
        }

        // C. Dynamic Tesla Branching Lightning Engine
        state.nextBoltTimer--;
        if (state.nextBoltTimer <= 0 && rings && rings.length > 2) {
          state.nextBoltTimer = Math.floor(16 + Math.random() * 22);
          const r1 = rings[Math.floor(Math.random() * (rings.length - 2))].radius;
          const r2 = rings[rings.length - 1].radius;
          const baseAngle = Math.random() * Math.PI * 2;
          const steps = 7;
          const mainTrunk = [];
          const forks = [];

          for (let s = 0; s < steps; s++) {
            const rad = r1 + (r2 - r1) * (s / (steps - 1));
            const angleJitter = baseAngle + (Math.random() - 0.5) * 0.35;
            const px = cx + Math.cos(angleJitter) * rad;
            const py = cy + Math.sin(angleJitter) * rad;
            mainTrunk.push({ x: px, y: py });

            // Branching fork
            if (s > 1 && s < steps - 1 && Math.random() > 0.5) {
              const fAngle = angleJitter + (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4);
              const fRad = rad + (isMobile ? 15 : 28);
              forks.push({
                x1: px,
                y1: py,
                x2: cx + Math.cos(fAngle) * fRad,
                y2: cy + Math.sin(fAngle) * fRad
              });
            }
          }

          if (!state.sparks) state.sparks = [];
          state.sparks.push({ mainTrunk, forks, life: 1.0 });
        }

        // Render Lightning Bolts
        if (state.sparks && state.sparks.length > 0) {
          state.sparks.forEach((bolt, idx) => {
            bolt.life -= 0.14;
            if (bolt.life <= 0) {
              state.sparks.splice(idx, 1);
              return;
            }

            // Glow envelope
            ctx.beginPath();
            bolt.mainTrunk.forEach((pt, pIdx) => {
              if (pIdx === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = `rgba(16, 185, 129, ${bolt.life * 0.5})`;
            ctx.lineWidth = 4.0;
            ctx.stroke();

            // Core discharge
            ctx.beginPath();
            bolt.mainTrunk.forEach((pt, pIdx) => {
              if (pIdx === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.life})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();

            // Forks
            bolt.forks.forEach((f) => {
              ctx.beginPath();
              ctx.moveTo(f.x1, f.y1);
              ctx.lineTo(f.x2, f.y2);
              ctx.strokeStyle = `rgba(52, 211, 153, ${bolt.life * 0.8})`;
              ctx.lineWidth = 1.2;
              ctx.stroke();
            });
          });
        }

        // D. Floating Bio-Matrix Spark Dust
        if (floatingBits) {
          floatingBits.forEach((bit) => {
            bit.y += bit.vy;
            bit.x += bit.vx;
            if (bit.y < 0) {
              bit.y = height + 10;
              bit.x = Math.random() * width;
            }
            const pulse = 0.35 + Math.sin(frame * bit.speed + bit.phase) * 0.45;
            ctx.fillStyle = '#34d399';
            ctx.globalAlpha = Math.max(0, pulse);
            ctx.beginPath();
            ctx.arc(bit.x, bit.y, bit.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }

        ctx.restore();
      } else if (activeTheme === 'cobalt-quantum') {
        // 4. Cobalt Quantum Wave (3D Warped Spacetime Topological Mesh & Singularity Vortex)
        ctx.save();
        const centerX = width * 0.5 + (mouseX - width * 0.5) * 0.18;
        const centerY = height * 0.5 + (mouseY - height * 0.5) * 0.18;

        const { spacing, cols, rows, stars, beams } = state;
        const waveSpeed = frame * 0.038;

        // A. Radiant Gravitational Lensing Beams
        if (beams) {
          beams.forEach((beam) => {
            beam.angle += beam.rotSpeed;
            const p = 0.4 + Math.sin(frame * 0.025 + beam.phase) * 0.35;
            const bGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, beam.length);
            bGrad.addColorStop(0, `rgba(6, 182, 212, ${0.15 * p})`);
            bGrad.addColorStop(0.5, `rgba(59, 130, 246, ${0.08 * p})`);
            bGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');

            ctx.fillStyle = bGrad;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, beam.length, beam.angle - 0.2, beam.angle + 0.2);
            ctx.closePath();
            ctx.fill();
          });
        }

        // B. 3D Warped Spacetime Topological Mesh
        // Horizontal Curvature Lines
        for (let r = 0; r < rows; r++) {
          ctx.beginPath();
          for (let c = 0; c < cols; c++) {
            const bx = c * spacing;
            const by = r * spacing;
            const dist = Math.hypot(bx - centerX, by - centerY);
            const wave = Math.sin(dist * 0.022 - waveSpeed) * 11 * (1 / (1 + dist * 0.0016));
            const pull = 26 / (1 + dist * 0.007);
            const angleToCenter = Math.atan2(by - centerY, bx - centerX);

            const wx = bx + Math.cos(angleToCenter) * (-pull + wave);
            const wy = by + Math.sin(angleToCenter) * (-pull + wave);

            if (c === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          const rowNorm = Math.abs(r - rows * 0.5) / (rows * 0.5);
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.14 - rowNorm * 0.06})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }

        // Vertical Curvature Lines
        for (let c = 0; c < cols; c++) {
          ctx.beginPath();
          for (let r = 0; r < rows; r++) {
            const bx = c * spacing;
            const by = r * spacing;
            const dist = Math.hypot(bx - centerX, by - centerY);
            const wave = Math.sin(dist * 0.022 - waveSpeed) * 11 * (1 / (1 + dist * 0.0016));
            const pull = 26 / (1 + dist * 0.007);
            const angleToCenter = Math.atan2(by - centerY, bx - centerX);

            const wx = bx + Math.cos(angleToCenter) * (-pull + wave);
            const wy = by + Math.sin(angleToCenter) * (-pull + wave);

            if (r === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          const colNorm = Math.abs(c - cols * 0.5) / (cols * 0.5);
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.14 - colNorm * 0.06})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }

        // C. Orbiting Quantum Stars in 3D Elliptical Planes
        if (stars) {
          stars.forEach((st) => {
            st.angle += st.angularSpeed;
            const tilt = st.orbitPlane === 0 ? 0.45 : (st.orbitPlane === 1 ? 0.75 : 0.3);
            const rotTilt = st.orbitPlane === 0 ? 0.4 : (st.orbitPlane === 1 ? -0.5 : 1.1);

            const unrotX = Math.cos(st.angle) * st.radius;
            const unrotY = Math.sin(st.angle) * (st.radius * tilt);
            const sx = centerX + unrotX * Math.cos(rotTilt) - unrotY * Math.sin(rotTilt);
            const sy = centerY + unrotX * Math.sin(rotTilt) + unrotY * Math.cos(rotTilt);

            const pulse = 0.4 + Math.sin(frame * 0.03 + st.pulsePhase) * 0.4;

            // Halo
            ctx.beginPath();
            ctx.arc(sx, sy, st.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = st.color === '#06b6d4' ? 'rgba(6, 182, 212, 0.18)' : 'rgba(59, 130, 246, 0.18)';
            ctx.fill();

            // Quantum Nucleus
            ctx.fillStyle = st.color;
            ctx.globalAlpha = Math.max(0, pulse);
            ctx.beginPath();
            ctx.arc(sx, sy, st.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }

        ctx.restore();
      } else if (activeTheme === 'golden-sunfire') {
        // 5. Golden Sunfire Monolith (Rotating Sacred Sun Mandala & Opposing Thermal Vortices)
        ctx.save();
        const cx = width * 0.5;
        const cy = height * 0.5;
        const { mandalaRays, mandalaMaxR, frostStream, solarStream } = state;

        // A. Central Sunfire Core Corona Glow
        const sunGrad = ctx.createRadialGradient(cx, cy, 15, cx, cy, mandalaMaxR * 1.6);
        const sunPulse = 0.7 + Math.sin(frame * 0.02) * 0.3;
        sunGrad.addColorStop(0, `rgba(234, 179, 8, ${0.25 * sunPulse})`);
        sunGrad.addColorStop(0.4, `rgba(245, 158, 11, ${0.12 * sunPulse})`);
        sunGrad.addColorStop(1, 'rgba(6, 6, 6, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, width, height);

        // B. Rotating Sacred Sun Monolith Mandala
        // Outer Sunburst Rays
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(frame * 0.0025);
        for (let i = 0; i < mandalaRays; i++) {
          const a = (i / mandalaRays) * Math.PI * 2;
          const rInner = mandalaMaxR * 0.75;
          const rOuter = mandalaMaxR * (1.0 + (i % 2 === 0 ? 0.28 : 0.12));
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * rInner, Math.sin(a) * rInner);
          ctx.lineTo(Math.cos(a) * rOuter, Math.sin(a) * rOuter);
          ctx.strokeStyle = i % 2 === 0 ? '#eab308' : '#f59e0b';
          ctx.globalAlpha = 0.35 + Math.sin(frame * 0.03 + i) * 0.2;
          ctx.lineWidth = i % 2 === 0 ? 2.2 : 1.2;
          ctx.stroke();

          // Diamond ray tips
          if (i % 2 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(Math.cos(a) * rOuter, Math.sin(a) * rOuter, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        // Intermediate Sacred Inscribed Ring (Counter-rotating)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-frame * 0.0035);
        ctx.beginPath();
        ctx.arc(0, 0, mandalaMaxR * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = '#eab308';
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([12, 10, 4, 10]);
        ctx.stroke();

        // Inscribed triangular mandala glyphs
        const glyphs = 8;
        for (let g = 0; g < glyphs; g++) {
          const ga = (g / glyphs) * Math.PI * 2;
          const gx = Math.cos(ga) * (mandalaMaxR * 0.65);
          const gy = Math.sin(ga) * (mandalaMaxR * 0.65);
          ctx.beginPath();
          ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fef08a';
          ctx.globalAlpha = 0.6;
          ctx.fill();
        }
        ctx.restore();

        // C. Stream A: Descending Crystalline Gold-Frost Needles (Top -> Down)
        if (frostStream) {
          frostStream.forEach((f) => {
            f.y += f.vy;
            f.x += f.vx;
            if (f.y > height) {
              f.y = -f.length;
              f.x = Math.random() * width;
            }
            ctx.beginPath();
            ctx.moveTo(f.x, f.y);
            ctx.lineTo(f.x, f.y + f.length);
            ctx.strokeStyle = f.color;
            ctx.globalAlpha = f.alpha;
            ctx.lineWidth = f.width;
            ctx.stroke();
          });
        }

        // D. Stream B: Ascending Solar Plasma Embers (Bottom -> Up)
        if (solarStream) {
          solarStream.forEach((s) => {
            s.y += s.vy;
            s.x += Math.sin(frame * s.swaySpeed + s.phase) * s.swayAmp;
            if (s.y < 0) {
              s.y = height + 10;
              s.x = Math.random() * width;
            }
            ctx.fillStyle = s.color;
            ctx.globalAlpha = s.alpha;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        ctx.restore();
      } else if (activeTheme === 'obsidian-void') {
        // 6. Obsidian Shadow Void (Freezing Circuit Crystal Growth)
        ctx.save();

        // Geometric crystal lattice branches
        if (state.paths) {
          state.paths.forEach((branch, bIdx) => {
            const pulse = 0.35 + Math.sin(frame * 0.02 + bIdx) * 0.25;
            ctx.strokeStyle = '#475569';
            ctx.globalAlpha = pulse * 0.45;
            ctx.lineWidth = 1.1;

            ctx.beginPath();
            branch.forEach((seg) => {
              ctx.moveTo(seg.x1, seg.y1);
              ctx.lineTo(seg.x2, seg.y2);
            });
            ctx.stroke();

            // Highlight nodes at joints
            branch.forEach((seg) => {
              if (seg.node) {
                ctx.fillStyle = '#94a3b8';
                ctx.globalAlpha = pulse * 0.8;
                ctx.beginPath();
                ctx.arc(seg.x2, seg.y2, 1.8, 0, Math.PI * 2);
                ctx.fill();
              }
            });
          });
        }

        // Spark highlights
        if (state.nodes) {
          state.nodes.forEach((n) => {
            const p = 0.2 + Math.sin(frame * n.speed + n.phase) * 0.35;
            ctx.fillStyle = n.color;
            ctx.globalAlpha = Math.max(0, p);
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        ctx.restore();
      } else if (activeTheme === 'cyberpunk-synthwave') {
        // 7. Cyberpunk Synthwave Neon (Slow-Gliding Neon Horizon Grid)
        ctx.save();
        const { horizonY, gridRungs, gridLines, stars } = state;
        const groundHeight = height - horizonY;

        // Sky stars
        if (stars) {
          stars.forEach((st) => {
            const p = 0.3 + Math.sin(frame * 0.03 + st.phase) * 0.4;
            ctx.fillStyle = st.color;
            ctx.globalAlpha = p;
            ctx.beginPath();
            ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // Horizon Neon Glow
        const horizGrad = ctx.createLinearGradient(0, horizonY - 120, 0, horizonY + 120);
        horizGrad.addColorStop(0, 'rgba(5, 5, 12, 0)');
        horizGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.16)');
        horizGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = horizGrad;
        ctx.fillRect(0, horizonY - 120, width, 240);

        // Perspective longitudinal lines
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
        ctx.lineWidth = 1.2;
        const vpX = width * 0.5 + (mouseX - width * 0.5) * 0.08;

        for (let l = 0; l <= gridLines; l++) {
          const bottomX = (l / gridLines) * (width * 1.8) - width * 0.4;
          ctx.beginPath();
          ctx.moveTo(vpX, horizonY);
          ctx.lineTo(bottomX, height);
          ctx.stroke();
        }

        // Gliding horizontal cross-rungs
        state.scrollOffset = (state.scrollOffset + 0.0035) % 1;
        for (let r = 0; r < gridRungs; r++) {
          const z = (r / gridRungs + state.scrollOffset) % 1;
          // Exponential / perspective depth mapping
          const y = horizonY + Math.pow(z, 2.2) * groundHeight;
          const alpha = Math.pow(z, 1.8) * 0.4;

          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.lineWidth = 1 + z * 1.2;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        ctx.restore();
      } else if (activeTheme === 'mystic-amethyst') {
        // 8. Mystic Amethyst Portal (Sacred Arcane Stargate & Swirling Logarithmic Vortex)
        ctx.save();
        const cx = width * 0.5;
        const cy = height * 0.5;
        const { portalRadius, ringCount, maxR, particles, leyNodes } = state;

        // A. Swirling Logarithmic Vortex Particles
        if (particles) {
          particles.forEach((p) => {
            p.dist += p.radialSpeed;
            p.spiralAngle += p.angularSpeed * (1 + 35 / Math.max(15, p.dist));
            if (p.dist < 12) {
              p.dist = maxR * (0.8 + Math.random() * 0.2);
            }

            const px = cx + Math.cos(p.spiralAngle) * p.dist;
            const py = cy + Math.sin(p.spiralAngle) * p.dist;
            const alpha = 0.25 + Math.sin(frame * 0.03 + p.phase) * 0.35;

            // Particle halo
            ctx.beginPath();
            ctx.arc(px, py, p.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = p.color === '#10b981' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(147, 51, 234, 0.15)';
            ctx.fill();

            // Particle nucleus
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }

        // B. Hypnotic Arcane Stargate Runic Rings
        for (let i = 0; i < ringCount; i++) {
          const progress = ((frame * 0.003 + i / ringCount) % 1);
          const r = progress * maxR;
          const alpha = Math.sin(progress * Math.PI) * 0.35;

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = '#9333ea';
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 1.4 + (1 - progress) * 1.6;
          ctx.stroke();
        }

        // Rotating Inscribed Runic Shield
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(frame * 0.004);

        // Octagram Star lines
        const octPoints = 8;
        ctx.beginPath();
        for (let o = 0; o <= octPoints; o++) {
          const oa = (o / octPoints) * Math.PI * 2;
          const or = (o % 2 === 0 ? portalRadius : portalRadius * 0.65);
          const ox = Math.cos(oa) * or;
          const oy = Math.sin(oa) * or;
          if (o === 0) ctx.moveTo(ox, oy);
          else ctx.lineTo(ox, oy);
        }
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        // C. Resonating Mystic Emerald Ley-Line Nodes & Laser Filaments
        if (leyNodes) {
          const computedNodes = [];
          leyNodes.forEach((node) => {
            node.baseAngle += node.speed;
            const lx = cx + Math.cos(node.baseAngle) * node.radius;
            const ly = cy + Math.sin(node.baseAngle) * node.radius;
            computedNodes.push({ x: lx, y: ly });
          });

          // Connect nodes with laser filaments
          ctx.beginPath();
          computedNodes.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.closePath();
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Render Emerald Crystals
          computedNodes.forEach((pt, idx) => {
            const p = 0.5 + Math.sin(frame * 0.035 + idx) * 0.45;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 6.0, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(16, 185, 129, ${0.25 * p})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.6, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
            ctx.globalAlpha = p;
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [activeTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ease-in-out"
      style={{
        width: '100vw',
        height: '100vh',
        opacity: 0.95
      }}
      aria-hidden="true"
    />
  );
}