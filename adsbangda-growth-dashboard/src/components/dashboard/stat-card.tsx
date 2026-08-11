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
        "group rounded-[var(--radius-card)] border border-border bg-paper-deep p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent transition-all duration-200 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-accent-2 group-hover:to-accent group-hover:text-white">
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </div>
        )}
      </div>
      <div className="mt-3 font-data text-[1.65rem] font-semibold tracking-tight text-ink">
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-data text-xs font-semibold",
            delta.direction === "up" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
          )}
        >
          {delta.direction === "up" ? "▲" : "▼"} {delta.value}
        </div>
      )}
    </div>
  );
}
