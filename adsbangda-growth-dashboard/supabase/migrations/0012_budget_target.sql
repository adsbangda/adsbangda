-- ============================================================================
-- AdsBangda Growth Dashboard — Budget Target (Meta Ads)
-- ============================================================================
-- Jalankan SETELAH 0001-0011.
--
-- Kolom baru buat fitur "Budget Terpakai" di Overview (spend / budgetTarget)
-- — sebelumnya tidak ada field ini sama sekali di schema, jadi tidak bisa
-- dihitung dari data yang sudah ada. Nullable & tidak ada default, jadi aman
-- ditambahkan tanpa mempengaruhi baris yang sudah ada (budget_target akan
-- NULL untuk snapshot lama, Overview akan sembunyikan progress bar itu
-- kalau nilainya belum diisi admin, bukan tampilkan 0/0).
-- ============================================================================

alter table performance_metrics add column if not exists budget_target numeric;
