import { DEMO_MODE } from "@/lib/data";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-paper-deep px-8 py-5">
      <div>
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {DEMO_MODE && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1.5 font-data text-[11px] font-semibold text-warning">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" />
          Mode Demo — data contoh
        </span>
      )}
    </header>
  );
}
