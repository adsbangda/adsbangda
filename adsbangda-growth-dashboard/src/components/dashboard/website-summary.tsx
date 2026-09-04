import { EmptyState } from "./empty-state";
import { MiniStat, pctDelta } from "./mini-stat";
import { formatNumber, formatPercent } from "@/lib/utils";
import { Globe } from "lucide-react";
import type { PerformanceMetric } from "@/lib/types";

function monthLabel(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(iso));
}

/**
 * Ringkasan Website di Overview — subset dari performance_metrics channel
 * website. Dipanggil pemanggil hanya kalau client.websiteActive true. Sama
 * pola grid-nya dengan MetaAdsSummary — semua KPI satu mini-stat-grid
 * (auto-fit), tidak ada box terpisah lebar tetap.
 *
 * `metrics` HARUS SUDAH digabung per bulan (lihat `aggregateWebsiteMetricsByMonth`
 * di lib/website-monthly.ts) sebelum dioper ke sini — komponen ini cuma
 * ambil bulan terakhir & sebelumnya (`.at(-1)`/`.at(-2)`), dan menampilkan
 * label periodenya secara eksplisit supaya tidak ambigu "ini data tanggal
 * berapa" (sebelumnya field ini diam-diam cuma nampilin 1 hari terakhir).
 *
 * `periodLabel` opsional — kalau diisi (mis. dari Overview yang punya
 * date-range picker sendiri di header), dipakai apa adanya menggantikan
 * label bulan otomatis dari `latest.date` — perlu karena rentang yang
 * dipilih user belum tentu persis 1 bulan kalender penuh.
 */
export function WebsiteSummary({ metrics, periodLabel }: { metrics: PerformanceMetric[]; periodLabel?: string }) {
  const latest = metrics.at(-1);
  const previous = metrics.at(-2);

  if (!latest) {
    return <EmptyState icon={Globe} title="Belum ada data Website" description="Data akan muncul begitu tim Adsbangda mengisi/menyinkronkan performance website." />;
  }

  return (
    <div>
      <p className="mb-2 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">{periodLabel ?? monthLabel(latest.date)}</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] items-stretch gap-3 lg:grid-flow-col lg:grid-cols-none lg:auto-cols-fr">
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
    </div>
  );
}
