"use client";

import { usePathname } from "next/navigation";
import { PillTabs } from "./pill-tabs";

export interface DetailTabItem {
  href: string;
  label: string;
  /** Exact match only — used for the base/Overview tab so it doesn't stay active on sub-routes. */
  exact?: boolean;
  /** Label kecil non-klik yang muncul SEBELUM tab ini — dipakai untuk mengelompokkan tab secara visual, tanpa mengubah struktur navigasi. */
  groupLabel?: string;
}

/**
 * Tab utama Client Detail (Overview/Services/Social Media/dst) — tiap tab
 * route & data server-side sendiri, jadi active-state-nya dihitung dari
 * pathname sungguhan (client component), bukan query param. Markup & warna
 * visualnya didelegasikan ke PillTabs supaya konsisten dengan sub-nav
 * lainnya di Admin Portal (Content Delivery/Performance/Goals, dst).
 */
export function DetailTabs({ items }: { items: DetailTabItem[] }) {
  const pathname = usePathname();

  return (
    <PillTabs
      fullWidth={false}
      items={items.map((item) => ({
        href: item.href,
        label: item.label,
        groupLabel: item.groupLabel,
        active: item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/"),
      }))}
    />
  );
}
