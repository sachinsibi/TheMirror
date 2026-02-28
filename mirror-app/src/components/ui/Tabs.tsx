interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: 24,
        gap: 4,
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--color-violet)' : '2px solid transparent',
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'color 150ms ease, border-color 150ms ease',
              marginBottom: -1,
            }}
            onMouseEnter={e => {
              if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
            }}
            onMouseLeave={e => {
              if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--color-text-tertiary)';
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
