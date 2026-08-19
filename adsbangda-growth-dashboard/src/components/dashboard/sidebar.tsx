"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Briefcase,
  CalendarDays,
  Megaphone,
  Globe,
  FileText,
  Folder,
  LogOut,
  Mail,
  MessageCircle,
  ChevronDown,
  ArrowUpRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InstagramGlyph } from "./platform-icons";
import { Logo } from "./logo";
import { signOut } from "@/app/(auth)/login/actions";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/content-calendar", label: "Content", icon: CalendarDays },
  { href: "/social-media", label: "Social Media", icon: InstagramGlyph },
  { href: "/meta-ads", label: "Meta Ads", icon: Megaphone },
  { href: "/website", label: "Website", icon: Globe },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/files", label: "Files", icon: Folder },
];

const WA_PHONE = "6282289348724";
const SUPPORT_EMAIL = "info@adsbangda.com";

export function Sidebar({ clientName, isAdmin = false, onNavigate }: { clientName: string; isAdmin?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-5 py-6">
        <div>
          <Logo tone="dark" height={20} />
          <div className="mt-2 font-data text-[10px] uppercase tracking-wider text-muted">Client Portal</div>
        </div>
        {onNavigate && (
          <button onClick={onNavigate} aria-label="Tutup menu" className="text-muted lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-accent-soft text-accent" : "text-muted hover:bg-black/[0.03] hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 px-3 pb-3">
        <a
          href="https://www.adsbangda.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-black/[0.03] hover:text-ink"
        >
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          Back to AdsBangda Website
        </a>

        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-[var(--radius-md)] bg-ink px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent"
          >
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            Buka Admin Portal
          </Link>
        )}

        <div className="rounded-[var(--radius-md)] bg-accent-soft/60 p-3.5">
          <p className="mb-1 text-xs font-semibold text-ink">Need help?</p>
          <p className="mb-2.5 text-[11px] leading-relaxed text-muted">Our team is ready to support you.</p>
          <a
            href={`https://wa.me/${WA_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-ink px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent"
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
            Contact Us
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-1.5 flex items-center justify-center gap-1.5 text-[11px] text-muted transition-colors hover:text-ink"
          >
            <Mail className="h-3 w-3 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{SUPPORT_EMAIL}</span>
          </a>
        </div>

        <div className="flex items-center gap-2.5 border-t border-border px-1 pt-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
            {clientName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink">{clientName}</div>
            <div className="font-data text-[10px] text-muted">Client</div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.75} />
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Keluar"
              className="shrink-0 text-muted transition-colors hover:text-ink"
              onClick={(e) => {
                if (!window.confirm("Yakin mau keluar dari Client Portal?")) {
                  e.preventDefault();
                }
              }}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
