import React from 'react';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: 'teal' | 'amber' | 'violet' | 'none';
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, style, accent = 'none', onClick, hover }: CardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const accentStyle: React.CSSProperties =
    accent === 'teal' ? { borderLeft: '3px solid #14B8A6' }
      : accent === 'amber' ? { borderLeft: '3px solid #F59E0B' }
        : accent === 'violet' ? { borderLeft: '3px solid #8B5CF6' }
          : {};

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      style={{
        background: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        transition: 'background 150ms ease',
        cursor: onClick ? 'pointer' : 'default',
        ...accentStyle,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
