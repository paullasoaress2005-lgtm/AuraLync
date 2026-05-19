import { createHash, randomInt } from "node:crypto";

export type RecoveryUser = {
  user_id: string;
  client_id: string | null;
  email: string;
  phone: string;
};

export type RecoveryCodeRow = {
  id: string;
  user_id: string;
  client_id: string | null;
  phone: string;
  code_hash: string;
  attempts: number;
  max_attempts: number;
  expires_at: string;
  used_at: string | null;
  blocked_at: string | null;
  created_at: string;
};

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment is not configured.");
  }

  return { url, key };
}

export async function supabaseFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Supabase request failed: ${response.status}`);
  }

  return (text ? JSON.parse(text) : null) as T;
}

export function normalizeIdentifier(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function generateRecoveryCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashRecoveryCode(code: string) {
  const secret =
    process.env.RECOVERY_CODE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "auralync-local-recovery";

  return createHash("sha256").update(`${secret}:${code}`).digest("hex");
}

export async function findRecoveryUser(identifier: string) {
  const rows = await supabaseFetch<RecoveryUser[]>(
    "rpc/find_password_recovery_user",
    {
      method: "POST",
      body: JSON.stringify({ p_identifier: identifier }),
    },
  );

  return rows[0] ?? null;
}

export async function sendRecoveryCodeByWhatsApp(input: {
  phone: string;
  code: string;
}) {
  const webhookUrl = process.env.N8N_PASSWORD_RECOVERY_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("N8N_PASSWORD_RECOVERY_WEBHOOK_URL is not configured.");
    return false;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.N8N_PASSWORD_RECOVERY_TOKEN
        ? { Authorization: `Bearer ${process.env.N8N_PASSWORD_RECOVERY_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({
      phone: input.phone,
      code: input.code,
      message: `Seu codigo AuraLync e ${input.code}. Ele expira em 10 minutos. Se voce nao solicitou, ignore esta mensagem.`,
    }),
    cache: "no-store",
  }).catch(() => null);

  return Boolean(response?.ok);
}

export function safeNextPath(value: FormDataEntryValue | null) {
  const next = String(value ?? "/");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
