import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Plus, ArrowRight, Building2, Search, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { buttonVariants } from "@/components/dashboard/button";
import { DemoModeBanner } from "@/components/admin/demo-banner";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ClientAvatar } from "@/components/admin/client-avatar";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { PillTabs } from "@/components/admin/pill-tabs";
import { adminListClientsOverview, adminUpdateClient, adminDeleteClient } from "@/lib/admin-data";
import { formatDateID } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "active", label: "Active" },
  { value: "onboarding", label: "Onboarding" },
  { value: "paused", label: "Paused" },
];

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; view?: string }>;
}) {
  const { q = "", status = "", view = "active" } = await searchParams;
  const isArchivedView = view === "archived";
  const allClients = await adminListClientsOverview();

  // Archived SENGAJA dipisah jadi tab sendiri, bukan salah satu pilihan di
  // dropdown status — supaya client yang sudah "selesai kerja sama untuk
  // sekarang" tidak nyampur di grid utama sama yang masih berjalan aktif.
  const activeClients = allClients.filter((c) => c.status !== "archived");
  const archivedClients = allClients.filter((c) => c.status === "archived");
  const baseList = isArchivedView ? archivedClients : activeClients;

  const clients = baseList.filter((c) => {
    const matchesQuery = q ? c.name.toLowerCase().includes(q.toLowerCase()) || c.industry.toLowerCase().includes(q.toLowerCase()) : true;
    const matchesStatus = !isArchivedView && status ? c.status === status : true;
    return matchesQuery && matchesStatus;
  });

  async function toggleArchiveAction(formData: FormData) {
    "use server";
    const clientId = String(formData.get("clientId"));
    const nextStatus = String(formData.get("nextStatus")) as "archived" | "active";
    await adminUpdateClient(clientId, { status: nextStatus });
    revalidatePath("/admin/clients");
  }

  async function deleteClientAction(formData: FormData) {
    "use server";
    await adminDeleteClient(String(formData.get("clientId")));
    revalidatePath("/admin/clients");
  }

  return (
    <div className="min-h-screen">
      <DemoModeBanner />
      <div className="p-5 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Clients</h1>
            <p className="mt-1 text-sm text-muted">Kelola semua client dan konten Client Portal mereka.</p>
          </div>
          <Link href="/admin/clients/new" className={buttonVariants({ variant: "primary" })}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Add Client
          </Link>
        </div>

        <div className="mb-5 max-w-sm">
          <PillTabs
            items={[
              { href: "/admin/clients?view=active", label: `Aktif · ${activeClients.length}`, active: !isArchivedView },
              { href: "/admin/clients?view=archived", label: `Archived · ${archivedClients.length}`, active: isArchivedView },
            ]}
          />
        </div>

        <form className="mb-5 flex flex-wrap items-center gap-2" action="/admin/clients">
          <input type="hidden" name="view" value={view} />
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" strokeWidth={1.75} />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Cari nama client atau industri…"
              className="w-full rounded-[var(--radius-md)] border border-border py-2 pl-8 pr-3 text-xs text-ink outline-none focus:border-ink"
            />
          </div>
          {!isArchivedView && (
            <select
              name="status"
              defaultValue={status}
              className="rounded-[var(--radius-md)] border border-border px-3 py-2 text-xs text-ink outline-none focus:border-ink"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          )}
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Filter
          </button>
          {(q || status) && (
            <Link href={`/admin/clients?view=${view}`} className="font-data text-xs text-muted hover:text-ink hover:underline">
              Reset
            </Link>
          )}
        </form>

        {isArchivedView && archivedClients.length > 0 && (
          <p className="mb-4 text-xs text-muted">
            Client di sini tidak muncul di daftar Aktif dan tidak dihitung di laporan berjalan — datanya tetap tersimpan utuh, tinggal klik{" "}
            <ArchiveRestore className="inline h-3 w-3" strokeWidth={2} /> kapan pun kalau mereka balik lagi kerja sama.
          </p>
        )}

        {allClients.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <Building2 className="h-8 w-8 text-muted" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-ink">Belum ada client</p>
            <p className="max-w-xs text-xs text-muted">Tambahkan client pertama untuk mulai mengelola Client Portal mereka.</p>
            <Link href="/admin/clients/new" className={buttonVariants({ variant: "primary", size: "sm" })}>
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Add Client
            </Link>
          </Card>
        ) : clients.length === 0 ? (
          <EmptyState
            icon={isArchivedView ? Archive : Search}
            title={isArchivedView ? "Belum ada client yang diarsipkan" : "Tidak ada client yang cocok"}
            description={isArchivedView ? "Client yang kamu archive dari tab Aktif akan muncul di sini." : "Coba ubah kata kunci pencarian atau filter status."}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => (
              <Card key={client.id} className="flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <ClientAvatar name={client.name} logoUrl={client.logoUrl} />
                  <StatusBadge status={client.status} />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink">{client.name}</p>
                <p className="text-xs text-muted">{client.industry}</p>

                <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted">
                  <div className="flex items-center justify-between">
                    <span>Services</span>
                    <span className="text-right font-medium text-ink">{client.services.length > 0 ? client.services.join(" · ") : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Overall Progress</span>
                    <span className="font-data text-base font-bold text-accent">{client.overallProgress != null ? `${client.overallProgress}%` : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Account Manager</span>
                    <span className="font-medium text-ink">{client.accountManagerName ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Activity</span>
                    <span className="font-data text-ink">{client.lastActivity ? formatDateID(client.lastActivity) : "—"}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-1 items-end justify-between gap-2 border-t border-border pt-3">
                  <Link href={`/admin/clients/${client.id}`} className="inline-flex items-center gap-1 font-data text-xs font-semibold text-accent hover:underline">
                    Kelola <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <div className="flex items-center gap-1">
                    <form action={toggleArchiveAction}>
                      <input type="hidden" name="clientId" value={client.id} />
                      <input type="hidden" name="nextStatus" value={client.status === "archived" ? "active" : "archived"} />
                      <button
                        type="submit"
                        title={client.status === "archived" ? "Aktifkan lagi" : "Archive client ini"}
                        className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
                      >
                        {client.status === "archived" ? <ArchiveRestore className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Archive className="h-3.5 w-3.5" strokeWidth={1.75} />}
                      </button>
                    </form>
                    {client.status === "archived" && (
                      <form action={deleteClientAction}>
                        <input type="hidden" name="clientId" value={client.id} />
                        <ConfirmDeleteButton
                          confirmMessage={`Hapus "${client.name}" secara PERMANEN? Semua data — project, content, performance, report, file — ikut terhapus dan TIDAK BISA dikembalikan. Kalau cuma mau berhenti kerja sama sementara, pakai Archive saja.`}
                          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        </ConfirmDeleteButton>
                      </form>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
