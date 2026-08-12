import { revalidatePath } from "next/cache";
import { Trash2, Plus, Users, Eye, Heart, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/dashboard/button";
import { adminListPerformanceMetrics, adminCreatePerformanceMetric, adminDeletePerformanceMetric } from "@/lib/admin-data";
import { formatDateID } from "@/lib/utils";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";

function MetricCard({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null;
  delta?: { value: number; positive: boolean } | null;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="font-data text-2xl font-bold text-ink">{value ?? "—"}</p>
          {delta && value !== null && (
            <span className={`inline-flex items-center gap-0.5 font-data text-[11px] font-semibold ${delta.positive ? "text-success" : "text-danger"}`}>
              {delta.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(delta.value)}%
            </span>
          )}
        </div>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </Card>
  );
}

function pctDelta(current: number, previous: number): { value: number; positive: boolean } | null {
  if (previous === 0) return null;
  const diff = ((current - previous) / previous) * 100;
  return { value: Math.round(diff * 10) / 10, positive: diff >= 0 };
}

export default async function AdminClientSocialMediaPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const path = `/admin/clients/${clientId}/social-media`;
  const metrics = await adminListPerformanceMetrics(clientId, "social"); // sudah terurut terbaru dulu

  const latest = metrics[0];
  const previous = metrics[1];

  async function addMetric(formData: FormData) {
    "use server";
    await adminCreatePerformanceMetric(clientId, "social", {
      date: String(formData.get("date")),
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
    <div className="space-y-6 p-5 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-base font-bold text-ink">How is organic social performing?</h2>
        <p className="mt-1 text-sm text-muted">
          Data Instagram, Facebook, TikTok client ini. Sekarang diisi manual per snapshot — struktur ini yang sama
          nantinya dipakai kalau datanya diisi otomatis lewat API.
        </p>
      </div>

      {/* PERFORMANCE OVERVIEW */}
      <div>
        <p className="mb-3 font-data text-[11px] font-semibold uppercase tracking-wider text-muted">Performance Overview</p>
        {!latest ? (
          <Card>
            <EmptyState icon={TrendingUp} title="Belum ada data performance" description="Tambahkan snapshot pertama lewat form di bawah untuk melihat ringkasan di sini." />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={Users}
              label="Followers"
              value={latest.followers != null ? latest.followers.toLocaleString("id-ID") : null}
              delta={latest.followers != null && previous?.followers != null ? pctDelta(latest.followers, previous.followers) : null}
            />
            <MetricCard
              icon={Eye}
              label="Reach"
              value={latest.reach != null ? latest.reach.toLocaleString("id-ID") : null}
              delta={latest.reach != null && previous?.reach != null ? pctDelta(latest.reach, previous.reach) : null}
            />
            <MetricCard
              icon={Heart}
              label="Engagement Rate"
              value={latest.engagementRate != null ? `${latest.engagementRate}%` : null}
              delta={latest.engagementRate != null && previous?.engagementRate != null ? pctDelta(latest.engagementRate, previous.engagementRate) : null}
            />
            <MetricCard
              icon={TrendingUp}
              label="Profile Visits"
              value={latest.visitors != null ? latest.visitors.toLocaleString("id-ID") : null}
              delta={latest.visitors != null && previous?.visitors != null ? pctDelta(latest.visitors, previous.visitors) : null}
            />
          </div>
        )}
        {latest && <p className="mt-2 text-xs text-muted">Snapshot terbaru: {formatDateID(latest.date)}{previous && " · dibandingkan snapshot sebelumnya"}</p>}
      </div>

      {/* CONTENT PERFORMANCE */}
      <Card padding="lg">
        <SectionHeading title="Content Performance" description="Hubungan performance dengan content yang sudah dipublikasikan." />
        <EmptyState
          title="Belum tersedia"
          description="Menampilkan performa per-post butuh data content yang sudah terhubung ke metric — direncanakan untuk fase berikutnya."
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
                    {m.followers != null && `${m.followers.toLocaleString("id-ID")} followers · `}
                    {m.reach != null && `${m.reach.toLocaleString("id-ID")} reach · `}
                    {m.impressions != null && `${m.impressions.toLocaleString("id-ID")} impressions · `}
                    {m.engagementRate != null && `${m.engagementRate}% ER · `}
                    {m.visitors != null && `${m.visitors.toLocaleString("id-ID")} visits`}
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
          <input name="followers" type="number" placeholder="Followers" className={inputClass} />
          <input name="reach" type="number" placeholder="Reach" className={inputClass} />
          <input name="impressions" type="number" placeholder="Impressions" className={inputClass} />
          <input name="engagementRate" type="number" step="0.01" placeholder="Engagement %" className={inputClass} />
          <input name="visitors" type="number" placeholder="Profile Visits" className={inputClass} />
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm", className: "sm:col-span-6 justify-center" })}>
            <Plus className="h-3.5 w-3.5" /> Add Performance Data
          </button>
        </form>
      </Card>

      {/* ACTIVITY */}
      <Card padding="lg">
        <SectionHeading title="Activity" description="Aktivitas social media yang tercatat untuk client ini." />
        <EmptyState
          title="Belum ada activity khusus Social Media"
          description="Activity feed umum tersedia di tab Overview (What AdsBangda Did) — activity yang spesifik per-channel direncanakan untuk fase berikutnya."
        />
      </Card>
    </div>
  );
}
