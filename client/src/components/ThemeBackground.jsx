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
        // 2. Magma Thermal Convection Waves (Molten Core Heat-Haze Distortion)
        // A. Atmospheric heat-haze convection shimmer ribbons
        const ribbonCount = isMobile ? 9 : 18;
        const ribbons = [];
        for (let r = 0; r < ribbonCount; r++) {
          ribbons.push({
            x: (r / (ribbonCount - 1 || 1)) * width,
            amplitude: (isMobile ? 8 : 16) + Math.random() * 12,
            freq: 0.006 + Math.random() * 0.005,
            speed: 0.035 + Math.random() * 0.025,
            phase: Math.random() * Math.PI * 2,
            alpha: 0.04 + Math.random() * 0.05,
            color: r % 2 === 0 ? 'rgba(239, 68, 68, ' : 'rgba(249, 115, 22, '
          });
        }

        // B. Rising molten convective ember particles
        const emberCount = isMobile ? 25 : 55;
        const embers = [];
        for (let e = 0; e < emberCount; e++) {
          embers.push({
            x: Math.random() * width,
            y: height + Math.random() * 100,
            vy: -(0.5 + Math.random() * 1.2),
            vx: (Math.random() - 0.5) * 0.4,
            swayAmp: 1.2 + Math.random() * 2.5,
            swaySpeed: 0.02 + Math.random() * 0.03,
            phase: Math.random() * Math.PI * 2,
            size: Math.random() * 2.5 + 1.0,
            maxLife: 200 + Math.random() * 220,
            life: Math.random() * 200,
            color: e % 3 === 0 ? '#fafafa' : (e % 2 === 0 ? '#f97316' : '#ef4444')
          });
        }

        state = { ribbons, embers };
      } else if (theme === 'emerald-biogrid') {
        // 3. Emerald Matrix Biogrid (Inward Orbiting Lightning Rings)
        const ringCount = isMobile ? 5 : 8;
        const rings = [];
        const maxRadius = Math.min(width, height) * (isMobile ? 0.75 : 0.65);
        for (let i = 0; i < ringCount; i++) {
          const r = (maxRadius / ringCount) * (i + 1);
          rings.push({
            radius: r,
            angle: Math.random() * Math.PI * 2,
            speed: (i % 2 === 0 ? 1 : -1) * (0.003 + (ringCount - i) * 0.0012),
            dashArray: [15 + Math.random() * 30, 10 + Math.random() * 25],
            nodes: [
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2
            ],
            color: i % 2 === 0 ? '#10b981' : '#34d399',
            alpha: 0.15 + (i / ringCount) * 0.18
          });
        }

        state = {
          rings,
          sparks: [],
          nextSparkTimer: 15
        };
      } else if (theme === 'cobalt-quantum') {
        // 4. Cobalt Quantum Wave (Warped Space-Time Ripple Grid)
        const spacing = isMobile ? 55 : 44;
        const cols = Math.ceil(width / spacing) + 2;
        const rows = Math.ceil(height / spacing) + 2;

        const stars = [];
        const starCount = isMobile ? 35 : 75;
        for (let s = 0; s < starCount; s++) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.8 + 0.6,
            phase: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.03,
            color: s % 2 === 0 ? '#3b82f6' : (s % 3 === 0 ? '#06b6d4' : '#f8fafc')
          });
        }

        state = { spacing, cols, rows, stars };
      } else if (theme === 'golden-sunfire') {
        // 5. Golden Sunfire Monolith (Opposing Thermal Gradient Streams)
        // Descending frost-vapor stream (top -> down)
        const frostCount = isMobile ? 20 : 40;
        const frostStream = [];
        for (let f = 0; f < frostCount; f++) {
          frostStream.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: 0.35 + Math.random() * 0.6,
            vx: (Math.random() - 0.5) * 0.25,
            length: (isMobile ? 18 : 32) + Math.random() * 24,
            width: Math.random() * 1.8 + 0.8,
            alpha: 0.12 + Math.random() * 0.22,
            color: f % 2 === 0 ? '#ffffff' : '#eab308'
          });
        }

        // Ascending solar-ember stream (bottom -> up)
        const emberCount = isMobile ? 22 : 45;
        const solarStream = [];
        for (let e = 0; e < emberCount; e++) {
          solarStream.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: -(0.4 + Math.random() * 0.8),
            vx: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2.2 + 0.8,
            swayAmp: 1.2 + Math.random() * 2.0,
            swaySpeed: 0.02 + Math.random() * 0.025,
            phase: Math.random() * Math.PI * 2,
            alpha: 0.15 + Math.random() * 0.3,
            color: e % 3 === 0 ? '#f59e0b' : (e % 2 === 0 ? '#eab308' : '#ffffff')
          });
        }

        state = { frostStream, solarStream };
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
        // 8. Mystic Amethyst Portal (Concentric Portal Energy Rings)
        const ringCount = isMobile ? 7 : 12;
        const maxR = Math.max(width, height) * (isMobile ? 0.9 : 0.8);
        const particles = [];
        const partCount = isMobile ? 25 : 55;
        for (let p = 0; p < partCount; p++) {
          particles.push({
            dist: Math.random() * maxR,
            angle: Math.random() * Math.PI * 2,
            angularSpeed: (Math.random() - 0.5) * 0.012,
            radialSpeed: -(0.2 + Math.random() * 0.5),
            size: Math.random() * 2.2 + 0.8,
            color: p % 3 === 0 ? '#10b981' : (p % 2 === 0 ? '#9333ea' : '#f8fafc'),
            phase: Math.random() * Math.PI * 2
          });
        }

        state = { ringCount, maxR, particles };
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
        // 2. Magma Thermal Convection Waves (Molten Core Heat-Haze Distortion)
        ctx.save();

        // Molten core radiant base glow
        const coreGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
        const pulse = 0.75 + Math.sin(frame * 0.02) * 0.25;
        coreGrad.addColorStop(0, 'rgba(9, 5, 5, 0)');
        coreGrad.addColorStop(0.65, `rgba(239, 68, 68, ${0.12 * pulse})`);
        coreGrad.addColorStop(1, `rgba(249, 115, 22, ${0.24 * pulse})`);
        ctx.fillStyle = coreGrad;
        ctx.fillRect(0, height * 0.5, width, height * 0.5);

        // Heat-haze convection shimmer ribbons
        if (state.ribbons) {
          state.ribbons.forEach((r) => {
            ctx.beginPath();
            const segments = 24;
            const stepY = height / segments;
            for (let i = 0; i <= segments; i++) {
              const cy = i * stepY;
              const wave = Math.sin(cy * r.freq - frame * r.speed + r.phase) * r.amplitude;
              const cx = r.x + wave;
              if (i === 0) ctx.moveTo(cx, cy);
              else ctx.lineTo(cx, cy);
            }
            ctx.strokeStyle = `${r.color}${r.alpha})`;
            ctx.lineWidth = 2.5;
            ctx.stroke();
          });
        }

        // Rising molten convective embers
        if (state.embers) {
          state.embers.forEach((emb) => {
            emb.y += emb.vy;
            emb.x += Math.sin(frame * emb.swaySpeed + emb.phase) * (emb.swayAmp * 0.5);
            emb.life++;
            if (emb.y < 0 || emb.life > emb.maxLife) {
              emb.y = height + 10;
              emb.x = Math.random() * width;
              emb.life = 0;
            }

            const lifeProgress = emb.life / emb.maxLife;
            const alpha = (1 - lifeProgress) * 0.7;

            ctx.fillStyle = emb.color;
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.beginPath();
            ctx.arc(emb.x, emb.y, emb.size * (1 - lifeProgress * 0.4), 0, Math.PI * 2);
            ctx.fill();
          });
        }

        ctx.restore();
      } else if (activeTheme === 'emerald-biogrid') {
        // 3. Emerald Matrix Biogrid (Inward Orbiting Lightning Rings)
        ctx.save();
        const cx = width * 0.5;
        const cy = height * 0.5;

        // Draw concentric rotating rings with orbiting nodes
        if (state.rings) {
          state.rings.forEach((ring) => {
            ring.angle += ring.speed;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(ring.angle);

            ctx.beginPath();
            ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = ring.color;
            ctx.globalAlpha = ring.alpha;
            ctx.lineWidth = 1.4;
            ctx.setLineDash(ring.dashArray);
            ctx.stroke();

            // Orbiting data nodes
            ring.nodes.forEach((nAngle) => {
              const nx = Math.cos(nAngle) * ring.radius;
              const ny = Math.sin(nAngle) * ring.radius;
              ctx.beginPath();
              ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
              ctx.fillStyle = '#34d399';
              ctx.globalAlpha = Math.min(1, ring.alpha * 2.5);
              ctx.fill();
            });

            ctx.restore();
          });
        }

        // Trigger micro-voltage electric spark arcs
        state.nextSparkTimer--;
        if (state.nextSparkTimer <= 0 && state.rings && state.rings.length > 1) {
          state.nextSparkTimer = Math.floor(18 + Math.random() * 25);
          const rIdx = Math.floor(Math.random() * (state.rings.length - 1));
          const r1 = state.rings[rIdx].radius;
          const r2 = state.rings[rIdx + 1].radius;
          const baseA = Math.random() * Math.PI * 2;
          const segments = [];
          const steps = 6;
          for (let s = 0; s < steps; s++) {
            const rad = r1 + (r2 - r1) * (s / (steps - 1));
            const a = baseA + (Math.random() - 0.5) * 0.25;
            segments.push({
              x: cx + Math.cos(a) * rad,
              y: cy + Math.sin(a) * rad
            });
          }
          if (!state.sparks) state.sparks = [];
          state.sparks.push({ segments, life: 1.0 });
        }

        // Render sparks
        if (state.sparks && state.sparks.length > 0) {
          state.sparks.forEach((sp, idx) => {
            sp.life -= 0.12;
            if (sp.life <= 0) {
              state.sparks.splice(idx, 1);
              return;
            }
            ctx.beginPath();
            sp.segments.forEach((pt, pIdx) => {
              if (pIdx === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = '#34d399';
            ctx.globalAlpha = sp.life;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          });
        }

        ctx.restore();
      } else if (activeTheme === 'cobalt-quantum') {
        // 4. Cobalt Quantum Wave (Warped Space-Time Ripple Grid)
        ctx.save();
        const centerX = width * 0.5 + (mouseX - width * 0.5) * 0.15;
        const centerY = height * 0.5 + (mouseY - height * 0.5) * 0.15;

        const { spacing, cols, rows, stars } = state;
        const waveSpeed = frame * 0.035;

        // Background quantum stars
        if (stars) {
          stars.forEach((st) => {
            const pulse = 0.3 + Math.sin(frame * st.speed + st.phase) * 0.4;
            ctx.fillStyle = st.color;
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // Warped grid lines
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
        ctx.lineWidth = 1;

        // Horizontal lines
        for (let r = 0; r < rows; r++) {
          ctx.beginPath();
          for (let c = 0; c < cols; c++) {
            const bx = c * spacing;
            const by = r * spacing;
            const dist = Math.hypot(bx - centerX, by - centerY);
            const warp = Math.sin(dist * 0.016 - waveSpeed) * 8 * (1 / (1 + dist * 0.0015));
            const wx = bx + (bx - centerX) * (warp * 0.002);
            const wy = by + (by - centerY) * (warp * 0.002);

            if (c === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }

        // Vertical lines
        for (let c = 0; c < cols; c++) {
          ctx.beginPath();
          for (let r = 0; r < rows; r++) {
            const bx = c * spacing;
            const by = r * spacing;
            const dist = Math.hypot(bx - centerX, by - centerY);
            const warp = Math.sin(dist * 0.016 - waveSpeed) * 8 * (1 / (1 + dist * 0.0015));
            const wx = bx + (bx - centerX) * (warp * 0.002);
            const wy = by + (by - centerY) * (warp * 0.002);

            if (r === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }

        ctx.restore();
      } else if (activeTheme === 'golden-sunfire') {
        // 5. Golden Sunfire Monolith (Opposing Thermal Gradient Streams)
        ctx.save();

        // Stream A: Descending frost-vapor (top -> down)
        if (state.frostStream) {
          state.frostStream.forEach((f) => {
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

        // Stream B: Ascending solar-ember dust (bottom -> up)
        if (state.solarStream) {
          state.solarStream.forEach((s) => {
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

        // Central thermal equilibrium glow
        const midGrad = ctx.createRadialGradient(width * 0.5, height * 0.5, 20, width * 0.5, height * 0.5, width * 0.6);
        const pulse = 0.5 + Math.sin(frame * 0.018) * 0.3;
        midGrad.addColorStop(0, `rgba(234, 179, 8, ${0.08 * pulse})`);
        midGrad.addColorStop(0.5, `rgba(245, 158, 11, ${0.04 * pulse})`);
        midGrad.addColorStop(1, 'rgba(6, 6, 6, 0)');
        ctx.fillStyle = midGrad;
        ctx.fillRect(0, 0, width, height);

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
        // 8. Mystic Amethyst Portal (Concentric Portal Energy Rings)
        ctx.save();
        const cx = width * 0.5;
        const cy = height * 0.5;
        const { ringCount, maxR, particles } = state;

        // Expanding concentric portal rings
        for (let i = 0; i < ringCount; i++) {
          const progress = ((frame * 0.0035 + i / ringCount) % 1);
          const r = progress * maxR;
          // Fade in at center, peak mid-way, fade out at boundary
          const alpha = Math.sin(progress * Math.PI) * 0.32;

          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = '#9333ea';
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 1.5 + (1 - progress) * 1.5;
          ctx.stroke();

          // Subtle emerald energy node on ring
          const nodeAngle = frame * 0.015 + i;
          const nx = cx + Math.cos(nodeAngle) * r;
          const ny = cy + Math.sin(nodeAngle) * r;
          ctx.beginPath();
          ctx.arc(nx, ny, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.globalAlpha = alpha * 1.8;
          ctx.fill();
        }

        // Swirling mystic particles
        if (particles) {
          particles.forEach((p) => {
            p.dist += p.radialSpeed;
            p.angle += p.angularSpeed;
            if (p.dist < 15) p.dist = maxR;

            const px = cx + Math.cos(p.angle) * p.dist;
            const py = cy + Math.sin(p.angle) * p.dist;
            const alpha = 0.2 + Math.sin(frame * 0.025 + p.phase) * 0.35;

            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.beginPath();
            ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fill();
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