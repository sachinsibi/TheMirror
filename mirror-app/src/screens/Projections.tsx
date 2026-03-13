import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import FanChart from '../components/sandbox/FanChart';
import Card from '../components/ui/Card';
import { SparklineChart } from '../components/scoreboard/SparklineChart';
import SystemRadar from '../components/projections/SystemRadar';
import { INTERVENTIONS, SCOREBOARD_HABITS, WEEKLY_TREND } from '../data/synthetic';

const BASELINE_PACE = 1.12;
const BASE_EXCESS = BASELINE_PACE - 1.0;
const BASELINE_CHART_PACE = BASELINE_PACE;

type Intervention = typeof INTERVENTIONS[number];

function computeCombinedPace(selected: Intervention[]): number {
  if (selected.length === 0) return BASELINE_PACE;
  let remainingFraction = 1.0;
  for (const i of selected) {
    const excess = Math.max(0, i.pace - 1.0);
    remainingFraction *= excess / BASE_EXCESS;
  }
  return 1.0 + BASE_EXCESS * remainingFraction;
}

function computeCombinedChartPace(selected: Intervention[]): number {
  if (selected.length === 0) return BASELINE_CHART_PACE;
  const fractionProduct = selected.reduce(
    (acc, i) => acc * ((i.chartPace ?? BASELINE_CHART_PACE) / BASELINE_CHART_PACE),
    1.0
  );
  return Math.max(0.05, BASELINE_CHART_PACE * fractionProduct);
}


const HABIT_DETAILS: Record<string, { description: string; why: string }> = {
  'post-meal-walks': {
    description: 'A 10-minute walk within 30 minutes of finishing a meal. Requires no equipment and can be done indoors or outdoors.',
    why: "Your post-meal glucose spikes are consistently reaching 130–145mg/dL. Brief walking activates muscle glucose uptake independently of insulin, blunting those spikes before they drive glycation and metabolic stress.",
  },
  'sleep-consistency': {
    description: 'Going to bed and waking at the same time every day — including weekends — within a 30-minute window. Duration target: 7–8 hours.',
    why: "Your HRV data shows a strong correlation between late sleep times and next-day recovery scores. Inconsistent sleep is your second-largest driver of neurological and endocrine aging acceleration.",
  },
  'dietary-changes': {
    description: 'Shifting toward a Mediterranean-style eating pattern: more whole grains, legumes, fish, and vegetables; fewer ultra-processed foods and refined carbohydrates.',
    why: "Your CGM data shows high glycaemic variability. A lower-glycaemic diet would directly reduce your metabolic biological age, which is currently your most accelerated organ system at 60.1 years.",
  },
  'zone2-cardio': {
    description: 'Low-intensity aerobic exercise sustained for 30–45 minutes — at a pace where you can hold a conversation. Examples: brisk walking, easy cycling, light rowing.',
    why: "Your cardiovascular biological age is 55.8 — ahead of your metabolic pace. Zone 2 specifically targets mitochondrial density and VO2 capacity, the two factors most predictive of long-term cardiovascular aging.",
  },
  'time-restricted-eating': {
    description: 'Consuming all meals within an 8-hour window each day (e.g. 10am–6pm), then fasting for the remaining 16 hours.',
    why: "Late-night eating is elevating your overnight glucose and disrupting your circadian metabolic rhythm. Compressing your eating window aligns food intake with peak insulin sensitivity earlier in the day.",
  },
  'strength-training': {
    description: 'Resistance-based exercise twice per week — bodyweight, free weights, or machines — targeting major muscle groups with progressive overload.',
    why: "Muscle mass is a primary buffer for metabolic glucose disposal. Your activity data shows minimal resistance work over the past 30 days, leaving your metabolic resilience underbuilt relative to your age.",
  },
  'stress-reduction': {
    description: 'A daily 10–15 minute structured relaxation practice: breathwork, mindfulness meditation, or progressive muscle relaxation.',
    why: "Elevated cortisol from chronic low-grade stress directly accelerates epigenetic aging. Your HRV patterns suggest sympathetic nervous system overdrive on weekday mornings — a reliable stress signature.",
  },
};

