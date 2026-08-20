import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { MiniStat } from "@/components/dashboard/mini-stat";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { ChannelOverview } from "@/components/dashboard/channel-overview";
import { PlatformPerformanceTable } from "@/components/dashboard/platform-performance-table";
import { PLATFORM_META } from "@/components/dashboard/platform-meta";
import { getCurrentClient, getPerformanceSummary, getChannelOverview, getPlatformPerformanceTable } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(new Date(iso));
}

export default async function SocialMediaPage() {
  const client = await getCurrentClient();
  const [{ social }, channelRows, platformPerformance] = await Promise.all([
    getPerformanceSummary(client.id),
    getChannelOverview(client),
    getPlatformPerformanceTable(client.id),
  ]);

  // KPI ringkas = TOTAL gabungan (jumlah snapshot terbaru tiap platform) —
  // SEBELUMNYA cuma ambil `social.at(-1)` yang ambigu kalau client punya
  // >1 platform aktif (bisa jadi snapshot Instagram, bisa jadi TikTok,
  // tergantung urutan baris yang kebetulan terakhir — bukan representasi
  // yang benar). Impressions & Profile Visit juga SEBELUMNYA tidak ikut
  // ditampilkan sama sekali di sini walau datanya sudah ada.
  const totalFollowers = platformPerformance.reduce((sum, r) => sum + (r.followers ?? 0), 0);
  const totalReach = platformPerformance.reduce((sum, r) => sum + (r.reach ?? 0), 0);
  const totalImpressions = platformPerformance.reduce((sum, r) => sum + (r.impressions ?? 0), 0);
  const totalProfileVisit = platformPerformance.reduce((sum, r) => sum + (r.profileVisit ?? 0), 0);

  // Chart pertumbuhan followers — SATU platform saja (yang pertama ada
  // datanya), bukan campur beberapa platform dalam satu garis (angkanya
  // jadi tidak bermakna kalau dicampur — followers Instagram + TikTok
  // dijumlah per titik waktu tidak merepresentasikan pertumbuhan apa pun).
  const primaryPlatform = platformPerformance[0]?.platform;
  const primaryPlatformLabel = primaryPlatform ? (PLATFORM_META[primaryPlatform]?.label ?? primaryPlatform) : null;
  const followersChart = social.filter((s) => s.platform === primaryPlatform).map((s) => ({ label: shortDate(s.date), value: s.followers ?? 0 }));

  // Halaman ini KHUSUS Social Media — getChannelOverview() balikin baris gabungan
  // (Meta Ads/Website juga bisa ikut kalau service itu aktif), jadi difilter ke
  // platform sosial saja di sini biar tidak nyampur konteks.
  const socialChannelRows = channelRows.filter((r) => r.icon !== "meta_ads" && r.icon !== "website");

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Social Media" subtitle="Ringkasan performa Instagram, Facebook, dan TikTok." />

      <div className="space-y-6 p-5 lg:p-8">
        {/* Satu card konsolidasi — KPI total gabungan, tren followers, engagement
            per platform, dan detail per-platform, semua di satu tempat yang
            sama supaya tidak perlu lompat-lompat antar card kecil. */}
        <Card padding="lg">
          <SectionHeading title="Followers & Engagement" description="Total gabungan dari semua platform yang aktif." />

          <div className="grid grid-cols-[repeat(auto-fit,minmax(128px,1fr))] items-stretch gap-3">
            <MiniStat label="Followers" value={formatNumber(totalFollowers)} color="blue" />
            <MiniStat label="Reach" value={formatNumber(totalReach)} color="green" />
            <MiniStat label="Impressions" value={formatNumber(totalImpressions)} color="purple" />
            <MiniStat label="Profile Visit" value={formatNumber(totalProfileVisit)} color="orange" />
          </div>

          {followersChart.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">
                Pertumbuhan Followers — {primaryPlatformLabel} (5 minggu terakhir)
              </p>
              <TrendChart data={followersChart} dataKey="value" format="number" />
            </div>
          )}

          {socialChannelRows.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="mb-1 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Engagement per Platform</p>
              <ChannelOverview rows={socialChannelRows} />
            </div>
          )}

          <div className="mt-6 border-t border-border pt-5">
            <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Platform Performance</p>
            <PlatformPerformanceTable rows={platformPerformance} />
          </div>
        </Card>
      </div>
    </div>
  );
}
