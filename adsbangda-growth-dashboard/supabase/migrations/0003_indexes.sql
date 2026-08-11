-- ============================================================================
-- AdsBangda Growth Dashboard — Indexes
-- ============================================================================
-- Postgres TIDAK otomatis bikin index buat kolom foreign key. Tanpa index,
-- setiap query "where client_id = ..." (dipakai di HAMPIR SEMUA fungsi di
-- lib/data.ts dan lib/admin-data.ts) harus scan seluruh tabel. Belum terasa
-- kalau datanya masih sedikit, tapi ini best practice yang wajib ada dan
-- akan langsung terasa begitu jumlah client/konten bertambah.
--
-- Aman dijalankan kapan saja — CREATE INDEX IF NOT EXISTS tidak mengubah
-- data yang sudah ada.
-- ============================================================================

create index if not exists idx_client_users_user_id on client_users (user_id);
create index if not exists idx_client_users_client_id on client_users (client_id);

create index if not exists idx_projects_client_id on projects (client_id);
create index if not exists idx_project_tasks_project_id on project_tasks (project_id);
create index if not exists idx_performance_metrics_client_id on performance_metrics (client_id);
create index if not exists idx_content_items_client_id on content_items (client_id);
create index if not exists idx_reports_client_id on reports (client_id);

create index if not exists idx_delivery_meta_client_id on delivery_meta (client_id);
create index if not exists idx_delivery_items_client_id on delivery_items (client_id);
create index if not exists idx_quick_stats_client_id on quick_stats (client_id);
create index if not exists idx_channel_overview_client_id on channel_overview (client_id);
create index if not exists idx_upcoming_events_client_id on upcoming_events (client_id);
create index if not exists idx_attention_items_client_id on attention_items (client_id);
create index if not exists idx_activity_log_client_id on activity_log (client_id);
create index if not exists idx_files_client_id on files (client_id);
