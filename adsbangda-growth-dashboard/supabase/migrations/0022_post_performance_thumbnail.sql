-- ============================================================================
-- AdsBangda Growth Dashboard — Thumbnail buat Post Ranking
-- ============================================================================
-- Jalankan SETELAH 0021_content_items_auto_sync.sql.
--
-- Post Ranking di halaman Social Media diubah dari tabel lebar (butuh scroll
-- ke samping buat lihat Likes/Views) jadi list card — tiap post nampilin
-- thumbnail gambar/video di kiri, teks konten boleh sepanjang apa pun (bakal
-- turun ke bawah/wrap, BUKAN dipotong+scroll), statistik selalu kelihatan
-- tanpa perlu geser.
--
-- Kolom ini diisi OTOMATIS oleh sync (media_url dari Instagram/Facebook,
-- Threads TIDAK expose thumbnail lewat API-nya jadi tetap kosong buat
-- platform itu) — dan BISA diisi manual juga lewat form admin buat postingan
-- yang diinput manual.
-- ============================================================================

alter table post_performance add column if not exists thumbnail_url text;
