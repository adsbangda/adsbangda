# Adsbangda Growth Dashboard

Platform terpisah untuk client Adsbangda memantau perkembangan marketing
mereka — bukan pengganti website utama (`www.adsbangda.com`), tapi
pelengkap yang jalan di subdomain sendiri (`dashboard.adsbangda.com`).

## Status: MVP — Mode Demo

Project ini bisa langsung dijalankan **tanpa setup Supabase** untuk keperluan
review desain & alur. Semua data yang tampil berasal dari
`src/lib/mock-data.ts`, ditata ulang lewat `src/lib/data.ts`.

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` — akan langsung menampilkan Overview dashboard
dengan data contoh client "Amati Coffee".

## Menyalakan Mode Live (data sungguhan)

1. Buat project baru di [supabase.com](https://supabase.com)
2. Jalankan migration: buka **SQL Editor** di dashboard Supabase, paste isi
   `supabase/migrations/0001_init.sql`, lalu Run
3. Copy `.env.example` jadi `.env.local`, isi dengan URL & anon key dari
   Settings → API
4. Restart `npm run dev` — aplikasi otomatis pindah dari mock data ke query
   Supabase asli (lihat `src/lib/data.ts`, tidak ada komponen UI yang perlu
   diubah)
5. Input data client pertama secara manual lewat SQL Editor atau bikin
   admin tool internal sederhana (di luar scope MVP ini)

## Struktur

```
src/
├── app/
│   ├── (auth)/login/        Halaman login client
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
- **IBM Plex Mono** — angka, label, data (dipertahankan sebagai signature
  device dari situs utama)

## Roadmap ke "Adsbangda Operating System"

Skema database sengaja dibuat generik (`projects` + `project_tasks` tidak
hardcode ke 1 use-case) supaya bisa berkembang tanpa migrasi besar:

1. **Sekarang:** Client login, lihat overview, performance (manual input),
   project progress, content calendar, report PDF
2. **Berikutnya:** Admin tool internal untuk tim Adsbangda input data
   (saat ini masih lewat SQL Editor manual)
3. **Lalu:** Integrasi live Meta Marketing API & Instagram Graph API
   (menggantikan input manual di `performance_metrics`)
4. **Nanti:** Project management penuh, automation, AI assistant — dibangun
   di atas tabel `projects`/`project_tasks` yang sudah ada, bukan sistem baru
