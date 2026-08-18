# Adsbangda Growth Dashboard

Platform terpisah untuk client Adsbangda memantau perkembangan marketing
mereka, plus Admin Portal internal untuk tim Adsbangda mengelola datanya —
bukan pengganti website utama (`www.adsbangda.com`, Astro + Cloudflare
Pages), tapi aplikasi berdiri sendiri di `dashboard.adsbangda.com`
(Next.js + Supabase + Vercel).

**Repo ini SENGAJA dipisah dari repo website utama.** Jangan digabung.

## Dua mode berjalan berdampingan

Aplikasi ini otomatis mendeteksi apakah env Supabase sudah diisi
(`.env.local`). Tidak ada kode yang perlu diubah untuk pindah mode.

| | **Mode Demo** (default, tanpa setup apa pun) | **Mode Live** (Supabase terhubung) |
|---|---|---|
| Data | `src/lib/mock-data.ts`, statis di memori | Database Supabase sungguhan |
| Login | Tidak ada — semua halaman terbuka bebas | Wajib, real Supabase Auth (email+password) |
| Admin Portal (`/admin`) | Terbuka bebas, mutasi hanya bertahan sampai server restart | Wajib role `admin`, tersimpan permanen |
| Cocok untuk | Preview desain & alur ke client/tim | Pemakaian sungguhan |

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` — langsung tampil (mode demo, data contoh
client "Amati Coffee"). Buka `http://localhost:3000/admin` untuk lihat
Admin Portal-nya juga, tanpa perlu login di mode demo.

## Menyalakan Mode Live

### 1. Buat project Supabase

