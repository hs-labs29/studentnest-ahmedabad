"use client";

import { useActionState } from "react";
import { EMPTY_FORM_STATE } from "@/lib/auth/types";
import { ownerSignupAction } from "@/lib/owner/auth-actions";
import FormFeedback from "../../components/form-feedback";
import PasswordInput from "../../components/password-input";

export default function OwnerSignupForm() {
  const [state, formAction, pending] = useActionState(
    ownerSignupAction,
    EMPTY_FORM_STATE,
  );

  return (
    <form className="auth-form" action={formAction}>
      <div className="auth-formGrid">
        <div className="auth-field">
          <label htmlFor="owner-full-name">Full name</label>
          <input
            id="owner-full-name"
            name="fullName"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="owner-email">Email</label>
          <input
            id="owner-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="owner-mobile">Mobile number</label>
          <input
            id="owner-mobile"
            name="mobileNumber"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            pattern="^\+?[0-9][0-9 \(\)\-]{7,19}$"
            maxLength={21}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="owner-business">Business / property name</label>
          <input
            id="owner-business"
            name="businessName"
            autoComplete="organization"
            minLength={2}
            maxLength={120}
            required
          />
        </div>
        <div className="auth-field auth-wide">
          <label htmlFor="owner-address">Business / property address</label>
          <textarea
            id="owner-address"
            name="address"
            autoComplete="street-address"
            minLength={8}
            maxLength={300}
            rows={3}
            required
          />
        </div>
        <PasswordInput
          id="owner-password"
          name="password"
          label="Password"
          autoComplete="new-password"
          minLength={12}
        />
        <PasswordInput
          id="owner-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          minLength={12}
        />
      </div>
      <p className="auth-helperText">
        New owner applications are pending by default. Approval is required
        before listings can be submitted.
      </p>
      <label className="auth-terms">
        <input name="termsAccepted" type="checkbox" required />
        <span>
          I confirm I am authorized to represent this property and accept the
          owner application terms.
        </span>
      </label>
      <FormFeedback state={state} />
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "Submitting application…" : "Submit owner application"}
      </button>
    </form>
  );
}
