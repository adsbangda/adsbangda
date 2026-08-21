"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { buttonVariants, type ButtonVariant, type ButtonSize } from "./button";
import { cn } from "@/lib/utils";

/**
 * Tombol submit yang otomatis nampilin spinner + ke-disable selagi Server
 * Action-nya lagi jalan (`useFormStatus()` dari React — baca status form
 * TERDEKAT di atasnya, otomatis kedeteksi walau tombolnya pakai `formAction`
 * sendiri buat override action default form-nya, mis. tombol "Sync
 * Sekarang" yang beda action dari tombol "Simpan" di form yang sama).
 *
 * Dibuat karena sebelumnya klik Simpan/Sync Sekarang di form Server Action
 * (GA4, Social Media connection, dst) TIDAK ada indikator apa pun sedang
 * diproses — user gampang bingung "kepencet apa nggak", bisa double-klik
 * tanpa sadar. Ganti langsung dari `<button type="submit" className={buttonVariants(...)}>`
 * jadi `<SubmitButton variant=... size=...>`, isi children TETAP sama
 * (termasuk formAction kalau perlu override).
 */
export function SubmitButton({
  children,
  loadingLabel = "Memproses...",
  variant = "primary",
  size = "md",
  className,
  formAction,
}: {
  children: React.ReactNode;
  /** Teks yang ditampilkan selagi pending — default "Memproses...". */
  loadingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={pending}
      className={cn(buttonVariants({ variant, size, className }), pending && "cursor-wait")}
    >
      {pending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
