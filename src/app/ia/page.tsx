import Image from "next/image";
import Link from "next/link";
import {
  BellRing,
  Bot,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  FileText,
  Inbox,
  LineChart,
  Link2,
  MessageSquareWarning,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  type LucideIcon,
  UsersRound,
} from "lucide-react";
import { AiCommandPanel } from "@/components/ai-command-panel";
import { AiCommandRequestsPanel } from "@/components/ai-command-requests-panel";
import { AiResponseRulesPanel } from "@/components/ai-response-rules-panel";
import { ClientSwitcher } from "@/components/client-switcher";
import { getAiCommandRequests } from "@/lib/ai-command-requests";
import { getAiResponseRules } from "@/lib/ai-response-rules";
import { getDashboardData, type PriorityItem } from "@/lib/auralync-data";

const navigation = [
  { label: "Dashboard", icon: LineChart, href: "/dashboard" },
  { label: "Conversas", icon: Inbox, href: "/conversas" },
  { label: "Agendamentos", icon: CalendarCheck, href: "/agenda" },
  { label: "Pacientes", icon: UsersRound, href: "/pacientes" },
  { label: "IA", icon: Bot, active: true, href: "/ia" },
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

const rules = [
  ["Classificacao", "agendamento, lead, curioso, retorno, outros"],
  ["Estados vivos", "em atendimento, sem resposta, precisa humano"],
  ["Transbordo", "dor intensa, urgencia, duvida clinica sensivel"],
  ["Tom de voz", "claro, acolhedor, objetivo e sem prometer diagnostico"],
];

const knowledgeItems = [
  "Horarios da clinica",
  "Servicos e procedimentos",
  "Perguntas frequentes",
  "Politicas de retorno",
];

const fallbackNotifications = [
  {
    icon: BellRing,
    label: "Lead quente parado",
    body: "Paciente demonstrou interesse, mas ficou sem resposta por mais de 2 horas.",
    action: "Sugerir follow-up",
    tone: "danger",
  },
  {
    icon: CalendarPlus,
    label: "Horario pode ser preenchido",
    body: "Existe conversa em andamento e janela livre na agenda da semana.",
    action: "Preparar encaixe",
    tone: "success",
  },
  {
    icon: TimerReset,
    label: "Retorno pendente",
    body: "Paciente recorrente pediu retorno e ainda nao confirmou o melhor horario.",
    action: "Acompanhar conversa",
    tone: "warning",
  },
] as const;

const notificationToneClasses = {
  danger: "border-[#f3c3bd] bg-[#fff7f5] text-[#9f2d20]",
  success: "border-[#b7dfd2] bg-[#f0faf6] text-[#246b52]",
  warning: "border-[#ead7a4] bg-[#fffaf0] text-[#8a5a00]",
};

type IaPageProps = {
  searchParams?: Promise<{
    view?: string;
  }>;
};

type SmartNotification = {
  icon: LucideIcon;
  label: string;
  body: string;
  action: string;
  href: string;
  tone: keyof typeof notificationToneClasses;
  count: number;
};

function iconForPriority(priority: PriorityItem) {
  const label = priority.label.toLowerCase();

  if (label.includes("agendamento") || label.includes("horario")) {
    return CalendarPlus;
  }

  if (label.includes("humano")) {
    return MessageSquareWarning;
  }

  if (label.includes("retorno") || label.includes("resposta")) {
    return TimerReset;
  }

  return BellRing;
}

function toneForPriority(priority: PriorityItem): SmartNotification["tone"] {
  if (priority.tone === "critical") return "danger";
  if (priority.tone === "warm") return "warning";
  return "success";
}

function buildSmartNotifications(priorities: PriorityItem[]) {
  const items = priorities
    .filter((priority) => priority.count > 0)
    .map((priority) => ({
      icon: iconForPriority(priority),
      label: priority.label,
      body: priority.description,
      action: priority.action,
      href: priority.href,
      tone: toneForPriority(priority),
      count: priority.count,
    }));

  if (items.length > 0) return items;

  return fallbackNotifications.map((notification, index) => ({
    ...notification,
    href: index === 1 ? "/agenda" : "/conversas?filter=attention",
    count: 1,
  }));
}

export const dynamic = "force-dynamic";

export default async function IaPage({ searchParams }: IaPageProps) {
  const params = await searchParams;
  const currentView = params?.view === "auralync" ? "auralync" : "camila";
  const [dashboard, commandRequests, responseRules] = await Promise.all([
    getDashboardData({ view: currentView }),
    getAiCommandRequests(),
    getAiResponseRules(),
  ]);
  const smartNotifications = buildSmartNotifications(dashboard.priorities);

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
              Governanca da IA
            </div>
            <p className="mt-2 text-xs leading-5 text-[#6f8588]">
              Regras claras para a IA ajudar sem ultrapassar limites clinicos.
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-20 items-center justify-between border-b border-[#dfe8e7] bg-white/78 px-5 backdrop-blur md:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#6f8588]">
                IA
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[#102f36] md:text-2xl">
                Controle do agente inteligente
              </h1>
            </div>
            <ClientSwitcher
              current={currentView}
              currentName={dashboard.clientName}
              basePath="/ia"
            />
          </header>

          <nav className="flex gap-2 overflow-x-auto border-b border-[#dfe8e7] bg-white/82 px-5 py-3 backdrop-blur lg:hidden">
            {quickNav.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  href === "/ia"
                    ? "bg-[#0b5d6b] text-white"
                    : "border border-[#dfe8e7] bg-white text-[#60777a] hover:bg-[#edf6f5]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mx-auto grid w-full max-w-[1440px] flex-1 gap-6 px-5 py-6 md:px-8 xl:grid-cols-[1fr_360px]">
            <section className="space-y-6">
              <AiCommandPanel />

              <div className="grid gap-6 lg:grid-cols-2">
                <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                    <SlidersHorizontal className="h-4 w-4" />
                    Regras de comportamento
                  </div>
                  <div className="mt-5 space-y-4">
                    {rules.map(([title, body]) => (
                      <div key={title} className="rounded-lg border border-[#dfe8e7] p-4">
                        <p className="font-medium text-[#102f36]">{title}</p>
                        <p className="mt-1 text-sm leading-6 text-[#60777a]">{body}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                    <FileText className="h-4 w-4" />
                    Base de conhecimento
                  </div>
                  <div className="mt-5 space-y-3">
                    {knowledgeItems.map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-lg bg-[#f5f8f7] px-4 py-3"
                      >
                        <span className="text-sm font-medium text-[#102f36]">
                          {item}
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-[#0b5d6b]" />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </section>

            <aside className="space-y-6">
              <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                      <BellRing className="h-4 w-4" />
                      Notificacoes inteligentes
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-[#102f36]">
                      Alertas com proxima acao
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#edf6f5] px-2.5 py-1 text-xs font-medium text-[#0b5d6b]">
                    {smartNotifications.reduce(
                      (total, notification) => total + notification.count,
                      0,
                    )}{" "}
                    sinais
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {smartNotifications.map((notification) => {
                    const Icon = notification.icon;

                    return (
                      <Link
                        key={notification.label}
                        href={
                          currentView === "auralync"
                            ? `${notification.href}${notification.href.includes("?") ? "&" : "?"}view=auralync`
                            : notification.href
                        }
                        className={`rounded-xl border p-4 ${notificationToneClasses[notification.tone]}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/70">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">
                                {notification.label}
                              </p>
                              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold">
                                {notification.count}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-5 text-[#60777a]">
                              {notification.body}
                            </p>
                            <p className="mt-3 text-xs font-semibold">
                              {notification.action}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <AiCommandRequestsPanel
                items={commandRequests.items}
                setupRequired={commandRequests.setupRequired}
              />

              <AiResponseRulesPanel
                items={responseRules.items}
                setupRequired={responseRules.setupRequired}
              />

              <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-[#0d3640] p-6 text-white shadow-[0_22px_55px_rgba(13,54,64,0.16)]">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  Status operacional
                </div>
                <p className="mt-5 text-3xl font-semibold">Ativa</p>
                <p className="mt-3 text-sm leading-6 text-[#c7d8d9]">
                  A IA ja alimenta estados vivos, resumos e proximas acoes no CRM.
                </p>
              </section>

              <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                  <MessageSquareWarning className="h-4 w-4" />
                  Transbordo humano
                </div>
                <p className="mt-4 text-sm leading-6 text-[#60777a]">
                  Casos com sintomas graves, duvida clinica sensivel, reclamacao ou inseguranca do paciente devem ser enviados para humano.
                </p>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
