const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700" },
  purple: { bg: "bg-purple-50", text: "text-purple-700" },
  orange: { bg: "bg-orange-50", text: "text-orange-700" },
  neutral: { bg: "bg-surface", text: "text-ink" },
};

export function MiniStat({
  label,
  value,
  deltaPct,
  deltaGoodDirection = "up",
  color = "neutral",
}: {
  label: string;
  value: string;
  /** Persen perubahan vs periode sebelumnya — null kalau tidak ada baseline buat dibandingkan. */
  deltaPct?: number | null;
  /** Untuk metrik yang "makin kecil makin bagus" (mis. CPL, Bounce Rate), turun = hijau. */
  deltaGoodDirection?: "up" | "down";
  /** Warna aksen box, mengikuti referensi desain (tiap KPI beda tint). */
  color?: "blue" | "purple" | "orange" | "neutral";
}) {
  const isGood = deltaPct != null && (deltaGoodDirection === "up" ? deltaPct >= 0 : deltaPct <= 0);
  const { bg, text } = COLOR_MAP[color];

  return (
    <div className={`rounded-[var(--radius-md)] border border-border p-3 ${bg}`}>
      <p className={`font-data text-lg font-bold leading-none ${color === "neutral" ? "text-ink" : text}`}>{value}</p>
      <p className="mt-1.5 text-xs text-muted">{label}</p>
      {deltaPct != null && (
        <p className={`mt-1.5 font-data text-[11px] font-semibold ${isGood ? "text-success" : "text-danger"}`}>
          {deltaPct >= 0 ? "+" : ""}
          {deltaPct}%
        </p>
      )}
    </div>
  );
}

export function pctDelta(curr?: number | null, prev?: number | null): number | null {
  if (curr == null || prev == null || prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}
