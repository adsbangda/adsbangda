import { Topbar } from "@/components/dashboard/topbar";
import { SectionLabel } from "@/components/dashboard/section-label";
import { getCurrentClient, getReports } from "@/lib/data";
import { Download } from "lucide-react";

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
      <Topbar title="Report Center" />

      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-14">
        <header className="animate-rise mb-10">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
            Laporan bulanan.
          </h1>
          <p className="mt-2 text-sm text-muted">Riwayat performance marketing kamu, bulan demi bulan.</p>
        </header>

        <SectionLabel>History</SectionLabel>
        <div className="divide-y divide-border">
          {reports.map((report) => (
            <div key={report.id} className="flex items-start justify-between gap-4 py-5 first:pt-0">
              <div>
                <p className="text-sm font-semibold text-ink">
                  Marketing Performance — {formatPeriod(report.periodMonth)}
                </p>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-muted">{report.summary}</p>
                <p className="mt-1.5 font-data text-[11px] text-muted">
                  Dibuat {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(report.generatedAt))}
                </p>
              </div>
              <a
                href={report.fileUrl}
                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-accent transition-colors hover:text-accent-2"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                Download
              </a>
            </div>
          ))}

          {reports.length === 0 && <p className="py-10 text-center text-sm text-muted">Belum ada laporan tersedia.</p>}
        </div>
      </div>
    </div>
  );
}
