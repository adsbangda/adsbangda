import { revalidatePath } from "next/cache";
import { Trash2, Plus, Folder, Image, FileText, FileBox } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/dashboard/button";
import { adminListFiles, adminCreateFile, adminDeleteFile } from "@/lib/admin-data";
import type { FileEntry } from "@/lib/types";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";
function cn2() {
  return "sm:col-span-2 " + inputClass;
}

const CATEGORIES = [
  { key: "Content Assets", icon: Image, description: "Asset content utama tetap dikelola lewat tab Social Media — ini untuk asset pendukung umum (logo, template, dsb)." },
  { key: "Reports", icon: FileText, description: "Kalau report resmi bulanan, lebih baik lewat tab Reports — ini untuk lampiran pendukung." },
  { key: "Client Documents", icon: FileBox, description: "Brief, agreement, brand guideline, dan dokumen resmi lainnya." },
  { key: "Other", icon: Folder, description: "File yang tidak masuk kategori di atas." },
] as const;

export default async function AdminClientFilesPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const path = `/admin/clients/${clientId}/files`;
  const files = await adminListFiles(clientId);

  const filesByCategory = new Map<string, FileEntry[]>();
  for (const cat of CATEGORIES) filesByCategory.set(cat.key, []);
  for (const file of files) {
    const key = CATEGORIES.some((c) => c.key === file.category) ? file.category : "Other";
    filesByCategory.get(key)!.push(file);
  }

  async function addFile(formData: FormData) {
    "use server";
    await adminCreateFile(clientId, {
      name: String(formData.get("name")),
      category: String(formData.get("category") ?? "Other"),
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
    <div className="animate-rise space-y-6 p-5 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-base font-bold text-ink">What documents/assets are available?</h2>
        <p className="mt-1 text-sm text-muted">Setiap file punya kategori yang jelas — admin selalu tahu file ini masuk ke mana.</p>
      </div>

      <Card padding="lg">
        <SectionHeading title="Upload File" />
        <form action={addFile} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <input name="name" placeholder="Nama file" required className={cn2()} />
          <select name="category" defaultValue="Other" className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.key}
              </option>
            ))}
          </select>
          <input name="fileUrl" placeholder="URL file" required className={cn2()} />
          <input name="sizeLabel" placeholder="480 KB" className={inputClass} />
          <button type="submit" className={buttonVariants({ variant: "primary", size: "sm", className: "sm:col-span-5 justify-center" })}>
            <Plus className="h-3.5 w-3.5" /> Upload File
          </button>
        </form>
      </Card>

      {CATEGORIES.map((cat) => {
        const items = filesByCategory.get(cat.key) ?? [];
        return (
          <Card key={cat.key} padding="lg">
            <div className="mb-4 flex items-center gap-2">
              <cat.icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
              <div>
                <h2 className="text-base font-bold text-ink">{cat.key}</h2>
                <p className="mt-0.5 text-sm text-muted">{cat.description}</p>
              </div>
            </div>
            {items.length === 0 ? (
              <p className="text-xs text-muted">Belum ada file di kategori ini.</p>
            ) : (
              <div className="divide-y divide-border border-t border-border">
                {items.map((file) => (
                  <div key={file.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-ink hover:text-accent hover:underline">
                        {file.name}
                      </a>
                      <p className="font-data text-xs text-muted">{file.sizeLabel}</p>
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
          </Card>
        );
      })}

      {files.length === 0 && <EmptyState icon={Folder} title="Belum ada file" description="Upload file pertama lewat form di atas." />}
    </div>
  );
}
