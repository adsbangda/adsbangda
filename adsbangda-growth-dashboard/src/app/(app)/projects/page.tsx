import { Topbar } from "@/components/dashboard/topbar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { getCurrentClient, getActiveProject } from "@/lib/data";
import { formatDateID } from "@/lib/utils";

export default async function ProjectsPage() {
  const client = await getCurrentClient();
  const { project, tasks } = await getActiveProject(client.id);

  return (
    <div className="flex-1 min-h-screen">
      <Topbar title="Project Progress" subtitle="Perkembangan milestone & task project berjalan." />

      <div className="p-6 sm:p-8 pt-4">
        {!project ? (
          <div className="rounded-[20px] border border-[#ECECEC] bg-[#FFFFFF] p-12 text-center text-sm text-[#71717A] shadow-xs">
            Belum ada project aktif saat ini.
          </div>
        ) : (
          <div className="rounded-[20px] border border-[#ECECEC] bg-[#FFFFFF] p-6 sm:p-8 shadow-xs">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#ECECEC] pb-6">
              <div>
                <span className="font-data text-[10px] font-bold uppercase tracking-wider text-[#71717A] bg-[#FAFAFA] px-2.5 py-1 rounded-full border border-[#ECECEC]">
                  Active Sprint
                </span>
                <h2 className="text-xl font-bold text-[#18181B] mt-2">{project.name}</h2>
                <p className="mt-1 text-xs text-[#71717A] font-data">
                  {formatDateID(project.startDate)} — {formatDateID(project.endDate)}
                </p>
              </div>
              <StatusBadge status={project.status} />
            </div>

            <div className="space-y-6">
              {tasks.map((task, index) => (
                <div key={task.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] font-data text-xs font-bold text-[#1D4ED8] border border-[#1D4ED8]/20">
                      {index + 1}
                    </div>
                    {index < tasks.length - 1 && <div className="mt-2 w-0.5 flex-1 bg-[#ECECEC]" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#18181B]">{task.name}</h3>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex-1">
                        <ProgressBar value={task.progressPct} />
                      </div>
                      <span className="font-data text-xs font-bold text-[#71717A] w-10 text-right">
                        {task.progressPct}%
                      </span>
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