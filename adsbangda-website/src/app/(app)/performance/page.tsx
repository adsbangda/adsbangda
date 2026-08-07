import { Topbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { getCurrentClient, getPerformanceSummary } from "@/lib/data";
import { formatIDR, formatNumber, formatDateID } from "@/lib/utils";
import { Wallet, Eye, MousePointerClick, Target, Users2, Heart, Globe, TrendingUp } from "lucide-react";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

export default async function PerformancePage() {
  const client = await getCurrentClient();
  const { metaAds, social, website, topContent } = await getPerformanceSummary(client.id);

  const latestMeta = metaAds.at(-1);
  const latestSocial = social.at(-1);
  const latestWebsite = website.at(-1);

  const metaChartData = metaAds.map((m) => ({ label: shortDate(m.date), value: m.leads ?? 0 }));
  const spendChartData = metaAds.map((m) => ({ label: shortDate(m.date), value: m.spend ?? 0 }));
  const followersChartData = social.map((s) => ({ label: shortDate(s.date), value: s.followers ?? 0 }));
  const visitorsChartData = website.map((w) => ({ label: shortDate(w.date), value: w.visitors ?? 0 }));

  return (
    <>
      <Topbar
        title="Marketing Performance"
        subtitle="Data diperbarui manual oleh tim Adsbangda setiap minggu."
      />

      <div className="space-y-10 p-8">
        {/* Meta Ads */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink">
            <Target className="h-4 w-4 text-accent" /> Meta Ads
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Ad Spend" value={formatIDR(latestMeta?.spend ?? 0)} icon={Wallet} />
            <StatCard label="Reach" value={formatNumber(latestMeta?.reach ?? 0)} icon={Eye} />
            <StatCard label="Impressions" value={formatNumber(latestMeta?.impressions ?? 0)} icon={Eye} />
            <StatCard label="Clicks" value={formatNumber(latestMeta?.clicks ?? 0)} icon={MousePointerClick} />
            <StatCard label="Cost per Lead" value={formatIDR(latestMeta?.costPerLead ?? 0)} icon={Target} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-border bg-paper-deep p-6">
              <p className="mb-2 text-sm font-semibold text-ink">Leads per minggu</p>
              <TrendChart data={metaChartData} dataKey="value" format="number" />
            </div>
            <div className="rounded-[var(--radius-card)] border border-border bg-paper-deep p-6">
              <p className="mb-2 text-sm font-semibold text-ink">Ad spend per minggu</p>
              <TrendChart data={spendChartData} dataKey="value" format="idr" />
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink">
            <Users2 className="h-4 w-4 text-accent" /> Social Media
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Followers" value={formatNumber(latestSocial?.followers ?? 0)} icon={Users2} />
            <StatCard label="Engagement Rate" value={`${latestSocial?.engagementRate?.toFixed(1) ?? "0"}%`} icon={Heart} />
            <StatCard label="Reach" value={formatNumber(latestSocial?.reach ?? 0)} icon={Eye} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-border bg-paper-deep p-6">
              <p className="mb-2 text-sm font-semibold text-ink">Followers growth</p>
              <TrendChart data={followersChartData} dataKey="value" format="number" />
            </div>
            <div className="rounded-[var(--radius-card)] border border-border bg-paper-deep p-6">
              <p className="mb-3 text-sm font-semibold text-ink">Top performing content</p>
              <ul className="space-y-3">
                {topContent.map((item, i) => (
                  <li key={i} className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-ink">{item.title}</p>
                      <p className="font-data text-xs text-muted">{formatNumber(item.reach)} reach</p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 font-data text-xs font-semibold text-success">
                      <TrendingUp className="h-3 w-3" /> {item.engagementRate}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Website */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink">
            <Globe className="h-4 w-4 text-accent" /> Website
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Visitor" value={formatNumber(latestWebsite?.visitors ?? 0)} icon={Eye} />
            <StatCard label="Conversion" value={formatNumber(latestWebsite?.conversions ?? 0)} icon={Target} />
            <StatCard
              label="Conversion Rate"
              value={
                latestWebsite?.visitors
                  ? `${((latestWebsite.conversions! / latestWebsite.visitors) * 100).toFixed(1)}%`
                  : "—"
              }
              icon={TrendingUp}
            />
          </div>
          <div className="mt-4 rounded-[var(--radius-card)] border border-border bg-paper-deep p-6">
            <p className="mb-2 text-sm font-semibold text-ink">Visitor per minggu</p>
            <TrendChart data={visitorsChartData} dataKey="value" format="number" />
          </div>
        </section>

        <p className="font-data text-xs text-muted">
          Update terakhir: {latestMeta ? formatDateID(latestMeta.date) : "—"}
        </p>
      </div>
    </>
  );
}
