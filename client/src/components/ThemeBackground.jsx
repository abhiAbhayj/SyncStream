import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-Performance Cinematic Background Visualizer
 * 8 Professional Mathematical Simulation Engines:
 * 1. quantum      — 🌌 Quantum Flux: Interactive gravitational particle orbits & stardust filaments
 * 2. cyberpunk    — ⚡ Cyberpunk Matrix: 3D perspective holographic cyber grid with laser data packets
 * 3. aurora       — 🌊 Aurora Borealis: Multi-layered harmonic plasma curtains & ion folds
 * 4. prism        — 💎 Prism Luxe: 3D rotating crystalline geometries with refracted spectral rays
 * 5. solar        — 🔥 Solar Flare: Coronal magnetic prominence loops & radiant plasma arcs
 * 6. emerald      — 🌿 Emerald Synapse: Neural circuit pathways with high-speed synaptic data impulses
 * 7. neon-horizon — 🏎️ Neon Horizon: High-velocity warp perspective speed-streamers
 * 8. cryo         — 🧊 Cryo Sapphire: Hexagonal crystal shield matrix with rotating radar sweep
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
      if (classList.contains('theme-aurora')) return 'aurora';
      if (classList.contains('theme-prism')) return 'prism';
      if (classList.contains('theme-solar')) return 'solar';
      if (classList.contains('theme-emerald')) return 'emerald';
      if (classList.contains('theme-neon-horizon')) return 'neon-horizon';
      if (classList.contains('theme-cryo')) return 'cryo';
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
        // Gravitational flux particles
        const count = isMobile ? 65 : 140;
        const particles = [];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * Math.min(width, height) * 0.45 + 50;
          particles.push({
            angle,
            dist,
            speed: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
            radialSpeed: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 1,
            color: ['#8b5cf6', '#06b6d4', '#f43f5e', '#fbbf24'][Math.floor(Math.random() * 4)],
            pulse: Math.random() * Math.PI
          });
        }
        state = { particles, cx: width / 2, cy: height / 2 };
      } else if (theme === 'cyberpunk') {
        // 3D Perspective Cyber Grid & Laser Data Packets
        const hLines = isMobile ? 12 : 18;
        const vLines = isMobile ? 14 : 24;
        const packets = [];
        const packetCount = isMobile ? 18 : 35;
        for (let i = 0; i < packetCount; i++) {
          packets.push({
            vLine: Math.floor(Math.random() * vLines),
            progress: Math.random(),
            speed: Math.random() * 0.008 + 0.004,
            length: Math.random() * 0.12 + 0.05,
            color: Math.random() > 0.4 ? '#00f5ff' : '#f72585'
          });
        }
        state = { hLines, vLines, packets };
      } else if (theme === 'aurora') {
        // Multi-layered harmonic plasma curtains
        const layers = [
          { freq: 0.003, speed: 0.008, amp: 70, yOffset: height * 0.32, color1: 'rgba(16, 231, 150, 0.28)', color2: 'rgba(6, 35, 42, 0)' },
          { freq: 0.004, speed: 0.012, amp: 85, yOffset: height * 0.45, color1: 'rgba(56, 189, 248, 0.25)', color2: 'rgba(6, 35, 42, 0)' },
          { freq: 0.0025, speed: 0.006, amp: 60, yOffset: height * 0.58, color1: 'rgba(168, 85, 247, 0.22)', color2: 'rgba(6, 35, 42, 0)' }
        ];
        state = { layers };
      } else if (theme === 'prism') {
        // 3D Rotating Geometric Crystal Wireframes
        const crystalCount = isMobile ? 3 : 5;
        const crystals = [];
        for (let i = 0; i < crystalCount; i++) {
          crystals.push({
            x: (width / (crystalCount + 1)) * (i + 1),
            y: height * (0.35 + (i % 2) * 0.3),
            radius: isMobile ? 45 : 70,
            rotX: Math.random() * Math.PI,
            rotY: Math.random() * Math.PI,
            rotZ: Math.random() * Math.PI,
            speedX: (Math.random() - 0.5) * 0.012,
            speedY: (Math.random() - 0.5) * 0.015,
            speedZ: (Math.random() - 0.5) * 0.01,
            color: ['#f472b6', '#6366f1', '#ec4899', '#fef08a'][i % 4]
          });
        }
        state = { crystals };
      } else if (theme === 'solar') {
        // Coronal Magnetic Prominence Loops
        const loopCount = isMobile ? 4 : 7;
        const loops = [];
        for (let i = 0; i < loopCount; i++) {
          loops.push({
            p1: { x: Math.random() * width, y: height + 20 },
            p2: { x: Math.random() * width, y: height * (0.2 + Math.random() * 0.5) },
            p3: { x: Math.random() * width, y: height + 20 },
            pulse: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.02 + 0.01,
            color: Math.random() > 0.5 ? '#f97316' : '#e11d48'
          });
        }
        const sparks = [];
        for (let i = 0; i < (isMobile ? 35 : 70); i++) {
          sparks.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vy: -(Math.random() * 1.8 + 0.5),
            vx: (Math.random() - 0.5) * 0.8,
            r: Math.random() * 2 + 1,
            color: Math.random() > 0.3 ? '#facc15' : '#f97316',
            life: Math.random() * 120
          });
        }
        state = { loops, sparks };
      } else if (theme === 'emerald') {
        // Synaptic Neural Circuit Pathways
        const nodeCount = isMobile ? 25 : 55;
        const nodes = [];
        for (let i = 0; i < nodeCount; i++) {
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            pulse: Math.random() * Math.PI * 2
          });
        }
        const pulses = [];
        for (let i = 0; i < (isMobile ? 12 : 25); i++) {
          pulses.push({
            source: Math.floor(Math.random() * nodeCount),
            target: Math.floor(Math.random() * nodeCount),
            progress: Math.random(),
            speed: Math.random() * 0.02 + 0.015
          });
        }
        state = { nodes, pulses };
      } else if (theme === 'neon-horizon') {
        // High-Velocity Warp Perspective Streamers
        const count = isMobile ? 35 : 75;
        const streamers = [];
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          streamers.push({
            angle,
            dist: Math.random() * 1000,
            speed: Math.random() * 12 + 6,
            length: Math.random() * 50 + 25,
            color: ['#ff007f', '#00dfd8', '#7928ca', '#ff6b35'][Math.floor(Math.random() * 4)]
          });
        }
        state = { streamers };
      } else if (theme === 'cryo') {
        // Hexagonal Cryo Matrix with Sweeping Laser Radar
        const hexSize = isMobile ? 42 : 58;
        const cols = Math.ceil(width / (hexSize * 1.5)) + 1;
        const rows = Math.ceil(height / (hexSize * Math.sqrt(3))) + 1;
        state = { hexSize, cols, rows, angle: 0 };
      }
    }

    initScene(activeTheme);

    const render = () => {
      frame++;

      if (activeTheme === 'quantum') {
        // Midnight Indigo trail fade
        ctx.fillStyle = 'rgba(13, 17, 39, 0.22)';
        ctx.fillRect(0, 0, width, height);

        const { particles } = state;
        if (!particles) return;

        // Smooth wander of gravitational center
        const cx = width / 2 + Math.sin(frame * 0.01) * 80;
        const cy = height / 2 + Math.cos(frame * 0.008) * 60;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.angle += p.speed;
          p.dist += p.radialSpeed;
          if (p.dist < 30 || p.dist > Math.min(width, height) * 0.5) {
            p.radialSpeed *= -1;
          }

          const x = cx + Math.cos(p.angle) * p.dist;
          const y = cy + Math.sin(p.angle) * p.dist;

          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Connect orbital coherence lines
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const x2 = cx + Math.cos(p2.angle) * p2.dist;
            const y2 = cy + Math.sin(p2.angle) * p2.dist;
            const d = Math.hypot(x - x2, y - y2);
            if (d < 85) {
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x2, y2);
              ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - d / 85) * 0.35})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      } else if (activeTheme === 'cyberpunk') {
        // Deep Cyber Cobalt fade
        ctx.fillStyle = 'rgba(9, 19, 38, 0.25)';
        ctx.fillRect(0, 0, width, height);

        const { hLines, vLines, packets } = state;
        if (!packets) return;

        const horizon = height * 0.35;
        const fov = width * 0.8;

        // Draw perspective grid floor
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = 'rgba(0, 245, 255, 0.12)';

        // Horizontal lines
        for (let i = 0; i < hLines; i++) {
          const t = i / hLines;
          const y = horizon + Math.pow(t, 2.2) * (height - horizon);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Vertical converging lines
        const vanishingX = width / 2;
        for (let i = 0; i <= vLines; i++) {
          const xBottom = (width / vLines) * i;
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizon);
          ctx.lineTo(xBottom, height);
          ctx.stroke();
        }

        // Render laser data packets traveling on vertical rails
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
          ctx.lineWidth = 2.2;
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } else if (activeTheme === 'aurora') {
        // Deep Nordic Teal fade
        ctx.fillStyle = 'rgba(6, 35, 42, 0.2)';
        ctx.fillRect(0, 0, width, height);

        const { layers } = state;
        if (!layers) return;

        for (const l of layers) {
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 15) {
            const y = l.yOffset +
              Math.sin(x * l.freq + frame * l.speed) * l.amp +
              Math.cos(x * 0.0015 - frame * 0.008) * (l.amp * 0.5);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, l.yOffset - l.amp, 0, height);
          grad.addColorStop(0, l.color1);
          grad.addColorStop(1, l.color2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      } else if (activeTheme === 'prism') {
        // Royal Obsidian Plum fade
        ctx.fillStyle = 'rgba(30, 14, 41, 0.22)';
        ctx.fillRect(0, 0, width, height);

        const { crystals } = state;
        if (!crystals) return;

        for (const c of crystals) {
          c.rotX += c.speedX;
          c.rotY += c.speedY;
          c.rotZ += c.speedZ;

          // Project simple 3D Octahedron vertices
          const vertices = [
            { x: 0, y: -1, z: 0 },
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 0, z: 1 },
            { x: -1, y: 0, z: 0 },
            { x: 0, y: 0, z: -1 },
            { x: 0, y: 1, z: 0 }
          ];

          const projected = vertices.map((v) => {
            // Rotations
            let y1 = v.y * Math.cos(c.rotX) - v.z * Math.sin(c.rotX);
            let z1 = v.y * Math.sin(c.rotX) + v.z * Math.cos(c.rotX);
            let x2 = v.x * Math.cos(c.rotY) + z1 * Math.sin(c.rotY);
            let z2 = -v.x * Math.sin(c.rotY) + z1 * Math.cos(c.rotY);
            let x3 = x2 * Math.cos(c.rotZ) - y1 * Math.sin(c.rotZ);
            let y3 = x2 * Math.sin(c.rotZ) + y1 * Math.cos(c.rotZ);
            return {
              x: c.x + x3 * c.radius,
              y: c.y + y3 * c.radius
            };
          });

          // Draw wireframe edges
          const edges = [
            [0, 1], [0, 2], [0, 3], [0, 4],
            [5, 1], [5, 2], [5, 3], [5, 4],
            [1, 2], [2, 3], [3, 4], [4, 1]
          ];

          ctx.lineWidth = 1.2;
          ctx.strokeStyle = c.color;
          ctx.shadowBlur = 15;
          ctx.shadowColor = c.color;

          for (const [i1, i2] of edges) {
            ctx.beginPath();
            ctx.moveTo(projected[i1].x, projected[i1].y);
            ctx.lineTo(projected[i2].x, projected[i2].y);
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        }
      } else if (activeTheme === 'solar') {
        // Deep Molten Umber fade
        ctx.fillStyle = 'rgba(36, 13, 7, 0.25)';
        ctx.fillRect(0, 0, width, height);

        const { loops, sparks } = state;
        if (!loops || !sparks) return;

        // Draw magnetic plasma arches
        for (const l of loops) {
          l.pulse += l.speed;
          const offsetY = Math.sin(l.pulse) * 40;

          ctx.beginPath();
          ctx.moveTo(l.p1.x, l.p1.y);
          ctx.quadraticCurveTo(l.p2.x, l.p2.y + offsetY, l.p3.x, l.p3.y);
          ctx.lineWidth = 2.2;
          ctx.strokeStyle = l.color;
          ctx.shadowBlur = 18;
          ctx.shadowColor = l.color;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Rising solar plasma embers
        for (const s of sparks) {
          s.y += s.vy;
          s.x += s.vx + Math.sin(frame * 0.04 + s.y) * 0.6;
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
        // Deep Cyber Forest fade
        ctx.fillStyle = 'rgba(4, 32, 24, 0.22)';
        ctx.fillRect(0, 0, width, height);

        const { nodes, pulses } = state;
        if (!nodes || !pulses) return;

        // Render nodes and neural synaptic bridges
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;

          ctx.beginPath();
          ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.fill();

          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const d = Math.hypot(n.x - n2.x, n.y - n2.y);
            if (d < 110) {
              ctx.beginPath();
              ctx.moveTo(n.x, n.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.strokeStyle = `rgba(16, 185, 129, ${(1 - d / 110) * 0.25})`;
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }
          }
        }

        // Impulses speeding between synapses
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
            ctx.arc(ix, iy, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = '#d9f99d';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#84cc16';
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      } else if (activeTheme === 'neon-horizon') {
        // Nocturnal Velvet fade
        ctx.fillStyle = 'rgba(23, 12, 41, 0.25)';
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
          ctx.lineWidth = Math.min(3.5, (s.dist / 150));
          ctx.shadowBlur = 12;
          ctx.shadowColor = s.color;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } else if (activeTheme === 'cryo') {
        // Glacial Polar Abyss fade
        ctx.fillStyle = 'rgba(8, 25, 43, 0.22)';
        ctx.fillRect(0, 0, width, height);

        const { hexSize, cols, rows } = state;
        state.angle = (state.angle + 0.015) % (Math.PI * 2);

        // Sweeping radar beam from center
        const cx = width / 2;
        const cy = height / 2;
        const maxDist = Math.hypot(width, height) / 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxDist, state.angle, state.angle + 0.35);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 229, 255, 0.035)';
        ctx.fill();

        // Hexagonal mesh
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
        ctx.lineWidth = 0.6;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const hx = c * hexSize * 1.5;
            const hy = r * hexSize * Math.sqrt(3) + (c % 2 === 1 ? (hexSize * Math.sqrt(3)) / 2 : 0);

            // Distance to radar line
            const hAngle = Math.atan2(hy - cy, hx - cx);
            const angleDiff = Math.abs((state.angle - hAngle + Math.PI * 2) % (Math.PI * 2));

            if (angleDiff < 0.2) {
              ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
              ctx.lineWidth = 1.2;
            } else {
              ctx.strokeStyle = 'rgba(0, 229, 255, 0.06)';
              ctx.lineWidth = 0.6;
            }

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const a = (i * Math.PI) / 3;
              const px = hx + Math.cos(a) * (hexSize * 0.45);
              const py = hy + Math.sin(a) * (hexSize * 0.45);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
          }
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
