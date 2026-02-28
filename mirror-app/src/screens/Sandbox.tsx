import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Check } from 'lucide-react';
import FanChart from '../components/sandbox/FanChart';
import BodyMap from '../components/sandbox/BodyMap';
import PaceGauge from '../components/dashboard/PaceGauge';
import EvidenceBadge from '../components/scoreboard/EvidenceBadge';
import Card from '../components/ui/Card';
import { INTERVENTIONS, USER } from '../data/synthetic';

interface SandboxProps {
  preloadedInterventionId?: string;
}

const BASELINE_PACE = USER.dunedinPace; // 1.12 — DunedinPACE, used for gauge
const BASE_EXCESS = BASELINE_PACE - 1.0; // 0.12
const BASELINE_CHART_PACE = BASELINE_PACE; // 1.12 — chart trajectory baseline

type Intervention = typeof INTERVENTIONS[number];

// Gauge pace: diminishing-returns product on DunedinPACE excess above 1.0
function computeCombinedPace(selected: Intervention[]): number {
  if (selected.length === 0) return BASELINE_PACE;
  let remainingFraction = 1.0;
  for (const i of selected) {
    const excess = Math.max(0, i.pace - 1.0);
    remainingFraction *= excess / BASE_EXCESS;
  }
  return 1.0 + BASE_EXCESS * remainingFraction;
}

// Chart pace: product formula on chartPace fractions — produces visually meaningful divergence
// matching each intervention's stated "↓ up to X yr" at 24 months
function computeCombinedChartPace(selected: Intervention[]): number {
  if (selected.length === 0) return BASELINE_CHART_PACE;
  const fractionProduct = selected.reduce(
    (acc, i) => acc * ((i.chartPace ?? BASELINE_CHART_PACE) / BASELINE_CHART_PACE),
    1.0
  );
  return Math.max(0.05, BASELINE_CHART_PACE * fractionProduct);
}

// Best (lowest) organ pace across all selected interventions
function computeCombinedOrgans(selected: Intervention[]) {
  if (selected.length === 0) return INTERVENTIONS[0].organScores;
  const organs = ['metabolic', 'cardiovascular', 'immune', 'hepatic'] as const;
  const result = {} as typeof INTERVENTIONS[0]['organScores'];
  for (const organ of organs) {
    let best = selected[0].organScores[organ];
    for (const i of selected.slice(1)) {
      if (i.organScores[organ].pace < best.pace) best = i.organScores[organ];
    }
    result[organ] = best;
  }
  return result;
}

function getRiskContent(selectedIds: string[], selected: Intervention[]) {
  if (selectedIds.length === 0) {
    return {
      title: 'Disease-Risk Translation',
      isPositive: false,
      text: "At your current pace, you're on track to develop metabolic syndrome 4 years earlier than your calendar age suggests.",
      secondary: 'Select one or more habits below to see how your risk profile changes.',
    };
  }
  if (selectedIds.length === 1) {
    const texts: Record<string, string> = {
      'post-meal-walks': 'With post-meal walks, you reduce your estimated 10-year diabetes risk by 18%.',
      'dietary-changes': 'With dietary changes, your projected cardiovascular risk drops by 12% over 24 months.',
      'sleep-consistency': 'Consistent sleep reduces your inflammatory markers by 22%, lowering all-cause mortality risk.',
      'zone2-cardio': 'Zone 2 cardio reduces your cardiovascular biological age by an estimated 1.2 years over 12 months.',
      'time-restricted-eating': 'Restricting eating to 8 hours improves insulin sensitivity, reducing metabolic syndrome risk by 14%.',
    };
    return { title: 'Risk Reduction', isPositive: true, text: texts[selectedIds[0]] ?? '', secondary: '' };
  }
  const names = selected.map(i => i.name.toLowerCase()).join(', ');
  return {
    title: 'Combined Risk Reduction',
    isPositive: true,
    text: `With ${names}: each habit reinforces the others. Clinical literature shows compounding effects when multiple interventions are combined.`,
    secondary: 'Combined biological age trajectories reflect diminishing-returns modelling.',
  };
}

const GRADE_ORDER = ['STRONG RCT', 'MODERATE RCT', 'PRELIMINARY'];

