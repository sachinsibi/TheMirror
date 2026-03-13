import { useEffect, useRef, useState } from 'react';
import { paceToColor } from '../../engine/bridge';

interface PaceGaugeProps {
  pace: number;
  paceRange: { low: number; high: number };
  size?: 'full' | 'mini';
  animated?: boolean;
}

/* ─── color helpers ─── */
function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const ca = parse(a);
  const cb = parse(b);
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t);
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t);
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

function rayColor(t: number): string {
  // t: 0 = left (teal), 1 = right (amber)
  const stops = [
    { at: 0, color: '#14B8A6' },
    { at: 0.35, color: '#6DBDB4' },
    { at: 0.5, color: '#A8A29E' },
    { at: 0.65, color: '#D4A96A' },
    { at: 1, color: '#F59E0B' },
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t <= stops[i + 1].at) {
      const local = (t - stops[i].at) / (stops[i + 1].at - stops[i].at);
      return lerpColor(stops[i].color, stops[i + 1].color, local);
    }
  }
  return stops[stops.length - 1].color;
}

export default function PaceGauge({
  pace,
  paceRange,
  size = 'full',
  animated = true,
}: PaceGaugeProps) {
  const isMini = size === 'mini';
  const W = isMini ? 220 : 400;
  const H = isMini ? 150 : 270;
  const cx = W / 2;
  const cy = isMini ? 140 : 240;
  const R = isMini ? 80 : 140;

  const [displayPace, setDisplayPace] = useState(1.0);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const minPace = 0.5;
  const maxPace = 1.5;

  function paceToRad(p: number): number {
    const t = Math.max(0, Math.min(1, (p - minPace) / (maxPace - minPace)));
    // t=0 (slow/teal) → 180° left, t=1 (fast/amber) → 0° right
    const deg = (1 - t) * 180;
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

    const spring = (t: number) => {
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

  function polarToXY(angle: number, r: number) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle),
    };
  }

  // Needle
  const needleAngle = paceToRad(displayPace);
  const needleColor = paceToColor(displayPace);

  // Ray dimensions
  const rayInnerR = R + (isMini ? 10 : 16);
  const rayLongLen = isMini ? 22 : 38;
  const rayShortLen = isMini ? 8 : 14;
  // 6 segments across 180° (like 5-min marks on a clock) = 7 major positions
  // Fill between with minor rays
  const majorCount = 7; // 0°, 30°, 60°, 90°, 120°, 150°, 180°
  const minorPerSegment = isMini ? 3 : 4; // short rays between majors
  const totalRays = (majorCount - 1) * (minorPerSegment + 1) + 1;

  // Generate rays
  const rays = [];
  for (let i = 0; i < totalRays; i++) {
    const t = i / (totalRays - 1); // 0..1
    const angle = Math.PI - t * Math.PI; // 180°..0°
    const isMajorRay = i % (minorPerSegment + 1) === 0;
    const len = isMajorRay ? rayLongLen : rayShortLen;
    // Vary major length slightly: longest at top, shorter at sides
    const tFromCenter = Math.abs(t - 0.5) * 2;
    const lenFinal = isMajorRay ? len * (1.0 - tFromCenter * 0.3) : len;

    const inner = polarToXY(angle, rayInnerR);
    const outer = polarToXY(angle, rayInnerR + lenFinal);
    const color = rayColor(t);
    const opacity = isMajorRay ? (0.6 + (1.0 - tFromCenter) * 0.35) : 0.35;

    rays.push({ inner, outer, color, opacity, angle, t, isMajorRay });
  }

  // Fine tick marks along the arc
  const tickCount = isMini ? 30 : 50;
  const ticks = [];
  for (let i = 0; i <= tickCount; i++) {
    const t = i / tickCount;
    const angle = Math.PI - t * Math.PI;
    const isMajor = i % (isMini ? 6 : 10) === 0;
    const innerR = R - (isMini ? 3 : 5);
    const outerR = R + (isMajor ? (isMini ? 5 : 8) : (isMini ? 2 : 3));
    ticks.push({
      inner: polarToXY(angle, innerR),
      outer: polarToXY(angle, outerR),
      isMajor,
    });
  }

  // Bezel ring (thin circle outline, top half only)
  const bezelR = R + (isMini ? 6 : 10);
  const bezelStart = polarToXY(Math.PI, bezelR);
  const bezelEnd = polarToXY(0, bezelR);
  const bezelPath = `M ${bezelStart.x} ${bezelStart.y} A ${bezelR} ${bezelR} 0 0 1 ${bezelEnd.x} ${bezelEnd.y}`;

  // Inner bezel
  const innerBezelR = R - (isMini ? 5 : 8);
  const innerBezelStart = polarToXY(Math.PI, innerBezelR);
  const innerBezelEnd = polarToXY(0, innerBezelR);
  const innerBezelPath = `M ${innerBezelStart.x} ${innerBezelStart.y} A ${innerBezelR} ${innerBezelR} 0 0 1 ${innerBezelEnd.x} ${innerBezelEnd.y}`;

  // Needle geometry
  const needleTipR = R - (isMini ? 12 : 18);
  const needleTip = polarToXY(needleAngle, needleTipR);
  const gradientId = `gauge-gradient-${size}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width={W}
        height={H}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="30%" stopColor="#6DBDB4" />
            <stop offset="50%" stopColor="#A8A29E" />
            <stop offset="70%" stopColor="#D4A96A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <filter id={`ray-glow-${size}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Radiating rays */}
        {rays.map((ray, i) => (
          <line
            key={`ray-${i}`}
            x1={ray.inner.x} y1={ray.inner.y}
            x2={ray.outer.x} y2={ray.outer.y}
            stroke={ray.color}
            strokeWidth={ray.isMajorRay ? (isMini ? 1.5 : 2.5) : (isMini ? 1 : 1.5)}
            strokeLinecap="round"
            opacity={ray.opacity}
          />
        ))}


        {/* Outer bezel ring */}
        <path
          d={bezelPath}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={isMini ? 1 : 1.5}
        />

        {/* Inner bezel ring */}
        <path
          d={innerBezelPath}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={isMini ? 0.5 : 1}
        />

        {/* Fine tick marks */}
        {ticks.map((tick, i) => (
          <line
            key={`tick-${i}`}
            x1={tick.inner.x} y1={tick.inner.y}
            x2={tick.outer.x} y2={tick.outer.y}
            stroke={tick.isMajor ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.10)'}
            strokeWidth={tick.isMajor ? 1.5 : 0.5}
          />
        ))}

        {/* Colored arc track (between bezels) */}
        {(() => {
          const arcR = R;
          const arcStart = polarToXY(Math.PI, arcR);
          const arcEnd = polarToXY(0, arcR);
          const arcPath = `M ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 0 1 ${arcEnd.x} ${arcEnd.y}`;
          return (
            <path
              d={arcPath}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={isMini ? 3 : 5}
              strokeLinecap="round"
              opacity={0.35}
            />
          );
        })()}

        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needleTip.x} y2={needleTip.y}
          stroke={needleColor}
          strokeWidth={isMini ? 2 : 3}
          strokeLinecap="round"
          opacity={0.9}
        />

        {/* Center dot */}
        <circle
          cx={cx} cy={cy}
          r={isMini ? 4 : 7}
          fill="var(--color-bg-raised)"
          stroke={needleColor}
          strokeWidth={isMini ? 1.5 : 2}
        />

        {/* Labels — positioned outside the rays */}
        {!isMini && (() => {
          const labelR = rayInnerR + rayLongLen + 22;
          const leftLabel = polarToXY(Math.PI, labelR);
          const topLabel = polarToXY(Math.PI / 2, labelR);
          const rightLabel = polarToXY(0, labelR);
          return (
            <>
              <text x={leftLabel.x} y={leftLabel.y + 5} fill="rgba(255,255,255,0.6)" fontSize={13} fontWeight={600} textAnchor="middle" fontFamily="JetBrains Mono, monospace">0.5×</text>
              <text x={topLabel.x} y={topLabel.y - 6} fill="rgba(255,255,255,0.6)" fontSize={13} fontWeight={600} textAnchor="middle" fontFamily="JetBrains Mono, monospace">1.0×</text>
              <text x={rightLabel.x} y={rightLabel.y + 5} fill="rgba(255,255,255,0.6)" fontSize={13} fontWeight={600} textAnchor="middle" fontFamily="JetBrains Mono, monospace">1.5×</text>
            </>
          );
        })()}
      </svg>

      {/* Pace number */}
      <div
        style={{
          marginTop: isMini ? 0 : 4,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: isMini ? 28 : 52,
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
          marginTop: isMini ? 4 : 6,
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
