import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";

const ADMIN_PREFIX = "/admin";
const PUBLIC_PATHS = ["/login"];

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const pathname = request.nextUrl.pathname;

  // Mode demo (belum ada env Supabase) — semua halaman tetap terbuka bebas,
  // persis seperti sebelumnya, supaya desain & alur tetap bisa direview
  // tanpa setup database dulu.
  if (!url || !key) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAdminPath = pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + "/");

  // Query role HANYA kalau benar-benar perlu (buka /login saat sudah login,
  // atau buka /admin/*). Untuk semua halaman client biasa, cukup 1 network
  // call (auth.getUser() di atas) — TIDAK ada query tambahan di sini.
  const needsRole = (user && pathname === "/login") || (user && isAdminPath);
  const role = needsRole ? await getRole(request, user!.id, url, key) : null;

  if (isPublic) {
    if (user && pathname === "/login") {
      return NextResponse.redirect(new URL(isStaff(role) ? "/admin" : "/", request.url));
    }
    return response;
  }

  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Admin Portal terbuka untuk SEMUA role staff (super_admin, admin,
  // account_manager, creative) — bukan cuma literal 'admin'. Pembedaan
  // kemampuan yang lebih detail per role staff ditangani di layer
  // requireAdmin()/requireStaff() (lib/auth.ts) untuk mutasi spesifik,
  // bukan di sini (di sini cuma gate MASUK ke halaman /admin/*).
  if (isAdminPath && !isStaff(role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

type Role = "super_admin" | "admin" | "account_manager" | "creative" | "client";
const STAFF_ROLES: readonly Role[] = ["super_admin", "admin", "account_manager", "creative"];
function isStaff(role: Role | null) {
  return !!role && STAFF_ROLES.includes(role);
}

async function getRole(request: NextRequest, userId: string, url: string, key: string): Promise<Role> {
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // No-op — cookie writes already handled by updateSession above.
      },
    },
  });
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single();
  return (data?.role as Role | undefined) ?? "client";
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
