import { Topbar } from "@/components/dashboard/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { HeroStat } from "@/components/dashboard/hero-stat";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { TrendChart } from "@/components/dashboard/trend-chart";
import {
  getCurrentClient,
  getActiveProject,
  getAttentionItems,
  getPerformanceSummary,
  getRecentActivity,
} from "@/lib/data";
import { formatDateID, formatIDR, formatNumber } from "@/lib/utils";
import {
  Wallet,
  Users,
  MousePointerClick,
  TrendingUp,
  ArrowRight,
  FileEdit,
  CalendarCheck,
  MessageCircle,
  LifeBuoy,
  Sparkles,
} from "lucide-react";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

const ACTIVITY_DOT: Record<string, string> = {
  success: "bg-success",
  accent: "bg-accent",
  warning: "bg-warning",
  muted: "bg-muted",
};

export default async function OverviewPage() {
  const client = await getCurrentClient();
  const [{ project, tasks }, attentionItems, performance, activity] = await Promise.all([
    getActiveProject(client.id),
    getAttentionItems(),
    getPerformanceSummary(client.id),
    getRecentActivity(),
  ]);

  const latestMeta = performance.metaAds.at(-1);
  const previousMeta = performance.metaAds.at(-2);
  const latestSocial = performance.social.at(-1);

  const pct = (curr?: number, prev?: number) =>
    curr !== undefined && prev ? Math.round(((curr - prev) / prev) * 100) : null;
  const leadDelta = pct(latestMeta?.leads, previousMeta?.leads);
  const cplDelta = pct(latestMeta?.costPerLead, previousMeta?.costPerLead);
  const spendDelta = pct(latestMeta?.spend, previousMeta?.spend);

  const leadsChartData = performance.metaAds.map((m) => ({ label: shortDate(m.date), value: m.leads ?? 0 }));
  const totalLeads = performance.metaAds.reduce((sum, m) => sum + (m.leads ?? 0), 0);
  const totalSpend = performance.metaAds.reduce((sum, m) => sum + (m.spend ?? 0), 0);
  const avgCpl = totalSpend / (totalLeads || 1);

  const today = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Overview" />

      <div className="space-y-8 p-5 lg:p-8">
        {/* Hero gradient banner */}
        <section className="animate-rise relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-accent-2 to-ink p-7 text-white shadow-[var(--shadow-md)] lg:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-data text-[11px] font-medium">
                {today}
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-tight lg:text-3xl">
                Welcome back, {client.name}
              </h1>
              <p className="mt-1 text-sm text-blue-100">Ini ringkasan performa marketing kamu.</p>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <HeroStat label="Leads Minggu Ini" value={formatNumber(latestMeta?.leads ?? 0)} delta={leadDelta !== null ? `${leadDelta >= 0 ? "+" : ""}${leadDelta}% dari minggu lalu` : undefined} icon={MousePointerClick} />
            <HeroStat label="Ad Spend" value={formatIDR(latestMeta?.spend ?? 0)} delta={spendDelta !== null ? `${spendDelta >= 0 ? "+" : ""}${spendDelta}% dari minggu lalu` : undefined} icon={Wallet} />
            <HeroStat label="Followers" value={formatNumber(latestSocial?.followers ?? 0)} icon={Users} />
            <HeroStat label="Engagement" value={`${latestSocial?.engagementRate?.toFixed(1) ?? "0"}%`} icon={TrendingUp} />
          </div>
        </section>

        {/* KPI cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="animate-rise" style={{ animationDelay: "60ms" }}>
            <KpiCard
              label="Leads Minggu Ini"
              value={formatNumber(latestMeta?.leads ?? 0)}
              icon={MousePointerClick}
              iconColor="text-accent"
              iconBg="bg-accent-soft"
              delta={leadDelta !== null ? { value: `${Math.abs(leadDelta)}%`, direction: leadDelta >= 0 ? "up" : "down" } : undefined}
              progressPct={70}
              comparisonLabel="vs minggu lalu"
              comparisonValue={formatNumber(previousMeta?.leads ?? 0)}
            />
          </div>
          <div className="animate-rise" style={{ animationDelay: "120ms" }}>
            <KpiCard
              label="Cost per Lead"
              value={formatIDR(latestMeta?.costPerLead ?? 0)}
              icon={Wallet}
              iconColor="text-success"
              iconBg="bg-success-soft"
              delta={cplDelta !== null ? { value: `${Math.abs(cplDelta)}%`, direction: cplDelta <= 0 ? "up" : "down" } : undefined}
              progressPct={55}
              progressColor="bg-success"
              comparisonLabel="vs minggu lalu"
              comparisonValue={formatIDR(previousMeta?.costPerLead ?? 0)}
            />
          </div>
          <div className="animate-rise" style={{ animationDelay: "180ms" }}>
            <KpiCard
              label="Followers"
              value={formatNumber(latestSocial?.followers ?? 0)}
              icon={Users}
              iconColor="text-warning"
              iconBg="bg-warning-soft"
              progressPct={80}
              progressColor="bg-warning"
              comparisonLabel="growth rate"
              comparisonValue={`${latestSocial?.engagementRate?.toFixed(1)}%`}
            />
          </div>
          <div className="animate-rise" style={{ animationDelay: "240ms" }}>
            <KpiCard
              label="Campaign Progress"
              value={`${Math.round((tasks.filter((t) => t.status === "done").length / (tasks.length || 1)) * 100)}%`}
              icon={CalendarCheck}
              iconColor="text-accent-2"
              iconBg="bg-accent-soft"
              progressPct={Math.round((tasks.filter((t) => t.status === "done").length / (tasks.length || 1)) * 100)}
              comparisonLabel={project?.name ?? "Belum ada campaign"}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chart card */}
          <section className="animate-rise rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] lg:col-span-2" style={{ animationDelay: "280ms" }}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink">Lead Performance</h2>
                <p className="text-sm text-muted">Tren leads dari Meta Ads, 5 minggu terakhir</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 font-data text-xs font-semibold text-accent">
                <Sparkles className="h-3.5 w-3.5" /> Meta Ads
              </div>
            </div>
            <TrendChart data={leadsChartData} dataKey="value" format="number" />
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
              <div className="rounded-[var(--radius-md)] bg-accent-soft p-3 text-center">
                <p className="font-data text-lg font-bold text-accent">{formatNumber(totalLeads)}</p>
                <p className="text-[11px] text-muted">Total Leads</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-success-soft p-3 text-center">
                <p className="font-data text-lg font-bold text-success">{leadDelta !== null ? `${leadDelta}%` : "—"}</p>
                <p className="text-[11px] text-muted">Growth Rate</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-warning-soft p-3 text-center">
                <p className="font-data text-lg font-bold text-warning">{formatIDR(avgCpl)}</p>
                <p className="text-[11px] text-muted">Avg CPL</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-black/[0.03] p-3 text-center">
                <p className="font-data text-lg font-bold text-ink">{formatIDR(totalSpend)}</p>
                <p className="text-[11px] text-muted">Total Spend</p>
              </div>
            </div>
          </section>

          {/* Live activity */}
          <section className="animate-rise rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]" style={{ animationDelay: "320ms" }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Live Activity</h2>
              <span className="inline-flex items-center gap-1.5 font-data text-[11px] font-semibold text-success">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-success" /> Live
              </span>
            </div>
            <ul className="space-y-4">
              {activity.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${ACTIVITY_DOT[item.tone]}`} />
                  <div>
                    <p className="text-sm text-ink">
                      <span className="font-semibold">{item.actor}</span> {item.action}
                    </p>
                    <p className="mt-0.5 font-data text-[11px] text-muted">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Quick actions */}
          <section className="animate-rise" style={{ animationDelay: "360ms" }}>
            <h2 className="mb-4 text-base font-bold text-ink">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <a href="/content-calendar" className="rounded-[var(--radius-lg)] bg-accent p-4 text-white shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-0.5">
                <FileEdit className="h-5 w-5" strokeWidth={1.75} />
                <p className="mt-3 text-sm font-semibold">Review Konten</p>
              </a>
              <a href="/performance" className="rounded-[var(--radius-lg)] bg-success p-4 text-white shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-0.5">
                <TrendingUp className="h-5 w-5" strokeWidth={1.75} />
                <p className="mt-3 text-sm font-semibold">Lihat Performance</p>
              </a>
              <a href="/reports" className="rounded-[var(--radius-lg)] bg-warning p-4 text-white shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-0.5">
                <CalendarCheck className="h-5 w-5" strokeWidth={1.75} />
                <p className="mt-3 text-sm font-semibold">Report Bulanan</p>
              </a>
              <a href="https://wa.me/6282289348724" target="_blank" rel="noopener noreferrer" className="rounded-[var(--radius-lg)] bg-ink p-4 text-white shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-0.5">
                <LifeBuoy className="h-5 w-5" strokeWidth={1.75} />
                <p className="mt-3 text-sm font-semibold">Hubungi Tim</p>
              </a>
            </div>
          </section>

          {/* Campaign health */}
          <section className="animate-rise rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] lg:col-span-2" style={{ animationDelay: "400ms" }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">{project?.name ?? "Campaign"}</h2>
              {project && <StatusBadge status={project.status} />}
            </div>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4">
                  <span className="w-36 shrink-0 text-sm font-medium text-ink">{task.name}</span>
                  <div className="flex-1">
                    <ProgressBar value={task.progressPct} />
                  </div>
                  <span className="w-10 shrink-0 text-right font-data text-xs text-muted">{task.progressPct}%</span>
                  <span className="w-24 shrink-0 text-right">
                    <StatusBadge status={task.status} />
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Pending actions */}
        <section className="animate-rise" style={{ animationDelay: "440ms" }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Needs Your Attention</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 font-data text-[11px] font-semibold text-danger">
              {attentionItems.length} Pending
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-[var(--radius-lg)] border p-5 shadow-[var(--shadow-xs)] ${
                  item.urgent ? "border-danger-soft bg-danger-soft/40" : "border-border bg-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  <MessageCircle className={`h-5 w-5 ${item.urgent ? "text-danger" : "text-accent"}`} strokeWidth={1.75} />
                  <span className="font-data text-[11px] text-muted">{item.dueLabel}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{item.description}</p>
                <a
                  href={item.actionHref}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] py-2 text-xs font-semibold transition-colors ${
                    item.urgent ? "bg-danger text-white hover:bg-danger/90" : "bg-ink text-white hover:bg-accent"
                  }`}
                >
                  {item.actionLabel} <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
