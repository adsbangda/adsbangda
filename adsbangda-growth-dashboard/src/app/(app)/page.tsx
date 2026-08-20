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
  type DateRange,
} from "@/lib/data";

/** Format "YYYY-MM" jadi ISO date murni buat validasi regex — dipakai supaya
 * ?period= dari URL yang aneh/rusak (bukan diketik dari dropdown kita
 * sendiri) tidak diteruskan mentah-mentah ke query Supabase. */
function isValidPeriod(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}$/.test(value);
}

function isValidDate(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string }> }) {
  const { period: periodParam, from: fromParam, to: toParam } = await searchParams;
  const client = await getCurrentClient();

  // Rentang tanggal custom dari kalender di OverviewHeader — valid kalau
  // DUA-DUANYA ada, format benar, dan urut (from <= to). SEBELUMNYA juga
  // di-cross-check harus berada di dalam bulan `period` yang lagi aktif —
  // itu sumber bug "banyak error": kalau user sempat geser bulan di
  // kalender sebelum klik tanggal kedua, atau rentangnya kebetulan nyebrang
  // ke bulan lain, validasi lama nolak rentang yang sebenarnya valid dan
  // diam-diam balik ke satu bulan penuh tanpa penjelasan. Sekarang `period`
  // JUSTRU DITURUNKAN dari `range.from` kalau range ada — jadi keduanya
  // selalu konsisten by construction, tidak ada lagi validasi silang yang
  // bisa gagal.
  const range: DateRange | undefined = isValidDate(fromParam) && isValidDate(toParam) && fromParam <= toParam ? { from: fromParam, to: toParam } : undefined;
  const period = range ? range.from.slice(0, 7) : isValidPeriod(periodParam) ? periodParam : currentPeriod();

  // Setiap fetch di bawah HANYA dipanggil kalau service terkait aktif untuk
  // client ini (client.socialMediaActive/metaAdsActive/websiteActive —
  // kolom yang sudah ada di tabel `clients` sejak migration 0009, dipakai
  // dengan cara sama persis oleh Admin Portal sendiri). Ini satu-satunya
  // sumber kebenaran "service aktif" — tidak ada konfigurasi baru, tidak
  // ada hardcode per-client.
  //
  // `period`/`range` (dari date-range picker di OverviewHeader) mempengaruhi
  // Monthly Delivery & "What AdsBangda Did" (dua-duanya konsep "terjadi pada
  // tanggal tertentu") — Quick Stats, Meta Ads/Website/Platform Performance,
  // dan Content Calendar tetap nunjukin snapshot/data TERBARU apa pun yang
  // dipilih, karena itu snapshot mingguan, bukan aktivitas per-tanggal.
  const [delivery, quickStats, attentionItems, activity, channelRows, upcomingEvents, weeklyCalendar, socialBreakdown, platformPerformance, performanceSummary] = await Promise.all([
    getMonthlyDelivery(client.id, period, range),
    getQuickStats(client.id),
    getAttentionItems(client.id),
    getRecentActivity(client.id, period, range),
    getChannelOverview(client),
    getUpcomingEvents(client.id),
    getWeeklyCalendar(client.id),
    client.socialMediaActive ? getSocialMediaBreakdown(client.id, period) : Promise.resolve([]),
    client.socialMediaActive ? getPlatformPerformanceTable(client.id) : Promise.resolve([]),
    client.metaAdsActive || client.websiteActive || client.socialMediaActive ? getPerformanceSummary(client.id) : Promise.resolve(null),
  ]);

  return (
    <div className="page-backdrop min-h-screen">
      <OverviewHeader
        clientName={client.name}
        periodLabel={delivery.periodLabel}
        currentPeriod={period}
        dateFrom={range?.from}
        dateTo={range?.to}
        hasAttention={attentionItems.length > 0}
      />

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

            {/* Platform Performance — tabel Followers/Reach/Impressions/
                Profile Visit per platform, masing-masing dengan indikator
                naik-turun vs periode sebelumnya. TERPISAH dari "Content
                Delivery" di atas (target vs actual konten, sumber data
                beda). Fleksibel — SEMUA platform yang pernah ada datanya
                otomatis muncul, section hilang total kalau socialMediaActive
                false atau belum ada data. */}
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

            {/* Kalender Konten Mingguan — SEKARANG full-width sendiri (sejajar
                dengan pola Meta Ads/Website Performance di atas: Card
                penuh, bukan dipasangkan setengah-setengah), karena "What
                AdsBangda Did" pindah ke kolom kanan (lihat di bawah). */}
            <Card>
              <SectionHeading title="Kalender Konten (Minggu Ini)" action={<a href="/content-calendar" className="font-data text-xs font-semibold text-accent hover:underline">Lihat kalender</a>} />
              <WeeklyContentCalendar calendar={weeklyCalendar} />
            </Card>
          </div>

          {/* Right column — urutan: Channel Overview → Needs Your Attention →
              What AdsBangda Did → Upcoming This Month. */}
          <div className="space-y-6">
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

            <Card>
              <SectionHeading title="What AdsBangda Did" action={<a href="/reports" className="font-data text-xs font-semibold text-accent hover:underline">Lihat semua</a>} />
              {activity.length === 0 ? (
                <EmptyState title="Belum ada aktivitas" description="Aktivitas tim Adsbangda akan muncul di sini." />
              ) : (
                <ActivityList items={activity} />
              )}
            </Card>

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
