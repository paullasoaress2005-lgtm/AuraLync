import { NextRequest, NextResponse } from "next/server";

function clearSession(response: NextResponse) {
  for (const name of ["al_access_token", "al_refresh_token", "al_user_id"]) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}

function logoutResponse(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  const safeNext = next?.startsWith("/") ? next : "/login";

  return clearSession(NextResponse.redirect(new URL(safeNext, request.url), 303));
}

export async function GET(request: NextRequest) {
  return logoutResponse(request);
}

export async function POST(request: NextRequest) {
  return logoutResponse(request);
}
