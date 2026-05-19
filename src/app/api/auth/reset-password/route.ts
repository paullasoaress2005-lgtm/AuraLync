import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
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
