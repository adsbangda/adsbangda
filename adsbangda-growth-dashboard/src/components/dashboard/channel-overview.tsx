import { Users, Music2, Infinity as InfinityIcon, Globe } from "lucide-react";
import { InstagramGlyph, FacebookGlyph } from "./platform-icons";
import { Sparkline } from "./sparkline";
import type { ChannelIcon, ChannelOverviewRow } from "@/lib/types";

const ICON_MAP: Record<ChannelIcon, { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; iconClass: string; bgClass: string }> = {
  instagram: { Icon: InstagramGlyph, iconClass: "text-pink-600", bgClass: "bg-pink-50" },
  facebook: { Icon: FacebookGlyph, iconClass: "text-blue-600", bgClass: "bg-blue-50" },
  tiktok: { Icon: Music2, iconClass: "text-ink", bgClass: "bg-black/5" },
  reach: { Icon: Users, iconClass: "text-accent", bgClass: "bg-accent-soft" },
  meta_ads: { Icon: InfinityIcon, iconClass: "text-accent", bgClass: "bg-accent-soft" },
  website: { Icon: Globe, iconClass: "text-emerald-600", bgClass: "bg-emerald-50" },
};

export function ChannelOverview({ rows }: { rows: ChannelOverviewRow[] }) {
  return (
    <div className="divide-y divide-border">
      {rows.map((row) => {
        const { Icon, iconClass, bgClass } = ICON_MAP[row.icon];
        return (
          <div key={row.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${bgClass}`}>
              <Icon className={`h-4 w-4 ${iconClass}`} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{row.label}</p>
              <p className="text-[11px] text-muted">{row.metricLabel}</p>
            </div>
            <div className="text-right">
              <p className="font-data text-sm font-bold text-ink">{row.value}</p>
              <p className="font-data text-[11px] font-medium text-success">{row.deltaLabel}</p>
            </div>
            <Sparkline data={row.sparkline} />
          </div>
        );
      })}
    </div>
  );
}
