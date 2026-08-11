import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// PERINGATAN: file ini memakai SUPABASE_SERVICE_ROLE_KEY — key ini punya akses
// PENUH ke seluruh database, melewati RLS sama sekali. JANGAN PERNAH import
// file ini dari komponen client ("use client") atau kirim key ini ke browser.
// Hanya boleh dipanggil dari Server Actions / Route Handlers, dan hanya untuk
// operasi yang benar-benar butuh hak admin (mis. auth.admin.createUser, yang
// tidak bisa dilakukan lewat anon/publishable key).
//
// Kalau env ini belum diisi, semua fungsi yang butuh client ini akan
// melempar error yang jelas — fitur "Buat User Baru" di Admin Portal jadi
// tidak aktif, tapi cara lama (client daftar sendiri lewat /login lalu
// dihubungkan admin) tetap berfungsi tanpa key ini.

export function isServiceRoleConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY belum diisi. Isi env ini (lihat .env.example) untuk mengaktifkan pembuatan user langsung dari Admin Portal."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
