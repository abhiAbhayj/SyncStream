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
        // 3. Emerald Matrix Biogrid (Full-Screen Cyber Matrix Digital Rain & Synapse Bus Highways)
        const colWidth = isMobile ? 32 : 44;
        const colCount = Math.ceil(width / colWidth);
        const matrixColumns = [];
        for (let c = 0; c < colCount; c++) {
          matrixColumns.push({
            x: c * colWidth + Math.random() * 8,
            y: Math.random() * height,
            speed: 1.2 + Math.random() * 2.8,
            length: Math.floor(8 + Math.random() * 14),
            headGlow: Math.random() > 0.4
          });
        }

        // Horizontal High-Speed Laser Bus Highways
        const busCount = isMobile ? 4 : 6;
        const busLines = [];
        for (let b = 0; b < busCount; b++) {
          busLines.push({
            y: (b + 0.6) * (height / busCount),
            speed: (b % 2 === 0 ? 1 : -1) * (2.5 + Math.random() * 3.5),
            packets: [
              { x: Math.random() * width, len: 45 + Math.random() * 70, color: '#00f5a0' },
              { x: Math.random() * width, len: 30 + Math.random() * 50, color: '#2dd4bf' }
            ]
          });
        }

        // Distributed Synaptic Circuit Nodes across full canvas
        const nodeCount = isMobile ? 18 : 32;
        const circuitNodes = [];
        for (let n = 0; n < nodeCount; n++) {
          circuitNodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            pulsePhase: Math.random() * Math.PI * 2
          });
        }

        state = { matrixColumns, busLines, circuitNodes, sparks: [], nextSparkTimer: 18 };
      } else if (theme === 'cobalt-quantum') {
        // 4. Cobalt Quantum Wave (Full-Screen 3D Spacetime Wave Mesh & Particle Entanglement Web)
        const gridSpacingX = isMobile ? 55 : 45;
        const gridSpacingY = isMobile ? 48 : 38;
        const cols = Math.ceil(width / gridSpacingX) + 2;
        const rows = Math.ceil(height / gridSpacingY) + 2;

        // Full-screen quantum entanglement particles
        const particleCount = isMobile ? 24 : 45;
        const quantumParticles = [];
        for (let p = 0; p < particleCount; p++) {
          quantumParticles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            size: Math.random() * 2.4 + 1.2,
            color: p % 3 === 0 ? '#f8fafc' : (p % 2 === 0 ? '#3b82f6' : '#06b6d4'),
            phase: Math.random() * Math.PI * 2
          });
        }

        state = { gridSpacingX, gridSpacingY, cols, rows, quantumParticles };
      } else if (theme === 'golden-sunfire') {
        // 5. Golden Sunfire Monolith (Flanking Monolith Conduits & Sweeping Solar Prominence Curtains)
        // Stream A: Descending crystalline gold-frost needles (top -> down)
        const frostCount = isMobile ? 25 : 50;
        const frostStream = [];
        for (let f = 0; f < frostCount; f++) {
          frostStream.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: 0.45 + Math.random() * 0.85,
            vx: (Math.random() - 0.5) * 0.25,
            length: (isMobile ? 22 : 38) + Math.random() * 28,
            width: Math.random() * 2.0 + 0.8,
            alpha: 0.15 + Math.random() * 0.25,
            color: f % 3 === 0 ? '#ffffff' : (f % 2 === 0 ? '#fef08a' : '#eab308')
          });
        }

        // Stream B: Ascending incandescent solar plasma embers (bottom -> up)
        const emberCount = isMobile ? 25 : 55;
        const solarStream = [];
        for (let e = 0; e < emberCount; e++) {
          solarStream.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: -(0.55 + Math.random() * 1.15),
            vx: (Math.random() - 0.5) * 0.35,
            size: Math.random() * 2.8 + 1.0,
            swayAmp: 1.5 + Math.random() * 3.0,
            swaySpeed: 0.02 + Math.random() * 0.03,
            phase: Math.random() * Math.PI * 2,
            alpha: 0.2 + Math.random() * 0.35,
            color: e % 3 === 0 ? '#f59e0b' : (e % 2 === 0 ? '#eab308' : '#ffffff')
          });
        }

        // Sweeping Horizontal Solar Prominence Ribbon Curtains
        const curtainCount = isMobile ? 3 : 5;
        const curtains = [];
        for (let c = 0; c < curtainCount; c++) {
          curtains.push({
            baseY: (c + 0.5) * (height / curtainCount),
            amp: (isMobile ? 20 : 38) + Math.random() * 20,
            freq: 0.003 + Math.random() * 0.002,
            speed: 0.02 + Math.random() * 0.015,
            phase: Math.random() * Math.PI * 2,
            color: c % 2 === 0 ? 'rgba(234, 179, 8, ' : 'rgba(245, 158, 11, '
          });
        }

        state = { frostStream, solarStream, curtains };
      } else if (theme === 'obsidian-void') {
        // 6. Obsidian Shadow Void (Full-Canvas 3D Tumbling Dark-Matter Shards & Corner-to-Corner Crystal Lattice)
        const shardCount = isMobile ? 15 : 26;
        const shards = [];
        for (let s = 0; s < shardCount; s++) {
          const baseRadius = (isMobile ? 18 : 28) + Math.random() * (isMobile ? 24 : 38);
          shards.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: 0.15 + Math.random() * 0.3,
            rotX: Math.random() * Math.PI * 2,
            rotY: Math.random() * Math.PI * 2,
            rotZ: Math.random() * Math.PI * 2,
            vRotX: (Math.random() - 0.5) * 0.015,
            vRotY: (Math.random() - 0.5) * 0.018,
            vRotZ: (Math.random() - 0.5) * 0.012,
            sides: Math.floor(Math.random() * 3) + 3,
            baseRadius,
            alpha: 0.15 + Math.random() * 0.22
          });
        }

        // Corner-to-corner dendritic stealth circuit paths
        const cornerRoots = [
          { x: 0, y: 0, dirX: 1, dirY: 1 },
          { x: width, y: 0, dirX: -1, dirY: 1 },
          { x: 0, y: height, dirX: 1, dirY: -1 },
          { x: width, y: height, dirX: -1, dirY: -1 },
          { x: width * 0.5, y: 0, dirX: 0, dirY: 1 },
          { x: width * 0.5, y: height, dirX: 0, dirY: -1 }
        ];

        const circuitPaths = [];
        cornerRoots.forEach((root) => {
          let cx = root.x;
          let cy = root.y;
          const segments = [];
          const depth = isMobile ? 5 : 8;
          for (let d = 0; d < depth; d++) {
            const stepLen = (isMobile ? 26 : 44) + Math.random() * 28;
            const mode = Math.floor(Math.random() * 3);
            let nx = cx;
            let ny = cy;
            if (mode === 0) nx = cx + root.dirX * stepLen;
            else if (mode === 1) ny = cy + root.dirY * stepLen;
            else {
              nx = cx + root.dirX * stepLen * 0.707;
              ny = cy + root.dirY * stepLen * 0.707;
            }
            segments.push({ x1: cx, y1: cy, x2: nx, y2: ny, node: Math.random() > 0.45 });
            cx = nx;
            cy = ny;
          }
          circuitPaths.push(segments);
        });

        // Atmospheric Dark-Matter Veil Fog Bands
        const veilCount = isMobile ? 3 : 5;
        const veils = [];
        for (let v = 0; v < veilCount; v++) {
          veils.push({
            y: (v + 0.5) * (height / veilCount),
            amp: 30 + Math.random() * 25,
            speed: (v % 2 === 0 ? 1 : -1) * 0.015,
            phase: Math.random() * Math.PI * 2
          });
        }

        // Drifting Platinum and Phantom-Violet Micro-Sparks
        const sparkCount = isMobile ? 25 : 55;
        const microSparks = [];
        for (let sp = 0; sp < sparkCount; sp++) {
          microSparks.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2.2 + 0.8,
            speed: 0.02 + Math.random() * 0.03,
            phase: Math.random() * Math.PI * 2,
            color: sp % 3 === 0 ? '#f8fafc' : (sp % 2 === 0 ? '#818cf8' : '#cbd5e1')
          });
        }

        state = { shards, circuitPaths, veils, microSparks };
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
        // 8. Mystic Amethyst Portal (Full-Screen Cosmic Nebula Filament Web & Sinuous Arcane Ley Currents)
        // Sinuous Diagonal Cosmic Energy Currents across the full canvas
        const streamCount = isMobile ? 3 : 5;
        const cosmicStreams = [];
        for (let s = 0; s < streamCount; s++) {
          cosmicStreams.push({
            startX: (s / streamCount) * width,
            startY: 0,
            endX: width - (s / streamCount) * width,
            endY: height,
            amp: (isMobile ? 30 : 60) + Math.random() * 30,
            speed: 0.02 + Math.random() * 0.015,
            phase: Math.random() * Math.PI * 2,
            color: s % 2 === 0 ? 'rgba(147, 51, 234, ' : 'rgba(16, 185, 129, '
          });
        }

        // Floating Arcane Constellation Rune Nodes distributed across entire viewport
        const nodeCount = isMobile ? 24 : 42;
        const constellationNodes = [];
        for (let n = 0; n < nodeCount; n++) {
          constellationNodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            size: Math.random() * 2.8 + 1.2,
            color: n % 4 === 0 ? '#10b981' : (n % 2 === 0 ? '#9333ea' : '#c084fc'),
            phase: Math.random() * Math.PI * 2
          });
        }

        // Drifting Cosmic Stardust
        const dustCount = isMobile ? 30 : 60;
        const stardust = [];
        for (let d = 0; d < dustCount; d++) {
          stardust.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0.2 + Math.random() * 0.5,
            vy: 0.2 + Math.random() * 0.5,
            size: Math.random() * 2.0 + 0.6,
            color: d % 3 === 0 ? '#10b981' : (d % 2 === 0 ? '#c084fc' : '#f8fafc'),
            phase: Math.random() * Math.PI * 2
          });
        }

        state = { cosmicStreams, constellationNodes, stardust };
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
        // 3. Emerald Matrix Biogrid (Full-Screen Cyber Matrix Digital Rain & Synapse Bus Highways)
        ctx.save();
        const { matrixColumns, busLines, circuitNodes } = state;

        // A. Full-Screen Cascading Cyber Matrix Bio-Data Rain
        if (matrixColumns) {
          matrixColumns.forEach((col) => {
            col.y += col.speed;
            if (col.y > height + col.length * 16) {
              col.y = -col.length * 16;
              col.speed = 1.2 + Math.random() * 2.8;
            }

            for (let i = 0; i < col.length; i++) {
              const charY = col.y - i * 16;
              if (charY >= 0 && charY <= height) {
                const alpha = Math.max(0, 1 - i / col.length);
                if (i === 0 && col.headGlow) {
                  ctx.fillStyle = '#ffffff';
                  ctx.globalAlpha = 0.9;
                  ctx.fillRect(col.x - 1, charY - 1, 3, 3);
                } else {
                  ctx.fillStyle = i < 3 ? '#00f5a0' : '#10b981';
                  ctx.globalAlpha = alpha * 0.45;
                  ctx.fillRect(col.x, charY, 2, 8);
                }
              }
            }
          });
          ctx.globalAlpha = 1.0;
        }

        // B. Horizontal High-Speed Laser Bus Highways
        if (busLines) {
          busLines.forEach((bus) => {
            ctx.beginPath();
            ctx.moveTo(0, bus.y);
            ctx.lineTo(width, bus.y);
            ctx.strokeStyle = 'rgba(0, 245, 160, 0.08)';
            ctx.lineWidth = 1.0;
            ctx.stroke();

            bus.packets.forEach((pkt) => {
              pkt.x += bus.speed;
              if (bus.speed > 0 && pkt.x > width + pkt.len) {
                pkt.x = -pkt.len;
              } else if (bus.speed < 0 && pkt.x < -pkt.len) {
                pkt.x = width + pkt.len;
              }

              const pGrad = ctx.createLinearGradient(
                bus.speed > 0 ? pkt.x : pkt.x + pkt.len,
                bus.y,
                bus.speed > 0 ? pkt.x + pkt.len : pkt.x,
                bus.y
              );
              pGrad.addColorStop(0, 'rgba(0, 245, 160, 0)');
              pGrad.addColorStop(0.7, pkt.color === '#00f5a0' ? 'rgba(0, 245, 160, 0.7)' : 'rgba(45, 212, 191, 0.7)');
              pGrad.addColorStop(1, '#ffffff');

              ctx.beginPath();
              ctx.moveTo(pkt.x, bus.y);
              ctx.lineTo(pkt.x + pkt.len, bus.y);
              ctx.strokeStyle = pGrad;
              ctx.lineWidth = 2.2;
              ctx.stroke();
            });
          });
        }

        // C. Distributed Synaptic Nodes across full canvas
        if (circuitNodes) {
          circuitNodes.forEach((node) => {
            node.x += node.vx;
            node.y += node.vy;
            if (node.x < 0) node.x = width;
            if (node.x > width) node.x = 0;
            if (node.y < 0) node.y = height;
            if (node.y > height) node.y = 0;

            const pulse = 0.4 + Math.sin(frame * 0.03 + node.pulsePhase) * 0.4;

            ctx.beginPath();
            ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#00f5a0';
            ctx.globalAlpha = pulse;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(node.x, node.y, 6.0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 245, 160, 0.2)';
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }

        // D. Spontaneous Tesla Discharges between nearby nodes
        state.nextSparkTimer--;
        if (state.nextSparkTimer <= 0 && circuitNodes && circuitNodes.length > 2) {
          state.nextSparkTimer = Math.floor(16 + Math.random() * 22);
          const i1 = Math.floor(Math.random() * circuitNodes.length);
          const n1 = circuitNodes[i1];

          let closestDist = 280;
          let targetNode = null;
          circuitNodes.forEach((n2, i2) => {
            if (i1 !== i2) {
              const d = Math.hypot(n1.x - n2.x, n1.y - n2.y);
              if (d < closestDist) {
                closestDist = d;
                targetNode = n2;
              }
            }
          });

          if (targetNode) {
            const steps = 6;
            const segments = [];
            for (let s = 0; s < steps; s++) {
              const frac = s / (steps - 1);
              const jx = (Math.random() - 0.5) * 18;
              const jy = (Math.random() - 0.5) * 18;
              segments.push({
                x: n1.x + (targetNode.x - n1.x) * frac + jx,
                y: n1.y + (targetNode.y - n1.y) * frac + jy
              });
            }
            if (!state.sparks) state.sparks = [];
            state.sparks.push({ segments, life: 1.0 });
          }
        }

        if (state.sparks) {
          state.sparks.forEach((sp, idx) => {
            sp.life -= 0.14;
            if (sp.life <= 0) {
              state.sparks.splice(idx, 1);
              return;
            }
            ctx.beginPath();
            sp.segments.forEach((pt, pIdx) => {
              if (pIdx === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = `rgba(0, 245, 160, ${sp.life * 0.5})`;
            ctx.lineWidth = 3.5;
            ctx.stroke();

            ctx.strokeStyle = `rgba(255, 255, 255, ${sp.life * 0.95})`;
            ctx.lineWidth = 1.4;
            ctx.stroke();
          });
        }

        ctx.restore();
      } else if (activeTheme === 'cobalt-quantum') {
        // 4. Cobalt Quantum Wave (Full-Screen 3D Spacetime Wave Mesh & Particle Entanglement Web)
        ctx.save();
        const { gridSpacingX, gridSpacingY, cols, rows, quantumParticles } = state;
        const waveSpeed = frame * 0.028;

        // A. Full-Screen 3D Spacetime Topological Wave Mesh
        ctx.lineWidth = 1.1;

        // Horizontal curvature wave lines
        for (let r = 0; r < rows; r++) {
          ctx.beginPath();
          const by = r * gridSpacingY;
          for (let c = 0; c < cols; c++) {
            const bx = c * gridSpacingX;
            const wave = Math.sin(bx * 0.008 + by * 0.006 - waveSpeed) * 14 +
                         Math.cos(bx * 0.012 - by * 0.008 + waveSpeed * 0.7) * 8;
            const py = by + wave;

            if (c === 0) ctx.moveTo(bx, py);
            else ctx.lineTo(bx, py);
          }
          const rowProgress = r / rows;
          ctx.strokeStyle = `rgba(59, 130, 246, ${0.06 + Math.sin(rowProgress * Math.PI) * 0.12})`;
          ctx.stroke();
        }

        // Vertical curvature wave lines
        for (let c = 0; c < cols; c++) {
          ctx.beginPath();
          const bx = c * gridSpacingX;
          for (let r = 0; r < rows; r++) {
            const by = r * gridSpacingY;
            const wave = Math.sin(bx * 0.008 + by * 0.006 - waveSpeed) * 14 +
                         Math.cos(bx * 0.012 - by * 0.008 + waveSpeed * 0.7) * 8;
            const px = bx + Math.sin(by * 0.01 + waveSpeed) * 6;

            if (r === 0) ctx.moveTo(px, by + wave);
            else ctx.lineTo(px, by + wave);
          }
          const colProgress = c / cols;
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.05 + Math.sin(colProgress * Math.PI) * 0.10})`;
          ctx.stroke();
        }

        // B. Full-Screen Quantum Particles & Proximity Entanglement Lines
        if (quantumParticles) {
          quantumParticles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
          });

          const maxEntangleDist = isMobile ? 120 : 160;
          for (let i = 0; i < quantumParticles.length; i++) {
            const p1 = quantumParticles[i];
            for (let j = i + 1; j < quantumParticles.length; j++) {
              const p2 = quantumParticles[j];
              const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
              if (dist < maxEntangleDist) {
                const alpha = (1 - dist / maxEntangleDist) * 0.45;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
                ctx.lineWidth = 1.0;
                ctx.stroke();
              }
            }
          }

          // Render Particle Nodes
          quantumParticles.forEach((p) => {
            const pulse = 0.4 + Math.sin(frame * 0.03 + p.phase) * 0.4;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = p.color === '#06b6d4' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(59, 130, 246, 0.2)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, pulse);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }

        ctx.restore();
      } else if (activeTheme === 'golden-sunfire') {
        // 5. Golden Sunfire Monolith (Flanking Monolith Conduits, Solar Prominence Curtains & Opposing Thermal Streams)
        ctx.save();
        const { frostStream, solarStream, curtains } = state;
        const pillarW = isMobile ? 32 : 55;

        // A. Flanking Monolith Energy Conduits (Left & Right Viewport Edges)
        // Left Column Conduit
        const leftGrad = ctx.createLinearGradient(0, 0, pillarW, 0);
        leftGrad.addColorStop(0, 'rgba(234, 179, 8, 0.18)');
        leftGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.08)');
        leftGrad.addColorStop(1, 'rgba(6, 6, 6, 0)');
        ctx.fillStyle = leftGrad;
        ctx.fillRect(0, 0, pillarW * 1.5, height);

        // Right Column Conduit
        const rightGrad = ctx.createLinearGradient(width, 0, width - pillarW, 0);
        rightGrad.addColorStop(0, 'rgba(234, 179, 8, 0.18)');
        rightGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.08)');
        rightGrad.addColorStop(1, 'rgba(6, 6, 6, 0)');
        ctx.fillStyle = rightGrad;
        ctx.fillRect(width - pillarW * 1.5, 0, pillarW * 1.5, height);

        // Monolith Vertical Edge Bus Rails
        const railPulse = 0.5 + Math.sin(frame * 0.03) * 0.3;
        ctx.strokeStyle = `rgba(234, 179, 8, ${0.4 * railPulse})`;
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        ctx.moveTo(pillarW * 0.6, 0);
        ctx.lineTo(pillarW * 0.6, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(width - pillarW * 0.6, 0);
        ctx.lineTo(width - pillarW * 0.6, height);
        ctx.stroke();

        // Pulsing tick marks down the side monoliths
        const ticks = isMobile ? 12 : 24;
        for (let t = 0; t < ticks; t++) {
          const ty = (t / ticks) * height;
          const tp = Math.sin(frame * 0.04 + t * 0.4);
          if (tp > 0.2) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(pillarW * 0.6 - 2, ty, 4, 10);
            ctx.fillRect(width - pillarW * 0.6 - 2, ty, 4, 10);
          }
        }

        // B. Sweeping Horizontal Solar Prominence Ribbon Curtains
        if (curtains) {
          curtains.forEach((curt, cIdx) => {
            ctx.beginPath();
            const step = isMobile ? 35 : 20;
            for (let x = 0; x <= width + step; x += step) {
              const yOffset = Math.sin(x * curt.freq + frame * curt.speed + curt.phase) * curt.amp +
                              Math.cos(x * curt.freq * 1.8 - frame * curt.speed * 0.7) * (curt.amp * 0.4);
              const y = curt.baseY + yOffset;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            const pulse = 0.25 + Math.sin(frame * 0.02 + cIdx) * 0.15;
            ctx.strokeStyle = `${curt.color}${pulse})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          });
        }

        // C. Stream A: Descending Crystalline Gold-Frost Needles (Top -> Down across full width)
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

        // D. Stream B: Ascending Solar Plasma Embers (Bottom -> Up across full width)
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
        // 6. Obsidian Shadow Void (Full-Canvas 3D Tumbling Dark-Matter Shards & Corner-to-Corner Crystal Lattice)
        ctx.save();
        const { shards, circuitPaths, veils, microSparks } = state;

        // A. Atmospheric Dark-Matter Veil Fog Bands
        if (veils) {
          veils.forEach((v, vIdx) => {
            ctx.beginPath();
            const step = isMobile ? 40 : 25;
            for (let x = 0; x <= width + step; x += step) {
              const yOffset = Math.sin(x * 0.003 + frame * v.speed + v.phase) * v.amp;
              const y = v.y + yOffset;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            const pulse = 0.12 + Math.sin(frame * 0.02 + vIdx) * 0.08;
            ctx.strokeStyle = `rgba(129, 140, 248, ${pulse})`;
            ctx.lineWidth = isMobile ? 12 : 24;
            ctx.stroke();
          });
        }

        // B. Corner-to-Corner Dendritic Stealth Circuit Lattice
        if (circuitPaths) {
          circuitPaths.forEach((branch, bIdx) => {
            const p = 0.35 + Math.sin(frame * 0.025 + bIdx) * 0.25;
            ctx.strokeStyle = `rgba(129, 140, 248, ${p * 0.4})`;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            branch.forEach((seg) => {
              ctx.moveTo(seg.x1, seg.y1);
              ctx.lineTo(seg.x2, seg.y2);
            });
            ctx.stroke();

            // Circuit Node Junctions
            branch.forEach((seg) => {
              if (seg.node) {
                ctx.fillStyle = '#cbd5e1';
                ctx.beginPath();
                ctx.arc(seg.x2, seg.y2, 1.8, 0, Math.PI * 2);
                ctx.fill();

                if (Math.sin(frame * 0.05 + seg.x2) > 0.8) {
                  ctx.fillStyle = '#818cf8';
                  ctx.beginPath();
                  ctx.arc(seg.x2, seg.y2, 3.2, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
            });
          });
        }

        // C. Full-Canvas 3D Tumbling Geometric Dark-Matter Polygon Shards
        if (shards) {
          shards.forEach((s) => {
            s.x += s.vx;
            s.y += s.vy;
            s.rotX += s.vRotX;
            s.rotY += s.vRotY;
            s.rotZ += s.vRotZ;

            if (s.x < -80) s.x = width + 80;
            if (s.x > width + 80) s.x = -80;
            if (s.y < -80) s.y = height + 80;
            if (s.y > height + 80) s.y = -80;

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotZ);

            ctx.beginPath();
            const cosX = Math.cos(s.rotX);
            const sinY = Math.sin(s.rotY);
            for (let side = 0; side < s.sides; side++) {
              const a = (side / s.sides) * Math.PI * 2;
              const px = Math.cos(a) * s.baseRadius * (0.65 + sinY * 0.35);
              const py = Math.sin(a) * s.baseRadius * (0.65 + cosX * 0.35);
              if (side === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Dark-matter semi-translucent fill
            ctx.fillStyle = `rgba(12, 12, 18, ${s.alpha})`;
            ctx.fill();

            // Platinum-chrome and phantom-violet edges
            ctx.strokeStyle = `rgba(203, 213, 225, ${s.alpha * 1.8})`;
            ctx.lineWidth = 1.3;
            ctx.stroke();

            // Vertex specular glint
            const glintA = 0;
            const gx = Math.cos(glintA) * s.baseRadius * (0.65 + sinY * 0.35);
            const gy = Math.sin(glintA) * s.baseRadius * (0.65 + cosX * 0.35);
            ctx.beginPath();
            ctx.arc(gx, gy, 2.0, 0, Math.PI * 2);
            ctx.fillStyle = '#818cf8';
            ctx.fill();

            ctx.restore();
          });
        }

        // D. Drifting Platinum and Phantom-Violet Micro-Sparks
        if (microSparks) {
          microSparks.forEach((sp) => {
            const p = 0.25 + Math.sin(frame * sp.speed + sp.phase) * 0.35;
            ctx.fillStyle = sp.color;
            ctx.globalAlpha = Math.max(0, p);
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
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
        // 8. Mystic Amethyst Portal (Full-Screen Sinuous Cosmic Currents & Constellation Network)
        ctx.save();
        const { cosmicStreams, constellationNodes, stardust } = state;

        // A. Full-Canvas Sinuous Cosmic Nebula Currents (Corner-to-Corner S-Curves)
        if (cosmicStreams) {
          cosmicStreams.forEach((stream, sIdx) => {
            ctx.beginPath();
            const steps = isMobile ? 24 : 45;
            for (let i = 0; i <= steps; i++) {
              const t = i / steps;
              // Diagonal base line interpolated from start to end
              const bx = stream.startX + (stream.endX - stream.startX) * t;
              const by = stream.startY + (stream.endY - stream.startY) * t;

              // Harmonic S-wave perpendicular displacement
              const perpDist = Math.sin(t * Math.PI * 2 + frame * stream.speed + stream.phase) * stream.amp +
                               Math.cos(t * Math.PI * 4 - frame * stream.speed * 0.6) * (stream.amp * 0.35);
              const px = bx + perpDist * 0.6;
              const py = by + perpDist;

              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            const pulse = 0.25 + Math.sin(frame * 0.02 + sIdx) * 0.15;
            ctx.strokeStyle = `${stream.color}${pulse})`;
            ctx.lineWidth = isMobile ? 2.0 : 3.0;
            ctx.stroke();
          });
        }

        // B. Floating Arcane Constellation Rune Network & Proximity Laser Filaments
        if (constellationNodes) {
          constellationNodes.forEach((n) => {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0) n.x = width;
            if (n.x > width) n.x = 0;
            if (n.y < 0) n.y = height;
            if (n.y > height) n.y = 0;
          });

          // Proximity laser filaments between rune nodes
          const maxFilamentDist = isMobile ? 120 : 170;
          for (let i = 0; i < constellationNodes.length; i++) {
            const n1 = constellationNodes[i];
            for (let j = i + 1; j < constellationNodes.length; j++) {
              const n2 = constellationNodes[j];
              const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
              if (dist < maxFilamentDist) {
                const alpha = (1 - dist / maxFilamentDist) * 0.38;
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.strokeStyle = n1.color === '#10b981' || n2.color === '#10b981'
                  ? `rgba(16, 185, 129, ${alpha})`
                  : `rgba(192, 132, 252, ${alpha})`;
                ctx.lineWidth = 1.0;
                ctx.stroke();
              }
            }
          }

          // Faceted Arcane Rune Diamonds
          constellationNodes.forEach((n) => {
            const pulse = 0.4 + Math.sin(frame * 0.03 + n.phase) * 0.4;
            ctx.save();
            ctx.translate(n.x, n.y);
            ctx.rotate(frame * 0.015 + n.phase);

            // Outer soft glow aura
            ctx.beginPath();
            ctx.arc(0, 0, n.size * 2.4, 0, Math.PI * 2);
            ctx.fillStyle = n.color === '#10b981' ? 'rgba(16, 185, 129, 0.16)' : 'rgba(147, 51, 234, 0.16)';
            ctx.fill();

            // Diamond rune facet
            ctx.beginPath();
            ctx.moveTo(0, -n.size * 1.2);
            ctx.lineTo(n.size * 0.8, 0);
            ctx.lineTo(0, n.size * 1.2);
            ctx.lineTo(-n.size * 0.8, 0);
            ctx.closePath();
            ctx.fillStyle = n.color;
            ctx.globalAlpha = Math.max(0, pulse);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.8;
            ctx.stroke();

            ctx.restore();
          });
        }

        // C. Drifting Cosmic Stardust
        if (stardust) {
          stardust.forEach((d) => {
            d.x += d.vx;
            d.y += d.vy;
            if (d.x > width) d.x = 0;
            if (d.y > height) d.y = 0;

            const p = 0.25 + Math.sin(frame * 0.03 + d.phase) * 0.35;
            ctx.fillStyle = d.color;
            ctx.globalAlpha = Math.max(0, p);
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
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