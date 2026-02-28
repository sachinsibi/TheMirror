import PaceGauge from '../components/dashboard/PaceGauge';
import DataSourcePills from '../components/dashboard/DataSourcePills';
import { USER } from '../data/synthetic';
import { getVerdictSentence } from '../engine/bridge';

interface DashboardProps {
  onNavigateToProfile: () => void;
}

export default function Dashboard({ onNavigateToProfile }: DashboardProps) {
  const verdict = getVerdictSentence(USER.dunedinPace);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '48px 0',
        gap: 0,
      }}
    >
      {/* Pace Gauge — hero element */}
      <div style={{ marginBottom: 8 }}>
        <PaceGauge
          pace={USER.dunedinPace}
          paceRange={USER.paceRange}
          size="full"
          animated={true}
        />
      </div>

      {/* Verdict sentence */}
      <p
        style={{
          margin: '28px 0 0',
          fontSize: 16,
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          maxWidth: 540,
          lineHeight: 1.6,
        }}
      >
        {verdict}
      </p>

      {/* Data source pills */}
      <div style={{ marginTop: 32 }}>
        <DataSourcePills onNavigateToProfile={onNavigateToProfile} />
      </div>
    </div>
  );
}
