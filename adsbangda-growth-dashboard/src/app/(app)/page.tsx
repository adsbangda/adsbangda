import { OverviewHeader } from "@/components/dashboard/overview-header";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { MonthlyDeliveryHero } from "@/components/dashboard/monthly-delivery-hero";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { ActivityList } from "@/components/dashboard/activity-item";
import { ActionItem } from "@/components/dashboard/action-item";
import { ChannelOverview } from "@/components/dashboard/channel-overview";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import { WeeklyContentCalendar } from "@/components/dashboard/weekly-content-calendar";
import { SocialMediaPerformance } from "@/components/dashboard/social-media-performance";
import { PlatformPerformanceTable } from "@/components/dashboard/platform-performance-table";
import { MetaAdsSummary } from "@/components/dashboard/meta-ads-summary";
import { WebsiteSummary } from "@/components/dashboard/website-summary";
import { MomentumBanner } from "@/components/dashboard/momentum-banner";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  getCurrentClient,
  getMonthlyDelivery,
  getQuickStats,
  getAttentionItems,
  getRecentActivity,
  getChannelOverview,
  getUpcomingEvents,
  getWeeklyCalendar,
  getSocialMediaBreakdown,
  getPlatformPerformanceTable,
  getPerformanceSummary,
  currentPeriod,
} from "@/lib/data";

/** Format "YYYY-MM" jadi ISO date murni buat validasi regex — dipakai supaya
 * ?period= dari URL yang aneh/rusak (bukan diketik dari dropdown kita
 * sendiri) tidak diteruskan mentah-mentah ke query Supabase. */
