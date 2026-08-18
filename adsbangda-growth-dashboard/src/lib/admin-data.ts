// Data access + mutation layer KHUSUS Admin Portal. Setiap fungsi mutasi
// memanggil requireAdmin() dulu (no-op di mode demo, cek role sungguhan di
// mode live). Di mode demo, mutasi memodifikasi array mock-data.ts di
// tempat (in-memory) supaya Admin Portal tetap terasa fungsional tanpa
// database — tapi perubahan ini HILANG setiap server restart, karena
// memang tidak ada database sungguhan yang menyimpannya.

import { isSupabaseConfigured, createClient } from "./supabase/server";
import { isServiceRoleConfigured, createAdminClient } from "./supabase/admin-client";
import { requireAdmin, getSessionUserId, getSessionRole } from "./auth";
import {
  mapClient,
  mapProject,
  mapContentItem,
  mapReportItem,
  mapFileEntry,
  mapAttentionItem,
  mapActivityEntry,
  mapDeliveryItem,
  mapPerformanceMetric,
  mapGoal,
  mapContentTarget,
  mapWebsiteActivity,
  mapApprovalHistoryEntry,
} from "./mappers";
import {
  mockClients,
  mockClient,
  mockProjects,
  mockContentCalendar,
  mockAttentionItems,
  mockActivity,
  mockFiles,
  mockReports,
  mockMonthlyDelivery,
  mockQuickStats,
  mockChannelOverview,
  mockUpcomingEvents,
  mockPerformance,
  mockSocial,
  mockWebsite,
  mockGoals,
  mockContentTargets,
  mockWebsiteActivity,
  mockApprovalHistory,
} from "./mock-data";
import type {
  Client,
  Project,
  ContentItem,
  ContentStatus,
  ContentType,
  Platform,
  ReportItem,
  FileEntry,
  AttentionItem,
  ActivityEntry,
  DeliveryIcon,
  QuickStatIcon,
  ChannelIcon,
  UserRole,
  TeamMember,
  Channel,
  PerformanceMetric,
  Goal,
  GoalStatus,
  ContentTarget,
  WebsiteActivityEntry,
  ApprovalHistoryEntry,
} from "./types";

const uid = () => crypto.randomUUID();

function isDemoClient(clientId: string) {
  return clientId === mockClient.id;
}

// ---------------------------------------------------------------------------
// CLIENTS
// ---------------------------------------------------------------------------

export async function adminListClients(): Promise<Client[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return mockClients;

  const supabase = await createClient();
  const { data } = await supabase!.from("clients").select("*").order("name");
  return (data ?? []).map(mapClient);
}

export interface ClientOverviewRow extends Client {
  services: string[];
  overallProgress: number | null;
  accountManagerName: string | null;
  lastActivity: string | null;
}

/**
 * Versi diperkaya dari adminListClients() khusus halaman /admin/clients —
 * menambahkan daftar Services aktif, Overall Progress (computed, bukan
 * manual), nama Account Manager yang di-assign, dan waktu aktivitas
 * terakhir. Dipisah dari adminListClients() supaya fungsi lama (dipakai
 * form dropdown dsb di banyak tempat) tetap ringan.
 */
export async function adminListClientsOverview(): Promise<ClientOverviewRow[]> {
  await requireAdmin();
  const clients = await adminListClients();

  const servicesOf = (c: Client) =>
    [c.socialMediaActive && "Social Media", c.metaAdsActive && "Meta Ads", c.websiteActive && "Website"].filter(Boolean) as string[];

  if (!isSupabaseConfigured) {
    return Promise.all(
      clients.map(async (c) => ({ ...c, services: servicesOf(c), overallProgress: await adminComputeOverallProgress(c.id), accountManagerName: null, lastActivity: null }))
    );
  }

  const supabase = await createClient();
  const [{ data: assignmentRows }, { data: activityRows }, users, progressByClient] = await Promise.all([
    supabase!.from("client_assignments").select("client_id, user_id"),
    supabase!.rpc("admin_client_last_activity"),
    adminListUsers(),
    Promise.all(clients.map(async (c) => [c.id, await adminComputeOverallProgress(c.id)] as const)),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));
  const accountManagerByClient = new Map<string, string>();
  for (const row of assignmentRows ?? []) {
    const user = userById.get(row.user_id);
    if (user && (user.role === "account_manager" || user.role === "admin" || user.role === "super_admin") && !accountManagerByClient.has(row.client_id)) {
      accountManagerByClient.set(row.client_id, user.fullName || user.email);
    }
  }
  const lastActivityByClient = new Map<string, string>((activityRows ?? []).map((r: Record<string, unknown>) => [r.client_id as string, r.last_activity as string]));
  const progressMap = new Map(progressByClient);

  return clients.map((c) => ({
    ...c,
    services: servicesOf(c),
    overallProgress: progressMap.get(c.id) ?? null,
    accountManagerName: accountManagerByClient.get(c.id) ?? null,
    lastActivity: lastActivityByClient.get(c.id) ?? null,
  }));
}

export async function adminGetClient(clientId: string): Promise<Client | null> {
  const clients = await adminListClients();
  return clients.find((c) => c.id === clientId) ?? null;
}

export async function adminCreateClient(input: { name: string; industry: string; status: Client["status"]; website?: string; description?: string; logoUrl?: string }) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const client: Client = { id: uid(), name: input.name, industry: input.industry, status: input.status, website: input.website ?? null, description: input.description ?? null, logoUrl: input.logoUrl ?? null };
    mockClients.push(client);
    return client;
  }

  const supabase = await createClient();
  const { data, error } = await supabase!
    .from("clients")
    .insert({ name: input.name, industry: input.industry, status: input.status, website: input.website || null, description: input.description || null, logo_url: input.logoUrl || null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapClient(data);
}

export async function adminUpdateClient(
  clientId: string,
  input: Partial<{
    name: string;
    industry: string;
    status: Client["status"];
    website: string;
    description: string;
    logoUrl: string;
    socialMediaActive: boolean;
    metaAdsActive: boolean;
    websiteActive: boolean;
  }>
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const client = mockClients.find((c) => c.id === clientId);
    if (client) {
      if (input.name !== undefined) client.name = input.name;
      if (input.industry !== undefined) client.industry = input.industry;
      if (input.status !== undefined) client.status = input.status;
      if (input.website !== undefined) client.website = input.website;
      if (input.description !== undefined) client.description = input.description;
      if (input.logoUrl !== undefined) client.logoUrl = input.logoUrl;
      if (input.socialMediaActive !== undefined) client.socialMediaActive = input.socialMediaActive;
      if (input.metaAdsActive !== undefined) client.metaAdsActive = input.metaAdsActive;
      if (input.websiteActive !== undefined) client.websiteActive = input.websiteActive;
    }
    return;
  }

  const supabase = await createClient();
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.industry !== undefined) payload.industry = input.industry;
  if (input.status !== undefined) payload.status = input.status;
  if (input.website !== undefined) payload.website = input.website;
  if (input.description !== undefined) payload.description = input.description;
  if (input.logoUrl !== undefined) payload.logo_url = input.logoUrl || null;
  if (input.socialMediaActive !== undefined) payload.social_media_active = input.socialMediaActive;
  if (input.metaAdsActive !== undefined) payload.meta_ads_active = input.metaAdsActive;
  if (input.websiteActive !== undefined) payload.website_active = input.websiteActive;
  await supabase!.from("clients").update(payload).eq("id", clientId);
}

