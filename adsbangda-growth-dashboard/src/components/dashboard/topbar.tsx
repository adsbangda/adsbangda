import { Bell } from "lucide-react";
import { DEMO_MODE } from "@/lib/data";
import { MobileMenuButton } from "./app-shell";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-paper-deep/85 px-5 py-4 backdrop-blur-md lg:px-8 lg:py-5">
      <div className="flex min-w-0 items-center gap-3">
        <MobileMenuButton />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight text-ink lg:text-xl">{title}</h1>
          {subtitle && <p className="mt-0.5 hidden text-sm text-muted sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        {DEMO_MODE && (
          <span className="hidden items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1.5 font-data text-[11px] font-semibold text-warning sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-warning" />
            Mode Demo
          </span>
        )}

        <button
          type="button"
          aria-label="Notifikasi"
          className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-ink hover:text-ink"
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>
      </div>
    </header>
  );
}
