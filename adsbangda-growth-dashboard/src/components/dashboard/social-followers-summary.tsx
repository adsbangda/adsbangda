import { cn, formatNumber, formatPercent } from "@/lib/utils";
import { PLATFORM_META } from "./platform-meta";
import { EmptyState } from "./empty-state";
import { Users } from "lucide-react";
import type { PerformanceMetric, SocialPlatform } from "@/lib/types";

function pctDelta(curr?: number | null, prev?: number | null): number | null {
  if (curr == null || prev == null || prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

/**
 * "Social Media Followers" — snapshot terbaru per platform (Followers,
 * Engagement Rate, Reach), TERPISAH dari card "Social Media Performance"
 * (yang isinya content delivery target vs actual, sumber datanya beda:
 * content_targets/content_items, bukan performance_metrics). Sebelumnya
 * TIDAK ADA card ini sama sekali di Overview — followers cuma kebaca di
 * halaman /social-media, padahal datanya (performance_metrics channel
 * "social") sudah lama ada & diisi admin.
 *
 * FLEKSIBEL sama seperti MetaAdsSummary/WebsiteSummary — SEMUA platform
 * yang PERNAH ada snapshot-nya otomatis muncul (tidak hardcode daftar
 * platform), grid auto-fit jadi proporsional baik 1 platform maupun 5
 * platform sekaligus, dan card ini hilang total kalau belum ada data sama
 * sekali (bukan tampil kosong).
 */
export function SocialFollowersSummary({ metrics }: { metrics: PerformanceMetric[] }) {
  const platforms = Array.from(new Set(metrics.map((m) => m.platform).filter((p): p is SocialPlatform => !!p)));

  if (platforms.length === 0) {
    return <EmptyState icon={Users} title="Belum ada data followers" description="Data akan muncul begitu tim Adsbangda mengisi performance mingguan per platform." />;
  }

  return (
    <div className={cn("grid items-stretch gap-3.5", platforms.length === 1 ? "grid-cols-[230px] justify-start" : "grid-cols-[repeat(auto-fit,minmax(190px,1fr))]")}>
      {platforms.map((platform) => {
        const history = metrics.filter((m) => m.platform === platform);
        const latest = history.at(-1);
        const previous = history.at(-2);
        const logo = PLATFORM_META[platform] ?? null;
        if (!latest) return null;

        return (
          <div key={platform} className="flex min-w-0 flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-[26px] w-[26px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-border bg-surface">
                {logo && (
                  // eslint-disable-next-line @next/next/no-img-element -- next/image menolak SVG lokal tanpa config khusus; icon kecil ini tidak butuh optimisasi next/image.
                  <img src={logo.src} alt={logo.label} className={cn("h-full w-full object-cover", logo.scaleUp && "scale-[1.35]")} />
                )}
              </span>
              <span className="text-sm font-semibold text-ink">{logo?.label ?? platform}</span>
            </div>

            <div>
              <p className="font-data text-xl font-extrabold leading-none text-ink">{formatNumber(latest.followers ?? 0)}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <p className="text-[11px] text-muted">followers</p>
                {(() => {
                  const delta = pctDelta(latest.followers, previous?.followers);
                  if (delta == null) return null;
                  return <span className={cn("font-data text-[10px] font-bold", delta >= 0 ? "text-success" : "text-danger")}>{delta >= 0 ? "+" : ""}{delta}%</span>;
                })()}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-2.5">
              <div>
                <p className="font-data text-xs font-bold text-ink">{latest.engagementRate != null ? formatPercent(latest.engagementRate) : "—"}</p>
                <p className="text-[10px] text-muted">Engagement</p>
              </div>
              <div className="text-right">
                <p className="font-data text-xs font-bold text-ink">{formatNumber(latest.reach ?? 0)}</p>
                <p className="text-[10px] text-muted">Reach</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