/**
 * Hapus client SEPENUHNYA — cascade menghapus SEMUA data terkait (project,
 * content, performance, report, file, goal, dst — semua FK client_id di
 * schema pakai `on delete cascade`, lihat migration 0001/0002/0005/0006/
 * 0008). Ini tindakan permanen & tidak bisa dibatalkan.
 *
 * Guard yang sengaja dibuat ketat:
 *   1. Cuma super_admin (bukan admin biasa) — sepadan dengan besarnya
 *      dampak (menghapus seluruh riwayat kerja sama dengan satu client).
 *   2. Client HARUS berstatus "archived" dulu sebelum boleh dihapus — ini
 *      memaksa alur dua langkah yang jauh lebih aman: Archive dulu (masih
 *      bisa dibatalkan, data tetap ada, tinggal ubah status lagi kalau
 *      client itu balik lagi kerja sama), baru Delete kalau memang sudah
 *      pasti tidak akan dipakai lagi. Mencegah klik-tidak-sengaja
 *      menghapus client yang masih aktif.
 */
export async function adminDeleteClient(clientId: string) {
  const role = await getSessionRole();
  if (role !== "super_admin") throw new Error("Hanya super_admin yang boleh menghapus client secara permanen.");

  if (!isSupabaseConfigured) {
    const client = mockClients.find((c) => c.id === clientId);
    if (client && client.status !== "archived") {
      throw new Error("Archive client ini dulu sebelum dihapus permanen.");
    }
    const idx = mockClients.findIndex((c) => c.id === clientId);
    if (idx !== -1) mockClients.splice(idx, 1);
    return;
  }

  const supabase = await createClient();
  const { data: client } = await supabase!.from("clients").select("status").eq("id", clientId).single();
  if (!client || client.status !== "archived") {
    throw new Error("Archive client ini dulu sebelum dihapus permanen.");
  }

  const { error } = await supabase!.from("clients").delete().eq("id", clientId);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// MONTHLY DELIVERY
// ---------------------------------------------------------------------------

function recomputeOverallPct() {
  const items = mockMonthlyDelivery.items;
  if (items.length === 0) return 0;
  const avg = items.reduce((sum, i) => sum + (i.target > 0 ? Math.min(100, (i.completed / i.target) * 100) : 0), 0) / items.length;
  return Math.round(avg);
}

export async function adminGetDelivery(clientId: string, period: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    if (!isDemoClient(clientId)) return { meta: null, items: [] };
    const m = mockMonthlyDelivery;
    return {
      meta: {
        status: m.status,
        helper_text: m.helperText,
        period_range: m.meta.periodRange,
        last_updated: m.meta.lastUpdated,
        agreed_date: m.meta.agreedDate,
        contract_href: m.meta.contractHref,
      },
      items: m.items,
    };
  }

  const supabase = await createClient();
  const [{ data: meta }, { data: items }] = await Promise.all([
    supabase!.from("delivery_meta").select("*").eq("client_id", clientId).eq("period", period).maybeSingle(),
    supabase!.from("delivery_items").select("*").eq("client_id", clientId).eq("period", period).order("sort_order"),
  ]);
  return { meta, items: (items ?? []).map(mapDeliveryItem) };
}

export async function adminUpsertDeliveryMeta(
  clientId: string,
  period: string,
  input: { status: string; helperText: string; periodRange: string; lastUpdated: string; agreedDate: string; contractHref: string }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    if (!isDemoClient(clientId)) return;
    mockMonthlyDelivery.status = input.status as typeof mockMonthlyDelivery.status;
    mockMonthlyDelivery.helperText = input.helperText;
    mockMonthlyDelivery.meta = {
      periodRange: input.periodRange,
      lastUpdated: input.lastUpdated,
      agreedDate: input.agreedDate,
      contractHref: input.contractHref,
    };
    return;
  }

  const supabase = await createClient();
  await supabase!.from("delivery_meta").upsert(
    {
      client_id: clientId,
      period,
      status: input.status,
      helper_text: input.helperText,
      period_range: input.periodRange,
      last_updated: input.lastUpdated,
      agreed_date: input.agreedDate,
      contract_href: input.contractHref,
    },
    { onConflict: "client_id,period" }
  );
}

export async function adminAddDeliveryItem(
  clientId: string,
  period: string,
  input: { icon: DeliveryIcon; label: string; completed: number; target: number; unit: string }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    if (!isDemoClient(clientId)) return;
    mockMonthlyDelivery.items.push({ id: uid(), ...input });
    mockMonthlyDelivery.overallPct = recomputeOverallPct();
    return;
  }

  const supabase = await createClient();
  await supabase!.from("delivery_items").insert({
    client_id: clientId,
    period,
    icon: input.icon,
    label: input.label,
    completed: input.completed,
    target: input.target,
    unit: input.unit,
  });
}

export async function adminUpdateDeliveryItem(
  itemId: string,
  input: { completed: number; target: number; label: string; unit: string }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const item = mockMonthlyDelivery.items.find((i) => i.id === itemId);
    if (item) Object.assign(item, input);
    mockMonthlyDelivery.overallPct = recomputeOverallPct();
    return;
  }

  const supabase = await createClient();
  await supabase!.from("delivery_items").update(input).eq("id", itemId);
}

export async function adminDeleteDeliveryItem(itemId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const idx = mockMonthlyDelivery.items.findIndex((i) => i.id === itemId);
    if (idx >= 0) mockMonthlyDelivery.items.splice(idx, 1);
    mockMonthlyDelivery.overallPct = recomputeOverallPct();
    return;
  }

  const supabase = await createClient();
  await supabase!.from("delivery_items").delete().eq("id", itemId);
}

// ---------------------------------------------------------------------------
// CONTENT CALENDAR
// ---------------------------------------------------------------------------

export async function adminListContent(clientId: string): Promise<ContentItem[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    return isDemoClient(clientId) ? mockContentCalendar : [];
  }

  const supabase = await createClient();
  const { data } = await supabase!.from("content_items").select("*").eq("client_id", clientId).order("planned_date");
  return (data ?? []).map(mapContentItem);
}

export async function adminCreateContent(
  clientId: string,
  input: { title: string; plannedDate: string; status: ContentStatus; platform: Platform; type: ContentType }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    if (!isDemoClient(clientId)) return;
    mockContentCalendar.push({ id: uid(), clientId, ...input });
    return;
  }

  const supabase = await createClient();
  await supabase!.from("content_items").insert({
    client_id: clientId,
    title: input.title,
    planned_date: input.plannedDate,
    status: input.status,
    platform: input.platform,
    type: input.type,
  });
}

