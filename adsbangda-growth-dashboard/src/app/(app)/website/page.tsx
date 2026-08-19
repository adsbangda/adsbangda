import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { DateRangeTabs } from "@/components/dashboard/date-range-tabs";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getCurrentClient, getPerformanceSummary } from "@/lib/data";
import { formatNumber, formatPercent } from "@/lib/utils";
import { Users, MousePointerClick, TrendingDown, Clock, Globe } from "lucide-react";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

export default async function WebsitePage() {
  const client = await getCurrentClient();
  const { website } = await getPerformanceSummary(client.id);

  const latest = website.at(-1);
  const previous = website.at(-2);
  const pct = (curr?: number, prev?: number) => (curr !== undefined && prev ? Math.round(((curr - prev) / prev) * 100) : null);
  const visitorDelta = pct(latest?.visitors, previous?.visitors);
  const conversionDelta = pct(latest?.conversions, previous?.conversions);
  const bounceDelta = pct(latest?.bounceRate, previous?.bounceRate);

  const visitorsChart = website.map((w) => ({ label: shortDate(w.date), value: w.visitors ?? 0 }));

  if (!latest) {
    return (
      <div className="page-backdrop min-h-screen">
        <Topbar title="Website" subtitle="Traffic & konversi website — data mingguan." />
        <div className="p-5 lg:p-8">
          <Card>
            <EmptyState icon={Globe} title="Belum ada data Website" description="Data akan muncul begitu tim Adsbangda mengisi performance mingguan." />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Website" subtitle="Traffic & konversi website — data mingguan." />

      <div className="space-y-6 p-5 lg:p-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Pengunjung"
            value={formatNumber(latest.visitors ?? 0)}
            icon={Users}
            iconColor="text-accent"
            iconBg="bg-accent-soft"
            delta={visitorDelta !== null ? { value: `${Math.abs(visitorDelta)}%`, direction: visitorDelta >= 0 ? "up" : "down" } : undefined}
          />
          <KpiCard
            label="Leads (Form)"
            value={formatNumber(latest.conversions ?? 0)}
            icon={MousePointerClick}
            iconColor="text-accent"
            iconBg="bg-accent-soft"
            delta={conversionDelta !== null ? { value: `${Math.abs(conversionDelta)}%`, direction: conversionDelta >= 0 ? "up" : "down" } : undefined}
          />
          <KpiCard
            label="Bounce Rate"
            value={latest.bounceRate != null ? formatPercent(latest.bounceRate) : "—"}
            icon={TrendingDown}
            iconColor="text-accent"
            iconBg="bg-accent-soft"
            delta={bounceDelta !== null ? { value: `${Math.abs(bounceDelta)}%`, direction: bounceDelta <= 0 ? "up" : "down" } : undefined}
          />
          <KpiCard label="Durasi Sesi Rata-rata" value={latest.avgSessionDuration ?? "—"} icon={Clock} iconColor="text-accent" iconBg="bg-accent-soft" />
        </section>

        <Card>
          <SectionHeading title="Pengunjung Over Time" description="Data mingguan" action={<DateRangeTabs />} />
          <TrendChart data={visitorsChart} dataKey="value" format="number" variant="area" />
        </Card>
      </div>
    </div>
  );
}
