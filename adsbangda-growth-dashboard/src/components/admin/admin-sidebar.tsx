"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ArrowUpRight, LogOut, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/dashboard/logo";
import { signOut } from "@/app/(auth)/login/actions";

const NAV_ITEMS = [
  { href: "/admin/clients", label: "Clients", icon: Building2 },
  { href: "/admin/team", label: "Team & Akses", icon: Users },
];

export function AdminSidebar({ pendingRevisions = 0 }: { pendingRevisions?: number }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] font-display text-sm font-extrabold text-white"
          style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)" }}
        >
          A
        </span>
        <div>
          <Logo tone="dark" height={16} />
          <div className="mt-1 font-data text-[10px] uppercase tracking-wider text-muted">Admin Portal</div>
        </div>
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
              <span className="flex-1">{item.label}</span>
              {item.href === "/admin/clients" && pendingRevisions > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 font-data text-[10px] font-bold text-white" title={`${pendingRevisions} content butuh resubmit setelah revision request`}>
                  {pendingRevisions}
                </span>
              )}
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
            onClick={(e) => {
              if (!window.confirm("Yakin mau keluar dari Admin Portal?")) {
                e.preventDefault();
              }
            }}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            Keluar
          </button>
        </form>
      </div>
    </div>
  );
}
