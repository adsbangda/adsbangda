import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: string; // tailwind text-* class
  iconBg: string; // tailwind bg-* class
  delta?: { value: string; direction: "up" | "down" };
  progressPct?: number;
  progressColor?: string; // tailwind bg-* class
  comparisonLabel?: string;
  comparisonValue?: string;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  delta,
  progressPct,
  progressColor = "bg-accent",
  comparisonLabel,
  comparisonValue,
}: KpiCardProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} strokeWidth={1.75} />
        </div>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-data text-[11px] font-semibold",
              delta.direction === "up" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
            )}
          >
            {delta.direction === "up" ? "↑" : "↓"} {delta.value}
          </span>
        )}
      </div>

      <p className="mt-4 font-data text-[1.7rem] font-bold tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>

      {progressPct !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.05]">
            <div
              className={cn("h-full rounded-full transition-all duration-500", progressColor)}
              style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
            />
          </div>
          {comparisonLabel && (
            <div className="mt-1.5 flex items-center justify-between font-data text-[11px] text-muted">
              <span>{comparisonLabel}</span>
              {comparisonValue && <span>{comparisonValue}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
