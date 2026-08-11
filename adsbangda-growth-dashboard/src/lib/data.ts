// Data access layer — satu-satunya tempat komponen boleh mengambil data.
// Mode demo (mock-data.ts) vs mode live (Supabase) transparan bagi UI;
// begitu env Supabase di-isi, fungsi di bawah otomatis pindah ke query
// database asli tanpa mengubah satu pun komponen halaman.

import { isSupabaseConfigured, createClient } from "./supabase/server";
import { ClientNotAssignedError, getSessionUserId } from "./auth";
import {
  mapProject,
  mapProjectTask,
  mapPerformanceMetric,
  mapContentItem,
  mapReportItem,
  mapFileEntry,
  mapAttentionItem,
  mapActivityEntry,
  mapDeliveryItem,
  mapQuickStat,
  mapChannelOverviewRow,
  mapUpcomingEvent,
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
  mockUpcomingEvents,
  mockWeeklyCalendar,
  mockFiles,
  marketingInsight,
} from "./mock-data";
import type { Client, Project, ProjectTask, ContentItem, ReportItem, FileEntry, MonthlyDeliveryHero, WeeklyCalendar } from "./types";

export const DEMO_MODE = !isSupabaseConfigured;

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
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

  return {
    id: row.id as string,
    name: row.name as string,
    logoUrl: (row.logo_url as string | null) ?? null,
    industry: row.industry as string,
    status: row.status as Client["status"],
  };
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

export async function getAttentionItems(clientId: string) {
  if (!isSupabaseConfigured) return mockAttentionItems;

  const supabase = await createClient();
  const { data } = await supabase!
    .from("attention_items")
    .select("*")
    .eq("client_id", clientId)
    .eq("resolved", false)
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapAttentionItem);
}

export async function getRecentActivity(clientId: string) {
  if (!isSupabaseConfigured) return mockActivity;

  const supabase = await createClient();
  const { data } = await supabase!
    .from("activity_log")
    .select("*")
    .eq("client_id", clientId)
    .order("occurred_at", { ascending: false })
    .limit(20);

  return (data ?? []).map(mapActivityEntry);
}

export async function getMonthlyDelivery(clientId: string): Promise<MonthlyDeliveryHero> {
  if (!isSupabaseConfigured) return mockMonthlyDelivery;

  const supabase = await createClient();
  const { data: metaRow } = await supabase!
    .from("delivery_meta")
    .select("*")
    .eq("client_id", clientId)
    .order("period", { ascending: false })
    .limit(1)
    .maybeSingle();

  const period = (metaRow?.period as string | undefined) ?? currentPeriod();

  const [{ data: itemRows }, { data: progressRow }] = await Promise.all([
    supabase!.from("delivery_items").select("*").eq("client_id", clientId).eq("period", period).order("sort_order"),
    supabase!.from("delivery_progress").select("overall_pct").eq("client_id", clientId).eq("period", period).maybeSingle(),
  ]);

  return {
    periodLabel: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(`${period}-01`)),
    overallPct: (progressRow?.overall_pct as number | undefined) ?? 0,
    status: (metaRow?.status as MonthlyDeliveryHero["status"]) ?? "on_track",
    helperText: (metaRow?.helper_text as string) ?? "",
    items: (itemRows ?? []).map(mapDeliveryItem),
    meta: {
      periodRange: (metaRow?.period_range as string) ?? "",
      lastUpdated: (metaRow?.last_updated as string) ?? "",
      agreedDate: (metaRow?.agreed_date as string) ?? "",
      contractHref: (metaRow?.contract_href as string) ?? "/reports",
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

export async function getChannelOverview(clientId: string) {
  if (!isSupabaseConfigured) return mockChannelOverview;

  const supabase = await createClient();
  const { data } = await supabase!
    .from("channel_overview")
    .select("*")
    .eq("client_id", clientId)
    .order("sort_order");

  return (data ?? []).map(mapChannelOverviewRow);
}

export async function getUpcomingEvents(clientId: string) {
  if (!isSupabaseConfigured) return mockUpcomingEvents;

  const supabase = await createClient();
  const { data } = await supabase!
    .from("upcoming_events")
    .select("*")
    .eq("client_id", clientId)
    .gte("event_date", new Date().toISOString().slice(0, 10))
    .order("event_date")
    .limit(5);

  return (data ?? []).map(mapUpcomingEvent);
}

const PLATFORM_BUCKET: Record<string, "instagram_feed" | "instagram_story" | "facebook_post" | "tiktok_post" | null> = {
  "instagram:post": "instagram_feed",
  "instagram:carousel": "instagram_feed",
  "instagram:reel": "instagram_feed",
  "instagram:story": "instagram_story",
  "facebook:post": "facebook_post",
  "tiktok:reel": "tiktok_post",
  "tiktok:post": "tiktok_post",
};

/** Diturunkan langsung dari content_items (bukan tabel terpisah) supaya admin cukup kelola satu sumber data konten. */
export async function getWeeklyCalendar(clientId: string): Promise<WeeklyCalendar> {
  if (!isSupabaseConfigured) return mockWeeklyCalendar;

  const now = new Date();
  const day = now.getUTCDay() || 7; // Senin=1 ... Minggu=7
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const supabase = await createClient();
  const { data } = await supabase!
    .from("content_items")
    .select("*")
    .eq("client_id", clientId)
    .gte("planned_date", monday.toISOString().slice(0, 10))
    .lte("planned_date", sunday.toISOString().slice(0, 10));

  const items = (data ?? []).map(mapContentItem);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return { label: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i], date: d.getUTCDate() };
  });
  const activeIndex = day - 1;

  const buckets: Record<string, (number | null)[]> = {
    instagram_feed: Array(7).fill(null),
    instagram_story: Array(7).fill(null),
    facebook_post: Array(7).fill(null),
    tiktok_post: Array(7).fill(null),
  };

  for (const item of items) {
    const key = `${item.platform}:${item.type}`;
    const bucket = PLATFORM_BUCKET[key];
    if (!bucket) continue;
    const idx = Math.round((new Date(item.plannedDate).getTime() - monday.getTime()) / 86400000);
    if (idx < 0 || idx > 6) continue;
    buckets[bucket][idx] = (buckets[bucket][idx] ?? 0) + 1;
  }

  const LABELS: Record<string, string> = {
    instagram_feed: "Instagram Feed",
    instagram_story: "Instagram Story",
    facebook_post: "Facebook Post",
    tiktok_post: "TikTok Post",
  };

  const rows = Object.entries(buckets).map(([platform, counts]) => ({
    id: platform,
    platform: platform as WeeklyCalendar["rows"][number]["platform"],
    label: LABELS[platform],
    counts,
  }));

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
