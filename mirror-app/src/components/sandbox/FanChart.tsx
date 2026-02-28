import { useEffect, useState } from 'react';
import { getCurrentPath, getInterventionPath, type FanChartPoint } from '../../engine/bridge';
import { USER } from '../../data/synthetic';

interface FanChartProps {
  interventionPace: number | null;
}

const W = 580;
const H = 300;
const PADDING = { top: 20, right: 80, bottom: 40, left: 50 };

const CHART_W = W - PADDING.left - PADDING.right;
const CHART_H = H - PADDING.top - PADDING.bottom;

const MONTHS = [0, 3, 6, 12, 24];
const MAX_MONTHS = 24;

function scaleX(month: number): number {
  return PADDING.left + (month / MAX_MONTHS) * CHART_W;
}

function scaleY(age: number, minAge: number, maxAge: number): number {
  return PADDING.top + CHART_H - ((age - minAge) / (maxAge - minAge)) * CHART_H;
}

function buildAreaPath(points: FanChartPoint[], low: keyof FanChartPoint, high: keyof FanChartPoint, minAge: number, maxAge: number): string {
  const topPath = points.map((p, i) => {
    const x = scaleX(p.month);
    const y = scaleY(p[high] as number, minAge, maxAge);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const bottomPath = [...points].reverse().map((p) => {
    const x = scaleX(p.month);
    const y = scaleY(p[low] as number, minAge, maxAge);
    return `L ${x} ${y}`;
  }).join(' ');

  return `${topPath} ${bottomPath} Z`;
}

function buildLinePath(points: FanChartPoint[], key: keyof FanChartPoint, minAge: number, maxAge: number): string {
  return points.map((p, i) => {
    const x = scaleX(p.month);
    const y = scaleY(p[key] as number, minAge, maxAge);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
}

export default function FanChart({ interventionPace }: FanChartProps) {
  const currentPath = getCurrentPath(USER.biologicalAge);
  const interventionPath = interventionPace !== null
    ? getInterventionPath(USER.biologicalAge, interventionPace)
    : null;

  const [showIntervention, setShowIntervention] = useState(false);
  const [interventionOpacity, setInterventionOpacity] = useState(0);

  useEffect(() => {
    if (interventionPath) {
      const t1 = setTimeout(() => setShowIntervention(true), 150);
      const t2 = setTimeout(() => setInterventionOpacity(1), 200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setInterventionOpacity(0);
      const t = setTimeout(() => setShowIntervention(false), 400);
      return () => clearTimeout(t);
    }
  }, [interventionPace]);

  // Compute y scale range
  const allAges = currentPath.flatMap(p => [p.band90Low, p.band90High]);
  if (interventionPath) {
    allAges.push(...interventionPath.flatMap(p => [p.band90Low, p.band90High]));
  }
  const minAge = Math.floor(Math.min(...allAges)) - 0.5;
  const maxAge = Math.ceil(Math.max(...allAges)) + 0.5;

  // Y grid lines
  const yTicks: number[] = [];
  for (let a = Math.ceil(minAge); a <= Math.floor(maxAge); a++) {
    yTicks.push(a);
  }

  const checkpointX = scaleX(6);

  // Outcome callout for current path (month 24)
  const lastCurrent = currentPath[currentPath.length - 1];
  const lastIntervention = interventionPath?.[interventionPath.length - 1];

  return (
    <div>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        {/* Y grid lines */}
        {yTicks.map(a => (
          <line
            key={a}
            x1={PADDING.left}
            y1={scaleY(a, minAge, maxAge)}
            x2={W - PADDING.right}
            y2={scaleY(a, minAge, maxAge)}
            stroke="#1A1B25"
            strokeWidth={1}
          />
        ))}

        {/* Checkpoint line */}
        <line
          x1={checkpointX}
          y1={PADDING.top}
          x2={checkpointX}
          y2={H - PADDING.bottom}
          stroke="#2A2D40"
          strokeWidth={1}
          strokeDasharray="4,3"
        />
        <text x={checkpointX + 4} y={PADDING.top + 12} fill="#475569" fontSize={11}>
          Next test
        </text>

        {/* Intervention path — bands */}
        {showIntervention && interventionPath && (
          <g style={{ opacity: interventionOpacity, transition: 'opacity 400ms ease' }}>
            <path
              d={buildAreaPath(interventionPath, 'band90Low', 'band90High', minAge, maxAge)}
              fill="rgba(20,184,166,0.08)"
            />
            <path
              d={buildAreaPath(interventionPath, 'band50Low', 'band50High', minAge, maxAge)}
              fill="rgba(20,184,166,0.18)"
            />
            <path
              d={buildLinePath(interventionPath, 'center', minAge, maxAge)}
              fill="none"
              stroke="#14B8A6"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Current path — bands */}
        <path
          d={buildAreaPath(currentPath, 'band90Low', 'band90High', minAge, maxAge)}
          fill="rgba(245,158,11,0.08)"
        />
        <path
          d={buildAreaPath(currentPath, 'band50Low', 'band50High', minAge, maxAge)}
          fill="rgba(245,158,11,0.18)"
        />
        <path
          d={buildLinePath(currentPath, 'center', minAge, maxAge)}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* X axis labels */}
        {MONTHS.map(m => (
          <text
            key={m}
            x={scaleX(m)}
            y={H - PADDING.bottom + 18}
            fill="#475569"
            fontSize={11}
            textAnchor="middle"
          >
            {m === 0 ? 'Now' : `${m}mo`}
          </text>
        ))}

        {/* Y axis label */}
        <text
          x={PADDING.left - 8}
          y={PADDING.top + CHART_H / 2}
          fill="#475569"
          fontSize={11}
          textAnchor="middle"
          transform={`rotate(-90, ${PADDING.left - 32}, ${PADDING.top + CHART_H / 2})`}
        >
          Biological Age
        </text>

        {/* Y tick labels */}
        {yTicks.filter((_, i) => i % 2 === 0).map(a => (
          <text
            key={a}
            x={PADDING.left - 8}
            y={scaleY(a, minAge, maxAge) + 4}
            fill="#475569"
            fontSize={10}
            textAnchor="end"
          >
            {a}
          </text>
        ))}

        {/* Outcome callout — current */}
        <text
          x={scaleX(24) + 6}
          y={scaleY(lastCurrent.center, minAge, maxAge)}
          fill="#F59E0B"
          fontSize={12}
          fontWeight={600}
          dominantBaseline="middle"
        >
          {lastCurrent.band50Low.toFixed(1)}–{lastCurrent.band50High.toFixed(1)}
        </text>

        {/* Outcome callout — intervention */}
        {showIntervention && lastIntervention && (
          <text
            x={scaleX(24) + 6}
            y={scaleY(lastIntervention.center, minAge, maxAge)}
            fill="#14B8A6"
            fontSize={12}
            fontWeight={600}
            dominantBaseline="middle"
            style={{ opacity: interventionOpacity, transition: 'opacity 400ms ease' }}
          >
            {lastIntervention.band50Low.toFixed(1)}–{lastIntervention.band50High.toFixed(1)}
          </text>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 12, paddingLeft: PADDING.left }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 2, background: '#F59E0B', borderRadius: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Current habits</span>
        </div>
        {showIntervention && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: interventionOpacity, transition: 'opacity 400ms ease' }}>
            <div style={{ width: 20, height: 2, background: '#14B8A6', borderRadius: 1 }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>With intervention</span>
          </div>
        )}
      </div>
    </div>
  );
}
