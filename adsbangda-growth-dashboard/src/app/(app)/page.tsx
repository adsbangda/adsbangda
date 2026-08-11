import { Topbar } from "@/components/dashboard/topbar";
import { Metric } from "@/components/dashboard/metric";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { TrendChart } from "@/components/dashboard/trend-chart";
import {
  getCurrentClient,
  getActiveProject,
  getAttentionItems,
  getPerformanceSummary,
} from "@/lib/data";
import { formatDateID, formatIDR, formatNumber } from "@/lib/utils";
import { Lightbulb, ArrowRight, AlertCircle } from "lucide-react";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

export default async function OverviewPage() {
  const client = await getCurrentClient();
  const [{ project, tasks }, attentionItems, performance] = await Promise.all([
    getActiveProject(client.id),
    getAttentionItems(),
    getPerformanceSummary(client.id),
  ]);

  const latestMeta = performance.metaAds.at(-1);
  const previousMeta = performance.metaAds.at(-2);
  const latestSocial = performance.social.at(-1);

  const pct = (curr?: number, prev?: number) =>
    curr !== undefined && prev ? Math.round(((curr - prev) / prev) * 100) : null;

  const leadDelta = pct(latestMeta?.leads, previousMeta?.leads);
  const cplDelta = pct(latestMeta?.costPerLead, previousMeta?.costPerLead);

  const leadsChartData = performance.metaAds.map((m) => ({ label: shortDate(m.date), value: m.leads ?? 0 }));
  const completedStages = tasks.filter((t) => t.status === "done").length;
  const nextStage = tasks.find((t) => t.status !== "done");

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Overview" />

      <div className="mx-auto max-w-6xl space-y-10 px-5 py-8 lg:px-8 lg:py-10">
        {/* Header — greeting + campaign context, no card wrapper */}
        <section className="animate-rise flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              Good morning, {client.name}
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Ini yang terjadi dengan marketing kamu minggu ini.
            </p>
          </div>
          {project && (
            <div className="flex items-center gap-4 text-sm">
              <div>
                <p className="text-xs text-muted">Campaign</p>
                <p className="font-medium text-ink">{project.name}</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="mb-1 text-xs text-muted">Status</p>
                <StatusBadge status={project.status} />
              </div>
            </div>
          )}
        </section>

        {/* Primary performance metrics — grouped, not individually carded */}
        <section
          className="animate-rise rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-xs)]"
          style={{ animationDelay: "60ms" }}
        >
          <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-muted">
            Primary Performance
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            <Metric
              label="Leads"
              value={formatNumber(latestMeta?.leads ?? 0)}
              delta={leadDelta !== null ? { value: `${Math.abs(leadDelta)}%`, direction: leadDelta >= 0 ? "up" : "down" } : undefined}
              context="vs minggu lalu"
              size="lg"
            />
            <Metric
              label="Cost per Lead"
              value={formatIDR(latestMeta?.costPerLead ?? 0)}
              delta={cplDelta !== null ? { value: `${Math.abs(cplDelta)}%`, direction: cplDelta <= 0 ? "up" : "down" } : undefined}
              context="vs minggu lalu"
            />
            <Metric label="Ad Spend" value={formatIDR(latestMeta?.spend ?? 0)} context="minggu ini" />
            <Metric
              label="Engagement Rate"
              value={`${latestSocial?.engagementRate?.toFixed(1) ?? "0"}%`}
              context="rata-rata"
            />
            <Metric label="Followers" value={formatNumber(latestSocial?.followers ?? 0)} context="total" />
          </div>
        </section>

        {/* Primary chart */}
        <section className="animate-rise" style={{ animationDelay: "120ms" }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink">Lead Performance</h3>
              <p className="text-sm text-muted">5 minggu terakhir · Meta Ads</p>
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-xs)]">
            <TrendChart data={leadsChartData} dataKey="value" format="number" />
          </div>
        </section>

        {/* Marketing insight — quiet, not a gimmick */}
        <section className="animate-rise" style={{ animationDelay: "160ms" }}>
          <div className="flex gap-3 rounded-[var(--radius-lg)] border border-accent-soft bg-accent-soft/60 p-5">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent">
                Marketing Insight
              </p>
              <p className="text-sm leading-relaxed text-ink">{performance.insight}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Campaign health */}
          <section className="animate-rise lg:col-span-3" style={{ animationDelay: "200ms" }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">{project?.name ?? "Campaign"}</h3>
              {project && <StatusBadge status={project.status} />}
            </div>
            <div className="space-y-5 rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-xs)]">
              {tasks.map((task) => (
                <div key={task.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">{task.name}</span>
                    <span className="font-data text-xs text-muted">{task.progressPct}%</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={task.progressPct} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs text-muted">
                    <span>{task.owner}</span>
                    <span>Due {formatDateID(task.dueDate)}</span>
                  </div>
                </div>
              ))}

              {nextStage && (
                <div className="flex items-start gap-2.5 rounded-md bg-warning-soft/60 p-3 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" strokeWidth={1.75} />
                  <div>
                    <p className="font-medium text-ink">
                      Next milestone: {nextStage.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {nextStage.blocker ?? `Due ${formatDateID(nextStage.dueDate)}`}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted">
                {completedStages} dari {tasks.length} tahap campaign selesai.
              </p>
            </div>
          </section>

          {/* Needs attention */}
          <section className="animate-rise lg:col-span-2" style={{ animationDelay: "240ms" }}>
            <h3 className="mb-4 text-base font-bold text-ink">Needs Your Attention</h3>
            <div className="divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-xs)]">
              {attentionItems.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    {item.urgent && (
                      <span className="shrink-0 rounded-md bg-danger-soft px-1.5 py-0.5 font-data text-[10px] font-semibold text-danger">
                        {item.dueLabel}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{item.description}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    {!item.urgent && <span className="text-xs text-muted">{item.dueLabel}</span>}
                    <a
                      href={item.actionHref}
                      className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-accent transition-colors hover:text-accent-2"
                    >
                      {item.actionLabel} <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
