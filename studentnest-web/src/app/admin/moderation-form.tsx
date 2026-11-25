"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/auth/types";
import { EMPTY_FORM_STATE } from "@/lib/auth/types";
import FormFeedback from "../(auth)/components/form-feedback";
import {
  reviewOwnerApplicationAction,
  reviewPgListingAction,
} from "@/lib/admin/actions";

type Decision = "approved" | "rejected" | "suspended";

export function OwnerApplicationReviewForm({
  applicationId,
}: {
  applicationId: string;
}) {
  const [state, formAction, pending] = useActionState(
    reviewOwnerApplicationAction,
    EMPTY_FORM_STATE,
  );
  return (
    <DecisionForm
      entityId={applicationId}
      idName="applicationId"
      action={formAction}
      state={state}
      pending={pending}
      options={["approved", "rejected"]}
    />
  );
}

export function PgListingReviewForm({
  listingId,
  options,
}: {
  listingId: string;
  options: Decision[];
}) {
  const [state, formAction, pending] = useActionState(
    reviewPgListingAction,
    EMPTY_FORM_STATE,
  );
  return (
    <DecisionForm
      entityId={listingId}
      idName="listingId"
      action={formAction}
      state={state}
      pending={pending}
      options={options}
    />
  );
}

function DecisionForm({
  entityId,
  idName,
  action,
  state,
  pending,
  options,
}: {
  entityId: string;
  idName: "applicationId" | "listingId";
  action: (formData: FormData) => void;
  state: FormState;
  pending: boolean;
  options: Decision[];
}) {
  const initialDecision = options.includes("approved")
    ? "approved"
    : (options[0] ?? "approved");
  return (
    <form className="admin-reviewForm" action={action}>
      <input type="hidden" name={idName} value={entityId} />
      <label>
        <span>Decision</span>
        <select name="decision" defaultValue={initialDecision} required>
          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Review reason</span>
        <textarea
          name="reason"
          rows={2}
          minLength={5}
          maxLength={1000}
          placeholder="Add a reason for this decision"
          required
        />
      </label>
      <p className="admin-formHint">A reason is required for every decision.</p>
      <FormFeedback state={state} />
      <button className="admin-primaryButton" type="submit" disabled={pending}>
        {pending ? "Saving decision…" : "Submit decision"}
      </button>
    </form>
  );
}
