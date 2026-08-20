import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Trash2, Plus, Users, Eye, Heart, TrendingUp, Pencil, Target } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { buttonVariants } from "@/components/dashboard/button";
import {
  adminListContent,
  adminCreateContentFull,
  adminUpdateContentFull,
  adminUpdateContentStatus,
  adminDeleteContent,
  adminListContentTargets,
  adminUpsertContentTarget,
  adminUpdateContentTargetById,
  adminDeleteContentTarget,
  adminListPerformanceMetrics,
  adminCreatePerformanceMetric,
  adminUpdatePerformanceMetric,
  adminDeletePerformanceMetric,
  adminListGoals,
  adminCreateGoal,
  adminUpdateGoal,
  adminDeleteGoal,
} from "@/lib/admin-data";
import { CONTENT_TYPES_BY_PLATFORM, type SocialPlatform, type GoalStatus, type ContentStatus } from "@/lib/types";
import { QuickStatusSelect } from "@/components/admin/quick-status-select";
import { PillTabs } from "@/components/admin/pill-tabs";
import { formatDateID, formatPercent, cn } from "@/lib/utils";
import { FormattedNumberInput } from "@/components/dashboard/formatted-number-input";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";
const SOCIAL_PLATFORMS: SocialPlatform[] = ["instagram", "facebook", "tiktok", "x", "linkedin", "threads"];
const ALL_CONTENT_TYPES = Array.from(new Set(Object.values(CONTENT_TYPES_BY_PLATFORM).flat()));

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function SegmentedNav({ base, active }: { base: string; active: "delivery" | "performance" | "goals" }) {
  const items: { key: "delivery" | "performance" | "goals"; label: string }[] = [
    { key: "delivery", label: "Content Delivery" },
    { key: "performance", label: "Performance" },
    { key: "goals", label: "Goals" },
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

export default async function AdminClientSocialMediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ tab?: string; platform?: string; edit?: string; editTarget?: string }>;
}) {
  const { clientId } = await params;
  const { tab = "delivery", platform = "instagram", edit, editTarget } = await searchParams;
  const base = `/admin/clients/${clientId}/social-media`;
  const path = base;
  const period = currentPeriod();
  const activeTab = tab === "performance" ? "performance" : tab === "goals" ? "goals" : "delivery";
  const activePlatform = (SOCIAL_PLATFORMS.includes(platform as SocialPlatform) ? platform : "instagram") as SocialPlatform;

  const [content, targets] = await Promise.all([adminListContent(clientId), adminListContentTargets(clientId, period)]);

  const totalTarget = targets.reduce((sum, t) => sum + t.target, 0);
  const delivered = content.filter((c) => c.status === "published").length; // sesuai brief: HANYA published yang dihitung Delivered
  const deliveryPct = totalTarget > 0 ? Math.min(100, Math.round((delivered / totalTarget) * 100)) : 0;

  async function addContent(formData: FormData) {
    "use server";
    await adminCreateContentFull(clientId, {
      title: String(formData.get("title")),
      plannedDate: String(formData.get("plannedDate")),
      status: String(formData.get("status")) as never,
      platform: String(formData.get("platform")),
      type: String(formData.get("type")) as never,
      assetUrl: String(formData.get("assetUrl") ?? "").trim() || undefined,
      publishLink: String(formData.get("publishLink") ?? "").trim() || undefined,
      approvalRequired: formData.get("approvalRequired") === "on",
    });
    revalidatePath(path);
  }

  async function updateContentAction(formData: FormData) {
    "use server";
    await adminUpdateContentFull(String(formData.get("id")), {
      title: String(formData.get("title")),
      plannedDate: String(formData.get("plannedDate")),
      status: String(formData.get("status")) as never,
      platform: String(formData.get("platform")),
      type: String(formData.get("type")) as never,
      assetUrl: String(formData.get("assetUrl") ?? "").trim(),
      publishLink: String(formData.get("publishLink") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
      approvalRequired: formData.get("approvalRequired") === "on",
    });
    revalidatePath(path);
  }

  async function deleteContentAction(formData: FormData) {
    "use server";
    await adminDeleteContent(String(formData.get("id")));
    revalidatePath(path);
  }

  async function quickStatusAction(contentId: string, status: ContentStatus) {
    "use server";
    await adminUpdateContentStatus(contentId, status);
    revalidatePath(path);
  }

  async function saveTargetAction(formData: FormData) {
    "use server";
    await adminUpsertContentTarget(clientId, {
      period,
      platform: String(formData.get("platform")),
      contentType: String(formData.get("contentType")),
      target: Number(formData.get("target") ?? 0),
    });
    revalidatePath(path);
  }

  async function deleteTargetAction(formData: FormData) {
    "use server";
    await adminDeleteContentTarget(String(formData.get("id")));
    revalidatePath(path);
  }

  async function updateTargetAction(formData: FormData) {
    "use server";
    await adminUpdateContentTargetById(String(formData.get("targetId")), {
      platform: String(formData.get("platform")),
      contentType: String(formData.get("contentType")),
      target: Number(formData.get("target") ?? 0),
    });
    revalidatePath(path);
  }

  async function addMetric(formData: FormData) {
    "use server";
    await adminCreatePerformanceMetric(clientId, "social", {
      date: String(formData.get("date")),
      platform: String(formData.get("platform")) as SocialPlatform,
      followers: Number(formData.get("followers") ?? 0) || undefined,
      reach: Number(formData.get("reach") ?? 0) || undefined,
      impressions: Number(formData.get("impressions") ?? 0) || undefined,
      engagementRate: Number(formData.get("engagementRate") ?? 0) || undefined,
      visitors: Number(formData.get("visitors") ?? 0) || undefined,
    });
    revalidatePath(path);
  }

  async function deleteMetricAction(formData: FormData) {
    "use server";
    await adminDeletePerformanceMetric(String(formData.get("id")), "social");
    revalidatePath(path);
  }

  async function updateMetricAction(formData: FormData) {
    "use server";
    await adminUpdatePerformanceMetric(String(formData.get("id")), "social", {
      date: String(formData.get("date")),
      followers: Number(formData.get("followers") ?? 0) || undefined,
      reach: Number(formData.get("reach") ?? 0) || undefined,
      impressions: Number(formData.get("impressions") ?? 0) || undefined,
      engagementRate: Number(formData.get("engagementRate") ?? 0) || undefined,
      visitors: Number(formData.get("visitors") ?? 0) || undefined,
    });
    revalidatePath(path);
  }

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

  return (
    <div className="animate-rise space-y-6 p-5 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-base font-bold text-ink">How is organic social performing?</h2>
        <p className="mt-1 text-sm text-muted">Satu rumah untuk semua urusan social media — target & delivery content, performance per-platform, dan goals.</p>
      </div>

      <SegmentedNav base={base} active={activeTab} />

      {activeTab === "delivery" && (
        <div className="animate-rise space-y-6">
          <Card padding="lg">
            <SectionHeading title={`Content Delivery — ${period}`} description="Progress dihitung otomatis dari Content List (hanya status Published), bukan diketik manual." />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="font-data text-3xl font-bold text-ink">{totalTarget}</p>
                <p className="text-xs text-muted">Target</p>
              </div>
              <div>
                <p className="font-data text-3xl font-bold text-ink">{delivered}</p>
                <p className="text-xs text-muted">Delivered (Published)</p>
              </div>
              <div>
                <p className="font-data text-3xl font-bold text-ink">{deliveryPct}%</p>
                <p className="text-xs text-muted">Progress</p>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={deliveryPct} />
            </div>

            {targets.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-3 lg:grid-cols-4">
                {targets.map((t) => {
                  const actual = content.filter((c) => c.status === "published" && c.platform === t.platform && c.type === t.contentType).length;
                  const pct = t.target > 0 ? Math.min(100, Math.round((actual / t.target) * 100)) : 0;
                  return editTarget === t.id ? (
                    <form key={t.id} action={updateTargetAction} className="col-span-2 space-y-2 rounded-[var(--radius-sm)] border border-accent bg-accent-soft/40 p-3 sm:col-span-1">
                      <input type="hidden" name="targetId" value={t.id} />
                      <select name="platform" defaultValue={t.platform} className={`${inputClass} w-full`}>
                        {SOCIAL_PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <select name="contentType" defaultValue={t.contentType} className={`${inputClass} w-full`}>
                        {ALL_CONTENT_TYPES.map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                      </select>
                      <input name="target" type="number" defaultValue={t.target} required className={`${inputClass} w-full`} />
                      <div className="flex gap-1.5">
                        <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                          Save
                        </button>
                        <Link href={`${base}?tab=delivery`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                          Cancel
                        </Link>
                      </div>
                    </form>
                  ) : (
                    <div key={t.id} className="rounded-[var(--radius-sm)] bg-black/[0.02] p-3">
                      <p className="font-data text-[10px] uppercase tracking-wider text-muted">
                        {t.platform} · {t.contentType}
                      </p>
                      <p className="mt-1 text-lg font-bold text-ink">
                        {actual} <span className="text-sm font-medium text-muted">/ {t.target}</span>
                      </p>
                      <p className="font-data text-xs text-muted">{pct}%</p>
                      <div className="mt-2 flex items-center gap-3">
                        <Link href={`${base}?tab=delivery&editTarget=${t.id}`} className="font-data text-[11px] font-semibold text-accent hover:underline">
                          Edit
                        </Link>
                        <form action={deleteTargetAction}>
                          <input type="hidden" name="id" value={t.id} />
                          <button type="submit" className="font-data text-[11px] font-semibold text-danger hover:underline">
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <form action={saveTargetAction} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-4">
              <select name="platform" defaultValue="instagram" className={inputClass}>
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select name="contentType" className={inputClass}>
                {ALL_CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input name="target" type="number" placeholder="Target" required className={inputClass} />
              <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <Plus className="h-3.5 w-3.5" /> Add Goal
              </button>
            </form>
          </Card>

          <Card padding="lg">
            <SectionHeading title="Content List" description="Semua content yang sudah dimasukkan. Klik Edit untuk ubah field apa pun — status Published tetap bisa diedit." />

            {content.length === 0 ? (
              <EmptyState title="Belum ada content" description="Tambahkan content pertama lewat form di bawah." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Platform</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Title</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Approval</th>
                      <th className="pb-2 font-medium">Desain</th>
                      <th className="pb-2 font-medium">Publish</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {content.map((item) =>
                      edit === item.id ? (
                        <tr key={item.id} className="bg-accent-soft/40">
                          <td colSpan={9} className="py-3">
                            <form action={updateContentAction} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                              <input type="hidden" name="id" value={item.id} />
                              <input name="title" defaultValue={item.title} required placeholder="Judul" className="col-span-2 sm:col-span-1 rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink" />
                              <select name="platform" defaultValue={item.platform} className={inputClass}>
                                {SOCIAL_PLATFORMS.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                              <select name="type" defaultValue={item.type} className={inputClass}>
                                {ALL_CONTENT_TYPES.map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                              <input name="plannedDate" type="date" defaultValue={item.plannedDate} required className={inputClass} />
                              <select name="status" defaultValue={item.status} className={inputClass}>
                                <option value="draft">draft</option>
                                <option value="in_production">in_production</option>
                                <option value="waiting_approval">waiting_approval</option>
                                <option value="approved">approved</option>
                                <option value="scheduled">scheduled</option>
                                <option value="published">published</option>
                              </select>
                              <input name="assetUrl" defaultValue={item.assetUrl ?? ""} placeholder="Asset URL" className={inputClass} />
                              <input name="publishLink" defaultValue={item.publishLink ?? ""} placeholder="Publish link" className={inputClass} />
                              <label className="flex items-center gap-1.5 text-xs text-ink">
                                <input type="checkbox" name="approvalRequired" defaultChecked={item.approvalRequired} /> Perlu Approval
                              </label>
                              <input name="notes" defaultValue={item.notes ?? ""} placeholder="Notes" className="col-span-2 sm:col-span-3 rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink" />
                              <div className="flex gap-2">
                                <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                                  Save
                                </button>
                                <Link href={`${base}?tab=delivery`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                                  Cancel
                                </Link>
                              </div>
                            </form>
                          </td>
                        </tr>
                      ) : (
                        <tr key={item.id}>
                          <td className="py-3 pr-3 font-data text-xs text-muted">{item.plannedDate}</td>
                          <td className="py-3 pr-3 font-data text-xs capitalize text-muted">{item.platform}</td>
                          <td className="py-3 pr-3 font-data text-xs capitalize text-muted">{item.type}</td>
                          <td className="py-3 pr-3 font-medium text-ink">{item.title}</td>
                          <td className="py-3 pr-3">
                            <QuickStatusSelect contentId={item.id} defaultValue={item.status} action={quickStatusAction} />
                          </td>
                          <td className="py-3 pr-3 font-data text-xs text-muted">{item.approvalRequired ? item.approvalStatus ?? "pending" : "—"}</td>
                          <td className="py-3 pr-3">
                            {item.assetUrl ? (
                              <a href={item.assetUrl} target="_blank" rel="noopener noreferrer" className="font-data text-xs font-semibold text-accent hover:underline">
                                Desain
                              </a>
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            {item.publishLink ? (
                              <a href={item.publishLink} target="_blank" rel="noopener noreferrer" className="font-data text-xs font-semibold text-accent hover:underline">
                                Open
                              </a>
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`${base}?tab=delivery&edit=${item.id}`} className="text-muted hover:text-ink" aria-label="Edit">
                                <Pencil className="h-4 w-4" strokeWidth={1.75} />
                              </Link>
                              <form action={deleteContentAction}>
                                <input type="hidden" name="id" value={item.id} />
                                <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <form action={addContent} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-4">
              <input name="title" placeholder="Judul konten" required className="col-span-2 sm:col-span-1 rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink" />
              <select name="platform" defaultValue="instagram" className={inputClass}>
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select name="type" className={inputClass}>
                {ALL_CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input name="plannedDate" type="date" required className={inputClass} />
              <input name="assetUrl" placeholder="Asset URL (opsional)" className={inputClass} />
              <input name="publishLink" placeholder="Publish link (opsional)" className={inputClass} />
              <select name="status" className={inputClass}>
                <option value="draft">draft</option>
                <option value="in_production">in_production</option>
                <option value="scheduled">scheduled</option>
                <option value="published">published</option>
              </select>
              <label className="flex items-center gap-1.5 text-xs text-ink">
                <input type="checkbox" name="approvalRequired" /> Perlu Approval
              </label>
              <button type="submit" className={buttonVariants({ variant: "primary", size: "sm", className: "justify-center" })}>
                <Plus className="h-3.5 w-3.5" /> Add Content
              </button>
            </form>
          </Card>
        </div>
      )}

      {activeTab === "performance" && (
        <PerformancePanel
          clientId={clientId}
          base={base}
          activePlatform={activePlatform}
          addMetric={addMetric}
          updateMetricAction={updateMetricAction}
          deleteMetricAction={deleteMetricAction}
          edit={edit}
        />
      )}

      {activeTab === "goals" && (
        <GoalsPanel clientId={clientId} addGoal={addGoal} updateGoalAction={updateGoalAction} deleteGoalAction={deleteGoalAction} />
      )}
    </div>
  );
}

async function GoalsPanel({
  clientId,
  addGoal,
  updateGoalAction,
  deleteGoalAction,
}: {
  clientId: string;
  addGoal: (formData: FormData) => Promise<void>;
  updateGoalAction: (formData: FormData) => Promise<void>;
  deleteGoalAction: (formData: FormData) => Promise<void>;
}) {
  const goals = await adminListGoals(clientId);

  return (
    <div className="animate-rise space-y-6">
      <Card padding="lg">
        <SectionHeading title="Goals" description="Target bisnis client — Content Goal, Lead Goal, Ad Spend Goal, dsb. Actual diisi manual." />

        {goals.length === 0 ? (
          <EmptyState icon={Target} title="Belum ada goal" description="Tambahkan goal pertama lewat form di bawah." />
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
                    <input name="actual" type="number" defaultValue={goal.actual} className={inputClass} />
                    <select name="status" defaultValue={goal.status} className={inputClass}>
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
          <input name="label" placeholder="Nama goal" required className="col-span-2 rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink" />
          <input name="target" type="number" placeholder="Target" required className={inputClass} />
          <input name="actual" type="number" placeholder="Actual" defaultValue={0} className={inputClass} />
          <input name="unit" placeholder="Unit" className={inputClass} />
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm", className: "sm:col-span-5 justify-center" })}>
            <Plus className="h-3.5 w-3.5" /> Add Goal
          </button>
        </form>
      </Card>
    </div>
  );
}

async function PerformancePanel({
  clientId,
  base,
  activePlatform,
  addMetric,
  updateMetricAction,
  deleteMetricAction,
  edit,
}: {
  clientId: string;
  base: string;
  activePlatform: SocialPlatform;
  addMetric: (formData: FormData) => Promise<void>;
  updateMetricAction: (formData: FormData) => Promise<void>;
  deleteMetricAction: (formData: FormData) => Promise<void>;
  edit?: string;
}) {
  const metrics = await adminListPerformanceMetrics(clientId, "social", activePlatform);
  const latest = metrics[0];
  const performanceBase = `${base}?tab=performance&platform=${activePlatform}`;

  return (
    <div className="animate-rise space-y-6">
      <Card padding="lg">
        <SectionHeading title="Performance" description="Pilih platform, lalu masukkan data snapshot per tanggal." />

        <div className="mb-4 flex flex-wrap gap-1.5">
          {SOCIAL_PLATFORMS.map((p) => (
            <Link
              key={p}
              href={`${base}?tab=performance&platform=${p}`}
              className={cn(
                "rounded-full px-3 py-1.5 font-data text-[11px] font-semibold capitalize transition-all duration-200",
                p === activePlatform ? "bg-accent text-white" : "bg-black/[0.04] text-muted hover:bg-black/[0.08]"
              )}
            >
              {p}
            </Link>
          ))}
        </div>

        {!latest ? (
          <EmptyState icon={TrendingUp} title={`Belum ada data ${activePlatform}`} description="Tambahkan snapshot pertama lewat form di bawah." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <MiniMetric icon={Users} label="Followers" value={latest.followers} />
            <MiniMetric icon={Eye} label="Reach" value={latest.reach} />
            <MiniMetric icon={Eye} label="Impressions" value={latest.impressions} />
            <MiniMetric icon={Heart} label="Engagement Rate" value={latest.engagementRate} suffix="%" />
            <MiniMetric icon={TrendingUp} label="Profile Visits" value={latest.visitors} />
          </div>
        )}

        <form action={addMetric} className="mt-6 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-6">
          <input type="hidden" name="platform" value={activePlatform} />
          <input name="date" type="date" required className={inputClass} />
          <FormattedNumberInput name="followers" placeholder="Followers" className={inputClass} />
          <FormattedNumberInput name="reach" placeholder="Reach" className={inputClass} />
          <FormattedNumberInput name="impressions" placeholder="Impressions" className={inputClass} />
          <FormattedNumberInput name="engagementRate" allowDecimal placeholder="Engagement %" className={inputClass} />
          <FormattedNumberInput name="visitors" placeholder="Profile Visits" className={inputClass} />
          <button type="submit" className={buttonVariants({ variant: "primary", size: "sm", className: "sm:col-span-6 justify-center" })}>
            <Plus className="h-3.5 w-3.5" /> Save Data
          </button>
        </form>
      </Card>

      <Card padding="lg">
        <SectionHeading title="Performance History" description={`Snapshot ${activePlatform}, urut terbaru. Klik Edit untuk perbaiki data (termasuk Impressions).`} />
        {metrics.length === 0 ? (
          <p className="text-xs text-muted">Belum ada data.</p>
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {metrics.map((m) =>
              edit === m.id ? (
                <div key={m.id} className="bg-accent-soft/40 py-3">
                  <form action={updateMetricAction} className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                    <input type="hidden" name="id" value={m.id} />
                    <input name="date" type="date" defaultValue={m.date} required className={inputClass} />
                    <FormattedNumberInput name="followers" defaultValue={m.followers} placeholder="Followers" className={inputClass} />
                    <FormattedNumberInput name="reach" defaultValue={m.reach} placeholder="Reach" className={inputClass} />
                    <FormattedNumberInput name="impressions" defaultValue={m.impressions} placeholder="Impressions" className={inputClass} />
                    <FormattedNumberInput name="engagementRate" allowDecimal defaultValue={m.engagementRate} placeholder="Engagement %" className={inputClass} />
                    <FormattedNumberInput name="visitors" defaultValue={m.visitors} placeholder="Profile Visits" className={inputClass} />
                    <div className="flex gap-2 sm:col-span-6">
                      <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                        Save
                      </button>
                      <Link href={performanceBase} className={buttonVariants({ variant: "outline", size: "sm" })}>
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
                      {m.followers != null && `${m.followers.toLocaleString("id-ID")} followers · `}
                      {m.reach != null && `${m.reach.toLocaleString("id-ID")} reach · `}
                      {m.impressions != null && `${m.impressions.toLocaleString("id-ID")} impressions · `}
                      {m.engagementRate != null && `${formatPercent(m.engagementRate, 2)} ER`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`${performanceBase}&edit=${m.id}`} className="text-muted hover:text-ink" aria-label="Edit">
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
  );
}

function MiniMetric({ icon: Icon, label, value, suffix = "" }: { icon: React.ElementType; label: string; value?: number; suffix?: string }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="font-data text-2xl font-bold text-ink">{value != null ? `${value.toLocaleString("id-ID")}${suffix}` : "—"}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </Card>
  );
}
