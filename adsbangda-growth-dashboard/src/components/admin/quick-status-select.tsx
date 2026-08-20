"use client";

import { useTransition } from "react";
import type { ContentStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "waiting_approval", label: "Minta Approval" },
  { value: "published", label: "Published" },
];

/**
 * Dropdown status yang langsung submit begitu diubah — "terasa seperti
 * mengedit spreadsheet" (brief), tanpa perlu buka mode edit penuh dulu
 * cuma buat ganti status. Cuma 3 pilihan (Draft → Minta Approval →
 * Published) sesuai alur kerja — kalau record lama masih pakai status di
 * luar itu (in_production/approved/scheduled), tetap ditampilkan sebagai
 * opsi tambahan biar nggak "hilang", tapi nggak ditawarkan buat konten baru.
 */
export function QuickStatusSelect({ contentId, defaultValue, action }: { contentId: string; defaultValue: ContentStatus; action: (id: string, status: ContentStatus) => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const isLegacy = !STATUS_OPTIONS.some((o) => o.value === defaultValue);

  return (
    <select
      defaultValue={defaultValue}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value as ContentStatus;
        startTransition(() => {
          action(contentId, value);
        });
      }}
      className="rounded-[var(--radius-sm)] border border-transparent bg-transparent px-1.5 py-1 font-data text-xs text-ink outline-none transition-colors hover:border-border focus:border-ink disabled:opacity-50"
    >
      {isLegacy && <option value={defaultValue}>{defaultValue} (lama)</option>}
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
