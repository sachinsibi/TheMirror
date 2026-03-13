import { useState } from 'react';
import {
  Home, TrendingUp, ActivitySquare, BookOpen
} from 'lucide-react';

export type Screen = 'home' | 'projections' | 'bodymap' | 'log' | 'profile';

interface SidebarProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
}

const NAV: { id: Screen; Icon: typeof Home; label: string }[] = [
  { id: 'home', Icon: Home, label: 'Home' },
  { id: 'bodymap', Icon: ActivitySquare, label: 'Body Map' },
  { id: 'projections', Icon: TrendingUp, label: 'Projections' },
  { id: 'log', Icon: BookOpen, label: 'Daily Log' },
];

const COLLAPSED_W = 64;
const EXPANDED_W = 200;

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        width: expanded ? EXPANDED_W : COLLAPSED_W,
        minWidth: expanded ? EXPANDED_W : COLLAPSED_W,
        background: expanded ? '#131315' : 'transparent',
        borderRight: expanded ? '1px solid #222222' : '1px solid transparent',
        borderRadius: expanded ? '0 16px 16px 0' : 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: expanded ? 'stretch' : 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
        paddingTop: 20,
        paddingBottom: 20,
        transition: 'width 200ms ease, min-width 200ms ease, background 200ms ease, border-color 200ms ease, top 200ms ease, bottom 200ms ease, border-radius 200ms ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <img
        src="/Mirror_Logo_cropped.png"
        alt="Mirror"
        style={{
          width: expanded ? 140 : 100,
          height: expanded ? 70 : 50,
          objectFit: 'contain',
          flexShrink: 0,
          marginBottom: 8,
          marginLeft: 'auto',
          marginRight: 'auto',
          transition: 'width 200ms ease, height 200ms ease',
        }}
      />

      {/* Nav */}
      <nav style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: expanded ? 'stretch' : 'center',
        justifyContent: 'flex-start',
        paddingTop: 'calc(25vh - 131px)',
        gap: 4,
        width: '100%',
        paddingLeft: expanded ? 8 : 0,
        paddingRight: expanded ? 8 : 0,
        transition: 'padding 200ms ease',
      }}>
        {NAV.map(({ id, Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: expanded ? 'flex-start' : 'center',
                gap: 12,
                width: expanded ? '100%' : 48,
                height: 48,
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'rgba(20,184,166,0.14)' : 'transparent',
                color: isActive ? '#5EEAD4' : 'rgba(255,255,255,0.28)',
                transition: 'background 150ms ease, color 150ms ease, width 200ms ease, justify-content 200ms ease',
                position: 'relative',
                paddingLeft: expanded ? 14 : 0,
                paddingRight: expanded ? 14 : 0,
                fontFamily: 'inherit',
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
                  background: '#14B8A6',
                }} />
              )}
              <Icon size={26} style={{ flexShrink: 0 }} />
              {expanded && (
                <span style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  color: isActive ? '#5EEAD4' : 'rgba(255,255,255,0.5)',
                }}>
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile avatar — pinned to bottom */}
      <button
        onClick={() => onNavigate('profile')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: expanded ? 'calc(100% - 16px)' : 36,
          height: expanded ? 44 : 36,
          borderRadius: expanded ? 10 : '50%',
          background: active === 'profile'
            ? (expanded ? 'rgba(20,184,166,0.14)' : 'linear-gradient(135deg, #14B8A6, #14B8A6)')
            : (expanded ? 'transparent' : 'rgba(20,184,166,0.18)'),
          border: active === 'profile' && !expanded ? '2px solid #14B8A6' : '2px solid transparent',
          justifyContent: expanded ? 'flex-start' : 'center',
          paddingLeft: expanded ? 14 : 0,
          paddingRight: expanded ? 14 : 0,
          fontSize: 13, fontWeight: 700, color: '#fff',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 200ms ease',
          flexShrink: 0,
          marginLeft: expanded ? 8 : 0,
          marginRight: expanded ? 8 : 0,
        }}
        onMouseEnter={e => {
          if (active !== 'profile') {
            (e.currentTarget as HTMLElement).style.background = expanded ? 'rgba(255,255,255,0.06)' : 'rgba(20,184,166,0.3)';
          }
        }}
        onMouseLeave={e => {
          if (active !== 'profile') {
            (e.currentTarget as HTMLElement).style.background = expanded
              ? 'transparent'
              : 'rgba(20,184,166,0.18)';
          }
        }}
      >
        <div style={{
          width: expanded ? 28 : 36,
          height: expanded ? 28 : 36,
          borderRadius: '50%',
          background: active === 'profile'
            ? 'linear-gradient(135deg, #14B8A6, #14B8A6)'
            : 'rgba(20,184,166,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: expanded ? 11 : 13, fontWeight: 700, color: '#fff',
          flexShrink: 0,
          transition: 'all 200ms ease',
        }}>
          J
        </div>
        {expanded && (
          <span style={{
            fontSize: 13,
            fontWeight: active === 'profile' ? 600 : 500,
            whiteSpace: 'nowrap',
            color: active === 'profile' ? '#5EEAD4' : 'rgba(255,255,255,0.5)',
          }}>
            Profile
          </span>
        )}
      </button>
    </aside>
  );
}
