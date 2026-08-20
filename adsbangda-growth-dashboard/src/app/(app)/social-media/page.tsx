import { Radio } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { MiniStat } from "@/components/dashboard/mini-stat";
import { SocialTrendChart, type SocialTrendPoint } from "@/components/dashboard/social-trend-chart";
import { PostRankingTable } from "@/components/dashboard/post-ranking-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PLATFORM_META } from "@/components/dashboard/platform-meta";
import { getCurrentClient, getPerformanceSummary, getPlatformPerformanceTable, getPostPerformance } from "@/lib/data";
import { formatNumber, cn } from "@/lib/utils";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

export default async function SocialMediaPage() {
  const client = await getCurrentClient();
  const [{ social }, platformPerformance, posts] = await Promise.all([
    getPerformanceSummary(client.id),
    getPlatformPerformanceTable(client.id),
    getPostPerformance(client.id),
  ]);

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Social Media" subtitle="Performa dipisah per platform — Instagram, Facebook, TikTok, dan lainnya." />

      <div className="space-y-6 p-5 lg:p-8">
        {platformPerformance.length === 0 ? (
          <Card padding="lg">
            <EmptyState icon={Radio} title="Belum ada platform aktif" description="Data akan muncul begitu tim Adsbangda mengisi target content atau performance untuk platform tertentu." />
          </Card>
        ) : (
          platformPerformance.map((row) => {
            const logo = PLATFORM_META[row.platform] ?? null;

            // Chart gabungan — SATU platform per card (bukan campur beberapa
            // platform dalam satu garis), tapi SEMUA metrik (Followers, Reach,
            // Impressions, Profile Visit) digabung jadi satu grafik multi-garis,
            // bukan 4 mini-stat + chart followers-only + list terpisah seperti
            // sebelumnya — supaya tidak ada info yang tampil dobel.
            const chartData: SocialTrendPoint[] = social
              .filter((s) => s.platform === row.platform)
              .map((s) => ({
                label: shortDate(s.date),
                followers: s.followers ?? null,
                reach: s.reach ?? null,
                impressions: s.impressions ?? null,
                profileVisit: s.visitors ?? null,
              }));

            const platformPosts = posts.filter((p) => p.platform === row.platform);

            return (
              <Card key={row.platform} padding="lg">
                <SectionHeading
                  title={logo?.label ?? row.platform}
                  description="Followers, Reach, Impressions & Profile Visit — snapshot terbaru vs periode sebelumnya."
                  action={
                    logo && (
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-surface">
                        {/* eslint-disable-next-line @next/next/no-img-element -- next/image menolak SVG lokal tanpa config khusus; icon kecil ini tidak butuh optimisasi next/image. */}
                        <img src={logo.src} alt={logo.label} className={cn("h-full w-full object-cover", logo.scaleUp && "scale-[1.35]")} />
                      </span>
                    )
                  }
                />

                <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] items-stretch gap-3">
                  <MiniStat label="Followers" value={formatNumber(row.followers ?? 0)} deltaPct={row.followersDelta} color="blue" />
                  <MiniStat label="Reach" value={formatNumber(row.reach ?? 0)} deltaPct={row.reachDelta} color="green" />
                  <MiniStat label="Impressions" value={formatNumber(row.impressions ?? 0)} deltaPct={row.impressionsDelta} color="purple" />
                  <MiniStat label="Profile Visit" value={formatNumber(row.profileVisit ?? 0)} deltaPct={row.profileVisitDelta} color="orange" />
                </div>

                {chartData.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Tren {logo?.label ?? row.platform} (5 minggu terakhir)
                    </p>
                    <SocialTrendChart data={chartData} />
                  </div>
                )}

                <div className="mt-6 border-t border-border pt-5">
                  <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Post Ranking</p>
                  <PostRankingTable posts={platformPosts} />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
