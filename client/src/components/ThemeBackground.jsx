import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * The 8 Professional Theme Animation Engines:
 * 1. ocean      — 🎬 Cinematic OLED: Anamorphic lens flare sweeps & atmospheric theater spotlights
 * 2. arctic     — 🧊 Glassmorphic Slate: Frosted glass panes & reflective diagonal light shimmers
 * 3. inferno    — 🎨 Anime Ink & Cell: Floating manga ink motes, halftone dots & cell speedlines
 * 4. amethyst   — 🌌 Acoustic Aurora: Slow-moving fluid acoustic mesh gradient waves & soft lavender motes
 * 5. matrix     — ⚡ Monochrome Quantum: Minimalist laser green quantum grid & sub-pixel data pulses
 * 6. cyber      — 👑 Premium Gold Luxe: Floating 24K gold dust, champagne caustics & astrolabe rings
 * 7. tokyo      — 🪩 Vibrant Synth: Breathing synthwave wave pulses & cyan/magenta heartbeat glow
 * 8. monochrome — 🏛️ Studio Minimal: Warm sand kinetic currents & clean architectural geometry
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
        // 🎬 1. Cinematic OLED (Spotlight Beams & Anamorphic Lens Flare Sweeps)
        customEntities = [
          { x: width * 0.25, y: -50, angle: 0.35, width: 140, speed: 0.003, color: 'rgba(229, 9, 20, 0.06)' },
          { x: width * 0.75, y: -50, angle: -0.35, width: 160, speed: -0.003, color: 'rgba(185, 28, 28, 0.05)' }
        ];

        // Muted Silver Stardust motes
        const dustCount = isMobile ? 25 : 50;
        for (let i = 0; i < dustCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.2,
            speedY: -(0.2 + Math.random() * 0.5),
            speedX: (Math.random() - 0.5) * 0.3,
            opacity: 0.15 + Math.random() * 0.45
          });
        }
      } else if (theme === 'arctic') {
        // 🧊 2. Glassmorphic Slate (Floating Frosted Panes & Reflective Light Sweep)
        const paneCount = isMobile ? 4 : 7;
        customEntities = [];
        for (let i = 0; i < paneCount; i++) {
          customEntities.push({
            x: Math.random() * (width - 150),
            y: Math.random() * (height - 100),
            w: 120 + Math.random() * 160,
            h: 80 + Math.random() * 120,
            rot: (Math.random() - 0.5) * 0.25,
            speedY: -(0.2 + Math.random() * 0.4),
            speedRot: (Math.random() - 0.5) * 0.002,
            sweepOffset: Math.random() * Math.PI * 2
          });
        }

        const frostCount = isMobile ? 30 : 60;
        for (let i = 0; i < frostCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.5,
            speedY: 0.3 + Math.random() * 0.8,
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: 0.2 + Math.random() * 0.5
          });
        }
      } else if (theme === 'inferno') {
        // 🎨 3. Anime Ink & Cell (Manga Ink Motes, Halftone & Speedline Accents)
        const inkCount = isMobile ? 25 : 50;
        for (let i = 0; i < inkCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 2 + Math.random() * 4.5,
            speedY: -(0.6 + Math.random() * 1.5),
            speedX: (Math.random() - 0.5) * 0.8,
            color: Math.random() > 0.4 ? '#ff4550' : '#1e3a8a',
            opacity: 0.25 + Math.random() * 0.5
          });
        }

        // Manga Speedline Streaks
        customEntities = [];
        const streakCount = isMobile ? 6 : 12;
        for (let i = 0; i < streakCount; i++) {
          customEntities.push({
            x: Math.random() * width,
            y: Math.random() * height,
            length: 60 + Math.random() * 120,
            speed: 4 + Math.random() * 6,
            opacity: 0.2 + Math.random() * 0.35
          });
        }
      } else if (theme === 'amethyst') {
        // 🌌 4. Acoustic Aurora (Fluid Acoustic Mesh Gradient Waves)
        waves = [
          { yRatio: 0.35, amp: 45, freq: 0.0014, speed: 0.006, phase: 0, color: 'rgba(45, 212, 191, 0.08)' },
          { yRatio: 0.60, amp: 60, freq: 0.0018, speed: -0.005, phase: 2.1, color: 'rgba(99, 102, 241, 0.07)' },
          { yRatio: 0.82, amp: 50, freq: 0.0022, speed: 0.007, phase: 4.2, color: 'rgba(224, 231, 255, 0.04)' }
        ];

        const moteCount = isMobile ? 25 : 50;
        for (let i = 0; i < moteCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.2 + Math.random() * 2.8,
            speedY: -(0.25 + Math.random() * 0.65),
            speedX: (Math.random() - 0.5) * 0.35,
            opacity: 0.25 + Math.random() * 0.55
          });
        }
      } else if (theme === 'matrix') {
        // ⚡ 5. Monochrome Quantum (Minimalist Laser Green Grid & Quantum Data Pulses)
        const step = isMobile ? 80 : 100;
        const cols = Math.ceil(width / step) + 1;
        const rows = Math.ceil(height / step) + 1;

        customEntities = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            customEntities.push({
              x: c * step,
              y: r * step,
              pulse: Math.random() * Math.PI * 2,
              pulseSpeed: 0.02 + Math.random() * 0.03
            });
          }
        }

        // Moving Quantum Pulses
        const pulseCount = isMobile ? 12 : 24;
        for (let i = 0; i < pulseCount; i++) {
          particles.push({
            x: Math.floor(Math.random() * cols) * step,
            y: Math.floor(Math.random() * rows) * step,
            dir: Math.random() > 0.5 ? 'h' : 'v',
            speed: 1.5 + Math.random() * 2.5,
            length: 25 + Math.random() * 35
          });
        }
      } else if (theme === 'cyber') {
        // 👑 6. Premium Gold Luxe (24K Gold Dust, Champagne Caustics & Astrolabe Rings)
        const maxRadius = Math.min(width, height) * 0.42;
        customEntities = [
          { rx: maxRadius * 0.85, ry: maxRadius * 0.40, tilt: 0.35, rot: 0, speed: 0.005, color: 'rgba(212, 175, 55, 0.35)' },
          { rx: maxRadius * 0.65, ry: maxRadius * 0.30, tilt: -0.5, rot: Math.PI / 3, speed: -0.007, color: 'rgba(180, 142, 38, 0.30)' }
        ];

        // 24K Gold Dust
        const goldCount = isMobile ? 30 : 65;
        for (let i = 0; i < goldCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.2 + Math.random() * 3,
            speedY: -(0.3 + Math.random() * 0.7),
            speedX: (Math.random() - 0.5) * 0.4,
            pulse: Math.random() * Math.PI * 2,
            opacity: 0.3 + Math.random() * 0.6
          });
        }
      } else if (theme === 'tokyo') {
        // 🪩 7. Vibrant Synth (Breathing Synthwave Mesh & Cyan/Magenta Heartbeat Glow)
        waves = [
          { yRatio: 0.45, amp: 40, freq: 0.0018, speed: 0.008, phase: 0, color: 'rgba(213, 63, 140, 0.08)' },
          { yRatio: 0.75, amp: 55, freq: 0.0022, speed: -0.007, phase: 2.5, color: 'rgba(100, 255, 218, 0.07)' }
        ];

        const moteCount = isMobile ? 25 : 50;
        for (let i = 0; i < moteCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.5 + Math.random() * 3,
            speedY: -(0.4 + Math.random() * 1.2),
            speedX: (Math.random() - 0.5) * 0.5,
            color: Math.random() > 0.5 ? '#d53f8c' : '#64ffda',
            opacity: 0.25 + Math.random() * 0.55
          });
        }
      } else if (theme === 'monochrome') {
        // 🏛️ 8. Studio Minimal (Warm Sand Kinetic Currents & Clean Architectural Lines)
        waves = [
          { yRatio: 0.40, amp: 30, freq: 0.0012, speed: 0.004, phase: 0, color: 'rgba(221, 107, 32, 0.05)' },
          { yRatio: 0.70, amp: 40, freq: 0.0015, speed: -0.004, phase: 1.8, color: 'rgba(192, 86, 33, 0.04)' }
        ];

        const sandCount = isMobile ? 20 : 40;
        for (let i = 0; i < sandCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.2 + Math.random() * 2.5,
            speedY: -(0.2 + Math.random() * 0.5),
            speedX: (Math.random() - 0.5) * 0.3,
            opacity: 0.2 + Math.random() * 0.45
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
        // 🎬 1. Cinematic OLED (Spotlight Beams & Muted Silver Stardust)
        customEntities.forEach((beam) => {
          beam.angle += Math.sin(frame * beam.speed) * 0.002;
          ctx.save();
          ctx.translate(beam.x, beam.y);
          ctx.rotate(beam.angle);

          const bGrad = ctx.createLinearGradient(0, 0, 0, height * 1.2);
          bGrad.addColorStop(0, beam.color);
          bGrad.addColorStop(0.7, beam.color.replace('0.06', '0.02').replace('0.05', '0.01'));
          bGrad.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.moveTo(-beam.width / 2, 0);
          ctx.lineTo(beam.width * 1.5, height * 1.2);
          ctx.lineTo(-beam.width * 1.5, height * 1.2);
          ctx.closePath();
          ctx.fillStyle = bGrad;
          ctx.fill();
          ctx.restore();
        });

        // Muted Silver Stardust
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212, 212, 216, ${p.opacity})`;
          ctx.fill();
        });
      } else if (activeTheme === 'arctic') {
        // 🧊 2. Glassmorphic Slate (Floating Frosted Panes & Shimmer)
        customEntities.forEach((pane) => {
          pane.y += pane.speedY;
          pane.rot += pane.speedRot;
          pane.sweepOffset += 0.02;

          if (pane.y < -pane.h) {
            pane.y = height + 50;
            pane.x = Math.random() * (width - 150);
          }

          ctx.save();
          ctx.translate(pane.x + pane.w / 2, pane.y + pane.h / 2);
          ctx.rotate(pane.rot);

          // Translucent frosted glass pane
          ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
          ctx.lineWidth = 1;
          ctx.fillRect(-pane.w / 2, -pane.h / 2, pane.w, pane.h);
          ctx.strokeRect(-pane.w / 2, -pane.h / 2, pane.w, pane.h);

          // Diagonal light shimmer sweep
          const sweepX = Math.sin(pane.sweepOffset) * pane.w;
          const sGrad = ctx.createLinearGradient(sweepX - 25, -pane.h / 2, sweepX + 25, pane.h / 2);
          sGrad.addColorStop(0, 'transparent');
          sGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
          sGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = sGrad;
          ctx.fillRect(-pane.w / 2, -pane.h / 2, pane.w, pane.h);

          ctx.restore();
        });

        // Frost particles
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(248, 250, 252, ${p.opacity})`;
          ctx.fill();
        });
      } else if (activeTheme === 'inferno') {
        // 🎨 3. Anime Ink & Cell (Manga Ink Motes & Speedline Accents)
        // Speedlines
        customEntities.forEach((line) => {
          line.y += line.speed;
          if (line.y > height + line.length) {
            line.y = -line.length;
            line.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x, line.y + line.length);
          ctx.strokeStyle = `rgba(30, 58, 138, ${line.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

        // Ink Motes
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
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      } else if (activeTheme === 'amethyst') {
        // 🌌 4. Acoustic Aurora (Fluid Acoustic Mesh Gradient Waves)
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

        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 231, 255, ${p.opacity})`;
          ctx.fill();
        });
      } else if (activeTheme === 'matrix') {
        // ⚡ 5. Monochrome Quantum (Laser Green Grid & Quantum Pulses)
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
        ctx.lineWidth = 1;
        customEntities.forEach((node) => {
          node.pulse += node.pulseSpeed;
          const alpha = 0.04 + 0.06 * Math.sin(node.pulse);
          ctx.beginPath();
          ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
          ctx.fill();
        });

        particles.forEach((p) => {
          if (p.dir === 'h') {
            p.x += p.speed;
            if (p.x > width + p.length) p.x = -p.length;
            ctx.beginPath();
            ctx.moveTo(p.x - p.length, p.y);
            ctx.lineTo(p.x, p.y);
          } else {
            p.y += p.speed;
            if (p.y > height + p.length) p.y = -p.length;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - p.length);
            ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
          ctx.lineWidth = 1.4;
          ctx.stroke();
        });
      } else if (activeTheme === 'cyber') {
        // 👑 6. Premium Gold Luxe (24K Gold Dust & Astrolabe Rings)
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        customEntities.forEach((ring) => {
          ring.rot += ring.speed;
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(ring.tilt);
          ctx.beginPath();
          ctx.ellipse(0, 0, ring.rx, ring.ry, ring.rot, 0, Math.PI * 2);
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        });

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
          ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
          ctx.shadowColor = '#d4af37';
          ctx.shadowBlur = 4;
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'tokyo') {
        // 🪩 7. Vibrant Synth (Heartbeat Breathing Glow & Waves)
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
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      } else if (activeTheme === 'monochrome') {
        // 🏛️ 8. Studio Minimal (Warm Sand Kinetic Waves & Clean Motes)
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

        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(221, 107, 32, ${p.opacity})`;
          ctx.fill();
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
