import { useMemo } from 'react';

// The 5 biological systems
const SYSTEMS = [
  { id: 'neurological', label: 'Neurological' },
  { id: 'cardiovascular', label: 'Cardio' },
  { id: 'metabolic', label: 'Metabolic' },
  { id: 'endocrine', label: 'Endocrine' },
  { id: 'immune', label: 'Immune' },
] as const;

// Current biological ages (from BodyMap organ data)
const CURRENT_AGES: Record<string, number> = {
  neurological: 56.4,
  cardiovascular: 55.8,
  metabolic: 60.1,
  endocrine: 57.0,
  immune: 58.3,
};

// How each intervention affects each system (reduction in biological age years)
// Based on the physiological logic described in HABIT_DETAILS
const INTERVENTION_EFFECTS: Record<string, Record<string, number>> = {
  'post-meal-walks': {
    neurological: 0.1,
    cardiovascular: 0.3,
    metabolic: 1.8,
    endocrine: 0.2,
    immune: 0.4,
  },
  'sleep-consistency': {
    neurological: 1.4,
    cardiovascular: 0.4,
    metabolic: 0.3,
    endocrine: 1.2,
    immune: 0.5,
  },
  'dietary-changes': {
    neurological: 0.2,
    cardiovascular: 0.4,
    metabolic: 1.6,
    endocrine: 0.5,
    immune: 0.6,
  },
  'zone2-cardio': {
    neurological: 0.2,
    cardiovascular: 1.5,
    metabolic: 0.6,
    endocrine: 0.3,
    immune: 0.3,
  },
  'time-restricted-eating': {
    neurological: 0.1,
    cardiovascular: 0.2,
    metabolic: 0.8,
    endocrine: 0.7,
    immune: 0.3,
  },
  'strength-training': {
    neurological: 0.2,
    cardiovascular: 0.6,
    metabolic: 1.0,
    endocrine: 0.4,
    immune: 0.3,
  },
  'stress-reduction': {
    neurological: 0.8,
    cardiovascular: 0.3,
    metabolic: 0.2,
    endocrine: 0.9,
    immune: 0.4,
  },
};

// Normalize ages to 0–1 scale for radar (lower age = better = further out)
// We use: score = 1 - (age - minAge) / (maxAge - minAge)
// where minAge = best possible, maxAge = worst baseline
const MIN_AGE = 53; // best possible bio age for display
const MAX_AGE = 62; // worst for display

function ageToScore(age: number): number {
  return Math.max(0.1, Math.min(1, 1 - (age - MIN_AGE) / (MAX_AGE - MIN_AGE)));
}

interface SystemRadarProps {
  selectedIds: string[];
}

export default function SystemRadar({ selectedIds }: SystemRadarProps) {
  const cx = 155;
  const cy = 125;
  const maxR = 88;
  const levels = 3;
  const n = SYSTEMS.length;

  // Compute projected ages with diminishing returns for multiple interventions
  const projectedAges = useMemo(() => {
    const result: Record<string, number> = { ...CURRENT_AGES };
    if (selectedIds.length === 0) return result;

    for (const sysId of Object.keys(result)) {
      let totalReduction = 0;
      for (const intId of selectedIds) {
        const effects = INTERVENTION_EFFECTS[intId];
        if (effects && effects[sysId]) {
          totalReduction += effects[sysId];
        }
      }
      // Diminishing returns: cap at 70% of total for multiple interventions
      const factor = selectedIds.length > 1 ? 0.7 : 1.0;
      result[sysId] = Math.max(MIN_AGE, CURRENT_AGES[sysId] - totalReduction * factor);
    }
    return result;
  }, [selectedIds]);

  const hasProjection = selectedIds.length > 0;

  // Angle for each vertex (starting from top, going clockwise)
  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const pointAt = (i: number, r: number): [number, number] => {
    const a = angleFor(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };

  const polygonPoints = (scores: number[]) =>
    scores.map((s, i) => pointAt(i, s * maxR).join(',')).join(' ');

  const currentScores = SYSTEMS.map(s => ageToScore(CURRENT_AGES[s.id]));
  const projectedScores = SYSTEMS.map(s => ageToScore(projectedAges[s.id]));

  return (
    <div>
      <svg width={300} height={255} viewBox="0 0 300 255">
        {/* Grid levels */}
        {Array.from({ length: levels }, (_, li) => {
          const r = maxR * ((li + 1) / levels);
          const pts = SYSTEMS.map((_, i) => pointAt(i, r).join(',')).join(' ');
          return (
            <polygon
              key={li}
              points={pts}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {SYSTEMS.map((_, i) => {
          const [x, y] = pointAt(i, maxR);
          return (
            <line
              key={i}
              x1={cx} y1={cy} x2={x} y2={y}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={1}
            />
          );
        })}

        {/* Level labels */}
        {Array.from({ length: levels }, (_, li) => {
          const r = maxR * ((li + 1) / levels);
          const age = MAX_AGE - ((li + 1) / levels) * (MAX_AGE - MIN_AGE);
          return (
            <text
              key={li}
              x={cx + 4}
              y={cy - r + 4}
              fontSize={8}
              fill="rgba(255,255,255,0.2)"
              fontFamily="JetBrains Mono, monospace"
            >
              {age.toFixed(0)}y
            </text>
          );
        })}

        {/* Projected polygon (teal) — drawn first so current overlaps */}
        {hasProjection && (
          <>
            <polygon
              points={polygonPoints(projectedScores)}
              fill="rgba(20,184,166,0.12)"
              stroke="#14B8A6"
              strokeWidth={2}
              style={{ transition: 'all 400ms ease' }}
            />
            {projectedScores.map((s, i) => {
              const [x, y] = pointAt(i, s * maxR);
              return (
                <circle
                  key={`proj-${i}`}
                  cx={x} cy={y} r={4}
                  fill="#14B8A6"
                  stroke="#0A0B0F"
                  strokeWidth={1.5}
                  style={{ transition: 'cx 400ms ease, cy 400ms ease' }}
                />
              );
            })}
          </>
        )}

        {/* Current polygon (amber) */}
        <polygon
          points={polygonPoints(currentScores)}
          fill="rgba(245,158,11,0.10)"
          stroke="#F59E0B"
          strokeWidth={2}
        />
        {currentScores.map((s, i) => {
          const [x, y] = pointAt(i, s * maxR);
          return (
            <circle
              key={`cur-${i}`}
              cx={x} cy={y} r={4}
              fill="#F59E0B"
              stroke="#0A0B0F"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Axis labels */}
        {SYSTEMS.map((sys, i) => {
          const a = angleFor(i);
          const labelR = maxR + 22;
          const x = cx + labelR * Math.cos(a);
          const y = cy + labelR * Math.sin(a);
          const anchor = Math.abs(Math.cos(a)) < 0.1 ? 'middle'
            : Math.cos(a) > 0 ? 'start' : 'end';

          return (
            <text
              key={sys.id}
              x={x}
              y={y + 4}
              textAnchor={anchor}
              fontSize={10}
              fontWeight={600}
              fill="rgba(255,255,255,0.5)"
              fontFamily="Inter, sans-serif"
            >
              {sys.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 3, borderRadius: 1, background: '#F59E0B' }} />
          <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>Current</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: hasProjection ? 1 : 0.35 }}>
          <div style={{ width: 10, height: 3, borderRadius: 1, background: '#14B8A6' }} />
          <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>Projected</span>
        </div>
      </div>
    </div>
  );
}
