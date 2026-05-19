import { NextRequest, NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security";

const PUBLIC_PATHS = ["/", "/login", "/recuperar-senha"];
const PUBLIC_API_PATHS = ["/api/auth"];

type SupabaseTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id?: string;
  };
};

type SessionState =
  | { ok: true; tokens?: SupabaseTokenResponse }
  | { ok: false; shouldClearCookies?: boolean };

function authCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PATHS.some((path) => pathname.startsWith(`${path}/`)) ||
    PUBLIC_API_PATHS.some((path) => pathname.startsWith(path))
  );
}

async function validateAccessToken(accessToken: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return false;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function refreshSession(refreshToken: string) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  try {
    const response = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      },
    );

    const payload = (await response.json()) as SupabaseTokenResponse;

    if (!response.ok || !payload.access_token || !payload.refresh_token) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function getSessionState(request: NextRequest): Promise<SessionState> {
  const accessToken = request.cookies.get("al_access_token")?.value;
  const refreshToken = request.cookies.get("al_refresh_token")?.value;

  if (accessToken && (await validateAccessToken(accessToken))) {
    return { ok: true };
  }

  if (!refreshToken) {
    return { ok: false, shouldClearCookies: Boolean(accessToken) };
  }

  const refreshedTokens = await refreshSession(refreshToken);

  if (!refreshedTokens) {
    return { ok: false, shouldClearCookies: true };
  }

  return { ok: true, tokens: refreshedTokens };
}

function writeAuthCookies(response: NextResponse, tokens: SupabaseTokenResponse) {
  if (tokens.access_token) {
    response.cookies.set(
      "al_access_token",
      tokens.access_token,
      authCookieOptions(tokens.expires_in ?? 3600),
    );
  }

  if (tokens.refresh_token) {
    response.cookies.set(
      "al_refresh_token",
      tokens.refresh_token,
      authCookieOptions(60 * 60 * 24 * 30),
    );
  }

  if (tokens.user?.id) {
    response.cookies.set(
      "al_user_id",
      tokens.user.id,
      authCookieOptions(60 * 60 * 24 * 30),
    );
  }
}

function clearAuthCookies(response: NextResponse) {
  for (const name of ["al_access_token", "al_refresh_token", "al_user_id"]) {
    response.cookies.set(name, "", authCookieOptions(0));
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublic = isPublicPath(pathname);
  const isApi = pathname.startsWith("/api/");
  const session = await getSessionState(request);

  function finalize(response: NextResponse) {
    if (session.ok && session.tokens) {
      writeAuthCookies(response, session.tokens);
    }

    if (!session.ok && session.shouldClearCookies) {
      clearAuthCookies(response);
    }

    return applySecurityHeaders(response);
  }

  if (isPublic && session.ok && pathname === "/login") {
    return finalize(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  if (isPublic || session.ok) {
    return finalize(NextResponse.next());
  }

  if (isApi) {
    return finalize(
      NextResponse.json(
        { ok: false, error: "Sessao obrigatoria." },
        { status: 401 },
      ),
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return finalize(NextResponse.redirect(loginUrl));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auralync-logo.jpeg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