export async function adminUpdateContentStatus(itemId: string, status: ContentStatus) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const item = mockContentCalendar.find((c) => c.id === itemId);
    if (item) item.status = status;
    return;
  }

  const supabase = await createClient();
  await supabase!.from("content_items").update({ status }).eq("id", itemId);
}

/**
 * Edit PENUH satu content item — status tidak mengunci record (Published
 * tetap bisa diedit semua field-nya, sesuai prinsip "update record yang
 * sama", bukan bikin baris baru).
 */
export async function adminUpdateContentFull(
  itemId: string,
  input: Partial<{
    title: string;
    plannedDate: string;
    status: ContentStatus;
    platform: string;
    type: ContentType;
    notes: string;
    assetUrl: string;
    publishLink: string;
    approvalRequired: boolean;
    approvalStatus: "pending" | "approved" | "revision" | null;
  }>
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const item = mockContentCalendar.find((c) => c.id === itemId);
    if (item) {
      if (input.title !== undefined) item.title = input.title;
      if (input.plannedDate !== undefined) item.plannedDate = input.plannedDate;
      if (input.status !== undefined) item.status = input.status;
      if (input.platform !== undefined) item.platform = input.platform as never;
      if (input.type !== undefined) item.type = input.type;
      if (input.notes !== undefined) item.notes = input.notes;
      if (input.assetUrl !== undefined) item.assetUrl = input.assetUrl;
      if (input.publishLink !== undefined) item.publishLink = input.publishLink;
      if (input.approvalRequired !== undefined) item.approvalRequired = input.approvalRequired;
      if (input.approvalStatus !== undefined) item.approvalStatus = input.approvalStatus;
    }
    return;
  }

  const supabase = await createClient();
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.plannedDate !== undefined) payload.planned_date = input.plannedDate;
  if (input.status !== undefined) payload.status = input.status;
  if (input.platform !== undefined) payload.platform = input.platform;
  if (input.type !== undefined) payload.type = input.type;
  if (input.notes !== undefined) payload.notes = input.notes;
  if (input.assetUrl !== undefined) payload.asset_url = input.assetUrl || null;
  if (input.publishLink !== undefined) payload.publish_link = input.publishLink || null;
  if (input.approvalRequired !== undefined) payload.approval_required = input.approvalRequired;
  if (input.approvalStatus !== undefined) payload.approval_status = input.approvalStatus;
  await supabase!.from("content_items").update(payload).eq("id", itemId);
}

export async function adminDeleteContent(itemId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const idx = mockContentCalendar.findIndex((c) => c.id === itemId);
    if (idx >= 0) mockContentCalendar.splice(idx, 1);
    return;
  }

  const supabase = await createClient();
  await supabase!.from("content_items").delete().eq("id", itemId);
}

// ---------------------------------------------------------------------------
// APPROVAL HISTORY — riwayat approval TIDAK overwrite. approval_status di
// content_items tetap jadi status TERKINI; history-nya di sini.
// ---------------------------------------------------------------------------

export async function adminListApprovalHistory(contentId: string): Promise<ApprovalHistoryEntry[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return mockApprovalHistory.filter((h) => h.contentId === contentId);

  const supabase = await createClient();
  const { data } = await supabase!.from("content_approval_history").select("*").eq("content_id", contentId).order("created_at");
  return (data ?? []).map(mapApprovalHistoryEntry);
}

export async function adminAddApprovalHistory(contentId: string, input: { action: ApprovalHistoryEntry["action"]; note: string; actor: string }) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    mockApprovalHistory.push({ id: uid(), contentId, createdAt: new Date().toISOString(), ...input });
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase!
    .from("content_approval_history")
    .insert({ content_id: contentId, action: input.action, note: input.note, actor: input.actor });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// ATTENTION ITEMS
// ---------------------------------------------------------------------------

export async function adminListAttention(clientId: string): Promise<AttentionItem[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    return isDemoClient(clientId) ? mockAttentionItems : [];
  }

  const supabase = await createClient();
  const { data } = await supabase!.from("attention_items").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
  return (data ?? []).map(mapAttentionItem);
}

export async function adminCreateAttention(
  clientId: string,
  input: { icon: AttentionItem["icon"]; title: string; description: string; href: string; countBadge?: number }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    if (!isDemoClient(clientId)) return;
    mockAttentionItems.push({ id: uid(), ...input });
    return;
  }

  const supabase = await createClient();
  await supabase!.from("attention_items").insert({
    client_id: clientId,
    icon: input.icon,
    title: input.title,
    description: input.description,
    href: input.href,
    count_badge: input.countBadge ?? null,
  });
}

export async function adminResolveAttention(itemId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const idx = mockAttentionItems.findIndex((a) => a.id === itemId);
    if (idx >= 0) mockAttentionItems.splice(idx, 1);
    return;
  }

  const supabase = await createClient();
  await supabase!.from("attention_items").update({ resolved: true }).eq("id", itemId);
}

// ---------------------------------------------------------------------------
// ACTIVITY LOG
// ---------------------------------------------------------------------------

export async function adminListActivity(clientId: string): Promise<ActivityEntry[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    return isDemoClient(clientId) ? mockActivity : [];
  }

  const supabase = await createClient();
  const { data } = await supabase!.from("activity_log").select("*").eq("client_id", clientId).order("occurred_at", { ascending: false });
  return (data ?? []).map(mapActivityEntry);
}

export async function adminCreateActivity(
  clientId: string,
  input: { day: string; title: string; description: string; done: boolean }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    if (!isDemoClient(clientId)) return;
    mockActivity.unshift({ id: uid(), ...input });
    return;
  }

  const supabase = await createClient();
  await supabase!.from("activity_log").insert({
    client_id: clientId,
    day_label: input.day,
    title: input.title,
    description: input.description,
    done: input.done,
  });
}

export async function adminDeleteActivity(entryId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const idx = mockActivity.findIndex((a) => a.id === entryId);
    if (idx >= 0) mockActivity.splice(idx, 1);
    return;
  }

  const supabase = await createClient();
  await supabase!.from("activity_log").delete().eq("id", entryId);
}

// ---------------------------------------------------------------------------
// FILES & REPORTS
// ---------------------------------------------------------------------------

export async function adminListFiles(clientId: string): Promise<FileEntry[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    return isDemoClient(clientId) ? mockFiles : [];
  }

  const supabase = await createClient();
  const { data } = await supabase!.from("files").select("*").eq("client_id", clientId).order("updated_at", { ascending: false });
  return (data ?? []).map(mapFileEntry);
}

export async function adminCreateFile(clientId: string, input: { name: string; category: string; fileUrl: string; sizeLabel: string }) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    if (!isDemoClient(clientId)) return;
    mockFiles.push({ id: uid(), updatedAt: new Date().toISOString(), ...input });
    return;
  }

  const supabase = await createClient();
  await supabase!.from("files").insert({
    client_id: clientId,
    name: input.name,
    category: input.category,
    file_url: input.fileUrl,
    size_label: input.sizeLabel,
  });
}

