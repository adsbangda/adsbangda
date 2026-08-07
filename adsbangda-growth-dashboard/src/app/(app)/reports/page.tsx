import { Topbar } from "@/components/dashboard/topbar";
import { getCurrentClient, getReports } from "@/lib/data";
import { Download, FileText } from "lucide-react";

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
    new Date(Number(year), Number(month) - 1)
  );
}

export default async function ReportsPage() {
  const client = await getCurrentClient();
  const reports = await getReports(client.id);

  return (
    <div className="flex-1 min-h-screen">
      <Topbar title="Report Center" subtitle="Laporan bulanan dan riwayat performa terlampir." />

      <div className="p-6 sm:p-8 pt-4">
        <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border bg-paper-deep shadow-2xs">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 transition-colors hover:bg-paper/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent border border-accent/20">
                  <FileText className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">
                    Laporan Performa {formatPeriod(report.periodMonth)}
                  </p>
                  <p className="font-data text-xs text-muted mt-0.5">
                    Dibuat {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(report.generatedAt))}
                  </p>
                </div>
              </div>
              <a
                href={report.fileUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 font-data text-xs font-bold text-paper transition-all hover:bg-accent shadow-xs"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2} />
                Download PDF
              </a>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="p-12 text-center text-sm text-muted">Belum ada laporan tersedia.</div>
          )}
        </div>
      </div>
    </div>
  );
}