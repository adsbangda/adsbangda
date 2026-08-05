// src/pages/sitemap.xml.ts
// Sitemap ini generate OTOMATIS setiap build.
// Halaman statis di-list manual di bawah (jarang berubah),
// tapi daftar artikel blog diambil OTOMATIS dari src/content/blog/
// jadi setiap kamu nambah artikel baru, otomatis muncul di sitemap juga.
//
// CATATAN AUDIT SEO:
// - "cari.html" (hasil pencarian internal) SENGAJA tidak dimasukkan ke sitemap --
//   halaman ini juga diberi noindex di src/pages/cari.astro. Rekomendasi resmi
//   Google Search Central: jangan submit/index halaman hasil pencarian internal.
// - lastmod artikel sekarang pakai tanggal asli dari frontmatter (dikonversi ke
//   ISO 8601), bukan tanggal build hari ini -- supaya sinyal freshness ke Google akurat.
import { getCollection } from "astro:content";
import { parseIndoDateToISO } from "../lib/date";

const SITE_URL = "https://www.adsbangda.com";

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

  const today = new Date().toISOString().split("T")[0];
  const posts = await getCollection("blog");

  const staticEntries = staticPages.map((page) => ({
    loc: `${SITE_URL}/${page}`,
    lastmod: today,
  }));

  const articleEntries = posts.map((p) => ({
    loc: `${SITE_URL}/artikel-${p.id}.html`,
    lastmod: parseIndoDateToISO(p.data.date) ?? today,
  }));

  const allEntries = [...staticEntries, ...articleEntries];

  const urls = allEntries
    .map(
      (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
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
