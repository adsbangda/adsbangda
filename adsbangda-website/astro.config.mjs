// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: "https://www.adsbangda.com",

  // format: "file" -> hasilnya /kontak.html (bukan /kontak/index.html)
  // Ini WAJIB biar URL website tetap sama persis seperti sekarang,
  // supaya sitemap, backlink, dan hasil pencarian Google yang sudah ada tidak rusak.
  build: {
    format: "file",
  },
});
