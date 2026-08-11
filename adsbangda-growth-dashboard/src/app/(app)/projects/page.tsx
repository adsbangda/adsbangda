import { Topbar } from "@/components/dashboard/topbar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { getCurrentClient, getActiveProject } from "@/lib/data";
import { formatDateID } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export default async function ProjectsPage() {
  const client = await getCurrentClient();
  const { project, tasks } = await getActiveProject(client.id);
  const completed = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Project Progress" />

      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-14">
        {!project ? (
          <p className="text-sm text-muted">Belum ada project aktif saat ini.</p>
        ) : (
          <>
            <header className="animate-rise mb-12">
              <p className="font-data text-xs uppercase tracking-[0.14em] text-muted">
                {formatDateID(project.startDate)} — {formatDateID(project.endDate)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-bold tracking-tight text-ink lg:text-4xl">
                  {project.name}
                </h1>
                <StatusBadge status={project.status} />
              </div>
              <p className="mt-2 text-sm text-muted">
                {completed} dari {tasks.length} tahap selesai.
              </p>
            </header>

            <div className="divide-y divide-border">
              {tasks.map((task) => (
                <div key={task.id} className="py-5 first:pt-0">
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
                    <div className="mt-2.5 flex items-start gap-2 text-xs">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" strokeWidth={1.75} />
                      <span className="text-ink">{task.blocker}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
