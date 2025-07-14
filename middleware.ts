import { NextRequest, NextResponse } from "next/server";

// This is a simple middleware example.
// In a real app, you would integrate with your authentication system (Better Auth, NextAuth, etc.)
export function middleware(request: NextRequest) {
  // Skip middleware for public routes
  if (
    request.nextUrl.pathname.startsWith("/api/invitations/accept") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/login")
  ) {
    return NextResponse.next();
  }

  // For API routes, check for user authentication
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // In a real app, you would:
    // 1. Verify JWT token or session
    // 2. Extract user ID from token/session
    // 3. Set x-user-id header

    // For development, you can set a test user ID
    const userId =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      "test-user-id";

    // Clone the request and add user ID header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
