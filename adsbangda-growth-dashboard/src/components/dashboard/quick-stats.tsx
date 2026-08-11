import { Send, CircleDashed, Heart, Users } from "lucide-react";
import { Card } from "./card";
import type { QuickStat, QuickStatIcon } from "@/lib/types";

const ICON_MAP: Record<QuickStatIcon, { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; iconClass: string; bgClass: string }> = {
  send: { Icon: Send, iconClass: "text-accent", bgClass: "bg-accent-soft" },
  story: { Icon: CircleDashed, iconClass: "text-indigo-600", bgClass: "bg-indigo-50" },
  heart: { Icon: Heart, iconClass: "text-pink-600", bgClass: "bg-pink-50" },
  users: { Icon: Users, iconClass: "text-emerald-600", bgClass: "bg-emerald-50" },
};

export function QuickStats({ stats }: { stats: QuickStat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const { Icon, iconClass, bgClass } = ICON_MAP[stat.icon];
        return (
          <Card key={stat.id}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] ${bgClass}`}>
              <Icon className={`h-4.5 w-4.5 ${iconClass}`} strokeWidth={1.75} />
            </span>
            <p className="mt-3 text-xs text-muted">{stat.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">{stat.value}</p>
            <p className={`mt-1 font-data text-xs font-semibold ${stat.deltaPositive ? "text-success" : "text-danger"}`}>
              {stat.deltaPositive ? "↑" : "↓"} {stat.deltaLabel}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