Buat project baru di [supabase.com](https://supabase.com), lalu jalankan
**SEMUA file migration secara berurutan** (0001, 0002, 0003, dst — ikuti
urutan nomornya) lewat **SQL Editor** (paste isi filenya satu-satu, klik
Run). Jangan skip satu pun, termasuk `0011_realtime.sql` — tanpa itu, Live
Sync (lihat bagian "Live Sync" di bawah) akan terpasang tapi diam saja,
tidak ada event yang pernah sampai.

Dua yang paling penting untuk fungsi dasar:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_admin_portal.sql`

Migration kedua ini juga memperbaiki beberapa kolom yang kurang di migration
pertama (mis. `platform`/`type` di `content_items`) — jangan lewati.

### 2. Isi environment variable

Copy `.env.example` ke `.env.local`, isi dengan URL & anon key dari
Settings → API di project Supabase kamu:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Tidak butuh `service_role` key sama sekali — semua operasi admin (kelola
role & akses client per user) lewat fungsi database aman
(`security definer`) yang sudah dibuatkan di migration 0002.

### 3. Buat admin pertama

1. `npm run dev`, buka `/login`, klik tab **Daftar**, buat akun dengan email
   kamu sendiri.
2. Buka **SQL Editor** Supabase, jalankan (ganti emailnya):
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'kamu@adsbangda.com');
   ```
3. Login lagi di `/login` — sekarang otomatis masuk ke `/admin`.

Admin selanjutnya bisa dipromosikan lewat halaman **Admin → Team & Akses**
tanpa perlu SQL lagi.

### 4. Buat client pertama & akun login-nya

Di `/admin`, klik **Tambah Client**, isi nama & industri, lalu isi Monthly
Delivery/Content Calendar/dll di halaman detail client.

Untuk akun login client-nya, ada dua cara:

**Cara A — Agency yang buat akunnya (direkomendasikan kalau kamu mau pegang
kendali penuh atas email/password client, mis. `namaclient@adsbangda.com`):**

1. Isi env `SUPABASE_SERVICE_ROLE_KEY` (lihat `.env.example` — ambil dari
   Supabase → Settings → API Keys → **Secret keys**, BUKAN yang publishable).
   Redeploy setelah isi ini di Vercel.
2. Buka **Admin → Team & Akses** → bagian **"Buat User Baru"** sudah aktif
   (kalau masih ada peringatan kuning, berarti key di atas belum kebaca).
3. Isi nama, email, password, role `client`, dan langsung pilih client-nya
   di dropdown — user langsung dibuat, email otomatis terverifikasi, dan
   langsung terhubung ke client tersebut dalam satu langkah.
4. Kasih tahu client-nya email + password itu supaya mereka bisa login.

**Cara B — Client daftar sendiri (tidak butuh service role key):**

1. Client buka `/login` → tab **Daftar** → isi data sendiri. Role default
   `client`, tapi belum terhubung ke client manapun (mereka akan melihat
   halaman `/pending` sampai dihubungkan).
2. Admin buka **Admin → Team & Akses**, bagian **"Akses Client"**,
   hubungkan user tadi ke client yang sesuai.

Dua-duanya bisa dipakai bersamaan — pilih sesuai kebutuhan per client.

### 5. Deploy ke Vercel

Sama seperti sebelumnya — connect repo, isi environment variable di atas
(termasuk `SUPABASE_SERVICE_ROLE_KEY` kalau mau pakai Cara A) di Vercel →
Settings → Environment Variables, deploy. Jangan lupa tambahkan URL
production ke **Supabase → Authentication → URL Configuration** (Site URL +
Redirect URLs) supaya auth berfungsi di production.

## Live Sync — Admin Portal ↔ Client Portal tanpa refresh

Client Portal dan halaman detail client di Admin Portal saling terhubung
lewat **Supabase Realtime**: begitu ada perubahan data untuk satu client —
dari sisi manapun (admin update Content List, client approve/request
revision, dsb) — semua tab yang sedang terbuka untuk client yang sama
otomatis narik data terbaru sendiri, tanpa siapa pun perlu menekan reload.

- Komponennya: `src/components/realtime-refresh.tsx` — dipasang sekali di
  `src/app/(app)/layout.tsx` (Client Portal) dan
  `src/app/admin/clients/[clientId]/layout.tsx` (Admin Portal, per client).
- Prasyaratnya: `supabase/migrations/0011_realtime.sql` sudah dijalankan
  (mengaktifkan Realtime publication untuk semua tabel client-scoped).
  **Kalau lupa jalankan ini, portal tetap jalan normal tapi kembali terasa
  perlu refresh manual** — tidak ada error yang muncul, jadi gampang
  kelewat kalau sedang setup project baru.
- Keamanannya tetap dipegang RLS yang sudah ada sejak migration 0001/0002 —
  Realtime cuma broadcast baris yang memang boleh dibaca subscriber-nya.
  Filter `client_id=eq.<id>` di channel murni buat efisiensi, bukan lapisan
  keamanan tambahan.
- Mode Demo: no-op total (tidak ada Supabase = tidak ada apa pun untuk
  didengar), jadi aman dipasang tanpa syarat di kedua layout.

### Overview Client Portal — disambungkan ulang ke data asli

Sebelumnya `getMonthlyDelivery`, `getAttentionItems`, `getChannelOverview`,
`getUpcomingEvents` (`src/lib/data.ts`) membaca 5 tabel peninggalan skema
awal (`delivery_meta`, `delivery_items`, `attention_items`,
`channel_overview`, `upcoming_events`) yang **tidak ada satu pun admin UI
yang menulis ke situ** — jadi widget "Progress Bulan Ini", "Needs Your
Attention", "Channel Overview", dan "Upcoming" di Overview tidak akan
pernah berubah walau Live Sync sudah aktif, karena memang tidak ada
perubahan data untuk dipantau.

Sudah di-rewire supaya baca dari sumber yang SAMA dengan yang Admin Portal
pakai sendiri (`content_items`, `content_targets`, `performance_metrics`)
— mirroring persis logika `adminComputeOverallProgress()` dan komputasi
lain di `src/app/admin/clients/[clientId]/page.tsx`, supaya angka yang
client lihat selalu sama dengan yang admin lihat, dan otomatis ikut Live
Sync begitu admin mengedit Content List / Content Delivery target /
Performance snapshot.

**Belum ikut di-rewire** (masih baca tabel lama tanpa admin UI, tapi tidak
ada di 4 widget yang dilaporkan): `getQuickStats()` (`quick_stats`) dan
`getRecentActivity()` (`activity_log`) — "What AdsBangda Did" & angka
Quick Stats di atasnya. Sama kelasnya dengan bug di atas, cuma belum
diprioritaskan karena belum dilaporkan.

## Yang diperbaiki dari MVP sebelumnya

Waktu bikin migration 0002, ditemukan beberapa mismatch antara skema 0001
dan kode aplikasi (peninggalan waktu skema ditulis duluan sebelum semua
komponen selesai) — sudah diperbaiki semua:

- `content_items` kekurangan kolom `platform` dan `type` yang dipakai UI.
- `project_tasks` kekurangan kolom `owner`, `due_date`, `blocker`.
- `projects.status` dan `content_items.status` check constraint-nya tidak
  sinkron dengan nilai yang benar-benar dipakai kode.
- `reports` kekurangan kolom `summary`.
- Semua query Supabase sekarang konsisten dipetakan snake_case ↔ camelCase
  lewat `src/lib/mappers.ts` (sebelumnya beberapa fungsi mengembalikan row
  mentah yang tidak cocok dengan tipe TypeScript-nya).

## Struktur

```
src/
├── middleware.ts             Proteksi route (redirect ke /login, blokir /admin non-admin)
├── app/
│   ├── (auth)/login/         Login + signup nyata (Supabase Auth)
│   ├── pending/               Halaman untuk user login tapi belum terhubung ke client
│   ├── (app)/                 Client Portal — Overview, Performance, Projects, dst
│   └── admin/                 Admin Portal
│       ├── page.tsx               Dashboard (daftar client)
│       ├── clients/new/           Tambah client
│       ├── clients/[clientId]/    Kelola semua konten satu client
│       └── team/                  Kelola role & akses client per user
├── components/
│   ├── dashboard/             Komponen shared Client Portal
│   ├── admin/                 Komponen shared Admin Portal
│   └── realtime-refresh.tsx   Live Sync (Supabase Realtime -> router.refresh())
└── lib/
    ├── data.ts                 Data access CLIENT (mock <-> Supabase, transparan)
    ├── admin-data.ts            Data access + mutasi ADMIN (mock <-> Supabase)
    ├── mappers.ts               Konversi snake_case <-> camelCase, satu tempat
    ├── auth.ts                  Helper session/role + guard requireAdmin()
    ├── mock-data.ts              Data contoh mode demo
    ├── types.ts                  Tipe data, sinkron dengan skema database
    └── supabase/                 Client Supabase (browser, server, middleware)
supabase/migrations/
    ├── 0001_init.sql              Skema awal
    └── 0002_admin_portal.sql      Perbaikan skema + tabel admin + RLS + fungsi role
```

## Prinsip Desain

Warna, tipografi, dan radius diturunkan langsung dari
`public/assets/css/style.css` situs utama supaya dashboard terasa satu
identitas dengan `www.adsbangda.com`, walau repo & stack-nya sengaja
dipisah. Lihat token di `src/app/globals.css`.

- **Ink** `#18181B` — teks utama
- **Accent** `#1D4ED8` — satu-satunya warna aksen brand (ikon platform di
  Monthly Delivery pakai warna khasnya masing-masing — itu semantik, bukan
  dekoratif)
- **Geist** — heading & body text (satu keluarga, hierarki lewat weight)
- **Geist Mono** — angka, label, data

## Roadmap berikutnya

1. **Sekarang:** Client Portal + Admin Portal lengkap, auth Supabase asli
2. **Berikutnya:** Input performa mingguan lewat Admin Portal (saat ini
   `performance_metrics` masih perlu diisi lewat SQL/Table editor Supabase
   langsung — belum ada form-nya di Admin Portal)
3. **Lalu:** Integrasi live Meta Marketing API & Instagram Graph API
   (otomatis isi `performance_metrics`, bukan input manual lagi)
4. **Nanti:** Project management penuh, automation, AI assistant
