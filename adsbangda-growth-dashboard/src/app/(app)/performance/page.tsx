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
    <div className="flex-1 min-h-screen">
      <Topbar
        title="Marketing Performance"
        subtitle="Data diperbarui periodik oleh tim AdsBangda."
      />

      <div className="space-y-10 p-6 sm:p-8 pt-4">
        {/* Meta Ads */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Target className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-ink">Meta Ads Performance</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Ad Spend" value={formatIDR(latestMeta?.spend ?? 0)} icon={Wallet} />
            <StatCard label="Reach" value={formatNumber(latestMeta?.reach ?? 0)} icon={Eye} />
            <StatCard label="Impressions" value={formatNumber(latestMeta?.impressions ?? 0)} icon={Eye} />
            <StatCard label="Clicks" value={formatNumber(latestMeta?.clicks ?? 0)} icon={MousePointerClick} />
            <StatCard label="Cost per Lead" value={formatIDR(latestMeta?.costPerLead ?? 0)} icon={Target} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-paper-deep p-6 shadow-2xs">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted font-data">Leads Per Minggu</p>
              <TrendChart data={metaChartData} dataKey="value" format="number" />
            </div>
            <div className="rounded-2xl border border-border bg-paper-deep p-6 shadow-2xs">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted font-data">Ad Spend Per Minggu</p>
              <TrendChart data={spendChartData} dataKey="value" format="idr" />
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="space-y-4 pt-4 border-t border-border/60">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Users2 className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-ink">Social Media Organic</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Followers" value={formatNumber(latestSocial?.followers ?? 0)} icon={Users2} />
            <StatCard label="Engagement Rate" value={`${latestSocial?.engagementRate?.toFixed(1) ?? "0"}%`} icon={Heart} />
            <StatCard label="Total Reach" value={formatNumber(latestSocial?.reach ?? 0)} icon={Eye} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-paper-deep p-6 shadow-2xs">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted font-data">Followers Growth</p>
              <TrendChart data={followersChartData} dataKey="value" format="number" />
            </div>
            <div className="rounded-2xl border border-border bg-paper-deep p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted font-data">Top Performing Content</p>
                <ul className="space-y-3.5">
                  {topContent.map((item, i) => (
                    <li key={i} className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-xs font-semibold text-ink">{item.title}</p>
                        <p className="font-data text-[11px] text-muted mt-0.5">{formatNumber(item.reach)} reach</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 font-data text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <TrendingUp className="h-3 w-3" /> {item.engagementRate}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Website Traffic */}
        <section className="space-y-4 pt-4 border-t border-border/60">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Globe className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-ink">Website Traffic & Conversions</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Visitors" value={formatNumber(latestWebsite?.visitors ?? 0)} icon={Eye} />
            <StatCard label="Conversions" value={formatNumber(latestWebsite?.conversions ?? 0)} icon={Target} />
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

          <div className="rounded-2xl border border-border bg-paper-deep p-6 shadow-2xs">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted font-data">Visitors Per Minggu</p>
            <TrendChart data={visitorsChartData} dataKey="value" format="number" />
          </div>
        </section>

        <p className="font-data text-xs text-muted pt-2">
          Update Terakhir: {latestMeta ? formatDateID(latestMeta.date) : "—"}
        </p>
      </div>
    </div>
  );
}