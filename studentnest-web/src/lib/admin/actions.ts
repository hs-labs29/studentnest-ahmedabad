"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/auth/types";
import { requireAdminSession } from "@/lib/auth/session";
import { validateDecisionReason, readFormString } from "@/lib/owner/validation";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function reviewOwnerApplicationAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const applicationId = readFormString(formData, "applicationId");
  const decision = readFormString(formData, "decision");
  const reasonValue = readFormString(formData, "reason");
  if (!isUuid(applicationId)) {
    return { error: "The owner application identifier is invalid." };
  }
  if (decision !== "approved" && decision !== "rejected") {
    return { error: "Choose an available owner application decision." };
  }

  const reasonResult = validateDecisionReason(reasonValue, true);
  if ("error" in reasonResult) return reasonResult;

  const { supabase } = await requireAdminSession();
  const { error } = await supabase.rpc("review_owner_application", {
    target_application_id: applicationId,
    decision,
    decision_reason: reasonResult.data,
  });
  if (error) {
    return {
      error:
        "The application could not be reviewed. It may no longer be pending.",
    };
  }

  revalidateAdminPaths();
  return { success: `Owner application ${decision}.` };
}

export async function reviewPgListingAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const listingId = readFormString(formData, "listingId");
  const decision = readFormString(formData, "decision");
  const reasonValue = readFormString(formData, "reason");
  if (!isUuid(listingId)) {
    return { error: "The listing identifier is invalid." };
  }
  if (
    decision !== "approved" &&
    decision !== "rejected" &&
    decision !== "suspended"
  ) {
    return { error: "Choose an available listing decision." };
  }

  const reasonResult = validateDecisionReason(reasonValue, true);
  if ("error" in reasonResult) return reasonResult;

  const { supabase } = await requireAdminSession();
  const { error } = await supabase.rpc("review_pg_listing", {
    target_listing_id: listingId,
    decision,
    decision_reason: reasonResult.data,
  });
  if (error) {
    return {
      error:
        "The listing could not be reviewed. Its status may have changed already.",
    };
  }

  revalidateAdminPaths();
  return {
    success:
      decision === "approved"
        ? "Listing approved. The owner must publish it before students can see it."
        : `Listing ${decision}.`,
  };
}

function revalidateAdminPaths() {
  revalidatePath("/admin/dashboard");
  revalidatePath("/owner/dashboard");
  revalidatePath("/pgs");
}
