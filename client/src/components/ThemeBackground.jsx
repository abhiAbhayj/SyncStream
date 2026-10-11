import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * The 8 New Distinct Themes:
 * 1. synthwave      — ⚡ Vibrant Synthwave Horizon: Slow-gliding low-frequency grid floor, distant foggy horizon & ambient glow nodes
 * 2. aurora         — 🌌 Electric Twilight Aurora: Soft, ultra-slow gradient mesh / northern lights wash morphing in deep background
 * 3. solar-flare    — 🔥 Crimson Solar Flare: Very sparse, tiny ember dust motes drifting upward lazily with muted warmth
 * 4. neon-frost     — 💎 Neon Frost Glassmorphism: Lazy glass-refraction light leak sliding across upper corner over 20+ second cycle
 * 5. plasma-web     — 🪐 Cyberpunk Plasma Web: Ultra-thin low-opacity connecting vector nodes drifting like microscopic stardust
 * 6. abyssal-trench — 🌊 Neon Abyssal Trench: Slow sweeping horizontal wave lines with minimal opacity mimicking deep ocean reflection
 * 7. nebula-drift   — 🚀 Quantum Nebula Drift: Sparse starfield where distant stars twinkle independently (max 10-12 points)
 * 8. citrus-arcade  — 🍊 Neon Citrus Arcade: Micro-geometric squares / digital static pixels drifting down at low density & high transparency
 */

const VALID_THEMES = [
  'synthwave',
  'aurora',
  'solar-flare',
  'neon-frost',
  'plasma-web',
  'abyssal-trench',
  'nebula-drift',
  'citrus-arcade'
];

