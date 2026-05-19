import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Inbox,
  LineChart,
  Link2,
  MessageCircleMore,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { ClientSwitcher } from "@/components/client-switcher";
import { getInboxData, type InboxFilter } from "@/lib/conversations";

const navigation = [
  { label: "Dashboard", icon: LineChart, href: "/dashboard" },
  { label: "Conversas", icon: Inbox, active: true, href: "/conversas" },
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

const filterLabels: Array<{
  key: InboxFilter;
  label: string;
  countKey: "all" | "attention" | "agendamentos" | "semResposta" | "leads";
}> = [
  { key: "all", label: "Todas", countKey: "all" },
  { key: "attention", label: "Atenção", countKey: "attention" },
  { key: "agendamentos", label: "Agendamentos", countKey: "agendamentos" },
  { key: "sem_resposta", label: "Sem resposta", countKey: "semResposta" },
  { key: "leads", label: "Leads", countKey: "leads" },
];

const timelineToneClasses = {
  info: "border-[#dfe8e7] bg-white text-[#0b5d6b]",
  success: "border-[#b7dfd2] bg-[#f0faf6] text-[#246b52]",
  warning: "border-[#ead7a4] bg-[#fffaf0] text-[#8a5a00]",
  danger: "border-[#f3c3bd] bg-[#fff7f5] text-[#9f2d20]",
};

type ConversationsPageProps = {
  searchParams?: Promise<{
    filter?: string;
    id?: string;
    q?: string;
    view?: string;
  }>;
};

export const dynamic = "force-dynamic";

function filterHref(
  filter: InboxFilter,
  selectedId?: string,
  search?: string,
  view?: string,
) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (selectedId) params.set("id", selectedId);
  if (search) params.set("q", search);
  if (view === "auralync") params.set("view", view);
  const suffix = params.toString();
  return suffix ? `/conversas?${suffix}` : "/conversas";
}

function conversationHref(id: string, filter?: string, search?: string, view?: string) {
  const params = new URLSearchParams({ id });
  if (filter && filter !== "all") params.set("filter", filter);
  if (search) params.set("q", search);
  if (view === "auralync") params.set("view", view);
  return `/conversas?${params.toString()}`;
}

