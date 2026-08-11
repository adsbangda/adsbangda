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
    <div className="page-backdrop min-h-screen">
      <Topbar title="Report Center" subtitle="Laporan bulanan dan riwayat performance." />

      <div className="p-8">
        <div className="divide-y divide-border overflow-hidden rounded-[var(--radius-card)] border border-border bg-paper-deep shadow-[var(--shadow-card)]">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <FileText className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Laporan {formatPeriod(report.periodMonth)}
                  </p>
                  <p className="font-data text-xs text-muted">
                    Dibuat {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(report.generatedAt))}
                  </p>
                </div>
              </div>
              <a
                href={report.fileUrl}
                className="inline-flex items-center gap-2 rounded-full border border-ink px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <Download className="h-4 w-4" strokeWidth={1.75} />
                Download PDF
              </a>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="p-10 text-center text-sm text-muted">Belum ada laporan tersedia.</div>
          )}
        </div>
      </div>
    </div>
  );
}
