// src/lib/date.ts
// Artikel blog nulis tanggal dalam format bebas ala manusia, contoh: "19 Juli 2026".
// Google & JSON-LD (datePublished/dateModified) butuh format ISO 8601 (2026-07-19).
// Helper ini mengonversi keduanya supaya kita tidak perlu ubah format tanggal
// yang sudah ditulis di setiap file markdown artikel.

const BULAN_ID: Record<string, string> = {
  januari: "01", februari: "02", maret: "03", april: "04",
  mei: "05", juni: "06", juli: "07", agustus: "08",
  september: "09", oktober: "10", november: "11", desember: "12",
};

/**
 * Ubah "19 Juli 2026" -> "2026-07-19". Kalau format tidak dikenali,
 * kembalikan null (schema field yang butuh ISO date akan di-skip, bukan error).
 */
export function parseIndoDateToISO(input: string): string | null {
  if (!input) return null;
  const match = input.trim().toLowerCase().match(/^(\d{1,2})\s+([a-zé]+)\s+(\d{4})$/i);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = BULAN_ID[monthName];
  if (!month) return null;
  return `${year}-${month}-${day.padStart(2, "0")}`;
}
