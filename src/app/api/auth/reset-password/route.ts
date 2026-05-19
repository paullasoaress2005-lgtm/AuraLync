import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, safeEmail } from "@/lib/security";

export async function POST(request: NextRequest) {
  if (isRateLimited(request, "auth:email-reset", 5, 15 * 60 * 1000)) {
    return NextResponse.redirect(new URL("/login?reset=sent", request.url), 303);
  }

  const formData = await request.formData();
  const email = safeEmail(formData.get("email"));
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key && email) {
    await fetch(`${url}/auth/v1/recover`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        redirect_to: new URL("/login", request.url).toString(),
      }),
      cache: "no-store",
    }).catch(() => undefined);
  }

  return NextResponse.redirect(new URL("/login?reset=sent", request.url), 303);
}
