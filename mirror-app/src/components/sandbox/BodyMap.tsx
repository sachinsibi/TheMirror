import { useEffect, useState } from 'react';
import { type ORGAN_SCORES } from '../../data/synthetic';

type OrganScores = typeof ORGAN_SCORES.current;

interface BodyMapProps {
  organScores: OrganScores;
  onZoneClick?: (zoneId: string) => void;
  selectedZoneId?: string;
}

interface ZoneConfig {
  id: keyof OrganScores;
  label: string;
  // SVG path for zone overlay
  d: string;
  labelX: number;
  labelY: number;
}

const ZONES: ZoneConfig[] = [
  {
    id: 'cardiovascular',
    label: 'Cardiovascular',
    d: 'M 90 95 Q 100 80 110 85 L 115 130 Q 100 135 85 130 Z',
    labelX: 50,
    labelY: 108,
  },
  {
    id: 'metabolic',
    label: 'Metabolic',
    d: 'M 82 135 Q 100 138 118 135 L 120 185 Q 100 188 80 185 Z',
    labelX: 50,
    labelY: 158,
  },
  {
    id: 'hepatic',
    label: 'Hepatic',
    d: 'M 100 138 L 118 138 L 118 165 Q 108 165 100 158 Z',
    labelX: 130,
    labelY: 150,
  },
  {
    id: 'immune',
    label: 'Immune',
    d: 'M 85 70 Q 100 60 115 70 L 120 95 Q 100 98 80 95 Z',
    labelX: 130,
    labelY: 80,
  },
];

function lerp(a: string, b: string, t: number): string {
  // Parse hex to rgb and interpolate
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  if (!pa || !pb) return b;
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return `rgb(${r},${g},${bl})`;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

export default function BodyMap({ organScores, onZoneClick, selectedZoneId }: BodyMapProps) {
  const [displayColors, setDisplayColors] = useState<Record<string, string>>(() => {
    const colors: Record<string, string> = {};
    ZONES.forEach(z => { colors[z.id] = organScores[z.id].color; });
    return colors;
  });

  const [breathePhase, setBreathePhase] = useState(0);

  // Animate color transitions when organScores change
  useEffect(() => {
    const targetColors: Record<string, string> = {};
    ZONES.forEach(z => { targetColors[z.id] = organScores[z.id].color; });

    const start = performance.now();
    const duration = 800;
    const startColors = { ...displayColors };

    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic

      const next: Record<string, string> = {};
      ZONES.forEach(z => {
        next[z.id] = lerp(startColors[z.id], targetColors[z.id], eased);
      });
      setDisplayColors(next);

      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [organScores]);

  // Breathing animation
  useEffect(() => {
    let raf: number;
    const animate = (now: number) => {
      setBreathePhase(now / 1000);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const zoneOpacity = (zoneIdx: number) => {
    const offset = zoneIdx * 0.8;
    return 0.3 + 0.15 * Math.sin((breathePhase * (2 * Math.PI) / 3) + offset);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width={200}
        height={380}
        viewBox="0 0 200 380"
        style={{ overflow: 'visible' }}
      >
        {/* Body silhouette */}
        {/* Head */}
        <ellipse cx={100} cy={40} rx={22} ry={26} fill="#1A1B25" stroke="#2A2D40" strokeWidth={1} />
        {/* Neck */}
        <rect x={91} y={64} width={18} height={14} rx={4} fill="#1A1B25" stroke="#2A2D40" strokeWidth={1} />
        {/* Torso */}
        <path
          d="M 68 78 Q 60 90 62 145 Q 65 185 75 200 Q 100 205 125 200 Q 135 185 138 145 Q 140 90 132 78 Q 116 72 100 72 Q 84 72 68 78 Z"
          fill="#1A1B25"
          stroke="#2A2D40"
          strokeWidth={1}
        />
        {/* Left arm */}
        <path
          d="M 68 82 Q 48 92 44 140 Q 44 155 52 160 Q 58 162 62 155 Q 60 145 62 120 Q 64 100 70 88 Z"
          fill="#1A1B25"
          stroke="#2A2D40"
          strokeWidth={1}
        />
        {/* Right arm */}
        <path
          d="M 132 82 Q 152 92 156 140 Q 156 155 148 160 Q 142 162 138 155 Q 140 145 138 120 Q 136 100 130 88 Z"
          fill="#1A1B25"
          stroke="#2A2D40"
          strokeWidth={1}
        />
        {/* Left leg */}
        <path
          d="M 75 200 Q 72 240 70 280 Q 70 310 78 320 Q 86 325 90 318 Q 88 300 88 270 Q 90 245 94 220 Q 90 205 75 200 Z"
          fill="#1A1B25"
          stroke="#2A2D40"
          strokeWidth={1}
        />
        {/* Right leg */}
        <path
          d="M 125 200 Q 128 240 130 280 Q 130 310 122 320 Q 114 325 110 318 Q 112 300 112 270 Q 110 245 106 220 Q 110 205 125 200 Z"
          fill="#1A1B25"
          stroke="#2A2D40"
          strokeWidth={1}
        />

        {/* Organ zone overlays */}
        {ZONES.map((zone, idx) => {
          const isSelected = selectedZoneId === zone.id;
          return (
            <g key={zone.id}>
              {/* Larger invisible hit area for easier clicking */}
              <path
                d={zone.d}
                fill="transparent"
                stroke="none"
                strokeWidth={12}
                style={{ cursor: onZoneClick ? 'pointer' : 'default' }}
                onClick={() => onZoneClick?.(zone.id)}
              />
              <path
                d={zone.d}
                fill={displayColors[zone.id] ?? '#A8A29E'}
                opacity={isSelected ? 0.75 : zoneOpacity(idx)}
                stroke={isSelected ? (displayColors[zone.id] ?? '#A8A29E') : 'none'}
                strokeWidth={isSelected ? 1.5 : 0}
                style={{ transition: 'fill 50ms, opacity 150ms', cursor: onZoneClick ? 'pointer' : 'default', pointerEvents: 'none' }}
              />
            </g>
          );
        })}

        {/* Zone labels (sidebar style) */}
        {ZONES.map(zone => (
          <g key={`label-${zone.id}`}>
            <line
              x1={zone.labelX > 100 ? zone.labelX - 4 : zone.labelX + 44}
              y1={zone.labelY}
              x2={zone.labelX > 100 ? zone.labelX - 18 : zone.labelX + 22}
              y2={zone.labelY}
              stroke="#2A2D40"
              strokeWidth={1}
            />
            <text
              x={zone.labelX > 100 ? zone.labelX - 6 : zone.labelX + 46}
              y={zone.labelY + 4}
              fill="var(--color-text-tertiary)"
              fontSize={9}
              textAnchor={zone.labelX > 100 ? 'end' : 'start'}
            >
              {zone.label}
            </text>
            <text
              x={zone.labelX > 100 ? zone.labelX - 6 : zone.labelX + 46}
              y={zone.labelY + 14}
              fill={displayColors[zone.id] ?? '#A8A29E'}
              fontSize={9}
              textAnchor={zone.labelX > 100 ? 'end' : 'start'}
              fontFamily="JetBrains Mono, monospace"
            >
              {/* organic aging pace */}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
