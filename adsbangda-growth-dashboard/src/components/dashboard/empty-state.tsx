import { AlertTriangle, Clock, Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Intentional, premium-feeling placeholder for empty sections. Use instead of a blank area. */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04] text-muted">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="max-w-xs text-xs leading-relaxed text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Gagal memuat data",
  description = "Terjadi kendala saat mengambil data. Coba muat ulang halaman ini.",
  action,
  className,
}: Partial<EmptyStateProps>) {
  return <EmptyState icon={AlertTriangle} title={title} description={description} action={action} className={className} />;
}

export function ComingSoonState({
  title = "Segera hadir",
  description,
  className,
}: Partial<EmptyStateProps>) {
  return <EmptyState icon={Clock} title={title} description={description} className={className} />;
}

/** Skeleton block(s) for loading states — reuses the `.skeleton` shimmer defined in globals.css. */
export function LoadingState({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} role="status" aria-label="Memuat">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4 w-full" style={{ width: i === lines - 1 ? "60%" : "100%" }} />
      ))}
    </div>
  );
}
