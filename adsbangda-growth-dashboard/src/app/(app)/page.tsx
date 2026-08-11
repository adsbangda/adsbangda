import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { MonthlyProgress } from "@/components/dashboard/monthly-progress";
import { ActivityList } from "@/components/dashboard/activity-item";
import { ActionItem } from "@/components/dashboard/action-item";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  getCurrentClient,
  getActiveProject,
  getAttentionItems,
  getPerformanceSummary,
  getRecentActivity,
} from "@/lib/data";
import { formatIDR, formatNumber } from "@/lib/utils";
import { Wallet, Users, MousePointerClick, CalendarCheck, FileEdit, TrendingUp, LifeBuoy, Sparkles } from "lucide-react";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

// TODO (later phase): turunkan dari kontrak/deliverable client yang sesungguhnya
// (lihat spec §11–12). Untuk Phase 1 ini hanya contoh statis agar sistem visual
// MonthlyProgress bisa dibangun tanpa menunggu engine kontrak dinamis.
const MONTHLY_PROGRESS = {
  periodLabel: "Agustus 2026",
  overallPct: 72,
  categories: [
    { label: "Social Media", pct: 80 },
    { label: "Meta Ads", pct: 70 },
    { label: "Website", pct: 50 },
  ],
};

const QUICK_ACTIONS = [
  { href: "/content-calendar", label: "Review Konten", icon: FileEdit },
  { href: "/performance", label: "Lihat Performance", icon: TrendingUp },
  { href: "/reports", label: "Report Bulanan", icon: CalendarCheck },
];

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

  const leadsChartData = performance.metaAds.map((m) => ({ label: shortDate(m.date), value: m.leads ?? 0 }));
  const totalLeads = performance.metaAds.reduce((sum, m) => sum + (m.leads ?? 0), 0);
  const totalSpend = performance.metaAds.reduce((sum, m) => sum + (m.spend ?? 0), 0);
  const avgCpl = totalSpend / (totalLeads || 1);

  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date());
  const tasksDone = tasks.filter((t) => t.status === "done").length;
  const campaignProgressPct = Math.round((tasksDone / (tasks.length || 1)) * 100);

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Overview" />

      <div className="space-y-8 p-5 lg:p-8">
        {/* Client context — who this workspace belongs to, never anonymous */}
        <section className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-6">
          <div>
            <p className="font-data text-[11px] font-semibold uppercase tracking-wider text-muted">{client.name}</p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink lg:text-[1.75rem]">
              Marketing Workspace
            </h1>
            <p className="mt-1 text-sm text-muted">{monthLabel} · Ringkasan perkembangan marketing kamu.</p>
          </div>
        </section>

        {/* 1. Monthly Contract / Delivery Progress */}
        <section>
          <MonthlyProgress {...MONTHLY_PROGRESS} />
        </section>

        {/* 2. Key Metrics */}
        <section>
          <SectionHeading title="Key Metrics" description="Ringkasan performa minggu ini." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Leads Minggu Ini"
              value={formatNumber(latestMeta?.leads ?? 0)}
              icon={MousePointerClick}
              iconColor="text-accent"
              iconBg="bg-accent-soft"
              delta={leadDelta !== null ? { value: `${Math.abs(leadDelta)}%`, direction: leadDelta >= 0 ? "up" : "down" } : undefined}
            />
            <KpiCard
              label="Cost per Lead"
              value={formatIDR(latestMeta?.costPerLead ?? 0)}
              icon={Wallet}
              iconColor="text-accent"
              iconBg="bg-accent-soft"
              delta={cplDelta !== null ? { value: `${Math.abs(cplDelta)}%`, direction: cplDelta <= 0 ? "up" : "down" } : undefined}
            />
            <KpiCard
              label="Followers"
              value={formatNumber(latestSocial?.followers ?? 0)}
              icon={Users}
              iconColor="text-accent"
              iconBg="bg-accent-soft"
              comparisonLabel="Engagement rate"
              comparisonValue={`${latestSocial?.engagementRate?.toFixed(1) ?? "0"}%`}
            />
            <KpiCard
              label="Campaign Progress"
              value={`${campaignProgressPct}%`}
              icon={CalendarCheck}
              iconColor="text-accent"
              iconBg="bg-accent-soft"
              progressPct={campaignProgressPct}
              comparisonLabel={project?.name ?? "Belum ada campaign"}
            />
          </div>
        </section>

        {/* 3. Needs Your Attention */}
        <section>
          <SectionHeading
            title="Needs Your Attention"
            action={
              attentionItems.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 font-data text-[11px] font-semibold text-danger">
                  {attentionItems.length} Pending
                </span>
              )
            }
          />
          {attentionItems.length === 0 ? (
            <EmptyState title="Tidak ada yang perlu direview" description="Semua sudah beres — tidak ada approval atau keputusan yang menunggu kamu saat ini." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {attentionItems.map((item) => (
                <ActionItem key={item.id} {...item} />
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Lead performance chart */}
          <Card className="lg:col-span-2">
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
              <div className="rounded-[var(--radius-md)] bg-black/[0.02] p-3 text-center">
                <p className="font-data text-lg font-bold text-ink">{formatNumber(totalLeads)}</p>
                <p className="text-[11px] text-muted">Total Leads</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-black/[0.02] p-3 text-center">
                <p className={`font-data text-lg font-bold ${leadDelta !== null && leadDelta < 0 ? "text-danger" : "text-success"}`}>
                  {leadDelta !== null ? `${leadDelta >= 0 ? "+" : ""}${leadDelta}%` : "—"}
                </p>
                <p className="text-[11px] text-muted">Growth Rate</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-black/[0.02] p-3 text-center">
                <p className="font-data text-lg font-bold text-ink">{formatIDR(avgCpl)}</p>
                <p className="text-[11px] text-muted">Avg CPL</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-black/[0.02] p-3 text-center">
                <p className="font-data text-lg font-bold text-ink">{formatIDR(totalSpend)}</p>
                <p className="text-[11px] text-muted">Total Spend</p>
              </div>
            </div>
          </Card>

          {/* 4. What AdsBangda Did */}
          <Card>
            <SectionHeading title="What AdsBangda Did" />
            {activity.length === 0 ? (
              <EmptyState title="Belum ada aktivitas" description="Aktivitas tim Adsbangda akan muncul di sini." />
            ) : (
              <ActivityList items={activity} />
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Quick actions — restrained, not a colorful tile grid */}
          <section>
            <SectionHeading title="Quick Actions" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-xs)] transition-colors hover:border-ink"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-accent-soft text-accent">
                    <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm font-semibold text-ink">{label}</span>
                </a>
              ))}
              <a
                href="https://wa.me/6282289348724"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-xs)] transition-colors hover:border-ink"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-accent-soft text-accent">
                  <LifeBuoy className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-semibold text-ink">Hubungi Tim</span>
              </a>
            </div>
          </section>

          {/* 5. Project / Campaign Progress */}
          <Card className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">{project?.name ?? "Campaign"}</h2>
              {project && <StatusBadge status={project.status} />}
            </div>
            {tasks.length === 0 ? (
              <EmptyState title="Belum ada campaign aktif" />
            ) : (
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
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
