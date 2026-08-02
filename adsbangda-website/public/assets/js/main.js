// adsbangda - shared site-wide script (mobile menu, scroll reveal, i18n, WA links)
// Loaded on every page. Page-specific content: `translations` object (and, on
// kontak.html / portofolio.html, `window.extraLangHook`) must be defined
// BEFORE this script tag.

// ---- mobile menu ----
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
if(burgerBtn){
  burgerBtn.addEventListener('click', ()=> mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.remove('open')));
}

// ---- reveal on scroll ----
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:.12});
revealEls.forEach(el=>io.observe(el));

// ---- whatsapp links with prefilled message ----
var currentLang = localStorage.getItem('adsbangda_lang') || 'id';
const waMessages = {
  id: 'Halo Adsbangda! \ud83d\udc4b\nSaya ingin berkonsultasi mengenai kebutuhan bisnis saya. Boleh dibantu merekomendasikan layanan yang paling sesuai? Terima kasih.',
  en: 'Hello Adsbangda! \ud83d\udc4b\nI would like to consult about the digital marketing needs for my business. Could you help?'
};
function updateWaLinks(){
  document.querySelectorAll('.wa-cta').forEach(el=>{
    const phone = el.getAttribute('data-wa-phone');
    el.href = `https://wa.me/${phone}?text=${encodeURIComponent(waMessages[currentLang])}`;
  });
}

// ---- shared nav/footer translation (site-wide, all pages) ----
const navTranslations = {
  home: {id:'Home', en:'Home'},
  tentang: {id:'Tentang', en:'About'},
  portofolio: {id:'Portofolio', en:'Portfolio'},
  layanan: {id:'Layanan', en:'Services'},
  blog: {id:'Blog', en:'Blog'},
  kontak: {id:'Kontak', en:'Contact'},
  cta: {id:'Mulai Proyek', en:'Start a Project'},
  foot_tagline: {id:'Partner digital marketing yang bantu brand dan UMKM tumbuh lewat strategi konten, iklan, dan branding yang terukur.', en:'A digital marketing partner helping brands and SMEs grow through measurable content, ads, and branding strategies.'},
  menu: {id:'Menu', en:'Menu'},
  kontak_h: {id:'Kontak', en:'Contact'},
  lokasi: {id:'Jakarta, Indonesia', en:'Jakarta, Indonesia'},
  copy: {id:'&copy; 2026 adsbangda. Semua konten dibikin, bukan dicomot.', en:'&copy; 2026 adsbangda. All content made, not copied.'},
  made: {id:'Dibuat dengan adsbangda', en:'Made with adsbangda'},
  tim_adsbangda: {id:'Tim adsbangda', en:'Adsbangda Team'},
  ikuti_kami: {id:'Ikuti Kami', en:'Follow Us'},
  artikel_terkait: {id:'Artikel Terkait', en:'Related Articles'},
  blog_cta_h: {id:'Butuh Bantuan Mengelola Sosial Media Bisnis Kamu?', en:'Need Help Managing Your Business Social Media?'},
  blog_cta_p: {id:'Tim kami bisa bantu susun strategi, produksi konten, sampai laporan performa bulanan.', en:'Our team can help with strategy, content production, and monthly performance reports.'},
  blog_cta_btn: {id:'Konsultasi Gratis &rarr;', en:'Free Consultation &rarr;'},
  blog_hero_h: {id:'Insight seputar social media &amp; digital marketing', en:'Insights on social media &amp; digital marketing'},
  blog_hero_p: {id:'Tips, strategi, dan pembahasan praktis yang bisa langsung kamu terapkan buat bisnis kamu.', en:'Practical tips, strategies, and discussions you can apply to your business right away.'},
  baca: {id:'Baca &rarr;', en:'Read &rarr;'},
};

function applySharedLang(lang){
  currentLang = lang;
  document.querySelectorAll('[data-i18n-nav]').forEach(el=>{
    const key = el.getAttribute('data-i18n-nav');
    const entry = navTranslations[key];
    if(entry) el.innerHTML = entry[lang];
  });
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const entry = translations[key];
    if(entry) el.innerHTML = entry[lang];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const key = el.getAttribute('data-i18n-placeholder');
    const entry = translations[key];
    if(entry) el.setAttribute('placeholder', entry[lang]);
  });
  document.querySelectorAll('.lang-toggle .lang-opt').forEach(o=>{
    o.classList.toggle('active', o.getAttribute('data-lang') === lang);
  });
  document.documentElement.lang = lang;
  if(window.extraLangHook) window.extraLangHook(lang);
  updateWaLinks();
}
function toggleSharedLang(){
  const newLang = currentLang === 'id' ? 'en' : 'id';
  localStorage.setItem('adsbangda_lang', newLang);
  applySharedLang(newLang);
}
const langToggleEl = document.getElementById('langToggle');
const langToggleMobileEl = document.getElementById('langToggleMobile');
if(langToggleEl) langToggleEl.addEventListener('click', toggleSharedLang);
if(langToggleMobileEl) langToggleMobileEl.addEventListener('click', toggleSharedLang);
applySharedLang(currentLang);
document.documentElement.style.visibility='visible';
