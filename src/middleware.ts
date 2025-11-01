import { type NextRequest, NextResponse } from "next/server";
import { logger } from "./utils/pino";
import { auth } from "./server/auth";

const protectedRoutes = ["/main"];
const adminRoutes = ["/dashboard"];

function redirectToSignin(pathname: string, origin: string) {
  const callbackUrl = encodeURIComponent(pathname);
  const redirectUrl = new URL("/signin", origin);
  redirectUrl.searchParams.set("callbackUrl", callbackUrl);

  const response = NextResponse.redirect(redirectUrl);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // Get session from Auth.js (Edge compatible)
  const session = await auth();
  const role = session?.user?.role;

  logger.info({ session }, "Session from middleware");

  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));

  // Admin routes
  if (isAdminRoute) {
    if (!session) return redirectToSignin(pathname, origin);
    if (role !== "admin") return NextResponse.redirect(new URL("/", origin));
  }

  // Protected routes
  if (isProtectedRoute && !session) {
    return redirectToSignin(pathname, origin);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/main/:path*"],
};
