import { NextResponse } from "next/server";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin-client";
import { syncGA4ForClient, isGA4Configured } from "@/lib/ga4-sync";

export const maxDuration = 60;

/**
 * Dipanggil Vercel Cron tiap hari (lihat `crons` di vercel.json) — loop
 * SEMUA client yang punya `ga4_property_id` terisi, sync 2 hari terakhir
 * (buffer 1 hari ekstra jaga-jaga kalau satu run kelewat). Client yang
 * `ga4_property_id`-nya masih NULL SAMA SEKALI TIDAK disentuh route ini —
 * mereka tetap 100% manual seperti sebelum fitur ini ada.
 *
 * Diamankan pakai `CRON_SECRET` — Vercel otomatis kirim header
 * `Authorization: Bearer <CRON_SECRET>` tiap invoke cron kalau env ini
 * diisi, jadi endpoint ini tidak bisa dipanggil sembarangan dari luar.
 * Kalau `CRON_SECRET` belum diisi, cek ini di-skip (berguna buat testing
 * lokal) — TAPI wajib diisi begitu di-deploy ke production.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGA4Configured() || !isServiceRoleConfigured()) {
    return NextResponse.json({ skipped: true, reason: "GA4 atau SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server." });
  }

  const supabase = createAdminClient();
  const { data: clients, error } = await supabase.from("clients").select("id, ga4_property_id, ga4_hostname").not("ga4_property_id", "is", null);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = [];
  for (const client of clients ?? []) {
    const propertyId = client.ga4_property_id as string | null;
    if (!propertyId) continue;
    const hostname = client.ga4_hostname as string | null;
    results.push(await syncGA4ForClient(client.id as string, propertyId, 2, hostname));
  }

  return NextResponse.json({ synced: results.length, results });
}