export async function adminDeleteFile(fileId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const idx = mockFiles.findIndex((f) => f.id === fileId);
    if (idx >= 0) mockFiles.splice(idx, 1);
    return;
  }

  const supabase = await createClient();
  await supabase!.from("files").delete().eq("id", fileId);
}

export async function adminListReports(clientId: string): Promise<ReportItem[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    return isDemoClient(clientId) ? mockReports : [];
  }

  const supabase = await createClient();
  const { data } = await supabase!.from("reports").select("*").eq("client_id", clientId).order("period_month", { ascending: false });
  return (data ?? []).map(mapReportItem);
}

export async function adminCreateReport(clientId: string, input: { periodMonth: string; fileUrl: string; summary: string }) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    if (!isDemoClient(clientId)) return;
    mockReports.unshift({ id: uid(), clientId, generatedAt: new Date().toISOString(), ...input });
    return;
  }

  const supabase = await createClient();
  await supabase!.from("reports").insert({
    client_id: clientId,
    period_month: input.periodMonth,
    file_url: input.fileUrl,
    summary: input.summary,
  });
}

export async function adminDeleteReport(reportId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const idx = mockReports.findIndex((r) => r.id === reportId);
    if (idx >= 0) mockReports.splice(idx, 1);
    return;
  }

  const supabase = await createClient();
  await supabase!.from("reports").delete().eq("id", reportId);
}

// ---------------------------------------------------------------------------
// HIGHLIGHTS — Quick Stats, Channel Overview, Upcoming Events
// ---------------------------------------------------------------------------

export async function adminListHighlights(clientId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    if (!isDemoClient(clientId)) return { quickStats: [], channelOverview: [], upcomingEvents: [] };
    return { quickStats: mockQuickStats, channelOverview: mockChannelOverview, upcomingEvents: mockUpcomingEvents };
  }

  const supabase = await createClient();
  const [{ data: quickStats }, { data: channelOverview }, { data: upcomingEvents }] = await Promise.all([
    supabase!.from("quick_stats").select("*").eq("client_id", clientId).order("sort_order"),
    supabase!.from("channel_overview").select("*").eq("client_id", clientId).order("sort_order"),
    supabase!.from("upcoming_events").select("*").eq("client_id", clientId).order("event_date"),
  ]);

  return { quickStats: quickStats ?? [], channelOverview: channelOverview ?? [], upcomingEvents: upcomingEvents ?? [] };
}

export async function adminCreateQuickStat(
  clientId: string,
  input: { icon: QuickStatIcon; label: string; value: string; deltaLabel: string; deltaPositive: boolean }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    if (!isDemoClient(clientId)) return;
    mockQuickStats.push({ id: uid(), ...input });
    return;
  }

  const supabase = await createClient();
  await supabase!.from("quick_stats").insert({
    client_id: clientId,
    icon: input.icon,
    label: input.label,
    value: input.value,
    delta_label: input.deltaLabel,
    delta_positive: input.deltaPositive,
  });
}

export async function adminDeleteQuickStat(id: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const idx = mockQuickStats.findIndex((q) => q.id === id);
    if (idx >= 0) mockQuickStats.splice(idx, 1);
    return;
  }
  const supabase = await createClient();
  await supabase!.from("quick_stats").delete().eq("id", id);
}

export async function adminCreateChannelRow(
  clientId: string,
  input: { icon: ChannelIcon; label: string; metricLabel: string; value: string; deltaLabel: string; sparkline: number[] }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    if (!isDemoClient(clientId)) return;
    mockChannelOverview.push({ id: uid(), ...input });
    return;
  }

  const supabase = await createClient();
  await supabase!.from("channel_overview").insert({
    client_id: clientId,
    icon: input.icon,
    label: input.label,
    metric_label: input.metricLabel,
    value: input.value,
    delta_label: input.deltaLabel,
    sparkline: input.sparkline,
  });
}

export async function adminDeleteChannelRow(id: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const idx = mockChannelOverview.findIndex((c) => c.id === id);
    if (idx >= 0) mockChannelOverview.splice(idx, 1);
    return;
  }
  const supabase = await createClient();
  await supabase!.from("channel_overview").delete().eq("id", id);
}

export async function adminCreateUpcomingEvent(clientId: string, input: { eventDate: string; title: string; timeLabel: string }) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    if (!isDemoClient(clientId)) return;
    const d = new Date(input.eventDate);
    mockUpcomingEvents.push({
      id: uid(),
      day: String(d.getUTCDate()),
      month: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
      title: input.title,
      timeLabel: input.timeLabel,
    });
    return;
  }

  const supabase = await createClient();
  await supabase!.from("upcoming_events").insert({
    client_id: clientId,
    event_date: input.eventDate,
    title: input.title,
    time_label: input.timeLabel,
  });
}

export async function adminDeleteUpcomingEvent(id: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const idx = mockUpcomingEvents.findIndex((e) => e.id === id);
    if (idx >= 0) mockUpcomingEvents.splice(idx, 1);
    return;
  }
  const supabase = await createClient();
  await supabase!.from("upcoming_events").delete().eq("id", id);
}

// ---------------------------------------------------------------------------
// PROJECT / TASKS (dipakai halaman Projects client)
// ---------------------------------------------------------------------------

export async function adminUpdateTaskProgress(taskId: string, progressPct: number, status: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    return; // Mode demo: mockProjectTasks statis, tidak diedit lewat Admin Portal fase ini.
  }
  const supabase = await createClient();
  await supabase!.from("project_tasks").update({ progress_pct: progressPct, status }).eq("id", taskId);
}

// ---------------------------------------------------------------------------
// TEAM — role & akses client per user (khusus mode live, lewat fungsi RPC aman)
// ---------------------------------------------------------------------------

export interface AdminUserRow {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  createdAt: string;
}

export interface ClientAccessRow {
  userId: string;
  email: string;
  clientId: string;
  clientName: string;
  accessRole: string;
}

export const canCreateUsersDirectly = isServiceRoleConfigured;

/**
 * Membuat akun user LANGSUNG dari Admin Portal (agency yang pegang email +
 * password-nya, client tidak perlu mendaftar sendiri lewat /login). Ini
 * operasi privileged — butuh SUPABASE_SERVICE_ROLE_KEY (lihat
 * lib/supabase/admin-client.ts). Kalau env itu belum diisi, lempar error
 * yang jelas supaya UI bisa kasih tahu alternatifnya (self-signup + hubungkan).
 *
 * Email langsung ditandai terverifikasi (email_confirm: true) supaya bisa
 * langsung login tanpa perlu klik link konfirmasi — masuk akal karena
 * agency sendiri yang membuat & memverifikasi identitas client-nya.
 */
