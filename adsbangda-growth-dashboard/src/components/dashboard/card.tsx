import { cn } from "@/lib/utils";

const PADDING: Record<"sm" | "md" | "lg", string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-6 lg:p-8",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
  /** Set false for containers that manage their own padding (e.g. tables). */
  interactive?: boolean;
}

/**
 * Base surface used across the Client Portal: subtle border, restrained
 * radius, soft shadow instead of heavy elevation. This is the single
 * building block every section/panel should use instead of one-off
 * `rounded-* border bg-surface shadow-*` strings.
 */
export function Card({ className, padding = "md", interactive = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-sm)]",
        interactive && "transition-shadow hover:shadow-[var(--shadow-md)]",
        PADDING[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
