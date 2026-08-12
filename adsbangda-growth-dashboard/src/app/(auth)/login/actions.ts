"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { isStaffRole } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

function safeNext(next: FormDataEntryValue | null): string | null {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

type AuthState = { error: string | null };
type SignUpState = { error: string | null; success?: boolean };

export async function signIn(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase belum dikonfigurasi — aplikasi sedang berjalan di mode demo." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  const supabase = await createClient();
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email atau password salah." };

  const { data: profile } = await supabase!.from("profiles").select("role").eq("id", data.user.id).single();
  const role = (profile?.role as UserRole | undefined) ?? "client";

  redirect(next ?? (isStaffRole(role) ? "/admin" : "/"));
}

export async function signUp(_prevState: SignUpState, formData: FormData): Promise<SignUpState> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase belum dikonfigurasi — aplikasi sedang berjalan di mode demo." };
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");

  if (password.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }

  const supabase = await createClient();
  const { error } = await supabase!.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { error: error.message };

  return {
    error: null,
    success: true,
  };
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase!.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
