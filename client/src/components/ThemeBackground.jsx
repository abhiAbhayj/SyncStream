import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-performance real-time animated background canvas
 * Renders custom visual effects tailored for each theme:
 * - ocean: Bioluminescent rising bubbles & deep oceanic light beams
 * - inferno: Rising magma embers, sparks & pulsing fiery heat glow
 * - matrix: Authentic matrix digital rain falling glyph streams
 * - monochrome: Floating platinum stardust & connected constellation lines
 * - arctic: Drifting crystalline snowflakes & ice crystals with frost shimmer
 * - tokyo: 80s Synthwave perspective moving grid & floating neon motes
 * - cyber: Radiant 24K rising gold dust & shimmering solar flares
 * - amethyst: Deep-space twinkling cosmic starfield & shooting meteors
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

    let particles = [];
    let matrixColumns = [];
    let gridOffset = 0;
    let shootingStars = [];

    const matrixChars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ'.split('');

    function initScene(theme) {
      particles = [];
      shootingStars = [];
      gridOffset = 0;

      if (theme === 'matrix') {
        const fontSize = 16;
        const columns = Math.ceil(width / fontSize);
        matrixColumns = [];
        for (let i = 0; i < columns; i++) {
          matrixColumns.push({
            x: i * fontSize,
            y: (Math.random() * -height * 1.5),
            speed: 2.5 + Math.random() * 3.5,
            length: 15 + Math.floor(Math.random() * 15),
            chars: Array.from({ length: 30 }, () => matrixChars[Math.floor(Math.random() * matrixChars.length)])
          });
        }
      } else if (theme === 'inferno') {
        const count = Math.min(width > 768 ? 90 : 50, 110);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.5 + Math.random() * 4,
            speedY: -(1.2 + Math.random() * 2.8),
            speedX: (Math.random() - 0.5) * 1.2,
            opacity: 0.4 + Math.random() * 0.6,
            hue: Math.random() > 0.35 ? 15 + Math.random() * 25 : 355 + Math.random() * 15,
            life: Math.random() * 100,
            maxLife: 50 + Math.random() * 90
          });
        }
      } else if (theme === 'arctic') {
        const count = Math.min(width > 768 ? 95 : 55, 120);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.2 + Math.random() * 3.8,
            speedY: 0.8 + Math.random() * 1.8,
            speedX: Math.sin(Math.random() * Math.PI) * 0.6,
            opacity: 0.3 + Math.random() * 0.7,
            swaySpeed: 0.02 + Math.random() * 0.04,
            swayOffset: Math.random() * Math.PI * 2
          });
        }
      } else if (theme === 'tokyo') {
        const count = Math.min(width > 768 ? 70 : 35, 80);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.8 + Math.random() * 3.5,
            speedY: -(0.5 + Math.random() * 1.2),
            speedX: (Math.random() - 0.5) * 0.6,
            opacity: 0.35 + Math.random() * 0.65,
            color: Math.random() > 0.5 ? '#ff007f' : '#00f5d4'
          });
        }
      } else if (theme === 'cyber') {
        const count = Math.min(width > 768 ? 80 : 45, 95);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.2 + Math.random() * 3.8,
            speedY: -(0.8 + Math.random() * 1.8),
            speedX: (Math.random() - 0.5) * 0.8,
            opacity: 0.3 + Math.random() * 0.7,
            sparkleSpeed: 0.06 + Math.random() * 0.08,
            sparkleVal: Math.random() * Math.PI * 2
          });
        }
      } else if (theme === 'amethyst') {
        const count = Math.min(width > 768 ? 110 : 60, 130);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.0 + Math.random() * 3.0,
            speedX: (Math.random() - 0.5) * 0.2,
            speedY: (Math.random() - 0.5) * 0.2,
            opacity: 0.3 + Math.random() * 0.7,
            twinkleSpeed: 0.03 + Math.random() * 0.05,
            twinklePhase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.55 ? '#c084fc' : Math.random() > 0.25 ? '#f43f5e' : '#ffffff'
          });
        }
      } else if (theme === 'monochrome') {
        const count = Math.min(width > 768 ? 65 : 35, 75);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.5 + Math.random() * 2.5,
            speedY: (Math.random() - 0.5) * 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            opacity: 0.25 + Math.random() * 0.5
          });
        }
      } else {
        // Ocean Abyss (Default)
        const count = Math.min(width > 768 ? 70 : 35, 80);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 2.0 + Math.random() * 4.5,
            speedY: -(0.6 + Math.random() * 1.5),
            speedX: Math.sin(Math.random() * Math.PI * 2) * 0.4,
            opacity: 0.25 + Math.random() * 0.55,
            wobble: 0,
            wobbleSpeed: 0.03 + Math.random() * 0.04
          });
        }
      }
    }

    initScene(activeTheme);

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (activeTheme === 'matrix') {
        // Matrix Falling Digital Rain
        ctx.font = 'bold 15px "JetBrains Mono", monospace';
        matrixColumns.forEach((col) => {
          col.y += col.speed;
          if (col.y > height + 300) {
            col.y = -50 - Math.random() * 200;
            col.speed = 2.5 + Math.random() * 3.5;
          }

          col.chars.forEach((char, idx) => {
            if (idx > col.length) return;
            const charY = col.y - idx * 18;
            if (charY > 0 && charY < height) {
              const alpha = Math.max(0, 1 - idx / col.length);
              if (idx === 0) {
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
                ctx.shadowColor = '#00ff88';
                ctx.shadowBlur = 12;
              } else {
                ctx.fillStyle = `rgba(0, 255, 136, ${alpha * 0.65})`;
                ctx.shadowBlur = 0;
              }
              ctx.fillText(char, col.x, charY);
            }
          });

          if (Math.random() < 0.05) {
            const rIdx = Math.floor(Math.random() * col.chars.length);
            col.chars[rIdx] = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          }
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'inferno') {
        // Rising Magma Sparks & Glowing Embers
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(frame * 0.06 + p.life) * 0.4;
          p.life++;

          if (p.y < -10 || p.life > p.maxLife) {
            p.y = height + 10;
            p.x = Math.random() * width;
            p.life = 0;
            p.opacity = 0.4 + Math.random() * 0.6;
          }

          const currentAlpha = p.opacity * (1 - p.life / p.maxLife);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${currentAlpha})`;
          ctx.shadowColor = `hsl(${p.hue}, 100%, 55%)`;
          ctx.shadowBlur = p.size * 4;
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'arctic') {
        // Drifting Crystal Snow
        particles.forEach((p) => {
          p.swayOffset += p.swaySpeed;
          p.x += Math.sin(p.swayOffset) * 1.0;
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
        // 80s Synthwave Wireframe Moving Grid
        gridOffset = (gridOffset + 1.2) % 45;
        const horizonY = height * 0.62;

        ctx.strokeStyle = 'rgba(255, 0, 127, 0.20)';
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

        // Neon Motes
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
      } else if (activeTheme === 'cyber') {
        // Shimmering Rising 24K Gold Particles
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.sparkleVal += p.sparkleSpeed;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          const currentAlpha = p.opacity * (0.6 + 0.4 * Math.sin(p.sparkleVal));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 215, 0, ${currentAlpha})`;
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = p.size * 4;
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'amethyst') {
        // Deep Space Starfield & Shooting Meteors
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

        // Shooting Star
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
        // Lunar Noir Constellation & Stardust Lines
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

          // Connect nearby particles with subtle geometric lines
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
      } else {
        // Ocean Abyss: Bioluminescent Floating Bubbles
        particles.forEach((p) => {
          p.wobble += p.wobbleSpeed;
          p.x += p.speedX + Math.sin(p.wobble) * 0.5;
          p.y += p.speedY;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 210, 255, ${p.opacity})`;
          ctx.shadowColor = '#63d2ff';
          ctx.shadowBlur = p.size * 3;
          ctx.fill();
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
