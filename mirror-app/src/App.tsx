import { useState } from 'react';
import Sidebar, { type Screen } from './components/layout/Sidebar';
import Dashboard from './screens/Dashboard';
import Projections from './screens/Projections';
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

      <main className="main-scroll" style={{ marginLeft: 64, flex: 1, overflowX: 'hidden', overflowY: screen === 'bodymap' ? 'hidden' : 'auto', background: 'var(--color-bg-base)', position: 'relative' }}>
        {screen === 'bodymap' ? (
          <BodyMapScreen onNavigateToProjections={() => navigateTo('projections')} />
        ) : (
          <div style={{ padding: '40px 52px', maxWidth: 1100, margin: '0 auto' }}>
            {screen === 'home' && (
              <Dashboard
                onNavigateToProfile={() => navigateTo('profile')}
                onNavigateToProjections={() => navigateTo('projections')}
                onNavigateToLog={() => navigateTo('log')}
              />
            )}
            {screen === 'projections' && <Projections />}
            {screen === 'log' && (
              <DailyLog onNavigateToProjections={() => navigateTo('projections')} />
            )}
            {screen === 'profile' && <Profile />}
          </div>
        )}
      </main>
    </div>
  );
}
