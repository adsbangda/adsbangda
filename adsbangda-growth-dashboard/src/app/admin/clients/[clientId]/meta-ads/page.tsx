import { revalidatePath } from "next/cache";
import { Trash2, Plus, Wallet, Eye, Target, Megaphone, MousePointerClick } from "lucide-react";
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

export default async function AdminClientMetaAdsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const path = `/admin/clients/${clientId}/meta-ads`;
  const metrics = await adminListPerformanceMetrics(clientId, "meta_ads");
  const latest = metrics[0];

  async function addMetric(formData: FormData) {
    "use server";
    await adminCreatePerformanceMetric(clientId, "meta_ads", {
      date: String(formData.get("date")),
      leads: Number(formData.get("leads") ?? 0) || undefined,
      spend: Number(formData.get("spend") ?? 0) || undefined,
      reach: Number(formData.get("reach") ?? 0) || undefined,
      impressions: Number(formData.get("impressions") ?? 0) || undefined,
      clicks: Number(formData.get("clicks") ?? 0) || undefined,
      ctr: Number(formData.get("ctr") ?? 0) || undefined,
      cpc: Number(formData.get("cpc") ?? 0) || undefined,
      costPerLead: Number(formData.get("costPerLead") ?? 0) || undefined,
      roas: Number(formData.get("roas") ?? 0) || undefined,
    });
    revalidatePath(path);
  }

  async function deleteMetricAction(formData: FormData) {
    "use server";
    await adminDeletePerformanceMetric(String(formData.get("id")), "meta_ads");
    revalidatePath(path);
  }

  return (
    <div className="animate-rise space-y-6 p-5 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-base font-bold text-ink">How are paid campaigns performing?</h2>
        <p className="mt-1 text-sm text-muted">Input data harian sesederhana: tanggal, metric, save. Field ini yang sama nantinya dipakai kalau data diisi otomatis lewat Meta Marketing API.</p>
      </div>

      <div>
        <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Latest Snapshot</p>
        {!latest ? (
          <Card>
            <EmptyState icon={Megaphone} title="Belum ada data performance" description="Tambahkan snapshot pertama lewat form di bawah." />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={Target} label="Leads" value={latest.leads != null ? latest.leads.toLocaleString("id-ID") : null} />
            <MetricCard icon={Wallet} label="Ad Spend" value={latest.spend != null ? `Rp${latest.spend.toLocaleString("id-ID")}` : null} />
            <MetricCard icon={Eye} label="Reach" value={latest.reach != null ? latest.reach.toLocaleString("id-ID") : null} />
            <MetricCard icon={MousePointerClick} label="Clicks" value={latest.clicks != null ? latest.clicks.toLocaleString("id-ID") : null} />
            <MetricCard icon={MousePointerClick} label="CTR" value={latest.ctr != null ? `${latest.ctr}%` : null} />
            <MetricCard icon={Wallet} label="CPC" value={latest.cpc != null ? `Rp${latest.cpc.toLocaleString("id-ID")}` : null} />
            <MetricCard icon={Wallet} label="CPL" value={latest.costPerLead != null ? `Rp${latest.costPerLead.toLocaleString("id-ID")}` : null} />
            <MetricCard icon={Target} label="ROAS" value={latest.roas != null ? `${latest.roas}x` : null} />
          </div>
        )}
        {latest && <p className="mt-2 text-xs text-muted">Snapshot terbaru: {formatDateID(latest.date)}</p>}
      </div>

      <Card padding="lg">
        <SectionHeading title="Add Performance Data" description="Satu form, satu tanggal, langsung save." />
        <form action={addMetric} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <input name="date" type="date" required className={inputClass} />
          <input name="leads" type="number" placeholder="Leads" className={inputClass} />
          <input name="spend" type="number" placeholder="Ad Spend (Rp)" className={inputClass} />
          <input name="reach" type="number" placeholder="Reach" className={inputClass} />
          <input name="impressions" type="number" placeholder="Impressions" className={inputClass} />
          <input name="clicks" type="number" placeholder="Clicks" className={inputClass} />
          <input name="ctr" type="number" step="0.01" placeholder="CTR (%)" className={inputClass} />
          <input name="cpc" type="number" placeholder="CPC (Rp)" className={inputClass} />
          <input name="costPerLead" type="number" placeholder="CPL (Rp)" className={inputClass} />
          <input name="roas" type="number" step="0.1" placeholder="ROAS (x)" className={inputClass} />
          <button type="submit" className={buttonVariants({ variant: "primary", size: "sm", className: "sm:col-span-3 lg:col-span-5 justify-center" })}>
            <Plus className="h-3.5 w-3.5" /> Save Data
          </button>
        </form>
      </Card>

      <Card padding="lg">
        <SectionHeading title="Performance History" description="Semua snapshot yang tercatat, urut dari terbaru." />
        {metrics.length === 0 ? (
          <p className="text-xs text-muted">Belum ada data.</p>
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {metrics.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{formatDateID(m.date)}</p>
                  <p className="font-data text-xs text-muted">
                    {m.leads != null && `${m.leads} leads · `}
                    {m.spend != null && `Rp${m.spend.toLocaleString("id-ID")} spend · `}
                    {m.ctr != null && `${m.ctr}% CTR · `}
                    {m.roas != null && `${m.roas}x ROAS`}
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
