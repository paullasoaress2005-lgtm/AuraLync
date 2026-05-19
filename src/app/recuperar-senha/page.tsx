import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

type PageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function RecoverPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextPath = params?.next?.startsWith("/") ? params.next : "/";

  return (
    <main className="min-h-screen bg-[#f8fbfb] px-5 py-8 text-[#102f36]">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-[980px] overflow-hidden rounded-xl border border-[#dfe8e7] bg-white shadow-[0_24px_70px_rgba(15,60,67,0.08)] lg:grid-cols-[0.8fr_1fr]">
        <section className="flex flex-col justify-between bg-[#0d3640] p-8 text-white md:p-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                <Image src="/auralync-logo.jpeg" alt="AuraLync" width={34} height={34} className="h-8 w-8 rounded-lg object-cover" priority />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.2em]">AURALYNC</p>
                <p className="text-xs text-[#c7d8d9]">CRM Intelligence</p>
              </div>
            </div>
            <div className="mt-16 max-w-sm">
              <p className="text-sm font-medium text-[#9cc9c8]">Recuperacao segura</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Receba um codigo pelo WhatsApp cadastrado.
              </h1>
              <p className="mt-5 text-sm leading-6 text-[#c7d8d9]">
                O codigo expira em poucos minutos e libera apenas a criacao de uma nova senha.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-[430px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf6f5] text-[#0b5d6b]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold">Enviar codigo</h2>
            <p className="mt-2 text-sm leading-6 text-[#6f8588]">
              Informe o WhatsApp ou e-mail usado no CRM. Se estiver cadastrado, enviaremos um codigo de seis digitos.
            </p>

            <form className="mt-7 space-y-4" action="/api/auth/request-whatsapp-reset" method="post">
              <input type="hidden" name="next" value={nextPath} />
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#789093]">
                  WhatsApp ou e-mail
                </span>
                <input
                  name="identifier"
                  required
                  placeholder="5598999999999 ou email@clinica.com"
                  className="mt-2 h-11 w-full rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 text-sm outline-[#0b5d6b] placeholder:text-[#9aaeb0]"
                />
              </label>
              <button className="flex h-11 w-full items-center justify-center rounded-lg bg-[#0b5d6b] text-sm font-medium text-white transition hover:bg-[#084d59]">
                Enviar codigo
              </button>
            </form>

            <Link href="/login" className="mt-5 flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
