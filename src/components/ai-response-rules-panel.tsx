import { SlidersHorizontal } from "lucide-react";
import type { AiResponseRule } from "@/lib/ai-response-rules";

type Props = {
  items: AiResponseRule[];
  setupRequired: boolean;
};

export function AiResponseRulesPanel({ items, setupRequired }: Props) {
  return (
    <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
            <SlidersHorizontal className="h-4 w-4" />
            Regras ativas
          </div>
          <h2 className="mt-2 text-lg font-semibold text-[#102f36]">
            Tom atual da IA
          </h2>
        </div>
        <span className="rounded-full bg-[#edf6f5] px-2.5 py-1 text-xs font-medium text-[#0b5d6b]">
          {items.length}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {setupRequired ? (
          <div className="rounded-xl border border-[#ead7a4] bg-[#fffaf0] p-4 text-sm leading-6 text-[#8a5a00]">
            Execute o SQL `adm_system_ai_response_rules.sql` para ativar regras
            persistentes de resposta.
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0b5d6b]">
                  {item.scope}
                </span>
                <span className="text-[11px] font-medium text-[#789093]">
                  {item.createdAt}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#31575d]">
                {item.ruleText}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] p-4 text-sm leading-6 text-[#60777a]">
            Nenhuma regra ativa ainda. Use o mini chat para preparar um ajuste
            de resposta, aprove e execute.
          </div>
        )}
      </div>
    </section>
  );
}