export async function adminCreateUser(input: {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  clientId?: string;
}) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    throw new Error("Butuh Supabase live untuk membuat user — di mode demo tidak ada sistem auth sungguhan.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });
  if (error) throw new Error(error.message);

  const userId = data.user.id;

  // Trigger handle_new_user (migration 0002) sudah otomatis bikin baris
  // profiles dengan role 'client' — di sini kita sesuaikan kalau perlu jadi
  // role lain (super_admin/admin/account_manager/creative), dan hubungkan
  // ke client kalau diminta, lewat RPC yang sama dengan yang dipakai
  // halaman Team & Akses. Catatan: admin_set_role() di DB menolak assign
  // super_admin/admin kecuali pemanggilnya sendiri super_admin (guard
  // privilege-escalation, lihat migration 0004).
  const supabase = await createClient();
  if (input.role !== "client") {
    const { error: roleError } = await supabase!.rpc("admin_set_role", { target_user_id: userId, new_role: input.role });
    if (roleError) throw new Error(roleError.message);
  } else if (input.clientId) {
    const { error: assignError } = await supabase!.rpc("admin_assign_client", {
      target_user_id: userId,
      target_client_id: input.clientId,
    });
    if (assignError) throw new Error(assignError.message);
  }

  return { id: userId };
}

/**
 * Hapus user sepenuhnya dari sistem — auth.users lewat Admin API (butuh
 * service role, sama seperti adminCreateUser), dan baris profiles +
 * client_users ikut terhapus otomatis lewat `on delete cascade` (lihat
 * migration 0001 & 0002) — tidak perlu query cleanup manual.
 *
 * Guard tambahan di luar requireAdmin():
 *   1. Tidak bisa hapus akun sendiri (mencegah admin mengunci dirinya
 *      sendiri dari Admin Portal tanpa sadar).
 *   2. Kalau target-nya super_admin/admin, pemanggil harus super_admin —
 *      cermin dari guard privilege-escalation yang sama di admin_set_role()
 *      (migration 0004), supaya admin biasa tidak bisa menghapus admin lain.
 */
export async function adminDeleteUser(userId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    throw new Error("Butuh Supabase live untuk menghapus user — di mode demo tidak ada sistem auth sungguhan.");
  }
  if (!isServiceRoleConfigured()) {
    throw new Error(
      "Butuh SUPABASE_SERVICE_ROLE_KEY untuk menghapus user langsung dari Admin Portal (lihat .env.example)."
    );
  }

  const currentUserId = await getSessionUserId();
  if (currentUserId === userId) {
    throw new Error("Tidak bisa menghapus akun yang sedang kamu pakai sendiri.");
  }

  const supabase = await createClient();
  const { data: targetProfile } = await supabase!.from("profiles").select("role").eq("id", userId).single();
  const targetRole = (targetProfile?.role as UserRole | undefined) ?? "client";

  if ((targetRole === "super_admin" || targetRole === "admin")) {
    const callerRole = await getSessionRole();
    if (callerRole !== "super_admin") {
      throw new Error("Hanya super_admin yang boleh menghapus akun admin-tier.");
    }
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
}

export async function adminListUsers(): Promise<AdminUserRow[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase!.rpc("admin_list_users");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    email: r.email as string,
    role: r.role as UserRole,
    fullName: (r.full_name as string | null) ?? null,
    createdAt: r.created_at as string,
  }));}

export async function adminListClientAccess(): Promise<ClientAccessRow[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase!.rpc("admin_list_client_access");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: Record<string, unknown>) => ({
    userId: r.user_id as string,
    email: r.email as string,
    clientId: r.client_id as string,
    clientName: r.client_name as string,
    accessRole: r.access_role as string,
  }));
}

export async function adminSetRole(userId: string, role: UserRole) {
  await requireAdmin();
  if (!isSupabaseConfigured) return;
  const supabase = await createClient();
  const { error } = await supabase!.rpc("admin_set_role", { target_user_id: userId, new_role: role });
  if (error) throw new Error(error.message);
}

export async function adminAssignClient(userId: string, clientId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) return;
  const supabase = await createClient();
  const { error } = await supabase!.rpc("admin_assign_client", { target_user_id: userId, target_client_id: clientId });
  if (error) throw new Error(error.message);
}

export async function adminUnassignClient(userId: string, clientId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) return;
  const supabase = await createClient();
  const { error } = await supabase!.rpc("admin_unassign_client", { target_user_id: userId, target_client_id: clientId });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// PROJECTS (Phase 2 — Admin Client + Project Management)
// ---------------------------------------------------------------------------

export async function adminListProjectsByClient(clientId: string): Promise<Project[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return mockProjects.filter((p) => p.clientId === clientId);

  const supabase = await createClient();
  const { data } = await supabase!.from("projects").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
  return (data ?? []).map(mapProject);
}

export async function adminGetProject(projectId: string): Promise<Project | null> {
  await requireAdmin();
  if (!isSupabaseConfigured) return mockProjects.find((p) => p.id === projectId) ?? null;

  const supabase = await createClient();
  const { data } = await supabase!.from("projects").select("*").eq("id", projectId).maybeSingle();
  return data ? mapProject(data) : null;
}

export async function adminCreateProject(
  clientId: string,
  input: { name: string; type: string; description?: string; startDate: string; endDate: string; stage: NonNullable<Project["stage"]> }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const project: Project = {
      id: uid(),
      clientId,
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      status: "on_track",
      stage: input.stage,
      type: input.type,
      description: input.description ?? null,
      progressPct: 0,
    };
    mockProjects.push(project);
    return project;
  }

  const supabase = await createClient();
  const { data, error } = await supabase!
    .from("projects")
    .insert({
      client_id: clientId,
      name: input.name,
      type: input.type,
      description: input.description || null,
      start_date: input.startDate,
      end_date: input.endDate,
      stage: input.stage,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapProject(data);
}

export async function adminUpdateProject(
  projectId: string,
  input: Partial<{ name: string; type: string; description: string; startDate: string; endDate: string; stage: NonNullable<Project["stage"]>; progressPct: number }>
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const project = mockProjects.find((p) => p.id === projectId);
    if (project) {
      if (input.name !== undefined) project.name = input.name;
      if (input.type !== undefined) project.type = input.type;
      if (input.description !== undefined) project.description = input.description;
      if (input.startDate !== undefined) project.startDate = input.startDate;
      if (input.endDate !== undefined) project.endDate = input.endDate;
      if (input.stage !== undefined) project.stage = input.stage;
      if (input.progressPct !== undefined) project.progressPct = input.progressPct;
    }
    return;
  }

  const supabase = await createClient();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) payload.name = input.name;
  if (input.type !== undefined) payload.type = input.type;
  if (input.description !== undefined) payload.description = input.description;
  if (input.startDate !== undefined) payload.start_date = input.startDate;
  if (input.endDate !== undefined) payload.end_date = input.endDate;
  if (input.stage !== undefined) payload.stage = input.stage;
  if (input.progressPct !== undefined) payload.progress_pct = input.progressPct;
  await supabase!.from("projects").update(payload).eq("id", projectId);
}

