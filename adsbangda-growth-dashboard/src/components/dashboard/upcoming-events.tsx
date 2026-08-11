import { Calendar } from "lucide-react";
import type { UpcomingEvent } from "@/lib/types";

export function UpcomingEvents({ events }: { events: UpcomingEvent[] }) {
  return (
    <div className="divide-y divide-border">
      {events.map((event) => (
        <div key={event.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft">
            <span className="font-data text-sm font-bold leading-none text-accent">{event.day}</span>
            <span className="mt-0.5 font-data text-[9px] font-semibold uppercase tracking-wide text-accent">{event.month}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-ink">{event.title}</p>
            <p className="mt-0.5 text-xs text-muted">{event.timeLabel}</p>
          </div>
          <Calendar className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
        </div>
      ))}
    </div>
  );
}
