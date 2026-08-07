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
        "relative overflow-hidden rounded-[24px] border border-border bg-paper-deep p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-accent/30",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
          )}
          <span className="text-xs font-bold text-ink">{label}</span>
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-paper text-muted cursor-pointer hover:bg-border/50">
          <span className="text-xs font-bold leading-none mb-1">...</span>
        </div>
      </div>

      {/* Wave Line SVG in AdsBangda Blue Theme */}
      <div className="my-2 h-9 w-full opacity-80">
        <svg viewBox="0 0 200 40" className="h-full w-full preserve-3d">
          <path
            d={
              isNegativeWave
                ? "M0,10 Q40,35 80,15 T160,30 T200,25"
                : "M0,30 Q40,10 80,25 T160,5 T200,15"
            }
            fill="none"
            stroke={isNegativeWave ? "#6B7280" : "#1D4ED8"}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between">
        <div className="font-data text-2xl font-bold tracking-tight text-ink">
          {value}
        </div>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-data text-[11px] font-bold",
              isUp
                ? "bg-blue-50 text-accent border border-blue-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            )}
          >
            <span>{delta.value}</span>
            <span>{isUp ? "↑" : "↓"}</span>
          </span>
        )}
      </div>
    </div>
  );
}