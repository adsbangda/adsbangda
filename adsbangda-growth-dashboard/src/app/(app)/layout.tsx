import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getCurrentClient } from "@/lib/data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Proteksi Route jika Supabase terkonfigurasi
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase!.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  }

  const client = await getCurrentClient();

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar clientName={client.name} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}