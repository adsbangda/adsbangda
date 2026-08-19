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
  getPerformanceSummary,
} from "@/lib/data";

export default async function OverviewPage() {
  const client = await getCurrentClient();

  // Setiap fetch di bawah HANYA dipanggil kalau service terkait aktif untuk
  // client ini (client.socialMediaActive/metaAdsActive/websiteActive —
  // kolom yang sudah ada di tabel `clients` sejak migration 0009, dipakai
  // dengan cara sama persis oleh Admin Portal sendiri). Ini satu-satunya
  // sumber kebenaran "service aktif" — tidak ada konfigurasi baru, tidak
  // ada hardcode per-client.
  const [delivery, quickStats, attentionItems, activity, channelRows, upcomingEvents, weeklyCalendar, socialBreakdown, performanceSummary] = await Promise.all([
    getMonthlyDelivery(client.id),
    getQuickStats(client.id),
    getAttentionItems(client.id),
    getRecentActivity(client.id),
    getChannelOverview(client),
    getUpcomingEvents(client.id),
    getWeeklyCalendar(client.id),
    client.socialMediaActive ? getSocialMediaBreakdown(client.id) : Promise.resolve([]),
    client.metaAdsActive || client.websiteActive ? getPerformanceSummary(client.id) : Promise.resolve(null),
  ]);

  return (
    <div className="page-backdrop min-h-screen">
      <OverviewHeader clientName={client.name} periodLabel={delivery.periodLabel} notificationCount={attentionItems.length} />

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
                    title="Social Media Performance"
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

            <QuickStats stats={quickStats} />

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
                    <MetaAdsSummary metrics={performanceSummary?.metaAds ?? []} />
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
