import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import FanChart from '../components/sandbox/FanChart';
import BodyMap from '../components/sandbox/BodyMap';
import PaceGauge from '../components/dashboard/PaceGauge';
import EvidenceBadge from '../components/scoreboard/EvidenceBadge';
import Card from '../components/ui/Card';
import { INTERVENTIONS, USER } from '../data/synthetic';

interface SandboxProps {
  preloadedInterventionId?: string;
}

const DISEASE_RISK: Record<string, { current: string; intervention: string }> = {
  current: {
    current: "At your current pace, you're on track to develop metabolic syndrome 4 years earlier than your calendar age suggests.",
    intervention: '',
  },
  'post-meal-walks': {
    current: "At your current pace, you're on track to develop metabolic syndrome 4 years earlier than your calendar age suggests.",
    intervention: "With post-meal walks, you reduce your estimated 10-year diabetes risk by 18%.",
  },
  'dietary-changes': {
    current: "At your current pace, you're on track to develop metabolic syndrome 4 years earlier than your calendar age suggests.",
    intervention: "With dietary changes, your projected cardiovascular risk drops by 12% over 24 months.",
  },
};

export default function Sandbox({ preloadedInterventionId }: SandboxProps) {
  const defaultId = preloadedInterventionId && preloadedInterventionId !== 'current'
    ? preloadedInterventionId
    : 'current';

  const [selectedId, setSelectedId] = useState(defaultId);
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);

  const selected = INTERVENTIONS.find(i => i.id === selectedId) ?? INTERVENTIONS[0];
  const currentIntervention = INTERVENTIONS[0];
  const interventionPace = selectedId !== 'current' ? selected.pace : null;
  const riskText = DISEASE_RISK[selectedId] ?? DISEASE_RISK['current'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page header */}
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Longevity Sandbox
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
          {USER.name}, {USER.chronologicalAge} · Biological age: ~{USER.biologicalAge.toFixed(0)} · Aging {currentIntervention.pace.toFixed(2)}×
        </p>
      </div>

      {/* Intervention selector cards */}
      <div style={{ display: 'flex', gap: 10 }}>
        {INTERVENTIONS.map(intervention => {
          const isSelected = selectedId === intervention.id;
          return (
            <button
              key={intervention.id}
              onClick={() => setSelectedId(intervention.id)}
              style={{
                flex: 1,
                padding: '14px 16px',
                borderRadius: 10,
                border: isSelected ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: isSelected ? 'rgba(139,92,246,0.1)' : 'var(--color-bg-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 150ms ease, background 150ms ease',
                fontFamily: 'inherit',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', marginBottom: 4 }}>
                {intervention.name}
              </div>
              {intervention.delta
                ? <div style={{ fontSize: 12, color: '#14B8A6', fontWeight: 500 }}>{intervention.delta}</div>
                : <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>baseline · current path</div>
              }
            </button>
          );
        })}
      </div>

      {/* Main two-column layout */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* LEFT — Fan chart + disease risk (60%) */}
        <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card style={{ padding: '20px 20px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
              24-Month Biological Age Trajectory
            </div>
            <FanChart interventionPace={interventionPace} selectedId={selectedId} />
          </Card>

          {/* Disease-risk translation */}
          <Card style={{
            padding: '16px 18px',
            background: selectedId !== 'current'
              ? 'rgba(20,184,166,0.05)'
              : 'rgba(245,158,11,0.05)',
            border: selectedId !== 'current'
              ? '1px solid rgba(20,184,166,0.15)'
              : '1px solid rgba(245,158,11,0.15)',
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <AlertTriangle
                size={16}
                color={selectedId !== 'current' ? '#14B8A6' : '#F59E0B'}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6, color: selectedId !== 'current' ? '#14B8A6' : '#F59E0B' }}>
                  {selectedId !== 'current' ? 'Risk Reduction' : 'Disease-Risk Translation'}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                  {selectedId !== 'current' ? riskText.intervention : riskText.current}
                </p>
                {selectedId === 'current' && (
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--color-text-tertiary)', lineHeight: 1.65 }}>
                    Select an intervention above to see how your risk profile changes.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT — Body map + mini gauge + evidence (40%) */}
        <div style={{ flex: '0 0 calc(40% - 20px)', display: 'flex', flexDirection: 'column', gap: 14 }}>

          <Card style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, alignSelf: 'flex-start' }}>
              Organ Aging Map
            </div>
            <BodyMap organScores={selected.organScores} />
          </Card>

          {/* Mini pace gauge */}
          <Card style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8, alignSelf: 'flex-start' }}>
              Projected Pace
            </div>
            {selectedId !== 'current' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>
                  {INTERVENTIONS[0].pace.toFixed(2)}×
                </span>
                <span style={{ color: '#14B8A6', fontSize: 16 }}>→</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#14B8A6' }}>
                  {selected.pace.toFixed(2)}×
                </span>
              </div>
            )}
            <PaceGauge
              pace={selected.pace}
              paceRange={selected.paceRange}
              size="mini"
              animated={true}
            />
          </Card>

          {/* Evidence card */}
          {selected.evidence && (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => setEvidenceExpanded(!evidenceExpanded)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-secondary)', fontSize: 13,
                  fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 500 }}>{selected.evidence.study}</span>
                {evidenceExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {evidenceExpanded && (
                <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ height: 8 }} />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <EvidenceBadge grade={selected.evidence.grade} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>n = {selected.evidence.sampleSize}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                    {selected.evidence.summary}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-tertiary)' }}>{selected.evidence.ci}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-tertiary)' }}>Population: {selected.evidence.population}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
