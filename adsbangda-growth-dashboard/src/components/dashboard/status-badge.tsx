import { cn } from "@/lib/utils";

const STATUS_MAP: Record<
  string,
  { label: string; tone: "success" | "warning" | "muted" | "accent" }
> = {
  done: { label: "Selesai", tone: "success" },
  published: { label: "Published", tone: "success" },
  approved: { label: "Approved", tone: "success" },
  scheduled: { label: "Scheduled", tone: "accent" },
  in_progress: { label: "Berjalan", tone: "accent" },
  review: { label: "Review", tone: "accent" },
  waiting: { label: "Menunggu", tone: "warning" },
  draft: { label: "Draft", tone: "muted" },
  not_started: { label: "Belum Mulai", tone: "muted" },
  active: { label: "Aktif", tone: "success" },
  on_hold: { label: "Ditunda", tone: "warning" },
  completed: { label: "Selesai", tone: "muted" },
};

const TONE_CLASSES: Record<string, { badge: string; dot: string }> = {
  success: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-500",
  },
  warning: {
    badge: "bg-amber-50 text-amber-700 border-amber-200/80",
    dot: "bg-amber-500",
  },
  muted: {
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  accent: {
    badge: "bg-blue-50 text-blue-700 border-blue-200/80",
    dot: "bg-blue-600",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? { label: status, tone: "muted" as const };
  const styles = TONE_CLASSES[config.tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight whitespace-nowrap shadow-2xs",
        styles.badge
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {config.label}
    </span>
  );
}