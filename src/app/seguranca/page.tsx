import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Bot,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Command,
  Database,
  EyeOff,
  Inbox,
  KeyRound,
  LineChart,
  Link2,
  LockKeyhole,
  Settings,
  ShieldCheck,
  Siren,
  UserCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: LineChart, href: "/dashboard" },
  { label: "Conversas", icon: Inbox, href: "/conversas" },
  { label: "Agendamentos", icon: CalendarCheck, href: "/agenda" },
  { label: "Pacientes", icon: UsersRound, href: "/pacientes" },
  { label: "IA", icon: Bot, href: "/ia" },
  { label: "Segurança", icon: ShieldCheck, active: true, href: "/seguranca" },
  { label: "Ajustes", icon: Settings, href: "/ajustes" },
];

const quickNav = [
  ["Dashboard", "/dashboard"],
  ["Conversas", "/conversas"],
  ["Agendamentos", "/agenda"],
  ["Pacientes", "/pacientes"],
  ["IA", "/ia"],
  ["Segurança", "/seguranca"],
  ["Ajustes", "/ajustes"],
];

const controls: Array<[string, string, LucideIcon]> = [
  ["RLS por tenant", "Ativo", Database],
  ["Auth por usuário", "Em implantação", UserCheck],
  ["Service role no servidor", "Protegido", KeyRound],
  ["Mascaramento de telefone", "Ativo", EyeOff],
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#f8fbfb] text-[#102f36]">
      <div className="page-enter flex min-h-screen">
        <aside className="hidden w-[276px] shrink-0 border-r border-[#dfe8e7] bg-white/88 px-5 py-6 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#dce8e7] bg-[#f8fbfb]">
              <Image src="/auralync-logo.jpeg" alt="AuraLync" width={34} height={34} className="h-8 w-8 rounded-lg object-cover" priority />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#0a5e6e]">AURALYNC</p>
              <p className="text-xs text-[#6f8588]">CRM Intelligence</p>
            </div>
          </div>

          <nav className="mt-10 space-y-1">
            {navigation.map((item) => (
              <Link key={item.label} href={item.href} className={`group flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm transition ${item.active ? "bg-[#0b5d6b] text-white shadow-[0_14px_34px_rgba(11,93,107,0.14)]" : "text-[#60777a] hover:bg-[#eef5f4] hover:text-[#123940]"}`} title={item.label}>
                <item.icon className="h-4 w-4" strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#143d44]">
              <Link2 className="h-4 w-4 text-[#0a5e6e]" />
              Segurança e LGPD
            </div>
            <p className="mt-2 text-xs leading-5 text-[#6f8588]">
              Isolamento por cliente, rastreabilidade e redução de exposição de dados.
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-20 items-center justify-between border-b border-[#dfe8e7] bg-white/78 px-5 backdrop-blur md:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#6f8588]">Segurança</p>
              <h1 className="mt-1 text-xl font-semibold text-[#102f36] md:text-2xl">Postura de privacidade e acesso</h1>
            </div>
            <button className="hidden h-10 items-center gap-2 rounded-lg border border-[#dfe8e7] bg-white px-3 text-sm text-[#4d676b] transition hover:bg-[#f1f7f6] md:flex" title="Selecionar cliente">
              <Command className="h-4 w-4" />
              AuraLync
              <ChevronDown className="h-4 w-4" />
            </button>
          </header>

          <nav className="flex gap-2 overflow-x-auto border-b border-[#dfe8e7] bg-white/82 px-5 py-3 backdrop-blur lg:hidden">
            {quickNav.map(([label, href]) => (
              <Link key={label} href={href} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${href === "/seguranca" ? "bg-[#0b5d6b] text-white" : "border border-[#dfe8e7] bg-white text-[#60777a] hover:bg-[#edf6f5]"}`}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="mx-auto grid w-full max-w-[1440px] flex-1 gap-6 px-5 py-6 md:px-8 xl:grid-cols-[1fr_360px]">
            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {controls.map(([label, status, Icon]) => (
                  <article key={label} className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf6f5] text-[#0b5d6b]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-sm text-[#6f8588]">{label}</p>
                    <p className="mt-2 text-lg font-semibold text-[#102f36]">{status}</p>
                  </article>
                ))}
              </div>

              <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                  <ShieldCheck className="h-4 w-4" />
                  Checklist LGPD do CRM
                </div>
                <div className="mt-6 grid gap-3">
                  {[
                    "Separar dados por clínica com client_id e RLS.",
                    "Evitar service_role no navegador.",
                    "Mascarar telefone em telas resumidas.",
                    "Registrar origem de ações: IA, manual, importado ou Chatwoot.",
                    "Definir retenção de conversas e política de exclusão.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-lg bg-[#f5f8f7] p-4">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0b5d6b]" />
                      <p className="text-sm leading-6 text-[#4d676b]">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            </section>

            <aside className="space-y-6">
              <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-[#0d3640] p-6 text-white shadow-[0_22px_55px_rgba(13,54,64,0.16)]">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <LockKeyhole className="h-4 w-4" />
                  Risco atual
                </div>
                <p className="mt-5 text-3xl font-semibold">Controlado</p>
                <p className="mt-3 text-sm leading-6 text-[#c7d8d9]">
                  O próximo salto de segurança é ativar login real obrigatório em todas as páginas.
                </p>
              </section>

              <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                  <Siren className="h-4 w-4" />
                  Alertas futuros
                </div>
                <div className="mt-5 space-y-3 text-sm leading-6 text-[#60777a]">
                  <p>Login suspeito por localização incomum.</p>
                  <p>Exportação de dados sensíveis.</p>
                  <p>Falha repetida de autenticação.</p>
                </div>
              </section>

              <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                  <Activity className="h-4 w-4" />
                  Auditoria
                </div>
                <p className="mt-4 text-sm leading-6 text-[#60777a]">
                  A tabela de eventos já registra mudanças de estado. Para agenda, o SQL novo adiciona origem do agendamento.
                </p>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
