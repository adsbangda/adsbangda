import { cn, formatNumber } from "@/lib/utils";
import { PLATFORM_META } from "./platform-meta";
import { EmptyState } from "./empty-state";
import { Users } from "lucide-react";
import type { PerformanceMetric, SocialPlatform } from "@/lib/types";

function pctDelta(curr?: number | null, prev?: number | null): number | null {
  if (curr == null || prev == null || prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

/**
 * "Social Media Performance" di Overview — snapshot terbaru per platform:
 * Followers, Reach, Impressions, Profile Visit. SENGAJA TIDAK termasuk
 * Engagement Rate — itu sudah ditampilkan di "Engagement per Platform"
 * (komponen ChannelOverview) di halaman /social-media, jadi tidak
 * diduplikasi di sini.
 *
 * Ini TERPISAH dari card "Content Delivery" (target vs actual konten,
 * sumber datanya content_targets/content_items, bukan performance_metrics)
 * yang ada di baris atas — dua card beda konteks, sengaja tidak digabung
 * biar masing-masing jelas isinya.
 *
 * FLEKSIBEL sama seperti MetaAdsSummary/WebsiteSummary — SEMUA platform
 * yang PERNAH ada snapshot-nya otomatis muncul (tidak hardcode daftar
 * platform), grid auto-fit jadi proporsional baik 1 platform maupun 5
 * platform sekaligus, dan card ini hilang total kalau belum ada data sama
 * sekali (bukan tampil kosong).
 */
export function SocialMediaPerformanceSummary({ metrics }: { metrics: PerformanceMetric[] }) {
  const platforms = Array.from(new Set(metrics.map((m) => m.platform).filter((p): p is SocialPlatform => !!p)));

  if (platforms.length === 0) {
    return <EmptyState icon={Users} title="Belum ada data performance" description="Data akan muncul begitu tim Adsbangda mengisi performance mingguan per platform." />;
  }

  return (
    <div className={cn("grid items-stretch gap-3.5", platforms.length === 1 ? "grid-cols-[230px] justify-start" : "grid-cols-[repeat(auto-fit,minmax(190px,1fr))]")}>
      {platforms.map((platform) => {
        const history = metrics.filter((m) => m.platform === platform);
        const latest = history.at(-1);
        const previous = history.at(-2);
        const logo = PLATFORM_META[platform] ?? null;
        if (!latest) return null;

        const followerDelta = pctDelta(latest.followers, previous?.followers);

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
                {followerDelta != null && (
                  <span className={cn("font-data text-[10px] font-bold", followerDelta >= 0 ? "text-success" : "text-danger")}>
                    {followerDelta >= 0 ? "+" : ""}
                    {followerDelta}%
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 border-t border-border pt-2.5">
              <div>
                <p className="font-data text-xs font-bold text-ink">{formatNumber(latest.reach ?? 0)}</p>
                <p className="text-[10px] text-muted">Reach</p>
              </div>
              <div>
                <p className="font-data text-xs font-bold text-ink">{formatNumber(latest.impressions ?? 0)}</p>
                <p className="text-[10px] text-muted">Impressions</p>
              </div>
              <div className="col-span-2">
                <p className="font-data text-xs font-bold text-ink">{formatNumber(latest.visitors ?? 0)}</p>
                <p className="text-[10px] text-muted">Profile Visit</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
