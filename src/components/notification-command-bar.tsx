import Link from "next/link";
import {
  BellRing,
  CalendarCheck,
  MessageSquareWarning,
  Send,
} from "lucide-react";
import type { PriorityItem } from "@/lib/auralync-data";

type Props = {
  priorities: PriorityItem[];
  attentionCount: number;
  appointmentsLabel: string;
  currentView: "camila" | "auralync";
};

function withView(href: string, currentView: Props["currentView"]) {
  if (currentView !== "auralync") return href;
  return `${href}${href.includes("?") ? "&" : "?"}view=auralync`;
}

export function NotificationCommandBar({
  priorities,
  attentionCount,
  appointmentsLabel,
  currentView,
}: Props) {
  const mainPriority = priorities[0];

  return (
    <section className="border-b border-[#dfe8e7] bg-white/88 px-5 py-3 backdrop-blur md:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf6f5] text-[#0b5d6b]">
            <BellRing className="h-4 w-4" />
          </span>
          <Link
            href={withView(mainPriority?.href ?? "/conversas", currentView)}
            className="group flex min-w-0 items-center gap-2 rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 py-2 transition hover:border-[#bfd8d6] hover:bg-[#f4faf9]"
          >
            <MessageSquareWarning className="h-4 w-4 shrink-0 text-[#b7791f]" />
            <span className="truncate text-sm font-medium text-[#102f36]">
              {mainPriority
                ? `${mainPriority.count} ${mainPriority.label.toLowerCase()}`
                : "Fila operacional em dia"}
            </span>
          </Link>
          <Link
            href={withView("/agenda", currentView)}
            className="group flex items-center gap-2 rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 py-2 transition hover:border-[#bfd8d6] hover:bg-[#f4faf9]"
          >
            <CalendarCheck className="h-4 w-4 text-[#0b5d6b]" />
            <span className="text-sm font-medium text-[#102f36]">
              {appointmentsLabel} agendamentos
            </span>
          </Link>
          <Link
            href={withView("/conversas?filter=attention", currentView)}
            className="group flex items-center gap-2 rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 py-2 transition hover:border-[#bfd8d6] hover:bg-[#f4faf9]"
          >
            <span className="h-2 w-2 rounded-full bg-[#b42318]" />
            <span className="text-sm font-medium text-[#102f36]">
              {attentionCount} exigem revisao
            </span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#edf6f5] px-3 py-1.5 text-xs font-medium text-[#0b5d6b]">
            Notificacao interna ativa
          </span>
          <Link
            href={withView("/ajustes", currentView)}
            className="premium-action flex h-9 items-center gap-2 rounded-lg bg-[#0b5d6b] px-3 text-sm font-medium text-white transition hover:bg-[#084d59]"
            title="Configurar aviso por WhatsApp"
          >
            <Send className="h-4 w-4" />
            Avisar medico no WhatsApp
          </Link>
        </div>
      </div>
    </section>
  );
}