export async function adminArchiveProject(projectId: string) {
  return adminUpdateProject(projectId, { stage: "archived" });
}

// ---------------------------------------------------------------------------
// TEAM ASSIGNMENT (Phase 2) — client_assignments & project_assignments.
// Role user TIDAK disimpan dobel di sini; selalu dibaca live dari
// profiles.role lewat adminListUsers(), supaya satu-satunya sumber
// kebenaran role tetap tabel profiles. Validasi role (Account Manager
// hanya boleh role account_manager, dst) dilakukan di dua lapis: di sini
// (pesan error cepat & jelas) DAN di trigger database (migration 0005) —
// jadi tetap aman meski ada jalur lain yang insert langsung ke tabel ini.
// ---------------------------------------------------------------------------

/** Staff yang boleh dipilih sebagai Account Manager (client_assignments). */
export async function adminListAccountManagerCandidates(): Promise<TeamMember[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return [];
  const users = await adminListUsers();
  return users.filter((u) => u.role === "account_manager" || u.role === "admin" || u.role === "super_admin");
}

/** Staff yang boleh dipilih sebagai Creative (project_assignments). */
export async function adminListCreativeCandidates(): Promise<TeamMember[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return [];
  const users = await adminListUsers();
  return users.filter((u) => u.role === "creative" || u.role === "admin" || u.role === "super_admin");
}

export async function adminListClientTeam(clientId: string): Promise<TeamMember[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const [{ data: rows }, users] = await Promise.all([
    supabase!.from("client_assignments").select("user_id").eq("client_id", clientId),
    adminListUsers(),
  ]);
  const userById = new Map(users.map((u) => [u.id, u]));
  return (rows ?? [])
    .map((r) => userById.get(r.user_id))
    .filter((u): u is (typeof users)[number] => !!u)
    .map((u) => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role }));
}

export async function adminAssignToClient(clientId: string, userId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) return;

  const users = await adminListUsers();
  const target = users.find((u) => u.id === userId);
  if (!target || !["account_manager", "admin", "super_admin"].includes(target.role)) {
    throw new Error("User ini bukan Account Manager/Admin — tidak bisa di-assign ke client.");
  }

  const supabase = await createClient();
  const { error } = await supabase!.from("client_assignments").upsert({ client_id: clientId, user_id: userId }, { onConflict: "client_id,user_id" });
  if (error) throw new Error(error.message);
}

export async function adminUnassignFromClient(clientId: string, userId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) return;
  const supabase = await createClient();
  await supabase!.from("client_assignments").delete().eq("client_id", clientId).eq("user_id", userId);
}

export async function adminListProjectTeam(projectId: string): Promise<TeamMember[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const [{ data: rows }, users] = await Promise.all([
    supabase!.from("project_assignments").select("user_id").eq("project_id", projectId),
    adminListUsers(),
  ]);
  const userById = new Map(users.map((u) => [u.id, u]));
  return (rows ?? [])
    .map((r) => userById.get(r.user_id))
    .filter((u): u is (typeof users)[number] => !!u)
    .map((u) => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role }));
}

export async function adminAssignToProject(projectId: string, userId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) return;

  const users = await adminListUsers();
  const target = users.find((u) => u.id === userId);
  if (!target || !["account_manager", "creative", "admin", "super_admin"].includes(target.role)) {
    throw new Error("User ini tidak punya role staff yang valid — tidak bisa di-assign ke project.");
  }

  const supabase = await createClient();
  const { error } = await supabase!.from("project_assignments").upsert({ project_id: projectId, user_id: userId }, { onConflict: "project_id,user_id" });
  if (error) throw new Error(error.message);
}

export async function adminUnassignFromProject(projectId: string, userId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) return;
  const supabase = await createClient();
  await supabase!.from("project_assignments").delete().eq("project_id", projectId).eq("user_id", userId);
}

// ---------------------------------------------------------------------------
// PERFORMANCE METRICS (Phase 3A) — Social Media & Meta Ads.
// REUSE tabel `performance_metrics` yang sudah ada sejak migration 0001
// (dibaca Client Portal lewat lib/data.ts) — TIDAK ada tabel baru, cuma
// fungsi tulis yang sebelumnya belum ada (README lama: "masih perlu diisi
// lewat SQL/Table editor Supabase langsung"). Sengaja generik per `channel`
// supaya satu set fungsi ini melayani baik tab Social Media (channel=social)
// maupun Meta Ads (channel=meta_ads) — struktur yang sama juga yang nanti
// dipakai kalau datanya diisi otomatis lewat API, bukan manual lagi.
// ---------------------------------------------------------------------------

function mockArrayForChannel(channel: Channel) {
  if (channel === "meta_ads") return mockPerformance;
  if (channel === "social") return mockSocial;
  return mockWebsite;
}

/**
 * CPC & CPL DIHITUNG OTOMATIS dari spend/clicks/leads — admin tidak perlu
 * (dan tidak boleh) mengetik angka yang sebenarnya bisa dihitung dari data
 * lain. Kalau clicks/leads 0 atau kosong, hasilnya undefined (bukan 0/Infinity).
 */
function computeMetaAdsDerived(input: { spend?: number; clicks?: number; leads?: number }) {
  const cpc = input.spend && input.clicks ? Math.round(input.spend / input.clicks) : undefined;
  const cpl = input.spend && input.leads ? Math.round(input.spend / input.leads) : undefined;
  return { cpc, cpl };
}

export async function adminListPerformanceMetrics(clientId: string, channel: Channel, platform?: string): Promise<PerformanceMetric[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    return mockArrayForChannel(channel).filter((m) => m.clientId === clientId && (!platform || m.platform === platform));
  }

  const supabase = await createClient();
  let query = supabase!.from("performance_metrics").select("*").eq("client_id", clientId).eq("channel", channel);
  if (platform) query = query.eq("platform", platform);
  const { data } = await query.order("date", { ascending: false });
  return (data ?? []).map(mapPerformanceMetric);
}

