import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Plus, Briefcase } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { buttonVariants } from "@/components/dashboard/button";
import { adminListProjectsByClient, adminCreateProject } from "@/lib/admin-data";
import { formatDateID } from "@/lib/utils";
import type { Project } from "@/lib/types";

const PROJECT_TYPES = [
  { value: "social_media", label: "Social Media" },
  { value: "meta_ads", label: "Meta Ads" },
  { value: "website", label: "Website" },
  { value: "branding", label: "Branding" },
  { value: "other", label: "Other" },
];

const inputClass = "w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink";

export default async function AdminClientProjectsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const projects = await adminListProjectsByClient(clientId);
  const path = `/admin/clients/${clientId}/projects`;

  async function createProjectAction(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;
    await adminCreateProject(clientId, {
      name,
      type: String(formData.get("type") ?? "other"),
      description: String(formData.get("description") ?? "").trim() || undefined,
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      stage: (String(formData.get("stage") ?? "planning") as NonNullable<Project["stage"]>),
    });
    revalidatePath(path);
  }

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <Card padding="lg">
        <SectionHeading title="Tambah Project Baru" description="Project baru muncul di daftar bawah begitu dibuat." />
        <form action={createProjectAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input name="name" placeholder="Nama project" required className={`${inputClass} lg:col-span-2`} />
          <select name="type" defaultValue="social_media" className={inputClass}>
            {PROJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select name="stage" defaultValue="planning" className={inputClass}>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
          <input name="startDate" type="date" required className={inputClass} />
          <input name="endDate" type="date" required className={inputClass} />
          <textarea
            name="description"
            placeholder="Deskripsi (opsional)"
            rows={2}
            className={`${inputClass} sm:col-span-2 lg:col-span-5`}
          />
          <button type="submit" className={buttonVariants({ variant: "primary", className: "justify-center" })}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Add Project
          </button>
        </form>
      </Card>

      <Card padding="lg">
        <SectionHeading title="Semua Project" description={`${projects.length} project untuk client ini.`} />
        {projects.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No Projects Yet"
            description="Client ini belum memiliki project. Buat project pertama lewat form di atas."
          />
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/admin/projects/${p.id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-4 transition-colors hover:bg-black/[0.02]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{p.name}</p>
                  <p className="font-data text-xs text-muted">
                    {PROJECT_TYPES.find((t) => t.value === p.type)?.label ?? p.type} · {formatDateID(p.startDate)} — {formatDateID(p.endDate)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-28">
                    <ProgressBar value={p.progressPct ?? 0} />
                  </div>
                  <span className="font-data text-xs font-semibold text-ink">{p.progressPct ?? 0}%</span>
                  <StatusBadge status={p.stage ?? "planning"} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
