import { revalidatePath } from "next/cache";
import { Trash2, Plus, Wallet, Eye, Target, Megaphone } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/dashboard/button";
import { adminListPerformanceMetrics, adminCreatePerformanceMetric, adminDeletePerformanceMetric } from "@/lib/admin-data";
import { formatDateID } from "@/lib/utils";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";

function MetricCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="font-data text-2xl font-bold text-ink">{value ?? "—"}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </Card>
  );
}

function NotAvailableCard({ label }: { label: string }) {
  return (
    <Card className="flex items-center gap-4 border-dashed">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-muted">
        <span className="font-data text-xs">—</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">Belum tersedia</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </Card>
  );
}

export default async function AdminClientMetaAdsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const path = `/admin/clients/${clientId}/meta-ads`;
  const metrics = await adminListPerformanceMetrics(clientId, "meta_ads");
  const latest = metrics[0];

  async function addMetric(formData: FormData) {
    "use server";
    await adminCreatePerformanceMetric(clientId, "meta_ads", {
      date: String(formData.get("date")),
      spend: Number(formData.get("spend") ?? 0) || undefined,
      reach: Number(formData.get("reach") ?? 0) || undefined,
      impressions: Number(formData.get("impressions") ?? 0) || undefined,
      clicks: Number(formData.get("clicks") ?? 0) || undefined,
      leads: Number(formData.get("leads") ?? 0) || undefined,
      costPerLead: Number(formData.get("costPerLead") ?? 0) || undefined,
    });
    revalidatePath(path);
  }

  async function deleteMetricAction(formData: FormData) {
    "use server";
    await adminDeletePerformanceMetric(String(formData.get("id")), "meta_ads");
    revalidatePath(path);
  }

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-base font-bold text-ink">How are paid campaigns performing?</h2>
        <p className="mt-1 text-sm text-muted">
          Data Meta Ads client ini. Sekarang diisi manual per snapshot — struktur ini yang sama nantinya dipakai kalau
          datanya diisi otomatis lewat Meta Marketing API.
        </p>
      </div>

      {/* PERFORMANCE OVERVIEW */}
      <div>
        <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Performance Overview</p>
        {!latest ? (
          <Card>
            <EmptyState icon={Megaphone} title="Belum ada data performance" description="Tambahkan snapshot pertama lewat form di bawah untuk melihat ringkasan di sini." />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={Wallet} label="Spend" value={latest.spend != null ? `Rp${latest.spend.toLocaleString("id-ID")}` : null} />
            <MetricCard icon={Eye} label="Reach" value={latest.reach != null ? latest.reach.toLocaleString("id-ID") : null} />
            <MetricCard icon={Target} label="Results (Leads)" value={latest.leads != null ? latest.leads.toLocaleString("id-ID") : null} />
            <MetricCard
              icon={Wallet}
              label="Cost per Lead"
              value={latest.costPerLead != null ? `Rp${latest.costPerLead.toLocaleString("id-ID")}` : null}
            />
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NotAvailableCard label="CTR — belum ada field di database" />
          <NotAvailableCard label="CPC — belum ada field di database" />
          <NotAvailableCard label="ROAS — belum ada field di database" />
        </div>
        {latest && <p className="mt-2 text-xs text-muted">Snapshot terbaru: {formatDateID(latest.date)}</p>}
      </div>

      {/* CAMPAIGN PERFORMANCE */}
      <Card padding="lg">
        <SectionHeading title="Campaign Performance" description="Breakdown performa per-campaign." />
        <EmptyState
          icon={Megaphone}
          title="Belum ada data campaign"
          description="Data yang tercatat sekarang masih agregat per-tanggal, belum per-campaign. Struktur tabel campaign direncanakan untuk fase berikutnya — bukan fake data."
        />
      </Card>

      {/* PERFORMANCE DETAIL */}
      <Card padding="lg">
        <SectionHeading title="Performance Detail" description="Semua snapshot yang tercatat, urut dari terbaru." />
        {metrics.length === 0 ? (
          <p className="text-xs text-muted">Belum ada data.</p>
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {metrics.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{formatDateID(m.date)}</p>
                  <p className="font-data text-xs text-muted">
                    {m.spend != null && `Rp${m.spend.toLocaleString("id-ID")} spend · `}
                    {m.leads != null && `${m.leads} leads · `}
                    {m.costPerLead != null && `Rp${m.costPerLead.toLocaleString("id-ID")} CPL · `}
                    {m.reach != null && `${m.reach.toLocaleString("id-ID")} reach · `}
                    {m.impressions != null && `${m.impressions.toLocaleString("id-ID")} impressions · `}
                    {m.clicks != null && `${m.clicks} clicks`}
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

        <form action={addMetric} className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-6">
          <input name="date" type="date" required className={inputClass} />
          <input name="spend" type="number" placeholder="Ad Spend (Rp)" className={inputClass} />
          <input name="leads" type="number" placeholder="Leads" className={inputClass} />
          <input name="costPerLead" type="number" placeholder="Cost per Lead" className={inputClass} />
          <input name="reach" type="number" placeholder="Reach" className={inputClass} />
          <input name="impressions" type="number" placeholder="Impressions" className={inputClass} />
          <input name="clicks" type="number" placeholder="Clicks" className={inputClass} />
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm", className: "sm:col-span-6 justify-center" })}>
            <Plus className="h-3.5 w-3.5" /> Add Performance Data
          </button>
        </form>
      </Card>
    </div>
  );
}
