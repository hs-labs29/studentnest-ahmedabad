"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/lib/auth/actions";
import { EMPTY_FORM_STATE } from "@/lib/auth/types";
import FormFeedback from "../components/form-feedback";
import PasswordInput from "../components/password-input";

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    EMPTY_FORM_STATE,
  );

  return (
    <form className="auth-form" action={formAction}>
      <PasswordInput
        id="password"
        name="password"
        label="New password"
        autoComplete="new-password"
        minLength={12}
      />
      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        minLength={12}
      />
      <FormFeedback state={state} />
      <button className="auth-submit" type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
