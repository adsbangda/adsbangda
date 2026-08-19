import { EmptyState } from "./empty-state";
import { MiniStat, pctDelta } from "./mini-stat";
import { formatIDR, formatNumber, formatPercent, formatMultiplier } from "@/lib/utils";
import { Megaphone } from "lucide-react";
import type { PerformanceMetric } from "@/lib/types";

/**
 * Ringkasan Meta Ads di Overview — subset dari data yang sama dipakai
 * halaman /meta-ads (getPerformanceSummary → performance_metrics channel
 * meta_ads). Dipanggil pemanggil HANYA kalau client.metaAdsActive true;
 * di dalam sini masih dibedakan "aktif tapi belum ada data" (tampilkan
 * empty state) vs section yang memang tidak pernah dirender sama sekali.
 *
 * Semua KPI (termasuk Budget Terpakai) satu mini-stat-grid yang sama —
 * BUKAN box terpisah lebar tetap. auto-fit + minmax bikin kolomnya
 * otomatis proporsional baik card sendirian (full width, service lain
 * nonaktif) maupun berdampingan sama Website (setengah lebar) — tidak ada
 * lagi ruang kosong atau kotak yang "ketinggalan" ukurannya.
 *
 * `budgetTarget` datang dari `Client.metaAdsBudgetTarget` (persisten, diisi
 * admin sekali di Admin → Meta Ads) — BUKAN dari snapshot performance_metrics,
 * jadi tidak perlu diisi ulang tiap kali admin input Leads/Spend mingguan.
 */
export function MetaAdsSummary({ metrics, budgetTarget }: { metrics: PerformanceMetric[]; budgetTarget?: number }) {
  const latest = metrics.at(-1);
  const previous = metrics.at(-2);

  if (!latest) {
    return <EmptyState icon={Megaphone} title="Belum ada data Meta Ads" description="Data akan muncul begitu tim Adsbangda mengisi performance mingguan." />;
  }

  const budgetPct = budgetTarget && budgetTarget > 0 ? Math.min(100, Math.round(((latest.spend ?? 0) / budgetTarget) * 100)) : null;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] items-stretch gap-2.5">
      <MiniStat label="Lead Masuk" value={formatNumber(latest.leads ?? 0)} deltaPct={pctDelta(latest.leads, previous?.leads)} color="blue" />
      <MiniStat label="Menjadi Client" value={formatNumber(latest.closing ?? 0)} deltaPct={pctDelta(latest.closing, previous?.closing)} color="green" />
      {latest.conversionRate != null && (
        <MiniStat label="Conversion Rate" value={formatPercent(latest.conversionRate)} deltaPct={pctDelta(latest.conversionRate, previous?.conversionRate)} color="purple" />
      )}
      <MiniStat label="Cost per Lead" value={formatIDR(latest.costPerLead ?? 0)} deltaPct={pctDelta(latest.costPerLead, previous?.costPerLead)} deltaGoodDirection="down" color="orange" />
      {latest.roas != null && <MiniStat label="ROAS" value={formatMultiplier(latest.roas)} deltaPct={pctDelta(latest.roas, previous?.roas)} color="green" />}

      {budgetPct != null && (
        <div className="col-span-2 min-w-0 rounded-[var(--radius-md)] border border-border p-2.5">
          <p className="font-data text-[10px] font-semibold text-muted">Budget Terpakai</p>
          <p className="mt-1 font-data text-[15px] font-extrabold leading-none text-ink">{formatIDR(latest.spend ?? 0)}</p>
          <p className="mt-1.5 text-[11px] text-muted">dari {formatIDR(budgetTarget!)}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
              <div className="h-full rounded-full bg-accent" style={{ width: `${budgetPct}%` }} />
            </div>
            <span className="font-data text-[11px] font-bold text-ink">{budgetPct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
