import { Topbar } from "@/components/dashboard/topbar";
import { SectionLabel } from "@/components/dashboard/section-label";
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
      <Topbar title="Performance" />

      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
        <header className="animate-rise mb-14">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            {leadDelta !== null && leadDelta >= 0
              ? "Akuisisi kamu membaik periode ini."
              : "Akuisisi kamu melambat periode ini."}
          </h1>
          <p className="mt-2 text-sm text-muted">Data diperbarui manual oleh tim Adsbangda setiap minggu.</p>
        </header>

        {/* Metrics — inline, not carded */}
        <section className="animate-rise mb-14 flex flex-wrap gap-x-12 gap-y-6" style={{ animationDelay: "60ms" }}>
          {[
            { label: "Leads", value: formatNumber(latestMeta?.leads ?? 0) },
            { label: "CPL", value: formatIDR(latestMeta?.costPerLead ?? 0) },
            { label: "Ad Spend", value: formatIDR(latestMeta?.spend ?? 0) },
            { label: "Reach", value: formatNumber(latestMeta?.reach ?? 0) },
            { label: "Engagement", value: `${latestSocial?.engagementRate?.toFixed(1) ?? "0"}%` },
            { label: "Conversions", value: formatNumber(latestWebsite?.conversions ?? 0) },
          ].map((m) => (
            <div key={m.label}>
              <p className="font-data text-2xl font-semibold text-ink">{m.value}</p>
              <p className="mt-0.5 text-xs text-muted">{m.label}</p>
            </div>
          ))}
        </section>

        {/* Chart */}
        <section className="animate-rise mb-14" style={{ animationDelay: "100ms" }}>
          <SectionLabel>Leads Over Time · 5 Minggu Terakhir</SectionLabel>
          <TrendChart data={leadsChartData} dataKey="value" format="number" />
        </section>

        {/* Channel performance — table is the right pattern here */}
        <section className="animate-rise mb-14" style={{ animationDelay: "140ms" }}>
          <SectionLabel>Channel Performance</SectionLabel>
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
                  <td className="py-3.5 pr-4 font-data text-xs text-muted">
                    {row.spend ? formatIDR(row.spend) : "—"}
                  </td>
                  <td className="py-3.5 pr-4 font-data text-xs text-ink">{row.leads}</td>
                  <td className="py-3.5 pr-4 font-data text-xs text-muted">
                    {row.costPerLead ? formatIDR(row.costPerLead) : "—"}
                  </td>
                  <td className="py-3.5 pr-4 font-data text-xs text-ink">{row.engagementRate}%</td>
                  <td className="py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Top content */}
        <section className="animate-rise" style={{ animationDelay: "180ms" }}>
          <SectionLabel>Top Performing Content</SectionLabel>
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
        </section>
      </div>
    </div>
  );
}
