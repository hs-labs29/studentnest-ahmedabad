import type { Metadata } from "next";
import { Suspense } from "react";
import { safeNextPath } from "@/lib/auth/redirects";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Log in | StudentNest Ahmedabad",
  description: "Log in to your StudentNest Ahmedabad student account.",
};

async function LoginContent({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const params = await searchParams;
  const nextValue = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = safeNextPath(nextValue ?? null);
  const notice =
    params.message === "signed-out"
      ? "You have been securely logged out."
      : params.message === "verification-failed"
        ? "That verification or recovery link is invalid or expired. Request a new one."
        : undefined;

  return (
    <section className="auth-mainContent">
      <div className="auth-intro">
        <p className="auth-eyebrow">YOUR STUDENTNEST ACCOUNT</p>
        <h1>Good to have you back.</h1>
        <p>
          Sign in to manage your student profile and saved sample PGs.
        </p>
      </div>
      <div className="auth-card">
        <h2>Log in</h2>
        <p className="auth-cardIntro">
          Use the email address and password on your student account.
        </p>
        <LoginForm next={next} notice={notice} />
      </div>
    </section>
  );
}

export default function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  return (
    <Suspense
      fallback={
        <section className="auth-mainContent">
          <div className="auth-card" aria-live="polite">
            Loading login…
          </div>
        </section>
      }
    >
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
