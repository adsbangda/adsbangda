import { redirect } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { getCurrentClient } from "@/lib/data";
import { ClientNotAssignedError, getSessionRole, isStaffRole } from "@/lib/auth";

// Middleware (src/middleware.ts) sudah memastikan user login sebelum sampai
// di sini. Layout ini hanya menangani kasus: sudah login, tapi belum
// terhubung ke client manapun (lihat lib/auth.ts ClientNotAssignedError).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let clientName: string;
  let isAdmin: boolean;

  try {
    const [client, role] = await Promise.all([getCurrentClient(), getSessionRole()]);
    clientName = client.name;
    // "Buka Admin Portal" di sidebar tampil untuk semua role staff, bukan
    // cuma literal 'admin' — lihat STAFF_ROLES di lib/types.ts.
    isAdmin = isStaffRole(role);
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
