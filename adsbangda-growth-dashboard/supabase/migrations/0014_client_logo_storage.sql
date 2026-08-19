-- ============================================================================
-- AdsBangda Growth Dashboard — Client Logo Upload (Supabase Storage)
-- ============================================================================
-- Jalankan SETELAH 0001-0013.
--
-- Sebelumnya "Logo" client cuma bisa diisi lewat URL manual (harus di-hosting
-- sendiri di tempat lain dulu — Drive/CDN dsb). Migration ini bikin bucket
-- Storage khusus supaya admin bisa UPLOAD file gambar langsung dari Admin
-- Portal (drag & drop / pilih file), lalu URL publiknya otomatis dipakai
-- sebagai `clients.logo_url` — tidak ada lagi langkah manual hosting.
--
-- Bucket PUBLIC (`public = true`) karena logo client memang harus bisa
-- ditampilkan tanpa login (dipakai <img> biasa di banyak tempat — sidebar,
-- avatar, dst, baik di Admin Portal maupun Client Portal). Yang dibatasi
-- cuma siapa yang boleh UPLOAD/UBAH/HAPUS filenya (admin saja) — bukan siapa
-- yang boleh MELIHATnya.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('client-logos', 'client-logos', true)
on conflict (id) do nothing;

drop policy if exists "Public can view client logos" on storage.objects;
create policy "Public can view client logos" on storage.objects
  for select using (bucket_id = 'client-logos');

drop policy if exists "Admins can upload client logos" on storage.objects;
create policy "Admins can upload client logos" on storage.objects
  for insert with check (bucket_id = 'client-logos' and is_admin());

drop policy if exists "Admins can update client logos" on storage.objects;
create policy "Admins can update client logos" on storage.objects
  for update using (bucket_id = 'client-logos' and is_admin())
  with check (bucket_id = 'client-logos' and is_admin());

drop policy if exists "Admins can delete client logos" on storage.objects;
create policy "Admins can delete client logos" on storage.objects
  for delete using (bucket_id = 'client-logos' and is_admin());
