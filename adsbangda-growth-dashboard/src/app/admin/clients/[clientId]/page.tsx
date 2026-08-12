import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Briefcase, Users, FileText, ArrowRight } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { buttonVariants } from "@/components/dashboard/button";
import { adminGetClient, adminUpdateClient, adminListProjectsByClient, adminListClientTeam, adminListContent } from "@/lib/admin-data";
import type { Client } from "@/lib/types";

const inputClass = "w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink";

export default async function AdminClientOverviewPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const client = await adminGetClient(clientId);
  if (!client) return null;

  const path = `/admin/clients/${clientId}`;
  const currentStatus = client.status;

  async function updateClientAction(formData: FormData) {
    "use server";
    await adminUpdateClient(clientId, {
      name: String(formData.get("name") ?? "").trim(),
      industry: String(formData.get("industry") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      status: String(formData.get("status") ?? currentStatus) as Client["status"],
    });
    revalidatePath(path);
  }

  const [projects, team, content] = await Promise.all([
    adminListProjectsByClient(clientId),
    adminListClientTeam(clientId),
    adminListContent(clientId),
  ]);

  const activeProjects = projects.filter((p) => p.stage === "active");

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <Card padding="lg">
        <SectionHeading title="Client Information" description="Edit detail client — status Archived menyembunyikan client ini dari daftar aktif tanpa menghapus datanya." />
        <form action={updateClientAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input name="name" defaultValue={client.name} required placeholder="Nama client" className={inputClass} />
          <input name="industry" defaultValue={client.industry} placeholder="Industri" className={inputClass} />
          <input name="website" type="url" defaultValue={client.website ?? ""} placeholder="Website (opsional)" className={inputClass} />
          <select name="status" defaultValue={client.status} className={inputClass}>
            <option value="onboarding">Onboarding</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
          <textarea
            name="description"
            defaultValue={client.description ?? ""}
            placeholder="Deskripsi (opsional)"
            rows={2}
            className={`${inputClass} sm:col-span-2 lg:col-span-3`}
          />
          <button type="submit" className={buttonVariants({ variant: "primary", className: "justify-center" })}>
            Simpan
          </button>
        </form>
      </Card>


      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Briefcase className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-data text-2xl font-bold text-ink">{activeProjects.length}</p>
            <p className="text-xs text-muted">Active Projects</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Users className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-data text-2xl font-bold text-ink">{team.length}</p>
            <p className="text-xs text-muted">Team Members</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <FileText className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-data text-2xl font-bold text-ink">{content.length}</p>
            <p className="text-xs text-muted">Content Items</p>
          </div>
        </Card>
      </div>

      <Card padding="lg">
        <SectionHeading
          title="Projects"
          description={activeProjects.length === 0 ? "Belum ada project aktif." : `${activeProjects.length} project sedang berjalan.`}
          action={
            <Link href={`/admin/clients/${clientId}/projects`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Lihat semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {projects.length === 0 ? (
          <p className="text-xs text-muted">Client ini belum memiliki project.</p>
        ) : (
          <div className="divide-y divide-border">
            {projects.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{p.name}</p>
                  <p className="font-data text-xs text-muted">{p.type}</p>
                </div>
                <span className="font-data text-xs font-semibold text-ink">{p.progressPct ?? 0}%</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card padding="lg">
        <SectionHeading
          title="Team"
          description={team.length === 0 ? "Belum ada team member yang ditugaskan." : undefined}
          action={
            <Link href={`/admin/clients/${clientId}/team`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Kelola Team <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {team.length === 0 ? (
          <p className="text-xs text-muted">Belum ada Account Manager yang di-assign ke client ini.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {team.map((member) => (
              <span key={member.id} className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                {member.fullName || member.email}
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
