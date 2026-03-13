import { useState, useCallback } from 'react';
import BodyMapViz from '../components/sandbox/BodyMap';
import OrganViewer from '../components/bodymap/OrganViewer';
import OrganMetrics from '../components/bodymap/OrganMetrics';

interface OrganDetail {
  id: string;
  name: string;
  age: number;
  ageRange: { low: number; high: number };
  pace: number;
  trend: 'improving' | 'stable' | 'worsening';
  factors: string[];
  dataSource: string;
  color: string;
  organPath: string;
}

const ORGAN_DETAILS: OrganDetail[] = [
  {
    id: 'neurological',
    name: 'Neurological',
    age: 56.4,
    ageRange: { low: 54.9, high: 57.9 },
    pace: 1.10,
    trend: 'worsening',
    factors: [
      'Deep sleep averaging 1.4h — target 1.8h+ for neurological repair',
      'Bedtime variance of ±1.8h disrupting sleep architecture and REM',
      'Elevated overnight cortisol suppressing restorative sleep stages',
    ],
    dataSource: 'Brain · Wearable (sleep architecture: deep sleep, REM)',
    color: '#4ae616',
    organPath: '/models/brain.glb',
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    age: 55.8,
    ageRange: { low: 54.3, high: 57.3 },
    pace: 1.09,
    trend: 'stable',
    factors: [
      'Resting HRV declining 3% week-over-week — now at 42ms',
      'Zone 2 cardio absent — fewer than 60 active minutes this week',
      'Sleep disruptions compressing overnight cardiovascular recovery',
    ],
    dataSource: 'Heart · Wearable (HRV, resting HR)',
    color: '#4ae616',
    organPath: '/models/heart.glb',
  },
  {
    id: 'metabolic',
    name: 'Metabolic',
    age: 60.1,
    ageRange: { low: 58.4, high: 61.8 },
    pace: 1.18,
    trend: 'worsening',
    factors: [
      'Post-meal glucose spikes averaging +47mg/dL above fasting baseline',
      'Late dinners (past 9pm) on 3 nights — elevating overnight fasting glucose',
      'No post-meal walks Tuesday or Wednesday — peak glucose spike days',
    ],
    dataSource: 'Pancreas · CGM (glucose variability, postprandial response)',
    color: '#f5700b',
    organPath: '/models/pancreas.glb',
  },
  {
    id: 'endocrine',
    name: 'Endocrine',
    age: 57.0,
    ageRange: { low: 55.5, high: 58.5 },
    pace: 1.12,
    trend: 'stable',
    factors: [
      'Meal timing variance of 2.4h disrupting cortisol and insulin rhythm',
      'Overnight fasting window averaging 10.2h — target 12h for hormonal reset',
      'Weekday morning HRV dips indicate sustained cortisol load',
    ],
    dataSource: 'Thyroid · Wearable (temperature trends, HRV circadian) + CGM',
    color: '#eaea08',
    organPath: '/models/thyroid.glb',
  },
  {
    id: 'immune',
    name: 'Immune',
    age: 58.3,
    ageRange: { low: 56.8, high: 59.8 },
    pace: 1.14,
    trend: 'improving',
    factors: [
      'Late-night eating compressing the overnight inflammatory repair window',
      'Post-meal glucose excursions driving low-grade glycation stress',
      'Improved sleep consistency this week reducing inflammatory marker load',
    ],
    dataSource: 'Spleen · Epigenetic (immunosenescence, inflammatory markers)',
    color: '#eaea08',
    organPath: '/models/spleen.glb',
  },
];

const ORGAN_DETAILS_FOR_VIZ = ORGAN_DETAILS.map(({ organPath, ...rest }) => rest);

// Persists across navigation, resets on browser refresh
let _persistedOrganId: string | null = null;

interface BodyMapScreenProps {
  onNavigateToProjections: () => void;
}

export default function BodyMapScreen({ onNavigateToProjections }: BodyMapScreenProps) {
  const [selectedOrgan, setSelectedOrgan] = useState<OrganDetail | null>(
    () => _persistedOrganId ? (ORGAN_DETAILS.find(o => o.id === _persistedOrganId) ?? null) : null
  );

  const handleZoneClick = useCallback((zoneId: string) => {
    setSelectedOrgan(prev => {
      const next = prev?.id === zoneId ? null : (ORGAN_DETAILS.find(o => o.id === zoneId) ?? null);
      _persistedOrganId = next?.id ?? null;
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    _persistedOrganId = null;
    setSelectedOrgan(null);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Page title — top left overlay */}
      <div style={{
        position: 'absolute', top: 40, left: 168, zIndex: 20,
        pointerEvents: 'none',
      }}>
        <h1 style={{
          margin: 0, fontSize: 22, fontWeight: 700,
          color: 'var(--color-text-primary)', letterSpacing: '-0.02em',
        }}>
          Body Map
        </h1>
      </div>

      {/* Full-page 3D body */}
      <BodyMapViz
        fullPage
        organDetails={ORGAN_DETAILS_FOR_VIZ}
        onZoneClick={handleZoneClick}
        onEmptyClick={handleClose}
      />

      {/* Permanent right panel — always visible */}
      <div className="bodymap-organ-panel" onClick={e => e.stopPropagation()}>

        {/* Top screen card — 3D organ model */}
        <div className="bodymap-screen-card">
          {selectedOrgan ? (
            <OrganViewer
              key={selectedOrgan.id}
              organPath={selectedOrgan.organPath}
              color={selectedOrgan.color}
            />
          ) : (
            <div className="bodymap-empty-screen">
              <span className="bodymap-empty-label">Nothing to Show</span>
            </div>
          )}
        </div>

        {/* Bottom screen card — organ data */}
        <div className="bodymap-screen-card scrollable">
          {selectedOrgan ? (
            <div style={{ padding: '22px 24px' }}>
              <OrganMetrics
                organ={selectedOrgan}
                onClose={handleClose}
                onNavigateToProjections={onNavigateToProjections}
              />
            </div>
          ) : (
            <div className="bodymap-empty-screen">
              <span className="bodymap-empty-hint">
                Hover over a region on the body, then click to see detailed aging data.
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
