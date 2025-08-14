import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Check for authentication token in cookies
  const authToken = req.cookies.get("authToken");

  // Redirect logged-in users away from /signin and /signup
  if (authToken && (pathname === "/signin" || pathname === "/signup")) {
    url.pathname = "/appointment"; // Redirect to default page
    return NextResponse.redirect(url);
  }

  return NextResponse.next(); // Allow request if no conditions are met
}

// Apply middleware only to specific routes
export const config = {
  matcher: ["/signin", "/signup"],
};
