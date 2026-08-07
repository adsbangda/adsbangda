import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" };
  icon?: LucideIcon;
  className?: string;
  isNegativeWave?: boolean;
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  className,
  isNegativeWave = false,
}: StatCardProps) {
  const isUp = delta?.direction === "up";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-paper-deep p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-accent/30",
        className
      )}
    >
      {/* Background Accent Micro Glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/5 blur-xl transition-all duration-500 group-hover:bg-accent/10" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted font-data">
          {label}
        </span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </div>
        )}
      </div>

      {/* Micro Wave Indicator */}
      <div className="my-2 h-7 w-full opacity-70">
        <svg viewBox="0 0 200 40" className="h-full w-full preserve-3d">
          <path
            d={
              isNegativeWave
                ? "M0,10 Q40,35 80,15 T160,30 T200,25"
                : "M0,30 Q40,10 80,25 T160,5 T200,15"
            }
            fill="none"
            stroke={isNegativeWave ? "#dc2626" : "#1d4ed8"}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="font-data text-2xl font-bold tracking-tight text-ink">
          {value}
        </div>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-data text-[10px] font-bold border",
              isUp
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            )}
          >
            <span>{isUp ? "↑" : "↓"}</span>
            <span>{delta.value}</span>
          </span>
        )}
      </div>
    </div>
  );
}