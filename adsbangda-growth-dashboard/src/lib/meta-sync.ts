import { createAdminClient, isServiceRoleConfigured } from "./supabase/admin-client";

// ============================================================================
// Instagram / Facebook / Threads sync — beda arsitektur dari GA4 (lihat
// src/lib/ga4-sync.ts): TIDAK ada Service Account. Admin generate SATU
// access token per client+platform di luar aplikasi ini (Graph API Explorer
// untuk Instagram/Facebook, "Login with Threads"/App Dashboard untuk
// Threads), lalu paste token itu ke Admin Portal (disimpan di
// `social_connections`, lihat migration 0019).
//
// CATATAN PENTING soal App Review: kalau akun IG/FB/Threads client
// ditambahkan sebagai "Tester" atau admin punya role di Page/akun itu
// sendiri (client invite akun Adsbangda jadi Admin/Editor di FB Page
// mereka, yang otomatis meng-cover Instagram Business Account yang
// terhubung ke Page itu) — token yang di-generate lewat Graph API Explorer
// bisa langsung dipakai (Standard Access) TANPA perlu App Review dari
// Meta sama sekali. App Review baru wajib kalau mau akses akun yang BENAR-
// BENAR tidak ada hubungannya dengan akun/app Adsbangda (dipakai publik).
//
// Page Access Token (Instagram & Facebook) hasil dari long-lived User
// Token TIDAK PERNAH expire (setahu dokumentasi Meta) selama user yang
// generate tidak revoke akses/ganti password — jadi TIDAK PERLU refresh
// otomatis. Threads BEDA: token-nya selalu USER-level dan expire 60 hari,
// WAJIB di-refresh berkala — lihat `refreshThreadsTokenIfNeeded()` di
// bawah, dipanggil dari cron (src/app/api/cron/sync-ga4/route.ts — nama
// route-nya kebetulan "sync-ga4" tapi sekarang sekalian sync semua channel
// otomatis, lihat komentar di file itu).
// ============================================================================

const GRAPH_VERSION = "v21.0";

export interface MetaSyncResult {
  clientId: string;
  platform: "instagram" | "facebook" | "threads";
  metricsSynced: number;
  postsSynced: number;
  error?: string;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function fetchJSON(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url);
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok || json.error) {
    const err = json.error as Record<string, unknown> | undefined;
    throw new Error(`Meta API error (${res.status}): ${err?.message ?? JSON.stringify(json)}`);
  }
  return json;
}

/** Upsert satu snapshot ke performance_metrics (channel='social', source='meta') — cocok baris via (client_id, channel, platform, date, source), sama pola dengan GA4. */
async function upsertSocialMetric(
  admin: ReturnType<typeof createAdminClient>,
  clientId: string,
  platform: string,
  date: string,
  values: {
    followers?: number | null;
    reach?: number | null;
    impressions?: number | null;
    visitors?: number | null;
    engagementRate?: number | null;
    replies?: number | null;
    reposts?: number | null;
  }
) {
  const { data: existing } = await admin
    .from("performance_metrics")
    .select("id")
    .eq("client_id", clientId)
    .eq("channel", "social")
    .eq("platform", platform)
    .eq("date", date)
    .eq("source", "meta")
    .maybeSingle();

  const payload: Record<string, unknown> = {
    client_id: clientId,
    channel: "social",
    platform,
    date,
    source: "meta",
    ...(values.followers != null ? { followers: values.followers } : {}),
    ...(values.reach != null ? { reach: values.reach } : {}),
    ...(values.impressions != null ? { impressions: values.impressions } : {}),
    ...(values.visitors != null ? { visitors: values.visitors } : {}),
    ...(values.engagementRate != null ? { engagement_rate: values.engagementRate } : {}),
    ...(values.replies != null ? { replies: values.replies } : {}),
    ...(values.reposts != null ? { reposts: values.reposts } : {}),
  };

  const { error } = existing
    ? await admin.from("performance_metrics").update(payload).eq("id", existing.id)
    : await admin.from("performance_metrics").insert(payload);
  if (error) throw new Error(error.message);
}

