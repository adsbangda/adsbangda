import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { WebsiteTrendChart } from "@/components/dashboard/website-trend-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MiniStat, pctDelta } from "@/components/dashboard/mini-stat";
import { getCurrentClient, getPerformanceSummary } from "@/lib/data";
import { aggregateWebsiteMetricsByMonth } from "@/lib/website-monthly";
import { formatNumber, formatPercent } from "@/lib/utils";
import { Users, Activity, Eye, MousePointerClick, Globe } from "lucide-react";

/** "2026-08-01" → "Agu 2026" — label per bulan untuk KPI/chart, bukan lagi per hari. */
function monthLabel(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric" }).format(new Date(iso));
}

/**
 * Conversion Rate SELALU dihitung ulang dari raw data (Leads ÷ Visitors),
 * tidak pernah disimpan/dibaca sebagai field tersendiri — satu-satunya
 * tempat rumusnya ditulis untuk halaman ini, dipakai baik untuk snapshot
 * terbaru maupun snapshot sebelumnya (buat growth indicator).
 */
function conversionRateOf(m?: { visitors?: number; conversions?: number }): number | null {
  if (!m?.visitors) return null;
  return ((m.conversions ?? 0) / m.visitors) * 100;
}

export default async function WebsitePage() {
  const client = await getCurrentClient();
  const { website } = await getPerformanceSummary(client.id);

  // website = baris mentah per HARI (hasil GA4 auto-sync) atau per snapshot
  // manual admin. Digabung dulu jadi per BULAN sebelum dipakai di mana pun
  // di halaman ini — client mau lihat ringkasan bulanan, bukan grafik
  // naik-turun harian.
  const monthly = aggregateWebsiteMetricsByMonth(website);

  const latest = monthly.at(-1);
  const previous = monthly.at(-2);

  const visitorsDelta = pctDelta(latest?.visitors, previous?.visitors);
  const sessionsDelta = pctDelta(latest?.sessions, previous?.sessions);
  const pageViewsDelta = pctDelta(latest?.pageViews, previous?.pageViews);
  const leadsDelta = pctDelta(latest?.conversions, previous?.conversions);
  const bounceDelta = pctDelta(latest?.bounceRate, previous?.bounceRate);

  const conversionRate = conversionRateOf(latest);
  const conversionRateDelta = pctDelta(conversionRate, conversionRateOf(previous));

  const trafficChart = monthly.map((w) => ({
    label: monthLabel(w.date),
    visitors: w.visitors ?? null,
    sessions: w.sessions ?? null,
    pageViews: w.pageViews ?? null,
  }));

  if (!latest) {
    return (
      <div className="page-backdrop min-h-screen">
        <Topbar title="Website" subtitle="Traffic & konversi website — data bulanan." />
        <div className="p-5 lg:p-8">
          <Card>
            <EmptyState icon={Globe} title="Belum ada data Website" description="Data akan muncul begitu tim Adsbangda mengisi/menyinkronkan performance website." />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Website" subtitle="Traffic & konversi website — data bulanan." />

      <div className="space-y-6 p-5 lg:p-8">
        {/* KPI utama — Visitors, Sessions, Page Views, Leads. Avg Session
            Duration & Bounce Rate SENGAJA tidak di sini (lihat Website
            Engagement di bawah) — 4 metrik ini yang paling mudah dipahami
            client sekilas pandang. */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Visitors"
            value={formatNumber(latest.visitors ?? 0)}
            icon={Users}
            iconColor="text-accent"
            iconBg="bg-accent-soft"
            delta={visitorsDelta !== null ? { value: `${Math.abs(visitorsDelta)}%`, direction: visitorsDelta >= 0 ? "up" : "down" } : undefined}
          />
          <KpiCard
            label="Sessions"
            value={formatNumber(latest.sessions ?? 0)}
            icon={Activity}
            iconColor="text-accent"
            iconBg="bg-accent-soft"
            delta={sessionsDelta !== null ? { value: `${Math.abs(sessionsDelta)}%`, direction: sessionsDelta >= 0 ? "up" : "down" } : undefined}
          />
          <KpiCard
            label="Page Views"
            value={formatNumber(latest.pageViews ?? 0)}
            icon={Eye}
            iconColor="text-accent"
            iconBg="bg-accent-soft"
            delta={pageViewsDelta !== null ? { value: `${Math.abs(pageViewsDelta)}%`, direction: pageViewsDelta >= 0 ? "up" : "down" } : undefined}
          />
          <KpiCard
            label="Leads / Form Submissions"
            value={formatNumber(latest.conversions ?? 0)}
            icon={MousePointerClick}
            iconColor="text-accent"
            iconBg="bg-accent-soft"
            delta={leadsDelta !== null ? { value: `${Math.abs(leadsDelta)}%`, direction: leadsDelta >= 0 ? "up" : "down" } : undefined}
          />
        </section>

        {/* Website Traffic — satu chart gabungan Visitors/Sessions/Page Views, data langsung dari raw performance data. */}
        <Card>
          <SectionHeading title="Website Traffic" description="Data bulanan" />
          <WebsiteTrendChart data={trafficChart} />
        </Card>

        {/* Website Engagement — Bounce Rate & Avg Session Duration, bukan KPI utama tapi tetap penting dilihat. */}
        <Card>
          <SectionHeading title="Website Engagement" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MiniStat
              label="Bounce Rate"
              value={latest.bounceRate != null ? formatPercent(latest.bounceRate) : "—"}
              deltaPct={bounceDelta}
              deltaGoodDirection="down"
              color="orange"
            />
            <MiniStat label="Avg Session Duration" value={latest.avgSessionDuration ?? "—"} color="blue" />
          </div>
        </Card>

        {/* Website Conversion — Leads & Conversion Rate. Conversion Rate SELALU dihitung otomatis (Leads ÷ Visitors × 100), tidak pernah input manual. */}
        <Card>
          <SectionHeading title="Website Conversion" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MiniStat label="Leads / Form Submissions" value={formatNumber(latest.conversions ?? 0)} deltaPct={leadsDelta} color="purple" />
            <MiniStat
              label="Conversion Rate"
              value={conversionRate != null ? formatPercent(conversionRate, 2) : "—"}
              deltaPct={conversionRateDelta}
              color="green"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
