import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

// Geist + Geist Mono — dua-duanya variable font (rentang weight penuh
// 100–900), jadi kontras bold/reguler/semibold di seluruh UI (headings,
// tombol, label data) benar-benar renders sebagai weight yang berbeda,
// bukan dibatasi ke 2-3 cut fixed seperti font sebelumnya. Satu keluarga
// font (Geist) dipakai untuk display & body sekaligus — hierarki dibentuk
// lewat weight, bukan mencampur banyak typeface berbeda — plus Geist Mono
// yang serasi untuk angka/label data, kesan lebih premium & khas produk
// analytics, bukan pairing template SaaS generik.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Growth Dashboard | Adsbangda",
  description: "Pantau perkembangan marketing bisnis Anda secara real-time bersama Adsbangda.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Adsbangda",
  },
};

export const viewport = {
  themeColor: "#1D4ED8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
