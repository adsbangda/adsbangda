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
  actor: string;
  action: string;
  time: string;
  tone: ActivityTone;
}

/**
 * Single row in the "What AdsBangda Did" timeline — the portal's core
 * differentiator (spec §14). Kept as a plain, calm list: a dot, who did
 * what, and when. No decorative motion.
 */
export function ActivityItem({ actor, action, time, tone }: ActivityEntry) {
  return (
    <li className="flex gap-3">
      <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", DOT_CLASSES[tone])} />
      <div className="min-w-0">
        <p className="text-sm text-ink">
          <span className="font-semibold">{actor}</span> {action}
        </p>
        <p className="mt-0.5 font-data text-[11px] text-muted">{time}</p>
      </div>
    </li>
  );
}

export function ActivityList({ items }: { items: ActivityEntry[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <ActivityItem key={item.id} {...item} />
      ))}
    </ul>
  );
}
