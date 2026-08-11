import { Topbar } from "@/components/dashboard/topbar";
import { Metric } from "@/components/dashboard/metric";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { getCurrentClient, getPerformanceSummary } from "@/lib/data";
import { formatIDR, formatNumber } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

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

      <div className="mx-auto max-w-6xl space-y-10 px-5 py-8 lg:px-8 lg:py-10">
        {/* Performance summary */}
        <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-xs)]">
          <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-muted">
            Performance Summary
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            <Metric
              label="Leads"
              value={formatNumber(latestMeta?.leads ?? 0)}
              delta={leadDelta !== null ? { value: `${Math.abs(leadDelta)}%`, direction: leadDelta >= 0 ? "up" : "down" } : undefined}
            />
            <Metric label="CPL" value={formatIDR(latestMeta?.costPerLead ?? 0)} />
            <Metric label="Ad Spend" value={formatIDR(latestMeta?.spend ?? 0)} />
            <Metric label="Reach" value={formatNumber(latestMeta?.reach ?? 0)} />
            <Metric label="Engagement" value={`${latestSocial?.engagementRate?.toFixed(1) ?? "0"}%`} />
            <Metric label="Conversions" value={formatNumber(latestWebsite?.conversions ?? 0)} />
          </div>
        </section>

        {/* Performance over time */}
        <section>
          <h3 className="mb-4 text-base font-bold text-ink">Performance Over Time</h3>
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-xs)]">
            <p className="mb-4 text-sm text-muted">Leads · 5 minggu terakhir</p>
            <TrendChart data={leadsChartData} dataKey="value" format="number" />
          </div>
        </section>

        {/* Channel performance table */}
        <section>
          <h3 className="mb-4 text-base font-bold text-ink">Channel Performance</h3>
          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-xs)]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Channel</th>
                  <th className="px-5 py-3 font-medium">Spend</th>
                  <th className="px-5 py-3 font-medium">Leads</th>
                  <th className="px-5 py-3 font-medium">CPL</th>
                  <th className="px-5 py-3 font-medium">Engagement</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {channelSummary.map((row) => (
                  <tr key={row.channel} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5 font-medium text-ink">{row.channel}</td>
                    <td className="px-5 py-3.5 font-data text-xs text-muted">
                      {row.spend ? formatIDR(row.spend) : "—"}
                    </td>
                    <td className="px-5 py-3.5 font-data text-xs text-ink">{row.leads}</td>
                    <td className="px-5 py-3.5 font-data text-xs text-muted">
                      {row.costPerLead ? formatIDR(row.costPerLead) : "—"}
                    </td>
                    <td className="px-5 py-3.5 font-data text-xs text-ink">{row.engagementRate}%</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top performing content — supplementary, kept light */}
        <section>
          <h3 className="mb-4 text-base font-bold text-ink">Top Performing Content</h3>
          <div className="divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-xs)]">
            {topContent.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4 p-4">
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
        </section>
      </div>
    </div>
  );
}
