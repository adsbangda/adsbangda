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
        "h-2 w-full overflow-hidden rounded-full bg-[#FAFAFA] border border-[#ECECEC]",
        className
      )}
    >
      <div
        className="h-full rounded-full bg-[#1D4ED8] transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}