import { toggleSavedPgAction } from "@/lib/auth/actions";

interface ContactActionsProps {
  pgSlug: string;
  listingName: string;
  locality: string;
  monthlyRent: number;
  initialSaved: boolean;
  verifiedOwnerPhone?: string;
}

export default function ContactActions({
  pgSlug,
  listingName,
  locality,
  monthlyRent,
  initialSaved,
  verifiedOwnerPhone,
}: ContactActionsProps) {
  const phone = verifiedOwnerPhone?.replace(/\D/g, "");
  const enquiryText = `Hello, I'm enquiring about ${listingName} in ${locality}, Ahmedabad. Could you share verified details?`;
  const whatsappHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(enquiryText)}`
    : undefined;

  return (
    <>
      <div className="pgd-contactActions">
        <form action={toggleSavedPgAction}>
          <input type="hidden" name="pgSlug" value={pgSlug} />
          <input
            type="hidden"
            name="intent"
            value={initialSaved ? "remove" : "save"}
          />
          <button
            className={`pgd-favouriteButton${initialSaved ? " is-saved" : ""}`}
            type="submit"
            aria-pressed={initialSaved}
            aria-label={
              initialSaved ? "Remove from favourites" : "Save to favourites"
            }
          >
            <span aria-hidden="true">{initialSaved ? "♥" : "♡"}</span>
            {initialSaved ? "Saved to favourites" : "Save to favourites"}
          </button>
        </form>
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
