"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SAMPLE_PGS } from "@/app/pgs/data/sample-pgs";
import type { FormState } from "@/lib/auth/types";
import { getSiteOrigin, safeNextPath } from "@/lib/auth/redirects";
import {
  getApplicationSession,
  getStudentSession,
  requireStudentSession,
  roleHome,
} from "@/lib/auth/session";
import { validateProfile, validateSignup } from "@/lib/auth/validation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function signupAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validation = validateSignup(formData);
  if ("error" in validation) return { error: validation.error };
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Authentication is not configured yet. Add your Supabase URL and publishable key.",
    };
  }
  const siteOrigin = getSiteOrigin();
  if (!siteOrigin) {
    return { error: "Set SITE_URL before enabling email verification." };
  }

  const { data, error } = await (
    await createClient()
  ).auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      emailRedirectTo: `${siteOrigin}/auth/callback/signup`,
      data: {
        account_type: "student",
        full_name: validation.data.fullName,
        mobile_number: validation.data.mobileNumber,
        college_name: validation.data.collegeName,
        preferred_locality: validation.data.preferredLocality,
        terms_accepted: true,
      },
    },
  });

  if (error) {
    return {
      error:
        "We could not create the account. Check the details and confirm the Supabase profile migration is applied.",
    };
  }
  if (data.session) {
    return {
      success: "Your account is ready.",
      successHref: "/dashboard",
    };
  }
  return {
    success:
      "Check your inbox for the verification link. You can sign in after confirming your email.",
  };
}

export async function loginAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email =
    typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length === 0 ||
    password.length > 128
  ) {
    return { error: "Enter a valid email address and password." };
  }
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Authentication is not configured yet. Add your Supabase URL and publishable key.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error: "Sign-in failed. Check your email and password, then try again.",
    };
  }

  const session = await getApplicationSession();
  if (!session) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      throw new Error("Unable to end an unverified student session.");
    }
    return {
      error:
        "We could not verify a student profile for this account. Confirm your email and contact support if the issue continues.",
    };
  }

  const requestedNext = readNextPath(formData);
  const roleDestination =
    !requestedNext || requestedNext === "/dashboard"
      ? roleHome(session.role)
      : safeNextPath(requestedNext, roleHome(session.role));
  redirect(roleDestination);
}

export async function forgotPasswordAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const emailValue = formData.get("email");
  const email =
    typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Authentication is not configured yet. Add your Supabase URL and publishable key.",
    };
  }
  const siteOrigin = getSiteOrigin();
  if (!siteOrigin) {
    return { error: "Set SITE_URL before enabling password recovery." };
  }

  const { error } = await (
    await createClient()
  ).auth.resetPasswordForEmail(email, {
    redirectTo: `${siteOrigin}/auth/callback/recovery`,
  });
  if (error) {
    return {
      error: "We could not send the reset email. Please try again later.",
    };
  }
  return {
    success:
      "If an account exists for that email, a password reset link is on its way.",
  };
}

export async function updatePasswordAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const passwordValue = formData.get("password");
  const confirmValue = formData.get("confirmPassword");
  const password =
    typeof passwordValue === "string" ? passwordValue : "";
  const confirmPassword =
    typeof confirmValue === "string" ? confirmValue : "";
  if (password.length < 12 || password.length > 128 || !/\S/.test(password)) {
    return { error: "Use a password between 12 and 128 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "The passwords do not match." };
  }

  const session = await getStudentSession();
  if (!session) {
    return {
      error:
        "This reset link is invalid or expired. Request a new password reset email.",
    };
  }
  const { error } = await session.supabase.auth.updateUser({ password });
  if (error) return { error: "We could not update your password. Try again." };
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProfileAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validation = validateProfile(formData);
  if ("error" in validation) return { error: validation.error };

  const { supabase, profile } = await requireStudentSession();
  const { data, error } = await supabase
    .from("student_profiles")
    .update({
      full_name: validation.data.fullName,
      mobile_number: validation.data.mobileNumber,
      college_name: validation.data.collegeName,
      preferred_locality: validation.data.preferredLocality,
    })
    .eq("id", profile.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "We could not save your profile. Please try again." };
  }
  revalidatePath("/dashboard");
  return { success: "Your profile has been updated." };
}

export async function toggleSavedPgAction(formData: FormData) {
  const slugValue = formData.get("pgSlug");
  const intentValue = formData.get("intent");
  const pgSlug = typeof slugValue === "string" ? slugValue : "";
  const intent = typeof intentValue === "string" ? intentValue : "";
  if (!SAMPLE_PGS.some((pg) => pg.id === pgSlug)) {
    throw new Error("Invalid sample PG identifier.");
  }
  if (intent !== "save" && intent !== "remove") {
    throw new Error("Invalid saved-PG action.");
  }
  if (!isSupabaseConfigured()) {
    redirect(`/login?setup=required&next=${encodeURIComponent(`/pgs/${pgSlug}`)}`);
  }

  const { supabase, profile } = await requireStudentSession(`/pgs/${pgSlug}`);

  if (intent === "save") {
    const { error } = await supabase
      .from("student_saved_pgs")
      .insert({ user_id: profile.id, pg_slug: pgSlug });
    if (error && error.code !== "23505") {
      throw new Error("Could not save this PG to the student account.");
    }
  } else {
    const { error } = await supabase
      .from("student_saved_pgs")
      .delete()
      .eq("user_id", profile.id)
      .eq("pg_slug", pgSlug);
    if (error) throw new Error("Could not remove this PG from the student account.");
  }

  revalidatePath(`/pgs/${pgSlug}`);
  revalidatePath("/dashboard");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error("Could not safely end the current session.");
  }
  redirect("/login?message=signed-out");
}

function readNextPath(formData: FormData) {
  const value = formData.get("next");
  return typeof value === "string" ? value : null;
}
