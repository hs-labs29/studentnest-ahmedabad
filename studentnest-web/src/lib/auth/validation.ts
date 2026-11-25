import { LOCALITIES } from "@/app/pgs/data/sample-pgs";

export interface SignupInput {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  collegeName: string;
  preferredLocality: (typeof LOCALITIES)[number];
}

export interface ProfileInput {
  fullName: string;
  mobileNumber: string;
  collegeName: string;
  preferredLocality: (typeof LOCALITIES)[number];
}

function readString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readPassword(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validMobileNumber(value: string) {
  return /^\+?[0-9][0-9 ()-]{7,19}$/.test(value);
}

function validLocality(value: string): value is (typeof LOCALITIES)[number] {
  return LOCALITIES.some((locality) => locality === value);
}

export function validateSignup(formData: FormData) {
  const fullName = readString(formData, "fullName");
  const email = readString(formData, "email").toLowerCase();
  const mobileNumber = readString(formData, "mobileNumber");
  const password = readPassword(formData, "password");
  const confirmPassword = readPassword(formData, "confirmPassword");
  const collegeName = readString(formData, "collegeName");
  const preferredLocality = readString(formData, "preferredLocality");

  if (fullName.length < 2 || fullName.length > 100) {
    return { error: "Enter your full name (2–100 characters)." } as const;
  }
  if (!validEmail(email)) return { error: "Enter a valid email address." } as const;
  if (!validMobileNumber(mobileNumber)) {
    return { error: "Enter a valid mobile number, including country code if needed." } as const;
  }
  if (password.length < 12 || password.length > 128 || !/\S/.test(password)) {
    return { error: "Use a password between 12 and 128 characters." } as const;
  }
  if (password !== confirmPassword) {
    return { error: "The passwords do not match." } as const;
  }
  if (collegeName.length < 2 || collegeName.length > 120) {
    return { error: "Enter your college name (2–120 characters)." } as const;
  }
  if (!validLocality(preferredLocality)) {
    return { error: "Choose a preferred Ahmedabad locality." } as const;
  }
  if (formData.get("termsAccepted") !== "on") {
    return { error: "Accept the student account terms to continue." } as const;
  }

  return {
    data: {
      fullName,
      email,
      mobileNumber,
      password,
      collegeName,
      preferredLocality,
    } satisfies SignupInput,
  } as const;
}

export function validateProfile(formData: FormData) {
  const fullName = readString(formData, "fullName");
  const mobileNumber = readString(formData, "mobileNumber");
  const collegeName = readString(formData, "collegeName");
  const preferredLocality = readString(formData, "preferredLocality");

  if (fullName.length < 2 || fullName.length > 100) {
    return { error: "Enter your full name (2–100 characters)." } as const;
  }
  if (!validMobileNumber(mobileNumber)) {
    return { error: "Enter a valid mobile number." } as const;
  }
  if (collegeName.length < 2 || collegeName.length > 120) {
    return { error: "Enter your college name (2–120 characters)." } as const;
  }
  if (!validLocality(preferredLocality)) {
    return { error: "Choose a preferred Ahmedabad locality." } as const;
  }

  return {
    data: {
      fullName,
      mobileNumber,
      collegeName,
      preferredLocality,
    } satisfies ProfileInput,
  } as const;
}
