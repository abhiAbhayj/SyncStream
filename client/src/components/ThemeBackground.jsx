import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Brand-New High-Concept Mathematical Simulation Engines:
 * 1. ocean     — 🌌 Cosmic Stargate: 3D Chromatic Wormhole Vortex & Multi-Color Cosmic Filaments
 * 2. inferno   — 🌋 Inferno Solaris: Solar Plasma Prominence Arcs & Coronal Mass Ejection
 * 3. matrix    — ⚡ Cyberpunk Holo-Matrix: 3D Hexagonal Energy Shield & Laser Conduit Network
 * 4. monochrome— 🌑 Monolith Chrono: Quantum Gyroscope Rings & Floating Liquid Mercury Drops
 * 5. arctic    — 🧊 Glacial Prism: Rotating 3D Quartz Crystals & Refracting Rainbow Light Beams
 * 6. tokyo     — 🪩 Retro Synthwave Highway: Infinite Outrun 3D Wireframe Road & Striped Neon Sun
 * 7. cyber     — 👑 Imperial Gold Luxe: Liquid Gold Cascading Ribbons & 8-Point Diamond Starbursts
 * 8. amethyst  — 🌿 Bio-Luminescent Pandora: Sacred Spores (Atokirina) & Pulsing Alien Tendrils
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
    let frame = 0;

    function initScene(theme) {
      particles = [];
      customEntities = [];
      waves = [];
      frame = 0;

      const isMobile = width < 768;

      if (theme === 'ocean') {
        // 🌌 1. Cosmic Stargate (3D Wormhole Vortex & Spiraling Chromatic Filaments)
        const spiralCount = isMobile ? 80 : 160;
        const colors = ['#00f5d4', '#a855f7', '#ff5964', '#ffd166', '#06d6a0'];
        for (let i = 0; i < spiralCount; i++) {
          particles.push({
            radius: 30 + Math.random() * (Math.min(width, height) * 0.48),
            angle: Math.random() * Math.PI * 2,
            speed: (0.006 + Math.random() * 0.014) * (Math.random() > 0.5 ? 1 : -1),
            size: 1 + Math.random() * 2.8,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 0.3 + Math.random() * 0.7,
            zOffset: Math.random() * Math.PI * 2
          });
        }
        // Expanding Spacetime Stargate Rings
        customEntities = [
          { r: 40, maxR: Math.min(width, height) * 0.45, speed: 1.2 },
          { r: 120, maxR: Math.min(width, height) * 0.45, speed: 1.2 },
          { r: 220, maxR: Math.min(width, height) * 0.45, speed: 1.2 }
        ];
      } else if (theme === 'inferno') {
        // 🌋 2. Inferno Solaris (Solar Surface Plasma Prominences & Coronal Arcs)
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
        // Solar flare sparks
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

        // Flying Laser Conduit Pulses
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
        // 🌑 4. Monolith Chrono (Quantum Gyroscope Rings & Floating Liquid Mercury Droplets)
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const maxRadius = Math.min(width, height) * 0.42;

        // Gyroscope Rings
        customEntities = [
          { rx: maxRadius * 0.85, ry: maxRadius * 0.45, rot: 0, speed: 0.008, color: 'rgba(226, 232, 240, 0.25)' },
          { rx: maxRadius * 0.65, ry: maxRadius * 0.35, rot: Math.PI / 3, speed: -0.011, color: 'rgba(59, 130, 246, 0.35)' },
          { rx: maxRadius * 0.45, ry: maxRadius * 0.25, rot: Math.PI / 1.5, speed: 0.014, color: 'rgba(239, 68, 68, 0.30)' }
        ];

        // Liquid Mercury Drops
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
        // 🧊 5. Glacial Prism (Rotating 3D Quartz Crystals & Refracting Rainbow Light Beams)
        const crystalCount = isMobile ? 6 : 12;
        customEntities = [];
        for (let i = 0; i < crystalCount; i++) {
          customEntities.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 16 + Math.random() * 26,
            rotX: Math.random() * Math.PI,
            rotY: Math.random() * Math.PI,
            speedX: (Math.random() - 0.5) * 0.015,
            speedY: (Math.random() - 0.5) * 0.015,
            floatPhase: Math.random() * Math.PI * 2
          });
        }

        // Shimmering Ice Dust
        const dustCount = isMobile ? 30 : 65;
        for (let i = 0; i < dustCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.5,
            speedY: 0.3 + Math.random() * 0.8,
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: 0.2 + Math.random() * 0.6,
            color: Math.random() > 0.6 ? '#38bdf8' : Math.random() > 0.3 ? '#ec4899' : '#34d399'
          });
        }
      } else if (theme === 'tokyo') {
        // 🪩 6. Retro Synthwave Highway (Outrun 3D Wireframe Road & Striped Neon Sun)
        const starCount = isMobile ? 25 : 50;
        for (let i = 0; i < starCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * (height * 0.55),
            size: 1 + Math.random() * 2.5,
            opacity: 0.3 + Math.random() * 0.7,
            pulse: Math.random() * Math.PI * 2
          });
        }
      } else if (theme === 'cyber') {
        // 👑 7. Imperial Gold Luxe (Liquid Gold Silk Ribbons & 8-Point Diamond Starbursts)
        waves = [
          { yRatio: 0.35, amp: 45, freq: 0.0016, speed: 0.007, phase: 0, color: 'rgba(255, 199, 0, 0.09)' },
          { yRatio: 0.60, amp: 60, freq: 0.0020, speed: -0.006, phase: 2.1, color: 'rgba(224, 122, 0, 0.07)' },
          { yRatio: 0.82, amp: 40, freq: 0.0025, speed: 0.009, phase: 4.2, color: 'rgba(0, 212, 170, 0.05)' }
        ];

        // 8-Point Diamond Starbursts
        const starCount = isMobile ? 14 : 26;
        for (let i = 0; i < starCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 9 + Math.random() * 18,
            rot: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.015,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.03 + Math.random() * 0.03,
            opacity: 0.35 + Math.random() * 0.55
          });
        }

        // Gold Flakes
        const flakeCount = isMobile ? 25 : 50;
        customEntities = [];
        for (let i = 0; i < flakeCount; i++) {
          customEntities.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.2 + Math.random() * 2.8,
            speedY: -(0.3 + Math.random() * 0.7),
            speedX: (Math.random() - 0.5) * 0.4,
            pulse: Math.random() * Math.PI * 2
          });
        }
      } else if (theme === 'amethyst') {
        // 🌿 8. Bio-Luminescent Pandora (Sacred Spores Atokirina & Pulsing Alien Tendrils)
        const sporeCount = isMobile ? 18 : 36;
        for (let i = 0; i < sporeCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 8 + Math.random() * 14,
            speedY: -(0.4 + Math.random() * 0.8),
            sway: Math.random() * Math.PI * 2,
            swaySpeed: 0.02 + Math.random() * 0.02,
            tentacleCount: 4 + Math.floor(Math.random() * 3),
            color: Math.random() > 0.5 ? '#00ff88' : '#ff2a85',
            pulse: Math.random() * Math.PI * 2
          });
        }

        // Bioluminescent Pollen
        const pollenCount = isMobile ? 30 : 60;
        customEntities = [];
        for (let i = 0; i < pollenCount; i++) {
          customEntities.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.5,
            speedY: -(0.2 + Math.random() * 0.6),
            speedX: (Math.random() - 0.5) * 0.4,
            color: Math.random() > 0.4 ? '#00e5ff' : '#b4ff39',
            pulse: Math.random() * Math.PI * 2
          });
        }
      }
    }

    initScene(activeTheme);

    // Helper: Draw 8-point faceted diamond star
    function drawDiamondStar(cx, cy, size, rot, alpha, glowColor) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      ctx.beginPath();
      // Primary 4 points
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(0, 0, size * 0.22, 0);
      ctx.lineTo(size, 0);
      ctx.quadraticCurveTo(0, 0, 0, size * 0.22);
      ctx.lineTo(0, size);
      ctx.quadraticCurveTo(0, 0, -size * 0.22, 0);
      ctx.lineTo(-size, 0);
      ctx.quadraticCurveTo(0, 0, 0, -size * 0.22);
      ctx.closePath();

      ctx.fillStyle = `rgba(255, 199, 0, ${alpha})`;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = size * 1.5;
      ctx.fill();

      // Secondary 4 diagonal points
      ctx.save();
      ctx.rotate(Math.PI / 4);
      const subSize = size * 0.62;
      ctx.beginPath();
      ctx.moveTo(0, -subSize);
      ctx.quadraticCurveTo(0, 0, subSize * 0.22, 0);
      ctx.lineTo(subSize, 0);
      ctx.quadraticCurveTo(0, 0, 0, subSize * 0.22);
      ctx.lineTo(0, subSize);
      ctx.quadraticCurveTo(0, 0, -subSize * 0.22, 0);
      ctx.lineTo(-subSize, 0);
      ctx.quadraticCurveTo(0, 0, 0, -subSize * 0.22);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 240, 170, ${alpha * 0.8})`;
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    // ── Simulation Render Loop ──
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (activeTheme === 'ocean') {
        // 🌌 1. Cosmic Stargate (3D Wormhole Vortex & Spiraling Filaments)
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Draw Spacetime Ripple Rings
        customEntities.forEach((ring) => {
          ring.r += ring.speed;
          if (ring.r > ring.maxR) ring.r = 20;
          const alpha = Math.max(0, 0.3 * (1 - ring.r / ring.maxR));
          ctx.beginPath();
          ctx.arc(centerX, centerY, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        });

        // Spiraling Vortex Particles
        particles.forEach((p) => {
          p.angle += p.speed;
          p.zOffset += 0.02;

          const spiralR = p.radius + Math.sin(p.zOffset) * 15;
          const x = centerX + Math.cos(p.angle) * spiralR;
          const y = centerY + Math.sin(p.angle) * (spiralR * 0.65); // Elliptical perspective

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
      } else if (activeTheme === 'inferno') {
        // 🌋 2. Inferno Solaris (Solar Plasma Prominence Arcs)
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
        // ⚡ 3. Cyberpunk Holo-Matrix (3D Hexagonal Energy Shield)
        const scanY = (frame * 1.5) % height;

        // Draw Hexagonal Shield Mesh
        ctx.lineWidth = 1;
        customEntities.forEach((hex) => {
          hex.pulse += hex.pulseSpeed;

          // Distance to scanning beam
          const distToScan = Math.abs(hex.y - scanY);
          if (distToScan < 50) {
            hex.activeAlpha = 0.8;
          } else {
            hex.activeAlpha = Math.max(0, hex.activeAlpha - 0.02);
          }

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

        // Laser Conduit Pulses
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
        // 🌑 4. Monolith Chrono (Quantum Gyroscope Rings & Floating Liquid Mercury)
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Architectural Crosshair
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Rotating Gyroscope Rings
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

        // Floating Liquid Mercury Drops
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
        // 🧊 5. Glacial Prism (Rotating 3D Quartz Crystals & Refraction Rays)
        customEntities.forEach((crystal) => {
          crystal.rotX += crystal.speedX;
          crystal.rotY += crystal.speedY;
          crystal.floatPhase += 0.02;

          const floatY = crystal.y + Math.sin(crystal.floatPhase) * 12;

          ctx.save();
          ctx.translate(crystal.x, floatY);
          ctx.rotate(crystal.rotX);

          // Faceted Octahedron / Quartz Crystal
          const s = crystal.size;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.7, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.7, 0);
          ctx.closePath();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Internal Prismatic Refraction Lines
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(0, s);
          ctx.moveTo(-s * 0.7, 0);
          ctx.lineTo(s * 0.7, 0);
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
          ctx.stroke();

          ctx.restore();
        });

        // Shimmering Ice Dust
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
        // 🪩 6. Retro Synthwave Highway (Outrun 3D Wireframe Road & Neon Sun)
        const horizonY = height * 0.52;
        const sunRadius = Math.min(width, height) * 0.22;
        const sunCenterX = width * 0.5;

        // Striped Neon Vector Sun
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
        ctx.shadowBlur = 25;
        ctx.fill();
        ctx.restore();

        // Horizontal Stripes on Sun
        for (let i = 1; i <= 6; i++) {
          const stripeY = horizonY - 10 - (i / 7) * sunRadius;
          ctx.fillStyle = '#12041a';
          ctx.fillRect(sunCenterX - sunRadius, stripeY, sunRadius * 2, 3 + i * 0.8);
        }

        // Rolling 3D Perspective Wireframe Road
        const roadOffset = (frame * 1.5) % 40;
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.35)';
        ctx.lineWidth = 1.2;

        // Perspective longitudinal lines
        for (let x = -width * 0.5; x < width * 1.5; x += 60) {
          ctx.beginPath();
          ctx.moveTo(sunCenterX + (x - sunCenterX) * 0.05, horizonY);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Perspective latitudinal lines
        for (let y = 0; y < height - horizonY; y += 20) {
          const curY = horizonY + Math.pow((y + roadOffset) / (height - horizonY), 2) * (height - horizonY);
          if (curY <= height) {
            const lineAlpha = Math.min(0.45, ((curY - horizonY) / (height - horizonY)) * 0.45);
            ctx.strokeStyle = `rgba(255, 69, 91, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(0, curY);
            ctx.lineTo(width, curY);
            ctx.stroke();
          }
        }

        // Floating Stars
        particles.forEach((p) => {
          p.pulse += 0.03;
          const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 230, 0, ${alpha})`;
          ctx.fill();
        });
      } else if (activeTheme === 'cyber') {
        // 👑 7. Imperial Gold Luxe (Liquid Gold Waves & 8-Point Diamond Stars)
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

        // Gold Flakes
        customEntities.forEach((flake) => {
          flake.y += flake.speedY;
          flake.x += flake.speedX;
          flake.pulse += 0.03;
          if (flake.y < -10) {
            flake.y = height + 10;
            flake.x = Math.random() * width;
          }
          const alpha = 0.3 * (0.6 + 0.4 * Math.sin(flake.pulse));
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 199, 0, ${alpha})`;
          ctx.fill();
        });

        // 8-Point Diamond Starbursts (✦)
        particles.forEach((star) => {
          star.rot += star.rotSpeed;
          star.pulse += star.pulseSpeed;
          const alpha = star.opacity * (0.6 + 0.4 * Math.sin(star.pulse));
          drawDiamondStar(star.x, star.y, star.size, star.rot, alpha, '#ffc700');
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'amethyst') {
        // 🌿 8. Bio-Luminescent Pandora (Sacred Spores Atokirina & Pollen)
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
          ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
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

        // Pollen Dust
        customEntities.forEach((pollen) => {
          pollen.y += pollen.speedY;
          pollen.x += pollen.speedX;
          pollen.pulse += 0.03;
          if (pollen.y < -10) {
            pollen.y = height + 10;
            pollen.x = Math.random() * width;
          }
          const alpha = 0.4 * (0.6 + 0.4 * Math.sin(pollen.pulse));
          ctx.beginPath();
          ctx.arc(pollen.x, pollen.y, pollen.size, 0, Math.PI * 2);
          ctx.fillStyle = pollen.color;
          ctx.globalAlpha = alpha;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
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
