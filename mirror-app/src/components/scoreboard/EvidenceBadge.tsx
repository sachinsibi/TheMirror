type Grade = 'STRONG RCT' | 'MODERATE RCT' | 'PRELIMINARY';

interface EvidenceBadgeProps {
  grade: Grade | string;
}

const GRADE_STYLES: Record<string, { bg: string; text: string }> = {
  'STRONG RCT': { bg: 'rgba(20,184,166,0.12)', text: '#14B8A6' },
  'MODERATE RCT': { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B' },
  'PRELIMINARY': { bg: 'rgba(148,163,184,0.12)', text: '#94A3B8' },
};

export default function EvidenceBadge({ grade }: EvidenceBadgeProps) {
  const styles = GRADE_STYLES[grade] ?? GRADE_STYLES['PRELIMINARY'];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 22,
        padding: '0 8px',
        borderRadius: 4,
        background: styles.bg,
        color: styles.text,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
      }}
    >
      {grade}
    </span>
  );
}
