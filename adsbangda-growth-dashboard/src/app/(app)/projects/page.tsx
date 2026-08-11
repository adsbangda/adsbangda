import { Topbar } from "@/components/dashboard/topbar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { getCurrentClient, getActiveProject } from "@/lib/data";
import { formatDateID } from "@/lib/utils";

export default async function ProjectsPage() {
  const client = await getCurrentClient();
  const { project, tasks } = await getActiveProject(client.id);

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Project Progress" subtitle="Perkembangan pekerjaan project yang sedang berjalan." />

      <div className="p-8">
        {!project ? (
          <div className="rounded-[var(--radius-card)] border border-border bg-paper-deep shadow-[var(--shadow-card)] p-10 text-center text-sm text-muted">
            Belum ada project aktif saat ini.
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-border bg-paper-deep shadow-[var(--shadow-card)] p-6">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-5">
              <div>
                <h2 className="text-lg font-bold text-ink">{project.name}</h2>
                <p className="mt-0.5 text-sm text-muted">
                  {formatDateID(project.startDate)} — {formatDateID(project.endDate)}
                </p>
              </div>
              <StatusBadge status={project.status} />
            </div>

            <div className="space-y-6">
              {tasks.map((task, index) => (
                <div key={task.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-data text-xs font-bold text-accent">
                      {index + 1}
                    </div>
                    {index < tasks.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-ink">{task.name}</h3>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar value={task.progressPct} />
                      </div>
                      <span className="font-data text-xs text-muted">{task.progressPct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
