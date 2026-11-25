import type { Metadata } from "next";
import Link from "next/link";
import OwnerSignupForm from "./owner-signup-form";

export const metadata: Metadata = {
  title: "Owner registration | StudentNest Ahmedabad",
  description:
    "Apply to list your Ahmedabad student accommodation on StudentNest.",
};

export default function OwnerSignupPage() {
  return (
    <div className="auth-mainContent">
      <section className="auth-intro">
        <p className="auth-eyebrow">FOR PROPERTY OWNERS</p>
        <h1>Welcome students to a place that feels like home.</h1>
        <p>
          Submit your owner details for review. Your account and property
          listings stay private until approved.
        </p>
      </section>
      <section className="auth-card" aria-labelledby="owner-signup-title">
        <h2 id="owner-signup-title">Apply as a property owner</h2>
        <p className="auth-cardIntro">
          Verify your email, then wait for an administrator to review your
          application before adding listings.
        </p>
        <OwnerSignupForm />
        <div className="auth-formFooter">
          <span>Already registered?</span>
          <Link className="auth-inlineLink" href="/login">
            Log in
          </Link>
        </div>
      </section>
    </div>
  );
}
