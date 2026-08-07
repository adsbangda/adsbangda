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
  TrendingUp,
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
      <Topbar title="Overview" />

      <div className="space-y-6 p-6 sm:p-8 pt-2">
        {/* TOP ROW: Card Balance / Actions + Profit Chart */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Credit Card / Balance & Action Blocks (Span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-ink tracking-tight flex items-center gap-2">
              <span>My cards</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white transition-transform hover:scale-105"
              >
                <span>Add new</span>
                <span className="font-bold">+</span>
              </button>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Virtual Credit Card */}
              <div className="sm:col-span-6 relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] p-5 text-white shadow-md">
                <div className="flex items-center justify-between text-xs opacity-90 font-medium">
                  <span>Credit Card</span>
                  <span className="font-bold tracking-wider text-sm italic">VISA</span>
                </div>
                <div className="mt-8 font-data text-lg font-bold tracking-widest text-white/90">
                  1234 5678 9101 1121
                </div>
                <div className="mt-6 flex items-end justify-between text-xs opacity-80">
                  <div>
                    <div className="text-[10px] uppercase text-emerald-100">Holder</div>
                    <div className="font-semibold text-white">{client.name}</div>
                  </div>
                  <div className="font-data">06/28</div>
                </div>
              </div>

              {/* Card Balance & Quick Actions */}
              <div className="sm:col-span-6 flex flex-col justify-between rounded-[24px] bg-paper-deep p-5 border border-border shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <div>
                  <span className="text-xs font-medium text-muted">Card balance</span>
                  <div className="font-data text-2xl font-bold text-ink mt-1">
                    {latestMeta ? formatIDR(latestMeta.spend ?? 0) : "Rp 3.750.000"}
                  </div>
                  <Link
                    href="/performance"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    <span>View details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* 3 Quick Action Blocks */}
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-paper p-3 text-center transition-colors hover:bg-emerald-50/60 cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <Send className="h-4 w-4" />
                    </div>
                    <span className="mt-2 text-[11px] font-semibold text-ink">Send</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-paper p-3 text-center transition-colors hover:bg-emerald-50/60 cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <Download className="h-4 w-4" />
                    </div>
                    <span className="mt-2 text-[11px] font-semibold text-ink">Receive</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-paper p-3 text-center transition-colors hover:bg-emerald-50/60 cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <span className="mt-2 text-[11px] font-semibold text-ink">Withdraw</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profit Trend Chart Card (Span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-[28px] border border-border bg-paper-deep p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Profit</h2>
              <Link
                href="/performance"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
              >
                <span>Show all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Timeframe Toggle Pills */}
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

            {/* Main Smooth Wave Chart */}
            <div className="relative my-4 h-28 w-full">
              <svg viewBox="0 0 300 80" className="h-full w-full preserve-3d">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,50 Q40,65 80,40 T160,50 T240,20 T300,10 L300,80 L0,80 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M0,50 Q40,65 80,40 T160,50 T240,20 T300,10"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="flex justify-between font-data text-xs text-muted">
              <span>16</span>
              <span>17</span>
              <span>18</span>
              <span>19</span>
              <span>20</span>
              <span>21</span>
              <span>22</span>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Income + Expenses + Spendings Statistic */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Card 1: Income */}
          <div className="lg:col-span-3">
            <StatCard
              label="Income"
              value="+Rp 4.465.000"
              delta={{ value: "+12%", direction: "up" }}
              icon={Wallet}
            />
          </div>

          {/* Card 2: Expenses */}
          <div className="lg:col-span-3">
            <StatCard
              label="Expenses"
              value="-Rp 2.465.000"
              delta={{ value: "-23%", direction: "down" }}
              icon={MousePointerClick}
              isNegativeWave
            />
          </div>

          {/* Card 3: Spendings Statistic Bar Chart */}
          <div className="lg:col-span-6 rounded-[28px] border border-border bg-paper-deep p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-ink">Spendings statistic</h3>
              </div>
              <span className="rounded-full bg-paper px-3 py-1 font-data text-xs font-semibold text-muted">
                Year
              </span>
            </div>

            {/* Rounded Bars matching screenshot */}
            <div className="flex h-32 items-end justify-between gap-2 pt-2 px-2">
              {[
                { m: "Jan", h: "40%" },
                { m: "Feb", h: "30%" },
                { m: "Mar", h: "60%" },
                { m: "Apr", h: "85%" },
                { m: "May", h: "45%" },
                { m: "June", h: "20%" },
                { m: "July", h: "50%" },
                { m: "Aug", h: "35%" },
                { m: "Sep", h: "55%" },
                { m: "Oct", h: "30%" },
                { m: "Nov", h: "75%" },
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full rounded-full bg-paper h-24 overflow-hidden flex items-end">
                    <div
                      className="w-full rounded-full bg-amber-400 transition-all"
                      style={{ height: bar.h }}
                    />
                  </div>
                  <span className="font-data text-[10px] text-muted">{bar.m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Planning + Latest Transactions + Go Premium Banner */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Planning Section (Progress Bars) */}
          <div className="lg:col-span-4 rounded-[28px] border border-border bg-paper-deep p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-ink">Planning</h3>
              <button type="button" className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                Add new +
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-paper p-4">
                <div className="flex items-center justify-between text-xs font-bold text-ink mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-700" />
                    <span>House in Paris</span>
                  </div>
                  <span className="font-data text-muted">$265 / $10,000</span>
                </div>
                <ProgressBar value={26} />
              </div>

              <div className="rounded-2xl bg-paper p-4">
                <div className="flex items-center justify-between text-xs font-bold text-ink mb-2">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-emerald-700" />
                    <span>Trip to Brazil</span>
                  </div>
                  <span className="font-data text-muted">$10,456 / $14,000</span>
                </div>
                <ProgressBar value={74} />
              </div>
            </div>
          </div>

          {/* Latest Transactions */}
          <div className="lg:col-span-5 rounded-[28px] border border-border bg-paper-deep p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-ink">Latest transactions</h3>
              <span className="text-xs text-muted">Sort ⇅</span>
            </div>

            <div className="space-y-3">
              {[
                { title: "Dribbble", date: "Sep 30, 2026 • 4:38 PM", sub: "Pro upgrade", price: "-$5.78", status: "Pending", icon: "🏀" },
                { title: "Youtube", date: "Oct 2, 2026 • 03:34 AM", sub: "Subscription", price: "-$1055.78", status: "Completed", icon: "▶️" },
                { title: "Apple", date: "Oct 13, 2026 • 02:04 PM", sub: "Games", price: "-$345.78", status: "Completed", icon: "🍎" },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-2xl hover:bg-paper transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-paper text-lg">
                      {tx.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink">{tx.title}</h4>
                      <p className="text-[11px] text-muted">{tx.sub}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-data text-xs font-bold text-ink">{tx.price}</div>
                    <div className="text-[10px] text-muted">{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Go Premium / AdsBangda Support Banner */}
          <div className="lg:col-span-3 rounded-[28px] border border-border bg-paper-deep p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-ink">Go premium</h3>
                <Link href="/reports" className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Explore all marketing functions with lifetime AdsBangda membership.
              </p>
            </div>

            {/* Illustration Graphic Placeholder */}
            <div className="my-4 flex items-center justify-center rounded-2xl bg-emerald-50/80 p-4 border border-emerald-100">
              <div className="text-center space-y-1">
                <Sparkles className="mx-auto h-8 w-8 text-emerald-600 animate-bounce" />
                <span className="font-data text-[11px] font-bold text-emerald-900 block">AdsBangda Pro</span>
              </div>
            </div>

            <button type="button" className="w-full rounded-full bg-emerald-700 py-2.5 font-data text-xs font-bold text-white transition-transform hover:scale-[1.02]">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}