export async function adminCreatePerformanceMetric(
  clientId: string,
  channel: Channel,
  input: Partial<Omit<PerformanceMetric, "id" | "clientId" | "channel">> & { date: string }
) {
  await requireAdmin();
  const derived = channel === "meta_ads" ? computeMetaAdsDerived(input) : { cpc: undefined, cpl: undefined };
  const cpc = derived.cpc ?? input.cpc;
  const costPerLead = derived.cpl ?? input.costPerLead;

  if (!isSupabaseConfigured) {
    const metric: PerformanceMetric = { id: uid(), clientId, channel, ...input, cpc, costPerLead };
    mockArrayForChannel(channel).push(metric);
    return metric;
  }

  const supabase = await createClient();
  const { data, error } = await supabase!
    .from("performance_metrics")
    .insert({
      client_id: clientId,
      channel,
      date: input.date,
      platform: input.platform ?? null,
      spend: input.spend ?? null,
      reach: input.reach ?? null,
      impressions: input.impressions ?? null,
      clicks: input.clicks ?? null,
      leads: input.leads ?? null,
      cost_per_lead: costPerLead ?? null,
      followers: input.followers ?? null,
      engagement_rate: input.engagementRate ?? null,
      visitors: input.visitors ?? null,
      conversions: input.conversions ?? null,
      page_views: input.pageViews ?? null,
      sessions: input.sessions ?? null,
      bounce_rate: input.bounceRate ?? null,
      avg_session_duration: input.avgSessionDuration ?? null,
      ctr: input.ctr ?? null,
      cpc: cpc ?? null,
      roas: input.roas ?? null,
      target_leads: input.targetLeads ?? null,
      closing: input.closing ?? null,
      conversion_rate: input.leads && input.closing ? Math.round((input.closing / input.leads) * 1000) / 10 : null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapPerformanceMetric(data);
}

export async function adminUpdatePerformanceMetric(
  id: string,
  channel: Channel,
  input: Partial<Omit<PerformanceMetric, "id" | "clientId" | "channel">>
) {
  await requireAdmin();
  const derived = channel === "meta_ads" ? computeMetaAdsDerived(input) : { cpc: undefined, cpl: undefined };
  const cpc = derived.cpc ?? input.cpc;
  const costPerLead = derived.cpl ?? input.costPerLead;
  const conversionRate = input.leads && input.closing ? Math.round((input.closing / input.leads) * 1000) / 10 : undefined;

  if (!isSupabaseConfigured) {
    const arr = mockArrayForChannel(channel);
    const metric = arr.find((m) => m.id === id);
    if (metric) Object.assign(metric, input, { cpc, costPerLead, conversionRate });
    return;
  }

  const supabase = await createClient();
  const payload: Record<string, unknown> = {};
  if (input.date !== undefined) payload.date = input.date;
  if (input.platform !== undefined) payload.platform = input.platform;
  if (input.spend !== undefined) payload.spend = input.spend;
  if (input.reach !== undefined) payload.reach = input.reach;
  if (input.impressions !== undefined) payload.impressions = input.impressions;
  if (input.clicks !== undefined) payload.clicks = input.clicks;
  if (input.leads !== undefined) payload.leads = input.leads;
  if (costPerLead !== undefined) payload.cost_per_lead = costPerLead;
  if (input.followers !== undefined) payload.followers = input.followers;
  if (input.engagementRate !== undefined) payload.engagement_rate = input.engagementRate;
  if (input.visitors !== undefined) payload.visitors = input.visitors;
  if (input.conversions !== undefined) payload.conversions = input.conversions;
  if (input.pageViews !== undefined) payload.page_views = input.pageViews;
  if (input.sessions !== undefined) payload.sessions = input.sessions;
  if (input.bounceRate !== undefined) payload.bounce_rate = input.bounceRate;
  if (input.avgSessionDuration !== undefined) payload.avg_session_duration = input.avgSessionDuration;
  if (input.ctr !== undefined) payload.ctr = input.ctr;
  if (cpc !== undefined) payload.cpc = cpc;
  if (input.roas !== undefined) payload.roas = input.roas;
  if (input.targetLeads !== undefined) payload.target_leads = input.targetLeads;
  if (input.closing !== undefined) payload.closing = input.closing;
  if (conversionRate !== undefined) payload.conversion_rate = conversionRate;
  await supabase!.from("performance_metrics").update(payload).eq("id", id);
}

export async function adminDeletePerformanceMetric(id: string, channel: Channel) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const arr = mockArrayForChannel(channel);
    const idx = arr.findIndex((m) => m.id === id);
    if (idx >= 0) arr.splice(idx, 1);
    return;
  }
  const supabase = await createClient();
  await supabase!.from("performance_metrics").delete().eq("id", id);
}

// ---------------------------------------------------------------------------
// GOALS (Phase 3A) — target & pencapaian client. `actual` untuk sekarang
// diisi manual oleh admin; disiapkan supaya bisa dihitung otomatis dari
// modul lain (Content/Meta Ads) di fase berikutnya tanpa migrasi ulang
// skema (kolom label/target/actual/unit/period sudah generik).
// ---------------------------------------------------------------------------

export async function adminListGoals(clientId: string): Promise<Goal[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return mockGoals.filter((g) => g.clientId === clientId);

  const supabase = await createClient();
  const { data } = await supabase!.from("client_goals").select("*").eq("client_id", clientId).order("created_at");
  return (data ?? []).map(mapGoal);
}

export async function adminCreateGoal(
  clientId: string,
  input: { label: string; description?: string; target: number; actual: number; unit: string; period: string; status: GoalStatus }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const goal: Goal = { id: uid(), clientId, description: input.description ?? null, notes: null, ...input };
    mockGoals.push(goal);
    return goal;
  }

  const supabase = await createClient();
  const { data, error } = await supabase!
    .from("client_goals")
    .insert({
      client_id: clientId,
      label: input.label,
      description: input.description || null,
      target: input.target,
      actual: input.actual,
      unit: input.unit,
      period: input.period,
      status: input.status,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapGoal(data);
}

export async function adminUpdateGoal(
  goalId: string,
  input: Partial<{ actual: number; status: GoalStatus; notes: string; description: string }>
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const goal = mockGoals.find((g) => g.id === goalId);
    if (goal) {
      if (input.actual !== undefined) goal.actual = input.actual;
      if (input.status !== undefined) goal.status = input.status;
      if (input.notes !== undefined) goal.notes = input.notes;
      if (input.description !== undefined) goal.description = input.description;
    }
    return;
  }
  const supabase = await createClient();
  await supabase!.from("client_goals").update(input).eq("id", goalId);
}

export async function adminDeleteGoal(goalId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const idx = mockGoals.findIndex((g) => g.id === goalId);
    if (idx >= 0) mockGoals.splice(idx, 1);
    return;
  }
  const supabase = await createClient();
  await supabase!.from("client_goals").delete().eq("id", goalId);
}

// ---------------------------------------------------------------------------
// OVERALL PROGRESS (Final Workflow Refactor) — dihitung dari SERVICE AKTIF
// yang PUNYA DATA saja, bukan input manual. Dipakai bareng oleh Client List
// dan Overview supaya angkanya selalu konsisten (satu sumber kebenaran).
// ---------------------------------------------------------------------------

