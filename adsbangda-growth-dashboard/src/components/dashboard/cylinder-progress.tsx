/** Progress bar bergaya jar/cylinder — cairan biru mengisi dari bawah, sesuai referensi desain Overview terbaru. */
export function CylinderProgress({ value, width = 96, height = 176 }: { value: number; width?: number; height?: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = width / 2;

  return (
    <div className="relative shrink-0" style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <clipPath id="cylinder-clip">
            <rect x="0" y="0" width={width} height={height} rx={radius} />
          </clipPath>
          <linearGradient id="cylinder-fill" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} rx={radius} fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
        <g clipPath="url(#cylinder-clip)">
          <rect x="0" y={height - (height * clamped) / 100} width={width} height={(height * clamped) / 100} fill="url(#cylinder-fill)" />
        </g>
        <rect x="0.75" y="0.75" width={width - 1.5} height={height - 1.5} rx={radius - 0.75} fill="none" stroke="var(--border)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