/** Upsert satu postingan ke post_performance (source='meta') — cocok via (client_id, platform, external_post_id) supaya re-sync UPDATE, bukan duplikat. */
async function upsertPost(
  admin: ReturnType<typeof createAdminClient>,
  clientId: string,
  platform: string,
  externalPostId: string,
  values: {
    type: string;
    title: string;
    postedDate: string;
    likes?: number | null;
    comments?: number | null;
    shares?: number | null;
    saves?: number | null;
    views?: number | null;
    permalink?: string | null;
  }
) {
  const { data: existing } = await admin
    .from("post_performance")
    .select("id")
    .eq("client_id", clientId)
    .eq("platform", platform)
    .eq("external_post_id", externalPostId)
    .maybeSingle();

  const payload: Record<string, unknown> = {
    client_id: clientId,
    platform,
    source: "meta",
    external_post_id: externalPostId,
    type: values.type,
    title: values.title,
    posted_date: values.postedDate,
    likes: values.likes ?? null,
    comments: values.comments ?? null,
    shares: values.shares ?? null,
    saves: values.saves ?? null,
    views: values.views ?? null,
    permalink: values.permalink ?? null,
  };

  const { error } = existing
    ? await admin.from("post_performance").update(payload).eq("id", existing.id)
    : await admin.from("post_performance").insert(payload);
  if (error) throw new Error(error.message);

  // Ikut catat sebagai content_items status='published' juga — supaya
  // progress Goals (Content Delivery) di halaman Social Media otomatis
  // kehitung tanpa admin perlu input manual lagi buat post yang udah
  // ke-tarik dari sync ini. Dibungkus try/catch sendiri: kalau ini gagal
  // (mis. constraint belum di-migrate), post_performance yang di atas
  // TETAP berhasil tersimpan — Post Ranking tidak ikut kena imbas.
  try {
    const { data: existingContent } = await admin
      .from("content_items")
      .select("id")
      .eq("client_id", clientId)
      .eq("platform", platform)
      .eq("external_post_id", externalPostId)
      .eq("source", "meta")
      .maybeSingle();

    const contentPayload = {
      client_id: clientId,
      platform,
      type: values.type,
      title: values.title,
      planned_date: values.postedDate,
      status: "published",
      source: "meta",
      external_post_id: externalPostId,
      publish_link: values.permalink ?? null,
    };

    if (existingContent) {
      await admin.from("content_items").update(contentPayload).eq("id", existingContent.id);
    } else {
      await admin.from("content_items").insert(contentPayload);
    }
  } catch {
    // Diamkan — lihat komentar di atas.
  }
}

