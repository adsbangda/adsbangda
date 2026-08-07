# Adsbangda Growth Dashboard

Platform terpisah untuk client Adsbangda memantau perkembangan marketing
mereka — bukan pengganti website utama (`www.adsbangda.com`, Astro +
Cloudflare Pages), tapi aplikasi berdiri sendiri di `dashboard.adsbangda.com`
(Next.js + Supabase + Vercel).

**Repo ini SENGAJA dipisah dari repo website utama.** Jangan digabung.

## Status: MVP — Mode Demo

Semua data yang tampil berasal dari `src/lib/mock-data.ts`. Tidak butuh
Supabase, tidak butuh environment variable apa pun untuk menjalankan atau
men-deploy versi ini.

```bash
npm install
npm run build
npm run dev
```

Buka `http://localhost:3000` — langsung tampil dengan data contoh client
"Amati Coffee".

## Deploy ke Vercel

### 1. Push ke GitHub (dari nol)

```bash
cd adsbangda-growth-dashboard
git init
git add .
git commit -m "Initial commit: Adsbangda Growth Dashboard MVP"
git branch -M main
git remote add origin https://github.com/<username-atau-org>/adsbangda-growth-dashboard.git
git push -u origin main
```

Pastikan nama repo GitHub-nya **`adsbangda-growth-dashboard`** — terpisah
total dari repo website utama.

### 2. Connect ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New → Project**
2. Pilih repo `adsbangda-growth-dashboard` dari GitHub
3. Vercel otomatis mendeteksi framework **Next.js** — biarkan semua setting
   default, tidak perlu diubah:
   - Framework Preset: `Next.js` (auto)
   - Build Command: `npm run build` (auto)
   - Output Directory: (auto, jangan diisi manual)
   - Install Command: `npm install` (auto)
   - Root Directory: `.` (kosongkan/biarkan default — karena repo ini
     sudah standalone, bukan monorepo)
4. Environment Variables: **kosongkan dulu** — mode demo tidak butuh env
   apa pun. Nanti tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` di sini kalau sudah siap ke mode live
   (lihat `.env.example`)
5. Klik **Deploy**

### 3. Tambah custom domain

1. Di project Vercel → **Settings → Domains** → tambahkan
   `dashboard.adsbangda.com`
2. Vercel akan kasih tahu CNAME record yang perlu ditambahkan
3. Buka DNS Cloudflare untuk domain `adsbangda.com` (DNS-nya tetap boleh di
   Cloudflare walau hosting-nya di Vercel) → tambahkan CNAME sesuai
   instruksi Vercel
4. Tunggu propagasi DNS (biasanya beberapa menit sampai 1 jam)

## Menyalakan Mode Live (nanti, belum sekarang)

1. Buat project baru di [supabase.com](https://supabase.com)
2. Jalankan migration: SQL Editor → paste isi `supabase/migrations/0001_init.sql` → Run
3. Di Vercel → Settings → Environment Variables → isi
   `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Redeploy — aplikasi otomatis pindah dari mock data ke query Supabase asli
   (lihat `src/lib/data.ts`), tidak ada komponen UI yang perlu diubah

## Struktur

```
src/
├── app/
│   ├── (auth)/login/        Halaman login client (UI, belum disambung auth)
│   └── (app)/               Shell dashboard (sidebar + halaman)
│       ├── page.tsx             Overview
│       ├── performance/         Marketing Performance
│       ├── projects/            Project Progress
│       ├── content-calendar/    Content Calendar
│       └── reports/             Report Center
├── components/dashboard/    StatCard, StatusBadge, ProgressBar, Sidebar, dll
└── lib/
    ├── data.ts              Data access layer (mock <-> Supabase, transparan)
    ├── mock-data.ts         Data contoh mode demo
    ├── types.ts             Tipe data, sinkron dengan skema database
    └── supabase/            Client Supabase (browser & server)
supabase/migrations/         Skema database + Row Level Security
```

## Prinsip Desain

Warna, tipografi, dan radius diturunkan langsung dari
`public/assets/css/style.css` situs utama supaya dashboard terasa satu
identitas dengan `www.adsbangda.com`, walau repo & stack-nya sengaja
dipisah. Lihat token di `src/app/globals.css`.

- **Ink** `#18181B` — teks utama & sidebar gelap
- **Accent** `#1D4ED8` — satu-satunya warna aksen brand
- **Plus Jakarta Sans** — heading
- **Instrument Sans** — body text
- **IBM Plex Mono** — angka, label, data

## Roadmap ke "Adsbangda Operating System"

1. **Sekarang:** Client login (UI), overview, performance (manual input),
   project progress, content calendar, report PDF — mode demo
2. **Berikutnya:** Supabase Auth aktif, admin tool internal untuk input data
3. **Lalu:** Integrasi live Meta Marketing API & Instagram Graph API
4. **Nanti:** Project management penuh, automation, AI assistant
