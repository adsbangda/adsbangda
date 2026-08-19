// Data access layer — satu-satunya tempat komponen boleh mengambil data.
// Mode demo (mock-data.ts) vs mode live (Supabase) transparan bagi UI;
// begitu env Supabase di-isi, fungsi di bawah otomatis pindah ke query
// database asli tanpa mengubah satu pun komponen halaman.

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured, createClient } from "./supabase/server";
import { ClientNotAssignedError, getSessionUserId } from "./auth";
import { formatDateID, formatPercent } from "./utils";
import {
  mapClient,
  mapProject,
  mapProjectTask,
  mapPerformanceMetric,
  mapContentItem,
  mapContentTarget,
  mapReportItem,
  mapFileEntry,
  mapActivityEntry,
  activityDayLabel,
  mapQuickStat,
} from "./mappers";
import {
  mockClient,
  mockProjects,
  mockProjectTasks,
  mockAttentionItems,
  mockPerformance,
  mockSocial,
  mockWebsite,
  mockChannelSummary,
  mockTopContent,
  mockContentCalendar,
  mockReports,
  mockActivity,
  mockMonthlyDelivery,
  mockQuickStats,
  mockChannelOverview,
  mockSocialMediaBreakdown,
  mockPlatformPerformanceTable,
  mockUpcomingEvents,
  mockWeeklyCalendar,
  mockFiles,
  marketingInsight,
} from "./mock-data";
import type { Client, Project, ProjectTask, ContentItem, ReportItem, FileEntry, MonthlyDeliveryHero, WeeklyCalendar, ChannelOverviewRow, AttentionItem, UpcomingEvent, SocialPlatformSummary, PlatformPerformanceRow } from "./types";
import { CONTENT_TYPE_LABEL } from "./types";

const MONTH_LABEL_ID = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

export const DEMO_MODE = !isSupabaseConfigured;

export function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export interface DateRange {
  from: string;
  to: string;
}

