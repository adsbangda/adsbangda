"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Konfirmasi visual setelah submit form berhasil — SEBELUMNYA form Simpan di
 * Admin Portal (Projects, Tahapan/Steps, dst) cuma revalidatePath() tanpa
 * tanda apa pun, jadi tidak kelihatan apakah klik Simpan beneran kesimpan
 * atau belum. Server action yang berhasil sekarang redirect ke
 * `${path}?saved=1`, lalu komponen ini yang nampilin toast kecil di pojok
 * kanan bawah selama ~2.5 detik lalu membersihkan parameter `saved` dari URL.
 *
 * SENGAJA tanpa state lokal sama sekali — `visible` diturunkan LANGSUNG dari
 * searchParams saat render (bukan disalin ke useState), supaya tidak perlu
 * memanggil setState secara sinkron di dalam effect (yang sekarang dilarang
 * oleh react-hooks/set-state-in-effect). Effect di bawah cuma menjadwalkan
 * satu efek samping non-React: `router.replace()` buat membuang parameter
 * `saved` dari URL setelah timer selesai — begitu parameter itu hilang,
 * `visible` otomatis jadi false di render berikutnya karena diturunkan dari
 * URL, tanpa perlu state React tambahan sama sekali.
 */
export function SavedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const visible = searchParams.get("saved") === "1";

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("saved");
      const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(next, { scroll: false });
    }, 2500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sengaja cuma re-run kalau `visible` berubah, bukan tiap render router/pathname/searchParams baru.
  }, [visible]);

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-[var(--radius-md)] bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-md)] transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      )}
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={2} />
      Tersimpan
    </div>
  );
}
