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
} from "@/lib/data";

export default async function OverviewPage() {
  const client = await getCurrentClient();
  const [delivery, quickStats, attentionItems, activity, channelRows, upcomingEvents, weeklyCalendar] = await Promise.all([
    getMonthlyDelivery(client.id),
    getQuickStats(client.id),
    getAttentionItems(),
    getRecentActivity(),
    getChannelOverview(client.id),
    getUpcomingEvents(client.id),
    getWeeklyCalendar(client.id),
  ]);

  return (
    <div className="page-backdrop min-h-screen">
      <OverviewHeader clientName={client.name} periodLabel={delivery.periodLabel} notificationCount={attentionItems.length} />

      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            <MonthlyDeliveryHero {...delivery} />

            <QuickStats stats={quickStats} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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

            <Card>
              <SectionHeading title="Channel Overview (This Month)" action={<a href="/reports" className="font-data text-xs font-semibold text-accent hover:underline">Lihat laporan</a>} />
              <ChannelOverview rows={channelRows} />
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
