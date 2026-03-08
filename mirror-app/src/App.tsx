import { useState } from 'react';
import Sidebar, { type Screen } from './components/layout/Sidebar';
import Dashboard from './screens/Dashboard';
import Scoreboard from './screens/Scoreboard';
import Sandbox from './screens/Sandbox';
import BodyMapScreen from './screens/BodyMap';
import DailyLog from './screens/DailyLog';
import Profile from './screens/Profile';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [preloadedInterventionId, setPreloadedInterventionId] = useState<string>('current');

  const navigateTo = (s: Screen) => setScreen(s);

  const navigateToSandbox = (interventionId: string) => {
    setPreloadedInterventionId(interventionId);
    setScreen('sandbox');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--color-bg-base)', overflow: 'hidden' }}>
      <Sidebar active={screen} onNavigate={navigateTo} />

      <main style={{ marginLeft: 220, flex: 1, overflowY: 'auto', background: 'var(--color-bg-base)' }}>
        <div style={{ padding: '40px 52px', maxWidth: 1100, margin: '0 auto' }}>
          {screen === 'home' && (
            <Dashboard
              onNavigateToProfile={() => navigateTo('profile')}
              onNavigateToScoreboard={() => navigateTo('scoreboard')}
              onNavigateToLog={() => navigateTo('log')}
            />
          )}
          {screen === 'scoreboard' && (
            <Scoreboard onNavigateToSandbox={navigateToSandbox} />
          )}
          {screen === 'sandbox' && (
            <Sandbox key={preloadedInterventionId} preloadedInterventionId={preloadedInterventionId} />
          )}
          {screen === 'bodymap' && (
            <BodyMapScreen onNavigateToScoreboard={() => navigateTo('scoreboard')} />
          )}
          {screen === 'log' && (
            <DailyLog onNavigateToScoreboard={() => navigateTo('scoreboard')} />
          )}
          {screen === 'profile' && <Profile />}
        </div>
      </main>
    </div>
  );
}
