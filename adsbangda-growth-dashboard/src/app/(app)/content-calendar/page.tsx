import { Topbar } from "@/components/dashboard/topbar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getCurrentClient, getContentCalendar } from "@/lib/data";
import { formatDateID } from "@/lib/utils";

export default async function ContentCalendarPage() {
  const client = await getCurrentClient();
  const items = await getContentCalendar(client.id);

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Content Calendar" subtitle="Rencana konten dan status approval." />

      <div className="p-8">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-paper-deep shadow-[var(--shadow-card)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-black/[0.02] text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-3 font-medium">Konten</th>
                <th className="px-6 py-3 font-medium">Tanggal Rencana</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 font-medium text-ink">{item.title}</td>
                  <td className="px-6 py-4 font-data text-xs text-muted">
                    {formatDateID(item.plannedDate)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
