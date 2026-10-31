import { NextResponse, type NextRequest } from "next/server";
import { getLegacyDomainRedirect } from "./lib/site-origin";
import { updateSession } from "./lib/supabase/proxy";

export async function middleware(request: NextRequest) {
  const destination = getLegacyDomainRedirect(request.url, {
    method: request.method,
    cookieNames: request.cookies.getAll().map(cookie => cookie.name),
  });
  if (destination) {
    const response = NextResponse.redirect(destination, 308);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
