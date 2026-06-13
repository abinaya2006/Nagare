import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup"];
const PROTECTED_ROUTES = ["/dashboard", "/tasks", "/schedule", "/orda", "/settings", "/world", "/onboarding"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthenticated = request.cookies.has("pulse_access_token");
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  if (pathname === "/") {
    if (isAuthenticated) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }

  if (isAuthenticated && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthenticated && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)",],
};
