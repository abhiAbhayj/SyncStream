import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — Brand New High-Performance Cinematic Background Visualizer
 * 8 Custom Mathematical Simulation Engines:
 * 1. genesis   — 🤖 Neon Genesis: Intersecting neon green/purple geometric wireframes
 * 2. abyss     — 🌊 Abyssal Trench: Bioluminescent cyan bubbles & rising plankton
 * 3. eclipse   — 🌑 Crimson Eclipse: Blood moon red floating embers & shadow fog
 * 4. quantum   — 🧬 Quantum Nexus: Electric blue data nodes & connecting network lines
 * 5. sakura    — 🌸 Sakura Breeze: Drifting pink cherry blossom petals & soft wind
 * 6. mirage    — 🏜️ Desert Mirage: Golden drifting sand dust & rising heat waves
 * 7. nebula    — 🌌 Nebula Core: Swirling magenta interstellar clouds & shooting stars
 * 8. glitch    — 👾 Glitch Dimension: CRT green binary rain & horizontal data glitches
 */
export default function ThemeBackground() {
  const canvasRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('syncstream_theme') || 'genesis';
  });

  useEffect(() => {
    const detectTheme = () => {
      const classList = document.body.classList;
      if (classList.contains('theme-abyss')) return 'abyss';
      if (classList.contains('theme-eclipse')) return 'eclipse';
      if (classList.contains('theme-quantum')) return 'quantum';
      if (classList.contains('theme-sakura')) return 'sakura';
      if (classList.contains('theme-mirage')) return 'mirage';
      if (classList.contains('theme-nebula')) return 'nebula';
      if (classList.contains('theme-glitch')) return 'glitch';
      return localStorage.getItem('syncstream_theme') || 'genesis';
    };

    setActiveTheme(detectTheme());
    const observer = new MutationObserver(() => {
      setActiveTheme(detectTheme());
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const handleStorage = (e) => {
      if (e.key === 'syncstream_theme') {
        setActiveTheme(e.newValue || 'genesis');
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

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initScene(activeTheme);
    };
    window.addEventListener('resize', handleResize);

    // Simulation states
    let particles = [];
    let nodes = [];
    let frame = 0;

    function initScene(theme) {
      particles = [];
      nodes = [];
      frame = 0;
      const isMobile = width < 768;

      if (theme === 'genesis') {
        const count = isMobile ? 5 : 10;
        for (let i = 0; i < count; i++) {
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 40 + Math.random() * 80,
            rotX: Math.random() * Math.PI,
            rotY: Math.random() * Math.PI,
            rotZ: Math.random() * Math.PI,
            speedX: (Math.random() - 0.5) * 0.02,
            speedY: (Math.random() - 0.5) * 0.02,
            speedZ: (Math.random() - 0.5) * 0.02,
            color: Math.random() > 0.5 ? '#00ff66' : '#a855f7'
          });
        }
      } else if (theme === 'abyss') {
        const count = isMobile ? 40 : 80;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 2 + Math.random() * 6,
            speedY: -(0.5 + Math.random() * 1.5),
            speedX: (Math.random() - 0.5) * 0.5,
            wobble: Math.random() * Math.PI * 2,
            color: Math.random() > 0.5 ? 'rgba(0, 245, 212, 0.6)' : 'rgba(144, 224, 239, 0.4)'
          });
        }
      } else if (theme === 'eclipse') {
        const count = isMobile ? 50 : 100;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 3,
            speedY: -(0.2 + Math.random() * 1),
            speedX: (Math.random() - 0.5) * 1,
            life: Math.random() * 100,
            color: Math.random() > 0.5 ? '#ff003c' : '#ff5555'
          });
        }
      } else if (theme === 'quantum') {
        const count = isMobile ? 30 : 60;
        for (let i = 0; i < count; i++) {
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: 1.5 + Math.random() * 2,
            color: '#3b82f6'
          });
        }
      } else if (theme === 'sakura') {
        const count = isMobile ? 40 : 80;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 4 + Math.random() * 6,
            speedY: 1 + Math.random() * 2,
            speedX: 1 + Math.random() * 2,
            rot: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.1,
            color: Math.random() > 0.5 ? '#ffb7b2' : '#ff9ce6'
          });
        }
      } else if (theme === 'mirage') {
        const count = isMobile ? 60 : 120;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2,
            speedY: -(0.5 + Math.random() * 1),
            speedX: 2 + Math.random() * 3, // Strong wind
            color: 'rgba(251, 191, 36, 0.4)'
          });
        }
      } else if (theme === 'nebula') {
        const count = isMobile ? 40 : 80;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 2.5,
            speedY: (Math.random() - 0.5) * 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            pulse: Math.random() * Math.PI * 2,
            color: Math.random() > 0.5 ? '#d946ef' : '#e879f9'
          });
        }
      } else if (theme === 'glitch') {
        const cols = Math.floor(width / 20);
        for (let i = 0; i < cols; i++) {
          nodes.push({
            x: i * 20,
            y: Math.random() * height,
            speedY: 2 + Math.random() * 8,
            chars: [],
            len: 5 + Math.floor(Math.random() * 15)
          });
        }
      }
    }

    initScene(activeTheme);

    const render = () => {
      frame++;
      
      // Trail effect for some themes
      if (activeTheme === 'eclipse' || activeTheme === 'quantum' || activeTheme === 'glitch') {
        ctx.fillStyle = `rgba(${activeTheme === 'eclipse' ? '13,2,2' : activeTheme === 'glitch' ? '5,5,5' : '5,9,20'}, 0.2)`;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      if (activeTheme === 'genesis') {
        nodes.forEach(n => {
          n.rotX += n.speedX;
          n.rotY += n.speedY;
          n.rotZ += n.speedZ;
          
          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.strokeStyle = n.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Draw a simple 2D projection of a rotating square
          const cosY = Math.cos(n.rotY), sinY = Math.sin(n.rotY);
          const x1 = -n.size * cosY, x2 = n.size * cosY;
          const y1 = -n.size, y2 = n.size;
          ctx.moveTo(x1, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y2); ctx.lineTo(x1, y2); ctx.closePath();
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(-x1, y1); ctx.lineTo(-x2, y1); ctx.lineTo(-x2, y2); ctx.lineTo(-x1, y2); ctx.closePath();
          ctx.stroke();
          ctx.restore();
        });
      } else if (activeTheme === 'abyss') {
        particles.forEach(p => {
          p.y += p.speedY;
          p.x += Math.sin(frame * 0.02 + p.wobble) * 1 + p.speedX;
          if (p.y < -20) p.y = height + 20;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        });
      } else if (activeTheme === 'eclipse') {
        particles.forEach(p => {
          p.y += p.speedY;
          p.x += Math.sin(frame * 0.05) * 0.5 + p.speedX;
          p.life--;
          if (p.life <= 0 || p.y < -10) {
            p.y = height + 10;
            p.life = 100 + Math.random() * 50;
            p.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      } else if (activeTheme === 'quantum') {
        nodes.forEach(n => {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;

          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.fill();
        });

        // Draw connections
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = dx * dx + dy * dy;
            if (dist < 15000) {
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.strokeStyle = `rgba(96, 165, 250, ${1 - dist / 15000})`;
              ctx.stroke();
            }
          }
        }
      } else if (activeTheme === 'sakura') {
        particles.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(frame * 0.02) * 1;
          p.rot += p.rotSpeed;
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          // Draw petal
          ctx.ellipse(0, 0, p.size, p.size * 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      } else if (activeTheme === 'mirage') {
        particles.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y < -10) p.y = height + 10;
          if (p.x > width + 10) p.x = -10;

          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        });

        // Heat wave effect
        ctx.fillStyle = 'rgba(217, 119, 6, 0.05)';
        for(let i=0; i<5; i++) {
           ctx.beginPath();
           ctx.moveTo(0, height);
           for(let x=0; x<=width; x+=50) {
               ctx.lineTo(x, height * 0.5 + Math.sin(x * 0.01 + frame * 0.05 + i) * 100);
           }
           ctx.lineTo(width, height);
           ctx.fill();
        }
      } else if (activeTheme === 'nebula') {
        particles.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const op = (Math.sin(frame * 0.05 + p.pulse) + 1) * 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = op * 0.6;
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        // Shooting star occasionally
        if (Math.random() < 0.02) {
            ctx.beginPath();
            const sx = Math.random() * width;
            const sy = Math.random() * height * 0.5;
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - 100, sy + 100);
            const grad = ctx.createLinearGradient(sx, sy, sx - 100, sy + 100);
            grad.addColorStop(0, 'rgba(255,255,255,0.8)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
      } else if (activeTheme === 'glitch') {
        ctx.fillStyle = '#22c55e';
        ctx.font = '15px monospace';
        nodes.forEach(n => {
          n.y += n.speedY;
          if (n.y > height + 200) {
              n.y = -200;
              n.speedY = 2 + Math.random() * 8;
          }
          
          for(let i=0; i<n.len; i++) {
              const charY = n.y - i * 20;
              if (charY > 0 && charY < height) {
                  const char = String.fromCharCode(0x30A0 + Math.random() * 96);
                  ctx.globalAlpha = 1 - (i / n.len);
                  ctx.fillText(char, n.x, charY);
              }
          }
          ctx.globalAlpha = 1;
        });

        // Glitch lines
        if (Math.random() < 0.05) {
            ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
            ctx.fillRect(0, Math.random() * height, width, 5 + Math.random() * 20);
        }
      }

      let animationFrameId = requestAnimationFrame(render);
      return animationFrameId;
    };

    let animId = render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ opacity: 0.85, mixBlendMode: 'screen' }}
    />
  );
}
