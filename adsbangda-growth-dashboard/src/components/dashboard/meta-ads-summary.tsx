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
 * Semua KPI singkat (Leads, Menjadi Client, Conversion Rate, CPL, ROAS)
 * satu mini-stat-grid — proporsional baik card sendirian (full width)
 * maupun berdampingan sama Website (setengah lebar). Di bawah breakpoint
 * `lg` grid-nya auto-fit (boleh wrap, wajar di layar sempit/mobile), tapi
 * dari `lg` ke atas dipaksa satu baris (grid-flow-col + auto-cols-fr) —
 * sebelumnya di lebar iPad landscape (viewport pas di titik sidebar+layout
 * 3-kolom mulai aktif tapi belum cukup lega) auto-fit sempat menjatuhkan
 * KPI ke baris kedua walau seharusnya masih cukup muat kalau kolomnya
 * dipersempit proporsional, bukan wrap.
 *
 * Budget Terpakai SENGAJA di luar grid itu (bukan ikut jadi salah satu
 * cell col-span-2) — dicoba dulu ikut grid tapi hasilnya kadang nyisain
 * gap kosong ganjil tergantung berapa banyak KPI lain yang tampil (grid
 * auto-fit tidak tahu ada 1 cell lebih lebar pas hitung wrap). Progress
 * bar butuh baris sendiri yang full-width supaya konsisten di semua lebar
 * layar, jadi taruh sebagai block terpisah di bawah grid — sama pola yang
 * dipakai "Goal Achievement" di Admin → Meta Ads.
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
    <div className="space-y-3">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] items-stretch gap-3 lg:grid-flow-col lg:grid-cols-none lg:auto-cols-fr">
        <MiniStat label="Lead Masuk" value={formatNumber(latest.leads ?? 0)} deltaPct={pctDelta(latest.leads, previous?.leads)} color="blue" />
        <MiniStat label="Menjadi Client" value={formatNumber(latest.closing ?? 0)} deltaPct={pctDelta(latest.closing, previous?.closing)} color="green" />
        {latest.conversionRate != null && (
          <MiniStat label="Conversion Rate" value={formatPercent(latest.conversionRate)} deltaPct={pctDelta(latest.conversionRate, previous?.conversionRate)} color="purple" />
        )}
        <MiniStat label="Cost per Lead" value={formatIDR(latest.costPerLead ?? 0)} deltaPct={pctDelta(latest.costPerLead, previous?.costPerLead)} deltaGoodDirection="down" color="orange" />
        {latest.roas != null && <MiniStat label="ROAS" value={formatMultiplier(latest.roas)} deltaPct={pctDelta(latest.roas, previous?.roas)} color="green" />}
      </div>

      {budgetPct != null && (
        <div className="rounded-[var(--radius-md)] border border-border bg-accent-soft p-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-data text-lg font-extrabold leading-none text-ink">{formatIDR(latest.spend ?? 0)}</p>
            <p className="shrink-0 font-data text-xs font-semibold text-muted">dari {formatIDR(budgetTarget!)}</p>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/70">
              <div className="h-full rounded-full bg-accent" style={{ width: `${budgetPct}%` }} />
            </div>
            <span className="shrink-0 font-data text-xs font-bold text-accent">{budgetPct}% Budget Terpakai</span>
          </div>
        </div>
      )}
    </div>
  );
}
