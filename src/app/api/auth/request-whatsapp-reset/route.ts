import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/security";
import {
  findRecoveryUser,
  generateRecoveryCode,
  hashRecoveryCode,
  normalizeIdentifier,
  safeNextPath,
  sendRecoveryCodeByWhatsApp,
  supabaseFetch,
} from "@/lib/password-recovery";

export async function POST(request: NextRequest) {
  if (isRateLimited(request, "auth:whatsapp-reset", 5, 15 * 60 * 1000)) {
    return NextResponse.redirect(new URL("/recuperar-senha/suporte", request.url), 303);
  }

  const formData = await request.formData();
  const identifier = normalizeIdentifier(formData.get("identifier"));
  const nextPath = safeNextPath(formData.get("next"));

  if (identifier) {
    const user = await findRecoveryUser(identifier).catch(() => null);

    if (user?.phone) {
      const code = generateRecoveryCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      await supabaseFetch("password_recovery_codes", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          user_id: user.user_id,
          client_id: user.client_id,
          phone: user.phone,
          code_hash: hashRecoveryCode(code),
          expires_at: expiresAt,
        }),
      }).catch(() => undefined);

      await sendRecoveryCodeByWhatsApp({
        phone: user.phone,
        code,
      }).catch(() => false);
    }
  }

  const redirect = new URL("/recuperar-senha/codigo", request.url);
  redirect.searchParams.set("next", nextPath);
  return NextResponse.redirect(redirect, 303);
}
