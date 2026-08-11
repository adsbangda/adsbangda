import Link from "next/link";
import { Plus, ArrowRight, Building2 } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { buttonVariants } from "@/components/dashboard/button";
import { DemoModeBanner } from "@/components/admin/demo-banner";
import { adminListClients } from "@/lib/admin-data";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default async function AdminDashboardPage() {
  const clients = await adminListClients();

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
            Tambah Client
          </Link>
        </div>

        {clients.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <Building2 className="h-8 w-8 text-muted" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-ink">Belum ada client</p>
            <p className="max-w-xs text-xs text-muted">Tambahkan client pertama untuk mulai mengelola Client Portal mereka.</p>
          </Card>
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
