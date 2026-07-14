import { NextRequest, NextResponse } from "next/server";

// Map route prefix -> allowed roles
const ROLE_ROUTE_MAP: Record<string, string[]> = {
  "/landlord": ["LANDLORD"],
  "/admin": ["ADMIN"],
  "/tenant": ["TENANT", "SEEKER"],
};

// Public routes - no auth needed
const PUBLIC_PATHS = ["/", "/login", "/register", "/auth", "/rooms", "/api"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "?"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public paths through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Determine required roles for this path
  const requiredRoles = Object.entries(ROLE_ROUTE_MAP).find(([prefix]) =>
    pathname.startsWith(prefix)
  )?.[1];

  // If not a protected route, allow through
  if (!requiredRoles) {
    return NextResponse.next();
  }

  // Check for access token cookie (set after login)
  const tokenCookie = request.cookies.get("smart-rental.accessToken")?.value;

  // Also check Authorization header for SSR scenarios
  // If no token at all, redirect to login
  if (!tokenCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // We can't validate JWT in proxy without the secret accessible here,
  // so we do a lightweight check: just ensure token exists.
  // Full role validation happens in each layout's useEffect (client-side).
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
