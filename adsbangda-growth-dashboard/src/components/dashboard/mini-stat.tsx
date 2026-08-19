import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, { bg: string; label: string; delta: string }> = {
  blue: { bg: "bg-blue-50", label: "text-blue-600", delta: "text-blue-600" },
  purple: { bg: "bg-purple-50", label: "text-purple-600", delta: "text-purple-600" },
  orange: { bg: "bg-orange-50", label: "text-orange-600", delta: "text-orange-600" },
  green: { bg: "bg-green-50", label: "text-success", delta: "text-success" },
};

/**
 * Satu grid cell (bukan box mengambang lebar tetap) — dipakai berulang di
 * dalam mini-stat-grid yang sama, termasuk varian `wide` (Budget Terpakai)
 * yang span 2 kolom. Karena semuanya satu grid yang sama, otomatis
 * proporsional baik card-nya sendirian (full width) maupun berdampingan
 * (setengah lebar) — tidak ada lagi box terpisah yang bisa "ketinggalan"
 * ukurannya dari yang lain.
 */
export function MiniStat({
  label,
  value,
  deltaPct,
  deltaGoodDirection = "up",
  color = "blue",
  wide = false,
}: {
  label: string;
  value: string;
  /** Persen perubahan vs periode sebelumnya — null/undefined kalau tidak ada baseline buat dibandingkan. */
  deltaPct?: number | null;
  /** Untuk metrik yang "makin kecil makin bagus" (mis. CPL, Bounce Rate), turun = hijau. */
  deltaGoodDirection?: "up" | "down";
  /** Warna aksen box, mengikuti referensi desain (tiap KPI beda tint). */
  color?: "blue" | "purple" | "orange" | "green";
  /** Span 2 kolom — dipakai buat Budget Terpakai (yang punya progress bar internal). */
  wide?: boolean;
}) {
  const isGood = deltaPct != null && (deltaGoodDirection === "up" ? deltaPct >= 0 : deltaPct <= 0);
  const { bg, label: labelClass, delta: deltaClass } = COLOR_MAP[color];

  return (
    <div className={cn("min-w-0 rounded-[var(--radius-md)] border border-border p-2.5", bg, wide && "col-span-2")}>
      <p className={cn("truncate font-data text-[10px] font-semibold", labelClass)}>{label}</p>
      <p className="mt-1 font-data text-[15px] font-extrabold leading-none text-ink">{value}</p>
      {deltaPct != null && (
        <p className={cn("mt-1 font-data text-[10px] font-bold", isGood ? deltaClass : "text-danger")}>
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
