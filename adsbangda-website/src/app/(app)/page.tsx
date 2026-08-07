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
import { Wallet, Users, MousePointerClick, CalendarClock } from "lucide-react";

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
    <>
      <Topbar
        title={`Halo, ${client.name} 👋`}
        subtitle="Ini ringkasan perkembangan marketing kamu minggu ini."
      />

      <div className="space-y-8 p-8">
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
          <section className="lg:col-span-2 rounded-[var(--radius-card)] border border-border bg-paper-deep p-6">
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
          <section className="rounded-[var(--radius-card)] border border-border bg-paper-deep p-6">
            <h2 className="mb-4 text-base font-bold text-ink">Upcoming Task</h2>
            <ul className="space-y-3">
              {upcomingTasks.map((task) => (
                <li key={task.id} className="flex items-start gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
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
    </>
  );
}
