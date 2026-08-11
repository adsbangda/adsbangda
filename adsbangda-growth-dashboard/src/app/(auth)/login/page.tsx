// TODO (live mode): sambungkan form ini ke supabase.auth.signInWithPassword()
// lewat Server Action, lalu redirect ke "/" setelah sukses. Untuk MVP demo
// ini, form belum melakukan auth sungguhan — halaman (app)/* bisa diakses
// langsung untuk keperluan review desain & alur.
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

        <div className="relative max-w-sm">
          <p className="font-data text-xs uppercase tracking-[0.14em] text-muted-on-dark">Growth OS</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight">
            Satu tempat untuk memahami marketing bisnismu.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-on-dark">
            Performance, campaign, konten, dan approval — semua terhubung, tanpa
            menunggu laporan manual setiap bulan.
          </p>
        </div>

        <p className="relative font-data text-xs text-muted-on-dark">© 2026 Adsbangda</p>
      </div>

      {/* Sign in */}
      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="brand-gradient inline-flex h-8 w-8 items-center justify-center rounded-md font-display text-sm font-extrabold text-white">
              A
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Sign in</h2>
          <p className="mt-1.5 text-sm text-muted">Masuk untuk melihat perkembangan marketing kamu.</p>

          <form className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
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
                type="password"
                required
                placeholder="••••••••"
                className="w-full border-b border-border bg-transparent py-2 text-sm text-ink outline-none transition-colors focus:border-ink"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-[var(--radius-md)] bg-ink py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-accent"
            >
              Sign in
            </button>
            <div className="flex items-center justify-between text-xs">
              <a href="#" className="text-muted transition-colors hover:text-ink">
                Forgot password?
              </a>
              <span className="text-muted">Belum punya akun? Hubungi Adsbangda.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
