"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Sidebar } from "./sidebar";
import { Menu, PanelLeftOpen } from "lucide-react";

const MenuContext = createContext<{ open: () => void; collapsed: boolean; toggleCollapsed: () => void }>({
  open: () => {},
  collapsed: false,
  toggleCollapsed: () => {},
});
export const useMobileMenu = () => useContext(MenuContext);

const COLLAPSE_STORAGE_KEY = "adsbangda:sidebar-collapsed";

export function AppShell({ clientName, isAdmin = false, children }: { clientName: string; isAdmin?: boolean; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Default false (terbuka) supaya server render & first paint konsisten
  // (menghindari hydration mismatch) — preferensi yang tersimpan baru
  // dibaca & diterapkan setelah mount, lihat useEffect di bawah.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- baca preferensi tersimpan sekali saat mount (bukan sinkronisasi berulang ke sistem luar) — default `false` di server render lalu diterapkan di sini justru untuk MENGHINDARI hydration mismatch, bukan menyebabkannya.
    if (saved === "1") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <MenuContext.Provider value={{ open: () => setMobileOpen(true), collapsed, toggleCollapsed }}>
      <div className="flex min-h-screen bg-paper">
        {/* Desktop sidebar — collapsible supaya area konten (Overview dkk)
            bisa dilebarin kalau perlu. Di-collapse total (bukan diciutin
            jadi rail ikon), disimpan di localStorage biar preferensinya
            nempel walau reload/pindah tab. */}
        <div className={collapsed ? "hidden" : "sticky top-0 hidden h-screen shrink-0 lg:block"}>
          <Sidebar clientName={clientName} isAdmin={isAdmin} />
        </div>

        {/* Tombol buka lagi — cuma muncul kalau lagi collapsed, nempel di
            tepi kiri layar supaya gampang ditemu. */}
        {collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Buka sidebar"
            className="fixed left-3 top-3 z-40 hidden h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-muted shadow-[var(--shadow-sm)] transition-colors hover:border-ink hover:text-ink lg:flex"
          >
            <PanelLeftOpen className="h-4.5 w-4.5" strokeWidth={1.75} />
          </button>
        )}

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 animate-rise">
              <Sidebar clientName={clientName} isAdmin={isAdmin} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </MenuContext.Provider>
  );
}

export function MobileMenuButton() {
  const { open } = useMobileMenu();
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Buka menu"
      className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-ink hover:text-ink lg:hidden"
    >
      <Menu className="h-4.5 w-4.5" strokeWidth={1.75} />
    </button>
  );
}
