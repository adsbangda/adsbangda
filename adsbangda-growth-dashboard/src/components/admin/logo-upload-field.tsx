"use client";

import { useState } from "react";
import { ClientAvatar } from "./client-avatar";

/**
 * Ganti "Logo URL" manual jadi upload file langsung. Sengaja tetap
 * <input type="file"> polos di dalam <form action={serverAction}> yang
 * sudah ada (Next.js Server Actions otomatis terima FormData termasuk
 * File tanpa perlu encType manual) — bukan komponen upload terpisah yang
 * bikin submit sendiri, supaya tetap satu form/satu submit dengan field
 * lain (nama, industri, dst) seperti sebelumnya.
 *
 * `name` di sini SENGAJA beda dari field `logoUrl` lama (biar tidak
 * ketabrak) — pemanggil (Server Action di halaman) yang tanggung jawab
 * upload file-nya ke Storage lalu isi `logoUrl` dari hasilnya.
 */
export function LogoUploadField({
  name,
  clientName,
  currentLogoUrl,
  showRemoveOption = false,
}: {
  name: string;
  clientName: string;
  currentLogoUrl?: string | null;
  /** Cuma relevan di form Edit (client sudah ada) — form New Client belum punya logo buat dihapus. */
  showRemoveOption?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(currentLogoUrl ?? null);
  const [removed, setRemoved] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        Logo <span className="font-normal text-muted">(opsional)</span>
      </label>
      <div className="flex items-center gap-3">
        <ClientAvatar name={clientName} logoUrl={removed ? null : preview} size={48} />
        <div className="min-w-0 flex-1">
          <input
            type="file"
            name={name}
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="block w-full text-xs text-muted file:mr-3 file:rounded-[var(--radius-sm)] file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink file:cursor-pointer hover:file:bg-black/[0.02]"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPreview(URL.createObjectURL(file));
                setRemoved(false);
              }
            }}
          />
          <p className="mt-1 text-xs text-muted">PNG/JPG/WEBP/SVG, maks 2MB. Kosongkan kalau tidak mau ganti logo.</p>
          {showRemoveOption && currentLogoUrl && (
            <label className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
              <input
                type="checkbox"
                name="removeLogo"
                onChange={(e) => setRemoved(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border"
              />
              Hapus logo saat ini
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
