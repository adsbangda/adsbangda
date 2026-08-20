import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PillTabItem {
  href: string;
  label: string;
  active: boolean;
  /** Label kecil non-klik yang muncul SEBELUM item ini — dipakai untuk mengelompokkan tab secara visual, tanpa mengubah struktur navigasi. */
  groupLabel?: string;
}

/**
 * Shell visual bersama untuk semua tab-nav berbasis <Link> di Admin Portal —
 * baik tab utama detail client (rute penuh, lihat DetailTabs) maupun
 * sub-nav di dalam satu halaman lewat query param (mis. Content Delivery /
 * Performance / Goals di Social Media, Performance / Activity di Website).
 *
 * Sengaja:
 *   - Radius kotak profesional (--radius-md/--radius-sm), BUKAN capsule/
 *     pill penuh — supaya tidak terasa seperti widget generik.
 *   - Warna dari palet adsbangda sendiri (accent-soft buat track, accent
 *     buat teks tab aktif), bukan warna asing.
 *   - Font UI biasa (bukan font-data/monospace) — monospace cocok buat
 *     angka/tanggal, tapi bikin label navigasi kelihatan seperti UI debug,
 *     bukan produk jadi.
 *
 * `fullWidth` (default true) bikin tiap item sama lebar mengisi track
 * penuh — pas untuk segmented control 2-3 opsi. Untuk nav dengan banyak
 * item (mis. 9 tab utama Client Detail), pakai `fullWidth={false}` supaya
 * tiap tab selebar labelnya sendiri (tidak dipaksa melar sama rata), lebih
 * enak dibaca dan terasa seperti top-nav aplikasi sungguhan.
 *
 * Presentational murni & server-component-safe — active state dihitung oleh
 * pemanggil (baik dari usePathname() di client component, atau dari
 * searchParams di server component), bukan di sini.
 */
export function PillTabs({ items, fullWidth = true }: { items: PillTabItem[]; fullWidth?: boolean }) {
  return (
    <div className="flex w-full items-stretch gap-1 overflow-x-auto rounded-[var(--radius-md)] border border-border bg-accent-soft p-1.5">
      {items.map((item) => (
        <div key={item.href} className={cn("flex min-w-fit items-center", fullWidth && "flex-1")}>
          {item.groupLabel && (
            <span className="mr-1.5 whitespace-nowrap px-1.5 font-data text-[10px] font-semibold uppercase tracking-wider text-muted/60">
              {item.groupLabel}
            </span>
          )}
          <Link
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-[var(--radius-sm)] px-4 py-2.5 text-center text-[13px] font-semibold transition-all duration-150",
              fullWidth && "flex-1",
              item.active ? "bg-white text-accent shadow-[var(--shadow-xs)]" : "text-muted hover:bg-white/60 hover:text-ink"
            )}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </div>
  );
}
