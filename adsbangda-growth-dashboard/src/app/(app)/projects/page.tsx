import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { getCurrentClient, getActiveProject } from "@/lib/data";
import { formatDateID } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

/** "2026-08" -> "Agustus 2026" — sama teknik yang sudah dipakai buat Monthly Delivery (lihat mockMonthlyDelivery.periodLabel / getMonthlyDelivery di lib/data.ts). */
function periodLabel(period?: string) {
  if (!period) return null;
  try {
    return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(`${period}-01`));
  } catch {
    return period;
  }
}

export default async function ProjectsPage() {
  const client = await getCurrentClient();
  const { project, tasks } = await getActiveProject(client.id);

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Project Progress" subtitle="Perkembangan pekerjaan project yang sedang berjalan." />

      <div className="p-5 lg:p-8">
        {!project ? (
          <EmptyState title="Belum ada project aktif" description="Project baru akan muncul di sini begitu dimulai oleh tim Adsbangda." />
        ) : (
          <Card padding="lg">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
              <div className="min-w-0">
                {/* Layanan yang dicakup project ini — BISA lebih dari satu, digabung
                    jadi satu paket (mis. "Social Media Management & Website &
                    Landing Page"), bukan ditampilkan sebagai project terpisah. */}
                {project.services && project.services.length > 0 && (
                  <div className="mb-1.5 flex flex-wrap gap-1.5">
                    {project.services.map((s) => (
                      <span key={s} className="rounded-full bg-accent-soft px-2.5 py-0.5 font-data text-[11px] font-semibold text-accent">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="text-lg font-bold text-ink">{project.name}</h2>
                <p className="mt-0.5 text-sm text-muted">
                  {periodLabel(project.period) && <span className="font-medium text-ink">{periodLabel(project.period)}</span>}
                  {periodLabel(project.period) && " · "}
                  {formatDateID(project.startDate)} — {formatDateID(project.endDate)}
                </p>
              </div>
              <StatusBadge status={project.status} />
            </div>

            <div className="space-y-6">
              {tasks.map((task, index) => (
                <div key={task.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft font-data text-xs font-bold text-accent">
                      {index + 1}
                    </div>
                    {index < tasks.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-ink">{task.name}</h3>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar value={task.progressPct} />
                      </div>
                      <span className="font-data text-xs text-muted">{task.progressPct}%</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      <span>{task.owner}</span>
                      <span>Due {formatDateID(task.dueDate)}</span>
                    </div>
                    {task.blocker && (
                      <div className="mt-3 flex items-start gap-2 rounded-[var(--radius-md)] bg-warning-soft p-3 text-xs">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" strokeWidth={1.75} />
                        <span className="text-ink">{task.blocker}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
