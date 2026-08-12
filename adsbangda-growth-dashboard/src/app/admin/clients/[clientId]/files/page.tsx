import { revalidatePath } from "next/cache";
import { Trash2, Plus, Folder } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/dashboard/button";
import { adminListFiles, adminCreateFile, adminDeleteFile } from "@/lib/admin-data";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";
function cn2() {
  return "sm:col-span-2 " + inputClass;
}

export default async function AdminClientFilesPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const path = `/admin/clients/${clientId}/files`;
  const files = await adminListFiles(clientId);

  async function addFile(formData: FormData) {
    "use server";
    await adminCreateFile(clientId, {
      name: String(formData.get("name")),
      category: String(formData.get("category") ?? ""),
      fileUrl: String(formData.get("fileUrl")),
      sizeLabel: String(formData.get("sizeLabel") ?? ""),
    });
    revalidatePath(path);
  }

  async function deleteFileAction(formData: FormData) {
    "use server";
    await adminDeleteFile(String(formData.get("id")));
    revalidatePath(path);
  }

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <p className="text-sm text-muted">File dan dokumen umum client — brand assets, brief, agreement, dan dokumen lainnya. Asset content utama tetap dikelola lewat tab Content.</p>

      <Card padding="lg">
        <SectionHeading title="Files" />
        {files.length === 0 ? (
          <EmptyState icon={Folder} title="Belum ada file" description="Upload file pertama lewat form di bawah." />
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{file.name}</p>
                  <p className="text-xs text-muted">
                    {file.category} · {file.sizeLabel}
                  </p>
                </div>
                <form action={deleteFileAction}>
                  <input type="hidden" name="id" value={file.id} />
                  <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
        <form action={addFile} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-5">
          <input name="name" placeholder="Nama file" required className={cn2()} />
          <input name="category" placeholder="Kategori (mis. Brand Assets)" className={inputClass} />
          <input name="fileUrl" placeholder="URL file" required className={cn2()} />
          <input name="sizeLabel" placeholder="480 KB" className={inputClass} />
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="h-3.5 w-3.5" /> Upload File
          </button>
        </form>
      </Card>
    </div>
  );
}
