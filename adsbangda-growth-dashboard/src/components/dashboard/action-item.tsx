import { ChevronRight, FileCheck, Wallet, CalendarClock } from "lucide-react";
import type { AttentionItem } from "@/lib/types";

const ICON_MAP: Record<AttentionItem["icon"], { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; iconClass: string; bgClass: string }> = {
  approval: { Icon: FileCheck, iconClass: "text-accent", bgClass: "bg-accent-soft" },
  budget: { Icon: Wallet, iconClass: "text-success", bgClass: "bg-success-soft" },
  meeting: { Icon: CalendarClock, iconClass: "text-purple-600", bgClass: "bg-purple-50" },
};

export function ActionItem({ icon, title, description, href, countBadge }: AttentionItem) {
  const { Icon, iconClass, bgClass } = ICON_MAP[icon];
  return (
    <a href={href} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${bgClass}`}>
        <Icon className={`h-4.5 w-4.5 ${iconClass}`} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-ink">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
      {countBadge ? (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-danger px-1.5 font-data text-[11px] font-semibold text-white">
          {countBadge}
        </span>
      ) : null}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
    </a>
  );
}