export default async function ConversationsPage({
  searchParams,
}: ConversationsPageProps) {
  const params = await searchParams;
  const activeFilter = (params?.filter || "all") as InboxFilter;
  const search = params?.q?.trim() ?? "";
  const currentView = params?.view === "auralync" ? "auralync" : "camila";
  const inbox = await getInboxData({
    filter: activeFilter,
    selectedId: params?.id,
    search,
    view: currentView,
  });
  const selected = inbox.selected;

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
              Inbox inteligente
            </div>
            <p className="mt-2 text-xs leading-5 text-[#6f8588]">
              Estados, eventos, classificações e agenda conectados ao WhatsApp.
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-20 items-center justify-between border-b border-[#dfe8e7] bg-white/78 px-5 backdrop-blur md:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#6f8588]">
                Conversas
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[#102f36] md:text-2xl">
                Caixa de entrada com contexto da IA
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ClientSwitcher
                current={currentView}
                currentName={inbox.clientName}
                basePath="/conversas"
              />
              <Link
                href="/agenda"
                className="premium-action flex h-10 items-center gap-2 rounded-lg bg-[#0b5d6b] px-4 text-sm font-medium text-white transition hover:bg-[#084d59]"
              >
                <CalendarCheck className="h-4 w-4" />
                Ver agenda
              </Link>
            </div>
          </header>

          <nav className="flex gap-2 overflow-x-auto border-b border-[#dfe8e7] bg-white/82 px-5 py-3 backdrop-blur lg:hidden">
            {quickNav.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  href === "/conversas"
                    ? "bg-[#0b5d6b] text-white"
                    : "border border-[#dfe8e7] bg-white text-[#60777a] hover:bg-[#edf6f5]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="mx-auto grid w-full max-w-[1440px] flex-1 gap-6 px-5 py-6 md:px-8 xl:grid-cols-[360px_1fr_340px]">
            <section className="interactive-card min-h-[680px] rounded-xl border border-[#dfe8e7] bg-white shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
              <div className="border-b border-[#e8f0ef] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0b5d6b]">
                      Fila de atendimento
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-[#102f36]">
                      {filterLabels.find((filter) => filter.key === activeFilter)
                        ?.label ?? "Todas"}
                    </h2>
                  </div>
                  <MessageCircleMore className="h-5 w-5 text-[#0b5d6b]" />
                </div>

                <form
                  action="/conversas"
                  className="mt-4 flex h-10 items-center gap-3 rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3"
                >
                  {activeFilter !== "all" ? (
                    <input type="hidden" name="filter" value={activeFilter} />
                  ) : null}
                  {currentView === "auralync" ? (
                    <input type="hidden" name="view" value="auralync" />
                  ) : null}
                  <Search className="h-4 w-4 text-[#789093]" />
                  <input
                    name="q"
                    defaultValue={search}
                    className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aaeb0]"
                    placeholder="Buscar por nome, telefone ou status"
                  />
                </form>

                <div className="mt-4 flex flex-wrap gap-2">
                  {filterLabels.map((filter) => {
                    const active = activeFilter === filter.key;
                    return (
                      <Link
                        key={filter.key}
                        href={filterHref(filter.key, selected?.id, search, currentView)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? "bg-[#0b5d6b] text-white"
                            : "border border-[#dfe8e7] bg-white text-[#60777a] hover:bg-[#edf6f5]"
                        }`}
                      >
                        {filter.label} {inbox.counts[filter.countKey]}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="divide-y divide-[#e8f0ef]">
                {inbox.conversations.length > 0 ? (
                  inbox.conversations.map((conversation) => {
                    const isSelected = selected?.id === conversation.id;
                    return (
                      <Link
                        key={conversation.id}
                        href={conversationHref(
                          conversation.id,
                          activeFilter,
                          search,
                          currentView,
                        )}
                        className={`block px-5 py-4 transition hover:bg-[#f8fbfb] ${
                          isSelected ? "bg-[#f1f7f6]" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#102f36]">
                              {conversation.name}
                            </p>
                            <p className="mt-1 text-xs text-[#789093]">
                              {conversation.maskedPhone}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-[#789093]">
                            {conversation.time}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[#edf6f5] px-2.5 py-1 text-xs font-medium text-[#0b5d6b]">
                            {conversation.stage}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#60777a]">
                            {conversation.classificationLabel}
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#60777a]">
                          {conversation.summary}
                        </p>
                      </Link>
                    );
                  })
                ) : (
                  <div className="px-5 py-10 text-sm text-[#60777a]">
                    Nenhuma conversa encontrada nesta fila.
                  </div>
                )}
              </div>
            </section>

            <section className="interactive-card flex min-h-[680px] min-w-0 flex-col rounded-xl border border-[#dfe8e7] bg-white shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
              <div className="flex items-center justify-between border-b border-[#e8f0ef] px-6 py-5">
                <div>
                  <p className="text-sm font-medium text-[#0b5d6b]">
                    Conversa selecionada
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[#102f36]">
                    {selected?.name ?? "Sem conversa selecionada"}
                  </h2>
                </div>
                <span className="rounded-full bg-[#edf6f5] px-3 py-1 text-xs font-medium text-[#0b5d6b]">
                  {selected?.stage ?? "Aguardando selecao"}
                </span>
              </div>

              {selected ? (
                <>
                  <div className="grid gap-4 border-b border-[#e8f0ef] px-6 py-5 md:grid-cols-3">
                    {[
                      ["Status", selected.stage],
                      ["Classificação", selected.classificationLabel],
                      ["Confiança", selected.classificationConfidence],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-[#f5f8f7] p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
                          {label}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-[#102f36]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-b border-[#e8f0ef] bg-white px-6 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#0b5d6b]">
                          Mensagens
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-[#102f36]">
                          Historico da conversa
                        </h3>
                      </div>
                      <span className="rounded-full bg-[#f5f8f7] px-3 py-1 text-xs font-medium text-[#60777a]">
                        WhatsApp
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {inbox.messages.map((message) => {
                        const ownMessage =
                          message.author === "clinic" || message.author === "ai";

                        return (
                          <div
                            key={message.id}
                            className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-[0_10px_24px_rgba(15,60,67,0.05)] ${
                                ownMessage
                                  ? "rounded-br-md bg-[#0b5d6b] text-white"
                                  : message.author === "system"
                                    ? "bg-[#f5f8f7] text-[#4d676b]"
                                    : "rounded-bl-md border border-[#dfe8e7] bg-white text-[#102f36]"
                              }`}
                            >
                              <div className="mb-1 flex items-center justify-between gap-3 text-[11px] font-medium opacity-75">
                                <span>{message.authorLabel}</span>
                                <span>{message.time}</span>
                              </div>
                              <p className="leading-6">{message.body}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 bg-[#fbfdfd] px-6 py-6">
                    {inbox.timeline.length > 0 ? (
                      inbox.timeline.map((item) => (
                        <article
                          key={item.id}
                          className={`rounded-xl border p-4 shadow-[0_12px_30px_rgba(15,60,67,0.04)] ${
                            timelineToneClasses[item.tone]
                          }`}
                        >
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-sm font-semibold">{item.title}</p>
                              <p className="mt-2 text-sm leading-6 text-[#4d676b]">
                                {item.body}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-[#60777a]">
                              {item.meta}
                            </span>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="rounded-xl border border-[#dfe8e7] bg-white p-6 text-sm text-[#60777a]">
                        Sem eventos registrados para esta conversa.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center px-6 py-10 text-sm text-[#60777a]">
                  Nenhuma conversa selecionada.
                </div>
              )}
            </section>

            <aside className="space-y-6">
              <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#0b5d6b]">
                      Prioridade da fila
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-[#102f36]">
                      Decidir sem garimpar conversa
                    </h2>
                  </div>
                  <Sparkles className="h-5 w-5 text-[#0b5d6b]" />
                </div>

                <div className="mt-5 grid gap-2">
                  {[
                    {
                      label: "Precisam de atencao",
                      value: inbox.counts.attention,
                      href: "/conversas?filter=attention",
                      tone: "bg-[#fff7f5] text-[#9f2d20] border-[#f3c3bd]",
                    },
                    {
                      label: "Agendamentos",
                      value: inbox.counts.agendamentos,
                      href: "/conversas?filter=agendamentos",
                      tone: "bg-[#f0faf6] text-[#246b52] border-[#b7dfd2]",
                    },
                    {
                      label: "Sem resposta",
                      value: inbox.counts.semResposta,
                      href: "/conversas?filter=sem_resposta",
                      tone: "bg-[#fffaf0] text-[#8a5a00] border-[#ead7a4]",
                    },
                    {
                      label: "Leads",
                      value: inbox.counts.leads,
                      href: "/conversas?filter=leads",
                      tone: "bg-[#edf6f5] text-[#0b5d6b] border-[#cfe5e4]",
                    },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={
                        currentView === "auralync"
                          ? `${item.href}&view=auralync`
                          : item.href
                      }
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium transition hover:brightness-[0.98] ${item.tone}`}
                    >
                      <span>{item.label}</span>
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs">
                        {item.value}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                  <Sparkles className="h-4 w-4" />
                  Leitura da IA
                </div>
                <h2 className="mt-4 text-lg font-semibold text-[#102f36]">
                  {selected?.stage ?? "Sem status"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#60777a]">
                  {selected?.summary ??
                    "Quando houver conversa, a IA vai registrar a leitura operacional."}
                </p>
                <div className="mt-5 rounded-lg bg-[#edf6f5] p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
                    Próxima ação
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-[#102f36]">
                    {selected?.action ?? "Aguardar nova mensagem."}
                  </p>
                </div>
              </section>

              <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                  <UserRound className="h-4 w-4" />
                  Paciente
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ["Nome", selected?.name ?? "-"],
                    ["Telefone", selected?.maskedPhone ?? "-"],
                    ["Especialidade", selected?.specialty ?? "-"],
                    ["Ciclo", selected?.lifecycle ?? "-"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-[#f5f8f7] px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#102f36]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
                <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
                  <CheckCircle2 className="h-4 w-4" />
                  Ações rápidas
                </div>
                <div className="mt-5 grid gap-3">
                  <Link
                    href="/agenda"
                    className="premium-action flex h-10 items-center justify-between rounded-lg border border-[#dfe8e7] px-3 text-sm font-medium text-[#0b5d6b] hover:bg-[#edf6f5]"
                  >
                    Abrir agenda
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  {selected?.appointmentTitle ? (
                    <Link
                      href="/agenda"
                      className="premium-action flex min-h-10 items-center justify-between gap-3 rounded-lg border border-[#b7dfd2] bg-[#f0faf6] px-3 py-2 text-sm font-medium text-[#246b52] hover:bg-[#e6f6ee]"
                    >
                      <span>
                        {selected.appointmentTitle}
                        <span className="mt-1 block text-xs font-normal">
                          {selected.appointmentAt}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </section>

              <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-[#0d3640] p-5 text-white shadow-[0_22px_55px_rgba(13,54,64,0.16)]">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock3 className="h-4 w-4" />
                  Regra operacional
                </div>
                <p className="mt-3 text-sm leading-6 text-[#c7d8d9]">
                  Respostas sensíveis de saúde devem manter limites clínicos e
                  transbordo humano quando houver risco, urgência ou ambiguidade.
                </p>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
