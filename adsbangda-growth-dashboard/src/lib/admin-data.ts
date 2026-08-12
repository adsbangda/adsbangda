// Data access + mutation layer KHUSUS Admin Portal. Setiap fungsi mutasi
// memanggil requireAdmin() dulu (no-op di mode demo, cek role sungguhan di
// mode live). Di mode demo, mutasi memodifikasi array mock-data.ts di
// tempat (in-memory) supaya Admin Portal tetap terasa fungsional tanpa
// database — tapi perubahan ini HILANG setiap server restart, karena
// memang tidak ada database sungguhan yang menyimpannya.

import { isSupabaseConfigured, createClient } from "./supabase/server";
import { isServiceRoleConfigured, createAdminClient } from "./supabase/admin-client";
import { requireAdmin } from "./auth";
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
  activeProjectCount: number;
  accountManagerName: string | null;
  lastActivity: string | null;
}

/**
 * Versi diperkaya dari adminListClients() khusus halaman /admin/clients —
 * menambahkan jumlah project aktif, nama Account Manager yang di-assign,
 * dan waktu aktivitas terakhir. Dipisah dari adminListClients() supaya
 * fungsi lama (dipakai form dropdown dsb di banyak tempat) tetap ringan.
 */
export async function adminListClientsOverview(): Promise<ClientOverviewRow[]> {
  await requireAdmin();
  const clients = await adminListClients();

  if (!isSupabaseConfigured) {
    return clients.map((c) => ({ ...c, activeProjectCount: mockProjects.filter((p) => p.clientId === c.id).length, accountManagerName: null, lastActivity: null }));
  }

  const supabase = await createClient();
  const [{ data: projectRows }, { data: assignmentRows }, { data: activityRows }, users] = await Promise.all([
    supabase!.from("projects").select("client_id, stage"),
    supabase!.from("client_assignments").select("client_id, user_id"),
    supabase!.rpc("admin_client_last_activity"),
    adminListUsers(),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));
  const activeProjectCountByClient = new Map<string, number>();
  for (const row of projectRows ?? []) {
    if (row.stage === "active") {
      activeProjectCountByClient.set(row.client_id, (activeProjectCountByClient.get(row.client_id) ?? 0) + 1);
    }
  }
  const accountManagerByClient = new Map<string, string>();
  for (const row of assignmentRows ?? []) {
    const user = userById.get(row.user_id);
    if (user && (user.role === "account_manager" || user.role === "admin" || user.role === "super_admin") && !accountManagerByClient.has(row.client_id)) {
      accountManagerByClient.set(row.client_id, user.fullName || user.email);
    }
  }
  const lastActivityByClient = new Map<string, string>((activityRows ?? []).map((r: Record<string, unknown>) => [r.client_id as string, r.last_activity as string]));

  return clients.map((c) => ({
    ...c,
    activeProjectCount: activeProjectCountByClient.get(c.id) ?? 0,
    accountManagerName: accountManagerByClient.get(c.id) ?? null,
    lastActivity: lastActivityByClient.get(c.id) ?? null,
  }));
}

export async function adminGetClient(clientId: string): Promise<Client | null> {
  const clients = await adminListClients();
  return clients.find((c) => c.id === clientId) ?? null;
}

export async function adminCreateClient(input: { name: string; industry: string; status: Client["status"]; website?: string; description?: string }) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const client: Client = { id: uid(), name: input.name, industry: input.industry, status: input.status, website: input.website ?? null, description: input.description ?? null };
    mockClients.push(client);
    return client;
  }

  const supabase = await createClient();
  const { data, error } = await supabase!
    .from("clients")
    .insert({ name: input.name, industry: input.industry, status: input.status, website: input.website || null, description: input.description || null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapClient(data);
}

export async function adminUpdateClient(
  clientId: string,
  input: Partial<{ name: string; industry: string; status: Client["status"]; website: string; description: string }>
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const client = mockClients.find((c) => c.id === clientId);
    if (client) Object.assign(client, input);
    return;
  }

  const supabase = await createClient();
  await supabase!.from("clients").update(input).eq("id", clientId);
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

export async function adminListPerformanceMetrics(clientId: string, channel: Channel): Promise<PerformanceMetric[]> {
  await requireAdmin();
  if (!isSupabaseConfigured) return mockArrayForChannel(channel).filter((m) => m.clientId === clientId);

  const supabase = await createClient();
  const { data } = await supabase!
    .from("performance_metrics")
    .select("*")
    .eq("client_id", clientId)
    .eq("channel", channel)
    .order("date", { ascending: false });
  return (data ?? []).map(mapPerformanceMetric);
}

export async function adminCreatePerformanceMetric(
  clientId: string,
  channel: Channel,
  input: Partial<Omit<PerformanceMetric, "id" | "clientId" | "channel">> & { date: string }
) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const metric: PerformanceMetric = { id: uid(), clientId, channel, ...input };
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
      spend: input.spend ?? null,
      reach: input.reach ?? null,
      impressions: input.impressions ?? null,
      clicks: input.clicks ?? null,
      leads: input.leads ?? null,
      cost_per_lead: input.costPerLead ?? null,
      followers: input.followers ?? null,
      engagement_rate: input.engagementRate ?? null,
      visitors: input.visitors ?? null,
      conversions: input.conversions ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapPerformanceMetric(data);
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
