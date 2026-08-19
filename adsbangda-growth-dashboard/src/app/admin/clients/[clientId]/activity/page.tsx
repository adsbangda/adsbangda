import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Trash2, Plus, CheckCircle2, Circle, Pencil, ListChecks } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/dashboard/button";
import { adminListActivity, adminCreateActivity, adminUpdateActivity, adminDeleteActivity } from "@/lib/admin-data";
import { formatDateID } from "@/lib/utils";
import { FormattedNumberInput } from "@/components/dashboard/formatted-number-input";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";

function todayInputValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/** `<input type="date">` cuma kasih "YYYY-MM-DD" — dijadiin ISO datetime jam 12 siang UTC (bukan tengah malam) biar tidak gampang "geser" ke tanggal sebelumnya kalau dibaca dari timezone barat. */
function dateInputToISO(dateStr: string): string {
  return `${dateStr}T12:00:00.000Z`;
}

/** Kebalikan dateInputToISO — buat isi ulang `<input type="date">` pas Edit. */
function isoToDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

export default async function AdminClientActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { clientId } = await params;
  const { edit } = await searchParams;
  const path = `/admin/clients/${clientId}/activity`;
  const entries = await adminListActivity(clientId);

  async function addActivity(formData: FormData) {
    "use server";
    await adminCreateActivity(clientId, {
      occurredAt: dateInputToISO(String(formData.get("date") || todayInputValue())),
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      done: formData.get("done") === "on",
      thumbnailCount: Number(formData.get("thumbnailCount") ?? 0) || undefined,
    });
    revalidatePath(path);
    revalidatePath(`/admin/clients/${clientId}`);
  }

  async function updateActivityAction(formData: FormData) {
    "use server";
    await adminUpdateActivity(String(formData.get("id")), {
      occurredAt: dateInputToISO(String(formData.get("date"))),
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      done: formData.get("done") === "on",
      thumbnailCount: Number(formData.get("thumbnailCount") ?? 0) || null,
    });
    revalidatePath(path);
    revalidatePath(`/admin/clients/${clientId}`);
  }

  async function deleteActivityAction(formData: FormData) {
    "use server";
    await adminDeleteActivity(String(formData.get("id")));
    revalidatePath(path);
    revalidatePath(`/admin/clients/${clientId}`);
  }

  return (
    <div className="animate-rise space-y-6 p-5 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-base font-bold text-ink">What AdsBangda Did</h2>
        <p className="mt-1 text-sm text-muted">
          Log kerjaan tim Adsbangda buat client ini — muncul di Overview client sebagai work log harian (&ldquo;Hari ini&rdquo; / &ldquo;Kemarin&rdquo; /
          tanggal, dihitung otomatis dari tanggal yang kamu isi, bukan diketik manual). Centang &ldquo;Selesai&rdquo; kalau item ini sudah beres
          dikerjakan (belum selesai tetap muncul, cuma beda ikon).
        </p>
      </div>

      <Card padding="lg">
        <SectionHeading title="Tambah Aktivitas" />
        <form action={addActivity} className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input name="date" type="date" defaultValue={todayInputValue()} required className={inputClass} />
          <input name="title" placeholder="Judul (mis. Optimasi Meta Ads Campaign)" required className={`${inputClass} lg:col-span-2`} />
          <FormattedNumberInput name="thumbnailCount" placeholder="Jumlah thumbnail (opsional)" className={inputClass} />
          <textarea name="description" placeholder="Deskripsi singkat" rows={2} className={`${inputClass} sm:col-span-2 lg:col-span-3`} />
          <label className="flex items-center gap-1.5 text-xs text-muted">
            <input type="checkbox" name="done" defaultChecked className="h-3.5 w-3.5 rounded border-border" />
            Sudah selesai
          </label>
          <button type="submit" className={buttonVariants({ variant: "primary", size: "sm", className: "sm:col-span-2 lg:col-span-4 justify-center" })}>
            <Plus className="h-3.5 w-3.5" /> Tambah ke Log
          </button>
        </form>
      </Card>

      <Card padding="lg">
        <SectionHeading title="Riwayat Aktivitas" description="Urut dari terbaru. Klik Edit untuk perbaiki data." />
        {entries.length === 0 ? (
          <EmptyState icon={ListChecks} title="Belum ada aktivitas" description="Tambahkan lewat form di atas — akan langsung muncul di Overview client." />
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {entries.map((a) =>
              edit === a.id ? (
                <div key={a.id} className="bg-accent-soft/40 py-3">
                  <form action={updateActivityAction} className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <input type="hidden" name="id" value={a.id} />
                    <input name="date" type="date" defaultValue={isoToDateInputValue(a.occurredAt)} required className={inputClass} />
                    <input name="title" defaultValue={a.title} required className={`${inputClass} lg:col-span-2`} />
                    <FormattedNumberInput name="thumbnailCount" defaultValue={a.thumbnailCount} placeholder="Jumlah thumbnail" className={inputClass} />
                    <textarea name="description" defaultValue={a.description} rows={2} className={`${inputClass} sm:col-span-2 lg:col-span-3`} />
                    <label className="flex items-center gap-1.5 text-xs text-muted">
                      <input type="checkbox" name="done" defaultChecked={a.done} className="h-3.5 w-3.5 rounded border-border" />
                      Sudah selesai
                    </label>
                    <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
                      <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                        Save
                      </button>
                      <Link href={path} className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Cancel
                      </Link>
                    </div>
                  </form>
                </div>
              ) : (
                <div key={a.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-start gap-2.5">
                    {a.done ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={1.75} />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
                    )}
                    <div className="min-w-0">
                      <p className="font-data text-[11px] font-semibold uppercase tracking-wider text-accent">{formatDateID(a.occurredAt)}</p>
                      <p className="text-sm font-medium text-ink">{a.title}</p>
                      {a.description && <p className="mt-0.5 text-xs text-muted">{a.description}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`${path}?edit=${a.id}`} className="text-muted hover:text-ink" aria-label="Edit">
                      <Pencil className="h-4 w-4" strokeWidth={1.75} />
                    </Link>
                    <form action={deleteActivityAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </form>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
