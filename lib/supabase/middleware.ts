import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // If no credentials, we pass through (Mock mode fallback)
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any RLS logic in middleware!
  // Fetch the user session to verify auth status
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Define public routes that don't need auth protection
  const publicRoutes = ["/", "/login", "/register", "/auth/callback", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Define auth routes that logged-in users shouldn't access
  const authRoutes = ["/login", "/register", "/forgot-password"];
  const isAuthRoute = authRoutes.includes(pathname);

  // If no user and trying to access a protected route, redirect to login
  if (!user && !isPublicRoute) {
    // Only redirect if it's not a Next.js internal path or static file
    if (!pathname.startsWith("/_next") && !pathname.includes(".")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // If user is logged in and trying to access login/register, redirect to dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
