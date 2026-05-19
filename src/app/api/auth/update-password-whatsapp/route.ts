import { NextRequest, NextResponse } from "next/server";
import {
  safeNextPath,
  supabaseConfig,
  supabaseFetch,
  type RecoveryCodeRow,
} from "@/lib/password-recovery";

function redirectWithError(request: NextRequest, token: string, nextPath: string) {
  const url = new URL("/recuperar-senha/nova-senha", request.url);
  if (token) url.searchParams.set("token", token);
  url.searchParams.set("next", nextPath);
  url.searchParams.set("error", "invalid");
  return NextResponse.redirect(url, 303);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const nextPath = safeNextPath(formData.get("next"));

  if (!token || password.length < 8 || password !== confirmPassword) {
    return redirectWithError(request, token, nextPath);
  }

  const rows = await supabaseFetch<RecoveryCodeRow[]>(
    `password_recovery_codes?select=*&id=eq.${encodeURIComponent(token)}&used_at=is.null&blocked_at=is.null&limit=1`,
  ).catch(() => []);
  const recovery = rows[0];

  if (!recovery || new Date(recovery.expires_at).getTime() < Date.now()) {
    return redirectWithError(request, token, nextPath);
  }

  const { url, key } = supabaseConfig();
  const response = await fetch(
    `${url}/auth/v1/admin/users/${encodeURIComponent(recovery.user_id)}`,
    {
      method: "PUT",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return redirectWithError(request, token, nextPath);
  }

  await supabaseFetch(
    `password_recovery_codes?id=eq.${encodeURIComponent(recovery.id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ used_at: new Date().toISOString() }),
    },
  ).catch(() => undefined);

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("password", "updated");
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl, 303);
}
