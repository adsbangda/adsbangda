import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { ChannelOverview } from "@/components/dashboard/channel-overview";
import { getCurrentClient, getPerformanceSummary, getChannelOverview } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { Users, Heart, TrendingUp } from "lucide-react";

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
  const followersChart = social.map((s) => ({ label: shortDate(s.date), value: s.followers ?? 0 }));

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Social Media" subtitle="Ringkasan performa Instagram, Facebook, dan TikTok." />

      <div className="space-y-6 p-5 lg:p-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label="Followers" value={formatNumber(latest?.followers ?? 0)} icon={Users} iconColor="text-accent" iconBg="bg-accent-soft" />
          <KpiCard label="Engagement Rate" value={`${latest?.engagementRate?.toFixed(1) ?? "0"}%`} icon={Heart} iconColor="text-pink-600" iconBg="bg-pink-50" />
          <KpiCard label="Reach" value={formatNumber(latest?.reach ?? 0)} icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        </section>

        <Card>
          <SectionHeading title="Pertumbuhan Followers" description="5 minggu terakhir" />
          <TrendChart data={followersChart} dataKey="value" format="number" />
        </Card>

        <Card>
          <SectionHeading title="Engagement per Channel" />
          <ChannelOverview rows={channelRows} />
        </Card>

        <Card>
          <SectionHeading title="Top Performing Content" />
          <div className="divide-y divide-border">
            {topContent.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3.5 first:pt-0">
                <div>
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="font-data text-xs text-muted">{formatNumber(item.reach)} reach</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 font-data text-xs font-semibold text-success">
                  <TrendingUp className="h-3 w-3" /> {item.engagementRate}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
