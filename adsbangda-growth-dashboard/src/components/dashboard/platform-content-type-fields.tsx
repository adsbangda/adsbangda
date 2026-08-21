"use client";

import { useState } from "react";
import { CONTENT_TYPES_BY_PLATFORM, CONTENT_TYPE_LABEL, type SocialPlatform } from "@/lib/types";

/**
 * Pasangan <select> Platform + Content Type yang SALING NYAMBUNG — pilihan di
 * Content Type otomatis berubah ngikutin Platform yang lagi dipilih (Instagram
 * → Feed/Reels/Story, Facebook → Post/Video, dst — lihat CONTENT_TYPES_BY_PLATFORM
 * di lib/types.ts), bukan daftar gabungan semua platform kayak sebelumnya yang
 * bikin bingung (pilih Threads tapi masih ada opsi "Reels").
 *
 * Client Component KECIL yang di-embed di dalam <form action={serverAction}>
 * Server Component — tetap jalan normal karena browser ngumpulin semua field
 * `name=...` di dalam <form> pas submit, gak peduli itu dirender dari Client
 * atau Server Component. Cuma dropdown-nya doang yang butuh interaktivitas.
 *
 * `key={platform}` di <select> Content Type SENGAJA dipasang — maksa React
 * remount select itu tiap kali platform ganti, biar defaultValue lama yang
 * mungkin gak valid lagi (mis. dari "reels" pas ganti ke Facebook) otomatis
 * ke-reset ke pilihan pertama yang valid buat platform baru itu.
 */
export function PlatformContentTypeFields({
  platforms,
  platformLabels,
  platformFieldName = "platform",
  contentTypeFieldName = "contentType",
  defaultPlatform,
  defaultContentType,
  className,
  withLabels = false,
}: {
  platforms: string[];
  platformLabels: Record<string, string>;
  platformFieldName?: string;
  contentTypeFieldName?: string;
  defaultPlatform: string;
  defaultContentType?: string;
  className: string;
  /** Kalau true, bungkus tiap select dengan <label> kecil di atasnya (dipakai di form "Tambah Target Baru"); kalau false, bare select doang (dipakai di form Content List yang lain). */
  withLabels?: boolean;
}) {
  const [platform, setPlatform] = useState(defaultPlatform);
  const contentTypes = CONTENT_TYPES_BY_PLATFORM[platform as SocialPlatform] ?? [];

  const platformSelect = (
    <select name={platformFieldName} value={platform} onChange={(e) => setPlatform(e.target.value)} className={className}>
      {platforms.map((p) => (
        <option key={p} value={p}>
          {platformLabels[p] ?? p}
        </option>
      ))}
    </select>
  );

  const contentTypeSelect = (
    <select key={platform} name={contentTypeFieldName} defaultValue={defaultContentType} className={className}>
      {contentTypes.map((t) => (
        <option key={t} value={t}>
          {CONTENT_TYPE_LABEL[t] ?? t}
        </option>
      ))}
    </select>
  );

  if (!withLabels) {
    return (
      <>
        {platformSelect}
        {contentTypeSelect}
      </>
    );
  }

  return (
    <>
      <div>
        <label className="mb-1 block font-data text-[10px] font-semibold uppercase tracking-wider text-muted">Platform</label>
        {platformSelect}
      </div>
      <div>
        <label className="mb-1 block font-data text-[10px] font-semibold uppercase tracking-wider text-muted">Content Type</label>
        {contentTypeSelect}
      </div>
    </>
  );
}
