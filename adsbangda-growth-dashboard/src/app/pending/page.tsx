import { signOut } from "@/app/(auth)/login/actions";
import { buttonVariants } from "@/components/dashboard/button";
import { Clock } from "lucide-react";

export default function PendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Clock className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <h1 className="mt-4 font-display text-xl font-bold text-ink">Akun kamu belum terhubung</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Akun ini sudah terverifikasi, tapi belum dihubungkan ke client manapun. Hubungi tim AdsBangda supaya akunmu bisa segera diaktifkan.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <a href="https://wa.me/6282289348724" target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "primary" })}>
            Hubungi Tim AdsBangda
          </a>
          <form action={signOut}>
            <button type="submit" className="text-xs font-medium text-muted hover:text-ink">
              Keluar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
