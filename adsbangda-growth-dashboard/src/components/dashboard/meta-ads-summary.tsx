import { TrendChart } from "./trend-chart";
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

  const chart = metrics.slice(-6).map((m) => ({ label: shortDate(m.date), value: m.leads ?? 0 }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Lead Masuk" value={formatNumber(latest.leads ?? 0)} deltaPct={pctDelta(latest.leads, previous?.leads)} />
        <MiniStat label="Menjadi Client" value={formatNumber(latest.closing ?? 0)} deltaPct={pctDelta(latest.closing, previous?.closing)} />
        {latest.conversionRate != null ? (
          <MiniStat label="Conversion Rate" value={`${latest.conversionRate}%`} deltaPct={pctDelta(latest.conversionRate, previous?.conversionRate)} />
        ) : (
          <MiniStat label="ROAS" value={latest.roas != null ? `${latest.roas.toFixed(1)}x` : "—"} deltaPct={pctDelta(latest.roas, previous?.roas)} />
        )}
        <MiniStat label="Cost per Lead" value={formatIDR(latest.costPerLead ?? 0)} deltaPct={pctDelta(latest.costPerLead, previous?.costPerLead)} deltaGoodDirection="down" />
      </div>
      {chart.length > 1 && <TrendChart data={chart} dataKey="value" format="number" />}
    </div>
  );
}
