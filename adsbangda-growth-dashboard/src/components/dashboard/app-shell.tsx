"use client";

import { useState, createContext, useContext } from "react";
import { Sidebar } from "./sidebar";
import { Menu } from "lucide-react";

const MenuContext = createContext<{ open: () => void }>({ open: () => {} });
export const useMobileMenu = () => useContext(MenuContext);

export function AppShell({ clientName, children }: { clientName: string; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <MenuContext.Provider value={{ open: () => setMobileOpen(true) }}>
      <div className="flex min-h-screen bg-paper">
        {/* Desktop sidebar */}
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
          <Sidebar clientName={clientName} />
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 animate-rise">
              <Sidebar clientName={clientName} onNavigate={() => setMobileOpen(false)} />
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
