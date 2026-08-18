/**
 * Avatar client — render `logoUrl` kalau diisi (lewat field "Logo URL" di
 * form Client Information / Tambah Client), fallback ke 2 huruf pertama
 * nama client dengan background accent kalau belum ada logo. Dipakai di
 * Clients list, header detail client, dan tempat lain yang butuh identitas
 * visual client.
 *
 * `<img>` polos (bukan next/image) dengan `onError` fallback via CSS —
 * konsisten dengan pola "paste URL" yang sudah dipakai field lain di app
 * ini (Website, File URL, dst) — tidak ada Supabase Storage/upload bucket
 * di project ini, jadi logo diisi lewat URL gambar yang sudah di-hosting
 * di tempat lain (Drive, CDN, dsb), bukan upload file langsung.
 */
export function ClientAvatar({ name, logoUrl, size = 40 }: { name: string; logoUrl?: string | null; size?: number }) {
  const initials = name.slice(0, 2).toUpperCase();
  const style = { width: size, height: size };

  if (logoUrl) {
    return (
      <span className="relative shrink-0 overflow-hidden rounded-full border border-border bg-surface" style={style}>
        <span
          className="absolute inset-0 z-0 flex items-center justify-center bg-accent font-bold text-white"
          style={{ fontSize: size * 0.36 }}
        >
          {initials}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element -- logo dari URL eksternal sembarang, bukan aset lokal yang bisa dioptimasi next/image */}
        <img
          src={logoUrl}
          alt={name}
          className="absolute inset-0 z-10 h-full w-full object-cover"
          onError={(e) => {
            // URL logo mati/salah — sembunyikan <img>, biarkan fallback inisial di belakangnya kelihatan.
            e.currentTarget.style.display = "none";
          }}
        />
      </span>
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-accent font-bold text-white"
      style={{ ...style, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}
