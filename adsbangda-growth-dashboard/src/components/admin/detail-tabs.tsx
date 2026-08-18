"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface DetailTabItem {
  href: string;
  label: string;
  /** Exact match only — used for the base/Overview tab so it doesn't stay active on sub-routes. */
  exact?: boolean;
  /** Label kecil non-klik yang muncul SEBELUM pill ini — dipakai untuk mengelompokkan tab secara visual (mis. "Services" sebelum Social Media/Meta Ads/Website), tanpa mengubah struktur navigasi. */
  groupLabel?: string;
}

/**
 * Underline tab bar berbasis navigasi <Link> sungguhan (bukan onChange
 * state) — dipakai untuk tab Client/Project Detail yang masing-masing punya
 * route & data server-side sendiri (Overview/Services/Social Media/dst).
 *
 * Sengaja edge-to-edge (w-full, garis border-b menyambung sampai ujung
 * kanan container) alih-alih segmented-control mengambang di kiri — supaya
 * konsisten dengan lebar header di atasnya dan terasa seperti product tab
 * bar sungguhan (pola Linear/GitHub/Vercel), bukan pill widget generik yang
 * menyisakan banyak ruang kosong di kanan pada layar lebar.
 */
export function DetailTabs({ items }: { items: DetailTabItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex w-full items-stretch gap-0.5 overflow-x-auto border-b border-border">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <div key={item.href} className="flex shrink-0 items-center">
            {item.groupLabel && (
              <span className="ml-4 mr-1 flex items-center font-data text-[10px] font-semibold uppercase tracking-wider text-muted/50">
                {item.groupLabel}
              </span>
            )}
            <Link
              href={item.href}
              className={cn(
                "group relative flex shrink-0 items-center whitespace-nowrap px-3.5 py-3 font-data text-[11px] font-semibold tracking-wide transition-colors duration-150",
                active ? "text-ink" : "text-muted hover:text-ink"
              )}
            >
              {item.label}
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-2.5 -bottom-px h-[2px] rounded-full transition-colors duration-150",
                  active ? "bg-accent" : "bg-transparent group-hover:bg-border"
                )}
              />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
