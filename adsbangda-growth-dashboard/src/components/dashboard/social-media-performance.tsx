import { cn } from "@/lib/utils";
import { PLATFORM_META, CONTENT_TYPE_LABEL } from "./platform-meta";
import type { SocialPlatformSummary } from "@/lib/types";

/**
 * Satu mini-card per platform yang PERNAH punya content_targets untuk
 * client ini (lihat getSocialMediaBreakdown di lib/data.ts) — platform
 * yang belum pernah dikonfigurasi tidak pernah ada di `platforms`, jadi
 * otomatis tidak dirender di sini tanpa perlu flag "active" terpisah.
 *
 * Dua mode grid tergantung jumlah platform aktif:
 *   - 1 platform  → kotak kecil fixed-width (230px), menempel kiri.
 *   - 2+ platform → bagi rata SELURUH lebar card (auto-fit/1fr), bukan
 *     nempel kiri nyisa kosong di kanan.
 * align-items:stretch + justify-content:center di dalam tiap kotak —
 * kalau salah satu platform kontennya lebih panjang (mis. Instagram 3
 * baris vs TikTok 1 baris), tinggi kotak disamakan tapi isi yang lebih
 * pendek nggak numpuk di atas nyisain kosong di bawah, melainkan center.
 */
export function SocialMediaPerformance({ platforms }: { platforms: SocialPlatformSummary[] }) {
  const isSingle = platforms.length === 1;

  return (
    <div
      className={cn(
        "grid flex-1 items-stretch gap-3.5",
        isSingle ? "grid-cols-[230px] justify-start" : "grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
      )}
    >
      {platforms.map((p) => {
        const logo = PLATFORM_META[p.platform] ?? null;
        return (
          <div key={p.platform} className="flex min-w-0 flex-col justify-center gap-4 rounded-[var(--radius-md)] border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-[26px] w-[26px] shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-border bg-surface">
                {logo && (
                  // eslint-disable-next-line @next/next/no-img-element -- next/image menolak SVG lokal tanpa config khusus; icon kecil ini tidak butuh optimisasi next/image.
                  <img src={logo.src} alt={logo.label} className={cn("h-full w-full object-cover", logo.scaleUp && "scale-[1.35]")} />
                )}
              </span>
              <span className="text-sm font-semibold text-ink">{logo?.label ?? p.platform}</span>
            </div>

            <div className="space-y-3">
              {p.items.length === 0 ? (
                <p className="text-xs text-muted">Belum ada target bulan ini.</p>
              ) : (
                p.items.map((item) => {
                  const pct = item.target > 0 ? Math.min(100, Math.round((item.completed / item.target) * 100)) : 0;
                  return (
                    <div key={item.contentType}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted">{CONTENT_TYPE_LABEL[item.contentType] ?? item.contentType}</span>
                        <span className="font-data text-sm font-bold text-ink">
                          {item.completed} <span className="text-xs font-medium text-muted">/ {item.target}</span>
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
