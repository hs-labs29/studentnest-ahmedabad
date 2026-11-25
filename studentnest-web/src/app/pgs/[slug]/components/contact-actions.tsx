"use client";

import { useState } from "react";

interface ContactActionsProps {
  listingName: string;
  locality: string;
  monthlyRent: number;
  verifiedOwnerPhone?: string;
}

export default function ContactActions({
  listingName,
  locality,
  monthlyRent,
  verifiedOwnerPhone,
}: ContactActionsProps) {
  const [saved, setSaved] = useState(false);
  const phone = verifiedOwnerPhone?.replace(/\D/g, "");
  const enquiryText = `Hello, I'm enquiring about ${listingName} in ${locality}, Ahmedabad. Could you share verified details?`;
  const whatsappHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(enquiryText)}`
    : undefined;

  return (
    <>
      <div className="pgd-contactActions">
        <button
          className={`pgd-favouriteButton${saved ? " is-saved" : ""}`}
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Remove from favourites" : "Save to favourites"}
          onClick={() => setSaved((current) => !current)}
        >
          <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
          {saved ? "Saved to favourites" : "Save to favourites"}
        </button>
        {phone ? (
          <a className="pgd-contactButton" href={`tel:${phone}`}>
            Contact owner
          </a>
        ) : (
          <button className="pgd-contactButton" type="button" disabled>
            Contact owner
          </button>
        )}
        {whatsappHref ? (
          <a
            className="pgd-whatsappButton"
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            Enquire on WhatsApp
          </a>
        ) : (
          <button className="pgd-whatsappButton" type="button" disabled>
            Enquire on WhatsApp
          </button>
        )}
        {!phone && (
          <p className="pgd-contactNotice">
            Contact is unavailable for this sample listing. We don&apos;t have
            a verified owner number.
          </p>
        )}
      </div>
      <div className="pgd-mobileSticky">
        <p>
          <strong>₹{monthlyRent.toLocaleString("en-IN")}</strong>
          <span>/ month · sample</span>
        </p>
        {phone ? (
          <a href={`tel:${phone}`}>Contact owner</a>
        ) : (
          <button
            type="button"
            disabled
            title="No verified owner contact is available"
          >
            Contact owner
          </button>
        )}
      </div>
    </>
  );
}
