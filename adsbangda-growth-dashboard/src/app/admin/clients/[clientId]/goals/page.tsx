import { revalidatePath } from "next/cache";
import { Plus, Target, Trash2 } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { buttonVariants } from "@/components/dashboard/button";
import { adminListGoals, adminCreateGoal, adminUpdateGoal, adminDeleteGoal } from "@/lib/admin-data";
import type { GoalStatus } from "@/lib/types";

const inputClass = "rounded-[var(--radius-sm)] border border-border px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink";

function formatValue(n: number, unit: string) {
  if (unit === "Rp") return `Rp${n.toLocaleString("id-ID")}`;
  return `${n.toLocaleString("id-ID")}${unit ? ` ${unit}` : ""}`;
}

export default async function AdminClientGoalsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const path = `/admin/clients/${clientId}/goals`;
  const goals = await adminListGoals(clientId);

  async function addGoal(formData: FormData) {
    "use server";
    await adminCreateGoal(clientId, {
      label: String(formData.get("label")),
      description: String(formData.get("description") ?? "").trim() || undefined,
      target: Number(formData.get("target") ?? 0),
      actual: Number(formData.get("actual") ?? 0),
      unit: String(formData.get("unit") ?? ""),
      period: String(formData.get("period") ?? ""),
      status: String(formData.get("status") ?? "on_track") as GoalStatus,
    });
    revalidatePath(path);
  }

  async function updateGoalAction(formData: FormData) {
    "use server";
    await adminUpdateGoal(String(formData.get("id")), {
      actual: Number(formData.get("actual") ?? 0),
      status: String(formData.get("status")) as GoalStatus,
      notes: String(formData.get("notes") ?? "").trim(),
    });
    revalidatePath(path);
  }

  async function deleteGoalAction(formData: FormData) {
    "use server";
    await adminDeleteGoal(String(formData.get("id")));
    revalidatePath(path);
  }

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-base font-bold text-ink">What outcomes are we trying to achieve?</h2>
        <p className="mt-1 text-sm text-muted">
          Target dan pencapaian client per periode. &quot;Actual&quot; untuk sekarang diisi manual — struktur ini disiapkan
          supaya di fase berikutnya bisa dihitung otomatis dari modul lain (mis. Content Goal dari tab Content, Lead Goal
          dari tab Meta Ads).
        </p>
      </div>

      {goals.length === 0 ? (
        <Card>
          <EmptyState icon={Target} title="Belum ada goal" description="Tambahkan goal pertama untuk client ini lewat form di bawah." />
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const pct = goal.target > 0 ? Math.min(100, Math.round((goal.actual / goal.target) * 100)) : 0;
            return (
              <Card key={goal.id} padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-ink">{goal.label}</h3>
                      <StatusBadge status={goal.status} />
                      {goal.period && <span className="font-data text-[11px] text-muted">{goal.period}</span>}
                    </div>
                    {goal.description && <p className="mt-1 text-sm text-muted">{goal.description}</p>}
                  </div>
                  <form action={deleteGoalAction}>
                    <input type="hidden" name="id" value={goal.id} />
                    <button type="submit" className="text-muted hover:text-danger" aria-label="Hapus goal">
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </form>
                </div>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <p className="font-display text-2xl font-bold text-ink">
                    {formatValue(goal.actual, goal.unit)}{" "}
                    <span className="text-base font-medium text-muted">/ {formatValue(goal.target, goal.unit)}</span>
                  </p>
                  <span className="font-data text-lg font-bold text-ink">{pct}%</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={pct} />
                </div>

                {goal.notes && (
                  <p className="mt-3 rounded-[var(--radius-sm)] bg-black/[0.02] p-3 text-xs text-muted">{goal.notes}</p>
                )}

                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 font-data text-[10px] font-semibold uppercase tracking-wider text-muted">How AdsBangda Contributes</p>
                  <p className="text-xs text-muted">
                    Belum ada data kontribusi otomatis dari modul lain — akan tersambung setelah Content/Meta Ads bisa
                    menghitung actual goal ini secara langsung (fase berikutnya).
                  </p>
                </div>

                <form action={updateGoalAction} className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                  <input type="hidden" name="id" value={goal.id} />
                  <input name="actual" type="number" defaultValue={goal.actual} placeholder="Actual" className={inputClass} />
                  <select name="status" defaultValue={goal.status} className={inputClass}>
                    <option value="draft">Draft</option>
                    <option value="on_track">On Track</option>
                    <option value="at_risk">At Risk</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                  <input name="notes" defaultValue={goal.notes ?? ""} placeholder="Catatan (opsional)" className={`${inputClass} flex-1 min-w-[160px]`} />
                  <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
                    Update
                  </button>
                </form>
              </Card>
            );
          })}
        </div>
      )}

      <Card padding="lg">
        <SectionHeading title="Add Goal" />
        <form action={addGoal} className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <input name="label" placeholder="Nama goal" required className={`${inputClass} lg:col-span-2`} />
          <input name="target" type="number" placeholder="Target" required className={inputClass} />
          <input name="actual" type="number" placeholder="Actual" defaultValue={0} className={inputClass} />
          <input name="unit" placeholder="Unit (leads/content/Rp)" className={inputClass} />
          <input name="period" placeholder="2026-08" className={inputClass} />
          <select name="status" defaultValue="on_track" className={inputClass}>
            <option value="draft">Draft</option>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="completed">Completed</option>
          </select>
          <textarea
            name="description"
            placeholder="Deskripsi singkat (opsional)"
            rows={2}
            className={`${inputClass} sm:col-span-2 lg:col-span-4`}
          />
          <button type="submit" className={buttonVariants({ variant: "primary", className: "justify-center lg:col-span-1" })}>
            <Plus className="h-3.5 w-3.5" /> Add Goal
          </button>
        </form>
      </Card>
    </div>
  );
}
