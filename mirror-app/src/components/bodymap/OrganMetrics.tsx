import { ChevronRight } from 'lucide-react';

interface OrganDetail {
  id: string;
  name: string;
  age: number;
  pace: number;
  trend: 'improving' | 'stable' | 'worsening';
  topFactor: string;
  dataSource: string;
  color: string;
}

const TREND_DISPLAY = {
  improving: { label: '↓ Improving', color: '#14B8A6' },
  stable: { label: '→ Stable', color: '#A8A29E' },
  worsening: { label: '↑ Worsening', color: '#F59E0B' },
};

interface OrganMetricsProps {
  organ: OrganDetail;
  onClose: () => void;
  onNavigateToScoreboard: () => void;
}

export default function OrganMetrics({ organ, onNavigateToScoreboard }: OrganMetricsProps) {
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
            fontFamily: 'JetBrains Mono, monospace', fontSize: 36,
            fontWeight: 700, color: organ.color, lineHeight: 1,
          }}>
            ~{organ.age}
          </span>
          <span style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>years</span>
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

      {/* Top factor */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
          Top Contributing Factor
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
          {organ.topFactor}
        </div>
      </div>

      {/* Data source */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
          Data Source
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
          {organ.dataSource}
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={onNavigateToScoreboard}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          padding: '10px 14px', borderRadius: 6,
          background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
          color: '#A78BFA', fontSize: 12, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
          justifyContent: 'center',
        }}
      >
        See habits affecting {organ.name.toLowerCase()} aging <ChevronRight size={13} />
      </button>
    </div>
  );
}
