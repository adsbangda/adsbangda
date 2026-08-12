"use client";

import { useEffect } from "react";

/** Fondasi PWA — daftarkan service worker minimal supaya browser anggap app installable. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Diam-diam gagal — bukan fitur kritis, jangan ganggu pengalaman utama.
      });
    }
  }, []);

  return null;
}
