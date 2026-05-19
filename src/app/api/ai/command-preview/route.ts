import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient, getCurrentUserId } from "@/lib/current-client";
import { isRateLimited, rateLimitResponse, safeText } from "@/lib/security";

type CommandType =
  | "block_schedule"
  | "response_style"
  | "incident_report"
  | "follow_up"
  | "general";

type CommandPreview = {
  type: CommandType;
  title: string;
  summary: string;
  steps: string[];
  requiresConfirmation: boolean;
  safeToExecute: boolean;
  target: string;
};

const WEEKDAYS: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  "segunda-feira": 1,
  terca: 2,
  "terca-feira": 2,
  quarta: 3,
  "quarta-feira": 3,
  quinta: 4,
  "quinta-feira": 4,
  sexta: 5,
  "sexta-feira": 5,
  sabado: 6,
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function classifyCommand(command: string): CommandType {
  const text = normalize(command);

  if (/bloque|reserv|fechar agenda|indisponivel|indisponibilidade/.test(text)) {
    return "block_schedule";
  }

  if (/tom|respost|mensagem|formal|curt|acolhedor|linguagem/.test(text)) {
    return "response_style";
  }

  if (/problema|falha|erro|nao atualizou|nao sincronizou|bug|incidente/.test(text)) {
    return "incident_report";
  }

  if (/follow|retorno|sem resposta|chamar|lembrar|reativar/.test(text)) {
    return "follow_up";
  }

  return "general";
}

function nextWeekdayDate(targetWeekday: number) {
  const now = new Date();
  const current = now.getDay();
  const diff = (targetWeekday - current + 7) % 7 || 7;
  const date = new Date(now);
  date.setDate(now.getDate() + diff);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Fortaleza",
  }).format(date);
}

function extractSchedule(command: string) {
  const text = normalize(command);
  const weekday = Object.entries(WEEKDAYS).find(([label]) =>
    text.includes(normalize(label)),
  );
  const times = [...command.matchAll(/\b([01]?\d|2[0-3])(?::([0-5]\d))?\b/g)]
    .map((match) => `${match[1].padStart(2, "0")}:${match[2] ?? "00"}`)
    .slice(0, 2);

  return {
    dateLabel: weekday ? nextWeekdayDate(weekday[1]) : "data a confirmar",
    weekdayLabel: weekday?.[0] ?? "dia a confirmar",
    startTime: times[0] ?? "horario inicial a confirmar",
    endTime: times[1] ?? "horario final a confirmar",
  };
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return { url, key };
}

async function persistCommandRequest(input: {
  clientId: string;
  userId: string | null;
  command: string;
  preview: CommandPreview;
}) {
  const config = supabaseConfig();
  if (!config) return { persisted: false, actionId: null };

  const response = await fetch(`${config.url}/rest/v1/ai_command_requests`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      client_id: input.clientId,
      requested_by: input.userId,
      command_text: input.command,
      command_type: input.preview.type,
      target: input.preview.target,
      preview_title: input.preview.title,
      preview_summary: input.preview.summary,
      preview_steps: input.preview.steps,
      requires_confirmation: input.preview.requiresConfirmation,
      safe_to_execute: input.preview.safeToExecute,
      status: "pending",
    }),
    cache: "no-store",
  });

  if (!response.ok) return { persisted: false, actionId: null };

  const rows = (await response.json()) as Array<{ id?: string }>;
  return { persisted: true, actionId: rows[0]?.id ?? null };
}

function previewFor(command: string, clientName: string): CommandPreview {
  const type = classifyCommand(command);

  if (type === "block_schedule") {
    const schedule = extractSchedule(command);

    return {
      type,
      title: "Bloqueio de agenda preparado",
      summary: `Preparar bloqueio para ${clientName} em ${schedule.dateLabel}, de ${schedule.startTime} ate ${schedule.endTime}.`,
      steps: [
        "Confirmar data, horario e motivo do bloqueio.",
        "Criar bloqueio na agenda do CRM.",
        "Marcar sincronizacao pendente para o Google Calendar.",
      ],
      requiresConfirmation: true,
      safeToExecute: false,
      target: "agenda",
    };
  }

  if (type === "response_style") {
    return {
      type,
      title: "Ajuste de resposta preparado",
      summary:
        "Preparar uma nova regra de tom para respostas de agendamento, mantendo linguagem clara, acolhedora e sem orientacao clinica indevida.",
      steps: [
        "Gerar sugestao de regra de resposta.",
        "Mostrar antes/depois para revisao.",
        "Salvar somente apos confirmacao do administrador.",
      ],
      requiresConfirmation: true,
      safeToExecute: false,
      target: "regras_da_ia",
    };
  }

  if (type === "incident_report") {
    return {
      type,
      title: "Incidente operacional preparado",
      summary:
        "Registrar possivel falha de sincronizacao ou atendimento para investigacao.",
      steps: [
        "Registrar descricao do problema.",
        "Checar conversa, agenda, n8n e Google Calendar.",
        "Gerar recomendacao de correcao sem alterar dados automaticamente.",
      ],
      requiresConfirmation: true,
      safeToExecute: true,
      target: "auditoria",
    };
  }

  if (type === "follow_up") {
    return {
      type,
      title: "Follow-up preparado",
      summary:
        "Preparar mensagem de retomada para conversa parada, sem envio automatico.",
      steps: [
        "Identificar conversa ou paciente alvo.",
        "Sugerir mensagem curta e contextual.",
        "Enviar somente apos aprovacao humana.",
      ],
      requiresConfirmation: true,
      safeToExecute: false,
      target: "whatsapp",
    };
  }

  return {
    type,
    title: "Comando livre preparado",
    summary:
      "A IA vai interpretar o pedido e criar uma proposta estruturada antes de qualquer alteracao real.",
    steps: [
      "Classificar o tipo de solicitacao.",
      "Checar se envolve agenda, WhatsApp, regra da IA ou suporte.",
      "Pedir confirmacao antes de executar qualquer mudanca.",
    ],
    requiresConfirmation: true,
    safeToExecute: false,
    target: "triagem",
  };
}

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(request, "ai:command-preview", 60, 60 * 1000)) {
      return rateLimitResponse();
    }

    const client = await getCurrentClient();

    if (!client) {
      return NextResponse.json(
        { ok: false, error: "Sessao obrigatoria." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { command?: unknown };
    const command = safeText(body.command, 1200);

    if (!command) {
      return NextResponse.json(
        { ok: false, error: "Informe um comando para a IA." },
        { status: 400 },
      );
    }

    const preview = previewFor(command, client.name);

    return NextResponse.json({
      ok: true,
      command,
      preview,
      action: await persistCommandRequest({
        clientId: client.id,
        userId: await getCurrentUserId(),
        command,
        preview,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel preparar o comando.",
      },
      { status: 500 },
    );
  }
}
