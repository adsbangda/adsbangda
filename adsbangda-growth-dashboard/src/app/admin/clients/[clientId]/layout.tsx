import { notFound } from "next/navigation";
import { DemoModeBanner } from "@/components/admin/demo-banner";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DetailTabs } from "@/components/admin/detail-tabs";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { ClientAvatar } from "@/components/admin/client-avatar";
import { adminGetClient } from "@/lib/admin-data";

export default async function AdminClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await adminGetClient(clientId);
  if (!client) notFound();

  const base = `/admin/clients/${clientId}`;

  return (
    <div className="min-h-screen">
      <RealtimeRefresh clientId={clientId} />
      <DemoModeBanner />
      <div className="bg-surface px-5 pt-6 print:hidden lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
          <div className="flex items-center gap-3">
            <ClientAvatar name={client.name} logoUrl={client.logoUrl} size={44} />
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-ink">{client.name}</h1>
              <p className="text-xs text-muted">{client.industry}</p>
            </div>
          </div>
          <StatusBadge status={client.status} />
        </div>

        <DetailTabs
          items={[
            { href: base, label: "Overview", exact: true },
            { href: `${base}/services`, label: "Services" },
            { href: `${base}/activity`, label: "Activity Log" },
            { href: `${base}/social-media`, label: "Social Media" },
            { href: `${base}/meta-ads`, label: "Meta Ads" },
            { href: `${base}/website`, label: "Website" },
            { href: `${base}/files`, label: "Files" },
            { href: `${base}/reports`, label: "Reports" },
            { href: `${base}/team`, label: "Team" },
          ]}
        />
      </div>

      {children}
    </div>
  );
}
