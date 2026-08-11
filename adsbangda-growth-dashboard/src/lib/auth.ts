import { cache } from "react";
import { createClient, isSupabaseConfigured } from "./supabase/server";

export class ClientNotAssignedError extends Error {
  constructor() {
    super("Akun ini belum terhubung ke client manapun.");
    this.name = "ClientNotAssignedError";
  }
}

export class NotAuthorizedError extends Error {
  constructor(message = "Kamu tidak punya akses ke halaman ini.") {
    super(message);
    this.name = "NotAuthorizedError";
  }
}

// react's cache() men-dedupe pemanggilan dalam SATU request server yang
// sama — jadi kalau requireAdmin() dipanggil 7x di satu halaman (mis.
// halaman detail client yang memuat Delivery/Content/Attention/dst
// sekaligus), auth.getUser() dan query tabel profiles cuma benar-benar
// dieksekusi SEKALI, sisanya langsung pakai hasil yang sama. Ini yang
// bikin Admin Portal terasa lambat sebelumnya — tiap fungsi melakukan
// pengecekan auth sendiri-sendiri lewat network round-trip terpisah.
const getAuthUser = cache(async () => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase!.auth.getUser();
  return data.user ?? null;
});

/** Current authenticated user's id, or null (also null in demo mode). */
export const getSessionUserId = cache(async (): Promise<string | null> => {
  const user = await getAuthUser();
  return user?.id ?? null;
});

/** Current user's role ('client' | 'admin'), or null if signed out / demo mode. */
export const getSessionRole = cache(async (): Promise<"client" | "admin" | null> => {
  if (!isSupabaseConfigured) return null;
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase!.from("profiles").select("role").eq("id", user.id).single();
  return (data?.role as "client" | "admin") ?? "client";
});

/** Throws NotAuthorizedError if the current session isn't an admin. No-op in demo mode. */
export const requireAdmin = cache(async (): Promise<void> => {
  if (!isSupabaseConfigured) return; // Admin Portal terbuka bebas di mode demo.
  const role = await getSessionRole();
  if (role !== "admin") throw new NotAuthorizedError();
});
