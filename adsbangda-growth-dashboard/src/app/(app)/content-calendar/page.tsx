import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Topbar } from "@/components/dashboard/topbar";
import { Card } from "@/components/dashboard/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { buttonVariants } from "@/components/dashboard/button";
import { getCurrentClient, getContentCalendar, respondToApproval } from "@/lib/data";
import { formatDateID } from "@/lib/utils";
import { Image as ImageIcon, Users, Music2, Globe, CheckCircle2 } from "lucide-react";

const PLATFORM_ICON: Record<string, typeof ImageIcon> = {
  instagram: ImageIcon,
  facebook: Users,
  tiktok: Music2,
  website: Globe,
};

export default async function ContentCalendarPage({ searchParams }: { searchParams: Promise<{ revise?: string }> }) {
  const { revise } = await searchParams;
  const client = await getCurrentClient();
  const items = await getContentCalendar(client.id);
  const path = "/content-calendar";

  const needsApproval = items.filter((i) => i.approvalRequired && (i.approvalStatus === "pending" || !i.approvalStatus));

  async function approveAction(formData: FormData) {
    "use server";
    await respondToApproval(String(formData.get("id")), "approved");
    revalidatePath(path);
  }

  async function requestRevisionAction(formData: FormData) {
    "use server";
    await respondToApproval(String(formData.get("id")), "revision_requested", String(formData.get("note") ?? ""));
    revalidatePath(path);
  }

  return (
    <div className="page-backdrop min-h-screen">
      <Topbar title="Content Calendar" subtitle="Rencana konten dan status approval." />

      <div className="space-y-5 p-5 lg:p-8">
        {needsApproval.length > 0 && (
          <Card padding="lg">
            <h2 className="mb-1 text-base font-bold text-ink">Needs Your Approval</h2>
            <p className="mb-4 text-sm text-muted">{needsApproval.length} content menunggu keputusan kamu.</p>
            <div className="space-y-4">
              {needsApproval.map((item) => {
                const Icon = PLATFORM_ICON[item.platform] ?? ImageIcon;
                return (
                  <div key={item.id} className="rounded-[var(--radius-md)] border border-warning-soft bg-warning-soft/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="inline-flex items-center gap-1.5 font-data text-[11px] uppercase tracking-wider text-muted">
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                          {item.platform} · {item.type}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-ink">{item.title}</p>
                        {item.notes && <p className="mt-1 text-xs text-muted">{item.notes}</p>}
                      </div>
                      {item.assetUrl && (
                        <a href={item.assetUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
                          Preview
                        </a>
                      )}
                    </div>

                    {revise === item.id ? (
                      <form action={requestRevisionAction} className="mt-3 space-y-2">
                        <input type="hidden" name="id" value={item.id} />
                        <label className="block text-xs font-medium text-ink">What needs to be changed?</label>
                        <textarea
                          name="note"
                          required
                          rows={2}
                          placeholder="Tolong ubah headline..."
                          className="w-full rounded-[var(--radius-md)] border border-border px-3 py-2 text-sm text-ink outline-none focus:border-ink"
                        />
                        <div className="flex gap-2">
                          <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                            Send Revision Request
                          </button>
                          <Link href={path} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                            Cancel
                          </Link>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <form action={approveAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                            Approve
                          </button>
                        </form>
                        <Link href={`${path}?revise=${item.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                          Request Revision
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {items.length === 0 ? (
          <EmptyState title="Belum ada konten terjadwal" description="Rencana konten dari tim Adsbangda akan muncul di sini." />
        ) : (
          <Card padding="sm" className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-black/[0.015] text-xs uppercase tracking-wide text-muted">
                    <th className="px-6 py-3 font-medium">Konten</th>
                    <th className="px-6 py-3 font-medium">Platform</th>
                    <th className="px-6 py-3 font-medium">Tipe</th>
                    <th className="px-6 py-3 font-medium">Tanggal</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const Icon = PLATFORM_ICON[item.platform] ?? ImageIcon;
                    return (
                      <tr key={item.id} className="border-b border-border last:border-0">
                        <td className="px-6 py-4 font-medium text-ink">{item.title}</td>
                        <td className="px-6 py-4 text-muted">
                          <span className="inline-flex items-center gap-1.5 capitalize">
                            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                            {item.platform}
                          </span>
                        </td>
                        <td className="px-6 py-4 capitalize text-muted">{item.type}</td>
                        <td className="px-6 py-4 font-data text-xs text-muted">{formatDateID(item.plannedDate)}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 font-data text-xs text-muted">
                          {!item.approvalRequired ? (
                            "—"
                          ) : item.approvalStatus === "approved" ? (
                            <span className="inline-flex items-center gap-1 text-success">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                            </span>
                          ) : item.approvalStatus === "revision" ? (
                            "Revision requested"
                          ) : (
                            "Pending"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
