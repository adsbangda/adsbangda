"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, ArrowUpRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/dashboard/logo";
import { signOut } from "@/app/(auth)/login/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/team", label: "Team & Akses", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface">
      <div className="px-5 py-6">
        <Logo tone="dark" height={18} />
        <div className="mt-2 font-data text-[10px] uppercase tracking-wider text-muted">Admin Portal</div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-accent-soft text-accent" : "text-muted hover:bg-black/[0.03] hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 px-3 pb-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-black/[0.03] hover:text-ink"
        >
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          Lihat sebagai Client Portal
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-black/[0.03] hover:text-ink"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            Keluar
          </button>
        </form>
      </div>
    </div>
  );
}
