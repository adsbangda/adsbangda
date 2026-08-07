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
  Sparkles,
  CheckCircle2,
  Clock,
  Globe,
  ExternalLink,
  MessageCircle,
  FileDown,
  RotateCcw,
  Video,
  Layers,
  Activity,
  ChevronRight,
  TrendingUp,
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
      <Topbar title="Overview" subtitle="Ringkasan eksekutif & performa bisnis." />

      <div className="space-y-8 p-6 sm:p-8 pt-4">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden rounded-[20px] border border-[#ECECEC] bg-gradient-to-r from-[#18181B] via-[#1E293B] to-[#1D4ED8] p-6 sm:p-8 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#1D4ED8]/30 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-data text-[10px] font-semibold uppercase tracking-wider text-blue-200 border border-white/10 backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-blue-300" />
                <span>Good Morning 👋</span>
              </div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
                {client.name}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Everything is running smoothly today. Campaign Meta Ads kamu berhasil meraup <span className="font-bold text-white font-data">137 Leads</span> bulan ini dengan respon positif.
              </p>
            </div>

            {/* Marketing Health Badge + Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <div className="flex items-center gap-3 rounded-[16px] bg-white/10 border border-white/15 px-4 py-3 backdrop-blur-md">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 font-data text-sm font-bold text-emerald-300 border border-emerald-400/30">
                  92
                </div>
                <div>
                  <div className="font-data text-[10px] uppercase text-slate-300">Marketing Health</div>
                  <div className="text-xs font-bold text-emerald-400">92 / 100 • Excellent</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/reports"
                  className="inline-flex items-center gap-2 rounded-[14px] bg-white px-4 py-2.5 text-xs font-bold text-[#18181B] shadow-md transition-all hover:bg-slate-100"
                >
                  <span>View Monthly Report</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-[14px] bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
                >
                  <span>Contact AdsBangda</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2. KPI CARDS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Ad Spend Minggu Ini"
            value={latestMeta ? formatIDR(latestMeta.spend ?? 0) : "Rp 3.750.000"}
            icon={Wallet}
            sparklineProgress={82}
          />
          <StatCard
            label="Leads Minggu Ini"
            value={latestMeta ? formatNumber(latestMeta.leads ?? 0) : "58 Leads"}
            delta={
              leadDelta !== null
                ? {
                    value: `${Math.abs(leadDelta)}% vs bln lalu`,
                    direction: leadDelta >= 0 ? "up" : "down",
                  }
                : { value: "18% vs bln lalu", direction: "up" }
            }
            icon={MousePointerClick}
            sparklineProgress={91}
          />
          <StatCard
            label="Followers Instagram"
            value={latestSocial ? formatNumber(latestSocial.followers ?? 0) : "19.400"}
            icon={Users}
            sparklineProgress={65}
          />
          <StatCard
            label="Engagement Rate"
            value={latestSocial ? `${latestSocial.engagementRate?.toFixed(1)}%` : "4.1%"}
            icon={CalendarClock}
            sparklineProgress={74}
          />
        </section>

        {/* 3. MARKETING SUMMARY & HEALTH WIDGET */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Health Score Breakdown */}
          <section className="lg:col-span-5 rounded-[20px] border border-[#ECECEC] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#ECECEC] pb-3.5 mb-5">
                <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#1D4ED8]" />
                  Marketing Health Score
                </h3>
                <span className="font-data text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  92 / 100
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Content Score", score: 95, color: "bg-emerald-500" },
                  { label: "Ads Performance Score", score: 88, color: "bg-[#1D4ED8]" },
                  { label: "Website Conversion Score", score: 90, color: "bg-emerald-500" },
                  { label: "Brand Consistency Score", score: 94, color: "bg-blue-500" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#18181B]">{item.label}</span>
                      <span className="font-data text-[#71717A]">{item.score}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#FAFAFA] border border-[#ECECEC]">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#ECECEC] flex items-center justify-between text-xs text-[#71717A]">
              <span>Diperbarui otomatis tiap minggu</span>
              <span className="font-data font-semibold text-[#18181B]">Status: Optimal</span>
            </div>
          </section>

          {/* Quick Actions Panel */}
          <section className="lg:col-span-7 rounded-[20px] border border-[#ECECEC] bg-[#FFFFFF] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#ECECEC] pb-3.5 mb-5">
                <h3 className="text-base font-bold text-[#18181B]">Quick Actions</h3>
                <span className="font-data text-xs text-[#71717A]">Pintasan Cepat</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/reports"
                  className="flex items-center gap-3 rounded-[14px] border border-[#ECECEC] bg-[#FAFAFA] p-3.5 transition-all hover:bg-[#EFF6FF] hover:border-[#1D4ED8]/30 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFFFFF] text-[#1D4ED8] shadow-2xs group-hover:bg-[#1D4ED8] group-hover:text-white transition-colors">
                    <FileDown className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#18181B]">Download Report</div>
                    <div className="text-[11px] text-[#71717A]">Unduh PDF bulanan</div>
                  </div>
                </Link>

                <a
                  href="https://wa.me/6281234567890?text=Halo%20AdsBangda,%20saya%20ingin%20request%20revisi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[14px] border border-[#ECECEC] bg-[#FAFAFA] p-3.5 transition-all hover:bg-[#EFF6FF] hover:border-[#1D4ED8]/30 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFFFFF] text-[#1D4ED8] shadow-2xs group-hover:bg-[#1D4ED8] group-hover:text-white transition-colors">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#18181B]">Request Revision</div>
                    <div className="text-[11px] text-[#71717A]">Kirim catatan ke tim</div>
                  </div>
                </a>

                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[14px] border border-[#ECECEC] bg-[#FAFAFA] p-3.5 transition-all hover:bg-[#EFF6FF] hover:border-[#1D4ED8]/30 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFFFFF] text-emerald-600 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#18181B]">Open WhatsApp</div>
                    <div className="text-[11px] text-[#71717A]">Chat Account Manager</div>
                  </div>
                </a>

                <a
                  href="https://www.adsbangda.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[14px] border border-[#ECECEC] bg-[#FAFAFA] p-3.5 transition-all hover:bg-[#EFF6FF] hover:border-[#1D4ED8]/30 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFFFFF] text-[#1D4ED8] shadow-2xs group-hover:bg-[#1D4ED8] group-hover:text-white transition-colors">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#18181B]">View Website</div>
                    <div className="text-[11px] text-[#71717A]">Buka www.adsbangda.com</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#ECECEC] text-right">
              <Link href="/performance" className="font-data text-xs font-bold text-[#1D4ED8] hover:underline inline-flex items-center gap-1">
                <span>Lihat Analisis Detail</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </section>
        </div>

        {/* 4. ACTIVE PROJECTS SUMMARY */}
        <section className="rounded-[20px] border border-[#ECECEC] bg-[#FFFFFF] p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#ECECEC] pb-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-[#18181B]">Active Project Summary</h3>
              <p className="text-xs text-[#71717A] mt-0.5">Status pengerjaan milestone layanan kamu.</p>
            </div>
            <Link href="/projects" className="font-data text-xs font-bold text-[#1D4ED8] hover:underline flex items-center gap-1">
              <span>Semua Project</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Project 1 */}
            <div className="rounded-[16px] border border-[#ECECEC] bg-[#FAFAFA] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#1D4ED8]" />
                  <span className="text-xs font-bold text-[#18181B]">Website Development</span>
                </div>
                <span className="font-data text-xs font-bold text-[#1D4ED8]">82%</span>
              </div>
              <ProgressBar value={82} />
              <div className="flex justify-between items-center text-[11px] text-[#71717A] font-data pt-1">
                <span>Milestone: Quality Check</span>
                <span>Due: 12 Aug</span>
              </div>
            </div>

            {/* Project 2 */}
            <div className="rounded-[16px] border border-[#ECECEC] bg-[#FAFAFA] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#1D4ED8]" />
                  <span className="text-xs font-bold text-[#18181B]">Meta Ads Campaign</span>
                </div>
                <StatusBadge status="active" />
              </div>
              <ProgressBar value={100} />
              <div className="flex justify-between items-center text-[11px] text-[#71717A] font-data pt-1">
                <span>Status: Running & Healthy</span>
                <span>Scale Mode</span>
              </div>
            </div>

            {/* Project 3 */}
            <div className="rounded-[16px] border border-[#ECECEC] bg-[#FAFAFA] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-[#1D4ED8]" />
                  <span className="text-xs font-bold text-[#18181B]">Social Media Production</span>
                </div>
                <StatusBadge status="done" />
              </div>
              <ProgressBar value={100} />
              <div className="flex justify-between items-center text-[11px] text-[#71717A] font-data pt-1">
                <span>16 Content Reels</span>
                <span>Completed</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. TODAY'S SCHEDULE & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Today's Schedule Timeline */}
          <section className="rounded-[20px] border border-[#ECECEC] bg-[#FFFFFF] p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#ECECEC] pb-3.5 mb-5">
              <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#1D4ED8]" />
                Jadwal Hari Ini
              </h3>
              <span className="font-data text-xs text-[#71717A]">Agenda Execution</span>
            </div>

            <div className="space-y-4 relative before:absolute before:left-11 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#ECECEC]">
              {[
                { time: "09:00", title: "Publish Reel Instagram & TikTok", desc: "Konten #12 - Promosi Menu Musiman" },
                { time: "11:00", title: "Launch Campaign Meta Ads Baru", desc: "A/B Testing Target Audiens Semarang" },
                { time: "15:00", title: "Client Sync Meeting", desc: "Review Performa & Approval Konten September" },
              ].map((item, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <span className="font-data text-xs font-bold text-[#1D4ED8] w-9 pt-0.5">{item.time}</span>
                  <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FFFFFF] border-2 border-[#1D4ED8]" />
                  <div className="flex-1 rounded-xl bg-[#FAFAFA] border border-[#ECECEC] p-3">
                    <p className="text-xs font-bold text-[#18181B]">{item.title}</p>
                    <p className="text-[11px] text-[#71717A] mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity Timeline */}
          <section className="rounded-[20px] border border-[#ECECEC] bg-[#FFFFFF] p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#ECECEC] pb-3.5 mb-5">
              <h3 className="text-base font-bold text-[#18181B] flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#1D4ED8]" />
                Aktivitas Terkini
              </h3>
              <span className="font-data text-xs text-[#71717A]">Real-time Log</span>
            </div>

            <div className="space-y-3.5">
              {[
                { title: "Campaign Meta Ads Diperbarui", time: "2 jam lalu", tag: "Ads" },
                { title: "5 Konten Instagram Disetujui Klien", time: "5 jam lalu", tag: "Content" },
                { title: "Laporan Performa Juli Diunggah", time: "Kemarin", tag: "Report" },
                { title: "Website Landing Page Live Deployment", time: "2 hari lalu", tag: "Website" },
              ].map((act, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#ECECEC]">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#1D4ED8]" />
                    <div>
                      <p className="text-xs font-bold text-[#18181B]">{act.title}</p>
                      <p className="font-data text-[10px] text-[#71717A]">{act.time}</p>
                    </div>
                  </div>
                  <span className="font-data text-[10px] font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#1D4ED8]/20">
                    {act.tag}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}