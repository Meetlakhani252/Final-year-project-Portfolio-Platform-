import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  STUDENT_ROUTES,
  RECRUITER_ROUTES,
  ORGANIZER_ROUTES,
} from "@/lib/constants";
import type { UserRole } from "@/lib/constants";

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function getRequiredRole(
  pathname: string
): UserRole | "any" | null {
  // Check role-specific routes first (more specific match wins)
  if (STUDENT_ROUTES.some((r) => pathname.startsWith(r))) return "student";
  if (RECRUITER_ROUTES.some((r) => pathname.startsWith(r))) return "recruiter";
  if (ORGANIZER_ROUTES.some((r) => pathname.startsWith(r))) return "organizer";

  // General protected routes — any authenticated role
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) return "any";

  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — skip session refresh entirely for efficiency
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // All non-public routes need session refresh
  const { response, user } = await updateSession(request);

  const requiredRole = getRequiredRole(pathname);

  // Route doesn't match any protection list (e.g. static assets matched by config)
  if (requiredRole === null) {
    return response;
  }

  // No authenticated user → redirect to login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Route requires any authenticated role — already verified above
  if (requiredRole === "any") {
    return response;
  }

  // Role-specific check
  const userRole = (user.user_metadata?.role as UserRole) ?? "student";

  if (userRole !== requiredRole) {
    // Role mismatch → redirect to dashboard
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
