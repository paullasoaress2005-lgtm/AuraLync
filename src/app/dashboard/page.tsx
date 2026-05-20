import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BellRing,
  Bot,
  CalendarCheck,
  CircleDot,
  HeartPulse,
  Inbox,
  LineChart,
  Settings,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  UsersRound,
} from "lucide-react";
import { ClientSwitcher } from "@/components/client-switcher";
import { NotificationCommandBar } from "@/components/notification-command-bar";
import { AttentionIcon, getDashboardData } from "@/lib/auralync-data";

const navigation = [
  { label: "Dashboard", icon: LineChart, active: true, href: "/dashboard" },
  { label: "Conversas", icon: Inbox, href: "/conversas" },
  { label: "Agendamentos", icon: CalendarCheck, href: "/agenda" },
  { label: "Pacientes", icon: UsersRound, href: "/pacientes" },
  { label: "IA", icon: Bot, href: "/ia" },
  { label: "Segurança", icon: ShieldCheck, href: "/seguranca" },
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

const metricLinks: Record<string, string> = {
  "Conversas ativas": "/conversas",
  "Leads novos": "/conversas?filter=leads",
  Agendamentos: "/agenda",
  "Sem resposta": "/conversas?filter=sem_resposta",
};

const priorityStyles = {
  critical: {
    card: "border-[#efc9c1] bg-[#fff8f6]",
    icon: "bg-[#fff0ed] text-[#b42318]",
    pill: "bg-[#ffe8e2] text-[#9f2d20]",
  },
  warm: {
    card: "border-[#ead8b5] bg-[#fffaf0]",
    icon: "bg-[#fff3d6] text-[#936316]",
    pill: "bg-[#fff0c2] text-[#7a4d0b]",
  },
  calm: {
    card: "border-[#dfe8e7] bg-white",
    icon: "bg-[#edf6f5] text-[#0b5d6b]",
    pill: "bg-[#edf6f5] text-[#0b5d6b]",
  },
};

type HomeProps = {
  searchParams?: Promise<{
    view?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const currentView = params?.view === "auralync" ? "auralync" : "camila";
  const dashboard = await getDashboardData({ view: currentView });
  const maxStageValue = Math.max(...dashboard.stages.map((stage) => stage.value), 1);
  const appointmentsMetric =
    dashboard.metrics.find((metric) => metric.label === "Agendamentos")?.value ??
    "0";

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
            <p className="text-sm font-medium text-[#143d44]">
              Ambiente selecionado
            </p>
            <p className="mt-2 text-xs leading-5 text-[#6f8588]">
              Use o seletor no topo para alternar entre perfis conectados e
              a visão institucional da AuraLync.
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-20 items-center justify-between border-b border-[#dfe8e7] bg-white/78 px-5 backdrop-blur md:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#6f8588]">
                Central AuraLync
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[#102f36] md:text-2xl">
                Central inteligente do WhatsApp
              </h1>
            </div>
            <ClientSwitcher
              current={currentView}
              currentName={dashboard.clientName}
              basePath="/dashboard"
            />
          </header>

          <NotificationCommandBar
            priorities={dashboard.priorities}
            attentionCount={dashboard.attentionCount}
            appointmentsLabel={appointmentsMetric}
            currentView={currentView}
          />

          <nav className="flex gap-2 overflow-x-auto border-b border-[#dfe8e7] bg-white/82 px-5 py-3 backdrop-blur lg:hidden">
            {quickNav.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  href === "/dashboard"
                    ? "bg-[#0b5d6b] text-white"
                    : "border border-[#dfe8e7] bg-white text-[#60777a] hover:bg-[#edf6f5]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-5 py-6 md:px-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dashboard.metrics.map((metric) => (
                <Link
                  key={metric.label}
                  href={metricLinks[metric.label] ?? "/conversas"}
                  className="interactive-card group rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)] transition hover:border-[#bfd8d6] hover:bg-[#fbfdfd]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf6f5] text-[#0b5d6b]">
                      <metric.icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#edf6f5] px-2.5 py-1 text-xs font-medium text-[#0b5d6b]">
                        {metric.delta}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-[#8aa2a5] transition group-hover:text-[#0b5d6b]" />
                    </div>
                  </div>
                  <p className="mt-5 text-sm text-[#6f8588]">{metric.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-[#102f36]">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#789093]">
                    {metric.detail}
                  </p>
                </Link>
              ))}
            </section>

            <section className="rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-[#0b5d6b]" />
                    <p className="text-sm font-medium text-[#0b5d6b]">
                      Prioridades do WhatsApp
                    </p>
                  </div>
                  <h2 className="mt-1 text-lg font-semibold text-[#102f36]">
                    O que merece ação antes de virar oportunidade perdida
                  </h2>
                </div>
                <Link
                  href="/ia"
                  className="premium-action flex h-10 w-fit items-center gap-2 rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-4 text-sm font-medium text-[#0b5d6b] transition hover:bg-[#edf6f5]"
                  title="Abrir mini chat da IA"
                >
                  <WandSparkles className="h-4 w-4" />
                  Pedir ação rápida
                </Link>
              </div>

              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {dashboard.priorities.map((priority) => {
                  const style = priorityStyles[priority.tone];

                  return (
                    <Link
                      key={priority.label}
                      href={priority.href}
                      className={`interactive-card rounded-xl border p-4 transition ${style.card}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.icon}`}
                        >
                          <BellRing className="h-4 w-4" />
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.pill}`}
                        >
                          {priority.count}
                        </span>
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-[#102f36]">
                        {priority.label}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-[#60777a]">
                        {priority.description}
                      </p>
                      <p className="mt-4 flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                        {priority.action}
                        <ArrowUpRight className="h-4 w-4" />
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0b5d6b]">
                      Evolucao mensal
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-[#102f36]">
                      Conversas classificadas pela IA
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-[#dfe8e7] px-3 py-2 text-sm text-[#60777a]">
                    <CircleDot className="h-4 w-4 text-[#0b5d6b]" />
                    {dashboard.periodLabel}
                  </div>
                </div>

                <div className="mt-8 h-64">
                  <svg
                    viewBox="0 0 760 260"
                    className="h-full w-full"
                    role="img"
                    aria-label="Grafico de conversas classificadas"
                  >
                    <defs>
                      <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#0b5d6b" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#0b5d6b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[40, 90, 140, 190, 240].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        x2="760"
                        y1={y}
                        y2={y}
                        stroke="#e8f0ef"
                        strokeWidth="1"
                      />
                    ))}
                    <path
                      d="M0 202 C90 186 116 150 190 160 C265 172 280 92 356 104 C444 118 478 62 560 80 C634 96 664 50 760 42 L760 260 L0 260 Z"
                      fill="url(#area)"
                    />
                    <path
                      d="M0 202 C90 186 116 150 190 160 C265 172 280 92 356 104 C444 118 478 62 560 80 C634 96 664 50 760 42"
                      fill="none"
                      stroke="#0b5d6b"
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>

              <div className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0b5d6b]">
                      Estados vivos
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-[#102f36]">
                      Radar de atendimento
                    </h2>
                  </div>
                  <Sparkles className="h-5 w-5 text-[#0b5d6b]" />
                </div>

                <div className="mt-7 space-y-5">
                  {dashboard.stages.map((stage) => (
                    <div key={stage.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-[#4d676b]">{stage.label}</span>
                        <span className="font-medium text-[#102f36]">
                          {stage.value}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#eef5f4]">
                        <div
                          className={`h-2 rounded-full ${stage.color}`}
                          style={{
                            width: `${Math.max((stage.value / maxStageValue) * 100, 4)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
              <div className="rounded-xl border border-[#dfe8e7] bg-[#0d3640] p-6 text-white shadow-[0_22px_55px_rgba(13,54,64,0.16)]">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                    <AttentionIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    Atenção necessária
                  </span>
                </div>
                <h2 className="mt-6 text-2xl font-semibold">
                  {dashboard.attentionCount} conversas pedem revisão
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#c7d8d9]">
                  O CRM detectou leads sem resposta, oportunidades quentes e
                  conversas que podem precisar de transbordo humano.
                </p>
                <Link
                  href="/conversas?filter=attention"
                  className="premium-action mt-6 flex h-10 w-fit items-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-[#0d3640] transition hover:bg-[#edf6f5]"
                  title="Abrir fila de atencao"
                >
                  Abrir fila
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-xl border border-[#dfe8e7] bg-white shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                <div className="flex items-center justify-between border-b border-[#e8f0ef] px-6 py-5">
                  <div>
                    <p className="text-sm font-medium text-[#0b5d6b]">
                      Inbox inteligente
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-[#102f36]">
                      Conversas com contexto resumido
                    </h2>
                  </div>
                  <HeartPulse className="h-5 w-5 text-[#0b5d6b]" />
                </div>

                <div className="divide-y divide-[#e8f0ef]">
                  {dashboard.conversations.length > 0 ? (
                    dashboard.conversations.map((conversation) => (
                      <article
                        key={`${conversation.phone}-${conversation.stage}`}
                        className="grid gap-4 px-6 py-5 transition hover:bg-[#f8fbfb] lg:grid-cols-[180px_1fr_210px]"
                      >
                        <div>
                          <p className="font-medium text-[#102f36]">
                            {conversation.name}
                          </p>
                          <p className="mt-1 text-xs text-[#789093]">
                            {conversation.phone}
                          </p>
                        </div>
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#edf6f5] px-2.5 py-1 text-xs font-medium text-[#0b5d6b]">
                              {conversation.stage}
                            </span>
                            <span className="rounded-full bg-[#f5f8f7] px-2.5 py-1 text-xs font-medium text-[#60777a]">
                              {conversation.temperature}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-[#4d676b]">
                            {conversation.summary}
                          </p>
                          <p className="mt-2 text-sm font-medium text-[#102f36]">
                            {conversation.action}
                          </p>
                        </div>
                        <div className="flex items-start justify-between gap-3 lg:justify-end">
                          <span className="text-sm text-[#789093]">
                            {conversation.time}
                          </span>
                          <Link
                            href="/conversas"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dfe8e7] text-[#0b5d6b] transition hover:bg-[#edf6f5]"
                            title="Abrir conversa"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="px-6 py-10 text-sm text-[#60777a]">
                      Nenhuma conversa viva encontrada para este cliente ainda.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
