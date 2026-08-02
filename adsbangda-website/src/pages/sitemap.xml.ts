// src/pages/sitemap.xml.ts
// Sitemap ini generate OTOMATIS setiap build.
// Halaman statis di-list manual di bawah (jarang berubah),
// tapi daftar artikel blog diambil OTOMATIS dari src/content/blog/
// jadi setiap kamu nambah artikel baru, otomatis muncul di sitemap juga.
import { getCollection } from "astro:content";

export async function GET() {
  const staticPages = [
    "",
    "tentang.html",
    "portofolio.html",
    "portofolio-amati-coffee.html",
    "portofolio-batam-dental-center.html",
    "portofolio-insideruma.html",
    "portofolio-johanes-toyota-batam.html",
    "portofolio-primaroof-id.html",
    "portofolio-resa-living-id.html",
    "portofolio-umroh-rekivatour.html",
    "portofolio-wellner-academy.html",
    "portofolio-wellner-consulting.html",
    "layanan.html",
    "layanan-sosial-media-management.html",
    "layanan-content-strategy.html",
    "layanan-meta-ads.html",
    "layanan-kol-management.html",
    "layanan-branding-visual-identity.html",
    "layanan-website-landing-page.html",
    "layanan-creative-design.html",
    "layanan-digital-growth-consulting.html",
    "blog.html",
    "kontak.html",
  ];

  const posts = await getCollection("blog");
  const articlePages = posts.map((p) => `artikel-${p.id}.html`);

  const allPages = [...staticPages, ...articlePages];
  const today = new Date().toISOString().split("T")[0];

  const urls = allPages
    .map(
      (page) => `  <url>
    <loc>https://www.adsbangda.com/${page}</loc>
    <lastmod>${today}</lastmod>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
