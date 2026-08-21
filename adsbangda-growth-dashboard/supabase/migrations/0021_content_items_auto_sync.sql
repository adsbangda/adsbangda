-- ============================================================================
-- AdsBangda Growth Dashboard — Auto-sync konten ke Content Delivery
-- ============================================================================
-- Jalankan SETELAH 0020_threads_replies_reposts.sql.
--
-- Sebelumnya, post yang ke-sync otomatis (Threads/Instagram/Facebook, lihat
-- src/lib/meta-sync.ts) HANYA masuk ke tabel `post_performance` (buat Post
-- Ranking) — TIDAK ikut kehitung di progress "Content Delivery" (Goals),
-- karena itu dihitung dari tabel `content_items` yang sepenuhnya manual.
--
-- Kolom baru ini bikin sync bisa nulis ke `content_items` juga (status
-- langsung 'published', karena kalau udah ke-tarik dari API platform berarti
-- emang udah tayang) — pakai pola `source`/`external_post_id` yang sama
-- kayak performance_metrics & post_performance, supaya cron yang jalan
-- berkali-kali TIDAK bikin baris dobel buat post yang sama (upsert by
-- client_id+platform+external_post_id).
-- ============================================================================

alter table content_items add column if not exists source text not null default 'manual'
  check (source in ('manual', 'meta'));
alter table content_items add column if not exists external_post_id text;

-- Unique index PARSIAL (cuma berlaku buat baris source='meta' yang punya
-- external_post_id) — baris manual (source='manual', external_post_id null)
-- sama sekali tidak kena batasan ini, tetap bebas dobel kayak sebelumnya.
create unique index if not exists content_items_meta_external_id_idx
  on content_items (client_id, platform, external_post_id)
  where source = 'meta' and external_post_id is not null;
