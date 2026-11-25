"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/lib/auth/types";
import { getSiteOrigin } from "@/lib/auth/redirects";
import { getOwnerSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { validateOwnerSignup } from "./validation";

export async function ownerSignupAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validation = validateOwnerSignup(formData);
  if ("error" in validation) return { error: validation.error };
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Authentication is not configured yet. Add your Supabase URL and publishable key.",
    };
  }

  const siteOrigin = getSiteOrigin();
  if (!siteOrigin) {
    return { error: "Set SITE_URL before enabling owner email verification." };
  }

  const { data, error } = await (
    await createClient()
  ).auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      emailRedirectTo: `${siteOrigin}/auth/callback/owner-signup`,
      data: {
        account_type: "owner",
        full_name: validation.data.fullName,
        mobile_number: validation.data.mobileNumber,
        business_name: validation.data.businessName,
        address: validation.data.address,
        terms_accepted: true,
      },
    },
  });

  if (error) {
    return {
      error:
        "We could not submit the owner application. Check the details and confirm the owner migration is applied.",
    };
  }

  if (data.session) {
    const ownerSession = await getOwnerSession();
    if (!ownerSession) {
      const { error: signOutError } = await (
        await createClient()
      ).auth.signOut();
      if (signOutError) {
        throw new Error("Unable to end an unverified owner session.");
      }
      return {
        error:
          "The owner application could not be verified. Contact support before trying again.",
      };
    }
    redirect("/owner/dashboard");
  }

  return {
    success:
      "Check your inbox to verify your email. Your owner application will remain pending until an administrator reviews it.",
  };
}
