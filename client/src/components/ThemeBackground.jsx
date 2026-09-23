import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Custom Mathematical Simulation Engines:
 * 1. ocean     — 🌌 Cosmic Stargate: Multi-Chromatic Nebula Vortex, Sacred Celestial Mandala & Hyperdrive Comets
 * 2. inferno   — 🌋 Inferno Solaris: Solar Plasma Prominence Arcs & Coronal Mass Ejection Sparks
 * 3. matrix    — ⚡ Cyberpunk Holo-Matrix: 3D Hexagonal Energy Shield & Laser Conduit Network
 * 4. monochrome— 🌑 Monolith Chrono: Quantum Gyroscope Rings & Floating Liquid Mercury Drops
 * 5. arctic    — 🧊 Glacial Prism: 3D Projected Quartz Polyhedra & Soft Prismatic Refraction (Subtle Soft Glow)
 * 6. tokyo     — 🪩 Retro Synthwave Highway: Infinite Outrun 3D Wireframe Road & Neon Skyline (Balanced Dark Mode)
 * 7. cyber     — 👑 Imperial Gold Luxe: Liquid Gold Cascading Waterfall, Celestial Solar Crown & 24K Diamond Shimmer
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
        // 🌌 1. Cosmic Stargate (Multi-Chromatic Nebula Vortex, Sacred Mandala & Hyperdrive Comets)
        const spiralCount = isMobile ? 85 : 160;
        const colors = ['#00f5d4', '#a855f7', '#ff5964', '#ffd166', '#06d6a0', '#ffffff'];
        for (let i = 0; i < spiralCount; i++) {
          particles.push({
            radius: 25 + Math.random() * (Math.min(width, height) * 0.48),
            angle: Math.random() * Math.PI * 2,
            speed: (0.005 + Math.random() * 0.012) * (Math.random() > 0.4 ? 1 : -1),
            size: 1 + Math.random() * 2.6,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 0.35 + Math.random() * 0.65,
            zPhase: Math.random() * Math.PI * 2,
            zSpeed: 0.02 + Math.random() * 0.03
          });
        }

        const maxR = Math.min(width, height) * 0.42;
        customEntities = [
          { r: maxR * 0.35, rot: 0, speed: 0.006, points: 6, color: 'rgba(0, 245, 212, 0.28)' },
          { r: maxR * 0.65, rot: Math.PI / 4, speed: -0.004, points: 8, color: 'rgba(168, 85, 247, 0.32)' },
          { r: maxR * 0.95, rot: Math.PI / 6, speed: 0.003, points: 12, color: 'rgba(255, 209, 102, 0.22)' }
        ];
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
        // 🌑 4. Monolith Chrono (Quantum Gyroscope Rings & Floating Liquid Mercury)
        const maxRadius = Math.min(width, height) * 0.42;
        customEntities = [
          { rx: maxRadius * 0.85, ry: maxRadius * 0.45, rot: 0, speed: 0.008, color: 'rgba(226, 232, 240, 0.25)' },
          { rx: maxRadius * 0.65, ry: maxRadius * 0.35, rot: Math.PI / 3, speed: -0.011, color: 'rgba(59, 130, 246, 0.35)' },
          { rx: maxRadius * 0.45, ry: maxRadius * 0.25, rot: Math.PI / 1.5, speed: 0.014, color: 'rgba(239, 68, 68, 0.30)' }
        ];

        const dropCount = isMobile ? 15 : 30;
        for (let i = 0; i < dropCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 3 + Math.random() * 8,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            deformPhase: Math.random() * Math.PI * 2,
            deformSpeed: 0.03 + Math.random() * 0.03
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
        // 👑 7. Imperial Gold Luxe (NEW: Liquid Gold Waterfall & Celestial Solar Starburst Crown)
        // Multi-layered Fluid Gold Waves
        waves = [
          { yRatio: 0.28, amp: 35, freq: 0.0018, speed: 0.006, phase: 0, color: 'rgba(255, 199, 0, 0.07)' },
          { yRatio: 0.55, amp: 48, freq: 0.0014, speed: -0.005, phase: 1.8, color: 'rgba(224, 122, 0, 0.06)' },
          { yRatio: 0.85, amp: 38, freq: 0.0022, speed: 0.007, phase: 3.4, color: 'rgba(0, 212, 170, 0.04)' }
        ];

        // Central Celestial Solar Starburst Crown
        customEntities = [
          { size: 45, rot: 0, speed: 0.004, points: 8, color: 'rgba(255, 199, 0, 0.35)' },
          { size: 75, rot: Math.PI / 8, speed: -0.003, points: 16, color: 'rgba(255, 240, 170, 0.22)' }
        ];

        // Ascending 24K Gold Dust & Champagne Bubbles
        const dustCount = isMobile ? 25 : 55;
        for (let i = 0; i < dustCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.2 + Math.random() * 3.2,
            speedY: -(0.3 + Math.random() * 0.8),
            speedX: (Math.random() - 0.5) * 0.4,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.03,
            opacity: 0.25 + Math.random() * 0.55
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
        // 🌌 1. Cosmic Stargate
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Atmospheric Multi-Color Nebula Light Plumes
        const nebPhase = frame * 0.008;
        const nebGrad1 = ctx.createRadialGradient(
          centerX + Math.cos(nebPhase) * 60,
          centerY + Math.sin(nebPhase) * 40,
          20,
          centerX,
          centerY,
          Math.min(width, height) * 0.45
        );
        nebGrad1.addColorStop(0, 'rgba(168, 85, 247, 0.16)');
        nebGrad1.addColorStop(0.5, 'rgba(0, 245, 212, 0.08)');
        nebGrad1.addColorStop(0.8, 'rgba(255, 89, 100, 0.04)');
        nebGrad1.addColorStop(1, 'transparent');
        ctx.fillStyle = nebGrad1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(width, height) * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Draw Sacred Geometry Mandala Polygons
        customEntities.forEach((mandala) => {
          mandala.rot += mandala.speed;
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(mandala.rot);

          ctx.beginPath();
          for (let i = 0; i < mandala.points; i++) {
            const angle = ((Math.PI * 2) / mandala.points) * i;
            const px = Math.cos(angle) * mandala.r;
            const py = Math.sin(angle) * (mandala.r * 0.65);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.strokeStyle = mandala.color;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Vertex Dots
          for (let i = 0; i < mandala.points; i++) {
            const angle = ((Math.PI * 2) / mandala.points) * i;
            const px = Math.cos(angle) * mandala.r;
            const py = Math.sin(angle) * (mandala.r * 0.65);
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = mandala.color;
            ctx.fill();
          }
          ctx.restore();
        });

        // Spiraling Vortex Particles
        particles.forEach((p) => {
          p.angle += p.speed;
          p.zPhase += p.zSpeed;
          const spiralR = p.radius + Math.sin(p.zPhase) * 16;
          const x = centerX + Math.cos(p.angle) * spiralR;
          const y = centerY + Math.sin(p.angle) * (spiralR * 0.65);

          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 3;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        ctx.shadowBlur = 0;

        // Hyperdrive Shooting Comets
        if (Math.random() < 0.018 && comets.length < 3) {
          comets.push({
            x: Math.random() * width * 0.8,
            y: Math.random() * height * 0.4,
            speed: 12 + Math.random() * 8,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
            length: 120 + Math.random() * 80,
            opacity: 1
          });
        }
        comets.forEach((c, idx) => {
          c.x += Math.cos(c.angle) * c.speed;
          c.y += Math.sin(c.angle) * c.speed;
          c.opacity -= 0.025;
          if (c.opacity <= 0) {
            comets.splice(idx, 1);
            return;
          }
          const tailX = c.x - Math.cos(c.angle) * c.length;
          const tailY = c.y - Math.sin(c.angle) * c.length;
          const cGrad = ctx.createLinearGradient(c.x, c.y, tailX, tailY);
          cGrad.addColorStop(0, `rgba(255, 255, 255, ${c.opacity})`);
          cGrad.addColorStop(0.3, `rgba(0, 245, 212, ${c.opacity * 0.8})`);
          cGrad.addColorStop(0.7, `rgba(168, 85, 247, ${c.opacity * 0.5})`);
          cGrad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.moveTo(c.x, c.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = cGrad;
          ctx.lineWidth = 2.2;
          ctx.stroke();
        });
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
        // 🌑 4. Monolith Chrono (Quantum Gyroscope & Liquid Mercury)
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Crosshairs
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        customEntities.forEach((ring) => {
          ring.rot += ring.speed;
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(ring.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2);
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        });

        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.deformPhase += p.deformSpeed;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          const deformRadius = p.radius * (1 + 0.25 * Math.sin(p.deformPhase));
          ctx.beginPath();
          ctx.arc(p.x, p.y, deformRadius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 6;
          ctx.fill();
        });
        ctx.shadowBlur = 0;
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
        // 🪩 6. Retro Synthwave Highway (Balanced Dark Outrun Mode)
        const horizonY = height * 0.54;
        const sunRadius = Math.min(width, height) * 0.20;
        const sunCenterX = width * 0.5;

        // Moody Striped Neon Sun (Reduced harsh glare)
        ctx.save();
        ctx.beginPath();
        ctx.arc(sunCenterX, horizonY - 10, sunRadius, Math.PI, 0, false);
        ctx.closePath();
        const sunGrad = ctx.createLinearGradient(0, horizonY - 10 - sunRadius, 0, horizonY - 10);
        sunGrad.addColorStop(0, 'rgba(255, 230, 0, 0.85)');
        sunGrad.addColorStop(0.5, 'rgba(255, 69, 91, 0.85)');
        sunGrad.addColorStop(1, 'rgba(191, 0, 255, 0.85)');
        ctx.fillStyle = sunGrad;
        ctx.shadowColor = '#ff455b';
        ctx.shadowBlur = 15; // Softened
        ctx.fill();
        ctx.restore();

        // Horizontal Stripes on Sun
        for (let i = 1; i <= 6; i++) {
          const stripeY = horizonY - 10 - (i / 7) * sunRadius;
          ctx.fillStyle = '#12041a';
          ctx.fillRect(sunCenterX - sunRadius, stripeY, sunRadius * 2, 2.5 + i * 0.7);
        }

        // Megacity Skyline Silhouette
        customEntities.forEach((b) => {
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, horizonY - b.h, b.w, b.h);
        });

        // 3D Perspective Road (Balanced opacity)
        const roadOffset = (frame * 1.4) % 40;
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.22)';
        ctx.lineWidth = 1;

        for (let x = -width * 0.5; x < width * 1.5; x += 60) {
          ctx.beginPath();
          ctx.moveTo(sunCenterX + (x - sunCenterX) * 0.04, horizonY);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        for (let y = 0; y < height - horizonY; y += 20) {
          const curY = horizonY + Math.pow((y + roadOffset) / (height - horizonY), 2) * (height - horizonY);
          if (curY <= height) {
            const lineAlpha = Math.min(0.35, ((curY - horizonY) / (height - horizonY)) * 0.35);
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
        // 👑 7. Imperial Gold Luxe (NEW: Liquid Gold Waves & Celestial Solar Crown)
        // Multi-layered Fluid Gold Waves
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

        // Celestial Solar Starburst Crown in upper center
        const sunCenterX = width * 0.5;
        const sunCenterY = height * 0.32;
        customEntities.forEach((crown) => {
          crown.rot += crown.speed;
          ctx.save();
          ctx.translate(sunCenterX, sunCenterY);
          ctx.rotate(crown.rot);

          ctx.beginPath();
          for (let i = 0; i < crown.points; i++) {
            const angle = ((Math.PI * 2) / crown.points) * i;
            const px = Math.cos(angle) * crown.size;
            const py = Math.sin(angle) * crown.size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.strokeStyle = crown.color;
          ctx.lineWidth = 1.3;
          ctx.stroke();

          // Star connection rays
          ctx.beginPath();
          for (let i = 0; i < crown.points; i++) {
            const angle1 = ((Math.PI * 2) / crown.points) * i;
            const angle2 = ((Math.PI * 2) / crown.points) * ((i + crown.points / 2) % crown.points);
            ctx.moveTo(Math.cos(angle1) * crown.size, Math.sin(angle1) * crown.size);
            ctx.lineTo(Math.cos(angle2) * crown.size, Math.sin(angle2) * crown.size);
          }
          ctx.strokeStyle = crown.color.replace('0.', '0.0');
          ctx.lineWidth = 0.7;
          ctx.stroke();
          ctx.restore();
        });

        // Ascending Gold Dust & Champagne Motes
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.pulse += p.pulseSpeed;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 199, 0, ${alpha})`;
          ctx.shadowColor = '#ffc700';
          ctx.shadowBlur = p.size * 2;
          ctx.fill();
        });
        ctx.shadowBlur = 0;
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
      style={{ opacity: 0.95 }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