/** Tanggal awal & akhir satu bulan penuh dari period "YYYY-MM" — dipakai sebagai default DateRange kalau user belum pilih rentang custom. */
export function monthBounds(period: string): DateRange {
  const [y, m] = period.split("-").map(Number);
  const from = `${period}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to = `${period}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export async function getCurrentClient(): Promise<Client> {
  if (!isSupabaseConfigured) return mockClient;

  const userId = await getSessionUserId();
  if (!userId) throw new ClientNotAssignedError();

  const supabase = await createClient();
  const { data } = await supabase!
    .from("client_users")
    .select("clients(*)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  const row = (data as unknown as { clients: Record<string, unknown> } | null)?.clients;
  if (!row) throw new ClientNotAssignedError();

  // PENTING: pakai mapClient() yang sama dipakai Admin Portal — jangan
  // konstruksi object manual di sini lagi. Versi manual sebelumnya cuma
  // ambil id/name/logoUrl/industry/status, diam-diam MENGABAIKAN
  // socialMediaActive/metaAdsActive/websiteActive — akibatnya Overview
  // (dan halaman client lain manapun) tidak akan PERNAH melihat service
  // yang diaktifkan admin di halaman Services, walau datanya di database
  // sudah benar. Bug ini sudah ada dari awal, baru ketahuan sekarang
  // karena baru ada fitur (Overview dinamis) yang benar-benar bergantung
  // ke field-field itu.
  return mapClient(row);
}

export async function getActiveProject(clientId: string): Promise<{
  project: Project | null;
  tasks: ProjectTask[];
}> {
  if (!isSupabaseConfigured) {
    return { project: mockProjects[0] ?? null, tasks: mockProjectTasks };
  }

  const supabase = await createClient();
  const { data: projectRow } = await supabase!
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .eq("status", "on_track")
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!projectRow) return { project: null, tasks: [] };

  const { data: taskRows } = await supabase!
    .from("project_tasks")
    .select("*")
    .eq("project_id", projectRow.id)
    .order("order_index", { ascending: true });

  return {
    project: mapProject(projectRow),
    tasks: (taskRows ?? []).map(mapProjectTask),
  };
}

/**
 * Diturunkan LANGSUNG dari content_items (approval_required + approval_status)
 * — bukan tabel `attention_items` terpisah, yang ternyata tidak pernah
 * ditulis dari mana pun di Admin Portal (peninggalan skema awal, orphan
 * sejak Phase 3+ memindahkan approval workflow ke content_items). Ini
 * PERSIS logika yang sama dipakai halaman /content-calendar sendiri untuk
 * "Needs Your Approval", supaya definisi "butuh perhatian kamu" konsisten
 * di seluruh Client Portal.
 */
export async function getAttentionItems(clientId: string): Promise<AttentionItem[]> {
  if (!isSupabaseConfigured) return mockAttentionItems;

  const items = await getContentCalendar(clientId);
  const needsApproval = items.filter((i) => i.approvalRequired && (i.approvalStatus === "pending" || !i.approvalStatus));

  return needsApproval.map((item) => ({
    id: item.id,
    icon: "approval",
    title: `Menunggu persetujuan kamu: ${item.title}`,
    description: `${item.platform} · ${item.type} · ${formatDateID(item.plannedDate)}`,
    href: "/content-calendar",
  }));
}

export async function getRecentActivity(clientId: string, period: string = currentPeriod(), range?: DateRange) {
  const { from, to } = range ?? monthBounds(period);

  if (!isSupabaseConfigured) {
    return mockActivity
      .filter((a) => {
        const d = a.occurredAt.slice(0, 10);
        return d >= from && d <= to;
      })
      .map((a) => ({ ...a, day: activityDayLabel(a.occurredAt) }));
  }

  const supabase = await createClient();
  const { data } = await supabase!
    .from("activity_log")
    .select("*")
    .eq("client_id", clientId)
    .gte("occurred_at", `${from}T00:00:00.000Z`)
    .lte("occurred_at", `${to}T23:59:59.999Z`)
    .order("occurred_at", { ascending: false })
    .limit(50);

  return (data ?? []).map(mapActivityEntry);
}

/**
 * Diturunkan dari `content_targets` (target per platform+jenis konten yang
 * admin isi di Social Media → Content Delivery) dibandingkan konten
 * `content_items` berstatus "published" — PERSIS logika yang sama dengan
 * `adminComputeOverallProgress()` di admin-data.ts, supaya angka yang
 * client lihat di Overview selalu sama dengan yang admin lihat. Tabel
 * `delivery_meta`/`delivery_items`/view `delivery_progress` (skema awal)
 * ditinggalkan di sini karena tidak ada satu pun admin UI yang menulis ke
 * situ lagi — nulis ke situ manual lewat Table Editor tidak akan pernah
 * konsisten dengan apa yang admin lihat sendiri di layarnya.
 */
export async function getMonthlyDelivery(clientId: string, period: string = currentPeriod(), range?: DateRange): Promise<MonthlyDeliveryHero> {
  if (!isSupabaseConfigured) return mockMonthlyDelivery;

  const supabase = await createClient();
  const [{ data: targetRows }, items] = await Promise.all([
    supabase!.from("content_targets").select("*").eq("client_id", clientId).eq("period", period),
    getContentCalendar(clientId),
  ]);

  const targets = (targetRows ?? []).map(mapContentTarget);
  // Sebelumnya "published" dihitung TANPA filter tanggal sama sekali
  // (semua konten published sepanjang waktu, apa pun period yang dipilih
  // — bug laten: ganti bulan di dropdown tidak benar-benar mengubah angka
  // ini). Sekarang selalu difilter ke DateRange yang aktif — default satu
  // bulan penuh (monthBounds(period)) kalau user belum pilih rentang
  // tanggal custom lewat date-range picker di OverviewHeader.
  const { from, to } = range ?? monthBounds(period);
  const isCustomRange = !!range;
  const published = items.filter((i) => i.status === "published" && i.plannedDate >= from && i.plannedDate <= to);

  const totalTarget = targets.reduce((sum, t) => sum + t.target, 0);
  const totalDelivered = published.length;
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalDelivered / totalTarget) * 100)) : 0;

  const status: MonthlyDeliveryHero["status"] =
    totalTarget === 0 ? "on_track" : overallPct >= 100 ? "completed" : overallPct >= 60 ? "on_track" : overallPct >= 30 ? "at_risk" : "delayed";

  const rangeLabel = isCustomRange
    ? `tanggal ${new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long" }).format(new Date(`${from}T00:00:00`))} – ${new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${to}T00:00:00`))}`
    : period === currentPeriod()
      ? "bulan ini"
      : "di periode ini";

  return {
    periodLabel: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(`${period}-01`)),
    overallPct,
    status,
    helperText:
      totalTarget > 0
        ? `${totalDelivered} dari ${totalTarget} konten sudah published ${rangeLabel}${isCustomRange ? " (target tetap dihitung satu bulan penuh)" : ""}.`
        : "Belum ada target content untuk periode ini — hubungi tim Adsbangda.",
    meta: {
      periodRange: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${period}-01`)),
      lastUpdated: "—",
      agreedDate: "—",
      contractHref: "/reports",
    },
  };
}

