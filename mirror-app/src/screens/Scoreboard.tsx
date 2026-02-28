import { useEffect, useState } from 'react';
import { ChevronRight, Footprints, Moon, Salad, Heart, Clock } from 'lucide-react';
import EvidenceBadge from '../components/scoreboard/EvidenceBadge';
import { SCOREBOARD_HABITS, WEEKLY_TREND } from '../data/synthetic';
import { SparklineChart } from '../components/scoreboard/SparklineChart';

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  walk: Footprints,
  moon: Moon,
  salad: Salad,
  heart: Heart,
  clock: Clock,
};

interface ScoreboardProps {
  onNavigateToSandbox: (interventionId: string) => void;
}

function ImpactBar({ impact, maxImpact, mounted }: { impact: number; maxImpact: number; mounted: boolean }) {
  const pct = (impact / maxImpact) * 100;
  return (
    <div style={{ height: 6, background: '#1A1B25', borderRadius: 3, overflow: 'hidden', flex: 1 }}>
      <div
        style={{
          height: '100%',
          width: mounted ? `${pct}%` : '0%',
          background: 'var(--color-teal)',
          borderRadius: 3,
          transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </div>
  );
}

export default function Scoreboard({ onNavigateToSandbox }: ScoreboardProps) {
  const [mounted, setMounted] = useState(false);
  const maxImpact = Math.max(...SCOREBOARD_HABITS.map(h => h.impact));

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const topHabit = SCOREBOARD_HABITS[0];
  const restHabits = SCOREBOARD_HABITS.slice(1);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Weekly Trend Card */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 8,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          border: '1px solid #1A1B25',
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: 15, lineHeight: 1.6 }}>
            {WEEKLY_TREND.headline}{' '}
            <span style={{ color: 'var(--color-text-secondary)' }}>{WEEKLY_TREND.driver}</span>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <SparklineChart data={WEEKLY_TREND.sparkline} />
          <span style={{ color: '#14B8A6', fontSize: 18 }}>↓</span>
        </div>
      </div>

      {/* #1 Opportunity Card */}
      <div
        style={{
          background: 'var(--color-bg-surface)',
          borderRadius: 8,
          padding: '20px 24px',
          border: '1px solid #1A1B25',
          borderLeft: '3px solid var(--color-teal)',
          cursor: 'pointer',
          transition: 'background 150ms ease',
        }}
        onClick={() => onNavigateToSandbox(topHabit.interventionId)}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#151620'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-surface)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--color-teal)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                #1 Opportunity
              </span>
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {topHabit.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ color: '#14B8A6', fontSize: 15, fontWeight: 600 }}>{topHabit.impactLabel}</span>
              <EvidenceBadge grade={topHabit.evidence} />
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
              {topHabit.effort}
            </p>
          </div>
          <ChevronRight size={20} color="var(--color-text-tertiary)" style={{ marginTop: 4, flexShrink: 0 }} />
        </div>
      </div>

      {/* Ranked Habit List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {restHabits.map((habit) => {
          const Icon = ICON_MAP[habit.icon] ?? Heart;
          return (
            <div
              key={habit.id}
              onClick={() => onNavigateToSandbox(habit.interventionId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                height: 64,
                padding: '0 16px',
                background: 'var(--color-bg-surface)',
                borderRadius: 8,
                border: '1px solid #1A1B25',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#151620'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-surface)'; }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--color-bg-raised)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color="var(--color-text-tertiary)" />
              </div>

              {/* Name + bar */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {habit.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ImpactBar impact={habit.impact} maxImpact={maxImpact} mounted={mounted} />
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>
                    {habit.impactLabel}
                  </span>
                </div>
              </div>

              {/* Badge + chevron */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <EvidenceBadge grade={habit.evidence} />
                <ChevronRight size={16} color="var(--color-text-tertiary)" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
