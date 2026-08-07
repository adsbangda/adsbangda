import { Topbar } from "@/components/dashboard/topbar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getCurrentClient, getContentCalendar } from "@/lib/data";
import { formatDateID } from "@/lib/utils";

export default async function ContentCalendarPage() {
  const client = await getCurrentClient();
  const items = await getContentCalendar(client.id);

  return (
    <div className="flex-1 min-h-screen">
      <Topbar title="Content Calendar" subtitle="Rencana konten dan status persetujuan." />

      <div className="p-6 sm:p-8 pt-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-paper-deep shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-paper text-xs uppercase tracking-wider text-muted font-data">
                <th className="px-6 py-3.5 font-bold">Judul / Tema Konten</th>
                <th className="px-6 py-3.5 font-bold">Tanggal Rencana</th>
                <th className="px-6 py-3.5 font-bold">Status Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-paper/50">
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