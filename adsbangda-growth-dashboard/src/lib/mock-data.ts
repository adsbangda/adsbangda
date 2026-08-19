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
  MonthlyDeliveryHero,
  QuickStat,
  ActivityEntry,
  ChannelOverviewRow,
  UpcomingEvent,
  WeeklyCalendar,
  FileEntry,
  Goal,
  ContentTarget,
  SocialPlatformSummary,
  WebsiteActivityEntry,
  ApprovalHistoryEntry,
} from "./types";

export const mockClient: Client = {
  id: "client_amati_coffee",
  name: "Amati Coffee",
  industry: "F&B — Coffee Shop",
  status: "active",
  socialMediaActive: true,
  metaAdsActive: true,
  websiteActive: true,
  metaAdsBudgetTarget: 10000000,
};

// Dipakai Admin Portal (mode demo) untuk menampilkan daftar client. Client
// baru yang dibuat admin lewat UI akan di-push ke array ini saat runtime —
// tapi karena ini array in-memory biasa, isinya reset setiap server restart.
export const mockClients: Client[] = [mockClient];

export const mockGoals: Goal[] = [
  {
    id: "goal_content",
    clientId: mockClient.id,
    label: "Content Goal",
    description: "Konsistensi produksi content bulanan untuk menjaga awareness.",
    target: 20,
    actual: 15,
    unit: "content/month",
    period: "2026-08",
    status: "on_track",
    notes: null,
  },
  {
    id: "goal_leads",
    clientId: mockClient.id,
    label: "Lead Goal",
    description: "Target leads dari kombinasi Meta Ads & organic social.",
    target: 150,
    actual: 120,
    unit: "leads",
    period: "2026-08",
    status: "at_risk",
    notes: "Perlu naikkan budget minggu terakhir untuk kejar target.",
  },
  {
    id: "goal_spend",
    clientId: mockClient.id,
    label: "Ad Spend Goal",
    description: "Efisiensi budget iklan bulanan sesuai kontrak.",
    target: 5000000,
    actual: 4800000,
    unit: "Rp",
    period: "2026-08",
    status: "on_track",
    notes: null,
  },
];

export const mockProjects: Project[] = [
  {
    id: "proj_aug_2026",
    clientId: mockClient.id,
    name: "August Campaign",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    status: "on_track",
    stage: "active",
    type: "social_media",
    description: "Kampanye konten Instagram & TikTok bulan Agustus.",
    progressPct: 56,
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
    icon: "approval",
    title: "6 konten menunggu persetujuan kamu",
    description: "Due today",
    href: "/content-calendar",
    countBadge: 6,
  },
  {
    id: "a2",
    icon: "budget",
    title: "Konfirmasi budget Meta Ads",
    description: "Due 12 Agustus 2026",
    href: "/meta-ads",
  },
  {
    id: "a3",
    icon: "meeting",
    title: "Meeting bulanan",
    description: "15 Agustus 2026 · 14:00",
    href: "/reports",
  },
];

// Monthly Delivery hero — contoh kontrak "Amati Coffee" bulan Agustus.
// Nilai-nilai ini SENGAJA hanya contoh untuk mendemonstrasikan sistem visual;
// `icon` hanya memilih glyph/warna tampilan, tidak membawa logika bisnis apa
// pun, jadi service line apa saja bisa memakai deliverable & ikon apa saja.
export const mockMonthlyDelivery: MonthlyDeliveryHero = {
  periodLabel: "August 2026",
  overallPct: 72,
  status: "on_track",
  helperText: "24 dari 30 konten sudah published bulan ini.",
  meta: {
    periodRange: "1 – 31 August 2026",
    lastUpdated: "11 August 2026, 10:00 WIB",
    agreedDate: "30 Juli 2026",
    contractHref: "/reports",
  },
};

export const mockQuickStats: QuickStat[] = [
  { id: "qs1", icon: "send", label: "Postingan Terpublikasi", value: "18 postingan", deltaLabel: "20% vs last month", deltaPositive: true },
  { id: "qs2", icon: "story", label: "Total Story", value: "48 story", deltaLabel: "14% vs last month", deltaPositive: true },
  { id: "qs3", icon: "heart", label: "Engagement", value: "12.430", deltaLabel: "18.6% vs last month", deltaPositive: true },
  { id: "qs4", icon: "users", label: "New Followers", value: "1.250", deltaLabel: "15.2% vs last month", deltaPositive: true },
];

