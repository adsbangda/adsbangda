import { revalidatePath } from "next/cache";
import { Trash2, Plus, Target } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { buttonVariants } from "@/components/dashboard/button";
import { adminListContent, adminCreateContent, adminDeleteContent } from "@/lib/admin-data";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";
function cn2() {
  return "sm:col-span-2 " + inputClass;
}

export default async function AdminClientContentPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const path = `/admin/clients/${clientId}/content`;
  const content = await adminListContent(clientId);

  async function addContent(formData: FormData) {
    "use server";
    await adminCreateContent(clientId, {
      title: String(formData.get("title")),
      plannedDate: String(formData.get("plannedDate")),
      status: String(formData.get("status")) as never,
      platform: String(formData.get("platform")) as never,
      type: String(formData.get("type")) as never,
    });
    revalidatePath(path);
  }

  async function deleteContentAction(formData: FormData) {
    "use server";
    await adminDeleteContent(String(formData.get("id")));
    revalidatePath(path);
  }

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <div>
        <p className="text-sm text-muted">Rumah untuk semua pekerjaan content client ini — target, list, dan jadwal.</p>
      </div>

      {/* CONTENT PLAN / TARGET — placeholder struktur, belum ada workflow penuh (Phase 3A: IA dulu). */}
      <Card padding="lg">
        <SectionHeading title="Content Plan / Target" description="Target jumlah & jenis content per periode. Detail workflow-nya menyusul di fase berikutnya." />
        <EmptyState
          icon={Target}
          title="Belum ada target content"
          description="Setelah modul Goals aktif, target content bulanan client ini bisa dipantau progresnya langsung dari tab Goals."
        />
      </Card>

      {/* CONTENT LIST & CALENDAR — fungsional penuh, dipindah tidak berubah dari halaman lama. */}
      <Card padding="lg">
        <SectionHeading title="Content List & Calendar" description="Semua content yang direncanakan/berjalan untuk client ini." />

        {content.length === 0 ? (
          <EmptyState title="Belum ada content" description="Tambahkan content pertama lewat form di bawah." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted">
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Platform</th>
                  <th className="pb-2 font-medium">Format</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {content.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-3 font-medium text-ink">{item.title}</td>
                    <td className="py-3 pr-3 font-data text-xs capitalize text-muted">{item.platform}</td>
                    <td className="py-3 pr-3 font-data text-xs capitalize text-muted">{item.type}</td>
                    <td className="py-3 pr-3 font-data text-xs text-muted">{item.plannedDate}</td>
                    <td className="py-3 pr-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3 text-right">
                      <form action={deleteContentAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form action={addContent} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-6">
          <input name="title" placeholder="Judul konten" required className={cn2()} />
          <input name="plannedDate" type="date" required className={inputClass} />
          <select name="platform" className={inputClass}>
            <option value="instagram">instagram</option>
            <option value="facebook">facebook</option>
            <option value="tiktok">tiktok</option>
            <option value="website">website</option>
          </select>
          <select name="type" className={inputClass}>
            <option value="post">post</option>
            <option value="carousel">carousel</option>
            <option value="reel">reel</option>
            <option value="story">story</option>
            <option value="article">article</option>
          </select>
          <select name="status" className={inputClass}>
            <option value="draft">draft</option>
            <option value="in_production">in_production</option>
            <option value="waiting_approval">waiting_approval</option>
            <option value="approved">approved</option>
            <option value="scheduled">scheduled</option>
            <option value="published">published</option>
          </select>
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="h-3.5 w-3.5" /> Add Content
          </button>
        </form>
      </Card>
    </div>
  );
}
