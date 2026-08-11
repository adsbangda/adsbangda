"use client";

import { cn } from "@/lib/utils";

export interface TabOption {
  value: string;
  label: string;
}

interface TabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Compact segmented control — used for date ranges and similar view switches. */
export function Tabs({ options, value, onChange, className }: TabsProps) {
  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-[var(--radius-md)] border border-border bg-black/[0.02] p-1", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-[var(--radius-sm)] px-3 py-1.5 font-data text-[11px] font-semibold transition-colors",
              active ? "bg-white text-ink shadow-[var(--shadow-xs)]" : "text-muted hover:text-ink"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
