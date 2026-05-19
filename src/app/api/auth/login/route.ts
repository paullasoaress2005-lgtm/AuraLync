import { NextRequest, NextResponse } from "next/server";
import { isRateLimited, safeEmail, safePath } from "@/lib/security";

type SupabasePasswordResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email?: string;
  };
  error_description?: string;
  msg?: string;
};

type ProfileRow = {
  id: string;
  client_id: string;
};

function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

async function userHasProfile(url: string, key: string, userId: string) {
  const response = await fetch(
    `${url}/rest/v1/profiles?select=id,client_id&id=eq.${encodeURIComponent(userId)}&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) return false;

  const rows = (await response.json()) as ProfileRow[];
  return Boolean(rows[0]?.client_id);
}

export async function POST(request: NextRequest) {
  if (isRateLimited(request, "auth:login", 8, 10 * 60 * 1000)) {
    return NextResponse.redirect(new URL("/login?error=rate_limit", request.url), 303);
  }

  const formData = await request.formData();
  const email = safeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const nextPath = safePath(formData.get("next"));
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || !email || !password) {
    return NextResponse.redirect(new URL("/login?error=missing", request.url), 303);
  }

  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const payload = (await response.json()) as SupabasePasswordResponse;

  if (
    !response.ok ||
    !payload.access_token ||
    !payload.refresh_token ||
    !payload.user?.id
  ) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
  }

  if (!(await userHasProfile(url, key, payload.user.id))) {
    return NextResponse.redirect(new URL("/login?error=profile", request.url), 303);
  }

  const redirect = NextResponse.redirect(new URL(nextPath, request.url), 303);
  redirect.cookies.set(
    "al_access_token",
    payload.access_token,
    authCookieOptions(payload.expires_in ?? 3600),
  );
  redirect.cookies.set(
    "al_refresh_token",
    payload.refresh_token,
    authCookieOptions(60 * 60 * 24 * 30),
  );
  redirect.cookies.set(
    "al_user_id",
    payload.user.id,
    authCookieOptions(60 * 60 * 24 * 30),
  );

  return redirect;
}
