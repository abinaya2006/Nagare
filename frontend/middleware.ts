import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/tasks", "/schedule", "/orda", "/settings"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("sb-access-token") || request.cookies.get("pulse_access_token");
  if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/tasks/:path*", "/schedule/:path*", "/orda/:path*", "/settings/:path*"] };

