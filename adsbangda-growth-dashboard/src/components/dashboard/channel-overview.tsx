import { Users, Globe, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChannelIcon, ChannelOverviewRow } from "@/lib/types";

/** Logo resmi (file di /public/logos) — beberapa di-scale up karena sumbernya bulat dengan padding banyak (angka disesuaikan per file, beda-beda paddingnya), Meta cuma simbol infinity polos jadi pakai contain+padding. */
const LOGO_MAP: Partial<Record<ChannelIcon, { src: string; scale?: number; contain?: boolean }>> = {
  instagram: { src: "/logos/instagram.svg" },
  facebook: { src: "/logos/facebook.webp", scale: 1.1 },
  tiktok: { src: "/logos/tiktok.webp", scale: 1.75 },
  x: { src: "/logos/x.webp", scale: 1.65 },
  linkedin: { src: "/logos/linkedin.png" },
  threads: { src: "/logos/threads.avif", scale: 1.85 },
  meta_ads: { src: "/logos/meta.webp", contain: true },
};

/** Baris ringkas icon + label + value + panah tren. */
export function ChannelOverview({ rows }: { rows: ChannelOverviewRow[] }) {
  return (
    <div className="divide-y divide-border">
      {rows.map((row) => {
        const logo = LOGO_MAP[row.icon];
        const isUp = !row.deltaLabel.startsWith("↓");
        return (
          <div key={row.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
            <span
              className={cn(
                "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-border bg-surface",
                logo?.contain && "p-1.5"
              )}
            >
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element -- next/image menolak SVG lokal tanpa config khusus; icon kecil ini tidak butuh optimisasi next/image.
                <img
                  src={logo.src}
                  alt={row.label}
                  className={cn("h-full w-full", logo.contain ? "object-contain" : "object-cover")}
                  style={logo.scale ? { transform: `scale(${logo.scale})` } : undefined}
                />
              ) : row.icon === "website" ? (
                <Globe className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
              ) : (
                <Users className="h-4 w-4 text-accent" strokeWidth={1.75} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{row.label}</p>
              <p className="text-[11px] text-muted">{row.metricLabel}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="font-data text-sm font-bold text-ink">{row.value}</span>
              {isUp ? <ArrowUpRight className="h-3.5 w-3.5 text-success" strokeWidth={2} /> : <ArrowDownRight className="h-3.5 w-3.5 text-danger" strokeWidth={2} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
