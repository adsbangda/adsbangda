"use client";

import type { ReactNode } from "react";
import { buttonVariants } from "@/components/dashboard/button";

/**
 * Tombol submit yang minta konfirmasi browser (window.confirm) dulu sebelum
 * form-nya benar-benar submit — dipakai untuk aksi destruktif/tidak bisa
 * di-undo (mis. hapus user) supaya tidak ke-klik tidak sengaja. Form action
 * (server action) tetap didefinisikan di parent <form>, komponen ini cuma
 * mencegat submit-nya di client.
 */
export function ConfirmDeleteButton({
  confirmMessage,
  children,
  className,
}: {
  confirmMessage: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className ?? buttonVariants({ variant: "outline", size: "sm" })}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
