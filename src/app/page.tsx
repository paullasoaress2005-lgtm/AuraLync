import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  LockKeyhole,
  MessageCircle,
  PhoneCall,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
} from "lucide-react";

const careFlow = [
  {
    label: "WhatsApp recebido",
    text: "A IA entende contexto, intencao e urgencia sem exigir que a recepcao leia tudo manualmente.",
  },
  {
    label: "Agenda organizada",
    text: "Agendamentos, retornos e bloqueios aparecem em uma rotina visual para medico e equipe.",
  },
  {
    label: "Paciente acompanhado",
    text: "Follow-ups e lembretes podem ser preparados ou enviados conforme a politica da clinica.",
  },
];

const agents = [
  {
    icon: MessageCircle,
    title: "Agente de atendimento",
    body: "Classifica conversas, identifica leads quentes, curiosos, retornos e pacientes sem resposta.",
  },
  {
    icon: CalendarCheck,
    title: "Agente de agenda",
    body: "Sugere encaixes, bloqueia horarios e organiza consultas sem transformar a recepcao em planilha.",
  },
  {
    icon: PhoneCall,
    title: "Assessor do medico",
    body: "Recebe comandos por WhatsApp/audio, monta plano e pede confirmacao antes de avisar pacientes.",
  },
  {
    icon: ShieldCheck,
    title: "Governanca clinica",
    body: "Separa medico, admin e secretaria, protegendo informacoes sensiveis e mantendo auditoria.",
  },
];

const dashboardSignals = [
  ["12", "consultas hoje"],
  ["4", "conversas aguardando"],
  ["3", "retornos para lembrar"],
];

const promises = [
  "Menos pacientes perdidos por demora no WhatsApp",
  "Rotina clara para recepcao e medico",
  "Follow-up sem depender de memoria manual",
  "Permissoes separadas para equipe e dados clinicos",
];

const painPoints = [
  {
    title: "A recepcao vive apagando incendio",
    body: "Mensagens chegam fora de ordem, pacientes somem, retornos ficam esquecidos e o medico so percebe quando a agenda ja perdeu oportunidade.",
  },
  {
    title: "O WhatsApp guarda informacao demais",
    body: "Sem uma camada de leitura, a clinica precisa abrir conversa por conversa para entender o que aconteceu no atendimento.",
  },
  {
    title: "Agenda e atendimento nao conversam",
    body: "Paciente pede horario no WhatsApp, confirma depois, muda de ideia e a equipe precisa reconstruir tudo manualmente.",
  },
];

const useCases = [
  "Paciente novo pedindo primeira consulta",
  "Paciente recorrente que precisa marcar retorno",
  "Lead curioso comparando valores e disponibilidade",
  "Conversa parada depois da resposta da recepcao",
  "Medico cancelou um dia e precisa avisar pacientes",
  "Secretaria precisa mexer na agenda sem acessar dados clinicos",
];

const securityItems = [
  ["LGPD por perfil", "Medico, admin e secretaria podem ter permissoes diferentes."],
  ["Auditoria", "Acoes da IA, da equipe e dos workflows devem ficar registradas."],
  ["Sem diagnostico por IA", "A IA ajuda no atendimento e na organizacao, sem substituir decisao clinica."],
  ["Dados minimos", "Avisos por WhatsApp evitam expor exame, medicamento ou detalhe sensivel."],
];

