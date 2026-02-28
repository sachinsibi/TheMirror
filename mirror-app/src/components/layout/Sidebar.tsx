import { LayoutDashboard, Trophy, FlaskConical, User } from 'lucide-react';

type Screen = 'dashboard' | 'scoreboard' | 'sandbox' | 'profile';

interface SidebarProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
}

const NAV_ITEMS: { id: Screen; label: string; Icon: React.ComponentType<{ size: number }> }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'scoreboard', label: 'Scoreboard', Icon: Trophy },
  { id: 'sandbox', label: 'Sandbox', Icon: FlaskConical },
  { id: 'profile', label: 'Profile', Icon: User },
];

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid #1A1B25',
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
      <div
        style={{
          padding: '28px 20px 24px',
          color: 'var(--color-text-tertiary)',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        Metabolic Mirror
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' }}>
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                height: 48,
                padding: '0 12px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'var(--color-bg-raised)' : 'transparent',
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                textAlign: 'left',
                transition: 'background 150ms ease, color 150ms ease',
                position: 'relative',
                boxShadow: isActive ? 'inset 3px 0 0 var(--color-violet)' : 'none',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-raised)';
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
              <Icon size={20} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom label */}
      <div
        style={{
          marginTop: 'auto',
          padding: '20px',
          color: 'var(--color-text-tertiary)',
          fontSize: 11,
          opacity: 0.5,
        }}
      >
        Advance Health Hackathon 2026
      </div>
    </aside>
  );
}
