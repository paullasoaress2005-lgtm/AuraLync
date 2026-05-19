import { NextRequest, NextResponse } from "next/server";
import { createAppointment } from "@/lib/appointments";
import { getCurrentClient } from "@/lib/current-client";
import { isRateLimited, rateLimitResponse, safeText } from "@/lib/security";

const ALLOWED_STATUSES = ["approved", "cancelled"] as const;

type AiCommandRequestRow = {
  id: string;
  client_id: string;
  command_text: string;
  command_type: string;
  status: string;
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

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return { url, key };
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatDateInput(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Fortaleza",
  });

  return formatter.format(date);
}

function parseDateInput(command: string) {
  const isoDate = command.match(/\b(20\d{2})-(0[1-9]|1[0-2])-([0-2]\d|3[01])\b/);
  if (isoDate) return isoDate[0];

  const brDate = command.match(/\b([0-2]?\d|3[01])\/(0?\d|1[0-2])(?:\/(20\d{2}))?\b/);
  if (brDate) {
    const day = brDate[1].padStart(2, "0");
    const month = brDate[2].padStart(2, "0");
    const year = brDate[3] ?? new Date().getFullYear().toString();
    return `${year}-${month}-${day}`;
  }

  const text = normalize(command);
  const weekday = Object.entries(WEEKDAYS).find(([label]) =>
    text.includes(normalize(label)),
  );

  if (!weekday) return null;

  const now = new Date();
  const currentWeekday = now.getDay();
  const daysToAdd = (weekday[1] - currentWeekday + 7) % 7 || 7;
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysToAdd);

  return formatDateInput(targetDate);
}

function parseTimes(command: string) {
  const matches = [...command.matchAll(/\b([01]?\d|2[0-3])(?::([0-5]\d))?\b/g)];
  const times = matches
    .map((match) => `${match[1].padStart(2, "0")}:${match[2] ?? "00"}`)
    .slice(0, 2);

  return {
    startTime: times[0] ?? null,
    endTime: times[1] ?? null,
  };
}

function minutesBetween(startTime: string, endTime: string | null) {
  if (!endTime) return 60;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  const duration = end - start;

  return duration > 0 ? duration : 60;
}

function parseBlockSchedule(command: string) {
  const appointmentDate = parseDateInput(command);
  const { startTime, endTime } = parseTimes(command);

  return {
    appointmentDate,
    appointmentTime: startTime,
    durationMinutes:
      appointmentDate && startTime ? minutesBetween(startTime, endTime) : null,
  };
}

