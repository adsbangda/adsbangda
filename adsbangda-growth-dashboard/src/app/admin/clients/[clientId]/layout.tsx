import { notFound } from "next/navigation";
import { DemoModeBanner } from "@/components/admin/demo-banner";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DetailTabs } from "@/components/admin/detail-tabs";
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
      <DemoModeBanner />
      <div className="border-b border-border bg-surface px-5 pt-6 print:hidden lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
              {client.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-ink">{client.name}</h1>
              <p className="text-xs text-muted">{client.industry}</p>
            </div>
          </div>
          <StatusBadge status={client.status} />
        </div>

        <div className="mt-5 overflow-x-auto pb-px">
          <DetailTabs
            items={[
              { href: base, label: "Overview", exact: true },
              { href: `${base}/services`, label: "Services" },
              { href: `${base}/social-media`, label: "Social Media" },
              { href: `${base}/meta-ads`, label: "Meta Ads" },
              { href: `${base}/website`, label: "Website" },
              { href: `${base}/files`, label: "Files" },
              { href: `${base}/reports`, label: "Reports" },
              { href: `${base}/team`, label: "Team" },
            ]}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
