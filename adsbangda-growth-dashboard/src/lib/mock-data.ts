// Data contoh untuk mode demo (dipakai kalau env Supabase belum di-set).
// Struktur & nama field SENGAJA sama persis dengan yang akan datang dari
// Supabase nanti (lihat lib/types.ts + supabase/migrations/0001_init.sql).

import type {
  Client,
  Project,
  ProjectTask,
  PerformanceMetric,
  ChannelSummary,
  ContentItem,
  ReportItem,
  AttentionItem,
  MonthlyDelivery,
  CurrentWorkItem,
} from "./types";

export const mockClient: Client = {
  id: "client_amati_coffee",
  name: "Amati Coffee",
  industry: "F&B — Coffee Shop",
  status: "active",
};

export const mockProjects: Project[] = [
  {
    id: "proj_aug_2026",
    clientId: mockClient.id,
    name: "August Campaign",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    status: "on_track",
  },
];

export const mockProjectTasks: ProjectTask[] = [
  { id: "t1", projectId: "proj_aug_2026", name: "Strategy", status: "done", progressPct: 100, orderIndex: 1, owner: "Rani — Strategist", dueDate: "2026-08-04" },
  { id: "t2", projectId: "proj_aug_2026", name: "Content Production", status: "in_progress", progressPct: 80, orderIndex: 2, owner: "Diko — Content Lead", dueDate: "2026-08-11" },
  { id: "t3", projectId: "proj_aug_2026", name: "Client Approval", status: "waiting", progressPct: 0, orderIndex: 3, owner: "Amati Coffee", dueDate: "2026-08-12", blocker: "6 konten menunggu approval kamu" },
  { id: "t4", projectId: "proj_aug_2026", name: "Publishing", status: "not_started", progressPct: 0, orderIndex: 4, owner: "Diko — Content Lead", dueDate: "2026-08-14" },
  { id: "t5", projectId: "proj_aug_2026", name: "Reporting", status: "not_started", progressPct: 0, orderIndex: 5, owner: "Rani — Strategist", dueDate: "2026-09-02" },
];

export const mockAttentionItems: AttentionItem[] = [
  {
    id: "a1",
    title: "6 konten menunggu approval",
    description: "Review konten Instagram minggu ini sebelum jadwal publish 12 Agustus.",
    dueLabel: "Hari ini",
    actionLabel: "Review Konten",
    actionHref: "/content-calendar",
    urgent: true,
  },
  {
    id: "a2",
    title: "Konfirmasi budget Meta Ads September",
    description: "Tim strategist mengusulkan kenaikan budget 15% berdasarkan performa CPL yang membaik.",
    dueLabel: "12 Agustus",
    actionLabel: "Lihat Detail",
    actionHref: "/performance",
    urgent: false,
  },
  {
    id: "a3",
    title: "Sync bulanan dengan tim Adsbangda",
    description: "Pembahasan hasil Agustus dan rencana campaign September.",
    dueLabel: "15 Agustus · 14:00",
    actionLabel: "Lihat Agenda",
    actionHref: "/reports",
    urgent: false,
  },
];

// Monthly Delivery — contoh kontrak "Amati Coffee" bulan Agustus dengan tiga
// service line (Social Media, Meta Ads, Website). Nilai-nilai ini SENGAJA
// hanya contoh untuk mendemonstrasikan sistem visual; struktur tipe di
// types.ts tidak menghardcode nama service atau jenis deliverable apa pun —
// nanti ini akan datang dari input Admin Portal.
export const mockMonthlyDelivery: MonthlyDelivery = {
  periodLabel: "Agustus 2026",
  overallPct: 82,
  status: "on_track",
  groups: [
    {
      serviceGroup: "Social Media",
      deliverables: [
        { id: "dl1", kind: "quantity", label: "Feed Design", completed: 10, target: 14 },
        { id: "dl2", kind: "quantity", label: "Short-form Video", completed: 8, target: 12 },
        { id: "dl3", kind: "quantity", label: "Long-form Video", completed: 6, target: 8 },
        { id: "dl4", kind: "quantity", label: "Promotional Poster", completed: 4, target: 6 },
        { id: "dl5", kind: "up_to", label: "Instagram Stories", used: 18, max: 30 },
      ],
    },
    {
      serviceGroup: "Meta Ads",
      deliverables: [
        {
          id: "dl6",
          kind: "recurring",
          label: "Weekly Campaign Optimization",
          periods: [
            { label: "Week 1", status: "done" },
            { label: "Week 2", status: "done" },
            { label: "Week 3", status: "done" },
            { label: "Week 4", status: "upcoming" },
          ],
        },
        { id: "dl7", kind: "monthly", label: "Monthly Performance Report", status: "preparing" },
      ],
    },
    {
      serviceGroup: "Website",
      deliverables: [
        {
          id: "dl8",
          kind: "milestone",
          label: "Website Development",
          milestones: [
            { label: "UI/UX Design", status: "done" },
            { label: "Development", status: "in_progress", pct: 75 },
            { label: "Responsive Optimization", status: "in_progress", pct: 40 },
            { label: "SEO", status: "pending" },
            { label: "Deployment", status: "pending" },
          ],
        },
      ],
    },
  ],
};

