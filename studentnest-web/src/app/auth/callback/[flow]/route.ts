import { NextResponse, type NextRequest } from "next/server";
import { getSiteOrigin } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ flow: string }> },
) {
  const siteOrigin = getSiteOrigin();
  if (!siteOrigin) {
    return new NextResponse("Authentication callback is not configured.", {
      status: 503,
    });
  }

  const { flow } = await params;
  if (flow !== "signup" && flow !== "recovery" && flow !== "owner-signup") {
    return new NextResponse("Invalid authentication callback.", {
      status: 404,
    });
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL("/login?message=verification-failed", siteOrigin),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL("/login?message=verification-failed", siteOrigin),
    );
  }

  const nextPath =
    flow === "recovery"
      ? "/reset-password"
      : flow === "owner-signup"
        ? "/owner/dashboard"
        : "/dashboard";
  return NextResponse.redirect(new URL(nextPath, siteOrigin));
}
