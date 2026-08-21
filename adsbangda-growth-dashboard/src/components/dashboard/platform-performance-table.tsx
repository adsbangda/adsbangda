import { cn, formatNumber, formatDecimal } from "@/lib/utils";
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

function MetricCell({ value, delta }: { value?: number | null; delta?: number | null }) {
  if (value == null) return <span className="text-base text-muted">—</span>;
  return (
    <div>
      <p className="font-data text-base font-bold text-ink">{formatCompact(value)}</p>
      <DeltaBadge delta={delta} />
    </div>
  );
}

function PlatformCell({ platform }: { platform: string }) {
  const logo = PLATFORM_META[platform] ?? null;
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-surface">
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element -- next/image menolak SVG lokal tanpa config khusus; icon kecil ini tidak butuh optimisasi next/image.
          <img
            src={logo.src}
            alt={logo.label}
            className="h-full w-full object-cover"
            style={logo.scale ? { transform: `scale(${logo.scale})` } : undefined}
          />
        )}
      </span>
      <span className="truncate text-base font-semibold text-ink">{logo?.label ?? platform}</span>
    </div>
  );
}

/**
 * "Platform Performance" — satu tabel per platform (bukan grid card
 * terpisah-pisah) menampilkan Followers, Reach, Impressions, dan Profile
 * Visit, masing-masing dengan indikator naik/turun vs periode sebelumnya.
 * Garis pemisah cuma horizontal antar baris (divide-y) — sempat dicoba
 * tambah garis vertikal antar kolom juga, tapi hasilnya kurang enak
 * dilihat (kesannya seperti "jeruji" turun ke bawah), jadi dibalikin ke
 * versi minimal spasi antar kolom seperti biasa.
 *
 * FLEKSIBEL — baris yang muncul cuma platform yang benar-benar ada
 * datanya (lihat getPlatformPerformanceTable), bukan daftar hardcode.
 *
 * Threads SENGAJA dipisah jadi tabel KEDUA di bawahnya (bukan kolom
 * tambahan di tabel utama) — Threads tidak punya Reach/Profile Visit sama
 * sekali (beda struktur data dari platform lain), jadi maksa masuk ke
 * kolom yang sama cuma bikin banyak sel "—" tidak perlu. Tabel utama
 * TETAP 4 kolom seperti semula, tidak berubah buat platform selain
 * Threads.
 *
 * CATATAN: kolom Engagement SENGAJA tidak ditambah di sini (Overview) —
 * cuma ditampilkan di halaman Social Media (lihat MiniStat "Engagement"
 * di src/app/(app)/social-media/page.tsx).
 */
export function PlatformPerformanceTable({ rows }: { rows: PlatformPerformanceRow[] }) {
  if (rows.length === 0) {
    return <EmptyState icon={Users} title="Belum ada data performance" description="Data akan muncul begitu tim Adsbangda mengisi performance mingguan per platform." />;
  }

  const mainRows = rows.filter((r) => r.platform !== "threads");
  const threadsRow = rows.find((r) => r.platform === "threads");

  return (
    <div className="space-y-6">
      {mainRows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-border text-sm text-muted">
                <th className="pb-3 pr-4 font-medium">Platform</th>
                <th className="pb-3 pr-4 font-medium">Followers</th>
                <th className="pb-3 pr-4 font-medium">Reach</th>
                <th className="pb-3 pr-4 font-medium">Impressions</th>
                <th className="pb-3 font-medium">Profile Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mainRows.map((row) => (
                <tr key={row.platform}>
                  <td className="py-3.5 pr-4">
                    <PlatformCell platform={row.platform} />
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
                  <td className="py-3.5">
                    <MetricCell value={row.profileVisit} delta={row.profileVisitDelta} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {threadsRow && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-border text-sm text-muted">
                <th className="pb-3 pr-4 font-medium">Platform</th>
                <th className="pb-3 pr-4 font-medium">Followers</th>
                <th className="pb-3 pr-4 font-medium">Impressions</th>
                <th className="pb-3 pr-4 font-medium">Replies</th>
                <th className="pb-3 font-medium">Reposts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-3.5 pr-4">
                  <PlatformCell platform="threads" />
                </td>
                <td className="py-3.5 pr-4">
                  <MetricCell value={threadsRow.followers} delta={threadsRow.followersDelta} />
                </td>
                <td className="py-3.5 pr-4">
                  <MetricCell value={threadsRow.impressions} delta={threadsRow.impressionsDelta} />
                </td>
                <td className="py-3.5 pr-4">
                  <MetricCell value={threadsRow.replies} delta={threadsRow.repliesDelta} />
                </td>
                <td className="py-3.5">
                  <MetricCell value={threadsRow.reposts} delta={threadsRow.repostsDelta} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
