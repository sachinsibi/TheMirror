import { useEffect, useState } from 'react';
import { ChevronRight, Footprints, Moon, Salad, Heart, Clock } from 'lucide-react';
import EvidenceBadge from '../components/scoreboard/EvidenceBadge';
import Card from '../components/ui/Card';
import { SCOREBOARD_HABITS, WEEKLY_TREND } from '../data/synthetic';
import { SparklineChart } from '../components/scoreboard/SparklineChart';

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  walk: Footprints,
  moon: Moon,
  salad: Salad,
  heart: Heart,
  clock: Clock,
};

const EFFORT_LABELS: Record<string, { icon: string; label: string; color: string }> = {
  'Low effort · High impact': { icon: '⚡', label: 'High impact, low effort', color: '#14B8A6' },
  'Medium effort · High impact': { icon: '🔥', label: 'High impact, medium effort', color: '#F59E0B' },
  'Medium effort · Medium impact': { icon: '⚖️', label: 'Medium impact, medium effort', color: '#94A3B8' },
  'High effort · Medium impact': { icon: '💪', label: 'Medium impact, high effort', color: '#94A3B8' },
  'Low effort · Low impact': { icon: '🌱', label: 'Low impact, low effort', color: '#475569' },
};

interface ScoreboardProps {
  onNavigateToSandbox: (interventionId: string) => void;
}

function ImpactBar({ impact, maxImpact, mounted }: { impact: number; maxImpact: number; mounted: boolean }) {
  const pct = (impact / maxImpact) * 100;
  return (
    <div style={{ height: 4, background: 'var(--color-bg-raised)', borderRadius: 2, overflow: 'hidden', flex: 1, maxWidth: 120 }}>
      <div style={{
        height: '100%',
        width: mounted ? `${pct}%` : '0%',
        background: 'var(--color-teal)',
        borderRadius: 2,
        transition: 'width 500ms cubic-bezier(0.16, 1, 0.3, 1)',
      }} />
    </div>
  );
}

export default function Scoreboard({ onNavigateToSandbox }: ScoreboardProps) {
  const [mounted, setMounted] = useState(false);
  const maxImpact = Math.max(...SCOREBOARD_HABITS.map(h => h.impact));
  const topHabit = SCOREBOARD_HABITS[0];

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Page header */}
      <div style={{ marginBottom: 4 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Habit Scoreboard
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
          What's causing this — and what can you actually change?
        </p>
      </div>

      {/* Weekly trend card */}
      <Card style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              This Week vs Last Week
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
              {WEEKLY_TREND.headline}{' '}
              <span style={{ color: 'var(--color-text-secondary)' }}>{WEEKLY_TREND.driver}</span>
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            <SparklineChart data={WEEKLY_TREND.sparkline} />
            <span style={{ fontSize: 13, color: '#14B8A6', fontWeight: 600 }}>↓ improving</span>
          </div>
        </div>
      </Card>

      {/* Two-column opportunity + risk */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* #1 Opportunity */}
        <Card
          accent="teal"
          hover
          onClick={() => onNavigateToSandbox(topHabit.interventionId)}
          style={{ padding: '18px 20px', paddingLeft: 17, cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: '#14B8A6', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
            #1 Opportunity
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
            {topHabit.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#14B8A6', fontWeight: 600 }}>{topHabit.impactLabel}</span>
            <EvidenceBadge grade={topHabit.evidence} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{topHabit.effort}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, color: '#14B8A6', fontSize: 12, fontWeight: 500 }}>
            Explore in Sandbox <ChevronRight size={14} />
          </div>
        </Card>

        {/* #1 Risk — reframed as opportunity */}
        <Card
          accent="amber"
          style={{ padding: '18px 20px', paddingLeft: 17 }}
        >
          <div style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
            Your Biggest Opportunity
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 6 }}>
            Earlier dinners
          </div>
          <div style={{ fontSize: 14, color: '#F59E0B', fontWeight: 600, marginBottom: 8 }}>
            ↓ up to 0.2 yr/yr if corrected
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Late-night eating is elevating your overnight glucose. Moving dinner earlier by 2 hours could decelerate aging by 0.2 years per year.
          </p>
        </Card>
      </div>

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          All habits ranked by impact
        </h2>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-text-tertiary)' }}>
          <span>Habit</span>
          <span style={{ width: 120, textAlign: 'right' }}>Impact</span>
          <span style={{ width: 100, textAlign: 'center' }}>Evidence</span>
          <span style={{ width: 40 }} />
        </div>
      </div>

      {/* Full ranked list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {SCOREBOARD_HABITS.map((habit, idx) => {
          const Icon = ICON_MAP[habit.icon] ?? Heart;
          const effort = EFFORT_LABELS[habit.effort] ?? EFFORT_LABELS['Low effort · Low impact'];
          return (
            <div
              key={habit.id}
              onClick={() => onNavigateToSandbox(habit.interventionId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                background: 'var(--color-bg-surface)',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'background 150ms ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#161720'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-surface)'; }}
            >
              {/* Rank */}
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', width: 16, textAlign: 'center', flexShrink: 0 }}>
                {idx + 1}
              </span>

              {/* Icon */}
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--color-bg-raised)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={17} color="var(--color-text-tertiary)" />
              </div>

              {/* Name + effort tag */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 3 }}>
                  {habit.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: effort.color }}>{effort.icon} {effort.label}</span>
                </div>
              </div>

              {/* Impact bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 160, flexShrink: 0 }}>
                <ImpactBar impact={habit.impact} maxImpact={maxImpact} mounted={mounted} />
                <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', width: 60 }}>
                  {habit.impactLabel}
                </span>
              </div>

              {/* Evidence badge */}
              <div style={{ width: 110, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                <EvidenceBadge grade={habit.evidence} />
              </div>

              <ChevronRight size={16} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      {/* Equity acknowledgment */}
      <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(148,163,184,0.05)', border: '1px solid rgba(148,163,184,0.1)', fontSize: 12, color: 'var(--color-text-tertiary)' }}>
        Access to whole foods and outdoor space varies. Even small shifts in the habits you can control count.
      </div>

    </div>
  );
}
