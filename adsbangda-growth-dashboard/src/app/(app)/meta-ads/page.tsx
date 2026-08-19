import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { DateRangeTabs } from "@/components/dashboard/date-range-tabs";
import { getCurrentClient, getPerformanceSummary } from "@/lib/data";
import { formatIDR, formatNumber, formatMultiplier, formatPercent } from "@/lib/utils";
import { Target, Wallet, Eye, MousePointerClick, TrendingUp, UserCheck } from "lucide-react";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

export default async function MetaAdsPage() {
  const client = await getCurrentClient();
  const { metaAds, channelSummary } = await getPerformanceSummary(client.id);

  const latest = metaAds.at(-1);
  const previous = metaAds.at(-2);
  const pct = (curr?: number, prev?: number) =>
    curr !== undefined && prev ? Math.round(((curr - prev) / prev) * 100) : null;
  const leadDelta = pct(latest?.leads, previous?.leads);
  const cplDelta = pct(latest?.costPerLead, previous?.costPerLead);
  const roasDelta = pct(latest?.roas, previous?.roas);
  // Budget target persisten di level client (diisi admin sekali di Admin →
  // Meta Ads → Budget Target), BUKAN per snapshot — lihat Client.metaAdsBudgetTarget.
  const budgetTarget = client.metaAdsBudgetTarget;
  const budgetPct = budgetTarget && budgetTarget > 0 ? Math.min(100, Math.round(((latest?.spend ?? 0) / budgetTarget) * 100)) : null;

  const leadsChart = metaAds.map((m) => ({ label: shortDate(m.date), value: m.leads ?? 0 }));
  const metaAdsChannels = channelSummary.filter((c) => c.channel.toLowerCase().includes("meta"));

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Meta Ads" subtitle="Campaign performance & optimasi mingguan." />

      <div className="space-y-6 p-5 lg:p-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Leads"
            value={formatNumber(latest?.leads ?? 0)}
            icon={Target}
            iconColor="text-accent"
            iconBg="bg-accent-soft"
            delta={leadDelta !== null ? { value: `${Math.abs(leadDelta)}%`, direction: leadDelta >= 0 ? "up" : "down" } : undefined}
          />
          <KpiCard
            label="Cost per Lead"
            value={formatIDR(latest?.costPerLead ?? 0)}
            icon={Wallet}
            iconColor="text-accent"
            iconBg="bg-accent-soft"
            delta={cplDelta !== null ? { value: `${Math.abs(cplDelta)}%`, direction: cplDelta <= 0 ? "up" : "down" } : undefined}
          />
          <KpiCard
            label="Menjadi Client"
            value={formatNumber(latest?.closing ?? 0)}
            icon={UserCheck}
            iconColor="text-accent"
            iconBg="bg-accent-soft"
          />
          {latest?.conversionRate != null && (
            <KpiCard label="Conversion Rate" value={formatPercent(latest.conversionRate)} icon={Target} iconColor="text-accent" iconBg="bg-accent-soft" />
          )}
          {latest?.roas != null && (
            <KpiCard
              label="ROAS"
              value={formatMultiplier(latest.roas)}
              icon={TrendingUp}
              iconColor="text-accent"
              iconBg="bg-accent-soft"
              delta={roasDelta !== null ? { value: `${Math.abs(roasDelta)}%`, direction: roasDelta >= 0 ? "up" : "down" } : undefined}
            />
          )}
          <KpiCard label="Ad Spend" value={formatIDR(latest?.spend ?? 0)} icon={Wallet} iconColor="text-accent" iconBg="bg-accent-soft" />
          <KpiCard label="Reach" value={formatNumber(latest?.reach ?? 0)} icon={Eye} iconColor="text-accent" iconBg="bg-accent-soft" />
        </section>

        {budgetPct != null && (
          <Card>
            <SectionHeading title="Budget Terpakai" />
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl font-extrabold text-ink">{formatIDR(latest?.spend ?? 0)}</p>
              <p className="text-sm text-muted">dari {formatIDR(budgetTarget!)}</p>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                <div className="h-full rounded-full bg-accent" style={{ width: `${budgetPct}%` }} />
              </div>
              <span className="font-data text-sm font-bold text-ink">{budgetPct}%</span>
            </div>
          </Card>
        )}

        <Card>
          <SectionHeading title="Leads Over Time" description="Data mingguan" action={<DateRangeTabs />} />
          <TrendChart data={leadsChart} dataKey="value" format="number" />
        </Card>

        <Card padding="lg">
          <SectionHeading title="Campaign Summary" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="py-2.5 pr-4 font-medium">Channel</th>
                  <th className="py-2.5 pr-4 font-medium">Spend</th>
                  <th className="py-2.5 pr-4 font-medium">Leads</th>
                  <th className="py-2.5 pr-4 font-medium">CPL</th>
                  <th className="py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(metaAdsChannels.length > 0 ? metaAdsChannels : channelSummary).map((row) => (
                  <tr key={row.channel} className="border-b border-border last:border-0">
                    <td className="py-3.5 pr-4 font-medium text-ink">{row.channel}</td>
                    <td className="py-3.5 pr-4 font-data text-xs text-muted">{row.spend ? formatIDR(row.spend) : "—"}</td>
                    <td className="py-3.5 pr-4 font-data text-xs text-ink">{row.leads}</td>
                    <td className="py-3.5 pr-4 font-data text-xs text-muted">{row.costPerLead ? formatIDR(row.costPerLead) : "—"}</td>
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
          <SectionHeading title="Weekly Campaign Optimization" />
          <div className="flex flex-wrap gap-2">
            {["Week 1", "Week 2", "Week 3", "Week 4"].map((week, i) => (
              <span
                key={week}
                className={
                  i < 3
                    ? "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-success-soft bg-success-soft px-3 py-1.5 font-data text-xs font-medium text-success"
                    : "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-black/[0.02] px-3 py-1.5 font-data text-xs font-medium text-muted"
                }
              >
                <MousePointerClick className="h-3 w-3" strokeWidth={1.75} />
                {week} {i < 3 ? "· Done" : "· Upcoming"}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
