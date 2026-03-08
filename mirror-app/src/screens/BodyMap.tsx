import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import BodyMapViz from '../components/sandbox/BodyMap';
import Card from '../components/ui/Card';
import { USER } from '../data/synthetic';

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

const ORGAN_DETAILS: OrganDetail[] = [
  {
    id: 'neurological',
    name: 'Neurological',
    age: 56.4,
    pace: 1.14,
    trend: 'worsening',
    topFactor: 'Deep sleep declining — avg 1.4h (target 1.8h+)',
    dataSource: 'Brain · Wearable (sleep architecture: deep sleep, REM)',
    color: '#4ae616',
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    age: 55.8,
    pace: 1.08,
    trend: 'stable',
    topFactor: 'Resting HRV declining 3% week-over-week',
    dataSource: 'Heart · Wearable (HRV, resting HR)',
    color: '#4ae616',
  },
  {
    id: 'metabolic',
    name: 'Metabolic',
    age: 60.1,
    pace: 1.28,
    trend: 'worsening',
    topFactor: 'Post-meal glucose spikes (avg +47 mg/dL)',
    dataSource: 'Pancreas · CGM (glucose variability, postprandial response)',
    color: '#f5700b',
  },
  {
    id: 'endocrine',
    name: 'Endocrine',
    age: 57.0,
    pace: 1.10,
    trend: 'stable',
    topFactor: 'Circadian temperature rhythm irregular — late light exposure',
    dataSource: 'Thyroid · Wearable (temperature trends, HRV circadian) + CGM',
    color: '#eaea08',
  },
  {
    id: 'immune',
    name: 'Immune',
    age: 58.3,
    pace: 1.18,
    trend: 'improving',
    topFactor: 'Inflammatory load elevated by late dinners',
    dataSource: 'Spleen · Epigenetic (immunosenescence, inflammatory markers)',
    color: '#eaea08',
  },
];

const TREND_DISPLAY = {
  improving: { label: '↓ Improving', color: '#14B8A6' },
  stable: { label: '→ Stable', color: '#A8A29E' },
  worsening: { label: '↑ Worsening', color: '#F59E0B' },
};

interface BodyMapScreenProps {
  onNavigateToScoreboard: () => void;
}

export default function BodyMapScreen({ onNavigateToScoreboard }: BodyMapScreenProps) {
  const [selectedOrgan, setSelectedOrgan] = useState<OrganDetail | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>

      {/* Persistent verdict banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px', borderRadius: 8,
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid #B45309',
      }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Current pace</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#F59E0B', fontWeight: 600 }}>
          {USER.dunedinPace.toFixed(2)}×
        </span>
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>·</span>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Aging faster than calendar age</span>
      </div>

      {/* Page header */}
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Body Map
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
          Which parts of you are aging fastest — and what's driving it?
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flex: 1, minHeight: 0 }}>

        {/* Left — 3D point-cloud body */}
        <Card style={{ flex: '1 1 55%', padding: 0, overflow: 'hidden', minHeight: 520, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 16, left: 20, zIndex: 5,
            fontSize: 10, color: 'rgba(0,200,210,0.4)',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            Drag to rotate · Hover body to explore
          </div>
          <BodyMapViz
            onZoneClick={(zoneId) => {
              const organ = ORGAN_DETAILS.find(o => o.id === zoneId) ?? null;
              setSelectedOrgan(organ);
            }}
          />
        </Card>

        {/* Right — detail panel + organ list */}
        <div style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Organ detail card */}
          {selectedOrgan ? (
            <Card style={{ padding: '20px 22px', border: `1px solid ${selectedOrgan.color}25` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                    {selectedOrgan.name} System
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 36, fontWeight: 700, color: selectedOrgan.color, lineHeight: 1 }}>
                      ~{selectedOrgan.age}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--color-text-tertiary)' }}>years</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                    Calendar age: {USER.chronologicalAge} · Difference: +{(selectedOrgan.age - USER.chronologicalAge).toFixed(1)} yr
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>30-day trend</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TREND_DISPLAY[selectedOrgan.trend].color }}>
                    {TREND_DISPLAY[selectedOrgan.trend].label}
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 14 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Top contributing factor</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{selectedOrgan.topFactor}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Data source</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    {selectedOrgan.dataSource}
                  </div>
                </div>
              </div>

              <button
                onClick={onNavigateToScoreboard}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 16,
                  padding: '9px 16px', borderRadius: 8,
                  background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                  color: '#A78BFA', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                See habits affecting {selectedOrgan.name.toLowerCase()} aging <ChevronRight size={14} />
              </button>
            </Card>
          ) : (
            <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 14, margin: 0, textAlign: 'center' }}>
                Hover over a region on the body, then click to see detailed aging data.
              </p>
            </Card>
          )}

          {/* Organ comparison table */}
          <Card style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
              All Systems Overview
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 60px 90px', gap: 8, padding: '0 4px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['System', 'Bio Age', 'Pace', 'Trend'].map(h => (
                  <span key={h} style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{h}</span>
                ))}
              </div>
              {ORGAN_DETAILS.map((organ, i) => (
                <div
                  key={organ.id}
                  onClick={() => setSelectedOrgan(organ)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 70px 60px 90px', gap: 8,
                    padding: '10px 4px',
                    borderBottom: i < ORGAN_DETAILS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    cursor: 'pointer',
                    borderRadius: 6,
                    background: selectedOrgan?.id === organ.id ? 'rgba(255,255,255,0.03)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: organ.color, flexShrink: 0, boxShadow: `0 0 6px ${organ.color}` }} />
                    <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{organ.name}</span>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: organ.color }}>~{organ.age}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: organ.color }}>{organ.pace.toFixed(2)}×</span>
                  <span style={{ fontSize: 12, color: TREND_DISPLAY[organ.trend].color }}>{TREND_DISPLAY[organ.trend].label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
