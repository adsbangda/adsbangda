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
 *   - Full width (flex-1 tiap item) — track menyambung sampai ujung kanan
 *     container, bukan pill kecil mengambang yang menyisakan ruang kosong.
 *   - Radius kotak profesional (--radius-md/--radius-sm), BUKAN capsule/
 *     pill penuh — supaya tidak terasa seperti widget generik.
 *   - Warna dari palet adsbangda sendiri (accent-soft buat track, accent
 *     buat teks tab aktif), bukan warna asing.
 *
 * Presentational murni & server-component-safe — active state dihitung oleh
 * pemanggil (baik dari usePathname() di client component, atau dari
 * searchParams di server component), bukan di sini.
 */
export function PillTabs({ items }: { items: PillTabItem[] }) {
  return (
    <div className="flex w-full items-stretch gap-1 overflow-x-auto rounded-[var(--radius-md)] border border-border bg-accent-soft p-1.5">
      {items.map((item) => (
        <div key={item.href} className="flex min-w-fit flex-1 items-center">
          {item.groupLabel && (
            <span className="mr-1.5 whitespace-nowrap px-1.5 font-data text-[10px] font-semibold uppercase tracking-wider text-muted/60">
              {item.groupLabel}
            </span>
          )}
          <Link
            href={item.href}
            className={cn(
              "flex-1 whitespace-nowrap rounded-[var(--radius-sm)] px-4 py-2.5 text-center font-data text-[11px] font-semibold tracking-wide transition-all duration-150",
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
