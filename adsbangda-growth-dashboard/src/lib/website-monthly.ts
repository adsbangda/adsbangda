import type { PerformanceMetric } from "./types";

// ============================================================================
// Agregasi performance_metrics (channel='website') dari granularitas apa pun
// (biasanya HARIAN — hasil GA4 auto-sync, satu baris per hari, lihat
// ga4-sync.ts) menjadi SATU BARIS PER BULAN. Dipakai khusus di halaman
// Website client (src/app/(app)/website/page.tsx) supaya KPI & chart yang
// client lihat adalah ringkasan bulanan, bukan naik-turun harian yang noisy
// dan sulit dibaca untuk laporan performa marketing.
//
// Kalau datanya kebetulan sudah berupa snapshot mingguan/bulanan (mis. input
// manual admin), fungsi ini tetap aman dipakai — baris-baris dalam bulan
// kalender yang sama otomatis digabung jadi satu.
// ============================================================================

/** "2m 5s" / "125s" / "125" → 125 (detik). null kalau tidak bisa di-parse. */
function parseDurationToSeconds(value?: string | null): number | null {
  if (!value) return null;
  const match = value.match(/(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?/i);
  const minutes = match?.[1] ? Number(match[1]) : 0;
  const seconds = match?.[2] ? Number(match[2]) : 0;
  if (minutes === 0 && seconds === 0) {
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : null;
  }
  return minutes * 60 + seconds;
}

/** 125 (detik) → "2m 5s" — format sama dengan yang dipakai ga4-sync.ts & input manual admin. */
function formatSecondsToDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}m ${s}s`;
}

/**
 * Gabungkan SATU KUMPULAN baris `channel='website'` (mis. hasil filter
 * rentang tanggal tertentu) jadi SATU ringkasan — dipakai baik oleh
 * `aggregateWebsiteMetricsByMonth` di bawah (per bulan) maupun langsung oleh
 * Admin Portal untuk meringkas rentang tanggal custom yang dipilih admin
 * (7 hari terakhir, bulan ini, custom from–to, dst). Sama aturan agregasinya:
 * jumlah/rata-rata dibobot sessions — lihat penjelasan di
 * `aggregateWebsiteMetricsByMonth`. `undefined` kalau `rows` kosong.
 */
export function aggregateWebsiteMetrics(rows: PerformanceMetric[]): PerformanceMetric | undefined {
  if (rows.length === 0) return undefined;

  const sum = (key: "visitors" | "sessions" | "pageViews" | "conversions") =>
    rows.reduce((total, r) => total + (r[key] ?? 0), 0);

  const totalSessions = sum("sessions");
  const weightOf = (r: PerformanceMetric) => (totalSessions > 0 ? (r.sessions ?? 0) / totalSessions : 1 / rows.length);

  const bounceRows = rows.filter((r) => r.bounceRate != null);
  const bounceWeightSum = bounceRows.reduce((total, r) => total + weightOf(r), 0);
  const bounceRate =
    bounceRows.length > 0 && bounceWeightSum > 0
      ? bounceRows.reduce((total, r) => total + (r.bounceRate as number) * weightOf(r), 0) / bounceWeightSum
      : undefined;

  const durationRows = rows
    .map((r) => ({ seconds: parseDurationToSeconds(r.avgSessionDuration), weight: weightOf(r) }))
    .filter((r): r is { seconds: number; weight: number } => r.seconds != null);
  const durationWeightSum = durationRows.reduce((total, r) => total + r.weight, 0);
  const avgSessionDuration =
    durationRows.length > 0 && durationWeightSum > 0
      ? formatSecondsToDuration(durationRows.reduce((total, r) => total + r.seconds * r.weight, 0) / durationWeightSum)
      : undefined;

  // Baris paling baru dalam kumpulan ini — sumber id/clientId/dst, dan
  // `date` fallback kalau pemanggil tidak override sendiri (lihat
  // `aggregateWebsiteMetricsByMonth`).
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1];

  return {
    ...last,
    visitors: sum("visitors"),
    sessions: totalSessions,
    pageViews: sum("pageViews"),
    conversions: sum("conversions"),
    bounceRate,
    avgSessionDuration,
  };
}

/**
 * Gabungkan baris `channel='website'` per bulan kalender (YYYY-MM):
 *   - visitors / sessions / pageViews / conversions → DIJUMLAH
 *   - bounceRate / avgSessionDuration → RATA-RATA DIBOBOT sessions hari itu
 *     (hari dengan traffic besar lebih berpengaruh ke rata-rata bulanan,
 *     sama prinsipnya dengan cara GA4 menghitung rata-rata suatu rentang
 *     tanggal), fallback ke rata-rata polos kalau tidak ada data sessions
 *   - `date` hasil = tanggal 1 bulan tsb (dipakai untuk urutan & label bulan)
 *
 * Hasil selalu terurut ascending by bulan, siap dipakai langsung untuk
 * `.at(-1)` (bulan terbaru) / `.at(-2)` (bulan sebelumnya) dan untuk chart.
 */
export function aggregateWebsiteMetricsByMonth(metrics: PerformanceMetric[]): PerformanceMetric[] {
  const buckets = new Map<string, PerformanceMetric[]>();

  for (const m of metrics) {
    if (!m.date) continue;
    const monthKey = m.date.slice(0, 7); // "YYYY-MM"
    const bucket = buckets.get(monthKey);
    if (bucket) bucket.push(m);
    else buckets.set(monthKey, [m]);
  }

  return Array.from(buckets.keys())
    .sort() // "YYYY-MM" string-sortable secara kronologis
    .map((monthKey) => {
      const rows = buckets.get(monthKey)!;
      const aggregated = aggregateWebsiteMetrics(rows)!; // rows tidak pernah kosong di sini (dari Map.set di atas)
      return {
        ...aggregated,
        id: `${aggregated.clientId}-website-${monthKey}`,
        date: `${monthKey}-01`,
      };
    });
}

/**
 * Filter baris berdasarkan rentang tanggal INKLUSIF `[from, to]` (format
 * "YYYY-MM-DD"). `from`/`to` boleh `undefined`/`null` masing-masing untuk
 * "tanpa batas bawah"/"tanpa batas atas" — dipakai Admin Portal untuk
 * preset "Semua Waktu" atau rentang custom yang cuma diisi salah satu sisi.
 * Perbandingan string ISO date aman secara leksikografis (tidak perlu parse
 * ke `Date`).
 */
export function filterWebsiteMetricsByDateRange(metrics: PerformanceMetric[], from?: string | null, to?: string | null): PerformanceMetric[] {
  return metrics.filter((m) => {
    if (from && m.date < from) return false;
    if (to && m.date > to) return false;
    return true;
  });
}

/**
 * Rentang tanggal SEBANDING (panjang hari sama) tepat sebelum `[from, to]`
 * — dipakai buat bandingkan periode terpilih (mis. dari date-range picker
 * di Overview) dengan periode sebelumnya, supaya growth indicator (naik/
 * turun %) tetap masuk akal walau `[from, to]` bukan satu bulan kalender
 * penuh (rentang custom dari kalender).
 */
export function previousPeriodOf(from: string, to: string): { from: string; to: string } {
  const lengthDays = Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000) + 1;
  const prevTo = new Date(`${from}T00:00:00Z`);
  prevTo.setUTCDate(prevTo.getUTCDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setUTCDate(prevFrom.getUTCDate() - (lengthDays - 1));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(prevFrom), to: iso(prevTo) };
}
