import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getCurrentClient, getContentCalendar } from "@/lib/data";
import { formatDateID } from "@/lib/utils";
import { Image as ImageIcon, Users, Music2, Globe } from "lucide-react";
import type { Platform } from "@/lib/types";

const PLATFORM_ICON: Record<Platform, typeof ImageIcon> = {
  instagram: ImageIcon,
  facebook: Users,
  tiktok: Music2,
  website: Globe,
};

export default async function ContentCalendarPage() {
  const client = await getCurrentClient();
  const items = await getContentCalendar(client.id);
  const waitingCount = items.filter((i) => i.status === "waiting_approval").length;

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Content Calendar" subtitle="Rencana konten dan status approval." />

      <div className="space-y-5 p-5 lg:p-8">
        {waitingCount > 0 && (
          <div className="rounded-[var(--radius-lg)] border border-warning-soft bg-warning-soft px-5 py-4 text-sm text-ink shadow-[var(--shadow-xs)]">
            <span className="font-semibold">{waitingCount} konten</span> menunggu approval kamu.
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState title="Belum ada konten terjadwal" description="Rencana konten dari tim Adsbangda akan muncul di sini." />
        ) : (
          <Card padding="sm" className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-black/[0.015] text-xs uppercase tracking-wide text-muted">
                    <th className="px-6 py-3 font-medium">Konten</th>
                    <th className="px-6 py-3 font-medium">Platform</th>
                    <th className="px-6 py-3 font-medium">Tipe</th>
                    <th className="px-6 py-3 font-medium">Tanggal</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const Icon = PLATFORM_ICON[item.platform];
                    return (
                      <tr key={item.id} className="border-b border-border last:border-0">
                        <td className="px-6 py-4 font-medium text-ink">{item.title}</td>
                        <td className="px-6 py-4 text-muted">
                          <span className="inline-flex items-center gap-1.5 capitalize">
                            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                            {item.platform}
                          </span>
                        </td>
                        <td className="px-6 py-4 capitalize text-muted">{item.type}</td>
                        <td className="px-6 py-4 font-data text-xs text-muted">{formatDateID(item.plannedDate)}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
