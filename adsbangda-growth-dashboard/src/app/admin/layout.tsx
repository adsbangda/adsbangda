import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin, NotAuthorizedError } from "@/lib/auth";
import { adminCountPendingRevisions } from "@/lib/admin-data";

// Middleware (src/middleware.ts) sudah menolak non-admin sebelum sampai ke
// sini di mode live. Guard ini adalah lapisan kedua (defense in depth) untuk
// render langsung di server component. Di mode demo, requireAdmin() no-op —
// Admin Portal sengaja terbuka bebas supaya bisa direview tanpa Supabase.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof NotAuthorizedError) redirect("/");
    throw err;
  }

  const pendingRevisions = await adminCountPendingRevisions();

  return (
    <div className="flex min-h-screen bg-paper">
      <div className="sticky top-0 hidden h-screen shrink-0 print:hidden lg:block">
        <AdminSidebar pendingRevisions={pendingRevisions} />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
