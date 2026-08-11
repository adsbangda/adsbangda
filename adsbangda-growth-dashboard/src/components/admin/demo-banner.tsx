import { Info } from "lucide-react";
import { DEMO_MODE } from "@/lib/data";

export function DemoModeBanner() {
  if (!DEMO_MODE) return null;
  return (
    <div className="flex items-center gap-2 border-b border-warning-soft bg-warning-soft px-5 py-2.5 text-xs text-warning lg:px-8">
      <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      Mode Demo — Supabase belum disambungkan. Perubahan di sini tersimpan sementara dan hilang saat server restart. Isi <code className="font-data">NEXT_PUBLIC_SUPABASE_URL</code> & <code className="font-data">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di <code className="font-data">.env.local</code> untuk mode live.
    </div>
  );
}
