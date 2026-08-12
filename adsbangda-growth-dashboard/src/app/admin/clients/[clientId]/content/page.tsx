import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Trash2, Plus, Check } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { buttonVariants } from "@/components/dashboard/button";
import { DemoModeBanner } from "@/components/admin/demo-banner";
import {
  adminGetClient,
  adminGetDelivery,
  adminUpsertDeliveryMeta,
  adminAddDeliveryItem,
  adminDeleteDeliveryItem,
  adminListContent,
  adminCreateContent,
  adminDeleteContent,
  adminListAttention,
  adminCreateAttention,
  adminResolveAttention,
  adminListActivity,
  adminCreateActivity,
  adminDeleteActivity,
  adminListFiles,
  adminCreateFile,
  adminDeleteFile,
  adminListReports,
  adminCreateReport,
  adminDeleteReport,
  adminListHighlights,
  adminCreateQuickStat,
  adminDeleteQuickStat,
  adminCreateChannelRow,
  adminDeleteChannelRow,
  adminCreateUpcomingEvent,
  adminDeleteUpcomingEvent,
} from "@/lib/admin-data";

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const inputClass =
  "w-full rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const client = await adminGetClient(clientId);
  if (!client) notFound();

  const period = currentPeriod();
  const path = `/admin/clients/${clientId}/content`;

  const [delivery, content, attention, activity, files, reports, highlights] = await Promise.all([
    adminGetDelivery(clientId, period),
    adminListContent(clientId),
    adminListAttention(clientId),
    adminListActivity(clientId),
    adminListFiles(clientId),
    adminListReports(clientId),
    adminListHighlights(clientId),
  ]);

  // ---- Server actions (semua co-located di sini biar mudah ditelusuri) ----

  async function saveMeta(formData: FormData) {
    "use server";
    await adminUpsertDeliveryMeta(clientId, period, {
      status: String(formData.get("status")),
      helperText: String(formData.get("helperText") ?? ""),
      periodRange: String(formData.get("periodRange") ?? ""),
      lastUpdated: String(formData.get("lastUpdated") ?? ""),
      agreedDate: String(formData.get("agreedDate") ?? ""),
      contractHref: String(formData.get("contractHref") ?? "/reports"),
    });
    revalidatePath(path);
  }

  async function addDeliveryItem(formData: FormData) {
    "use server";
    await adminAddDeliveryItem(clientId, period, {
      icon: String(formData.get("icon")) as never,
      label: String(formData.get("label")),
      completed: Number(formData.get("completed") ?? 0),
      target: Number(formData.get("target") ?? 1),
      unit: String(formData.get("unit") ?? ""),
    });
    revalidatePath(path);
  }

  async function deleteDeliveryItem(formData: FormData) {
    "use server";
    await adminDeleteDeliveryItem(String(formData.get("id")));
    revalidatePath(path);
  }

  async function addContent(formData: FormData) {
    "use server";
    await adminCreateContent(clientId, {
      title: String(formData.get("title")),
      plannedDate: String(formData.get("plannedDate")),
      status: String(formData.get("status")) as never,
      platform: String(formData.get("platform")) as never,
      type: String(formData.get("type")) as never,
    });
    revalidatePath(path);
  }

  async function deleteContentAction(formData: FormData) {
    "use server";
    await adminDeleteContent(String(formData.get("id")));
    revalidatePath(path);
  }

  async function addAttention(formData: FormData) {
    "use server";
    const countBadgeRaw = String(formData.get("countBadge") ?? "");
    await adminCreateAttention(clientId, {
      icon: String(formData.get("icon")) as never,
      title: String(formData.get("title")),
      description: String(formData.get("description") ?? ""),
      href: String(formData.get("href") ?? "/"),
      countBadge: countBadgeRaw ? Number(countBadgeRaw) : undefined,
    });
    revalidatePath(path);
  }

  async function resolveAttentionAction(formData: FormData) {
    "use server";
    await adminResolveAttention(String(formData.get("id")));
    revalidatePath(path);
  }

  async function addActivity(formData: FormData) {
    "use server";
    await adminCreateActivity(clientId, {
      day: String(formData.get("day")),
      title: String(formData.get("title")),
      description: String(formData.get("description") ?? ""),
      done: formData.get("done") === "on",
    });
    revalidatePath(path);
  }

  async function deleteActivityAction(formData: FormData) {
    "use server";
    await adminDeleteActivity(String(formData.get("id")));
    revalidatePath(path);
  }

  async function addFile(formData: FormData) {
    "use server";
    await adminCreateFile(clientId, {
      name: String(formData.get("name")),
      category: String(formData.get("category") ?? ""),
      fileUrl: String(formData.get("fileUrl")),
      sizeLabel: String(formData.get("sizeLabel") ?? ""),
    });
    revalidatePath(path);
  }

  async function deleteFileAction(formData: FormData) {
    "use server";
    await adminDeleteFile(String(formData.get("id")));
    revalidatePath(path);
  }

  async function addReport(formData: FormData) {
    "use server";
    await adminCreateReport(clientId, {
      periodMonth: String(formData.get("periodMonth")),
      fileUrl: String(formData.get("fileUrl")),
      summary: String(formData.get("summary") ?? ""),
    });
    revalidatePath(path);
  }

  async function deleteReportAction(formData: FormData) {
    "use server";
    await adminDeleteReport(String(formData.get("id")));
    revalidatePath(path);
  }

  async function addQuickStat(formData: FormData) {
    "use server";
    await adminCreateQuickStat(clientId, {
      icon: String(formData.get("icon")) as never,
      label: String(formData.get("label")),
      value: String(formData.get("value")),
      deltaLabel: String(formData.get("deltaLabel") ?? ""),
      deltaPositive: formData.get("deltaPositive") === "on",
    });
    revalidatePath(path);
  }

  async function deleteQuickStatAction(formData: FormData) {
    "use server";
    await adminDeleteQuickStat(String(formData.get("id")));
    revalidatePath(path);
  }

  async function addChannelRow(formData: FormData) {
    "use server";
    const sparklineRaw = String(formData.get("sparkline") ?? "");
    await adminCreateChannelRow(clientId, {
      icon: String(formData.get("icon")) as never,
      label: String(formData.get("label")),
      metricLabel: String(formData.get("metricLabel") ?? ""),
      value: String(formData.get("value")),
      deltaLabel: String(formData.get("deltaLabel") ?? ""),
      sparkline: sparklineRaw
        .split(",")
        .map((n) => Number(n.trim()))
        .filter((n) => !Number.isNaN(n)),
    });
    revalidatePath(path);
  }

  async function deleteChannelRowAction(formData: FormData) {
    "use server";
    await adminDeleteChannelRow(String(formData.get("id")));
    revalidatePath(path);
  }

  async function addUpcomingEvent(formData: FormData) {
    "use server";
    await adminCreateUpcomingEvent(clientId, {
      eventDate: String(formData.get("eventDate")),
      title: String(formData.get("title")),
      timeLabel: String(formData.get("timeLabel") ?? ""),
    });
    revalidatePath(path);
  }

  async function deleteUpcomingEventAction(formData: FormData) {
    "use server";
    await adminDeleteUpcomingEvent(String(formData.get("id")));
    revalidatePath(path);
  }

  return (
    <div className="space-y-8 p-5 lg:p-8">
      <div>
        <p className="font-data text-[11px] uppercase tracking-wider text-muted">Content · Files · Reports</p>
        <p className="text-sm text-muted">Kelola Monthly Delivery, Content Calendar, Files, dan Reports yang tampil di Client Portal {client.name}.</p>
      </div>

        {/* MONTHLY DELIVERY */}
        <Card padding="lg">
          <SectionHeading title="Monthly Delivery" description={`Periode ${period}. Overall % dihitung otomatis dari item di bawah.`} />

          <form action={saveMeta} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Status</label>
              <select name="status" defaultValue={delivery.meta?.status ?? "on_track"} className={inputClass}>
                <option value="on_track">On Track</option>
                <option value="at_risk">At Risk</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Period Range</label>
              <input name="periodRange" defaultValue={delivery.meta?.period_range ?? ""} placeholder="1 – 31 Agustus 2026" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Update Terakhir</label>
              <input name="lastUpdated" defaultValue={delivery.meta?.last_updated ?? ""} placeholder="11 Agustus 2026, 10:00 WIB" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Target Disepakati</label>
              <input name="agreedDate" defaultValue={delivery.meta?.agreed_date ?? ""} placeholder="30 Juli 2026" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink">Link Kontrak</label>
              <input name="contractHref" defaultValue={delivery.meta?.contract_href ?? "/reports"} className={inputClass} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs font-medium text-ink">Helper Text</label>
              <input name="helperText" defaultValue={delivery.meta?.helper_text ?? ""} placeholder="Progres dihitung berdasarkan target yang disepakati." className={inputClass} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <button type="submit" className={buttonVariants({ variant: "dark", size: "sm" })}>
                Simpan Info Delivery
              </button>
            </div>
          </form>

          <div className="mt-6 divide-y divide-border border-t border-border">
            {delivery.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="font-data text-xs text-muted">
                    {item.icon} · {item.completed}/{item.target} {item.unit}
                  </p>
                </div>
                <form action={deleteDeliveryItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </form>
              </div>
            ))}
          </div>

          <form action={addDeliveryItem} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-6">
            <select name="icon" className={inputClass}>
              <option value="calendar">calendar</option>
              <option value="instagram">instagram</option>
              <option value="facebook">facebook</option>
              <option value="tiktok">tiktok</option>
              <option value="edit">edit</option>
              <option value="megaphone">megaphone</option>
              <option value="chart">chart</option>
            </select>
            <input name="label" placeholder="Label" required className={cn2()} />
            <input name="completed" type="number" placeholder="Selesai" defaultValue={0} className={inputClass} />
            <input name="target" type="number" placeholder="Target" defaultValue={1} className={inputClass} />
            <input name="unit" placeholder="Unit" className={inputClass} />
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Plus className="h-3.5 w-3.5" /> Tambah
            </button>
          </form>
        </Card>

        {/* CONTENT CALENDAR */}
        <Card padding="lg">
          <SectionHeading title="Content Calendar" />
          <div className="divide-y divide-border border-t border-border">
            {content.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="font-data text-xs text-muted">
                    {item.platform} · {item.type} · {item.plannedDate} · {item.status}
                  </p>
                </div>
                <form action={deleteContentAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </form>
              </div>
            ))}
          </div>

          <form action={addContent} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-6">
            <input name="title" placeholder="Judul konten" required className={cn2()} />
            <input name="plannedDate" type="date" required className={inputClass} />
            <select name="platform" className={inputClass}>
              <option value="instagram">instagram</option>
              <option value="facebook">facebook</option>
              <option value="tiktok">tiktok</option>
              <option value="website">website</option>
            </select>
            <select name="type" className={inputClass}>
              <option value="post">post</option>
              <option value="carousel">carousel</option>
              <option value="reel">reel</option>
              <option value="story">story</option>
              <option value="article">article</option>
            </select>
            <select name="status" className={inputClass}>
              <option value="draft">draft</option>
              <option value="in_production">in_production</option>
              <option value="waiting_approval">waiting_approval</option>
              <option value="approved">approved</option>
              <option value="scheduled">scheduled</option>
              <option value="published">published</option>
            </select>
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Plus className="h-3.5 w-3.5" /> Tambah
            </button>
          </form>
        </Card>

        {/* NEEDS YOUR ATTENTION */}
        <Card padding="lg">
          <SectionHeading title="Needs Your Attention" description="Muncul di Overview client sampai ditandai selesai." />
          <div className="divide-y divide-border border-t border-border">
            {attention.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs text-muted">{item.description}</p>
                </div>
                <form action={resolveAttentionAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                    <Check className="h-3.5 w-3.5" /> Selesai
                  </button>
                </form>
              </div>
            ))}
          </div>

          <form action={addAttention} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-6">
            <select name="icon" className={inputClass}>
              <option value="approval">approval</option>
              <option value="budget">budget</option>
              <option value="meeting">meeting</option>
            </select>
            <input name="title" placeholder="Judul" required className={cn2()} />
            <input name="description" placeholder="Deskripsi / due" className={cn2()} />
            <input name="href" placeholder="/content-calendar" className={inputClass} />
            <input name="countBadge" type="number" placeholder="Badge (opsional)" className={inputClass} />
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Plus className="h-3.5 w-3.5" /> Tambah
            </button>
          </form>
        </Card>

        {/* WHAT ADSBANGDA DID */}
        <Card padding="lg">
          <SectionHeading title="What AdsBangda Did" description="Work log yang tampil di Overview client." />
          <div className="divide-y divide-border border-t border-border">
            {activity.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-data text-[10px] uppercase text-muted">{item.day}</p>
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs text-muted">{item.description}</p>
                </div>
                <form action={deleteActivityAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </form>
              </div>
            ))}
          </div>

          <form action={addActivity} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-6">
            <input name="day" placeholder="Hari ini / Kemarin / 9 Agustus" required className={cn2()} />
            <input name="title" placeholder="Judul" required className={cn2()} />
            <input name="description" placeholder="Deskripsi" className={cn2()} />
            <label className="flex items-center gap-1.5 text-xs text-ink">
              <input type="checkbox" name="done" defaultChecked /> Selesai
            </label>
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Plus className="h-3.5 w-3.5" /> Tambah
            </button>
          </form>
        </Card>

        {/* FILES */}
        <Card padding="lg">
          <SectionHeading title="Files" />
          <div className="divide-y divide-border border-t border-border">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{file.name}</p>
                  <p className="text-xs text-muted">{file.category} · {file.sizeLabel}</p>
                </div>
                <form action={deleteFileAction}>
                  <input type="hidden" name="id" value={file.id} />
                  <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </form>
              </div>
            ))}
          </div>
          <form action={addFile} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-5">
            <input name="name" placeholder="Nama file" required className={cn2()} />
            <input name="category" placeholder="Kategori" className={inputClass} />
            <input name="fileUrl" placeholder="URL file" required className={cn2()} />
            <input name="sizeLabel" placeholder="480 KB" className={inputClass} />
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Plus className="h-3.5 w-3.5" /> Tambah
            </button>
          </form>
        </Card>

        {/* REPORTS */}
        <Card padding="lg">
          <SectionHeading title="Reports Bulanan" />
          <div className="divide-y divide-border border-t border-border">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{report.periodMonth}</p>
                  <p className="text-xs text-muted">{report.summary}</p>
                </div>
                <form action={deleteReportAction}>
                  <input type="hidden" name="id" value={report.id} />
                  <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </form>
              </div>
            ))}
          </div>
          <form action={addReport} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-5">
            <input name="periodMonth" placeholder="2026-08" required className={inputClass} />
            <input name="fileUrl" placeholder="URL laporan" required className={cn2()} />
            <input name="summary" placeholder="Ringkasan" className={cn2()} />
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Plus className="h-3.5 w-3.5" /> Tambah
            </button>
          </form>
        </Card>

        {/* HIGHLIGHTS */}
        <Card padding="lg">
          <SectionHeading title="Overview Highlights" description="Quick Stats, Channel Overview, dan Upcoming Events di Overview client." />

          <p className="mb-2 font-data text-[11px] font-semibold uppercase tracking-wider text-accent">Quick Stats</p>
          <div className="divide-y divide-border border-t border-border">
            {highlights.quickStats.map((s: Record<string, unknown>) => (
              <div key={s.id as string} className="flex items-center justify-between gap-3 py-2.5">
                <p className="text-xs text-ink">{s.label as string} — {s.value as string} ({s.delta_label as string})</p>
                <form action={deleteQuickStatAction}>
                  <input type="hidden" name="id" value={s.id as string} />
                  <button type="submit" className="text-muted hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></button>
                </form>
              </div>
            ))}
          </div>
          <form action={addQuickStat} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6">
            <select name="icon" className={inputClass}>
              <option value="send">send</option>
              <option value="story">story</option>
              <option value="heart">heart</option>
              <option value="users">users</option>
            </select>
            <input name="label" placeholder="Label" required className={inputClass} />
            <input name="value" placeholder="Value" required className={inputClass} />
            <input name="deltaLabel" placeholder="20% vs last month" className={inputClass} />
            <label className="flex items-center gap-1.5 text-xs text-ink">
              <input type="checkbox" name="deltaPositive" defaultChecked /> Positif
            </label>
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}><Plus className="h-3.5 w-3.5" /></button>
          </form>

          <p className="mb-2 mt-6 font-data text-[11px] font-semibold uppercase tracking-wider text-accent">Channel Overview</p>
          <div className="divide-y divide-border border-t border-border">
            {highlights.channelOverview.map((c: Record<string, unknown>) => (
              <div key={c.id as string} className="flex items-center justify-between gap-3 py-2.5">
                <p className="text-xs text-ink">{c.label as string} — {c.value as string} ({c.delta_label as string})</p>
                <form action={deleteChannelRowAction}>
                  <input type="hidden" name="id" value={c.id as string} />
                  <button type="submit" className="text-muted hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></button>
                </form>
              </div>
            ))}
          </div>
          <form action={addChannelRow} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6">
            <select name="icon" className={inputClass}>
              <option value="instagram">instagram</option>
              <option value="facebook">facebook</option>
              <option value="tiktok">tiktok</option>
              <option value="reach">reach</option>
            </select>
            <input name="label" placeholder="Label" required className={inputClass} />
            <input name="metricLabel" placeholder="Engagement Rate" className={inputClass} />
            <input name="value" placeholder="3.82%" required className={inputClass} />
            <input name="deltaLabel" placeholder="↑ 12.5%" className={inputClass} />
            <input name="sparkline" placeholder="4,5,4.5,6,5.5,7,6.8" className={inputClass} />
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}><Plus className="h-3.5 w-3.5" /></button>
          </form>

          <p className="mb-2 mt-6 font-data text-[11px] font-semibold uppercase tracking-wider text-accent">Upcoming Events</p>
          <div className="divide-y divide-border border-t border-border">
            {highlights.upcomingEvents.map((e: Record<string, unknown>) => (
              <div key={e.id as string} className="flex items-center justify-between gap-3 py-2.5">
                <p className="text-xs text-ink">{e.event_date as string} — {e.title as string}</p>
                <form action={deleteUpcomingEventAction}>
                  <input type="hidden" name="id" value={e.id as string} />
                  <button type="submit" className="text-muted hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></button>
                </form>
              </div>
            ))}
          </div>
          <form action={addUpcomingEvent} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <input name="eventDate" type="date" required className={inputClass} />
            <input name="title" placeholder="Judul acara" required className={cn2()} />
            <input name="timeLabel" placeholder="14:00 – 15:00 WIB" className={inputClass} />
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}><Plus className="h-3.5 w-3.5" /></button>
          </form>
        </Card>
      </div>
  );
}

function cn2() {
  return "sm:col-span-2 " + inputClass;
}
