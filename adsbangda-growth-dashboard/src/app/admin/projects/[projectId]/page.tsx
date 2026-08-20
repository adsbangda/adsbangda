import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Activity as ActivityIcon, ListChecks, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { buttonVariants } from "@/components/dashboard/button";
import { DEMO_MODE } from "@/lib/data";
import {
  adminGetProject,
  adminGetClient,
  adminUpdateProject,
  adminArchiveProject,
  adminListProjectTeam,
  adminListAccountManagerCandidates,
  adminListCreativeCandidates,
  adminAssignToProject,
  adminUnassignFromProject,
  adminListServices,
  adminListProjectTasks,
  adminCreateProjectTask,
  adminUpdateProjectTask,
  adminDeleteProjectTask,
} from "@/lib/admin-data";
import { formatDateID } from "@/lib/utils";
import type { Project, ProjectTask } from "@/lib/types";

const inputClass = "w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink";
const smallInputClass = "rounded-[var(--radius-md)] border border-border px-3 py-2 text-xs text-ink outline-none focus:border-ink";

export default async function AdminProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ editTask?: string }>;
}) {
  const { projectId } = await params;
  const { editTask } = await searchParams;
  const project = await adminGetProject(projectId);
  if (!project) notFound();

  const [client, services, tasks] = await Promise.all([adminGetClient(project.clientId), adminListServices(), adminListProjectTasks(projectId)]);
  const path = `/admin/projects/${projectId}`;
  const selectedServices = new Set(project.services ?? []);

  async function updateProjectAction(formData: FormData) {
    "use server";
    await adminUpdateProject(projectId, {
      name: String(formData.get("name") ?? "").trim(),
      services: formData.getAll("services").map(String),
      period: String(formData.get("period") ?? "").trim() || undefined,
      description: String(formData.get("description") ?? "").trim(),
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      stage: String(formData.get("stage") ?? "planning") as NonNullable<Project["stage"]>,
      progressPct: Number(formData.get("progressPct") ?? 0),
    });
    revalidatePath(path);
  }

  async function archiveAction() {
    "use server";
    await adminArchiveProject(projectId);
    revalidatePath(path);
  }

  let team: Awaited<ReturnType<typeof adminListProjectTeam>> = [];
  let accountManagers: Awaited<ReturnType<typeof adminListAccountManagerCandidates>> = [];
  let creatives: Awaited<ReturnType<typeof adminListCreativeCandidates>> = [];

  if (!DEMO_MODE) {
    [team, accountManagers, creatives] = await Promise.all([
      adminListProjectTeam(projectId),
      adminListAccountManagerCandidates(),
      adminListCreativeCandidates(),
    ]);
  }

  const assignedIds = new Set(team.map((t) => t.id));
  const candidateMap = new Map(
    [...accountManagers, ...creatives].filter((c) => !assignedIds.has(c.id)).map((c) => [c.id, c])
  );
  const availableCandidates = [...candidateMap.values()];

  async function assignAction(formData: FormData) {
    "use server";
    const userId = String(formData.get("userId") ?? "");
    if (!userId) return;
    await adminAssignToProject(projectId, userId);
    revalidatePath(path);
  }

  async function unassignAction(formData: FormData) {
    "use server";
    await adminUnassignFromProject(projectId, String(formData.get("userId")));
    revalidatePath(path);
  }

  async function addTaskAction(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;
    await adminCreateProjectTask(projectId, {
      name,
      status: String(formData.get("status") ?? "not_started") as ProjectTask["status"],
      progressPct: Number(formData.get("progressPct") ?? 0),
      owner: String(formData.get("owner") ?? "").trim(),
      dueDate: String(formData.get("dueDate") ?? ""),
      blocker: String(formData.get("blocker") ?? "").trim() || undefined,
    });
    revalidatePath(path);
  }

  async function updateTaskAction(formData: FormData) {
    "use server";
    await adminUpdateProjectTask(String(formData.get("id")), {
      name: String(formData.get("name") ?? "").trim(),
      status: String(formData.get("status") ?? "not_started") as ProjectTask["status"],
      progressPct: Number(formData.get("progressPct") ?? 0),
      owner: String(formData.get("owner") ?? "").trim(),
      dueDate: String(formData.get("dueDate") ?? ""),
      blocker: String(formData.get("blocker") ?? "").trim(),
    });
    revalidatePath(path);
  }

  async function deleteTaskAction(formData: FormData) {
    "use server";
    await adminDeleteProjectTask(String(formData.get("id")));
    revalidatePath(path);
  }

  return (
    <div className="min-h-screen p-5 lg:p-8">
      <Link href={`/admin/clients/${project.clientId}/projects`} className="mb-4 inline-flex items-center gap-1.5 font-data text-xs font-semibold text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        {client?.name ?? "Client"} · Projects
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{project.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {project.period && <span className="font-medium text-ink">{project.period}</span>}
            {project.period && " · "}
            {formatDateID(project.startDate)} — {formatDateID(project.endDate)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-28">
            <ProgressBar value={project.progressPct ?? 0} />
          </div>
          <span className="font-data text-xs font-semibold text-ink">{project.progressPct ?? 0}%</span>
          <StatusBadge status={project.stage ?? "planning"} />
        </div>
      </div>

      <div className="space-y-6">
        <Card padding="lg">
          <SectionHeading
            title="Overview"
            action={
              project.stage !== "archived" && (
                <form action={archiveAction}>
                  <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Archive Project
                  </button>
                </form>
              )
            }
          />
          <form action={updateProjectAction} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <input name="name" defaultValue={project.name} required className={`${inputClass} lg:col-span-2`} />
              <input name="period" type="month" defaultValue={project.period} className={smallInputClass} title="Periode berjalan — update tiap bulan begitu paket di-roll" />
              <select name="stage" defaultValue={project.stage ?? "planning"} className={smallInputClass}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
              <input name="startDate" type="date" defaultValue={project.startDate} required className={smallInputClass} />
              <input name="endDate" type="date" defaultValue={project.endDate} required className={smallInputClass} />
            </div>

            {services.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted">
                  Layanan yang dicakup (bisa lebih dari satu — kelola katalognya di halaman Projects client ini):
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {services.map((s) => (
                    <label key={s.id} className="flex items-center gap-1.5 text-sm text-ink">
                      <input type="checkbox" name="services" value={s.label} defaultChecked={selectedServices.has(s.label)} className="h-3.5 w-3.5 rounded border-border accent-accent" />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <textarea
              name="description"
              defaultValue={project.description ?? ""}
              placeholder="Deskripsi project"
              rows={2}
              className={inputClass}
            />
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <input name="progressPct" type="number" min={0} max={100} defaultValue={project.progressPct ?? 0} className={`${smallInputClass} w-24`} />
                <span className="text-xs text-muted">% progress keseluruhan</span>
              </div>
              <button type="submit" className={buttonVariants({ variant: "primary" })}>
                Simpan
              </button>
            </div>
          </form>
        </Card>

        <Card padding="lg">
          <SectionHeading
            title="Tahapan / Steps"
            description="Timeline bernomor yang dilihat client di halaman Projects (Strategy, Content Production, dst) — update statusnya di sini kapan pun project berjalan."
          />

          {tasks.length === 0 ? (
            <EmptyState icon={ListChecks} title="Belum ada tahapan" description="Tambahkan step pertama lewat form di bawah." />
          ) : (
            <div className="mb-6 divide-y divide-border border-t border-border">
              {tasks.map((t) =>
                editTask === t.id ? (
                  <div key={t.id} className="bg-accent-soft/40 py-3">
                    <form action={updateTaskAction} className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                      <input type="hidden" name="id" value={t.id} />
                      <input name="name" defaultValue={t.name} required className={`${smallInputClass} sm:col-span-2`} />
                      <select name="status" defaultValue={t.status} className={smallInputClass}>
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting">Waiting</option>
                        <option value="done">Done</option>
                      </select>
                      <input name="progressPct" type="number" min={0} max={100} defaultValue={t.progressPct} placeholder="% progress" className={smallInputClass} />
                      <input name="owner" defaultValue={t.owner} placeholder="Owner/PIC" className={smallInputClass} />
                      <input name="dueDate" type="date" defaultValue={t.dueDate} className={smallInputClass} />
                      <input name="blocker" defaultValue={t.blocker ?? ""} placeholder="Blocker (opsional)" className={`${smallInputClass} sm:col-span-5`} />
                      <div className="flex gap-2">
                        <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                          Save
                        </button>
                        <Link href={path} className={buttonVariants({ variant: "outline", size: "sm" })}>
                          Cancel
                        </Link>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-ink">{t.name}</p>
                        <StatusBadge status={t.status} />
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="w-24">
                          <ProgressBar value={t.progressPct} />
                        </div>
                        <span className="font-data text-xs text-muted">{t.progressPct}%</span>
                      </div>
                      <p className="mt-1 font-data text-xs text-muted">
                        {t.owner && `${t.owner} · `}
                        {t.dueDate && `Due ${formatDateID(t.dueDate)}`}
                        {t.blocker && ` · ⚠ ${t.blocker}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Link href={`${path}?editTask=${t.id}`} className="text-muted hover:text-ink" aria-label="Edit">
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                      </Link>
                      <form action={deleteTaskAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </form>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          <form action={addTaskAction} className="grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-6">
            <input name="name" placeholder="Nama tahapan, mis. Strategy" required className={`${smallInputClass} sm:col-span-2`} />
            <select name="status" defaultValue="not_started" className={smallInputClass}>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="done">Done</option>
            </select>
            <input name="progressPct" type="number" min={0} max={100} defaultValue={0} placeholder="% progress" className={smallInputClass} />
            <input name="owner" placeholder="Owner/PIC" className={smallInputClass} />
            <input name="dueDate" type="date" className={smallInputClass} />
            <input name="blocker" placeholder="Blocker (opsional)" className={`${smallInputClass} sm:col-span-5`} />
            <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} /> Add
            </button>
          </form>
        </Card>

        <Card padding="lg">
          <SectionHeading
            title="Team"
            description="Account Manager & Creative yang ditugaskan ke project ini. Validasi role dilakukan di database."
          />
          {DEMO_MODE ? (
            <p className="text-xs text-muted">Team assignment butuh Supabase live untuk data user & role sungguhan.</p>
          ) : (
            <>
              {team.length === 0 ? (
                <p className="mb-4 text-xs text-muted">Belum ada team member yang ditugaskan.</p>
              ) : (
                <div className="mb-4 divide-y divide-border border-t border-border">
                  {team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-ink">{member.fullName || "(tanpa nama)"}</p>
                        <p className="font-data text-xs text-muted">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={member.role} />
                        <form action={unassignAction}>
                          <input type="hidden" name="userId" value={member.id} />
                          <button type="submit" className="font-data text-xs font-semibold text-danger hover:underline">
                            Cabut
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {availableCandidates.length === 0 ? (
                <p className="text-xs text-muted">Tidak ada kandidat lain yang tersedia untuk di-assign.</p>
              ) : (
                <form action={assignAction} className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  <select name="userId" required className={smallInputClass}>
                    <option value="">Pilih Account Manager / Creative…</option>
                    {availableCandidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName || c.email} ({c.role})
                      </option>
                    ))}
                  </select>
                  <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                    Assign
                  </button>
                </form>
              )}
            </>
          )}
        </Card>

        <Card padding="lg">
          <SectionHeading title="Activity" />
          <EmptyState
            icon={ActivityIcon}
            title="Belum ada activity log"
            description="Riwayat aktivitas per-project direncanakan untuk fase berikutnya."
          />
        </Card>
      </div>
    </div>
  );
}
