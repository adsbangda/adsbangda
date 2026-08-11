import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/dashboard/button";
import { getCurrentClient, getFiles } from "@/lib/data";
import { Download, File } from "lucide-react";

export default async function FilesPage() {
  const client = await getCurrentClient();
  const files = await getFiles(client.id);

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Files" subtitle="Kontrak, brand asset, dan dokumen lain yang dibagikan tim Adsbangda." />

      <div className="p-5 lg:p-8">
        {files.length === 0 ? (
          <EmptyState title="Belum ada file" description="File yang dibagikan tim Adsbangda akan muncul di sini." />
        ) : (
          <Card padding="sm" className="divide-y divide-border overflow-hidden p-0">
            {files.map((file) => (
              <div key={file.id} className="flex flex-wrap items-center justify-between gap-4 p-5 lg:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-accent-soft text-accent">
                    <File className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{file.name}</p>
                    <p className="mt-1 font-data text-[11px] text-muted">
                      {file.category} · {file.sizeLabel} · Diperbarui{" "}
                      {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(file.updatedAt))}
                    </p>
                  </div>
                </div>
                <a href={file.fileUrl} className={buttonVariants({ variant: "outline" })}>
                  <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Download
                </a>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
