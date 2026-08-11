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

  if (isPublic) {
    // Sudah login tapi buka /login lagi -> lempar ke halaman yang sesuai.
    if (user && pathname === "/login") {
      const role = await getRole(request, user.id, url, key);
      return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/", request.url));
    }
    return response;
  }

  if (!user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminPath) {
    const role = await getRole(request, user.id, url, key);
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

async function getRole(request: NextRequest, userId: string, url: string, key: string) {
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
  return (data?.role as "client" | "admin" | undefined) ?? "client";
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
