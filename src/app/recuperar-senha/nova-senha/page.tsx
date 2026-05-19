import { KeyRound } from "lucide-react";

type PageProps = {
  searchParams?: Promise<{
    token?: string;
    error?: string;
    next?: string;
  }>;
};

export default async function NewPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params?.token ?? "";
  const nextPath = params?.next?.startsWith("/") ? params.next : "/";

  return (
    <main className="min-h-screen bg-[#f8fbfb] px-5 py-8 text-[#102f36]">
      <section className="mx-auto mt-10 w-full max-w-[520px] rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_24px_70px_rgba(15,60,67,0.08)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf6f5] text-[#0b5d6b]">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Criar nova senha</h1>
        <p className="mt-2 text-sm leading-6 text-[#6f8588]">
          Use uma senha com pelo menos 8 caracteres. Depois disso, entre novamente no CRM.
        </p>

        {params?.error ? (
          <div className="mt-5 rounded-lg border border-[#f3c3bd] bg-[#fff7f5] px-4 py-3 text-sm text-[#9f2d20]">
            Nao foi possivel atualizar. Confira se as senhas coincidem e tente novamente.
          </div>
        ) : null}

        <form className="mt-7 space-y-4" action="/api/auth/update-password-whatsapp" method="post">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="next" value={nextPath} />
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
              Nova senha
            </span>
            <input
              name="password"
              type="password"
              minLength={8}
              required
              className="mt-2 h-11 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm outline-[#0b5d6b]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
              Confirmar senha
            </span>
            <input
              name="confirmPassword"
              type="password"
              minLength={8}
              required
              className="mt-2 h-11 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm outline-[#0b5d6b]"
            />
          </label>
          <button className="flex h-11 w-full items-center justify-center rounded-lg bg-[#0b5d6b] text-sm font-medium text-white transition hover:bg-[#084d59]">
            Atualizar senha
          </button>
        </form>
      </section>
    </main>
  );
}
