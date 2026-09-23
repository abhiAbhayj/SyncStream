import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Brand-New Themes matching exact user specifications:
 * 1. ocean     — ⚔️ Cyber-Ronin (Anime Focus): Katana slash energy arcs, neon blood & cyber cyan sparks
 * 2. inferno   — 🌊 Abyssal Fluid (Movie Focus): Deep sea water turbulence & bioluminescent caustics
 * 3. matrix    — ⚡ Neon Matrix (Sci-Fi/Tech): Streaming matrix digital rain & phosphor terminal grid
 * 4. monochrome— ⚪ Graphite Sketch (Manga Focus): Charcoal pencil cross-hatchings & manga screentones
 * 5. arctic    — ❄️ Oxygen Glare (Modern UI): Smoked glass caustics, sunset/teal glares & floating bokeh
 * 6. tokyo     — 👾 CRT Arcade (Action Series): Rolling CRT scanlines & chromatic aberration RGB splits
 * 7. cyber     — 👑 Velvet Eclipse (Premium Focus): Vantablack solar eclipse corona & aged gold stardust
 * 8. amethyst  — 🎵 Midnight Vinyl (Music Focus): 3D holographic spinning vinyl grooves & ultraviolet waves
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
    let slashes = [];
    let frame = 0;

    function initScene(theme) {
      particles = [];
      customEntities = [];
      waves = [];
      slashes = [];
      frame = 0;

      const isMobile = width < 768;

      if (theme === 'ocean') {
        // ⚔️ 1. Cyber-Ronin (Katana Slash Energy Arcs & Neon Blood/Cyan Sparks)
        const sparkCount = isMobile ? 40 : 80;
        for (let i = 0; i < sparkCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.5,
            speedY: -(0.5 + Math.random() * 1.5),
            speedX: (Math.random() - 0.5) * 1.2,
            color: Math.random() > 0.4 ? '#FF003C' : '#00F0FF',
            opacity: 0.3 + Math.random() * 0.7,
            life: Math.random() * 60,
            maxLife: 40 + Math.random() * 60
          });
        }
      } else if (theme === 'inferno') {
        // 🌊 2. Abyssal Fluid (Deep Sea Trench Fluid Ripple & Bioluminescent Caustics)
        waves = [
          { yRatio: 0.35, amp: 45, freq: 0.0018, speed: 0.008, phase: 0, color: 'rgba(6, 182, 212, 0.12)' },
          { yRatio: 0.65, amp: 60, freq: 0.0014, speed: -0.006, phase: 2.2, color: 'rgba(59, 130, 246, 0.10)' },
          { yRatio: 0.90, amp: 35, freq: 0.0025, speed: 0.010, phase: 4.0, color: 'rgba(14, 165, 233, 0.08)' }
        ];

        const moteCount = isMobile ? 30 : 60;
        for (let i = 0; i < moteCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.2 + Math.random() * 3,
            speedY: -(0.2 + Math.random() * 0.6),
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: 0.2 + Math.random() * 0.6,
            pulse: Math.random() * Math.PI * 2
          });
        }
      } else if (theme === 'matrix') {
        // ⚡ 3. Neon Matrix (Streaming Matrix Digital Rain Columns)
        const colWidth = isMobile ? 22 : 18;
        const colCount = Math.floor(width / colWidth);
        const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';

        customEntities = [];
        for (let i = 0; i < colCount; i++) {
          customEntities.push({
            x: i * colWidth,
            y: Math.random() * -height,
            speed: 2.5 + Math.random() * 4.5,
            length: 12 + Math.floor(Math.random() * 18),
            chars: Array.from({ length: 30 }, () => chars[Math.floor(Math.random() * chars.length)])
          });
        }
      } else if (theme === 'monochrome') {
        // ⚪ 4. Graphite Sketch (Charcoal Pencil Hatching Lines & Manga Screentones)
        const toneCount = isMobile ? 35 : 75;
        for (let i = 0; i < toneCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.5,
            speedY: (Math.random() - 0.5) * 0.3,
            speedX: (Math.random() - 0.5) * 0.3,
            opacity: 0.15 + Math.random() * 0.45
          });
        }
      } else if (theme === 'arctic') {
        // ❄️ 5. Oxygen Glare (Smoked Glass Volumetric Light & Sunset/Teal Glares)
        const glareCount = isMobile ? 4 : 8;
        customEntities = [];
        for (let i = 0; i < glareCount; i++) {
          customEntities.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 120 + Math.random() * 220,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            color: i % 2 === 0 ? 'rgba(249, 115, 22, 0.08)' : 'rgba(20, 184, 166, 0.08)',
            pulse: Math.random() * Math.PI * 2
          });
        }

        const moteCount = isMobile ? 25 : 55;
        for (let i = 0; i < moteCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.5,
            speedY: -(0.3 + Math.random() * 0.8),
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: 0.2 + Math.random() * 0.6
          });
        }
      } else if (theme === 'tokyo') {
        // 👾 6. CRT Arcade (Rolling CRT Phosphor Scanlines & RGB Channel Split Motes)
        const moteCount = isMobile ? 30 : 60;
        for (let i = 0; i < moteCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.5 + Math.random() * 3,
            speedY: -(0.5 + Math.random() * 1.5),
            speedX: (Math.random() - 0.5) * 1.5,
            color: Math.random() > 0.5 ? '#39FF14' : '#FF00FF',
            opacity: 0.35 + Math.random() * 0.6
          });
        }
      } else if (theme === 'cyber') {
        // 👑 7. Velvet Eclipse (Vantablack Cosmos, Eclipse Corona & Aged Gold Stardust)
        const dustCount = isMobile ? 35 : 75;
        for (let i = 0; i < dustCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.8,
            speedY: -(0.2 + Math.random() * 0.6),
            speedX: (Math.random() - 0.5) * 0.4,
            color: Math.random() > 0.4 ? '#D4AF37' : '#991B1B',
            opacity: 0.3 + Math.random() * 0.6,
            pulse: Math.random() * Math.PI * 2
          });
        }
      } else if (theme === 'amethyst') {
        // 🎵 8. Midnight Vinyl (3D Isometric Floating Spinning Vinyl Grooves & Ultraviolet Audio Waves)
        const maxRadius = Math.min(width, height) * 0.44;
        customEntities = [
          { r: maxRadius * 0.9, rot: 0, speed: 0.012, color: 'rgba(139, 92, 246, 0.35)' },
          { r: maxRadius * 0.7, rot: 0, speed: 0.015, color: 'rgba(217, 70, 239, 0.30)' },
          { r: maxRadius * 0.5, rot: 0, speed: 0.018, color: 'rgba(168, 85, 247, 0.25)' },
          { r: maxRadius * 0.3, rot: 0, speed: 0.022, color: 'rgba(217, 70, 239, 0.45)' }
        ];

        const audioParticleCount = isMobile ? 35 : 70;
        for (let i = 0; i < audioParticleCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.5,
            speedY: -(0.3 + Math.random() * 0.9),
            speedX: (Math.random() - 0.5) * 0.6,
            color: Math.random() > 0.5 ? '#8B5CF6' : '#D946EF',
            opacity: 0.25 + Math.random() * 0.65
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
        // ⚔️ 1. Cyber-Ronin (Katana Slash Energy Arcs & Blood/Cyan Sparks)
        // Periodic Katana Slash Arc
        if (Math.random() < 0.025 && slashes.length < 3) {
          const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.4;
          const startX = Math.random() * width;
          const startY = Math.random() * height * 0.5;
          const len = 160 + Math.random() * 220;
          slashes.push({
            x1: startX,
            y1: startY,
            x2: startX + Math.cos(angle) * len,
            y2: startY + Math.sin(angle) * len,
            opacity: 1,
            color: Math.random() > 0.5 ? '#FF003C' : '#00F0FF'
          });
        }

        slashes.forEach((s, idx) => {
          s.opacity -= 0.04;
          if (s.opacity <= 0) {
            slashes.splice(idx, 1);
            return;
          }

          const sGrad = ctx.createLinearGradient(s.x1, s.y1, s.x2, s.y2);
          sGrad.addColorStop(0, 'transparent');
          sGrad.addColorStop(0.5, `${s.color}`);
          sGrad.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.moveTo(s.x1, s.y1);
          ctx.lineTo(s.x2, s.y2);
          ctx.strokeStyle = sGrad;
          ctx.globalAlpha = s.opacity;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.globalAlpha = 1;
        });
        ctx.shadowBlur = 0;

        // Flying Energy Sparks
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.life++;
          if (p.life > p.maxLife || p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
            p.life = 0;
          }
          const alpha = (1 - p.life / p.maxLife) * p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'inferno') {
        // 🌊 2. Abyssal Fluid (Deep Sea Caustic Waves & Bioluminescent Motes)
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
          p.pulse += 0.03;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.shadowColor = '#06B6D4';
          ctx.shadowBlur = 6;
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'matrix') {
        // ⚡ 3. Neon Matrix (Streaming Matrix Digital Rain)
        ctx.font = '14px JetBrains Mono, monospace';
        customEntities.forEach((col) => {
          col.y += col.speed;
          if (col.y > height + 200) {
            col.y = -100;
          }

          for (let j = 0; j < col.length; j++) {
            const cy = col.y - j * 16;
            if (cy > 0 && cy < height) {
              const char = col.chars[j % col.chars.length];
              const alpha = j === 0 ? 0.95 : Math.max(0, 0.6 - (j / col.length) * 0.6);
              ctx.fillStyle = j === 0 ? '#ffffff' : `rgba(0, 255, 65, ${alpha})`;
              ctx.fillText(char, col.x, cy);
            }
          }
        });
      } else if (activeTheme === 'monochrome') {
        // ⚪ 4. Graphite Sketch (Charcoal Cross-Hatching Lines & Screentones)
        // Subtle diagonal pencil hatching lines
        ctx.strokeStyle = 'rgba(245, 245, 245, 0.025)';
        ctx.lineWidth = 1;
        for (let i = -height; i < width + height; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + height, height);
          ctx.stroke();
        }

        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 245, 245, ${p.opacity})`;
          ctx.fill();
        });
      } else if (activeTheme === 'arctic') {
        // ❄️ 5. Oxygen Glare (Smoked Glass Volumetric Light & Sunset/Teal Glares)
        customEntities.forEach((glare) => {
          glare.x += glare.vx;
          glare.y += glare.vy;
          glare.pulse += 0.02;

          if (glare.x < 0 || glare.x > width) glare.vx *= -1;
          if (glare.y < 0 || glare.y > height) glare.vy *= -1;

          const r = glare.radius * (0.85 + 0.15 * Math.sin(glare.pulse));
          const gGrad = ctx.createRadialGradient(glare.x, glare.y, 10, glare.x, glare.y, r);
          gGrad.addColorStop(0, glare.color);
          gGrad.addColorStop(1, 'transparent');

          ctx.fillStyle = gGrad;
          ctx.beginPath();
          ctx.arc(glare.x, glare.y, r, 0, Math.PI * 2);
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
          ctx.fillStyle = `rgba(244, 244, 245, ${p.opacity})`;
          ctx.fill();
        });
      } else if (activeTheme === 'tokyo') {
        // 👾 6. CRT Arcade (Rolling CRT Scanlines & RGB Glitch Motes)
        const scanlineY = (frame * 2) % height;
        ctx.fillStyle = 'rgba(57, 255, 20, 0.04)';
        ctx.fillRect(0, scanlineY, width, 40);

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
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'cyber') {
        // 👑 7. Velvet Eclipse (Vantablack Corona & Aged Gold Stardust)
        const centerX = width * 0.5;
        const centerY = height * 0.42;
        const eclipseR = Math.min(width, height) * 0.22;

        // Solar Eclipse Corona Glow
        const coronaGrad = ctx.createRadialGradient(centerX, centerY, eclipseR * 0.8, centerX, centerY, eclipseR * 1.6);
        coronaGrad.addColorStop(0, 'rgba(212, 175, 55, 0.35)');
        coronaGrad.addColorStop(0.5, 'rgba(153, 27, 27, 0.20)');
        coronaGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coronaGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, eclipseR * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Eclipse Dark Core
        ctx.beginPath();
        ctx.arc(centerX, centerY, eclipseR, 0, Math.PI * 2);
        ctx.fillStyle = '#0A0A0A';
        ctx.fill();

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
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'amethyst') {
        // 🎵 8. Midnight Vinyl (3D Isometric Floating Spinning Vinyl Grooves)
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        customEntities.forEach((vinyl) => {
          vinyl.rot += vinyl.speed;
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(-0.35); // Isometric tilt

          ctx.beginPath();
          ctx.ellipse(0, 0, vinyl.r, vinyl.r * 0.48, vinyl.rot, 0, Math.PI * 2);
          ctx.strokeStyle = vinyl.color;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Vinyl rainbow sheen highlight arc
          ctx.beginPath();
          ctx.ellipse(0, 0, vinyl.r, vinyl.r * 0.48, vinyl.rot, 0, Math.PI * 0.4);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.restore();
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
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
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
