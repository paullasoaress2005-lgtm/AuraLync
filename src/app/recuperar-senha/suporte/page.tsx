import Link from "next/link";
import { MessageCircleWarning } from "lucide-react";

export default function RecoverySupportPage() {
  return (
    <main className="min-h-screen bg-[#f8fbfb] px-5 py-8 text-[#102f36]">
      <section className="mx-auto mt-10 w-full max-w-[520px] rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_24px_70px_rgba(15,60,67,0.08)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1f0] text-[#9f2d20]">
          <MessageCircleWarning className="h-5 w-5" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Fale com o suporte AuraLync</h1>
        <p className="mt-2 text-sm leading-6 text-[#6f8588]">
          Por seguranca, o codigo foi bloqueado apos tentativas incorretas. Entre em contato com a equipe AuraLync para confirmar sua identidade e liberar o acesso.
        </p>
        <Link
          href="https://wa.me/5598984668340"
          className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-[#0b5d6b] text-sm font-medium text-white transition hover:bg-[#084d59]"
        >
          Chamar suporte no WhatsApp
        </Link>
        <Link
          href="/login"
          className="mt-3 flex h-11 w-full items-center justify-center rounded-lg border border-[#dfe8e7] bg-white text-sm font-medium text-[#0b5d6b] transition hover:bg-[#edf6f5]"
        >
          Voltar para o login
        </Link>
      </section>
    </main>
  );
}
