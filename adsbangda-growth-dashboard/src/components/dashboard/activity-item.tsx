import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityEntry } from "@/lib/types";

const THUMB_COLORS = ["bg-amber-200", "bg-orange-200", "bg-stone-300", "bg-amber-300"];

function ActivityThumbnails({ count }: { count: number }) {
  const visible = Math.min(count, 3);
  const overflow = count - visible;
  return (
    <div className="mt-2 flex gap-1.5">
      {Array.from({ length: visible }).map((_, i) => (
        <div key={i} className={cn("h-10 w-10 rounded-[var(--radius-sm)]", THUMB_COLORS[i % THUMB_COLORS.length])} />
      ))}
      {overflow > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-black/[0.05] font-data text-xs font-semibold text-muted">
          +{overflow}
        </div>
      )}
    </div>
  );
}

function ActivityRow({ title, description, done, thumbnailCount }: ActivityEntry) {
  return (
    <li className="flex gap-3">
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          done ? "bg-accent text-white" : "bg-black/10"
        )}
      >
        {done && <Check className="h-3 w-3" strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
        {thumbnailCount ? <ActivityThumbnails count={thumbnailCount} /> : null}
      </div>
    </li>
  );
}

/** "What AdsBangda Did" — a work log grouped by day, not a notification feed. */
export function ActivityList({ items }: { items: ActivityEntry[] }) {
  if (items.length === 0) return null;

  const groups: { day: string; entries: ActivityEntry[] }[] = [];
  for (const item of items) {
    const current = groups[groups.length - 1];
    if (current && current.day === item.day) current.entries.push(item);
    else groups.push({ day: item.day, entries: [item] });
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.day}>
          <p className="mb-2.5 font-data text-[11px] font-semibold uppercase tracking-wider text-accent">{group.day}</p>
          <ul className="space-y-4">
            {group.entries.map((item) => (
              <ActivityRow key={item.id} {...item} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
