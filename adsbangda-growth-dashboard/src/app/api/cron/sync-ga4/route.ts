import { NextResponse } from "next/server";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin-client";
import { syncGA4ForClient, isGA4Configured } from "@/lib/ga4-sync";
import { syncInstagramForClient, syncFacebookForClient, syncThreadsForClient, refreshThreadsTokenIfNeeded } from "@/lib/meta-sync";

export const maxDuration = 60;

/**
 * Dipanggil Vercel Cron tiap hari (lihat `crons` di vercel.json). Route ini
 * namanya "sync-ga4" (nama lama, dibiarkan supaya tidak perlu ganti URL cron
 * di Vercel), TAPI sekarang sync SEMUA channel otomatis yang aktif:
 * Website (GA4) + Social Media (Instagram/Facebook/Threads).
 *
 * Client yang belum connect apa pun (ga4_property_id NULL dan tidak punya
 * baris di social_connections) SAMA SEKALI TIDAK disentuh — mereka tetap
 * 100% manual seperti sebelum fitur-fitur ini ada.
 *
 * Diamankan pakai `CRON_SECRET` — Vercel otomatis kirim header
 * `Authorization: Bearer <CRON_SECRET>` tiap invoke cron kalau env ini
 * diisi, jadi endpoint ini tidak bisa dipanggil sembarangan dari luar.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ skipped: true, reason: "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server." });
  }

  const supabase = createAdminClient();
  const results: unknown[] = [];

  // --- Website (GA4) ---
  if (isGA4Configured()) {
    const { data: clients } = await supabase.from("clients").select("id, ga4_property_id, ga4_hostname").not("ga4_property_id", "is", null);
    for (const client of clients ?? []) {
      const propertyId = client.ga4_property_id as string | null;
      if (!propertyId) continue;
      results.push(await syncGA4ForClient(client.id as string, propertyId, 2, client.ga4_hostname as string | null));
    }
  }

  // --- Social Media (Instagram/Facebook/Threads) ---
  const { data: connections } = await supabase.from("social_connections").select("*");
  for (const conn of connections ?? []) {
    const clientId = conn.client_id as string;
    const platform = conn.platform as "instagram" | "facebook" | "threads";
    const accountId = conn.external_account_id as string;
    let accessToken = conn.access_token as string;

    if (platform === "threads") {
      await refreshThreadsTokenIfNeeded(conn.id as string, accessToken, conn.token_expires_at as string | null);
      // Ambil ulang token (mungkin baru saja di-refresh di atas).
      const { data: fresh } = await supabase.from("social_connections").select("access_token").eq("id", conn.id as string).maybeSingle();
      if (fresh?.access_token) accessToken = fresh.access_token as string;
      results.push(await syncThreadsForClient(clientId, accountId, accessToken));
    } else if (platform === "instagram") {
      results.push(await syncInstagramForClient(clientId, accountId, accessToken));
    } else if (platform === "facebook") {
      results.push(await syncFacebookForClient(clientId, accountId, accessToken));
    }
  }

  return NextResponse.json({ synced: results.length, results });
}
