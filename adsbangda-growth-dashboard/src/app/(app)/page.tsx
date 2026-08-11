import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { MonthlyDelivery } from "@/components/dashboard/monthly-delivery";
import { ActivityList } from "@/components/dashboard/activity-item";
import { ActionItem } from "@/components/dashboard/action-item";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  getCurrentClient,
  getMonthlyDelivery,
  getCurrentWork,
  getAttentionItems,
  getPerformanceSummary,
  getRecentActivity,
} from "@/lib/data";
import { formatIDR, formatCompactNumber } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default async function OverviewPage() {
  const client = await getCurrentClient();
  const [delivery, currentWork, attentionItems, performance, activity] = await Promise.all([
    getMonthlyDelivery(client.id),
    getCurrentWork(client.id),
    getAttentionItems(),
    getPerformanceSummary(client.id),
    getRecentActivity(),
  ]);

  const latestMeta = performance.metaAds.at(-1);
  const previousMeta = performance.metaAds.at(-2);
  const latestSocial = performance.social.at(-1);
  const previousSocial = performance.social.at(-2);

  const pctChange = (curr?: number, prev?: number) =>
    curr !== undefined && prev ? Math.round(((curr - prev) / prev) * 100) : null;

  const leadDelta = pctChange(latestMeta?.leads, previousMeta?.leads);
  const reachDelta = pctChange(latestSocial?.reach, previousSocial?.reach);

  // Engagement volume isn't tracked as a raw count in the metric snapshot —
  // derived here from reach × engagement rate purely for a compact display.
  const engagementCount = latestSocial?.reach && latestSocial.engagementRate
    ? Math.round((latestSocial.reach * latestSocial.engagementRate) / 100)
    : 0;
  const prevEngagementCount = previousSocial?.reach && previousSocial.engagementRate
    ? Math.round((previousSocial.reach * previousSocial.engagementRate) / 100)
    : undefined;
  const engagementDelta = pctChange(engagementCount, prevEngagementCount);

  const snapshot = [
    { label: "Reach", value: formatCompactNumber(latestSocial?.reach ?? 0), delta: reachDelta },
    { label: "Engagement", value: formatCompactNumber(engagementCount), delta: engagementDelta },
    { label: "Leads", value: formatCompactNumber(latestMeta?.leads ?? 0), delta: leadDelta },
    { label: "Ad Spend", value: formatIDR(latestMeta?.spend ?? 0), delta: null },
  ];

  const periodLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date());

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Overview" />

      <div className="space-y-10 p-5 lg:p-8">
        {/* 01 — Client context: subtle, no oversized "welcome back" hero */}
        <section>
          <p className="font-data text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{client.name}</p>
          <h1 className="mt-1 font-display text-xl font-bold tracking-tight text-ink lg:text-2xl">Private Workspace</h1>
          <p className="mt-1 text-sm text-muted">{periodLabel}</p>
        </section>

        {/* 02 — Monthly Delivery: the hero of the page */}
        <MonthlyDelivery {...delivery} />

        {/* 03 & 04 — What AdsBangda Did / Needs Your Attention */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section>
            <SectionHeading title="What AdsBangda Did" />
            {activity.length === 0 ? (
              <EmptyState title="Belum ada aktivitas" description="Aktivitas tim Adsbangda akan muncul di sini." />
            ) : (
              <ActivityList items={activity} />
            )}
          </section>

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
              <div className="divide-y divide-border">
                {attentionItems.map((item) => (
                  <ActionItem key={item.id} {...item} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 05 — Performance Snapshot: compact, secondary to delivery/work */}
        <section>
          <SectionHeading
            title="Performance Snapshot"
            description="Ringkasan performa minggu ini — detail lengkap ada di Performance."
            action={
              <a href="/performance" className="inline-flex items-center gap-1 font-data text-xs font-semibold text-accent hover:underline">
                Lihat Detail <ArrowRight className="h-3.5 w-3.5" />
              </a>
            }
          />
          <Card>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {snapshot.map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="mt-1.5 font-data text-2xl font-bold text-ink">{item.value}</p>
                  {item.delta !== null && (
                    <p className={item.delta >= 0 ? "mt-1 font-data text-xs font-semibold text-success" : "mt-1 font-data text-xs font-semibold text-danger"}>
                      {item.delta >= 0 ? "+" : ""}
                      {item.delta}% vs minggu lalu
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 06 — Current Work: compact per-service status, service-agnostic */}
        <section>
          <SectionHeading title="Current Work" />
          {currentWork.length === 0 ? (
            <EmptyState title="Belum ada pekerjaan aktif" />
          ) : (
            <Card padding="sm">
              <div className="divide-y divide-border">
                {currentWork.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.serviceGroup}</p>
                      <p className="text-xs text-muted">{item.detail}</p>
                    </div>
                    <span className="shrink-0 font-data text-xs font-semibold text-accent">{item.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
