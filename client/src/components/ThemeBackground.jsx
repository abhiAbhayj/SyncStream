import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Brand-New Unique Mathematical Simulation Engines:
 * 1. ocean     — 🌊 Mariana Bioluminescent Abyss: Pulsing siphonophore jellyfish & hydro-energy ripples
 * 2. inferno   — 🔥 Molten Obsidian Forge: Viscous fluid magma surges & atmospheric ember turbulence
 * 3. matrix    — ⚡ Quantum Cyberverse: 3D hyperspace warp-speed star streaks & interdimensional rings
 * 4. monochrome— ⚪ Lunar Monolith Noir: Undulating liquid mercury ribbons & architectural coordinate reticles
 * 5. arctic    — ❄️ Nordic Aurora Glacialis: Curving multi-spectral Northern Lights & crystalline frost dust
 * 6. tokyo     — 🌸 Cyber Neon Glitch: Cyberpunk HUD audio spectrum waveform, CRT scanlines & glitch reticles
 * 7. cyber     — 👑 Royal 24K Solar Mirage: Volumetric golden sunbeam caustics & 3D rotating diamond starbursts
 * 8. amethyst  — 🌌 Event Horizon Singularity: Relativistic black hole accretion disk & gravitational lensing
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
        // 🌊 1. Mariana Bioluminescent Abyss (Jellyfish / Siphonophores + Hydro Ripples + Marine Dust)
        const jellyCount = isMobile ? 3 : 5;
        for (let i = 0; i < jellyCount; i++) {
          customEntities.push({
            x: (width * (i + 0.5)) / jellyCount + (Math.random() - 0.5) * 60,
            y: height * 0.2 + Math.random() * (height * 0.6),
            size: 18 + Math.random() * 18,
            speedY: -(0.4 + Math.random() * 0.5),
            swayPhase: Math.random() * Math.PI * 2,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.035 + Math.random() * 0.02,
            tentacles: 4 + Math.floor(Math.random() * 3),
            hue: Math.random() > 0.5 ? 172 : 270 // Teal or Deep Violet
          });
        }

        // Marine Dust & Plankton
        const dustCount = isMobile ? 30 : 60;
        for (let i = 0; i < dustCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.5,
            speedY: -(0.2 + Math.random() * 0.6),
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: 0.2 + Math.random() * 0.6,
            pulse: Math.random() * Math.PI * 2
          });
        }
      } else if (theme === 'inferno') {
        // 🔥 2. Molten Obsidian Forge (Viscous Magma Surges + Heated Embers)
        waves = [
          { yRatio: 0.82, amp: 26, freq: 0.003, speed: 0.012, phase: 0, grad: ['rgba(255, 110, 0, 0.16)', 'rgba(208, 0, 0, 0.04)'] },
          { yRatio: 0.90, amp: 32, freq: 0.005, speed: -0.015, phase: 1.8, grad: ['rgba(255, 158, 0, 0.22)', 'rgba(180, 0, 0, 0.08)'] },
          { yRatio: 0.96, amp: 18, freq: 0.008, speed: 0.020, phase: 3.5, grad: ['rgba(255, 234, 0, 0.32)', 'rgba(255, 80, 0, 0.18)'] }
        ];

        const emberCount = isMobile ? 35 : 70;
        for (let i = 0; i < emberCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: height * 0.65 + Math.random() * (height * 0.35),
            size: 1.5 + Math.random() * 3.5,
            speedY: -(1.2 + Math.random() * 3.2),
            speedX: (Math.random() - 0.5) * 1.6,
            life: Math.random() * 80,
            maxLife: 60 + Math.random() * 80,
            hue: Math.random() > 0.4 ? 35 + Math.random() * 20 : 10 + Math.random() * 15
          });
        }
      } else if (theme === 'matrix') {
        // ⚡ 3. Quantum Cyberverse (3D Warp-Speed Hyperspace Star Streaks & Warp Rings)
        const streakCount = isMobile ? 70 : 150;
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        for (let i = 0; i < streakCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 20 + Math.random() * (Math.hypot(width, height) * 0.5);
          particles.push({
            x: centerX + Math.cos(angle) * dist,
            y: centerY + Math.sin(angle) * dist,
            angle,
            dist,
            speed: 2 + Math.random() * 6,
            length: 10 + Math.random() * 35,
            color: Math.random() > 0.6 ? '#00ff88' : Math.random() > 0.3 ? '#4cc9f0' : '#f72585'
          });
        }

        // Concentric Warp Rings
        customEntities = [
          { r: 40, maxR: Math.hypot(width, height) * 0.45, speed: 1.8 },
          { r: 160, maxR: Math.hypot(width, height) * 0.45, speed: 1.8 },
          { r: 280, maxR: Math.hypot(width, height) * 0.45, speed: 1.8 }
        ];
      } else if (theme === 'monochrome') {
        // ⚪ 4. Lunar Monolith Noir (Liquid Mercury Waves & Architectural Reticles)
        waves = [
          { yRatio: 0.40, amp: 40, freq: 0.0015, speed: 0.005, phase: 0, alpha: 0.06 },
          { yRatio: 0.65, amp: 55, freq: 0.0020, speed: -0.004, phase: 2.2, alpha: 0.08 }
        ];

        const facetCount = isMobile ? 25 : 50;
        for (let i = 0; i < facetCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.5 + Math.random() * 3,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            rot: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            opacity: 0.2 + Math.random() * 0.5
          });
        }
      } else if (theme === 'arctic') {
        // ❄️ 5. Nordic Aurora Glacialis (Multi-Spectral Aurora Curtains & Frost Dust)
        waves = [
          { yRatio: 0.25, amp: 65, freq: 0.0018, speed: 0.007, phase: 0, color: 'rgba(6, 214, 160, 0.12)' },
          { yRatio: 0.38, amp: 80, freq: 0.0014, speed: -0.005, phase: 1.8, color: 'rgba(17, 138, 178, 0.10)' },
          { yRatio: 0.52, amp: 70, freq: 0.0022, speed: 0.009, phase: 3.5, color: 'rgba(131, 56, 236, 0.08)' }
        ];

        const frostCount = isMobile ? 35 : 75;
        for (let i = 0; i < frostCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.8,
            speedY: 0.4 + Math.random() * 1.2,
            speedX: Math.sin(Math.random() * Math.PI) * 0.5,
            sway: Math.random() * Math.PI * 2,
            opacity: 0.3 + Math.random() * 0.6
          });
        }
      } else if (theme === 'tokyo') {
        // 🌸 6. Cyber Neon Glitch (Audio Spectrum Visualizer Bars & CRT Scanlines)
        const barCount = isMobile ? 32 : 64;
        customEntities = [];
        for (let i = 0; i < barCount; i++) {
          customEntities.push({
            height: Math.random() * 80,
            targetHeight: Math.random() * 100,
            speed: 0.05 + Math.random() * 0.1,
            color: i % 2 === 0 ? '#00f0ff' : '#ff0055'
          });
        }

        const moteCount = isMobile ? 20 : 45;
        for (let i = 0; i < moteCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.5 + Math.random() * 3,
            speedY: -(0.5 + Math.random() * 1.5),
            speedX: (Math.random() - 0.5) * 0.8,
            color: Math.random() > 0.5 ? '#00f0ff' : '#ffe600',
            opacity: 0.3 + Math.random() * 0.5
          });
        }
      } else if (theme === 'cyber') {
        // 👑 7. Royal 24K Solar Mirage (Volumetric Golden Sunbeams & Rotating Diamond Starbursts)
        const starCount = isMobile ? 18 : 35;
        for (let i = 0; i < starCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 8 + Math.random() * 18,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.015,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.03 + Math.random() * 0.03,
            opacity: 0.35 + Math.random() * 0.55
          });
        }

        const dustCount = isMobile ? 25 : 55;
        customEntities = [];
        for (let i = 0; i < dustCount; i++) {
          customEntities.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.5,
            speedY: -(0.3 + Math.random() * 0.8),
            speedX: (Math.random() - 0.5) * 0.4,
            pulse: Math.random() * Math.PI * 2
          });
        }
      } else if (theme === 'amethyst') {
        // 🌌 8. Event Horizon Singularity (Accretion Disk Particle Orbits & Relativistic Lensing)
        const particleCount = isMobile ? 120 : 260;
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const maxDist = Math.min(width, height) * 0.46;

        for (let i = 0; i < particleCount; i++) {
          const orbitRadius = 45 + Math.random() * maxDist;
          const angle = Math.random() * Math.PI * 2;
          const speed = (0.008 + (1 / orbitRadius) * 2.5) * (Math.random() > 0.5 ? 1 : 1);
          particles.push({
            orbitRadius,
            angle,
            speed,
            size: 1 + Math.random() * 2.5,
            tilt: 0.35, // Elliptical perspective
            color: Math.random() > 0.6 ? '#ff9f1c' : Math.random() > 0.3 ? '#7b2cbf' : '#48cae4',
            opacity: 0.3 + Math.random() * 0.7
          });
        }
      }
    }

    initScene(activeTheme);

    // ── Main Simulation Render Loop ──
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (activeTheme === 'ocean') {
        // 🌊 1. Mariana Bioluminescent Abyss
        // Draw Jellyfish / Siphonophores
        customEntities.forEach((jelly) => {
          jelly.y += jelly.speedY;
          jelly.swayPhase += 0.02;
          jelly.pulsePhase += jelly.pulseSpeed;
          jelly.x += Math.sin(jelly.swayPhase) * 0.6;

          if (jelly.y < -80) {
            jelly.y = height + 60;
            jelly.x = Math.random() * width;
          }

          const pulseFactor = 0.85 + 0.25 * Math.sin(jelly.pulsePhase);
          const r = jelly.size * pulseFactor;

          // Glowing Bell
          ctx.save();
          ctx.translate(jelly.x, jelly.y);

          // Radial aura
          const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.2);
          aura.addColorStop(0, `hsla(${jelly.hue}, 100%, 65%, 0.28)`);
          aura.addColorStop(0.6, `hsla(${jelly.hue}, 100%, 55%, 0.08)`);
          aura.addColorStop(1, 'transparent');
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Bell Dome
          ctx.beginPath();
          ctx.arc(0, 0, r, Math.PI, 0, false);
          ctx.quadraticCurveTo(r * 0.5, r * 0.3, 0, r * 0.2);
          ctx.quadraticCurveTo(-r * 0.5, r * 0.3, -r, 0);
          ctx.fillStyle = `hsla(${jelly.hue}, 100%, 75%, 0.35)`;
          ctx.strokeStyle = `hsla(${jelly.hue}, 100%, 85%, 0.7)`;
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // Trailing Tentacles
          for (let t = 0; t < jelly.tentacles; t++) {
            const offsetX = ((t - (jelly.tentacles - 1) / 2) * r * 1.5) / jelly.tentacles;
            ctx.beginPath();
            ctx.moveTo(offsetX, r * 0.2);
            for (let seg = 1; seg <= 4; seg++) {
              const segY = r * 0.2 + seg * (r * 0.8);
              const segX = offsetX + Math.sin(jelly.swayPhase + seg * 0.8 + t) * (r * 0.35);
              ctx.lineTo(segX, segY);
            }
            ctx.strokeStyle = `hsla(${jelly.hue}, 100%, 70%, 0.25)`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.restore();
        });

        // Floating Marine Dust
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
          ctx.fillStyle = `rgba(0, 245, 212, ${alpha})`;
          ctx.fill();
        });
      } else if (activeTheme === 'inferno') {
        // 🔥 2. Molten Obsidian Forge
        // Viscous Magma Waves
        waves.forEach((w) => {
          w.phase += w.speed;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 15) {
            const y = height * w.yRatio + Math.sin(x * w.freq + w.phase) * w.amp;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, height * w.yRatio - w.amp, 0, height);
          grad.addColorStop(0, w.grad[0]);
          grad.addColorStop(1, w.grad[1]);
          ctx.fillStyle = grad;
          ctx.fill();
        });

        // Heated Ember Sparks
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(frame * 0.05 + p.life) * 0.6;
          p.life++;

          if (p.y < height * 0.3 || p.life > p.maxLife) {
            p.y = height + 10;
            p.x = Math.random() * width;
            p.life = 0;
            p.speedY = -(1.2 + Math.random() * 3.2);
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
        // ⚡ 3. Quantum Cyberverse (3D Warp Streaks & Warp Rings)
        const centerX = width * 0.5;
        const centerY = height * 0.5;
        const maxDist = Math.hypot(width, height) * 0.55;

        // Draw Warp Rings
        customEntities.forEach((ring) => {
          ring.r += ring.speed;
          if (ring.r > ring.maxR) ring.r = 20;
          const alpha = Math.max(0, 0.25 * (1 - ring.r / ring.maxR));
          ctx.beginPath();
          ctx.arc(centerX, centerY, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

        // Draw 3D Warp Streaks
        particles.forEach((p) => {
          p.dist += p.speed;
          p.speed += 0.06; // Acceleration toward edges

          if (p.dist > maxDist) {
            p.dist = 15 + Math.random() * 30;
            p.speed = 1.5 + Math.random() * 3.5;
            p.angle = Math.random() * Math.PI * 2;
          }

          const curX = centerX + Math.cos(p.angle) * p.dist;
          const curY = centerY + Math.sin(p.angle) * p.dist;
          const tailX = centerX + Math.cos(p.angle) * Math.max(0, p.dist - p.length);
          const tailY = centerY + Math.sin(p.angle) * Math.max(0, p.dist - p.length);

          const progress = p.dist / maxDist;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(curX, curY);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = Math.min(0.85, progress * 1.2);
          ctx.lineWidth = 1 + progress * 2.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
      } else if (activeTheme === 'monochrome') {
        // ⚪ 4. Lunar Monolith Noir (Liquid Mercury Waves & Architectural Reticles)
        // Architectural Grid Coordinate Crosses
        const step = 140;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = step; x < width; x += step) {
          for (let y = step; y < height; y += step) {
            ctx.beginPath();
            ctx.moveTo(x - 5, y);
            ctx.lineTo(x + 5, y);
            ctx.moveTo(x, y - 5);
            ctx.lineTo(x, y + 5);
            ctx.stroke();
          }
        }

        // Liquid Mercury Waves
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
          ctx.fillStyle = `rgba(248, 250, 252, ${w.alpha})`;
          ctx.fill();
        });

        // Floating Diamond Facets
        particles.forEach((p, idx) => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.rot += p.rotSpeed;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.rect(-p.size, -p.size, p.size * 2, p.size * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          // Connection filaments
          for (let j = idx + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * (1 - dist / 100)})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        });
      } else if (activeTheme === 'arctic') {
        // ❄️ 5. Nordic Aurora Glacialis (Multi-Spectral Aurora Curtains & Frost Dust)
        waves.forEach((w) => {
          w.phase += w.speed;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (let x = 0; x <= width; x += 18) {
            const y = height * w.yRatio + Math.sin(x * w.freq + w.phase) * w.amp;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, 0);
          ctx.closePath();
          ctx.fillStyle = w.color;
          ctx.fill();
        });

        // Frost Dust
        particles.forEach((p) => {
          p.sway += 0.02;
          p.y += p.speedY;
          p.x += Math.sin(p.sway) * 0.6;

          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(6, 214, 160, ${p.opacity})`;
          ctx.shadowColor = '#06d6a0';
          ctx.shadowBlur = 4;
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'tokyo') {
        // 🌸 6. Cyber Neon Glitch (Audio Spectrum Bars & Scanlines)
        const barWidth = width / customEntities.length;
        customEntities.forEach((bar, i) => {
          if (Math.abs(bar.height - bar.targetHeight) < 2) {
            bar.targetHeight = 10 + Math.random() * 90;
          }
          bar.height += (bar.targetHeight - bar.height) * bar.speed;

          ctx.fillStyle = bar.color;
          ctx.globalAlpha = 0.22;
          ctx.fillRect(i * barWidth, height - bar.height, barWidth - 2, bar.height);
        });
        ctx.globalAlpha = 1;

        // Floating Glitch Motes
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'cyber') {
        // 👑 7. Royal 24K Solar Mirage (Volumetric Golden Sunbeams & Diamond Starbursts)
        // Volumetric Sunbeams
        const beamAngle = frame * 0.005;
        const sunbeamGrad = ctx.createLinearGradient(0, 0, width, height);
        sunbeamGrad.addColorStop(0, 'rgba(255, 208, 0, 0.03)');
        sunbeamGrad.addColorStop(0.5 + Math.sin(beamAngle) * 0.2, 'rgba(255, 242, 178, 0.07)');
        sunbeamGrad.addColorStop(1, 'rgba(179, 125, 20, 0.02)');
        ctx.fillStyle = sunbeamGrad;
        ctx.fillRect(0, 0, width, height);

        // Rotating Diamond Starbursts (✦)
        particles.forEach((star) => {
          star.rot += star.rotSpeed;
          star.pulse += star.pulseSpeed;
          const alpha = star.opacity * (0.6 + 0.4 * Math.sin(star.pulse));

          ctx.save();
          ctx.translate(star.x, star.y);
          ctx.rotate(star.rot);

          ctx.beginPath();
          ctx.moveTo(0, -star.size);
          ctx.quadraticCurveTo(0, 0, star.size * 0.22, 0);
          ctx.lineTo(star.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, star.size * 0.22);
          ctx.lineTo(0, star.size);
          ctx.quadraticCurveTo(0, 0, -star.size * 0.22, 0);
          ctx.lineTo(-star.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -star.size * 0.22);
          ctx.closePath();

          ctx.fillStyle = `rgba(255, 208, 0, ${alpha})`;
          ctx.shadowColor = '#ffd000';
          ctx.shadowBlur = star.size * 1.5;
          ctx.fill();
          ctx.restore();
        });
        ctx.shadowBlur = 0;

        // Ascending Golden Dust
        customEntities.forEach((mote) => {
          mote.y += mote.speedY;
          mote.x += mote.speedX;
          mote.pulse += 0.03;
          if (mote.y < -10) {
            mote.y = height + 10;
            mote.x = Math.random() * width;
          }
          const alpha = 0.25 * (0.6 + 0.4 * Math.sin(mote.pulse));
          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 242, 178, ${alpha})`;
          ctx.fill();
        });
      } else if (activeTheme === 'amethyst') {
        // 🌌 8. Event Horizon Singularity (Accretion Disk Orbit & Relativistic Lensing)
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Singularity Black Core & Accretion Glow Ring
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, 90);
        coreGrad.addColorStop(0, 'rgba(4, 2, 9, 0.95)');
        coreGrad.addColorStop(0.4, 'rgba(255, 159, 28, 0.25)');
        coreGrad.addColorStop(0.7, 'rgba(123, 44, 191, 0.15)');
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
        ctx.fill();

        // Singularity Void Core
        ctx.beginPath();
        ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#040209';
        ctx.shadowColor = '#ff9f1c';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Orbiting Accretion Particles
        particles.forEach((p) => {
          p.angle += p.speed;

          // Relativistic elliptical coordinates
          const x = centerX + Math.cos(p.angle) * p.orbitRadius;
          const y = centerY + Math.sin(p.angle) * p.orbitRadius * p.tilt;

          // Relativistic Doppler beaming: brighter when moving toward viewer (left side)
          const doppler = Math.sin(p.angle) < 0 ? 1.3 : 0.6;
          const currentAlpha = Math.min(1, p.opacity * doppler);

          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha;
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
