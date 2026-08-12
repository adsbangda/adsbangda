import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Trash2, Plus, Users, Eye, Heart, TrendingUp } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { buttonVariants } from "@/components/dashboard/button";
import {
  adminListContent,
  adminCreateContentFull,
  adminDeleteContent,
  adminListContentTargets,
  adminUpsertContentTarget,
  adminListPerformanceMetrics,
  adminCreatePerformanceMetric,
  adminDeletePerformanceMetric,
} from "@/lib/admin-data";
import { CONTENT_TYPES_BY_PLATFORM, type SocialPlatform } from "@/lib/types";
import { formatDateID, cn } from "@/lib/utils";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";
const SOCIAL_PLATFORMS: SocialPlatform[] = ["instagram", "facebook", "tiktok", "x", "linkedin", "threads"];

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function SegmentedNav({ base, active }: { base: string; active: "delivery" | "performance" }) {
  const items: { key: "delivery" | "performance"; label: string }[] = [
    { key: "delivery", label: "Content Delivery" },
    { key: "performance", label: "Performance" },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-border bg-black/[0.02] p-1">
      {items.map((item) => (
        <Link
          key={item.key}
          href={`${base}?tab=${item.key}`}
          className={cn(
            "rounded-[var(--radius-sm)] px-4 py-2 font-data text-[11px] font-semibold transition-all duration-200 ease-out",
            active === item.key ? "bg-white text-ink shadow-[var(--shadow-xs)]" : "text-muted hover:bg-white/60 hover:text-ink"
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default async function AdminClientSocialMediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ tab?: string; platform?: string }>;
}) {
  const { clientId } = await params;
  const { tab = "delivery", platform = "instagram" } = await searchParams;
  const base = `/admin/clients/${clientId}/social-media`;
  const path = base;
  const period = currentPeriod();
  const activeTab = tab === "performance" ? "performance" : "delivery";
  const activePlatform = (SOCIAL_PLATFORMS.includes(platform as SocialPlatform) ? platform : "instagram") as SocialPlatform;

  const [content, targets] = await Promise.all([adminListContent(clientId), adminListContentTargets(clientId, period)]);

  const totalTarget = targets.reduce((sum, t) => sum + t.target, 0);
  const delivered = content.length; // sederhana: semua content bulan ini dihitung delivered (sesuai scope saat ini)
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

  async function deleteContentAction(formData: FormData) {
    "use server";
    await adminDeleteContent(String(formData.get("id")));
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

  return (
    <div className="animate-rise space-y-6 p-5 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-base font-bold text-ink">How is organic social performing?</h2>
        <p className="mt-1 text-sm text-muted">Satu rumah untuk semua urusan social media — target & delivery content, plus performance per-platform.</p>
      </div>

      <SegmentedNav base={base} active={activeTab} />

      {activeTab === "delivery" ? (
        <div className="animate-rise space-y-6">
          <Card padding="lg">
            <SectionHeading title={`Content Delivery — ${period}`} description="Progress dihitung otomatis dari Content List di bawah, bukan diketik manual." />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="font-data text-3xl font-bold text-ink">{totalTarget}</p>
                <p className="text-xs text-muted">Target</p>
              </div>
              <div>
                <p className="font-data text-3xl font-bold text-ink">{delivered}</p>
                <p className="text-xs text-muted">Delivered</p>
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
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
                {targets.map((t) => (
                  <div key={t.id} className="rounded-[var(--radius-sm)] bg-black/[0.02] p-3">
                    <p className="font-data text-[10px] uppercase tracking-wider text-muted">
                      {t.platform} · {t.contentType}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ink">Target: {t.target}</p>
                  </div>
                ))}
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
                {Object.entries(CONTENT_TYPES_BY_PLATFORM).flatMap(([, types]) => types).filter((v, i, arr) => arr.indexOf(v) === i).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input name="target" type="number" placeholder="Target" required className={inputClass} />
              <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Set Target
              </button>
            </form>
          </Card>

          <Card padding="lg">
            <SectionHeading title="Content List" description="Semua content yang sudah dimasukkan untuk client ini." />

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
                      <th className="pb-2 font-medium">Link</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {content.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 pr-3 font-data text-xs text-muted">{item.plannedDate}</td>
                        <td className="py-3 pr-3 font-data text-xs capitalize text-muted">{item.platform}</td>
                        <td className="py-3 pr-3 font-data text-xs capitalize text-muted">{item.type}</td>
                        <td className="py-3 pr-3 font-medium text-ink">{item.title}</td>
                        <td className="py-3 pr-3">
                          <StatusBadge status={item.status} />
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
                          <form action={deleteContentAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
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
                {Object.entries(CONTENT_TYPES_BY_PLATFORM).flatMap(([, types]) => types).filter((v, i, arr) => arr.indexOf(v) === i).map((t) => (
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
      ) : (
        <PerformancePanel clientId={clientId} base={base} activePlatform={activePlatform} addMetric={addMetric} deleteMetricAction={deleteMetricAction} />
      )}
    </div>
  );
}

async function PerformancePanel({
  clientId,
  base,
  activePlatform,
  addMetric,
  deleteMetricAction,
}: {
  clientId: string;
  base: string;
  activePlatform: SocialPlatform;
  addMetric: (formData: FormData) => Promise<void>;
  deleteMetricAction: (formData: FormData) => Promise<void>;
}) {
  const metrics = await adminListPerformanceMetrics(clientId, "social", activePlatform);
  const latest = metrics[0];

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniMetric icon={Users} label="Followers" value={latest.followers} />
            <MiniMetric icon={Eye} label="Reach" value={latest.reach} />
            <MiniMetric icon={Heart} label="Engagement Rate" value={latest.engagementRate} suffix="%" />
            <MiniMetric icon={TrendingUp} label="Profile Visits" value={latest.visitors} />
          </div>
        )}

        <form action={addMetric} className="mt-6 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-6">
          <input type="hidden" name="platform" value={activePlatform} />
          <input name="date" type="date" required className={inputClass} />
          <input name="followers" type="number" placeholder="Followers" className={inputClass} />
          <input name="reach" type="number" placeholder="Reach" className={inputClass} />
          <input name="impressions" type="number" placeholder="Impressions" className={inputClass} />
          <input name="engagementRate" type="number" step="0.01" placeholder="Engagement %" className={inputClass} />
          <input name="visitors" type="number" placeholder="Profile Visits" className={inputClass} />
          <button type="submit" className={buttonVariants({ variant: "primary", size: "sm", className: "sm:col-span-6 justify-center" })}>
            <Plus className="h-3.5 w-3.5" /> Save Data
          </button>
        </form>
      </Card>

      <Card padding="lg">
        <SectionHeading title="Performance History" description={`Snapshot ${activePlatform}, urut terbaru.`} />
        {metrics.length === 0 ? (
          <p className="text-xs text-muted">Belum ada data.</p>
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {metrics.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{formatDateID(m.date)}</p>
                  <p className="font-data text-xs text-muted">
                    {m.followers != null && `${m.followers.toLocaleString("id-ID")} followers · `}
                    {m.reach != null && `${m.reach.toLocaleString("id-ID")} reach · `}
                    {m.engagementRate != null && `${m.engagementRate}% ER`}
                  </p>
                </div>
                <form action={deleteMetricAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus">
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </form>
              </div>
            ))}
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