function isValidPeriod(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}$/.test(value);
}

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const { period: periodParam } = await searchParams;
  const client = await getCurrentClient();
  const period = isValidPeriod(periodParam) ? periodParam : currentPeriod();

  // Setiap fetch di bawah HANYA dipanggil kalau service terkait aktif untuk
  // client ini (client.socialMediaActive/metaAdsActive/websiteActive —
  // kolom yang sudah ada di tabel `clients` sejak migration 0009, dipakai
  // dengan cara sama persis oleh Admin Portal sendiri). Ini satu-satunya
  // sumber kebenaran "service aktif" — tidak ada konfigurasi baru, tidak
  // ada hardcode per-client.
  //
  // `period` (dari dropdown tanggal di OverviewHeader) mempengaruhi Monthly
  // Delivery & Content Delivery per platform (dua-duanya konsep "target
  // bulan X") — Quick Stats, Meta Ads/Website performance, Platform
  // Performance (Followers/Reach/Engagement/Profile Visit), Activity, dan
  // Content Calendar tetap nunjukin snapshot/data TERBARU apa pun periode
  // yang dipilih, karena itu snapshot mingguan, bukan konsep target bulanan.
  const [delivery, quickStats, attentionItems, activity, channelRows, upcomingEvents, weeklyCalendar, socialBreakdown, platformPerformance, performanceSummary] = await Promise.all([
    getMonthlyDelivery(client.id, period),
    getQuickStats(client.id),
    getAttentionItems(client.id),
    getRecentActivity(client.id),
    getChannelOverview(client),
    getUpcomingEvents(client.id),
    getWeeklyCalendar(client.id),
    client.socialMediaActive ? getSocialMediaBreakdown(client.id, period) : Promise.resolve([]),
    client.socialMediaActive ? getPlatformPerformanceTable(client.id) : Promise.resolve([]),
    client.metaAdsActive || client.websiteActive || client.socialMediaActive ? getPerformanceSummary(client.id) : Promise.resolve(null),
  ]);

  return (
    <div className="page-backdrop min-h-screen">
      <OverviewHeader clientName={client.name} periodLabel={delivery.periodLabel} currentPeriod={period} attentionItems={attentionItems} />

      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Progress + Social Media Performance — SATU baris sejajar (Progress sempit fixed,
                Social Media ngisi sisa lebar), tinggi disamakan (stretch) karena cuma 2 card ini
                yang dipasangkan berdampingan — beda kasus dengan grid utama di bawah yang sengaja
                items-start (biar tidak kena bug "kolom raksasa" kalau salah satu kolom jauh lebih
                tinggi dari yang lain). */}
            <div
              className={`grid items-stretch gap-6 ${
                client.socialMediaActive ? "grid-cols-1 sm:grid-cols-[minmax(230px,260px)_1fr]" : "grid-cols-1"
              }`}
            >
              <div className={client.socialMediaActive ? "" : "max-w-[260px]"}>
                <MonthlyDeliveryHero {...delivery} />
              </div>

              {/* Social Media Performance — HANYA render kalau service-nya aktif DAN memang ada
                  platform yang pernah dikonfigurasi (content_targets). Platform per-item
                  (Instagram/TikTok/Facebook dst) sudah ter-filter sendiri di dalam
                  getSocialMediaBreakdown — tidak perlu toggle tambahan di sini. */}
              {client.socialMediaActive && (
                <Card className="flex h-full flex-col">
                  <SectionHeading
                    title="Content Delivery"
                    action={
                      <a href="/social-media" className="font-data text-xs font-semibold text-accent hover:underline">
                        Lihat detail
                      </a>
                    }
                  />
                  {socialBreakdown.length === 0 ? (
                    <EmptyState title="Belum ada target content" description="Atur target per platform di Social Media → Content Delivery." />
                  ) : (
                    <SocialMediaPerformance platforms={socialBreakdown} />
                  )}
                </Card>
              )}
            </div>

            {quickStats.length > 0 && <QuickStats stats={quickStats} />}

            {/* Platform Performance — tabel Followers/Reach/Engagement/
                Content per platform, masing-masing dengan indikator naik-
                turun vs periode sebelumnya. TERPISAH dari "Content
                Delivery" di atas (target vs actual konten, sumber data
                beda). Sebelumnya belum ada sama sekali di Overview walau
                datanya sudah lama diisi admin. Fleksibel — SEMUA platform
                yang pernah ada datanya otomatis muncul, section hilang
                total kalau socialMediaActive false atau belum ada data. */}
            {client.socialMediaActive && (
              <Card padding="lg">
                <SectionHeading
                  title="Platform Performance"
                  action={
                    <a href="/social-media" className="font-data text-xs font-semibold text-accent hover:underline">
                      Lihat detail
                    </a>
                  }
                />
                <PlatformPerformanceTable rows={platformPerformance} />
              </Card>
            )}

            {/* Meta Ads & Website Performance — berdampingan kalau dua-duanya
                aktif, masing-masing full width kalau cuma satu yang aktif,
                dan section-nya hilang total kalau dua-duanya tidak aktif. */}
            {(client.metaAdsActive || client.websiteActive) && (
              <div className={`grid grid-cols-1 items-start gap-6 ${client.metaAdsActive && client.websiteActive ? "xl:grid-cols-2" : ""}`}>
                {client.metaAdsActive && (
                  <Card>
                    <SectionHeading
                      title="Meta Ads Performance"
                      action={
                        <a href="/meta-ads" className="font-data text-xs font-semibold text-accent hover:underline">
                          Lihat laporan
                        </a>
                      }
                    />
                    <MetaAdsSummary metrics={performanceSummary?.metaAds ?? []} budgetTarget={client.metaAdsBudgetTarget} />
                  </Card>
                )}
                {client.websiteActive && (
                  <Card>
                    <SectionHeading
                      title="Website Performance"
                      action={
                        <a href="/website" className="font-data text-xs font-semibold text-accent hover:underline">
                          Lihat laporan
                        </a>
                      }
                    />
                    <WebsiteSummary metrics={performanceSummary?.website ?? []} />
                  </Card>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
              <Card>
                <SectionHeading title="What AdsBangda Did" action={<a href="/reports" className="font-data text-xs font-semibold text-accent hover:underline">Lihat semua</a>} />
                {activity.length === 0 ? (
                  <EmptyState title="Belum ada aktivitas" description="Aktivitas tim Adsbangda akan muncul di sini." />
                ) : (
                  <ActivityList items={activity} />
                )}
              </Card>

              <Card>
                <SectionHeading title="Kalender Konten (Minggu Ini)" action={<a href="/content-calendar" className="font-data text-xs font-semibold text-accent hover:underline">Lihat kalender</a>} />
                <WeeklyContentCalendar calendar={weeklyCalendar} />
              </Card>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card>
              <SectionHeading title="Needs Your Attention" action={<a href="/content-calendar" className="font-data text-xs font-semibold text-accent hover:underline">Lihat semua</a>} />
              {attentionItems.length === 0 ? (
                <EmptyState title="Tidak ada yang perlu direview" description="Semua sudah beres untuk saat ini." />
              ) : (
                <div className="divide-y divide-border">
                  {attentionItems.map((item) => (
                    <ActionItem key={item.id} {...item} />
                  ))}
                </div>
              )}
              <a href="/content-calendar" className="mt-3 flex items-center justify-center gap-1 border-t border-border pt-3 font-data text-xs font-semibold text-accent hover:underline">
                Lihat semua tugas →
              </a>
            </Card>

            {(client.socialMediaActive || client.metaAdsActive || client.websiteActive) && (
              <Card>
                <SectionHeading title="Channel Overview (This Month)" action={<a href="/reports" className="font-data text-xs font-semibold text-accent hover:underline">Lihat laporan</a>} />
                {channelRows.length === 0 ? (
                  <EmptyState title="Belum ada data performance" description="Data akan muncul begitu tim Adsbangda mengisi performance mingguan." />
                ) : (
                  <ChannelOverview rows={channelRows} />
                )}
              </Card>
            )}

            <Card>
              <SectionHeading title="Upcoming This Month" action={<a href="/reports" className="font-data text-xs font-semibold text-accent hover:underline">Lihat kalender</a>} />
              <UpcomingEvents events={upcomingEvents} />
            </Card>
          </div>
        </div>

        <MomentumBanner
          title="Terus pertahankan momentum ini! 🎉"
          description="Konsistensi konten yang berkualitas akan membawa hasil yang maksimal."
          actionLabel="Lihat Laporan Lengkap"
          actionHref="/reports"
        />
      </div>
    </div>
  );
}