export async function adminComputeOverallProgress(clientId: string): Promise<number | null> {
  const client = await adminGetClient(clientId);
  if (!client) return null;
  const period = currentPeriodInternal();
  const parts: number[] = [];

  if (client.socialMediaActive) {
    const [targets, content] = await Promise.all([adminListContentTargets(clientId, period), adminListContent(clientId)]);
    const totalTarget = targets.reduce((sum, t) => sum + t.target, 0);
    if (totalTarget > 0) {
      const published = content.filter((c) => c.status === "published").length;
      parts.push(Math.min(100, Math.round((published / totalTarget) * 100)));
    }
  }

  if (client.metaAdsActive) {
    const metrics = await adminListPerformanceMetrics(clientId, "meta_ads");
    const latest = metrics[0];
    if (latest?.targetLeads && latest.targetLeads > 0 && latest.leads != null) {
      parts.push(Math.min(100, Math.round((latest.leads / latest.targetLeads) * 100)));
    }
  }

  if (parts.length === 0) return null; // tidak ada module aktif yang punya target+data — jangan tampilkan angka palsu
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

function currentPeriodInternal() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// CONTENT TARGETS (Consolidation) — target kontrak per client+period+
// platform+content_type. Dipakai modul Social Media (Content Delivery) untuk
// hitung progress delivered/target — TIDAK ada tabel baru di sini, hanya
// akses ke `content_targets` (migration 0008).
// ---------------------------------------------------------------------------

export async function adminListContentTargets(clientId: string, period: string): Promise<ContentTarget[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return mockContentTargets.filter((t) => t.clientId === clientId && t.period === period);

  const supabase = await createClient();
  const { data } = await supabase!.from("content_targets").select("*").eq("client_id", clientId).eq("period", period);
  return (data ?? []).map(mapContentTarget);
}

export async function adminUpsertContentTarget(
  clientId: string,
  input: { period: string; platform: string; contentType: string; target: number }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const existing = mockContentTargets.find(
      (t) => t.clientId === clientId && t.period === input.period && t.platform === input.platform && t.contentType === input.contentType
    );
    if (existing) {
      existing.target = input.target;
    } else {
      mockContentTargets.push({ id: uid(), clientId, period: input.period, platform: input.platform as never, contentType: input.contentType, target: input.target });
    }
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase!.from("content_targets").upsert(
    { client_id: clientId, period: input.period, platform: input.platform, content_type: input.contentType, target: input.target },
    { onConflict: "client_id,period,platform,content_type" }
  );
  if (error) throw new Error(error.message);
}

export async function adminUpdateContentTargetById(targetId: string, input: { platform: string; contentType: string; target: number }) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const t = mockContentTargets.find((t) => t.id === targetId);
    if (t) {
      t.platform = input.platform as never;
      t.contentType = input.contentType;
      t.target = input.target;
    }
    return;
  }
  const supabase = await createClient();
  await supabase!.from("content_targets").update({ platform: input.platform, content_type: input.contentType, target: input.target }).eq("id", targetId);
}

export async function adminDeleteContentTarget(targetId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const idx = mockContentTargets.findIndex((t) => t.id === targetId);
    if (idx >= 0) mockContentTargets.splice(idx, 1);
    return;
  }
  const supabase = await createClient();
  await supabase!.from("content_targets").delete().eq("id", targetId);
}

// ---------------------------------------------------------------------------
// WEBSITE ACTIVITY (Consolidation) — activity feed khusus modul Website.
// ---------------------------------------------------------------------------

export async function adminListWebsiteActivity(clientId: string): Promise<WebsiteActivityEntry[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return mockWebsiteActivity.filter((a) => a.clientId === clientId);

  const supabase = await createClient();
  const { data } = await supabase!.from("website_activity").select("*").eq("client_id", clientId).order("activity_date", { ascending: false });
  return (data ?? []).map(mapWebsiteActivity);
}

export async function adminCreateWebsiteActivity(clientId: string, input: { date: string; title: string; description: string; status: WebsiteActivityEntry["status"] }) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const entry: WebsiteActivityEntry = { id: uid(), clientId, ...input };
    mockWebsiteActivity.unshift(entry);
    return entry;
  }

  const supabase = await createClient();
  const { error } = await supabase!
    .from("website_activity")
    .insert({ client_id: clientId, activity_date: input.date, title: input.title, description: input.description, status: input.status });
  if (error) throw new Error(error.message);
}

export async function adminUpdateWebsiteActivity(activityId: string, input: Partial<{ date: string; title: string; description: string; status: WebsiteActivityEntry["status"] }>) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const entry = mockWebsiteActivity.find((a) => a.id === activityId);
    if (entry) {
      if (input.date !== undefined) entry.date = input.date;
      if (input.title !== undefined) entry.title = input.title;
      if (input.description !== undefined) entry.description = input.description;
      if (input.status !== undefined) entry.status = input.status;
    }
    return;
  }
  const supabase = await createClient();
  const payload: Record<string, unknown> = {};
  if (input.date !== undefined) payload.activity_date = input.date;
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.status !== undefined) payload.status = input.status;
  await supabase!.from("website_activity").update(payload).eq("id", activityId);
}

export async function adminDeleteWebsiteActivity(activityId: string) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const idx = mockWebsiteActivity.findIndex((a) => a.id === activityId);
    if (idx >= 0) mockWebsiteActivity.splice(idx, 1);
    return;
  }
  const supabase = await createClient();
  await supabase!.from("website_activity").delete().eq("id", activityId);
}

// ---------------------------------------------------------------------------
// CONTENT ITEM — perluasan input (Consolidation): asset/publish link/approval.
// Fungsi lama adminCreateContent() tetap ada (dipakai halaman lama) — ini
// versi baru yang dipakai form Content Entry konsolidasi di Social Media.
// ---------------------------------------------------------------------------

export async function adminCreateContentFull(
  clientId: string,
  input: {
    title: string;
    plannedDate: string;
    status: ContentStatus;
    platform: string;
    type: ContentType;
    assetUrl?: string;
    publishLink?: string;
    approvalRequired: boolean;
    approvalStatus?: "pending" | "approved" | "revision" | null;
  }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    mockContentCalendar.push({
      id: uid(),
      clientId,
      title: input.title,
      plannedDate: input.plannedDate,
      status: input.status,
      platform: input.platform as never,
      type: input.type,
      assetUrl: input.assetUrl ?? null,
      publishLink: input.publishLink ?? null,
      approvalRequired: input.approvalRequired,
      approvalStatus: input.approvalStatus ?? null,
    });
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase!.from("content_items").insert({
    client_id: clientId,
    title: input.title,
    planned_date: input.plannedDate,
    status: input.status,
    platform: input.platform,
    type: input.type,
    asset_url: input.assetUrl || null,
    publish_link: input.publishLink || null,
    approval_required: input.approvalRequired,
    approval_status: input.approvalRequired ? (input.approvalStatus ?? "pending") : null,
  });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// NOTIFICATIONS (Final Workflow Refactor) — dari EVENT DATABASE NYATA, bukan
// tabel notification terpisah/fake. "Butuh perhatian admin" = client sudah
// Request Revision (approval_status='revision') dan admin belum resubmit.
// ---------------------------------------------------------------------------

export async function adminCountPendingRevisions(): Promise<number> {
  await requireAdmin();
  if (!isSupabaseConfigured) return mockContentCalendar.filter((c) => c.approvalStatus === "revision").length;

  const supabase = await createClient();
  const { count } = await supabase!.from("content_items").select("id", { count: "exact", head: true }).eq("approval_status", "revision");
  return count ?? 0;
}
