import { ArrowRight, Pen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import PaceGauge from '../components/dashboard/PaceGauge';
import Card from '../components/ui/Card';
import { USER } from '../data/synthetic';
import { getVerdictSentence } from '../engine/bridge';


// Synthetic monthly biological age data (past ~8 months + 3 projections)
const BIO_AGE_HISTORY = [
  { label: 'Jun', age: 59.1, projected: false },
  { label: 'Jul', age: 58.4, projected: false },
  { label: 'Aug', age: 58.2, projected: false },
  { label: 'Sep', age: 57.9, projected: false },
  { label: 'Oct', age: 57.8, projected: false },
  { label: 'Nov', age: 57.5, projected: false },
  { label: 'Dec', age: 57.3, projected: false },
  { label: 'Jan', age: 57.2, projected: false },
  { label: 'Feb', age: null, projected: true, projectedAge: 57.1 },
  { label: 'Apr', age: null, projected: true, projectedAge: 56.8 },
  { label: 'Jun', age: null, projected: true, projectedAge: 56.4 },
];

interface DashboardProps {
  onNavigateToProfile: () => void;
  onNavigateToBodyMap: () => void;
  onNavigateToLog: () => void;
}

export default function Dashboard({ onNavigateToProfile, onNavigateToBodyMap, onNavigateToLog }: DashboardProps) {
  const verdict = getVerdictSentence(USER.dunedinPace);

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
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: 6, fontSize: 12, color: 'var(--color-text-secondary)', borderLeft: '2px solid #0D9488' }}>
              Late dinner is the main factor today.
            </div>
          </Card>

          {/* Biological Age Trend */}
          <Card style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Biological Age Trend
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 16, height: 2, background: '#F59E0B', borderRadius: 1 }} />
                  <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>Actual</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 16, height: 2, background: '#14B8A6', borderRadius: 1 }} />
                  <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>Projected</span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={BIO_AGE_HISTORY} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[55, 60]}
                    tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}
                    axisLine={false}
                    tickLine={false}
                    tickCount={3}
                  />
                  <Tooltip
                    contentStyle={{ background: '#1A1B25', border: '1px solid #222222', borderRadius: 6, fontSize: 11 }}
                    labelStyle={{ color: 'var(--color-text-tertiary)' }}
                    itemStyle={{ color: '#F59E0B' }}
                    formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)} yrs`, 'Bio Age']}
                  />
                  <ReferenceLine y={USER.chronologicalAge} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="age"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', r: 3 }}
                    activeDot={{ r: 4 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedAge"
                    stroke="#14B8A6"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    dot={{ fill: '#14B8A6', r: 3 }}
                    activeDot={{ r: 4 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: '#14B8A6' }}>↓ 1.9 yrs</span>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>reduced since Jun 2025 · on track</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Age + Devices — side by side */}
      <div style={{ display: 'flex', gap: 16 }}>

        {/* Age comparison — compact */}
        <Card style={{ padding: '16px 24px', flex: '0 0 auto', display: 'flex', flexDirection: 'column' }}>
          {/* Headings — top */}
          <div style={{ display: 'flex', gap: 28 }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Calendar Age
              </div>
            </div>
            <div style={{ width: 1 }} />
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Biological Age
              </div>
            </div>
          </div>
          {/* Numbers — vertically centered in remaining space */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 3 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                {USER.chronologicalAge}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>yrs</span>
            </div>
            <div style={{ width: 1, alignSelf: 'stretch', background: '#222222' }} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 3 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 600, color: '#F59E0B', lineHeight: 1 }}>
                {USER.biologicalAge.toFixed(1)}
              </span>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>yrs</span>
            </div>
          </div>
        </Card>

        {/* Devices */}
        <Card style={{ padding: '16px 20px', flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
            Devices
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'Oura Ring Gen 3', detail: 'Synced 2h ago', color: '#14B8A6' },
              { name: 'Dexcom G7', detail: 'Live', color: '#14B8A6' },
              { name: 'TruDiagnostic', detail: '43 days ago', color: '#F59E0B' },
            ].map(d => (
              <button
                key={d.name}
                onClick={onNavigateToProfile}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', padding: 0, textAlign: 'left',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500, flex: 1 }}>{d.name}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{d.detail}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <button
          onClick={onNavigateToBodyMap}
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
          Look at your Mirror <ArrowRight size={16} />
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



    </div>
  );
}
