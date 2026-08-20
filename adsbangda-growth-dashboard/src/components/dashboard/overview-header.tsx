"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { MobileMenuButton } from "./app-shell";

interface OverviewHeaderProps {
  clientName: string;
  periodLabel: string;
  /** "YYYY-MM" periode yang sedang aktif — dipakai buat bulan default kalender & generate href. */
  currentPeriod: string;
  /** Rentang tanggal custom yang lagi aktif ("YYYY-MM-DD"), kalau ada — dipakai buat pre-select kalender & label tombol. */
  dateFrom?: string;
  dateTo?: string;
  hasAttention: boolean;
}

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISO(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function formatRangeLabel(from: string, to: string): string {
  const fmt = (iso: string, withYear: boolean) =>
    new Intl.DateTimeFormat("id-ID", { day: "numeric", month: withYear ? "long" : "short", year: withYear ? "numeric" : undefined }).format(new Date(`${iso}T00:00:00`));
  return from === to ? fmt(from, true) : `${fmt(from, false)} – ${fmt(to, true)}`;
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
  const router = useRouter();
  const [periodOpen, setPeriodOpen] = useState(false);
  const periodRef = useClickOutside(() => setPeriodOpen(false));

  // Bulan yang lagi ditampilkan di grid kalender — BISA beda dari `currentPeriod`
  // (misal user klik panah ‹ › buat lihat-lihat bulan lain dulu SEBELUM klik
  // tanggal & Terapkan) — cuma state tampilan lokal, belum mengubah data
  // apa pun sampai user benar-benar klik Terapkan.
  const [viewYear, viewMonthState] = (dateFrom ?? `${currentPeriod}-01`).split("-").map(Number);
  const [viewMonth, setViewMonth] = useState({ year: viewYear, month: viewMonthState - 1 });

  // Tanggal yang lagi dipilih di kalender (belum tentu sudah "Terapkan") —
  // klik pertama = mulai seleksi baru, klik kedua = jadi rentang, klik
  // sekali lagi setelah rentang lengkap = mulai seleksi baru lagi.
  const [selStart, setSelStart] = useState<string | null>(dateFrom ?? null);
  const [selEnd, setSelEnd] = useState<string | null>(dateTo ?? null);

  const hasCustomRange = !!dateFrom && !!dateTo;
  const buttonLabel = hasCustomRange ? formatRangeLabel(dateFrom!, dateTo!) : periodLabel;
  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(viewMonth.year, viewMonth.month, 1));

  function handleDayClick(iso: string) {
    if (!selStart || (selStart && selEnd)) {
      // Belum ada seleksi, atau seleksi sebelumnya sudah lengkap (2 tanggal)
      // → mulai seleksi baru dari tanggal yang baru diklik ini.
      setSelStart(iso);
      setSelEnd(null);
    } else {
      // Sudah ada 1 tanggal terpilih (selStart), ini klik kedua → jadi
      // rentang. Urutan dibalik otomatis kalau tanggal kedua lebih awal.
      if (iso < selStart) {
        setSelEnd(selStart);
        setSelStart(iso);
      } else {
        setSelEnd(iso);
      }
    }
  }

  function applySelection() {
    if (!selStart) return;
    const from = selStart;
    const to = selEnd ?? selStart;
    // Diturunkan dari `from` (bukan `viewMonth`) — SENGAJA, supaya tetap
    // konsisten walau user sempat geser bulan pakai panah ‹ › di antara
    // klik tanggal pertama & kedua (viewMonth bisa beda dari bulan asal
    // `selStart` dalam skenario itu).
    const period = from.slice(0, 7);
    router.push(`/?period=${period}&from=${from}&to=${to}`);
    setPeriodOpen(false);
  }

  function resetToFullMonth() {
    const period = `${viewMonth.year}-${pad(viewMonth.month + 1)}`;
    setSelStart(null);
    setSelEnd(null);
    router.push(period === currentPeriod && !hasCustomRange ? "/" : `/?period=${period}`);
    setPeriodOpen(false);
  }

  function changeMonth(delta: number) {
    setViewMonth((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  // Grid kalender bulan yang lagi ditampilkan — sel kosong (null) di awal
  // buat nge-geser hari pertama ke kolom weekday yang benar (Minggu = 0).
  const firstWeekday = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => toISO(viewMonth.year, viewMonth.month, i + 1))];

  return (
    // z-20! (bukan z-20 polos) — SENGAJA, karena ada CSS global
    // `.page-backdrop > *` (globals.css) yang otomatis kasih z-index:1 ke
    // SEMUA anak langsung page-backdrop (termasuk header ini), didefinisikan
    // SETELAH utility Tailwind, jadi z-20 biasa ketimpa balik jadi 1. "z-20!"
    // (important modifier Tailwind v4 — tanda "!" di BELAKANG nama utility)
    // memaksa menang dari override itu, supaya dropdown kalender tampil DI
    // ATAS card apa pun di bawahnya (mis. Channel Overview).
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
        {/* Kalender — klik 1 tanggal buat lihat hari itu saja, atau klik 2
            tanggal buat lihat rentangnya. Cuma memengaruhi Monthly Delivery
            & "What AdsBangda Did" (konsep "terjadi pada tanggal tertentu")
            — Meta Ads/Website/Platform Performance tetap nunjukin snapshot
            performance TERBARU apa pun yang dipilih di sini. */}
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
            <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-[var(--radius-md)] border border-border bg-surface p-3.5 shadow-[var(--shadow-md)]">
              <div className="mb-3 flex items-center justify-between">
                <button type="button" onClick={() => changeMonth(-1)} aria-label="Bulan sebelumnya" className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/[0.05] hover:text-ink">
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                </button>
                <p className="text-sm font-semibold capitalize text-ink">{monthLabel}</p>
                <button type="button" onClick={() => changeMonth(1)} aria-label="Bulan berikutnya" className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/[0.05] hover:text-ink">
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-y-1 text-center">
                {WEEKDAYS.map((d) => (
                  <span key={d} className="font-data text-[10px] font-semibold text-muted">
                    {d}
                  </span>
                ))}
                {cells.map((iso, i) => {
                  if (!iso) return <span key={i} />;
                  const isStart = iso === selStart;
                  const isEnd = iso === selEnd;
                  const inRange = !!selStart && !!selEnd && iso > selStart && iso < selEnd;
                  const isToday = iso === toISO(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => handleDayClick(iso)}
                      className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full font-data text-xs transition-colors ${
                        isStart || isEnd
                          ? "bg-accent font-bold text-white"
                          : inRange
                            ? "bg-accent-soft text-accent"
                            : isToday
                              ? "font-semibold text-accent"
                              : "text-ink hover:bg-black/[0.05]"
                      }`}
                    >
                      {Number(iso.slice(-2))}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                <p className="text-xs text-muted">{selStart ? formatRangeLabel(selStart, selEnd ?? selStart) : "Pilih tanggal"}</p>
                {(selStart || hasCustomRange) && (
                  <button type="button" onClick={resetToFullMonth} className="text-xs text-muted underline hover:text-ink">
                    Reset
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={applySelection}
                disabled={!selStart}
                className="mt-2 w-full rounded-[var(--radius-sm)] bg-ink px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                Terapkan
              </button>
            </div>
          )}
        </div>

        {/* Notifikasi — cuma indikator visual (titik kalau ada yang butuh
            perhatian), BUKAN dropdown — detailnya sudah selalu kelihatan di
            card "Needs Your Attention" & "What AdsBangda Did" di body. */}
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
