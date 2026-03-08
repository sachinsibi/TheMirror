import { Wifi, Activity, FlaskConical } from 'lucide-react';

type Status = 'connected' | 'stale' | 'disconnected';

interface Pill {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  detail: string;
  status: Status;
  extraRing?: boolean;
  ringPct?: number;
}

interface DataSourcePillsProps {
  onNavigateToProfile: () => void;
}

function StatusDot({ status }: { status: Status }) {
  const colors: Record<Status, string> = {
    connected: '#14B8A6',
    stale: '#F59E0B',
    disconnected: '#475569',
  };
  return (
    <span
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: colors[status],
        flexShrink: 0,
      }}
    />
  );
}

function RingProgress({ pct }: { pct: number }) {
  const r = 8;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <svg width={20} height={20} style={{ marginLeft: 4 }}>
      <circle cx={10} cy={10} r={r} fill="none" stroke="#1A1B25" strokeWidth={2} />
      <circle
        cx={10} cy={10} r={r}
        fill="none"
        stroke="#475569"
        strokeWidth={2}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 10 10)"
      />
    </svg>
  );
}

export default function DataSourcePills({ onNavigateToProfile }: DataSourcePillsProps) {
  const pills: Pill[] = [
    {
      icon: Wifi,
      label: 'Oura',
      detail: 'synced 2h ago',
      status: 'connected',
    },
    {
      icon: Activity,
      label: 'Dexcom',
      detail: 'live',
      status: 'connected',
    },
    {
      icon: FlaskConical,
      label: 'TruDiagnostic',
      detail: '43 days ago',
      status: 'connected',
      extraRing: true,
      ringPct: 1 - 43 / 90,
    },
  ];

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
      {pills.map((pill) => (
        <button
          key={pill.label}
          onClick={onNavigateToProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid #1A1B25',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            fontSize: 12,
            transition: 'border-color 150ms ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#2A2D40';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#1A1B25';
          }}
        >
          <StatusDot status={pill.status} />
          <pill.icon size={13} color="var(--color-text-tertiary)" />
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
            {pill.label}
          </span>
          <span style={{ color: 'var(--color-text-tertiary)' }}>·</span>
          <span>{pill.detail}</span>
          {pill.extraRing && <RingProgress pct={pill.ringPct ?? 0} />}
        </button>
      ))}
    </div>
  );
}
