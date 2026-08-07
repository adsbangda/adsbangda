import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" };
  icon?: LucideIcon;
  className?: string;
  sparklineColor?: string;
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  className,
}: StatCardProps) {
  const isUp = delta?.direction === "up";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-paper-deep p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-accent/20",
        className
      )}
    >
      {/* Background Micro Glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/5 blur-xl transition-all duration-500 group-hover:bg-accent/10" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-paper text-muted transition-colors group-hover:bg-accent-soft group-hover:text-accent">
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="font-data text-2xl font-bold tracking-tight text-ink">
          {value}
        </div>
      </div>

      {delta && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-data text-[11px] font-semibold",
              isUp
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : "bg-rose-50 text-rose-700 border border-rose-200/60"
            )}
          >
            <span>{isUp ? "↑" : "↓"}</span>
            <span>{delta.value}</span>
          </span>
        </div>
      )}

      {/* Decorative Sparkline SVG */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-paper">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isUp ? "bg-emerald-500" : "bg-accent"
          )}
          style={{ width: isUp ? "78%" : "62%" }}
        />
      </div>
    </div>
  );
}