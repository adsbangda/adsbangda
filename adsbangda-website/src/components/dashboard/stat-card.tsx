import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" };
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, delta, icon: Icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-paper-deep p-5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-muted" strokeWidth={1.75} />}
      </div>
      <div className="mt-2 font-data text-2xl font-semibold text-ink">{value}</div>
      {delta && (
        <div
          className={cn(
            "mt-1.5 inline-flex items-center gap-1 font-data text-xs font-semibold",
            delta.direction === "up" ? "text-success" : "text-danger"
          )}
        >
          {delta.direction === "up" ? "▲" : "▼"} {delta.value}
        </div>
      )}
    </div>
  );
}
