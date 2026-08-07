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
        "relative overflow-hidden rounded-[28px] border border-border bg-paper-deep p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
          )}
          <span className="text-sm font-bold text-ink">{label}</span>
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-paper text-muted cursor-pointer hover:bg-border/50">
          <span className="text-xs font-bold leading-none mb-1">...</span>
        </div>
      </div>

      {/* Decorative Wave Line SVG */}
      <div className="my-3 h-10 w-full opacity-80">
        <svg viewBox="0 0 200 40" className="h-full w-full preserve-3d">
          <path
            d={
              isNegativeWave
                ? "M0,10 Q40,35 80,15 T160,30 T200,25"
                : "M0,30 Q40,10 80,25 T160,5 T200,15"
            }
            fill="none"
            stroke={isNegativeWave ? "#14B8A6" : "#10B981"}
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
                ? "bg-emerald-100/70 text-emerald-800"
                : "bg-amber-100/70 text-amber-800"
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