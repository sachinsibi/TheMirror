import { useState } from 'react';
import Sidebar, { type Screen } from './components/layout/Sidebar';
import Dashboard from './screens/Dashboard';
import Scoreboard from './screens/Scoreboard';
import BodyMapScreen from './screens/BodyMap';
import DailyLog from './screens/DailyLog';
import Profile from './screens/Profile';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  const navigateTo = (s: Screen) => setScreen(s);

  // Toggle class on <html> so CSS can fully hide scrollbars on bodymap
  document.documentElement.classList.toggle('bodymap-active', screen === 'bodymap');

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--color-bg-base)', overflow: 'hidden' }}>
      <Sidebar active={screen} onNavigate={navigateTo} />

      <main style={{ marginLeft: 60, flex: 1, overflow: screen === 'bodymap' ? 'hidden' : 'auto', background: 'var(--color-bg-base)', position: 'relative' }}>
        {screen === 'bodymap' ? (
          <BodyMapScreen onNavigateToScoreboard={() => navigateTo('scoreboard')} />
        ) : (
          <div style={{ padding: '40px 52px', maxWidth: 1100, margin: '0 auto' }}>
            {screen === 'home' && (
              <Dashboard
                onNavigateToProfile={() => navigateTo('profile')}
                onNavigateToScoreboard={() => navigateTo('scoreboard')}
                onNavigateToLog={() => navigateTo('log')}
              />
            )}
            {screen === 'scoreboard' && (
              <Scoreboard onNavigateToSandbox={() => { /* sandbox removed */ }} />
            )}
            {screen === 'log' && (
              <DailyLog onNavigateToScoreboard={() => navigateTo('scoreboard')} />
            )}
            {screen === 'profile' && <Profile />}
          </div>
        )}
      </main>
    </div>
  );
}
