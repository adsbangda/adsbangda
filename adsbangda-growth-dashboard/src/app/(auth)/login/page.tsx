// TODO (live mode): sambungkan form ini ke supabase.auth.signInWithPassword()
// lewat Server Action, lalu redirect ke "/" setelah sukses. Untuk MVP demo
// ini, form belum melakukan auth sungguhan — halaman (app)/* bisa diakses
// langsung untuk keperluan review desain & alur.
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent font-display text-lg font-extrabold text-white">
            A
          </div>
          <h1 className="font-display text-xl font-bold text-ink">Growth Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Masuk untuk melihat perkembangan marketing bisnis kamu.</p>
        </div>

        <form className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-paper-deep p-6">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="nama@bisnis.com"
              className="w-full rounded-lg border border-border bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
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
              className="w-full rounded-lg border border-border bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-accent"
          >
            Masuk
          </button>
          <p className="text-center text-xs text-muted">
            Belum punya akun? Hubungi tim Adsbangda kamu.
          </p>
        </form>
      </div>
    </div>
  );
}
