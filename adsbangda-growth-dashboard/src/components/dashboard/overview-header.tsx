"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Bell, CheckCircle2, DollarSign, Calendar as CalendarIcon, Inbox } from "lucide-react";
import { MobileMenuButton } from "./app-shell";
import type { AttentionItem } from "@/lib/types";

interface OverviewHeaderProps {
  clientName: string;
  periodLabel: string;
  /** "YYYY-MM" periode yang sedang aktif — dipakai buat highlight opsi terpilih & generate href dropdown. */
  currentPeriod: string;
  attentionItems: AttentionItem[];
}

const ATTENTION_ICON = { approval: CheckCircle2, budget: DollarSign, meeting: CalendarIcon } as const;

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

/** Dropdown generik — tutup sendiri kalau klik di luar area-nya. Dipakai dua-duanya (period picker & notifikasi) biar perilakunya konsisten. */
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

export function OverviewHeader({ clientName, periodLabel, currentPeriod, attentionItems }: OverviewHeaderProps) {
  const [periodOpen, setPeriodOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const periodRef = useClickOutside(() => setPeriodOpen(false));
  const notifRef = useClickOutside(() => setNotifOpen(false));
  const notificationCount = attentionItems.length;
  const periods = recentPeriods();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface/80 px-5 py-4 backdrop-blur lg:px-8">
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
        {/* Period picker — pilih salah satu dari 6 bulan terakhir, navigasi
            ke ?period=YYYY-MM. Cuma memengaruhi Monthly Delivery & Content
            Delivery per platform (dua-duanya konsep "target bulan X"),
            bagian lain di Overview tetap nunjukin data terbaru. */}
        <div className="relative" ref={periodRef}>
          <button
            type="button"
            onClick={() => setPeriodOpen((v) => !v)}
            aria-expanded={periodOpen}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-2 text-sm font-medium text-ink shadow-[var(--shadow-xs)] transition-colors hover:border-ink"
          >
            {periodLabel}
            <ChevronDown className={`h-4 w-4 text-muted transition-transform ${periodOpen ? "rotate-180" : ""}`} strokeWidth={1.75} />
          </button>

          {periodOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface py-1.5 shadow-[var(--shadow-md)]">
              {periods.map((p) => (
                <Link
                  key={p.value}
                  href={p.value === periods[0].value ? "/" : `/?period=${p.value}`}
                  onClick={() => setPeriodOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2 text-sm capitalize transition-colors hover:bg-black/[0.03] ${
                    p.value === currentPeriod ? "font-semibold text-accent" : "text-ink"
                  }`}
                >
                  {p.label}
                  {p.value === currentPeriod && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notifikasi — isinya PERSIS attentionItems yang sama dipakai di
            card "Needs Your Attention" di body Overview, cuma disini
            ditampilkan sebagai dropdown ringkas yang bisa diakses dari
            mana saja tanpa perlu scroll. */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-expanded={notifOpen}
            aria-label="Notifikasi"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface shadow-[var(--shadow-xs)] transition-colors hover:border-ink"
          >
            <Bell className="h-4.5 w-4.5 text-ink" strokeWidth={1.75} />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 font-data text-[10px] font-bold text-white">
                {notificationCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-md)]">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-ink">Notifikasi</p>
              </div>
              {attentionItems.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <Inbox className="h-6 w-6 text-muted" strokeWidth={1.5} />
                  <p className="text-xs text-muted">Tidak ada yang butuh perhatian saat ini.</p>
                </div>
              ) : (
                <div className="max-h-80 divide-y divide-border overflow-y-auto">
                  {attentionItems.map((item) => {
                    const Icon = ATTENTION_ICON[item.icon] ?? CheckCircle2;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setNotifOpen(false)}
                        className="flex items-start gap-2.5 px-4 py-3 transition-colors hover:bg-black/[0.03]"
                      >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                          <p className="mt-0.5 text-xs text-muted">{item.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
