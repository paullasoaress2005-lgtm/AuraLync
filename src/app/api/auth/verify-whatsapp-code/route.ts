import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/security";
import {
  findRecoveryUser,
  hashRecoveryCode,
  normalizeIdentifier,
  normalizePhone,
  safeNextPath,
  supabaseFetch,
  type RecoveryCodeRow,
} from "@/lib/password-recovery";

function codePage(request: NextRequest, params: Record<string, string>) {
  const url = new URL("/recuperar-senha/codigo", request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}

export async function POST(request: NextRequest) {
  if (isRateLimited(request, "auth:verify-code", 10, 15 * 60 * 1000)) {
    return NextResponse.redirect(new URL("/recuperar-senha/suporte", request.url), 303);
  }

  const formData = await request.formData();
  const identifier = normalizeIdentifier(formData.get("identifier"));
  const code = normalizePhone(String(formData.get("code") ?? ""));
  const nextPath = safeNextPath(formData.get("next"));

  if (!identifier || code.length !== 6) {
    return NextResponse.redirect(
      codePage(request, { error: "invalid", next: nextPath }),
      303,
    );
  }

  const user = await findRecoveryUser(identifier).catch(() => null);
  if (!user) {
    return NextResponse.redirect(
      codePage(request, { error: "invalid", next: nextPath }),
      303,
    );
  }

  const rows = await supabaseFetch<RecoveryCodeRow[]>(
    `password_recovery_codes?select=*&user_id=eq.${encodeURIComponent(user.user_id)}&used_at=is.null&blocked_at=is.null&order=created_at.desc&limit=1`,
  ).catch(() => []);
  const recovery = rows[0];

  if (!recovery || new Date(recovery.expires_at).getTime() < Date.now()) {
    return NextResponse.redirect(
      codePage(request, { error: "expired", next: nextPath }),
      303,
    );
  }

  const nextAttempt = recovery.attempts + 1;
  const matches = recovery.code_hash === hashRecoveryCode(code);

  if (!matches) {
    await supabaseFetch(
      `password_recovery_codes?id=eq.${encodeURIComponent(recovery.id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          attempts: nextAttempt,
          blocked_at:
            nextAttempt >= recovery.max_attempts ? new Date().toISOString() : null,
        }),
      },
    ).catch(() => undefined);

    if (nextAttempt >= recovery.max_attempts) {
      return NextResponse.redirect(new URL("/recuperar-senha/suporte", request.url), 303);
    }

    return NextResponse.redirect(
      codePage(request, {
        error: "invalid",
        attempts: String(nextAttempt),
        next: nextPath,
      }),
      303,
    );
  }

  const redirect = new URL("/recuperar-senha/nova-senha", request.url);
  redirect.searchParams.set("token", recovery.id);
  redirect.searchParams.set("next", nextPath);
  return NextResponse.redirect(redirect, 303);
}
