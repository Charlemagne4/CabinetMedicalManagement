import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

const secret = process.env.AUTH_SECRET;

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
  const isProduction = process.env.NODE_ENV === "production";

  const token = await getToken({
    req: request,
    secret,
    cookieName: isProduction
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
    secureCookie: isProduction,
  });
  const role = token?.role;

  console.log("Token from middleware", token);
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));

  // Handle admin routes first
  if (isAdminRoute) {
    if (!token) return redirectToSignin(pathname, origin);
    if (role !== "admin") return NextResponse.redirect(new URL("/", origin));
  }

  // Handle other protected routes
  if (isProtectedRoute && !token) {
    return redirectToSignin(pathname, origin);
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/main/:path*"],
};
