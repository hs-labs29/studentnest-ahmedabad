"use client";

import Link from "next/link";
import { useActionState } from "react";
import { EMPTY_FORM_STATE } from "@/lib/auth/types";
import { submitListingEnquiryAction } from "@/lib/owner/enquiry-actions";
import FormFeedback from "../../../(auth)/components/form-feedback";

export default function EnquiryForm({ listingId }: { listingId: string }) {
  const [state, formAction, pending] = useActionState(
    submitListingEnquiryAction,
    EMPTY_FORM_STATE,
  );

  return (
    <div className="public-listingEnquiry">
      <h2>Ask the owner about this PG</h2>
      <p>
        Enquiries are sent securely to the owner account. Do not include
        sensitive personal or financial information.
      </p>
      <form action={formAction}>
        <input type="hidden" name="listingId" value={listingId} />
        <label htmlFor="listing-enquiry-message">Your message</label>
        <textarea
          id="listing-enquiry-message"
          name="message"
          minLength={10}
          maxLength={2000}
          rows={4}
          placeholder="Ask about rent, facilities, or house rules."
          required
        />
        <FormFeedback state={state} />
        <button type="submit" disabled={pending}>
          {pending ? "Sending enquiry…" : "Send enquiry"}
        </button>
      </form>
      <Link href={`/login?next=${encodeURIComponent(`/pgs/listings/${listingId}`)}`}>
        Log in with a student account to enquire
      </Link>
    </div>
  );
}
