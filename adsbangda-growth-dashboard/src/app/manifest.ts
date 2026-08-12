import type { MetadataRoute } from "next";

// Fondasi PWA — manifest ini bikin dashboard bisa "Add to Home Screen" dan
// terasa seperti aplikasi. Push notification & full offline support BELUM
// diimplementasikan (sesuai scope "siapkan fondasi, bukan build semuanya").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Adsbangda Growth Dashboard",
    short_name: "Adsbangda",
    description: "Pantau perkembangan marketing bisnis Anda secara real-time bersama Adsbangda.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAFA",
    theme_color: "#1D4ED8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
