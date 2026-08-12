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
  mapContentItem,
  mapReportItem,
  mapFileEntry,
  mapAttentionItem,
  mapActivityEntry,
  mapDeliveryItem,
} from "./mappers";
import {
  mockClients,
  mockClient,
  mockContentCalendar,
  mockAttentionItems,
  mockActivity,
  mockFiles,
  mockReports,
  mockMonthlyDelivery,
  mockQuickStats,
  mockChannelOverview,
  mockUpcomingEvents,
} from "./mock-data";
import type {
  Client,
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
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    logoUrl: (row.logo_url as string | null) ?? null,
    industry: row.industry as string,
    status: row.status as Client["status"],
  }));
}

export async function adminGetClient(clientId: string): Promise<Client | null> {
  const clients = await adminListClients();
  return clients.find((c) => c.id === clientId) ?? null;
}

export async function adminCreateClient(input: { name: string; industry: string; status: Client["status"] }) {
  await requireAdmin();
  if (!isSupabaseConfigured) {
    const client: Client = { id: uid(), name: input.name, industry: input.industry, status: input.status };
    mockClients.push(client);
    return client;
  }

  const supabase = await createClient();
  const { data, error } = await supabase!
    .from("clients")
    .insert({ name: input.name, industry: input.industry, status: input.status })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdateClient(clientId: string, input: Partial<{ name: string; industry: string; status: Client["status"] }>) {
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
