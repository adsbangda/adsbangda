import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/dashboard/button";
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

      <div className="p-5 lg:p-8">
        {reports.length === 0 ? (
          <EmptyState title="Belum ada laporan tersedia" description="Laporan bulanan akan muncul di sini setelah periode pertama selesai." />
        ) : (
        <Card padding="sm" className="divide-y divide-border overflow-hidden p-0">
          {reports.map((report) => (
            <div key={report.id} className="flex flex-wrap items-start justify-between gap-4 p-5 lg:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-accent-soft text-accent">
                  <FileText className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Marketing Performance — {formatPeriod(report.periodMonth)}
                  </p>
                  <p className="mt-1 max-w-md text-xs leading-relaxed text-muted">{report.summary}</p>
                  <p className="mt-1.5 font-data text-[11px] text-muted">
                    Dibuat {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(report.generatedAt))}
                  </p>
                </div>
              </div>
              <a href={report.fileUrl} className={buttonVariants({ variant: "outline" })}>
                <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                Download
              </a>
            </div>
          ))}
        </Card>
        )}
      </div>
    </div>
  );
}
