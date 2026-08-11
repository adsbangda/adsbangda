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

      <div className="mx-auto max-w-4xl px-5 py-8 lg:px-8 lg:py-10">
        <div className="divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-xs)]">
          {reports.map((report) => (
            <div key={report.id} className="flex items-start justify-between gap-4 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                  <FileText className="h-4.5 w-4.5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Marketing Performance — {formatPeriod(report.periodMonth)}
                  </p>
                  <p className="mt-0.5 max-w-md text-xs leading-relaxed text-muted">{report.summary}</p>
                  <p className="mt-1.5 font-data text-[11px] text-muted">
                    Dibuat {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(report.generatedAt))}
                  </p>
                </div>
              </div>
              <a
                href={report.fileUrl}
                className="inline-flex shrink-0 items-center gap-2 rounded-md border border-ink px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                Download
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
