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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Flat client navigation per design system spec — Overview, Performance,
// Projects, Content, Reports. Routes are unchanged; only the sidebar label
// and grouping were simplified (no more Workspace/Reporting split).
const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/performance", label: "Performance", icon: LineChart },
  { href: "/projects", label: "Projects", icon: ListChecks },
  { href: "/content-calendar", label: "Content", icon: CalendarDays },
  { href: "/reports", label: "Reports", icon: FileText },
];

const WA_PHONE = "6282289348724";
const SUPPORT_EMAIL = "info@adsbangda.com";

function NavSection({
  items,
  pathname,
  onNavigate,
}: {
  items: typeof NAV_ITEMS;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-0.5">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-white/[0.07] text-white" : "text-muted-on-dark hover:bg-white/[0.04] hover:text-white"
            )}
          >
            {active && <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 bg-accent-2" />}
            <Icon className={cn("h-4 w-4 shrink-0", active && "text-accent-2")} strokeWidth={1.75} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar({ clientName, onNavigate }: { clientName: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-ink text-paper">
      <div className="flex items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="brand-gradient flex h-7 w-7 items-center justify-center rounded-md font-display text-xs font-extrabold text-white">
            A
          </div>
          <div>
            <div className="font-display text-sm font-bold leading-none">Adsbangda</div>
            <div className="mt-1 font-data text-[9.5px] uppercase tracking-wider text-muted-on-dark">
              Client Portal
            </div>
          </div>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} aria-label="Tutup menu" className="text-muted-on-dark lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <NavSection items={NAV_ITEMS} pathname={pathname} onNavigate={onNavigate} />
      </nav>

      <div className="space-y-3 px-3 pb-3">
        <a
          href="https://www.adsbangda.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-on-dark transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.75} />
          Website Utama
        </a>

        <div className="rounded-md border border-white/[0.08] p-3">
          <p className="mb-2 text-xs font-semibold text-white">Butuh bantuan?</p>
          <div className="space-y-0.5">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-2.5 rounded px-1.5 py-1 text-xs text-muted-on-dark transition-colors hover:text-white"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{SUPPORT_EMAIL}</span>
            </a>
            <a
              href={`https://wa.me/${WA_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded px-1.5 py-1 text-xs text-muted-on-dark transition-colors hover:text-white"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              WhatsApp Support
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/[0.08] px-1 pt-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold ring-1 ring-white/10">
            {clientName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{clientName}</div>
            <div className="font-data text-[10px] text-muted-on-dark">Active Client</div>
          </div>
          <button type="button" aria-label="Keluar" className="text-muted-on-dark transition-colors hover:text-white">
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
