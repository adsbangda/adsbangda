import { Sidebar } from "@/components/dashboard/sidebar";
import { getCurrentClient } from "@/lib/data";

// TODO (live mode): tambahkan pengecekan session di sini (redirect ke
// /login kalau belum auth) begitu Supabase Auth sudah dikonfigurasi.
// Untuk MVP demo, halaman ini langsung menampilkan data client contoh.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await getCurrentClient();

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar clientName={client.name} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
