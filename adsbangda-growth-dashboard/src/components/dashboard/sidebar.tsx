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
  Sparkles,
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
    <aside className="my-4 ml-4 flex h-[calc(100vh-32px)] w-64 shrink-0 flex-col rounded-[32px] bg-[#18181B] text-paper shadow-xl selection:bg-accent selection:text-white">
      {/* Brand Header */}
      <div className="flex flex-col gap-3 px-5 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] font-display text-base font-extrabold text-white shadow-md shadow-accent/20">
            <span>A</span>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
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
        <div className="pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-data text-[9px] font-bold tracking-widest text-white/90 border border-white/10 uppercase">
            <Sparkles className="h-2.5 w-2.5 text-blue-400" />
            CLIENT PORTAL
          </span>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 px-3">
        <nav className="space-y-1.5">
          <div className="px-3 pb-1 font-data text-[10px] font-semibold uppercase tracking-wider text-muted-on-dark/70">
            Menu Utama
          </div>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[#2563EB] text-white shadow-lg shadow-blue-600/30"
                    : "text-muted-on-dark hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                    active ? "text-white" : "text-muted-on-dark group-hover:text-white"
                  )}
                  strokeWidth={active ? 2.2 : 1.75}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Links Section */}
        <div className="pt-3 border-t border-white/10 space-y-1">
          <div className="px-3 pb-1 font-data text-[10px] font-semibold uppercase tracking-wider text-muted-on-dark/70">
            Quick Links
          </div>
          <a
            href="https://www.adsbangda.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-muted-on-dark transition-all duration-150 hover:bg-white/5 hover:text-white group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Globe className="h-3.5 w-3.5 shrink-0 text-muted-on-dark group-hover:text-blue-400" strokeWidth={1.75} />
              <span className="truncate">Website AdsBangda</span>
            </div>
            <ExternalLink className="h-3 w-3 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" strokeWidth={1.75} />
          </a>
        </div>

        {/* Support Section */}
        <div className="pt-3 border-t border-white/10 space-y-1">
          <div className="px-3 pb-1 font-data text-[10px] font-semibold uppercase tracking-wider text-muted-on-dark/70">
            Support
          </div>
          <a
            href="mailto:support@adsbangda.com"
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-medium text-muted-on-dark transition-all duration-150 hover:bg-white/5 hover:text-white group"
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-on-dark group-hover:text-blue-400" strokeWidth={1.75} />
            <span className="truncate">support@adsbangda.com</span>
          </a>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium text-muted-on-dark transition-all duration-150 hover:bg-white/5 hover:text-white group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <MessageCircle className="h-3.5 w-3.5 shrink-0 text-muted-on-dark group-hover:text-emerald-400" strokeWidth={1.75} />
              <span className="truncate">WhatsApp Support</span>
            </div>
            <ExternalLink className="h-3 w-3 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" strokeWidth={1.75} />
          </a>
        </div>
      </div>

      {/* Client Profile & Version Section */}
      <div className="border-t border-white/10 p-3.5 space-y-2 bg-white/[0.02] rounded-b-[32px]">
        <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5 bg-white/5 border border-white/5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600/30 text-blue-300 font-data text-xs font-bold border border-blue-400/30">
            {clientName ? clientName.slice(0, 2).toUpperCase() : "CL"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-white">{clientName}</div>
            <div className="flex items-center gap-1.5 font-data text-[10px] text-muted-on-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>Klien Aktif</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Keluar"
            title="Keluar"
            className="text-muted-on-dark transition-colors hover:text-rose-400 p-1 rounded-lg hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex items-center justify-between px-3 pt-1">
          <span className="font-data text-[10px] text-muted-on-dark/70">
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