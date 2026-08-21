// Supabase mengembalikan nama kolom snake_case apa adanya, sementara semua
// tipe di lib/types.ts pakai camelCase (konvensi TS/React). File ini adalah
// SATU-SATUNYA tempat konversi itu terjadi, supaya data.ts dan admin-data.ts
// tidak perlu mengulang mapping yang sama dan gampang salah ketik kolom.

import type {
  Client,
  Project,
  ProjectTask,
  PerformanceMetric,
  ContentItem,
  ReportItem,
  FileEntry,
  AttentionItem,
  ActivityEntry,
  DeliveryMetricItem,
  QuickStat,
  ChannelOverviewRow,
  UpcomingEvent,
  Goal,
  ContentTarget,
  WebsiteActivityEntry,
  ApprovalHistoryEntry,
  PostPerformance,
  SocialConnection,
  Service,
} from "./types";

export function mapClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    logoUrl: (row.logo_url as string | null) ?? null,
    industry: row.industry as string,
    status: row.status as Client["status"],
    website: (row.website as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    socialMediaActive: (row.social_media_active as boolean | null) ?? false,
    metaAdsActive: (row.meta_ads_active as boolean | null) ?? false,
    websiteActive: (row.website_active as boolean | null) ?? false,
    metaAdsBudgetTarget: (row.meta_ads_budget_target as number | null) ?? undefined,
    ga4PropertyId: (row.ga4_property_id as string | null) ?? null,
    ga4Hostname: (row.ga4_hostname as string | null) ?? null,
    organizationId: row.organization_id as string | undefined,
  };
}

export function mapProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    name: row.name as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    status: row.status as Project["status"],
    stage: row.stage as Project["stage"],
    type: row.type as string | undefined,
    services: (row.services as string[] | null) ?? [],
    period: (row.period as string | null) ?? undefined,
    description: (row.description as string | null) ?? null,
    progressPct: row.progress_pct as number | undefined,
  };
}

export function mapService(row: Record<string, unknown>): Service {
  return {
    id: row.id as string,
    label: row.label as string,
  };
}

export function mapProjectTask(row: Record<string, unknown>): ProjectTask {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    name: row.name as string,
    status: row.status as ProjectTask["status"],
    progressPct: row.progress_pct as number,
    orderIndex: row.order_index as number,
    owner: (row.owner as string) ?? "",
    dueDate: (row.due_date as string) ?? "",
    blocker: (row.blocker as string | null) ?? undefined,
  };
}

export function mapPerformanceMetric(row: Record<string, unknown>): PerformanceMetric {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    date: row.date as string,
    channel: row.channel as PerformanceMetric["channel"],
    platform: (row.platform as PerformanceMetric["platform"]) ?? undefined,
    spend: (row.spend as number | null) ?? undefined,
    reach: (row.reach as number | null) ?? undefined,
    impressions: (row.impressions as number | null) ?? undefined,
    clicks: (row.clicks as number | null) ?? undefined,
    leads: (row.leads as number | null) ?? undefined,
    costPerLead: (row.cost_per_lead as number | null) ?? undefined,
    followers: (row.followers as number | null) ?? undefined,
    engagementRate: (row.engagement_rate as number | null) ?? undefined,
    visitors: (row.visitors as number | null) ?? undefined,
    conversions: (row.conversions as number | null) ?? undefined,
    pageViews: (row.page_views as number | null) ?? undefined,
    sessions: (row.sessions as number | null) ?? undefined,
    bounceRate: (row.bounce_rate as number | null) ?? undefined,
    avgSessionDuration: (row.avg_session_duration as string | null) ?? undefined,
    ctr: (row.ctr as number | null) ?? undefined,
    cpc: (row.cpc as number | null) ?? undefined,
    roas: (row.roas as number | null) ?? undefined,
    targetLeads: (row.target_leads as number | null) ?? undefined,
    budgetTarget: (row.budget_target as number | null) ?? undefined,
    closing: (row.closing as number | null) ?? undefined,
    conversionRate: (row.conversion_rate as number | null) ?? undefined,
    source: (row.source as PerformanceMetric["source"]) ?? "manual",
  };
}

export function mapGoal(row: Record<string, unknown>): Goal {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    label: row.label as string,
    description: (row.description as string | null) ?? null,
    target: Number(row.target ?? 0),
    actual: Number(row.actual ?? 0),
    unit: (row.unit as string) ?? "",
    period: (row.period as string) ?? "",
    status: (row.status as Goal["status"]) ?? "on_track",
    notes: (row.notes as string | null) ?? null,
  };
}

export function mapPostPerformance(row: Record<string, unknown>): PostPerformance {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    platform: row.platform as PostPerformance["platform"],
    type: row.type as string,
    title: row.title as string,
    postedDate: row.posted_date as string,
    likes: (row.likes as number | null) ?? undefined,
    comments: (row.comments as number | null) ?? undefined,
    shares: (row.shares as number | null) ?? undefined,
    saves: (row.saves as number | null) ?? undefined,
    views: (row.views as number | null) ?? undefined,
    permalink: (row.permalink as string | null) ?? null,
    source: (row.source as PostPerformance["source"]) ?? "manual",
    externalPostId: (row.external_post_id as string | null) ?? null,
  };
}

