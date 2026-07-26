import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WheelOption, WheelTheme } from '../types';
import { sound } from '../utils/sound';
import { WHEEL_THEMES } from '../data/presets';
import { Play, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, Sparkles } from 'lucide-react';

interface SpinWheelProps {
  options: WheelOption[];
  themeId: string;
  onSpinEnd: (winner: WheelOption) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  canvasRefOut?: React.RefObject<HTMLCanvasElement | null>;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  options,
  themeId,
  onSpinEnd,
  isSpinning,
  setIsSpinning,
  canvasRefOut,
}) => {
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = canvasRefOut || internalCanvasRef;

  const currentAngleRef = useRef<number>(0);
  const animationIdRef = useRef<number | null>(null);
  const lastCrossedSegmentRef = useRef<number>(-1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const theme = WHEEL_THEMES.find((t) => t.id === themeId) || WHEEL_THEMES[0];

  // Filter non-eliminated options
  const activeOptions = options.filter((o) => !o.eliminated);
  const totalWeight = activeOptions.reduce((acc, curr) => acc + (curr.weight || 1), 0);

  // Compute angles for weighted segments
  const segments = activeOptions.map((opt, idx) => {
    const weight = opt.weight || 1;
    const sweepAngle = (weight / totalWeight) * 2 * Math.PI;
    const color = opt.color || theme.colors[idx % theme.colors.length];
    return { ...opt, sweepAngle, color };
  });

  // Function to draw the wheel at a given angle
  const drawWheel = useCallback(
    (rotationAngle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 25;

      ctx.clearRect(0, 0, width, height);

      if (segments.length === 0) {
        // Empty wheel state
        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No items available', centerX, centerY);
        ctx.restore();
        return;
      }

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle);

      // Draw Segments
      let startAngle = 0;
      segments.forEach((seg) => {
        const endAngle = startAngle + seg.sweepAngle;

        // Draw Arc Segment
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();

        // Fill with gradient for 3D depth
        const midAngle = startAngle + seg.sweepAngle / 2;
        const gradX = Math.cos(midAngle) * radius;
        const gradY = Math.sin(midAngle) * radius;
        const fillGrad = ctx.createLinearGradient(0, 0, gradX, gradY);
        fillGrad.addColorStop(0, seg.color);
        fillGrad.addColorStop(1, adjustColorBrightness(seg.color, -25));

        ctx.fillStyle = fillGrad;
        ctx.fill();

        // White divider stroke
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Segment Text
        ctx.save();
        ctx.rotate(midAngle);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        // High contrast text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;

        // Font scaling based on wheel size
        const fontSize = segments.length > 12 ? 12 : segments.length > 8 ? 14 : 16;
        ctx.font = `bold ${fontSize}px sans-serif`;

        // Truncate long text if needed
        let labelText = seg.label;
        const maxTextWidth = radius * 0.65;
        if (ctx.measureText(labelText).width > maxTextWidth) {
          while (labelText.length > 3 && ctx.measureText(labelText + '...').width > maxTextWidth) {
            labelText = labelText.slice(0, -1);
          }
          labelText += '...';
        }

        ctx.fillText(labelText, radius - 20, 0);

        ctx.restore();

        startAngle = endAngle;
      });

      // Outer Chrome / Glow Border Ring
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 10;
      const borderGrad = ctx.createConicGradient(0, 0, 0);
      borderGrad.addColorStop(0, theme.borderColor);
      borderGrad.addColorStop(0.5, '#ffffff');
      borderGrad.addColorStop(1, theme.borderColor);
      ctx.strokeStyle = borderGrad;
      ctx.stroke();

      // Outer Rim Studs
      const studCount = Math.max(12, segments.length * 2);
      for (let i = 0; i < studCount; i++) {
        const studAngle = (i / studCount) * 2 * Math.PI;
        const sx = Math.cos(studAngle) * (radius + 5);
        const sy = Math.sin(studAngle) * (radius + 5);
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = theme.borderColor;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // Center Hub
      ctx.save();
      ctx.translate(centerX, centerY);

      // Hub Outer Glow
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fill();

      // Hub Metallic Fill
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, 2 * Math.PI);
      const hubGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
      hubGrad.addColorStop(0, '#38bdf8');
      hubGrad.addColorStop(0.7, theme.hubColor);
      hubGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = hubGrad;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Center Spinsphere Icon
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SPIN', 0, 0);

      ctx.restore();

      // Pointer Needle at TOP (270 deg / -PI/2)
      ctx.save();
      ctx.translate(centerX, centerY - radius - 8);

      ctx.beginPath();
      ctx.moveTo(-16, -18);
      ctx.lineTo(16, -18);
      ctx.lineTo(0, 18);
      ctx.closePath();

      const pointerGrad = ctx.createLinearGradient(-16, 0, 16, 0);
      pointerGrad.addColorStop(0, '#f43f5e');
      pointerGrad.addColorStop(0.5, '#fb7185');
      pointerGrad.addColorStop(1, '#e11d48');

      ctx.fillStyle = pointerGrad;
      ctx.shadowColor = 'rgba(244, 63, 94, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    },
    [segments, theme]
  );

  // Redraw when options or theme change
  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [drawWheel]);

  // Main Spin Execution Function
  const spin = () => {
    if (isSpinning || segments.length === 0) return;

    sound.playButtonClick();
    setIsSpinning(true);

    // Pick random target angle based on weighted probability
    const randomVal = Math.random();
    let accumulated = 0;
    let selectedIndex = 0;

    for (let i = 0; i < segments.length; i++) {
      accumulated += segments[i].weight / totalWeight;
      if (randomVal <= accumulated) {
        selectedIndex = i;
        break;
      }
    }

    // Calculate angle corresponding to top pointer (-PI/2 or 270 degrees)
    // Find angle span of selectedIndex
    let targetStartAngle = 0;
    for (let i = 0; i < selectedIndex; i++) {
      targetStartAngle += segments[i].sweepAngle;
    }
    const selectedSweep = segments[selectedIndex].sweepAngle;
    // Aim for middle of segment
    const targetSegmentMid = targetStartAngle + selectedSweep / 2;

    // Pointer is at -90 degrees (-PI/2). To align segmentMid with pointer:
    // (rotation + segmentMid) % 2PI = 1.5 * PI (270 deg)
    // So targetRotation = (1.5 * PI - segmentMid)
    const extraRotations = (5 + Math.floor(Math.random() * 4)) * 2 * Math.PI; // 5-8 full spins
    const currentAngleNorm = currentAngleRef.current % (2 * Math.PI);
    let targetAngle = currentAngleRef.current + extraRotations + (1.5 * Math.PI - targetSegmentMid - currentAngleNorm);

    // Ensure it always spins forward
    while (targetAngle <= currentAngleRef.current + extraRotations) {
      targetAngle += 2 * Math.PI;
    }

    const startAngle = currentAngleRef.current;
    const spinDuration = 4500; // 4.5 seconds
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Custom smooth quintic deceleration ease-out curve
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentAngle = startAngle + (targetAngle - startAngle) * easeOut;

      currentAngleRef.current = currentAngle;
      drawWheel(currentAngle);

      // Detect segment crossing for sound tick
      const normalizedAngle = (1.5 * Math.PI - (currentAngle % (2 * Math.PI)) + 2 * Math.PI * 2) % (2 * Math.PI);
      let currentSegIdx = 0;
      let cumAngle = 0;
      for (let i = 0; i < segments.length; i++) {
        cumAngle += segments[i].sweepAngle;
        if (normalizedAngle < cumAngle) {
          currentSegIdx = i;
          break;
        }
      }

      if (currentSegIdx !== lastCrossedSegmentRef.current) {
        lastCrossedSegmentRef.current = currentSegIdx;
        sound.playTick();
      }

      if (progress < 1) {
        animationIdRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winner = segments[selectedIndex];
        sound.playWinFanfare();
        onSpinEnd(winner);
      }
    };

    animationIdRef.current = requestAnimationFrame(animate);
  };

  // Keyboard shortcut for spinning (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, segments]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center p-4 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-8' : ''
      }`}
    >
      {/* Canvas Container */}
      <div className="relative group">
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none" />

        <canvas
          ref={canvasRef}
          width={420}
          height={420}
          onClick={spin}
          className="relative z-10 cursor-pointer max-w-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-transform active:scale-98"
        />
      </div>

      {/* Control Buttons */}
      <div className="mt-6 z-20 flex items-center gap-3">
        <button
          onClick={spin}
          disabled={isSpinning || segments.length === 0}
          className={`px-8 py-3.5 rounded-full font-bold text-lg text-white shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
            isSpinning
              ? 'bg-slate-700 cursor-not-allowed opacity-80'
              : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-cyan-500/25 ring-2 ring-cyan-400/50'
          }`}
        >
          {isSpinning ? (
            <>
              <RotateCcw className="w-5 h-5 animate-spin" />
              Spinning...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              SPIN WHEEL
            </>
          )}
        </button>

        <button
          onClick={() => sound.toggleMute()}
          title="Toggle Sound Effects"
          className="p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-full text-slate-300 hover:text-white backdrop-blur transition"
        >
          {sound.muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
        </button>

        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen Mode"
          className="p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-full text-slate-300 hover:text-white backdrop-blur transition"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Probability indicator below */}
      <div className="mt-3 text-xs text-slate-400 flex items-center gap-1.5 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">Space</kbd> or click wheel to spin
      </div>
    </div>
  );
};

// Helper function to darken/lighten hex color for 3D gradients
function adjustColorBrightness(hex: string, percent: number): string {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = ((num >> 8) & 0x00ff) + amt;
  let B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
