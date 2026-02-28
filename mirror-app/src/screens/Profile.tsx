import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Upload, Wifi, Activity, FlaskConical } from 'lucide-react';
import { USER, DATA_SOURCES } from '../data/synthetic';

type Section = 'wearable' | 'cgm' | 'epigenetic' | null;

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: connected ? '#14B8A6' : '#475569',
        flexShrink: 0,
      }}
    />
  );
}

function DataSourceCard({
  title,
  Icon,
  connected,
  collapsed,
  onToggle,
  children,
  summary,
}: {
  title: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
  connected: boolean;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  summary: string;
}) {
  return (
    <div style={{ background: 'var(--color-bg-surface)', borderRadius: 8, border: '1px solid #1A1B25', overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <StatusDot connected={connected} />
        <Icon size={18} color="var(--color-text-tertiary)" />
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', flex: 1, textAlign: 'left' }}>
          {title}
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginRight: 8 }}>{summary}</span>
        {collapsed ? <ChevronDown size={16} color="var(--color-text-tertiary)" /> : <ChevronUp size={16} color="var(--color-text-tertiary)" />}
      </button>

      {!collapsed && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #1A1B25', paddingTop: 16 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function DataFlowViz() {
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const animate = (now: number) => {
      setPhase(now / 1000);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Three input lines converging to center node
  const inputs = [
    { label: 'Wearable', y: 40, speed: 1.2, color: '#14B8A6' },
    { label: 'CGM', y: 80, speed: 0.8, color: '#14B8A6' },
    { label: 'Epigenetic', y: 120, speed: 0.3, color: '#8B5CF6' },
  ];

  const W = 480;
  const centerX = 240;
  const outputX = 380;

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Data Flow
      </h3>
      <svg width={W} height={160} style={{ overflow: 'visible' }}>
        {inputs.map((input) => {
          const startX = 10;
          const endX = centerX - 20;

          // Animated particle position
          const particleT = (phase * input.speed) % 1;

          return (
            <g key={input.label}>
              {/* Input line */}
              <line
                x1={startX}
                y1={input.y}
                x2={endX}
                y2={80}
                stroke="#2A2D40"
                strokeWidth={1}
              />
              {/* Particle */}
              <circle
                cx={startX + particleT * (endX - startX)}
                cy={input.y + particleT * (80 - input.y)}
                r={3}
                fill={input.color}
                opacity={0.9}
              />
              {/* Second particle with offset */}
              <circle
                cx={startX + ((particleT + 0.4) % 1) * (endX - startX)}
                cy={input.y + ((particleT + 0.4) % 1) * (80 - input.y)}
                r={2.5}
                fill={input.color}
                opacity={0.5}
              />
              {/* Label */}
              <text x={startX - 4} y={input.y + 4} fill="var(--color-text-tertiary)" fontSize={11} textAnchor="end">
                {input.label}
              </text>
            </g>
          );
        })}

        {/* Central node */}
        <circle cx={centerX} cy={80} r={24} fill="var(--color-bg-raised)" stroke="var(--color-violet)" strokeWidth={1.5} />
        <circle
          cx={centerX}
          cy={80}
          r={30}
          fill="none"
          stroke="var(--color-violet)"
          strokeWidth={1}
          opacity={0.2 + 0.15 * Math.sin(phase * 2)}
        />
        <text x={centerX} y={77} fill="var(--color-text-tertiary)" fontSize={8} textAnchor="middle">Mirror</text>
        <text x={centerX} y={87} fill="var(--color-text-tertiary)" fontSize={8} textAnchor="middle">Engine</text>

        {/* Output line */}
        <line x1={centerX + 24} y1={80} x2={outputX - 4} y2={80} stroke="#2A2D40" strokeWidth={1} />
        <circle
          cx={centerX + 24 + ((phase * 0.6) % 1) * (outputX - 28 - centerX)}
          cy={80}
          r={3}
          fill="var(--color-violet)"
          opacity={0.9}
        />
        <text x={outputX} y={76} fill="var(--color-text-tertiary)" fontSize={10} textAnchor="start">Your Aging</text>
        <text x={outputX} y={88} fill="var(--color-text-tertiary)" fontSize={10} textAnchor="start">Trajectory</text>
      </svg>
    </div>
  );
}

export default function Profile() {
  const [expanded, setExpanded] = useState<Section>(null);

  const toggle = (s: Section) => setExpanded(prev => prev === s ? null : s);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* User identity card */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 8,
          border: '1px solid #1A1B25',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--color-bg-raised)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: 'var(--color-text-secondary)',
            fontWeight: 600,
          }}
        >
          J
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            {USER.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            Age {USER.chronologicalAge} · Last epigenetic test: Jan 16, 2026
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
            Biological age: <span style={{ color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>{USER.biologicalAge.toFixed(1)}</span>
            {' '}· DunedinPACE: <span style={{ color: '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>{USER.dunedinPace.toFixed(2)}×</span>
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Data Sources
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Wearable */}
          <DataSourceCard
            title="Oura Ring Gen 3"
            Icon={Wifi}
            connected={DATA_SOURCES.wearable.connected}
            collapsed={expanded !== 'wearable'}
            onToggle={() => toggle('wearable')}
            summary={`HRV avg: ${DATA_SOURCES.wearable.hrv}ms · Sleep: ${DATA_SOURCES.wearable.sleepEfficiency}%`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>HRV Average</div>
                  <div style={{ fontSize: 20, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-text-primary)' }}>{DATA_SOURCES.wearable.hrv}ms</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Sleep Efficiency</div>
                  <div style={{ fontSize: 20, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-text-primary)' }}>{DATA_SOURCES.wearable.sleepEfficiency}%</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Resting HR</div>
                  <div style={{ fontSize: 20, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-text-primary)' }}>{DATA_SOURCES.wearable.restingHR} bpm</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                Pulling: HRV, sleep stages, resting HR, activity · Last synced 2h ago
              </div>
              <button
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 16px',
                  borderRadius: 6,
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.4)',
                  color: 'var(--color-violet)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
              >
                Disconnect
              </button>
            </div>
          </DataSourceCard>

          {/* CGM */}
          <DataSourceCard
            title="Dexcom G7"
            Icon={Activity}
            connected={DATA_SOURCES.cgm.connected}
            collapsed={expanded !== 'cgm'}
            onToggle={() => toggle('cgm')}
            summary={`${DATA_SOURCES.cgm.currentGlucose} mg/dL · Variability: ${DATA_SOURCES.cgm.variabilityScore}`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Current Glucose</div>
                  <div style={{ fontSize: 20, fontFamily: 'JetBrains Mono, monospace', color: '#14B8A6' }}>{DATA_SOURCES.cgm.currentGlucose} mg/dL</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Today's Variability</div>
                  <div style={{ fontSize: 20, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-text-primary)' }}>{DATA_SOURCES.cgm.variabilityScore}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                Pulling: real-time glucose, daily variability, meal response curves · Live feed
              </div>
              <button
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 16px',
                  borderRadius: 6,
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.4)',
                  color: 'var(--color-violet)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
              >
                Disconnect
              </button>
            </div>
          </DataSourceCard>

          {/* Epigenetic */}
          <DataSourceCard
            title="TruDiagnostic Epigenetic Report"
            Icon={FlaskConical}
            connected={DATA_SOURCES.epigenetic.connected}
            collapsed={expanded !== 'epigenetic'}
            onToggle={() => toggle('epigenetic')}
            summary={`Bio age: ${DATA_SOURCES.epigenetic.biologicalAge} · ${DATA_SOURCES.epigenetic.daysAgo} days ago`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Biological Age</div>
                  <div style={{ fontSize: 20, fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>{DATA_SOURCES.epigenetic.biologicalAge}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>DunedinPACE</div>
                  <div style={{ fontSize: 20, fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>{DATA_SOURCES.epigenetic.dunedinPace}×</div>
                </div>
              </div>

              {/* Test history timeline */}
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 10 }}>Test History</div>
                <div style={{ position: 'relative', height: 40 }}>
                  <div style={{ position: 'absolute', top: 20, left: 0, right: 0, height: 1, background: '#1A1B25' }} />
                  {DATA_SOURCES.epigenetic.history.map((entry, i) => (
                    <div
                      key={i}
                      title={`${entry.date}: Bio age ${entry.biologicalAge}`}
                      style={{
                        position: 'absolute',
                        left: `${(i / (DATA_SOURCES.epigenetic.history.length - 1)) * 90}%`,
                        top: 14,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: '#F59E0B',
                        border: '2px solid #0A0B0F',
                        cursor: 'pointer',
                        zIndex: 1,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Next test recommendation */}
              <div style={{ padding: '12px 16px', background: 'var(--color-bg-raised)', borderRadius: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Recommended retest: April 2026 (in 47 days)
              </div>

              {/* Upload area */}
              <div
                style={{
                  border: '1px dashed #2A2D40',
                  borderRadius: 8,
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <Upload size={20} color="var(--color-text-tertiary)" />
                <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                  Upload new epigenetic report
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  Drag & drop or click to browse · PDF or CSV
                </span>
              </div>
            </div>
          </DataSourceCard>
        </div>
      </div>

      {/* Data Flow Visualization */}
      <DataFlowViz />
    </div>
  );
}
