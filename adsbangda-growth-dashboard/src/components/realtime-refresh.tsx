"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Tabel client-scoped yang dipantau live, plus nama kolom buat filter
 * channel-nya. `clients` sendiri pakai `id` (dia tabelnya sendiri, bukan
 * child table). Tabel yang tidak punya `client_id` langsung — project_tasks
 * (lewat project_id) dan content_approval_history (lewat content_id) —
 * didengar TANPA filter kolom; masih aman karena RLS di database tetap
 * jadi penjaga utama (baris client lain tidak akan pernah sampai ke browser
 * ini), cuma kurang efisien kalau banyak client lain berubah bersamaan.
 * Trade-off yang wajar untuk ukuran agency saat ini.
 *
 * SENGAJA TIDAK termasuk delivery_meta/delivery_items/attention_items/
 * channel_overview/upcoming_events — tabel-tabel skema awal yang sudah
 * tidak dibaca lagi oleh lib/data.ts (lihat komentar di getMonthlyDelivery/
 * getAttentionItems/getChannelOverview/getUpcomingEvents), jadi tidak ada
 * gunanya dipantau. quick_stats & activity_log masih dipantau walau juga
 * belum ada admin UI yang menulis ke situ — biar konsisten sampai
 * getQuickStats()/getRecentActivity() ikut di-rewire ke sumber data asli.
 */
const CLIENT_SCOPED_TABLES: { table: string; filterColumn: "id" | "client_id" | null }[] = [
  { table: "clients", filterColumn: "id" },
  { table: "projects", filterColumn: "client_id" },
  { table: "project_tasks", filterColumn: null },
  { table: "quick_stats", filterColumn: "client_id" },
  { table: "activity_log", filterColumn: "client_id" },
  { table: "content_items", filterColumn: "client_id" },
  { table: "content_approval_history", filterColumn: null },
  { table: "content_targets", filterColumn: "client_id" },
  { table: "performance_metrics", filterColumn: "client_id" },
  { table: "reports", filterColumn: "client_id" },
  { table: "files", filterColumn: "client_id" },
  { table: "client_goals", filterColumn: "client_id" },
  { table: "website_activity", filterColumn: "client_id" },
];

/**
 * Bikin Client Portal & Admin Portal (halaman detail satu client) benar-
 * benar live — begitu data client ini berubah di Supabase, dari sisi
 * manapun (admin mutasi lewat Admin Portal, ATAU client sendiri approve /
 * request revision), semua tab yang sedang terbuka untuk client yang sama
 * otomatis narik ulang data server terbaru lewat router.refresh() — tanpa
 * siapa pun perlu reload manual.
 *
 * Kenapa router.refresh() cukup (tanpa perlu kirim payload perubahan manual
 * ke UI satu-satu): semua halaman di portal ini sudah dynamic-rendered
 * (baca cookies() lewat Supabase server client, jadi TIDAK di-cache
 * Next.js), jadi setiap refresh selalu ambil data ASLI terbaru dari
 * Supabase, bukan dari cache basi.
 *
 * No-op total di mode demo (createClient() balikin null) dan otomatis
 * berhenti dengar begitu component di-unmount (pindah halaman/tab ditutup).
 * Perlu Realtime publication aktif di tabel terkait — lihat migration
 * 0011_realtime.sql. Tidak render UI apa pun.
 */
export function RealtimeRefresh({ clientId }: { clientId: string }) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    // Debounce singkat — satu aksi user sering menulis ke beberapa tabel
    // sekaligus (mis. approve konten juga menulis content_approval_history
    // + activity_log), jadi kumpulkan jadi satu router.refresh() saja,
    // bukan satu per event yang datang beruntun.
    const scheduleRefresh = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => router.refresh(), 250);
    };

    const channel = supabase.channel(`live:client:${clientId}`);

    for (const { table, filterColumn } of CLIENT_SCOPED_TABLES) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filterColumn ? { filter: `${filterColumn}=eq.${clientId}` } : {}),
        },
        scheduleRefresh
      );
    }

    channel.subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [clientId, router]);

  return null;
}
