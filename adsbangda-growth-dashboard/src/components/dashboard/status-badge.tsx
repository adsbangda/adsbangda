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

const TONE_CLASSES: Record<string, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  muted: "bg-black/5 text-muted",
  accent: "bg-accent-soft text-accent",
};

const DOT_CLASSES: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  muted: "bg-muted",
  accent: "bg-accent",
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? { label: status, tone: "muted" as const };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        TONE_CLASSES[config.tone]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASSES[config.tone])} />
      {config.label}
    </span>
  );
}