// ---------------------------------------------------------------------------
// INSTAGRAM — igAccountId = Instagram Business/Creator Account ID (BUKAN
// username, angka panjang), didapat lewat Graph API Explorer setelah
// pilih Facebook Page yang terhubung ke akun IG-nya.
// ---------------------------------------------------------------------------
export async function syncInstagramForClient(clientId: string, igAccountId: string, accessToken: string, days = 7): Promise<MetaSyncResult> {
  if (!isServiceRoleConfigured()) {
    return { clientId, platform: "instagram", metricsSynced: 0, postsSynced: 0, error: "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server." };
  }

  try {
    const admin = createAdminClient();
    const today = new Date();
    let metricsSynced = 0;
    let postsSynced = 0;

    // Followers — field lifetime di object akun, bukan Insights metric.
    const account = await fetchJSON(`https://graph.facebook.com/${GRAPH_VERSION}/${igAccountId}?fields=followers_count&access_token=${accessToken}`);
    const followers = (account.followers_count as number | undefined) ?? null;

    // Reach & Profile Visits — Insights API, harian, `days` hari terakhir.
    const since = Math.floor(new Date(today.getTime() - days * 86400000).getTime() / 1000);
    const until = Math.floor(today.getTime() / 1000);
    const insights = await fetchJSON(
      `https://graph.facebook.com/${GRAPH_VERSION}/${igAccountId}/insights?metric=reach,profile_views&period=day&since=${since}&until=${until}&access_token=${accessToken}`
    );
    const series = (insights.data as { name: string; values: { end_time: string; value: number }[] }[] | undefined) ?? [];
    const reachByDate = new Map((series.find((s) => s.name === "reach")?.values ?? []).map((v) => [v.end_time.slice(0, 10), v.value]));
    const visitsByDate = new Map((series.find((s) => s.name === "profile_views")?.values ?? []).map((v) => [v.end_time.slice(0, 10), v.value]));
    const allDates = new Set([...reachByDate.keys(), ...visitsByDate.keys()]);
    if (allDates.size === 0 && followers != null) {
      // Insights (reach/profile_views) gagal total tapi followers berhasil —
      // tetap simpan 1 baris (kemarin, BUKAN hari ini — data harian provider
      // biasanya baru final di hari sebelumnya) supaya followers kelihatan
      // di "Latest Snapshot", daripada baris "hari ini" kosong menutupi
      // baris lama yang justru lengkap datanya.
      allDates.add(isoDate(new Date(today.getTime() - 86400000)));
    }

    for (const date of allDates) {
      await upsertSocialMetric(admin, clientId, "instagram", date, {
        followers, // sama tiap hari (snapshot lifetime, bukan harian) — cukup taruh di semua baris supaya "latest" selalu punya angka.
        reach: reachByDate.get(date) ?? null,
        visitors: visitsByDate.get(date) ?? null,
      });
      metricsSynced++;
    }
    // Post Ranking — dibungkus try/catch (konsisten dengan Threads di
    // bawah): kalau list media gagal, metrics followers/reach/visitors yang
    // SUDAH disync di atas tetap tersimpan, tidak ikut ke-reset jadi gagal.
    try {
      const media = await fetchJSON(
        `https://graph.facebook.com/${GRAPH_VERSION}/${igAccountId}/media?fields=id,caption,media_type,permalink,timestamp,like_count,comments_count&limit=25&access_token=${accessToken}`
      );
      const items = (media.data as Record<string, unknown>[] | undefined) ?? [];

      for (const item of items) {
        const mediaId = item.id as string;
        // Saves/Shares/Views butuh panggilan Insights terpisah PER media, dan
        // metric yang valid beda-beda tergantung media_type (IMAGE/VIDEO/
        // CAROUSEL_ALBUM/REELS) — di-coba, gagal salah satu metric tidak
        // menggagalkan seluruh sync (postingan tetap tersimpan tanpa metrik itu).
        let saves: number | null = null;
        let views: number | null = null;
        try {
          const mediaInsights = await fetchJSON(
            `https://graph.facebook.com/${GRAPH_VERSION}/${mediaId}/insights?metric=saved,plays&access_token=${accessToken}`
          );
          const mSeries = (mediaInsights.data as { name: string; values: { value: number }[] }[] | undefined) ?? [];
          saves = mSeries.find((s) => s.name === "saved")?.values?.[0]?.value ?? null;
          views = mSeries.find((s) => s.name === "plays")?.values?.[0]?.value ?? null;
        } catch {
          // Diamkan — media_type ini mungkin tidak support metric tersebut.
        }

        const mediaType = String(item.media_type ?? "").toLowerCase();
        await upsertPost(admin, clientId, "instagram", mediaId, {
          type: mediaType === "video" || mediaType === "reels" ? "reels" : mediaType === "carousel_album" ? "carousel" : "feed",
          title: String(item.caption ?? "").slice(0, 120) || "(tanpa caption)",
          postedDate: String(item.timestamp ?? "").slice(0, 10) || isoDate(today),
          likes: (item.like_count as number | undefined) ?? null,
          comments: (item.comments_count as number | undefined) ?? null,
          saves,
          views,
          permalink: (item.permalink as string | undefined) ?? null,
        });
        postsSynced++;
      }
    } catch {
      // Diamkan — Post Ranking gagal/kosong tidak menggagalkan metrics yang sudah disync di atas.
    }

    return { clientId, platform: "instagram", metricsSynced, postsSynced };
  } catch (err) {
    return { clientId, platform: "instagram", metricsSynced: 0, postsSynced: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
// FACEBOOK — pageId = Facebook Page ID, accessToken = Page Access Token
// (BUKAN User Access Token) yang didapat lewat Graph API Explorer.
// ---------------------------------------------------------------------------
export async function syncFacebookForClient(clientId: string, pageId: string, accessToken: string, days = 7): Promise<MetaSyncResult> {
  if (!isServiceRoleConfigured()) {
    return { clientId, platform: "facebook", metricsSynced: 0, postsSynced: 0, error: "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server." };
  }

  try {
    const admin = createAdminClient();
    const today = new Date();
    let metricsSynced = 0;
    let postsSynced = 0;

    const page = await fetchJSON(`https://graph.facebook.com/${GRAPH_VERSION}/${pageId}?fields=fan_count&access_token=${accessToken}`);
    const followers = (page.fan_count as number | undefined) ?? null;

    const since = Math.floor(new Date(today.getTime() - days * 86400000).getTime() / 1000);
    const until = Math.floor(today.getTime() / 1000);
    let impressionsByDate = new Map<string, number>();
    let reachByDate = new Map<string, number>();
    try {
      const insights = await fetchJSON(
        `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/insights?metric=page_impressions,page_impressions_unique&period=day&since=${since}&until=${until}&access_token=${accessToken}`
      );
      const series = (insights.data as { name: string; values: { end_time: string; value: number }[] }[] | undefined) ?? [];
      impressionsByDate = new Map((series.find((s) => s.name === "page_impressions")?.values ?? []).map((v) => [v.end_time.slice(0, 10), v.value]));
      reachByDate = new Map((series.find((s) => s.name === "page_impressions_unique")?.values ?? []).map((v) => [v.end_time.slice(0, 10), v.value]));
    } catch {
      // Nama metric Page Insights cukup sering berubah antar versi Graph API — kalau gagal, followers tetap kesimpan, impressions/reach cuma kosong.
    }

    const allDates = new Set([...impressionsByDate.keys(), ...reachByDate.keys()]);
    if (allDates.size === 0 && followers != null) {
      // Sama alasannya kayak Instagram di atas — jangan paksa "hari ini"
      // kalau memang gak ada data Insights sama sekali buat tanggal itu.
      allDates.add(isoDate(new Date(today.getTime() - 86400000)));
    }
    for (const date of allDates) {
      await upsertSocialMetric(admin, clientId, "facebook", date, {
        followers,
        impressions: impressionsByDate.get(date) ?? null,
        reach: reachByDate.get(date) ?? null,
      });
      metricsSynced++;
    }

    try {
      const posts = await fetchJSON(
        `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/posts?fields=id,message,created_time,permalink_url,likes.summary(true),comments.summary(true),shares&limit=25&access_token=${accessToken}`
      );
      const items = (posts.data as Record<string, unknown>[] | undefined) ?? [];
      for (const item of items) {
        const postId = item.id as string;
        const likes = ((item.likes as Record<string, unknown> | undefined)?.summary as Record<string, unknown> | undefined)?.total_count as
          | number
          | undefined;
        const comments = ((item.comments as Record<string, unknown> | undefined)?.summary as Record<string, unknown> | undefined)?.total_count as
          | number
          | undefined;
        const shares = (item.shares as Record<string, unknown> | undefined)?.count as number | undefined;

        await upsertPost(admin, clientId, "facebook", postId, {
          type: "feed",
          title: String(item.message ?? "").slice(0, 120) || "(tanpa teks)",
          postedDate: String(item.created_time ?? "").slice(0, 10) || isoDate(today),
          likes: likes ?? null,
          comments: comments ?? null,
          shares: shares ?? null,
          permalink: (item.permalink_url as string | undefined) ?? null,
        });
        postsSynced++;
      }
    } catch {
      // Diamkan — Post Ranking gagal/kosong tidak menggagalkan metrics yang sudah disync di atas.
    }

    return { clientId, platform: "facebook", metricsSynced, postsSynced };
  } catch (err) {
    return { clientId, platform: "facebook", metricsSynced: 0, postsSynced: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
// THREADS — API terpisah (graph.threads.net, BUKAN graph.facebook.com),
// OAuth-nya sendiri ("Login with Threads"). threadsUserId & token didapat
// dari flow itu, bukan dari Graph API Explorer biasa. Token SELALU expire
// 60 hari — lihat refreshThreadsTokenIfNeeded() di bawah.
// ---------------------------------------------------------------------------
export async function syncThreadsForClient(clientId: string, threadsUserId: string, accessToken: string, days = 7): Promise<MetaSyncResult> {
  if (!isServiceRoleConfigured()) {
    return { clientId, platform: "threads", metricsSynced: 0, postsSynced: 0, error: "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server." };
  }

  try {
    const admin = createAdminClient();
    const today = new Date();
    let metricsSynced = 0;
    let postsSynced = 0;

    let followers: number | null = null;
    let totalLikes: number | null = null;
    let totalReplies: number | null = null;
    let totalReposts: number | null = null;
    let totalQuotes: number | null = null;
    try {
      // followers_count, likes, replies, reposts, quotes SEMUA balik dalam
      // format "total_value" (satu angka keseluruhan/lifetime, BUKAN
      // breakdown per-hari kayak "views") — beda tipe period dari Threads
      // sendiri, bukan sesuatu yang bisa diminta breakdown harian.
      const totalsRes = await fetchJSON(
        `https://graph.threads.net/v1.0/${threadsUserId}/threads_insights?metric=followers_count,likes,replies,reposts,quotes&access_token=${accessToken}`
      );
      const totals = (totalsRes.data as { name: string; total_value?: { value: number } }[] | undefined) ?? [];
      followers = totals.find((s) => s.name === "followers_count")?.total_value?.value ?? null;
      totalLikes = totals.find((s) => s.name === "likes")?.total_value?.value ?? null;
      totalReplies = totals.find((s) => s.name === "replies")?.total_value?.value ?? null;
      totalReposts = totals.find((s) => s.name === "reposts")?.total_value?.value ?? null;
      totalQuotes = totals.find((s) => s.name === "quotes")?.total_value?.value ?? null;
    } catch {
      // Diamkan — endpoint/nama metric Threads paling sering berubah dari 3 platform ini.
    }

    let viewsByDate = new Map<string, number>();
    try {
      // PENTING: Threads Insights API mau `since`/`until` dalam format UNIX
      // timestamp (mis. 1787119016), BUKAN string tanggal "YYYY-MM-DD" —
      // beda dari sebagian endpoint Graph API lain yang lebih toleran.
      // "views" (BEDA dari metric di atas) memang breakdown per-hari,
      // makanya dipanggil terpisah dengan since/until.
      const since = Math.floor((today.getTime() - days * 86400000) / 1000);
      const until = Math.floor(today.getTime() / 1000);
      const insights = await fetchJSON(
        `https://graph.threads.net/v1.0/${threadsUserId}/threads_insights?metric=views&since=${since}&until=${until}&access_token=${accessToken}`
      );
      const series = (insights.data as { name: string; values?: { end_time: string; value: number }[] }[] | undefined) ?? [];
      viewsByDate = new Map((series.find((s) => s.name === "views")?.values ?? []).map((v) => [v.end_time.slice(0, 10), v.value]));
    } catch {
      // Sama seperti di atas — sengaja tidak menggagalkan seluruh sync.
    }

    // Engagement Rate = (likes+replies+reposts+quotes total) / (total views
    // periode ini) × 100 — pendekatan terbaik yang bisa dilakukan, KARENA
    // likes/replies/reposts/quotes cuma tersedia sebagai angka lifetime
    // (bukan per-hari) sementara views tersedia per-hari — jadi dibagi
    // pakai TOTAL views yang berhasil ditarik di periode `days` hari ini,
    // bukan per-tanggal presisi. Replies & Reposts sendiri ditulis sebagai
    // angka lifetime yang sama di setiap baris tanggal (sama pola kayak
    // Followers), bukan breakdown per-hari — karena Threads memang tidak
    // menyediakan breakdown itu.
    const totalViewsInPeriod = Array.from(viewsByDate.values()).reduce((a, b) => a + b, 0);
    const totalEngagement =
      totalLikes != null || totalReplies != null || totalReposts != null || totalQuotes != null
        ? (totalLikes ?? 0) + (totalReplies ?? 0) + (totalReposts ?? 0) + (totalQuotes ?? 0)
        : null;
    const engagementRate =
      totalViewsInPeriod > 0 && totalEngagement != null ? Math.round((totalEngagement / totalViewsInPeriod) * 1000) / 10 : null;

    const allDates = new Set([...viewsByDate.keys()]);
    if (allDates.size === 0 && followers != null) {
      // Sama alasannya kayak Instagram/Facebook di atas.
      allDates.add(isoDate(new Date(today.getTime() - 86400000)));
    }
    for (const date of allDates) {
      await upsertSocialMetric(admin, clientId, "threads", date, {
        followers,
        impressions: viewsByDate.get(date) ?? null, // "views" di Threads dipetakan ke Impressions, metrik paling dekat maknanya.
        engagementRate,
        replies: totalReplies,
        reposts: totalReposts,
      });
      metricsSynced++;
    }

    // Post Ranking — dibungkus try/catch juga (konsisten dengan bagian
    // followers/views di atas): kalau akun ini belum pernah post di
    // Threads sama sekali, atau endpoint-nya error, followers+views yang
    // SUDAH berhasil disync di atas tetap tersimpan — tidak ikut ke-reset
    // jadi gagal cuma gara-gara bagian Post Ranking-nya bermasalah.
    try {
      const media = await fetchJSON(
        `https://graph.threads.net/v1.0/${threadsUserId}/threads?fields=id,text,permalink,timestamp&limit=25&access_token=${accessToken}`
      );
      const items = (media.data as Record<string, unknown>[] | undefined) ?? [];
      for (const item of items) {
        const mediaId = item.id as string;
        let likes: number | null = null;
        let views: number | null = null;
        try {
          const mediaInsights = await fetchJSON(`https://graph.threads.net/v1.0/${mediaId}/insights?metric=views,likes&access_token=${accessToken}`);
          const mSeries = (mediaInsights.data as { name: string; values?: { value: number }[] }[] | undefined) ?? [];
          views = mSeries.find((s) => s.name === "views")?.values?.[0]?.value ?? null;
          likes = mSeries.find((s) => s.name === "likes")?.values?.[0]?.value ?? null;
        } catch {
          // Diamkan.
        }

        await upsertPost(admin, clientId, "threads", mediaId, {
          type: "feed",
          title: String(item.text ?? "").slice(0, 120) || "(tanpa teks)",
          postedDate: String(item.timestamp ?? "").slice(0, 10) || isoDate(today),
          likes,
          views,
          permalink: (item.permalink as string | undefined) ?? null,
        });
        postsSynced++;
      }
    } catch {
      // Diamkan — Post Ranking gagal/kosong tidak menggagalkan metrics yang sudah disync di atas.
    }

    return { clientId, platform: "threads", metricsSynced, postsSynced };
  } catch (err) {
    return { clientId, platform: "threads", metricsSynced: 0, postsSynced: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Refresh Threads long-lived token kalau sisa umurnya < 7 hari — dipanggil
 * dari cron setiap hari (lihat route cron), self-refresh pakai token yang
 * masih valid sendiri (TIDAK butuh app secret sama sekali, beda dengan
 * refresh token Facebook/Instagram versi lama). Update baris
 * `social_connections` dengan token & expiry baru kalau berhasil.
 */
export async function refreshThreadsTokenIfNeeded(connectionId: string, accessToken: string, tokenExpiresAt: string | null): Promise<void> {
  if (!tokenExpiresAt) return;
  const daysLeft = (new Date(tokenExpiresAt).getTime() - Date.now()) / 86400000;
  if (daysLeft > 7) return;

  try {
    const res = await fetchJSON(`https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${accessToken}`);
    const newToken = res.access_token as string | undefined;
    const expiresIn = res.expires_in as number | undefined;
    if (!newToken || !expiresIn) return;

    const admin = createAdminClient();
    const newExpiry = new Date(Date.now() + expiresIn * 1000).toISOString();
    await admin.from("social_connections").update({ access_token: newToken, token_expires_at: newExpiry }).eq("id", connectionId);
  } catch {
    // Diamkan — kalau refresh gagal, token lama masih dipakai sampai benar-benar expire, admin akan lihat error di Sync Sekarang saat itu terjadi dan bisa re-generate token manual.
  }
}
