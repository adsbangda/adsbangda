"use client";

import { useState } from "react";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Globe,
  HelpCircle,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [role, setRole] = useState<"client" | "admin">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Placeholder autentikasi / demo redirect
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/";
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col justify-between p-4 sm:p-6 selection:bg-[#1D4ED8] selection:text-white">
      {/* Top Navigation */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto py-2">
        <a
          href="https://www.adsbangda.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1D4ED8] font-display text-sm font-extrabold text-white shadow-md shadow-[#1D4ED8]/20 transition-transform group-hover:scale-105">
            A
          </div>
          <div className="font-display text-base font-bold text-[#18181B] tracking-tight">
            AdsBangda
          </div>
        </a>

        <a
          href="https://www.adsbangda.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-data text-xs font-semibold text-[#71717A] hover:text-[#1D4ED8] transition-colors"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Website Utama</span>
        </a>
      </header>

      {/* Login Container */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header Info */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 font-data text-[10px] font-bold text-[#1D4ED8] border border-[#1D4ED8]/20 uppercase tracking-widest">
              <Sparkles className="h-3 w-3 text-[#1D4ED8]" />
              <span>Growth Portal Auth</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#18181B] tracking-tight">
              Selamat Datang
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A]">
              Pilih portal akses dan masuk untuk mengelola campaign marketing.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#F4F4F5] border border-[#ECECEC] rounded-2xl font-data text-xs">
            <button
              type="button"
              onClick={() => setRole("client")}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all duration-200 cursor-pointer",
                role === "client"
                  ? "bg-[#FFFFFF] text-[#18181B] shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B]"
              )}
            >
              <UserCheck className="h-3.5 w-3.5 text-[#1D4ED8]" />
              <span>Portal Klien</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("admin")}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all duration-200 cursor-pointer",
                role === "admin"
                  ? "bg-[#18181B] text-white shadow-xs"
                  : "text-[#71717A] hover:text-[#18181B]"
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Admin Team</span>
            </button>
          </div>

          {/* Form Card */}
          <div className="rounded-[20px] border border-[#ECECEC] bg-[#FFFFFF] p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECECEC]">
              <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider font-data">
                {role === "client" ? "Akses Portal Klien" : "Akses Admin Internal"}
              </span>
              <span className="text-[10px] font-data font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#1D4ED8]/20">
                {role === "client" ? "Client Tenant" : "Super Admin"}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-[#18181B]">
                  Email {role === "client" ? "Klien Terdaftar" : "Tim AdsBangda"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      role === "client" ? "klien@bisnis.com" : "admin@adsbangda.com"
                    }
                    className="w-full rounded-xl border border-[#ECECEC] bg-[#FAFAFA] pl-10 pr-4 py-2.5 text-xs text-[#18181B] placeholder:text-[#71717A]/60 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:bg-[#FFFFFF] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-bold text-[#18181B]">
                    Password
                  </label>
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20AdsBangda,%20saya%20lupa%20password%20login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-data text-[11px] text-[#1D4ED8] hover:underline"
                  >
                    Lupa password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#ECECEC] bg-[#FAFAFA] pl-10 pr-4 py-2.5 text-xs text-[#18181B] placeholder:text-[#71717A]/60 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:bg-[#FFFFFF] transition-all"
                  />
                </div>
              </div>

              {/* Form Khusus Admin */}
              {role === "admin" && (
                <div className="space-y-1.5 pt-1">
                  <label htmlFor="adminPin" className="block text-xs font-bold text-[#18181B]">
                    Admin Security PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717A]" />
                    <input
                      id="adminPin"
                      type="password"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder="PIN Keamanan Internal"
                      className="w-full rounded-xl border border-[#ECECEC] bg-[#FAFAFA] pl-10 pr-4 py-2.5 font-data text-xs text-[#18181B] placeholder:text-[#71717A]/60 focus:outline-none focus:ring-2 focus:ring-[#18181B] focus:bg-[#FFFFFF] transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Sesi */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#ECECEC] text-[#1D4ED8] focus:ring-[#1D4ED8]"
                />
                <label htmlFor="remember" className="text-xs text-[#71717A]">
                  Ingat login saya di browser ini
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-data text-xs font-bold text-white transition-all shadow-md active:scale-[0.99] cursor-pointer",
                  role === "admin"
                    ? "bg-[#18181B] hover:bg-[#27272A] shadow-black/10"
                    : "bg-[#1D4ED8] hover:bg-[#1E40AF] shadow-[#1D4ED8]/25"
                )}
              >
                {isLoading ? (
                  <span>Memverifikasi Akses...</span>
                ) : (
                  <>
                    <span>
                      {role === "client" ? "Masuk ke Portal Klien" : "Masuk ke Dashboard Admin"}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Help Info Card */}
          <div className="rounded-2xl border border-[#ECECEC] bg-[#FFFFFF] p-4 flex items-center justify-between gap-3 text-xs text-[#71717A]">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#1D4ED8] shrink-0" />
              <span>Belum memiliki kredensial portal?</span>
            </div>
            <a
              href="https://wa.me/6281234567890?text=Halo%20AdsBangda,%20saya%20ingin%20meminta%20akses%20login%20dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="font-data font-bold text-[#1D4ED8] hover:underline shrink-0"
            >
              Minta Akses
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center font-data text-[11px] text-[#71717A] py-2">
        © 2026 AdsBangda Growth Portal. Multi-tenant Client & Admin Portal.
      </footer>
    </div>
  );
}