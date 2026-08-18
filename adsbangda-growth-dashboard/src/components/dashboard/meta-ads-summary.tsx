import { DualTrendChart } from "./dual-trend-chart";
import { EmptyState } from "./empty-state";
import { MiniStat, pctDelta } from "./mini-stat";
import { formatIDR, formatNumber } from "@/lib/utils";
import { Megaphone } from "lucide-react";
import type { PerformanceMetric } from "@/lib/types";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

/**
 * Ringkasan Meta Ads di Overview — subset dari data yang sama dipakai
 * halaman /meta-ads (getPerformanceSummary → performance_metrics channel
 * meta_ads). Dipanggil pemanggil HANYA kalau client.metaAdsActive true;
 * di dalam sini masih dibedakan "aktif tapi belum ada data" (tampilkan
 * empty state) vs section yang memang tidak pernah dirender sama sekali.
 */
export function MetaAdsSummary({ metrics }: { metrics: PerformanceMetric[] }) {
  const latest = metrics.at(-1);
  const previous = metrics.at(-2);

  if (!latest) {
    return <EmptyState icon={Megaphone} title="Belum ada data Meta Ads" description="Data akan muncul begitu tim Adsbangda mengisi performance mingguan." />;
  }

  const chart = metrics.slice(-6).map((m) => ({ label: shortDate(m.date), spend: m.spend ?? 0, leads: m.leads ?? 0 }));
  const budgetPct = latest.budgetTarget && latest.budgetTarget > 0 ? Math.min(100, Math.round(((latest.spend ?? 0) / latest.budgetTarget) * 100)) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Lead Masuk" value={formatNumber(latest.leads ?? 0)} deltaPct={pctDelta(latest.leads, previous?.leads)} color="blue" />
        <MiniStat label="Menjadi Client" value={formatNumber(latest.closing ?? 0)} deltaPct={pctDelta(latest.closing, previous?.closing)} color="purple" />
        {latest.conversionRate != null ? (
          <MiniStat label="Conversion Rate" value={`${latest.conversionRate}%`} deltaPct={pctDelta(latest.conversionRate, previous?.conversionRate)} color="purple" />
        ) : (
          <MiniStat label="ROAS" value={latest.roas != null ? `${latest.roas.toFixed(1)}x` : "—"} deltaPct={pctDelta(latest.roas, previous?.roas)} color="purple" />
        )}
        <MiniStat label="Cost per Lead" value={formatIDR(latest.costPerLead ?? 0)} deltaPct={pctDelta(latest.costPerLead, previous?.costPerLead)} deltaGoodDirection="down" color="orange" />
      </div>

      {budgetPct != null && (
        <div className="rounded-[var(--radius-md)] border border-border p-3">
          <p className="font-data text-lg font-bold text-ink">{formatIDR(latest.spend ?? 0)}</p>
          <p className="text-xs text-muted">Budget Terpakai</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            <div className="h-full rounded-full bg-accent" style={{ width: `${budgetPct}%` }} />
          </div>
          <p className="mt-1 font-data text-[11px] text-muted">dari {formatIDR(latest.budgetTarget!)}</p>
        </div>
      )}

      {chart.length > 1 && <DualTrendChart data={chart} />}
    </div>
  );
}
