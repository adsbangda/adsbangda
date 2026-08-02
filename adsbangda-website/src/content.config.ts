import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),          // judul artikel, tampil sebagai <h1>
    description: z.string(),    // ringkasan, dipakai untuk meta description & excerpt di listing
    category: z.string(),       // contoh: "SOSIAL MEDIA", "META ADS"
    date: z.string(),           // contoh: "19 Juli 2026" (format tampilan, bebas)
    readTime: z.string(),       // contoh: "6 menit baca"
    thumbGradient: z.string().default("linear-gradient(155deg,var(--coral),#2a1410)"),
    thumbText: z.string(),      // teks pendek di kartu thumbnail blog
    thumbTextColor: z.string().default("inherit"),
  }),
});

export const collections = { blog };
