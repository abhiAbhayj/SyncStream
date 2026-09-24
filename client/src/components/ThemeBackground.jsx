import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Custom Mathematical Simulation Engines:
 * 1. ocean     — 🌌 Cosmic Stargate: Hyperspace Warp Streaks, Flowing Auroral Curtains & Diamond Constellations
 * 2. inferno   — 🌋 Inferno Solaris: Solar Plasma Prominence Arcs & Coronal Mass Ejection Sparks
 * 3. matrix    — ⚡ Cyberpunk Holo-Matrix: 3D Hexagonal Energy Shield & Laser Conduit Network
 * 4. monochrome— 🌑 Monolith Chrono: 3D Tesseract Monolith Hypercubes, Quantum Oscilloscope Beams & Chrome Shards
 * 5. arctic    — 🧊 Glacial Prism: 3D Projected Quartz Polyhedra & Soft Prismatic Refraction (Subtle Soft Glow)
 * 6. tokyo     — 🪩 Retro Synthwave Highway: Infinite Outrun 3D Wireframe Road & Neon Skyline (Balanced Dark Mode)
 * 7. cyber     — 👑 Imperial Gold Luxe: Cascading 24K Gold Silk Streams, 3D Floating Gold Bars & Diamond Stars
 * 8. amethyst  — 🌿 Bio-Luminescent Pandora: Ethereal Swimming Jellyfish Flora & Bioluminescent River Waves
 */
