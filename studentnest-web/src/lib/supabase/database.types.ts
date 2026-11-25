type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type StudentLocality =
  | "Navrangpura"
  | "Vastrapur"
  | "Satellite"
  | "Thaltej"
  | "Chandkheda";

export type AppRole = "student" | "owner" | "admin";
export type AccommodationType = "Boys" | "Girls" | "Co-living";
export type ListingSharingType =
  | "Single"
  | "Double sharing"
  | "Triple sharing"
  | "Four sharing"
  | "Private room";
export type ListingAmenity =
  | "Wi-Fi"
  | "AC"
  | "Laundry"
  | "Washing machine"
  | "Attached bathroom"
  | "Parking";
export type OwnerApplicationStatus = "pending" | "approved" | "rejected";
export type ListingApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended"
  | "removed";

export type StudentProfile = {
  id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  college_name: string;
  preferred_locality: StudentLocality;
  role: "student";
  terms_accepted_at: string;
  created_at: string;
  updated_at: string;
};

export type OwnerProfile = {
  user_id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  business_name: string;
  address: string;
  created_at: string;
  updated_at: string;
};

export type OwnerApplication = {
  id: string;
  owner_id: string;
  status: OwnerApplicationStatus;
  decision_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PgListing = {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  locality: StudentLocality;
  address: string;
  accommodation_type: AccommodationType;
  monthly_rent: number;
  security_deposit: number;
  sharing_type: ListingSharingType;
  amenities: ListingAmenity[];
  food_included: boolean;
  house_rules: string;
  approval_status: ListingApprovalStatus;
  is_published: boolean;
  decision_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PgListingImage = {
  id: string;
  listing_id: string;
  owner_id: string;
  storage_path: string;
  display_order: number;
  alt_text: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      user_roles: Table<
        { user_id: string; role: AppRole; created_at: string },
        never,
        never
      >;
      student_profiles: Table<
        StudentProfile,
        never,
        Partial<
          Pick<
            StudentProfile,
            "full_name" | "mobile_number" | "college_name" | "preferred_locality"
          >
        >
      >;
      owner_profiles: Table<OwnerProfile, never, never>;
      owner_applications: Table<OwnerApplication, never, never>;
      student_saved_pgs: Table<
        { user_id: string; pg_slug: string; created_at: string },
        { user_id: string; pg_slug: string },
        never
      >;
      student_enquiries: Table<
        {
          id: string;
          user_id: string;
          pg_slug: string | null;
          pg_listing_id: string | null;
          message: string;
          status: "submitted" | "in_progress" | "closed";
          created_at: string;
          updated_at: string;
        },
        { user_id: string; pg_listing_id: string; message: string },
        never
      >;
      pg_listings: Table<
        PgListing,
        {
          owner_id: string;
          name: string;
          description: string;
          locality: StudentLocality;
          address: string;
          accommodation_type: AccommodationType;
          monthly_rent: number;
          security_deposit: number;
          sharing_type: ListingSharingType;
          amenities?: ListingAmenity[];
          food_included?: boolean;
          house_rules: string;
        },
        Partial<
          Pick<
            PgListing,
            | "name"
            | "description"
            | "locality"
            | "address"
            | "accommodation_type"
            | "monthly_rent"
            | "security_deposit"
            | "sharing_type"
            | "amenities"
            | "food_included"
            | "house_rules"
            | "is_published"
          >
        >
      >;
      pg_listing_images: Table<
        PgListingImage,
        {
          listing_id: string;
          owner_id: string;
          storage_path: string;
          display_order?: number;
          alt_text?: string;
        },
        never
      >;
      audit_logs: Table<
        {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: "owner_application" | "pg_listing";
          entity_id: string;
          previous_status: string | null;
          new_status: string | null;
          reason: string | null;
          created_at: string;
        },
        never,
        never
      >;
    };
    Views: Record<string, never>;
    Functions: {
      has_current_role: {
        Args: { required_role: string };
        Returns: boolean;
      };
      review_owner_application: {
        Args: {
          target_application_id: string;
          decision: "approved" | "rejected";
          decision_reason?: string | null;
        };
        Returns: undefined;
      };
      review_pg_listing: {
        Args: {
          target_listing_id: string;
          decision: "approved" | "rejected" | "suspended";
          decision_reason?: string | null;
        };
        Returns: undefined;
      };
      resubmit_own_pg_listing: {
        Args: { target_listing_id: string };
        Returns: undefined;
      };
      remove_own_pg_listing: {
        Args: { target_listing_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
