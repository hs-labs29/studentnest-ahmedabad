"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/auth/types";
import { requireStudentSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { readFormString } from "./validation";

export async function submitListingEnquiryAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const listingId = readFormString(formData, "listingId");
  const message = readFormString(formData, "message");
  if (!isUuid(listingId)) {
    return { error: "This listing reference is invalid." };
  }
  if (message.length < 10 || message.length > 2000) {
    return { error: "Write a message between 10 and 2,000 characters." };
  }
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Student enquiries are unavailable until Supabase is configured.",
    };
  }

  const { supabase, profile } = await requireStudentSession(
    `/pgs/listings/${listingId}`,
  );
  const { error } = await supabase.from("student_enquiries").insert({
    user_id: profile.id,
    pg_listing_id: listingId,
    message,
  });
  if (error) {
    return {
      error:
        "Your enquiry could not be sent. This listing may no longer be published.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/owner/dashboard");
  return {
    success:
      "Your enquiry was sent to the listing owner. You can review it from your student dashboard.",
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