export async function getQuickStats(clientId: string) {
  if (!isSupabaseConfigured) return mockQuickStats;

  const supabase = await createClient();
  const { data } = await supabase!
    .from("quick_stats")
    .select("*")
    .eq("client_id", clientId)
    .order("sort_order");

  return (data ?? []).map(mapQuickStat);
}

/**
 * Diturunkan dari snapshot `performance_metrics` (channel='social') yang
 * admin isi di Social Media → Performance — engagement rate per platform
 * (7 snapshot terakhir jadi sparkline) + Total Reach gabungan semua
 * platform per tanggal. Tabel `channel_overview` (skema awal) ditinggalkan
 * karena tidak ada admin UI yang menulis ke situ.
 */
/**
 * Diturunkan dari snapshot `performance_metrics` — engagement rate per
 * platform social (7 snapshot terakhir jadi sparkline), PLUS Meta Ads
 * (Lead Masuk) dan Website (Pengunjung) sebagai baris tambahan — PERSIS
 * susunan "Channel Overview" di desain (Instagram/TikTok/Facebook/Meta
 * Ads/Website).
 *
 * Conditional rendering di sini didorong oleh DUA sinyal:
 *   1. `client.socialMediaActive`/`metaAdsActive`/`websiteActive` — flag
 *      service level yang SUDAH ADA di kolom `clients` (migration 0009),
 *      bukan konfigurasi baru yang saya buat.
 *   2. Presensi baris `performance_metrics` per platform — platform social
 *      yang belum pernah ada snapshot performance-nya otomatis tidak
 *      pernah muncul (bukan di-filter manual, memang tidak pernah masuk
 *      query result), jadi tidak perlu toggle per-channel terpisah untuk
 *      Instagram/TikTok/Facebook.
 */
