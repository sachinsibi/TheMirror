
interface OrganDetail {
  id: string;
  name: string;
  age: number;
  ageRange: { low: number; high: number };
  pace: number;
  trend: 'improving' | 'stable' | 'worsening';
  factors: string[];
  dataSource: string;
  color: string;
}

const TREND_DISPLAY = {
  improving: { label: 'Improving', color: '#22C55E' },
  stable: { label: 'Stable', color: '#A8A29E' },
  worsening: { label: 'Worsening', color: '#F59E0B' },
};

interface OrganMetricsProps {
  organ: OrganDetail;
  onClose: () => void;
  onNavigateToProjections: () => void;
}

export default function OrganMetrics({ organ }: OrganMetricsProps) {
  const trend = TREND_DISPLAY[organ.trend];

  return (
    <div className="bodymap-organ-metrics">
      {/* System name + color dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: organ.color, boxShadow: `0 0 8px ${organ.color}`,
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
          fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' as const,
          color: 'rgba(0,230,240,0.9)',
        }}>
          {organ.name} System
        </span>
      </div>

      {/* Bio age — large */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
          Biological Age
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 32,
            fontWeight: 700, color: organ.color, lineHeight: 1,
          }}>
            {organ.ageRange.low}–{organ.ageRange.high}
          </span>
          <span style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>years</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 3 }}>
          estimated range (95% CI)
        </div>
      </div>

      {/* Pace + Trend row */}
      <div style={{
        display: 'flex', gap: 24, marginBottom: 16,
        paddingBottom: 14, borderBottom: '1px solid rgba(0,200,220,0.1)',
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
            Pace
          </div>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 16,
            fontWeight: 600, color: organ.color,
          }}>
            {organ.pace.toFixed(2)}×
          </span>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
            30-day Trend
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: trend.color }}>
            {trend.label}
          </span>
        </div>
      </div>

      {/* Contributing factors */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
          Contributing Factors
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {organ.factors.map((factor, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: 'rgba(0,200,220,0.4)', fontSize: 11, flexShrink: 0, marginTop: 2, lineHeight: 1 }}>▸</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.55 }}>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Data source */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
          Data Source
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
          {organ.dataSource.includes(' · ') ? organ.dataSource.split(' · ').slice(1).join(' · ') : organ.dataSource}
        </div>
      </div>
    </div>
  );
}
