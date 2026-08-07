"use client";

import { Search, Settings, Moon, Bell } from "lucide-react";

export function Topbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="flex flex-col gap-4 px-6 pt-6 pb-2 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          readOnly
          placeholder="Cari campaign, laporan, atau data..."
          className="w-full rounded-2xl border border-border bg-paper-deep pl-10 pr-4 py-2 font-body text-xs text-ink placeholder:text-muted/70 shadow-xs focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-paper-deep text-ink shadow-xs transition-colors hover:bg-paper"
          >
            <Settings className="h-4 w-4 text-muted" />
          </button>
          <button
            type="button"
            title="Theme"
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-paper-deep text-ink shadow-xs transition-colors hover:bg-paper"
          >
            <Moon className="h-4 w-4 text-muted" />
          </button>
          <button
            type="button"
            title="Notifikasi"
            className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-paper-deep text-ink shadow-xs transition-colors hover:bg-paper"
          >
            <Bell className="h-4 w-4 text-muted" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent ring-2 ring-paper-deep" />
          </button>
        </div>

        {/* User Pill Badge */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-paper-deep px-3 py-1.5 shadow-xs">
          <span className="text-xs font-semibold text-ink">Client Admin</span>
          <div className="h-7 w-7 rounded-full bg-[#1D4ED8] p-0.5 flex items-center justify-center text-white font-data text-[10px] font-bold">
            CA
          </div>
        </div>
      </div>
    </header>
  );
}