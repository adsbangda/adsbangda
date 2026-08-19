import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { MiniStat } from "@/components/dashboard/mini-stat";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { ChannelOverview } from "@/components/dashboard/channel-overview";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getCurrentClient, getPerformanceSummary, getChannelOverview } from "@/lib/data";
import { formatNumber, formatPercent } from "@/lib/utils";
import { Users, TrendingUp } from "lucide-react";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

export default async function SocialMediaPage() {
  const client = await getCurrentClient();
  const [{ social, topContent }, channelRows] = await Promise.all([
    getPerformanceSummary(client.id),
    getChannelOverview(client),
  ]);

  const latest = social.at(-1);
  const previous = social.at(-2);
  const followersChart = social.map((s) => ({ label: shortDate(s.date), value: s.followers ?? 0 }));
  // Halaman ini KHUSUS Social Media — getChannelOverview() balikin baris gabungan
  // (Meta Ads/Website juga bisa ikut kalau service itu aktif), jadi difilter ke
  // platform sosial saja di sini biar tidak nyampur konteks.
  const socialChannelRows = channelRows.filter((r) => r.icon !== "meta_ads" && r.icon !== "website");
  const pctDelta = (curr?: number, prev?: number) => (curr != null && prev ? Math.round(((curr - prev) / prev) * 1000) / 10 : null);

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Social Media" subtitle="Ringkasan performa Instagram, Facebook, dan TikTok." />

      <div className="space-y-6 p-5 lg:p-8">
        {/* Satu card konsolidasi — KPI ringkas, tren followers, engagement
            per platform, dan konten terbaik, semua di satu tempat yang
            sama supaya tidak perlu lompat-lompat antar card kecil. */}
        <Card padding="lg">
          <SectionHeading title="Followers & Engagement" description="Ringkasan pertumbuhan akun sosial media client." />

          <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] items-stretch gap-2.5">
            <MiniStat label="Followers" value={formatNumber(latest?.followers ?? 0)} deltaPct={pctDelta(latest?.followers, previous?.followers)} color="blue" />
            <MiniStat
              label="Engagement Rate"
              value={latest?.engagementRate != null ? formatPercent(latest.engagementRate) : "0%"}
              deltaPct={pctDelta(latest?.engagementRate, previous?.engagementRate)}
              color="purple"
            />
            <MiniStat label="Reach" value={formatNumber(latest?.reach ?? 0)} deltaPct={pctDelta(latest?.reach, previous?.reach)} color="green" />
          </div>

          <div className="mt-6">
            <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Pertumbuhan Followers (5 minggu terakhir)</p>
            <TrendChart data={followersChart} dataKey="value" format="number" />
          </div>

          {socialChannelRows.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="mb-1 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Engagement per Platform</p>
              <ChannelOverview rows={socialChannelRows} />
            </div>
          )}

          <div className="mt-6 border-t border-border pt-5">
            <p className="mb-1 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Top Performing Content</p>
            {topContent.length === 0 ? (
              <EmptyState icon={Users} title="Belum ada konten" description="Konten yang sudah published akan muncul di sini." />
            ) : (
              <div className="divide-y divide-border">
                {topContent.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                      <p className="font-data text-xs text-muted">{formatNumber(item.reach)} reach</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 font-data text-xs font-semibold text-success">
                      <TrendingUp className="h-3 w-3" /> {formatPercent(item.engagementRate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
