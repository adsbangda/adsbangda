import { Search, Bell } from "lucide-react";
import { DEMO_MODE } from "@/lib/data";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-6 border-b border-border bg-paper-deep/80 px-8 py-5 backdrop-blur-md">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {DEMO_MODE && (
          <span className="hidden items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1.5 font-data text-[11px] font-semibold text-warning sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            Mode Demo
          </span>
        )}

        <div className="hidden items-center gap-2 rounded-full border border-border bg-paper px-3.5 py-2 text-sm text-muted transition-colors focus-within:border-accent md:flex">
          <Search className="h-4 w-4" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Cari..."
            className="w-36 bg-transparent outline-none placeholder:text-muted"
          />
        </div>

        <button
          type="button"
          aria-label="Notifikasi"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-ink hover:text-ink"
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>
      </div>
    </header>
  );
}
