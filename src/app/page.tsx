import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

const outcomes = [
  "Menos oportunidades perdidas no WhatsApp",
  "Agenda mais clara para medico e recepcao",
  "Follow-up assistido sem depender de memoria manual",
  "Visao executiva sem abrir conversa por conversa",
];

const modules = [
  {
    icon: MessageCircle,
    title: "WhatsApp com contexto",
    body: "Classifica conversas, identifica pacientes sem resposta, oportunidades de agendamento e casos que precisam de humano.",
  },
  {
    icon: CalendarCheck,
    title: "Agenda inteligente",
    body: "Mostra consultas, bloqueios, retornos e acoes rapidas para reorganizar a rotina da clinica.",
  },
  {
    icon: ClipboardList,
    title: "Mapeamento do paciente",
    body: "Centraliza historico operacional e, para perfis autorizados, dados clinicos da ultima consulta.",
  },
  {
    icon: ShieldCheck,
    title: "Permissoes por perfil",
    body: "Medico, admin e secretaria podem ter acessos diferentes, preservando dados sensiveis.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f8fbfb] text-[#102f36]">
      <header className="border-b border-[#dfe8e7] bg-white/86 px-5 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfe8e7] bg-[#fbfdfd]">
              <Image
                src="/auralync-logo.jpeg"
                alt="AuraLync"
                width={31}
                height={31}
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
              className="hidden h-10 items-center gap-2 rounded-lg border border-[#dfe8e7] bg-white px-4 text-sm font-medium text-[#0b5d6b] transition hover:bg-[#edf6f5] sm:flex"
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

      <section className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="reveal-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dfe8e7] bg-white px-3 py-1.5 text-xs font-medium text-[#0b5d6b]">
              <Sparkles className="h-3.5 w-3.5" />
              Atendimento, agenda e follow-up com IA
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-[#102f36] md:text-6xl">
              A central inteligente para a clinica entender o WhatsApp sem viver dentro dele.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#60777a]">
              A AuraLync ajuda medicos e clinicas a enxergar conversas,
              agendamentos, pacientes sem retorno e oportunidades de atendimento
              em um painel seguro, organizado e feito para rotina real.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#demonstracao"
                className="premium-action flex h-12 items-center gap-2 rounded-lg bg-[#0b5d6b] px-5 text-sm font-semibold text-white transition hover:bg-[#084d59]"
              >
                Agendar uma demonstracao
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="flex h-12 items-center gap-2 rounded-lg border border-[#dfe8e7] bg-white px-5 text-sm font-semibold text-[#0b5d6b] transition hover:bg-[#edf6f5]"
              >
                Entrar no sistema
              </Link>
            </div>
          </div>

          <div className="reveal-up reveal-delay-2 float-soft rounded-xl border border-[#dfe8e7] bg-white p-5 shadow-[0_24px_70px_rgba(15,60,67,0.08)]">
            <div className="relative overflow-hidden rounded-xl bg-[#0d3640] p-5 text-white">
              <div className="line-scan pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
                <span className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-[#9cc9c8] to-transparent" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9cc9c8]">
                    Resumo do dia
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    12 consultas confirmadas
                  </h2>
                </div>
                <Stethoscope className="h-8 w-8 text-[#9cc9c8]" />
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  ["3", "pacientes aguardando retorno"],
                  ["2", "oportunidades de agenda"],
                  ["1", "conversa pede revisao humana"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-lg bg-white/8 px-4 py-3"
                  >
                    <span className="text-sm text-[#d8e6e6]">{label}</span>
                    <span className="text-lg font-semibold">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-white/10 bg-white/8 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#d8e6e6]">
                    <Bot className="h-4 w-4 text-[#9cc9c8]" />
                    IA analisando WhatsApp
                  </div>
                  <span className="status-pulse h-2.5 w-2.5 rounded-full bg-[#9cc9c8]" />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="progress-flow h-full rounded-full bg-[#9cc9c8]" />
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {outcomes.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-lg bg-[#f5f8f7] px-4 py-3 text-sm font-medium text-[#31575d]"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#0b5d6b]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dfe8e7] bg-white px-5 py-14 md:px-8">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8588]">
            O que melhora na clinica
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module, index) => (
              <article
                key={module.title}
                className={`interactive-card reveal-up rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] p-5 ${
                  index === 1
                    ? "reveal-delay-1"
                    : index === 2
                      ? "reveal-delay-2"
                      : index === 3
                        ? "reveal-delay-3"
                        : ""
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf6f5] text-[#0b5d6b]">
                  <module.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-[#102f36]">
                  {module.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#60777a]">
                  {module.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="demonstracao" className="px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-[1180px] gap-6 rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_24px_70px_rgba(15,60,67,0.06)] md:grid-cols-[1fr_360px] md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8588]">
              Demonstracao
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#102f36]">
              Veja como a AuraLync pode organizar a recepcao da sua clinica.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#60777a]">
              Na demonstracao, avaliamos sua rotina de WhatsApp, agenda,
              follow-up e pontos de perda de paciente. Planos comerciais entram
              em uma etapa futura, quando a vitrine estiver validada.
            </p>
          </div>
          <div className="rounded-xl bg-[#f5f8f7] p-5">
            <p className="text-sm font-semibold text-[#102f36]">
              Agendamento da reuniao
            </p>
            <p className="mt-2 text-sm leading-6 text-[#60777a]">
              Por enquanto, o botao pode direcionar para WhatsApp, formulario ou
              agenda externa. Depois conectamos ao funil oficial da AuraLync.
            </p>
            <Link
              href="/login"
              className="mt-5 flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0b5d6b] text-sm font-semibold text-white transition hover:bg-[#084d59]"
            >
              Acessar area do cliente
              <LockKeyhole className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
