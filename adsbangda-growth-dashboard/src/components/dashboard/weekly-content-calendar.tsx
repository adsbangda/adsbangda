import { cn } from "@/lib/utils";
import { Calendar, Music2 } from "lucide-react";
import { InstagramGlyph, FacebookGlyph } from "./platform-icons";
import type { ContentPlatform, WeeklyCalendar } from "@/lib/types";

const PLATFORM_ICON: Record<ContentPlatform, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  instagram_feed: InstagramGlyph,
  instagram_story: InstagramGlyph,
  facebook_post: FacebookGlyph,
  tiktok_post: Music2,
};

export function WeeklyContentCalendar({ calendar }: { calendar: WeeklyCalendar }) {
  const { weekDays, activeIndex, rows, totalLabel } = calendar;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-32" />
              {weekDays.map((day, i) => (
                <th key={day.label} className="pb-3 text-center">
                  <div
                    className={cn(
                      "mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-[var(--radius-md)]",
                      i === activeIndex ? "bg-accent text-white" : "text-muted"
                    )}
                  >
                    <span className="text-[10px] font-medium leading-none">{day.label}</span>
                    <span className="mt-0.5 text-xs font-bold leading-none">{day.date}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const Icon = PLATFORM_ICON[row.platform];
              return (
                <tr key={row.id} className="border-t border-border">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.75} />
                      <span className="text-xs font-medium text-ink">{row.label}</span>
                    </div>
                  </td>
                  {row.counts.map((count, i) => (
                    <td key={i} className="py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] font-data text-xs font-semibold",
                          count === null ? "text-muted/50" : i === activeIndex ? "bg-accent-soft text-accent" : "text-ink"
                        )}
                      >
                        {count ?? "–"}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
          Total Minggu Ini
        </span>
        <span className="font-data text-sm font-bold text-ink">{totalLabel}</span>
      </div>
    </div>
  );
}
