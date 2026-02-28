import { useState } from 'react';
import { ArrowRight, Pen, ChevronRight, TrendingDown, Star } from 'lucide-react';
import PaceGauge from '../components/dashboard/PaceGauge';
import Card from '../components/ui/Card';
import { USER, WEEKLY_TREND } from '../data/synthetic';
import { getVerdictSentence } from '../engine/bridge';
import { SparklineChart } from '../components/scoreboard/SparklineChart';

interface DashboardProps {
  onNavigateToProfile: () => void;
  onNavigateToScoreboard: () => void;
  onNavigateToLog: () => void;
}

export default function Dashboard({ onNavigateToProfile, onNavigateToScoreboard, onNavigateToLog }: DashboardProps) {
  const [questDismissed, setQuestDismissed] = useState(false);
  const verdict = getVerdictSentence(USER.dunedinPace);
  const pctFaster = Math.round((USER.dunedinPace - 1) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Page header */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Good morning, James.
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
          February 28, 2026 · Day 14 of logging
        </p>
      </div>

      {/* Two-column hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* LEFT — Pace gauge card */}
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 24px' }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
            Pace of Aging
          </p>
          <PaceGauge
            pace={USER.dunedinPace}
            paceRange={USER.paceRange}
            size="full"
            animated={true}
          />
          <p style={{ margin: '16px 0 0', fontSize: 14, color: 'var(--color-text-secondary)', textAlign: 'center', lineHeight: 1.6 }}>
            {verdict}
          </p>
          {/* Data source pills */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'Oura', color: '#14B8A6' },
              { label: 'Dexcom', color: '#14B8A6' },
              { label: 'TruDiagnostic', color: '#F59E0B' },
            ].map(s => (
              <button
                key={s.label}
                onClick={onNavigateToProfile}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 20,
                  background: 'var(--color-bg-raised)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 11, color: 'var(--color-text-secondary)',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                {s.label}
              </button>
            ))}
          </div>
        </Card>

        {/* RIGHT — stack of three info cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Today's Aging Impact Card */}
          <Card style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
              Today's Aging Impact
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, fontWeight: 600, color: '#F59E0B', lineHeight: 1 }}>
                +1.1
              </span>
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                days added to bio age
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                Yesterday: <span style={{ color: '#14B8A6' }}>+0.7 days</span>
              </div>
              <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                Today is working <span style={{ color: '#F59E0B' }}>against</span> you
              </div>
            </div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--color-bg-surface)', borderRadius: 6, fontSize: 12, color: 'var(--color-text-secondary)', borderLeft: '2px solid #B45309' }}>
              Late dinner is the main factor today.
            </div>
          </Card>

          {/* Your Story This Week */}
          <Card style={{ padding: '18px 20px', flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
              Your Story This Week
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
              Your sleep dropped below 6 hours on Tuesday and Wednesday. Your inflammatory load climbed 12% by Thursday.{' '}
              <span style={{ color: '#14B8A6' }}>
                Your post-meal walks on Friday and Saturday have started pulling it back down.
              </span>
            </p>
            {/* 30-day sparkline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>30-day trend</span>
              <SparklineChart data={WEEKLY_TREND.sparkline} />
              <span style={{ fontSize: 13, color: '#14B8A6' }}>↓ 4%</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Bio age comparison row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          { label: 'Calendar Age', value: String(USER.chronologicalAge), unit: 'years', color: 'var(--color-text-primary)' },
          { label: 'Biological Age', value: USER.biologicalAge.toFixed(1), unit: 'years', color: '#F59E0B' },
          { label: 'Difference', value: `+${(USER.biologicalAge - USER.chronologicalAge).toFixed(1)}`, unit: `aging ${pctFaster}% faster`, color: '#F59E0B' },
        ].map(stat => (
          <Card key={stat.label} style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              {stat.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 600, color: stat.color, lineHeight: 1 }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{stat.unit}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Quest strip */}
      {!questDismissed && (
        <Card style={{ padding: '14px 20px', background: 'var(--color-bg-surface)', border: '1.5px solid #6D28D9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Star size={16} color="#8B5CF6" />
              <div>
                <span style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  Log 5 days this week
                </span>
                <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: '0 8px' }}>·</span>
                <span style={{ fontSize: 13, color: '#A78BFA' }}>Day 3 of 5</span>
              </div>
              {/* Progress dots */}
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(d => (
                  <div key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: d <= 3 ? '#8B5CF6' : 'rgba(139,92,246,0.2)' }} />
                ))}
              </div>
            </div>
            <button onClick={() => setQuestDismissed(true)} style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
          </div>
        </Card>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <button
          onClick={onNavigateToScoreboard}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 24px',
            borderRadius: 8,
            background: 'var(--color-violet)',
            border: 'none',
            color: '#fff',
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'opacity 150ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        >
          See What's Driving This <ArrowRight size={16} />
        </button>
        <button
          onClick={onNavigateToLog}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px',
            borderRadius: 8,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--color-text-secondary)',
            fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Pen size={14} /> Log Today
        </button>
      </div>

      {/* Post-test nudge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 8, background: 'var(--color-bg-surface)', border: '1px solid #0D9488' }}>
        <TrendingDown size={16} color="#14B8A6" />
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          Your projection is ready to verify. See how accurate we were.
        </span>
        <button onClick={onNavigateToProfile} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#14B8A6', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
          View Profile <ChevronRight size={14} />
        </button>
      </div>

    </div>
  );
}
