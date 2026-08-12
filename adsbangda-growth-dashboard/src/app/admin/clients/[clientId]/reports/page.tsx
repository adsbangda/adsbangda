import { revalidatePath } from "next/cache";
import { Trash2, Plus, FileText } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/dashboard/button";
import { adminListReports, adminCreateReport, adminDeleteReport } from "@/lib/admin-data";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";
function cn2() {
  return "sm:col-span-2 " + inputClass;
}

export default async function AdminClientReportsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const path = `/admin/clients/${clientId}/reports`;
  const reports = await adminListReports(clientId);

  async function addReport(formData: FormData) {
    "use server";
    await adminCreateReport(clientId, {
      periodMonth: String(formData.get("periodMonth")),
      fileUrl: String(formData.get("fileUrl")),
      summary: String(formData.get("summary") ?? ""),
    });
    revalidatePath(path);
  }

  async function deleteReportAction(formData: FormData) {
    "use server";
    await adminDeleteReport(String(formData.get("id")));
    revalidatePath(path);
  }

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <p className="text-sm text-muted">Laporan bulanan dan laporan lainnya untuk client ini.</p>

      <Card padding="lg">
        <SectionHeading title="Reports Bulanan" />
        {reports.length === 0 ? (
          <EmptyState icon={FileText} title="Belum ada report" description="Upload report pertama lewat form di bawah." />
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{report.periodMonth}</p>
                  <p className="text-xs text-muted">{report.summary}</p>
                </div>
                <form action={deleteReportAction}>
                  <input type="hidden" name="id" value={report.id} />
                  <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
        <form action={addReport} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-5">
          <input name="periodMonth" placeholder="2026-08" required className={inputClass} />
          <input name="fileUrl" placeholder="URL laporan" required className={cn2()} />
          <input name="summary" placeholder="Ringkasan" className={cn2()} />
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="h-3.5 w-3.5" /> Upload Report
          </button>
        </form>
      </Card>
    </div>
  );
}
