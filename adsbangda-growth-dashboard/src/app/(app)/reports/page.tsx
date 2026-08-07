import { Topbar } from "@/components/dashboard/topbar";
import { getCurrentClient, getReports } from "@/lib/data";
import { FileDown, FileText } from "lucide-react";

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
      <Topbar title="Report Center" subtitle="Unduh arsip laporan performa resmi." />

      <div className="p-6 sm:p-8 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="group rounded-[20px] border border-[#ECECEC] bg-[#FFFFFF] p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#1D4ED8]/30 flex flex-col justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1D4ED8] border border-[#1D4ED8]/20 shrink-0 group-hover:bg-[#1D4ED8] group-hover:text-white transition-colors">
                  <FileText className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#18181B]">
                    Laporan {formatPeriod(report.periodMonth)}
                  </h3>
                  <p className="font-data text-xs text-[#71717A] mt-1">
                    Dibuat {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(report.generatedAt))}
                  </p>
                </div>
              </div>

              <a
                href={report.fileUrl}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#18181B] py-2.5 font-data text-xs font-bold text-white transition-all hover:bg-[#1D4ED8] shadow-xs"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Download PDF Report</span>
              </a>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="col-span-full rounded-[20px] border border-[#ECECEC] bg-[#FFFFFF] p-12 text-center text-sm text-[#71717A] shadow-xs">
              Belum ada laporan tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}