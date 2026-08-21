import { createSign } from "node:crypto";
import { createAdminClient, isServiceRoleConfigured } from "./supabase/admin-client";

// ============================================================================
// GA4 Data API sync — fitur PILOT, opt-in per client lewat
// `clients.ga4_property_id` (lihat migration 0017). Sengaja TIDAK pakai
// package `googleapis`/`@google-analytics/data` (berat, banyak dependency
// transitif) — cukup `fetch` + Node `crypto` bawaan buat bikin & tukar JWT
// service account, konsisten dengan gaya project ini yang minim dependency.
//
// ALUR:
//   1. Bikin JWT ditandatangani private key service account (RS256).
//   2. Tukar JWT itu ke Google OAuth2 token endpoint → dapat access token.
//   3. Panggil GA4 Data API `runReport` pakai access token itu.
//   4. Upsert hasilnya ke `performance_metrics` (channel='website',
//      source='ga4') lewat SERVICE ROLE client (bukan `adminCreatePerformanceMetric`
//      biasa) — karena job ini dipanggil dari Cron/route handler yang TIDAK
//      punya sesi user login, jadi tidak bisa lewat `requireAdmin()`.
//
// Baris source='manual' (SEMUA input lewat form Admin Portal) TIDAK PERNAH
// disentuh fungsi-fungsi di file ini — lihat migration 0017 untuk detail
// kenapa pemisahan ini penting.
// ============================================================================

export function isGA4Configured(): boolean {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY && isServiceRoleConfigured());
}

/**
 * Email service account Adsbangda — ditampilkan di Admin Portal (Admin →
 * Website → card "Google Analytics 4") supaya admin bisa copy-paste dan
 * minta client invite akun ini sebagai role Viewer di GA4 property mereka
 * (GA4 Admin → Property Access Management). Kalau client belum/tidak mau
 * kasih akses, TIDAK APA-APA — form input manual di halaman yang sama
 * tetap jalan normal seperti biasa, client itu cukup dibiarkan tanpa GA4
 * Property ID terisi.
 */
export function getServiceAccountEmail(): string | null {
  return process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? null;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getGoogleAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY belum diisi di environment — lihat .env.example.");
  }
  // Private key di env var biasanya harus di-escape \n jadi literal "\n" dua
  // karakter (env var tidak boleh multi-baris di banyak provider) — di-unescape
  // balik jadi newline asli di sini.
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = base64url(signer.sign(privateKey));
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gagal ambil Google access token (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface GA4DailyRow {
  date: string; // ISO yyyy-mm-dd
  visitors: number;
  sessions: number;
  pageViews: number;
  bounceRate: number; // persen, 0-100, 1 desimal
  avgSessionDurationSeconds: number;
  conversions: number;
}

/** "125" detik → "2m 5s", sama format string yang admin ketik manual di field Avg Session Duration. */
function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}m ${s}s`;
}

async function fetchGA4DailyRows(propertyId: string, days: number): Promise<GA4DailyRow[]> {
  const accessToken = await getGoogleAccessToken();
  const property = propertyId.trim().startsWith("properties/") ? propertyId.trim() : `properties/${propertyId.trim()}`;

  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/${property}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }],
      dimensions: [{ name: "date" }],
      // "conversions" = total semua conversion event yang sudah ditandai
      // client di GA4 (Admin → Events → tandai sebagai key event) — dipakai
      // sebagai proxy "Leads / Form Submissions". Kalau client belum
      // menandai event apa pun sebagai conversion, ini akan selalu 0 (bukan
      // error) — admin masih bisa override manual per-tanggal kalau perlu.
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "conversions" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GA4 Data API error (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[];
  };

  return (json.rows ?? []).map((row) => {
    const raw = row.dimensionValues[0].value; // format GA4: "YYYYMMDD"
    const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    const [visitors, sessions, pageViews, bounceRateFraction, avgDurationSec, conversions] = row.metricValues.map((v) => Number(v.value));
    return {
      date,
      visitors,
      sessions,
      pageViews,
      bounceRate: Math.round(bounceRateFraction * 1000) / 10, // GA4 balikin 0–1, kita simpan sebagai persen (0-100)
      avgSessionDurationSeconds: avgDurationSec,
      conversions,
    };
  });
}

export interface GA4SyncResult {
  clientId: string;
  rowsSynced: number;
  error?: string;
}

/**
 * Sync satu client — ambil `days` hari terakhir dari GA4, upsert ke
 * `performance_metrics` (channel='website', source='ga4'). Dicocokkan per
 * baris lewat (client_id, channel, date, source='ga4') supaya re-run
 * (harian via cron, atau klik "Sync Sekarang" manual) meng-UPDATE baris GA4
 * yang sama, bukan bikin duplikat — dan TIDAK PERNAH menyentuh baris
 * source='manual' sama sekali walau tanggalnya kebetulan sama.
 */
export async function syncGA4ForClient(clientId: string, propertyId: string, days = 30): Promise<GA4SyncResult> {
  if (!isGA4Configured()) {
    return { clientId, rowsSynced: 0, error: "GA4 belum dikonfigurasi di server (env GOOGLE_SERVICE_ACCOUNT_* / SUPABASE_SERVICE_ROLE_KEY belum diisi)." };
  }
  if (!propertyId || !propertyId.trim()) {
    return { clientId, rowsSynced: 0, error: "GA4 Property ID kosong." };
  }

  try {
    const rows = await fetchGA4DailyRows(propertyId, days);
    const supabase = createAdminClient();
    let rowsSynced = 0;

    for (const row of rows) {
      const { data: existing } = await supabase
        .from("performance_metrics")
        .select("id")
        .eq("client_id", clientId)
        .eq("channel", "website")
        .eq("date", row.date)
        .eq("source", "ga4")
        .maybeSingle();

      const payload = {
        client_id: clientId,
        channel: "website",
        date: row.date,
        source: "ga4",
        visitors: row.visitors || null,
        sessions: row.sessions || null,
        page_views: row.pageViews || null,
        bounce_rate: row.bounceRate || null,
        avg_session_duration: formatDuration(row.avgSessionDurationSeconds),
        conversions: row.conversions || null,
      };

      const { error } = existing
        ? await supabase.from("performance_metrics").update(payload).eq("id", existing.id)
        : await supabase.from("performance_metrics").insert(payload);

      if (error) throw new Error(error.message);
      rowsSynced++;
    }

    return { clientId, rowsSynced };
  } catch (err) {
    return { clientId, rowsSynced: 0, error: err instanceof Error ? err.message : String(err) };
  }
}
