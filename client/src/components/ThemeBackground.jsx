import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Completely Distinct Geometric Visualizers:
 * 1. synthwave             — ⚡ Vibrant Synthwave Horizon: 3D perspective floor grid, horizon fog & ambient nodes
 * 2. cryo-vault            — 🧊 Glacial Cryo-Vault: Liquid nitrogen vapor drift & sharp frost needle shards
 * 3. solar-flare           — 🔥 Crimson Solar Flare: Molten coronal base, magnetic prominence loops & lazy warm embers
 * 4. cosmic-singularity    — 🌌 Cosmic Singularity: Gravitational lensing spacetime grid & swirling accretion disk
 * 5. plasma-web            — 🪐 Cyberpunk Plasma Web: Circuit vector mesh, triangular polygon fills & electric data sparks
 * 6. cyber-foundry         — ⚡ Cyber-Industrial Foundry: Chasing laser dash conduits & gravity welding sparks
 * 7. bioluminescent-trench — 🪸 Bioluminescent Deep Trench: Radial pulse wave echolocation & undulating deep-sea organisms
 * 8. yokohama-night        — 🏮 Neo-Yokohama Night Alley: Chromatic rain streaks, puddle ripples & wet asphalt neon reflections
 */

const VALID_THEMES = [
  'synthwave',
  'cryo-vault',
  'solar-flare',
  'cosmic-singularity',
  'plasma-web',
  'cyber-foundry',
  'bioluminescent-trench',
  'yokohama-night'
];

const LEGACY_THEME_MAP = {
  aurora: 'cryo-vault',
  'neon-frost': 'cosmic-singularity',
  'abyssal-trench': 'bioluminescent-trench',
  'nebula-drift': 'cosmic-singularity',
  'citrus-arcade': 'cyber-foundry'
};

