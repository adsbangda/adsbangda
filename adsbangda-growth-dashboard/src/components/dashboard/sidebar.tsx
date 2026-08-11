"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  ListChecks,
  CalendarDays,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/performance", label: "Performance", icon: LineChart },
  { href: "/projects", label: "Project Progress", icon: ListChecks },
  { href: "/content-calendar", label: "Content Calendar", icon: CalendarDays },
  { href: "/reports", label: "Report Center", icon: FileText },
];

export function Sidebar({ clientName }: { clientName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-ink text-paper">
      <div className="flex items-center gap-2.5 px-6 py-7">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-blue-500 font-display text-sm font-extrabold text-white shadow-[0_4px_14px_rgba(29,78,216,0.45)]">
          A
        </div>
        <div>
          <div className="font-display text-sm font-bold leading-none">Adsbangda</div>
          <div className="mt-1 font-data text-[10px] uppercase tracking-wider text-muted-on-dark">
            Growth Dashboard
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-white/[0.08] text-white"
                  : "text-muted-on-dark hover:bg-white/[0.05] hover:text-white"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-4.5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform",
                  active ? "text-accent" : "group-hover:scale-110"
                )}
                strokeWidth={1.75}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.08] px-3 py-4">
        <div className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/[0.05]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/[0.06] text-xs font-bold ring-1 ring-white/10">
            {clientName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{clientName}</div>
            <div className="font-data text-[10px] text-muted-on-dark">Client</div>
          </div>
          <button
            type="button"
            aria-label="Keluar"
            className="text-muted-on-dark transition-colors hover:text-white"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  );
}
