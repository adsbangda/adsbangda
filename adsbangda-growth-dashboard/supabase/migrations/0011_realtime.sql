-- ============================================================================
-- AdsBangda Growth Dashboard — Realtime (Live Sync Client Portal <-> Admin)
-- ============================================================================
-- Jalankan SETELAH 0001-0010.
--
-- Kenapa migration ini perlu: Realtime (postgres_changes) Supabase TIDAK
-- otomatis nyala untuk tabel manapun secara default — tiap tabel harus
-- ditambahkan eksplisit ke publication `supabase_realtime` dulu. Tanpa ini,
-- subscription di src/components/realtime-refresh.tsx tetap terpasang tapi
-- TIDAK PERNAH menerima event apa pun (silent, tidak error) — jadi kalau
-- lupa jalankan migration ini, Admin Portal & Client Portal akan tetap
-- terasa perlu di-refresh manual persis seperti sebelumnya.
--
-- RLS tetap jadi penjaga keamanan utama: Realtime cuma broadcast baris yang
-- boleh dibaca subscriber-nya menurut policy SELECT tabel terkait (semua
-- tabel di bawah sudah RLS-enabled sejak migration 0001/0002). Filter
-- `client_id=eq.<id>` di sisi client cuma optimisasi supaya browser tidak
-- perlu terima/skip event dari client lain, bukan lapisan keamanan.
--
-- Aman dijalankan berkali-kali — Postgres tidak punya
-- `alter publication ... add table if not exists`, jadi dibungkus DO block
-- yang cek pg_publication_tables dulu sebelum nambah.
-- ============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'clients',
    'projects',
    'project_tasks',
    'quick_stats',
    'activity_log',
    'content_items',
    'content_approval_history',
    'content_targets',
    'performance_metrics',
    'reports',
    'files',
    'client_goals',
    'website_activity'
  ]
  loop
    -- REPLICA IDENTITY FULL — supaya event DELETE ikut membawa nilai kolom
    -- non-primary-key (mis. client_id) di payload "old record"-nya. Tanpa
    -- ini, default REPLICA IDENTITY cuma menyertakan primary key saat baris
    -- dihapus, jadi filter `client_id=eq.<id>` di RealtimeRefresh TIDAK
    -- akan pernah match untuk event DELETE — hapus attention item/report/
    -- file dsb tidak akan memicu live-refresh, walau INSERT/UPDATE tetap
    -- normal. Aman & murah (tabel-tabel ini kecil, bukan tabel besar
    -- volume-tinggi), jadi tidak perlu dipikirkan trade-off storage-nya.
    execute format('alter table %I replica identity full', t);

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end $$;
