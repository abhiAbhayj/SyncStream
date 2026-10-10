import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Custom Mathematical Simulation Engines:
 * 1. ocean     — 🟩 LifeGrid Neon: Real-time Conway's Game of Life
 * 2. inferno   — 💽 Retro Bounce: Bouncing DVD Logos with trails
 * 3. matrix    — 🌳 Neon Roots: Fractal Branching Trees
 * 4. monochrome— 🧬 Helix Genesis: 3D Rotating DNA Strand
 * 5. arctic    — 🦅 Swarm Intelligence: Flocking Boids
 * 6. tokyo     — 🚇 Warp Tunnel: Hyperspeed 3D Tunnel
 * 7. cyber     — 💧 Liquid Neon: Fluid Flow Field
 * 8. amethyst  — 🌸 Windy Sakura: Falling Cherry Blossoms with wind
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
    let state = {};
    let frame = 0;

    function initScene(theme) {
      state = {};
      frame = 0;

      const isMobile = width < 768;

      if (theme === 'ocean') {
        // Game of Life
        const cellSize = isMobile ? 15 : 20;
        const cols = Math.floor(width / cellSize) + 1;
        const rows = Math.floor(height / cellSize) + 1;
        const grid = new Array(cols).fill(null).map(() => new Array(rows).fill(0).map(() => (Math.random() > 0.85 ? 1 : 0)));
        state = { grid, cols, rows, cellSize, tick: 0 };
      } else if (theme === 'inferno') {
        // Bouncing DVD Logos (Rectangles)
        const count = isMobile ? 5 : 10;
        const logos = [];
        const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff8000', '#00ff80'];
        for (let i = 0; i < count; i++) {
          logos.push({
            x: Math.random() * (width - 100),
            y: Math.random() * (height - 60),
            vx: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2),
            vy: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2),
            w: 100,
            h: 60,
            color: colors[i % colors.length],
            history: []
          });
        }
        state = { logos };
      } else if (theme === 'matrix') {
        // Fractal Trees
        const trees = [];
        const count = isMobile ? 3 : 5;
        for (let i = 0; i < count; i++) {
          trees.push({
            x: (width / (count + 1)) * (i + 1) + (Math.random() - 0.5) * 50,
            y: height,
            length: height * (isMobile ? 0.2 : 0.25) + Math.random() * 50,
            angle: -Math.PI / 2,
            swayPhase: Math.random() * 100
          });
        }
        state = { trees };
      } else if (theme === 'monochrome') {
        // 3D DNA
        const particles = [];
        const count = isMobile ? 80 : 150;
        for (let i = 0; i < count; i++) {
          particles.push({
            y: (height / count) * i,
            angleOffset: i * 0.15,
            color: i % 2 === 0 ? '#0080ff' : '#ff0080'
          });
        }
        state = { particles, rotation: 0 };
      } else if (theme === 'arctic') {
        // Flocking Boids
        const boids = [];
        const count = isMobile ? 40 : 80;
        for (let i = 0; i < count; i++) {
          boids.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: Math.random() > 0.5 ? '#00ffff' : '#ffffff'
          });
        }
        state = { boids };
      } else if (theme === 'tokyo') {
        // Tunnel
        const rings = [];
        const count = isMobile ? 15 : 30;
        for (let i = 0; i < count; i++) {
          rings.push({
            z: (i / count) * 1000,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
          });
        }
        state = { rings };
      } else if (theme === 'cyber') {
        // Flow Field
        const particles = [];
        const count = isMobile ? 200 : 500;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0,
            vy: 0,
            color: ['#00ffff', '#ff00ff', '#ffff00'][Math.floor(Math.random() * 3)],
            life: Math.random() * 100
          });
        }
        state = { particles, zOff: 0 };
      } else if (theme === 'amethyst') {
        // Cherry Blossoms
        const petals = [];
        const count = isMobile ? 30 : 70;
        for (let i = 0; i < count; i++) {
          petals.push({
            x: Math.random() * width,
            y: Math.random() * height,
            s: 0.5 + Math.random() * 1,
            ang: Math.random() * 2 * Math.PI,
            spin: (Math.random() - 0.5) * 0.1,
            vx: Math.random() * 2 - 1,
            vy: 1 + Math.random() * 2,
            color: Math.random() > 0.5 ? '#ffb7c5' : '#ff69b4'
          });
        }
        state = { petals };
      }
    }

    initScene(activeTheme);

    const render = () => {
      frame++;
      
      if (activeTheme === 'ocean') {
        ctx.fillStyle = 'rgba(4, 6, 10, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        let { grid, cols, rows, cellSize, tick } = state;
        tick++;
        
        if (tick % 5 === 0) {
          const nextGrid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));
          for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
              let neighbors = 0;
              for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                  if (x === 0 && y === 0) continue;
                  const col = (i + x + cols) % cols;
                  const row = (j + y + rows) % rows;
                  neighbors += grid[col][row];
                }
              }
              if (grid[i][j] === 1 && (neighbors === 2 || neighbors === 3)) nextGrid[i][j] = 1;
              else if (grid[i][j] === 0 && neighbors === 3) nextGrid[i][j] = 1;
              else nextGrid[i][j] = 0;
            }
          }
          state.grid = nextGrid;
          grid = nextGrid;
        }
        state.tick = tick;

        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffaa';
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            if (grid[i][j]) {
              ctx.fillStyle = '#00ffaa';
              ctx.fillRect(i * cellSize, j * cellSize, cellSize - 2, cellSize - 2);
            }
          }
        }
        ctx.shadowBlur = 0;
      } 
      else if (activeTheme === 'inferno') {
        ctx.fillStyle = 'rgba(8, 8, 12, 0.2)';
        ctx.fillRect(0, 0, width, height);

        state.logos.forEach(logo => {
          logo.history.push({x: logo.x, y: logo.y});
          if (logo.history.length > 20) logo.history.shift();

          logo.x += logo.vx;
          logo.y += logo.vy;

          if (logo.x <= 0 || logo.x + logo.w >= width) {
            logo.vx *= -1;
            logo.color = ['#ff00ff', '#00ffff', '#ffff00', '#ff8000', '#00ff80'][Math.floor(Math.random() * 5)];
          }
          if (logo.y <= 0 || logo.y + logo.h >= height) {
            logo.vy *= -1;
            logo.color = ['#ff00ff', '#00ffff', '#ffff00', '#ff8000', '#00ff80'][Math.floor(Math.random() * 5)];
          }

          ctx.beginPath();
          ctx.moveTo(logo.history[0]?.x + logo.w/2, logo.history[0]?.y + logo.h/2);
          for (let i = 1; i < logo.history.length; i++) {
            ctx.lineTo(logo.history[i].x + logo.w/2, logo.history[i].y + logo.h/2);
          }
          ctx.strokeStyle = logo.color;
          ctx.lineWidth = 4;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;

          ctx.fillStyle = logo.color;
          ctx.shadowBlur = 20;
          ctx.shadowColor = logo.color;
          ctx.fillRect(logo.x, logo.y, logo.w, logo.h);
          ctx.shadowBlur = 0;
          
          ctx.fillStyle = '#000';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('DVD', logo.x + logo.w/2, logo.y + logo.h/2);
        });
      }
      else if (activeTheme === 'matrix') {
        ctx.fillStyle = '#000a05';
        ctx.fillRect(0, 0, width, height);

        const drawBranch = (x, y, len, angle, depth, maxDepth) => {
          if (depth === 0) return;
          const endX = x + Math.cos(angle) * len;
          const endY = y + Math.sin(angle) * len;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = depth > maxDepth - 2 ? '#ffc800' : '#80ff00';
          ctx.lineWidth = depth * 1.5;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#80ff00';
          ctx.stroke();
          ctx.shadowBlur = 0;

          const sway = Math.sin(frame * 0.02 + depth) * 0.1;
          drawBranch(endX, endY, len * 0.7, angle - 0.4 + sway, depth - 1, maxDepth);
          drawBranch(endX, endY, len * 0.7, angle + 0.4 + sway, depth - 1, maxDepth);
        };

        state.trees.forEach(tree => {
          tree.swayPhase += 0.02;
          const rootAngle = tree.angle + Math.sin(tree.swayPhase) * 0.05;
          drawBranch(tree.x, tree.y, tree.length, rootAngle, 7, 7);
        });
      }
      else if (activeTheme === 'monochrome') {
        ctx.fillStyle = '#0a050f';
        ctx.fillRect(0, 0, width, height);

        state.rotation += 0.02;
        const centerX = width / 2;
        const radius = width < 768 ? 50 : 100;

        state.particles.forEach((p, i) => {
          const angle1 = state.rotation + p.angleOffset;
          const angle2 = state.rotation + p.angleOffset + Math.PI;

          const x1 = centerX + Math.cos(angle1) * radius;
          const z1 = Math.sin(angle1);
          const x2 = centerX + Math.cos(angle2) * radius;
          const z2 = Math.sin(angle2);

          const scale1 = (z1 + 2) / 3;
          const scale2 = (z2 + 2) / 3;

          ctx.beginPath();
          ctx.moveTo(x1, p.y);
          ctx.lineTo(x2, p.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(x1, p.y, 4 * scale1, 0, Math.PI * 2);
          ctx.fillStyle = '#0080ff';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#0080ff';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x2, p.y, 4 * scale2, 0, Math.PI * 2);
          ctx.fillStyle = '#ff0080';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ff0080';
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      }
      else if (activeTheme === 'arctic') {
        ctx.fillStyle = 'rgba(5, 15, 25, 0.3)';
        ctx.fillRect(0, 0, width, height);

        const { boids } = state;
        boids.forEach(b => {
          let cx = 0, cy = 0, cvx = 0, cvy = 0, sepx = 0, sepy = 0, count = 0;
          boids.forEach(other => {
            if (b !== other) {
              const dx = other.x - b.x;
              const dy = other.y - b.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < 100) {
                cx += other.x;
                cy += other.y;
                cvx += other.vx;
                cvy += other.vy;
                count++;
                if (dist < 30) {
                  sepx -= dx;
                  sepy -= dy;
                }
              }
            }
          });
          
          if (count > 0) {
            cx /= count; cy /= count; cvx /= count; cvy /= count;
            b.vx += (cx - b.x) * 0.005 + (cvx - b.vx) * 0.05 + sepx * 0.05;
            b.vy += (cy - b.y) * 0.005 + (cvy - b.vy) * 0.05 + sepy * 0.05;
          }

          const speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
          if (speed > 4) {
            b.vx = (b.vx / speed) * 4;
            b.vy = (b.vy / speed) * 4;
          }

          b.x += b.vx;
          b.y += b.vy;

          if (b.x < 0) b.x = width;
          if (b.x > width) b.x = 0;
          if (b.y < 0) b.y = height;
          if (b.y > height) b.y = 0;

          const angle = Math.atan2(b.vy, b.vx);
          
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(-5, 5);
          ctx.lineTo(-5, -5);
          ctx.closePath();
          ctx.fillStyle = b.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = b.color;
          ctx.fill();
          ctx.restore();
        });
        ctx.shadowBlur = 0;
      }
      else if (activeTheme === 'tokyo') {
        ctx.fillStyle = '#0a000a';
        ctx.fillRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;

        state.rings.forEach(ring => {
          ring.z -= 10;
          if (ring.z <= 0) {
            ring.z = 1000;
            ring.color = `hsl(${(frame) % 360}, 100%, 50%)`;
          }

          const scale = 1000 / ring.z;
          const r = 200 * scale;

          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.strokeStyle = ring.color;
          ctx.lineWidth = 2 * scale;
          ctx.shadowBlur = 20;
          ctx.shadowColor = ring.color;
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
      }
      else if (activeTheme === 'cyber') {
        ctx.fillStyle = 'rgba(15, 15, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);

        state.zOff += 0.005;
        state.particles.forEach(p => {
          const scale = 0.005;
          const angle = (Math.sin(p.x * scale + state.zOff) + Math.cos(p.y * scale + state.zOff)) * Math.PI * 2;
          
          p.vx += Math.cos(angle) * 0.2;
          p.vy += Math.sin(angle) * 0.2;
          p.vx *= 0.9;
          p.vy *= 0.9;
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1;

          if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.life <= 0) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.life = 100;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 5;
          ctx.shadowColor = p.color;
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      }
      else if (activeTheme === 'amethyst') {
        ctx.fillStyle = '#0f050a';
        ctx.fillRect(0, 0, width, height);

        state.petals.forEach(p => {
          p.x += p.vx + Math.sin(frame * 0.01 + p.y * 0.01) * 2;
          p.y += p.vy;
          p.ang += p.spin;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.ang);
          ctx.scale(p.s, p.s);
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(10, -10, 20, 10, 0, 20);
          ctx.bezierCurveTo(-20, 10, -10, -10, 0, 0);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
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
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-darkBg">
      <div className="absolute inset-0 z-0 noise-overlay opacity-20"></div>
      <canvas ref={canvasRef} className="absolute inset-0 z-10 block" />
      <div className="absolute inset-0 z-20 pointer-events-none hero-gradient" />
    </div>
  );
}
