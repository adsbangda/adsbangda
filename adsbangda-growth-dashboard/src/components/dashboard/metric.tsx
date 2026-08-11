import { cn } from "@/lib/utils";

interface MetricProps {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down" };
  context?: string;
  size?: "lg" | "md";
}

// Metrik "telanjang" tanpa card border/shadow — dipakai saat beberapa
// metrik berjejer perlu terasa sebagai satu kelompok data, bukan kotak-kotak
// terpisah. Card tetap dipakai di tempat lain yang groupingnya bermakna.
export function Metric({ label, value, delta, context, size = "md" }: MetricProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p
        className={cn(
          "mt-1.5 font-data font-semibold tracking-tight text-ink",
          size === "lg" ? "text-3xl" : "text-2xl"
        )}
      >
        {value}
      </p>
      <div className="mt-1.5 flex items-center gap-1.5">
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-data text-xs font-semibold",
              delta.direction === "up" ? "text-success" : "text-danger"
            )}
          >
            {delta.direction === "up" ? "↑" : "↓"} {delta.value}
          </span>
        )}
        {context && <span className="text-xs text-muted">{context}</span>}
      </div>
    </div>
  );
}
