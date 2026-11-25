"use client";

import { useActionState } from "react";
import { LOCALITIES } from "@/app/pgs/data/sample-pgs";
import { updateProfileAction } from "@/lib/auth/actions";
import { EMPTY_FORM_STATE } from "@/lib/auth/types";
import FormFeedback from "../(auth)/components/form-feedback";

export default function ProfileForm({
  profile,
}: {
  profile: {
    full_name: string;
    email: string;
    mobile_number: string;
    college_name: string;
    preferred_locality: (typeof LOCALITIES)[number];
  };
}) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    EMPTY_FORM_STATE,
  );

  return (
    <form className="dash-profileForm" action={formAction}>
      <div className="dash-profileGrid">
        <div className="dash-field">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            defaultValue={profile.full_name}
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
          />
        </div>
        <div className="dash-field">
          <label htmlFor="email">Email</label>
          <input id="email" value={profile.email} readOnly />
          <small>Email is managed by your verified Supabase account.</small>
        </div>
        <div className="dash-field">
          <label htmlFor="mobileNumber">Mobile number</label>
          <input
            id="mobileNumber"
            name="mobileNumber"
            type="tel"
            autoComplete="tel"
            pattern="^\+?[0-9][0-9 \(\)\-]{7,19}$"
            defaultValue={profile.mobile_number}
            maxLength={21}
            required
          />
        </div>
        <div className="dash-field">
          <label htmlFor="collegeName">College name</label>
          <input
            id="collegeName"
            name="collegeName"
            defaultValue={profile.college_name}
            autoComplete="organization"
            minLength={2}
            maxLength={120}
            required
          />
        </div>
        <div className="dash-field dash-fieldWide">
          <label htmlFor="preferredLocality">Preferred Ahmedabad locality</label>
          <select
            id="preferredLocality"
            name="preferredLocality"
            defaultValue={profile.preferred_locality}
            required
          >
            {LOCALITIES.map((locality) => (
              <option key={locality} value={locality}>
                {locality}
              </option>
            ))}
          </select>
        </div>
      </div>
      <FormFeedback state={state} />
      <button className="dash-primaryButton" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