export default function ThemeBackground() {
  const canvasRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem('syncstream_theme');
    if (saved && VALID_THEMES.includes(saved)) return saved;
    if (saved && LEGACY_THEME_MAP[saved]) return LEGACY_THEME_MAP[saved];
    return 'synthwave';
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
        } else if (val && LEGACY_THEME_MAP[val]) {
          setActiveTheme(LEGACY_THEME_MAP[val]);
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

    // Mouse coordinates for Cosmic Singularity gravitational lens parallax
    let mouseX = width * 0.5;
    let mouseY = height * 0.44;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

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

      if (theme === 'synthwave') {
        // 1. ⚡ Vibrant Synthwave Horizon (Perspective grid floor + horizon fog + pulsing nodes)
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
      } else if (theme === 'cryo-vault') {
        // 2. 🧊 Glacial Cryo-Vault (Liquid Nitrogen Vapor Drift & Sharp Frost Shards)
        // A. Heavy drifting liquid nitrogen vapor puffs
        const puffCount = isMobile ? 8 : 15;
        const vaporPuffs = [];
        for (let i = 0; i < puffCount; i++) {
          vaporPuffs.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: (isMobile ? 100 : 180) + Math.random() * (isMobile ? 60 : 120),
            vy: 0.22 + Math.random() * 0.32,
            swayAmp: 0.8 + Math.random() * 1.4,
            swaySpeed: 0.008 + Math.random() * 0.008,
            phase: Math.random() * Math.PI * 2,
            color: i % 2 === 0 ? 'rgba(0, 210, 255, ' : 'rgba(165, 243, 252, ',
            baseAlpha: 0.035 + Math.random() * 0.03
          });
        }

        // B. Sharp faceted frost crystal needle shards
        const shardCount = isMobile ? 18 : 32;
        const frostShards = [];
        for (let i = 0; i < shardCount; i++) {
          frostShards.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: (isMobile ? 6 : 10) + Math.random() * (isMobile ? 8 : 14),
            vy: 0.18 + Math.random() * 0.3,
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.015,
            aspect: 2.2 + Math.random() * 1.8, // elongated frost needle
            color: i % 3 === 0 ? '#00d2ff' : (i % 3 === 1 ? '#a5f3fc' : '#ffffff'),
            alpha: 0.15 + Math.random() * 0.25,
            phase: Math.random() * Math.PI * 2
          });
        }

        // C. Occasional thermal overload alert spark motes
        const alertMotes = [];
        for (let i = 0; i < 4; i++) {
          alertMotes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 2,
            color: '#ff3366',
            blinkRate: 0.03 + Math.random() * 0.02,
            phase: Math.random() * Math.PI * 2
          });
        }

        state = { vaporPuffs, frostShards, alertMotes };
      } else if (theme === 'solar-flare') {
        // 3. 🔥 Crimson Solar Flare (Coronal Prominence Arches & Lazy Warm Embers)
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
      } else if (theme === 'cosmic-singularity') {
        // 4. 🌌 Cosmic Singularity (Black Hole: Gravitational Lensing Parallax & Accretion Disk)
        // Singularity event horizon core
        const coreRadius = isMobile ? 32 : 48;

        // Swirling relativistic accretion disk particles
        const particleCount = isMobile ? 45 : 75;
        const diskParticles = [];
        for (let i = 0; i < particleCount; i++) {
          const orbitR = coreRadius * 1.25 + Math.random() * (isMobile ? 120 : 210);
          diskParticles.push({
            r: orbitR,
            angle: Math.random() * Math.PI * 2,
            speed: (0.015 + (1 / Math.sqrt(Math.max(orbitR, 10))) * 0.28) * (Math.random() > 0.08 ? 1 : 1),
            size: Math.random() * 2 + 1,
            color: Math.random() > 0.55 ? '#ff7a00' : (Math.random() > 0.35 ? '#7b2cbf' : '#ffffff'),
            alpha: 0.35 + Math.random() * 0.55
          });
        }

        // Hawking radiation jets / relativistic emissions
        const hawkingParticles = [];
        for (let i = 0; i < (isMobile ? 12 : 20); i++) {
          hawkingParticles.push({
            dist: Math.random() * (isMobile ? 160 : 300),
            angle: Math.random() * Math.PI * 2,
            vDist: 0.8 + Math.random() * 1.4,
            size: Math.random() * 1.8 + 0.8,
            color: Math.random() > 0.5 ? '#7b2cbf' : '#ff7a00'
          });
        }

        state = { coreRadius, diskParticles, hawkingParticles };
      } else if (theme === 'plasma-web') {
        // 5. 🪐 Cyberpunk Plasma Web (Circuit Vector Mesh & Electric Data Packets)
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
      } else if (theme === 'cyber-foundry') {
        // 6. ⚡ Cyber-Industrial Foundry (Chasing Dash-Array Spark Flux & Gravity Sparks)
        // A. High-voltage conduit tracks
        const gridStep = isMobile ? 80 : 110;
        const cols = Math.floor(width / gridStep);
        const rows = Math.floor(height / gridStep);
        const conduits = [];

        // Generate horizontal and vertical conduit segments
        for (let r = 1; r < rows; r++) {
          conduits.push({ x1: 0, y1: r * gridStep, x2: width, y2: r * gridStep, dir: 'h' });
        }
        for (let c = 1; c < cols; c++) {
          conduits.push({ x1: c * gridStep, y1: 0, x2: c * gridStep, y2: height, dir: 'v' });
        }

        // B. Chasing laser dashes racing through the conduits
        const dashCount = isMobile ? 10 : 18;
        const laserDashes = [];
        for (let i = 0; i < dashCount; i++) {
          const isHoriz = Math.random() > 0.5;
          const trackIndex = isHoriz
            ? Math.floor(Math.random() * Math.max(rows - 1, 1)) + 1
            : Math.floor(Math.random() * Math.max(cols - 1, 1)) + 1;
          const pos = Math.random() * (isHoriz ? width : height);
          laserDashes.push({
            isHoriz,
            coord: trackIndex * gridStep,
            pos,
            length: (isMobile ? 24 : 45) + Math.random() * 20,
            speed: (3.2 + Math.random() * 3.8) * (Math.random() > 0.5 ? 1 : -1),
            color: i % 2 === 0 ? '#ffb700' : '#ff4f00'
          });
        }

        // C. Gravity-simulated welding/grinding sparks falling from conduit junctions
        const sparkPool = [];
        const maxSparks = isMobile ? 30 : 50;
        for (let i = 0; i < maxSparks; i++) {
          sparkPool.push({
            active: false,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            life: 0,
            maxLife: 60,
            color: '#ffb700'
          });
        }

        state = { gridStep, conduits, laserDashes, sparkPool, lastSparkTime: 0 };
      } else if (theme === 'bioluminescent-trench') {
        // 7. 🪸 Bioluminescent Deep Trench (Pulse Wave Echolocation & Floating Organisms)
        // A. Expanding sonar echolocation pulse rings
        const sonarOriginX = width * 0.5;
        const sonarOriginY = height * 0.52;
        const maxSonarRadius = Math.max(width, height) * 0.75;
        const sonarWaves = [
          { radius: 0, speed: isMobile ? 1.4 : 2.0, color: '#39ff14', alpha: 0.28 },
          { radius: maxSonarRadius * 0.33, speed: isMobile ? 1.4 : 2.0, color: '#e100ff', alpha: 0.24 },
          { radius: maxSonarRadius * 0.66, speed: isMobile ? 1.4 : 2.0, color: '#39ff14', alpha: 0.20 }
        ];

        // B. Floating deep-sea bioluminescent medusa/jellyfish organisms
        const organismCount = isMobile ? 4 : 7;
        const organisms = [];
        for (let i = 0; i < organismCount; i++) {
          organisms.push({
            x: width * (0.1 + (i / organismCount) * 0.8 + (Math.random() - 0.5) * 0.1),
            y: height * (0.2 + (i % 3) * 0.26 + Math.random() * 0.1),
            bellRadius: (isMobile ? 16 : 26) + Math.random() * (isMobile ? 8 : 14),
            swimPhase: i * 1.4,
            swimSpeed: 0.024 + Math.random() * 0.012,
            vy: -(0.2 + Math.random() * 0.25),
            driftAmp: 0.6 + Math.random() * 0.8,
            color: i % 2 === 0 ? '#39ff14' : '#e100ff',
            tentacleCount: isMobile ? 4 : 5
          });
        }

        // C. Marine snow motes drifting with water currents
        const snowCount = isMobile ? 22 : 40;
        const marineSnow = [];
        for (let i = 0; i < snowCount; i++) {
          marineSnow.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5 + 0.8,
            vy: 0.15 + Math.random() * 0.2,
            swayAmp: 0.5 + Math.random() * 0.5,
            swaySpeed: 0.01 + Math.random() * 0.01,
            phase: Math.random() * Math.PI * 2,
            color: i % 3 === 0 ? '#39ff14' : (i % 3 === 1 ? '#e100ff' : '#8ea8c3'),
            alpha: 0.18 + Math.random() * 0.24
          });
        }

        state = { sonarOriginX, sonarOriginY, maxSonarRadius, sonarWaves, organisms, marineSnow };
      } else if (theme === 'yokohama-night') {
        // 8. 🏮 Neo-Yokohama Night Alley (Chromatic Rain & Wet Neon Puddle Reflections)
        // A. Angled cyber rain streaks
        const rainCount = isMobile ? 35 : 65;
        const rainDrops = [];
        for (let i = 0; i < rainCount; i++) {
          rainDrops.push({
            x: Math.random() * (width + 200) - 100,
            y: Math.random() * height,
            len: (isMobile ? 18 : 32) + Math.random() * 18,
            vx: -2.2, // angled wind shear
            vy: (isMobile ? 12 : 18) + Math.random() * 8,
            alpha: 0.12 + Math.random() * 0.18
          });
        }

        // B. Concentric water drop impact ripples on the wet asphalt floor
        const rippleCount = isMobile ? 8 : 14;
        const ripples = [];
        for (let i = 0; i < rippleCount; i++) {
          ripples.push({
            x: Math.random() * width,
            y: height * (0.55 + Math.random() * 0.42), // in puddle zone
            radius: Math.random() * 25,
            maxRadius: (isMobile ? 28 : 45) + Math.random() * 20,
            speed: 0.5 + Math.random() * 0.4,
            color: Math.random() > 0.5 ? '#ff0055' : '#00ffcc',
            alpha: 0.35
          });
        }

        // C. Shifting chromatic puddle light leaks (Wet asphalt reflections)
        const puddleLeaks = [
          { x: width * 0.22, y: height * 0.78, rx: width * 0.28, ry: 75, color: '#ff0055', phase: 0 },
          { x: width * 0.52, y: height * 0.85, rx: width * 0.32, ry: 90, color: '#00ffcc', phase: 2.1 },
          { x: width * 0.78, y: height * 0.74, rx: width * 0.26, ry: 70, color: '#fff066', phase: 4.2 }
        ];

        state = { rainDrops, ripples, puddleLeaks };
      }
    }

    initScene(activeTheme);

    function render(timestamp) {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow with inertia for parallax
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

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

        // Faint, slow-pulsing ambient glow nodes
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
      } else if (activeTheme === 'cryo-vault') {
        // 2. 🧊 Glacial Cryo-Vault (Liquid Nitrogen Vapor Drift & Frost Needle Shards)
        ctx.save();

        // 1. Heavy drifting nitrogen vapor puffs (sinking slowly)
        (state.vaporPuffs || []).forEach((p) => {
          p.y += p.vy;
          p.x += Math.sin(frame * p.swaySpeed + p.phase) * p.swayAmp;
          if (p.y > height + p.radius) {
            p.y = -p.radius;
            p.x = Math.random() * width;
          }

          const pulse = (Math.sin(frame * 0.015 + p.phase) + 1) * 0.5;
          const currentAlpha = p.baseAlpha + pulse * 0.02;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, `${p.color}${currentAlpha.toFixed(3)})`);
          grad.addColorStop(0.5, `${p.color}${(currentAlpha * 0.4).toFixed(3)})`);
          grad.addColorStop(1, `${p.color}0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });

        // 2. Faceted crystalline frost shards
        (state.frostShards || []).forEach((s) => {
          s.y += s.vy;
          s.rot += s.vRot;
          if (s.y > height + 20) {
            s.y = -20;
            s.x = Math.random() * width;
          }

          const shimmer = (Math.sin(frame * 0.03 + s.phase) + 1) * 0.5;
          const currentAlpha = s.alpha * (0.7 + shimmer * 0.3);

          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rot);

          // Sharp needle crystal diamond geometry
          const halfW = s.size * 0.45;
          const halfH = s.size * (s.aspect * 0.5);

          ctx.beginPath();
          ctx.moveTo(0, -halfH);
          ctx.lineTo(halfW, 0);
          ctx.lineTo(0, halfH);
          ctx.lineTo(-halfW, 0);
          ctx.closePath();

          ctx.fillStyle = s.color === '#00d2ff' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(165, 243, 252, 0.2)';
          ctx.fill();

          ctx.strokeStyle = s.color === '#ffffff' ? `rgba(255, 255, 255, ${currentAlpha})` : `rgba(0, 210, 255, ${currentAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.restore();
        });

        // 3. Thermal Overload Alert needle pulses
        (state.alertMotes || []).forEach((m) => {
          const blink = (Math.sin(frame * m.blinkRate + m.phase) + 1) * 0.5;
          if (blink > 0.75) {
            ctx.save();
            ctx.fillStyle = '#ff3366';
            ctx.shadowColor = '#ff3366';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.size * blink, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });

        ctx.restore();
      } else if (activeTheme === 'solar-flare') {
        // 3. 🔥 Crimson Solar Flare (Coronal Prominence Arches & Lazy Warm Embers)
        const coronaGrad = ctx.createLinearGradient(0, height - 120, 0, height);
        coronaGrad.addColorStop(0, 'rgba(15, 8, 10, 0)');
        coronaGrad.addColorStop(0.5, 'rgba(255, 94, 0, 0.08)');
        coronaGrad.addColorStop(1, 'rgba(255, 183, 3, 0.18)');
        ctx.fillStyle = coronaGrad;
        ctx.fillRect(0, height - 120, width, 120);

        (state.loops || []).forEach((loop) => {
          const sway = Math.sin(frame * loop.swaySpeed + loop.swayPhase);
          const currentHeight = loop.maxHeight * (0.86 + sway * 0.14);
          const peakY = height - currentHeight;
          const midX = (loop.x1 + loop.x2) / 2 + sway * 30;

          ctx.save();
          ctx.strokeStyle = loop.color === '#ff5e00' ? 'rgba(255, 94, 0, 0.12)' : 'rgba(255, 183, 3, 0.12)';
          ctx.lineWidth = loop.lineWidth * 2.8;
          ctx.beginPath();
          ctx.moveTo(loop.x1, height);
          ctx.bezierCurveTo(loop.x1, peakY, midX, peakY, midX, peakY);
          ctx.bezierCurveTo(midX, peakY, loop.x2, peakY, loop.x2, height);
          ctx.stroke();

          ctx.strokeStyle = loop.color === '#ff5e00' ? 'rgba(255, 94, 0, 0.35)' : 'rgba(255, 183, 3, 0.32)';
          ctx.lineWidth = loop.lineWidth;
          ctx.beginPath();
          ctx.moveTo(loop.x1, height);
          ctx.bezierCurveTo(loop.x1, peakY, midX, peakY, midX, peakY);
          ctx.bezierCurveTo(midX, peakY, loop.x2, peakY, loop.x2, height);
          ctx.stroke();
          ctx.restore();
        });

        (state.motes || []).forEach((m) => {
          m.y += m.vy;
          m.x += Math.sin(frame * m.swaySpeed + m.phase) * m.swayAmp;
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
      } else if (activeTheme === 'cosmic-singularity') {
        // 4. 🌌 Cosmic Singularity (Black Hole: Gravitational Lensing Parallax & Accretion Disk)
        ctx.save();
        const singX = mouseX;
        const singY = mouseY;
        const coreR = state.coreRadius || 42;

        // 1. Spacetime Coordinate Grid warped towards Singularity
        const step = width < 768 ? 75 : 60;
        ctx.strokeStyle = 'rgba(123, 44, 191, 0.08)';
        ctx.lineWidth = 0.8;

        // Warped Horizontal Grid Lines
        for (let gy = 0; gy <= height; gy += step) {
          ctx.beginPath();
          for (let gx = 0; gx <= width; gx += 25) {
            const dx = singX - gx;
            const dy = singY - gy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Hyperbolic gravitational lensing displacement
            const warpFactor = (coreR * 85) / (dist + 65);
            const wx = gx + (dx / (dist + 0.1)) * warpFactor;
            const wy = gy + (dy / (dist + 0.1)) * warpFactor;
            if (gx === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.stroke();
        }

        // 2. Accretion Disk Ambient Corona Glow
        const haloGrad = ctx.createRadialGradient(singX, singY, coreR * 0.8, singX, singY, coreR * 5);
        haloGrad.addColorStop(0, 'rgba(255, 122, 0, 0.35)');
        haloGrad.addColorStop(0.3, 'rgba(123, 44, 191, 0.22)');
        haloGrad.addColorStop(0.7, 'rgba(19, 15, 38, 0.12)');
        haloGrad.addColorStop(1, 'rgba(2, 2, 5, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(singX, singY, coreR * 5, 0, Math.PI * 2);
        ctx.fill();

        // 3. Swirling Relativistic Accretion Disk Particles
        (state.diskParticles || []).forEach((p) => {
          p.angle += p.speed;
          // Tilted elliptical Keplerian orbit around singularity
          const tiltFactor = 0.35; // orbital perspective inclination
          const px = singX + Math.cos(p.angle) * p.r;
          const py = singY + Math.sin(p.angle) * (p.r * tiltFactor);

          ctx.save();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // 4. Hawking Radiation Quantum Sparks
        (state.hawkingParticles || []).forEach((h) => {
          h.dist += h.vDist;
          if (h.dist > (width < 768 ? 180 : 320)) {
            h.dist = coreR;
            h.angle = Math.random() * Math.PI * 2;
          }
          const hx = singX + Math.cos(h.angle) * h.dist;
          const hy = singY + Math.sin(h.angle) * h.dist;

          ctx.save();
          ctx.fillStyle = h.color;
          ctx.globalAlpha = Math.max(0, 0.6 - h.dist / (width < 768 ? 200 : 340));
          ctx.beginPath();
          ctx.arc(hx, hy, h.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // 5. Razor-thin Photon Sphere & Absolute Event Horizon Core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#ff7a00';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(singX, singY, coreR * 1.08, 0, Math.PI * 2);
        ctx.stroke();

        // Pure pitch black event horizon
        ctx.fillStyle = '#020205';
        ctx.beginPath();
        ctx.arc(singX, singY, coreR, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (activeTheme === 'plasma-web') {
        // 5. 🪐 Cyberpunk Plasma Web
        const nodes = state.nodes || [];
        const maxDist = state.maxDistance || 120;

        nodes.forEach((n) => {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        });

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

        nodes.forEach((n) => {
          const pulse = (Math.sin(frame * 0.03 + n.pulsePhase) + 1) * 0.5;
          ctx.save();
          ctx.strokeStyle = n.color === '#00ff66' ? 'rgba(0, 255, 102, 0.22)' : 'rgba(37, 99, 235, 0.22)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 3 + pulse * 4, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = n.color;
          ctx.globalAlpha = 0.6 + pulse * 0.35;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (activeTheme === 'cyber-foundry') {
        // 6. ⚡ Cyber-Industrial Foundry (Chasing Dash-Array Spark Flux & Gravity Sparks)
        ctx.save();

        // 1. Ambient Blast Furnace Heat Glow along bottom
        const furnaceGrad = ctx.createLinearGradient(0, height - 140, 0, height);
        furnaceGrad.addColorStop(0, 'rgba(17, 18, 21, 0)');
        furnaceGrad.addColorStop(0.5, 'rgba(255, 79, 0, 0.07)');
        furnaceGrad.addColorStop(1, 'rgba(255, 183, 0, 0.14)');
        ctx.fillStyle = furnaceGrad;
        ctx.fillRect(0, height - 140, width, 140);

        // 2. High-voltage industrial conduit lines
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)'; // Galvanized steel
        (state.conduits || []).forEach((c) => {
          ctx.beginPath();
          ctx.moveTo(c.x1, c.y1);
          ctx.lineTo(c.x2, c.y2);
          ctx.stroke();
        });

        // 3. High-velocity Chasing Laser Dashes along conduits
        (state.laserDashes || []).forEach((d) => {
          d.pos += d.speed;
          const limit = d.isHoriz ? width : height;
          if (d.pos > limit + d.length) d.pos = -d.length;
          else if (d.pos < -d.length) d.pos = limit + d.length;

          ctx.save();
          ctx.strokeStyle = d.color;
          ctx.lineWidth = 2.2;
          ctx.shadowColor = d.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          if (d.isHoriz) {
            ctx.moveTo(d.pos, d.coord);
            ctx.lineTo(d.pos + (d.speed > 0 ? d.length : -d.length), d.coord);
          } else {
            ctx.moveTo(d.coord, d.pos);
            ctx.lineTo(d.coord, d.pos + (d.speed > 0 ? d.length : -d.length));
          }
          ctx.stroke();
          ctx.restore();

          // Spawn welding spark periodically at conduit junctions
          if (Math.random() < 0.04) {
            const inactive = (state.sparkPool || []).find((s) => !s.active);
            if (inactive) {
              inactive.active = true;
              inactive.x = d.isHoriz ? d.pos : d.coord;
              inactive.y = d.isHoriz ? d.coord : d.pos;
              inactive.vx = (Math.random() - 0.5) * 3.5;
              inactive.vy = -(1.2 + Math.random() * 3.2); // initial upward burst
              inactive.life = 0;
              inactive.maxLife = 35 + Math.random() * 25;
              inactive.color = Math.random() > 0.4 ? '#ffb700' : '#ff4f00';
            }
          }
        });

        // 4. Gravity-simulated welding/grinding sparks
        (state.sparkPool || []).forEach((sp) => {
          if (!sp.active) return;
          sp.life++;
          sp.vy += 0.14; // gravity acceleration
          sp.vx *= 0.98; // air drag
          sp.x += sp.vx;
          sp.y += sp.vy;

          if (sp.life >= sp.maxLife || sp.y > height) {
            sp.active = false;
            return;
          }

          const alpha = 1 - sp.life / sp.maxLife;
          ctx.save();
          ctx.strokeStyle = sp.color;
          ctx.lineWidth = 1.4;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(sp.x - sp.vx * 2, sp.y - sp.vy * 2);
          ctx.lineTo(sp.x, sp.y);
          ctx.stroke();
          ctx.restore();
        });

        ctx.restore();
      } else if (activeTheme === 'bioluminescent-trench') {
        // 7. 🪸 Bioluminescent Deep Trench (Pulse Wave Echolocation & Floating Organisms)
        ctx.save();

        // 1. Hydro-Thermal Ambient Glow
        const abyssGrad = ctx.createRadialGradient(
          state.sonarOriginX || width * 0.5,
          state.sonarOriginY || height * 0.52,
          0,
          state.sonarOriginX || width * 0.5,
          state.sonarOriginY || height * 0.52,
          Math.max(width, height) * 0.65
        );
        abyssGrad.addColorStop(0, 'rgba(10, 25, 47, 0.45)');
        abyssGrad.addColorStop(0.6, 'rgba(1, 4, 9, 0.2)');
        abyssGrad.addColorStop(1, 'rgba(1, 4, 9, 0)');
        ctx.fillStyle = abyssGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Expanding Sonar Echolocation Wavefront Rings
        (state.sonarWaves || []).forEach((w) => {
          w.radius += w.speed;
          if (w.radius > (state.maxSonarRadius || 800)) {
            w.radius = 0;
          }
          const progress = w.radius / (state.maxSonarRadius || 800);
          const currentAlpha = Math.max(0, w.alpha * (1 - progress));

          ctx.save();
          ctx.strokeStyle = w.color;
          ctx.lineWidth = 1.8 * (1 - progress * 0.5);
          ctx.globalAlpha = currentAlpha;
          ctx.shadowColor = w.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(state.sonarOriginX, state.sonarOriginY, w.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        });

        // 3. Floating Bioluminescent Organisms (Jellyfish / Medusa)
        (state.organisms || []).forEach((org) => {
          org.y += org.vy;
          org.x += Math.sin(frame * org.swimSpeed + org.swimPhase) * org.driftAmp;
          if (org.y < -org.bellRadius * 2) {
            org.y = height + org.bellRadius * 2;
            org.x = Math.random() * width;
          }

          // Swimming pulsation cycle
          const pulse = (Math.sin(frame * org.swimSpeed * 2 + org.swimPhase) + 1) * 0.5;
          const currentRadius = org.bellRadius * (0.88 + pulse * 0.24);

          ctx.save();
          ctx.translate(org.x, org.y);

          // Translucent umbrella bell dome
          ctx.fillStyle = org.color === '#39ff14' ? 'rgba(57, 255, 20, 0.08)' : 'rgba(225, 0, 255, 0.08)';
          ctx.strokeStyle = org.color === '#39ff14' ? 'rgba(57, 255, 20, 0.45)' : 'rgba(225, 0, 255, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.shadowColor = org.color;
          ctx.shadowBlur = 10;

          ctx.beginPath();
          ctx.arc(0, 0, currentRadius, Math.PI, 0, false);
          ctx.quadraticCurveTo(0, currentRadius * 0.25, -currentRadius, 0);
          ctx.fill();
          ctx.stroke();

          // Bioluminescent nucleus photophore core
          ctx.fillStyle = org.color;
          ctx.globalAlpha = 0.6 + pulse * 0.35;
          ctx.beginPath();
          ctx.arc(0, -currentRadius * 0.35, currentRadius * 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Trailing fluid wavy tentacles
          ctx.lineWidth = 0.9;
          ctx.strokeStyle = org.color === '#39ff14' ? 'rgba(57, 255, 20, 0.25)' : 'rgba(225, 0, 255, 0.25)';
          const span = (currentRadius * 1.6) / Math.max(org.tentacleCount - 1, 1);
          for (let t = 0; t < org.tentacleCount; t++) {
            const tx = -currentRadius * 0.8 + t * span;
            const tLen = currentRadius * (1.8 + (t % 2) * 0.6);
            const sway = Math.sin(frame * 0.04 + org.swimPhase + t * 0.8) * 8;

            ctx.beginPath();
            ctx.moveTo(tx, 0);
            ctx.bezierCurveTo(tx + sway * 0.5, tLen * 0.5, tx - sway, tLen * 0.8, tx + sway, tLen);
            ctx.stroke();
          }

          ctx.restore();
        });

        // 4. Drifting Marine Snow Motes
        (state.marineSnow || []).forEach((sn) => {
          sn.y += sn.vy;
          sn.x += Math.sin(frame * sn.swaySpeed + sn.phase) * sn.swayAmp;
          if (sn.y > height + 10) {
            sn.y = -10;
            sn.x = Math.random() * width;
          }

          const shimmer = (Math.sin(frame * 0.025 + sn.phase) + 1) * 0.5;
          ctx.save();
          ctx.fillStyle = sn.color;
          ctx.globalAlpha = sn.alpha * (0.6 + shimmer * 0.4);
          ctx.beginPath();
          ctx.arc(sn.x, sn.y, sn.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        ctx.restore();
      } else if (activeTheme === 'yokohama-night') {
        // 8. 🏮 Neo-Yokohama Night Alley (Chromatic Rain & Wet Neon Puddle Reflections)
        ctx.save();

        // 1. Wet Asphalt Ground Chromatic Puddle Light Leaks (Shifted chromatic reflection)
        (state.puddleLeaks || []).forEach((leak) => {
          const breathe = Math.sin(frame * 0.015 + leak.phase);
          const rx = leak.rx * (0.95 + breathe * 0.08);
          const ry = leak.ry * (0.95 - breathe * 0.08);

          // Chromatic aberration split (Red shifted left, Teal shifted right)
          // Primary puddle body
          const grad = ctx.createRadialGradient(leak.x, leak.y, 0, leak.x, leak.y, rx);
          grad.addColorStop(0, leak.color === '#ff0055' ? 'rgba(255, 0, 85, 0.16)' : (leak.color === '#00ffcc' ? 'rgba(0, 255, 204, 0.14)' : 'rgba(255, 240, 102, 0.14)'));
          grad.addColorStop(0.5, leak.color === '#ff0055' ? 'rgba(255, 0, 85, 0.04)' : (leak.color === '#00ffcc' ? 'rgba(0, 255, 204, 0.03)' : 'rgba(255, 240, 102, 0.03)'));
          grad.addColorStop(1, 'rgba(8, 7, 12, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(leak.x, leak.y, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
        });

        // 2. Concentric Raindrop Impact Ripples in Puddles
        (state.ripples || []).forEach((rp) => {
          rp.radius += rp.speed;
          if (rp.radius > rp.maxRadius) {
            rp.radius = 0;
            rp.x = Math.random() * width;
            rp.y = height * (0.55 + Math.random() * 0.42);
          }

          const progress = rp.radius / rp.maxRadius;
          const currentAlpha = Math.max(0, rp.alpha * (1 - progress));

          ctx.save();
          ctx.strokeStyle = rp.color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = currentAlpha;
          ctx.beginPath();
          // Perspective ellipse for ground plane
          ctx.ellipse(rp.x, rp.y, rp.radius, rp.radius * 0.36, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        });

        // 3. Fast Angled Cyber Rain Streaks
        ctx.lineWidth = 1;
        (state.rainDrops || []).forEach((rd) => {
          rd.x += rd.vx;
          rd.y += rd.vy;
          if (rd.y > height + 20 || rd.x < -100) {
            rd.y = -rd.len;
            rd.x = Math.random() * (width + 200);
          }

          ctx.save();
          ctx.strokeStyle = `rgba(0, 255, 204, ${rd.alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(rd.x, rd.y);
          ctx.lineTo(rd.x - rd.vx * 1.5, rd.y - rd.len);
          ctx.stroke();
          ctx.restore();
        });

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
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
