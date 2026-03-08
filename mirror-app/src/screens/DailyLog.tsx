import { useState } from 'react';
import { ChevronRight, ChevronDown, CheckCircle, Zap } from 'lucide-react';
import Card from '../components/ui/Card';

interface DailyLogProps {
  onNavigateToScoreboard: () => void;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type MealCategory = 'whole' | 'mixed' | 'processed' | null;
type StressLevel = 1 | 2 | 3 | 4 | 5 | null;
type HydrationLevel = 'low' | 'ok' | 'good' | null;
type MissedExercise = 'none' | 'strength' | 'yoga' | 'other' | null;

// ─── Synthetic wearable data (Oura + Dexcom) ─────────────────────────────────

const OURA_DATA = {
  totalSleep: '7h 23m',
  efficiency: 87,
  hrv: 42,
  restingHR: 58,
  activeCalories: 340,
  steps: 6200,
  detectedActivity: 'Light walk · 28 min',
};

const DEXCOM_DATA = {
  timeInRange: 81,
  peakGlucose: 142,
  variabilityScore: 'Low',
  variabilityColor: '#14B8A6',
};

// CGM-derived meal timing (Dexcom detects meal events via glucose inflection points)
const CGM_MEAL_TIMING = {
  lastMealTime: '7:42 pm',         // yesterday
  firstMealTime: '8:15 am',        // this morning
  overnightFast: '12h 33m',
  fastRating: 'Solid',
  fastRatingColor: '#14B8A6',
  fastTip: 'A 12.5h fast supports overnight metabolic repair. Pulling last meal 30 min earlier would push this into optimal range (13h+).',
};

// ─── Labels ───────────────────────────────────────────────────────────────────

const STRESS_LABELS: Record<number, string> = {
  1: 'Calm', 2: 'Low', 3: 'Moderate', 4: 'High', 5: 'Overwhelmed',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Source badge pill */
function SourceBadge({ label, auto }: { label: string; auto: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 20,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
      fontFamily: 'Inter, sans-serif',
      background: auto ? 'rgba(20,184,166,0.1)' : 'rgba(139,92,246,0.1)',
      color: auto ? '#14B8A6' : '#A78BFA',
      border: `1px solid ${auto ? 'rgba(20,184,166,0.2)' : 'rgba(139,92,246,0.2)'}`,
    }}>
      {auto && <Zap size={9} />}
      {label}
    </span>
  );
}

/** Small read-only stat tile */
function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      flex: 1, padding: '12px 14px', borderRadius: 10,
      background: 'var(--color-bg-base)',
      border: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{sub}</div>}
    </div>
  );
}

