import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Trash2, Plus, Globe, Eye, Users, Clock, Pencil } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/dashboard/button";
import {
  adminListPerformanceMetrics,
  adminCreatePerformanceMetric,
  adminUpdatePerformanceMetric,
  adminDeletePerformanceMetric,
  adminListWebsiteActivity,
  adminCreateWebsiteActivity,
  adminUpdateWebsiteActivity,
  adminDeleteWebsiteActivity,
} from "@/lib/admin-data";
import { formatDateID } from "@/lib/utils";
import { FormattedNumberInput } from "@/components/dashboard/formatted-number-input";
import { PillTabs } from "@/components/admin/pill-tabs";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";

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
  searchParams: Promise<{ tab?: string; edit?: string }>;
}) {
  const { clientId } = await params;
  const { tab = "performance", edit } = await searchParams;
  const base = `/admin/clients/${clientId}/website`;
  const path = base;
  const activeTab = tab === "activity" ? "activity" : "performance";

  const metrics = await adminListPerformanceMetrics(clientId, "website");
  const latest = metrics[0];

  async function addMetric(formData: FormData) {
    "use server";
    await adminCreatePerformanceMetric(clientId, "website", {
      date: String(formData.get("date")),
      visitors: Number(formData.get("visitors") ?? 0) || undefined,
      pageViews: Number(formData.get("pageViews") ?? 0) || undefined,
      sessions: Number(formData.get("sessions") ?? 0) || undefined,
      bounceRate: Number(formData.get("bounceRate") ?? 0) || undefined,
      avgSessionDuration: String(formData.get("avgSessionDuration") ?? "").trim() || undefined,
      conversions: Number(formData.get("conversions") ?? 0) || undefined,
    });
    revalidatePath(path);
  }

  async function updateMetricAction(formData: FormData) {
    "use server";
    await adminUpdatePerformanceMetric(String(formData.get("id")), "website", {
      date: String(formData.get("date")),
      visitors: Number(formData.get("visitors") ?? 0) || undefined,
      pageViews: Number(formData.get("pageViews") ?? 0) || undefined,
      sessions: Number(formData.get("sessions") ?? 0) || undefined,
      bounceRate: Number(formData.get("bounceRate") ?? 0) || undefined,
      avgSessionDuration: String(formData.get("avgSessionDuration") ?? "").trim() || undefined,
      conversions: Number(formData.get("conversions") ?? 0) || undefined,
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
          <div>
            <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Latest Snapshot</p>
            {!latest ? (
              <Card>
                <EmptyState icon={Globe} title="Belum ada data performance" description="Tambahkan snapshot pertama lewat form di bawah." />
              </Card>
            ) : (
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
                    <Eye className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-data text-2xl font-bold text-ink">{latest.pageViews?.toLocaleString("id-ID") ?? "—"}</p>
                    <p className="text-xs text-muted">Page Views</p>
                  </div>
                </Card>
                <Card className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Clock className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-data text-2xl font-bold text-ink">{latest.avgSessionDuration ?? "—"}</p>
                    <p className="text-xs text-muted">Avg Session Duration</p>
                  </div>
                </Card>
                <Card className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Globe className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-data text-2xl font-bold text-ink">{latest.conversions?.toLocaleString("id-ID") ?? "—"}</p>
                    <p className="text-xs text-muted">Leads / Form Submission</p>
                  </div>
                </Card>
              </div>
            )}
          </div>

          <Card padding="lg">
            <SectionHeading title="Add Performance Data" />
            <form action={addMetric} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              <input name="date" type="date" required className={inputClass} />
              <FormattedNumberInput name="visitors" placeholder="Visitors" className={inputClass} />
              <FormattedNumberInput name="pageViews" placeholder="Page Views" className={inputClass} />
              <FormattedNumberInput name="sessions" placeholder="Sessions" className={inputClass} />
              <FormattedNumberInput name="bounceRate" allowDecimal placeholder="Bounce Rate (%)" className={inputClass} />
              <input name="avgSessionDuration" placeholder="Avg Duration (2m 15s)" className={inputClass} />
              <FormattedNumberInput name="conversions" placeholder="Leads / Form Submission" className={inputClass} />
              <button type="submit" className={buttonVariants({ variant: "primary", size: "sm", className: "justify-center" })}>
                <Plus className="h-3.5 w-3.5" /> Save Data
              </button>
            </form>
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
                      <form action={updateMetricAction} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                        <input type="hidden" name="id" value={m.id} />
                        <input name="date" type="date" defaultValue={m.date} required className={inputClass} />
                        <FormattedNumberInput name="visitors" defaultValue={m.visitors} placeholder="Visitors" className={inputClass} />
                        <FormattedNumberInput name="pageViews" defaultValue={m.pageViews} placeholder="Page Views" className={inputClass} />
                        <FormattedNumberInput name="sessions" defaultValue={m.sessions} placeholder="Sessions" className={inputClass} />
                        <FormattedNumberInput name="bounceRate" allowDecimal defaultValue={m.bounceRate} placeholder="Bounce Rate" className={inputClass} />
                        <input name="avgSessionDuration" defaultValue={m.avgSessionDuration ?? ""} placeholder="Avg Duration" className={inputClass} />
                        <FormattedNumberInput name="conversions" defaultValue={m.conversions} placeholder="Leads" className={inputClass} />
                        <div className="flex gap-2">
                          <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                            Save
                          </button>
                          <Link href={path} className={buttonVariants({ variant: "outline", size: "sm" })}>
                            Cancel
                          </Link>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div key={m.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">{formatDateID(m.date)}</p>
                        <p className="font-data text-xs text-muted">
                          {m.visitors != null && `${m.visitors.toLocaleString("id-ID")} visitors · `}
                          {m.sessions != null && `${m.sessions.toLocaleString("id-ID")} sessions · `}
                          {m.pageViews != null && `${m.pageViews.toLocaleString("id-ID")} page views · `}
                          {m.conversions != null && `${m.conversions} leads`}
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
