import { useState, useCallback } from 'react';
import BodyMapViz from '../components/sandbox/BodyMap';
import OrganViewer from '../components/bodymap/OrganViewer';
import OrganMetrics from '../components/bodymap/OrganMetrics';

interface OrganDetail {
  id: string;
  name: string;
  age: number;
  pace: number;
  trend: 'improving' | 'stable' | 'worsening';
  topFactor: string;
  dataSource: string;
  color: string;
  organPath: string;
}

const ORGAN_DETAILS: OrganDetail[] = [
  {
    id: 'neurological',
    name: 'Neurological',
    age: 56.4,
    pace: 1.14,
    trend: 'worsening',
    topFactor: 'Deep sleep declining — avg 1.4h (target 1.8h+)',
    dataSource: 'Brain · Wearable (sleep architecture: deep sleep, REM)',
    color: '#4ae616',
    organPath: '/models/brain.glb',
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    age: 55.8,
    pace: 1.08,
    trend: 'stable',
    topFactor: 'Resting HRV declining 3% week-over-week',
    dataSource: 'Heart · Wearable (HRV, resting HR)',
    color: '#4ae616',
    organPath: '/models/heart.glb',
  },
  {
    id: 'metabolic',
    name: 'Metabolic',
    age: 60.1,
    pace: 1.28,
    trend: 'worsening',
    topFactor: 'Post-meal glucose spikes (avg +47 mg/dL)',
    dataSource: 'Pancreas · CGM (glucose variability, postprandial response)',
    color: '#f5700b',
    organPath: '/models/pancreas.glb',
  },
  {
    id: 'endocrine',
    name: 'Endocrine',
    age: 57.0,
    pace: 1.10,
    trend: 'stable',
    topFactor: 'Circadian temperature rhythm irregular — late light exposure',
    dataSource: 'Thyroid · Wearable (temperature trends, HRV circadian) + CGM',
    color: '#eaea08',
    organPath: '/models/thyroid.glb',
  },
  {
    id: 'immune',
    name: 'Immune',
    age: 58.3,
    pace: 1.18,
    trend: 'improving',
    topFactor: 'Inflammatory load elevated by late dinners',
    dataSource: 'Spleen · Epigenetic (immunosenescence, inflammatory markers)',
    color: '#eaea08',
    organPath: '/models/spleen.glb',
  },
];

const ORGAN_DETAILS_FOR_VIZ = ORGAN_DETAILS.map(({ organPath, ...rest }) => rest);

// Persists across navigation, resets on browser refresh
let _persistedOrganId: string | null = null;

interface BodyMapScreenProps {
  onNavigateToScoreboard: () => void;
}

export default function BodyMapScreen({ onNavigateToScoreboard }: BodyMapScreenProps) {
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
                onNavigateToScoreboard={onNavigateToScoreboard}
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
