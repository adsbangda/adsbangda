import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-paper border border-border/40 p-0.5",
        className
      )}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent to-blue-500 transition-all duration-500 shadow-xs"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}