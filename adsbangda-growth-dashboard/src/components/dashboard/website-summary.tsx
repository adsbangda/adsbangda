import { EmptyState } from "./empty-state";
import { MiniStat, pctDelta } from "./mini-stat";
import { formatNumber, formatPercent } from "@/lib/utils";
import { Globe } from "lucide-react";
import type { PerformanceMetric } from "@/lib/types";

/**
 * Ringkasan Website di Overview — subset dari performance_metrics channel
 * website (input manual admin lewat Website → Performance). Dipanggil
 * pemanggil hanya kalau client.websiteActive true. Sama pola grid-nya
 * dengan MetaAdsSummary — semua KPI satu mini-stat-grid (auto-fit), tidak
 * ada box terpisah lebar tetap.
 */
export function WebsiteSummary({ metrics }: { metrics: PerformanceMetric[] }) {
  const latest = metrics.at(-1);
  const previous = metrics.at(-2);

  if (!latest) {
    return <EmptyState icon={Globe} title="Belum ada data Website" description="Data akan muncul begitu tim Adsbangda mengisi performance mingguan." />;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] items-stretch gap-2.5">
      <MiniStat label="Pengunjung" value={formatNumber(latest.visitors ?? 0)} deltaPct={pctDelta(latest.visitors, previous?.visitors)} color="blue" />
      <MiniStat label="Leads (Form)" value={formatNumber(latest.conversions ?? 0)} deltaPct={pctDelta(latest.conversions, previous?.conversions)} color="purple" />
      <MiniStat
        label="Conversion Rate"
        value={latest.visitors ? formatPercent((((latest.conversions ?? 0) / latest.visitors) * 100), 2) : "—"}
        color="purple"
      />
      <MiniStat label="Bounce Rate" value={latest.bounceRate != null ? formatPercent(latest.bounceRate) : "—"} deltaPct={pctDelta(latest.bounceRate, previous?.bounceRate)} deltaGoodDirection="down" color="orange" />
      {latest.avgSessionDuration && <MiniStat label="Durasi Sesi" value={latest.avgSessionDuration} color="blue" />}
    </div>
  );
}
