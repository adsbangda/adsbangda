"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  ListChecks,
  CalendarDays,
  FileText,
  Globe,
  ExternalLink,
  Mail,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/performance", label: "Performance", icon: LineChart },
  { href: "/projects", label: "Projects", icon: ListChecks },
  { href: "/content-calendar", label: "Content Calendar", icon: CalendarDays },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function Sidebar({ clientName }: { clientName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-ink text-paper">
      {/* Brand Header */}
      <div className="flex flex-col gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent font-display text-base font-extrabold text-white shadow-sm">
            A
          </div>
          <div className="min-w-0">
            <div className="font-display text-base font-bold leading-none tracking-tight text-white">
              AdsBangda
            </div>
            <div className="mt-1 text-[11px] font-medium leading-none text-muted-on-dark">
              Growth Dashboard
            </div>
          </div>
        </div>
        <div>
          <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-0.5 font-data text-[9px] font-semibold tracking-widest text-white/90 border border-white/10 uppercase">
            CLIENT PORTAL
          </span>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 px-3">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-muted-on-dark hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Links Section */}
        <div className="pt-3 border-t border-white/10 space-y-1">
          <div className="px-3 pb-1 font-data text-[10px] font-semibold uppercase tracking-wider text-muted-on-dark">
            Quick Links
          </div>
          <a
            href="https://www.adsbangda.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-muted-on-dark transition-colors hover:bg-white/5 hover:text-white group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Globe className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">Website AdsBangda</span>
            </div>
            <ExternalLink className="h-3 w-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" strokeWidth={1.75} />
          </a>
        </div>

        {/* Support Section */}
        <div className="pt-3 border-t border-white/10 space-y-1">
          <div className="px-3 pb-1 font-data text-[10px] font-semibold uppercase tracking-wider text-muted-on-dark">
            Support
          </div>
          <a
            href="mailto:support@adsbangda.com"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-on-dark transition-colors hover:bg-white/5 hover:text-white"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">support@adsbangda.com</span>
          </a>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-on-dark transition-colors hover:bg-white/5 hover:text-white"
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">WhatsApp Support</span>
          </a>
        </div>
      </div>

      {/* Client Profile & Version Section */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-white/5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
            {clientName ? clientName.slice(0, 2).toUpperCase() : "CL"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-white">{clientName}</div>
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

        <div className="flex items-center justify-between px-3 pt-1">
          <span className="font-data text-[10px] text-muted-on-dark">
            Version
          </span>
          <span className="font-data text-[10px] font-semibold text-muted-on-dark">
            v1.0 MVP
          </span>
        </div>
      </div>
    </aside>
  );
}