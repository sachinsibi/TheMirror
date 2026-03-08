import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import BodyMapViz from '../components/sandbox/BodyMap';
import Card from '../components/ui/Card';
import { ORGAN_SCORES, USER } from '../data/synthetic';

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
    id: 'metabolic',
    name: 'Metabolic',
    age: 60.1,
    pace: 1.28,
    trend: 'worsening',
    topFactor: 'Post-meal glucose spikes (avg +47 mg/dL)',
    dataSource: 'Derived from glucose variability + CGM meal response curves',
    color: '#F59E0B',
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    age: 55.8,
    pace: 1.08,
    trend: 'stable',
    topFactor: 'Resting HRV declining 3% week-over-week',
    dataSource: 'Derived from HRV, resting HR, sleep quality (Oura)',
    color: '#D4A96A',
  },
  {
    id: 'immune',
    name: 'Immune',
    age: 58.3,
    pace: 1.18,
    trend: 'improving',
    topFactor: 'Inflammatory load elevated by late dinners',
    dataSource: 'Derived from sleep consistency + diet quality index',
    color: '#C9956F',
  },
  {
    id: 'hepatic',
    name: 'Hepatic',
    age: 54.9,
    pace: 0.97,
    trend: 'improving',
    topFactor: 'Alcohol intake within range · diet improving',
    dataSource: 'Derived from dietary pattern + epigenetic hepatic clock',
    color: '#14B8A6',
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

  const organScores = ORGAN_SCORES.current;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

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

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Left — body silhouette */}
        <Card style={{ flex: '0 0 280px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--color-text-tertiary)', alignSelf: 'flex-start' }}>
            Tap a zone to explore
          </p>
          <BodyMapViz
            organScores={organScores}
            selectedZoneId={selectedOrgan?.id}
            onZoneClick={(zoneId) => {
              const organ = ORGAN_DETAILS.find(o => o.id === zoneId) ?? null;
              setSelectedOrgan(organ);
            }}
          />
          {/* Zone tap buttons below map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 16 }}>
            {ORGAN_DETAILS.map(organ => (
              <button
                key={organ.id}
                onClick={() => setSelectedOrgan(organ)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 8,
                  background: selectedOrgan?.id === organ.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border: selectedOrgan?.id === organ.id ? `1px solid ${organ.color}30` : '1px solid transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: organ.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{organ.name}</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: organ.color }}>
                  ~{organ.age} yr
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Right — detail panel + organ list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

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
            <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: 14, margin: 0, textAlign: 'center' }}>
                Select an organ zone to see detailed aging data, top contributing factors, and linked habits.
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 100px', gap: 12, padding: '0 4px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['System', 'Bio Age', 'Pace', 'Trend'].map(h => (
                  <span key={h} style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{h}</span>
                ))}
              </div>
              {ORGAN_DETAILS.map((organ, i) => (
                <div
                  key={organ.id}
                  onClick={() => setSelectedOrgan(organ)}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 80px 100px', gap: 12,
                    padding: '12px 4px',
                    borderBottom: i < ORGAN_DETAILS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    cursor: 'pointer',
                    borderRadius: 6,
                    background: selectedOrgan?.id === organ.id ? 'rgba(255,255,255,0.03)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: organ.color, flexShrink: 0 }} />
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
