import type { LucideIcon } from "lucide-react";

interface HeroStatProps {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
}

export function HeroStat({ label, value, delta, icon: Icon }: HeroStatProps) {
  return (
    <div className="rounded-[var(--radius-md)] bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-white/70">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 font-data text-xl font-bold text-white">{value}</p>
      {delta && <p className="mt-0.5 text-[11px] text-blue-200">{delta}</p>}
    </div>
  );
}