export default function Sandbox({ preloadedInterventionId }: SandboxProps) {
  const initialIds =
    preloadedInterventionId && preloadedInterventionId !== 'current'
      ? [preloadedInterventionId]
      : [];

  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);

  const interventionOptions = INTERVENTIONS.filter(i => i.id !== 'current');
  const currentBaseline = INTERVENTIONS[0];

  const selectedInterventions = interventionOptions.filter(i => selectedIds.includes(i.id));
  const hasSelections = selectedInterventions.length > 0;

  const combinedPace = computeCombinedPace(selectedInterventions);
  const combinedChartPace = computeCombinedChartPace(selectedInterventions);
  const combinedOrgans = computeCombinedOrgans(selectedInterventions);
  const combinedPaceRange = hasSelections
    ? { low: Math.max(0.8, combinedPace - 0.03), high: combinedPace + 0.04 }
    : currentBaseline.paceRange;

  const displayPace = hasSelections ? combinedPace : BASELINE_PACE;
  const displayOrgans = hasSelections ? combinedOrgans : currentBaseline.organScores;
  const displayPaceRange = combinedPaceRange;

  // Highest-grade evidence among selected
  const primaryEvidence = selectedInterventions
    .filter(i => i.evidence)
    .sort((a, b) => GRADE_ORDER.indexOf(a.evidence!.grade) - GRADE_ORDER.indexOf(b.evidence!.grade))[0]
    ?.evidence;

  const riskContent = getRiskContent(selectedIds, selectedInterventions);

  const toggleId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page header */}
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Longevity Sandbox
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
          {USER.name}, {USER.chronologicalAge} · Biological age: ~{USER.biologicalAge.toFixed(0)} · Aging {BASELINE_PACE.toFixed(2)}×
        </p>
      </div>

      {/* Intervention selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Baseline reset pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setSelectedIds([])}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              border: !hasSelections ? '1.5px solid rgba(148,163,184,0.4)' : '1px solid rgba(255,255,255,0.06)',
              background: !hasSelections ? 'rgba(148,163,184,0.1)' : 'var(--color-bg-surface)',
              color: !hasSelections ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
              fontSize: 12, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 150ms ease',
            }}
          >
            Current habits (baseline)
          </button>
          {hasSelections && (
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
              {selectedInterventions.length} habit{selectedInterventions.length > 1 ? 's' : ''} selected
              · combined pace{' '}
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#14B8A6' }}>
                {combinedPace.toFixed(2)}×
              </span>
            </span>
          )}
        </div>

        {/* 3-column intervention grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {interventionOptions.map(intervention => {
            const isSelected = selectedIds.includes(intervention.id);
            return (
              <button
                key={intervention.id}
                onClick={() => toggleId(intervention.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: isSelected ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                  background: isSelected ? 'rgba(139,92,246,0.1)' : 'var(--color-bg-surface)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  transition: 'border-color 150ms ease, background 150ms ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                    {intervention.name}
                  </span>
                  {isSelected && (
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--color-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={10} color="#fff" />
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: isSelected ? '#14B8A6' : 'var(--color-text-tertiary)', fontWeight: 500 }}>
                  {intervention.delta ?? 'baseline'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main two-column layout */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* LEFT — Fan chart + risk (60%) */}
        <div style={{ flex: '0 0 60%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card style={{ padding: '20px 20px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
              24-Month Biological Age Trajectory
            </div>
            <FanChart interventionPace={hasSelections ? combinedChartPace : null} />
          </Card>

          {/* Disease-risk card */}
          <Card style={{
            padding: '16px 18px',
            background: riskContent.isPositive ? 'rgba(20,184,166,0.05)' : 'rgba(245,158,11,0.05)',
            border: riskContent.isPositive ? '1px solid rgba(20,184,166,0.15)' : '1px solid rgba(245,158,11,0.15)',
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <AlertTriangle
                size={16}
                color={riskContent.isPositive ? '#14B8A6' : '#F59E0B'}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6, color: riskContent.isPositive ? '#14B8A6' : '#F59E0B' }}>
                  {riskContent.title}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                  {riskContent.text}
                </p>
                {riskContent.secondary && (
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--color-text-tertiary)', lineHeight: 1.65 }}>
                    {riskContent.secondary}
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
            <BodyMap organScores={displayOrgans} />
          </Card>

          {/* Mini pace gauge */}
          <Card style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8, alignSelf: 'flex-start' }}>
              Projected Pace
            </div>
            {hasSelections && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>
                  {BASELINE_PACE.toFixed(2)}×
                </span>
                <span style={{ color: '#14B8A6', fontSize: 16 }}>→</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#14B8A6' }}>
                  {combinedPace.toFixed(2)}×
                </span>
              </div>
            )}
            <PaceGauge
              pace={displayPace}
              paceRange={displayPaceRange}
              size="mini"
              animated={true}
            />
          </Card>

          {/* Evidence card — shows best evidence among selected */}
          {primaryEvidence && (
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
                <span style={{ fontWeight: 500 }}>{primaryEvidence.study}</span>
                {evidenceExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {evidenceExpanded && (
                <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ height: 8 }} />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <EvidenceBadge grade={primaryEvidence.grade} />
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>n = {primaryEvidence.sampleSize}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                    {primaryEvidence.summary}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-tertiary)' }}>{primaryEvidence.ci}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-tertiary)' }}>Population: {primaryEvidence.population}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
