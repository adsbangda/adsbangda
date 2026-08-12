import { redirect } from "next/navigation";

// Client List sekarang tinggal di /admin/clients (Phase 2). Redirect ini
// menjaga bookmark/link lama ke /admin tetap berfungsi.
export default function AdminIndexPage() {
  redirect("/admin/clients");
}
