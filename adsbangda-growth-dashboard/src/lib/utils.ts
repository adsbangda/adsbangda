import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

/**
 * Angka desimal format Indonesia — titik untuk ribuan, KOMA untuk desimal
 * (mis. 2.4 → "2,4", 1234.5 → "1.234,5"). Dipakai buat semua angka pecahan
 * yang sebelumnya ditulis manual pakai `.toFixed()` (yang selalu pakai titik
 * ala JS/US, salah untuk pembaca Indonesia).
 */
export function formatDecimal(value: number, digits = 1) {
  return new Intl.NumberFormat("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

/** Persentase format Indonesia, mis. formatPercent(14.6) → "14,6%". */
export function formatPercent(value: number, digits = 1) {
  return `${formatDecimal(value, digits)}%`;
}

/** Multiplier format Indonesia, dipakai buat ROAS, mis. formatMultiplier(2.4) → "2,4x". */
export function formatMultiplier(value: number, digits = 1) {
  return `${formatDecimal(value, digits)}x`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatDateID(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
