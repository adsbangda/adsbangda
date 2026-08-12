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
    description: (row.description as string | null) ?? null,
    progressPct: row.progress_pct as number | undefined,
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

export function mapActivityEntry(row: Record<string, unknown>): ActivityEntry {
  return {
    id: row.id as string,
    day: row.day_label as string,
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
