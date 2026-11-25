"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { EMPTY_FORM_STATE } from "@/lib/auth/types";
import FormFeedback from "../components/form-feedback";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    EMPTY_FORM_STATE,
  );

  return (
    <form className="auth-form" action={formAction}>
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
      <FormFeedback state={state} />
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <div className="auth-formFooter">
        <Link className="auth-inlineLink" href="/login">
          Back to log in
        </Link>
        <Link className="auth-inlineLink" href="/signup">
          Create account
        </Link>
      </div>
    </form>
  );
}
