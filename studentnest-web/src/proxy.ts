import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseEnvironment } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  const environment = getSupabaseEnvironment();
  if (!environment) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    environment.url,
    environment.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(cacheHeaders).forEach(([name, value]) => {
            response.headers.set(name, value);
          });
        },
      },
    },
  );

  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/auth/:path*",
    "/pgs/:path*",
    "/owner/:path*",
  ],
};
