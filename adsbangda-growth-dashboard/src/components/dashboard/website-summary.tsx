import { TrendChart } from "./trend-chart";
import { EmptyState } from "./empty-state";
import { MiniStat, pctDelta } from "./mini-stat";
import { formatNumber } from "@/lib/utils";
import { Globe } from "lucide-react";
import type { PerformanceMetric } from "@/lib/types";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

/**
 * Ringkasan Website di Overview — subset dari performance_metrics channel
 * website (input manual admin lewat Website → Performance). Dipanggil
 * pemanggil hanya kalau client.websiteActive true.
 */
export function WebsiteSummary({ metrics }: { metrics: PerformanceMetric[] }) {
  const latest = metrics.at(-1);
  const previous = metrics.at(-2);

  if (!latest) {
    return <EmptyState icon={Globe} title="Belum ada data Website" description="Data akan muncul begitu tim Adsbangda mengisi performance mingguan." />;
  }

  const chart = metrics.slice(-6).map((m) => ({ label: shortDate(m.date), value: m.visitors ?? 0 }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Pengunjung" value={formatNumber(latest.visitors ?? 0)} deltaPct={pctDelta(latest.visitors, previous?.visitors)} color="blue" />
        <MiniStat label="Leads (Form)" value={formatNumber(latest.conversions ?? 0)} deltaPct={pctDelta(latest.conversions, previous?.conversions)} color="purple" />
        <MiniStat
          label="Conversion Rate"
          value={latest.visitors ? `${((latest.conversions ?? 0) / latest.visitors * 100).toFixed(2)}%` : "—"}
          deltaPct={null}
          color="purple"
        />
        <MiniStat label="Bounce Rate" value={latest.bounceRate != null ? `${latest.bounceRate}%` : "—"} deltaPct={pctDelta(latest.bounceRate, previous?.bounceRate)} deltaGoodDirection="down" color="orange" />
      </div>
      {chart.length > 1 && <TrendChart data={chart} dataKey="value" format="number" variant="area" />}
    </div>
  );
}
