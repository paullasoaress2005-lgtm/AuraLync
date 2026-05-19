import { getCurrentClient } from "@/lib/current-client";

export type AiResponseRule = {
  id: string;
  scope: string;
  ruleText: string;
  status: string;
  createdAt: string;
};

export type AiResponseRulesData = {
  items: AiResponseRule[];
  setupRequired: boolean;
};

type AiResponseRuleRow = {
  id: string;
  scope: string;
  rule_text: string;
  status: string;
  created_at: string;
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

export async function getAiResponseRules(): Promise<AiResponseRulesData> {
  const config = supabaseConfig();
  const client = await getCurrentClient();

  if (!config || !client) {
    return { items: [], setupRequired: false };
  }

  const path = new URL(`${config.url}/rest/v1/ai_response_rules`);
  path.searchParams.set("select", "id,scope,rule_text,status,created_at");
  path.searchParams.set("client_id", `eq.${client.id}`);
  path.searchParams.set("status", "eq.active");
  path.searchParams.set("order", "created_at.desc");
  path.searchParams.set("limit", "4");

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

  const rows = (await response.json()) as AiResponseRuleRow[];

  return {
    setupRequired: false,
    items: rows.map((row) => ({
      id: row.id,
      scope: row.scope,
      ruleText: row.rule_text,
      status: row.status,
      createdAt: formatDateTime(row.created_at),
    })),
  };
}
