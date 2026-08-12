import { redirect } from "next/navigation";

// Goals bukan lagi top-level menu — ringkasan & pengelolaannya sekarang
// ada di Overview, sesuai konsolidasi navigasi terbaru.
export default async function AdminClientGoalsRedirect({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  redirect(`/admin/clients/${clientId}`);
}
