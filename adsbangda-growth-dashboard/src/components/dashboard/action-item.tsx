import { ArrowRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

export interface ActionEntry {
  id: string;
  title: string;
  description: string;
  dueLabel: string;
  actionLabel: string;
  actionHref: string;
  urgent: boolean;
}

/**
 * Card used in "Needs Your Attention" (spec §15). Importance is communicated
 * through hierarchy and a restrained border/background tint on urgent
 * items — not through loud alert colors everywhere.
 */
export function ActionItem({ title, description, dueLabel, actionLabel, actionHref, urgent }: ActionEntry) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-[var(--radius-lg)] border p-5 shadow-[var(--shadow-xs)]",
        urgent ? "border-danger-soft bg-danger-soft/40" : "border-border bg-surface"
      )}
    >
      <div className="flex items-center justify-between">
        <MessageCircle className={cn("h-4.5 w-4.5", urgent ? "text-danger" : "text-accent")} strokeWidth={1.75} />
        <span className="font-data text-[11px] text-muted">{dueLabel}</span>
      </div>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
      <a
        href={actionHref}
        className={cn("mt-4 w-full", buttonVariants({ variant: urgent ? "danger" : "dark", className: "justify-center py-2" }))}
      >
        {actionLabel} <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
