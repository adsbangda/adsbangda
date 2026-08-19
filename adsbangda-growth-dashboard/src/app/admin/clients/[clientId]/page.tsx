import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Briefcase, Users, FileText, ArrowRight, AlertCircle, Clock } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { MetaAdsSummary } from "@/components/dashboard/meta-ads-summary";
import { WebsiteSummary } from "@/components/dashboard/website-summary";
import { buttonVariants } from "@/components/dashboard/button";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { LogoUploadField } from "@/components/admin/logo-upload-field";
import {
  adminGetClient,
  adminUpdateClient,
  adminDeleteClient,
  adminListClientTeam,
  adminListContent,
  adminListContentTargets,
  adminComputeOverallProgress,
  adminListPerformanceMetrics,
  adminListReports,
  adminListWebsiteActivity,
  uploadClientLogo,
} from "@/lib/admin-data";
import { formatDateID, formatDecimal } from "@/lib/utils";
import type { Client, SocialPlatform } from "@/lib/types";

const inputClass = "w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink";
const SOCIAL_PLATFORMS: SocialPlatform[] = ["instagram", "facebook", "tiktok", "x", "linkedin", "threads"];

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
    const logoFile = formData.get("logoFile");
    const uploadedLogoUrl = logoFile instanceof File ? await uploadClientLogo(logoFile) : undefined;
    const removeLogo = formData.get("removeLogo") === "on";

    await adminUpdateClient(clientId, {
      name: String(formData.get("name") ?? "").trim(),
      industry: String(formData.get("industry") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      status: String(formData.get("status") ?? currentStatus) as Client["status"],
      ...(uploadedLogoUrl ? { logoUrl: uploadedLogoUrl } : removeLogo ? { logoUrl: "" } : {}),
    });
    revalidatePath(path);
  }

  async function deleteClientAction() {
    "use server";
    await adminDeleteClient(clientId);
    redirect("/admin/clients");
  }

  const [team, content, contentTargets, socialMetrics, metaMetrics, websiteMetrics, reports, websiteActivity, overallProgress] = await Promise.all([
    adminListClientTeam(clientId),
    adminListContent(clientId),
    adminListContentTargets(clientId, period),
    adminListPerformanceMetrics(clientId, "social"),
    adminListPerformanceMetrics(clientId, "meta_ads"),
    adminListPerformanceMetrics(clientId, "website"),
    adminListReports(clientId),
    adminListWebsiteActivity(clientId),
    adminComputeOverallProgress(clientId),
  ]);

  const contentTargetTotal = contentTargets.reduce((sum, t) => sum + t.target, 0);
  const publishedContent = content.filter((c) => c.status === "published");
  const contentDeliveryPct = contentTargetTotal > 0 ? Math.min(100, Math.round((publishedContent.length / contentTargetTotal) * 100)) : 0;
  const latestMeta = metaMetrics[0];
  const latestWebsite = websiteMetrics[0];
  const latestReport = reports[0];
  const socialByPlatform = SOCIAL_PLATFORMS.map((p) => ({ platform: p, latest: socialMetrics.find((m) => m.platform === p) })).filter((s) => s.latest);

  // Goal per platform+type (Social Media Goals) — actual dihitung dari Content List (published), bukan input manual.
  const goalBreakdown = contentTargets.map((t) => {
    const actual = publishedContent.filter((c) => c.platform === t.platform && c.type === t.contentType).length;
    return { ...t, actual, pct: t.target > 0 ? Math.min(100, Math.round((actual / t.target) * 100)) : 0 };
  });

  // ---- SEMUA di bawah ini READ-ONLY — dibaca dari module masing-masing, TIDAK ada form input di Overview ----

  const pendingApprovalContent = content.filter((c) => c.approvalRequired && (c.approvalStatus === "pending" || c.approvalStatus === "revision"));
  const scheduledContent = content
    .filter((c) => c.status === "scheduled")
    .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
    .slice(0, 5);

  type ActivityFeedEntry = { date: string; label: string };
  const recentActivity: ActivityFeedEntry[] = [
    ...publishedContent.slice(0, 2).map((c) => ({ date: c.plannedDate, label: `Content published: ${c.title}` })),
    ...(latestMeta ? [{ date: latestMeta.date, label: "Meta Ads data updated" }] : []),
    ...(latestWebsite ? [{ date: latestWebsite.date, label: "Website data updated" }] : []),
    ...websiteActivity.slice(0, 2).map((a) => ({ date: a.date, label: a.title })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="animate-rise space-y-6 p-5 lg:p-8">
      <Card padding="lg">
        <SectionHeading title="Client Information" description="Identitas & layanan aktif client — bukan tempat input data operasional. Status Archived menyembunyikan client dari daftar aktif." />
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
          <div className="sm:col-span-2 lg:col-span-1">
            <LogoUploadField name="logoFile" clientName={client.name} currentLogoUrl={client.logoUrl} showRemoveOption />
          </div>
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

      {/* OVERALL SNAPSHOT — semua read-only, dibaca dari module masing-masing */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                {publishedContent.length}
                {contentTargetTotal > 0 && <span className="text-base font-medium text-muted"> / {contentTargetTotal}</span>}
              </p>
              <p className="text-xs text-muted">Social Media Delivery{contentTargetTotal > 0 ? ` · ${contentDeliveryPct}%` : ""}</p>
            </div>
          </Card>
        </Link>
        <Card className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Briefcase className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-data text-2xl font-bold text-accent">{overallProgress != null ? `${overallProgress}%` : "—"}</p>
            <p className="text-xs text-muted">Overall Progress</p>
          </div>
        </Card>
      </div>

      {/* SOCIAL MEDIA GOALS — Feed 3/12, Reels 1/3, dst. Actual computed dari Content List. */}
      {client.socialMediaActive && goalBreakdown.length > 0 && (
        <Card padding="lg">
          <SectionHeading
            title="Social Media Goals"
            description="Actual dihitung otomatis dari Content List (status Published)."
            action={
              <Link href={`/admin/clients/${clientId}/social-media?tab=delivery`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Kelola <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {goalBreakdown.map((g) => (
              <div key={g.id} className="rounded-[var(--radius-md)] border border-border p-3">
                <p className="font-data text-[10px] uppercase tracking-wider text-muted">
                  {g.platform} · {g.contentType}
                </p>
                <p className="mt-1 text-lg font-bold text-ink">
                  {g.actual} <span className="text-sm font-medium text-muted">/ {g.target}</span>
                </p>
                <p className="font-data text-xs text-muted">{g.pct}%</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Meta Ads & Website — pakai KOMPONEN YANG SAMA PERSIS dengan Client
          Overview (MetaAdsSummary/WebsiteSummary), bukan grid custom
          terpisah — supaya angka & layout yang admin lihat SELALU identik
          dengan yang client lihat (auto-fit grid, full width, tidak ada
          gap aneh), sambil tetap dibungkus "versi admin": Card dengan
          SectionHeading + tombol "Kelola" (bukan seluruh card jadi link),
          konsisten dengan pola Social Media Goals/Performance di bawah. */}
      {(client.metaAdsActive || client.websiteActive) && (
        <div className={`grid grid-cols-1 items-start gap-4 ${client.metaAdsActive && client.websiteActive ? "lg:grid-cols-2" : ""}`}>
          {client.metaAdsActive && (
            <Card padding="lg">
              <SectionHeading
                title="Meta Ads"
                action={
                  <Link href={`/admin/clients/${clientId}/meta-ads`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Kelola <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              />
              <MetaAdsSummary metrics={[...metaMetrics].reverse()} budgetTarget={client.metaAdsBudgetTarget} />
            </Card>
          )}

          {client.websiteActive && (
            <Card padding="lg">
              <SectionHeading
                title="Website"
                action={
                  <Link href={`/admin/clients/${clientId}/website`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Kelola <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                }
              />
              <WebsiteSummary metrics={[...websiteMetrics].reverse()} />
            </Card>
          )}
        </div>
      )}

      {client.socialMediaActive && (
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
                  <p className="mt-1 text-sm font-bold text-ink">{latest?.followers != null ? `${formatDecimal(latest.followers / 1000)}K` : "—"}</p>
                  <p className="text-[11px] text-muted">followers</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* NEEDS ATTENTION — computed dari content pending approval, BUKAN input manual */}
      <Card padding="lg">
        <SectionHeading title="Needs Attention" description="Otomatis dari status approval content — bukan input manual." />
        {pendingApprovalContent.length === 0 ? (
          <p className="text-xs text-muted">Tidak ada yang butuh perhatian saat ini.</p>
        ) : (
          <Link href={`/admin/clients/${clientId}/social-media`} className="flex items-center gap-3 rounded-[var(--radius-md)] bg-warning-soft p-3 transition-colors hover:bg-warning-soft/70">
            <AlertCircle className="h-5 w-5 shrink-0 text-warning" strokeWidth={1.75} />
            <p className="text-sm text-ink">
              <span className="font-semibold">{pendingApprovalContent.length} content</span> menunggu approval / revision
            </p>
          </Link>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* RECENT ACTIVITY — computed feed gabungan dari Content/Meta Ads/Website, BUKAN input manual */}
        <Card padding="lg">
          <SectionHeading title="Recent Activity" description="Otomatis dari aktivitas terbaru di semua module." />
          {recentActivity.length === 0 ? (
            <p className="text-xs text-muted">Belum ada aktivitas tercatat.</p>
          ) : (
            <ul className="space-y-2.5">
              {recentActivity.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.75} />
                  <div>
                    <p className="text-ink">{a.label}</p>
                    <p className="font-data text-[11px] text-muted">{formatDateID(a.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* UPCOMING — computed dari content berstatus scheduled, BUKAN input manual */}
        <Card padding="lg">
          <SectionHeading title="Upcoming" description="Content yang sudah dijadwalkan." />
          {scheduledContent.length === 0 ? (
            <p className="text-xs text-muted">Tidak ada content terjadwal.</p>
          ) : (
            <ul className="space-y-2.5">
              {scheduledContent.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">{c.title}</span>
                  <span className="font-data text-[11px] text-muted">{formatDateID(c.plannedDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

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

      <Card padding="lg" className="border-danger-soft bg-danger-soft/30">
        <SectionHeading title="Danger Zone" description="Hapus client ini secara permanen — cuma bisa dilakukan super_admin, dan client harus Archived dulu." />
        {currentStatus !== "archived" ? (
          <p className="text-xs text-muted">
            Ubah status client ke <span className="font-semibold text-ink">Archived</span> lewat form di atas dulu kalau memang mau berhenti kerja sama — data tetap
            tersimpan dan bisa diaktifkan lagi kapan pun. Tombol hapus permanen muncul di sini setelah status Archived.
          </p>
        ) : (
          <form action={deleteClientAction}>
            <ConfirmDeleteButton
              confirmMessage={`Hapus "${client.name}" secara PERMANEN? Semua data — project, content, performance, report, file — ikut terhapus dan TIDAK BISA dikembalikan.`}
              className={buttonVariants({ variant: "outline", className: "border-danger text-danger hover:bg-danger-soft" })}
            >
              Hapus Client Ini Secara Permanen
            </ConfirmDeleteButton>
          </form>
        )}
      </Card>
    </div>
  );
}
