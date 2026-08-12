import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Wordmark resmi Adsbangda. `tone="dark"` untuk latar terang (dipakai di
 * sidebar/topbar), `tone="white"` untuk latar biru/gelap (panel brand di
 * halaman login, dsb). Aset sumber: public/assets/brand/adsbangda-logo-*.png
 * (background sudah ditransparankan dari file logo asli).
 */
export function Logo({
  tone = "dark",
  className,
  height = 22,
}: {
  tone?: "dark" | "white";
  className?: string;
  height?: number;
}) {
  const src = tone === "white" ? "/assets/brand/adsbangda-logo-white.png" : "/assets/brand/adsbangda-logo-dark.png";
  // Aspect ratio aset asli ~ 609:152
  const width = Math.round(height * (609 / 152));

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