/** Accordion section wrapper */
function Section({
  title, badge, summary, filled, open, onToggle, children,
}: {
  title: string;
  badge: React.ReactNode;
  summary: string;
  filled: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255, 255, 255, 0.06)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        {/* Filled dot */}
        <div style={{
          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
          background: filled ? '#14B8A6' : 'rgba(255,255,255,0.12)',
          transition: 'background 300ms ease',
        }} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {title}
        </span>
        {badge}
        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginLeft: 8 }}>{summary}</span>
        {open
          ? <ChevronDown size={15} color="var(--color-text-tertiary)" />
          : <ChevronRight size={15} color="var(--color-text-tertiary)" />}
      </button>

      {/* Body */}
      <div style={{
        maxHeight: open ? 600 : 0,
        overflow: 'hidden',
        transition: 'max-height 300ms ease',
      }}>
        <div style={{ padding: '0 18px 18px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DailyLog({ onNavigateToScoreboard }: DailyLogProps) {
  // Form state
  const [stress, setStress] = useState<StressLevel>(null);
  const [meal, setMeal] = useState<MealCategory>(null);
  const [alcohol, setAlcohol] = useState<number | null>(null);
  const [walked, setWalked] = useState<boolean | null>(null);
  const [walkMinutes, setWalkMinutes] = useState(10);
  const [missedExercise, setMissedExercise] = useState<MissedExercise>(null);
  const [hydration, setHydration] = useState<HydrationLevel>(null);
  const [supplementFlag, setSupplementFlag] = useState<boolean | null>(null);
  const [supplementNote, setSupplementNote] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Accordion open state — all closed by default
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (id: string) => setOpenSection(prev => prev === id ? null : id);

  // Progress
  const manualFields = [stress, meal, alcohol, walked, hydration, supplementFlag];
  const filledCount = manualFields.filter(f => f !== null).length;
  const totalManual = manualFields.length;

  const handleSubmit = () => setSubmitted(true);

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Daily Log
        </h1>
        <Card style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16 }}>
          <CheckCircle size={48} color="#14B8A6" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
              Day logged.
            </div>
            {walked && (
              <div style={{ fontSize: 14, color: '#14B8A6', marginBottom: 8 }}>
                Post-meal walk added. This is your #1 age-decelerating habit right now.
              </div>
            )}
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Today's impact:{' '}
              <span style={{ fontFamily: 'JetBrains Mono, monospace', color: walked ? '#14B8A6' : '#F59E0B' }}>
                {walked ? '−0.7' : '+1.1'} days
              </span>
              {' '}on biological age.
            </div>
          </div>

          {/* Data summary */}
          <div style={{ width: '100%', padding: '12px 16px', background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'left' }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text-primary)' }}>Today's data sources</div>
            <div>📡 Auto-ingested: sleep, HRV, activity (Oura) · glucose & TIR (Dexcom)</div>
            <div style={{ marginTop: 4 }}>✏️ Manually logged: {filledCount} of {totalManual} fields</div>
          </div>

          {/* Pace nudge */}
          <div style={{ padding: '12px 20px', background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Aging pace updated: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#14B8A6' }}>1.10×</span> (was 1.12×)
          </div>

          {/* Streak */}
          <div style={{ width: '100%', padding: '12px 16px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Day 4 of 5 logged this week.</span>
              <span style={{ fontSize: 12, color: '#A78BFA' }}>One more to unlock your weekly insight.</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map(d => (
                <div key={d} style={{ flex: 1, height: 4, borderRadius: 2, background: d <= 4 ? '#8B5CF6' : 'rgba(139,92,246,0.2)' }} />
              ))}
            </div>
          </div>

          <button
            onClick={onNavigateToScoreboard}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '11px 20px', borderRadius: 8,
              background: 'var(--color-bg-raised)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-text-secondary)', fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Your biggest opportunity today: earlier dinner. Tap to learn why. <ChevronRight size={14} />
          </button>

          <button
            onClick={() => setSubmitted(false)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Edit log
          </button>
        </Card>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Daily Log
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
            Wearable data ingested automatically — log the rest in under 60 seconds.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 24, fontWeight: 700, color: '#8B5CF6', lineHeight: 1 }}>14</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>day streak · your longest</div>
        </div>
      </div>

      {/* Progress pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', borderRadius: 10,
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${(filledCount / totalManual) * 100}%`,
            background: 'var(--color-violet)',
            transition: 'width 300ms ease',
          }} />
        </div>
        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
          {filledCount} / {totalManual} manual fields
        </span>
      </div>

      {/* ── Group 1: Body & Recovery ──────────────────────────────────────── */}
      <GroupLabel>Body &amp; Recovery</GroupLabel>

      {/* Sleep — AUTO */}
      <Section
        title="Sleep"
        badge={<SourceBadge label="AUTO · Oura" auto />}
        summary={`${OURA_DATA.totalSleep} · HRV ${OURA_DATA.hrv} ms`}
        filled
        open={openSection === 'sleep'}
        onToggle={() => toggle('sleep')}
      >
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
          Synced from Oura Ring Gen 3 · 2 hours ago
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatTile label="Total Sleep" value={OURA_DATA.totalSleep} />
          <StatTile label="Efficiency" value={`${OURA_DATA.efficiency}%`} />
          <StatTile label="HRV" value={`${OURA_DATA.hrv} ms`} sub="avg overnight" />
          <StatTile label="Resting HR" value={`${OURA_DATA.restingHR} bpm`} />
        </div>
      </Section>

      {/* Stress — MANUAL */}
      <Section
        title="Stress / Mood"
        badge={<SourceBadge label="MANUAL" auto={false} />}
        summary={stress ? STRESS_LABELS[stress] : 'Not logged'}
        filled={stress !== null}
        open={openSection === 'stress'}
        onToggle={() => toggle('stress')}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {([1, 2, 3, 4, 5] as StressLevel[]).map(n => (
            <button
              key={n!}
              onClick={() => setStress(n)}
              style={{
                flex: 1, padding: '12px 4px', borderRadius: 10, textAlign: 'center',
                border: stress === n ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: stress === n ? 'rgba(139,92,246,0.1)' : 'var(--color-bg-raised)',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600, color: stress === n ? '#A78BFA' : 'var(--color-text-secondary)' }}>{n}</span>
              <span style={{ fontSize: 10, color: stress === n ? '#A78BFA' : 'var(--color-text-tertiary)' }}>{STRESS_LABELS[n!]}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Group 2: Nutrition & Timing ───────────────────────────────────── */}
      <GroupLabel>Nutrition &amp; Timing</GroupLabel>

      {/* Meal Quality — MANUAL */}
      <Section
        title="Meal quality"
        badge={<SourceBadge label="MANUAL" auto={false} />}
        summary={meal ? (meal === 'whole' ? 'Whole foods' : meal === 'mixed' ? 'Mixed' : 'Processed') : 'Not logged'}
        filled={meal !== null}
        open={openSection === 'meal'}
        onToggle={() => toggle('meal')}
      >
        <div style={{ display: 'flex', gap: 10 }}>
          {(['whole', 'mixed', 'processed'] as MealCategory[]).map(cat => (
            <button
              key={cat!}
              onClick={() => setMeal(cat)}
              style={{
                flex: 1, padding: '16px 12px', borderRadius: 10,
                border: meal === cat ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: meal === cat ? 'rgba(139,92,246,0.1)' : 'var(--color-bg-raised)',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{ fontSize: 22 }}>{cat === 'whole' ? '🥗' : cat === 'mixed' ? '🍱' : '🍔'}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: meal === cat ? '#A78BFA' : 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{cat}</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                {cat === 'whole' ? 'Mostly vegetables, legumes, whole grains'
                  : cat === 'mixed' ? 'Mix of whole and processed foods'
                    : 'Mostly processed or fast food'}
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* Meal Timing — AUTO (Dexcom) */}
      <Section
        title="Meal timing & overnight fast"
        badge={<SourceBadge label="AUTO · Dexcom" auto />}
        summary={`Last meal ${CGM_MEAL_TIMING.lastMealTime} · Fast ${CGM_MEAL_TIMING.overnightFast}`}
        filled
        open={openSection === 'mealTiming'}
        onToggle={() => toggle('mealTiming')}
      >
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
          Detected via glucose inflection points · Dexcom G7 · live
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <StatTile label="Last meal" value={CGM_MEAL_TIMING.lastMealTime} sub="yesterday" />
          <StatTile label="First meal" value={CGM_MEAL_TIMING.firstMealTime} sub="this morning" />
          <StatTile label="Overnight fast" value={CGM_MEAL_TIMING.overnightFast} sub={CGM_MEAL_TIMING.fastRating} />
        </div>
        <div style={{
          padding: '10px 14px', borderRadius: 8,
          background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)',
          fontSize: 13, color: 'var(--color-text-secondary)',
        }}>
          {CGM_MEAL_TIMING.fastTip}
        </div>
      </Section>

      {/* Alcohol — MANUAL */}
      <Section
        title="Alcohol"
        badge={<SourceBadge label="MANUAL" auto={false} />}
        summary={alcohol !== null ? `${alcohol === 3 ? '3+' : alcohol} drink${alcohol === 1 ? '' : 's'}` : 'Not logged'}
        filled={alcohol !== null}
        open={openSection === 'alcohol'}
        onToggle={() => toggle('alcohol')}
      >
        <div style={{ display: 'flex', gap: 10 }}>
          {[0, 1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => setAlcohol(n)}
              style={{
                flex: 1, padding: '14px 8px', borderRadius: 10, textAlign: 'center',
                border: alcohol === n ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: alcohol === n ? 'rgba(139,92,246,0.1)' : 'var(--color-bg-raised)',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 18, fontWeight: 600,
                color: alcohol === n ? '#A78BFA' : 'var(--color-text-secondary)',
              }}
            >
              {n === 3 ? '3+' : n}
            </button>
          ))}
        </div>
      </Section>

      {/* Glucose — AUTO */}
      <Section
        title="Glucose"
        badge={<SourceBadge label="AUTO · Dexcom" auto />}
        summary={`TIR ${DEXCOM_DATA.timeInRange}% · ${DEXCOM_DATA.variabilityScore} variability`}
        filled
        open={openSection === 'glucose'}
        onToggle={() => toggle('glucose')}
      >
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
          Synced from Dexcom G7 · live
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatTile label="Time in Range" value={`${DEXCOM_DATA.timeInRange}%`} sub="70–180 mg/dL" />
          <StatTile label="Peak Today" value={`${DEXCOM_DATA.peakGlucose} mg/dL`} />
          <StatTile label="Variability" value={DEXCOM_DATA.variabilityScore} sub="low = better" />
        </div>
      </Section>

      {/* ── Group 3: Movement ─────────────────────────────────────────────── */}
      <GroupLabel>Movement</GroupLabel>

      {/* Exercise — HYBRID */}
      <Section
        title="Exercise"
        badge={<SourceBadge label="AUTO · Oura" auto />}
        summary={`${OURA_DATA.detectedActivity} · ${OURA_DATA.activeCalories} kcal`}
        filled
        open={openSection === 'exercise'}
        onToggle={() => toggle('exercise')}
      >
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
          Oura detected: <strong style={{ color: 'var(--color-text-secondary)' }}>{OURA_DATA.detectedActivity}</strong>
          &nbsp;·&nbsp;{OURA_DATA.steps.toLocaleString()} steps · {OURA_DATA.activeCalories} kcal
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 10, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          MANUAL · Anything Oura may have missed?
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['none', 'strength', 'yoga', 'other'] as MissedExercise[]).map(e => (
            <button
              key={e!}
              onClick={() => setMissedExercise(e)}
              style={{
                flex: 1, padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                border: missedExercise === e ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: missedExercise === e ? 'rgba(139,92,246,0.1)' : 'var(--color-bg-raised)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 12, fontWeight: 500, textTransform: 'capitalize',
                color: missedExercise === e ? '#A78BFA' : 'var(--color-text-secondary)',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </Section>

      {/* Post-meal walk — MANUAL */}
      <Section
        title="Post-meal walk"
        badge={<SourceBadge label="MANUAL" auto={false} />}
        summary={walked === null ? 'Not logged' : walked ? `Yes · ${walkMinutes} min` : 'No'}
        filled={walked !== null}
        open={openSection === 'walk'}
        onToggle={() => toggle('walk')}
      >
        {/* #1 habit callout */}
        <div style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 8, background: 'rgba(20,184,166,0.07)', border: '1px solid rgba(20,184,166,0.15)', fontSize: 12, color: '#14B8A6' }}>
          ★ Your #1 ranked age-decelerating habit right now
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[true, false].map(val => (
            <button
              key={String(val)}
              onClick={() => setWalked(val)}
              style={{
                flex: 1, padding: '14px 12px', borderRadius: 10, textAlign: 'center',
                border: walked === val ? `1.5px solid ${val ? '#14B8A6' : 'rgba(255,255,255,0.1)'}` : '1px solid rgba(255,255,255,0.06)',
                background: walked === val ? (val ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.04)') : 'var(--color-bg-raised)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 14, fontWeight: 600,
                color: walked === val ? (val ? '#14B8A6' : 'var(--color-text-secondary)') : 'var(--color-text-tertiary)',
              }}
            >
              {val ? '✓ Yes' : '✗ No'}
            </button>
          ))}
        </div>
        {walked === true && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>Duration</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[5, 10, 15, 20, 30].map(m => (
                <button
                  key={m}
                  onClick={() => setWalkMinutes(m)}
                  style={{
                    padding: '8px 14px', borderRadius: 8,
                    border: walkMinutes === m ? '1.5px solid #14B8A6' : '1px solid rgba(255,255,255,0.06)',
                    background: walkMinutes === m ? 'rgba(20,184,166,0.1)' : 'transparent',
                    color: walkMinutes === m ? '#14B8A6' : 'var(--color-text-tertiary)',
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                  }}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ── Group 4: Context ──────────────────────────────────────────────── */}
      <GroupLabel>Context</GroupLabel>

      {/* Hydration — MANUAL */}
      <Section
        title="Hydration"
        badge={<SourceBadge label="MANUAL" auto={false} />}
        summary={hydration ? (hydration === 'low' ? 'Low' : hydration === 'ok' ? 'OK' : 'Good') : 'Not logged'}
        filled={hydration !== null}
        open={openSection === 'hydration'}
        onToggle={() => toggle('hydration')}
      >
        <div style={{ display: 'flex', gap: 10 }}>
          {(['low', 'ok', 'good'] as HydrationLevel[]).map((h, i) => (
            <button
              key={h!}
              onClick={() => setHydration(h)}
              style={{
                flex: 1, padding: '14px 12px', borderRadius: 10, textAlign: 'center',
                border: hydration === h ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: hydration === h ? 'rgba(139,92,246,0.1)' : 'var(--color-bg-raised)',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 18 }}>{'💧'.repeat(i + 1)}</span>
              <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize', color: hydration === h ? '#A78BFA' : 'var(--color-text-secondary)' }}>{h}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Supplements — MANUAL */}
      <Section
        title="Supplements / Meds"
        badge={<SourceBadge label="MANUAL" auto={false} />}
        summary={supplementFlag === null ? 'Not logged' : supplementFlag ? 'Flagged' : 'Nothing unusual'}
        filled={supplementFlag !== null}
        open={openSection === 'supplements'}
        onToggle={() => toggle('supplements')}
      >
        <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
          Anything unusual today — new supplement, medication, or missed dose?
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: supplementFlag ? 14 : 0 }}>
          {[false, true].map(val => (
            <button
              key={String(val)}
              onClick={() => setSupplementFlag(val)}
              style={{
                flex: 1, padding: '12px', borderRadius: 10, textAlign: 'center',
                border: supplementFlag === val ? '1.5px solid var(--color-violet)' : '1px solid rgba(255,255,255,0.06)',
                background: supplementFlag === val ? 'rgba(139,92,246,0.1)' : 'var(--color-bg-raised)',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 14, fontWeight: 600,
                color: supplementFlag === val ? '#A78BFA' : 'var(--color-text-tertiary)',
              }}
            >
              {val ? 'Yes' : 'No'}
            </button>
          ))}
        </div>
        {supplementFlag && (
          <input
            type="text"
            placeholder="What? (optional)"
            value={supplementNote}
            onChange={e => setSupplementNote(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 8,
              background: 'var(--color-bg-base)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--color-text-primary)', fontSize: 14,
              fontFamily: 'inherit', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        )}
      </Section>

      {/* Notes — MANUAL */}
      <Section
        title="Notes"
        badge={<SourceBadge label="MANUAL" auto={false} />}
        summary={notes.trim() ? `"${notes.slice(0, 28)}${notes.length > 28 ? '…' : ''}"` : 'Optional'}
        filled={notes.trim().length > 0}
        open={openSection === 'notes'}
        onToggle={() => toggle('notes')}
      >
        <input
          type="text"
          placeholder="Travel day, stressed, ate late…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{
            width: '100%', padding: '11px 14px', borderRadius: 8,
            background: 'var(--color-bg-base)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--color-text-primary)', fontSize: 14,
            fontFamily: 'inherit', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </Section>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        style={{
          marginTop: 4,
          padding: '14px 28px', borderRadius: 10,
          background: 'var(--color-violet)',
          border: 'none',
          color: '#fff',
          fontSize: 15, fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'opacity 150ms ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        Log today →
        {filledCount < totalManual && (
          <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.6 }}>
            ({totalManual - filledCount} fields skipped)
          </span>
        )}
      </button>

    </div>
  );
}

// ─── Group label helper ───────────────────────────────────────────────────────
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      marginTop: 8,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: 'var(--color-text-tertiary)',
      paddingLeft: 2,
    }}>
      {children}
    </div>
  );
}
