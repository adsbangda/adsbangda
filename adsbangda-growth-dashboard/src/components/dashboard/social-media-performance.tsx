import { Music2 } from "lucide-react";
import { InstagramGlyph, FacebookGlyph } from "./platform-icons";
import type { SocialPlatformSummary } from "@/lib/types";

const CONTENT_TYPE_LABEL: Record<string, string> = {
  feed: "Feed",
  story: "Story",
  reels: "Reels",
  reel: "Reels",
  video: "Video",
  post: "Post",
  carousel: "Carousel",
  article: "Article",
};

const PLATFORM_META: Record<
  string,
  { label: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; iconClass: string; bgClass: string }
> = {
  instagram: { label: "Instagram", Icon: InstagramGlyph, iconClass: "text-pink-600", bgClass: "bg-pink-50" },
  tiktok: { label: "TikTok", Icon: Music2, iconClass: "text-ink", bgClass: "bg-black/5" },
  facebook: { label: "Facebook", Icon: FacebookGlyph, iconClass: "text-blue-600", bgClass: "bg-blue-50" },
  x: { label: "X", Icon: Music2, iconClass: "text-ink", bgClass: "bg-black/5" },
  linkedin: { label: "LinkedIn", Icon: Music2, iconClass: "text-blue-700", bgClass: "bg-blue-50" },
  threads: { label: "Threads", Icon: Music2, iconClass: "text-ink", bgClass: "bg-black/5" },
};

/**
 * Satu mini-card per platform yang PERNAH punya content_targets untuk
 * client ini (lihat getSocialMediaBreakdown di lib/data.ts) — platform
 * yang belum pernah dikonfigurasi tidak pernah ada di `platforms`, jadi
 * otomatis tidak dirender di sini tanpa perlu flag "active" terpisah.
 */
export function SocialMediaPerformance({ platforms }: { platforms: SocialPlatformSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {platforms.map((p) => {
        const meta = PLATFORM_META[p.platform] ?? { label: p.platform, Icon: Music2, iconClass: "text-ink", bgClass: "bg-black/5" };
        const { Icon, iconClass, bgClass, label } = meta;
        return (
          <div key={p.platform} className="rounded-[var(--radius-md)] border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${bgClass}`}>
                <Icon className={`h-4 w-4 ${iconClass}`} strokeWidth={1.75} />
              </span>
              <span className="text-sm font-semibold text-ink">{label}</span>
            </div>

            <div className="mt-3.5 space-y-3">
              {p.items.length === 0 ? (
                <p className="text-xs text-muted">Belum ada target bulan ini.</p>
              ) : (
                p.items.map((item) => {
                  const pct = item.target > 0 ? Math.min(100, Math.round((item.completed / item.target) * 100)) : 0;
                  return (
                    <div key={item.contentType}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted">{CONTENT_TYPE_LABEL[item.contentType] ?? item.contentType}</span>
                        <span className="font-data font-semibold text-ink">
                          {item.completed} <span className="text-muted">/ {item.target}</span>
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
