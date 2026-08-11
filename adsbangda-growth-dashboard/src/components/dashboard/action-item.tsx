import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
 * A single row inside "Needs Your Attention" (spec §10). Importance comes
 * from typography and a small tone dot — not a loud alert-colored card.
 * Rendered as a divided row inside one shared container, not its own
 * floating card, to avoid the generic "grid of cards" dashboard formula.
 */
export function ActionItem({ title, description, dueLabel, actionLabel, actionHref, urgent }: ActionEntry) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex min-w-0 gap-3">
        <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", urgent ? "bg-danger" : "bg-accent")} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
          <p className="mt-1.5 font-data text-[11px] text-muted">{dueLabel}</p>
        </div>
      </div>
      <a
        href={actionHref}
        className={cn(
          "inline-flex shrink-0 items-center gap-1 font-data text-xs font-semibold hover:underline",
          urgent ? "text-danger" : "text-accent"
        )}
      >
        {actionLabel} <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