export async function getChannelOverview(client: Client): Promise<ChannelOverviewRow[]> {
  if (!isSupabaseConfigured) return mockChannelOverview;

  const supabase = await createClient();
  const { data } = await supabase!.from("performance_metrics").select("*").eq("client_id", client.id).order("date", { ascending: true });
  const metrics = (data ?? []).map(mapPerformanceMetric);

  const pctDelta = (latest: number, prev: number | undefined) => (prev != null && prev > 0 ? Math.round(((latest - prev) / prev) * 1000) / 10 : null);
  const deltaLabel = (delta: number | null) => (delta == null ? "—" : `${delta >= 0 ? "↑" : "↓"} ${Math.abs(delta)}%`);

  const rows: ChannelOverviewRow[] = [];

  if (client.socialMediaActive) {
    const social = metrics.filter((m) => m.channel === "social");
    const ICON_MAP: Record<string, "instagram" | "facebook" | "tiktok" | "x" | "linkedin" | "threads"> = {
      instagram: "instagram",
      facebook: "facebook",
      tiktok: "tiktok",
      x: "x",
      linkedin: "linkedin",
      threads: "threads",
    };
    const platforms = Array.from(new Set(social.map((m) => m.platform))).filter(
      (p): p is "instagram" | "facebook" | "tiktok" | "x" | "linkedin" | "threads" => !!p && p in ICON_MAP
    );

    for (const platform of platforms) {
      const history = social.filter((m) => m.platform === platform).slice(-7);
      const latest = history[history.length - 1];
      const prev = history.length > 1 ? history[history.length - 2] : undefined;
      const latestRate = latest?.engagementRate ?? 0;
      rows.push({
        id: platform,
        icon: ICON_MAP[platform],
        label: platform.charAt(0).toUpperCase() + platform.slice(1),
        metricLabel: "Engagement Rate",
        value: formatPercent(latestRate, 2),
        deltaLabel: deltaLabel(pctDelta(latestRate, prev?.engagementRate)),
        sparkline: history.map((h) => h.engagementRate ?? 0),
      });
    }
  }

  if (client.metaAdsActive) {
    const metaAds = metrics.filter((m) => m.channel === "meta_ads").slice(-7);
    if (metaAds.length > 0) {
      const latest = metaAds[metaAds.length - 1];
      const prev = metaAds.length > 1 ? metaAds[metaAds.length - 2] : undefined;
      rows.push({
        id: "meta_ads",
        icon: "meta_ads",
        label: "Meta Ads",
        metricLabel: "Lead Masuk",
        value: new Intl.NumberFormat("id-ID").format(latest?.leads ?? 0),
        deltaLabel: deltaLabel(pctDelta(latest?.leads ?? 0, prev?.leads)),
        sparkline: metaAds.map((m) => m.leads ?? 0),
      });
    }
  }

  if (client.websiteActive) {
    const website = metrics.filter((m) => m.channel === "website").slice(-7);
    if (website.length > 0) {
      const latest = website[website.length - 1];
      const prev = website.length > 1 ? website[website.length - 2] : undefined;
      rows.push({
        id: "website",
        icon: "website",
        label: "Website",
        metricLabel: "Pengunjung",
        value: new Intl.NumberFormat("id-ID").format(latest?.visitors ?? 0),
        deltaLabel: deltaLabel(pctDelta(latest?.visitors ?? 0, prev?.visitors)),
        sparkline: website.map((m) => m.visitors ?? 0),
      });
    }
  }

  return rows;
}

/**
 * Breakdown per-platform buat card "Social Media Performance" — target vs
 * published bulan ini, dikelompokkan per platform. Platform dianggap
 * "pernah diaktifkan" kalau PERNAH ada baris `content_targets` untuknya
 * (period apa saja, bukan cuma bulan ini) — supaya platform yang bulan ini
 * targetnya belum diisi admin tidak tiba-tiba hilang dari Overview, beda
 * kasus dengan platform yang memang tidak pernah dipakai client ini sama
 * sekali (lihat catatan "service aktif vs data kosong" — dua kondisi
 * berbeda, jangan disamakan).
 */
/**
 * Satu tabel ringkas per platform — Followers, Reach, Engagement (dari
 * snapshot performance_metrics channel "social", dibanding snapshot
 * sebelumnya), dan Content (jumlah konten published BULAN INI dibanding
 * bulan sebelumnya, difilter dari `plannedDate` — beda dari goalBreakdown/
 * getSocialMediaBreakdown yang menghitung total published SEPANJANG WAKTU
 * tanpa filter tanggal; di sini sengaja difilter per-bulan supaya delta-nya
 * bermakna sebagai "growth bulan ini vs bulan lalu").
 *
 * Platform yang muncul = gabungan platform yang PERNAH ada target content
 * (content_targets) ATAU pernah ada snapshot performance — bukan daftar
 * hardcode, jadi fleksibel sama seperti bagian Overview lainnya.
 */