function getProjectionNarrative(selectedIds: string[], selected: Intervention[], combinedPace: number): { headline: string; body: string } {
  if (selectedIds.length === 0) {
    return {
      headline: 'Your current trajectory',
      body: "At your current pace of 1.12×, your biological age is advancing faster than your calendar age. Without change, you are projected to reach a biological age of 59.4 by the time you turn 54 — roughly 5 years ahead of chronological expectation. The primary driver is metabolic stress from postprandial glucose spikes, compounded by inconsistent sleep.",
    };
  }
  if (selectedIds.length === 1) {
    const narratives: Record<string, string> = {
      'post-meal-walks': `Adding post-meal walks alone could bring your pace from 1.12× down toward ${combinedPace.toFixed(2)}×. Over 24 months, this projects to saving roughly 1.3 biological years — the equivalent of reversing about two years of metabolic aging through one low-effort daily habit.`,
      'sleep-consistency': `Consistent sleep could shift your pace to approximately ${combinedPace.toFixed(2)}×. The neurological and endocrine benefits compound over time — your HRV is likely to improve within weeks, with epigenetic effects visible on your next test in roughly 90 days.`,
      'dietary-changes': `Dietary changes project your pace toward ${combinedPace.toFixed(2)}×. Your metabolic biological age — currently your highest at 60.1 — is the most responsive organ system to nutrition intervention. Expect the most visible impact there.`,
      'zone2-cardio': `Zone 2 cardio projects a pace of approximately ${combinedPace.toFixed(2)}×. Cardiovascular biological age improvements typically emerge within 8–12 weeks of consistent low-intensity aerobic training, with compounding gains beyond 6 months.`,
      'time-restricted-eating': `Time-restricted eating projects a modest pace shift to around ${combinedPace.toFixed(2)}×. The primary benefit is circadian alignment — your overnight glucose and cortisol rhythm are likely to normalise within 2–3 weeks of consistent practice.`,
      'strength-training': `Strength training projects a pace toward ${combinedPace.toFixed(2)}×. Muscle tissue functions as a metabolic reservoir; even two sessions per week meaningfully improves insulin sensitivity and reduces the gap between your biological and chronological age.`,
      'stress-reduction': `A daily stress reduction practice projects a pace of around ${combinedPace.toFixed(2)}×. Cortisol normalisation has upstream effects on sleep quality, HRV, and inflammatory load — you may see HRV improvements within 10–14 days.`,
    };
    return {
      headline: 'Projected outcome',
      body: narratives[selectedIds[0]] ?? `Projected pace: ${combinedPace.toFixed(2)}×.`,
    };
  }
  const names = selected.map(i => i.name.toLowerCase()).join(', ');
  const yearsSaved = ((BASELINE_PACE - combinedPace) * 24 / 12).toFixed(1);
  return {
    headline: 'Combined projection',
    body: `With ${names} adopted together, your pace projects toward ${combinedPace.toFixed(2)}×. The interventions reinforce each other — better sleep improves glucose control, which enhances cardiovascular recovery. Over 24 months, this combined trajectory corresponds to approximately ${yearsSaved} biological years saved relative to your current path.`,
  };
}

