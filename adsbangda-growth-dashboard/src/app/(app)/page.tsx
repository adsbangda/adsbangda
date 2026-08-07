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
import {
  Wallet,
  Users,
  MousePointerClick,
  CalendarClock,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  FileText,
} from "lucide-react";
import Link from "next/link";

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
    <div className="flex-1 min-h-screen">
      <Topbar
        title="Ringkasan Marketing"
        subtitle="Pantau perkembangan campaign & performa bisnis kamu."
      />

      <div className="space-y-8 p-6 sm:p-8 pt-4">
        {/* Premium Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-blue-900/20 bg-gradient-to-r from-[#18181B] via-[#1E293B] to-[#1D4ED8] p-6 sm:p-8 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 -bottom-12 h-40 w-40 rounded-full bg-blue-400/20 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-data text-[10px] font-semibold uppercase tracking-wider text-blue-200 border border-white/10 backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-blue-300" />
                <span>Marketing Report • Agustus 2026</span>
              </div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
                Halo, {client.name} 👋
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Performa campaign Meta Ads & Social Media menunjukkan tren positif minggu ini. Semua eksekusi berjalan sesuai jadwal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/performance"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-ink shadow-md transition-all hover:bg-slate-100 hover:scale-[1.02]"
              >
                <span>Lihat Performance</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/reports"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                <span>Unduh Laporan</span>
              </Link>
            </div>
          </div>
        </section>

        {/* KPI Cards Grid */}
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
                ? {
                    value: `${Math.abs(leadDelta)}% vs minggu lalu`,
                    direction: leadDelta >= 0 ? "up" : "down",
                  }
                : undefined
            }
            icon={MousePointerClick}
          />
          <StatCard
            label="Followers Instagram"
            value={latestSocial ? formatNumber(latestSocial.followers ?? 0) : "—"}
            icon={Users}
          />
          <StatCard
            label="Engagement Rate"
            value={latestSocial ? `${latestSocial.engagementRate?.toFixed(1)}%` : "—"}
            icon={CalendarClock}
          />
        </section>

        {/* Project Progress & Tasks Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Active Project Progress */}
          <section className="lg:col-span-2 rounded-2xl border border-border bg-paper-deep p-6 shadow-2xs">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <h2 className="text-base font-bold text-ink">
                  {project?.name ?? "Belum ada project aktif"}
                </h2>
                {project && (
                  <p className="mt-0.5 text-xs font-medium text-muted">
                    Periode: {formatDateID(project.startDate)} — {formatDateID(project.endDate)}
                  </p>
                )}
              </div>
              {project && <StatusBadge status={project.status} />}
            </div>

            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-paper/60 transition-colors border border-transparent hover:border-border/40"
                >
                  <div className="flex items-center gap-2.5 w-48 shrink-0">
                    <CheckCircle2
                      className={
                        task.status === "done"
                          ? "h-4 w-4 text-emerald-600"
                          : "h-4 w-4 text-border"
                      }
                    />
                    <span className="text-sm font-semibold text-ink truncate">
                      {task.name}
                    </span>
                  </div>

                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar value={task.progressPct} />
                    </div>
                    <span className="w-10 text-right font-data text-xs font-semibold text-muted">
                      {task.progressPct}%
                    </span>
                  </div>

                  <div className="w-28 shrink-0 text-right">
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex justify-end">
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 font-data text-xs font-semibold text-accent hover:underline"
              >
                <span>Detail Project Progress</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>

          {/* Upcoming Tasks */}
          <section className="rounded-2xl border border-border bg-paper-deep p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-ink">Upcoming Task</h2>
                <span className="font-data text-[10px] font-bold text-muted bg-paper px-2 py-0.5 rounded-full border border-border">
                  {upcomingTasks.length} Pending
                </span>
              </div>

              <ul className="space-y-3.5">
                {upcomingTasks.map((task) => (
                  <li
                    key={task.id}
                    className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-paper border border-transparent hover:border-border/40"
                  >
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent group-hover:scale-125 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink leading-snug">
                        {task.title}
                      </p>
                      <p className="mt-1 font-data text-[11px] text-muted">
                        Due: {formatDateID(task.dueDate)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-border/60">
              <Link
                href="/content-calendar"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-paper py-2.5 font-data text-xs font-semibold text-ink transition-colors hover:bg-paper-deep hover:border-accent/40"
              >
                <span>Buka Content Calendar</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}