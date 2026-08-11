import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { DateRangeTabs } from "@/components/dashboard/date-range-tabs";
import { getCurrentClient, getPerformanceSummary } from "@/lib/data";
import { formatIDR, formatNumber } from "@/lib/utils";
import { Wallet, Target, Eye, Heart, TrendingUp, Users2 } from "lucide-react";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

export default async function PerformancePage() {
  const client = await getCurrentClient();
  const { metaAds, social, website, topContent, channelSummary } = await getPerformanceSummary(client.id);

  const latestMeta = metaAds.at(-1);
  const previousMeta = metaAds.at(-2);
  const latestSocial = social.at(-1);
  const latestWebsite = website.at(-1);

  const pct = (curr?: number, prev?: number) =>
    curr !== undefined && prev ? Math.round(((curr - prev) / prev) * 100) : null;
  const leadDelta = pct(latestMeta?.leads, previousMeta?.leads);
  const leadsChartData = metaAds.map((m) => ({ label: shortDate(m.date), value: m.leads ?? 0 }));

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Performance" subtitle="Data diperbarui manual oleh tim Adsbangda setiap minggu." />

      <div className="space-y-8 p-5 lg:p-8">
        {/* Key metrics — one restrained accent tone; color is reserved for delta direction */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard label="Leads" value={formatNumber(latestMeta?.leads ?? 0)} icon={Target} iconColor="text-accent" iconBg="bg-accent-soft" delta={leadDelta !== null ? { value: `${Math.abs(leadDelta)}%`, direction: leadDelta >= 0 ? "up" : "down" } : undefined} />
          <KpiCard label="Cost per Lead" value={formatIDR(latestMeta?.costPerLead ?? 0)} icon={Wallet} iconColor="text-accent" iconBg="bg-accent-soft" />
          <KpiCard label="Ad Spend" value={formatIDR(latestMeta?.spend ?? 0)} icon={Wallet} iconColor="text-accent" iconBg="bg-accent-soft" />
          <KpiCard label="Reach" value={formatNumber(latestMeta?.reach ?? 0)} icon={Eye} iconColor="text-accent" iconBg="bg-accent-soft" />
          <KpiCard label="Engagement" value={`${latestSocial?.engagementRate?.toFixed(1) ?? "0"}%`} icon={Heart} iconColor="text-accent" iconBg="bg-accent-soft" />
          <KpiCard label="Conversions" value={formatNumber(latestWebsite?.conversions ?? 0)} icon={Users2} iconColor="text-accent" iconBg="bg-accent-soft" />
        </section>

        <Card>
          <SectionHeading
            title="Leads Over Time"
            description="Meta Ads · data mingguan"
            action={<DateRangeTabs />}
          />
          <TrendChart data={leadsChartData} dataKey="value" format="number" />
        </Card>

        <Card padding="lg">
          <SectionHeading title="Channel Performance" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="py-2.5 pr-4 font-medium">Channel</th>
                  <th className="py-2.5 pr-4 font-medium">Spend</th>
                  <th className="py-2.5 pr-4 font-medium">Leads</th>
                  <th className="py-2.5 pr-4 font-medium">CPL</th>
                  <th className="py-2.5 pr-4 font-medium">Engagement</th>
                  <th className="py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {channelSummary.map((row) => (
                  <tr key={row.channel} className="border-b border-border last:border-0">
                    <td className="py-3.5 pr-4 font-medium text-ink">{row.channel}</td>
                    <td className="py-3.5 pr-4 font-data text-xs text-muted">{row.spend ? formatIDR(row.spend) : "—"}</td>
                    <td className="py-3.5 pr-4 font-data text-xs text-ink">{row.leads}</td>
                    <td className="py-3.5 pr-4 font-data text-xs text-muted">{row.costPerLead ? formatIDR(row.costPerLead) : "—"}</td>
                    <td className="py-3.5 pr-4 font-data text-xs text-ink">{row.engagementRate}%</td>
                    <td className="py-3.5">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
