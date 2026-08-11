interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

/** Minimal trend line — no axes, no labels, just the shape of the trend. */
export function Sparkline({ data, width = 64, height = 28, className }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} fill="none">
      <polyline points={points} stroke="var(--accent)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
