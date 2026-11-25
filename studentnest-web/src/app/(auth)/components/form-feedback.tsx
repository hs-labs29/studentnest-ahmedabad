import Link from "next/link";
import type { FormState } from "@/lib/auth/types";

export default function FormFeedback({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <p className="auth-feedback" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="auth-feedback is-success" role="status">
        {state.success}{" "}
        {state.successHref && (
          <Link className="auth-inlineLink" href={state.successHref}>
            Continue
          </Link>
        )}
      </p>
    );
  }
  return null;
}
