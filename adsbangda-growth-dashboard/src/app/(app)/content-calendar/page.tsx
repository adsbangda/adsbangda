import { Topbar } from "@/components/dashboard/topbar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getCurrentClient, getContentCalendar } from "@/lib/data";
import { formatDateID } from "@/lib/utils";
import { Video, Image as ImageIcon, Calendar, User, Eye } from "lucide-react";

export default async function ContentCalendarPage() {
  const client = await getCurrentClient();
  const items = await getContentCalendar(client.id);

  return (
    <div className="flex-1 min-h-screen">
      <Topbar title="Content Calendar" subtitle="Jadwal publikasi & status persetujuan konten." />

      <div className="p-6 sm:p-8 pt-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-[20px] border border-[#ECECEC] bg-[#FFFFFF] p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#1D4ED8]/30 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAFAFA] border border-[#ECECEC] px-2.5 py-0.5 font-data text-[10px] font-semibold text-[#71717A]">
                    {item.title.toLowerCase().includes("reel") ? (
                      <Video className="h-3 w-3 text-[#1D4ED8]" />
                    ) : (
                      <ImageIcon className="h-3 w-3 text-[#1D4ED8]" />
                    )}
                    <span>Instagram / TikTok</span>
                  </span>
                  <StatusBadge status={item.status} />
                </div>

                <h3 className="text-sm font-bold text-[#18181B] leading-snug">
                  {item.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-[#ECECEC] flex items-center justify-between font-data text-xs text-[#71717A]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#1D4ED8]" />
                  <span>{formatDateID(item.plannedDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>Team AdsBangda</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}