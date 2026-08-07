import { createBrowserClient } from "@supabase/ssr";

// Dipakai di Client Components. Kembalikan null kalau env belum di-set,
// supaya app tetap jalan di "mode demo" (lihat lib/data.ts) sebelum
// project Supabase sungguhan dikonfigurasi.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createBrowserClient(url, key);
}
