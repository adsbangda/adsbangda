import { Trophy } from "lucide-react";
import { cn, formatNumber, formatDecimal, formatDateID } from "@/lib/utils";
import { CONTENT_TYPE_LABEL } from "./platform-meta";
import { EmptyState } from "./empty-state";
import type { PostPerformance } from "@/lib/types";

/** Angka ringkas ala media sosial (68.4K, 812.1K) — konsisten dengan PlatformPerformanceTable. */
function formatCompact(value?: number | null): string {
  if (value == null) return "—";
  if (value >= 1_000_000) return `${formatDecimal(value / 1_000_000)}M`;
  if (value >= 1_000) return `${formatDecimal(value / 1_000)}K`;
  return formatNumber(value);
}

/** Total engagement = likes + comments + shares + saves — dasar urutan ranking (lihat komentar di bawah). */
function engagementScore(post: PostPerformance): number {
  return (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0) + (post.saves ?? 0);
}

const RANK_BADGE = ["bg-amber-100 text-amber-700", "bg-slate-100 text-slate-600", "bg-orange-100 text-orange-700"];

/**
 * Ranking postingan (feed/story/reels/video/dst — mengikuti jenis konten
 * platform terkait) berdasarkan total engagement (likes+comments+shares+saves),
 * terbanyak di atas. Menggantikan section "Engagement per Platform" (list
 * engagement rate per platform) yang lama di halaman Social Media — dipindah
 * ke level per-postingan supaya lebih actionable (tahu KONTEN mana yang
 * kerja paling bagus, bukan cuma angka platform yang sudah muncul di KPI atas).
 */
export function PostRankingTable({ posts }: { posts: PostPerformance[] }) {
  if (posts.length === 0) {
    return <EmptyState icon={Trophy} title="Belum ada data postingan" description="Ranking akan muncul begitu tim Adsbangda mengisi performance per postingan." />;
  }

  const ranked = [...posts].sort((a, b) => engagementScore(b) - engagementScore(a));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-border text-sm text-muted">
            <th className="pb-3 pr-3 font-medium">#</th>
            <th className="pb-3 pr-4 font-medium">Konten</th>
            <th className="pb-3 pr-4 font-medium">Likes</th>
            <th className="pb-3 pr-4 font-medium">Views</th>
            <th className="pb-3 pr-4 font-medium">Comments</th>
            <th className="pb-3 pr-4 font-medium">Shares</th>
            <th className="pb-3 font-medium">Saves</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {ranked.map((post, index) => (
            <tr key={post.id}>
              <td className="py-3.5 pr-3">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full font-data text-[11px] font-bold",
                    RANK_BADGE[index] ?? "bg-black/[0.04] text-muted"
                  )}
                >
                  {index + 1}
                </span>
              </td>
              <td className="py-3.5 pr-4">
                <p className="truncate text-sm font-semibold text-ink">{post.title}</p>
                <p className="mt-0.5 font-data text-[11px] text-muted">
                  {CONTENT_TYPE_LABEL[post.type] ?? post.type} · {formatDateID(post.postedDate)}
                </p>
              </td>
              <td className="py-3.5 pr-4 font-data text-sm font-bold text-ink">{formatCompact(post.likes)}</td>
              <td className="py-3.5 pr-4 font-data text-sm font-bold text-ink">{formatCompact(post.views)}</td>
              <td className="py-3.5 pr-4 font-data text-sm font-bold text-ink">{formatCompact(post.comments)}</td>
              <td className="py-3.5 pr-4 font-data text-sm font-bold text-ink">{formatCompact(post.shares)}</td>
              <td className="py-3.5 font-data text-sm font-bold text-ink">{formatCompact(post.saves)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
