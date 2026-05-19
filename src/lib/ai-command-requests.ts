import { getCurrentClient } from "@/lib/current-client";

export type AiCommandRequest = {
  id: string;
  commandText: string;
  commandType: string;
  target: string;
  title: string;
  summary: string;
  status: string;
  executionResult: {
    appointmentTitle?: string;
    appointmentAt?: string;
    durationMinutes?: number;
    type?: string;
    ruleText?: string;
    message?: string;
    registeredAt?: string;
  } | null;
  createdAt: string;
};

type AiCommandRequestRow = {
  id: string;
  command_text: string;
  command_type: string;
  target: string;
  preview_title: string;
  preview_summary: string;
  status: string;
  execution_result: {
    appointmentTitle?: string;
    appointmentAt?: string;
    durationMinutes?: number;
    type?: string;
    ruleText?: string;
    message?: string;
    registeredAt?: string;
  } | null;
  created_at: string;
};

export type AiCommandRequestsData = {
  items: AiCommandRequest[];
  setupRequired: boolean;
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return { url, key };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Fortaleza",
  }).format(new Date(value));
}

export async function getAiCommandRequests(): Promise<AiCommandRequestsData> {
  const config = supabaseConfig();
  const client = await getCurrentClient();

  if (!config || !client) {
    return { items: [], setupRequired: false };
  }

  const path = new URL(`${config.url}/rest/v1/ai_command_requests`);
  path.searchParams.set(
    "select",
    "id,command_text,command_type,target,preview_title,preview_summary,status,execution_result,created_at",
  );
  path.searchParams.set("client_id", `eq.${client.id}`);
  path.searchParams.set("order", "created_at.desc");
  path.searchParams.set("limit", "6");

  const response = await fetch(path, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return { items: [], setupRequired: response.status === 404 };
  }

  const rows = (await response.json()) as AiCommandRequestRow[];

  return {
    setupRequired: false,
    items: rows.map((row) => ({
      id: row.id,
      commandText: row.command_text,
      commandType: row.command_type,
      target: row.target,
      title: row.preview_title,
      summary: row.preview_summary,
      status: row.status,
      executionResult: row.execution_result,
      createdAt: formatDateTime(row.created_at),
    })),
  };
}
