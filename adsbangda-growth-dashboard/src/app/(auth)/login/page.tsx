"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "./actions";
import { buttonVariants } from "@/components/dashboard/button";
import { Logo } from "@/components/dashboard/logo";

const SUPPORT_EMAIL = "support@adsbangda.com";

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
          autoComplete="email"
          placeholder="nama@bisnis.com"
          className="w-full rounded-[var(--radius-md)] border border-border bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent-soft"
        />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Password
          </label>
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Lupa%20Password`} className="text-xs font-medium text-accent hover:underline">
            Lupa password?
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-[var(--radius-md)] border border-border bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent-soft"
        />
      </div>
      {state.error && <p className="text-xs font-medium text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className={buttonVariants({ variant: "primary", className: "w-full justify-center py-2.5" })}>
        {pending ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );
}

function LoginCard() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  return (
    <>
      <Logo tone="dark" height={24} />

      <h2 className="mt-8 font-display text-2xl font-bold tracking-tight text-ink">Masuk ke akun kamu</h2>
      <p className="mt-1.5 text-sm text-muted">
        Pantau perkembangan marketing bisnismu di satu tempat.
      </p>

      <SignInForm next={next} />

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Belum punya akun? Hubungi tim Adsbangda — akses akun dibuatkan lewat Admin Portal.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Butuh bantuan?{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-accent hover:underline">
          {SUPPORT_EMAIL}
        </a>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="brand-gradient relative hidden flex-col items-center justify-center overflow-hidden p-10 text-white lg:flex xl:p-16">
        {/* decorative hexagon dots, echoing the reference layout */}
        <svg
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 text-white/10"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="1.5" fill="currentColor" />
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const r = 38;
            return <circle key={i} cx={50 + r * Math.cos(angle)} cy={50 + r * Math.sin(angle)} r="1.5" fill="currentColor" />;
          })}
        </svg>
        <svg
          aria-hidden
          className="pointer-events-none absolute -bottom-14 -right-14 h-56 w-56 text-white/10"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="50" r="1.5" fill="currentColor" />
          {Array.from({ length: 32 }).map((_, i) => {
            const angle = (i / 32) * Math.PI * 2;
            const r = 42;
            return <circle key={i} cx={50 + r * Math.cos(angle)} cy={50 + r * Math.sin(angle)} r="1.5" fill="currentColor" />;
          })}
        </svg>

        <div className="relative flex w-full max-w-md flex-col items-center gap-10">
          {/* Abstract dashboard preview mockup */}
          <div className="relative w-full">
            <div className="rounded-[var(--radius-lg)] border border-white/15 bg-ink-soft/70 p-3 shadow-2xl backdrop-blur-sm">
              <div className="mb-2.5 flex items-center gap-1.5 px-1">
                <span className="h-2 w-2 rounded-full bg-white/25" />
                <span className="h-2 w-2 rounded-full bg-white/25" />
                <span className="h-2 w-2 rounded-full bg-white/25" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-[var(--radius-sm)] bg-white/10 px-3 py-2.5">
                  <div className="h-2 w-24 rounded-full bg-white/40" />
                  <div className="h-2 w-10 rounded-full bg-white/25" />
                </div>
                {[72, 45, 88].map((w, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-[var(--radius-sm)] bg-white/[0.06] px-3 py-2.5">
                    <div className="h-6 w-6 shrink-0 rounded-full bg-white/20" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-1.5 rounded-full bg-white/30" style={{ width: `${w}%` }} />
                      <div className="h-1.5 w-1/3 rounded-full bg-white/15" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-44 rounded-[var(--radius-md)] border border-white/15 bg-ink-soft/80 p-3 shadow-2xl backdrop-blur-sm">
              <div className="mb-2 h-1.5 w-16 rounded-full bg-white/30" />
              <div className="flex items-end gap-1">
                {[40, 65, 30, 80, 55, 90].map((h, i) => (
                  <div key={i} className="w-full rounded-t-sm bg-accent-2/70" style={{ height: `${h * 0.4}px` }} />
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold leading-snug">
              Progress kerja, campaign, konten, dan approval — semua dalam satu dashboard.
            </p>
            <p className="mt-3 text-sm font-bold leading-snug">
              Tanpa menunggu laporan manual setiap bulan.
            </p>
          </div>
        </div>
      </div>

      {/* Sign in */}
      <div className="flex items-center justify-center bg-paper-deep px-6 py-14 sm:px-12 lg:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo tone="dark" height={22} />
          </div>

          <Suspense fallback={<div className="h-10 animate-pulse rounded-[var(--radius-md)] bg-black/[0.04]" />}>
            <LoginCard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