export const mockChannelOverview: ChannelOverviewRow[] = [
  { id: "co1", icon: "instagram", label: "Instagram", metricLabel: "Engagement Rate", value: "3.82%", deltaLabel: "↑ 12.5%", sparkline: [4, 5, 4.5, 6, 5.5, 7, 6.8] },
  { id: "co2", icon: "facebook", label: "Facebook", metricLabel: "Engagement Rate", value: "2.45%", deltaLabel: "↑ 10.3%", sparkline: [3, 3.2, 2.8, 3.5, 3.1, 3.8, 3.6] },
  { id: "co3", icon: "tiktok", label: "TikTok", metricLabel: "Engagement Rate", value: "5.12%", deltaLabel: "↑ 18.6%", sparkline: [4, 4.5, 5, 4.8, 5.5, 6, 5.8] },
  { id: "co4", icon: "meta_ads", label: "Meta Ads", metricLabel: "Lead Masuk", value: "58", deltaLabel: "↑ 9.4%", sparkline: [41, 47, 44, 53, 58, 58, 58] },
  { id: "co5", icon: "website", label: "Website", metricLabel: "Pengunjung", value: "6.480", deltaLabel: "↑ 6.2%", sparkline: [5200, 5600, 5450, 6100, 6480, 6480, 6480] },
];

export const mockSocialMediaBreakdown: SocialPlatformSummary[] = [
  {
    platform: "instagram",
    items: [
      { contentType: "feed", completed: 2, target: 20 },
      { contentType: "story", completed: 8, target: 15 },
      { contentType: "reels", completed: 4, target: 5 },
    ],
  },
  {
    platform: "tiktok",
    items: [{ contentType: "video", completed: 8, target: 12 }],
  },
];

export const mockUpcomingEvents: UpcomingEvent[] = [
  { id: "ue1", day: "15", month: "AUG", title: "Monthly Review Meeting", timeLabel: "14:00 – 15:00 WIB" },
  { id: "ue2", day: "20", month: "AUG", title: "Content Planning September", timeLabel: "10:00 – 11:30 WIB" },
  { id: "ue3", day: "31", month: "AUG", title: "Monthly Report & Evaluation", timeLabel: "End of Month" },
];

export const mockWeeklyCalendar: WeeklyCalendar = {
  weekDays: [
    { label: "Sen", date: 11 },
    { label: "Sel", date: 12 },
    { label: "Rab", date: 13 },
    { label: "Kam", date: 14 },
    { label: "Jum", date: 15 },
    { label: "Sab", date: 16 },
    { label: "Min", date: 17 },
  ],
  activeIndex: 1,
  totalLabel: "16 konten",
  rows: [
    { id: "instagram:feed", platform: "instagram", contentType: "feed", label: "Instagram Feed", counts: [1, 1, 1, 1, 1, null, null] },
    { id: "instagram:story", platform: "instagram", contentType: "story", label: "Instagram Story", counts: [5, 5, 5, 5, 5, 5, 5] },
    { id: "instagram:reels", platform: "instagram", contentType: "reels", label: "Instagram Reels", counts: [null, 1, 1, null, null, null, null] },
    { id: "facebook:post", platform: "facebook", contentType: "post", label: "Facebook Post", counts: [1, 1, 1, 1, null, null, null] },
    { id: "tiktok:video", platform: "tiktok", contentType: "video", label: "TikTok Video", counts: [1, 1, 1, 1, null, null, null] },
  ],
};

