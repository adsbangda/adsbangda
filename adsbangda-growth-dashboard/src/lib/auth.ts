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

/** Current authenticated user's id, or null (also null in demo mode). */
export async function getSessionUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase!.auth.getUser();
  return data.user?.id ?? null;
}

/** Current user's role ('client' | 'admin'), or null if signed out / demo mode. */
export async function getSessionRole(): Promise<"client" | "admin" | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data: auth } = await supabase!.auth.getUser();
  if (!auth.user) return null;

  const { data } = await supabase!.from("profiles").select("role").eq("id", auth.user.id).single();
  return (data?.role as "client" | "admin") ?? "client";
}

/** Throws NotAuthorizedError if the current session isn't an admin. No-op in demo mode. */
export async function requireAdmin(): Promise<void> {
  if (!isSupabaseConfigured) return; // Admin Portal terbuka bebas di mode demo.
  const role = await getSessionRole();
  if (role !== "admin") throw new NotAuthorizedError();
}
