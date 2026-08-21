-- ============================================================================
-- AdsBangda Growth Dashboard — Threads Replies & Reposts
-- ============================================================================
-- Jalankan SETELAH 0019_social_auto_sync.sql.
--
-- Threads TIDAK punya metrik "Reach"/"Profile Visits" terpisah (semua
-- digabung jadi satu angka "Views", dipetakan ke kolom `impressions` yang
-- sudah ada) — TAPI dia punya breakdown "Replies" dan "Reposts" yang
-- platform lain (Instagram/Facebook) tidak punya sedetail itu. Kolom baru
-- ini dipakai KHUSUS buat card "Replies"/"Reposts" di halaman Social Media
-- (Client & Admin Portal) waktu platform aktifnya Threads.
--
-- NULL di platform lain (Instagram/Facebook/dst) — kolom ini sengaja
-- generik di level tabel (bukan tabel terpisah per platform) supaya
-- konsisten dengan kolom lain yang sudah ada (reach/impressions/dst),
-- tapi cuma benar-benar terisi untuk baris platform='threads'.
-- ============================================================================

alter table performance_metrics add column if not exists replies numeric;
alter table performance_metrics add column if not exists reposts numeric;
