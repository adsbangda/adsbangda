"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Bell } from "lucide-react";
import { MobileMenuButton } from "./app-shell";

interface OverviewHeaderProps {
  clientName: string;
  periodLabel: string;
  /** "YYYY-MM" periode yang sedang aktif — dipakai buat highlight opsi terpilih, batas min/max date input, & generate href dropdown. */
  currentPeriod: string;
  /** Rentang tanggal custom yang lagi aktif ("YYYY-MM-DD"), kalau ada — dipakai buat pre-fill input & label tombol. */
  dateFrom?: string;
  dateTo?: string;
  hasAttention: boolean;
}

/** 6 bulan terakhir (termasuk bulan berjalan) — dropdown period picker generate rolling window, bukan query semua periode yang pernah ada di DB (lebih sederhana & cukup untuk kebutuhan "lihat progress bulan lalu"). */
function recentPeriods(count = 6): { value: string; label: string }[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(d);
    return { value, label };
  });
}

function monthBounds(period: string): { min: string; max: string } {
  const [y, m] = period.split("-").map(Number);
  const min = `${period}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const max = `${period}-${String(lastDay).padStart(2, "0")}`;
  return { min, max };
}

function formatRangeLabel(from: string, to: string): string {
  const fmt = (iso: string, withYear: boolean) =>
    new Intl.DateTimeFormat("id-ID", { day: "numeric", month: withYear ? "long" : "short", year: withYear ? "numeric" : undefined }).format(new Date(`${iso}T00:00:00`));
  return `${fmt(from, false)} – ${fmt(to, true)}`;
}

/** Dropdown generik — tutup sendiri kalau klik di luar area-nya. */
function useClickOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

export function OverviewHeader({ clientName, periodLabel, currentPeriod, dateFrom, dateTo, hasAttention }: OverviewHeaderProps) {
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useClickOutside(() => setPeriodOpen(false));
  const periods = recentPeriods();
  const { min, max } = monthBounds(currentPeriod);
  const hasCustomRange = !!dateFrom && !!dateTo;
  const buttonLabel = hasCustomRange ? formatRangeLabel(dateFrom!, dateTo!) : periodLabel;

  return (
    // z-20 + relative DI SINI (bukan cuma di dropdown-nya) — supaya dropdown
    // yang di-render sebagai children pasti tampil DI ATAS card apa pun yang
    // ada di bawahnya di alur halaman (mis. Channel Overview yang sekarang
    // jadi card pertama tepat di bawah header ini), bukan ketutup/ketimpa.
    //
    // PAKAI "z-20!" (bukan "z-20" polos) — SENGAJA, karena ada CSS global
    // `.page-backdrop > *` (globals.css) yang otomatis kasih z-index:1 ke
    // SEMUA anak langsung page-backdrop (termasuk header ini), dan aturan
    // itu di-definisikan SETELAH utility Tailwind di stylesheet — jadi
    // z-20 biasa kalah/ketimpa balik jadi 1 walau ditulis di JSX. "z-20!"
    // (syntax important modifier Tailwind v4 — tanda "!" di BELAKANG nama
    // utility, beda dari v3 yang di depan) memaksa menang dari override itu.
    <div className="relative z-20! flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface/80 px-5 py-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        {/* Tanpa ini, sidebar desktop (hidden di bawah breakpoint lg) tidak
            bisa dibuka sama sekali di tablet/HP — drawer-nya sudah ada di
            AppShell, cuma tombol pemicunya kelewat dipasang di header ini. */}
        <MobileMenuButton />
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-ink lg:text-2xl">Halo, {clientName} 👋</h1>
          <p className="mt-0.5 text-sm text-muted">Berikut ringkasan progres pekerjaan AdsBangda untuk bulan ini.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Period & date-range picker — pilih bulan (6 bulan terakhir) ATAU
            rentang tanggal spesifik di dalam bulan itu (mis. tanggal 1–10).
            Cuma memengaruhi Monthly Delivery & "What AdsBangda Did" (dua-
            duanya konsep "aktivitas/konten pada tanggal tertentu") — bagian
            lain di Overview (Meta Ads, Website, Platform Performance dst)
            tetap nunjukin snapshot performance TERBARU apa pun yang dipilih
            di sini, karena itu bukan data yang "terjadi pada tanggal X". */}
        <div className="relative" ref={periodRef}>
          <button
            type="button"
            onClick={() => setPeriodOpen((v) => !v)}
            aria-expanded={periodOpen}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2 text-sm font-medium text-ink shadow-[var(--shadow-xs)] transition-colors hover:border-ink"
          >
            {buttonLabel}
            <ChevronDown className={`h-4 w-4 text-muted transition-transform ${periodOpen ? "rotate-180" : ""}`} strokeWidth={1.75} />
          </button>

          {periodOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-md)]">
              <div className="py-1.5">
                {periods.map((p) => (
                  <Link
                    key={p.value}
                    href={p.value === periods[0].value ? "/" : `/?period=${p.value}`}
                    onClick={() => setPeriodOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2 text-sm capitalize transition-colors hover:bg-black/[0.03] ${
                      p.value === currentPeriod && !hasCustomRange ? "font-semibold text-accent" : "text-ink"
                    }`}
                  >
                    {p.label}
                    {p.value === currentPeriod && !hasCustomRange && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </Link>
                ))}
              </div>

              {/* Rentang tanggal custom di dalam bulan yang lagi dipilih di atas —
                  native <input type="date"> browser sudah punya kalender bawaan,
                  jadi tidak perlu bikin komponen kalender kustom dari nol. Submit
                  via GET form biasa (bukan JS fetch) supaya URL-nya
                  ?period=...&from=...&to=... langsung ke-generate otomatis oleh
                  browser dari nama field di bawah. */}
              <form action="/" method="get" className="border-t border-border p-3.5">
                <p className="mb-2 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Atau pilih rentang tanggal</p>
                <input type="hidden" name="period" value={currentPeriod} />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    name="from"
                    defaultValue={dateFrom ?? min}
                    min={min}
                    max={max}
                    required
                    className="w-full min-w-0 rounded-[var(--radius-sm)] border border-border px-2 py-1.5 text-xs text-ink outline-none focus:border-ink"
                  />
                  <span className="shrink-0 text-xs text-muted">–</span>
                  <input
                    type="date"
                    name="to"
                    defaultValue={dateTo ?? max}
                    min={min}
                    max={max}
                    required
                    className="w-full min-w-0 rounded-[var(--radius-sm)] border border-border px-2 py-1.5 text-xs text-ink outline-none focus:border-ink"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2.5 w-full rounded-[var(--radius-sm)] bg-ink px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent"
                >
                  Terapkan
                </button>
                {hasCustomRange && (
                  <Link
                    href={`/?period=${currentPeriod}`}
                    onClick={() => setPeriodOpen(false)}
                    className="mt-1.5 flex items-center justify-center text-xs text-muted hover:text-ink hover:underline"
                  >
                    Reset ke satu bulan penuh
                  </Link>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Notifikasi — SEKARANG cuma indikator visual (titik/badge merah
            kalau ada yang butuh perhatian), BUKAN lagi dropdown yang bisa
            diklik. Detailnya sendiri sudah selalu kelihatan di card "Needs
            Your Attention" & "What AdsBangda Did" di body Overview, jadi
            dropdown terpisah di sini cuma duplikasi — cukup jadi penanda
            "ada info baru" yang mengarahkan mata ke bawah, bukan tempat baca
            detailnya. */}
        <span
          aria-label={hasAttention ? "Ada yang butuh perhatian — lihat card Needs Your Attention" : "Tidak ada yang butuh perhatian"}
          title={hasAttention ? "Ada yang butuh perhatian — lihat card Needs Your Attention" : "Tidak ada yang butuh perhatian"}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface shadow-[var(--shadow-xs)]"
        >
          <Bell className="h-4.5 w-4.5 text-ink" strokeWidth={1.75} />
          {hasAttention && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-accent" />}
        </span>
      </div>
    </div>
  );
}
