"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PlayCircle, XCircle } from "lucide-react";
import type { AiCommandRequest } from "@/lib/ai-command-requests";

type Props = {
  items: AiCommandRequest[];
  setupRequired: boolean;
};

function formatExecutionDate(value?: string) {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Fortaleza",
  }).format(new Date(value));
}

function executionSummary(item: AiCommandRequest) {
  const result = item.executionResult;
  if (!result) return null;

  if (result.type === "appointment_block") {
    const date = formatExecutionDate(result.appointmentAt);
    return [
      result.appointmentTitle ?? "Bloqueio criado",
      date ? `em ${date}` : null,
      result.durationMinutes ? `por ${result.durationMinutes} min` : null,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (result.type === "ai_response_rule") {
    return "Regra de resposta salva para o agente de agendamento.";
  }

  if (result.type === "incident_report") {
    const date = formatExecutionDate(result.registeredAt);
    return date
      ? `Incidente registrado para checagem em ${date}.`
      : "Incidente registrado para checagem.";
  }

  if (result.type === "follow_up_draft") {
    return result.message
      ? `Rascunho criado: ${result.message}`
      : "Rascunho de follow-up criado sem envio automatico.";
  }

  return "Acao concluida.";
}

export function AiCommandRequestsPanel({ items, setupRequired }: Props) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function updateStatus(id: string, status: "approved" | "cancelled") {
    setLoadingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/command-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Nao foi possivel atualizar a acao.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar a acao.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function executeAction(id: string) {
    setLoadingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/command-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Nao foi possivel executar a acao.");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel executar a acao.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#0b5d6b]">
            <CheckCircle2 className="h-4 w-4" />
            Acoes pendentes
          </div>
          <h2 className="mt-2 text-lg font-semibold text-[#102f36]">
            Auditoria do mini chat
          </h2>
        </div>
        <span className="rounded-full bg-[#edf6f5] px-2.5 py-1 text-xs font-medium text-[#0b5d6b]">
          {items.length}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {setupRequired ? (
          <div className="rounded-xl border border-[#ead7a4] bg-[#fffaf0] p-4 text-sm leading-6 text-[#8a5a00]">
            Execute o SQL `adm_system_ai_command_requests.sql` para ativar o
            historico auditavel das acoes.
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[#102f36]">
                  {item.title}
                </p>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#60777a]">
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#60777a]">
                {item.summary}
              </p>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#789093]">
                {item.target} | {item.createdAt}
              </p>
              {item.status === "executed" && item.executionResult ? (
                <div className="mt-4 rounded-lg border border-[#cfe4df] bg-[#eef8f6] p-3 text-xs leading-5 text-[#31575d]">
                  <span className="font-semibold text-[#0b5d6b]">
                    Executado:
                  </span>{" "}
                  {executionSummary(item)}
                  .
                </div>
              ) : null}
              {item.status === "pending" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={loadingId === item.id}
                    onClick={() => updateStatus(item.id, "approved")}
                    className="premium-action flex h-8 items-center gap-2 rounded-lg bg-[#0b5d6b] px-3 text-xs font-medium text-white transition hover:bg-[#084d59] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aprovar
                  </button>
                  <button
                    type="button"
                    disabled={loadingId === item.id}
                    onClick={() => updateStatus(item.id, "cancelled")}
                    className="premium-action flex h-8 items-center gap-2 rounded-lg border border-[#dfe8e7] bg-white px-3 text-xs font-medium text-[#60777a] transition hover:bg-[#f8fbfb] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                </div>
              ) : null}
              {item.status === "approved" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={loadingId === item.id}
                    onClick={() => executeAction(item.id)}
                    className="premium-action flex h-8 items-center gap-2 rounded-lg bg-[#0b5d6b] px-3 text-xs font-medium text-white transition hover:bg-[#084d59] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Executar
                  </button>
                  <button
                    type="button"
                    disabled={loadingId === item.id}
                    onClick={() => updateStatus(item.id, "cancelled")}
                    className="premium-action flex h-8 items-center gap-2 rounded-lg border border-[#dfe8e7] bg-white px-3 text-xs font-medium text-[#60777a] transition hover:bg-[#f8fbfb] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] p-4 text-sm leading-6 text-[#60777a]">
            Nenhuma ação pendente registrada ainda.
          </div>
        )}
      </div>

      {errorMessage ? (
        <p className="mt-3 rounded-lg border border-[#f3c3bd] bg-[#fff7f5] px-3 py-2 text-xs text-[#9f2d20]">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
