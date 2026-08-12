import { redirect } from "next/navigation";

// Content sekarang jadi satu rumah dengan Social Media (tab "Content Delivery")
// per konsolidasi navigasi terbaru — redirect ini menjaga link/bookmark lama.
export default async function AdminClientContentRedirect({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  redirect(`/admin/clients/${clientId}/social-media`);
}
