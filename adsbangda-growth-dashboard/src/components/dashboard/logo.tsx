import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Wordmark resmi Adsbangda. `tone="dark"` untuk latar terang (dipakai di
 * sidebar/topbar), `tone="white"` untuk latar biru/gelap (panel brand di
 * halaman login, dsb). Aset sumber: public/assets/brand/adsbangda-logo-*.png
 * — sudah di-crop pas ke tepi wordmark-nya sendiri (cuma nyisain 3px
 * breathing room), bukan lagi kanvas 609×152 dengan ~20px padding
 * transparan di semua sisi seperti aset asli. Padding asli itu yang bikin
 * logo kelihatan "nggak rata kiri" walau container-nya sudah flush-left —
 * sekarang tepi kiri gambar = tepi kiri wordmark beneran.
 */
export function Logo({
  tone = "dark",
  className,
  height = 26,
}: {
  tone?: "dark" | "white";
  className?: string;
  height?: number;
}) {
  const src = tone === "white" ? "/assets/brand/adsbangda-logo-white.png" : "/assets/brand/adsbangda-logo-dark.png";
  // Aspect ratio aset yang SUDAH di-crop (577:120) — beda dari file asli
  // (609:152) karena padding transparannya sudah dibuang.
  const width = Math.round(height * (577 / 120));

  return (
    <Image
      src={src}
      alt="Adsbangda"
      width={width}
      height={height}
      priority
      className={cn("select-none", className)}
      style={{ height, width: "auto" }}
    />
  );
}
