import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Trash2, Plus, Users, Eye, Heart, TrendingUp, Pencil, Target, Check, X, Trophy, MessageCircle, Repeat2 } from "lucide-react";
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
  adminListPostPerformance,
  adminCreatePostPerformance,
  adminUpdatePostPerformance,
  adminDeletePostPerformance,
  adminListGoals,
  adminCreateGoal,
  adminUpdateGoal,
  adminDeleteGoal,
  adminListSocialConnections,
  adminSaveSocialConnection,
} from "@/lib/admin-data";
import { syncInstagramForClient, syncFacebookForClient, syncThreadsForClient } from "@/lib/meta-sync";
import { getPlatformPerformanceTable, type DateRange } from "@/lib/data";
import { CONTENT_TYPES_BY_PLATFORM, CONTENT_TYPE_LABEL, type SocialPlatform, type SocialConnection, type GoalStatus, type ContentStatus } from "@/lib/types";
import { PlatformContentTypeFields } from "@/components/dashboard/platform-content-type-fields";
import { QuickStatusSelect } from "@/components/admin/quick-status-select";
import { PillTabs } from "@/components/admin/pill-tabs";
import { formatDateID, formatPercent, cn } from "@/lib/utils";
import { FormattedNumberInput } from "@/components/dashboard/formatted-number-input";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { SubmitButton } from "@/components/dashboard/submit-button";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";
const SOCIAL_PLATFORMS: SocialPlatform[] = ["instagram", "facebook", "tiktok", "x", "linkedin", "threads"];
/** Cuma 3 platform ini yang punya auto-sync (lihat src/lib/meta-sync.ts) — TikTok/X/LinkedIn tetap manual sepenuhnya untuk sekarang. */
const AUTO_SYNC_PLATFORMS: SocialPlatform[] = ["instagram", "facebook", "threads"];
const ALL_CONTENT_TYPES = Array.from(new Set(Object.values(CONTENT_TYPES_BY_PLATFORM).flat()));

// Nama platform ada yang capitalize biasa nggak pas (tiktok -> TikTok,
// linkedin -> LinkedIn, x -> X), jadi dipetakan manual di sini, dipakai di
// semua <option> platform supaya konsisten rapi kapitalnya.
const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  x: "X",
  linkedin: "LinkedIn",
  threads: "Threads",
};

