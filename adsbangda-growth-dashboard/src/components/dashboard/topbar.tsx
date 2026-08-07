"use client";

import { useState } from "react";
import { DEMO_MODE } from "@/lib/data";
import { Search, Bell, Sun, Moon, Command, User } from "lucide-react";

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
    <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-[#ECECEC] bg-[#FFFFFF]/80 backdrop-blur-md px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      {/* Title & Info */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-extrabold tracking-tight text-[#18181B]">{title}</h1>
          {DEMO_MODE && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 font-data text-[10px] font-semibold text-amber-700 border border-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Demo Mode
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#71717A]">
          <span className="font-data">{formattedDate}</span>
          {subtitle && (
            <>
              <span className="text-[#ECECEC]">•</span>
              <span>{subtitle}</span>
            </>
          )}
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            readOnly
            placeholder="Cari data, campaign..."
            className="w-full rounded-xl border border-[#ECECEC] bg-[#FAFAFA] pl-9 pr-8 py-1.5 font-body text-xs text-[#18181B] placeholder:text-[#71717A]/70 focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] cursor-pointer"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-[#ECECEC] bg-[#FFFFFF] px-1.5 py-0.5 font-data text-[9px] font-medium text-[#71717A]">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          aria-label="Toggle Theme"
          title="Toggle Theme"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECECEC] bg-[#FAFAFA] text-[#18181B] transition-all duration-200 hover:bg-[#FFFFFF] hover:border-gray-300"
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-[#71717A]" />
          )}
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifikasi"
          title="Notifikasi"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECECEC] bg-[#FAFAFA] text-[#18181B] transition-all duration-200 hover:bg-[#FFFFFF] hover:border-gray-300"
        >
          <Bell className="h-4 w-4 text-[#71717A]" />
          {hasNotification && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#1D4ED8] ring-2 ring-[#FFFFFF]" />
          )}
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAFA] px-3 py-1.5">
          <span className="text-xs font-semibold text-[#18181B]">Client Portal</span>
          <div className="h-6 w-6 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white font-data text-[10px] font-bold">
            <User className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </header>
  );
}