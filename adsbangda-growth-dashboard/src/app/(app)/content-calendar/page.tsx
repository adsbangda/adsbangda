import { Topbar } from "@/components/dashboard/topbar";
import { SectionLabel } from "@/components/dashboard/section-label";
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
      <Topbar title="Content Calendar" />

      <div className="mx-auto max-w-4xl px-5 py-10 lg:px-8 lg:py-14">
        <header className="animate-rise mb-10">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            {waitingCount > 0
              ? `${waitingCount} konten menunggu approval kamu.`
              : "Semua konten sudah diproses."}
          </h1>
          <p className="mt-2 text-sm text-muted">Rencana konten dan status approval bulan ini.</p>
        </header>

        <SectionLabel>Content Plan</SectionLabel>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="py-2.5 pr-4 font-medium">Konten</th>
              <th className="py-2.5 pr-4 font-medium">Platform</th>
              <th className="py-2.5 pr-4 font-medium">Tipe</th>
              <th className="py-2.5 pr-4 font-medium">Tanggal</th>
              <th className="py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const Icon = PLATFORM_ICON[item.platform];
              return (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="py-3.5 pr-4 font-medium text-ink">{item.title}</td>
                  <td className="py-3.5 pr-4 text-muted">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {item.platform}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 capitalize text-muted">{item.type}</td>
                  <td className="py-3.5 pr-4 font-data text-xs text-muted">
                    {formatDateID(item.plannedDate)}
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
