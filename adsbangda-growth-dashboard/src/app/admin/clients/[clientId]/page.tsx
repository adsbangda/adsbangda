import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Briefcase, Users, FileText, ArrowRight, Trash2, Plus, Check, Target, TrendingUp, Megaphone } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { buttonVariants } from "@/components/dashboard/button";
import {
  adminGetClient,
  adminUpdateClient,
  adminListProjectsByClient,
  adminListClientTeam,
  adminListContent,
  adminListGoals,
  adminListPerformanceMetrics,
  adminGetDelivery,
  adminUpsertDeliveryMeta,
  adminAddDeliveryItem,
  adminDeleteDeliveryItem,
  adminListAttention,
  adminCreateAttention,
  adminResolveAttention,
  adminListActivity,
  adminCreateActivity,
  adminDeleteActivity,
  adminListHighlights,
  adminCreateQuickStat,
  adminDeleteQuickStat,
  adminCreateChannelRow,
  adminDeleteChannelRow,
  adminCreateUpcomingEvent,
  adminDeleteUpcomingEvent,
} from "@/lib/admin-data";
import type { Client } from "@/lib/types";

const inputClass = "w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink";
const smallInputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";
function cn2() {
  return "sm:col-span-2 " + smallInputClass;
}

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminClientOverviewPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const client = await adminGetClient(clientId);
  if (!client) return null;

  const path = `/admin/clients/${clientId}`;
  const currentStatus = client.status;
  const period = currentPeriod();

  async function updateClientAction(formData: FormData) {
    "use server";
    await adminUpdateClient(clientId, {
      name: String(formData.get("name") ?? "").trim(),
      industry: String(formData.get("industry") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      status: String(formData.get("status") ?? currentStatus) as Client["status"],
    });
    revalidatePath(path);
  }

  const [projects, team, content, delivery, attention, activity, highlights, goals, socialMetrics, metaMetrics] = await Promise.all([
    adminListProjectsByClient(clientId),
    adminListClientTeam(clientId),
    adminListContent(clientId),
    adminGetDelivery(clientId, period),
    adminListAttention(clientId),
    adminListActivity(clientId),
    adminListHighlights(clientId),
    adminListGoals(clientId),
    adminListPerformanceMetrics(clientId, "social"),
    adminListPerformanceMetrics(clientId, "meta_ads"),
  ]);

  const activeProjects = projects.filter((p) => p.stage === "active");
  const goalsOnTrack = goals.filter((g) => g.status === "on_track" || g.status === "completed").length;
  const goalsAtRisk = goals.filter((g) => g.status === "at_risk").length;
  const latestSocial = socialMetrics[0];
  const latestMeta = metaMetrics[0];

  // ---- Server actions dipindah dari halaman Content lama (Phase 3A) ----

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
    <div className="space-y-6 p-5 lg:p-8">
      <Card padding="lg">
        <SectionHeading title="Client Information" description="Edit detail client — status Archived menyembunyikan client ini dari daftar aktif tanpa menghapus datanya." />
        <form action={updateClientAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input name="name" defaultValue={client.name} required placeholder="Nama client" className={inputClass} />
          <input name="industry" defaultValue={client.industry} placeholder="Industri" className={inputClass} />
          <input name="website" type="url" defaultValue={client.website ?? ""} placeholder="Website (opsional)" className={inputClass} />
          <select name="status" defaultValue={client.status} className={inputClass}>
            <option value="onboarding">Onboarding</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
          <textarea
            name="description"
            defaultValue={client.description ?? ""}
            placeholder="Deskripsi (opsional)"
            rows={2}
            className={`${inputClass} sm:col-span-2 lg:col-span-3`}
          />
          <button type="submit" className={buttonVariants({ variant: "primary", className: "justify-center" })}>
            Simpan
          </button>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Briefcase className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-data text-2xl font-bold text-ink">{activeProjects.length}</p>
            <p className="text-xs text-muted">Active Projects</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Users className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-data text-2xl font-bold text-ink">{team.length}</p>
            <p className="text-xs text-muted">Team Members</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <FileText className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-data text-2xl font-bold text-ink">{content.length}</p>
            <p className="text-xs text-muted">Content Items</p>
          </div>
        </Card>
      </div>

      {/* CLIENT SNAPSHOT — aggregation dari Goals/Social Media/Meta Ads (Phase 3B), tidak menyimpan data baru. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href={`/admin/clients/${clientId}/goals`}>
          <Card interactive className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Target className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              {goals.length === 0 ? (
                <p className="text-xs text-muted">Belum ada goal</p>
              ) : (
                <>
                  <p className="font-data text-sm font-bold text-ink">
                    {goalsOnTrack}/{goals.length} on track
                  </p>
                  <p className="text-xs text-muted">{goalsAtRisk > 0 ? `${goalsAtRisk} goal butuh perhatian` : "Semua goal sesuai rencana"}</p>
                </>
              )}
            </div>
          </Card>
        </Link>
        <Link href={`/admin/clients/${clientId}/social-media`}>
          <Card interactive className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <TrendingUp className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              {!latestSocial ? (
                <p className="text-xs text-muted">Belum ada data Social Media</p>
              ) : (
                <>
                  <p className="font-data text-sm font-bold text-ink">{latestSocial.followers?.toLocaleString("id-ID") ?? "—"} followers</p>
                  <p className="text-xs text-muted">Snapshot {latestSocial.date}</p>
                </>
              )}
            </div>
          </Card>
        </Link>
        <Link href={`/admin/clients/${clientId}/meta-ads`}>
          <Card interactive className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Megaphone className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              {!latestMeta ? (
                <p className="text-xs text-muted">Belum ada data Meta Ads</p>
              ) : (
                <>
                  <p className="font-data text-sm font-bold text-ink">{latestMeta.leads ?? 0} leads</p>
                  <p className="text-xs text-muted">{latestMeta.spend != null ? `Rp${latestMeta.spend.toLocaleString("id-ID")} spend` : `Snapshot ${latestMeta.date}`}</p>
                </>
              )}
            </div>
          </Card>
        </Link>
      </div>

      <Card padding="lg">
        <SectionHeading
          title="Projects"
          description={activeProjects.length === 0 ? "Belum ada project aktif." : `${activeProjects.length} project sedang berjalan.`}
          action={
            <Link href={`/admin/clients/${clientId}/projects`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Lihat semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {projects.length === 0 ? (
          <p className="text-xs text-muted">Client ini belum memiliki project.</p>
        ) : (
          <div className="divide-y divide-border">
            {projects.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{p.name}</p>
                  <p className="font-data text-xs text-muted">{p.type}</p>
                </div>
                <span className="font-data text-xs font-semibold text-ink">{p.progressPct ?? 0}%</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card padding="lg">
        <SectionHeading
          title="Team"
          description={team.length === 0 ? "Belum ada team member yang ditugaskan." : undefined}
          action={
            <Link href={`/admin/clients/${clientId}/team`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Kelola Team <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {team.length === 0 ? (
          <p className="text-xs text-muted">Belum ada Account Manager yang di-assign ke client ini.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {team.map((member) => (
              <span key={member.id} className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                {member.fullName || member.email}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* MONTHLY DELIVERY — dipindah dari tab Content (Phase 3A), tetap tampil di sini karena
          langsung memberi makan Monthly Delivery Hero di Overview Client Portal. */}
      <Card padding="lg">
        <SectionHeading title="Monthly Delivery" description={`Periode ${period}. Overall % dihitung otomatis dari item di bawah.`} />

        <form action={saveMeta} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Status</label>
            <select name="status" defaultValue={delivery.meta?.status ?? "on_track"} className={smallInputClass}>
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="completed">Completed</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Period Range</label>
            <input name="periodRange" defaultValue={delivery.meta?.period_range ?? ""} placeholder="1 – 31 Agustus 2026" className={smallInputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Update Terakhir</label>
            <input name="lastUpdated" defaultValue={delivery.meta?.last_updated ?? ""} placeholder="11 Agustus 2026, 10:00 WIB" className={smallInputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Target Disepakati</label>
            <input name="agreedDate" defaultValue={delivery.meta?.agreed_date ?? ""} placeholder="30 Juli 2026" className={smallInputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Link Kontrak</label>
            <input name="contractHref" defaultValue={delivery.meta?.contract_href ?? "/reports"} className={smallInputClass} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1 block text-xs font-medium text-ink">Helper Text</label>
            <input name="helperText" defaultValue={delivery.meta?.helper_text ?? ""} placeholder="Progres dihitung berdasarkan target yang disepakati." className={smallInputClass} />
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
          <select name="icon" className={smallInputClass}>
            <option value="calendar">calendar</option>
            <option value="instagram">instagram</option>
            <option value="facebook">facebook</option>
            <option value="tiktok">tiktok</option>
            <option value="edit">edit</option>
            <option value="megaphone">megaphone</option>
            <option value="chart">chart</option>
          </select>
          <input name="label" placeholder="Label" required className={cn2()} />
          <input name="completed" type="number" placeholder="Selesai" defaultValue={0} className={smallInputClass} />
          <input name="target" type="number" placeholder="Target" defaultValue={1} className={smallInputClass} />
          <input name="unit" placeholder="Unit" className={smallInputClass} />
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="h-3.5 w-3.5" /> Tambah
          </button>
        </form>
      </Card>

      {/* NEEDS YOUR ATTENTION — dipindah dari tab Content (Phase 3A) */}
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
          <select name="icon" className={smallInputClass}>
            <option value="approval">approval</option>
            <option value="budget">budget</option>
            <option value="meeting">meeting</option>
          </select>
          <input name="title" placeholder="Judul" required className={cn2()} />
          <input name="description" placeholder="Deskripsi / due" className={cn2()} />
          <input name="href" placeholder="/content-calendar" className={smallInputClass} />
          <input name="countBadge" type="number" placeholder="Badge (opsional)" className={smallInputClass} />
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="h-3.5 w-3.5" /> Tambah
          </button>
        </form>
      </Card>

      {/* WHAT ADSBANGDA DID — dipindah dari tab Content (Phase 3A) */}
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

      {/* OVERVIEW HIGHLIGHTS — dipindah dari tab Content (Phase 3A) */}
      <Card padding="lg">
        <SectionHeading title="Overview Highlights" description="Quick Stats, Channel Overview, dan Upcoming Events di Overview client." />

        <p className="mb-2 font-data text-[11px] font-semibold uppercase tracking-wider text-accent">Quick Stats</p>
        <div className="divide-y divide-border border-t border-border">
          {highlights.quickStats.map((s: Record<string, unknown>) => (
            <div key={s.id as string} className="flex items-center justify-between gap-3 py-2.5">
              <p className="text-xs text-ink">
                {s.label as string} — {s.value as string} ({s.delta_label as string})
              </p>
              <form action={deleteQuickStatAction}>
                <input type="hidden" name="id" value={s.id as string} />
                <button type="submit" className="text-muted hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
        <form action={addQuickStat} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6">
          <select name="icon" className={smallInputClass}>
            <option value="send">send</option>
            <option value="story">story</option>
            <option value="heart">heart</option>
            <option value="users">users</option>
          </select>
          <input name="label" placeholder="Label" required className={smallInputClass} />
          <input name="value" placeholder="Value" required className={smallInputClass} />
          <input name="deltaLabel" placeholder="20% vs last month" className={smallInputClass} />
          <label className="flex items-center gap-1.5 text-xs text-ink">
            <input type="checkbox" name="deltaPositive" defaultChecked /> Positif
          </label>
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="h-3.5 w-3.5" />
          </button>
        </form>

        <p className="mb-2 mt-6 font-data text-[11px] font-semibold uppercase tracking-wider text-accent">Channel Overview</p>
        <div className="divide-y divide-border border-t border-border">
          {highlights.channelOverview.map((c: Record<string, unknown>) => (
            <div key={c.id as string} className="flex items-center justify-between gap-3 py-2.5">
              <p className="text-xs text-ink">
                {c.label as string} — {c.value as string} ({c.delta_label as string})
              </p>
              <form action={deleteChannelRowAction}>
                <input type="hidden" name="id" value={c.id as string} />
                <button type="submit" className="text-muted hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
        <form action={addChannelRow} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6">
          <select name="icon" className={smallInputClass}>
            <option value="instagram">instagram</option>
            <option value="facebook">facebook</option>
            <option value="tiktok">tiktok</option>
            <option value="reach">reach</option>
          </select>
          <input name="label" placeholder="Label" required className={smallInputClass} />
          <input name="metricLabel" placeholder="Engagement Rate" className={smallInputClass} />
          <input name="value" placeholder="3.82%" required className={smallInputClass} />
          <input name="deltaLabel" placeholder="↑ 12.5%" className={smallInputClass} />
          <input name="sparkline" placeholder="4,5,4.5,6,5.5,7,6.8" className={smallInputClass} />
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="h-3.5 w-3.5" />
          </button>
        </form>

        <p className="mb-2 mt-6 font-data text-[11px] font-semibold uppercase tracking-wider text-accent">Upcoming Events</p>
        <div className="divide-y divide-border border-t border-border">
          {highlights.upcomingEvents.map((e: Record<string, unknown>) => (
            <div key={e.id as string} className="flex items-center justify-between gap-3 py-2.5">
              <p className="text-xs text-ink">
                {e.event_date as string} — {e.title as string}
              </p>
              <form action={deleteUpcomingEventAction}>
                <input type="hidden" name="id" value={e.id as string} />
                <button type="submit" className="text-muted hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
        <form action={addUpcomingEvent} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <input name="eventDate" type="date" required className={smallInputClass} />
          <input name="title" placeholder="Judul acara" required className={cn2()} />
          <input name="timeLabel" placeholder="14:00 – 15:00 WIB" className={smallInputClass} />
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="h-3.5 w-3.5" />
          </button>
        </form>
      </Card>
    </div>
  );
}
