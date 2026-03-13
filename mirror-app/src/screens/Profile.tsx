import { useState } from 'react';
import { ChevronDown, ChevronUp, Upload, Shield, Clock, FlaskConical } from 'lucide-react';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import { USER, DATA_SOURCES } from '../data/synthetic';

type TabId = 'overview' | 'data-sources' | 'methodology';

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: connected ? '#14B8A6' : '#475569', flexShrink: 0,
    }} />
  );
}


export default function Profile() {
  const [tab, setTab] = useState<TabId>('overview');
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'data-sources', label: 'Data Sources' },
    { id: 'methodology', label: 'Methodology & Trust' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page header */}
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
        Profile
      </h1>

      {/* Identity card */}
      <Card style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #14B8A6, #14B8A6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            J
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>
              {USER.name}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                Calendar age: <span style={{ color: 'var(--color-text-secondary)' }}>{USER.chronologicalAge}</span>
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                Biological age: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>{USER.biologicalAge.toFixed(1)}</span>
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                DunedinPACE: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>{USER.dunedinPace.toFixed(2)}×</span>
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                Last test: <span style={{ color: 'var(--color-text-secondary)' }}>Jan 16, 2026</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={TABS} active={tab} onChange={id => setTab(id as TabId)} />

      {/* Overview tab */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Projected vs Actual — the trust moment */}
          <Card style={{ padding: '20px 24px', border: '1px solid rgba(20,184,166,0.2)' }}>
            <div style={{ fontSize: 11, color: '#14B8A6', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
              Projected vs Actual — We're on record
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 6 }}>Last projection (Oct 14, 2025)</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: 'var(--color-text-secondary)', lineHeight: 1 }}>57.6</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>predicted bio age</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 6 }}>Actual result (Jan 16, 2026)</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: '#14B8A6', lineHeight: 1 }}>57.2</div>
                <div style={{ fontSize: 12, color: '#14B8A6', marginTop: 4 }}>↓ 0.4 better than projected</div>
              </div>
            </div>
            <div style={{ padding: '10px 14px', background: 'rgba(20,184,166,0.06)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
              We projected 57.6. Your result: 57.2. The model is calibrated to you.
            </div>
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(20,184,166,0.06)', borderRadius: 8, border: '1px solid rgba(20,184,166,0.15)' }}>
              <div style={{ fontSize: 12, color: '#5EEAD4', fontWeight: 600, marginBottom: 4 }}>Next test: April 2026 (47 days)</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                Your next result will show how this period's habits moved the needle. We're on record.
              </div>
            </div>
          </Card>

          {/* Test history */}
          <Card style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
              Test History
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 100px 100px', gap: 12, padding: '0 4px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 2 }}>
                {['Date', 'Biological Age', 'DunedinPACE', 'Change'].map(h => (
                  <span key={h} style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{h}</span>
                ))}
              </div>
              {DATA_SOURCES.epigenetic.history.map((entry, i) => {
                const prev = DATA_SOURCES.epigenetic.history[i - 1];
                const delta = prev ? entry.biologicalAge - prev.biologicalAge : null;
                return (
                  <div key={entry.date} style={{
                    display: 'grid', gridTemplateColumns: '140px 1fr 100px 100px', gap: 12,
                    padding: '12px 4px',
                    borderBottom: i < DATA_SOURCES.epigenetic.history.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{entry.date}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#F59E0B' }}>{entry.biologicalAge}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--color-text-secondary)' }}>{entry.pace}×</span>
                    <span style={{ fontSize: 13, color: delta !== null ? (delta < 0 ? '#14B8A6' : '#F59E0B') : 'var(--color-text-tertiary)' }}>
                      {delta !== null ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Data Sources tab */}
      {tab === 'data-sources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              id: 'wearable', title: 'Oura Ring Gen 3',
              connected: true, summary: `HRV: ${DATA_SOURCES.wearable.hrv}ms · Sleep: ${DATA_SOURCES.wearable.sleepEfficiency}% · Last sync: 2h ago`,
              details: [
                { label: 'HRV Average', value: `${DATA_SOURCES.wearable.hrv}ms` },
                { label: 'Sleep Efficiency', value: `${DATA_SOURCES.wearable.sleepEfficiency}%` },
                { label: 'Resting HR', value: `${DATA_SOURCES.wearable.restingHR} bpm` },
              ],
              pulling: 'HRV, sleep stages, resting HR, activity rings',
            },
            {
              id: 'cgm', title: 'Dexcom G7',
              connected: true, summary: `${DATA_SOURCES.cgm.currentGlucose} mg/dL · Variability: ${DATA_SOURCES.cgm.variabilityScore} · Live`,
              details: [
                { label: 'Current Glucose', value: `${DATA_SOURCES.cgm.currentGlucose} mg/dL` },
                { label: "Today's Variability", value: String(DATA_SOURCES.cgm.variabilityScore) },
              ],
              pulling: 'Real-time glucose, daily variability, meal response curves',
            },
            {
              id: 'epigenetic', title: 'TruDiagnostic Report',
              connected: true, summary: `Bio age: ${DATA_SOURCES.epigenetic.biologicalAge} · ${DATA_SOURCES.epigenetic.daysAgo} days ago · Next: 47 days`,
              details: [
                { label: 'Biological Age', value: String(DATA_SOURCES.epigenetic.biologicalAge) },
                { label: 'DunedinPACE', value: `${DATA_SOURCES.epigenetic.dunedinPace}×` },
                { label: 'Clock', value: 'GrimAge + DunedinPACE (EPICv2)' },
              ],
              pulling: 'Biological age, organ clocks, DunedinPACE, epigenetic scores',
            },
          ].map(source => {
            const isExpanded = expandedSource === source.id;
            return (
              <Card key={source.id} style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedSource(isExpanded ? null : source.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', background: 'transparent', border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  }}
                >
                  <StatusDot connected={source.connected} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>{source.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source.summary}</div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} color="var(--color-text-tertiary)" /> : <ChevronDown size={16} color="var(--color-text-tertiary)" />}
                </button>
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ height: 16 }} />
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 14 }}>
                      {source.details.map(d => (
                        <div key={d.label}>
                          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>{d.label}</div>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, color: 'var(--color-text-primary)', fontWeight: 600 }}>{d.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 14 }}>
                      Pulling: {source.pulling}
                    </div>
                    {source.id === 'epigenetic' && (
                      <div style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 12 }}>
                        <Upload size={18} color="var(--color-text-tertiary)" />
                        <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>Upload new epigenetic report</span>
                        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>PDF or CSV · Drag & drop or click to browse</span>
                      </div>
                    )}
                    <button style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.25)', color: '#5EEAD4', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                      Disconnect
                    </button>
                  </div>
                )}
              </Card>
            );
          })}

        </div>
      )}

      {/* Methodology tab */}
      {tab === 'methodology' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <Card style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
              <FlaskConical size={20} color="#14B8A6" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>Clock Methodology</div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                  We use <strong style={{ color: 'var(--color-text-primary)' }}>GrimAge + DunedinPACE</strong> — the two clocks with the strongest mortality prediction and intervention response evidence. Both run on the EPICv2 methylation array from TruDiagnostic.
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { name: 'GrimAge', desc: 'Predicts lifespan. Best clock for absolute biological age.', evidence: 'Strong mortality prediction (HR 1.4 per SD)' },
                { name: 'DunedinPACE', desc: 'Measures speed of aging. Responds to interventions within 90 days.', evidence: 'Sensitive to lifestyle changes (p<0.001)' },
              ].map(clock => (
                <div key={clock.name} style={{ padding: '14px 16px', background: 'var(--color-bg-raised)', borderRadius: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{clock.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6, lineHeight: 1.6 }}>{clock.desc}</div>
                  <div style={{ fontSize: 11, color: '#14B8A6' }}>{clock.evidence}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <Shield size={20} color="#14B8A6" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>Data Commitment</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'You own your data. Full deletion within 30 days including backups.',
                    'End-to-end encryption. Real-time metrics computed on your device.',
                    'Never shared with insurers, employers, or government agencies. Ever.',
                  ].map(line => (
                    <div key={line} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: '#14B8A6', fontSize: 16, lineHeight: 1.2, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ padding: '16px 20px', background: 'rgba(148,163,184,0.04)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Clock size={16} color="var(--color-text-tertiary)" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-tertiary)', lineHeight: 1.7 }}>
                Metabolic Mirror is a wellness tool. It does not diagnose disease or replace clinical care.
                All biological age estimates carry uncertainty. Ranges are shown to communicate this honestly.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