export function mapSocialConnection(row: Record<string, unknown>): SocialConnection {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    platform: row.platform as SocialConnection["platform"],
    externalAccountId: row.external_account_id as string,
    accessToken: row.access_token as string,
    tokenExpiresAt: (row.token_expires_at as string | null) ?? null,
    connectedAt: row.connected_at as string,
  };
}

export function mapContentItem(row: Record<string, unknown>): ContentItem {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    title: row.title as string,
    plannedDate: row.planned_date as string,
    status: row.status as ContentItem["status"],
    platform: row.platform as ContentItem["platform"],
    type: row.type as ContentItem["type"],
    notes: (row.notes as string | null) ?? undefined,
    assetUrl: (row.asset_url as string | null) ?? null,
    publishLink: (row.publish_link as string | null) ?? null,
    approvalRequired: (row.approval_required as boolean | null) ?? false,
    approvalStatus: (row.approval_status as ContentItem["approvalStatus"]) ?? null,
  };
}

export function mapContentTarget(row: Record<string, unknown>): ContentTarget {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    period: row.period as string,
    platform: row.platform as ContentTarget["platform"],
    contentType: row.content_type as string,
    target: Number(row.target ?? 0),
  };
}

export function mapWebsiteActivity(row: Record<string, unknown>): WebsiteActivityEntry {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    date: row.activity_date as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    status: (row.status as WebsiteActivityEntry["status"]) ?? "done",
  };
}

export function mapApprovalHistoryEntry(row: Record<string, unknown>): ApprovalHistoryEntry {
  return {
    id: row.id as string,
    contentId: row.content_id as string,
    action: row.action as ApprovalHistoryEntry["action"],
    note: (row.note as string) ?? "",
    actor: (row.actor as string) ?? "",
    createdAt: row.created_at as string,
  };
}

export function mapReportItem(row: Record<string, unknown>): ReportItem {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    periodMonth: row.period_month as string,
    fileUrl: row.file_url as string,
    generatedAt: row.generated_at as string,
    summary: (row.summary as string) ?? "",
  };
}

export function mapFileEntry(row: Record<string, unknown>): FileEntry {
  return {
    id: row.id as string,
    name: row.name as string,
    category: (row.category as string) ?? "",
    fileUrl: row.file_url as string,
    updatedAt: row.updated_at as string,
    sizeLabel: (row.size_label as string) ?? "",
  };
}

export function mapAttentionItem(row: Record<string, unknown>): AttentionItem {
  return {
    id: row.id as string,
    icon: row.icon as AttentionItem["icon"],
    title: row.title as string,
    description: (row.description as string) ?? "",
    href: (row.href as string) ?? "/",
    countBadge: (row.count_badge as number | null) ?? undefined,
  };
}

/**
 * Label hari relatif ("Hari ini"/"Kemarin"/tanggal) DIHITUNG dari
 * `occurred_at`, bukan dibaca mentah-mentah dari kolom `day_label` di DB.
 * Kalau day_label yang disimpan langsung dipakai, entry yang admin buat
 * hari ini dengan label "Hari ini" akan SALAH selamanya begitu besoknya
 * tiba (tetap tertulis "Hari ini" walau sudah kemarin) — jadi kolom
 * `day_label` di DB sekarang cuma bekas skema lama, sengaja diabaikan di
 * sini demi selalu akurat kapan pun dibaca.
 */
export function activityDayLabel(occurredAtISO: string): string {
  const occurred = new Date(occurredAtISO);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(occurred)) / 86400000);

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(occurred);
}

export function mapActivityEntry(row: Record<string, unknown>): ActivityEntry {
  return {
    id: row.id as string,
    day: activityDayLabel(row.occurred_at as string),
    occurredAt: row.occurred_at as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    done: row.done as boolean,
    thumbnailCount: (row.thumbnail_count as number | null) ?? undefined,
  };
}

export function mapDeliveryItem(row: Record<string, unknown>): DeliveryMetricItem {
  return {
    id: row.id as string,
    icon: row.icon as DeliveryMetricItem["icon"],
    label: row.label as string,
    completed: row.completed as number,
    target: row.target as number,
    unit: (row.unit as string) ?? "",
  };
}

export function mapQuickStat(row: Record<string, unknown>): QuickStat {
  return {
    id: row.id as string,
    icon: row.icon as QuickStat["icon"],
    label: row.label as string,
    value: row.value as string,
    deltaLabel: (row.delta_label as string) ?? "",
    deltaPositive: (row.delta_positive as boolean) ?? true,
  };
}

export function mapChannelOverviewRow(row: Record<string, unknown>): ChannelOverviewRow {
  return {
    id: row.id as string,
    icon: row.icon as ChannelOverviewRow["icon"],
    label: row.label as string,
    metricLabel: (row.metric_label as string) ?? "",
    value: row.value as string,
    deltaLabel: (row.delta_label as string) ?? "",
    sparkline: (row.sparkline as number[]) ?? [],
  };
}

export function mapUpcomingEvent(row: Record<string, unknown>): UpcomingEvent {
  const date = new Date(row.event_date as string);
  return {
    id: row.id as string,
    day: String(date.getUTCDate()),
    month: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase(),
    title: row.title as string,
    timeLabel: (row.time_label as string) ?? "",
  };
}
