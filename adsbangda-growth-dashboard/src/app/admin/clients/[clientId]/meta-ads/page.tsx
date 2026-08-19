import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Trash2, Plus, Wallet, Eye, Target, Megaphone, MousePointerClick, Pencil, PiggyBank } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { buttonVariants } from "@/components/dashboard/button";
import {
  adminListPerformanceMetrics,
  adminCreatePerformanceMetric,
  adminUpdatePerformanceMetric,
  adminDeletePerformanceMetric,
  adminGetClient,
  adminUpdateClient,
} from "@/lib/admin-data";
import { formatDateID, formatPercent, formatMultiplier } from "@/lib/utils";

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

export default async function AdminClientMetaAdsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { clientId } = await params;
  const { edit } = await searchParams;
  const path = `/admin/clients/${clientId}/meta-ads`;
  const [client, metrics] = await Promise.all([adminGetClient(clientId), adminListPerformanceMetrics(clientId, "meta_ads")]);
  const latest = metrics[0];
  const goalAchievementPct = latest?.targetLeads && latest.targetLeads > 0 && latest.leads != null ? Math.round((latest.leads / latest.targetLeads) * 100) : null;
  const budgetTarget = client?.metaAdsBudgetTarget;
  const budgetPct = budgetTarget && budgetTarget > 0 && latest?.spend != null ? Math.min(100, Math.round((latest.spend / budgetTarget) * 100)) : null;

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
      roas: Number(formData.get("roas") ?? 0) || undefined,
      targetLeads: Number(formData.get("targetLeads") ?? 0) || undefined,
      closing: Number(formData.get("closing") ?? 0) || undefined,
    });
    revalidatePath(path);
  }

  async function updateMetricAction(formData: FormData) {
    "use server";
    await adminUpdatePerformanceMetric(String(formData.get("id")), "meta_ads", {
      date: String(formData.get("date")),
      leads: Number(formData.get("leads") ?? 0) || undefined,
      spend: Number(formData.get("spend") ?? 0) || undefined,
      reach: Number(formData.get("reach") ?? 0) || undefined,
      impressions: Number(formData.get("impressions") ?? 0) || undefined,
      clicks: Number(formData.get("clicks") ?? 0) || undefined,
      ctr: Number(formData.get("ctr") ?? 0) || undefined,
      roas: Number(formData.get("roas") ?? 0) || undefined,
      targetLeads: Number(formData.get("targetLeads") ?? 0) || undefined,
      closing: Number(formData.get("closing") ?? 0) || undefined,
    });
    revalidatePath(path);
  }

  async function deleteMetricAction(formData: FormData) {
    "use server";
    await adminDeletePerformanceMetric(String(formData.get("id")), "meta_ads");
    revalidatePath(path);
  }

  async function updateBudgetTargetAction(formData: FormData) {
    "use server";
    const raw = Number(formData.get("metaAdsBudgetTarget") ?? 0);
    await adminUpdateClient(clientId, { metaAdsBudgetTarget: raw > 0 ? raw : null });
    revalidatePath(path);
  }

  return (
    <div className="animate-rise space-y-6 p-5 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-base font-bold text-ink">How are paid campaigns performing?</h2>
        <p className="mt-1 text-sm text-muted">Input data harian sesederhana: tanggal, metric, save. Target Leads opsional — cuma diisi kalau client memang punya target kontrak.</p>
      </div>

      <div>
        <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Latest Snapshot</p>
        {!latest ? (
          <Card>
            <EmptyState icon={Megaphone} title="Belum ada data performance" description="Tambahkan snapshot pertama lewat form di bawah." />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={Target} label="Leads" value={latest.leads != null ? latest.leads.toLocaleString("id-ID") : null} />
              <MetricCard icon={Wallet} label="Ad Spend" value={latest.spend != null ? `Rp${latest.spend.toLocaleString("id-ID")}` : null} />
              <MetricCard icon={Eye} label="Reach" value={latest.reach != null ? latest.reach.toLocaleString("id-ID") : null} />
              <MetricCard icon={MousePointerClick} label="Clicks" value={latest.clicks != null ? latest.clicks.toLocaleString("id-ID") : null} />
              <MetricCard icon={MousePointerClick} label="CTR" value={latest.ctr != null ? formatPercent(latest.ctr, 2) : null} />
              <MetricCard icon={Wallet} label="CPC" value={latest.cpc != null ? `Rp${latest.cpc.toLocaleString("id-ID")}` : null} />
              <MetricCard icon={Wallet} label="CPL" value={latest.costPerLead != null ? `Rp${latest.costPerLead.toLocaleString("id-ID")}` : null} />
              <MetricCard icon={Target} label="ROAS" value={latest.roas != null ? formatMultiplier(latest.roas) : null} />
              <MetricCard icon={Target} label="Closing" value={latest.closing != null ? latest.closing.toLocaleString("id-ID") : null} />
              <MetricCard icon={Target} label="Conversion Rate" value={latest.conversionRate != null ? formatPercent(latest.conversionRate) : null} />
            </div>

            {/* Goal Achievement — BUKAN Project Progress, dan HANYA tampil kalau target diisi (tidak dipaksakan). */}
            {goalAchievementPct !== null && (
              <Card padding="lg" className="mt-4">
                <p className="mb-1 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Goal Achievement</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink">
                    {latest.leads} / {latest.targetLeads} leads
                  </p>
                  <span className="font-data text-lg font-bold text-ink">{goalAchievementPct}%</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={Math.min(100, goalAchievementPct)} />
                </div>
              </Card>
            )}
          </>
        )}
        {latest && <p className="mt-2 text-xs text-muted">Snapshot terbaru: {formatDateID(latest.date)}</p>}
      </div>

      {/* Budget Target — SENGAJA card terpisah dari Performance Data. Ini angka
          yang biasanya tetap sama selama beberapa minggu/bulan (budget bulanan
          yang disepakati dengan client), jadi disimpan persisten di level
          client (bukan per snapshot) — admin cuma perlu isi/ubah sesekali,
          tidak perlu ketik ulang tiap kali input Leads/Spend mingguan. */}
      <Card padding="lg">
        <SectionHeading
          title="Budget Target"
          description="Budget iklan bulanan yang disepakati dengan client — sekali diisi, dipakai terus buat hitung 'Budget Terpakai' di setiap snapshot baru sampai kamu ubah lagi di sini."
        />
        {budgetPct != null && (
          <div className="mb-4 rounded-[var(--radius-md)] border border-border p-3">
            <div className="flex items-baseline justify-between">
              <p className="font-data text-lg font-extrabold text-ink">Rp{(latest?.spend ?? 0).toLocaleString("id-ID")}</p>
              <p className="text-xs text-muted">dari Rp{budgetTarget!.toLocaleString("id-ID")}</p>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                <div className="h-full rounded-full bg-accent" style={{ width: `${budgetPct}%` }} />
              </div>
              <span className="font-data text-xs font-bold text-ink">{budgetPct}%</span>
            </div>
          </div>
        )}
        <form action={updateBudgetTargetAction} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="metaAdsBudgetTarget" className="font-data text-[11px] font-semibold uppercase tracking-wider text-muted">
              Budget Bulanan (Rp)
            </label>
            <input
              id="metaAdsBudgetTarget"
              name="metaAdsBudgetTarget"
              type="number"
              defaultValue={budgetTarget ?? ""}
              placeholder="mis. 10000000"
              className={inputClass}
            />
          </div>
          <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
            <PiggyBank className="h-3.5 w-3.5" /> Simpan Budget Target
          </button>
        </form>
      </Card>

      <Card padding="lg">
        <SectionHeading title="Add Performance Data" description="CPC & CPL dihitung otomatis dari Spend/Clicks/Leads — tidak perlu diketik manual. Target Leads & Closing opsional." />
        <form action={addMetric} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <input name="date" type="date" required className={inputClass} />
          <input name="spend" type="number" placeholder="Ad Spend (Rp)" className={inputClass} />
          <input name="leads" type="number" placeholder="Leads" className={inputClass} />
          <input name="clicks" type="number" placeholder="Clicks" className={inputClass} />
          <input name="reach" type="number" placeholder="Reach" className={inputClass} />
          <input name="impressions" type="number" placeholder="Impressions" className={inputClass} />
          <input name="ctr" type="number" step="0.01" placeholder="CTR (%)" className={inputClass} />
          <input name="closing" type="number" placeholder="Closing (opsional)" className={inputClass} />
          <input name="targetLeads" type="number" placeholder="Target Leads (opsional)" className={inputClass} />
          <input name="roas" type="number" step="0.1" placeholder="ROAS (x, opsional)" className={inputClass} />
          <button type="submit" className={buttonVariants({ variant: "primary", size: "sm", className: "sm:col-span-3 lg:col-span-6 justify-center" })}>
            <Plus className="h-3.5 w-3.5" /> Save Data
          </button>
        </form>
      </Card>

      <Card padding="lg">
        <SectionHeading title="Performance History" description="Semua snapshot yang tercatat, urut dari terbaru. Klik Edit untuk perbaiki data." />
        {metrics.length === 0 ? (
          <p className="text-xs text-muted">Belum ada data.</p>
        ) : (
          <div className="divide-y divide-border border-t border-border">
            {metrics.map((m) =>
              edit === m.id ? (
                <div key={m.id} className="bg-accent-soft/40 py-3">
                  <form action={updateMetricAction} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    <input type="hidden" name="id" value={m.id} />
                    <input name="date" type="date" defaultValue={m.date} required className={inputClass} />
                    <input name="leads" type="number" defaultValue={m.leads ?? ""} placeholder="Leads" className={inputClass} />
                    <input name="targetLeads" type="number" defaultValue={m.targetLeads ?? ""} placeholder="Target Leads" className={inputClass} />
                    <input name="spend" type="number" defaultValue={m.spend ?? ""} placeholder="Spend" className={inputClass} />
                    <input name="reach" type="number" defaultValue={m.reach ?? ""} placeholder="Reach" className={inputClass} />
                    <input name="impressions" type="number" defaultValue={m.impressions ?? ""} placeholder="Impressions" className={inputClass} />
                    <input name="clicks" type="number" defaultValue={m.clicks ?? ""} placeholder="Clicks" className={inputClass} />
                    <input name="ctr" type="number" step="0.01" defaultValue={m.ctr ?? ""} placeholder="CTR" className={inputClass} />
                    <input name="closing" type="number" defaultValue={m.closing ?? ""} placeholder="Closing" className={inputClass} />
                    <input name="roas" type="number" step="0.1" defaultValue={m.roas ?? ""} placeholder="ROAS" className={inputClass} />
                    <span className="flex items-center font-data text-[11px] text-muted">CPC/CPL dihitung otomatis</span>
                    <div className="flex gap-2">
                      <button type="submit" className={buttonVariants({ variant: "primary", size: "sm" })}>
                        Save
                      </button>
                      <Link href={path} className={buttonVariants({ variant: "outline", size: "sm" })}>
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
                      {m.leads != null && `${m.leads} leads · `}
                      {m.spend != null && `Rp${m.spend.toLocaleString("id-ID")} spend · `}
                      {m.ctr != null && `${formatPercent(m.ctr, 2)} CTR · `}
                      {m.roas != null && `${formatMultiplier(m.roas)} ROAS`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`${path}?edit=${m.id}`} className="text-muted hover:text-ink" aria-label="Edit">
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
