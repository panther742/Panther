import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  phaseX: number;
  phaseY: number;
  driftSpeedX: number;
  driftSpeedY: number;
  glowColor: string;
}

interface RippleWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

interface HeroIconNode {
  id: string;
  name: string;
  path: Path2D;
  relX: number;
  relY: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  phase: number;
  rotation: number;
  baseAlpha: number;
  alpha: number;
  scale: number;
}

export const HeroCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isTabActive = true;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Particles array
    let particles: Particle[] = [];
    let ripples: RippleWave[] = [];
    let heroIcons: HeroIconNode[] = [];

    // 12 Designer Outline Icons (Photoshop, CorelDRAW, CapCut, Pen, Brush, Palette, Eyedropper, Layers, Typography, Bézier, Artboard, Export)
    const rawIconsData = [
      // Top Left
      {
        id: 'photoshop',
        name: 'Photoshop',
        pathStr: 'M -10,-10 L 10,-10 C 12,-10 12,-10 12,-8 L 12,8 C 12,10 12,10 10,10 L -10,10 C -12,10 -12,10 -12,8 L -12,-8 C -12,-10 -12,-10 -10,-10 Z M -6,-5 L -6,5 M -6,-5 L -2,-5 C 0,-5 1,-4 1,-2.5 C 1,-1 0,0 -2,0 L -6,0 M 6,-5 C 3.5,-5 3.5,-2.5 5,-2.5 C 6.5,-2.5 6.5,1 4,1 M 4,-5 L 6,-5',
        relX: 0.12,
        relY: 0.15,
        scale: 1.35,
      },
      // Top Right
      {
        id: 'coreldraw',
        name: 'CorelDRAW',
        pathStr: 'M 0,-10 C -7,-10 -9,-4 -5,2 C -3,5 -1,8 -1,10 L 1,10 C 1,8 3,5 5,2 C 9,-4 7,-10 0,-10 Z M -4,-4 C -2,-8 2,-8 4,-4 M -2,10 L 2,10 M -1,12 L 1,12',
        relX: 0.88,
        relY: 0.15,
        scale: 1.35,
      },
      // Middle Left
      {
        id: 'pen-tool',
        name: 'Pen Tool',
        pathStr: 'M -3,-10 L 8,1 L 1,8 L -6,8 L -6,1 Z M -6,8 L -10,12 M 1,-2 L 5,2',
        relX: 0.08,
        relY: 0.50,
        scale: 1.35,
      },
      // Middle Right
      {
        id: 'capcut',
        name: 'CapCut',
        pathStr: 'M -10,-8 L 10,-8 C 12,-8 12,8 10,8 L -10,8 C -12,8 -12,-8 -10,-8 Z M -6,-4 L -2,4 M -2,-4 L -6,4 M 2,-4 L 6,-4 L 6,4 L 2,4 Z',
        relX: 0.92,
        relY: 0.50,
        scale: 1.35,
      },
      // Bottom Left
      {
        id: 'typography',
        name: 'Typography',
        pathStr: 'M -8,-8 L 8,-8 M 0,-8 L 0,8 M -4,8 L 4,8',
        relX: 0.12,
        relY: 0.82,
        scale: 1.35,
      },
      // Bottom Right
      {
        id: 'layers',
        name: 'Layers',
        pathStr: 'M 0,-8 L 9,-3.5 L 0,1 L -9,-3.5 Z M -9,1 L 0,5.5 L 9,1 M -9,5.5 L 0,10 L 9,5.5',
        relX: 0.88,
        relY: 0.82,
        scale: 1.35,
      },
      // Random Small - Top Left Edge
      {
        id: 'brush',
        name: 'Brush Tool',
        pathStr: 'M 5,-9 C 7,-11 9,-9 8,-7 L 2,2 L -2,-2 Z M 1,3 C -1,5 -5,5 -7,9 C -9,9 -9,7 -8,5 C -4,1 -2,3 1,3 Z',
        relX: 0.28,
        relY: 0.12,
        scale: 1.25,
      },
      // Random Small - Top Right Edge
      {
        id: 'color-palette',
        name: 'Color Palette',
        pathStr: 'M 0,-10 C -6,-10 -10,-6 -10,0 C -10,6 -6,10 0,10 C 2,10 4,8.5 4,7 C 4,5.5 3,4.5 3,3 C 3,1.5 4,1 5,1 C 8,1 10,-1 10,-4 C 10,-8 6,-10 0,-10 Z M -4,-5 A 1,1 0 1,1 -4,-4.9 M 0,-7 A 1,1 0 1,1 0,-6.9 M 4,-5 A 1,1 0 1,1 4,-4.9 M -5,1 A 1,1 0 1,1 -5,1.1',
        relX: 0.72,
        relY: 0.12,
        scale: 1.25,
      },
      // Random Small - Mid-Lower Left Edge
      {
        id: 'eyedropper',
        name: 'Eyedropper',
        pathStr: 'M 4,-8 C 6,-10 8,-8 8,-6 L 1,-1 L -1,1 L -4,-2 L -2,-4 Z M -4,-2 L -8,2 L -9,7 L -4,6 L -1,1',
        relX: 0.08,
        relY: 0.68,
        scale: 1.25,
      },
      // Random Small - Mid-Lower Right Edge
      {
        id: 'bezier-curve',
        name: 'Bézier Curve',
        pathStr: 'M -10,5 C -5,-10 5,10 10,-5 M -10,5 L -6,-7 M 10,-5 L 6,7 M -12,3 L -8,3 L -8,7 L -12,7 Z M 8,-7 L 12,-7 L 12,-3 L 8,-3 Z',
        relX: 0.92,
        relY: 0.68,
        scale: 1.25,
      },
      // Random Small - Bottom Perimeter Left
      {
        id: 'artboard',
        name: 'Artboard',
        pathStr: 'M -8,-8 L 8,-8 L 8,8 L -8,8 Z M -11,-8 L -8,-8 M -11,0 L -8,0 M -11,8 L -8,8 M -8,-11 L -8,-8 M 0,-11 L 0,-8 M 8,-11 L 8,-8',
        relX: 0.30,
        relY: 0.88,
        scale: 1.25,
      },
      // Random Small - Bottom Perimeter Right
      {
        id: 'export-pkg',
        name: 'Export / Package',
        pathStr: 'M -8,-2 L -8,7 L 8,7 L 8,-2 M -4,-6 L 0,-10 L 4,-6 M 0,-10 L 0,2',
        relX: 0.70,
        relY: 0.88,
        scale: 1.25,
      },
    ];

    const initHeroIcons = (w: number, h: number) => {
      heroIcons = rawIconsData.map((item, idx) => {
        const x = w * item.relX;
        const y = h * item.relY;
        return {
          id: item.id,
          name: item.name,
          path: new Path2D(item.pathStr),
          relX: item.relX,
          relY: item.relY,
          x,
          y,
          baseX: x,
          baseY: y,
          phase: idx * 0.65,
          rotation: 0,
          baseAlpha: 0.48, // Opacity strictly within 40%-60%
          alpha: 0.48,
          scale: item.scale,
        };
      });
    };

    const initParticles = (w: number, h: number) => {
      // Scale particle count based on screen area (50 to 85 particles)
      const count = Math.min(85, Math.max(50, Math.floor((w * h) / 12000)));
      particles = [];

      for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const radius = Math.random() * 2.6 + 1.2; // Different particle sizes (1.2px - 3.8px)
        const baseAlpha = Math.random() * 0.6 + 0.25; // Different opacities (0.25 - 0.85)

        // Palette variations: bright cyan, sapphire blue, soft ice white
        const colorPalette = [
          'rgba(0, 216, 255',
          'rgba(95, 255, 247',
          'rgba(0, 140, 255',
          'rgba(180, 230, 255',
        ];
        const glowColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];

        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
          radius,
          baseAlpha,
          alpha: baseAlpha,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          driftSpeedX: (Math.random() - 0.5) * 0.15,
          driftSpeedY: (Math.random() - 0.5) * 0.15,
          glowColor,
        });
      }
    };

    const updateSize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || 600;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      if (particles.length === 0) {
        initParticles(width, height);
      } else {
        // Adjust bounds for existing particles
        particles.forEach((p) => {
          if (p.baseX > width) p.baseX = Math.random() * width;
          if (p.baseY > height) p.baseY = Math.random() * height;
        });
      }

      if (heroIcons.length === 0) {
        initHeroIcons(width, height);
      } else {
        heroIcons.forEach((icon) => {
          icon.baseX = width * icon.relX;
          icon.baseY = height * icon.relY;
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Mouse Tracking for Interactive Particle Physics & Cursor Light
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isOver: false,
      opacity: 0,
      targetOpacity: 0,
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      if (px >= -150 && px <= width + 150 && py >= -150 && py <= height + 150) {
        mouse.targetX = px;
        mouse.targetY = py;
        mouse.targetOpacity = 1;
        mouse.isOver = true;
      } else {
        mouse.targetOpacity = 0;
        mouse.isOver = false;
      }
    };

    const handlePointerLeave = () => {
      mouse.targetOpacity = 0;
      mouse.isOver = false;
    };

    // Click Effect (Ripple Wave)
    const handlePointerDown = (e: PointerEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      if (px >= 0 && px <= width && py >= 0 && py <= height) {
        ripples.push({
          x: px,
          y: py,
          radius: 0,
          maxRadius: Math.min(width, height) * 0.45 + 150,
          alpha: 0.75,
          speed: 4.5, // Wave propagation speed
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
      if (isTabActive) {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Animation Time States
    let time = 0;
    let holoRotation = 0;

    const render = () => {
      if (!isTabActive) return;

      time += 0.005;
      holoRotation += 0.0008;

      ctx.clearRect(0, 0, width, height);

      // Smooth lerp mouse coordinates & opacity (Fluid, non-jarring motion)
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;
      mouse.opacity += (mouse.targetOpacity - mouse.opacity) * 0.06;

      // -------------------------------------------------------------
      // LAYER 1: Dark Navy -> Black Animated Slow Gradient
      // -------------------------------------------------------------
      const bgGradY = Math.sin(time * 0.5) * 50;
      const bgGrad = ctx.createLinearGradient(0, bgGradY, width, height - bgGradY);
      bgGrad.addColorStop(0, '#040814'); // Dark Navy
      bgGrad.addColorStop(0.5, '#060B16');
      bgGrad.addColorStop(1, '#020408'); // Rich Obsidian Black

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // -------------------------------------------------------------
      // LAYER 2: Large Blue Aurora Glows (Slow, Blurred, Low Opacity)
      // -------------------------------------------------------------
      const aurora1X = width * 0.35 + Math.sin(time * 0.7) * 120;
      const aurora1Y = height * 0.3 + Math.cos(time * 0.5) * 60;
      const aurora1Rad = Math.min(width, height) * 0.55;

      const aurora1Grad = ctx.createRadialGradient(
        aurora1X, aurora1Y, 0,
        aurora1X, aurora1Y, aurora1Rad
      );
      aurora1Grad.addColorStop(0, 'rgba(0, 216, 255, 0.14)');
      aurora1Grad.addColorStop(0.4, 'rgba(0, 140, 255, 0.06)');
      aurora1Grad.addColorStop(0.8, 'rgba(0, 80, 200, 0.02)');
      aurora1Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = aurora1Grad;
      ctx.fillRect(0, 0, width, height);

      const aurora2X = width * 0.65 + Math.cos(time * 0.6) * 100;
      const aurora2Y = height * 0.55 + Math.sin(time * 0.4) * 80;
      const aurora2Rad = Math.min(width, height) * 0.6;

      const aurora2Grad = ctx.createRadialGradient(
        aurora2X, aurora2Y, 0,
        aurora2X, aurora2Y, aurora2Rad
      );
      aurora2Grad.addColorStop(0, 'rgba(79, 70, 229, 0.10)'); // Indigo
      aurora2Grad.addColorStop(0.5, 'rgba(0, 163, 255, 0.05)');
      aurora2Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = aurora2Grad;
      ctx.fillRect(0, 0, width, height);

      // -------------------------------------------------------------
      // LAYER 3: Glass Mesh Gradient (Subtle Grid/Mesh)
      // -------------------------------------------------------------
      ctx.save();
      const meshStep = 80;
      ctx.strokeStyle = 'rgba(0, 216, 255, 0.025)';
      ctx.lineWidth = 0.8;

      for (let x = 0; x < width; x += meshStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += meshStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // LAYER 4: Holographic Circle Behind Hero Title
      // -------------------------------------------------------------
      const holoCenterX = width / 2;
      const holoCenterY = height / 2 - 20;
      const holoRadius = Math.min(width, height) * 0.32;

      ctx.save();
      ctx.translate(holoCenterX, holoCenterY);
      ctx.rotate(holoRotation);

      const holoGrad = ctx.createConicGradient(0, 0, 0);
      holoGrad.addColorStop(0, 'rgba(0, 216, 255, 0.06)');
      holoGrad.addColorStop(0.25, 'rgba(95, 255, 247, 0.02)');
      holoGrad.addColorStop(0.5, 'rgba(0, 123, 255, 0.05)');
      holoGrad.addColorStop(0.75, 'rgba(168, 85, 247, 0.03)');
      holoGrad.addColorStop(1, 'rgba(0, 216, 255, 0.06)');

      ctx.beginPath();
      ctx.arc(0, 0, holoRadius, 0, Math.PI * 2);
      ctx.strokeStyle = holoGrad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, holoRadius * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 216, 255, 0.035)';
      ctx.lineWidth = 1;
      ctx.setLineDash([12, 16]);
      ctx.stroke();

      ctx.setLineDash([]);
      const numTicks = 24;
      for (let i = 0; i < numTicks; i++) {
        const angle = (i * Math.PI * 2) / numTicks;
        const innerX = Math.cos(angle) * (holoRadius - 6);
        const innerY = Math.sin(angle) * (holoRadius - 6);
        const outerX = Math.cos(angle) * (holoRadius + 4);
        const outerY = Math.sin(angle) * (holoRadius + 4);

        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.strokeStyle = 'rgba(0, 216, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // -------------------------------------------------------------
      // LAYER 5: Soft Blue Glow Around Mouse Cursor
      // -------------------------------------------------------------
      if (mouse.opacity > 0.01) {
        const cursorGlowRadius = 280;
        const mouseGlow = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, cursorGlowRadius
        );

        const currentAlpha = 0.22 * mouse.opacity;
        mouseGlow.addColorStop(0, `rgba(0, 216, 255, ${currentAlpha})`);
        mouseGlow.addColorStop(0.3, `rgba(0, 163, 255, ${currentAlpha * 0.5})`);
        mouseGlow.addColorStop(0.65, `rgba(0, 100, 220, ${currentAlpha * 0.15})`);
        mouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, cursorGlowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // -------------------------------------------------------------
      // LAYER 6: Update & Draw Click Ripple Waves
      // -------------------------------------------------------------
      for (let r = ripples.length - 1; r >= 0; r--) {
        const wave = ripples[r];
        wave.radius += wave.speed;
        wave.alpha = Math.max(0, 0.75 * (1 - wave.radius / wave.maxRadius));

        if (wave.radius >= wave.maxRadius || wave.alpha <= 0.01) {
          ripples.splice(r, 1);
          continue;
        }

        // Draw soft glowing ripple ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 216, 255, ${wave.alpha})`;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Secondary inner glow
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, Math.max(0, wave.radius - 4), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(95, 255, 247, ${wave.alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // -------------------------------------------------------------
      // LAYER 7: Floating Designer Outline Icons Update & Physics
      // -------------------------------------------------------------
      heroIcons.forEach((icon) => {
        // Slow floating motion
        const floatX = Math.sin(time * 0.32 + icon.phase) * 6;
        const floatY = Math.cos(time * 0.26 + icon.phase) * 6;

        // Subtle rotation: 1 to 3 degrees max (0.017 to 0.052 rad)
        icon.rotation = Math.sin(time * 0.18 + icon.phase) * 0.032;

        // Soft breathing glow opacity (40% - 60%)
        let targetAlpha = icon.baseAlpha + Math.sin(time * 1.0 + icon.phase) * 0.06;

        let targetX = width * icon.relX + floatX;
        let targetY = height * icon.relY + floatY;

        // Mouse proximity interaction: 5-8px gentle move, slight glow increase
        if (mouse.opacity > 0.01) {
          const dx = mouse.x - targetX;
          const dy = mouse.y - targetY;
          const dist = Math.hypot(dx, dy);

          if (dist < 210 && dist > 0.1) {
            const influence = 1 - dist / 210;
            // Displacement strictly 5 to 8 pixels
            targetX -= (dx / dist) * influence * 7;
            targetY -= (dy / dist) * influence * 7;
            targetAlpha += influence * 0.14;
          }
        }

        icon.x += (targetX - icon.x) * 0.05;
        icon.y += (targetY - icon.y) * 0.05;
        icon.alpha += (Math.min(0.72, Math.max(0.40, targetAlpha)) - icon.alpha) * 0.08;
      });

      // -------------------------------------------------------------
      // LAYER 8: Particle Physics & Integrated Network Connections
      // -------------------------------------------------------------
      const magneticRadius = 190;
      const repelThreshold = 65;

      // 1. Update Particle Physics
      particles.forEach((p) => {
        p.baseX += Math.sin(time * 0.8 + p.phaseX) * p.driftSpeedX;
        p.baseY += Math.cos(time * 0.7 + p.phaseY) * p.driftSpeedY;

        if (p.baseX < -20) p.baseX = width + 20;
        if (p.baseX > width + 20) p.baseX = -20;
        if (p.baseY < -20) p.baseY = height + 20;
        if (p.baseY > height + 20) p.baseY = -20;

        let targetX = p.baseX;
        let targetY = p.baseY;

        if (mouse.opacity > 0.01) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < magneticRadius && dist > 0.1) {
            const normalizedDist = dist / magneticRadius;
            const influence = Math.pow(1 - normalizedDist, 2);

            if (dist < repelThreshold) {
              const repelForce = (1 - dist / repelThreshold) * 40;
              targetX = p.baseX - (dx / dist) * repelForce;
              targetY = p.baseY - (dy / dist) * repelForce;
            } else {
              const pullFactor = influence * 0.35;
              targetX = p.baseX + dx * pullFactor;
              targetY = p.baseY + dy * pullFactor;
            }

            p.alpha = Math.min(1, p.baseAlpha + influence * 0.45);
          } else {
            p.alpha += (p.baseAlpha - p.alpha) * 0.05;
          }
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
        }

        ripples.forEach((wave) => {
          const rdx = p.x - wave.x;
          const rdy = p.y - wave.y;
          const rdist = Math.hypot(rdx, rdy);
          const waveFrontDiff = Math.abs(rdist - wave.radius);

          if (waveFrontDiff < 45 && rdist > 0.1) {
            const pushMagnitude = (1 - waveFrontDiff / 45) * wave.alpha * 4.5;
            p.vx += (rdx / rdist) * pushMagnitude;
            p.vy += (rdy / rdist) * pushMagnitude;
            p.alpha = Math.min(1, p.alpha + wave.alpha * 0.5);
          }
        });

        const springDx = targetX - p.x;
        const springDy = targetY - p.y;

        p.vx = (p.vx + springDx * 0.04) * 0.88;
        p.vy = (p.vy + springDy * 0.04) * 0.88;

        p.x += p.vx;
        p.y += p.vy;
      });

      // 2. Draw Network Lines (Connecting Nearby Particles & Mouse Node)
      const maxLineDist = 135;
      ctx.lineWidth = 0.9;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxLineDist) {
            const lineAlpha = (1 - dist / maxLineDist) * 0.32 * Math.min(p1.alpha, p2.alpha);
            if (lineAlpha > 0.01) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);

              if (lineAlpha > 0.15) {
                ctx.strokeStyle = `rgba(0, 216, 255, ${lineAlpha * 1.2})`;
                ctx.lineWidth = 1.2;
              } else {
                ctx.strokeStyle = `rgba(0, 180, 255, ${lineAlpha})`;
                ctx.lineWidth = 0.8;
              }
              ctx.stroke();
            }
          }
        }

        if (mouse.opacity > 0.1) {
          const mDx = mouse.x - p1.x;
          const mDy = mouse.y - p1.y;
          const mDist = Math.hypot(mDx, mDy);

          if (mDist < 160) {
            const mLineAlpha = (1 - mDist / 160) * 0.4 * mouse.opacity * p1.alpha;
            if (mLineAlpha > 0.01) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(95, 255, 247, ${mLineAlpha})`;
              ctx.lineWidth = 1.0;
              ctx.stroke();
            }
          }
        }
      }

      // Draw Network Lines connecting Icon Nodes into the Particle Network
      const maxIconConnDist = 145;
      heroIcons.forEach((icon) => {
        particles.forEach((p) => {
          const dx = p.x - icon.x;
          const dy = p.y - icon.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxIconConnDist) {
            const connAlpha = (1 - dist / maxIconConnDist) * 0.30 * Math.min(p.alpha, icon.alpha);
            if (connAlpha > 0.01) {
              ctx.beginPath();
              ctx.moveTo(icon.x, icon.y);
              ctx.lineTo(p.x, p.y);
              ctx.strokeStyle = `rgba(0, 216, 255, ${connAlpha})`;
              ctx.lineWidth = 0.9;
              ctx.stroke();
            }
          }
        });

        if (mouse.opacity > 0.1) {
          const mDx = mouse.x - icon.x;
          const mDy = mouse.y - icon.y;
          const mDist = Math.hypot(mDx, mDy);

          if (mDist < 180) {
            const mConnAlpha = (1 - mDist / 180) * 0.35 * mouse.opacity * icon.alpha;
            if (mConnAlpha > 0.01) {
              ctx.beginPath();
              ctx.moveTo(icon.x, icon.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(95, 255, 247, ${mConnAlpha})`;
              ctx.lineWidth = 1.0;
              ctx.stroke();
            }
          }
        }
      });

      // 3. Draw Particles (Soft Blue Glow + Sharp Core)
      particles.forEach((p) => {
        const particleGlowRad = p.radius * 3.5;
        const pGlow = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, particleGlowRad
        );
        pGlow.addColorStop(0, `${p.glowColor}, ${p.alpha * 0.8})`);
        pGlow.addColorStop(0.5, `${p.glowColor}, ${p.alpha * 0.2})`);
        pGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, particleGlowRad, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, p.alpha * 1.1)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // -------------------------------------------------------------
      // LAYER 9: Draw Outline Glowing Designer Tool Icons
      // -------------------------------------------------------------
      heroIcons.forEach((icon) => {
        ctx.save();
        ctx.translate(icon.x, icon.y);

        // Glassmorphism soft backdrop aura
        const bgGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 24);
        bgGrad.addColorStop(0, `rgba(0, 216, 255, ${icon.alpha * 0.12})`);
        bgGrad.addColorStop(0.7, `rgba(0, 160, 255, ${icon.alpha * 0.04})`);
        bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bgGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.rotate(icon.rotation);
        ctx.scale(icon.scale, icon.scale);

        // Soft cyan / electric blue glow shadow (soft bloom)
        ctx.shadowColor = 'rgba(24, 200, 255, 0.85)';
        ctx.shadowBlur = 12;

        // Outer Electric Blue (#18C8FF) thin stroke
        ctx.strokeStyle = `rgba(24, 200, 255, ${icon.alpha})`;
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(icon.path);

        // Secondary cyan highlight inner stroke
        ctx.strokeStyle = `rgba(95, 255, 247, ${icon.alpha * 0.65})`;
        ctx.lineWidth = 0.7;
        ctx.stroke(icon.path);

        ctx.restore();

        // Node anchor dot linking icon into the network
        ctx.beginPath();
        ctx.arc(icon.x, icon.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(95, 255, 247, ${icon.alpha * 0.95})`;
        ctx.shadowColor = 'rgba(24, 200, 255, 0.9)';
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
