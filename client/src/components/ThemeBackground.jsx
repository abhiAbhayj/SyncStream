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
        // 3. Emerald Matrix Biogrid (3D Cyber DNA Double-Helix + Synaptic Hexagonal Matrix + Tesla Arcs)
        const helixRungs = isMobile ? 20 : 32;
        const helixRadius = isMobile ? 65 : 110;
        const packets = [];
        for (let p = 0; p < (isMobile ? 6 : 12); p++) {
          packets.push({
            rungIndex: Math.floor(Math.random() * helixRungs),
            t: Math.random(),
            speed: (Math.random() > 0.5 ? 1 : -1) * (0.012 + Math.random() * 0.02)
          });
        }

        // Hexagonal Synaptic Background Matrix
        const hexSize = isMobile ? 42 : 55;
        const hexCols = Math.ceil(width / (hexSize * 1.5)) + 2;
        const hexRows = Math.ceil(height / (hexSize * Math.sqrt(3))) + 2;

        // Floating Bio-Nanite Spores
        const sporeCount = isMobile ? 22 : 45;
        const spores = [];
        for (let s = 0; s < sporeCount; s++) {
          spores.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: -(0.3 + Math.random() * 0.7),
            vx: (Math.random() - 0.5) * 0.35,
            size: Math.random() * 2.4 + 1.0,
            phase: Math.random() * Math.PI * 2,
            speed: 0.025 + Math.random() * 0.035
          });
        }

        state = {
          helixRungs,
          helixRadius,
          packets,
          hexSize,
          hexCols,
          hexRows,
          spores,
          lightningArcs: [],
          nextArcTimer: 18
        };
      } else if (theme === 'cobalt-quantum') {
        // 4. Cobalt Quantum Wave (4D Rotating Quantum Tesseract + Lissajous Entanglement Orbitals)
        // 16 Vertices of a 4D Hypercube (±1, ±1, ±1, ±1)
        const vertices4D = [];
        for (let i = 0; i < 16; i++) {
          vertices4D.push({
            x: (i & 1 ? 1 : -1),
            y: (i & 2 ? 1 : -1),
            z: (i & 4 ? 1 : -1),
            w: (i & 8 ? 1 : -1)
          });
        }

        // 32 Edges connecting vertices that differ by exactly 1 bit
        const edges4D = [];
        for (let i = 0; i < 16; i++) {
          for (let j = i + 1; j < 16; j++) {
            const diff = i ^ j;
            if ((diff & (diff - 1)) === 0) {
              edges4D.push([i, j]);
            }
          }
        }

        const tesseractScale = Math.min(width, height) * (isMobile ? 0.24 : 0.28);

        // Quantum Entangled Paired Orbitals (Lissajous curves)
        const pairCount = isMobile ? 2 : 4;
        const entangledPairs = [];
        for (let p = 0; p < pairCount; p++) {
          entangledPairs.push({
            rX: Math.min(width, height) * (0.28 + p * 0.1),
            rY: Math.min(width, height) * (0.16 + p * 0.08),
            freqX: 1 + p * 0.5,
            freqY: 2 + p * 0.5,
            speed: 0.015 + p * 0.005,
            phase: (p / pairCount) * Math.PI * 2,
            color: p % 2 === 0 ? '#06b6d4' : '#3b82f6'
          });
        }

        // Background probability wave stars
        const starCount = isMobile ? 35 : 70;
        const stars = [];
        for (let s = 0; s < starCount; s++) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2.0 + 0.8,
            phase: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.03,
            color: s % 3 === 0 ? '#f8fafc' : (s % 2 === 0 ? '#3b82f6' : '#06b6d4')
          });
        }

        state = {
          vertices4D,
          edges4D,
          tesseractScale,
          entangledPairs,
          stars,
          angleXZ: 0,
          angleYW: 0
        };
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
        // 6. Obsidian Shadow Void (Stealth Quantum Eclipse & Dark-Matter Lattice)
        const eclipseRadius = Math.min(width, height) * (isMobile ? 0.16 : 0.14);

        // 3D Tumbling Geometric Dark-Matter Facets
        const facetCount = isMobile ? 12 : 20;
        const facets = [];
        for (let f = 0; f < facetCount; f++) {
          const size = (isMobile ? 18 : 28) + Math.random() * (isMobile ? 18 : 32);
          facets.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            rotX: Math.random() * Math.PI * 2,
            rotY: Math.random() * Math.PI * 2,
            rotZ: Math.random() * Math.PI * 2,
            vRotX: (Math.random() - 0.5) * 0.015,
            vRotY: (Math.random() - 0.5) * 0.018,
            vRotZ: (Math.random() - 0.5) * 0.012,
            size,
            sides: Math.floor(Math.random() * 3) + 3,
            alpha: 0.18 + Math.random() * 0.25
          });
        }

        // Stealth Circuit Lattice Traces
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
          const depth = isMobile ? 4 : 7;
          for (let d = 0; d < depth; d++) {
            const stepLen = (isMobile ? 24 : 40) + Math.random() * 25;
            const mode = Math.floor(Math.random() * 3);
            let nx = cx;
            let ny = cy;
            if (mode === 0) nx = cx + root.dirX * stepLen;
            else if (mode === 1) ny = cy + root.dirY * stepLen;
            else {
              nx = cx + root.dirX * stepLen * 0.707;
              ny = cy + root.dirY * stepLen * 0.707;
            }
            segments.push({ x1: cx, y1: cy, x2: nx, y2: ny, node: Math.random() > 0.4 });
            cx = nx;
            cy = ny;
          }
          circuitPaths.push(segments);
        });

        // Infall Dark-Matter Dust Particles
        const dustCount = isMobile ? 35 : 65;
        const infallDust = [];
        for (let d = 0; d < dustCount; d++) {
          const dist = 50 + Math.random() * (Math.max(width, height) * 0.55);
          infallDust.push({
            dist,
            angle: Math.random() * Math.PI * 2,
            angularSpeed: (0.006 + Math.random() * 0.012) * (d % 2 === 0 ? 1 : -1),
            radialSpeed: -(0.3 + Math.random() * 0.6),
            size: Math.random() * 2.0 + 0.8,
            color: d % 3 === 0 ? '#f8fafc' : (d % 2 === 0 ? '#818cf8' : '#cbd5e1'),
            phase: Math.random() * Math.PI * 2
          });
        }

        state = { eclipseRadius, facets, circuitPaths, infallDust };
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
        // 8. Mystic Amethyst Portal (Sacred Astrolabe & 3D Möbius Cosmic Nebula Ribbon)
        const portalRadius = Math.min(width, height) * (isMobile ? 0.38 : 0.32);

        // 3D Möbius Cosmic Nebula Ribbon Particles
        const mobiusCount = isMobile ? 45 : 90;
        const mobiusParticles = [];
        const ribbonR = portalRadius * 1.1;
        const ribbonWidth = portalRadius * 0.45;
        for (let m = 0; m < mobiusCount; m++) {
          mobiusParticles.push({
            uNorm: (Math.random() * 2 - 1),
            v: (m / mobiusCount) * Math.PI * 2,
            vSpeed: 0.008 + Math.random() * 0.008,
            size: Math.random() * 2.5 + 1.0,
            color: m % 4 === 0 ? '#10b981' : (m % 2 === 0 ? '#9333ea' : (m % 3 === 0 ? '#c084fc' : '#f8fafc')),
            phase: Math.random() * Math.PI * 2
          });
        }

        // Metatron's Cube 13 Sacred Geometry Circle Nodes
        const metatronNodes = [
          { dist: 0, angle: 0 }
        ];
        // 6 inner ring nodes
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          metatronNodes.push({ angle: a, dist: portalRadius * 0.5 });
        }
        // 6 outer ring nodes
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
          metatronNodes.push({ angle: a, dist: portalRadius });
        }

        // Resonating Emerald Ley-Line Crystals on Perimeter
        const crystalCount = isMobile ? 6 : 8;
        const leyCrystals = [];
        for (let c = 0; c < crystalCount; c++) {
          leyCrystals.push({
            angle: (c / crystalCount) * Math.PI * 2,
            rotSpeed: (c % 2 === 0 ? 1 : -1) * 0.004,
            radius: portalRadius * (0.8 + (c % 2) * 0.35),
            size: (isMobile ? 8 : 12) + (c % 3) * 3,
            phase: Math.random() * Math.PI * 2
          });
        }

        state = { portalRadius, ribbonR, ribbonWidth, mobiusParticles, metatronNodes, leyCrystals };
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
        // 3. Emerald Matrix Biogrid (3D Cyber DNA Double-Helix + Synaptic Hexagonal Matrix + Tesla Arcs)
        ctx.save();
        const cx = width * 0.5 + (mouseX - width * 0.5) * 0.08;
        const cy = height * 0.5 + (mouseY - height * 0.5) * 0.08;
        const { helixRungs, helixRadius, packets, hexSize, hexCols, hexRows, spores } = state;

        // A. Background Hexagonal Synaptic Matrix
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
        ctx.lineWidth = 1;
        const hexH = hexSize * Math.sqrt(3);
        const hexW = hexSize * 1.5;
        for (let r = 0; r < hexRows; r++) {
          for (let c = 0; c < hexCols; c++) {
            const hx = c * hexW;
            const hy = r * hexH + (c % 2 === 1 ? hexH * 0.5 : 0);
            const distCenter = Math.hypot(hx - cx, hy - cy);
            if (distCenter < width * 0.75) {
              const pulse = 0.5 + Math.sin(frame * 0.02 + c * 0.5 + r * 0.3) * 0.5;
              ctx.beginPath();
              for (let a = 0; a < 6; a++) {
                const angle = (a / 6) * Math.PI * 2;
                const px = hx + Math.cos(angle) * (hexSize * 0.55);
                const py = hy + Math.sin(angle) * (hexSize * 0.55);
                if (a === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.strokeStyle = `rgba(16, 185, 129, ${0.04 + pulse * 0.06})`;
              ctx.stroke();
            }
          }
        }

        // B. 3D Rotating Cyber DNA Double-Helix
        const stepY = (height * 1.1) / helixRungs;
        const startY = -height * 0.05;
        const helixAngle = frame * 0.02;

        for (let i = 0; i < helixRungs; i++) {
          const y = startY + i * stepY;
          const theta = i * 0.24 + helixAngle;

          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);

          const xA = cx + cosT * helixRadius;
          const xB = cx - cosT * helixRadius;

          // Perspective depth weighting
          const depthNormA = (sinT + 1) * 0.5;
          const depthNormB = (-sinT + 1) * 0.5;

          // Base-pair rung connecting Strand A and B
          ctx.beginPath();
          ctx.moveTo(xA, y);
          ctx.lineTo(xB, y);
          ctx.strokeStyle = `rgba(52, 211, 153, ${0.15 + Math.abs(cosT) * 0.25})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Strand A Node
          const sizeA = 2.0 + depthNormA * 2.5;
          ctx.beginPath();
          ctx.arc(xA, y, sizeA, 0, Math.PI * 2);
          ctx.fillStyle = depthNormA > 0.5 ? '#34d399' : '#10b981';
          ctx.globalAlpha = 0.3 + depthNormA * 0.7;
          ctx.fill();

          // Strand B Node
          const sizeB = 2.0 + depthNormB * 2.5;
          ctx.beginPath();
          ctx.arc(xB, y, sizeB, 0, Math.PI * 2);
          ctx.fillStyle = depthNormB > 0.5 ? '#34d399' : '#10b981';
          ctx.globalAlpha = 0.3 + depthNormB * 0.7;
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Traveling Data Packets along Double Helix rungs
        if (packets) {
          packets.forEach((pkt) => {
            pkt.t += pkt.speed;
            if (pkt.t > 1) {
              pkt.t = 0;
              pkt.rungIndex = Math.floor(Math.random() * helixRungs);
            } else if (pkt.t < 0) {
              pkt.t = 1;
              pkt.rungIndex = Math.floor(Math.random() * helixRungs);
            }

            const y = startY + pkt.rungIndex * stepY;
            const theta = pkt.rungIndex * 0.24 + helixAngle;
            const cosT = Math.cos(theta);
            const xA = cx + cosT * helixRadius;
            const xB = cx - cosT * helixRadius;
            const px = xA + (xB - xA) * pkt.t;

            ctx.beginPath();
            ctx.arc(px, y, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // Packet glow aura
            ctx.beginPath();
            ctx.arc(px, y, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
            ctx.fill();
          });
        }

        // C. Tesla Synaptic Lightning Arcs
        state.nextArcTimer--;
        if (state.nextArcTimer <= 0) {
          state.nextArcTimer = Math.floor(18 + Math.random() * 26);
          const rIdx = Math.floor(Math.random() * (helixRungs - 1));
          const y1 = startY + rIdx * stepY;
          const theta1 = rIdx * 0.24 + helixAngle;
          const startX = Math.random() > 0.5 ? cx + Math.cos(theta1) * helixRadius : cx - Math.cos(theta1) * helixRadius;

          const targetX = startX + (Math.random() - 0.5) * (isMobile ? 120 : 220);
          const targetY = y1 + (Math.random() - 0.5) * (isMobile ? 80 : 160);

          const segments = [];
          const steps = 7;
          for (let s = 0; s < steps; s++) {
            const frac = s / (steps - 1);
            const jx = (Math.random() - 0.5) * 22;
            const jy = (Math.random() - 0.5) * 22;
            segments.push({
              x: startX + (targetX - startX) * frac + jx,
              y: y1 + (targetY - y1) * frac + jy
            });
          }
          if (!state.lightningArcs) state.lightningArcs = [];
          state.lightningArcs.push({ segments, life: 1.0 });
        }

        if (state.lightningArcs) {
          state.lightningArcs.forEach((arc, aIdx) => {
            arc.life -= 0.12;
            if (arc.life <= 0) {
              state.lightningArcs.splice(aIdx, 1);
              return;
            }
            ctx.beginPath();
            arc.segments.forEach((pt, pIdx) => {
              if (pIdx === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = `rgba(16, 185, 129, ${arc.life * 0.4})`;
            ctx.lineWidth = 4.0;
            ctx.stroke();

            ctx.strokeStyle = `rgba(255, 255, 255, ${arc.life * 0.9})`;
            ctx.lineWidth = 1.6;
            ctx.stroke();
          });
        }

        // D. Floating Bio-Nanite Spores
        if (spores) {
          spores.forEach((sp) => {
            sp.y += sp.vy;
            sp.x += sp.vx;
            if (sp.y < 0) {
              sp.y = height + 10;
              sp.x = Math.random() * width;
            }
            const pulse = 0.35 + Math.sin(frame * sp.speed + sp.phase) * 0.45;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
            ctx.fillStyle = '#34d399';
            ctx.globalAlpha = Math.max(0, pulse);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }

        ctx.restore();
      } else if (activeTheme === 'cobalt-quantum') {
        // 4. Cobalt Quantum Wave (4D Rotating Quantum Tesseract + Lissajous Entanglement Orbitals)
        ctx.save();
        const cx = width * 0.5 + (mouseX - width * 0.5) * 0.14;
        const cy = height * 0.5 + (mouseY - height * 0.5) * 0.14;
        const { vertices4D, edges4D, tesseractScale, entangledPairs, stars } = state;

        // Background Probability Wave Stars
        if (stars) {
          stars.forEach((st) => {
            const p = 0.3 + Math.sin(frame * st.speed + st.phase) * 0.4;
            ctx.fillStyle = st.color;
            ctx.globalAlpha = Math.max(0, p);
            ctx.beginPath();
            ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }

        // Quantum Probability Wave Rings radiating from center
        for (let w = 0; w < 4; w++) {
          const prog = ((frame * 0.004 + w * 0.25) % 1);
          const r = prog * (Math.min(width, height) * 0.6);
          const alpha = Math.sin(prog * Math.PI) * 0.2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // A. 4D Rotating Quantum Tesseract Hypercube Projection
        state.angleXZ = (state.angleXZ || 0) + 0.012;
        state.angleYW = (state.angleYW || 0) + 0.016;
        const cosXZ = Math.cos(state.angleXZ);
        const sinXZ = Math.sin(state.angleXZ);
        const cosYW = Math.cos(state.angleYW);
        const sinYW = Math.sin(state.angleYW);

        const projected = [];
        if (vertices4D) {
          vertices4D.forEach((v) => {
            const x1 = v.x * cosXZ - v.z * sinXZ;
            const z1 = v.x * sinXZ + v.z * cosXZ;
            const y1 = v.y * cosYW - v.w * sinYW;
            const w1 = v.y * sinYW + v.w * cosYW;

            // 4D to 3D perspective projection
            const dist4 = 2.4;
            const factor4 = dist4 / (dist4 - w1 * 0.6);
            const x3 = x1 * factor4;
            const y3 = y1 * factor4;
            const z3 = z1 * factor4;

            // 3D to 2D perspective screen projection
            const dist3 = 3.2;
            const factor3 = dist3 / (dist3 - z3 * 0.5);
            const screenX = cx + x3 * factor3 * tesseractScale;
            const screenY = cy + y3 * factor3 * tesseractScale;

            projected.push({ x: screenX, y: screenY, depth: z3 + w1 });
          });
        }

        // Draw 32 Tesseract Edges
        if (edges4D && projected.length === 16) {
          edges4D.forEach(([i, j]) => {
            const p1 = projected[i];
            const p2 = projected[j];
            const avgDepth = (p1.depth + p2.depth) * 0.5;
            const normDepth = (avgDepth + 2) / 4;
            const alpha = 0.15 + Math.max(0, Math.min(1, normDepth)) * 0.45;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = normDepth > 0.5 ? `rgba(6, 182, 212, ${alpha})` : `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = normDepth > 0.5 ? 1.8 : 1.0;
            ctx.stroke();
          });

          // Draw 16 Tesseract Quantum Vertices
          projected.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = '#06b6d4';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, 6.0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
            ctx.fill();
          });
        }

        // B. Quantum Entangled Paired Orbitals (Lissajous curves)
        if (entangledPairs) {
          entangledPairs.forEach((pair) => {
            const time = frame * pair.speed + pair.phase;
            const x1 = cx + Math.cos(time * pair.freqX) * pair.rX;
            const y1 = cy + Math.sin(time * pair.freqY) * pair.rY;
            const x2 = cx - Math.cos(time * pair.freqX) * pair.rX;
            const y2 = cy - Math.sin(time * pair.freqY) * pair.rY;

            // Quantum Entanglement Coherence Beam
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(59, 130, 246, 0.18)`;
            ctx.lineWidth = 1.0;
            ctx.setLineDash([6, 6]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Entangled Particle 1
            ctx.beginPath();
            ctx.arc(x1, y1, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = '#3b82f6';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x1, y1, 7.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
            ctx.fill();

            // Entangled Particle 2
            ctx.beginPath();
            ctx.arc(x2, y2, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = '#06b6d4';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x2, y2, 7.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
            ctx.fill();
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
        // 6. Obsidian Shadow Void (Stealth Quantum Eclipse & Dark-Matter Lattice)
        ctx.save();
        const cx = width * 0.5 + (mouseX - width * 0.5) * 0.08;
        const cy = height * 0.5 + (mouseY - height * 0.5) * 0.08;
        const { eclipseRadius, facets, circuitPaths, infallDust } = state;

        // A. Stealth Quantum Eclipse Monolith & Coronal Rays
        const coronaRays = 16;
        for (let r = 0; r < coronaRays; r++) {
          const angle = (r / coronaRays) * Math.PI * 2 + frame * 0.002;
          const rayLen = eclipseRadius * (1.6 + Math.sin(frame * 0.03 + r * 1.5) * 0.4);
          const rx = cx + Math.cos(angle) * rayLen;
          const ry = cy + Math.sin(angle) * rayLen;
          const rGrad = ctx.createLinearGradient(cx, cy, rx, ry);
          rGrad.addColorStop(0, 'rgba(129, 140, 248, 0.18)');
          rGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)');
          rGrad.addColorStop(1, 'rgba(2, 2, 4, 0)');
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(rx, ry);
          ctx.strokeStyle = rGrad;
          ctx.lineWidth = 2.4;
          ctx.stroke();
        }

        // Shimmering Platinum-Chrome & Phantom-Violet Photon Ring
        const ringPulse = 0.75 + Math.sin(frame * 0.04) * 0.25;
        ctx.beginPath();
        ctx.arc(cx, cy, eclipseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(203, 213, 225, ${0.45 * ringPulse})`;
        ctx.lineWidth = 2.0;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, eclipseRadius * 1.05, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(129, 140, 248, ${0.3 * ringPulse})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Total Event Horizon Black Abyss Void
        ctx.beginPath();
        ctx.arc(cx, cy, eclipseRadius * 0.98, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        // B. 3D Tumbling Geometric Dark-Matter Facets
        if (facets) {
          facets.forEach((f) => {
            f.x += f.vx;
            f.y += f.vy;
            f.rotX += f.vRotX;
            f.rotY += f.vRotY;
            f.rotZ += f.vRotZ;

            if (f.x < -60) f.x = width + 60;
            if (f.x > width + 60) f.x = -60;
            if (f.y < -60) f.y = height + 60;
            if (f.y > height + 60) f.y = -60;

            ctx.save();
            ctx.translate(f.x, f.y);
            ctx.rotate(f.rotZ);

            ctx.beginPath();
            const cosX = Math.cos(f.rotX);
            const sinY = Math.sin(f.rotY);
            for (let s = 0; s < f.sides; s++) {
              const a = (s / f.sides) * Math.PI * 2;
              const px = Math.cos(a) * f.size * (0.7 + sinY * 0.3);
              const py = Math.sin(a) * f.size * (0.7 + cosX * 0.3);
              if (s === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Dark-matter semi-translucent fill
            ctx.fillStyle = `rgba(12, 12, 18, ${f.alpha})`;
            ctx.fill();

            // Platinum-chrome and violet edges
            ctx.strokeStyle = `rgba(203, 213, 225, ${f.alpha * 1.5})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Facet vertex glint
            const glintA = (0 / f.sides) * Math.PI * 2;
            const gx = Math.cos(glintA) * f.size * (0.7 + sinY * 0.3);
            const gy = Math.sin(glintA) * f.size * (0.7 + cosX * 0.3);
            ctx.beginPath();
            ctx.arc(gx, gy, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = '#818cf8';
            ctx.fill();

            ctx.restore();
          });
        }

        // C. Stealth Quantum Circuit Lattice Traces
        if (circuitPaths) {
          circuitPaths.forEach((branch, bIdx) => {
            const p = 0.35 + Math.sin(frame * 0.02 + bIdx) * 0.25;
            ctx.strokeStyle = `rgba(129, 140, 248, ${p * 0.35})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            branch.forEach((seg) => {
              ctx.moveTo(seg.x1, seg.y1);
              ctx.lineTo(seg.x2, seg.y2);
            });
            ctx.stroke();

            branch.forEach((seg) => {
              if (seg.node) {
                ctx.fillStyle = '#cbd5e1';
                ctx.beginPath();
                ctx.arc(seg.x2, seg.y2, 1.8, 0, Math.PI * 2);
                ctx.fill();
              }
            });
          });
        }

        // D. Infall Dark-Matter Dust Particles
        if (infallDust) {
          infallDust.forEach((d) => {
            d.dist += d.radialSpeed;
            d.angle += d.angularSpeed;
            if (d.dist < eclipseRadius) {
              d.dist = Math.max(width, height) * 0.55;
            }
            const px = cx + Math.cos(d.angle) * d.dist;
            const py = cy + Math.sin(d.angle) * d.dist;
            const alpha = 0.2 + Math.sin(frame * 0.03 + d.phase) * 0.35;

            ctx.fillStyle = d.color;
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.beginPath();
            ctx.arc(px, py, d.size, 0, Math.PI * 2);
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
        // 8. Mystic Amethyst Portal (Sacred Astrolabe & 3D Möbius Cosmic Nebula Ribbon)
        ctx.save();
        const cx = width * 0.5;
        const cy = height * 0.5;
        const { portalRadius, ribbonR, ribbonWidth, mobiusParticles, metatronNodes, leyCrystals } = state;

        // A. 3D Möbius Cosmic Nebula Ribbon
        if (mobiusParticles) {
          mobiusParticles.forEach((p) => {
            p.v += p.vSpeed;
            const u = p.uNorm * ribbonWidth;
            const halfV = p.v * 0.5;

            // Parametric 3D Möbius equation
            const rPrime = ribbonR + u * Math.cos(halfV);
            const x3D = rPrime * Math.cos(p.v);
            const y3D = rPrime * Math.sin(p.v);
            const z3D = u * Math.sin(halfV);

            // Perspective Depth Projection
            const dist = portalRadius * 2.5;
            const factor = dist / (dist - z3D);
            const px = cx + x3D * factor;
            const py = cy + y3D * factor;

            const depthAlpha = 0.2 + ((z3D + ribbonWidth) / (ribbonWidth * 2)) * 0.6;

            // Stardust halo
            ctx.beginPath();
            ctx.arc(px, py, p.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = p.color === '#10b981' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(147, 51, 234, 0.18)';
            ctx.fill();

            // Stardust core
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, depthAlpha);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }

        // B. Metatron's Cube Sacred Geometry Astrolabe
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(frame * 0.003);

        const nodeCoords = [];
        if (metatronNodes) {
          metatronNodes.forEach((mn) => {
            if (mn.dist === 0) {
              nodeCoords.push({ x: 0, y: 0 });
            } else {
              nodeCoords.push({
                x: Math.cos(mn.angle) * mn.dist,
                y: Math.sin(mn.angle) * mn.dist
              });
            }
          });

          // Draw Sacred Geometry lines connecting all nodes
          ctx.strokeStyle = 'rgba(192, 132, 252, 0.22)';
          ctx.lineWidth = 1.0;
          for (let i = 0; i < nodeCoords.length; i++) {
            for (let j = i + 1; j < nodeCoords.length; j++) {
              ctx.beginPath();
              ctx.moveTo(nodeCoords[i].x, nodeCoords[i].y);
              ctx.lineTo(nodeCoords[j].x, nodeCoords[j].y);
              ctx.stroke();
            }
          }

          // Node Circles
          nodeCoords.forEach((nc, idx) => {
            const p = 0.4 + Math.sin(frame * 0.03 + idx) * 0.4;
            ctx.beginPath();
            ctx.arc(nc.x, nc.y, idx === 0 ? 6.0 : 3.5, 0, Math.PI * 2);
            ctx.fillStyle = idx === 0 ? '#10b981' : '#c084fc';
            ctx.globalAlpha = p;
            ctx.fill();
            ctx.globalAlpha = 1.0;
          });
        }
        ctx.restore();

        // Outer Astrolabe Concentric Runic Rings
        for (let r = 0; r < 3; r++) {
          const ringRad = portalRadius * (0.6 + r * 0.35);
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((r % 2 === 0 ? 1 : -1) * frame * (0.002 + r * 0.001));
          ctx.beginPath();
          ctx.arc(0, 0, ringRad, 0, Math.PI * 2);
          ctx.strokeStyle = r === 1 ? '#10b981' : '#9333ea';
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = 1.3;
          ctx.setLineDash(r === 0 ? [14, 10, 4, 10] : [20, 12]);
          ctx.stroke();
          ctx.restore();
        }

        // C. Resonating Emerald Ley-Line Crystals on Perimeter
        if (leyCrystals) {
          const crystalPoints = [];
          leyCrystals.forEach((crys) => {
            crys.angle += crys.rotSpeed;
            const lx = cx + Math.cos(crys.angle) * crys.radius;
            const ly = cy + Math.sin(crys.angle) * crys.radius;
            crystalPoints.push({ x: lx, y: ly, size: crys.size });
          });

          // Emerald laser perimeter filament
          ctx.beginPath();
          crystalPoints.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.closePath();
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Render Faceted Emerald Crystals
          crystalPoints.forEach((pt, idx) => {
            const pulse = 0.5 + Math.sin(frame * 0.035 + idx) * 0.45;
            ctx.save();
            ctx.translate(pt.x, pt.y);
            ctx.rotate(frame * 0.02 + idx);

            // Diamond crystal facet
            ctx.beginPath();
            ctx.moveTo(0, -pt.size * 0.6);
            ctx.lineTo(pt.size * 0.4, 0);
            ctx.lineTo(0, pt.size * 0.6);
            ctx.lineTo(-pt.size * 0.4, 0);
            ctx.closePath();

            ctx.fillStyle = `rgba(16, 185, 129, ${0.4 * pulse})`;
            ctx.fill();
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.restore();
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