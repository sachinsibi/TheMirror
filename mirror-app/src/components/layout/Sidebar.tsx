import {
  Home, TrendingUp, ActivitySquare, BookOpen
} from 'lucide-react';

export type Screen = 'home' | 'scoreboard' | 'bodymap' | 'log' | 'profile';

interface SidebarProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
}

const NAV: { id: Screen; Icon: typeof Home }[] = [
  { id: 'home', Icon: Home },
  { id: 'scoreboard', Icon: TrendingUp },
  { id: 'bodymap', Icon: ActivitySquare },
  { id: 'log', Icon: BookOpen },
];

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside
      style={{
        width: 60,
        minWidth: 60,
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
      }}
    >
      {/* Logo icon */}
      <div style={{ padding: '20px 0 16px' }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #8B5CF6, #14B8A6)',
            flexShrink: 0,
          }}
        />
      </div>

      <div style={{ height: 1, width: 28, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
        {NAV.map(({ id, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'rgba(139,92,246,0.12)' : 'transparent',
                color: isActive ? '#A78BFA' : 'var(--color-text-tertiary)',
                transition: 'background 150ms ease, color 150ms ease',
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
              <Icon size={20} />
            </button>
          );
        })}
      </nav>

      {/* Profile avatar — pinned to bottom */}
      <div style={{ marginTop: 'auto', paddingBottom: 16 }}>
        <div style={{ height: 1, width: 28, background: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
        <button
          onClick={() => onNavigate('profile')}
          style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: active === 'profile'
              ? 'linear-gradient(135deg, #8B5CF6, #14B8A6)'
              : 'rgba(139,92,246,0.15)',
            border: active === 'profile' ? '2px solid #8B5CF6' : '2px solid transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
            cursor: 'pointer',
            transition: 'border-color 150ms ease',
          }}
        >
          J
        </button>
      </div>
    </aside>
  );
}
