import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Custom Mathematical Simulation Engines:
 * 1. nebula    — 🌌 Deep Space Network: Interconnected constellation nodes
 * 2. sunset    — 🏜️ Sunset Mirage: Heat haze and rising embers
 * 3. rainforest— 🌿 Neon Rainforest: Bioluminescent fireflies
 * 4. coral     — 🪸 Deep Coral Reef: Flowing ocean currents
 * 5. daybreak  — 🌅 Daybreak Horizon: Radial expanding sunburst rings
 * 6. violet    — 🔮 Electric Violet: Pulsing neon polygons
 * 7. autumn    — 🍂 Golden Autumn: Swirling wind particles
 * 8. frost     — ❄️ Mint Frosting: Gentle falling snow and frost
 */
export default function ThemeBackground() {
  const canvasRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('syncstream_theme') || 'nebula';
  });

  // Track body class changes to switch animation mode instantly
  useEffect(() => {
    const detectTheme = () => {
      const classList = document.body.classList;
      if (classList.contains('theme-sunset')) return 'sunset';
      if (classList.contains('theme-rainforest')) return 'rainforest';
      if (classList.contains('theme-coral')) return 'coral';
      if (classList.contains('theme-daybreak')) return 'daybreak';
      if (classList.contains('theme-violet')) return 'violet';
      if (classList.contains('theme-autumn')) return 'autumn';
      if (classList.contains('theme-frost')) return 'frost';
      return localStorage.getItem('syncstream_theme') || 'nebula';
    };

    setActiveTheme(detectTheme());

    const observer = new MutationObserver(() => {
      setActiveTheme(detectTheme());
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const handleStorage = (e) => {
      if (e.key === 'syncstream_theme') {
        setActiveTheme(e.newValue || 'nebula');
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

      if (theme === 'nebula') {
        const count = isMobile ? 50 : 120;
        const nodes = [];
        for (let i = 0; i < count; i++) {
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            r: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? '#38bdf8' : '#ec4899'
          });
        }
        state = { nodes };
      } else if (theme === 'sunset') {
        const count = isMobile ? 60 : 150;
        const embers = [];
        for (let i = 0; i < count; i++) {
          embers.push({
            x: Math.random() * width,
            y: Math.random() * height + height,
            vx: (Math.random() - 0.5) * 2,
            vy: - (Math.random() * 2 + 1),
            life: Math.random() * 100,
            r: Math.random() * 3 + 1,
            color: ['#fb923c', '#ef4444', '#facc15'][Math.floor(Math.random() * 3)]
          });
        }
        state = { embers };
      } else if (theme === 'rainforest') {
        const count = isMobile ? 40 : 100;
        const fireflies = [];
        for (let i = 0; i < count; i++) {
          fireflies.push({
            x: Math.random() * width,
            y: Math.random() * height,
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.5 + 0.2,
            r: Math.random() * 2 + 1.5,
            color: ['#34d399', '#6ee7b7', '#a7f3d0'][Math.floor(Math.random() * 3)]
          });
        }
        state = { fireflies };
      } else if (theme === 'coral') {
        const waves = [];
        for (let i = 0; i < 5; i++) {
          waves.push({
            yOffset: Math.random() * height,
            amplitude: Math.random() * 50 + 20,
            frequency: Math.random() * 0.01 + 0.005,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.01,
            color: `hsla(${160 + i * 20}, 80%, 60%, 0.2)`
          });
        }
        state = { waves };
      } else if (theme === 'daybreak') {
        const rings = [];
        for (let i = 0; i < 3; i++) {
          rings.push({
            radius: Math.random() * 100,
            maxRadius: Math.max(width, height) * 0.8,
            speed: Math.random() * 2 + 1,
            color: ['#60a5fa', '#c084fc', '#f472b6'][i]
          });
        }
        state = { rings };
      } else if (theme === 'violet') {
        const polys = [];
        for (let i = 0; i < 10; i++) {
          polys.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 50 + 20,
            sides: Math.floor(Math.random() * 3) + 3,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.05,
            color: `hsla(${280 + Math.random() * 40}, 80%, 60%, 0.3)`
          });
        }
        state = { polys };
      } else if (theme === 'autumn') {
        const count = isMobile ? 60 : 120;
        const leaves = [];
        for (let i = 0; i < count; i++) {
          leaves.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.random() * 3 + 1,
            vy: Math.random() * 2 - 1,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.1,
            color: ['#f59e0b', '#fbbf24', '#f87171'][Math.floor(Math.random() * 3)]
          });
        }
        state = { leaves };
      } else if (theme === 'frost') {
        const count = isMobile ? 80 : 200;
        const snow = [];
        for (let i = 0; i < count; i++) {
          snow.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 1,
            r: Math.random() * 2 + 0.5,
            color: Math.random() > 0.5 ? '#94ead4' : '#ffffff'
          });
        }
        state = { snow };
      }
    }

    initScene(activeTheme);

    const render = () => {
      frame++;
      
      if (activeTheme === 'nebula') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
        ctx.fillRect(0, 0, width, height);
        const { nodes } = state;
        if (!nodes) return;
        
        ctx.lineWidth = 0.5;
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
          
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = n.color;
          ctx.fill();
          
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const d = Math.hypot(n.x - n2.x, n.y - n2.y);
            if (d < 100) {
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.strokeStyle = `rgba(56, 189, 248, ${1 - d/100})`;
              ctx.stroke();
            }
          }
        }
      } else if (activeTheme === 'sunset') {
        ctx.fillStyle = 'rgba(69, 10, 10, 0.2)';
        ctx.fillRect(0, 0, width, height);
        const { embers } = state;
        if (!embers) return;
        
        for (const e of embers) {
          e.x += e.vx + Math.sin(frame * 0.05 + e.life) * 1;
          e.y += e.vy;
          e.life--;
          
          if (e.y < 0 || e.life <= 0) {
            e.y = height + Math.random() * 50;
            e.x = Math.random() * width;
            e.life = 100 + Math.random() * 50;
          }
          
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fillStyle = e.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = e.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (activeTheme === 'rainforest') {
        ctx.fillStyle = 'rgba(6, 78, 59, 0.2)';
        ctx.fillRect(0, 0, width, height);
        const { fireflies } = state;
        if (!fireflies) return;
        
        for (const f of fireflies) {
          f.angle += (Math.random() - 0.5) * 0.2;
          f.x += Math.cos(f.angle) * f.speed;
          f.y += Math.sin(f.angle) * f.speed - 0.5;
          
          if (f.x < -10) f.x = width + 10;
          if (f.x > width + 10) f.x = -10;
          if (f.y < -10) f.y = height + 10;
          
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = f.color;
          ctx.shadowBlur = 15;
          ctx.shadowColor = f.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (activeTheme === 'coral') {
        ctx.fillStyle = 'rgba(17, 94, 89, 0.2)';
        ctx.fillRect(0, 0, width, height);
        const { waves } = state;
        if (!waves) return;
        
        for (const w of waves) {
          w.phase += w.speed;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 20) {
            const y = w.yOffset + Math.sin(x * w.frequency + w.phase) * w.amplitude;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.fillStyle = w.color;
          ctx.fill();
        }
      } else if (activeTheme === 'daybreak') {
        ctx.fillStyle = 'rgba(49, 46, 129, 0.1)';
        ctx.fillRect(0, 0, width, height);
        const { rings } = state;
        if (!rings) return;
        
        for (const r of rings) {
          r.radius += r.speed;
          if (r.radius > r.maxRadius) {
            r.radius = 0;
          }
          
          ctx.beginPath();
          ctx.arc(width/2, height/2, r.radius, 0, Math.PI * 2);
          ctx.lineWidth = 2;
          ctx.strokeStyle = r.color;
          ctx.globalAlpha = 1 - (r.radius / r.maxRadius);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      } else if (activeTheme === 'violet') {
        ctx.fillStyle = 'rgba(76, 29, 149, 0.2)';
        ctx.fillRect(0, 0, width, height);
        const { polys } = state;
        if (!polys) return;
        
        for (const p of polys) {
          p.angle += p.spin;
          
          ctx.beginPath();
          for (let i = 0; i < p.sides; i++) {
            const a = p.angle + (i * Math.PI * 2) / p.sides;
            const px = p.x + Math.cos(a) * p.radius;
            const py = p.y + Math.sin(a) * p.radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.fill();
          
          p.x += Math.cos(frame * 0.01) * 0.5;
          p.y += Math.sin(frame * 0.01) * 0.5;
        }
      } else if (activeTheme === 'autumn') {
        ctx.fillStyle = 'rgba(120, 53, 15, 0.2)';
        ctx.fillRect(0, 0, width, height);
        const { leaves } = state;
        if (!leaves) return;
        
        for (const l of leaves) {
          l.x += l.vx + Math.sin(frame * 0.05) * 1;
          l.y += l.vy + Math.cos(frame * 0.05) * 0.5;
          l.angle += l.spin;
          
          if (l.x > width + 20) l.x = -20;
          if (l.y > height + 20) l.y = -20;
          if (l.y < -20) l.y = height + 20;
          
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.angle);
          ctx.fillStyle = l.color;
          ctx.beginPath();
          ctx.moveTo(0, -5);
          ctx.lineTo(5, 5);
          ctx.lineTo(-5, 5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      } else if (activeTheme === 'frost') {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.2)';
        ctx.fillRect(0, 0, width, height);
        const { snow } = state;
        if (!snow) return;
        
        for (const s of snow) {
          s.y += s.vy;
          s.x += s.vx + Math.sin(frame * 0.02 + s.y) * 0.5;
          
          if (s.y > height + 10) {
            s.y = -10;
            s.x = Math.random() * width;
          }
          
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.fill();
        }
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
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-darkBg transition-all duration-700 ease-in-out">
      <div className="absolute inset-0 z-0 noise-overlay opacity-20"></div>
      <canvas ref={canvasRef} className="absolute inset-0 z-10 block animate-fade-in" key={activeTheme} />
      <div className="absolute inset-0 z-20 pointer-events-none hero-gradient transition-all duration-700" />
    </div>
  );
}
