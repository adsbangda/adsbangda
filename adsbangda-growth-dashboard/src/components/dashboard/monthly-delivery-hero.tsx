import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";
import { CircularProgress } from "./circular-progress";
import { DELIVERY_ICON_MAP } from "./delivery-icon";
import type { DeliveryStatus, DeliveryMetricItem, MonthlyDeliveryMeta } from "@/lib/types";

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  on_track: "On Track",
  at_risk: "At Risk",
  completed: "Completed",
  delayed: "Delayed",
};

const STATUS_DOT: Record<DeliveryStatus, string> = {
  on_track: "bg-accent",
  at_risk: "bg-warning",
  completed: "bg-success",
  delayed: "bg-danger",
};

function DeliveryItemCard({ item }: { item: DeliveryMetricItem }) {
  const { Icon, iconClass, bgClass } = DELIVERY_ICON_MAP[item.icon];
  const pct = item.target > 0 ? Math.min(100, Math.round((item.completed / item.target) * 100)) : 0;

  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)]", bgClass)}>
          <Icon className={cn("h-4 w-4", iconClass)} strokeWidth={2} />
        </span>
        <span className="truncate text-xs font-medium text-muted">{item.label}</span>
      </div>
      <p className="mt-3 font-display text-xl font-bold leading-none text-ink">
        {item.completed} <span className="text-sm font-medium text-muted">/ {item.target}</span>
      </p>
      <p className="mt-1 text-xs text-muted">{item.unit}</p>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-data text-[11px] text-muted">{pct}%</span>
      </div>
    </div>
  );
}

interface MonthlyDeliveryHeroProps {
  periodLabel: string;
  overallPct: number;
  status: DeliveryStatus;
  helperText: string;
  items: DeliveryMetricItem[];
  meta: MonthlyDeliveryMeta;
}

export function MonthlyDeliveryHero({ periodLabel, overallPct, status, helperText, items, meta }: MonthlyDeliveryHeroProps) {
  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-data text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Progress Bulan Ini</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{periodLabel}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-data text-[11px] font-semibold text-accent">
              <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>
        <p className="max-w-xs text-right text-xs leading-relaxed text-muted">{helperText}</p>
      </div>

      <div className="mt-7 flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="flex justify-center lg:justify-start">
          <CircularProgress value={overallPct} label="Progress" sublabel="Keseluruhan" />
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <DeliveryItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-xs text-muted">
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Periode</p>
            <p className="mt-0.5 font-medium text-ink">{meta.periodRange}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Update Terakhir</p>
            <p className="mt-0.5 font-medium text-ink">{meta.lastUpdated}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">Target Disepakati</p>
            <p className="mt-0.5 font-medium text-ink">{meta.agreedDate}</p>
          </div>
        </div>
        <a href={meta.contractHref} className="inline-flex shrink-0 items-center gap-1 font-data text-xs font-semibold text-accent hover:underline">
          Lihat Detail Kontrak <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </Card>
  );
}
