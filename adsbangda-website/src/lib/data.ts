// Data access layer — satu-satunya tempat komponen boleh mengambil data.
//
// Kenapa dipisah begini: MVP ini jalan dulu di "mode demo" (data dari
// mock-data.ts) supaya bisa langsung di-review tanpa perlu setup Supabase.
// Begitu project Supabase sungguhan sudah dibuat & env di-isi
// (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY), fungsi di
// bawah otomatis pindah ke query database asli — komponen halaman TIDAK
// perlu diubah sama sekali.
//
// Setiap fungsi query Supabase difilter oleh RLS policy di database
// (lihat supabase/migrations/0001_init.sql) berdasarkan client_id user
// yang sedang login, jadi isolasi data antar-client dijamin di level DB.

import { isSupabaseConfigured, createClient } from "./supabase/server";
import {
  mockClient,
  mockProjects,
  mockProjectTasks,
  mockUpcomingTasks,
  mockPerformance,
  mockSocial,
  mockWebsite,
  mockTopContent,
  mockContentCalendar,
  mockReports,
} from "./mock-data";
import type { Client, Project, ProjectTask, ContentItem, ReportItem } from "./types";

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
    .eq("status", "active")
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

export async function getUpcomingTasks() {
  if (!isSupabaseConfigured) return mockUpcomingTasks;
  // TODO (live mode): tabel task terpisah untuk to-do client, atau
  // turunan dari project_tasks yang statusnya "waiting"/"in_progress"
  // dengan due date terdekat.
  return mockUpcomingTasks;
}

export async function getPerformanceSummary(clientId: string) {
  if (!isSupabaseConfigured) {
    return { metaAds: mockPerformance, social: mockSocial, website: mockWebsite, topContent: mockTopContent };
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