async function getCommandRequest(input: {
  config: { url: string; key: string };
  clientId: string;
  id: string;
}) {
  const response = await fetch(
    `${input.config.url}/rest/v1/ai_command_requests?select=id,client_id,command_text,command_type,status&id=eq.${encodeURIComponent(input.id)}&client_id=eq.${encodeURIComponent(input.clientId)}&limit=1`,
    {
      headers: {
        apikey: input.config.key,
        Authorization: `Bearer ${input.config.key}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Nao foi possivel localizar a acao.");
  }

  const rows = (await response.json()) as AiCommandRequestRow[];
  return rows[0] ?? null;
}

async function markCommandRequestExecuted(input: {
  config: { url: string; key: string };
  clientId: string;
  id: string;
  result: unknown;
}) {
  const now = new Date().toISOString();
  const response = await fetch(
    `${input.config.url}/rest/v1/ai_command_requests?id=eq.${encodeURIComponent(input.id)}&client_id=eq.${encodeURIComponent(input.clientId)}`,
    {
      method: "PATCH",
      headers: {
        apikey: input.config.key,
        Authorization: `Bearer ${input.config.key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status: "executed",
        executed_at: now,
        updated_at: now,
        execution_result: input.result,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("A acao foi executada, mas a auditoria nao foi atualizada.");
  }
}

function buildResponseRule(command: string) {
  return [
    "Ao responder conversas de agendamento, use linguagem curta, acolhedora e objetiva.",
    "Nao use termos tecnicos desnecessarios.",
    "Nao prometa diagnostico, resultado clinico ou conduta medica.",
    `Pedido original aprovado: ${command}`,
  ].join(" ");
}

function buildFollowUpDraft(command: string) {
  return {
    channel: "whatsapp",
    sendAutomatically: false,
    message:
      "Oi, tudo bem? Passando para saber se voce ainda deseja seguir com o agendamento. Posso te ajudar a escolher o melhor horario.",
    sourceCommand: command,
  };
}

async function createResponseRule(input: {
  config: { url: string; key: string };
  clientId: string;
  commandRequestId: string;
  command: string;
}) {
  const response = await fetch(`${input.config.url}/rest/v1/ai_response_rules`, {
    method: "POST",
    headers: {
      apikey: input.config.key,
      Authorization: `Bearer ${input.config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      client_id: input.clientId,
      source_command_request_id: input.commandRequestId,
      scope: "agendamento",
      rule_text: buildResponseRule(input.command),
      status: "active",
    }),
    cache: "no-store",
  });

  if (response.status === 404) {
    throw new Error(
      "Execute o SQL adm_system_ai_response_rules.sql para ativar regras de resposta da IA.",
    );
  }

  if (!response.ok) {
    throw new Error("Nao foi possivel salvar a regra de resposta da IA.");
  }

  const rows = (await response.json()) as Array<{ id?: string; rule_text?: string }>;
  return rows[0] ?? null;
}

export async function PATCH(request: NextRequest) {
  try {
    if (isRateLimited(request, "ai:command-requests:update", 80, 60 * 1000)) {
      return rateLimitResponse();
    }

    const client = await getCurrentClient();
    const config = supabaseConfig();

    if (!client || !config) {
      return NextResponse.json(
        { ok: false, error: "Sessao obrigatoria." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      id?: unknown;
      status?: unknown;
    };
    const id = safeText(body.id, 80);
    const status = safeText(body.status, 30);

    if (!id || !ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
      return NextResponse.json(
        { ok: false, error: "Acao ou status invalido." },
        { status: 400 },
      );
    }

    const timestampField = status === "approved" ? "approved_at" : "cancelled_at";
    const response = await fetch(
      `${config.url}/rest/v1/ai_command_requests?id=eq.${encodeURIComponent(id)}&client_id=eq.${encodeURIComponent(client.id)}`,
      {
        method: "PATCH",
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          status,
          [timestampField]: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, error: "Nao foi possivel atualizar a acao." },
        { status: response.status },
      );
    }

    const rows = (await response.json()) as Array<{ id?: string }>;

    return NextResponse.json({
      ok: true,
      id: rows[0]?.id ?? id,
      status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel atualizar a acao.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(request, "ai:command-requests:execute", 40, 60 * 1000)) {
      return rateLimitResponse();
    }

    const client = await getCurrentClient();
    const config = supabaseConfig();

    if (!client || !config) {
      return NextResponse.json(
        { ok: false, error: "Sessao obrigatoria." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { id?: unknown };
    const id = safeText(body.id, 80);

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Informe a acao que deve ser executada." },
        { status: 400 },
      );
    }

    const commandRequest = await getCommandRequest({
      config,
      clientId: client.id,
      id,
    });

    if (!commandRequest) {
      return NextResponse.json(
        { ok: false, error: "Acao nao encontrada para este perfil." },
        { status: 404 },
      );
    }

    if (commandRequest.status !== "approved") {
      return NextResponse.json(
        { ok: false, error: "A acao precisa estar aprovada antes de executar." },
        { status: 400 },
      );
    }

    if (commandRequest.command_type === "response_style") {
      const rule = await createResponseRule({
        config,
        clientId: client.id,
        commandRequestId: commandRequest.id,
        command: commandRequest.command_text,
      });
      const result = {
        type: "ai_response_rule",
        ruleId: rule?.id ?? null,
        ruleText: rule?.rule_text ?? buildResponseRule(commandRequest.command_text),
      };

      await markCommandRequestExecuted({
        config,
        clientId: client.id,
        id,
        result,
      });

      return NextResponse.json({
        ok: true,
        status: "executed",
        result,
      });
    }

    if (commandRequest.command_type === "incident_report") {
      const result = {
        type: "incident_report",
        registeredAt: new Date().toISOString(),
        checklist: [
          "Checar conversa no Chatwoot.",
          "Checar evento da agenda.",
          "Checar workflow n8n responsavel.",
          "Checar sincronizacao com Google Calendar.",
        ],
        sourceCommand: commandRequest.command_text,
      };

      await markCommandRequestExecuted({
        config,
        clientId: client.id,
        id,
        result,
      });

      return NextResponse.json({
        ok: true,
        status: "executed",
        result,
      });
    }

    if (commandRequest.command_type === "follow_up") {
      const result = {
        type: "follow_up_draft",
        ...buildFollowUpDraft(commandRequest.command_text),
      };

      await markCommandRequestExecuted({
        config,
        clientId: client.id,
        id,
        result,
      });

      return NextResponse.json({
        ok: true,
        status: "executed",
        result,
      });
    }

    if (commandRequest.command_type !== "block_schedule") {
      return NextResponse.json(
        {
          ok: false,
          error: "A execucao automatica deste tipo de acao ainda nao foi ativada.",
        },
        { status: 400 },
      );
    }

    const parsed = parseBlockSchedule(commandRequest.command_text);

    if (!parsed.appointmentDate || !parsed.appointmentTime || !parsed.durationMinutes) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Nao consegui identificar data e horario. Escreva algo como: bloquear sexta das 13:00 as 15:00.",
        },
        { status: 400 },
      );
    }

    const appointment = await createAppointment({
      patientName: "Bloqueio manual",
      patientPhone: "",
      title: "Bloqueio solicitado pela IA",
      specialty: "agenda",
      appointmentDate: parsed.appointmentDate,
      appointmentTime: parsed.appointmentTime,
      durationMinutes: parsed.durationMinutes,
      status: "blocked",
      notes: `Comando aprovado no mini chat: ${commandRequest.command_text}`,
    });

    const result = {
      type: "appointment_block",
      appointmentId: appointment.id,
      appointmentTitle: appointment.title,
      appointmentAt: appointment.appointmentAtIso,
      durationMinutes: appointment.durationMinutes,
    };

    await markCommandRequestExecuted({
      config,
      clientId: client.id,
      id,
      result,
    });

    return NextResponse.json({
      ok: true,
      status: "executed",
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel executar a acao.",
      },
      { status: 500 },
    );
  }
}