// Snapshot mingguan — dipakai untuk chart trend & perbandingan periode.
export const mockPerformance: PerformanceMetric[] = [
  { id: "m1", clientId: mockClient.id, date: "2026-07-06", channel: "meta_ads", spend: 3200000, reach: 42000, impressions: 61000, clicks: 980, leads: 41, costPerLead: 78048, ctr: 1.61, cpc: 3265, roas: 2.4, closing: 6, conversionRate: 14.6 },
  { id: "m2", clientId: mockClient.id, date: "2026-07-13", channel: "meta_ads", spend: 3400000, reach: 45500, impressions: 66000, clicks: 1040, leads: 47, costPerLead: 72340, ctr: 1.58, cpc: 3269, roas: 2.6, closing: 7, conversionRate: 14.9 },
  { id: "m3", clientId: mockClient.id, date: "2026-07-20", channel: "meta_ads", spend: 3350000, reach: 44200, impressions: 63500, clicks: 1005, leads: 44, costPerLead: 76136, ctr: 1.58, cpc: 3333, roas: 2.5, closing: 6, conversionRate: 13.6 },
  { id: "m4", clientId: mockClient.id, date: "2026-07-27", channel: "meta_ads", spend: 3600000, reach: 49800, impressions: 71200, clicks: 1150, leads: 53, costPerLead: 67924, ctr: 1.62, cpc: 3130, roas: 2.8, closing: 7, conversionRate: 13.2 },
  { id: "m5", clientId: mockClient.id, date: "2026-08-03", channel: "meta_ads", spend: 4850000, reach: 52100, impressions: 74800, clicks: 1210, leads: 32, costPerLead: 151563, ctr: 1.62, cpc: 3099, roas: 3.2, closing: 8, conversionRate: 25 },
];

export const mockSocial: PerformanceMetric[] = [
  { id: "s1", clientId: mockClient.id, date: "2026-07-06", channel: "social", platform: "instagram", followers: 18200, engagementRate: 3.1, reach: 38000 },
  { id: "s2", clientId: mockClient.id, date: "2026-07-13", channel: "social", platform: "instagram", followers: 18450, engagementRate: 3.4, reach: 40500 },
  { id: "s3", clientId: mockClient.id, date: "2026-07-20", channel: "social", platform: "instagram", followers: 18700, engagementRate: 3.2, reach: 39800 },
  { id: "s4", clientId: mockClient.id, date: "2026-07-27", channel: "social", platform: "instagram", followers: 19050, engagementRate: 3.8, reach: 44200 },
  { id: "s5", clientId: mockClient.id, date: "2026-08-03", channel: "social", platform: "instagram", followers: 19400, engagementRate: 4.1, reach: 47600 },
  { id: "s6", clientId: mockClient.id, date: "2026-08-03", channel: "social", platform: "tiktok", followers: 8200, engagementRate: 5.2, reach: 30000 },
];

export const mockWebsite: PerformanceMetric[] = [
  { id: "w1", clientId: mockClient.id, date: "2026-07-06", channel: "website", visitors: 5200, conversions: 61, pageViews: 11800, sessions: 6200, bounceRate: 44, avgSessionDuration: "1m 58s" },
  { id: "w2", clientId: mockClient.id, date: "2026-07-13", channel: "website", visitors: 5600, conversions: 68, pageViews: 12600, sessions: 6700, bounceRate: 43, avgSessionDuration: "2m 02s" },
  { id: "w3", clientId: mockClient.id, date: "2026-07-20", channel: "website", visitors: 5450, conversions: 63, pageViews: 12100, sessions: 6500, bounceRate: 45, avgSessionDuration: "1m 55s" },
  { id: "w4", clientId: mockClient.id, date: "2026-07-27", channel: "website", visitors: 6100, conversions: 79, pageViews: 13800, sessions: 7300, bounceRate: 41, avgSessionDuration: "2m 10s" },
  { id: "w5", clientId: mockClient.id, date: "2026-08-03", channel: "website", visitors: 6480, conversions: 88, pageViews: 14700, sessions: 7800, bounceRate: 40, avgSessionDuration: "2m 15s" },
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
  { id: "c4", clientId: mockClient.id, title: "Menu musiman baru", plannedDate: "2026-08-15", status: "waiting_approval", platform: "instagram", type: "reel", approvalRequired: true, approvalStatus: "pending", assetUrl: "https://drive.google.com/example-asset", notes: "Gunakan foto menu terbaru dari sesi foto Agustus." },
  { id: "c5", clientId: mockClient.id, title: "Testimoni pelanggan", plannedDate: "2026-08-18", status: "waiting_approval", platform: "facebook", type: "post" },
  { id: "c6", clientId: mockClient.id, title: "Tips menyimpan kopi di rumah", plannedDate: "2026-08-20", status: "in_production", platform: "instagram", type: "carousel" },
  { id: "c7", clientId: mockClient.id, title: "Cerita asal biji kopi lokal", plannedDate: "2026-08-22", status: "draft", platform: "website", type: "article" },
];

