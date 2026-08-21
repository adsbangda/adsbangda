import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Trash2, Globe, Eye, Users, Clock, Pencil, Activity, TrendingDown, Percent, Plus, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
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
import { formatDateID } from "@/lib/utils";
import { PillTabs } from "@/components/admin/pill-tabs";
import { WebsitePerformanceForm } from "@/components/admin/website-performance-form";

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
  searchParams: Promise<{ tab?: string; edit?: string; sync?: string; rows?: string; message?: string }>;
}) {
  const { clientId } = await params;
  const { tab = "performance", edit, sync, rows, message } = await searchParams;
  const base = `/admin/clients/${clientId}/website`;
  const path = base;
  const activeTab = tab === "activity" ? "activity" : "performance";

  const [client, metrics] = await Promise.all([adminGetClient(clientId), adminListPerformanceMetrics(clientId, "website")]);
  const latest = metrics[0];

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
    redirect(`${path}?tab=performance&sync=ok&rows=${result.rowsSynced}`);
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

          <div>
            <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Latest Snapshot</p>
            {!latest ? (
              <Card>
                <EmptyState icon={Globe} title="Belum ada data performance" description="Tambahkan snapshot pertama lewat form di bawah." />
              </Card>
            ) : (
              <div className="space-y-3">
                {/* Metrik utama — sama set dengan 4 KPI di Client Portal, supaya admin lihat persis apa yang client lihat. */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Users className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-data text-2xl font-bold text-ink">{latest.visitors?.toLocaleString("id-ID") ?? "—"}</p>
                      <p className="text-xs text-muted">Visitors</p>
                    </div>
                  </Card>
                  <Card className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Activity className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-data text-2xl font-bold text-ink">{latest.sessions?.toLocaleString("id-ID") ?? "—"}</p>
                      <p className="text-xs text-muted">Sessions</p>
                    </div>
                  </Card>
                  <Card className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Eye className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-data text-2xl font-bold text-ink">{latest.pageViews?.toLocaleString("id-ID") ?? "—"}</p>
                      <p className="text-xs text-muted">Page Views</p>
                    </div>
                  </Card>
                  <Card className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <Globe className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-data text-2xl font-bold text-ink">{latest.conversions?.toLocaleString("id-ID") ?? "—"}</p>
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
                      <p className="font-data text-sm font-bold text-ink">{latest.bounceRate != null ? `${latest.bounceRate}%` : "—"}</p>
                      <p className="text-[11px] text-muted">Bounce Rate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3">
                    <Clock className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
                    <div>
                      <p className="font-data text-sm font-bold text-ink">{latest.avgSessionDuration ?? "—"}</p>
                      <p className="text-[11px] text-muted">Avg Session Duration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-accent/30 bg-accent-soft px-4 py-3">
                    <Percent className="h-4 w-4 shrink-0 text-accent" strokeWidth={1.75} />
                    <div>
                      <p className="font-data text-sm font-bold text-ink">
                        {latest.visitors ? `${(((latest.conversions ?? 0) / latest.visitors) * 100).toFixed(2)}%` : "—"}
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
            <SectionHeading title="Performance History" description="Klik Edit untuk perbaiki data." />
            {metrics.length === 0 ? (
              <p className="text-xs text-muted">Belum ada data.</p>
            ) : (
              <div className="divide-y divide-border border-t border-border">
                {metrics.map((m) =>
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
                          <Link href={path} className={buttonVariants({ variant: "outline", size: "sm" })}>
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
                        <Link href={`${path}?tab=performance&edit=${m.id}`} className="text-muted hover:text-ink" aria-label="Edit">
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
