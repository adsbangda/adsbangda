import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Briefcase, Users, FileText, ArrowRight, Trash2, Plus, Check, Target, TrendingUp, Megaphone, Globe } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { buttonVariants } from "@/components/dashboard/button";
import {
  adminGetClient,
  adminUpdateClient,
  adminListProjectsByClient,
  adminListClientTeam,
  adminListContent,
  adminListContentTargets,
  adminListGoals,
  adminCreateGoal,
  adminUpdateGoal,
  adminDeleteGoal,
  adminListPerformanceMetrics,
  adminListReports,
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
import type { Client, GoalStatus, SocialPlatform } from "@/lib/types";

const SOCIAL_PLATFORMS: SocialPlatform[] = ["instagram", "facebook", "tiktok", "x", "linkedin", "threads"];

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

  const [projects, team, content, contentTargets, delivery, attention, activity, highlights, goals, socialMetrics, metaMetrics, websiteMetrics, reports] = await Promise.all([
    adminListProjectsByClient(clientId),
    adminListClientTeam(clientId),
    adminListContent(clientId),
    adminListContentTargets(clientId, period),
    adminGetDelivery(clientId, period),
    adminListAttention(clientId),
    adminListActivity(clientId),
    adminListHighlights(clientId),
    adminListGoals(clientId),
    adminListPerformanceMetrics(clientId, "social"),
    adminListPerformanceMetrics(clientId, "meta_ads"),
    adminListPerformanceMetrics(clientId, "website"),
    adminListReports(clientId),
  ]);

  const activeProjects = projects.filter((p) => p.stage === "active");
  const contentTargetTotal = contentTargets.reduce((sum, t) => sum + t.target, 0);
  const contentDelivered = content.length;
  const contentDeliveryPct = contentTargetTotal > 0 ? Math.min(100, Math.round((contentDelivered / contentTargetTotal) * 100)) : 0;
  const latestMeta = metaMetrics[0];
  const latestWebsite = websiteMetrics[0];
  const latestReport = reports[0];
  const socialByPlatform = SOCIAL_PLATFORMS.map((p) => ({ platform: p, latest: socialMetrics.find((m) => m.platform === p) })).filter((s) => s.latest);

  async function addGoal(formData: FormData) {
    "use server";
    await adminCreateGoal(clientId, {
      label: String(formData.get("label")),
      target: Number(formData.get("target") ?? 0),
      actual: Number(formData.get("actual") ?? 0),
      unit: String(formData.get("unit") ?? ""),
      period: String(formData.get("period") ?? period),
      status: String(formData.get("status") ?? "on_track") as GoalStatus,
    });
    revalidatePath(path);
  }

  async function updateGoalAction(formData: FormData) {
    "use server";
    await adminUpdateGoal(String(formData.get("id")), {
      actual: Number(formData.get("actual") ?? 0),
      status: String(formData.get("status")) as GoalStatus,
    });
    revalidatePath(path);
  }

  async function deleteGoalAction(formData: FormData) {
    "use server";
    await adminDeleteGoal(String(formData.get("id")));
    revalidatePath(path);
  }

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
    <div className="animate-rise space-y-6 p-5 lg:p-8">
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
        <Link href={`/admin/clients/${clientId}/social-media`}>
          <Card interactive className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <FileText className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-data text-2xl font-bold text-ink">
                {contentDelivered}
                {contentTargetTotal > 0 && <span className="text-base font-medium text-muted"> / {contentTargetTotal}</span>}
              </p>
              <p className="text-xs text-muted">Social Media Delivery{contentTargetTotal > 0 ? ` · ${contentDeliveryPct}%` : ""}</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* AGGREGATION — Overview membaca data dari Social Media/Meta Ads/Website/Goals/Reports, tidak menyimpan data baru. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Link href={`/admin/clients/${clientId}/meta-ads`}>
          <Card interactive padding="lg" className="h-full">
            <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Meta Ads</p>
            {!latestMeta ? (
              <p className="text-xs text-muted">Belum ada data Meta Ads.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="font-data text-xl font-bold text-ink">{latestMeta.leads ?? "—"}</p>
                  <p className="text-[11px] text-muted">Leads</p>
                </div>
                <div>
                  <p className="font-data text-xl font-bold text-ink">{latestMeta.spend != null ? `Rp${(latestMeta.spend / 1000000).toFixed(1)}M` : "—"}</p>
                  <p className="text-[11px] text-muted">Spend</p>
                </div>
                <div>
                  <p className="font-data text-xl font-bold text-ink">{latestMeta.reach != null ? `${Math.round(latestMeta.reach / 1000)}K` : "—"}</p>
                  <p className="text-[11px] text-muted">Reach</p>
                </div>
              </div>
            )}
          </Card>
        </Link>

        <Link href={`/admin/clients/${clientId}/website`}>
          <Card interactive padding="lg" className="h-full">
            <p className="mb-3 flex items-center gap-1.5 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">
              <Globe className="h-3.5 w-3.5" /> Website
            </p>
            {!latestWebsite ? (
              <p className="text-xs text-muted">Belum ada data Website.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="font-data text-xl font-bold text-ink">{latestWebsite.visitors != null ? `${(latestWebsite.visitors / 1000).toFixed(1)}K` : "—"}</p>
                  <p className="text-[11px] text-muted">Visitors</p>
                </div>
                <div>
                  <p className="font-data text-xl font-bold text-ink">{latestWebsite.sessions != null ? `${(latestWebsite.sessions / 1000).toFixed(1)}K` : "—"}</p>
                  <p className="text-[11px] text-muted">Sessions</p>
                </div>
                <div>
                  <p className="font-data text-xl font-bold text-ink">{latestWebsite.conversions ?? "—"}</p>
                  <p className="text-[11px] text-muted">Leads</p>
                </div>
              </div>
            )}
          </Card>
        </Link>
      </div>

      <Card padding="lg">
        <SectionHeading
          title="Social Media Performance"
          description={socialByPlatform.length === 0 ? "Belum ada data performance." : "Snapshot terbaru per platform."}
          action={
            <Link href={`/admin/clients/${clientId}/social-media?tab=performance`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Kelola <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        {socialByPlatform.length === 0 ? (
          <p className="text-xs text-muted">Belum ada data Social Media untuk client ini.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {socialByPlatform.map(({ platform, latest }) => (
              <div key={platform}>
                <p className="font-data text-[10px] uppercase tracking-wider text-muted">{platform}</p>
                <p className="mt-1 text-sm font-bold text-ink">{latest?.followers != null ? `${(latest.followers / 1000).toFixed(1)}K` : "—"}</p>
                <p className="text-[11px] text-muted">followers</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* GOALS — bukan top-level menu lagi, dikelola langsung di sini (Overview). */}
      <Card padding="lg">
        <SectionHeading title="Goals" description="Target bisnis client. Actual untuk sekarang diisi manual." />
        {goals.length === 0 ? (
          <p className="mb-4 text-xs text-muted">Belum ada goal.</p>
        ) : (
          <div className="mb-4 space-y-3">
            {goals.map((goal) => {
              const pct = goal.target > 0 ? Math.min(100, Math.round((goal.actual / goal.target) * 100)) : 0;
              return (
                <div key={goal.id} className="rounded-[var(--radius-md)] border border-border p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{goal.label}</p>
                      <StatusBadge status={goal.status} />
                    </div>
                    <form action={deleteGoalAction}>
                      <input type="hidden" name="id" value={goal.id} />
                      <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </form>
                  </div>
                  <p className="mt-1 font-data text-xs text-muted">
                    {goal.actual.toLocaleString("id-ID")} / {goal.target.toLocaleString("id-ID")} {goal.unit} · {pct}%
                  </p>
                  <div className="mt-2">
                    <ProgressBar value={pct} />
                  </div>
                  <form action={updateGoalAction} className="mt-2 flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={goal.id} />
                    <input name="actual" type="number" defaultValue={goal.actual} className={smallInputClass} />
                    <select name="status" defaultValue={goal.status} className={smallInputClass}>
                      <option value="draft">Draft</option>
                      <option value="on_track">On Track</option>
                      <option value="at_risk">At Risk</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
                      Update
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
        <form action={addGoal} className="grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-5">
          <input name="label" placeholder="Nama goal" required className={cn2()} />
          <input name="target" type="number" placeholder="Target" required className={smallInputClass} />
          <input name="actual" type="number" placeholder="Actual" defaultValue={0} className={smallInputClass} />
          <input name="unit" placeholder="Unit" className={smallInputClass} />
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="h-3.5 w-3.5" /> Add Goal
          </button>
        </form>
      </Card>

      {latestReport && (
        <Link href={`/admin/clients/${clientId}/reports`}>
          <Card interactive className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <FileText className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Latest Report</p>
              <p className="text-xs text-muted">{latestReport.periodMonth}</p>
            </div>
          </Card>
        </Link>
      )}

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