// "Current Work" — ringkasan status per service line, terpisah dari detail
// task di halaman Projects. Sengaja generik (serviceGroup + detail + status
// bebas teks) supaya tidak terikat pada service tertentu.
export const mockCurrentWork: CurrentWorkItem[] = [
  { id: "cw1", serviceGroup: "Social Media", detail: "Content production", status: "On Track" },
  { id: "cw2", serviceGroup: "Meta Ads", detail: "3 campaigns active", status: "Optimizing" },
  { id: "cw3", serviceGroup: "Website", detail: "Development", status: "75%" },
];

// Snapshot mingguan — dipakai untuk chart trend & perbandingan periode.
export const mockPerformance: PerformanceMetric[] = [
  { id: "m1", clientId: mockClient.id, date: "2026-07-06", channel: "meta_ads", spend: 3200000, reach: 42000, impressions: 61000, clicks: 980, leads: 41, costPerLead: 78048 },
  { id: "m2", clientId: mockClient.id, date: "2026-07-13", channel: "meta_ads", spend: 3400000, reach: 45500, impressions: 66000, clicks: 1040, leads: 47, costPerLead: 72340 },
  { id: "m3", clientId: mockClient.id, date: "2026-07-20", channel: "meta_ads", spend: 3350000, reach: 44200, impressions: 63500, clicks: 1005, leads: 44, costPerLead: 76136 },
  { id: "m4", clientId: mockClient.id, date: "2026-07-27", channel: "meta_ads", spend: 3600000, reach: 49800, impressions: 71200, clicks: 1150, leads: 53, costPerLead: 67924 },
  { id: "m5", clientId: mockClient.id, date: "2026-08-03", channel: "meta_ads", spend: 3750000, reach: 52100, impressions: 74800, clicks: 1210, leads: 58, costPerLead: 64655 },
];

export const mockSocial: PerformanceMetric[] = [
  { id: "s1", clientId: mockClient.id, date: "2026-07-06", channel: "social", followers: 18200, engagementRate: 3.1, reach: 38000 },
  { id: "s2", clientId: mockClient.id, date: "2026-07-13", channel: "social", followers: 18450, engagementRate: 3.4, reach: 40500 },
  { id: "s3", clientId: mockClient.id, date: "2026-07-20", channel: "social", followers: 18700, engagementRate: 3.2, reach: 39800 },
  { id: "s4", clientId: mockClient.id, date: "2026-07-27", channel: "social", followers: 19050, engagementRate: 3.8, reach: 44200 },
  { id: "s5", clientId: mockClient.id, date: "2026-08-03", channel: "social", followers: 19400, engagementRate: 4.1, reach: 47600 },
];

export const mockWebsite: PerformanceMetric[] = [
  { id: "w1", clientId: mockClient.id, date: "2026-07-06", channel: "website", visitors: 5200, conversions: 61 },
  { id: "w2", clientId: mockClient.id, date: "2026-07-13", channel: "website", visitors: 5600, conversions: 68 },
  { id: "w3", clientId: mockClient.id, date: "2026-07-20", channel: "website", visitors: 5450, conversions: 63 },
  { id: "w4", clientId: mockClient.id, date: "2026-07-27", channel: "website", visitors: 6100, conversions: 79 },
  { id: "w5", clientId: mockClient.id, date: "2026-08-03", channel: "website", visitors: 6480, conversions: 88 },
];

