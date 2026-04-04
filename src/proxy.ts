import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const pathname = request.nextUrl.pathname;

  let user = null;
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      user = { userId: payload.userId };
    }
  }

  // Protect /dashboard and /builder
  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/builder")) && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect logged-in users away from auth pages
  if (
    (pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/signup")) &&
    user
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/builder",
    "/builder/:path*",
    "/auth/login",
    "/auth/signup"
  ],
};