const roadmapItems = [
  "Dashboard do cliente com metricas de WhatsApp, agenda e oportunidades",
  "Assessor de WhatsApp para comandos por audio ou texto do medico",
  "Follow-up assistido para pacientes que nao responderam ou precisam retornar",
  "Landing, funil de demonstracao e planos comerciais da AuraLync",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fbfdfd] text-[#102f36]">
      <header className="sticky top-0 z-20 border-b border-[#e5eeee] bg-[#fbfdfd]/88 px-5 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfe8e7] bg-white">
              <Image
                src="/auralync-logo.jpeg"
                alt="AuraLync"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg object-cover"
                priority
              />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-[0.22em] text-[#0a5e6e]">
                AURALYNC
              </span>
              <span className="block text-xs text-[#6f8588]">
                Inteligencia para clinicas
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden h-10 items-center gap-2 rounded-lg border border-[#dfe8e7] bg-white px-4 text-sm font-medium text-[#0b5d6b] transition hover:bg-[#f2f8f7] sm:flex"
            >
              <LockKeyhole className="h-4 w-4" />
              Entrar
            </Link>
            <Link
              href="#demonstracao"
              className="premium-action flex h-10 items-center gap-2 rounded-lg bg-[#0b5d6b] px-4 text-sm font-medium text-white transition hover:bg-[#084d59]"
            >
              Agendar demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="overflow-hidden px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="reveal-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe8e7] bg-white px-3 py-1.5 text-xs font-medium text-[#0b5d6b] shadow-[0_10px_30px_rgba(15,60,67,0.04)]">
              <Sparkles className="h-3.5 w-3.5" />
              Uma camada de inteligencia sobre a recepcao
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight text-[#102f36] md:text-7xl">
              Atendimento medico mais claro, humano e previsivel.
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#60777a] md:text-lg">
              A AuraLync organiza WhatsApp, agenda, retornos e sinais de
              oportunidade em uma experiencia leve para clinicas que precisam
              vender melhor sem perder controle operacional.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="#demonstracao"
                className="premium-action flex h-12 items-center gap-2 rounded-lg bg-[#0b5d6b] px-5 text-sm font-semibold text-white transition hover:bg-[#084d59]"
              >
                Agendar uma demonstracao
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#como-funciona"
                className="flex h-12 items-center gap-2 rounded-lg border border-[#dfe8e7] bg-white px-5 text-sm font-semibold text-[#0b5d6b] transition hover:bg-[#f2f8f7]"
              >
                Ver como funciona
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {promises.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-[#31575d]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0b5d6b]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-up reveal-delay-2">
            <div className="relative rounded-[28px] border border-[#dfe8e7] bg-white p-4 shadow-[0_28px_90px_rgba(15,60,67,0.08)]">
              <div className="line-scan relative overflow-hidden rounded-[22px] border border-[#e7efee] bg-[#f8fbfb] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#789093]">
                      Preview AuraLync
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[#102f36]">
                      Hoje na clinica
                    </h2>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0b5d6b] shadow-[0_12px_30px_rgba(15,60,67,0.06)]">
                    <PlayCircle className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {dashboardSignals.map(([value, label]) => (
                    <div key={label} className="rounded-2xl bg-white p-4 shadow-[0_12px_32px_rgba(15,60,67,0.04)]">
                      <p className="text-3xl font-semibold text-[#102f36]">
                        {value}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-[#6f8588]">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-[#dfe8e7] bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf6f5] text-[#0b5d6b]">
                      <MessageCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#102f36]">
                        Pamela quer marcar consulta ginecologica
                      </p>
                      <p className="mt-1 text-xs text-[#789093]">
                        IA sugeriu horario, follow-up e proxima acao.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#edf6f5]">
                    <div className="progress-flow h-full rounded-full bg-[#0b5d6b]" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#789093]">
                      Assessor WhatsApp
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#31575d]">
                      Medico envia audio, a IA monta plano e pede confirmacao.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#789093]">
                      Segurança
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#31575d]">
                      Dados clinicos ficam restritos a perfis autorizados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-[#e5eeee] bg-white px-5 py-16 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8588]">
              Jornada conectada
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102f36] md:text-5xl">
              Do primeiro contato ao retorno, a recepcao ganha contexto.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {careFlow.map((item, index) => (
              <article
                key={item.label}
                className={`interactive-card reveal-up rounded-2xl border border-[#dfe8e7] bg-[#fbfdfd] p-6 ${
                  index === 1 ? "reveal-delay-1" : index === 2 ? "reveal-delay-2" : ""
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#0b5d6b] shadow-[0_12px_30px_rgba(15,60,67,0.05)]">
                  {index + 1}
                </span>
                <h3 className="mt-6 text-xl font-semibold text-[#102f36]">
                  {item.label}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#60777a]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8588]">
              O problema real
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102f36] md:text-5xl">
              A clinica nao perde paciente por falta de ferramenta. Perde por falta de contexto.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {painPoints.map((item, index) => (
              <article
                key={item.title}
                className={`interactive-card reveal-up rounded-2xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_50px_rgba(15,60,67,0.045)] ${
                  index === 1 ? "reveal-delay-1" : index === 2 ? "reveal-delay-2" : ""
                }`}
              >
                <span className="text-4xl font-semibold tracking-tight text-[#0b5d6b]">
                  0{index + 1}
                </span>
                <h3 className="mt-7 text-xl font-semibold text-[#102f36]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#60777a]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8588]">
                Agentes AuraLync
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102f36] md:text-5xl">
                Menos telas soltas. Mais decisoes prontas.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[#60777a]">
              A plataforma trabalha como uma camada inteligente sobre WhatsApp,
              agenda e operacao da clinica.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {agents.map((agent, index) => (
              <article
                key={agent.title}
                className={`interactive-card reveal-up rounded-2xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_50px_rgba(15,60,67,0.045)] ${
                  index === 1
                    ? "reveal-delay-1"
                    : index === 2
                      ? "reveal-delay-2"
                      : index === 3
                        ? "reveal-delay-3"
                        : ""
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf6f5] text-[#0b5d6b]">
                  <agent.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-[#102f36]">
                  {agent.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#60777a]">
                  {agent.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e5eeee] bg-white px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8588]">
              Casos de uso
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102f36] md:text-5xl">
              O que a AuraLync precisa enxergar antes da equipe perder tempo.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#60777a]">
              A proposta nao e substituir a recepcao. E dar a ela uma leitura
              pronta do que importa, com proximas acoes claras.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {useCases.map((item, index) => (
              <div
                key={item}
                className={`reveal-up rounded-2xl border border-[#dfe8e7] bg-[#fbfdfd] p-5 ${
                  index % 2 ? "reveal-delay-1" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#0b5d6b]" />
                  <p className="text-sm font-medium leading-6 text-[#31575d]">
                    {item}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-8 rounded-[28px] border border-[#dfe8e7] bg-[#fbfdfd] p-6 md:grid-cols-[0.9fr_1.1fr] md:p-8">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0b5d6b] shadow-[0_12px_34px_rgba(15,60,67,0.05)]">
              <Stethoscope className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[#102f36] md:text-4xl">
              Feita para clinicas que precisam crescer sem perder padrao de atendimento.
            </h2>
          </div>

          <div className="grid gap-3">
            {[
              ["Medico", "Acompanha agenda, retornos e informacoes clinicas autorizadas."],
              ["Secretaria", "Resolve conversa, encaixe, confirmacao e follow-up operacional."],
              ["Gestor", "Enxerga volume, conversao, gargalos e oportunidades por periodo."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl bg-white p-5 shadow-[0_12px_34px_rgba(15,60,67,0.04)]">
                <div className="flex items-start gap-3">
                  <UsersRound className="mt-1 h-5 w-5 text-[#0b5d6b]" />
                  <div>
                    <p className="font-semibold text-[#102f36]">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#60777a]">
                      {body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="rounded-[28px] border border-[#dfe8e7] bg-white p-5 shadow-[0_24px_70px_rgba(15,60,67,0.06)]">
            <div className="rounded-[22px] bg-[#f8fbfb] p-5">
              <div className="flex items-center justify-between gap-4 border-b border-[#dfe8e7] pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#789093]">
                    Conversa interpretada
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#102f36]">
                    Beatriz Saraiva
                  </h3>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0b5d6b]">
                  retorno sugerido
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="max-w-[82%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm leading-6 text-[#31575d] shadow-[0_10px_28px_rgba(15,60,67,0.04)]">
                  Oi, tem horario com a Dra. Camila essa semana?
                </div>
                <div className="ml-auto max-w-[84%] rounded-2xl rounded-tr-md bg-[#edf6f5] px-4 py-3 text-sm leading-6 text-[#31575d]">
                  Temos disponibilidade na sexta. Posso te passar os melhores
                  horarios para chegar com menor espera.
                </div>
                <div className="rounded-2xl border border-[#dfe8e7] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#789093]">
                    Leitura da IA
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#31575d]">
                    Paciente com intencao clara de agendamento. Recomendar
                    horarios e registrar oportunidade na agenda.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8588]">
              Experiencia do produto
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102f36] md:text-5xl">
              Um painel que mostra o que fazer, nao apenas o que aconteceu.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#60777a]">
              O CRM nasce com foco em decisao operacional: quem precisa de
              resposta, quem pode agendar, quem deve retornar, qual paciente
              exige humano e o que o medico precisa saber hoje.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e5eeee] bg-white px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8588]">
              Seguranca e LGPD
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102f36] md:text-5xl">
              Automatizar atendimento em saude exige limite, permissao e registro.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {securityItems.map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-[#dfe8e7] bg-[#fbfdfd] p-5">
                <ShieldCheck className="h-5 w-5 text-[#0b5d6b]" />
                <h3 className="mt-4 font-semibold text-[#102f36]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#60777a]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto max-w-[1200px] rounded-[28px] border border-[#dfe8e7] bg-[#fbfdfd] p-6 md:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8588]">
              Roadmap da plataforma
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102f36] md:text-5xl">
              Comecamos pelo que gera clareza imediata. Depois expandimos para venda, planos e apps.
            </h2>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {roadmapItems.map((item, index) => (
              <div key={item} className="rounded-2xl bg-white p-5 shadow-[0_12px_34px_rgba(15,60,67,0.04)]">
                <span className="text-sm font-semibold text-[#0b5d6b]">
                  Etapa {index + 1}
                </span>
                <p className="mt-2 text-sm leading-6 text-[#31575d]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demonstracao" className="px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-8 rounded-[28px] border border-[#dfe8e7] bg-white p-6 shadow-[0_24px_70px_rgba(15,60,67,0.06)] md:grid-cols-[1fr_380px] md:p-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8588]">
              Demonstracao
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102f36] md:text-5xl">
              Vamos mapear onde sua clinica perde tempo, pacientes e retorno.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#60777a]">
              A reuniao de demonstracao mostra como a AuraLync pode atuar sobre
              WhatsApp, agenda, follow-up, permissao da equipe e relatorios de
              atendimento. Planos comerciais entram depois da validacao da
              vitrine.
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe8e7] bg-[#f8fbfb] p-5">
            <p className="text-sm font-semibold text-[#102f36]">
              Proximo passo
            </p>
            <p className="mt-2 text-sm leading-6 text-[#60777a]">
              Conectar esse botao ao WhatsApp, formulario ou calendario oficial
              da AuraLync.
            </p>
            <Link
              href="/login"
              className="mt-5 flex h-11 items-center justify-center gap-2 rounded-lg border border-[#dfe8e7] bg-white text-sm font-semibold text-[#0b5d6b] transition hover:bg-[#edf6f5]"
            >
              Area do cliente
              <LockKeyhole className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              className="premium-action mt-3 flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0b5d6b] text-sm font-semibold text-white transition hover:bg-[#084d59]"
            >
              Quero uma demonstracao
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
