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
        "h-2 w-full overflow-hidden rounded-full bg-paper border border-border/50 p-0.5",
        className
      )}
    >
      <div
        className="h-full rounded-full bg-accent transition-all duration-500 shadow-2xs"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}