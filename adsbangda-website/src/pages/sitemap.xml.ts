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
    // Versi EN -- lihat src/pages/en/. Homepage EN jadi "en.html" (bukan
    // "en/index.html") karena konsekuensi build.format:"file" (lihat catatan
    // di Layout.astro). Halaman EN lain tetap ikut struktur "en/xxx.html".
    "en.html",
    "en/tentang.html",
    "en/portofolio.html",
    "en/portofolio-amati-coffee.html",
    "en/portofolio-batam-dental-center.html",
    "en/portofolio-insideruma.html",
    "en/portofolio-johanes-toyota-batam.html",
    "en/portofolio-primaroof-id.html",
    "en/portofolio-resa-living-id.html",
    "en/portofolio-umroh-rekivatour.html",
    "en/portofolio-wellner-academy.html",
    "en/portofolio-wellner-consulting.html",
    "en/layanan.html",
    "en/layanan-sosial-media-management.html",
    "en/layanan-content-strategy.html",
    "en/layanan-meta-ads.html",
    "en/layanan-kol-management.html",
    "en/layanan-branding-visual-identity.html",
    "en/layanan-website-landing-page.html",
    "en/layanan-creative-design.html",
    "en/layanan-digital-growth-consulting.html",
    "en/kontak.html",
  ];

  const today = new Date().toISOString().split("T")[0];
  const posts = await getCollection("blog");
  const translatedPosts = posts.filter((p) => !!p.data.body_en);

  const staticEntries = staticPages.map((page) => ({
    loc: `${SITE_URL}/${page}`,
    lastmod: today,
  }));

  const articleEntries = posts.map((p) => ({
    loc: `${SITE_URL}/artikel-${p.id}.html`,
    lastmod: parseIndoDateToISO(p.data.date) ?? today,
  }));

  // Blog listing & artikel EN -- cuma yang beneran punya halaman EN (body_en terisi).
  const enBlogEntries = [
    { loc: `${SITE_URL}/en/blog.html`, lastmod: today },
    ...translatedPosts.map((p) => ({
      loc: `${SITE_URL}/en/artikel-${p.id}.html`,
      lastmod: parseIndoDateToISO(p.data.date) ?? today,
    })),
  ];

  const allEntries = [...staticEntries, ...articleEntries, ...enBlogEntries];

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
