import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Activity as ActivityIcon } from "lucide-react";
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
} from "@/lib/admin-data";
import { formatDateID } from "@/lib/utils";
import type { Project } from "@/lib/types";

const inputClass = "w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink";
const smallInputClass = "rounded-[var(--radius-md)] border border-border px-3 py-2 text-xs text-ink outline-none focus:border-ink";

const PROJECT_TYPES = [
  { value: "social_media", label: "Social Media" },
  { value: "meta_ads", label: "Meta Ads" },
  { value: "website", label: "Website" },
  { value: "branding", label: "Branding" },
  { value: "other", label: "Other" },
];

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await adminGetProject(projectId);
  if (!project) notFound();

  const client = await adminGetClient(project.clientId);
  const path = `/admin/projects/${projectId}`;

  async function updateProjectAction(formData: FormData) {
    "use server";
    await adminUpdateProject(projectId, {
      name: String(formData.get("name") ?? "").trim(),
      type: String(formData.get("type") ?? "other"),
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
          <form action={updateProjectAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <input name="name" defaultValue={project.name} required className={`${inputClass} lg:col-span-2`} />
            <select name="type" defaultValue={project.type ?? "other"} className={smallInputClass}>
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select name="stage" defaultValue={project.stage ?? "planning"} className={smallInputClass}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            <input name="startDate" type="date" defaultValue={project.startDate} required className={smallInputClass} />
            <input name="endDate" type="date" defaultValue={project.endDate} required className={smallInputClass} />
            <textarea
              name="description"
              defaultValue={project.description ?? ""}
              placeholder="Deskripsi project"
              rows={2}
              className={`${inputClass} sm:col-span-2 lg:col-span-4`}
            />
            <div className="flex items-center gap-2">
              <input name="progressPct" type="number" min={0} max={100} defaultValue={project.progressPct ?? 0} className={smallInputClass} />
              <span className="text-xs text-muted">% progress</span>
            </div>
            <button type="submit" className={buttonVariants({ variant: "primary", className: "justify-center" })}>
              Simpan
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