// Content type (feed/reels/story/dst) capitalize kata pertama saja sudah pas.
function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

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
  searchParams: Promise<{
    tab?: string;
    platform?: string;
    edit?: string;
    editTarget?: string;
    editPost?: string;
    sync?: string;
    rows?: string;
    message?: string;
    itemsFound?: string;
    itemsFailed?: string;
    itemError?: string;
    contentItemsFailed?: string;
    contentItemError?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const { clientId } = await params;
  const { tab = "delivery", platform = "instagram", edit, editTarget, editPost, sync, rows, message, itemsFound, itemsFailed, itemError, contentItemsFailed, contentItemError, from, to } =
    await searchParams;
  // Rentang perbandingan performance — validasi sama seperti Client Portal
  // Overview (dua-duanya ada, format benar, urut). Tanpa ini (default),
  // getPlatformPerformanceTable otomatis pakai SATU BULAN PENUH (bulan
  // berjalan) dibanding SATU BULAN sebelumnya.
  const isValidDate = (v: string | undefined): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime());
  const performanceRange: DateRange | undefined = isValidDate(from) && isValidDate(to) && from <= to ? { from, to } : undefined;
  const base = `/admin/clients/${clientId}/social-media`;
  const path = base;
  const period = currentPeriod();
  const activeTab = tab === "performance" ? "performance" : tab === "goals" ? "goals" : "delivery";
  const activePlatform = (SOCIAL_PLATFORMS.includes(platform as SocialPlatform) ? platform : "instagram") as SocialPlatform;

  const [content, targets] = await Promise.all([adminListContent(clientId), adminListContentTargets(clientId, period)]);

  const totalTarget = targets.reduce((sum, t) => sum + t.target, 0);
  // BUG SEBELUMNYA: `delivered` menghitung SEMUA post published SEPANJANG
  // MASA (all-time), padahal dibandingkan ke `totalTarget` yang cuma target
  // SATU BULAN (`period`) — progress % jadi tidak pernah masuk akal (makin
  // lama makin numpuk, atau malah kelihatan "kurang" relatif kalau target
  // bulan ini dinaikkan tapi actual lama ikut kehitung terus). Sekarang
  // di-scope ke bulan `period` yang sama persis dengan target-nya, pakai
  // `plannedDate` (tanggal konten itu SEHARUSNYA/SEBENARNYA tayang).
  const delivered = content.filter((c) => c.status === "published" && c.plannedDate.slice(0, 7) === period).length; // sesuai brief: HANYA published yang dihitung Delivered
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
    // Sebelumnya cuma revalidatePath, jadi setelah Save form tetap kebuka
    // (URL masih ?edit=id) dan kelihatan seperti tidak ngapa-ngapain —
    // padahal datanya sebenarnya sudah tersimpan. redirect() di sini yang
    // menutup mode edit dan balik ke tampilan list, jadi Save-nya kerasa.
    redirect(path);
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
    redirect(`${base}?tab=delivery`);
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
      replies: Number(formData.get("replies") ?? 0) || undefined,
      reposts: Number(formData.get("reposts") ?? 0) || undefined,
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
      replies: Number(formData.get("replies") ?? 0) || undefined,
      reposts: Number(formData.get("reposts") ?? 0) || undefined,
    });
    revalidatePath(path);
    redirect(`${base}?tab=performance&platform=${activePlatform}`);
  }

  async function saveSocialConnectionAction(formData: FormData) {
    "use server";
    const platformValue = String(formData.get("platform") ?? activePlatform) as SocialConnection["platform"];
    const externalAccountId = String(formData.get("externalAccountId") ?? "").trim();
    const accessToken = String(formData.get("accessToken") ?? "").trim();
    if (!externalAccountId) {
      redirect(`${base}?tab=performance&platform=${activePlatform}&sync=error&message=${encodeURIComponent("Account ID kosong.")}`);
    }
    await adminSaveSocialConnection(clientId, platformValue, { externalAccountId, accessToken: accessToken || undefined });
    revalidatePath(path);
  }

  async function syncSocialAction() {
    "use server";
    const connections = await adminListSocialConnections(clientId);
    const conn = connections.find((c) => c.platform === activePlatform);
    if (!conn) {
      redirect(`${base}?tab=performance&platform=${activePlatform}&sync=error&message=${encodeURIComponent("Belum ada koneksi tersimpan.")}`);
    }
    const result =
      activePlatform === "instagram"
        ? await syncInstagramForClient(clientId, conn!.externalAccountId, conn!.accessToken)
        : activePlatform === "facebook"
          ? await syncFacebookForClient(clientId, conn!.externalAccountId, conn!.accessToken)
          : activePlatform === "threads"
            ? await syncThreadsForClient(clientId, conn!.externalAccountId, conn!.accessToken)
            : null;
    revalidatePath(path);
    if (!result || result.error) {
      redirect(`${base}?tab=performance&platform=${activePlatform}&sync=error&message=${encodeURIComponent(result?.error ?? "Platform tidak didukung.")}`);
    }
    // Kalau ada item yang GAGAL disimpan (ketarik dari Meta tapi gagal
    // upsert ke database), tetap redirect ke "sync=ok" (metrics/post lain
    // yang berhasil TETAP tersimpan), tapi kirim juga detail diagnostiknya
    // lewat query param terpisah supaya admin bisa lihat PERSIS kenapa
    // sebagian item tidak masuk — sebelumnya ini didiamkan total tanpa jejak.
    const itemsFound = result.itemsFound ?? 0;
    const itemsFailed = result.itemsFailed ?? 0;
    const contentItemsFailed = result.contentItemsFailed ?? 0;
    const diagParams =
      (itemsFailed > 0 ? `&itemsFound=${itemsFound}&itemsFailed=${itemsFailed}&itemError=${encodeURIComponent(result.firstItemError ?? "")}` : itemsFound > 0 ? `&itemsFound=${itemsFound}` : "") +
      (contentItemsFailed > 0
        ? `&contentItemsFailed=${contentItemsFailed}&contentItemError=${encodeURIComponent(result.firstContentItemError ?? "")}`
        : "");
    redirect(`${base}?tab=performance&platform=${activePlatform}&sync=ok&rows=${result.metricsSynced + result.postsSynced}${diagParams}`);
  }

  async function addPostAction(formData: FormData) {
    "use server";    await adminCreatePostPerformance(clientId, {
      platform: String(formData.get("platform")) as SocialPlatform,
      type: String(formData.get("type")),
      title: String(formData.get("title")),
      postedDate: String(formData.get("postedDate")),
      likes: Number(formData.get("likes") ?? 0) || undefined,
      views: Number(formData.get("views") ?? 0) || undefined,
      comments: Number(formData.get("comments") ?? 0) || undefined,
      shares: Number(formData.get("shares") ?? 0) || undefined,
      saves: Number(formData.get("saves") ?? 0) || undefined,
      thumbnailUrl: String(formData.get("thumbnailUrl") ?? "").trim() || undefined,
    });
    revalidatePath(path);
  }

  async function updatePostAction(formData: FormData) {
    "use server";
    await adminUpdatePostPerformance(String(formData.get("id")), {
      type: String(formData.get("type")),
      title: String(formData.get("title")),
      postedDate: String(formData.get("postedDate")),
      likes: Number(formData.get("likes") ?? 0) || undefined,
      views: Number(formData.get("views") ?? 0) || undefined,
      comments: Number(formData.get("comments") ?? 0) || undefined,
      shares: Number(formData.get("shares") ?? 0) || undefined,
      saves: Number(formData.get("saves") ?? 0) || undefined,
      thumbnailUrl: String(formData.get("thumbnailUrl") ?? "").trim() || undefined,
    });
    revalidatePath(path);
    redirect(`${base}?tab=performance&platform=${activePlatform}`);
  }

  async function deletePostAction(formData: FormData) {
    "use server";
    await adminDeletePostPerformance(String(formData.get("id")));
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
              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-5 lg:grid-cols-2">
                {Object.entries(
                  targets.reduce<Record<string, typeof targets>>((groups, t) => {
                    (groups[t.platform] ??= []).push(t);
                    return groups;
                  }, {})
                ).map(([platform, rows]) => (
                  <div key={platform} className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface shadow-[var(--shadow-xs)]">
                    <div className="border-b border-border bg-black/[0.02] px-4 py-2.5">
                      <p className="text-sm font-semibold text-ink">{PLATFORM_LABELS[platform] ?? platform}</p>
                    </div>
                    <div className="divide-y divide-border">
                      {rows.map((t) => {
                        const actual = content.filter(
                          (c) => c.status === "published" && c.platform === t.platform && c.type === t.contentType && c.plannedDate.slice(0, 7) === period
                        ).length; // di-scope ke `period` yang sama dengan target (lihat komentar di deklarasi `delivered` di atas — bug yang sama).
                        const pct = t.target > 0 ? Math.min(100, Math.round((actual / t.target) * 100)) : 0;
                        return editTarget === t.id ? (
                          <form key={t.id} action={updateTargetAction} className="flex flex-wrap items-center gap-2 bg-accent-soft/40 px-4 py-3">
                            <input type="hidden" name="targetId" value={t.id} />
                            <input type="hidden" name="platform" value={t.platform} />
                            <select name="contentType" defaultValue={t.contentType} className={`${inputClass} min-w-[110px] flex-1`}>
                              {(CONTENT_TYPES_BY_PLATFORM[t.platform as SocialPlatform] ?? ALL_CONTENT_TYPES).map((ct) => (
                                <option key={ct} value={ct}>
                                  {CONTENT_TYPE_LABEL[ct] ?? ct}
                                </option>
                              ))}
                            </select>
                            <input name="target" type="number" defaultValue={t.target} required className={`${inputClass} w-20`} />
                            <div className="flex items-center gap-1">
                              <button type="submit" className="rounded-[var(--radius-sm)] p-1.5 text-success hover:bg-success-soft" aria-label="Simpan">
                                <Check className="h-4 w-4" strokeWidth={2} />
                              </button>
                              <Link href={`${base}?tab=delivery`} className="rounded-[var(--radius-sm)] p-1.5 text-muted hover:bg-black/[0.04] hover:text-ink" aria-label="Batal">
                                <X className="h-4 w-4" strokeWidth={2} />
                              </Link>
                            </div>
                          </form>
                        ) : (
                          <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                            <p className="w-16 shrink-0 text-xs font-medium text-ink">{capitalize(t.contentType)}</p>
                            <div className="min-w-[60px] flex-1">
                              <ProgressBar value={pct} />
                            </div>
                            <p className="w-14 shrink-0 text-right font-data text-xs text-muted">
                              {actual}/{t.target}
                            </p>
                            <p className="w-9 shrink-0 text-right font-data text-xs font-bold text-ink">{pct}%</p>
                            <div className="flex shrink-0 items-center gap-1">
                              <Link href={`${base}?tab=delivery&editTarget=${t.id}`} className="rounded-[var(--radius-sm)] p-1.5 text-muted hover:bg-black/[0.04] hover:text-ink" aria-label="Edit">
                                <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                              </Link>
                              <form action={deleteTargetAction}>
                                <input type="hidden" name="id" value={t.id} />
                                <button type="submit" className="rounded-[var(--radius-sm)] p-1.5 text-muted hover:bg-danger-soft hover:text-danger" aria-label="Hapus">
                                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                                </button>
                              </form>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-border pt-5">
              <p className="mb-3 text-xs font-semibold text-ink">Tambah Target Baru</p>
              <form action={saveTargetAction} className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:items-end">
                <PlatformContentTypeFields
                  platforms={SOCIAL_PLATFORMS}
                  platformLabels={PLATFORM_LABELS}
                  defaultPlatform="instagram"
                  className={`${inputClass} w-full`}
                  withLabels
                />
                <div>
                  <label className="mb-1 block font-data text-[10px] font-semibold uppercase tracking-wider text-muted">Target</label>
                  <input name="target" type="number" placeholder="0" required className={`${inputClass} w-full`} />
                </div>
                <button type="submit" className={buttonVariants({ variant: "outline", size: "sm", className: "justify-center" })}>
                  <Plus className="h-3.5 w-3.5" /> Add Target
                </button>
              </form>
            </div>
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
                      <th className="py-2 pr-4 font-medium">Date</th>
                      <th className="py-2 pr-4 font-medium">Platform</th>
                      <th className="py-2 pr-4 font-medium">Type</th>
                      <th className="py-2 pr-4 font-medium">Title</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 pr-4 font-medium">Approval</th>
                      <th className="py-2 pr-4 font-medium">Desain</th>
                      <th className="py-2 pr-4 font-medium">Publish</th>
                      <th className="py-2"></th>
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
                              <PlatformContentTypeFields
                                platforms={SOCIAL_PLATFORMS}
                                platformLabels={PLATFORM_LABELS}
                                defaultPlatform={item.platform}
                                defaultContentType={item.type}
                                contentTypeFieldName="type"
                                className={inputClass}
                              />
                              <input name="plannedDate" type="date" defaultValue={item.plannedDate} required className={inputClass} />
                              <select name="status" defaultValue={item.status} className={inputClass}>
                                {!["draft", "waiting_approval", "scheduled", "published"].includes(item.status) && (
                                  <option value={item.status}>{item.status} (lama)</option>
                                )}
                                <option value="draft">Draft</option>
                                <option value="waiting_approval">Minta Approval</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="published">Published</option>
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
                          <td className="py-3 pr-4 font-data text-xs whitespace-nowrap text-muted">{item.plannedDate}</td>
                          <td className="py-3 pr-4 font-data text-xs capitalize text-muted">{item.platform}</td>
                          <td className="py-3 pr-4 font-data text-xs capitalize text-muted">{item.type}</td>
                          <td className="py-3 pr-4 font-medium text-ink">
                            {item.title}
                            {item.source === "meta" && (
                              <span
                                className="ml-1.5 rounded-[var(--radius-sm)] bg-accent-soft px-1.5 py-0.5 font-data text-[9px] font-semibold uppercase tracking-wider text-accent"
                                title="Otomatis dari sync Threads/Instagram/Facebook"
                              >
                                Auto
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            <QuickStatusSelect contentId={item.id} defaultValue={item.status} action={quickStatusAction} />
                          </td>
                          <td className="py-3 pr-4 font-data text-xs whitespace-nowrap text-muted">{item.approvalRequired ? item.approvalStatus ?? "pending" : "—"}</td>
                          <td className="py-3 pr-4 whitespace-nowrap">
                            {item.assetUrl ? (
                              <a href={item.assetUrl} target="_blank" rel="noopener noreferrer" className="font-data text-xs font-semibold text-accent hover:underline">
                                Desain
                              </a>
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 whitespace-nowrap">
                            {item.publishLink ? (
                              <a href={item.publishLink} target="_blank" rel="noopener noreferrer" className="font-data text-xs font-semibold text-accent hover:underline">
                                Open
                              </a>
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                          <td className="py-3 pl-2 text-right">
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
              <PlatformContentTypeFields
                platforms={SOCIAL_PLATFORMS}
                platformLabels={PLATFORM_LABELS}
                defaultPlatform="instagram"
                contentTypeFieldName="type"
                className={inputClass}
              />
              <input name="plannedDate" type="date" required className={inputClass} />
              <input name="assetUrl" placeholder="Asset URL (opsional)" className={inputClass} />
              <input name="publishLink" placeholder="Publish link (opsional)" className={inputClass} />
              <select name="status" className={inputClass}>
                <option value="draft">Draft</option>
                <option value="waiting_approval">Minta Approval</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
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
          addPostAction={addPostAction}
          updatePostAction={updatePostAction}
          deletePostAction={deletePostAction}
          editPost={editPost}
          saveSocialConnectionAction={saveSocialConnectionAction}
          syncSocialAction={syncSocialAction}
          syncStatus={sync}
          syncRows={rows}
          syncMessage={message}
          syncItemsFound={itemsFound}
          syncItemsFailed={itemsFailed}
          syncItemError={itemError}
          syncContentItemsFailed={contentItemsFailed}
          syncContentItemError={contentItemError}
          performanceRange={performanceRange}
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
  addPostAction,
  updatePostAction,
  deletePostAction,
  editPost,
  saveSocialConnectionAction,
  syncSocialAction,
  syncStatus,
  syncRows,
  syncMessage,
  syncItemsFound,
  syncItemsFailed,
  syncItemError,
  syncContentItemsFailed,
  syncContentItemError,
  performanceRange,
}: {
  clientId: string;
  base: string;
  activePlatform: SocialPlatform;
  addMetric: (formData: FormData) => Promise<void>;
  updateMetricAction: (formData: FormData) => Promise<void>;
  deleteMetricAction: (formData: FormData) => Promise<void>;
  edit?: string;
  addPostAction: (formData: FormData) => Promise<void>;
  updatePostAction: (formData: FormData) => Promise<void>;
  deletePostAction: (formData: FormData) => Promise<void>;
  editPost?: string;
  saveSocialConnectionAction: (formData: FormData) => Promise<void>;
  syncSocialAction: () => Promise<void>;
  syncStatus?: string;
  syncRows?: string;
  syncMessage?: string;
  syncItemsFound?: string;
  syncItemsFailed?: string;
  syncItemError?: string;
  syncContentItemsFailed?: string;
  syncContentItemError?: string;
  performanceRange?: DateRange;
}) {
  const [metrics, posts, connections, performanceTable] = await Promise.all([
    adminListPerformanceMetrics(clientId, "social", activePlatform),
    adminListPostPerformance(clientId, activePlatform),
    adminListSocialConnections(clientId),
    getPlatformPerformanceTable(clientId, performanceRange),
  ]);
  // Baris teragregasi (SUM traffic sepanjang periode + snapshot terbaru utk
  // point-in-time, lihat komentar besar di getPlatformPerformanceTable) buat
  // platform yang lagi aktif — ini yang dipakai kartu ringkasan di bawah,
  // GANTI cara lama yang cuma nampilin `latest` (snapshot SATU HARI
  // terakhir tanpa agregasi/perbandingan sama sekali).
  const summary = performanceTable.find((r) => r.platform === activePlatform);
  const connection = connections.find((c) => c.platform === activePlatform);
  const performanceBase = `${base}?tab=performance&platform=${activePlatform}`;
  const postTypes = CONTENT_TYPES_BY_PLATFORM[activePlatform] ?? [];

  return (
    <div className="animate-rise space-y-6">
      {syncStatus && (
        <div
          className={`flex flex-col gap-1 rounded-[var(--radius-md)] border px-4 py-3 text-sm ${
            syncStatus === "ok" ? "border-success/30 bg-success-soft text-success" : "border-danger/30 bg-danger-soft text-danger"
          }`}
        >
          <div className="flex items-center gap-2">
            {syncStatus === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} />}
            {syncStatus === "ok" ? `Sync berhasil — ${syncRows ?? 0} baris ter-update.` : `Sync gagal: ${syncMessage ?? "Terjadi error."}`}
          </div>
          {/* Detail diagnostik — SENGAJA ditampilkan (bukan didiamkan lagi
              seperti sebelumnya) supaya kelihatan JELAS kalau ada post yang
              ketarik dari Meta tapi gagal disimpan, dan kenapa. Tanpa ini,
              gap antara "jumlah post asli di Instagram/Facebook" vs "jumlah
              yang muncul di Content Delivery/Kalender" tidak ada cara buat
              didiagnosis dari UI sama sekali. */}
          {syncStatus === "ok" && (Number(syncItemsFound ?? 0) > 0 || Number(syncItemsFailed ?? 0) > 0) && (
            <p className="pl-6 text-xs opacity-80">
              {Number(syncItemsFailed ?? 0) > 0
                ? `Ditemukan ${syncItemsFound ?? 0} post dari API, ${syncItemsFailed} GAGAL disimpan/ditarik. Error pertama: ${syncItemError || "(tidak ada pesan)"}`
                : `Ditemukan ${syncItemsFound} post dari API, semuanya berhasil disimpan.`}
            </p>
          )}
          {/* Post bisa saja berhasil masuk post_performance (Post Ranking)
              TAPI gagal ikut tercatat di content_items (Content Delivery &
              Kalender Konten) — dua tabel diisi terpisah di dalam
              upsertPost(). Sebelumnya kegagalan bagian INI didiamkan total
              tanpa jejak sama sekali, jadi Content Delivery/Kalender Konten
              bisa kelihatan "tidak update" padahal Post Ranking-nya baik-baik
              saja — sekarang ditampilkan terpisah di sini. */}
          {syncStatus === "ok" && Number(syncContentItemsFailed ?? 0) > 0 && (
            <p className="pl-6 text-xs font-semibold opacity-90">
              ⚠ {syncContentItemsFailed} post GAGAL tercatat di Content Delivery/Kalender Konten (walau berhasil di Post Ranking). Error pertama: {syncContentItemError || "(tidak ada pesan)"}
            </p>
          )}
        </div>
      )}

      {AUTO_SYNC_PLATFORMS.includes(activePlatform) && (
        <Card padding="lg">
          <SectionHeading
            title={`Koneksi Otomatis — ${PLATFORM_LABELS[activePlatform]}`}
            description={
              connection
                ? "Terhubung — sync otomatis tiap hari. Form manual di bawah tetap bisa dipakai kapan saja."
                : "Opsional — hubungkan biar Followers/Reach/Post Ranking ke-isi otomatis. Belum sempat setup? Form manual di bawah tetap 100% berfungsi."
            }
          />
          <form action={saveSocialConnectionAction} className="flex flex-wrap items-end gap-2" autoComplete="off">
            <input type="hidden" name="platform" value={activePlatform} />
            <div>
              <label className="font-data text-[11px] font-semibold uppercase tracking-wider text-muted">
                {activePlatform === "facebook" ? "Facebook Page ID" : activePlatform === "threads" ? "Threads User ID" : "IG Business Account ID"}
              </label>
              <input
                key={`${activePlatform}-externalAccountId`}
                name="externalAccountId"
                autoComplete="off"
                defaultValue={connection?.externalAccountId ?? ""}
                placeholder="mis. 17841400000000000"
                className={`mt-1 block w-56 ${inputClass}`}
              />
            </div>
            <div>
              <label className="font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Access Token</label>
              <input
                key={`${activePlatform}-accessToken`}
                name="accessToken"
                type="password"
                autoComplete="new-password"
                placeholder={connection ? "•••••• (kosongkan kalau tidak ganti)" : "Paste token di sini"}
                className={`mt-1 block w-56 ${inputClass}`}
              />
            </div>
            <SubmitButton variant="outline" size="sm" loadingLabel="Menyimpan...">
              Simpan
            </SubmitButton>
            {connection && (
              <SubmitButton formAction={syncSocialAction} variant="primary" size="sm" loadingLabel="Nge-sync...">
                <RefreshCw className="h-3.5 w-3.5" /> Sync Sekarang
              </SubmitButton>
            )}
            <span
              className={`ml-auto shrink-0 rounded-[var(--radius-md)] px-3 py-1.5 font-data text-[11px] font-semibold ${
                connection ? "bg-success-soft text-success" : "bg-black/[0.04] text-muted"
              }`}
            >
              {connection ? "● Terhubung" : "○ Belum terhubung"}
            </span>
          </form>
        </Card>
      )}

      <Card padding="lg">
        <SectionHeading
          title="Performance"
          description={
            performanceRange
              ? `Menampilkan ${performanceRange.from} s/d ${performanceRange.to}, dibandingkan periode sebelumnya dengan panjang yang sama.`
              : "Menampilkan bulan berjalan, dibandingkan bulan sebelumnya. Pilih preset di bawah untuk lihat harian/mingguan, atau isi form snapshot per tanggal."
          }
        />

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

        {/* Preset periode perbandingan — SAMA konsepnya dengan date-range
            picker di Overview Client Portal: klik salah satu, "current" vs
            "previous" otomatis dihitung ulang dengan panjang yang sama
            (harian dibanding kemarin, mingguan dibanding minggu lalu, dst).
            "Bulan Ini" (tanpa parameter from/to) = default. */}
        <div className="mb-5 flex flex-wrap gap-1.5 border-b border-border pb-4">
          {(
            [
              { label: "Bulan Ini", days: undefined },
              { label: "Hari Ini vs Kemarin", days: 1 },
              { label: "7 Hari Terakhir", days: 7 },
              { label: "30 Hari Terakhir", days: 30 },
              { label: "Tahun Ini", days: 365 },
            ] as { label: string; days: number | undefined }[]
          ).map((preset) => {
            let href = `${base}?tab=performance&platform=${activePlatform}`;
            let isActive = !performanceRange;
            if (preset.days != null) {
              const toDate = new Date();
              const fromDate = new Date(toDate);
              fromDate.setDate(toDate.getDate() - (preset.days - 1));
              const fromISO = fromDate.toISOString().slice(0, 10);
              const toISO = toDate.toISOString().slice(0, 10);
              href += `&from=${fromISO}&to=${toISO}`;
              isActive = performanceRange?.from === fromISO && performanceRange?.to === toISO;
            }
            return (
              <Link
                key={preset.label}
                href={href}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-data text-[11px] font-semibold transition-all duration-200",
                  isActive ? "border-ink bg-ink text-white" : "border-border bg-surface text-muted hover:border-ink hover:text-ink"
                )}
              >
                {preset.label}
              </Link>
            );
          })}
        </div>

        {!summary || (summary.followers == null && summary.reach == null && summary.impressions == null) ? (
          <EmptyState icon={TrendingUp} title={`Belum ada data ${activePlatform}`} description="Tambahkan snapshot pertama lewat form di bawah, atau klik Sync Sekarang kalau platform ini sudah terhubung." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <MiniMetric icon={Users} label="Followers" value={summary.followers} delta={summary.followersDelta} />
            {activePlatform === "threads" ? (
              <>
                {/* Threads tidak punya Reach/Profile Visits terpisah (semua digabung jadi "Views", ikut Impressions) — diganti Replies/Reposts yang beneran ada datanya di Threads. */}
                <MiniMetric icon={Eye} label="Views" value={summary.impressions} delta={summary.impressionsDelta} />
                <MiniMetric icon={Heart} label="Engagement Rate" value={summary.engagementRate} suffix="%" delta={summary.engagementRateDelta} />
                <MiniMetric icon={MessageCircle} label="Replies" value={summary.replies} delta={summary.repliesDelta} />
                <MiniMetric icon={Repeat2} label="Reposts" value={summary.reposts} delta={summary.repostsDelta} />
              </>
            ) : (
              <>
                <MiniMetric icon={Eye} label="Reach" value={summary.reach} delta={summary.reachDelta} />
                <MiniMetric icon={Eye} label="Impressions" value={summary.impressions} delta={summary.impressionsDelta} />
                <MiniMetric icon={Heart} label="Engagement Rate" value={summary.engagementRate} suffix="%" delta={summary.engagementRateDelta} />
                <MiniMetric icon={TrendingUp} label="Profile Visits" value={summary.profileVisit} delta={summary.profileVisitDelta} />
              </>
            )}
          </div>
        )}

        <form action={addMetric} className="mt-6 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-6">
          <input type="hidden" name="platform" value={activePlatform} />
          <input name="date" type="date" required className={inputClass} />
          <FormattedNumberInput name="followers" placeholder="Followers" className={inputClass} />
          {activePlatform === "threads" ? (
            <>
              <FormattedNumberInput name="impressions" placeholder="Views" className={inputClass} />
              <FormattedNumberInput name="engagementRate" allowDecimal placeholder="Engagement %" className={inputClass} />
              <FormattedNumberInput name="replies" placeholder="Replies" className={inputClass} />
              <FormattedNumberInput name="reposts" placeholder="Reposts" className={inputClass} />
            </>
          ) : (
            <>
              <FormattedNumberInput name="reach" placeholder="Reach" className={inputClass} />
              <FormattedNumberInput name="impressions" placeholder="Impressions" className={inputClass} />
              <FormattedNumberInput name="engagementRate" allowDecimal placeholder="Engagement %" className={inputClass} />
              <FormattedNumberInput name="visitors" placeholder="Profile Visits" className={inputClass} />
            </>
          )}
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
                    {activePlatform === "threads" ? (
                      <>
                        <FormattedNumberInput name="impressions" defaultValue={m.impressions} placeholder="Views" className={inputClass} />
                        <FormattedNumberInput
                          name="engagementRate"
                          allowDecimal
                          defaultValue={m.engagementRate}
                          placeholder="Engagement %"
                          className={inputClass}
                        />
                        <FormattedNumberInput name="replies" defaultValue={m.replies} placeholder="Replies" className={inputClass} />
                        <FormattedNumberInput name="reposts" defaultValue={m.reposts} placeholder="Reposts" className={inputClass} />
                      </>
                    ) : (
                      <>
                        <FormattedNumberInput name="reach" defaultValue={m.reach} placeholder="Reach" className={inputClass} />
                        <FormattedNumberInput name="impressions" defaultValue={m.impressions} placeholder="Impressions" className={inputClass} />
                        <FormattedNumberInput
                          name="engagementRate"
                          allowDecimal
                          defaultValue={m.engagementRate}
                          placeholder="Engagement %"
                          className={inputClass}
                        />
                        <FormattedNumberInput name="visitors" defaultValue={m.visitors} placeholder="Profile Visits" className={inputClass} />
                      </>
                    )}
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
                      {activePlatform === "threads" ? (
                        <>
                          {m.impressions != null && `${m.impressions.toLocaleString("id-ID")} views · `}
                          {m.replies != null && `${m.replies.toLocaleString("id-ID")} replies · `}
                          {m.reposts != null && `${m.reposts.toLocaleString("id-ID")} reposts · `}
                        </>
                      ) : (
                        <>
                          {m.reach != null && `${m.reach.toLocaleString("id-ID")} reach · `}
                          {m.impressions != null && `${m.impressions.toLocaleString("id-ID")} impressions · `}
                        </>
                      )}
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

      <Card padding="lg">
        <SectionHeading title="Post Ranking" description={`Postingan ${activePlatform} beserta metriknya sendiri (likes, views, comments, shares, saves) — dasar ranking di Client Portal.`} />

        {posts.length === 0 ? (
          <EmptyState icon={Trophy} title={`Belum ada postingan ${activePlatform}`} description="Tambahkan postingan pertama lewat form di bawah." />
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {posts.map((p) =>
              editPost === p.id ? (
                <div key={p.id} className="bg-accent-soft/40 py-3">
                  <form action={updatePostAction} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <input type="hidden" name="id" value={p.id} />
                    <select name="type" defaultValue={p.type} className={inputClass}>
                      {postTypes.map((t) => (
                        <option key={t} value={t}>
                          {CONTENT_TYPE_LABEL[t] ?? capitalize(t)}
                        </option>
                      ))}
                    </select>
                    <input name="title" defaultValue={p.title} placeholder="Judul/caption" required className={`${inputClass} sm:col-span-3`} />
                    <input name="postedDate" type="date" defaultValue={p.postedDate} required className={inputClass} />
                    <FormattedNumberInput name="likes" defaultValue={p.likes} placeholder="Likes" className={inputClass} />
                    <FormattedNumberInput name="views" defaultValue={p.views} placeholder="Views" className={inputClass} />
                    <FormattedNumberInput name="comments" defaultValue={p.comments} placeholder="Comments" className={inputClass} />
                    <FormattedNumberInput name="shares" defaultValue={p.shares} placeholder="Shares" className={inputClass} />
                    <FormattedNumberInput name="saves" defaultValue={p.saves} placeholder="Saves" className={inputClass} />
                    <input name="thumbnailUrl" defaultValue={p.thumbnailUrl ?? ""} placeholder="URL Gambar (opsional)" className={`${inputClass} sm:col-span-4`} />
                    <div className="flex gap-2 sm:col-span-4">
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
                <div key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                    <p className="font-data text-xs text-muted">
                      {CONTENT_TYPE_LABEL[p.type] ?? capitalize(p.type)} · {formatDateID(p.postedDate)} ·{" "}
                      {p.likes != null && `${p.likes.toLocaleString("id-ID")} likes · `}
                      {p.views != null && `${p.views.toLocaleString("id-ID")} views · `}
                      {p.comments != null && `${p.comments.toLocaleString("id-ID")} comments · `}
                      {p.shares != null && `${p.shares.toLocaleString("id-ID")} shares · `}
                      {p.saves != null && `${p.saves.toLocaleString("id-ID")} saves`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`${performanceBase}&editPost=${p.id}`} className="text-muted hover:text-ink" aria-label="Edit">
                      <Pencil className="h-4 w-4" strokeWidth={1.75} />
                    </Link>
                    <form action={deletePostAction}>
                      <input type="hidden" name="id" value={p.id} />
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

        <form action={addPostAction} className="mt-6 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-4">
          <input type="hidden" name="platform" value={activePlatform} />
          <select name="type" defaultValue={postTypes[0]} className={inputClass}>
            {postTypes.map((t) => (
              <option key={t} value={t}>
                {CONTENT_TYPE_LABEL[t] ?? capitalize(t)}
              </option>
            ))}
          </select>
          <input name="title" placeholder="Judul/caption" required className={`${inputClass} sm:col-span-3`} />
          <input name="postedDate" type="date" required className={inputClass} />
          <FormattedNumberInput name="likes" placeholder="Likes" className={inputClass} />
          <FormattedNumberInput name="views" placeholder="Views" className={inputClass} />
          <FormattedNumberInput name="comments" placeholder="Comments" className={inputClass} />
          <FormattedNumberInput name="shares" placeholder="Shares" className={inputClass} />
          <FormattedNumberInput name="saves" placeholder="Saves" className={inputClass} />
          <input name="thumbnailUrl" placeholder="URL Gambar (opsional)" className={`${inputClass} sm:col-span-4`} />
          <button type="submit" className={buttonVariants({ variant: "primary", size: "sm", className: "sm:col-span-4 justify-center" })}>
            <Plus className="h-3.5 w-3.5" /> Save Post
          </button>
        </form>
      </Card>
    </div>
  );
}

function MiniMetric({ icon: Icon, label, value, suffix = "", delta }: { icon: React.ElementType; label: string; value?: number; suffix?: string; delta?: number | null }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="font-data text-2xl font-bold text-ink">{value != null ? `${value.toLocaleString("id-ID")}${suffix}` : "—"}</p>
        <p className="text-xs text-muted">{label}</p>
        {delta != null && (
          <p className={cn("mt-0.5 font-data text-[11px] font-semibold", delta >= 0 ? "text-success" : "text-danger")}>
            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}%
          </p>
        )}
      </div>
    </Card>
  );
}
