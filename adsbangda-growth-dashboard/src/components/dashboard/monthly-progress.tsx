import { Card } from "./card";
import { ProgressBar } from "./progress-bar";

export interface MonthlyProgressCategory {
  label: string;
  pct: number;
}

interface MonthlyProgressProps {
  periodLabel: string;
  overallPct: number;
  categories: MonthlyProgressCategory[];
}

/**
 * Visual system for "Monthly Contract / Delivery Progress" (see spec §11–12).
 * Deliberately generic — it renders whatever categories/percentages it is
 * given, so different clients with different contracted deliverables can
 * reuse it without any component change once real data is wired up later.
 */
export function MonthlyProgress({ periodLabel, overallPct, categories }: MonthlyProgressProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-data text-[11px] font-semibold uppercase tracking-wider text-muted">{periodLabel}</p>
          <h2 className="mt-1 text-base font-bold text-ink">Monthly Progress</h2>
        </div>
        <div className="text-right">
          <p className="font-data text-3xl font-bold leading-none text-ink">{overallPct}%</p>
          <p className="mt-1 text-[11px] text-muted">Overall Progress</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {categories.map((c) => (
          <div key={c.label}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-ink">{c.label}</span>
              <span className="font-data text-xs text-muted">{c.pct}%</span>
            </div>
            <ProgressBar value={c.pct} />
          </div>
        ))}
      </div>
    </Card>
  );
}
