import React, { useEffect, useRef, useState } from 'react';

/**
 * ThemeBackground — High-performance real-time animated background canvas
 * Crafted visual identities for every theme:
 * - ocean (🌊 Ocean Abyss): Multi-layered deep trench sine-wave currents, expanding sonar acoustic ripples & bioluminescent plankton
 * - inferno (🔥 Inferno Magma): Volcanic obsidian lake, multi-harmonic molten lava waves, soaring flame shards & incandescent embers
 * - matrix (⚡ Matrix Terminal): Pitch void black, orthogonal cyber circuit grid, dynamic PCB data pulses & sweeping 360° radar beam
 * - cyber (👑 Solar Gold Luxe): Opulent 24K pure gold & champagne auroral light curtains, rotating celestial diamond stars & ascending solar stardust
 * - monochrome (⚪ Lunar Noir): Deep obsidian pitch with connected geometric constellation stardust & silver filaments
 * - arctic (❄️ Arctic Frost): Glacial frosted night, drifting crystalline hexagonal snowflakes & swaying ice dust
 * - tokyo (🌸 Tokyo Vaporwave): 80s Synthwave perspective rolling neon wireframe grid & cyber motes
 * - amethyst (🔮 Cosmic Nebula): Deep-space 3D parallax starfield with violet plasma dust & shooting star trails
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
    let sonarSources = [];
    let sonarRings = [];
    let circuitNodes = [];
    let circuitSegments = [];
    let dataPackets = [];
    let radarAngle = 0;
    let solarStars = [];
    let solarMotes = [];
    let solarWaves = [];
    let shootingStars = [];
    let gridOffset = 0;

    function initScene(theme) {
      particles = [];
      waves = [];
      sonarSources = [];
      sonarRings = [];
      circuitNodes = [];
      circuitSegments = [];
      dataPackets = [];
      solarStars = [];
      solarMotes = [];
      solarWaves = [];
      shootingStars = [];
      gridOffset = 0;
      radarAngle = 0;

      const isMobile = width < 768;

      if (theme === 'ocean') {
        // 🌊 1. Ocean Abyss: Multi-layered Sine Wave Currents + Sonar Ripples + Bioluminescent Plankton
        waves = [
          {
            yRatio: 0.70,
            amp1: 28,
            freq1: 0.0022,
            amp2: 12,
            freq2: 0.0055,
            speed: 0.009,
            phase: 0,
            gradTop: 'rgba(56, 189, 248, 0.10)',
            gradBot: 'rgba(14, 165, 233, 0.02)',
            crestColor: 'rgba(99, 210, 255, 0.28)'
          },
          {
            yRatio: 0.80,
            amp1: 34,
            freq1: 0.0018,
            amp2: 16,
            freq2: 0.0042,
            speed: -0.007,
            phase: 1.8,
            gradTop: 'rgba(45, 212, 191, 0.08)',
            gradBot: 'rgba(20, 184, 166, 0.01)',
            crestColor: 'rgba(45, 212, 191, 0.25)'
          },
          {
            yRatio: 0.88,
            amp1: 42,
            freq1: 0.0014,
            amp2: 20,
            freq2: 0.0035,
            speed: 0.011,
            phase: 3.2,
            gradTop: 'rgba(99, 102, 241, 0.12)',
            gradBot: 'rgba(59, 130, 246, 0.04)',
            crestColor: 'rgba(129, 140, 248, 0.32)'
          },
          {
            yRatio: 0.95,
            amp1: 22,
            freq1: 0.0040,
            amp2: 10,
            freq2: 0.0080,
            speed: -0.013,
            phase: 4.5,
            gradTop: 'rgba(99, 210, 255, 0.16)',
            gradBot: 'rgba(14, 116, 144, 0.08)',
            crestColor: 'rgba(99, 210, 255, 0.40)'
          }
        ];

        // Sonar ping stations
        sonarSources = [
          { x: width * 0.22, y: height * 0.38, timer: 0, interval: 140 },
          { x: width * 0.78, y: height * 0.55, timer: 70, interval: 160 },
          { x: width * 0.50, y: height * 0.72, timer: 110, interval: 180 }
        ];

        // Bioluminescent Plankton
        const planktonCount = isMobile ? 24 : 45;
        for (let i = 0; i < planktonCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.2 + Math.random() * 2.8,
            speedY: -(0.2 + Math.random() * 0.6),
            swaySpeed: 0.015 + Math.random() * 0.02,
            swayOffset: Math.random() * Math.PI * 2,
            swayAmp: 0.8 + Math.random() * 1.5,
            hue: Math.random() > 0.4 ? 195 : 170, // Cyan / Teal bioluminescence
            baseAlpha: 0.2 + Math.random() * 0.5,
            pulseSpeed: 0.03 + Math.random() * 0.04,
            pulsePhase: Math.random() * Math.PI * 2
          });
        }
      } else if (theme === 'inferno') {
        // 🔥 2. Inferno Magma: Volcanic Lake, Multi-Harmonic Magma Waves & Dynamic Flame Shards
        waves = [
          {
            yRatio: 0.84,
            amp: 30,
            freq: 0.004,
            turbAmp: 10,
            turbFreq: 0.018,
            speed: 0.022,
            phase: 0,
            gradTop: 'rgba(255, 69, 0, 0.18)',
            gradBot: 'rgba(180, 20, 0, 0.05)',
            crestColor: 'rgba(255, 120, 40, 0.45)'
          },
          {
            yRatio: 0.91,
            amp: 24,
            freq: 0.007,
            turbAmp: 14,
            turbFreq: 0.025,
            speed: -0.018,
            phase: 1.5,
            gradTop: 'rgba(255, 30, 39, 0.25)',
            gradBot: 'rgba(120, 10, 10, 0.10)',
            crestColor: 'rgba(255, 80, 50, 0.6)'
          },
          {
            yRatio: 0.96,
            amp: 18,
            freq: 0.010,
            turbAmp: 8,
            turbFreq: 0.035,
            speed: 0.028,
            phase: 3.0,
            gradTop: 'rgba(255, 170, 0, 0.35)',
            gradBot: 'rgba(200, 40, 0, 0.20)',
            crestColor: 'rgba(255, 220, 60, 0.8)'
          }
        ];

        // Flame Shards & Fire Bursts
        const shardCount = isMobile ? 28 : 55;
        for (let i = 0; i < shardCount; i++) {
          particles.push({
            x: Math.random() * width,
            y: height * 0.7 + Math.random() * (height * 0.32),
            size: 2.5 + Math.random() * 5.5,
            speedY: -(1.8 + Math.random() * 3.8),
            speedX: (Math.random() - 0.5) * 2.2,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.18,
            hue: Math.random() > 0.5 ? 15 + Math.random() * 25 : 355 + Math.random() * 18,
            lightness: 55 + Math.random() * 20,
            life: Math.random() * 50,
            maxLife: 45 + Math.random() * 65,
            opacity: 0.45 + Math.random() * 0.55
          });
        }
      } else if (theme === 'matrix') {
        // ⚡ 3. Matrix Terminal: Pitch Void Black, Orthogonal Cyber Circuit Grid & Scanning Radar Beam
        const spacingX = isMobile ? 90 : 110;
        const spacingY = isMobile ? 80 : 95;
        const cols = Math.ceil(width / spacingX) + 1;
        const rows = Math.ceil(height / spacingY) + 1;

        circuitNodes = [];
        circuitSegments = [];

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const nx = c * spacingX;
            const ny = r * spacingY;
            const isHub = (r + c) % 4 === 0;
            circuitNodes.push({
              x: nx,
              y: ny,
              isHub,
              pulse: Math.random() * Math.PI * 2,
              pulseSpeed: 0.02 + Math.random() * 0.03,
              radarHitAlpha: 0
            });

            // Add horizontal & vertical PCB segments
            if (c < cols - 1) {
              circuitSegments.push({ x1: nx, y1: ny, x2: nx + spacingX, y2: ny, dir: 'h' });
            }
            if (r < rows - 1) {
              circuitSegments.push({ x1: nx, y1: ny, x2: nx, y2: ny + spacingY, dir: 'v' });
            }
          }
        }

        // Live Data Packets travelling on circuit traces
        const packetCount = isMobile ? 12 : 25;
        for (let i = 0; i < packetCount; i++) {
          const seg = circuitSegments[Math.floor(Math.random() * circuitSegments.length)];
          dataPackets.push({
            x1: seg.x1,
            y1: seg.y1,
            x2: seg.x2,
            y2: seg.y2,
            progress: Math.random(),
            speed: 0.008 + Math.random() * 0.015,
            size: 2.2 + Math.random() * 1.8
          });
        }
      } else if (theme === 'cyber') {
        // 👑 4. Solar Gold Luxe: Imperial 24K Gold Auroral Curtains, Rotating Diamond Stars & Golden Stardust
        const starCount = isMobile ? 20 : 38;
        solarStars = [];
        for (let i = 0; i < starCount; i++) {
          solarStars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 7 + Math.random() * 16,
            points: Math.random() > 0.65 ? 8 : 4,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.016,
            phase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.025 + Math.random() * 0.035,
            opacity: 0.35 + Math.random() * 0.55
          });
        }

        // Ascending Golden Stardust & Amber Motes
        const moteCount = isMobile ? 25 : 50;
        solarMotes = [];
        for (let i = 0; i < moteCount; i++) {
          solarMotes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1.2 + Math.random() * 2.8,
            speedY: -(0.3 + Math.random() * 0.8),
            speedX: (Math.random() - 0.5) * 0.4,
            opacity: 0.25 + Math.random() * 0.6,
            hue: Math.random() > 0.4 ? 45 : 38, // 24K Pure Gold (45) / Honey Amber (38)
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.03 + Math.random() * 0.04
          });
        }

        // Solar Coronal Wave Curtains
        solarWaves = [
          { phase: 0, speed: 0.006, yOffset: height * 0.15, amp: 35 },
          { phase: 2.5, speed: -0.005, yOffset: height * 0.35, amp: 45 }
        ];
      } else if (theme === 'arctic') {
        // ❄️ 5. Arctic Frost: Crystalline Snow & Ice Flakes
        const count = isMobile ? 35 : 75;
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
        // 🌸 6. Tokyo Vaporwave: 80s Perspective Moving Wireframe Grid + Neon Motes
        const count = isMobile ? 25 : 50;
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
        // 🔮 7. Cosmic Nebula: 3D Parallax Starfield & Shooting Meteors
        const count = isMobile ? 50 : 95;
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
        // ⚪ 8. Lunar Noir: Geometric Constellation Stardust
        const count = isMobile ? 25 : 50;
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

    // Helper: Draw 4-point or 8-point diamond star
    function drawDiamondStar(cx, cy, size, points, rot, alpha, glowColor) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      ctx.beginPath();
      // Primary 4 points
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(0, 0, size * 0.22, 0);
      ctx.lineTo(size, 0);
      ctx.quadraticCurveTo(0, 0, 0, size * 0.22);
      ctx.lineTo(0, size);
      ctx.quadraticCurveTo(0, 0, -size * 0.22, 0);
      ctx.lineTo(-size, 0);
      ctx.quadraticCurveTo(0, 0, 0, -size * 0.22);
      ctx.closePath();

      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = size * 1.6;
      ctx.fill();

      // Additional 4 diagonal secondary points for 8-point stars
      if (points === 8) {
        ctx.save();
        ctx.rotate(Math.PI / 4);
        const subSize = size * 0.65;
        ctx.beginPath();
        ctx.moveTo(0, -subSize);
        ctx.quadraticCurveTo(0, 0, subSize * 0.22, 0);
        ctx.lineTo(subSize, 0);
        ctx.quadraticCurveTo(0, 0, 0, subSize * 0.22);
        ctx.lineTo(0, subSize);
        ctx.quadraticCurveTo(0, 0, -subSize * 0.22, 0);
        ctx.lineTo(-subSize, 0);
        ctx.quadraticCurveTo(0, 0, 0, -subSize * 0.22);
        ctx.closePath();
        ctx.fillStyle = `rgba(254, 240, 138, ${alpha * 0.8})`;
        ctx.fill();
        ctx.restore();
      }

      // Center bright flare core
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1, size * 0.15), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.3)})`;
      ctx.fill();

      ctx.restore();
    }

    // ── Main Render Loop ──
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (activeTheme === 'ocean') {
        // 🌊 1. Ocean Abyss: Deep oceanic trench & undulating sine-wave currents + Sonar ripples
        // Sonar Ping emitters
        sonarSources.forEach((src) => {
          src.timer++;
          if (src.timer >= src.interval) {
            src.timer = 0;
            sonarRings.push({
              x: src.x + (Math.random() - 0.5) * 40,
              y: src.y + (Math.random() - 0.5) * 40,
              r: 6,
              maxR: 260 + Math.random() * 80,
              speed: 0.85 + Math.random() * 0.35,
              alpha: 0.45
            });
          }
        });

        // Update & draw sonar expanding ripples
        for (let i = sonarRings.length - 1; i >= 0; i--) {
          const ring = sonarRings[i];
          ring.r += ring.speed;
          if (ring.r > ring.maxR) {
            sonarRings.splice(i, 1);
            continue;
          }

          const progress = ring.r / ring.maxR;
          const ringAlpha = ring.alpha * (1 - progress);

          // Outer sonar wavefront
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(99, 210, 255, ${ringAlpha})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Inner echo ripple harmonic
          if (ring.r > 28) {
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.r - 22, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(129, 140, 248, ${ringAlpha * 0.6})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }

          // Center ping dot glow on initial trigger
          if (progress < 0.25) {
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 210, 255, ${ringAlpha * 1.5})`;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // Multi-harmonic undulating Sine-Wave Currents
        waves.forEach((w) => {
          w.phase += w.speed;
          ctx.beginPath();
          ctx.moveTo(0, height);

          for (let x = 0; x <= width; x += 12) {
            const y =
              height * w.yRatio +
              Math.sin(x * w.freq1 + w.phase) * w.amp1 +
              Math.cos(x * w.freq2 + w.phase * 0.75) * w.amp2;
            ctx.lineTo(x, y);
          }

          ctx.lineTo(width, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, height * w.yRatio - w.amp1, 0, height);
          grad.addColorStop(0, w.gradTop);
          grad.addColorStop(1, w.gradBot);
          ctx.fillStyle = grad;
          ctx.fill();

          // Bioluminescent wave crest glow line
          ctx.beginPath();
          for (let x = 0; x <= width; x += 12) {
            const y =
              height * w.yRatio +
              Math.sin(x * w.freq1 + w.phase) * w.amp1 +
              Math.cos(x * w.freq2 + w.phase * 0.75) * w.amp2;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = w.crestColor;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

        // Bioluminescent Plankton
        particles.forEach((p) => {
          p.y += p.speedY;
          p.swayOffset += p.swaySpeed;
          p.x += Math.sin(p.swayOffset) * p.swayAmp;
          p.pulsePhase += p.pulseSpeed;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          const alpha = p.baseAlpha * (0.65 + 0.35 * Math.sin(p.pulsePhase));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${alpha})`;
          ctx.shadowColor = `hsl(${p.hue}, 90%, 55%)`;
          ctx.shadowBlur = p.size * 3;
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'inferno') {
        // 🔥 2. Inferno Magma: Volcanic obsidian lake, turbulent lava & flame shards
        // Base thermal magma glow
        const magmaBaseGrad = ctx.createLinearGradient(0, height * 0.75, 0, height);
        magmaBaseGrad.addColorStop(0, 'rgba(255, 30, 39, 0)');
        magmaBaseGrad.addColorStop(0.6, 'rgba(255, 69, 0, 0.08)');
        magmaBaseGrad.addColorStop(1, 'rgba(255, 170, 0, 0.16)');
        ctx.fillStyle = magmaBaseGrad;
        ctx.fillRect(0, height * 0.75, width, height * 0.25);

        // Turbulent Molten Magma Waves
        waves.forEach((w) => {
          w.phase += w.speed;
          ctx.beginPath();
          ctx.moveTo(0, height);

          for (let x = 0; x <= width; x += 10) {
            const y =
              height * w.yRatio +
              Math.sin(x * w.freq + w.phase) * w.amp +
              Math.sin(x * w.turbFreq + frame * 0.04) * w.turbAmp;
            ctx.lineTo(x, y);
          }

          ctx.lineTo(width, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, height * w.yRatio - w.amp, 0, height);
          grad.addColorStop(0, w.gradTop);
          grad.addColorStop(1, w.gradBot);
          ctx.fillStyle = grad;
          ctx.fill();

          // Glowing incandescent lava crest
          ctx.beginPath();
          for (let x = 0; x <= width; x += 10) {
            const y =
              height * w.yRatio +
              Math.sin(x * w.freq + w.phase) * w.amp +
              Math.sin(x * w.turbFreq + frame * 0.04) * w.turbAmp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = w.crestColor;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        });

        // Flame Shards & Fire Bursts
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(frame * 0.06 + p.life) * 0.8;
          p.rotation += p.rotSpeed;
          p.life++;

          if (p.y < height * 0.35 || p.life > p.maxLife) {
            p.y = height + 10;
            p.x = Math.random() * width;
            p.life = 0;
            p.speedY = -(1.8 + Math.random() * 3.8);
          }

          const alpha = p.opacity * (1 - p.life / p.maxLife);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          // Angular fiery diamond shard
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 2.2);
          ctx.lineTo(p.size * 0.9, p.size * 0.6);
          ctx.lineTo(0, p.size * 1.4);
          ctx.lineTo(-p.size * 0.9, p.size * 0.6);
          ctx.closePath();

          ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.lightness}%, ${alpha})`;
          ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
          ctx.shadowBlur = p.size * 2.5;
          ctx.fill();
          ctx.restore();
        });
        ctx.shadowBlur = 0;
      } else if (activeTheme === 'matrix') {
        // ⚡ 3. Matrix Terminal: Pitch void black & calm cyber circuit grid radar pulse
        radarAngle = (radarAngle + 0.012) % (Math.PI * 2);
        const radarCenterX = width * 0.5;
        const radarCenterY = height * 0.5;
        const maxRadarDist = Math.hypot(width, height) * 0.55;

        // Subtle PCB Circuit Traces
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.055)';
        ctx.lineWidth = 1;
        circuitSegments.forEach((seg) => {
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.stroke();
        });

        // 360° Scanning Radar Beam Sweep
        const sweepAngleSpan = 0.55; // Radians of trailing phosphor glow
        for (let i = 0; i < 6; i++) {
          const subAngle = radarAngle - (i / 6) * sweepAngleSpan;
          const beamAlpha = (0.07 * (6 - i)) / 6;
          ctx.beginPath();
          ctx.moveTo(radarCenterX, radarCenterY);
          ctx.arc(radarCenterX, radarCenterY, maxRadarDist, subAngle, subAngle + sweepAngleSpan / 6);
          ctx.closePath();
          ctx.fillStyle = `rgba(0, 255, 136, ${beamAlpha})`;
          ctx.fill();
        }

        // Radar beam sweep line
        ctx.beginPath();
        ctx.moveTo(radarCenterX, radarCenterY);
        ctx.lineTo(
          radarCenterX + Math.cos(radarAngle) * maxRadarDist,
          radarCenterY + Math.sin(radarAngle) * maxRadarDist
        );
        ctx.strokeStyle = 'rgba(57, 255, 20, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Circuit Nodes & Radar Intersection Excitation
        circuitNodes.forEach((node) => {
          node.pulse += node.pulseSpeed;

          // Check if radar beam passed near this node
          const dx = node.x - radarCenterX;
          const dy = node.y - radarCenterY;
          let nodeAngle = Math.atan2(dy, dx);
          if (nodeAngle < 0) nodeAngle += Math.PI * 2;
          let angleDiff = Math.abs(nodeAngle - radarAngle);
          if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

          if (angleDiff < 0.12) {
            node.radarHitAlpha = 0.9;
          } else {
            node.radarHitAlpha = Math.max(0, node.radarHitAlpha - 0.015);
          }

          const baseAlpha = 0.06 + 0.12 * Math.sin(node.pulse);
          const totalAlpha = Math.min(1, baseAlpha + node.radarHitAlpha * 0.7);

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.isHub ? 3.5 : 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 136, ${totalAlpha})`;
          if (node.radarHitAlpha > 0.3) {
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 8;
          }
          ctx.fill();
          ctx.shadowBlur = 0;

          // Micro hub crosshair
          if (node.isHub && node.radarHitAlpha > 0.2) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(57, 255, 20, ${node.radarHitAlpha * 0.6})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });

        // Live Data Packets
        dataPackets.forEach((p) => {
          p.progress += p.speed;
          if (p.progress >= 1) {
            const seg = circuitSegments[Math.floor(Math.random() * circuitSegments.length)];
            p.x1 = seg.x1;
            p.y1 = seg.y1;
            p.x2 = seg.x2;
            p.y2 = seg.y2;
            p.progress = 0;
            p.speed = 0.008 + Math.random() * 0.015;
          }

          const curX = p.x1 + (p.x2 - p.x1) * p.progress;
          const curY = p.y1 + (p.y2 - p.y1) * p.progress;

          ctx.beginPath();
          ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(57, 255, 20, 0.85)';
          ctx.shadowColor = '#00ff88';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      } else if (activeTheme === 'cyber') {
        // 👑 4. Solar Gold Luxe: Imperial 24K Gold, Champagne Aurora Curtains, Rotating Diamond Stars & Golden Stardust
        // Flowing Solar Coronal Aurora Curtains
        solarWaves.forEach((w) => {
          w.phase += w.speed;
          const aurGrad = ctx.createLinearGradient(0, w.yOffset - w.amp, width, w.yOffset + w.amp);
          aurGrad.addColorStop(0, 'rgba(255, 215, 0, 0.03)');
          aurGrad.addColorStop(0.5 + Math.sin(w.phase) * 0.25, 'rgba(251, 191, 36, 0.09)');
          aurGrad.addColorStop(1, 'rgba(245, 158, 11, 0.02)');

          ctx.beginPath();
          ctx.moveTo(0, 0);
          for (let x = 0; x <= width; x += 20) {
            const y = w.yOffset + Math.sin(x * 0.002 + w.phase) * w.amp + Math.cos(x * 0.004 + w.phase * 0.6) * 15;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, 0);
          ctx.closePath();
          ctx.fillStyle = aurGrad;
          ctx.fill();
        });

        // Sweeping Diagonal Champagne Light Shaft
        const beamPhase = frame * 0.006;
        const shaftGrad = ctx.createLinearGradient(0, 0, width, height);
        shaftGrad.addColorStop(0, 'rgba(255, 215, 0, 0.02)');
        shaftGrad.addColorStop(0.45 + Math.sin(beamPhase) * 0.2, 'rgba(254, 240, 138, 0.07)');
        shaftGrad.addColorStop(1, 'rgba(245, 158, 11, 0.015)');
        ctx.fillStyle = shaftGrad;
        ctx.fillRect(0, 0, width, height);

        // Ascending Golden Stardust & Amber Motes
        solarMotes.forEach((m) => {
          m.y += m.speedY;
          m.x += m.speedX + Math.sin(frame * 0.02 + m.pulse) * 0.4;
          m.pulse += m.pulseSpeed;

          if (m.y < -10) {
            m.y = height + 10;
            m.x = Math.random() * width;
          }

          const alpha = m.opacity * (0.6 + 0.4 * Math.sin(m.pulse));
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${m.hue}, 100%, 65%, ${alpha})`;
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = m.size * 2.5;
          ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Rotating 4-Point & 8-Point Diamond Stars (✦)
        solarStars.forEach((star) => {
          star.rot += star.rotSpeed;
          star.phase += star.pulseSpeed;
          const currentAlpha = star.opacity * (0.55 + 0.45 * Math.sin(star.phase));
          drawDiamondStar(star.x, star.y, star.size, star.points, star.rot, currentAlpha, '#ffd700');
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