/**
 * Satu tabel ringkas per platform — Followers, Reach, Engagement, dan
 * Profile Visit, semua dari snapshot performance_metrics channel "social"
 * dibanding snapshot sebelumnya (persis sumber & definisi yang sama dipakai
 * sebelumnya di card lama).
 *
 * Platform yang muncul = gabungan platform yang PERNAH ada target content
 * (content_targets) ATAU pernah ada snapshot performance — bukan daftar
 * hardcode, jadi fleksibel sama seperti bagian Overview lainnya.
 */
export async function getPlatformPerformanceTable(clientId: string): Promise<PlatformPerformanceRow[]> {
  if (!isSupabaseConfigured) return mockPlatformPerformanceTable;

  const supabase = await createClient();
  const [{ data: socialRows }, { data: everTargetRows }] = await Promise.all([
    supabase!.from("performance_metrics").select("*").eq("client_id", clientId).eq("channel", "social").order("date", { ascending: true }),
    supabase!.from("content_targets").select("platform").eq("client_id", clientId),
  ]);

  const socialMetrics = (socialRows ?? []).map(mapPerformanceMetric);
  const everConfigured = Array.from(new Set((everTargetRows ?? []).map((r) => r.platform as string)));
  const platformsWithMetrics = Array.from(new Set(socialMetrics.map((m) => m.platform).filter((p): p is NonNullable<typeof p> => !!p)));
  const platforms = Array.from(new Set([...everConfigured, ...platformsWithMetrics]));

  const pct = (curr?: number | null, prev?: number | null) => (curr == null || prev == null || prev === 0 ? null : Math.round(((curr - prev) / prev) * 1000) / 10);

  return platforms.map((platform) => {
    const history = socialMetrics.filter((m) => m.platform === platform);
    const latest = history.at(-1);
    const previous = history.at(-2);

    return {
      platform,
      followers: latest?.followers,
      followersDelta: pct(latest?.followers, previous?.followers),
      reach: latest?.reach,
      reachDelta: pct(latest?.reach, previous?.reach),
      impressions: latest?.impressions,
      impressionsDelta: pct(latest?.impressions, previous?.impressions),
      profileVisit: latest?.visitors,
      profileVisitDelta: pct(latest?.visitors, previous?.visitors),
    };
  });
}

export async function getSocialMediaBreakdown(clientId: string, period: string = currentPeriod()): Promise<SocialPlatformSummary[]> {
  if (!isSupabaseConfigured) return mockSocialMediaBreakdown;

  const supabase = await createClient();
  const [{ data: everTargetRows }, { data: currentTargetRows }, items] = await Promise.all([
    supabase!.from("content_targets").select("platform").eq("client_id", clientId),
    supabase!.from("content_targets").select("*").eq("client_id", clientId).eq("period", period),
    getContentCalendar(clientId),
  ]);

  const everConfigured = Array.from(new Set((everTargetRows ?? []).map((r) => r.platform as string)));
  const targets = (currentTargetRows ?? []).map(mapContentTarget);
  const published = items.filter((i) => i.status === "published");

  return everConfigured.map((platform) => ({
    platform: platform as SocialPlatformSummary["platform"],
    items: targets
      .filter((t) => t.platform === platform)
      .map((t) => ({
        contentType: t.contentType,
        completed: published.filter((i) => i.platform === platform && i.type === t.contentType).length,
        target: t.target,
      })),
  }));
}

/**
 * Diturunkan dari `content_items` berstatus "scheduled" (konten yang sudah
 * dijadwalkan tapi belum publish) — bukan tabel `upcoming_events` terpisah
 * yang tidak ada admin UI-nya. Mirroring persis "Upcoming" di Admin
 * Portal (adminGetClient's scheduledContent).
 */
