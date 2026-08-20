import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Plus, Briefcase, X } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { buttonVariants } from "@/components/dashboard/button";
import { adminListProjectsByClient, adminCreateProject, adminListServices, adminCreateService, adminDeleteService } from "@/lib/admin-data";
import { formatDateID } from "@/lib/utils";
import type { Project } from "@/lib/types";

const inputClass = "w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink";

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminClientProjectsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const [projects, services] = await Promise.all([adminListProjectsByClient(clientId), adminListServices()]);
  const path = `/admin/clients/${clientId}/projects`;

  async function createProjectAction(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;
    await adminCreateProject(clientId, {
      name,
      services: formData.getAll("services").map(String),
      period: String(formData.get("period") ?? currentPeriod()),
      description: String(formData.get("description") ?? "").trim() || undefined,
      startDate: String(formData.get("startDate") ?? ""),
      endDate: String(formData.get("endDate") ?? ""),
      stage: (String(formData.get("stage") ?? "planning") as NonNullable<Project["stage"]>),
    });
    revalidatePath(path);
  }

  async function addServiceAction(formData: FormData) {
    "use server";
    const label = String(formData.get("label") ?? "").trim();
    if (!label) return;
    await adminCreateService(label);
    revalidatePath(path);
  }

  async function deleteServiceAction(formData: FormData) {
    "use server";
    await adminDeleteService(String(formData.get("id")));
    revalidatePath(path);
  }

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <Card padding="lg">
        <SectionHeading
          title="Katalog Layanan"
          description="Daftar layanan/paket agency — bebas ditambah/dihapus di sini kapan saja, dipakai sebagai pilihan cepat saat bikin project di bawah."
        />
        <div className="mb-4 flex flex-wrap gap-2">
          {services.length === 0 ? (
            <p className="text-xs text-muted">Belum ada layanan di katalog. Tambahkan lewat form di bawah.</p>
          ) : (
            services.map((s) => (
              <span key={s.id} className="flex items-center gap-1.5 rounded-full bg-black/[0.04] py-1 pl-3 pr-1.5 text-xs font-medium text-ink">
                {s.label}
                <form action={deleteServiceAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button type="submit" className="flex h-4 w-4 items-center justify-center rounded-full text-muted hover:bg-black/[0.08] hover:text-danger" aria-label={`Hapus ${s.label}`}>
                    <X className="h-3 w-3" strokeWidth={2} />
                  </button>
                </form>
              </span>
            ))
          )}
        </div>
        <form action={addServiceAction} className="flex flex-wrap gap-2 border-t border-border pt-4">
          <input name="label" placeholder="Nama layanan baru, mis. Copywriting" required className={`${inputClass} flex-1`} />
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} /> Tambah Layanan
          </button>
        </form>
      </Card>

      <Card padding="lg">
        <SectionHeading title="Tambah Project Baru" description="Satu project BISA mencakup lebih dari satu layanan sekaligus (dicentang semua yang relevan) — akan tampil digabung di Client Portal, bukan sebagai project terpisah-pisah." />
        <form action={createProjectAction} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <input name="name" placeholder="Nama project/paket" required className={`${inputClass} lg:col-span-2`} />
            <input name="period" type="month" defaultValue={currentPeriod()} required className={inputClass} title="Periode berjalan" />
            <select name="stage" defaultValue="planning" className={inputClass}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
            <input name="startDate" type="date" required className={inputClass} />
            <input name="endDate" type="date" required className={inputClass} />
          </div>

          {services.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted">Layanan yang dicakup:</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {services.map((s) => (
                  <label key={s.id} className="flex items-center gap-1.5 text-sm text-ink">
                    <input type="checkbox" name="services" value={s.label} className="h-3.5 w-3.5 rounded border-border accent-accent" />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <textarea name="description" placeholder="Deskripsi (opsional)" rows={2} className={inputClass} />

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
                    {p.services && p.services.length > 0 ? p.services.join(" & ") : "Belum ada layanan dipilih"}
                    {p.period && ` · ${p.period}`} · {formatDateID(p.startDate)} — {formatDateID(p.endDate)}
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
