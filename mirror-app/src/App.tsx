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
        {/* BodyMap — full-page layout, always mounted to preserve state */}
        <div style={{ display: screen === 'bodymap' ? 'block' : 'none', width: '100%', height: '100%' }}>
          <BodyMapScreen onNavigateToProjections={() => navigateTo('projections')} />
        </div>

        {/* Padded screens — always mounted to preserve state */}
        <div style={{ display: screen !== 'bodymap' ? 'block' : 'none', padding: '40px 52px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: screen === 'home' ? 'block' : 'none' }}>
            <Dashboard
              onNavigateToProfile={() => navigateTo('profile')}
              onNavigateToBodyMap={() => navigateTo('bodymap')}
              onNavigateToLog={() => navigateTo('log')}
            />
          </div>
          <div style={{ display: screen === 'projections' ? 'block' : 'none' }}>
            <Projections />
          </div>
          <div style={{ display: screen === 'log' ? 'block' : 'none' }}>
            <DailyLog onNavigateToProjections={() => navigateTo('projections')} />
          </div>
          <div style={{ display: screen === 'profile' ? 'block' : 'none' }}>
            <Profile />
          </div>
        </div>
      </main>
    </div>
  );
}
