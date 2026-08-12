import { revalidatePath } from "next/cache";
import { Share2, Megaphone, Globe } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { buttonVariants } from "@/components/dashboard/button";
import { adminGetClient, adminUpdateClient } from "@/lib/admin-data";

const SERVICES = [
  { key: "socialMediaActive" as const, label: "Social Media", description: "Content, target, dan performance Instagram/Facebook/TikTok/X/LinkedIn/Threads.", icon: Share2, tab: "social-media" },
  { key: "metaAdsActive" as const, label: "Meta Ads", description: "Ad spend, leads, dan performance campaign Meta Ads.", icon: Megaphone, tab: "meta-ads" },
  { key: "websiteActive" as const, label: "Website", description: "Traffic, sessions, dan aktivitas maintenance website.", icon: Globe, tab: "website" },
];

export default async function AdminClientServicesPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const client = await adminGetClient(clientId);
  if (!client) return null;
  const path = `/admin/clients/${clientId}/services`;

  async function updateServicesAction(formData: FormData) {
    "use server";
    await adminUpdateClient(clientId, {
      socialMediaActive: formData.get("socialMediaActive") === "on",
      metaAdsActive: formData.get("metaAdsActive") === "on",
      websiteActive: formData.get("websiteActive") === "on",
    });
    revalidatePath(path);
    revalidatePath(`/admin/clients/${clientId}`);
    revalidatePath("/admin/clients");
  }

  return (
    <div className="animate-rise space-y-6 p-5 lg:p-8">
      <div className="max-w-2xl">
        <h2 className="text-base font-bold text-ink">What services does this client use?</h2>
        <p className="mt-1 text-sm text-muted">
          Aktifkan layanan yang memang dikelola Adsbangda untuk client ini. Tab, Overview, dan Report otomatis menyesuaikan — tidak perlu bikin &quot;project&quot; terpisah untuk tiap layanan.
        </p>
      </div>

      <Card padding="lg">
        <SectionHeading title="Services" />
        <form action={updateServicesAction} className="space-y-3">
          {SERVICES.map((s) => (
            <label
              key={s.key}
              className="flex cursor-pointer items-start gap-4 rounded-[var(--radius-md)] border border-border p-4 transition-colors hover:bg-black/[0.015]"
            >
              <input type="checkbox" name={s.key} defaultChecked={client[s.key]} className="mt-1 h-4 w-4 accent-accent" />
              <div className="flex flex-1 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <s.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{s.label}</p>
                  <p className="text-xs text-muted">{s.description}</p>
                </div>
              </div>
            </label>
          ))}
          <button type="submit" className={buttonVariants({ variant: "primary" })}>
            Simpan
          </button>
        </form>
      </Card>
    </div>
  );
}
