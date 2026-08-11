import { AppShell } from "@/components/dashboard/app-shell";
import { getCurrentClient } from "@/lib/data";

// TODO (live mode): tambahkan pengecekan session di sini (redirect ke
// /login kalau belum auth) begitu Supabase Auth sudah dikonfigurasi.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const client = await getCurrentClient();

  return <AppShell clientName={client.name}>{children}</AppShell>;
}
