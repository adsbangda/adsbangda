import { revalidatePath } from "next/cache";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { buttonVariants } from "@/components/dashboard/button";
import { DemoModeBanner } from "@/components/admin/demo-banner";
import { EmptyState } from "@/components/dashboard/empty-state";
import { DEMO_MODE } from "@/lib/data";
import { adminListUsers, adminListClientAccess, adminSetRole, adminAssignClient, adminUnassignClient, adminListClients } from "@/lib/admin-data";
import { Users } from "lucide-react";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";

export default async function TeamPage() {
  if (DEMO_MODE) {
    return (
      <div className="min-h-screen">
        <DemoModeBanner />
        <div className="p-5 lg:p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Team & Akses</h1>
          <Card className="mt-6">
            <EmptyState
              icon={Users}
              title="Butuh Supabase untuk manajemen user"
              description="Manajemen role & akses client hanya aktif setelah Supabase Auth tersambung, karena butuh sistem login sungguhan."
            />
          </Card>
        </div>
      </div>
    );
  }

  const [users, access, clients] = await Promise.all([adminListUsers(), adminListClientAccess(), adminListClients()]);

  async function setRoleAction(formData: FormData) {
    "use server";
    await adminSetRole(String(formData.get("userId")), formData.get("role") as "client" | "admin");
    revalidatePath("/admin/team");
  }

  async function assignAction(formData: FormData) {
    "use server";
    await adminAssignClient(String(formData.get("userId")), String(formData.get("clientId")));
    revalidatePath("/admin/team");
  }

  async function unassignAction(formData: FormData) {
    "use server";
    await adminUnassignClient(String(formData.get("userId")), String(formData.get("clientId")));
    revalidatePath("/admin/team");
  }

  return (
    <div className="min-h-screen">
      <DemoModeBanner />
      <div className="space-y-8 p-5 lg:p-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Team & Akses</h1>
          <p className="mt-1 text-sm text-muted">Kelola role user dan client mana saja yang bisa mereka lihat.</p>
        </div>

        <Card padding="lg">
          <SectionHeading title="Semua User" description="User baru mendaftar sendiri lewat halaman /login (tab Daftar) dengan role client secara default." />
          <div className="divide-y divide-border border-t border-border">
            {users.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{u.fullName || "(tanpa nama)"}</p>
                  <p className="font-data text-xs text-muted">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={u.role} />
                  <form action={setRoleAction} className="flex items-center gap-1.5">
                    <input type="hidden" name="userId" value={u.id} />
                    <select name="role" defaultValue={u.role} className={inputClass}>
                      <option value="client">client</option>
                      <option value="admin">admin</option>
                    </select>
                    <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Ubah
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <SectionHeading title="Akses Client" description="Hubungkan user (role client) ke satu atau lebih client supaya mereka bisa login ke Client Portal-nya." />

          <div className="divide-y divide-border border-t border-border">
            {access.map((row) => (
              <div key={`${row.userId}-${row.clientId}`} className="flex items-center justify-between gap-3 py-3">
                <p className="text-xs text-ink">
                  <span className="font-medium">{row.email}</span> → {row.clientName}
                </p>
                <form action={unassignAction}>
                  <input type="hidden" name="userId" value={row.userId} />
                  <input type="hidden" name="clientId" value={row.clientId} />
                  <button type="submit" className="font-data text-xs font-semibold text-danger hover:underline">
                    Cabut Akses
                  </button>
                </form>
              </div>
            ))}
            {access.length === 0 && <p className="py-3 text-xs text-muted">Belum ada user yang terhubung ke client manapun.</p>}
          </div>

          <form action={assignAction} className="mt-4 grid grid-cols-1 gap-2 border-t border-border pt-4 sm:grid-cols-3">
            <select name="userId" required className={inputClass}>
              <option value="">Pilih user…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>
            <select name="clientId" required className={inputClass}>
              <option value="">Pilih client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
              Hubungkan
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
