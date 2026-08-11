import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";
import type { Deliverable } from "@/lib/types";

const MONTHLY_STATUS_LABEL: Record<"preparing" | "done" | "pending", string> = {
  preparing: "Preparing",
  done: "Ready",
  pending: "Pending",
};

function QuantityRow({ label, completed, target }: { label: string; completed: number; target: number }) {
  const pct = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;
  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-ink">{label}</span>
        <span className="font-data text-xs text-muted">
          {completed} / {target}
        </span>
      </div>
      <div className="mt-2">
        <ProgressBar value={pct} />
      </div>
    </div>
  );
}

function UpToRow({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-ink">{label}</span>
        <span className="font-data text-xs text-muted">
          {used} / up to {max}
        </span>
      </div>
      <div className="mt-2">
        <ProgressBar value={pct} />
      </div>
    </div>
  );
}

function RecurringRow({
  label,
  periods,
}: {
  label: string;
  periods: { label: string; status: "done" | "in_progress" | "upcoming" }[];
}) {
  return (
    <div className="py-3">
      <p className="text-sm text-ink">{label}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {periods.map((p) => (
          <span
            key={p.label}
            className={cn(
              "inline-flex items-center gap-1 rounded-[var(--radius-sm)] border px-2 py-1 font-data text-[11px] font-medium",
              p.status === "done" && "border-success-soft bg-success-soft text-success",
              p.status === "in_progress" && "border-accent-soft bg-accent-soft text-accent",
              p.status === "upcoming" && "border-border bg-black/[0.02] text-muted"
            )}
          >
            {p.status === "done" && <Check className="h-3 w-3" strokeWidth={2} />}
            {p.label}
            {p.status === "upcoming" ? " · Upcoming" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function MilestoneRow({
  label,
  milestones,
}: {
  label: string;
  milestones: { label: string; status: "done" | "in_progress" | "pending"; pct?: number }[];
}) {
  return (
    <div className="py-3">
      <p className="text-sm text-ink">{label}</p>
      <div className="mt-2.5 space-y-2">
        {milestones.map((m) => (
          <div key={m.label} className="flex items-center justify-between gap-3">
            <span className={cn("flex items-center gap-2 text-xs", m.status === "pending" ? "text-muted" : "text-ink")}>
              {m.status === "done" ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-success" strokeWidth={2} />
              ) : (
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    m.status === "in_progress" ? "bg-accent" : "bg-black/20"
                  )}
                />
              )}
              {m.label}
            </span>
            <span className="shrink-0 font-data text-[11px] text-muted">
              {m.status === "done" ? "Done" : m.status === "in_progress" ? `${m.pct ?? 0}%` : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyRow({ label, status, note }: { label: string; status: "preparing" | "done" | "pending"; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm text-ink">{label}</p>
        {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
      </div>
      <span className="shrink-0 font-data text-[11px] font-semibold text-muted">{MONTHLY_STATUS_LABEL[status]}</span>
    </div>
  );
}

/**
 * Renders a single contracted deliverable according to its kind. This is the
 * component that keeps the Monthly Delivery hero service-agnostic — it never
 * branches on a service name, only on the generic `kind` discriminator.
 */
export function DeliverableRow({ deliverable }: { deliverable: Deliverable }) {
  switch (deliverable.kind) {
    case "quantity":
      return <QuantityRow label={deliverable.label} completed={deliverable.completed} target={deliverable.target} />;
    case "up_to":
      return <UpToRow label={deliverable.label} used={deliverable.used} max={deliverable.max} />;
    case "recurring":
      return <RecurringRow label={deliverable.label} periods={deliverable.periods} />;
    case "milestone":
      return <MilestoneRow label={deliverable.label} milestones={deliverable.milestones} />;
    case "monthly":
      return <MonthlyRow label={deliverable.label} status={deliverable.status} note={deliverable.note} />;
  }
}
