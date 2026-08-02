import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),          // judul artikel (ID), tampil sebagai <h1>
    description: z.string(),    // ringkasan (ID), buat meta description & excerpt listing
    category: z.string(),       // contoh: "SOSIAL MEDIA", "META ADS"
    date: z.string(),           // contoh: "19 Juli 2026" (format tampilan, bebas)
    readTime: z.string(),       // contoh: "6 menit baca"
    thumbGradient: z.string().default("linear-gradient(155deg,var(--coral),#2a1410)"),
    thumbText: z.string(),      // teks pendek di kartu thumbnail blog
    thumbTextColor: z.string().default("inherit"),
    // --- versi Inggris (opsional -- kalau kosong, tombol EN cuma translate nav/footer) ---
    title_en: z.string().optional(),
    description_en: z.string().optional(),
    category_en: z.string().optional(),
    readTime_en: z.string().optional(),
    thumbText_en: z.string().optional(),
    body_en: z.string().optional(), // isi artikel versi Inggris, ditulis sebagai HTML mentah (<p>...</p>, <h2>...</h2>, dst)
  }),
});

export const collections = { blog };
