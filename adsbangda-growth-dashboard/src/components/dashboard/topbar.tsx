"use client";

import { useState } from "react";
import { DEMO_MODE } from "@/lib/data";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Command,
} from "lucide-react";

export function Topbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const [isDark, setIsDark] = useState(false);
  const [hasNotification] = useState(true);

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-border bg-paper-deep/80 backdrop-blur-md px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      {/* Title & Greeting */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
          {DEMO_MODE && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 font-data text-[10px] font-semibold text-amber-700 border border-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Demo Mode
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{formattedDate}</span>
          {subtitle && (
            <>
              <span className="text-border">•</span>
              <span>{subtitle}</span>
            </>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search Bar Placeholder */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            readOnly
            placeholder="Cari data, campaign..."
            className="w-full rounded-xl border border-border bg-paper pl-9 pr-8 py-1.5 font-body text-xs text-ink placeholder:text-muted/70 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-border bg-paper-deep px-1.5 py-0.5 font-data text-[9px] font-medium text-muted">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* Dark Mode Toggle (UI State) */}
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          aria-label="Toggle Theme"
          title="Toggle Theme"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-paper text-ink transition-colors hover:bg-paper-deep hover:border-muted/30"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-muted" />
          )}
        </button>

        {/* Notification Button */}
        <button
          type="button"
          aria-label="Notifications"
          title="Notifikasi"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-paper text-ink transition-colors hover:bg-paper-deep hover:border-muted/30"
        >
          <Bell className="h-4 w-4 text-muted" />
          {hasNotification && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent ring-2 ring-paper-deep" />
          )}
        </button>
      </div>
    </header>
  );
}