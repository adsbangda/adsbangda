"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { FormattedNumberInput } from "@/components/dashboard/formatted-number-input";
import { buttonVariants } from "@/components/dashboard/button";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";

function toNumber(raw: string): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export interface WebsitePerformanceFormValues {
  id?: string;
  date?: string;
  visitors?: number | null;
  sessions?: number | null;
  pageViews?: number | null;
  bounceRate?: number | null;
  avgSessionDuration?: string | null;
  conversions?: number | null;
}

/**
 * Form Add/Edit Performance Data (Website) — dipakai untuk KEDUA mode (baris
 * baru & edit baris existing di halaman Admin → Website → Performance),
 * field & urutan sama persis (Row 1: Date, Visitors, Sessions, Page Views —
 * Row 2: Bounce Rate, Avg Session Duration, Leads, Save), cuma beda
 * defaultValue/submitLabel/tombol Cancel.
 *
 * `action` (Server Action) didefinisikan & tetap dijalankan di Server
 * Component pemanggil — TIDAK BERUBAH sama sekali dari sebelumnya, field
 * form yang dibaca lewat `formData.get(...)` namanya persis sama
 * (visitors/sessions/pageViews/bounceRate/avgSessionDuration/conversions).
 * Komponen ini cuma "island" client di atasnya, untuk satu hal: nampilin
 * Conversion Rate LIVE (Leads ÷ Visitors × 100) selagi admin mengetik,
 * tanpa perlu klik Save dulu buat lihat hasilnya.
 *
 * Conversion Rate SENGAJA tidak pernah jadi field form / tidak pernah
 * dikirim ke Server Action — dia cuma angka hasil hitungan lokal di sini
 * (preview), dan dihitung ULANG dari raw data setiap kali ditampilkan di
 * mana pun (di sini maupun di Client Portal), supaya tidak pernah ada dua
 * angka yang bisa tidak sinkron satu sama lain.
 */
export function WebsitePerformanceForm({
  action,
  defaultValues,
  submitLabel = "Save Data",
  showPlusIcon = true,
  extra,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: WebsitePerformanceFormValues;
  submitLabel?: string;
  /** Ikon "+" di tombol submit — dipakai buat form Add, dimatikan buat form Edit (samain sama gaya lama). */
  showPlusIcon?: boolean;
  /** Konten tambahan setelah tombol submit, mis. tombol "Cancel" di mode Edit. */
  extra?: ReactNode;
}) {
  const [visitorsRaw, setVisitorsRaw] = useState(defaultValues?.visitors != null ? String(defaultValues.visitors) : "");
  const [conversionsRaw, setConversionsRaw] = useState(defaultValues?.conversions != null ? String(defaultValues.conversions) : "");
  const [pageViewsRaw, setPageViewsRaw] = useState(defaultValues?.pageViews != null ? String(defaultValues.pageViews) : "");

  const visitors = toNumber(visitorsRaw);
  const conversions = toNumber(conversionsRaw);
  const pageViews = toNumber(pageViewsRaw);
  const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : null;
  // Peringatan lembut (bukan blocking) — secara umum Page Views tidak lebih
  // kecil dari Visitors, tapi tetap boleh disimpan kalau memang begitu
  // datanya (mis. tracking custom di sisi client).
  const showPageViewsWarning = visitors > 0 && pageViews > 0 && pageViews < visitors;

  return (
    <form action={action} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      {/* Row 1 — Date, Visitors, Sessions, Page Views */}
      <input name="date" type="date" defaultValue={defaultValues?.date} required className={inputClass} />
      <FormattedNumberInput
        name="visitors"
        placeholder="Visitors"
        className={inputClass}
        defaultValue={defaultValues?.visitors ?? undefined}
        onValueChange={setVisitorsRaw}
      />
      <FormattedNumberInput name="sessions" placeholder="Sessions" className={inputClass} defaultValue={defaultValues?.sessions ?? undefined} />
      <FormattedNumberInput
        name="pageViews"
        placeholder="Page Views"
        className={inputClass}
        defaultValue={defaultValues?.pageViews ?? undefined}
        onValueChange={setPageViewsRaw}
      />

      {/* Row 2 — Bounce Rate, Avg Session Duration, Leads / Form Submissions, Save */}
      <FormattedNumberInput
        name="bounceRate"
        allowDecimal
        placeholder="Bounce Rate (%)"
        className={inputClass}
        defaultValue={defaultValues?.bounceRate ?? undefined}
      />
      <input
        name="avgSessionDuration"
        defaultValue={defaultValues?.avgSessionDuration ?? ""}
        placeholder="Avg Session Duration (2m 15s)"
        className={inputClass}
      />
      <FormattedNumberInput
        name="conversions"
        placeholder="Leads / Form Submissions"
        className={inputClass}
        defaultValue={defaultValues?.conversions ?? undefined}
        onValueChange={setConversionsRaw}
      />
      <div className="flex gap-2">
        <button type="submit" className={buttonVariants({ variant: "primary", size: "sm", className: "justify-center" })}>
          {showPlusIcon && <Plus className="h-3.5 w-3.5" />} {submitLabel}
        </button>
        {extra}
      </div>

      {/* Live preview — dihitung di client dari nilai Visitors & Leads saat ini, TIDAK PERNAH dikirim sebagai field form. */}
      <p className="col-span-full font-data text-[11px] text-muted">
        Conversion Rate: <span className="font-bold text-ink">{conversionRate != null ? `${conversionRate.toFixed(2)}%` : "—"}</span>
        <span className="ml-1.5 text-muted/70">(otomatis dari Leads ÷ Visitors — tidak perlu diisi manual)</span>
      </p>
      {showPageViewsWarning && (
        <p className="col-span-full font-data text-[11px] text-warning">
          ⚠ Page Views ({pageViews.toLocaleString("id-ID")}) lebih kecil dari Visitors ({visitors.toLocaleString("id-ID")}) — cek lagi datanya, tapi tetap boleh disimpan kalau memang benar begitu.
        </p>
      )}
    </form>
  );
}
