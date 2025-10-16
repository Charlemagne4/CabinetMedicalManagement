import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

const secret = process.env.AUTH_SECRET;

const protectedRoutes = ["/main", "/dashboard"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname, origin } = request.nextUrl;

  // Auth logic for protected routes
  const token = await getToken({ req: request, secret });
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !token) {
    const callbackUrl = encodeURIComponent(pathname);
    const redirectUrl = new URL("/signin", origin);
    redirectUrl.searchParams.set("callbackUrl", callbackUrl);

    const redirectResponse = NextResponse.redirect(redirectUrl);
    redirectResponse.headers.set("Cache-Control", "no-store");
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/main",
    "/dashboard",
    "/", // optionally apply to homepage or any public routes
  ],
};
