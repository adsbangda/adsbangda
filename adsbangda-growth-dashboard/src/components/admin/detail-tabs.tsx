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
 * Sama secara visual dengan komponen Tabs (segmented control), tapi berbasis
 * navigasi <Link> sungguhan (bukan onChange state) — dipakai untuk tab
 * Client/Project Detail yang masing-masing punya route & data server-side
 * sendiri (Overview/Projects/Team/Content/dst).
 */
export function DetailTabs({ items }: { items: DetailTabItem[] }) {
  const pathname = usePathname();

  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-[var(--radius-md)] border border-border bg-black/[0.02] p-1">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <div key={item.href} className="flex items-center">
            {item.groupLabel && (
              <span className="ml-2 mr-1.5 flex items-center gap-1.5 border-l border-border pl-2.5 font-data text-[10px] font-semibold uppercase tracking-wider text-muted/70">
                {item.groupLabel}
              </span>
            )}
            <Link
              href={item.href}
              className={cn(
                "rounded-[var(--radius-sm)] px-3.5 py-2 font-data text-[11px] font-semibold transition-all duration-200 ease-out",
                active ? "bg-white text-ink shadow-[var(--shadow-xs)]" : "text-muted hover:bg-white/60 hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
