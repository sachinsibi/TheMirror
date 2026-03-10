import {
  Home, TrendingUp, ActivitySquare, BookOpen
} from 'lucide-react';

export type Screen = 'home' | 'projections' | 'bodymap' | 'log' | 'profile';

interface SidebarProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
}

const NAV: { id: Screen; Icon: typeof Home }[] = [
  { id: 'home', Icon: Home },
  { id: 'projections', Icon: TrendingUp },
  { id: 'bodymap', Icon: ActivitySquare },
  { id: 'log', Icon: BookOpen },
];

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside
      style={{
        width: 64,
        minWidth: 64,
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
        paddingTop: 20,
        paddingBottom: 20,
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: 'linear-gradient(135deg, #8B5CF6, #14B8A6)',
          flexShrink: 0,
          marginBottom: 8,
        }}
      />

      {/* Nav — positioned in the upper quarter of remaining space */}
      <nav style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 'calc(25vh - 131px)',
        gap: 6,
        width: '100%',
      }}>
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
                width: 48,
                height: 48,
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'rgba(139,92,246,0.14)' : 'transparent',
                color: isActive ? '#A78BFA' : 'rgba(255,255,255,0.28)',
                transition: 'background 150ms ease, color 150ms ease',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.28)';
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
                  height: 22,
                  borderRadius: '0 3px 3px 0',
                  background: '#8B5CF6',
                }} />
              )}
              <Icon size={26} />
            </button>
          );
        })}
      </nav>

      {/* Profile avatar — pinned to bottom */}
      <button
        onClick={() => onNavigate('profile')}
        style={{
          width: 36, height: 36,
          borderRadius: '50%',
          background: active === 'profile'
            ? 'linear-gradient(135deg, #8B5CF6, #14B8A6)'
            : 'rgba(139,92,246,0.18)',
          border: active === 'profile' ? '2px solid #8B5CF6' : '2px solid transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
          cursor: 'pointer',
          transition: 'border-color 150ms ease',
          flexShrink: 0,
        }}
      >
        J
      </button>
    </aside>
  );
}
