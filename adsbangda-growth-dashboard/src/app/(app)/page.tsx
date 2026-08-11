import { Topbar } from "@/components/dashboard/topbar";
import { SectionLabel } from "@/components/dashboard/section-label";
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
import { ArrowRight, AlertCircle } from "lucide-react";

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
  const nextStage = tasks.find((t) => t.status !== "done");
  const improving = (leadDelta ?? 0) >= 0;

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Overview" />

      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
        {/* Editorial header — a statement, not a card */}
        <header className="animate-rise mb-16">
          <p className="font-data text-xs uppercase tracking-[0.14em] text-muted">
            {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date())}
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink lg:text-5xl">
            Good morning, {client.name}.
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted">
            Marketing kamu {improving ? "membaik" : "melambat"} dibanding minggu lalu.
          </p>
          {project && (
            <div className="mt-6 flex items-center gap-3">
              <StatusBadge status={project.status} />
              <span className="text-sm text-muted">{project.name}</span>
            </div>
          )}
        </header>

        {/* Performance — one hero metric, rest as quiet inline data */}
        <section className="animate-rise mb-16" style={{ animationDelay: "60ms" }}>
          <SectionLabel>Performance</SectionLabel>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:gap-16">
            <div>
              <p className="font-data text-6xl font-bold tracking-tight text-ink lg:text-7xl">
                {formatNumber(latestMeta?.leads ?? 0)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-sm text-muted">Leads minggu ini</p>
                {leadDelta !== null && (
                  <span
                    className={`inline-flex items-center gap-0.5 font-data text-xs font-semibold ${leadDelta >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {leadDelta >= 0 ? "↑" : "↓"} {Math.abs(leadDelta)}%
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
              <div>
                <p className="font-data text-xl font-semibold text-ink">
                  {formatIDR(latestMeta?.costPerLead ?? 0)}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                  Cost / Lead
                  {cplDelta !== null && (
                    <span className={cplDelta <= 0 ? "text-success" : "text-danger"}>
                      {cplDelta <= 0 ? "↓" : "↑"} {Math.abs(cplDelta)}%
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="font-data text-xl font-semibold text-ink">{formatIDR(latestMeta?.spend ?? 0)}</p>
                <p className="mt-0.5 text-xs text-muted">Ad Spend</p>
              </div>
              <div>
                <p className="font-data text-xl font-semibold text-ink">
                  {latestSocial?.engagementRate?.toFixed(1) ?? "0"}%
                </p>
                <p className="mt-0.5 text-xs text-muted">Engagement</p>
              </div>
            </div>
          </div>

          {/* Chart — open, no card wrapper */}
          <div className="mt-8">
            <TrendChart data={leadsChartData} dataKey="value" format="number" />
          </div>
        </section>

        {/* Marketing story — text-led insight, no colored box */}
        <section className="animate-rise mb-16 max-w-2xl" style={{ animationDelay: "100ms" }}>
          <SectionLabel>Marketing Story</SectionLabel>
          <p className="text-lg leading-relaxed text-ink">{performance.insight}</p>
        </section>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
          {/* Campaign — timeline, minimal container */}
          <section className="animate-rise lg:col-span-3" style={{ animationDelay: "140ms" }}>
            <SectionLabel>Campaign · {project?.name ?? "—"}</SectionLabel>
            <div className="divide-y divide-border">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 py-3.5 first:pt-0">
                  <span className="w-36 shrink-0 text-sm font-medium text-ink">{task.name}</span>
                  <div className="flex-1">
                    <ProgressBar value={task.progressPct} />
                  </div>
                  <span className="w-10 shrink-0 text-right font-data text-xs text-muted">
                    {task.progressPct}%
                  </span>
                  <span className="hidden w-40 shrink-0 text-right text-xs text-muted sm:block">
                    {task.owner}
                  </span>
                </div>
              ))}
            </div>
            {nextStage && (
              <div className="mt-4 flex items-start gap-2 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" strokeWidth={1.75} />
                <p className="text-ink">
                  <span className="font-semibold">Next milestone: {nextStage.name}</span>
                  <span className="text-muted"> — {nextStage.blocker ?? `due ${formatDateID(nextStage.dueDate)}`}</span>
                </p>
              </div>
            )}
          </section>

          {/* Needs attention — open list, dividers only */}
          <section className="animate-rise lg:col-span-2" style={{ animationDelay: "180ms" }}>
            <SectionLabel>Your Attention</SectionLabel>
            <div className="divide-y divide-border">
              {attentionItems.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <span
                      className={`shrink-0 font-data text-[11px] ${item.urgent ? "font-semibold text-danger" : "text-muted"}`}
                    >
                      {item.dueLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{item.description}</p>
                  <a
                    href={item.actionHref}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent transition-colors hover:text-accent-2"
                  >
                    {item.actionLabel} <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
