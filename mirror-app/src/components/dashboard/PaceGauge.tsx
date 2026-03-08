import { useEffect, useRef, useState } from 'react';
import { paceToColor } from '../../engine/bridge';

interface PaceGaugeProps {
  pace: number;
  paceRange: { low: number; high: number };
  size?: 'full' | 'mini';
  animated?: boolean;
}

export default function PaceGauge({
  pace,
  paceRange,
  size = 'full',
  animated = true,
}: PaceGaugeProps) {
  const isMini = size === 'mini';
  const W = isMini ? 220 : 400;
  const H = isMini ? 130 : 230;
  const cx = W / 2;
  const cy = isMini ? 130 : 210;
  const R = isMini ? 90 : 160;
  const strokeW = isMini ? 14 : 24;

  const [displayPace, setDisplayPace] = useState(1.0);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Convert pace to angle (0° = teal right, 180° = amber left)
  // Gauge arc goes from 180° (left) to 0° (right)
  // pace 0.8 (very slow aging) → rightmost (teal, 0°)
  // pace 1.3 (very fast aging) → leftmost (amber, 180°)
  const minPace = 0.8;
  const maxPace = 1.3;

  function paceToRad(p: number): number {
    const t = Math.max(0, Math.min(1, (p - minPace) / (maxPace - minPace)));
    // t=0 (slow/teal) → 0° right, t=1 (fast/amber) → 180° left
    const deg = t * 180; // 0→180°
    return (deg * Math.PI) / 180;
  }

  // Spring animation toward target
  useEffect(() => {
    if (!animated) {
      setDisplayPace(pace);
      return;
    }

    const duration = 900;
    const startPace = displayPace;
    const targetPace = pace;
    const startTime = performance.now();
    startTimeRef.current = startTime;

    // Spring params: slight overshoot
    const spring = (t: number) => {
      // cubic-bezier(0.34, 1.56, 0.64, 1) approximation
      const s = 1.56;
      return 1 - Math.exp(-6 * t) * Math.cos(2 * Math.PI * s * t / 2);
    };

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = spring(t);
      const current = startPace + (targetPace - startPace) * eased;
      setDisplayPace(current);
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayPace(targetPace);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [pace]);

  // Arc drawing
  const startAngle = Math.PI; // 180° = left
  const endAngle = 0;         // 0° = right

  function polarToXY(angle: number, r: number) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle),
    };
  }

  const arcStart = polarToXY(startAngle, R);
  const arcEnd = polarToXY(endAngle, R);

  // Full arc path for background
  const bgArcPath = `M ${arcStart.x} ${arcStart.y} A ${R} ${R} 0 0 1 ${arcEnd.x} ${arcEnd.y}`;

  // Needle
  const needleAngle = paceToRad(displayPace);
  const needleLen = R - strokeW / 2;
  const needleX = cx + needleLen * Math.cos(needleAngle);
  const needleY = cy - needleLen * Math.sin(needleAngle);
  const needleBase1X = cx + 8 * Math.cos(needleAngle + Math.PI / 2);
  const needleBase1Y = cy - 8 * Math.sin(needleAngle + Math.PI / 2);
  const needleBase2X = cx + 8 * Math.cos(needleAngle - Math.PI / 2);
  const needleBase2Y = cy - 8 * Math.sin(needleAngle - Math.PI / 2);

  const needleColor = paceToColor(displayPace);

  // Gradient stops for arc
  const gradientId = `gauge-gradient-${size}`;
  const glowId = `gauge-glow-${size}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width={W}
        height={H}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="30%" stopColor="#D4A96A" />
            <stop offset="50%" stopColor="#A8A29E" />
            <stop offset="70%" stopColor="#6DBDB4" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation={isMini ? "3" : "5"} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background arc track */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="#1A1B25"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />

        {/* Colored arc */}
        <path
          d={bgArcPath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeW}
          strokeLinecap="round"
          opacity={0.85}
        />

        {/* Needle glow */}
        <circle
          cx={needleX}
          cy={needleY}
          r={isMini ? 12 : 20}
          fill={needleColor}
          opacity={0.12}
        />

        {/* Needle */}
        <polygon
          points={`${needleX},${needleY} ${needleBase1X},${needleBase1Y} ${needleBase2X},${needleBase2Y}`}
          fill={needleColor}
          opacity={0.95}
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={isMini ? 5 : 8} fill="var(--color-bg-raised)" stroke={needleColor} strokeWidth={2} />

        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const tickAngle = Math.PI - t * Math.PI;
          const inner = polarToXY(tickAngle, R - strokeW / 2 - 4);
          const outer = polarToXY(tickAngle, R + strokeW / 2 + 4);
          return (
            <line
              key={t}
              x1={inner.x} y1={inner.y}
              x2={outer.x} y2={outer.y}
              stroke="#2A2D40"
              strokeWidth={1}
            />
          );
        })}

        {/* Labels */}
        {!isMini && (
          <>
            <text x={cx - R - strokeW} y={cy + 20} fill="var(--color-text-tertiary)" fontSize={11} textAnchor="middle">1.3×</text>
            <text x={cx} y={cy - R - strokeW - 8} fill="var(--color-text-tertiary)" fontSize={11} textAnchor="middle">1.0×</text>
            <text x={cx + R + strokeW} y={cy + 20} fill="var(--color-text-tertiary)" fontSize={11} textAnchor="middle">0.8×</text>
          </>
        )}
      </svg>

      {/* Pace number */}
      <div
        style={{
          marginTop: isMini ? 4 : 16,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: isMini ? 28 : 56,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          color: needleColor,
          lineHeight: 1,
        }}
      >
        {displayPace.toFixed(2)}×
      </div>

      {/* Range */}
      <div
        style={{
          marginTop: isMini ? 4 : 8,
          fontSize: isMini ? 11 : 13,
          color: 'var(--color-text-tertiary)',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        {paceRange.low.toFixed(2)}×–{paceRange.high.toFixed(2)}×
      </div>
    </div>
  );
}
