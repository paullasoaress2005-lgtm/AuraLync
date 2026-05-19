import Link from "next/link";
import { ArrowLeft, MessageCircle, ShieldCheck } from "lucide-react";
import { PublicThemeReset } from "@/components/public-theme-reset";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    attempts?: string;
    next?: string;
  }>;
};

export default async function RecoveryCodePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextPath = params?.next?.startsWith("/") ? params.next : "/";
  const attempts = Number(params?.attempts ?? 0);
  const message =
    params?.error === "expired"
      ? "Código expirado. Solicite um novo código."
      : params?.error
        ? attempts >= 2
          ? "Código incorreto. Esta é a última tentativa antes do suporte."
          : "Código incorreto. Confira o WhatsApp e tente novamente."
        : null;

  return (
    <main className="min-h-screen bg-[#f8fbfb] px-5 py-8 text-[#102f36]">
      <PublicThemeReset />
      <section className="mx-auto mt-10 w-full max-w-[520px] rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_24px_70px_rgba(15,60,67,0.08)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf6f5] text-[#0b5d6b]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Digite o código recebido</h1>
        <p className="mt-2 text-sm leading-6 text-[#6f8588]">
          Enviamos um código numérico para o WhatsApp cadastrado, se o contato existir no CRM.
        </p>

        {message ? (
          <div className="mt-5 rounded-lg border border-[#f3c3bd] bg-[#fff7f5] px-4 py-3 text-sm text-[#9f2d20]">
            {message}
          </div>
        ) : null}

        <form className="mt-7 space-y-4" action="/api/auth/verify-whatsapp-code" method="post">
          <input type="hidden" name="next" value={nextPath} />
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
              WhatsApp ou e-mail
            </span>
            <input
              name="identifier"
              required
              placeholder="Repita o contato informado"
              className="mt-2 h-11 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm outline-[#0b5d6b] placeholder:text-[#9aaeb0]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
              Código de 6 dígitos
            </span>
            <input
              name="code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              placeholder="000000"
              className="mt-2 h-12 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-center text-xl font-semibold tracking-[0.32em] outline-[#0b5d6b] placeholder:text-[#9aaeb0]"
            />
          </label>
          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0b5d6b] text-sm font-medium text-white transition hover:bg-[#084d59]">
            <MessageCircle className="h-4 w-4" />
            Verificar código
          </button>
        </form>

        <Link href="/recuperar-senha" className="mt-5 flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
          <ArrowLeft className="h-4 w-4" />
          Solicitar novo código
        </Link>
      </section>
    </main>
  );
}
