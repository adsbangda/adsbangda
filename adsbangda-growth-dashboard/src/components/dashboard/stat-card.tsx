import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" };
  icon?: LucideIcon;
  className?: string;
  sparklineProgress?: number;
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  className,
  sparklineProgress = 70,
}: StatCardProps) {
  const isUp = delta?.direction === "up";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[20px] border border-[#ECECEC] bg-[#FFFFFF] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 hover:border-[#1D4ED8]/30",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A] font-data">
          {label}
        </span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8] transition-colors group-hover:bg-[#1D4ED8] group-hover:text-white">
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="font-data text-2xl font-bold tracking-tight text-[#18181B]">
          {value}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-data text-[11px] font-bold border",
              isUp
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            )}
          >
            <span>{isUp ? "↑" : "↓"}</span>
            <span>{delta.value}</span>
          </span>
        ) : (
          <span className="font-data text-[11px] text-[#71717A]">vs. bulan lalu</span>
        )}

        <span className="font-data text-[11px] font-semibold text-[#71717A]">
          {sparklineProgress}%
        </span>
      </div>

      {/* Mini Progress Bar */}
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#FAFAFA] border border-[#ECECEC]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isUp ? "bg-emerald-500" : "bg-[#1D4ED8]"
          )}
          style={{ width: `${sparklineProgress}%` }}
        />
      </div>
    </div>
  );
}