// Custom checkbox
function Checkbox({ checked, onChange }: { checked: boolean; onChange: (e: React.MouseEvent) => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 20, height: 20,
        borderRadius: 5,
        border: checked ? '2px solid #14B8A6' : '2px solid rgba(255,255,255,0.18)',
        background: checked ? 'rgba(20,184,166,0.15)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, cursor: 'pointer',
        transition: 'border-color 150ms ease, background 150ms ease',
      }}
    >
      {checked && (
        <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
          <path d="M1 4L4 7L10 1" stroke="#14B8A6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

export default function Projections() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {}, []);

  const interventionOptions = INTERVENTIONS.filter(i => i.id !== 'current');
  const selectedInterventions = interventionOptions.filter(i => selectedIds.includes(i.id));
  const hasSelections = selectedInterventions.length > 0;

  const combinedPace = computeCombinedPace(selectedInterventions);
  const combinedChartPace = computeCombinedChartPace(selectedInterventions);
  const projection = getProjectionNarrative(selectedIds, selectedInterventions, combinedPace);

  // Evidence items for selected habits (for literature review)
  const evidenceItems = selectedInterventions
    .filter(i => i.evidence)
    .map(i => ({ name: i.name, ...i.evidence! }));

  const toggleCheckbox = (e: React.MouseEvent, interventionId: string) => {
    e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(interventionId) ? prev.filter(x => x !== interventionId) : [...prev, interventionId]
    );
  };

  const toggleAccordion = (interventionId: string) => {
    setExpandedId(prev => prev === interventionId ? null : interventionId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Page title */}
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
        Projections
      </h1>

      {/* ── Weekly Summary card ── */}
      <Card style={{ padding: '20px 24px' }}>

        {/* Title + sparkline */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
            Weekly Summary
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
            <SparklineChart data={WEEKLY_TREND.sparkline} />
            <span style={{ fontSize: 11, color: '#14B8A6', fontWeight: 600 }}>↓ improving</span>
          </div>
        </div>

        {/* Headline stat */}
        <p style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
          {WEEKLY_TREND.headline} {WEEKLY_TREND.driver}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: '#222222', marginBottom: 20 }} />

        {/* Two equal columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>

          {/* What went well */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#14B8A6', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              What went well
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {WEEKLY_TREND.positives.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#14B8A6', fontSize: 12, lineHeight: '1.6', flexShrink: 0 }}>+</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas to address */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#F59E0B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              Areas to address
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {WEEKLY_TREND.concerns.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#F59E0B', fontSize: 12, lineHeight: '1.6', flexShrink: 0 }}>–</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginTop: 8 }}>

        {/* LEFT — Habit Suggestions */}
        <div style={{ flex: '0 0 38%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Section heading — outside card, matching style */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.01em' }}>
              Habit Suggestions
            </h2>
            {hasSelections && (
              <button
                onClick={() => { setSelectedIds([]); setExpandedId(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 11, color: 'var(--color-text-tertiary)',
                  fontFamily: 'inherit', padding: '2px 0',
                }}
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>

          {/* Habit rows — scrollable container showing ~5 at a time */}
          <div style={{
            height: 300,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}
            className="habit-scroll"
          >
            {SCOREBOARD_HABITS.map((habit, idx) => {
              const isChecked = selectedIds.includes(habit.interventionId);
              const isExpanded = expandedId === habit.interventionId;
              const details = HABIT_DETAILS[habit.interventionId];
              const evidenceGrade = interventionOptions.find(i => i.id === habit.interventionId)?.evidence?.grade;

              return (
                <div key={habit.id} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                  {/* Row — click toggles dropdown */}
                  <div
                    onClick={() => toggleAccordion(habit.interventionId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 14px',
                      borderRadius: 10,
                      userSelect: 'none',
                      background: isChecked ? 'rgba(20,184,166,0.07)' : '#131315',
                      border: isChecked ? '1px solid rgba(20,184,166,0.22)' : '1px solid #222222',
                      borderLeft: isChecked ? '3px solid #14B8A6' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'background 150ms ease',
                    }}
                    onMouseEnter={e => {
                      if (!isChecked) (e.currentTarget as HTMLElement).style.background = '#181818';
                    }}
                    onMouseLeave={e => {
                      if (!isChecked) (e.currentTarget as HTMLElement).style.background = '#131315';
                    }}
                  >
                    {/* Checkbox — click only, does not bubble to row */}
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) => toggleCheckbox(e, habit.interventionId)}
                    />

                    {/* Rank */}
                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', width: 14, textAlign: 'center', flexShrink: 0 }}>
                      {idx + 1}
                    </span>

                    {/* Name + effort */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 2 }}>
                        {habit.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>
                        {habit.effort}
                      </div>
                    </div>

                    {/* Chevron */}
                    {isExpanded
                      ? <ChevronUp size={13} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
                      : <ChevronDown size={13} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
                    }
                  </div>

                  {/* Dropdown panel — visually separate from the row */}
                  {isExpanded && details && (
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: '#0e0e0e',
                      border: '1px solid #1e1e1e',
                      display: 'flex', flexDirection: 'column', gap: 10,
                    }}>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                        {details.description}
                      </p>
                      <div style={{ height: 1, background: '#1e1e1e' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Why this was chosen for you
                        </div>
                        {evidenceGrade && (
                          <span style={{
                            fontSize: 9, fontWeight: 600, letterSpacing: '0.05em',
                            padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                            color: evidenceGrade === 'STRONG RCT' ? '#14B8A6' : evidenceGrade === 'MODERATE RCT' ? '#F59E0B' : '#94A3B8',
                            background: evidenceGrade === 'STRONG RCT' ? 'rgba(20,184,166,0.1)' : evidenceGrade === 'MODERATE RCT' ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.1)',
                            border: `1px solid ${evidenceGrade === 'STRONG RCT' ? 'rgba(20,184,166,0.2)' : evidenceGrade === 'MODERATE RCT' ? 'rgba(245,158,11,0.2)' : 'rgba(148,163,184,0.2)'}`,
                          }}>
                            {evidenceGrade}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                        {details.why}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* System Projections — radar chart */}
          <div style={{ marginTop: 12 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.01em' }}>
              System Projections
            </h2>
            <Card style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <SystemRadar selectedIds={selectedIds} />
            </Card>
          </div>
        </div>

        {/* RIGHT — Chart + projection */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Section heading — outside card, matching style */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', letterSpacing: '0.01em' }}>
              Graphical View
            </h2>
            {hasSelections && (
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F59E0B' }}>
                  {BASELINE_PACE.toFixed(2)}×
                </span>
                {' → '}
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#14B8A6' }}>
                  {combinedPace.toFixed(2)}×
                </span>
              </div>
            )}
          </div>

          {/* Fan chart card */}
          <Card style={{ padding: '20px 20px 16px' }}>
            <FanChart interventionPace={hasSelections ? combinedChartPace : null} />
          </Card>

          {/* Projection narrative + literature review */}
          <Card style={{ padding: '18px 20px' }}>
            {/* Title */}
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
              {projection.headline}
            </div>

            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              {projection.body}
            </p>

            {/* Literature review */}
            <div style={{ margin: '16px 0 12px', height: 1, background: '#222222' }} />
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
              Supporting Literature
            </div>
            {evidenceItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {evidenceItems.map((ev, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 3 }}>
                      {ev.study}
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-tertiary)', lineHeight: 1.6 }}>
                      {ev.summary} {ev.ci && <span style={{ opacity: 0.7 }}>({ev.ci})</span>}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-tertiary)', lineHeight: 1.65 }}>
                Projections are derived from epigenetic clock research (Belsky et al., 2020 — Nature Aging) and DunedinPACE methodology, which quantifies biological aging rate from DNA methylation patterns. Select habits above to see the specific studies supporting each intervention.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
