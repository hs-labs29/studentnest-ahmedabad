import type { Metadata } from "next";
import SignupForm from "./signup-form";

export const metadata: Metadata = {
  title: "Create a student account | StudentNest Ahmedabad",
  description: "Create a StudentNest Ahmedabad student account.",
};

export default function SignupPage() {
  return (
    <section className="auth-mainContent">
      <div className="auth-intro">
        <p className="auth-eyebrow">WELCOME TO AHMEDABAD</p>
        <h1>Make your next move feel easier.</h1>
        <p>
          Create a student profile to keep your preferences and sample PG
          favourites together.
        </p>
      </div>
      <div className="auth-card">
        <h2>Create your account</h2>
        <p className="auth-cardIntro">
          Use your details to set up your StudentNest profile.
        </p>
        <SignupForm />
      </div>
    </section>
  );
}
