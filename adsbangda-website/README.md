# Website adsbangda.com (versi Astro)

Ini versi baru website adsbangda.com yang sudah pakai sistem blog otomatis.
Tampilan & isi SAMA PERSIS dengan versi HTML lama -- yang beda cuma cara
nambah artikel blog baru, sekarang jauh lebih gampang.

## Cara kerja sekarang (ringkas)

- Semua halaman tetap ada di URL yang sama (`/kontak.html`, `/layanan.html`, dst)
- Nav & footer sekarang cuma ada di **satu tempat** (`src/layouts/Layout.astro`)
  -- ubah sekali, otomatis kepakai di semua 25 halaman
- Artikel blog sekarang berupa file Markdown (`.md`) di `src/content/blog/`
  -- halaman artikel, kartu di `/blog.html`, dan `sitemap.xml` **otomatis**
  ke-generate dari file-file itu setiap kali di-build

## Setup pertama kali (sekali saja)

Butuh Node.js versi 18 ke atas sudah terinstall di laptop.

```bash
npm install
```

## Menjalankan di laptop (buat lihat preview sebelum di-publish)

```bash
npm run dev
```

Lalu buka `http://localhost:4321` di browser. Setiap kamu simpan perubahan,
halaman otomatis refresh sendiri.

## Cara nambah artikel blog baru (INI YANG PALING PENTING)

1. Buka folder `src/content/blog/`
2. Copy file `_TEMPLATE-cara-bikin-artikel-baru.md.txt`, rename jadi
   misalnya `tips-content-pillar-2026.md` (huruf kecil, pakai tanda strip,
   **harus** berakhiran `.md`, bukan `.md.txt`)
3. Nama file ini yang menentukan URL-nya. Contoh: kalau nama filenya
   `tips-content-pillar-2026.md`, URL artikelnya jadi
   `adsbangda.com/artikel-tips-content-pillar-2026.html` (otomatis,
   nggak perlu kamu atur manual)
4. Buka file barunya, isi bagian atas (di antara `---` `---`) dengan
   judul, ringkasan, kategori, tanggal, dll
5. Tulis isi artikel di bawahnya pakai format teks biasa (Markdown) --
   nggak perlu HTML sama sekali. Cara nulisnya ada dicontohkan di
   dalam file template.
6. Simpan, lalu `git add`, `git commit`, `git push` seperti biasa.
   Cloudflare otomatis build & publish.

**Itu aja.** Nggak perlu edit `blog.html`, nggak perlu edit `sitemap.xml`,
nggak perlu bikin file HTML manual -- semuanya otomatis nyambung sendiri.

## Cara ubah teks/nav/footer yang sama di semua halaman

Edit `src/layouts/Layout.astro` -- perubahan di sini otomatis kepakai
di seluruh 25 halaman.

## Cara ubah halaman tertentu (misal isi halaman Tentang)

Edit file `.astro` yang sesuai di folder `src/pages/`. Nama filenya
mengikuti nama halaman, misalnya `tentang.astro` untuk halaman Tentang.

## Build untuk di-deploy

```bash
npm run build
```

Hasilnya ada di folder `dist/` -- ini yang di-upload/dideploy, bukan folder `src/`.

## Setting build di Cloudflare Pages

Kalau kamu bikin project BARU di Cloudflare Pages (ganti dari project lama
yang langsung serve HTML statis), pastikan setting build-nya:

| Setting | Nilai |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (kosongkan/default) |

Cloudflare akan otomatis `npm install` dan jalankan build command di atas
setiap kali ada push ke GitHub.

## Struktur folder penting

```
src/
├── layouts/
│   ├── Layout.astro       <- nav, footer, head (dipakai SEMUA halaman)
│   └── BlogPost.astro     <- bungkus artikel blog (header artikel, CTA)
├── pages/
│   ├── index.astro        <- homepage
│   ├── tentang.astro
│   ├── kontak.astro
│   ├── layanan*.astro     <- 8 halaman layanan
│   ├── portofolio*.astro  <- halaman listing + 9 detail portofolio
│   ├── blog.astro         <- listing blog (OTOMATIS dari content/blog/)
│   ├── artikel-[article].astro  <- template halaman detail artikel (OTOMATIS)
│   └── sitemap.xml.ts     <- sitemap (OTOMATIS)
└── content/
    └── blog/               <- taruh file .md artikel baru DI SINI
public/
└── assets/
    ├── css/style.css       <- CSS utama (masih sama kayak sebelumnya)
    ├── js/main.js          <- JS utama (masih sama kayak sebelumnya)
    └── img/                <- semua gambar
```

## Catatan penting

- Artikel blog yang baru (via Markdown) **tidak** punya toggle bahasa
  ID/EN seperti halaman lain -- sengaja disederhanakan biar nulis artikel
  baru gampang. 2 artikel lama yang sudah ada juga sudah disesuaikan
  (versi Indonesia-nya saja).
- Kalau butuh toggle bahasa untuk artikel blog juga, ini bisa ditambahkan
  nanti, tapi butuh sedikit kerja ekstra di struktur datanya.
