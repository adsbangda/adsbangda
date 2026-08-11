import { cn } from "@/lib/utils";

export type ActivityTone = "success" | "accent" | "warning" | "muted";

const DOT_CLASSES: Record<ActivityTone, string> = {
  success: "bg-success",
  accent: "bg-accent",
  warning: "bg-warning",
  muted: "bg-muted",
};

export interface ActivityEntry {
  id: string;
  day: string;
  time: string;
  actor: string;
  action: string;
  tone: ActivityTone;
}

function ActivityRow({ actor, action, time, tone }: ActivityEntry) {
  return (
    <li className="flex gap-3">
      <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", DOT_CLASSES[tone])} />
      <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
        <p className="text-sm text-ink">
          <span className="font-semibold">{actor}</span> {action}
        </p>
        <span className="shrink-0 font-data text-[11px] text-muted">{time}</span>
      </div>
    </li>
  );
}

/**
 * "What AdsBangda Did" (spec §9) — a refined work log grouped by day, not a
 * generic notification feed. Entries are expected in chronological order;
 * consecutive entries sharing the same `day` are grouped under one heading.
 */
export function ActivityList({ items }: { items: ActivityEntry[] }) {
  if (items.length === 0) return null;

  const groups: { day: string; entries: ActivityEntry[] }[] = [];
  for (const item of items) {
    const current = groups[groups.length - 1];
    if (current && current.day === item.day) {
      current.entries.push(item);
    } else {
      groups.push({ day: item.day, entries: [item] });
    }
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.day}>
          <p className="mb-2.5 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">{group.day}</p>
          <ul className="space-y-3">
            {group.entries.map((item) => (
              <ActivityRow key={item.id} {...item} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
