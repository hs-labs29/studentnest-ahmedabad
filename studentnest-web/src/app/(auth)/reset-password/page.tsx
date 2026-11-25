import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getStudentSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import ResetPasswordForm from "./reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password | StudentNest Ahmedabad",
};

function RecoveryLoading() {
  return (
    <section className="auth-mainContent">
      <div className="auth-card" aria-live="polite">
        Verifying your secure reset link…
      </div>
    </section>
  );
}

async function RecoveryContent() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="auth-mainContent">
        <div className="auth-card">
          <h2>Supabase setup required</h2>
          <p className="auth-cardIntro">
            Connect the Supabase project before resetting account passwords.
          </p>
        </div>
      </section>
    );
  }

  const session = await getStudentSession();
  if (!session) {
    return (
      <section className="auth-mainContent">
        <div className="auth-card">
          <h2>This reset link is invalid or expired</h2>
          <p className="auth-cardIntro">
            Request a new link and open it from the same browser.
          </p>
          <Link className="auth-inlineLink" href="/forgot-password">
            Request another reset link
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-mainContent">
      <div className="auth-intro">
        <p className="auth-eyebrow">ACCOUNT RECOVERY</p>
        <h1>Choose a new password.</h1>
        <p>Use a unique password of at least 12 characters.</p>
      </div>
      <div className="auth-card">
        <h2>Set a new password</h2>
        <p className="auth-cardIntro">
          Your password is securely managed by Supabase Auth.
        </p>
        <ResetPasswordForm />
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<RecoveryLoading />}>
      <RecoveryContent />
    </Suspense>
  );
}
