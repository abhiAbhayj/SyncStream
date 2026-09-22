import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Brand-New Ultra-Creative Mathematical Simulation Engines:
 * 1. ocean     — 🌌 Cosmic Stargate: Multi-Chromatic Nebula Vortex, Sacred Celestial Mandala & Hyperdrive Comets
 * 2. inferno   — 🌋 Inferno Solaris: Solar Plasma Prominence Arcs & Coronal Mass Ejection Sparks
 * 3. matrix    — ⚡ Cyberpunk Holo-Matrix: 3D Hexagonal Energy Shield & Laser Conduit Network
 * 4. monochrome— 🌑 Monolith Chrono: Quantum Gyroscope Rings & Floating Liquid Mercury Drops
 * 5. arctic    — 🧊 Glacial Prism: 3D Projected Rotating Quartz Polyhedra & Refracting Spectral Beams
 * 6. tokyo     — 🪩 Retro Synthwave Highway: Infinite 3D Outrun Road, Megacity Skyline & Striped Neon Sun
 * 7. cyber     — 👑 Imperial Gold Luxe: 3D Golden Armillary Astrolabe, Liquid Molten Gold & 24K Leaf Flakes
 * 8. amethyst  — 🌿 Bio-Luminescent Pandora: Sacred Spores (Atokirina), Pulsing Mycelium Vines & Bio-Pollen
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
        const spiralCount = isMobile ? 90 : 180;
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

        // Concentric Sacred Geometry Mandala Rings
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
        // 🧊 5. Glacial Prism (3D Projected Rotating Quartz Crystals & Spectral Refraction Beams)
        const crystalCount = isMobile ? 5 : 9;
        customEntities = [];
        for (let i = 0; i < crystalCount; i++) {
          customEntities.push({
            x: (width * (i + 0.5)) / crystalCount + (Math.random() - 0.5) * 40,
            y: height * 0.25 + Math.random() * (height * 0.5),
            size: 22 + Math.random() * 28,
            rotX: Math.random() * Math.PI,
            rotY: Math.random() * Math.PI,
            rotZ: Math.random() * Math.PI,
            speedX: 0.008 + Math.random() * 0.012,
            speedY: 0.006 + Math.random() * 0.010,
            speedZ: 0.004 + Math.random() * 0.008,
            floatPhase: Math.random() * Math.PI * 2,
            color: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#ec4899' : '#34d399'
          });
        }

        // Shimmering Crystalline Blizzard Dust
        const dustCount = isMobile ? 40 : 80;
        for (let i = 0; i < dustCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.8,
            speedY: 0.4 + Math.random() * 1.2,
            speedX: (Math.random() - 0.5) * 0.5,
            opacity: 0.25 + Math.random() * 0.65,
            color: Math.random() > 0.6 ? '#38bdf8' : Math.random() > 0.3 ? '#ec4899' : '#34d399'
          });
        }
      } else if (theme === 'tokyo') {
        // 🪩 6. Retro Synthwave Highway (Infinite 3D Outrun Road, Skyline & Striped Sun)
        // Megacity Skyline Buildings
        const buildingCount = isMobile ? 16 : 32;
        const horizonY = height * 0.52;
        const bWidth = width / buildingCount;
        customEntities = [];
        for (let i = 0; i < buildingCount; i++) {
          const bHeight = 25 + Math.random() * 85;
          customEntities.push({
            x: i * bWidth,
            w: bWidth + 2,
            h: bHeight,
            hasAntenna: Math.random() > 0.65,
            windowLit: Math.random() > 0.35,
            color: i % 2 === 0 ? 'rgba(36, 8, 52, 0.95)' : 'rgba(58, 14, 82, 0.95)'
          });
        }

        // Speeding Laser Cars on Highway
        particles = [];
        const carCount = isMobile ? 8 : 16;
        for (let i = 0; i < carCount; i++) {
          particles.push({
            lane: (Math.random() - 0.5) * 1.6, // -0.8 to +0.8
            dist: Math.random(),
            speed: 0.008 + Math.random() * 0.015,
            color: Math.random() > 0.5 ? '#00f5ff' : '#ff455b'
          });
        }
      } else if (theme === 'cyber') {
        // 👑 7. Imperial Gold Luxe (3D Golden Armillary Astrolabe & Liquid Molten Gold)
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const maxRadius = Math.min(width, height) * 0.44;

        // 3D Armillary Spheres / Astrolabe Rings
        customEntities = [
          { rx: maxRadius * 0.88, ry: maxRadius * 0.42, tilt: 0.4, rot: 0, speed: 0.006, color: 'rgba(255, 199, 0, 0.45)' },
          { rx: maxRadius * 0.68, ry: maxRadius * 0.32, tilt: -0.6, rot: Math.PI / 3, speed: -0.008, color: 'rgba(224, 122, 0, 0.40)' },
          { rx: maxRadius * 0.48, ry: maxRadius * 0.22, tilt: 0.8, rot: Math.PI / 1.5, speed: 0.011, color: 'rgba(0, 212, 170, 0.35)' }
        ];

        // 3D Rotating 24K Gold Leaf Flakes
        const flakeCount = isMobile ? 22 : 45;
        for (let i = 0; i < flakeCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 6 + Math.random() * 12,
            speedY: -(0.3 + Math.random() * 0.8),
            speedX: (Math.random() - 0.5) * 0.5,
            rotX: Math.random() * Math.PI,
            rotY: Math.random() * Math.PI,
            speedRotX: 0.02 + Math.random() * 0.03,
            speedRotY: 0.015 + Math.random() * 0.025,
            opacity: 0.35 + Math.random() * 0.55
          });
        }

        // Liquid Gold Silk Wave Ribbons
        waves = [
          { yRatio: 0.38, amp: 40, freq: 0.0016, speed: 0.008, phase: 0, color: 'rgba(255, 199, 0, 0.08)' },
          { yRatio: 0.72, amp: 55, freq: 0.0022, speed: -0.007, phase: 2.5, color: 'rgba(224, 122, 0, 0.06)' }
        ];
      } else if (theme === 'amethyst') {
        // 🌿 8. Bio-Luminescent Pandora (Sacred Spores Atokirina & Pulsing Mycelium Vines)
        // Living Mycelium Vine Branches
        customEntities = [];
        const branchCount = isMobile ? 4 : 7;
        for (let i = 0; i < branchCount; i++) {
          customEntities.push({
            x: (width * i) / (branchCount - 1),
            y: height,
            heightMax: height * (0.35 + Math.random() * 0.45),
            curvePhase: Math.random() * Math.PI * 2,
            curveSpeed: 0.015 + Math.random() * 0.015,
            pulseOffset: Math.random() * Math.PI * 2,
            color: i % 2 === 0 ? '#00ff88' : '#ff2a85'
          });
        }

        // Floating Sacred Spores (Atokirina Woods-prites)
        const sporeCount = isMobile ? 14 : 26;
        for (let i = 0; i < sporeCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 7 + Math.random() * 12,
            speedY: -(0.35 + Math.random() * 0.75),
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.02 + Math.random() * 0.02,
            tentacleCount: 5 + Math.floor(Math.random() * 3),
            color: Math.random() > 0.5 ? '#00ff88' : '#ff2a85',
            pulse: Math.random() * Math.PI * 2
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
        // 🌌 1. Cosmic Stargate (Nebula Vortex, Sacred Mandala & Hyperdrive Comets)
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

          // Outer polygon
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

          // Star connections
          ctx.beginPath();
          for (let i = 0; i < mandala.points; i++) {
            const angle1 = ((Math.PI * 2) / mandala.points) * i;
            const angle2 = ((Math.PI * 2) / mandala.points) * ((i + 2) % mandala.points);
            ctx.moveTo(Math.cos(angle1) * mandala.r, Math.sin(angle1) * (mandala.r * 0.65));
            ctx.lineTo(Math.cos(angle2) * mandala.r, Math.sin(angle2) * (mandala.r * 0.65));
          }
          ctx.strokeStyle = mandala.color.replace('0.', '0.0');
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Starlight Vertex Dots
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
        // ⚡ 3. Cyberpunk Holo-Matrix (Hexagonal Shield & Laser Ray Network)
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
        // 🧊 5. Glacial Prism (3D Projected Rotating Quartz Crystals & Spectral Beams)
        // Draw 3D Rotating Polyhedra
        customEntities.forEach((crystal) => {
          crystal.rotX += crystal.speedX;
          crystal.rotY += crystal.speedY;
          crystal.rotZ += crystal.speedZ;
          crystal.floatPhase += 0.02;

          const floatY = crystal.y + Math.sin(crystal.floatPhase) * 14;
          const s = crystal.size;

          // 3D Octahedron vertices: (x, y, z)
          const rawVertices = [
            [0, -s * 1.3, 0], // Top apex
            [s, 0, 0],        // Right
            [0, 0, s],        // Front
            [-s, 0, 0],       // Left
            [0, 0, -s],       // Back
            [0, s * 1.3, 0]   // Bottom apex
          ];

          // Rotate 3D vertices
          const proj = rawVertices.map(([vx, vy, vz]) => {
            // Rot X
            let y1 = vy * Math.cos(crystal.rotX) - vz * Math.sin(crystal.rotX);
            let z1 = vy * Math.sin(crystal.rotX) + vz * Math.cos(crystal.rotX);
            // Rot Y
            let x2 = vx * Math.cos(crystal.rotY) + z1 * Math.sin(crystal.rotY);
            let z2 = -vx * Math.sin(crystal.rotY) + z1 * Math.cos(crystal.rotY);
            // Rot Z
            let x3 = x2 * Math.cos(crystal.rotZ) - y1 * Math.sin(crystal.rotZ);
            let y3 = x2 * Math.sin(crystal.rotZ) + y1 * Math.cos(crystal.rotZ);

            return [crystal.x + x3, floatY + y3, z2];
          });

          // Draw Octahedron Wireframe & Facets
          const edges = [
            [0, 1], [0, 2], [0, 3], [0, 4], // Top edges
            [5, 1], [5, 2], [5, 3], [5, 4], // Bottom edges
            [1, 2], [2, 3], [3, 4], [4, 1]  // Equatorial edges
          ];

          ctx.strokeStyle = `${crystal.color}66`;
          ctx.lineWidth = 1.4;
          edges.forEach(([i1, i2]) => {
            ctx.beginPath();
            ctx.moveTo(proj[i1][0], proj[i1][1]);
            ctx.lineTo(proj[i2][0], proj[i2][1]);
            ctx.stroke();
          });

          // Spectral Refraction Laser Beams from crystal apex
          const beamAngle = crystal.rotY * 2;
          const beamLen = 140;
          const rx = proj[0][0] + Math.cos(beamAngle) * beamLen;
          const ry = proj[0][1] + Math.sin(beamAngle) * beamLen;
          const bGrad = ctx.createLinearGradient(proj[0][0], proj[0][1], rx, ry);
          bGrad.addColorStop(0, `${crystal.color}aa`);
          bGrad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.moveTo(proj[0][0], proj[0][1]);
          ctx.lineTo(rx, ry);
          ctx.strokeStyle = bGrad;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        });

        // Blizzard Ice Dust
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
        // 🪩 6. Retro Synthwave Highway (Outrun 3D Road, Megacity Skyline & Striped Neon Sun)
        const horizonY = height * 0.52;
        const sunRadius = Math.min(width, height) * 0.22;
        const sunCenterX = width * 0.5;

        // Striped Neon Vector Sun with God-Rays
        ctx.save();
        ctx.beginPath();
        ctx.arc(sunCenterX, horizonY - 10, sunRadius, Math.PI, 0, false);
        ctx.closePath();
        const sunGrad = ctx.createLinearGradient(0, horizonY - 10 - sunRadius, 0, horizonY - 10);
        sunGrad.addColorStop(0, '#ffe600');
        sunGrad.addColorStop(0.5, '#ff455b');
        sunGrad.addColorStop(1, '#bf00ff');
        ctx.fillStyle = sunGrad;
        ctx.shadowColor = '#ff455b';
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.restore();

        // Horizontal Stripes on Sun
        for (let i = 1; i <= 6; i++) {
          const stripeY = horizonY - 10 - (i / 7) * sunRadius;
          ctx.fillStyle = '#12041a';
          ctx.fillRect(sunCenterX - sunRadius, stripeY, sunRadius * 2, 3 + i * 0.8);
        }

        // Megacity Skyline Buildings
        customEntities.forEach((b) => {
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, horizonY - b.h, b.w, b.h);

          // Roof antenna laser
          if (b.hasAntenna) {
            ctx.strokeStyle = '#00f5ff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(b.x + b.w / 2, horizonY - b.h);
            ctx.lineTo(b.x + b.w / 2, horizonY - b.h - 15);
            ctx.stroke();

            // Blinking beacon
            if (Math.sin(frame * 0.08 + b.x) > 0.5) {
              ctx.beginPath();
              ctx.arc(b.x + b.w / 2, horizonY - b.h - 15, 2, 0, Math.PI * 2);
              ctx.fillStyle = '#ff455b';
              ctx.shadowColor = '#ff455b';
              ctx.shadowBlur = 6;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        });

        // 3D Perspective Rolling Road
        const roadOffset = (frame * 1.6) % 40;
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.35)';
        ctx.lineWidth = 1.2;

        // Longitudinal Perspective Lines
        for (let x = -width * 0.5; x < width * 1.5; x += 60) {
          ctx.beginPath();
          ctx.moveTo(sunCenterX + (x - sunCenterX) * 0.04, horizonY);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Latitudinal Perspective Lines
        for (let y = 0; y < height - horizonY; y += 20) {
          const curY = horizonY + Math.pow((y + roadOffset) / (height - horizonY), 2) * (height - horizonY);
          if (curY <= height) {
            const lineAlpha = Math.min(0.5, ((curY - horizonY) / (height - horizonY)) * 0.5);
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
          ctx.arc(curX, curY, 2 + car.dist * 3, 0, Math.PI * 2);
          ctx.fillStyle = car.color;
          ctx.shadowColor = car.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      } else if (activeTheme === 'cyber') {
        // 👑 7. Imperial Gold Luxe (3D Armillary Sphere, Molten Gold Silk & 24K Leaf Flakes)
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Liquid Gold Waves
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

        // 3D Armillary Astrolabe Rings
        customEntities.forEach((ring) => {
          ring.rot += ring.speed;
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(ring.tilt);

          ctx.beginPath();
          ctx.ellipse(0, 0, ring.rx, ring.ry, ring.rot, 0, Math.PI * 2);
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Golden bead on orbital ring
          const bx = Math.cos(ring.rot * 2) * ring.rx;
          const by = Math.sin(ring.rot * 2) * ring.ry;
          ctx.beginPath();
          ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffc700';
          ctx.shadowColor = '#ffc700';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.restore();
        });

        // 3D Rotating 24K Gold Leaf Flakes
        particles.forEach((flake) => {
          flake.y += flake.speedY;
          flake.x += flake.speedX;
          flake.rotX += flake.speedRotX;
          flake.rotY += flake.speedRotY;

          if (flake.y < -20) {
            flake.y = height + 20;
            flake.x = Math.random() * width;
          }

          const scaleX = Math.cos(flake.rotX);
          const scaleY = Math.sin(flake.rotY);

          ctx.save();
          ctx.translate(flake.x, flake.y);
          ctx.scale(scaleX, scaleY);
          ctx.beginPath();
          ctx.rect(-flake.size / 2, -flake.size / 2, flake.size, flake.size);
          ctx.fillStyle = 'rgba(255, 199, 0, 0.45)';
          ctx.shadowColor = '#ffc700';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'amethyst') {
        // 🌿 8. Bio-Luminescent Pandora (Sacred Spores Atokirina & Pulsing Mycelium Vines)
        // Living Mycelium Vines
        customEntities.forEach((vine) => {
          vine.curvePhase += vine.curveSpeed;
          const vineHeight = vine.heightMax * (0.85 + 0.15 * Math.sin(vine.curvePhase));
          const swayX = Math.sin(vine.curvePhase) * 35;

          ctx.beginPath();
          ctx.moveTo(vine.x, height);
          ctx.quadraticCurveTo(vine.x + swayX, height - vineHeight * 0.5, vine.x + swayX * 0.5, height - vineHeight);
          ctx.strokeStyle = `${vine.color}55`;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Bio-energy pulse node along vine
          const pulseProg = (Math.sin(frame * 0.04 + vine.pulseOffset) + 1) / 2;
          const nodeY = height - vineHeight * pulseProg;
          const nodeX = vine.x + swayX * pulseProg;
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, 3, 0, Math.PI * 2);
          ctx.fillStyle = vine.color;
          ctx.shadowColor = vine.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Floating Sacred Spores (Atokirina Woods-prites)
        particles.forEach((spore) => {
          spore.y += spore.speedY;
          spore.sway += spore.swaySpeed;
          spore.pulse += 0.03;
          spore.x += Math.sin(spore.sway) * 0.8;

          if (spore.y < -50) {
            spore.y = height + 40;
            spore.x = Math.random() * width;
          }

          const pulseFactor = 0.85 + 0.25 * Math.sin(spore.pulse);
          const r = spore.radius * pulseFactor;

          ctx.save();
          ctx.translate(spore.x, spore.y);

          // Glowing Aura
          const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.2);
          aura.addColorStop(0, `${spore.color}44`);
          aura.addColorStop(1, 'transparent');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Spore Core
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = spore.color;
          ctx.shadowBlur = 8;
          ctx.fill();

          // Ethereal Tendrils (Feathered Umbrella)
          for (let t = 0; t < spore.tentacleCount; t++) {
            const angle = ((Math.PI * 2) / spore.tentacleCount) * t + spore.sway * 0.5;
            const tx = Math.cos(angle) * r * 1.6;
            const ty = Math.sin(angle) * r * 1.6;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(tx * 0.5, ty * 0.3, tx, ty);
            ctx.strokeStyle = `${spore.color}88`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.restore();
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
