import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './screens/Dashboard';
import Scoreboard from './screens/Scoreboard';
import Sandbox from './screens/Sandbox';
import Profile from './screens/Profile';

type Screen = 'dashboard' | 'scoreboard' | 'sandbox' | 'profile';

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [preloadedInterventionId, setPreloadedInterventionId] = useState<string>('current');

  const navigateToSandbox = (interventionId: string) => {
    setPreloadedInterventionId(interventionId);
    setScreen('sandbox');
  };

  const navigateToProfile = () => {
    setScreen('profile');
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: 'var(--color-bg-base)',
        overflow: 'hidden',
      }}
    >
      <Sidebar active={screen} onNavigate={setScreen} />

      {/* Main content */}
      <main
        style={{
          marginLeft: 240,
          flex: 1,
          overflowY: 'auto',
          padding: '48px 64px',
          background: 'var(--color-bg-base)',
        }}
      >
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          {screen === 'dashboard' && (
            <Dashboard onNavigateToProfile={navigateToProfile} />
          )}
          {screen === 'scoreboard' && (
            <Scoreboard onNavigateToSandbox={navigateToSandbox} />
          )}
          {screen === 'sandbox' && (
            <Sandbox
              key={preloadedInterventionId}
              preloadedInterventionId={preloadedInterventionId}
            />
          )}
          {screen === 'profile' && <Profile />}
        </div>
      </main>
    </div>
  );
}
