"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signUp } from "./actions";
import { buttonVariants } from "@/components/dashboard/button";

function SignInForm({ next }: { next: string | null }) {
  const [state, action, pending] = useActionState(signIn, { error: null });

  return (
    <form action={action} className="mt-8 space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="nama@bisnis.com"
          className="w-full border-b border-border bg-transparent py-2 text-sm text-ink outline-none transition-colors focus:border-ink"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full border-b border-border bg-transparent py-2 text-sm text-ink outline-none transition-colors focus:border-ink"
        />
      </div>
      {state.error && <p className="text-xs font-medium text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className={buttonVariants({ variant: "dark", className: "w-full justify-center py-2.5" })}>
        {pending ? "Memproses…" : "Sign in"}
      </button>
    </form>
  );
}

function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, { error: null, success: false });

  if (state.success) {
    return (
      <div className="mt-8 rounded-[var(--radius-md)] border border-success-soft bg-success-soft p-4 text-sm text-success">
        Akun berhasil dibuat. Jika verifikasi email aktif di project Supabase kamu, cek inbox lalu kembali ke tab Masuk. Kalau tidak, langsung saja masuk lewat tab Masuk.
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-ink">
          Nama Lengkap
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          placeholder="Nama kamu"
          className="w-full border-b border-border bg-transparent py-2 text-sm text-ink outline-none transition-colors focus:border-ink"
        />
      </div>
      <div>
        <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          required
          placeholder="nama@bisnis.com"
          className="w-full border-b border-border bg-transparent py-2 text-sm text-ink outline-none transition-colors focus:border-ink"
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Minimal 8 karakter"
          className="w-full border-b border-border bg-transparent py-2 text-sm text-ink outline-none transition-colors focus:border-ink"
        />
      </div>
      {state.error && <p className="text-xs font-medium text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className={buttonVariants({ variant: "dark", className: "w-full justify-center py-2.5" })}>
        {pending ? "Memproses…" : "Buat Akun"}
      </button>
      <p className="text-xs leading-relaxed text-muted">
        Akun baru berperan sebagai client secara default. Admin akan menghubungkan akunmu ke client yang sesuai lewat Admin Portal.
      </p>
    </form>
  );
}

function LoginTabs() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  return (
    <>
      <div className="flex items-center gap-1 rounded-[var(--radius-md)] border border-border bg-black/[0.02] p-1">
        <button
          type="button"
          onClick={() => setTab("signin")}
          className={`flex-1 rounded-[var(--radius-sm)] py-1.5 text-sm font-semibold transition-colors ${
            tab === "signin" ? "bg-white text-ink shadow-[var(--shadow-xs)]" : "text-muted"
          }`}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`flex-1 rounded-[var(--radius-sm)] py-1.5 text-sm font-semibold transition-colors ${
            tab === "signup" ? "bg-white text-ink shadow-[var(--shadow-xs)]" : "text-muted"
          }`}
        >
          Daftar
        </button>
      </div>

      <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink">
        {tab === "signin" ? "Sign in" : "Buat akun baru"}
      </h2>
      <p className="mt-1.5 text-sm text-muted">
        {tab === "signin" ? "Masuk untuk melihat perkembangan marketing kamu." : "Daftar dulu, admin akan menghubungkan akunmu ke client."}
      </p>

      {tab === "signin" ? <SignInForm next={next} /> : <SignUpForm />}
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between bg-ink p-10 text-paper lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="brand-gradient flex h-8 w-8 items-center justify-center rounded-md font-display text-sm font-extrabold text-white">
            A
          </div>
          <span className="font-display text-sm font-bold">Adsbangda</span>
        </div>

        <div className="max-w-sm">
          <p className="font-data text-xs uppercase tracking-[0.14em] text-muted-on-dark">Client Portal</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight">
            Satu tempat untuk memahami marketing bisnismu.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-on-dark">
            Progress kerja, campaign, konten, dan approval — semua terhubung, tanpa
            menunggu laporan manual setiap bulan.
          </p>
        </div>

        <p className="font-data text-xs text-muted-on-dark">© 2026 Adsbangda</p>
      </div>

      {/* Sign in / sign up */}
      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="brand-gradient inline-flex h-8 w-8 items-center justify-center rounded-md font-display text-sm font-extrabold text-white">
              A
            </div>
          </div>

          <Suspense fallback={<div className="h-10 animate-pulse rounded-[var(--radius-md)] bg-black/[0.04]" />}>
            <LoginTabs />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
