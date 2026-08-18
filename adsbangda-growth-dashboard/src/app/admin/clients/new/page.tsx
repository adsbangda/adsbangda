import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/dashboard/card";
import { buttonVariants } from "@/components/dashboard/button";
import { adminCreateClient } from "@/lib/admin-data";
import type { Client } from "@/lib/types";

async function createClientAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const logoUrl = String(formData.get("logoUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "onboarding") as Client["status"];
  if (!name) return;

  const client = await adminCreateClient({ name, industry, status, website: website || undefined, description: description || undefined, logoUrl: logoUrl || undefined });
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${(client as { id: string }).id}`);
}

export default function NewClientPage() {
  return (
    <div className="min-h-screen p-5 lg:p-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Tambah Client Baru</h1>
      <p className="mt-1 text-sm text-muted">Client baru bisa langsung diisi Monthly Delivery, Content, dan lainnya setelah dibuat.</p>

      <Card className="mt-6 max-w-lg" padding="lg">
        <form action={createClientAction} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
              Nama Client
            </label>
            <input
              id="name"
              name="name"
              required
              placeholder="mis. Amati Coffee"
              className="w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="industry" className="mb-1.5 block text-sm font-medium text-ink">
              Industri
            </label>
            <input
              id="industry"
              name="industry"
              placeholder="mis. F&B — Coffee Shop"
              className="w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="website" className="mb-1.5 block text-sm font-medium text-ink">
              Website <span className="font-normal text-muted">(opsional)</span>
            </label>
            <input
              id="website"
              name="website"
              type="url"
              placeholder="https://amaticoffee.com"
              className="w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="logoUrl" className="mb-1.5 block text-sm font-medium text-ink">
              Logo URL <span className="font-normal text-muted">(opsional)</span>
            </label>
            <input
              id="logoUrl"
              name="logoUrl"
              type="url"
              placeholder="https://.../logo-client.png"
              className="w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
            <p className="mt-1 text-xs text-muted">Link gambar yang sudah di-hosting (Drive/CDN dsb) — belum ada upload file langsung.</p>
          </div>
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-ink">
              Deskripsi <span className="font-normal text-muted">(opsional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Catatan singkat soal client ini…"
              className="w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            />
          </div>
          <div>
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-ink">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="onboarding"
              className="w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            >
              <option value="onboarding">Onboarding</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <button type="submit" className={buttonVariants({ variant: "primary", className: "w-full justify-center py-2.5" })}>
            Buat Client
          </button>
        </form>
      </Card>
    </div>
  );
}
