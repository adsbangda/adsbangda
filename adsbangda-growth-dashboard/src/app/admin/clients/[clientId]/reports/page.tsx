import Link from "next/link";
import { FileText } from "lucide-react";
import { Card } from "@/components/dashboard/card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { buttonVariants } from "@/components/dashboard/button";

export default async function AdminClientReportsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  return (
    <div className="p-5 lg:p-8">
      <Card>
        <EmptyState
          icon={FileText}
          title="Reports dikelola lewat tab Content"
          description="Upload & kelola report bulanan client ini sekarang masih jadi satu dengan Monthly Delivery, Content Calendar, dan Files di tab Content."
          action={
            <Link href={`/admin/clients/${clientId}/content`} className={buttonVariants({ variant: "primary", size: "sm" })}>
              Buka tab Content
            </Link>
          }
        />
      </Card>
    </div>
  );
}
