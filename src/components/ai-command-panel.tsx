"use client";

import { useState, type ComponentType } from "react";
import {
  CalendarPlus,
  MessageCircleMore,
  MessageSquareWarning,
  Send,
  Wand2,
  type LucideIcon,
} from "lucide-react";

type QuickAction = {
  icon: LucideIcon;
  title: string;
  body: string;
  command: string;
  previewTitle: string;
  previewBody: string;
};

type CommandPreview = {
  title: string;
  summary: string;
  steps: string[];
  requiresConfirmation: boolean;
  safeToExecute: boolean;
  target: string;
};

const quickActions: QuickAction[] = [
  {
    icon: CalendarPlus,
    title: "Bloquear horário",
    body: "Reservar um periodo sem abrir formulario manual.",
    command: "Bloqueie sexta-feira das 13:00 as 15:00 para reuniao da equipe.",
    previewTitle: "Bloqueio preparado",
    previewBody:
      "A IA vai criar um bloqueio de agenda e pedir confirmacao antes de salvar.",
  },
  {
    icon: Wand2,
    title: "Ajustar resposta",
    body: "Pedir um tom mais formal, curto ou acolhedor.",
    command:
      "Deixe as respostas de agendamento mais curtas, acolhedoras e sem termos tecnicos.",
    previewTitle: "Ajuste de tom preparado",
    previewBody:
      "A IA vai sugerir uma nova regra de resposta para revisão antes de aplicar.",
  },
  {
    icon: MessageSquareWarning,
    title: "Relatar problema",
    body: "Registrar falha de agenda, WhatsApp ou atendimento.",
    command:
      "Registre um problema: o paciente confirmou horário, mas a agenda não atualizou.",
    previewTitle: "Incidente operacional preparado",
    previewBody:
      "A IA vai registrar o problema e sugerir checagem de workflow, agenda e conversa.",
  },
];

function ActionCard({
  Icon,
  title,
  body,
  onClick,
}: {
  Icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl border border-[#dfe8e7] bg-white p-4 text-left transition hover:border-[#bcd6d3] hover:bg-[#f8fbfb]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf6f5] text-[#0b5d6b]">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-[#102f36]">
          {title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-[#789093]">
          {body}
        </span>
      </span>
    </button>
  );
}

export function AiCommandPanel() {
  const [command, setCommand] = useState("");
  const [submittedCommand, setSubmittedCommand] = useState(quickActions[0].command);
  const [preview, setPreview] = useState<CommandPreview>({
    title: quickActions[0].previewTitle,
    summary: quickActions[0].previewBody,
    steps: [
      "Confirmar data, horário e motivo do bloqueio.",
      "Criar bloqueio na agenda do CRM.",
      "Sincronizar com Google Calendar após confirmação.",
    ],
    requiresConfirmation: true,
    safeToExecute: false,
    target: "agenda",
  });
  const [actionState, setActionState] = useState<{
    persisted: boolean;
    actionId: string | null;
  } | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function prepareCommand(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    setIsPreparing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ai/command-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: trimmed }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        preview?: CommandPreview;
        action?: {
          persisted: boolean;
          actionId: string | null;
        };
      };

      if (!response.ok || !payload.ok || !payload.preview) {
        throw new Error(payload.error || "Nao foi possivel preparar o comando.");
      }

      setPreview(payload.preview);
      setActionState(payload.action ?? null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel preparar o comando.",
      );
    } finally {
      setIsPreparing(false);
    }
  }

  function chooseAction(action: QuickAction) {
    setCommand(action.command);
    setSubmittedCommand(action.command);
    void prepareCommand(action.command);
  }

  function submitCommand() {
    const trimmed = command.trim();
    if (!trimmed) return;
    setSubmittedCommand(trimmed);
    void prepareCommand(trimmed);
  }

  return (
    <div className="interactive-card rounded-xl border border-[#dfe8e7] bg-white p-6 shadow-[0_18px_45px_rgba(15,60,67,0.05)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#edf6f5] text-[#0b5d6b]">
            <MessageCircleMore className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#0b5d6b]">
              Comando rapido
            </p>
            <h2 className="text-lg font-semibold text-[#102f36]">
              Assistente operacional
            </h2>
          </div>
        </div>
        <span className="w-fit rounded-full bg-[#edf6f5] px-3 py-1 text-xs font-medium text-[#0b5d6b]">
          Previa segura antes de executar
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-[#dfe8e7] bg-[#fbfdfd] p-4">
          <div className="space-y-3">
            <div className="max-w-[82%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm leading-6 text-[#4d676b] shadow-[0_10px_24px_rgba(15,60,67,0.05)]">
              Posso ajustar agenda, regras de resposta e registrar problemas
              operacionais para revisão.
            </div>
            {submittedCommand ? (
              <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-md bg-[#0b5d6b] px-4 py-3 text-sm leading-6 text-white shadow-[0_14px_30px_rgba(11,93,107,0.18)]">
                {submittedCommand}
              </div>
            ) : null}
            <div className="max-w-[86%] rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm leading-6 text-[#4d676b] shadow-[0_10px_24px_rgba(15,60,67,0.05)]">
              {isPreparing ? "Preparando uma proposta segura..." : preview.summary}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#dfe8e7] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#102f36]">
                  {preview.title}
                </p>
                <p className="mt-1 text-xs text-[#789093]">
                  Alvo: {preview.target} |{" "}
                  {preview.requiresConfirmation
                    ? "confirmacao obrigatoria"
                    : "sem confirmacao"}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  preview.safeToExecute
                    ? "bg-[#f0faf6] text-[#246b52]"
                    : "bg-[#fffaf0] text-[#8a5a00]"
                }`}
              >
                {preview.safeToExecute ? "baixo risco" : "aguarda aprovacao"}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {preview.steps.map((step, index) => (
                <div
                  key={`${step}-${index}`}
                  className="flex gap-3 rounded-lg bg-[#f8fbfb] px-3 py-2 text-xs leading-5 text-[#60777a]"
                >
                  <span className="font-semibold text-[#0b5d6b]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            {actionState ? (
              <p className="mt-3 rounded-lg border border-[#dfe8e7] bg-[#fbfdfd] px-3 py-2 text-xs text-[#60777a]">
                {actionState.persisted
                  ? `Acao pendente registrada para auditoria (${actionState.actionId}).`
                  : "Previa pronta. Registro em auditoria sera ativado apos executar o SQL da tabela de comandos."}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="mt-3 rounded-lg border border-[#f3c3bd] bg-[#fff7f5] px-3 py-2 text-xs text-[#9f2d20]">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <div className="mt-5 rounded-xl border border-[#dfe8e7] bg-white p-3">
            <textarea
              value={command}
              onChange={(event) => {
                setCommand(event.target.value);
              }}
              className="min-h-20 w-full resize-none bg-transparent text-sm leading-6 text-[#102f36] outline-none placeholder:text-[#9aaeb0]"
              placeholder="Escreva um comando: bloquear horários, adicionar encaixe, ajustar tom da IA ou relatar problema..."
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#789093]">
                A IA sempre deve pedir confirmacao antes de alterar agenda ou
                regras.
              </p>
              <button
                type="button"
                onClick={submitCommand}
                disabled={isPreparing}
                className="premium-action flex h-9 items-center gap-2 rounded-lg bg-[#0b5d6b] px-4 text-sm font-medium text-white transition hover:bg-[#084d59] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {isPreparing ? "Preparando" : "Preparar"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {quickActions.map((action) => (
            <ActionCard
              key={action.title}
              Icon={action.icon}
              title={action.title}
              body={action.body}
              onClick={() => chooseAction(action)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
