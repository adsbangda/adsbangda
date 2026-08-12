import Link from "next/link";
import { Plus, ArrowRight, Building2, Search } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { buttonVariants } from "@/components/dashboard/button";
import { DemoModeBanner } from "@/components/admin/demo-banner";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { adminListClientsOverview } from "@/lib/admin-data";
import { formatDateID } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "active", label: "Active" },
  { value: "onboarding", label: "Onboarding" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const allClients = await adminListClientsOverview();

  const clients = allClients.filter((c) => {
    const matchesQuery = q ? c.name.toLowerCase().includes(q.toLowerCase()) || c.industry.toLowerCase().includes(q.toLowerCase()) : true;
    const matchesStatus = status ? c.status === status : true;
    return matchesQuery && matchesStatus;
  });

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

        <form className="mb-5 flex flex-wrap items-center gap-2" action="/admin/clients">
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
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Filter
          </button>
          {(q || status) && (
            <Link href="/admin/clients" className="font-data text-xs text-muted hover:text-ink hover:underline">
              Reset
            </Link>
          )}
        </form>

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
            icon={Search}
            title="Tidak ada client yang cocok"
            description="Coba ubah kata kunci pencarian atau filter status."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => (
              <Link key={client.id} href={`/admin/clients/${client.id}`}>
                <Card interactive className="h-full">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                      {client.name.slice(0, 2).toUpperCase()}
                    </span>
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

                  <span className="mt-4 inline-flex items-center gap-1 font-data text-xs font-semibold text-accent">
                    Kelola <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
