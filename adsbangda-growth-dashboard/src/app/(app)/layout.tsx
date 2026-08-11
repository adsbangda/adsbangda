import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { getCurrentClient } from "@/lib/data";
import { ClientNotAssignedError, getSessionRole } from "@/lib/auth";

// Middleware (src/middleware.ts) sudah memastikan user login sebelum sampai
// di sini. Layout ini hanya menangani kasus: sudah login, tapi belum
// terhubung ke client manapun (lihat lib/auth.ts ClientNotAssignedError).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let clientName: string;
  let isAdmin: boolean;

  try {
    const [client, role] = await Promise.all([getCurrentClient(), getSessionRole()]);
    clientName = client.name;
    isAdmin = role === "admin";
  } catch (err) {
    if (err instanceof ClientNotAssignedError) redirect("/pending");
    throw err;
  }

  return (
    <AppShell clientName={clientName} isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}
