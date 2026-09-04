import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Trash2, Globe, Eye, Users, Clock, Pencil, Activity, TrendingDown, Percent, Plus, RefreshCw, CheckCircle2, AlertCircle, CalendarRange } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/dashboard/button";
import { SubmitButton } from "@/components/dashboard/submit-button";
import {
  adminGetClient,
  adminUpdateClient,
  adminListPerformanceMetrics,
  adminCreatePerformanceMetric,
  adminUpdatePerformanceMetric,
  adminDeletePerformanceMetric,
  adminListWebsiteActivity,
  adminCreateWebsiteActivity,
  adminUpdateWebsiteActivity,
  adminDeleteWebsiteActivity,
} from "@/lib/admin-data";
import { syncGA4ForClient, getServiceAccountEmail } from "@/lib/ga4-sync";
import { aggregateWebsiteMetrics, filterWebsiteMetricsByDateRange } from "@/lib/website-monthly";
import { formatDateID } from "@/lib/utils";
import { PillTabs } from "@/components/admin/pill-tabs";
import { WebsitePerformanceForm } from "@/components/admin/website-performance-form";

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Rentang tanggal untuk filter "Ringkasan Periode" & "Performance History"
 * di bawah — DIPISAH dari rentang hari yang di-tarik dari GA4 saat sync
 * (lihat syncGA4ForClient, selalu 30 hari terakhir & selalu meng-upsert).
 * Filter ini murni cara MELIHAT data yang sudah tersimpan, tidak
 * memengaruhi data itu sendiri sama sekali.
 */
function resolveDateRange(from?: string, to?: string, all?: string) {
  if (all === "1") return { from: undefined, to: undefined, isAll: true };

  const now = new Date();
  const defaultFrom = toISO(new Date(now.getFullYear(), now.getMonth(), 1)); // 1 bulan berjalan
  const defaultTo = toISO(now);

  return { from: from || defaultFrom, to: to || defaultTo, isAll: false };
}

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";

// Validasi dasar (spec Q) — raw data website tidak boleh negatif, Bounce
// Rate dikunci ke 0–100. Sengaja tidak strict (tidak menolak submit), cuma
// clamp ke rentang valid, supaya admin tetap bisa nyimpen data tanpa
// ke-block gara-gara salah ketik kecil. Ditaruh di module scope (bukan di
// dalam Server Action closure) supaya aman dipanggil dari Server Action.
function clampNonNegative(raw: FormDataEntryValue | null): number | undefined {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n) || n === 0) return undefined;
  return Math.max(0, n);
}
function clampPercent(raw: FormDataEntryValue | null): number | undefined {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n) || n === 0) return undefined;
  return Math.min(100, Math.max(0, n));
}

function SegmentedNav({ base, active }: { base: string; active: "performance" | "activity" }) {
  const items: { key: "performance" | "activity"; label: string }[] = [
    { key: "performance", label: "Performance" },
    { key: "activity", label: "Activity" },
  ];
  return (
    <PillTabs
      items={items.map((item) => ({
        href: `${base}?tab=${item.key}`,
        label: item.label,
        active: active === item.key,
      }))}
    />
  );
}

