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
  MousePointerClick,
  Send,
  Download,
  ArrowRight,
  BarChart3,
  Building2,
  Plane,
  ChevronRight,
  Sparkles,
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

  return (
    <div className="flex-1 min-h-screen">
      <Topbar title="Overview" subtitle={`Halo, ${client.name} 👋`} />

      <div className="space-y-6 p-6 sm:p-8 pt-2">
        {/* TOP ROW: Card Balance / Actions + Performance Chart */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Credit Card / Balance & Action Blocks (Span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-ink tracking-tight flex items-center gap-2">
              <span>Kartu & Saldo Campaign</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white transition-transform hover:scale-105"
              >
                <span>Add new</span>
                <span className="font-bold">+</span>
              </button>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Card Banner */}
              <div className="sm:col-span-6 relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#18181B] via-[#1E293B] to-[#1D4ED8] p-5 text-white shadow-md">
                <div className="flex items-center justify-between text-xs opacity-90 font-medium">
                  <span>AdsBangda Card</span>
                  <span className="font-bold tracking-wider text-sm italic">VISA</span>
                </div>
                <div className="mt-8 font-data text-base font-bold tracking-widest text-white/90">
                  1234 5678 9101 1121
                </div>
                <div className="mt-6 flex items-end justify-between text-xs opacity-80">
                  <div>
                    <div className="text-[10px] uppercase text-blue-200">Klien</div>
                    <div className="font-semibold text-white">{client.name}</div>
                  </div>
                  <div className="font-data">08/28</div>
                </div>
              </div>

              {/* Card Balance & Quick Actions */}
              <div className="sm:col-span-6 flex flex-col justify-between rounded-[24px] bg-paper-deep p-5 border border-border shadow-xs">
                <div>
                  <span className="text-xs font-medium text-muted">Total Ad Spend Minggu Ini</span>
                  <div className="font-data text-2xl font-bold text-ink mt-1">
                    {latestMeta ? formatIDR(latestMeta.spend ?? 0) : "Rp 3.750.000"}
                  </div>
                  <Link
                    href="/performance"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                  >
                    <span>Lihat Rincian</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* 3 Quick Action Blocks */}
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-paper p-3 text-center transition-colors hover:bg-accent-soft cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <Send className="h-4 w-4" />
                    </div>
                    <span className="mt-2 text-[11px] font-semibold text-ink">Deposit</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-paper p-3 text-center transition-colors hover:bg-accent-soft cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <Download className="h-4 w-4" />
                    </div>
                    <span className="mt-2 text-[11px] font-semibold text-ink">Invoice</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-paper p-3 text-center transition-colors hover:bg-accent-soft cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <span className="mt-2 text-[11px] font-semibold text-ink">Report</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profit / Trend Wave Chart Card (Span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-[24px] border border-border bg-paper-deep p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-ink">Estimasi ROI & Growth</h2>
              <Link
                href="/performance"
                className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
              >
                <span>Lihat semua</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-3 flex items-center justify-end gap-1 font-data text-xs">
              <button type="button" className="rounded-full bg-paper px-3 py-1 font-bold text-ink">
                Week
              </button>
              <button type="button" className="rounded-full px-3 py-1 text-muted hover:text-ink">
                Month
              </button>
              <button type="button" className="rounded-full px-3 py-1 text-muted hover:text-ink">
                Year
              </button>
            </div>

            {/* Blue Wave Chart */}
            <div className="relative my-4 h-28 w-full">
              <svg viewBox="0 0 300 80" className="h-full w-full preserve-3d">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,50 Q40,65 80,40 T160,50 T240,20 T300,10 L300,80 L0,80 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M0,50 Q40,65 80,40 T160,50 T240,20 T300,10"
                  fill="none"
                  stroke="#1D4ED8"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="flex justify-between font-data text-xs text-muted">
              <span>Minggu 1</span>
              <span>Minggu 2</span>
              <span>Minggu 3</span>
              <span>Minggu 4</span>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Stat Cards + Spendings Bar Chart */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <StatCard
              label="Ad Spend Minggu Ini"
              value={latestMeta ? formatIDR(latestMeta.spend ?? 0) : "Rp 3.750.000"}
              delta={{ value: "+12%", direction: "up" }}
              icon={Wallet}
            />
          </div>

          <div className="lg:col-span-3">
            <StatCard
              label="Leads Minggu Ini"
              value={latestMeta ? formatNumber(latestMeta.leads ?? 0) : "58 Leads"}
              delta={{ value: "+18%", direction: "up" }}
              icon={MousePointerClick}
            />
          </div>

          <div className="lg:col-span-6 rounded-[24px] border border-border bg-paper-deep p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-ink">Statistik Performa Campaign</h3>
              </div>
              <span className="rounded-full bg-paper px-3 py-1 font-data text-xs font-semibold text-muted">
                2026
              </span>
            </div>

            <div className="flex h-32 items-end justify-between gap-2 pt-2 px-2">
              {[
                { m: "Jan", h: "40%" },
                { m: "Feb", h: "30%" },
                { m: "Mar", h: "60%" },
                { m: "Apr", h: "85%" },
                { m: "May", h: "45%" },
                { m: "Jun", h: "20%" },
                { m: "Jul", h: "50%" },
                { m: "Aug", h: "75%" },
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full rounded-full bg-paper h-24 overflow-hidden flex items-end">
                    <div
                      className="w-full rounded-full bg-accent transition-all"
                      style={{ height: bar.h }}
                    />
                  </div>
                  <span className="font-data text-[10px] text-muted">{bar.m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Project Progress + Transactions + Premium/Report Banner */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Project Progress */}
          <div className="lg:col-span-4 rounded-[24px] border border-border bg-paper-deep p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-ink">Project Progress</h3>
              <Link href="/projects" className="inline-flex items-center gap-1 text-xs font-bold text-accent">
                Lihat Detail +
              </Link>
            </div>

            <div className="space-y-4">
              {tasks.slice(0, 2).map((task) => (
                <div key={task.id} className="rounded-2xl bg-paper p-4">
                  <div className="flex items-center justify-between text-xs font-bold text-ink mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-accent" />
                      <span>{task.name}</span>
                    </div>
                    <span className="font-data text-muted">{task.progressPct}%</span>
                  </div>
                  <ProgressBar value={task.progressPct} />
                </div>
              ))}
            </div>
          </div>

          {/* Latest Activities */}
          <div className="lg:col-span-5 rounded-[24px] border border-border bg-paper-deep p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-ink">Aktivitas & Task Terdekat</h3>
              <span className="text-xs text-muted">Upcoming</span>
            </div>

            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-paper transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink">{task.title}</h4>
                      <p className="text-[11px] text-muted">{formatDateID(task.dueDate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report / Pro Banner */}
          <div className="lg:col-span-3 rounded-[24px] border border-border bg-paper-deep p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-ink">Report Center</h3>
                <Link href="/reports" className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Unduh laporan performa bulanan resmi dari tim AdsBangda.
              </p>
            </div>

            <div className="my-4 flex items-center justify-center rounded-2xl bg-accent-soft/80 p-4 border border-blue-100">
              <div className="text-center space-y-1">
                <Sparkles className="mx-auto h-8 w-8 text-accent animate-bounce" />
                <span className="font-data text-[11px] font-bold text-accent block">Monthly Report Ready</span>
              </div>
            </div>

            <Link href="/reports" className="w-full text-center rounded-full bg-[#18181B] py-2.5 font-data text-xs font-bold text-white transition-transform hover:scale-[1.02]">
              Lihat Laporan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}