export default function ThemeBackground() {
  const canvasRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('syncstream_theme') || 'ocean';
  });

  // Track body class changes to switch animation mode instantly
  useEffect(() => {
    const detectTheme = () => {
      const classList = document.body.classList;
      if (classList.contains('theme-inferno')) return 'inferno';
      if (classList.contains('theme-matrix')) return 'matrix';
      if (classList.contains('theme-monochrome')) return 'monochrome';
      if (classList.contains('theme-arctic')) return 'arctic';
      if (classList.contains('theme-tokyo')) return 'tokyo';
      if (classList.contains('theme-cyber')) return 'cyber';
      if (classList.contains('theme-amethyst')) return 'amethyst';
      return localStorage.getItem('syncstream_theme') || 'ocean';
    };

    setActiveTheme(detectTheme());

    const observer = new MutationObserver(() => {
      setActiveTheme(detectTheme());
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const handleStorage = (e) => {
      if (e.key === 'syncstream_theme') {
        setActiveTheme(e.newValue || 'ocean');
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
    let particles = [];
    let customEntities = [];
    let waves = [];
    let comets = [];
    let frame = 0;

    function initScene(theme) {
      particles = [];
      customEntities = [];
      waves = [];
      comets = [];
      frame = 0;

      const isMobile = width < 768;

      if (theme === 'ocean') {
        // 🌌 1. Cosmic Stargate (Hyperspace Warp Streaks, Flowing Auroral Plasma Curtains & Diamond Constellations - 100% NON-CIRCULAR)
        // Multi-layered Diagonal Auroral Plasma Light Curtains
        waves = [
          { yRatio: 0.30, amp: 55, freq: 0.0016, speed: 0.005, phase: 0, color: 'rgba(168, 85, 247, 0.08)' }, // Celestial Violet
          { yRatio: 0.50, amp: 70, freq: 0.0012, speed: -0.004, phase: 1.5, color: 'rgba(0, 245, 212, 0.07)' }, // Hyper Turquoise
          { yRatio: 0.70, amp: 60, freq: 0.0018, speed: 0.006, phase: 3.0, color: 'rgba(255, 89, 100, 0.06)' }, // Solar Coral
          { yRatio: 0.85, amp: 45, freq: 0.0022, speed: -0.005, phase: 4.2, color: 'rgba(255, 209, 102, 0.05)' } // Supernova Gold
        ];

        // Linear Hyperspace Warp Streaks
        const streakCount = isMobile ? 35 : 75;
        const colors = ['#00f5d4', '#a855f7', '#ff5964', '#ffd166', '#ffffff'];
        for (let i = 0; i < streakCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            len: 30 + Math.random() * 80,
            speed: 3 + Math.random() * 6,
            angle: -Math.PI / 6 + (Math.random() - 0.5) * 0.15,
            width: 1 + Math.random() * 1.8,
            color: colors[i % colors.length],
            opacity: 0.25 + Math.random() * 0.65
          });
        }

        // Drifting Diamond Star Constellations
        const nodeCount = isMobile ? 12 : 24;
        customEntities = [];
        for (let i = 0; i < nodeCount; i++) {
          customEntities.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: 2.5 + Math.random() * 3.5,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.03,
            color: colors[i % colors.length]
          });
        }
      } else if (theme === 'inferno') {
        // 🌋 2. Inferno Solaris (Solar Surface Plasma Prominence Arcs)
        const arcCount = isMobile ? 3 : 5;
        for (let i = 0; i < arcCount; i++) {
          customEntities.push({
            x1: Math.random() * width,
            y1: height,
            x2: Math.random() * width,
            y2: height,
            controlHeight: 120 + Math.random() * 240,
            phase: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.02,
            thickness: 2 + Math.random() * 4,
            color: i % 2 === 0 ? '#ff5500' : '#ff0044'
          });
        }
        const sparkCount = isMobile ? 35 : 75;
        for (let i = 0; i < sparkCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: height * 0.6 + Math.random() * (height * 0.4),
            size: 1.5 + Math.random() * 3.5,
            speedY: -(1.5 + Math.random() * 3.5),
            speedX: (Math.random() - 0.5) * 2,
            life: Math.random() * 70,
            maxLife: 50 + Math.random() * 70,
            hue: Math.random() > 0.4 ? 20 + Math.random() * 25 : 350 + Math.random() * 20
          });
        }
      } else if (theme === 'matrix') {
        // ⚡ 3. Cyberpunk Holo-Matrix (Dynamic 3D Hexagonal Energy Shield & Laser Ray Network)
        const hexRadius = isMobile ? 45 : 60;
        const hexWidth = hexRadius * Math.sqrt(3);
        const hexHeight = hexRadius * 1.5;
        const cols = Math.ceil(width / hexWidth) + 1;
        const rows = Math.ceil(height / hexHeight) + 1;

        customEntities = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = c * hexWidth + (r % 2 === 1 ? hexWidth / 2 : 0);
            const y = r * hexHeight;
            customEntities.push({
              x,
              y,
              r: hexRadius * 0.95,
              pulse: Math.random() * Math.PI * 2,
              pulseSpeed: 0.02 + Math.random() * 0.03,
              activeAlpha: 0
            });
          }
        }

        const pulseCount = isMobile ? 12 : 24;
        for (let i = 0; i < pulseCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            targetX: Math.random() * width,
            targetY: Math.random() * height,
            speed: 0.01 + Math.random() * 0.02,
            progress: Math.random(),
            color: Math.random() > 0.5 ? '#00f0ff' : '#ff007f'
          });
        }
      } else if (theme === 'monochrome') {
        // 🌑 4. Monolith Chrono (3D Rotating Tesseract Hypercube Monoliths & Quantum Oscilloscope Lasers - 100% NON-CIRCULAR)
        // 3D Monolith Hypercube Frames
        customEntities = [
          // Outer Monolith Obelisk Frame
          {
            w: isMobile ? 50 : 75,
            h: isMobile ? 100 : 155,
            d: isMobile ? 50 : 75,
            rotX: 0.3, rotY: 0.2, rotZ: 0,
            speedX: 0.004, speedY: 0.007, speedZ: 0.003,
            color: '#e2e8f0', // Liquid Chrome
            alpha: 0.38,
            lineWidth: 1.4
          },
          // Inner Quantum Cube Core
          {
            w: isMobile ? 26 : 40,
            h: isMobile ? 26 : 40,
            d: isMobile ? 26 : 40,
            rotX: 0.8, rotY: -0.4, rotZ: 0.5,
            speedX: -0.009, speedY: 0.008, speedZ: -0.006,
            color: '#3b82f6', // Electric Cobalt
            alpha: 0.55,
            lineWidth: 1.6
          },
          // Secondary Satellite Monolith Slab
          {
            w: isMobile ? 16 : 24,
            h: isMobile ? 60 : 90,
            d: isMobile ? 16 : 24,
            rotX: -0.5, rotY: 0.6, rotZ: 0.2,
            speedX: 0.006, speedY: -0.005, speedZ: 0.007,
            color: '#ef4444', // Neon Crimson
            alpha: 0.45,
            lineWidth: 1.2
          }
        ];

        // Quantum Oscilloscope Frequency Waveform Beams
        waves = [
          { yRatio: 0.38, freq: 0.008, speed: 0.04, amp: 22, color: 'rgba(59, 130, 246, 0.35)', phase: 0 },
          { yRatio: 0.62, freq: 0.012, speed: -0.03, amp: 18, color: 'rgba(239, 68, 68, 0.30)', phase: 2 },
          { yRatio: 0.82, freq: 0.006, speed: 0.02, amp: 14, color: 'rgba(226, 232, 240, 0.25)', phase: 4 }
        ];

        // Floating Chrome Geometric Shards (Rectangular / Diamond Polygons - NO circles)
        const shardCount = isMobile ? 15 : 30;
        const shardColors = ['#e2e8f0', '#3b82f6', '#ef4444', '#ffffff'];
        for (let i = 0; i < shardCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            w: 4 + Math.random() * 8,
            h: 8 + Math.random() * 16,
            vx: (Math.random() - 0.5) * 0.7,
            vy: (Math.random() - 0.5) * 0.7,
            rot: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.03,
            color: shardColors[i % shardColors.length],
            opacity: 0.25 + Math.random() * 0.5
          });
        }
      } else if (theme === 'arctic') {
        // 🧊 5. Glacial Prism (Soft Subtle 3D Quartz Crystals & Delicate Refraction Rays)
        const crystalCount = isMobile ? 4 : 7;
        customEntities = [];
        for (let i = 0; i < crystalCount; i++) {
          customEntities.push({
            x: (width * (i + 0.5)) / crystalCount + (Math.random() - 0.5) * 40,
            y: height * 0.25 + Math.random() * (height * 0.5),
            size: 18 + Math.random() * 24,
            rotX: Math.random() * Math.PI,
            rotY: Math.random() * Math.PI,
            rotZ: Math.random() * Math.PI,
            speedX: 0.006 + Math.random() * 0.008,
            speedY: 0.005 + Math.random() * 0.007,
            speedZ: 0.003 + Math.random() * 0.005,
            floatPhase: Math.random() * Math.PI * 2,
            color: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#ec4899' : '#34d399'
          });
        }

        // Shimmering Soft Blizzard Dust
        const dustCount = isMobile ? 30 : 60;
        for (let i = 0; i < dustCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.2,
            speedY: 0.3 + Math.random() * 0.9,
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: 0.15 + Math.random() * 0.45,
            color: Math.random() > 0.6 ? '#38bdf8' : Math.random() > 0.3 ? '#ec4899' : '#34d399'
          });
        }
      } else if (theme === 'tokyo') {
        // 🪩 6. Retro Synthwave Highway (Moody Outrun 3D Road & Megacity Skyline)
        const buildingCount = isMobile ? 14 : 28;
        const horizonY = height * 0.54;
        const bWidth = width / buildingCount;
        customEntities = [];
        for (let i = 0; i < buildingCount; i++) {
          const bHeight = 20 + Math.random() * 75;
          customEntities.push({
            x: i * bWidth,
            w: bWidth + 2,
            h: bHeight,
            hasAntenna: Math.random() > 0.7,
            color: i % 2 === 0 ? 'rgba(28, 6, 42, 0.95)' : 'rgba(48, 10, 68, 0.95)'
          });
        }

        // Speeding Laser Cars
        particles = [];
        const carCount = isMobile ? 6 : 12;
        for (let i = 0; i < carCount; i++) {
          particles.push({
            lane: (Math.random() - 0.5) * 1.5,
            dist: Math.random(),
            speed: 0.006 + Math.random() * 0.012,
            color: Math.random() > 0.5 ? '#00f5ff' : '#ff455b'
          });
        }
      } else if (theme === 'cyber') {
        // 👑 7. Imperial Gold Luxe (Cascading 24K Gold Silk Streams, 3D Rotating Gold Ingots & Diamond Stars - 100% NON-CIRCULAR)
        // Multi-layered Fluid 24K Gold & Emerald Silk Ribbons
        waves = [
          { yRatio: 0.25, amp: 40, freq: 0.0016, speed: 0.005, phase: 0, color: 'rgba(255, 199, 0, 0.08)' }, // 24K Liquid Gold
          { yRatio: 0.48, amp: 55, freq: 0.0013, speed: -0.004, phase: 1.6, color: 'rgba(224, 122, 0, 0.07)' }, // Royal Amber
          { yRatio: 0.72, amp: 45, freq: 0.0020, speed: 0.006, phase: 3.2, color: 'rgba(0, 212, 170, 0.05)' }, // Emerald Glow
          { yRatio: 0.90, amp: 35, freq: 0.0024, speed: -0.005, phase: 4.5, color: 'rgba(255, 240, 170, 0.06)' } // Champagne Diamond
        ];

        // 3D Floating Rotating Gold Ingots / Rhomboid Diamond Gems
        const gemCount = isMobile ? 3 : 5;
        customEntities = [];
        const gemColors = ['#ffc700', '#e07a00', '#00d4aa', '#fff0aa'];
        for (let i = 0; i < gemCount; i++) {
          customEntities.push({
            x: (width * (i + 0.5)) / gemCount + (Math.random() - 0.5) * 40,
            y: height * 0.25 + Math.random() * (height * 0.5),
            w: 16 + Math.random() * 18,
            h: 24 + Math.random() * 24,
            d: 14 + Math.random() * 16,
            rotX: Math.random() * Math.PI,
            rotY: Math.random() * Math.PI,
            rotZ: Math.random() * Math.PI,
            speedX: 0.005 + Math.random() * 0.006,
            speedY: 0.004 + Math.random() * 0.007,
            speedZ: 0.003 + Math.random() * 0.005,
            floatPhase: Math.random() * Math.PI * 2,
            color: gemColors[i % gemColors.length]
          });
        }

        // Ascending 4-Point Diamond Sparkle Stars (NO circles!)
        const starCount = isMobile ? 25 : 55;
        for (let i = 0; i < starCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 2.2 + Math.random() * 4.5,
            speedY: -(0.3 + Math.random() * 0.8),
            speedX: (Math.random() - 0.5) * 0.4,
            rot: Math.random() * Math.PI,
            rotSpeed: 0.02 + Math.random() * 0.03,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.03 + Math.random() * 0.03,
            color: Math.random() > 0.6 ? '#ffc700' : Math.random() > 0.3 ? '#fff0aa' : '#00d4aa',
            opacity: 0.3 + Math.random() * 0.6
          });
        }
      } else if (theme === 'amethyst') {
        // 🌿 8. Bio-Luminescent Pandora (NEW: Swimming Jellyfish Fauna & Bioluminescent River Waves)
        // Luminescent River Waves along bottom
        waves = [
          { yRatio: 0.75, amp: 30, freq: 0.0020, speed: 0.008, phase: 0, color: 'rgba(0, 255, 136, 0.07)' },
          { yRatio: 0.88, amp: 42, freq: 0.0015, speed: -0.006, phase: 2.2, color: 'rgba(255, 42, 133, 0.06)' }
        ];

        // Swimming Bioluminescent Jellyfish Fauna
        const jellyCount = isMobile ? 3 : 6;
        customEntities = [];
        for (let i = 0; i < jellyCount; i++) {
          customEntities.push({
            x: (width * (i + 0.5)) / jellyCount + (Math.random() - 0.5) * 50,
            y: height * 0.3 + Math.random() * (height * 0.5),
            size: 16 + Math.random() * 16,
            speedY: -(0.4 + Math.random() * 0.6),
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.015 + Math.random() * 0.015,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.03 + Math.random() * 0.02,
            tentacleCount: 4 + Math.floor(Math.random() * 3),
            color: i % 3 === 0 ? '#00ff88' : i % 3 === 1 ? '#ff2a85' : '#00e5ff'
          });
        }

        // Glowing Forest Firefly Spores
        const sporeCount = isMobile ? 30 : 65;
        for (let i = 0; i < sporeCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.5,
            speedY: -(0.2 + Math.random() * 0.5),
            speedX: (Math.random() - 0.5) * 0.4,
            color: Math.random() > 0.5 ? '#00ff88' : Math.random() > 0.25 ? '#ff2a85' : '#b4ff39',
            pulse: Math.random() * Math.PI * 2,
            opacity: 0.3 + Math.random() * 0.5
          });
        }
      }
    }

    initScene(activeTheme);

    // ── Simulation Render Loop ──
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (activeTheme === 'ocean') {
        // 🌌 1. Cosmic Stargate (Flowing Auroral Curtains, Hyperspace Warp Streaks & Diamond Constellations - 100% NON-CIRCULAR)
        // 1. Flowing Multi-Layered Auroral Plasma Curtains
        waves.forEach((w) => {
          w.phase += w.speed;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 20) {
            const y = height * w.yRatio + Math.sin(x * w.freq + w.phase) * w.amp + Math.cos(x * w.freq * 0.6 - w.phase * 0.8) * (w.amp * 0.5);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fillStyle = w.color;
          ctx.fill();
        });

        // 2. Linear Hyperspace Warp Streaks (No circles, pure linear speed beams)
        particles.forEach((p) => {
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed;

          if (p.x < -100 || p.y < -100 || p.x > width + 100 || p.y > height + 100) {
            p.x = width + Math.random() * 100;
            p.y = Math.random() * height * 0.9;
          }

          const tailX = p.x - Math.cos(p.angle) * p.len;
          const tailY = p.y - Math.sin(p.angle) * p.len;

          const streakGrad = ctx.createLinearGradient(p.x, p.y, tailX, tailY);
          streakGrad.addColorStop(0, p.color);
          streakGrad.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = streakGrad;
          ctx.lineWidth = p.width;
          ctx.globalAlpha = p.opacity;
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Diamond head glint (4-pointed star, NOT a circle)
          const sz = p.width * 1.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - sz);
          ctx.lineTo(p.x + sz * 0.5, p.y);
          ctx.lineTo(p.x, p.y + sz);
          ctx.lineTo(p.x - sz * 0.5, p.y);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });

        // 3. Drifting Diamond Constellation Laser Network (NO circles!)
        for (let i = 0; i < customEntities.length; i++) {
          const n1 = customEntities[i];
          n1.x += n1.vx;
          n1.y += n1.vy;
          n1.pulse += n1.pulseSpeed;

          if (n1.x < 0 || n1.x > width) n1.vx *= -1;
          if (n1.y < 0 || n1.y > height) n1.vy *= -1;

          // Constellation Connecting Laser Lines
          for (let j = i + 1; j < customEntities.length; j++) {
            const n2 = customEntities[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.hypot(dx, dy);
            const maxDist = width < 768 ? 120 : 180;
            if (dist < maxDist) {
              const lineAlpha = (1 - dist / maxDist) * 0.28;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.strokeStyle = `rgba(0, 245, 212, ${lineAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }

          // 4-Point Diamond Star Glint Node
          const pulseSz = n1.size * (0.8 + 0.3 * Math.sin(n1.pulse));
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y - pulseSz * 1.5);
          ctx.lineTo(n1.x + pulseSz * 0.45, n1.y);
          ctx.lineTo(n1.x, n1.y + pulseSz * 1.5);
          ctx.lineTo(n1.x - pulseSz * 0.45, n1.y);
          ctx.closePath();
          ctx.fillStyle = n1.color;
          ctx.fill();

          // Horizontal star cross
          ctx.beginPath();
          ctx.moveTo(n1.x - pulseSz * 1.5, n1.y);
          ctx.lineTo(n1.x, n1.y - pulseSz * 0.45);
          ctx.lineTo(n1.x + pulseSz * 1.5, n1.y);
          ctx.lineTo(n1.x, n1.y + pulseSz * 0.45);
          ctx.closePath();
          ctx.fillStyle = n1.color;
          ctx.fill();
        }
      } else if (activeTheme === 'inferno') {
        // 🌋 2. Inferno Solaris (Solar Plasma Prominences)
        customEntities.forEach((arc) => {
          arc.phase += arc.speed;
          const curControlHeight = arc.controlHeight + Math.sin(arc.phase) * 35;
          const midX = (arc.x1 + arc.x2) / 2;

          ctx.beginPath();
          ctx.moveTo(arc.x1, arc.y1);
          ctx.quadraticCurveTo(midX, height - curControlHeight, arc.x2, arc.y2);
          ctx.strokeStyle = arc.color;
          ctx.lineWidth = arc.thickness;
          ctx.globalAlpha = 0.35 + 0.15 * Math.sin(arc.phase);
          ctx.shadowColor = arc.color;
          ctx.shadowBlur = 14;
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
        ctx.shadowBlur = 0;

        // Rising Solar Sparks
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(frame * 0.05 + p.life) * 0.8;
          p.life++;

          if (p.y < height * 0.2 || p.life > p.maxLife) {
            p.y = height + 10;
            p.x = Math.random() * width;
            p.life = 0;
            p.speedY = -(1.5 + Math.random() * 3.5);
          }

          const alpha = (1 - p.life / p.maxLife) * 0.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha})`;
          ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
          ctx.shadowBlur = p.size * 2.5;
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'matrix') {
        // ⚡ 3. Cyberpunk Holo-Matrix (Hexagonal Shield)
        const scanY = (frame * 1.5) % height;
        ctx.lineWidth = 1;
        customEntities.forEach((hex) => {
          hex.pulse += hex.pulseSpeed;
          const distToScan = Math.abs(hex.y - scanY);
          if (distToScan < 50) hex.activeAlpha = 0.8;
          else hex.activeAlpha = Math.max(0, hex.activeAlpha - 0.02);

          const baseAlpha = 0.04 + 0.06 * Math.sin(hex.pulse);
          const totalAlpha = Math.min(0.85, baseAlpha + hex.activeAlpha * 0.6);

          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = hex.x + Math.cos(angle) * hex.r;
            const hy = hex.y + Math.sin(angle) * hex.r;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(0, 240, 255, ${totalAlpha})`;
          if (hex.activeAlpha > 0.2) {
            ctx.fillStyle = `rgba(255, 0, 127, ${hex.activeAlpha * 0.15})`;
            ctx.fill();
          }
          ctx.stroke();
        });

        particles.forEach((p) => {
          p.progress += p.speed;
          if (p.progress >= 1) {
            p.progress = 0;
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.targetX = Math.random() * width;
            p.targetY = Math.random() * height;
          }
          const curX = p.x + (p.targetX - p.x) * p.progress;
          const curY = p.y + (p.targetY - p.y) * p.progress;
          ctx.beginPath();
          ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'monochrome') {
        // 🌑 4. Monolith Chrono (3D Tesseract Monoliths, Quantum Oscilloscope Beams & Geometric Shards - 100% NON-CIRCULAR)
        const centerX = width * 0.5;
        const centerY = height * 0.48;

        // Precision Cyber Crosshair Grid
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, 0); ctx.lineTo(centerX, height);
        ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
        ctx.stroke();

        // 1. Quantum Oscilloscope Frequency Waveform Beams
        waves.forEach((w) => {
          w.phase += w.speed;
          ctx.beginPath();
          for (let x = 0; x <= width; x += 6) {
            // Step-quantized digital quantum wave
            const rawSin = Math.sin(x * w.freq + w.phase);
            const stepped = Math.floor(rawSin * 3) / 3;
            const y = height * w.yRatio + stepped * w.amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = w.color;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        });

        // 2. 3D Rotating Monolith Tesseract Hypercubes
        customEntities.forEach((cube) => {
          cube.rotX += cube.speedX;
          cube.rotY += cube.speedY;
          cube.rotZ += cube.speedZ;

          const rawVertices = [
            [-cube.w, -cube.h, -cube.d],
            [cube.w, -cube.h, -cube.d],
            [cube.w, cube.h, -cube.d],
            [-cube.w, cube.h, -cube.d],
            [-cube.w, -cube.h, cube.d],
            [cube.w, -cube.h, cube.d],
            [cube.w, cube.h, cube.d],
            [-cube.w, cube.h, cube.d]
          ];

          const proj = rawVertices.map(([vx, vy, vz]) => {
            let y1 = vy * Math.cos(cube.rotX) - vz * Math.sin(cube.rotX);
            let z1 = vy * Math.sin(cube.rotX) + vz * Math.cos(cube.rotX);
            let x2 = vx * Math.cos(cube.rotY) + z1 * Math.sin(cube.rotY);
            let z2 = -vx * Math.sin(cube.rotY) + z1 * Math.cos(cube.rotY);
            let x3 = x2 * Math.cos(cube.rotZ) - y1 * Math.sin(cube.rotZ);
            let y3 = x2 * Math.sin(cube.rotZ) + y1 * Math.cos(cube.rotZ);
            return [centerX + x3, centerY + y3];
          });

          const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
          ];

          ctx.strokeStyle = cube.color;
          ctx.lineWidth = cube.lineWidth;
          ctx.globalAlpha = cube.alpha;
          edges.forEach(([i1, i2]) => {
            ctx.beginPath();
            ctx.moveTo(proj[i1][0], proj[i1][1]);
            ctx.lineTo(proj[i2][0], proj[i2][1]);
            ctx.stroke();
          });

          // Monolith Diamond Vertices (No circles!)
          proj.forEach(([px, py]) => {
            ctx.beginPath();
            ctx.moveTo(px, py - 3);
            ctx.lineTo(px + 3, py);
            ctx.lineTo(px, py + 3);
            ctx.lineTo(px - 3, py);
            ctx.closePath();
            ctx.fillStyle = cube.color;
            ctx.fill();
          });
          ctx.globalAlpha = 1;
        });

        // 3. Floating Chrome Geometric Diamond/Rectangular Shards (NO circles)
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.rotSpeed;

          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
          ctx.globalAlpha = 1;
        });
      } else if (activeTheme === 'arctic') {
        // 🧊 5. Glacial Prism (Refined Subtle Crystals with Softer Glow)
        customEntities.forEach((crystal) => {
          crystal.rotX += crystal.speedX;
          crystal.rotY += crystal.speedY;
          crystal.rotZ += crystal.speedZ;
          crystal.floatPhase += 0.02;

          const floatY = crystal.y + Math.sin(crystal.floatPhase) * 12;
          const s = crystal.size;

          const rawVertices = [
            [0, -s * 1.3, 0],
            [s, 0, 0],
            [0, 0, s],
            [-s, 0, 0],
            [0, 0, -s],
            [0, s * 1.3, 0]
          ];

          const proj = rawVertices.map(([vx, vy, vz]) => {
            let y1 = vy * Math.cos(crystal.rotX) - vz * Math.sin(crystal.rotX);
            let z1 = vy * Math.sin(crystal.rotX) + vz * Math.cos(crystal.rotX);
            let x2 = vx * Math.cos(crystal.rotY) + z1 * Math.sin(crystal.rotY);
            let z2 = -vx * Math.sin(crystal.rotY) + z1 * Math.cos(crystal.rotY);
            let x3 = x2 * Math.cos(crystal.rotZ) - y1 * Math.sin(crystal.rotZ);
            let y3 = x2 * Math.sin(crystal.rotZ) + y1 * Math.cos(crystal.rotZ);
            return [crystal.x + x3, floatY + y3, z2];
          });

          const edges = [
            [0, 1], [0, 2], [0, 3], [0, 4],
            [5, 1], [5, 2], [5, 3], [5, 4],
            [1, 2], [2, 3], [3, 4], [4, 1]
          ];

          // Softer, non-glary wireframe lines
          ctx.strokeStyle = `${crystal.color}40`;
          ctx.lineWidth = 1.1;
          edges.forEach(([i1, i2]) => {
            ctx.beginPath();
            ctx.moveTo(proj[i1][0], proj[i1][1]);
            ctx.lineTo(proj[i2][0], proj[i2][1]);
            ctx.stroke();
          });

          // Soft subtle refraction beam
          const beamAngle = crystal.rotY * 2;
          const beamLen = 100;
          const rx = proj[0][0] + Math.cos(beamAngle) * beamLen;
          const ry = proj[0][1] + Math.sin(beamAngle) * beamLen;
          const bGrad = ctx.createLinearGradient(proj[0][0], proj[0][1], rx, ry);
          bGrad.addColorStop(0, `${crystal.color}55`);
          bGrad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.moveTo(proj[0][0], proj[0][1]);
          ctx.lineTo(rx, ry);
          ctx.strokeStyle = bGrad;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

        // Soft Blizzard Ice Dust
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      } else if (activeTheme === 'tokyo') {
        // 🪩 6. Retro Synthwave Highway (Balanced Dark Outrun Mode - Soft Ambient Horizon)
        const horizonY = height * 0.65;
        const sunRadius = Math.min(width, height) * 0.16;
        const sunCenterX = width * 0.5;

        // Moody Striped Neon Sun (Subtle, non-distracting ambient glow)
        ctx.save();
        ctx.beginPath();
        ctx.arc(sunCenterX, horizonY - 6, sunRadius, Math.PI, 0, false);
        ctx.closePath();
        const sunGrad = ctx.createLinearGradient(0, horizonY - 6 - sunRadius, 0, horizonY - 6);
        sunGrad.addColorStop(0, 'rgba(255, 140, 0, 0.40)');
        sunGrad.addColorStop(0.5, 'rgba(255, 45, 85, 0.40)');
        sunGrad.addColorStop(1, 'rgba(140, 20, 180, 0.40)');
        ctx.fillStyle = sunGrad;
        ctx.shadowColor = '#ff2d55';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        // Horizontal Stripes on Sun
        for (let i = 1; i <= 5; i++) {
          const stripeY = horizonY - 6 - (i / 6) * sunRadius;
          ctx.fillStyle = '#12041a';
          ctx.fillRect(sunCenterX - sunRadius, stripeY, sunRadius * 2, 2.2 + i * 0.6);
        }

        // Megacity Skyline Silhouette
        customEntities.forEach((b) => {
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, horizonY - b.h * 0.7, b.w, b.h * 0.7);
        });

        // 3D Perspective Road (Balanced opacity)
        const roadOffset = (frame * 1.2) % 40;
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.16)';
        ctx.lineWidth = 1;

        for (let x = -width * 0.5; x < width * 1.5; x += 70) {
          ctx.beginPath();
          ctx.moveTo(sunCenterX + (x - sunCenterX) * 0.04, horizonY);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        for (let y = 0; y < height - horizonY; y += 22) {
          const curY = horizonY + Math.pow((y + roadOffset) / (height - horizonY), 2) * (height - horizonY);
          if (curY <= height) {
            const lineAlpha = Math.min(0.24, ((curY - horizonY) / (height - horizonY)) * 0.24);
            ctx.strokeStyle = `rgba(255, 69, 91, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(0, curY);
            ctx.lineTo(width, curY);
            ctx.stroke();
          }
        }

        // Speeding Laser Cars on Highway
        particles.forEach((car) => {
          car.dist += car.speed;
          if (car.dist >= 1) car.dist = 0;
          const curY = horizonY + Math.pow(car.dist, 2) * (height - horizonY);
          const spreadX = car.lane * car.dist * (width * 0.6);
          const curX = sunCenterX + spreadX;

          ctx.beginPath();
          ctx.arc(curX, curY, 1.8 + car.dist * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = car.color;
          ctx.shadowColor = car.color;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      } else if (activeTheme === 'cyber') {
        // 👑 7. Imperial Gold Luxe (Cascading 24K Gold Silk Streams, 3D Gold Bars/Diamonds & Diamond Sparkles - 100% NON-CIRCULAR)
        // 1. Cascading 24K Gold & Emerald Silk Streams
        waves.forEach((w) => {
          w.phase += w.speed;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 18) {
            const y = height * w.yRatio + Math.sin(x * w.freq + w.phase) * w.amp;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fillStyle = w.color;
          ctx.fill();
        });

        // 2. Diagonal Celestial God-Ray Sheens
        const rayGrad = ctx.createLinearGradient(0, 0, width * 0.8, height);
        rayGrad.addColorStop(0, 'rgba(255, 199, 0, 0.06)');
        rayGrad.addColorStop(0.5, 'rgba(0, 212, 170, 0.03)');
        rayGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width * 0.4, 0);
        ctx.lineTo(width, height * 0.8);
        ctx.lineTo(width * 0.6, height);
        ctx.closePath();
        ctx.fill();

        // 3. 3D Rotating Floating Gold Bars / Emerald Diamond Polyhedra (NO circles!)
        customEntities.forEach((gem) => {
          gem.rotX += gem.speedX;
          gem.rotY += gem.speedY;
          gem.rotZ += gem.speedZ;
          gem.floatPhase += 0.015;

          const floatY = gem.y + Math.sin(gem.floatPhase) * 14;

          // 3D Diamond Ingot Vertices: Top apex, 4-way equatorial ring, bottom apex
          const rawVertices = [
            [0, -gem.h, 0],
            [gem.w, 0, 0],
            [0, 0, gem.d],
            [-gem.w, 0, 0],
            [0, 0, -gem.d],
            [0, gem.h, 0]
          ];

          const proj = rawVertices.map(([vx, vy, vz]) => {
            let y1 = vy * Math.cos(gem.rotX) - vz * Math.sin(gem.rotX);
            let z1 = vy * Math.sin(gem.rotX) + vz * Math.cos(gem.rotX);
            let x2 = vx * Math.cos(gem.rotY) + z1 * Math.sin(gem.rotY);
            let z2 = -vx * Math.sin(gem.rotY) + z1 * Math.cos(gem.rotY);
            let x3 = x2 * Math.cos(gem.rotZ) - y1 * Math.sin(gem.rotZ);
            let y3 = x2 * Math.sin(gem.rotZ) + y1 * Math.cos(gem.rotZ);
            return [gem.x + x3, floatY + y3];
          });

          const edges = [
            [0, 1], [0, 2], [0, 3], [0, 4],
            [5, 1], [5, 2], [5, 3], [5, 4],
            [1, 2], [2, 3], [3, 4], [4, 1]
          ];

          // Gold Wireframe Bevels
          ctx.strokeStyle = `${gem.color}88`;
          ctx.lineWidth = 1.3;
          edges.forEach(([i1, i2]) => {
            ctx.beginPath();
            ctx.moveTo(proj[i1][0], proj[i1][1]);
            ctx.lineTo(proj[i2][0], proj[i2][1]);
            ctx.stroke();
          });

          // Sparkling Diamond Corner Vertices (4-point diamond star, NOT circle)
          proj.forEach(([px, py]) => {
            ctx.beginPath();
            ctx.moveTo(px, py - 2.5);
            ctx.lineTo(px + 1.5, py);
            ctx.lineTo(px, py + 2.5);
            ctx.lineTo(px - 1.5, py);
            ctx.closePath();
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          });
        });

        // 4. Rising 4-Point Diamond Sparkle Stars (Pure non-circular diamond star geometry)
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.rot += p.rotSpeed;
          p.pulse += p.pulseSpeed;

          if (p.y < -15) {
            p.y = height + 15;
            p.x = Math.random() * width;
          }

          const curSize = p.size * (0.8 + 0.35 * Math.sin(p.pulse));
          const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = alpha;

          // 4-Point Diamond Star Polygon
          ctx.beginPath();
          ctx.moveTo(0, -curSize);
          ctx.lineTo(curSize * 0.35, 0);
          ctx.lineTo(0, curSize);
          ctx.lineTo(-curSize * 0.35, 0);
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(-curSize, 0);
          ctx.lineTo(0, -curSize * 0.35);
          ctx.lineTo(curSize, 0);
          ctx.lineTo(0, curSize * 0.35);
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.fill();

          ctx.restore();
          ctx.globalAlpha = 1;
        });
      } else if (activeTheme === 'amethyst') {
        // 🌿 8. Bio-Luminescent Pandora (NEW: Swimming Jellyfish Fauna & Bioluminescent River Waves)
        // Fluid Bioluminescent River Waves
        waves.forEach((w) => {
          w.phase += w.speed;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 18) {
            const y = height * w.yRatio + Math.sin(x * w.freq + w.phase) * w.amp;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fillStyle = w.color;
          ctx.fill();
        });

        // Swimming Bioluminescent Jellyfish Fauna
        customEntities.forEach((jelly) => {
          jelly.y += jelly.speedY;
          jelly.sway += jelly.swaySpeed;
          jelly.pulse += jelly.pulseSpeed;
          jelly.x += Math.sin(jelly.sway) * 0.7;

          if (jelly.y < -60) {
            jelly.y = height + 40;
            jelly.x = Math.random() * width;
          }

          const pulseFactor = 0.85 + 0.25 * Math.sin(jelly.pulse);
          const r = jelly.size * pulseFactor;

          ctx.save();
          ctx.translate(jelly.x, jelly.y);

          // Glowing Aura
          const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.2);
          aura.addColorStop(0, `${jelly.color}35`);
          aura.addColorStop(1, 'transparent');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Dome Bell
          ctx.beginPath();
          ctx.arc(0, 0, r, Math.PI, 0, false);
          ctx.quadraticCurveTo(r * 0.5, r * 0.25, 0, r * 0.15);
          ctx.quadraticCurveTo(-r * 0.5, r * 0.25, -r, 0);
          ctx.fillStyle = `${jelly.color}45`;
          ctx.strokeStyle = `${jelly.color}99`;
          ctx.lineWidth = 1.3;
          ctx.fill();
          ctx.stroke();

          // Undulating Sinuous Tentacles
          for (let t = 0; t < jelly.tentacleCount; t++) {
            const offsetX = ((t - (jelly.tentacleCount - 1) / 2) * r * 1.4) / jelly.tentacleCount;
            ctx.beginPath();
            ctx.moveTo(offsetX, r * 0.15);
            for (let seg = 1; seg <= 4; seg++) {
              const segY = r * 0.15 + seg * (r * 0.75);
              const segX = offsetX + Math.sin(jelly.sway + seg * 0.8 + t) * (r * 0.3);
              ctx.lineTo(segX, segY);
            }
            ctx.strokeStyle = `${jelly.color}55`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.restore();
        });

        // Floating Forest Firefly Pollen
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.pulse += 0.03;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        ctx.shadowBlur = 0;
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
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{ opacity: 0.68 }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(5, 7, 14, 0.3) 0%, rgba(5, 7, 14, 0.7) 100%)'
        }}
      />
    </div>
  );
}