export const mockChannelSummary: ChannelSummary[] = [
  { channel: "Meta Ads", spend: 3750000, leads: 58, costPerLead: 64655, engagementRate: 2.8, status: "healthy" },
  { channel: "Instagram Organic", spend: 0, leads: 14, costPerLead: 0, engagementRate: 4.1, status: "healthy" },
  { channel: "Facebook Organic", spend: 0, leads: 3, costPerLead: 0, engagementRate: 1.2, status: "watch" },
  { channel: "Website Direct", spend: 0, leads: 9, costPerLead: 0, engagementRate: 1.6, status: "underperforming" },
];

export const mockTopContent = [
  { title: "Reel: \"5 cara bikin cold brew di rumah\"", reach: 84200, engagementRate: 6.4 },
  { title: "Carousel: Menu baru bulan Agustus", reach: 51300, engagementRate: 4.9 },
  { title: "Story takeover: Behind the scenes roasting", reach: 33800, engagementRate: 5.8 },
];

export const mockContentCalendar: ContentItem[] = [
  { id: "c1", clientId: mockClient.id, title: "Proses roasting biji kopi", plannedDate: "2026-08-08", status: "published", platform: "instagram", type: "reel" },
  { id: "c2", clientId: mockClient.id, title: "Promo weekday 20%", plannedDate: "2026-08-11", status: "scheduled", platform: "instagram", type: "carousel" },
  { id: "c3", clientId: mockClient.id, title: "Q&A barista", plannedDate: "2026-08-13", status: "approved", platform: "instagram", type: "story" },
  { id: "c4", clientId: mockClient.id, title: "Menu musiman baru", plannedDate: "2026-08-15", status: "waiting_approval", platform: "instagram", type: "reel" },
  { id: "c5", clientId: mockClient.id, title: "Testimoni pelanggan", plannedDate: "2026-08-18", status: "waiting_approval", platform: "facebook", type: "post" },
  { id: "c6", clientId: mockClient.id, title: "Tips menyimpan kopi di rumah", plannedDate: "2026-08-20", status: "in_production", platform: "instagram", type: "carousel" },
  { id: "c7", clientId: mockClient.id, title: "Cerita asal biji kopi lokal", plannedDate: "2026-08-22", status: "draft", platform: "website", type: "article" },
];

export const mockReports: ReportItem[] = [
  { id: "r1", clientId: mockClient.id, periodMonth: "2026-07", fileUrl: "#", generatedAt: "2026-08-02", summary: "Leads naik 18%, CPL turun 9% dibanding Juni." },
  { id: "r2", clientId: mockClient.id, periodMonth: "2026-06", fileUrl: "#", generatedAt: "2026-07-02", summary: "Engagement rate meningkat berkat konten reel baru." },
  { id: "r3", clientId: mockClient.id, periodMonth: "2026-05", fileUrl: "#", generatedAt: "2026-06-02", summary: "Awal campaign Meta Ads, fokus di brand awareness." },
];

export const marketingInsight =
  "Lead generation naik 9,2% minggu ini sementara cost per lead turun 12% — Meta Ads jadi kanal akuisisi paling efisien saat ini. Instagram organic juga mulai berkontribusi lewat konten reel behind-the-scenes.";

export interface ActivityEvent {
  id: string;
  /** Grouping label — "Hari Ini", "Kemarin", or a date like "9 Agustus". */
  day: string;
  time: string;
  actor: string;
  action: string;
  tone: "success" | "accent" | "warning" | "muted";
}

export const mockActivity: ActivityEvent[] = [
  { id: "ac1", day: "Hari Ini", time: "14:20", actor: "Tim Adsbangda", action: "mengoptimasi campaign Meta Ads", tone: "accent" },
  { id: "ac2", day: "Kemarin", time: "16:40", actor: "Tim Adsbangda", action: "mempublikasikan 3 post Instagram", tone: "success" },
  { id: "ac3", day: "9 Agustus", time: "11:05", actor: "Rani — Strategist", action: "menyelesaikan content strategy bulan ini", tone: "success" },
  { id: "ac4", day: "9 Agustus", time: "09:40", actor: "Diko — Content Lead", action: "mengunggah 3 draft konten baru untuk direview", tone: "accent" },
  { id: "ac5", day: "8 Agustus", time: "10:15", actor: "Rani — Strategist", action: "menyelesaikan riset audiens", tone: "muted" },
];

