"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface DetailTabItem {
  href: string;
  label: string;
  /** Exact match only — used for the base/Overview tab so it doesn't stay active on sub-routes. */
  exact?: boolean;
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
    <div className="inline-flex flex-wrap items-center gap-0.5 rounded-[var(--radius-md)] border border-border bg-black/[0.02] p-1">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-[var(--radius-sm)] px-3 py-1.5 font-data text-[11px] font-semibold transition-colors",
              active ? "bg-white text-ink shadow-[var(--shadow-xs)]" : "text-muted hover:text-ink"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
