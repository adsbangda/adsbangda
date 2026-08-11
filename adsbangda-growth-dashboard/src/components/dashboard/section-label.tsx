// Motif visual khas Growth OS: aksen bar tipis + label mono uppercase.
// Ini "fingerprint" yang dipakai konsisten di setiap section pengganti
// card — supaya section punya identitas tanpa perlu dibungkus kotak.
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="h-3.5 w-[3px] shrink-0 rounded-full bg-gradient-to-b from-accent-2 to-accent" />
      <span className="font-data text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {children}
      </span>
    </div>
  );
}
