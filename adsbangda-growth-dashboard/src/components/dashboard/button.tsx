import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "dark" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-2",
  dark: "bg-ink text-white hover:bg-accent",
  outline: "border border-ink/80 text-ink hover:bg-ink hover:text-paper",
  ghost: "text-muted hover:bg-black/[0.04] hover:text-ink",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-xs",
};

/**
 * Returns the class string for a button-like element. Exported separately
 * from `Button` so the same visual language can be applied to `<a>` /
 * `next/link` elements that need to look like buttons.
 */
export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    className
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={buttonVariants({ variant, size, className })} {...props} />;
}
