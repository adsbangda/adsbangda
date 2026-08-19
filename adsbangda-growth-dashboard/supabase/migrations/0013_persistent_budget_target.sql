-- ============================================================================
-- AdsBangda Growth Dashboard — Persistent Meta Ads Budget Target
-- ============================================================================
-- Jalankan SETELAH 0001-0012.
--
-- Sebelumnya `budget_target` ada di `performance_metrics` (harus diisi ULANG
-- di SETIAP snapshot mingguan supaya "Budget Terpakai" muncul — tidak
-- praktis, karena budget bulanan biasanya TETAP sama selama beberapa
-- minggu/bulan). Dipindah jadi kolom di `clients`, diisi/diubah sesekali
-- lewat card terpisah di Admin → Meta Ads, terpisah dari form input
-- performance mingguan.
--
-- `performance_metrics.budget_target` SENGAJA TIDAK di-drop (biar tidak
-- destructive & data historis lama tetap ada) — cuma tidak dipakai lagi
-- oleh kode aplikasi mulai sekarang.
-- ============================================================================

alter table clients add column if not exists meta_ads_budget_target numeric;
