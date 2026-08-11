import { Topbar } from "@/components/dashboard/topbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import {
  getCurrentClient,
  getActiveProject,
  getUpcomingTasks,
  getPerformanceSummary,
} from "@/lib/data";
import { formatDateID, formatIDR, formatNumber } from "@/lib/utils";
import { Wallet, Users, MousePointerClick, CalendarClock, Sparkles } from "lucide-react";

export default async function OverviewPage() {
  const client = await getCurrentClient();
  const [{ project, tasks }, upcomingTasks, performance] = await Promise.all([
    getActiveProject(client.id),
    getUpcomingTasks(),
    getPerformanceSummary(client.id),
  ]);

  const latestMeta = performance.metaAds.at(-1);
  const previousMeta = performance.metaAds.at(-2);
  const latestSocial = performance.social.at(-1);

  const leadDelta =
    latestMeta && previousMeta && previousMeta.leads
      ? Math.round(((latestMeta.leads! - previousMeta.leads!) / previousMeta.leads!) * 100)
      : null;

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar
        title={`Halo, ${client.name} 👋`}
        subtitle="Ini ringkasan perkembangan marketing kamu minggu ini."
      />

      <div className="space-y-8 p-8">
        {/* Hero summary banner */}
        <section className="relative overflow-hidden rounded-[var(--radius-card)] bg-ink px-7 py-8 text-paper shadow-[var(--shadow-card)]">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-data text-[11px] font-semibold uppercase tracking-wide text-blue-200">
                <Sparkles className="h-3 w-3" /> Campaign {project?.name?.replace("Campaign ", "") ?? "Aktif"}
              </div>
              <p className="mt-3 max-w-md text-sm text-muted-on-dark">
                Leads naik <span className="font-semibold text-white">{leadDelta ?? 0}%</span> dari minggu
                lalu, dan {tasks.filter((t) => t.status === "done").length} dari {tasks.length} tahap
                campaign sudah selesai.
              </p>
            </div>
            <div className="flex gap-8">
              <div>
                <div className="font-data text-2xl font-bold">{formatNumber(latestMeta?.leads ?? 0)}</div>
                <div className="mt-1 text-xs text-muted-on-dark">Leads minggu ini</div>
              </div>
              <div>
                <div className="font-data text-2xl font-bold">
                  {latestSocial?.engagementRate?.toFixed(1) ?? "0"}%
                </div>
                <div className="mt-1 text-xs text-muted-on-dark">Engagement rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* KPI cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Ad Spend Minggu Ini"
            value={latestMeta ? formatIDR(latestMeta.spend ?? 0) : "—"}
            icon={Wallet}
          />
          <StatCard
            label="Leads Minggu Ini"
            value={latestMeta ? formatNumber(latestMeta.leads ?? 0) : "—"}
            delta={
              leadDelta !== null
                ? { value: `${Math.abs(leadDelta)}% vs minggu lalu`, direction: leadDelta >= 0 ? "up" : "down" }
                : undefined
            }
            icon={MousePointerClick}
          />
          <StatCard
            label="Followers"
            value={latestSocial ? formatNumber(latestSocial.followers ?? 0) : "—"}
            icon={Users}
          />
          <StatCard
            label="Engagement Rate"
            value={latestSocial ? `${latestSocial.engagementRate?.toFixed(1)}%` : "—"}
            icon={CalendarClock}
          />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Project progress */}
          <section className="lg:col-span-2 rounded-[var(--radius-card)] border border-border bg-paper-deep p-6 shadow-[var(--shadow-card)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">
                  {project?.name ?? "Belum ada project aktif"}
                </h2>
                {project && (
                  <p className="mt-0.5 text-sm text-muted">
                    {formatDateID(project.startDate)} — {formatDateID(project.endDate)}
                  </p>
                )}
              </div>
              {project && <StatusBadge status={project.status} />}
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4">
                  <div className="w-40 shrink-0 text-sm font-medium text-ink">{task.name}</div>
                  <div className="flex-1">
                    <ProgressBar value={task.progressPct} />
                  </div>
                  <div className="w-12 shrink-0 text-right font-data text-xs text-muted">
                    {task.progressPct}%
                  </div>
                  <div className="w-24 shrink-0 text-right">
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming tasks */}
          <section className="rounded-[var(--radius-card)] border border-border bg-paper-deep p-6 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-base font-bold text-ink">Upcoming Task</h2>
            <ul className="space-y-1">
              {upcomingTasks.map((task) => (
                <li
                  key={task.id}
                  className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-accent-soft/60"
                >
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent transition-transform group-hover:scale-125" />
                  <div>
                    <p className="text-sm font-medium text-ink">{task.title}</p>
                    <p className="font-data text-xs text-muted">{formatDateID(task.dueDate)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
