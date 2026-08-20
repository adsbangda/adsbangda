import { cn, formatNumber, formatDecimal, formatPercent } from "@/lib/utils";
import { PLATFORM_META } from "./platform-meta";
import { EmptyState } from "./empty-state";
import { ArrowUp, ArrowDown, Users } from "lucide-react";
import type { PlatformPerformanceRow } from "@/lib/types";

/** Angka ringkas ala media sosial (68.4K, 812.1K) — SENGAJA bukan Intl compact
 * notation (yang di locale id-ID keluarnya "rb"/"jt", bukan K/M yang lebih
 * umum dikenali buat metrik sosial media), konsisten sama pola manual K/M
 * yang sudah dipakai di tempat lain (Admin Overview). Desimal tetap koma
 * sesuai konvensi format Indonesia di seluruh app. */
function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${formatDecimal(value / 1_000_000)}M`;
  if (value >= 1_000) return `${formatDecimal(value / 1_000)}K`;
  return formatNumber(value);
}

function DeltaBadge({ delta }: { delta?: number | null }) {
  if (delta == null) return null;
  const isFlat = delta === 0;
  const isUp = delta > 0;
  const colorClass = isFlat ? "text-muted" : isUp ? "text-success" : "text-danger";
  const Arrow = isUp || isFlat ? ArrowUp : ArrowDown;
  return (
    <p className={cn("mt-0.5 flex items-center gap-0.5 font-data text-[11px] font-semibold", colorClass)}>
      <Arrow className="h-3 w-3" strokeWidth={2.25} />
      {Math.abs(delta)}%
    </p>
  );
}

function MetricCell({ value, delta, percent = false }: { value?: number | null; delta?: number | null; percent?: boolean }) {
  if (value == null) return <span className="text-base text-muted">—</span>;
  return (
    <div>
      <p className="font-data text-base font-bold text-ink">{percent ? formatPercent(value, 2) : formatCompact(value)}</p>
      <DeltaBadge delta={delta} />
    </div>
  );
}

/**
 * "Platform Performance" — satu tabel per platform (bukan grid card
 * terpisah-pisah) menampilkan Followers, Reach, Impressions, Profile
 * Visit, dan Engagement, masing-masing dengan indikator naik/turun vs
 * periode sebelumnya. Garis pemisah cuma horizontal antar baris
 * (divide-y) — sempat dicoba tambah garis vertikal antar kolom juga,
 * tapi hasilnya kurang enak dilihat (kesannya seperti "jeruji" turun ke
 * bawah), jadi dibalikin ke versi minimal spasi antar kolom seperti
 * biasa.
 *
 * FLEKSIBEL — baris yang muncul cuma platform yang benar-benar ada
 * datanya (lihat getPlatformPerformanceTable), bukan daftar hardcode.
 */
export function PlatformPerformanceTable({ rows }: { rows: PlatformPerformanceRow[] }) {
  if (rows.length === 0) {
    return <EmptyState icon={Users} title="Belum ada data performance" description="Data akan muncul begitu tim Adsbangda mengisi performance mingguan per platform." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left">
        <thead>
          <tr className="border-b border-border text-sm text-muted">
            <th className="pb-3 pr-4 font-medium">Platform</th>
            <th className="pb-3 pr-4 font-medium">Followers</th>
            <th className="pb-3 pr-4 font-medium">Reach</th>
            <th className="pb-3 pr-4 font-medium">Impressions</th>
            <th className="pb-3 pr-4 font-medium">Profile Visit</th>
            <th className="pb-3 font-medium">Engagement</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => {
            const logo = PLATFORM_META[row.platform] ?? null;
            return (
              <tr key={row.platform}>
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-surface">
                      {logo && (
                        // eslint-disable-next-line @next/next/no-img-element -- next/image menolak SVG lokal tanpa config khusus; icon kecil ini tidak butuh optimisasi next/image.
                        <img src={logo.src} alt={logo.label} className={cn("h-full w-full object-cover", logo.scaleUp && "scale-[1.35]")} />
                      )}
                    </span>
                    <span className="truncate text-base font-semibold text-ink">{logo?.label ?? row.platform}</span>
                  </div>
                </td>
                <td className="py-3.5 pr-4">
                  <MetricCell value={row.followers} delta={row.followersDelta} />
                </td>
                <td className="py-3.5 pr-4">
                  <MetricCell value={row.reach} delta={row.reachDelta} />
                </td>
                <td className="py-3.5 pr-4">
                  <MetricCell value={row.impressions} delta={row.impressionsDelta} />
                </td>
                <td className="py-3.5 pr-4">
                  <MetricCell value={row.profileVisit} delta={row.profileVisitDelta} />
                </td>
                <td className="py-3.5">
                  <MetricCell value={row.engagementRate} delta={row.engagementRateDelta} percent />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
