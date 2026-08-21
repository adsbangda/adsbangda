-- ============================================================================
-- AdsBangda Growth Dashboard — GA4 Integration (Pilot)
-- ============================================================================
-- Jalankan SETELAH 0001-0016.
--
-- Sinkronisasi otomatis Website Performance dari Google Analytics 4 (GA4
-- Data API) — dimulai sebagai fitur OPT-IN per client (bukan default semua
-- client), supaya client yang belum/tidak kasih akses GA4 tetap 100% bisa
-- jalan manual seperti sebelumnya, tanpa ada yang rusak.
--
-- clients.ga4_property_id — diisi admin per client lewat Admin → Website
--   (opsional). NULL berarti client itu tetap manual sepenuhnya — job sync
--   otomatis (lihat src/app/api/cron/sync-ga4) SAMA SEKALI TIDAK menyentuh
--   client yang kolom ini masih NULL.
--
-- performance_metrics.source — 'manual' (DEFAULT, jadi SEMUA baris lama
--   otomatis kebaca 'manual' tanpa perlu backfill apa pun) vs 'ga4' (baris
--   yang diisi otomatis oleh sync job). Dipisah supaya:
--     1. Sync job TIDAK PERNAH menimpa baris yang admin input manual.
--     2. Admin edit/hapus manual tidak pernah "ketiban" tertimpa balik oleh
--        sync run berikutnya — keduanya baris yang berbeda, dicocokkan
--        lewat (client_id, channel, date, source) saat sync jalan, bukan
--        cuma (client_id, channel, date).
-- ============================================================================

alter table clients add column if not exists ga4_property_id text;

alter table performance_metrics
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'ga4'));

-- Index buat sync job nyari cepat "baris ga4 untuk client+channel+date ini
-- sudah ada belum" tanpa full table scan tiap kali cron jalan.
create index if not exists performance_metrics_source_idx
  on performance_metrics (client_id, channel, date, source);
