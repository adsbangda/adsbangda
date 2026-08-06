// src/data/search-index.ts
// Index statis untuk fitur pencarian internal di /cari.html.
// Ini yang membuat SearchAction di WebSite JSON-LD (Layout.astro) BENERAN
// berfungsi -- bukan cuma skema kosong yang gagal saat Google tes klik.
// Kalau nambah halaman/layanan baru, tambahkan juga entrinya di sini.
// (Artikel blog TIDAK perlu ditambah manual -- diambil otomatis dari
// src/content/blog/ langsung di src/pages/cari.astro.)

export interface SearchEntry {
  title: string;
  description: string;
  url: string;
  category: string;
}

export const searchIndex: SearchEntry[] = [
  { title: "Home", description: "Branding, Website & Digital Marketing Agency -- Branding, Website, Social Media, Meta Ads, KOL Management.", url: "/", category: "Halaman" },
  { title: "Tentang Adsbangda", description: "Kenalan lebih jauh dengan tim dan pendekatan kerja Adsbangda.", url: "/tentang.html", category: "Halaman" },
  { title: "Kontak", description: "Hubungi Adsbangda untuk konsultasi gratis kebutuhan digital marketing kamu.", url: "/kontak.html", category: "Halaman" },
  { title: "Blog", description: "Insight, tips, dan strategi digital marketing praktis dari tim Adsbangda.", url: "/blog.html", category: "Halaman" },

  { title: "Semua Layanan", description: "8 layanan Adsbangda: Branding, Website, Social Media, Meta Ads, KOL Management, dan digital marketing.", url: "/layanan.html", category: "Layanan" },
  { title: "Social Media Management", description: "Kelola akun Instagram, TikTok & Facebook bisnis kamu dari perencanaan sampai eksekusi.", url: "/layanan-sosial-media-management.html", category: "Layanan" },
  { title: "Content Strategy", description: "Riset tren, kalender konten, dan hook yang bikin orang berhenti scroll.", url: "/layanan-content-strategy.html", category: "Layanan" },
  { title: "Meta Ads Performance", description: "Campaign ads yang terarah dan performing di Instagram & Facebook.", url: "/layanan-meta-ads.html", category: "Layanan" },
  { title: "KOL & Influencer Management", description: "Matchmaking brand dengan key opinion leader dan influencer yang tepat.", url: "/layanan-kol-management.html", category: "Layanan" },
  { title: "Branding & Visual Identity", description: "Bangun identitas visual brand yang konsisten dan gampang dikenali.", url: "/layanan-branding-visual-identity.html", category: "Layanan" },
  { title: "Website & Landing Page", description: "Website atau landing page yang dirancang buat mengonversi pengunjung jadi leads.", url: "/layanan-website-landing-page.html", category: "Layanan" },
  { title: "Creative Design", description: "Desain grafis untuk segala kebutuhan promosi bisnis kamu.", url: "/layanan-creative-design.html", category: "Layanan" },
  { title: "Digital Growth Consulting", description: "Konsultasi strategis untuk bisnis yang mau tumbuh lebih terarah di dunia digital.", url: "/layanan-digital-growth-consulting.html", category: "Layanan" },

  { title: "Semua Portofolio", description: "Lihat portofolio dan hasil kerja Adsbangda bersama berbagai klien.", url: "/portofolio.html", category: "Portofolio" },
  { title: "Amati Coffee", description: "Konten promosi menu, KOL management, sampai konten top-performing yang tembus 554K views.", url: "/portofolio-amati-coffee.html", category: "Portofolio" },
  { title: "Batam Dental Center", description: "Kelola Instagram, konten edukasi gigi, dan kampanye Meta Ads klinik gigi di Batam.", url: "/portofolio-batam-dental-center.html", category: "Portofolio" },
  { title: "InsideRuma", description: "Konten segar dan relevan buat audiens muda, bangun komunitas media platform.", url: "/portofolio-insideruma.html", category: "Portofolio" },
  { title: "Johanes Toyota Batam", description: "Konten promosi & edukasi seputar penjualan mobil yang informatif dan up-to-date.", url: "/portofolio-johanes-toyota-batam.html", category: "Portofolio" },
  { title: "Primaroof ID", description: "Kelola sosial media produk atap & baja ringan buat edukasi distributor se-Indonesia.", url: "/portofolio-primaroof-id.html", category: "Portofolio" },
  { title: "Resa Living ID", description: "Bangun Resaliving jadi brand properti nomor satu di BSD & Gading Serpong.", url: "/portofolio-resa-living-id.html", category: "Portofolio" },
  { title: "Umroh Rekivatour", description: "Strategi sosial media & ads buat brand Umrah, konten viral tembus 5 juta views.", url: "/portofolio-umroh-rekivatour.html", category: "Portofolio" },
  { title: "Wellner Academy", description: "Strategi Social Media Management untuk konten edukasi finansial, pajak, dan akuntansi.", url: "/portofolio-wellner-academy.html", category: "Portofolio" },
  { title: "Wellner Consulting", description: "Konten perpajakan, campaign Meta Ads buat generate leads, sampai desain company profile.", url: "/portofolio-wellner-consulting.html", category: "Portofolio" },
];