export async function getUpcomingEvents(clientId: string): Promise<UpcomingEvent[]> {
  if (!isSupabaseConfigured) return mockUpcomingEvents;

  const items = await getContentCalendar(clientId);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = items
    .filter((i) => i.status === "scheduled" && i.plannedDate >= today)
    .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
    .slice(0, 5);

  return upcoming.map((item) => {
    const d = new Date(`${item.plannedDate}T00:00:00Z`);
    return {
      id: item.id,
      day: String(d.getUTCDate()),
      month: MONTH_LABEL_ID[d.getUTCMonth()],
      title: item.title,
      timeLabel: `${item.platform} · ${item.type}`,
    };
  });
}

/**
 * Diturunkan dari `content_targets` (platform+jenis konten yang PERNAH
 * dikonfigurasi admin, sama seperti getSocialMediaBreakdown) + `content_items`
 * minggu ini — BUKAN 4 baris hardcoded seperti sebelumnya (Instagram Feed/
 * Story, Facebook Post, TikTok Post selalu ada apapun kondisinya). Platform
 * yang tidak pernah dikonfigurasi client ini otomatis tidak pernah punya
 * baris di kalender. content_targets.contentType & content_items.type
 * pakai vocabulary yang SAMA (lihat CONTENT_TYPES_BY_PLATFORM di types.ts),
 * jadi tidak perlu tabel translasi platform→bucket lagi.
 */
export async function getWeeklyCalendar(clientId: string): Promise<WeeklyCalendar> {
  if (!isSupabaseConfigured) return mockWeeklyCalendar;

  const now = new Date();
  const day = now.getUTCDay() || 7; // Senin=1 ... Minggu=7
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const supabase = await createClient();
  const [{ data: targetRows }, { data: itemRows }] = await Promise.all([
    supabase!.from("content_targets").select("platform, content_type").eq("client_id", clientId),
    supabase!
      .from("content_items")
      .select("*")
      .eq("client_id", clientId)
      .gte("planned_date", monday.toISOString().slice(0, 10))
      .lte("planned_date", sunday.toISOString().slice(0, 10)),
  ]);

  const items = (itemRows ?? []).map(mapContentItem);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return { label: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i], date: d.getUTCDate() };
  });
  const activeIndex = day - 1;

  // Kombinasi platform+contentType unik yang PERNAH dikonfigurasi client ini
  // (period apa saja, sama prinsipnya dengan getSocialMediaBreakdown — bulan
  // ini targetnya belum diisi bukan berarti platform itu "tidak aktif").
  const combos = Array.from(
    new Map((targetRows ?? []).map((r) => [`${r.platform}:${r.content_type}`, { platform: r.platform as string, contentType: r.content_type as string }])).values()
  );

  const rows = combos.map(({ platform, contentType }) => {
    const counts: (number | null)[] = Array(7).fill(null);
    for (const item of items) {
      if (item.platform !== platform || item.type !== contentType) continue;
      const idx = Math.round((new Date(item.plannedDate).getTime() - monday.getTime()) / 86400000);
      if (idx < 0 || idx > 6) continue;
      counts[idx] = (counts[idx] ?? 0) + 1;
    }
    return {
      id: `${platform}:${contentType}`,
      platform: platform as WeeklyCalendar["rows"][number]["platform"],
      contentType,
      label: `${platform.charAt(0).toUpperCase()}${platform.slice(1)} ${CONTENT_TYPE_LABEL[contentType] ?? contentType}`,
      counts,
    };
  });

  const total = rows.reduce((sum, r) => sum + r.counts.reduce((s: number, c) => s + (c ?? 0), 0), 0);

  return { weekDays, activeIndex, rows, totalLabel: `${total} konten` };
}

