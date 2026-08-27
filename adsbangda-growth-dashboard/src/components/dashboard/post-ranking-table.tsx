import { Trophy, Heart, Eye, MessageCircle, Share2, Bookmark, ImageOff } from "lucide-react";
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

/** Satu angka stat kecil — cuma dirender kalau nilainya ada (biar gak nampilin banyak "—" berjejer buat platform yang gak punya metrik itu, mis. Threads gak punya Saves). */
function StatChip({ icon: Icon, value, label }: { icon: React.ElementType; value?: number | null; label: string }) {
  if (value == null) return null;
  return (
    <span className="inline-flex items-center gap-1 font-data text-xs font-semibold text-ink" title={label}>
      <Icon className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} />
      {formatCompact(value)}
    </span>
  );
}

/**
 * Ranking postingan (feed/story/reels/video/dst — mengikuti jenis konten
 * platform terkait) berdasarkan total engagement (likes+comments+shares+saves),
 * terbanyak di atas.
 *
 * Dulu ini tabel lebar (butuh scroll ke samping di layar kecil buat lihat
 * Likes/Views kalau caption-nya panjang) — sekarang list CARD: thumbnail di
 * kiri (kalau ada — Threads tidak expose thumbnail lewat API-nya, jadi
 * fallback ke icon), teks caption BEBAS sepanjang apa pun (turun ke bawah/
 * wrap, tidak dipotong), statistik selalu kelihatan tanpa perlu geser sama
 * sekali, di layar manapun.
 */
export function PostRankingTable({ posts }: { posts: PostPerformance[] }) {
  if (posts.length === 0) {
    return <EmptyState icon={Trophy} title="Belum ada data postingan" description="Ranking akan muncul begitu tim Adsbangda mengisi performance per postingan." />;
  }

  const ranked = [...posts].sort((a, b) => engagementScore(b) - engagementScore(a));

  return (
    <div className="divide-y divide-border">
      {ranked.map((post, index) => (
        <div key={post.id} className="flex items-start gap-3 py-3.5 first:pt-0">
          <span
            className={cn(
              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-data text-[11px] font-bold",
              RANK_BADGE[index] ?? "bg-black/[0.04] text-muted"
            )}
          >
            {index + 1}
          </span>

          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-border bg-black/[0.03]">
            {post.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- thumbnail dari URL eksternal (CDN Instagram/Facebook), next/image butuh whitelist domain per akun yang tidak praktis untuk konten dinamis per-client.
              <img src={post.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageOff className="h-5 w-5 text-muted" strokeWidth={1.5} />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="break-words text-sm font-semibold text-ink">{post.title}</p>
            <p className="mt-0.5 font-data text-[11px] text-muted">
              {CONTENT_TYPE_LABEL[post.type] ?? post.type} · {formatDateID(post.postedDate)}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              <StatChip icon={Heart} value={post.likes} label="Likes" />
              <StatChip icon={Eye} value={post.views} label="Views" />
              <StatChip icon={MessageCircle} value={post.comments} label="Comments" />
              <StatChip icon={Share2} value={post.shares} label="Shares" />
              <StatChip icon={Bookmark} value={post.saves} label="Saves" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
