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
  ArrowLeft,
  Mail,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/performance", label: "Performance", icon: LineChart },
  { href: "/projects", label: "Project Progress", icon: ListChecks },
  { href: "/content-calendar", label: "Content Calendar", icon: CalendarDays },
  { href: "/reports", label: "Report Center", icon: FileText },
];

const WA_PHONE = "6282289348724";
const SUPPORT_EMAIL = "info@adsbangda.com";

export function Sidebar({ clientName }: { clientName: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-ink text-paper">
      <div className="flex items-center gap-2.5 px-6 py-7">
        <div className="brand-gradient flex h-8 w-8 items-center justify-center rounded-xl font-display text-sm font-extrabold text-white shadow-[0_4px_14px_rgba(29,78,216,0.45)]">
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
                <span className="brand-gradient absolute left-0 top-1/2 h-4.5 w-[3px] -translate-y-1/2 rounded-r-full" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform",
                  active ? "text-accent-2" : "group-hover:scale-110"
                )}
                strokeWidth={1.75}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Kembali ke website utama */}
      <div className="px-3">
        <a
          href="https://www.adsbangda.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-on-dark transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.75} />
          Website Utama
        </a>
      </div>

      {/* Butuh bantuan: email & WhatsApp support */}
      <div className="mx-3 mt-2 rounded-xl bg-white/[0.05] p-3.5">
        <p className="mb-2.5 text-xs font-semibold text-white">Butuh bantuan?</p>
        <div className="space-y-1">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-muted-on-dark transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{SUPPORT_EMAIL}</span>
          </a>
          <a
            href={`https://wa.me/${WA_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-muted-on-dark transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <MessageCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            WhatsApp Support
          </a>
        </div>
      </div>

      <div className="border-t border-white/[0.08] px-3 py-4 mt-3">
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
