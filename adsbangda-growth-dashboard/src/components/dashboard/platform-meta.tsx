export { CONTENT_TYPE_LABEL } from "@/lib/types";

/**
 * Logo resmi tiap platform (file di /public/logos) + label tampilan.
 * SATU sumber kebenaran — dipakai di SocialMediaPerformance dan
 * WeeklyContentCalendar supaya konsisten dan tidak perlu diubah di banyak
 * tempat kalau logo/label berubah.
 *
 * Facebook sumbernya bulat (di-scale up dikit lewat CSS supaya nutup penuh
 * sampai pojok kotak rounded-square, tidak nyisain celah putih di sudut).
 */
export const PLATFORM_META: Record<string, { src: string; label: string; scaleUp?: boolean }> = {
  instagram: { src: "/logos/instagram.svg", label: "Instagram" },
  tiktok: { src: "/logos/tiktok.webp", label: "TikTok", scaleUp: true },
  facebook: { src: "/logos/facebook.webp", label: "Facebook", scaleUp: true },
  x: { src: "/logos/x.webp", label: "X", scaleUp: true },
  linkedin: { src: "/logos/linkedin.png", label: "LinkedIn" },
  threads: { src: "/logos/threads.avif", label: "Threads", scaleUp: true },
};
