"use client";

import { Printer } from "lucide-react";
import { buttonVariants } from "@/components/dashboard/button";

/** Tombol kecil yang cuma manggil window.print() — PDF-nya dibuat lewat dialog "Save as PDF" bawaan browser, supaya isinya selalu persis sama dengan yang tampil di layar (data live dari database, bukan generator terpisah). */
export function PrintButton() {
  return (
    <button onClick={() => window.print()} className={buttonVariants({ variant: "primary", size: "sm" })}>
      <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
    </button>
  );
}
