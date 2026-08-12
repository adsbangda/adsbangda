import { cache } from "react";
import { createClient, isSupabaseConfigured } from "./supabase/server";
import { STAFF_ROLES, type UserRole } from "./types";

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

/** Current user's role (lihat UserRole di lib/types.ts), atau null kalau signed out / demo mode. */
export const getSessionRole = cache(async (): Promise<UserRole | null> => {
  if (!isSupabaseConfigured) return null;
  const user = await getAuthUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase!.from("profiles").select("role").eq("id", user.id).single();
  return (data?.role as UserRole) ?? "client";
});

/**
 * Throws NotAuthorizedError kalau sesi sekarang bukan admin-tier
 * (super_admin/admin). No-op di mode demo. Dipakai untuk mutasi
 * data client (create/update/delete) — belum dibedakan lebih detail per
 * role staff, itu tugas permission matrix di fase berikutnya.
 */
export const requireAdmin = cache(async (): Promise<void> => {
  if (!isSupabaseConfigured) return; // Admin Portal terbuka bebas di mode demo.
  const role = await getSessionRole();
  if (role !== "super_admin" && role !== "admin") throw new NotAuthorizedError();
});

/**
 * Throws NotAuthorizedError kalau sesi sekarang bukan staff sama sekali
 * (super_admin/admin/account_manager/creative). Ini gate yang lebih longgar
 * dari requireAdmin() — dipakai untuk mengizinkan MASUK ke Admin Portal
 * (baca data), sementara mutasi tetap lewat requireAdmin() sampai
 * permission matrix granular per role dibangun di fase berikutnya.
 */
export const requireStaff = cache(async (): Promise<void> => {
  if (!isSupabaseConfigured) return;
  const role = await getSessionRole();
  if (!role || !STAFF_ROLES.includes(role)) throw new NotAuthorizedError();
});

/** True kalau super_admin/admin/account_manager/creative. False untuk client atau signed-out. No-op-safe (false) di mode demo. */
export const isStaffRole = (role: UserRole | null): boolean => !!role && STAFF_ROLES.includes(role);
