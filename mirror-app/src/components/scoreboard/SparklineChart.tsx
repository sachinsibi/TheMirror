interface SparklineChartProps {
  data: number[];
}

export function SparklineChart({ data }: SparklineChartProps) {
  const W = 80;
  const H = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  });

  const polyline = points.join(' ');

  return (
    <svg width={W} height={H}>
      <polyline
        points={polyline}
        fill="none"
        stroke="#14B8A6"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
    </svg>
  );
}
