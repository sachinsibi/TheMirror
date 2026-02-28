import {
  Home, Trophy, FlaskConical, User, BookOpen, ActivitySquare
} from 'lucide-react';

export type Screen = 'home' | 'scoreboard' | 'sandbox' | 'bodymap' | 'log' | 'profile';

interface SidebarProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
}

const NAV = [
  { id: 'home' as Screen, label: 'Home', Icon: Home },
  { id: 'scoreboard' as Screen, label: 'Scoreboard', Icon: Trophy },
  { id: 'sandbox' as Screen, label: 'Sandbox', Icon: FlaskConical },
  { id: 'bodymap' as Screen, label: 'Body Map', Icon: ActivitySquare },
  { id: 'log' as Screen, label: 'Daily Log', Icon: BookOpen },
  { id: 'profile' as Screen, label: 'Profile', Icon: User },
];

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside
      style={{
        width: 220,
        minWidth: 220,
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #8B5CF6, #14B8A6)',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
              Metabolic Mirror
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 1 }}>
              Advance Health 2026
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 16px 12px' }} />

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', padding: '0 10px', gap: 2 }}>
        {NAV.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                height: 44,
                padding: '0 12px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'rgba(139,92,246,0.12)' : 'transparent',
                color: isActive ? '#A78BFA' : 'var(--color-text-tertiary)',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
                transition: 'background 150ms ease, color 150ms ease',
                fontFamily: 'inherit',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-tertiary)';
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 20,
                  borderRadius: '0 3px 3px 0',
                  background: '#8B5CF6',
                }} />
              )}
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User badge */}
      <div style={{ marginTop: 'auto', padding: '16px 10px' }}>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B5CF6, #14B8A6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            J
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>James</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Age 52 · Bio age 57</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
