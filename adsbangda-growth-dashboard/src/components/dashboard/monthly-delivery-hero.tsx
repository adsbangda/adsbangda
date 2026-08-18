import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";
import { CylinderProgress } from "./cylinder-progress";
import type { DeliveryStatus, MonthlyDeliveryMeta } from "@/lib/types";

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

interface MonthlyDeliveryHeroProps {
  periodLabel: string;
  overallPct: number;
  status: DeliveryStatus;
  helperText: string;
  meta: MonthlyDeliveryMeta;
}

/**
 * Ringkasan progress bulanan — sengaja HANYA cylinder + persen + status +
 * periode, tanpa breakdown per-item (dulu ada grid item di sini). Breakdown
 * per platform sekarang jadi tanggung jawab card "Social Media Performance"
 * terpisah di Overview (lihat social-media-performance.tsx) supaya tidak
 * dobel — sesuai referensi desain yang memisahkan dua card ini.
 */
export function MonthlyDeliveryHero({ periodLabel, overallPct, status, helperText, meta }: MonthlyDeliveryHeroProps) {
  return (
    <Card padding="lg" className="h-full">
      <p className="font-data text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Progress Keseluruhan</p>

      <div className="mt-5 flex items-center gap-5">
        <CylinderProgress value={overallPct} />
        <div>
          <p className="font-display text-4xl font-extrabold leading-none tracking-tight text-ink">{Math.round(overallPct)}%</p>
          <p className="mt-1.5 text-sm text-muted">Progress</p>
          <p className="text-sm text-muted">Keseluruhan</p>
          <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-data text-[11px] font-semibold text-accent">
            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">{helperText}</p>

      <div className="mt-5 border-t border-border pt-4 text-xs text-muted">
        <p className="text-[11px] uppercase tracking-wide text-muted">Periode</p>
        <p className="mt-0.5 font-medium text-ink">{periodLabel}</p>
      </div>

      <a href={meta.contractHref} className="mt-3 inline-flex items-center gap-1 font-data text-xs font-semibold text-accent hover:underline">
        Lihat Detail Kontrak <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </Card>
  );
}
