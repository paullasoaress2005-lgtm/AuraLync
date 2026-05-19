import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bot,
  CalendarCheck,
  Inbox,
  LineChart,
  Link2,
  Settings,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { SettingsPanel } from "@/components/settings-panel";
import { getClinicSettings } from "@/lib/settings";

const navigation = [
  { label: "Dashboard", icon: LineChart, href: "/dashboard" },
  { label: "Conversas", icon: Inbox, href: "/conversas" },
  { label: "Agendamentos", icon: CalendarCheck, href: "/agenda" },
  { label: "Pacientes", icon: UsersRound, href: "/pacientes" },
  { label: "IA", icon: Bot, href: "/ia" },
  { label: "Seguranca", icon: ShieldCheck, href: "/seguranca" },
  { label: "Ajustes", icon: Settings, active: true, href: "/ajustes" },
];

const quickNav = [
  ["Dashboard", "/dashboard"],
  ["Conversas", "/conversas"],
  ["Agendamentos", "/agenda"],
  ["Pacientes", "/pacientes"],
  ["IA", "/ia"],
  ["Seguranca", "/seguranca"],
  ["Ajustes", "/ajustes"],
];

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const payload = await getClinicSettings();

  if (!payload) {
    redirect("/login?next=/ajustes");
  }

  return (
    <main className="min-h-screen bg-[#f8fbfb] text-[#102f36]">
      <div className="page-enter flex min-h-screen">
        <aside className="hidden w-[276px] shrink-0 border-r border-[#dfe8e7] bg-white/88 px-5 py-6 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#dce8e7] bg-[#f8fbfb]">
              <Image
                src="/auralync-logo.jpeg"
                alt="AuraLync"
                width={34}
                height={34}
                className="h-8 w-8 rounded-lg object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#0a5e6e]">
                AURALYNC
              </p>
              <p className="text-xs text-[#6f8588]">CRM Intelligence</p>
            </div>
          </div>

          <nav className="mt-10 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm transition ${
                  item.active
                    ? "bg-[#0b5d6b] text-white shadow-[0_14px_34px_rgba(11,93,107,0.14)]"
                    : "text-[#60777a] hover:bg-[#eef5f4] hover:text-[#123940]"
                }`}
                title={item.label}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#143d44]">
              <Link2 className="h-4 w-4 text-[#0a5e6e]" />
              Preferencias
            </div>
            <p className="mt-2 text-xs leading-5 text-[#6f8588]">
              Aparencia, horarios, integracoes e notificacoes por cliente.
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-20 items-center justify-between border-b border-[#dfe8e7] bg-white/78 px-5 backdrop-blur md:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#6f8588]">
                Ajustes
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[#102f36] md:text-2xl">
                Configuracoes da clinica
              </h1>
            </div>
            <span className="hidden rounded-full bg-[#edf6f5] px-3 py-1 text-xs font-medium text-[#0b5d6b] md:inline-flex">
              {payload.schemaReady ? "Supabase conectado" : "SQL pendente"}
            </span>
          </header>

          <nav className="flex gap-2 overflow-x-auto border-b border-[#dfe8e7] bg-white/82 px-5 py-3 backdrop-blur lg:hidden">
            {quickNav.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  href === "/ajustes"
                    ? "bg-[#0b5d6b] text-white"
                    : "border border-[#dfe8e7] bg-white text-[#60777a] hover:bg-[#edf6f5]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-6 md:px-8">
            <SettingsPanel payload={payload} />
          </div>
        </section>
      </div>
    </main>
  );
}
