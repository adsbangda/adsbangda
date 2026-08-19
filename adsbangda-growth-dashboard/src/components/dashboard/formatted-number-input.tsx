"use client";

import { useState } from "react";

/**
 * Input angka dengan format Indonesia LIVE selagi diketik — titik ribuan
 * (mis. ketik "10000000" otomatis jadi "10.000.000"), dan koma desimal
 * kalau `allowDecimal` (mis. "2,4" buat ROAS). Dibuat karena
 * `<input type="number">` bawaan HTML TIDAK BISA menampilkan pemisah ribuan
 * sambil diketik (browser menolak karakter apa pun selain digit/titik-desimal
 * di type itu) — jadi admin harus hitung sendiri berapa banyak nol yang
 * sudah diketik untuk angka besar seperti Ad Spend / Budget Target.
 *
 * Cara kerja: yang user LIHAT & ketik adalah <input type="text"> yang
 * di-reformat tiap onChange. Nilai numerik ASLI (tanpa format, dot sebagai
 * desimal ala JS) disimpan di <input type="hidden"> dengan `name` yang
 * sama seperti field aslinya — jadi Server Action (`formData.get(name)`)
 * di halaman pemanggil TIDAK PERLU diubah sama sekali, tinggal ganti
 * `<input type="number" name="spend" .../>` jadi
 * `<FormattedNumberInput name="spend" .../>`.
 */

function formatForDisplay(raw: string): string {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const negative = intPart.startsWith("-");
  const digits = (negative ? intPart.slice(1) : intPart).replace(/\D/g, "");
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sign = negative ? "-" : "";
  return decPart !== undefined ? `${sign}${grouped},${decPart}` : `${sign}${grouped}`;
}

/** Ubah teks yang diketik user (bisa mengandung titik ribuan & koma desimal) jadi angka mentah JS-style (dot desimal). */
function toRaw(input: string, allowDecimal: boolean, allowNegative: boolean): string {
  const negative = allowNegative && input.trim().startsWith("-");

  if (!allowDecimal) {
    const digits = input.replace(/\D/g, "");
    return negative && digits ? `-${digits}` : digits;
  }

  const withoutThousandDots = input.replace(/\./g, "");
  const commaIndex = withoutThousandDots.indexOf(",");
  let result: string;
  if (commaIndex !== -1) {
    const intPart = withoutThousandDots.slice(0, commaIndex).replace(/\D/g, "");
    const decPart = withoutThousandDots.slice(commaIndex + 1).replace(/\D/g, "");
    result = `${intPart}.${decPart}`;
  } else {
    result = withoutThousandDots.replace(/\D/g, "");
  }
  return negative && result ? `-${result}` : result;
}

export function FormattedNumberInput({
  name,
  id,
  defaultValue,
  placeholder,
  className,
  required,
  allowDecimal = false,
  allowNegative = false,
}: {
  name: string;
  id?: string;
  /** Angka mentah (bukan string yang sudah diformat) — sama seperti defaultValue di input number biasa. */
  defaultValue?: number | string | null;
  placeholder?: string;
  className?: string;
  required?: boolean;
  /** Izinkan koma desimal (dipakai buat CTR, ROAS, dst). Default false — cuma bilangan bulat (Spend, Leads, dst). */
  allowDecimal?: boolean;
  allowNegative?: boolean;
}) {
  const initialRaw = defaultValue != null && defaultValue !== "" ? String(defaultValue) : "";
  const [raw, setRaw] = useState(initialRaw);

  return (
    <>
      <input
        id={id}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        placeholder={placeholder}
        className={className}
        required={required}
        value={formatForDisplay(raw)}
        onChange={(e) => setRaw(toRaw(e.target.value, allowDecimal, allowNegative))}
      />
      <input type="hidden" name={name} value={raw} />
    </>
  );
}
