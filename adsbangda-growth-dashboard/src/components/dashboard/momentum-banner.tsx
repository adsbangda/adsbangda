import { TrendingUp, ArrowRight } from "lucide-react";
import { buttonVariants } from "./button";

interface MomentumBannerProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export function MomentumBanner({ title, description, actionLabel, actionHref }: MomentumBannerProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] bg-accent-soft px-6 py-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <TrendingUp className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-xs text-muted">{description}</p>
        </div>
      </div>
      <a href={actionHref} className={buttonVariants({ variant: "primary" })}>
        {actionLabel} <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
