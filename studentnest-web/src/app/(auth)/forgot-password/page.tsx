import type { Metadata } from "next";
import ForgotPasswordForm from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password | StudentNest Ahmedabad",
};

export default function ForgotPasswordPage() {
  return (
    <section className="auth-mainContent">
      <div className="auth-intro">
        <p className="auth-eyebrow">ACCOUNT RECOVERY</p>
        <h1>A fresh start is one email away.</h1>
        <p>
          Request a secure reset link. For privacy, the response does not reveal
          whether an account exists.
        </p>
      </div>
      <div className="auth-card">
        <h2>Forgot your password?</h2>
        <p className="auth-cardIntro">
          Enter the email on your account and we’ll send a reset link if it
          exists.
        </p>
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
