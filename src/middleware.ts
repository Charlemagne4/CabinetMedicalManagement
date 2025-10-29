import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

const secret = process.env.AUTH_SECRET;

const protectedRoutes = ["/main"];
const adminRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret,
  });
  const role = token?.role;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));

  if (isAdminRoute) {
    if (!token) {
      const callbackUrl = encodeURIComponent(pathname);
      const redirectUrl = new URL("/signin", origin);
      redirectUrl.searchParams.set("callbackUrl", callbackUrl);

      const redirectResponse = NextResponse.redirect(redirectUrl);
      redirectResponse.headers.set("Cache-Control", "no-store");
      return redirectResponse;
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", origin));
    }
  } else if (isProtected) {
    if (!token) {
      const callbackUrl = encodeURIComponent(pathname);
      const redirectUrl = new URL("/signin", origin);
      redirectUrl.searchParams.set("callbackUrl", callbackUrl);

      const redirectResponse = NextResponse.redirect(redirectUrl);
      redirectResponse.headers.set("Cache-Control", "no-store");
      return redirectResponse;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/main/:path*"],
};
