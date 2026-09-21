import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-performance real-time animated background canvas
 * Completely unique animations for each theme:
 * - ocean: Harmonic deep-sea fluid tidal current waves & soft sonar ripple rings
 * - inferno: Turbulent surging molten magma lake & dynamic roaring flame tongues
 * - matrix: Subtle dark-emerald cyber circuit grid & gentle scanning radar beam (non-distracting)
 * - cyber: Rotating 4-point solar diamond stars & sweeping golden light shafts
 * - monochrome: Geometric constellation stardust with clean connected lines
 * - arctic: Falling hexagonal ice crystals & gentle crystalline snow
 * - tokyo: 80s Synthwave perspective rolling wireframe grid & neon vapor motes
 * - amethyst: Deep-space 3D parallax starfield with occasional shooting meteors
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

    // State collections
    let particles = [];
    let waves = [];
    let sonarRings = [];
    let circuitNodes = [];
    let circuitLines = [];
    let solarStars = [];
    let shootingStars = [];
    let gridOffset = 0;
    let scanlineY = 0;
    let lightBeamAngle = 0;

    function initScene(theme) {
      particles = [];
      waves = [];
      sonarRings = [];
      circuitNodes = [];
      circuitLines = [];
      solarStars = [];
      shootingStars = [];
      gridOffset = 0;
      scanlineY = 0;

      if (theme === 'ocean') {
        // 1. Ocean Abyss: Multi-layered Sine Wave Currents + Sonar Ripples
        waves = [
          { amp: 30, freq: 0.003, speed: 0.015, phase: 0, yRatio: 0.85, color: 'rgba(99, 210, 255, 0.08)' },
          { amp: 22, freq: 0.005, speed: -0.012, phase: 2, yRatio: 0.90, color: 'rgba(149, 100, 255, 0.06)' },
          { amp: 38, freq: 0.002, speed: 0.008, phase: 4, yRatio: 0.95, color: 'rgba(56, 189, 248, 0.10)' }
        ];
        sonarRings = [
          { x: width * 0.25, y: height * 0.45, r: 20, maxR: 220, speed: 0.8, alpha: 0.35 },
          { x: width * 0.75, y: height * 0.65, r: 80, maxR: 260, speed: 0.7, alpha: 0.3 }
        ];
      } else if (theme === 'inferno') {
        // 2. Inferno Magma: Surging Lava Waves at bottom + Flaming Shards
        waves = [
          { amp: 28, freq: 0.006, speed: 0.03, phase: 0, yRatio: 0.92, color: 'rgba(255, 69, 0, 0.15)' },
          { amp: 20, freq: 0.010, speed: -0.025, phase: 1.5, yRatio: 0.95, color: 'rgba(255, 30, 39, 0.20)' }
        ];
        const shardCount = Math.min(width > 768 ? 45 : 22, 50);
        for (let i = 0; i < shardCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: height * 0.7 + Math.random() * (height * 0.3),
            size: 2 + Math.random() * 5,
            speedY: -(1.5 + Math.random() * 3.5),
            speedX: (Math.random() - 0.5) * 1.8,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.15,
            hue: Math.random() > 0.4 ? 15 + Math.random() * 25 : 355 + Math.random() * 15,
            life: 0,
            maxLife: 40 + Math.random() * 70,
            opacity: 0.5 + Math.random() * 0.5
          });
        }
      } else if (theme === 'matrix') {
        // 3. Matrix Terminal: Subtle Dark Emerald Cyber Circuit Grid & Scanning Radar Line
        const nodeCols = Math.floor(width / 120);
        const nodeRows = Math.floor(height / 100);
        circuitNodes = [];
        for (let r = 0; r <= nodeRows; r++) {
          for (let c = 0; c <= nodeCols; c++) {
            circuitNodes.push({
              x: c * 120 + (r % 2 === 0 ? 0 : 60),
              y: r * 100,
              pulse: Math.random() * Math.PI * 2,
              pulseSpeed: 0.02 + Math.random() * 0.03,
              active: Math.random() > 0.5
            });
          }
        }
      } else if (theme === 'cyber') {
        // 4. Solar Gold Luxe: Rotating 4-point Diamond Stars & Golden Light Shafts
        const starCount = Math.min(width > 768 ? 35 : 18, 40);
        solarStars = [];
        for (let i = 0; i < starCount; i++) {
          solarStars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 8 + Math.random() * 16,
            rot: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            phase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.03 + Math.random() * 0.04,
            opacity: 0.25 + Math.random() * 0.55
          });
        }
      } else if (theme === 'arctic') {
        // 5. Arctic Frost: Crystalline Snow & Ice Flakes
        const count = Math.min(width > 768 ? 75 : 35, 90);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.5 + Math.random() * 3.5,
            speedY: 0.7 + Math.random() * 1.5,
            speedX: Math.sin(Math.random() * Math.PI) * 0.5,
            opacity: 0.25 + Math.random() * 0.6,
            swaySpeed: 0.02 + Math.random() * 0.04,
            swayOffset: Math.random() * Math.PI * 2
          });
        }
      } else if (theme === 'tokyo') {
        // 6. Tokyo Vaporwave: 80s Perspective Moving Wireframe Grid + Neon Motes
        const count = Math.min(width > 768 ? 50 : 25, 60);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.5 + Math.random() * 3.5,
            speedY: -(0.5 + Math.random() * 1.2),
            speedX: (Math.random() - 0.5) * 0.6,
            opacity: 0.35 + Math.random() * 0.6,
            color: Math.random() > 0.5 ? '#ff007f' : '#00f5d4'
          });
        }
      } else if (theme === 'amethyst') {
        // 7. Cosmic Nebula: 3D Parallax Starfield & Shooting Meteors
        const count = Math.min(width > 768 ? 95 : 50, 120);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 0.8 + Math.random() * 2.8,
            speedX: (Math.random() - 0.5) * 0.18,
            speedY: (Math.random() - 0.5) * 0.18,
            opacity: 0.25 + Math.random() * 0.7,
            twinkleSpeed: 0.03 + Math.random() * 0.05,
            twinklePhase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.55 ? '#c084fc' : Math.random() > 0.25 ? '#f43f5e' : '#ffffff'
          });
        }
      } else if (theme === 'monochrome') {
        // 8. Lunar Noir: Geometric Constellation Stardust
        const count = Math.min(width > 768 ? 50 : 25, 60);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.2 + Math.random() * 2.5,
            speedY: (Math.random() - 0.5) * 0.4,
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: 0.2 + Math.random() * 0.5
          });
        }
      }
    }

    initScene(activeTheme);

    let frame = 0;

    // ── Render Loop ──
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (activeTheme === 'ocean') {
        // 🌊 1. Ocean Abyss: Flowing Sine-Wave Currents & Sonar Echo Rings
        // Render expanding sonar rings
        sonarRings.forEach((ring) => {
          ring.r += ring.speed;
          if (ring.r > ring.maxR) {
            ring.r = 10;
            ring.x = Math.random() * width;
            ring.y = height * 0.3 + Math.random() * (height * 0.6);
          }
          const ringAlpha = ring.alpha * (1 - ring.r / ring.maxR);
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(99, 210, 255, ${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Second inner subtle ripple
          if (ring.r > 30) {
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.r - 25, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(149, 100, 255, ${ringAlpha * 0.6})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Render fluid tidal wave currents
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
          ctx.fillStyle = w.color;
          ctx.fill();
        });
      } else if (activeTheme === 'inferno') {
        // 🔥 2. Inferno Magma: Surging Lava Surface Waves & Roaring Flame Shards
        waves.forEach((w) => {
          w.phase += w.speed;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 12) {
            const y = height * w.yRatio + Math.sin(x * w.freq + w.phase) * w.amp + Math.sin(x * 0.02 + frame * 0.04) * 8;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fillStyle = w.color;
          ctx.fill();
        });

        // Flame Shards (Triangles / Diamonds that rotate & burst)
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(frame * 0.08 + p.life) * 0.6;
          p.rotation += p.rotSpeed;
          p.life++;

          if (p.y < height * 0.4 || p.life > p.maxLife) {
            p.y = height + 10;
            p.x = Math.random() * width;
            p.life = 0;
            p.speedY = -(1.5 + Math.random() * 3.5);
          }

          const alpha = p.opacity * (1 - p.life / p.maxLife);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 2);
          ctx.lineTo(p.size, p.size);
          ctx.lineTo(-p.size, p.size);
          ctx.closePath();
          ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha})`;
          ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
          ctx.shadowBlur = p.size * 3;
          ctx.fill();
          ctx.restore();
        });
      } else if (activeTheme === 'matrix') {
        // ⚡ 3. Matrix Terminal: Calm, Elegant Cyber Circuit Grid & Scanning Radar Line (Non-Distracting)
        scanlineY = (scanlineY + 1.2) % height;

        // Subtle Circuit Grid Lines
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 120) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 100) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Circuit Nodes & Data Pulse Nodes
        circuitNodes.forEach((node) => {
          node.pulse += node.pulseSpeed;
          const alpha = 0.08 + 0.15 * Math.sin(node.pulse);
          ctx.beginPath();
          ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
          ctx.fill();

          if (node.active && Math.sin(node.pulse) > 0.7) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 255, 170, ${alpha * 0.8})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Soft Horizontal Radar Scan Beam
        const scanGrad = ctx.createLinearGradient(0, scanlineY - 40, 0, scanlineY + 40);
        scanGrad.addColorStop(0, 'rgba(0, 255, 136, 0)');
        scanGrad.addColorStop(0.5, 'rgba(0, 255, 136, 0.08)');
        scanGrad.addColorStop(1, 'rgba(0, 255, 136, 0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanlineY - 40, width, 80);
      } else if (activeTheme === 'cyber') {
        // 👑 4. Solar Gold Luxe: Rotating 4-Point Diamond Stars & Sweeping Golden Light Beams
        lightBeamAngle += 0.005;

        // Sweeping Diagonal Gold Light Rays
        const rayGrad = ctx.createLinearGradient(0, 0, width, height);
        rayGrad.addColorStop(0, 'rgba(255, 215, 0, 0.04)');
        rayGrad.addColorStop(0.5 + Math.sin(lightBeamAngle) * 0.2, 'rgba(255, 215, 0, 0.08)');
        rayGrad.addColorStop(1, 'rgba(255, 153, 0, 0.03)');
        ctx.fillStyle = rayGrad;
        ctx.fillRect(0, 0, width, height);

        // Rotating 4-Point Golden Diamond Stars (✦)
        solarStars.forEach((star) => {
          star.rot += star.rotSpeed;
          star.phase += star.pulseSpeed;
          const currentAlpha = star.opacity * (0.6 + 0.4 * Math.sin(star.phase));

          ctx.save();
          ctx.translate(star.x, star.y);
          ctx.rotate(star.rot);

          ctx.beginPath();
          // Draw 4-point diamond star
          ctx.moveTo(0, -star.size);
          ctx.quadraticCurveTo(0, 0, star.size * 0.25, 0);
          ctx.lineTo(star.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, star.size * 0.25);
          ctx.lineTo(0, star.size);
          ctx.quadraticCurveTo(0, 0, -star.size * 0.25, 0);
          ctx.lineTo(-star.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -star.size * 0.25);
          ctx.closePath();

          ctx.fillStyle = `rgba(255, 215, 0, ${currentAlpha})`;
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = star.size * 1.5;
          ctx.fill();
          ctx.restore();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'arctic') {
        // ❄️ 5. Arctic Frost: Crystalline Snow & Ice Flakes
        particles.forEach((p) => {
          p.swayOffset += p.swaySpeed;
          p.x += Math.sin(p.swayOffset) * 0.9;
          p.y += p.speedY;

          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x > width + 10) p.x = -10;
          if (p.x < -10) p.x = width + 10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(186, 245, 255, ${p.opacity})`;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = p.size * 3;
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'tokyo') {
        // 🌸 6. Tokyo Vaporwave: 80s Rolling Perspective Grid
        gridOffset = (gridOffset + 1.2) % 45;
        const horizonY = height * 0.62;

        ctx.strokeStyle = 'rgba(255, 0, 127, 0.18)';
        ctx.lineWidth = 1.2;

        const centerX = width / 2;
        for (let x = -width; x < width * 2; x += 55) {
          ctx.beginPath();
          ctx.moveTo(centerX + (x - centerX) * 0.06, horizonY);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        for (let y = 0; y < height - horizonY; y += 22) {
          const currentY = horizonY + Math.pow((y + gridOffset) / (height - horizonY), 2) * (height - horizonY);
          if (currentY <= height) {
            const lineAlpha = Math.min(0.35, ((currentY - horizonY) / (height - horizonY)) * 0.35);
            ctx.strokeStyle = `rgba(0, 245, 212, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(0, currentY);
            ctx.lineTo(width, currentY);
            ctx.stroke();
          }
        }

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
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'amethyst') {
        // 🔮 7. Cosmic Nebula: Parallax Starfield & Shooting Meteors
        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.twinklePhase += p.twinkleSpeed;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const alpha = p.opacity * (0.5 + 0.5 * Math.sin(p.twinklePhase));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 4;
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        if (Math.random() < 0.015 && shootingStars.length < 3) {
          shootingStars.push({
            x: Math.random() * width * 0.8,
            y: Math.random() * height * 0.4,
            length: 100 + Math.random() * 100,
            speed: 10 + Math.random() * 8,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
            opacity: 1
          });
        }

        shootingStars.forEach((star, idx) => {
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;
          star.opacity -= 0.025;

          if (star.opacity <= 0) {
            shootingStars.splice(idx, 1);
            return;
          }

          const tailX = star.x - Math.cos(star.angle) * star.length;
          const tailY = star.y - Math.sin(star.angle) * star.length;

          const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
          grad.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
          grad.addColorStop(0.4, `rgba(192, 132, 252, ${star.opacity * 0.8})`);
          grad.addColorStop(1, 'rgba(168, 85, 247, 0)');

          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'monochrome') {
        // ⚪ 8. Lunar Noir: Constellation Stardust
        particles.forEach((p, idx) => {
          p.x += p.speedX;
          p.y += p.speedY;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 4;
          ctx.fill();

          for (let j = idx + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 110) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * (1 - dist / 110)})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
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