export const mockContentTargets: ContentTarget[] = [
  { id: "ct1", clientId: mockClient.id, period: "2026-08", platform: "instagram", contentType: "feed", target: 10 },
  { id: "ct2", clientId: mockClient.id, period: "2026-08", platform: "instagram", contentType: "reels", target: 10 },
  { id: "ct3", clientId: mockClient.id, period: "2026-08", platform: "instagram", contentType: "story", target: 5 },
  { id: "ct4", clientId: mockClient.id, period: "2026-08", platform: "tiktok", contentType: "video", target: 5 },
];

export const mockWebsiteActivity: WebsiteActivityEntry[] = [
  { id: "wa1", clientId: mockClient.id, date: "2026-08-12", title: "Homepage updated", description: "Ganti hero banner promo Agustus.", status: "done" },
  { id: "wa2", clientId: mockClient.id, date: "2026-08-10", title: "Website backup completed", description: "Backup rutin bulanan.", status: "done" },
];

export const mockApprovalHistory: ApprovalHistoryEntry[] = [
  { id: "ah1", contentId: "c4", action: "submitted", note: "Menunggu review client.", actor: "Admin", createdAt: "2026-08-10T09:00:00Z" },
];

export const mockReports: ReportItem[] = [
  { id: "r1", clientId: mockClient.id, periodMonth: "2026-07", fileUrl: "#", generatedAt: "2026-08-02", summary: "Leads naik 18%, CPL turun 9% dibanding Juni." },
  { id: "r2", clientId: mockClient.id, periodMonth: "2026-06", fileUrl: "#", generatedAt: "2026-07-02", summary: "Engagement rate meningkat berkat konten reel baru." },
  { id: "r3", clientId: mockClient.id, periodMonth: "2026-05", fileUrl: "#", generatedAt: "2026-06-02", summary: "Awal campaign Meta Ads, fokus di brand awareness." },
];

export const marketingInsight =
  "Lead generation naik 9,2% minggu ini sementara cost per lead turun 12% — Meta Ads jadi kanal akuisisi paling efisien saat ini. Instagram organic juga mulai berkontribusi lewat konten reel behind-the-scenes.";

export const mockFiles: FileEntry[] = [
  { id: "f1", name: "Kontrak Kerja Sama — Amati Coffee.pdf", category: "Kontrak", fileUrl: "#", updatedAt: "2026-07-30", sizeLabel: "480 KB" },
  { id: "f2", name: "Brand Guidelines Amati Coffee.pdf", category: "Brand Asset", fileUrl: "#", updatedAt: "2026-07-15", sizeLabel: "2.1 MB" },
  { id: "f3", name: "Logo & Aset Visual.zip", category: "Brand Asset", fileUrl: "#", updatedAt: "2026-07-15", sizeLabel: "12.4 MB" },
  { id: "f4", name: "Content Plan — Agustus 2026.xlsx", category: "Perencanaan", fileUrl: "#", updatedAt: "2026-08-01", sizeLabel: "96 KB" },
];

// Dipakai buat ac1/ac2 di bawah biar "Hari ini"/"Kemarin" selalu match
// tanggal server saat ini (mock data statis lain tetap fixed date, tidak
// masalah karena cuma demo).
const _now = new Date();
const _isoDaysAgo = (n: number) => new Date(_now.getTime() - n * 86400000).toISOString();

export const mockActivity: ActivityEntry[] = [
  {
    id: "ac1",
    day: "Hari ini",
    occurredAt: _isoDaysAgo(0),
    title: "Optimasi Meta Ads Campaign",
    description: "Menyesuaikan audience dan penempatan iklan untuk meningkatkan performa.",
    done: true,
  },
  {
    id: "ac2",
    day: "Kemarin",
    occurredAt: _isoDaysAgo(1),
    title: "3 Konten Instagram Dipublikasikan",
    description: "1 Carousel • 1 Reel • 1 Story",
    done: true,
    thumbnailCount: 4,
  },
  {
    id: "ac3",
    day: "9 Agustus 2026",
    occurredAt: "2026-08-09T10:00:00.000Z",
    title: "Content Strategy Weekly Meeting",
    description: "Membahas ide konten mingguan dan campaign berjalan.",
    done: false,
  },
  {
    id: "ac4",
    day: "8 Agustus 2026",
    occurredAt: "2026-08-08T15:00:00.000Z",
    title: "Desain 6 Konten Feed & 10 Story",
    description: "Pembuatan desain konten untuk minggu ke-2 bulan ini.",
    done: false,
  },
];

