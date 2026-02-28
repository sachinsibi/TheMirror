import { useState } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';

interface DailyLogProps {
  onNavigateToScoreboard: () => void;
}

type MealCategory = 'whole' | 'mixed' | 'processed' | null;
type StressLevel = 1 | 2 | 3 | 4 | 5 | null;

const STRESS_LABELS: Record<number, string> = {
  1: 'Calm',
  2: 'Low',
  3: 'Moderate',
  4: 'High',
  5: 'Overwhelmed',
};

export default function DailyLog({ onNavigateToScoreboard }: DailyLogProps) {
  const [meal, setMeal] = useState<MealCategory>(null);
  const [alcohol, setAlcohol] = useState(0);
  const [stress, setStress] = useState<StressLevel>(null);
  const [walked, setWalked] = useState<boolean | null>(null);
  const [walkMinutes, setWalkMinutes] = useState(10);
  const [submitted, setSubmitted] = useState(false);

  const streakBroken = false; // synthetic

  const canSubmit = meal !== null && stress !== null && walked !== null;

  const handleSubmit = () => {
    if (canSubmit) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
        <div style={{ marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Daily Log
          </h1>
        </div>

        {/* Success state */}
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
                {walked ? '+0.7' : '+1.1'} days
              </span>
              {' '}added to biological age.
            </div>
          </div>

          {/* Pace nudge */}
          <div style={{ padding: '12px 20px', background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 8, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Aging pace updated: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#14B8A6' }}>1.10×</span> (was 1.12×)
          </div>

          {/* Quest progress */}
          <div style={{ width: '100%', padding: '12px 16px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Day 4 of 5 logged this week.</span>
              <span style={{ fontSize: 12, color: '#A78BFA' }}>One more to unlock your weekly insight.</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,2,3,4,5].map(d => (
                <div key={d} style={{ flex: 1, height: 4, borderRadius: 2, background: d <= 4 ? '#8B5CF6' : 'rgba(139,92,246,0.2)' }} />
              ))}
            </div>
          </div>

          {/* Post-submit prompt */}
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>

      {/* Page header with streak */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Daily Log
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
            Under 60 seconds · Your data still counts either way.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {streakBroken ? (
            <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
              Streak reset. Day 1 again — your data still counts.
            </div>
          ) : (
            <>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 24, fontWeight: 700, color: '#8B5CF6', lineHeight: 1 }}>14</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>day streak · your longest</div>
            </>
          )}
        </div>
      </div>

      {/* Meal */}
      <Card style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
          Today's meals
        </div>
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
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 22 }}>{cat === 'whole' ? '🥗' : cat === 'mixed' ? '🍱' : '🍔'}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: meal === cat ? '#A78BFA' : 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                {cat}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                {cat === 'whole' ? 'Mostly vegetables, legumes, whole grains'
                  : cat === 'mixed' ? 'Mix of whole and processed foods'
                  : 'Mostly processed or fast food'}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Alcohol */}
      <Card style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
          Alcohol (drinks)
        </div>
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
      </Card>

      {/* Stress */}
      <Card style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
          Stress level today
        </div>
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
      </Card>

      {/* Post-meal walk */}
      <Card style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
          Post-meal walk?
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
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>Minutes</div>
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
      </Card>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          padding: '14px 28px', borderRadius: 10,
          background: canSubmit ? 'var(--color-violet)' : 'rgba(139,92,246,0.2)',
          border: 'none',
          color: canSubmit ? '#fff' : 'rgba(255,255,255,0.3)',
          fontSize: 15, fontWeight: 700,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          transition: 'background 150ms ease',
        }}
      >
        {canSubmit ? 'Log today →' : 'Complete all fields to log'}
      </button>

    </div>
  );
}
