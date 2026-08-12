"use client";

import { useTransition } from "react";
import type { ContentStatus } from "@/lib/types";

const STATUS_OPTIONS: ContentStatus[] = ["draft", "in_production", "waiting_approval", "approved", "scheduled", "published"];

/**
 * Dropdown status yang langsung submit begitu diubah — "terasa seperti
 * mengedit spreadsheet" (brief), tanpa perlu buka mode edit penuh dulu
 * cuma buat ganti status.
 */
export function QuickStatusSelect({ contentId, defaultValue, action }: { contentId: string; defaultValue: ContentStatus; action: (id: string, status: ContentStatus) => Promise<void> }) {
  const [pending, startTransition] = useTransition();

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
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
