// Data access layer — satu-satunya tempat komponen boleh mengambil data.
// Mode demo (mock-data.ts) vs mode live (Supabase) transparan bagi UI;
// begitu env Supabase di-isi, fungsi di bawah otomatis pindah ke query
// database asli tanpa mengubah satu pun komponen halaman.

import { isSupabaseConfigured, createClient } from "./supabase/server";
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
import type { Client, Project, ProjectTask, ContentItem, ReportItem, FileEntry } from "./types";

export const DEMO_MODE = !isSupabaseConfigured;

export async function getCurrentClient(): Promise<Client> {
  if (!isSupabaseConfigured) return mockClient;

  const supabase = await createClient();
  const { data: auth } = await supabase!.auth.getUser();

  const { data } = await supabase!
    .from("client_users")
    .select("clients(id, name, logo_url, industry, status)")
    .eq("user_id", auth.user?.id)
    .single();

  type ClientRow = { id: string; name: string; logo_url: string | null; industry: string; status: Client["status"] };
  const client = (data as unknown as { clients: ClientRow })?.clients;

  return {
    id: client?.id,
    name: client?.name,
    logoUrl: client?.logo_url,
    industry: client?.industry,
    status: client?.status,
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
  const { data: project } = await supabase!
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .eq("status", "on_track")
    .order("start_date", { ascending: false })
    .limit(1)
    .single();

  const { data: tasks } = await supabase!
    .from("project_tasks")
    .select("*")
    .eq("project_id", project?.id)
    .order("order_index", { ascending: true });

  return { project, tasks: tasks ?? [] };
}

export async function getAttentionItems() {
  if (!isSupabaseConfigured) return mockAttentionItems;
  // TODO (live mode): turunkan dari content_items berstatus waiting_approval
  // + project_tasks berstatus waiting + jadwal meeting terdekat.
  return mockAttentionItems;
}

export async function getRecentActivity() {
  if (!isSupabaseConfigured) return mockActivity;
  // TODO (live mode): turunkan dari audit-log / activity table.
  return mockActivity;
}

export async function getMonthlyDelivery(clientId: string) {
  if (!isSupabaseConfigured) return mockMonthlyDelivery;
  // TODO (live mode): turunkan dari deliverable/contract items yang diinput
  // lewat Admin Portal (belum ada di MVP ini — lihat roadmap di README).
  void clientId;
  return mockMonthlyDelivery;
}

export async function getQuickStats(clientId: string) {
  if (!isSupabaseConfigured) return mockQuickStats;
  // TODO (live mode): agregat mingguan dari performance_metrics.
  void clientId;
  return mockQuickStats;
}

export async function getChannelOverview(clientId: string) {
  if (!isSupabaseConfigured) return mockChannelOverview;
  // TODO (live mode): agregat per channel + tren 7 hari dari performance_metrics.
  void clientId;
  return mockChannelOverview;
}

export async function getUpcomingEvents(clientId: string) {
  if (!isSupabaseConfigured) return mockUpcomingEvents;
  // TODO (live mode): turunkan dari jadwal meeting & milestone kontrak.
  void clientId;
  return mockUpcomingEvents;
}

export async function getWeeklyCalendar(clientId: string) {
  if (!isSupabaseConfigured) return mockWeeklyCalendar;
  // TODO (live mode): agregat content_items per hari untuk minggu berjalan.
  void clientId;
  return mockWeeklyCalendar;
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
    metaAds: metaAds.data ?? [],
    social: social.data ?? [],
    website: website.data ?? [],
    topContent: mockTopContent, // TODO (live mode): turunkan dari content_items + metrik per-post
    channelSummary: mockChannelSummary, // TODO (live mode): agregat per channel dari performance_metrics
    insight: marketingInsight, // TODO (live mode): hasil generate dari perbandingan periode
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

  return data ?? [];
}

export async function getFiles(clientId: string): Promise<FileEntry[]> {
  if (!isSupabaseConfigured) return mockFiles;
  // TODO (live mode): turunkan dari file storage/bucket per client.
  void clientId;
  return mockFiles;
}