export async function getPerformanceSummary(clientId: string) {
  if (!isSupabaseConfigured) {
    return {
      metaAds: mockPerformance,
      social: mockSocial,
      website: mockWebsite,
      topContent: mockTopContent,
      channelSummary: mockChannelSummary,
      insight: marketingInsight,
    };
  }

  const supabase = await createClient();
  const [metaAds, social, website] = await Promise.all([
    supabase!.from("performance_metrics").select("*").eq("client_id", clientId).eq("channel", "meta_ads").order("date"),
    supabase!.from("performance_metrics").select("*").eq("client_id", clientId).eq("channel", "social").order("date"),
    supabase!.from("performance_metrics").select("*").eq("client_id", clientId).eq("channel", "website").order("date"),
  ]);

  return {
    metaAds: (metaAds.data ?? []).map(mapPerformanceMetric),
    social: (social.data ?? []).map(mapPerformanceMetric),
    website: (website.data ?? []).map(mapPerformanceMetric),
    topContent: mockTopContent, // TODO (fase berikutnya): turunkan dari content_items + metrik per-post
    channelSummary: mockChannelSummary, // TODO (fase berikutnya): agregat per channel dari performance_metrics
    insight: marketingInsight, // TODO (fase berikutnya): hasil generate dari perbandingan periode
  };
}

export async function getContentCalendar(clientId: string): Promise<ContentItem[]> {
  if (!isSupabaseConfigured) return mockContentCalendar;

  const supabase = await createClient();
  const { data } = await supabase!
    .from("content_items")
    .select("*")
    .eq("client_id", clientId)
    .order("planned_date", { ascending: true });

  return (data ?? []).map(mapContentItem);
}

/**
 * Client Approve / Request Revision — lewat RPC security-definer
 * (migration 0010), BUKAN update langsung ke content_items, supaya client
 * cuma bisa ubah approval_status (tidak bisa ubah field lain) dan cuma
 * untuk content milik client-nya sendiri (dicek di RPC).
 *
 * Revalidate DUA path sekaligus — path Client Portal-nya sendiri (biar
 * halaman yang baru submit langsung update) dan path Admin Portal untuk
 * client ini (biar tim yang sedang lihat Content List di Admin Portal juga
 * langsung lihat status approval terbaru, tanpa refresh manual). Ini
 * pelengkap Supabase Realtime (lihat RealtimeRefresh) — tetap berguna
 * sebagai fallback kalau koneksi realtime browser admin sedang putus.
 */
export async function respondToApproval(contentId: string, response: "approved" | "revision_requested", note: string = "") {
  if (!isSupabaseConfigured) {
    // Mode demo: langsung ubah in-memory supaya UI tetap bisa dicoba.
    const item = mockContentCalendar.find((c) => c.id === contentId);
    if (item) item.approvalStatus = response === "approved" ? "approved" : "revision";
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase!.rpc("client_respond_to_approval", {
    target_content_id: contentId,
    response,
    response_note: note,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/content-calendar");
  try {
    const client = await getCurrentClient();
    revalidatePath(`/admin/clients/${client.id}/social-media`);
    revalidatePath(`/admin/clients/${client.id}`);
  } catch {
    // getCurrentClient() gagal (edge case sesi aneh) — approval-nya sendiri
    // sudah tersimpan lewat RPC di atas, jadi ini aman diabaikan; Realtime
    // tetap jadi jalur utama buat sisi Admin, ini cuma pelengkap.
  }
}

export async function getApprovalHistory(contentId: string) {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase!.from("content_approval_history").select("*").eq("content_id", contentId).order("created_at");
  return data ?? [];
}

export async function getReports(clientId: string): Promise<ReportItem[]> {
  if (!isSupabaseConfigured) return mockReports;

  const supabase = await createClient();
  const { data } = await supabase!
    .from("reports")
    .select("*")
    .eq("client_id", clientId)
    .order("period_month", { ascending: false });

  return (data ?? []).map(mapReportItem);
}

export async function getFiles(clientId: string): Promise<FileEntry[]> {
  if (!isSupabaseConfigured) return mockFiles;

  const supabase = await createClient();
  const { data } = await supabase!
    .from("files")
    .select("*")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });

  return (data ?? []).map(mapFileEntry);
}