export default function ThemeBackground() {
  const canvasRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem('syncstream_theme');
    if (saved && VALID_THEMES.includes(saved)) return saved;
    return 'synthwave';
  });

  // Track body class changes to switch simulation mode instantly
  useEffect(() => {
    const detectTheme = () => {
      const classList = document.body.classList;
      for (const t of VALID_THEMES) {
        if (classList.contains(`theme-${t}`)) return t;
      }
      const saved = localStorage.getItem('syncstream_theme');
      if (saved && VALID_THEMES.includes(saved)) return saved;
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
        // 1. ⚡ Vibrant Synthwave Horizon
        // Slow-gliding perspective grid floor + distant foggy horizon + pulsing ambient nodes
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
      } else if (theme === 'aurora') {
        // 2. 🌌 Electric Twilight Aurora
        // Soft, ultra-slow morphing gradient wash / northern lights ribbons
        const ribbonCount = isMobile ? 3 : 4;
        const ribbons = [];
        for (let i = 0; i < ribbonCount; i++) {
          ribbons.push({
            baseY: height * (0.18 + i * 0.16),
            amplitude: isMobile ? 35 : 55,
            wavelength: isMobile ? 350 : 550,
            phase: i * 1.5,
            speed: 0.0025 + i * 0.0008,
            color: i % 2 === 0 ? 'rgba(139, 92, 246, ' : 'rgba(16, 185, 129, ',
            baseAlpha: 0.14 - i * 0.02
          });
        }
        state = { ribbons };
      } else if (theme === 'solar-flare') {
        // 3. 🔥 Crimson Solar Flare
        // Very sparse, tiny ember dust motes drifting upward lazily with muted warmth
        const count = isMobile ? 18 : 34;
        const motes = [];
        for (let i = 0; i < count; i++) {
          motes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.3 + 0.8,
            vy: -(Math.random() * 0.35 + 0.25), // lazy upward drift
            swayAmp: Math.random() * 0.4 + 0.2,
            swaySpeed: Math.random() * 0.015 + 0.008,
            phase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.4 ? '#ff5e00' : (Math.random() > 0.5 ? '#ffb703' : '#e11d48'),
            alphaBase: Math.random() * 0.25 + 0.25
          });
        }
        state = { motes };
      } else if (theme === 'neon-frost') {
        // 4. 💎 Neon Frost Glassmorphism
        // Lazy glass-refraction light leak sliding across the upper corner over a 20+ second cycle
        const crystals = [];
        const crystalCount = isMobile ? 8 : 14;
        for (let i = 0; i < crystalCount; i++) {
          crystals.push({
            x: Math.random() * width * 0.6,
            y: Math.random() * height * 0.5,
            size: Math.random() * 2 + 1,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.01 + 0.005
          });
        }
        state = { crystals, cycleDurationMs: 24000 };
      } else if (theme === 'plasma-web') {
        // 5. 🪐 Cyberpunk Plasma Web
        // Ultra-thin, low-opacity connecting vector nodes drifting like microscopic stardust
        const nodeCount = isMobile ? 22 : 46;
        const nodes = [];
        for (let i = 0; i < nodeCount; i++) {
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            radius: Math.random() * 1.2 + 0.8,
            color: Math.random() > 0.45 ? '#00ff66' : '#2563eb',
            phase: Math.random() * Math.PI * 2,
            blinkSpeed: Math.random() * 0.012 + 0.006
          });
        }
        state = { nodes, maxDistance: isMobile ? 95 : 130 };
      } else if (theme === 'abyssal-trench') {
        // 6. 🌊 Neon Abyssal Trench
        // Slow sweeping horizontal wave lines with minimal opacity mimicking deep ocean reflection
        const waveCount = isMobile ? 3 : 5;
        const waves = [];
        for (let i = 0; i < waveCount; i++) {
          waves.push({
            baseY: height * (0.25 + (i * 0.5) / waveCount),
            amplitude: isMobile ? 20 : 36,
            wavelength: isMobile ? 400 : 620,
            speed: 0.006 + i * 0.002,
            phase: i * 1.8,
            color: i % 2 === 0 ? 'rgba(6, 182, 212, ' : 'rgba(99, 102, 241, ',
            alpha: 0.16 - i * 0.02
          });
        }
        state = { waves };
      } else if (theme === 'nebula-drift') {
        // 7. 🚀 Quantum Nebula Drift
        // Sparse starfield background where distant stars twinkle independently (max 10-12 points)
        const starCount = isMobile ? 8 : 12; // Maximum 10-12 twinkling points on screen!
        const stars = [];
        for (let i = 0; i < starCount; i++) {
          stars.push({
            x: width * (0.05 + Math.random() * 0.9),
            y: height * (0.05 + Math.random() * 0.9),
            radius: Math.random() * 1.8 + 1.0,
            phase: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.008 + 0.004, // slow random intervals (5-10s)
            color: i % 3 === 0 ? '#ec4899' : (i % 3 === 1 ? '#a855f7' : '#ffffff'),
            hasSpikes: Math.random() > 0.35
          });
        }
        state = { stars };
      } else if (theme === 'citrus-arcade') {
        // 8. 🍊 Neon Citrus Arcade
        // Micro-geometric squares / digital static pixels drifting down at very low density & high transparency
        const pixelCount = isMobile ? 15 : 28;
        const pixels = [];
        for (let i = 0; i < pixelCount; i++) {
          pixels.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() > 0.6 ? 3 : (Math.random() > 0.3 ? 2 : 4),
            vy: Math.random() * 0.45 + 0.35, // slow downward pace
            color: Math.random() > 0.4 ? '#ff7a00' : '#ffd600',
            alpha: Math.random() * 0.18 + 0.14,
            pulsePhase: Math.random() * Math.PI * 2
          });
        }
        state = { pixels };
      }
    }

    initScene(activeTheme);

    function render(timestamp) {
      frame++;
      ctx.clearRect(0, 0, width, height);

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

        // Faint, slow-pulsing ambient glow nodes along the horizon
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
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
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
      } else if (activeTheme === 'aurora') {
        // 2. 🌌 Electric Twilight Aurora
        // Soft, ultra-slow morphing gradient mesh
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        (state.ribbons || []).forEach((r) => {
          const phaseOffset = frame * r.speed + r.phase;
          const alpha = r.baseAlpha + Math.sin(phaseOffset * 0.6) * 0.04;

          ctx.beginPath();
          ctx.moveTo(0, r.baseY);

          const step = width < 768 ? 40 : 25;
          for (let x = 0; x <= width + step; x += step) {
            const waveY =
              r.baseY +
              Math.sin((x / r.wavelength) * Math.PI * 2 + phaseOffset) * r.amplitude +
              Math.cos((x / (r.wavelength * 0.6)) * Math.PI * 2 + phaseOffset * 0.8) * (r.amplitude * 0.4);
            ctx.lineTo(x, waveY);
          }
          ctx.lineTo(width, r.baseY + 120);
          ctx.lineTo(0, r.baseY + 120);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, r.baseY - r.amplitude, 0, r.baseY + 120);
          grad.addColorStop(0, `${r.color}0)`);
          grad.addColorStop(0.4, `${r.color}${alpha.toFixed(3)})`);
          grad.addColorStop(1, `${r.color}0)`);

          ctx.fillStyle = grad;
          ctx.fill();
        });

        ctx.restore();
      } else if (activeTheme === 'solar-flare') {
        // 3. 🔥 Crimson Solar Flare
        // Very sparse, tiny ember dust motes drifting upward lazily with muted warmth
        (state.motes || []).forEach((m) => {
          m.y += m.vy;
          m.x += Math.sin(frame * m.swaySpeed + m.phase) * m.swayAmp;

          // Wrap around top to bottom
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
      } else if (activeTheme === 'neon-frost') {
        // 4. 💎 Neon Frost Glassmorphism
        // Lazy glass-refraction light leak that slides across the upper corner over a 20+ second cycle
        const now = timestamp || performance.now();
        const cycleProgress = (now % (state.cycleDurationMs || 24000)) / (state.cycleDurationMs || 24000);
        // Smooth sine travel from upper left to upper right
        const leakX = width * (0.2 + Math.sin(cycleProgress * Math.PI * 2) * 0.35);
        const leakY = height * (0.15 + Math.cos(cycleProgress * Math.PI * 2) * 0.12);
        const leakRadius = Math.max(width, height) * 0.55;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Outer soft cyan leak
        const gradCyan = ctx.createRadialGradient(leakX, leakY, 0, leakX, leakY, leakRadius);
        gradCyan.addColorStop(0, 'rgba(56, 189, 248, 0.13)');
        gradCyan.addColorStop(0.4, 'rgba(56, 189, 248, 0.04)');
        gradCyan.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = gradCyan;
        ctx.fillRect(0, 0, width, height);

        // Inner refracted lavender caustics
        const gradLav = ctx.createRadialGradient(leakX + 60, leakY - 30, 0, leakX + 60, leakY - 30, leakRadius * 0.65);
        gradLav.addColorStop(0, 'rgba(192, 132, 252, 0.11)');
        gradLav.addColorStop(0.5, 'rgba(192, 132, 252, 0.03)');
        gradLav.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = gradLav;
        ctx.fillRect(0, 0, width, height);

        // Faint microscopic crystals catching refraction
        (state.crystals || []).forEach((c) => {
          const shimmer = (Math.sin(frame * c.speed + c.phase) + 1) * 0.5;
          ctx.fillStyle = `rgba(255, 255, 255, ${(shimmer * 0.28).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      } else if (activeTheme === 'plasma-web') {
        // 5. 🪐 Cyberpunk Plasma Web
        // Ultra-thin, low-opacity connecting vector nodes that drift like microscopic stardust
        const nodes = state.nodes || [];
        const maxDist = state.maxDistance || 120;

        // Update node positions
        nodes.forEach((n) => {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        });

        // Draw connecting vector lines
        ctx.lineWidth = 0.6;
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

        // Draw stardust nodes with soft blinking transitions
        nodes.forEach((n) => {
          const blink = (Math.sin(frame * n.blinkSpeed + n.phase) + 1) * 0.5;
          const alpha = blink * 0.45 + 0.15;

          ctx.save();
          ctx.fillStyle = n.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (activeTheme === 'abyssal-trench') {
        // 6. 🌊 Neon Abyssal Trench
        // Slow sweeping horizontal wave lines with minimal opacity fluctuation
        (state.waves || []).forEach((w) => {
          const phaseOffset = frame * w.speed + w.phase;

          ctx.save();
          ctx.lineWidth = 1.3;
          ctx.strokeStyle = `${w.color}${w.alpha.toFixed(3)})`;
          ctx.beginPath();

          const step = width < 768 ? 30 : 18;
          ctx.moveTo(0, w.baseY + Math.sin(phaseOffset) * w.amplitude);

          for (let x = 0; x <= width + step; x += step) {
            const waveY =
              w.baseY +
              Math.sin((x / w.wavelength) * Math.PI * 2 + phaseOffset) * w.amplitude +
              Math.cos((x / (w.wavelength * 0.5)) * Math.PI * 2 + phaseOffset * 0.7) * (w.amplitude * 0.35);
            ctx.lineTo(x, waveY);
          }

          ctx.stroke();
          ctx.restore();
        });
      } else if (activeTheme === 'nebula-drift') {
        // 7. 🚀 Quantum Nebula Drift
        // Sparse starfield background where distant stars twinkle independently (maximum 10-12 points)
        // Soft distant ambient nebula wash
        const nebGrad1 = ctx.createRadialGradient(width * 0.3, height * 0.4, 0, width * 0.3, height * 0.4, width * 0.5);
        nebGrad1.addColorStop(0, 'rgba(236, 72, 153, 0.06)');
        nebGrad1.addColorStop(1, 'rgba(12, 7, 20, 0)');
        ctx.fillStyle = nebGrad1;
        ctx.fillRect(0, 0, width, height);

        const nebGrad2 = ctx.createRadialGradient(width * 0.75, height * 0.65, 0, width * 0.75, height * 0.65, width * 0.45);
        nebGrad2.addColorStop(0, 'rgba(168, 85, 247, 0.05)');
        nebGrad2.addColorStop(1, 'rgba(12, 7, 20, 0)');
        ctx.fillStyle = nebGrad2;
        ctx.fillRect(0, 0, width, height);

        // Maximum 10-12 twinkling stars on screen
        (state.stars || []).forEach((s) => {
          const twinkle = (Math.sin(frame * s.twinkleSpeed + s.phase) + 1) * 0.5; // 0 to 1
          const alpha = Math.max(0.12, twinkle * 0.95);

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = s.color;

          // Main star core
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius * (0.8 + twinkle * 0.4), 0, Math.PI * 2);
          ctx.fill();

          // Delicate 4-point cross diffraction spikes on brightest points
          if (s.hasSpikes && twinkle > 0.5) {
            const spikeLen = (twinkle - 0.5) * 14;
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(s.x - spikeLen, s.y);
            ctx.lineTo(s.x + spikeLen, s.y);
            ctx.moveTo(s.x, s.y - spikeLen);
            ctx.lineTo(s.x, s.y + spikeLen);
            ctx.stroke();
          }

          ctx.restore();
        });
      } else if (activeTheme === 'citrus-arcade') {
        // 8. 🍊 Neon Citrus Arcade
        // Micro-geometric squares / digital static pixels drifting down at very low density & high transparency
        (state.pixels || []).forEach((p) => {
          p.y += p.vy;
          if (p.y > height + 8) {
            p.y = -8;
            p.x = Math.random() * width;
          }

          const pulse = (Math.sin(frame * 0.03 + p.pulsePhase) + 1) * 0.5;
          const alpha = p.alpha + pulse * 0.08;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          // Clean pixel block render
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
          ctx.restore();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
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
