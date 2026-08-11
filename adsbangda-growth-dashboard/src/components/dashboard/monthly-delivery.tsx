import { Card } from "./card";
import { DeliverableRow } from "./deliverable-row";
import { cn } from "@/lib/utils";
import type { DeliveryGroup, DeliveryStatus } from "@/lib/types";

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  on_track: "On Track",
  at_risk: "At Risk",
  completed: "Completed",
  delayed: "Delayed",
};

const STATUS_TONE: Record<DeliveryStatus, string> = {
  on_track: "bg-success-soft text-success",
  at_risk: "bg-warning-soft text-warning",
  completed: "bg-accent-soft text-accent",
  delayed: "bg-danger-soft text-danger",
};

interface MonthlyDeliveryProps {
  periodLabel: string;
  overallPct: number;
  status: DeliveryStatus;
  groups: DeliveryGroup[];
}

/**
 * The hero of the Overview (spec §7): a large, dominant percentage
 * representing how much of the month's contracted work is done, followed by
 * the actual deliverables grouped by service line. Deliberately plain —
 * one big number, a status pill, and clean rows — not a grid of cards.
 */
export function MonthlyDelivery({ periodLabel, overallPct, status, groups }: MonthlyDeliveryProps) {
  return (
    <Card padding="lg">
      <p className="font-data text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {periodLabel} · Monthly Delivery
      </p>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <p className="font-display text-6xl font-extrabold leading-none tracking-tight text-ink lg:text-7xl">
          {overallPct}%
        </p>
        <span className={cn("mb-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-data text-xs font-semibold", STATUS_TONE[status])}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="mt-8 space-y-7 border-t border-border pt-7">
        {groups.map((group) => (
          <div key={group.serviceGroup}>
            <p className="mb-1 font-data text-[11px] font-semibold uppercase tracking-wider text-accent">
              {group.serviceGroup}
            </p>
            <div className="divide-y divide-border">
              {group.deliverables.map((d) => (
                <DeliverableRow key={d.id} deliverable={d} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
