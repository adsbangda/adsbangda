import { revalidatePath } from "next/cache";
import { Users } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { buttonVariants } from "@/components/dashboard/button";
import { DEMO_MODE } from "@/lib/data";
import { adminListClientTeam, adminListAccountManagerCandidates, adminAssignToClient, adminUnassignFromClient } from "@/lib/admin-data";

const inputClass = "rounded-[var(--radius-md)] border border-border px-3 py-2 text-xs text-ink outline-none focus:border-ink";

export default async function AdminClientTeamPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const path = `/admin/clients/${clientId}/team`;

  if (DEMO_MODE) {
    return (
      <div className="p-5 lg:p-8">
        <Card>
          <EmptyState
            icon={Users}
            title="Butuh Supabase untuk Team Assignment"
            description="Assign Account Manager hanya aktif setelah Supabase Auth tersambung, karena butuh data user & role sungguhan."
          />
        </Card>
      </div>
    );
  }

  const [team, candidates] = await Promise.all([adminListClientTeam(clientId), adminListAccountManagerCandidates()]);
  const assignedIds = new Set(team.map((t) => t.id));
  const availableCandidates = candidates.filter((c) => !assignedIds.has(c.id));

  async function assignAction(formData: FormData) {
    "use server";
    const userId = String(formData.get("userId") ?? "");
    if (!userId) return;
    await adminAssignToClient(clientId, userId);
    revalidatePath(path);
  }

  async function unassignAction(formData: FormData) {
    "use server";
    await adminUnassignFromClient(clientId, String(formData.get("userId")));
    revalidatePath(path);
  }

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <Card padding="lg">
        <SectionHeading
          title="Account Manager"
          description="Bertanggung jawab atas relationship dengan client ini. Hanya user dengan role Account Manager (atau Admin/Super Admin) yang bisa dipilih — divalidasi di database, bukan cuma dropdown."
        />

        {team.length === 0 ? (
          <p className="mb-4 text-xs text-muted">Belum ada Account Manager yang di-assign.</p>
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
          <p className="text-xs text-muted">
            {candidates.length === 0
              ? "Belum ada user dengan role Account Manager/Admin/Super Admin. Buat lewat halaman Team & Akses dulu."
              : "Semua kandidat Account Manager sudah di-assign ke client ini."}
          </p>
        ) : (
          <form action={assignAction} className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <select name="userId" required className={inputClass}>
              <option value="">Pilih Account Manager…</option>
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
      </Card>

      <Card padding="lg">
        <SectionHeading
          title="Creative"
          description="Creative di-assign per-project (bukan per-client), karena satu client bisa punya beberapa project dengan Creative berbeda. Buka salah satu project di tab Projects untuk assign Creative."
        />
      </Card>
    </div>
  );
}
