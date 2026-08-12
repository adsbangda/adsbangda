import { notFound } from "next/navigation";
import { Logo } from "@/components/dashboard/logo";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PrintButton } from "@/components/admin/print-button";
import { adminGetClient, adminListContent, adminListPerformanceMetrics } from "@/lib/admin-data";
import { formatDateID } from "@/lib/utils";

export default async function AdminReportPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ start?: string; end?: string; notes?: string }>;
}) {
  const { clientId } = await params;
  const { start, end, notes } = await searchParams;
  const client = await adminGetClient(clientId);
  if (!client || !start || !end) notFound();

  const inRange = (dateStr: string) => dateStr >= start && dateStr <= end;

  const [content, socialMetrics, metaMetrics, websiteMetrics] = await Promise.all([
    adminListContent(clientId),
    client.socialMediaActive ? adminListPerformanceMetrics(clientId, "social") : Promise.resolve([]),
    client.metaAdsActive ? adminListPerformanceMetrics(clientId, "meta_ads") : Promise.resolve([]),
    client.websiteActive ? adminListPerformanceMetrics(clientId, "website") : Promise.resolve([]),
  ]);

  const contentInRange = content.filter((c) => inRange(c.plannedDate));
  const publishedInRange = contentInRange.filter((c) => c.status === "published");
  const metaInRange = metaMetrics.filter((m) => inRange(m.date));
  const socialInRange = socialMetrics.filter((m) => inRange(m.date));
  const websiteInRange = websiteMetrics.filter((m) => inRange(m.date));

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const metaSpend = sum(metaInRange.map((m) => m.spend ?? 0));
  const metaLeads = sum(metaInRange.map((m) => m.leads ?? 0));
  const metaReach = sum(metaInRange.map((m) => m.reach ?? 0));

  const websiteVisitors = sum(websiteInRange.map((m) => m.visitors ?? 0));
  const websiteLeads = sum(websiteInRange.map((m) => m.conversions ?? 0));

  const approvalRequiredInRange = contentInRange.filter((c) => c.approvalRequired);
  const approvedCount = approvalRequiredInRange.filter((c) => c.approvalStatus === "approved").length;
  const revisionCount = approvalRequiredInRange.filter((c) => c.approvalStatus === "revision").length;
  const pendingCount = approvalRequiredInRange.filter((c) => !c.approvalStatus || c.approvalStatus === "pending").length;

  const bySocialPlatform = Array.from(new Set(socialInRange.map((m) => m.platform))).map((platform) => {
    const rows = socialInRange.filter((m) => m.platform === platform).sort((a, b) => a.date.localeCompare(b.date));
    return { platform, latest: rows[rows.length - 1] };
  });

  return (
    <div className="mx-auto max-w-3xl bg-paper p-6 print:p-0 lg:p-10">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="text-xs text-muted">Preview report — data live dari database. Isi Notes lalu klik Print untuk Save as PDF.</p>
        <PrintButton />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-white p-8 shadow-[var(--shadow-xs)] print:border-0 print:p-0 print:shadow-none">
        <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
          <Logo tone="dark" height={22} />
          <div className="text-right">
            <p className="font-data text-[11px] uppercase tracking-wider text-muted">Report Period</p>
            <p className="font-data text-sm font-semibold text-ink">
              {formatDateID(start)} — {formatDateID(end)}
            </p>
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-ink">{client.name}</h1>
        <p className="mt-1 text-sm text-muted">{client.industry}</p>

        {/* EXECUTIVE SUMMARY */}
        <section className="mt-8">
          <h2 className="mb-3 font-data text-xs font-bold uppercase tracking-wider text-accent">1. Executive Summary</h2>
          <div className="grid grid-cols-3 gap-4 rounded-[var(--radius-md)] bg-black/[0.02] p-4">
            <div>
              <p className="font-data text-xl font-bold text-ink">{publishedInRange.length}</p>
              <p className="text-xs text-muted">Content Published</p>
            </div>
            {client.metaAdsActive && (
              <div>
                <p className="font-data text-xl font-bold text-ink">{metaLeads}</p>
                <p className="text-xs text-muted">Meta Ads Leads</p>
              </div>
            )}
            {client.websiteActive && (
              <div>
                <p className="font-data text-xl font-bold text-ink">{websiteVisitors.toLocaleString("id-ID")}</p>
                <p className="text-xs text-muted">Website Visitors</p>
              </div>
            )}
          </div>
        </section>

        {/* SOCIAL MEDIA */}
        {client.socialMediaActive && (
          <section className="mt-8">
            <h2 className="mb-3 font-data text-xs font-bold uppercase tracking-wider text-accent">2. Social Media</h2>
            {bySocialPlatform.length === 0 ? (
              <p className="text-xs text-muted">Tidak ada data performance di periode ini.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {bySocialPlatform.map(({ platform, latest }) => (
                  <div key={platform} className="rounded-[var(--radius-sm)] border border-border p-3">
                    <p className="font-data text-[10px] uppercase tracking-wider text-muted">{platform}</p>
                    <p className="mt-1 text-sm font-bold text-ink">{latest?.followers?.toLocaleString("id-ID") ?? "—"} followers</p>
                    <p className="text-xs text-muted">{latest?.reach?.toLocaleString("id-ID") ?? "—"} reach</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* CONTENT */}
        <section className="mt-8">
          <h2 className="mb-3 font-data text-xs font-bold uppercase tracking-wider text-accent">3. Content</h2>
          {contentInRange.length === 0 ? (
            <p className="text-xs text-muted">Tidak ada content di periode ini.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Platform</th>
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contentInRange.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 font-data text-muted">{c.plannedDate}</td>
                    <td className="py-2 font-data capitalize text-muted">{c.platform}</td>
                    <td className="py-2 text-ink">{c.title}</td>
                    <td className="py-2">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* META ADS */}
        {client.metaAdsActive && (
          <section className="mt-8">
            <h2 className="mb-3 font-data text-xs font-bold uppercase tracking-wider text-accent">4. Meta Ads</h2>
            {metaInRange.length === 0 ? (
              <p className="text-xs text-muted">Tidak ada data Meta Ads di periode ini.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[var(--radius-sm)] border border-border p-3">
                  <p className="font-data text-lg font-bold text-ink">Rp{metaSpend.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-muted">Total Spend</p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-border p-3">
                  <p className="font-data text-lg font-bold text-ink">{metaLeads}</p>
                  <p className="text-xs text-muted">Total Leads</p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-border p-3">
                  <p className="font-data text-lg font-bold text-ink">{metaReach.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-muted">Total Reach</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* WEBSITE */}
        {client.websiteActive && (
          <section className="mt-8">
            <h2 className="mb-3 font-data text-xs font-bold uppercase tracking-wider text-accent">5. Website</h2>
            {websiteInRange.length === 0 ? (
              <p className="text-xs text-muted">Tidak ada data Website di periode ini.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[var(--radius-sm)] border border-border p-3">
                  <p className="font-data text-lg font-bold text-ink">{websiteVisitors.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-muted">Total Visitors</p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-border p-3">
                  <p className="font-data text-lg font-bold text-ink">{websiteLeads}</p>
                  <p className="text-xs text-muted">Leads / Form Submission</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* APPROVAL SUMMARY — cuma tampil kalau memang ada content yang approval_required */}
        {approvalRequiredInRange.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-data text-xs font-bold uppercase tracking-wider text-accent">6. Approval Summary</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[var(--radius-sm)] border border-border p-3">
                <p className="font-data text-lg font-bold text-ink">{approvedCount}</p>
                <p className="text-xs text-muted">Approved</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-border p-3">
                <p className="font-data text-lg font-bold text-ink">{revisionCount}</p>
                <p className="text-xs text-muted">Revision Requested</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-border p-3">
                <p className="font-data text-lg font-bold text-ink">{pendingCount}</p>
                <p className="text-xs text-muted">Pending</p>
              </div>
            </div>
          </section>
        )}

        {/* NOTES */}
        {notes && (
          <section className="mt-8">
            <h2 className="mb-3 font-data text-xs font-bold uppercase tracking-wider text-accent">Notes / Highlights</h2>
            <p className="whitespace-pre-wrap text-sm text-ink">{notes}</p>
          </section>
        )}
      </div>
    </div>
  );
}