export default async function AdminClientWebsitePage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ tab?: string; edit?: string; sync?: string; rows?: string; message?: string; from?: string; to?: string; all?: string }>;
}) {
  const { clientId } = await params;
  const { tab = "performance", edit, sync, rows, message, from: fromParam, to: toParam, all: allParam } = await searchParams;
  const base = `/admin/clients/${clientId}/website`;
  const path = base;
  const activeTab = tab === "activity" ? "activity" : "performance";

  const [client, metrics] = await Promise.all([adminGetClient(clientId), adminListPerformanceMetrics(clientId, "website")]);

  // Filter tanggal (default: bulan berjalan) — murni untuk TAMPILAN,
  // tidak menghapus/mengubah data apa pun. `metrics` sendiri tetap array
  // lengkap semua baris (dipakai form Edit tetap bisa cari baris di luar
  // rentang filter kalau linknya di-share/bookmark).
  const { from, to, isAll } = resolveDateRange(fromParam, toParam, allParam);
  const metricsInRange = filterWebsiteMetricsByDateRange(metrics, from, to);
  const summary = aggregateWebsiteMetrics(metricsInRange);

  // Query string filter aktif — dipakai ulang di semua link (preset, edit,
  // cancel, dst) supaya pindah halaman/edit tidak mereset filter tanggal
  // yang sedang admin lihat.
  const filterQuery = isAll ? "all=1" : `from=${from}&to=${to}`;
  const rangeLabel = isAll ? "Semua Waktu" : `${formatDateID(from!)} – ${formatDateID(to!)}`;

  // Satu `now` dipakai ulang untuk semua preset di bawah — hindari panggil
  // `new Date()`/`Date.now()` berkali-kali langsung di JSX saat render.
  const now = new Date();
  const todayIso = toISO(now);
  const last30Start = toISO(new Date(now.getTime() - 29 * 86400000));
  const presetLinks = [
    { label: "Bulan Ini", href: `${path}?tab=performance&from=${toISO(new Date(now.getFullYear(), now.getMonth(), 1))}&to=${todayIso}` },
    {
      label: "Bulan Lalu",
      href: `${path}?tab=performance&from=${toISO(new Date(now.getFullYear(), now.getMonth() - 1, 1))}&to=${toISO(new Date(now.getFullYear(), now.getMonth(), 0))}`,
    },
    { label: "30 Hari Terakhir", href: `${path}?tab=performance&from=${last30Start}&to=${todayIso}` },
    { label: "Semua Waktu", href: `${path}?tab=performance&all=1` },
  ];

  // Sama persis "30 Hari Terakhir" — dipakai syncGA4Action supaya setelah
  // klik Sync Sekarang, admin diarahkan ke filter yang mencakup 30 hari
  // yang baru saja ditarik dari GA4 (bukan tetap di default "Bulan Ini").
  const syncedRangeQuery = `from=${last30Start}&to=${todayIso}`;

  async function saveGA4PropertyIdAction(formData: FormData) {
    "use server";
    const raw = String(formData.get("ga4PropertyId") ?? "").trim();
    const hostnameRaw = String(formData.get("ga4Hostname") ?? "").trim();
    await adminUpdateClient(clientId, { ga4PropertyId: raw || null, ga4Hostname: hostnameRaw || null });
    revalidatePath(path);
  }

  async function syncGA4Action() {
    "use server";
    const current = await adminGetClient(clientId);
    if (!current?.ga4PropertyId) {
      redirect(`${path}?tab=performance&sync=error&message=${encodeURIComponent("GA4 Property ID belum diisi.")}`);
    }
    const result = await syncGA4ForClient(clientId, current!.ga4PropertyId!, 30, current!.ga4Hostname);
    revalidatePath(path);
    if (result.error) {
      redirect(`${path}?tab=performance&sync=error&message=${encodeURIComponent(result.error)}`);
    }
    // Sync GA4 selalu tarik 30 hari terakhir (lihat syncGA4ForClient) —
    // setelah sync, otomatis alihkan filter ke "30 Hari Terakhir" supaya
    // admin LANGSUNG lihat data yang baru saja masuk, bukan tetap kepentok
    // filter "Bulan Ini" default kalau baris barunya jatuh di bulan lalu.
    redirect(`${path}?tab=performance&sync=ok&rows=${result.rowsSynced}&${syncedRangeQuery}`);
  }

  async function addMetric(formData: FormData) {
    "use server";
    await adminCreatePerformanceMetric(clientId, "website", {
      date: String(formData.get("date")),
      visitors: clampNonNegative(formData.get("visitors")),
      sessions: clampNonNegative(formData.get("sessions")),
      pageViews: clampNonNegative(formData.get("pageViews")),
      bounceRate: clampPercent(formData.get("bounceRate")),
      avgSessionDuration: String(formData.get("avgSessionDuration") ?? "").trim() || undefined,
      conversions: clampNonNegative(formData.get("conversions")),
    });
    revalidatePath(path);
  }

  async function updateMetricAction(formData: FormData) {
    "use server";
    await adminUpdatePerformanceMetric(String(formData.get("id")), "website", {
      date: String(formData.get("date")),
      visitors: clampNonNegative(formData.get("visitors")),
      sessions: clampNonNegative(formData.get("sessions")),
      pageViews: clampNonNegative(formData.get("pageViews")),
      bounceRate: clampPercent(formData.get("bounceRate")),
      avgSessionDuration: String(formData.get("avgSessionDuration") ?? "").trim() || undefined,
      conversions: clampNonNegative(formData.get("conversions")),
    });
    revalidatePath(path);
  }

  async function deleteMetricAction(formData: FormData) {
    "use server";
    await adminDeletePerformanceMetric(String(formData.get("id")), "website");
    revalidatePath(path);
  }

  return (
    <div className="animate-rise space-y-6 p-5 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-base font-bold text-ink">How is the website doing?</h2>
        <p className="mt-1 text-sm text-muted">
          Rumah untuk performance & aktivitas website client. Sekarang manual — struktur ini sama nantinya kalau
          terhubung Google Analytics/Search Console.
        </p>
      </div>

      <SegmentedNav base={base} active={activeTab} />

      {activeTab === "performance" ? (
        <div className="animate-rise space-y-6">
          {sync && (
            <div
              className={`flex items-center gap-2 rounded-[var(--radius-md)] border px-4 py-3 text-sm ${
                sync === "ok" ? "border-success/30 bg-success-soft text-success" : "border-danger/30 bg-danger-soft text-danger"
              }`}
            >
              {sync === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} />}
              {sync === "ok" ? `Sync GA4 berhasil — ${rows ?? 0} hari data ter-update.` : `Sync GA4 gagal: ${message ?? "Terjadi error."}`}
            </div>
          )}

          <Card padding="lg">
            <SectionHeading
              title="Google Analytics 4"
              description={
                client?.ga4PropertyId
                  ? "Terhubung — data disinkron otomatis tiap hari. Form manual di bawah tetap bisa dipakai kapan saja untuk override."
                  : "Opsional — hubungkan biar data ke-isi otomatis. Belum dikasih akses client? Form manual di bawah tetap 100% berfungsi seperti biasa."
              }
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <form action={saveGA4PropertyIdAction} className="flex flex-wrap items-end gap-2">
                <div>
                  <label htmlFor="ga4PropertyId" className="font-data text-[11px] font-semibold uppercase tracking-wider text-muted">
                    GA4 Property ID
                  </label>
                  <input
                    id="ga4PropertyId"
                    name="ga4PropertyId"
                    defaultValue={client?.ga4PropertyId ?? ""}
                    placeholder="mis. 123456789"
                    className={`mt-1 block ${inputClass}`}
                  />
                </div>
                <div>
                  <label htmlFor="ga4Hostname" className="font-data text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Hostname Filter (opsional)
                  </label>
                  <input
                    id="ga4Hostname"
                    name="ga4Hostname"
                    defaultValue={client?.ga4Hostname ?? ""}
                    placeholder="mis. wellnerconsulting.com"
                    className={`mt-1 block ${inputClass}`}
                  />
                </div>
                <SubmitButton variant="outline" size="sm" loadingLabel="Menyimpan...">
                  Simpan
                </SubmitButton>
                {client?.ga4PropertyId && (
                  <SubmitButton formAction={syncGA4Action} variant="primary" size="sm" loadingLabel="Nge-sync...">
                    <RefreshCw className="h-3.5 w-3.5" /> Sync Sekarang
                  </SubmitButton>
                )}
              </form>
              <div
                className={`shrink-0 rounded-[var(--radius-md)] px-3 py-1.5 font-data text-[11px] font-semibold ${
                  client?.ga4PropertyId ? "bg-success-soft text-success" : "bg-black/[0.04] text-muted"
                }`}
              >
                {client?.ga4PropertyId ? "● Terhubung" : "○ Belum terhubung"}
              </div>
            </div>
            {client?.ga4PropertyId && (
              <p className="mt-3 text-xs text-muted">
                <strong className="text-ink">Hostname Filter</strong> cuma perlu diisi kalau property GA4 ini JUGA dipasang di landing
                page iklan (subdomain berbeda) — isi hostname website utama supaya traffic landing page tidak ikut kehitung di sini.
                Kosongkan kalau tidak ada landing page terpisah.
              </p>
            )}
            {getServiceAccountEmail() && (
              <p className="mt-3 border-t border-border pt-3 text-xs text-muted">
                Belum kasih akses? Minta client invite email berikut sebagai role <strong>Viewer</strong> di GA4 mereka (GA4 Admin →
                Property Access Management): <span className="font-data text-ink">{getServiceAccountEmail()}</span>
              </p>
            )}
          </Card>

          <Card padding="lg">
            <SectionHeading
              title="Filter Tanggal"
              description="Menentukan rentang data yang dihitung di Ringkasan Periode & ditampilkan di Performance History di bawah — tidak menghapus/mengubah data apa pun."
            />
            <div className="mb-3 flex flex-wrap gap-2">
              {presetLinks.map((preset) => (
                <Link key={preset.label} href={preset.href} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <CalendarRange className="h-3.5 w-3.5" /> {preset.label}
                </Link>
              ))}
            </div>
            <form action={path} method="get" className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
              <input type="hidden" name="tab" value="performance" />
              <div>
                <label htmlFor="from" className="font-data text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Dari Tanggal
                </label>
                <input id="from" name="from" type="date" defaultValue={isAll ? "" : from} className={`mt-1 block ${inputClass}`} />
              </div>
              <div>
                <label htmlFor="to" className="font-data text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Sampai Tanggal
                </label>
                <input id="to" name="to" type="date" defaultValue={isAll ? "" : to} className={`mt-1 block ${inputClass}`} />
              </div>
              <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                Terapkan
              </button>
            </form>
          </Card>

          <div>
            <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">
              Ringkasan Periode <span className="normal-case text-muted/70">— {rangeLabel}</span>
            </p>
            {!summary ? (
              <Card>
                <EmptyState
                  icon={Globe}
                  title="Belum ada data performance di rentang ini"
                  description="Coba ganti filter tanggal di atas, atau tambahkan snapshot pertama lewat form di bawah."
                />
              </Card>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted">
                  Dihitung dari {metricsInRange.length} baris data ({metricsInRange.length === 1 ? "1 hari" : `${metricsInRange.length} hari/entri`}) di rentang ini —
                  Visitors/Sessions/Page Views/Leads dijumlah, Bounce Rate & Avg Session Duration dirata-rata dibobot sessions.
                </p>
                {/* Metrik utama — sama set dengan 4 KPI di Client Portal, supaya admin lihat persis apa yang client lihat. */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Users className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-data text-2xl font-bold text-ink">{summary.visitors?.toLocaleString("id-ID") ?? "—"}</p>
                      <p className="text-xs text-muted">Visitors</p>
                    </div>
                  </Card>
                  <Card className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Activity className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-data text-2xl font-bold text-ink">{summary.sessions?.toLocaleString("id-ID") ?? "—"}</p>
                      <p className="text-xs text-muted">Sessions</p>
                    </div>
                  </Card>
                  <Card className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Eye className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-data text-2xl font-bold text-ink">{summary.pageViews?.toLocaleString("id-ID") ?? "—"}</p>
                      <p className="text-xs text-muted">Page Views</p>
                    </div>
                  </Card>
                  <Card className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Globe className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-data text-2xl font-bold text-ink">{summary.conversions?.toLocaleString("id-ID") ?? "—"}</p>
                      <p className="text-xs text-muted">Leads / Form Submissions</p>
                    </div>
                  </Card>
                </div>

                {/* Metrik sekunder — Bounce Rate & Avg Session Duration input manual, Conversion Rate SELALU dihitung
                    ulang dari Leads ÷ Visitors (tidak pernah disimpan sebagai field terpisah). */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3">
                    <TrendingDown className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
                    <div>
                      <p className="font-data text-sm font-bold text-ink">{summary.bounceRate != null ? `${summary.bounceRate.toFixed(1)}%` : "—"}</p>
                      <p className="text-[11px] text-muted">Bounce Rate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3">
                    <Clock className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
                    <div>
                      <p className="font-data text-sm font-bold text-ink">{summary.avgSessionDuration ?? "—"}</p>
                      <p className="text-[11px] text-muted">Avg Session Duration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-accent/30 bg-accent-soft px-4 py-3">
                    <Percent className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
                    <div>
                      <p className="font-data text-sm font-bold text-ink">
                        {summary.visitors ? `${(((summary.conversions ?? 0) / summary.visitors) * 100).toFixed(2)}%` : "—"}
                      </p>
                      <p className="text-[11px] text-muted">Conversion Rate (otomatis)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Card padding="lg">
            <SectionHeading title="Add Performance Data" description="Masukkan raw data — Conversion Rate dihitung otomatis di bawah." />
            <WebsitePerformanceForm action={addMetric} />
          </Card>

          <Card padding="lg">
            <SectionHeading
              title="Performance History"
              description={
                metrics.length === metricsInRange.length
                  ? "Klik Edit untuk perbaiki data."
                  : `Menampilkan ${metricsInRange.length} dari ${metrics.length} baris data — sisanya di luar filter tanggal di atas. Klik Edit untuk perbaiki data.`
              }
            />
            {metricsInRange.length === 0 ? (
              <p className="text-xs text-muted">
                Tidak ada data di rentang tanggal ini. {metrics.length > 0 && (
                  <Link href={`${path}?tab=performance&all=1`} className="text-accent underline">
                    Lihat Semua Waktu ({metrics.length} baris)
                  </Link>
                )}
              </p>
            ) : (
              <div className="divide-y divide-border border-t border-border">
                {metricsInRange.map((m) =>
                  edit === m.id ? (
                    <div key={m.id} className="bg-accent-soft/40 py-3">
                      <WebsitePerformanceForm
                        action={updateMetricAction}
                        defaultValues={{
                          id: m.id,
                          date: m.date,
                          visitors: m.visitors,
                          sessions: m.sessions,
                          pageViews: m.pageViews,
                          bounceRate: m.bounceRate,
                          avgSessionDuration: m.avgSessionDuration,
                          conversions: m.conversions,
                        }}
                        submitLabel="Save"
                        showPlusIcon={false}
                        extra={
                          <Link href={`${path}?tab=performance&${filterQuery}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                            Cancel
                          </Link>
                        }
                      />
                    </div>
                  ) : (
                    <div key={m.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">{formatDateID(m.date)}</p>
                        <p className="font-data text-xs text-muted">
                          {m.visitors != null && `${m.visitors.toLocaleString("id-ID")} visitors · `}
                          {m.sessions != null && `${m.sessions.toLocaleString("id-ID")} sessions · `}
                          {m.pageViews != null && `${m.pageViews.toLocaleString("id-ID")} page views · `}
                          {m.bounceRate != null && `${m.bounceRate}% bounce · `}
                          {m.avgSessionDuration && `${m.avgSessionDuration} avg duration · `}
                          {m.conversions != null && `${m.conversions.toLocaleString("id-ID")} leads`}
                          {m.visitors ? ` · ${(((m.conversions ?? 0) / m.visitors) * 100).toFixed(2)}% conversion` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`${path}?tab=performance&edit=${m.id}&${filterQuery}`} className="text-muted hover:text-ink" aria-label="Edit">
                          <Pencil className="h-4 w-4" strokeWidth={1.75} />
                        </Link>
                        <form action={deleteMetricAction}>
                          <input type="hidden" name="id" value={m.id} />
                          <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        </form>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <WebsiteActivityPanel clientId={clientId} path={path} editId={edit} />
      )}
    </div>
  );
}

async function WebsiteActivityPanel({ clientId, path, editId }: { clientId: string; path: string; editId?: string }) {
  const activity = await adminListWebsiteActivity(clientId);

  async function addActivity(formData: FormData) {
    "use server";
    await adminCreateWebsiteActivity(clientId, {
      date: String(formData.get("date")),
      title: String(formData.get("title")),
      description: String(formData.get("description") ?? ""),
      status: String(formData.get("status") ?? "done") as never,
    });
    revalidatePath(path);
  }

  async function updateActivityAction(formData: FormData) {
    "use server";
    await adminUpdateWebsiteActivity(String(formData.get("id")), {
      date: String(formData.get("date")),
      title: String(formData.get("title")),
      description: String(formData.get("description") ?? ""),
      status: String(formData.get("status") ?? "done") as never,
    });
    revalidatePath(path);
  }

  async function deleteActivityAction(formData: FormData) {
    "use server";
    await adminDeleteWebsiteActivity(String(formData.get("id")));
    revalidatePath(path);
  }

  return (
    <Card padding="lg" className="animate-rise">
      <SectionHeading title="Website Activity" description="Catatan pekerjaan website — update, backup, maintenance." />
      {activity.length === 0 ? (
        <EmptyState title="Belum ada activity" description="Tambahkan activity pertama lewat form di bawah." />
      ) : (
        <div className="divide-y divide-border border-t border-border">
          {activity.map((item) =>
            editId === item.id ? (
              <div key={item.id} className="bg-accent-soft/40 py-3">
                <form action={updateActivityAction} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <input type="hidden" name="id" value={item.id} />
                  <input name="date" type="date" defaultValue={item.date} required className={inputClass} />
                  <input name="title" defaultValue={item.title} required placeholder="Judul" className="sm:col-span-2 rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink" />
                  <input name="description" defaultValue={item.description} placeholder="Deskripsi" className={inputClass} />
                  <select name="status" defaultValue={item.status} className={inputClass}>
                    <option value="done">done</option>
                    <option value="in_progress">in_progress</option>
                    <option value="planned">planned</option>
                  </select>
                  <div className="flex gap-2">
                    <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                      Save
                    </button>
                    <Link href={`${path}?tab=activity`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Cancel
                    </Link>
                  </div>
                </form>
              </div>
            ) : (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-data text-[10px] uppercase text-muted">{formatDateID(item.date)}</p>
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  {item.description && <p className="text-xs text-muted">{item.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`${path}?tab=activity&edit=${item.id}`} className="text-muted hover:text-ink" aria-label="Edit">
                    <Pencil className="h-4 w-4" strokeWidth={1.75} />
                  </Link>
                  <form action={deleteActivityAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </form>
                </div>
              </div>
            )
          )}
        </div>
      )}

      <form action={addActivity} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-5">
        <input name="date" type="date" required className={inputClass} />
        <input name="title" placeholder="Judul activity" required className="sm:col-span-2 rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink" />
        <input name="description" placeholder="Deskripsi (opsional)" className={inputClass} />
        <select name="status" className={inputClass}>
          <option value="done">done</option>
          <option value="in_progress">in_progress</option>
          <option value="planned">planned</option>
        </select>
        <button type="submit" className={buttonVariants({ variant: "outline", size: "sm", className: "sm:col-span-5 justify-center" })}>
          <Plus className="h-3.5 w-3.5" /> Add Activity
        </button>
      </form>
    </Card>
  );
}
