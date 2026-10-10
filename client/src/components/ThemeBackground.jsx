import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * Refined Subtle & Non-Intrusive Simulation Engines (Dull & Ambient for 100% UI Visibility):
 * 1. quantum      — 🌌 Quantum Flux: Subtle gravitational particle orbits & soft stardust filaments
 * 2. cyberpunk    — ⚡ Cyberpunk Matrix: Soft 3D perspective cyber grid with faint laser data pulses
 * 3. monolith     — 🌑 Monolith Chrono: Interlocking 3D gyroscope rings with liquid mercury orbs & architectural crosshairs
 * 4. solar        — 🔥 Solar Flare: Gentle coronal magnetic plasma arches & soft ember drift
 * 5. emerald      — 🌿 Emerald Synapse: Minimalist synaptic neural circuit network with calm data pulses
 * 6. neon-horizon — 🏎️ Neon Horizon: Soft perspective speed trails & twilight vanishing horizon
 */
export default function ThemeBackground() {
  const canvasRef = useRef(null);
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('syncstream_theme') || 'quantum';
  });

  // Track body class changes to switch simulation mode instantly
  useEffect(() => {
    const detectTheme = () => {
      const classList = document.body.classList;
      if (classList.contains('theme-cyberpunk')) return 'cyberpunk';
      if (classList.contains('theme-monolith')) return 'monolith';
      if (classList.contains('theme-solar')) return 'solar';
      if (classList.contains('theme-emerald')) return 'emerald';
      if (classList.contains('theme-neon-horizon')) return 'neon-horizon';
      return localStorage.getItem('syncstream_theme') || 'quantum';
    };

    setActiveTheme(detectTheme());

    const observer = new MutationObserver(() => {
      setActiveTheme(detectTheme());
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const handleStorage = (e) => {
      if (e.key === 'syncstream_theme') {
        setActiveTheme(e.newValue || 'quantum');
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

      if (theme === 'quantum') {
        // Subtle gravitational flux particles
        const count = isMobile ? 40 : 80;
        const particles = [];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * Math.min(width, height) * 0.4 + 40;
          particles.push({
            angle,
            dist,
            speed: (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
            radialSpeed: (Math.random() - 0.5) * 0.2,
            size: Math.random() * 1.5 + 0.8,
            color: ['rgba(139, 92, 246, 0.45)', 'rgba(6, 182, 212, 0.45)', 'rgba(244, 63, 94, 0.35)'][Math.floor(Math.random() * 3)]
          });
        }
        state = { particles };
      } else if (theme === 'cyberpunk') {
        // Soft 3D Perspective Cyber Grid
        const hLines = isMobile ? 10 : 16;
        const vLines = isMobile ? 12 : 20;
        const packets = [];
        const packetCount = isMobile ? 10 : 18;
        for (let i = 0; i < packetCount; i++) {
          packets.push({
            vLine: Math.floor(Math.random() * vLines),
            progress: Math.random(),
            speed: Math.random() * 0.006 + 0.003,
            length: Math.random() * 0.08 + 0.04,
            color: Math.random() > 0.5 ? 'rgba(0, 245, 255, 0.5)' : 'rgba(247, 37, 133, 0.45)'
          });
        }
        state = { hLines, vLines, packets };
      } else if (theme === 'monolith') {
        // Quantum Gyroscope & Liquid Mercury with Architectural Crosshairs
        const gyroRings = [
          { radius: Math.min(width, height) * (isMobile ? 0.22 : 0.28), speedX: 0.006, speedY: 0.008, color: 'rgba(226, 232, 240, 0.28)' },
          { radius: Math.min(width, height) * (isMobile ? 0.16 : 0.21), speedX: -0.007, speedY: 0.005, color: 'rgba(59, 130, 246, 0.35)' },
          { radius: Math.min(width, height) * (isMobile ? 0.10 : 0.14), speedX: 0.009, speedY: -0.008, color: 'rgba(239, 68, 68, 0.30)' }
        ];

        // Liquid mercury metaball orbs
        const mercuryOrbs = [];
        const orbCount = isMobile ? 4 : 8;
        for (let i = 0; i < orbCount; i++) {
          mercuryOrbs.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 18 + 12
          });
        }

        // Architectural Crosshair reticles
        const reticles = [
          { x: width * 0.25, y: height * 0.3, size: 24 },
          { x: width * 0.75, y: height * 0.7, size: 30 }
        ];

        state = { gyroRings, mercuryOrbs, reticles, rot: 0 };
      } else if (theme === 'solar') {
        // Gentle Coronal Magnetic Loops & Soft Drifting Embers
        const loopCount = isMobile ? 3 : 5;
        const loops = [];
        for (let i = 0; i < loopCount; i++) {
          loops.push({
            p1: { x: Math.random() * width, y: height + 20 },
            p2: { x: Math.random() * width, y: height * (0.35 + Math.random() * 0.4) },
            p3: { x: Math.random() * width, y: height + 20 },
            pulse: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.01 + 0.005,
            color: Math.random() > 0.5 ? 'rgba(249, 115, 22, 0.25)' : 'rgba(225, 29, 72, 0.20)'
          });
        }
        const sparks = [];
        for (let i = 0; i < (isMobile ? 20 : 40); i++) {
          sparks.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: -(Math.random() * 1.0 + 0.3),
            vx: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 1.5 + 0.8,
            color: Math.random() > 0.4 ? 'rgba(250, 204, 21, 0.4)' : 'rgba(249, 115, 22, 0.35)',
            life: Math.random() * 120
          });
        }
        state = { loops, sparks };
      } else if (theme === 'emerald') {
        // Minimalist Synaptic Circuit Matrix
        const nodeCount = isMobile ? 18 : 36;
        const nodes = [];
        for (let i = 0; i < nodeCount; i++) {
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35
          });
        }
        const pulses = [];
        for (let i = 0; i < (isMobile ? 8 : 14); i++) {
          pulses.push({
            source: Math.floor(Math.random() * nodeCount),
            target: Math.floor(Math.random() * nodeCount),
            progress: Math.random(),
            speed: Math.random() * 0.012 + 0.008
          });
        }
        state = { nodes, pulses };
      } else if (theme === 'neon-horizon') {
        // Soft Warp Speed Streamers
        const count = isMobile ? 22 : 45;
        const streamers = [];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          streamers.push({
            angle,
            dist: Math.random() * 800,
            speed: Math.random() * 7 + 4,
            length: Math.random() * 35 + 15,
            color: ['rgba(255, 0, 127, 0.35)', 'rgba(0, 223, 216, 0.35)', 'rgba(121, 40, 202, 0.3)'][Math.floor(Math.random() * 3)]
          });
        }
        state = { streamers };
      }
    }

    initScene(activeTheme);

    const render = () => {
      frame++;

      if (activeTheme === 'quantum') {
        ctx.fillStyle = 'rgba(13, 17, 39, 0.25)';
        ctx.fillRect(0, 0, width, height);

        const { particles } = state;
        if (!particles) return;

        const cx = width / 2 + Math.sin(frame * 0.006) * 50;
        const cy = height / 2 + Math.cos(frame * 0.005) * 40;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.angle += p.speed;
          p.dist += p.radialSpeed;
          if (p.dist < 30 || p.dist > Math.min(width, height) * 0.42) {
            p.radialSpeed *= -1;
          }

          const x = cx + Math.cos(p.angle) * p.dist;
          const y = cy + Math.sin(p.angle) * p.dist;

          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const x2 = cx + Math.cos(p2.angle) * p2.dist;
            const y2 = cy + Math.sin(p2.angle) * p2.dist;
            const d = Math.hypot(x - x2, y - y2);
            if (d < 70) {
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x2, y2);
              ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - d / 70) * 0.18})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      } else if (activeTheme === 'cyberpunk') {
        ctx.fillStyle = 'rgba(9, 19, 38, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { hLines, vLines, packets } = state;
        if (!packets) return;

        const horizon = height * 0.4;
        const vanishingX = width / 2;

        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.06)';

        for (let i = 0; i < hLines; i++) {
          const t = i / hLines;
          const y = horizon + Math.pow(t, 2.2) * (height - horizon);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        for (let i = 0; i <= vLines; i++) {
          const xBottom = (width / vLines) * i;
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizon);
          ctx.lineTo(xBottom, height);
          ctx.stroke();
        }

        for (const p of packets) {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;

          const xBottom = (width / vLines) * p.vLine;
          const startT = Math.max(0, p.progress - p.length);
          const endT = p.progress;

          const y1 = horizon + Math.pow(startT, 2.2) * (height - horizon);
          const x1 = vanishingX + (xBottom - vanishingX) * startT;
          const y2 = horizon + Math.pow(endT, 2.2) * (height - horizon);
          const x2 = vanishingX + (xBottom - vanishingX) * endT;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
      } else if (activeTheme === 'monolith') {
        // Monolith Chrono: 3D Interlocking Gyroscope & Liquid Mercury
        ctx.fillStyle = 'rgba(5, 5, 5, 0.25)';
        ctx.fillRect(0, 0, width, height);

        const { gyroRings, mercuryOrbs, reticles } = state;
        if (!gyroRings) return;

        state.rot += 0.006;
        const cx = width / 2;
        const cy = height / 2;

        // Render 3D Interlocking Gyroscope Rings
        for (let i = 0; i < gyroRings.length; i++) {
          const g = gyroRings[i];
          const rotX = state.rot * (1 + i * 0.4);
          const rotY = state.rot * (0.8 - i * 0.3);

          ctx.save();
          ctx.translate(cx, cy);
          ctx.beginPath();
          ctx.ellipse(0, 0, g.radius, g.radius * Math.abs(Math.cos(rotX)), rotY, 0, Math.PI * 2);
          ctx.strokeStyle = g.color;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Small orbital node on ring perimeter
          const beadAngle = state.rot * (2 + i);
          const bx = Math.cos(beadAngle) * g.radius;
          const by = Math.sin(beadAngle) * (g.radius * Math.abs(Math.cos(rotX)));
          ctx.beginPath();
          ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = i === 1 ? '#3b82f6' : (i === 2 ? '#ef4444' : '#e2e8f0');
          ctx.fill();

          ctx.restore();
        }

        // Floating Liquid Mercury Metaball Orbs
        for (const orb of mercuryOrbs) {
          orb.x += orb.vx;
          orb.y += orb.vy;
          if (orb.x < 0 || orb.x > width) orb.vx *= -1;
          if (orb.y < 0 || orb.y > height) orb.vy *= -1;

          const grad = ctx.createRadialGradient(orb.x, orb.y, 1, orb.x, orb.y, orb.radius);
          grad.addColorStop(0, 'rgba(226, 232, 240, 0.18)');
          grad.addColorStop(0.7, 'rgba(59, 130, 246, 0.08)');
          grad.addColorStop(1, 'rgba(5, 5, 5, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Architectural Crosshair Reticles
        for (const r of reticles) {
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.15)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(r.x - r.size, r.y);
          ctx.lineTo(r.x + r.size, r.y);
          ctx.moveTo(r.x, r.y - r.size);
          ctx.lineTo(r.x, r.y + r.size);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(r.x, r.y, r.size * 0.4, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (activeTheme === 'solar') {
        ctx.fillStyle = 'rgba(36, 13, 7, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { loops, sparks } = state;
        if (!loops || !sparks) return;

        for (const l of loops) {
          l.pulse += l.speed;
          const offsetY = Math.sin(l.pulse) * 25;

          ctx.beginPath();
          ctx.moveTo(l.p1.x, l.p1.y);
          ctx.quadraticCurveTo(l.p2.x, l.p2.y + offsetY, l.p3.x, l.p3.y);
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = l.color;
          ctx.stroke();
        }

        for (const s of sparks) {
          s.y += s.vy;
          s.x += s.vx + Math.sin(frame * 0.03 + s.y) * 0.4;
          s.life--;
          if (s.y < 0 || s.life <= 0) {
            s.y = height + 10;
            s.x = Math.random() * width;
            s.life = Math.random() * 120 + 40;
          }

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.fill();
        }
      } else if (activeTheme === 'emerald') {
        ctx.fillStyle = 'rgba(4, 32, 24, 0.26)';
        ctx.fillRect(0, 0, width, height);

        const { nodes, pulses } = state;
        if (!nodes || !pulses) return;

        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;

          ctx.beginPath();
          ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.fill();

          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const d = Math.hypot(n.x - n2.x, n.y - n2.y);
            if (d < 95) {
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.strokeStyle = `rgba(16, 185, 129, ${(1 - d / 95) * 0.14})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

        for (const p of pulses) {
          p.progress += p.speed;
          if (p.progress > 1) {
            p.progress = 0;
            p.source = Math.floor(Math.random() * nodes.length);
            p.target = Math.floor(Math.random() * nodes.length);
          }

          const sNode = nodes[p.source];
          const tNode = nodes[p.target];
          if (sNode && tNode) {
            const ix = sNode.x + (tNode.x - sNode.x) * p.progress;
            const iy = sNode.y + (tNode.y - sNode.y) * p.progress;

            ctx.beginPath();
            ctx.arc(ix, iy, 2.0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(217, 249, 157, 0.6)';
            ctx.fill();
          }
        }
      } else if (activeTheme === 'neon-horizon') {
        ctx.fillStyle = 'rgba(23, 12, 41, 0.28)';
        ctx.fillRect(0, 0, width, height);

        const { streamers } = state;
        if (!streamers) return;

        const cx = width / 2;
        const cy = height * 0.45;

        for (const s of streamers) {
          s.dist += s.speed;
          if (s.dist > Math.max(width, height)) {
            s.dist = 10;
          }

          const x1 = cx + Math.cos(s.angle) * s.dist;
          const y1 = cy + Math.sin(s.angle) * (s.dist * 0.6);
          const x2 = cx + Math.cos(s.angle) * (s.dist + s.length);
          const y2 = cy + Math.sin(s.angle) * ((s.dist + s.length) * 0.6);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = s.color;
          ctx.lineWidth = Math.min(2.0, (s.dist / 250));
          ctx.stroke();
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
      <div className="absolute inset-0 z-0 noise-overlay opacity-15"></div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 block animate-fade-in opacity-40 transition-opacity duration-700"
        key={activeTheme}
      />
      <div className="absolute inset-0 z-20 pointer-events-none hero-gradient opacity-80 transition-all duration-700" />
    </div>
  );
}
