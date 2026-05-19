import Image from "next/image";
import Link from "next/link";
import { ArrowRight, KeyRound, LockKeyhole, Mail, MessageCircle } from "lucide-react";
import { PublicThemeReset } from "@/components/public-theme-reset";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    reset?: string;
    password?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage =
    params?.error === "missing"
      ? "Configuração local ausente. O CRM precisa das variáveis do Supabase no servidor."
      : params?.error === "profile"
        ? "Login autenticado, mas este usuário ainda não está vinculado a uma clínica."
        : params?.error === "rate_limit"
          ? "Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente."
        : params?.error
          ? "Não foi possível entrar. Confira e-mail e senha ou solicite recuperação."
          : null;
  const resetSent = params?.reset === "sent";
  const passwordUpdated = params?.password === "updated";
  const nextPath = params?.next?.startsWith("/") ? params.next : "/dashboard";

  return (
    <main className="min-h-screen bg-[#f8fbfb] px-5 py-8 text-[#102f36]">
      <PublicThemeReset />
      <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-[1180px] overflow-hidden rounded-xl border border-[#dfe8e7] bg-white shadow-[0_24px_70px_rgba(15,60,67,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-between bg-[#0d3640] p-8 text-white md:p-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
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
                <p className="text-sm font-semibold tracking-[0.2em]">
                  AURALYNC
                </p>
                <p className="text-xs text-[#c7d8d9]">CRM Intelligence</p>
              </div>
            </div>

            <div className="mt-16 max-w-md">
              <p className="text-sm font-medium text-[#9cc9c8]">
                Acesso do cliente
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Uma central segura para entender o WhatsApp sem abrir conversa por conversa.
              </h1>
              <p className="mt-5 text-sm leading-6 text-[#c7d8d9]">
                Acompanhe conversas, agendamentos e sinais de atendimento em um
                ambiente privado da sua clínica.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-white/10 bg-white/8 p-5 text-sm leading-6 text-[#d8e6e6]">
            <p className="font-medium text-white">AuraLync CRM</p>
            <p className="mt-2 text-[#c7d8d9]">
              Inteligencia operacional para recepcoes que precisam de clareza,
              velocidade e controle sobre cada oportunidade.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-[430px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf6f5] text-[#0b5d6b]">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-[#102f36]">
              Entrar no CRM
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6f8588]">
              Entre com seu e-mail e senha para acessar a central da clínica.
            </p>

            {errorMessage ? (
              <div className="mt-5 rounded-lg border border-[#f3c3bd] bg-[#fff7f5] px-4 py-3 text-sm text-[#9f2d20]">
                {errorMessage}
              </div>
            ) : null}

            {resetSent ? (
              <div className="mt-5 rounded-lg border border-[#b7dfd2] bg-[#f0faf6] px-4 py-3 text-sm text-[#246b52]">
                Se o contato existir, enviaremos as instruções de recuperação.
              </div>
            ) : null}

            {passwordUpdated ? (
              <div className="mt-5 rounded-lg border border-[#b7dfd2] bg-[#f0faf6] px-4 py-3 text-sm text-[#246b52]">
                Senha atualizada. Entre novamente com a nova senha.
              </div>
            ) : null}

            <form className="mt-7 space-y-4" action="/api/auth/login" method="post">
              <input type="hidden" name="next" value={nextPath} />
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
                  E-mail
                </span>
                <div className="mt-2 flex h-11 items-center gap-3 rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3">
                  <Mail className="h-4 w-4 text-[#0b5d6b]" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="seuemail@clinica.com"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#102f36] outline-none placeholder:text-[#9aaeb0]"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
                  Senha
                </span>
                <div className="mt-2 flex h-11 items-center gap-3 rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3">
                  <KeyRound className="h-4 w-4 text-[#0b5d6b]" />
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Sua senha"
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#102f36] outline-none placeholder:text-[#9aaeb0]"
                  />
                </div>
              </label>

              <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0b5d6b] text-sm font-medium text-white transition hover:bg-[#084d59]">
                Entrar
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <Link
              href={`/recuperar-senha${nextPath !== "/" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#dfe8e7] bg-white text-sm font-medium text-[#0b5d6b] transition hover:bg-[#edf6f5]"
            >
              <MessageCircle className="h-4 w-4" />
                Esqueci minha senha
            </Link>

            <div className="mt-6 grid gap-2 rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#789093]">
                Acessos de demonstração
              </p>
              <div className="rounded-lg bg-white p-3 text-sm leading-6 text-[#31575d]">
                <span className="font-semibold text-[#102f36]">Médico:</span>{" "}
                demonstrativo@auralync.com
              </div>
              <div className="rounded-lg bg-white p-3 text-sm leading-6 text-[#31575d]">
                <span className="font-semibold text-[#102f36]">Secretária:</span>{" "}
                secretaria@auralync.com
              </div>
              <p className="text-xs leading-5 text-[#789093]">
                A senha temporária deve ser definida no Supabase Auth antes do
                primeiro uso público.
              </p>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-[#789093]">
              Acesso restrito. Cada clínica visualiza apenas seus próprios dados.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
