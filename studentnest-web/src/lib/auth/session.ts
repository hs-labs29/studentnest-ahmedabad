import "server-only";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/database.types";

export async function getApplicationSession() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (
    error &&
    error.name !== "AuthSessionMissingError"
  ) {
    throw new Error("Unable to verify the current account session.");
  }
  if (!data.user) return null;

  const { data: roleRecord, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (roleError) {
    throw new Error("Unable to verify the account role.");
  }
  if (!roleRecord) return null;

  return {
    supabase,
    user: data.user,
    role: roleRecord.role,
  };
}

export async function getStudentSession() {
  const session = await getApplicationSession();
  if (!session || session.role !== "student") return null;

  const { data: profile, error } = await session.supabase
    .from("student_profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load the student profile.");
  }
  if (!profile || profile.role !== "student") return null;

  return {
    ...session,
    profile,
  };
}

export async function getOwnerSession() {
  const session = await getApplicationSession();
  if (!session || session.role !== "owner") return null;

  const [profileResult, applicationResult] = await Promise.all([
    session.supabase
      .from("owner_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle(),
    session.supabase
      .from("owner_applications")
      .select("*")
      .eq("owner_id", session.user.id)
      .maybeSingle(),
  ]);

  if (profileResult.error || applicationResult.error) {
    throw new Error("Unable to load the owner application.");
  }
  if (!profileResult.data || !applicationResult.data) return null;

  return {
    ...session,
    profile: profileResult.data,
    application: applicationResult.data,
  };
}

export async function getAdminSession() {
  const session = await getApplicationSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function requireStudentSession(nextPath = "/dashboard") {
  if (!isSupabaseConfigured()) {
    redirect(`/login?setup=required&next=${encodeURIComponent(nextPath)}`);
  }

  const account = await getApplicationSession();
  if (account && account.role !== "student") {
    redirect(roleHome(account.role));
  }
  const session = await getStudentSession();
  if (!session) {
    redirect(`/login?message=profile-unavailable&next=${encodeURIComponent(nextPath)}`);
  }
  return session;
}

export async function requireOwnerSession(nextPath = "/owner/dashboard") {
  if (!isSupabaseConfigured()) {
    redirect(`/login?setup=required&next=${encodeURIComponent(nextPath)}`);
  }
  const session = await getOwnerSession();
  if (session) return session;

  const account = await getApplicationSession();
  if (account && account.role !== "owner") {
    redirect(roleHome(account.role));
  }
  if (account) redirect("/login?message=owner-profile-unavailable");
  redirect(`/login?next=${encodeURIComponent(nextPath)}`);
}

export async function requireAdminSession(nextPath = "/admin/dashboard") {
  if (!isSupabaseConfigured()) {
    redirect(`/login?setup=required&next=${encodeURIComponent(nextPath)}`);
  }
  const session = await getAdminSession();
  if (session) return session;

  const account = await getApplicationSession();
  if (account && account.role !== "admin") {
    redirect(roleHome(account.role));
  }
  if (account) redirect("/login?message=admin-role-unavailable");
  redirect(`/login?next=${encodeURIComponent(nextPath)}`);
}

export function roleHome(role: AppRole) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "owner") return "/owner/dashboard";
  return "/dashboard";
}
