import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup"];
const PROTECTED_ROUTES = [
  "/dashboard",
  "/tasks",
  "/schedule",
  "/orda",
  "/settings",
  "/world",
  "/onboarding",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasPulseToken = request.cookies.has("pulse_access_token");
  const isLoggedOut = request.cookies.get("logged_out")?.value === "true";

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isSignupRedirect =
    request.cookies.get("signup_redirect")?.value === "true";
  const isLoggedIn = hasPulseToken && !isLoggedOut;

  if (pathname === "/") {
    if (isLoggedIn)
      return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }

  if (isLoggedIn && isPublic && !isSignupRedirect) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Clear the signup_redirect cookie once they reach /login
  if (pathname.startsWith("/login") && isSignupRedirect) {
    const response = NextResponse.next();
    response.cookies.delete("signup_redirect");
    return response;
  }

  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
