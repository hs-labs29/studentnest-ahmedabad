"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LOCALITIES } from "@/app/pgs/data/sample-pgs";
import { signupAction } from "@/lib/auth/actions";
import { EMPTY_FORM_STATE } from "@/lib/auth/types";
import FormFeedback from "../components/form-feedback";
import PasswordInput from "../components/password-input";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signupAction,
    EMPTY_FORM_STATE,
  );

  return (
    <form className="auth-form" action={formAction}>
      <div className="auth-formGrid">
        <div className="auth-field auth-wide">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="mobileNumber">Mobile number</label>
          <input
            id="mobileNumber"
            name="mobileNumber"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            pattern="^\+?[0-9][0-9 \(\)\-]{7,19}$"
            title="Enter a valid phone number, including country code if needed."
            maxLength={21}
            required
          />
        </div>
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          autoComplete="new-password"
          minLength={12}
        />
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          minLength={12}
        />
        <div className="auth-field">
          <label htmlFor="collegeName">College name</label>
          <input
            id="collegeName"
            name="collegeName"
            type="text"
            autoComplete="organization"
            minLength={2}
            maxLength={120}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="preferredLocality">Preferred Ahmedabad locality</label>
          <select
            id="preferredLocality"
            name="preferredLocality"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Choose an area
            </option>
            {LOCALITIES.map((locality) => (
              <option key={locality} value={locality}>
                {locality}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="auth-helperText">
        Passwords must be at least 12 characters. Your profile details are used
        for your student account and preferences.
      </p>
      <label className="auth-terms">
        <input name="termsAccepted" type="checkbox" required />
        <span>
          I accept the StudentNest student account terms and agree to use
          accurate profile information.
        </span>
      </label>
      <FormFeedback state={state} />
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <div className="auth-formFooter">
        <span>Already have an account?</span>
        <Link className="auth-inlineLink" href="/login">
          Log in
        </Link>
      </div>
    </form>
  );
}
