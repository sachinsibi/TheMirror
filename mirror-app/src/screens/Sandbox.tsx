import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FanChart from '../components/sandbox/FanChart';
import BodyMap from '../components/sandbox/BodyMap';
import PaceGauge from '../components/dashboard/PaceGauge';
import EvidenceBadge from '../components/scoreboard/EvidenceBadge';
import { INTERVENTIONS, USER } from '../data/synthetic';

interface SandboxProps {
  preloadedInterventionId?: string;
}

export default function Sandbox({ preloadedInterventionId }: SandboxProps) {
  const defaultId = preloadedInterventionId && preloadedInterventionId !== 'current'
    ? preloadedInterventionId
    : 'current';

  const [selectedId, setSelectedId] = useState(defaultId);
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);

  const selected = INTERVENTIONS.find(i => i.id === selectedId) ?? INTERVENTIONS[0];
  const currentIntervention = INTERVENTIONS[0]; // 'current'

  const interventionPace = selectedId !== 'current' ? selected.pace : null;
  const displayPace = selected.pace;

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      {/* Anchor line */}
      <p style={{ margin: '0 0 24px', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
        {USER.name}, {USER.chronologicalAge} · Biological age: ~{USER.biologicalAge.toFixed(0)} · Aging {currentIntervention.pace.toFixed(2)}×
      </p>

      {/* Intervention cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        {INTERVENTIONS.map(intervention => {
          const isSelected = selectedId === intervention.id;
          return (
            <button
              key={intervention.id}
              onClick={() => setSelectedId(intervention.id)}
              style={{
                minWidth: 160,
                padding: '14px 18px',
                borderRadius: 8,
                border: `1px solid ${isSelected ? 'var(--color-violet)' : '#1A1B25'}`,
                background: isSelected ? 'rgba(139,92,246,0.08)' : 'var(--color-bg-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 150ms ease, background 150ms ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = '#2A2D40';
              }}
              onMouseLeave={e => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = '#1A1B25';
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', marginBottom: 4 }}>
                {intervention.name}
              </div>
              {intervention.delta && (
                <div style={{ fontSize: 12, color: '#14B8A6', fontWeight: 500 }}>
                  {intervention.delta}
                </div>
              )}
              {!intervention.delta && (
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                  baseline
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Main content — two column */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

        {/* Left: Fan chart (60%) */}
        <div style={{ flex: '0 0 60%' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            24-Month Biological Age Trajectory
          </h3>
          <FanChart interventionPace={interventionPace} selectedId={selectedId} />
        </div>

        {/* Right: Body map + mini gauge (40%) */}
        <div style={{ flex: '0 0 calc(40% - 32px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

          {/* Body map */}
          <BodyMap organScores={selected.organScores} />

          {/* Mini pace gauge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {selectedId !== 'current' && (
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>
                  {INTERVENTIONS[0].pace.toFixed(2)}×
                </span>
                <span style={{ color: '#14B8A6' }}>→</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#14B8A6' }}>
                  {selected.pace.toFixed(2)}×
                </span>
              </div>
            )}
            <PaceGauge
              pace={displayPace}
              paceRange={selected.paceRange}
              size="mini"
              animated={true}
            />
          </div>

          {/* Evidence card */}
          {selected.evidence && (
            <div
              style={{
                width: '100%',
                background: 'var(--color-bg-surface)',
                borderRadius: 8,
                border: '1px solid #1A1B25',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setEvidenceExpanded(!evidenceExpanded)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <span>{selected.evidence.study}</span>
                {evidenceExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {evidenceExpanded && (
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ height: 1, background: '#1A1B25' }} />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <EvidenceBadge grade={selected.evidence.grade} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                      n={selected.evidence.sampleSize}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {selected.evidence.summary}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                    {selected.evidence.ci}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                    Population: {selected.evidence.population}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
