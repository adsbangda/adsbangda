import { ChevronDown, Bell } from "lucide-react";

interface OverviewHeaderProps {
  clientName: string;
  periodLabel: string;
  notificationCount?: number;
}

/**
 * Greeting header for the Overview only (other pages keep the plain Topbar).
 * The date pill and bell are visual-only in this phase — no new date-range
 * or notifications logic is wired up yet.
 */
export function OverviewHeader({ clientName, periodLabel, notificationCount = 0 }: OverviewHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface/80 px-5 py-4 backdrop-blur lg:px-8">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-ink lg:text-2xl">Halo, {clientName} 👋</h1>
        <p className="mt-0.5 text-sm text-muted">Berikut ringkasan progres pekerjaan AdsBangda untuk bulan ini.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2 text-sm font-medium text-ink shadow-[var(--shadow-xs)]"
        >
          {periodLabel}
          <ChevronDown className="h-4 w-4 text-muted" strokeWidth={1.75} />
        </button>

        <button
          type="button"
          aria-label="Notifikasi"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface shadow-[var(--shadow-xs)]"
        >
          <Bell className="h-4.5 w-4.5 text-ink" strokeWidth={1.75} />
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 font-data text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
