"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/lib/auth/actions";
import { EMPTY_FORM_STATE } from "@/lib/auth/types";
import FormFeedback from "../components/form-feedback";
import PasswordInput from "../components/password-input";

export default function LoginForm({
  next,
  notice,
}: {
  next: string;
  notice?: string;
}) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    EMPTY_FORM_STATE,
  );

  return (
    <form className="auth-form" action={formAction}>
      <input type="hidden" name="next" value={next} />
      {notice && (
        <p className="auth-feedback is-success" role="status">
          {notice}
        </p>
      )}
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
      <PasswordInput
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
      />
      <div className="auth-formFooter">
        <span>Secure, cookie-based session</span>
        <Link className="auth-inlineLink" href="/forgot-password">
          Forgot password?
        </Link>
      </div>
      <FormFeedback state={state} />
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Log in"}
      </button>
      <div className="auth-formFooter">
        <span>New to StudentNest?</span>
        <Link className="auth-inlineLink" href="/signup">
          Create an account
        </Link>
      </div>
      <div className="auth-formFooter">
        <span>Have a student accommodation to list?</span>
        <Link className="auth-inlineLink" href="/owner/signup">
          Apply as an owner
        </Link>
      </div>
    </form>
  );
}
