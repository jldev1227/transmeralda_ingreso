// middleware.ts
import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  // Redirige a login si no hay token y no es página de autenticación
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirige al dashboard si hay token y está en página de autenticación
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Rutas que necesitan autenticación
    "/dashboard/:path*",
    "/flota/:path*",
    "/nomina/:path*",
    // Rutas de autenticación
    "/login",
  ],
};
