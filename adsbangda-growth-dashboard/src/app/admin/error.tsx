"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { buttonVariants } from "@/components/dashboard/button";

/**
 * Error boundary untuk seluruh /admin/** — tanpa file ini, error dari
 * Server Action/Server Component (mis. gagal update Supabase karena RLS
 * atau constraint) di production cuma nampilin layar generik "Something
 * went wrong" TANPA pesan aslinya (Next.js sengaja redact detail error di
 * production demi keamanan). Di sini pesan error ASLI (error.message)
 * sengaja tetap ditampilkan — Admin Portal cuma dipakai tim internal
 * sendiri (bukan client), jadi detail teknis di sini aman & membantu
 * debug, beda dengan Client Portal yang tidak boleh bocorkan detail
 * internal ke client.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[Admin Portal error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <Card padding="lg" className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertTriangle className="h-6 w-6" strokeWidth={1.75} />
        </div>
        <h1 className="mt-4 font-display text-lg font-bold text-ink">Ada yang gagal</h1>
        <p className="mt-2 text-sm text-muted">{error.message || "Terjadi error yang tidak terduga."}</p>
        {error.digest && <p className="mt-1 font-data text-[11px] text-muted">Digest: {error.digest}</p>}
        <div className="mt-5 flex justify-center gap-2">
          <button type="button" onClick={reset} className={buttonVariants({ variant: "primary" })}>
            Coba Lagi
          </button>
          <Link href="/admin/clients" className={buttonVariants({ variant: "outline" })}>
            Kembali ke Clients
          </Link>
        </div>
      </Card>
    </div>
  );
}
