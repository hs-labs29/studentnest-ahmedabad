export interface SupabaseEnvironment {
  url: string;
  publishableKey: string;
}

export function getSupabaseEnvironment(): SupabaseEnvironment | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) return null;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid URL.");
  }
  if (
    parsedUrl.protocol !== "https:" &&
    parsedUrl.hostname !== "localhost" &&
    parsedUrl.hostname !== "127.0.0.1"
  ) {
    throw new Error("Supabase URL must use HTTPS outside localhost.");
  }

  return { url, publishableKey };
}

export function isSupabaseConfigured() {
  return getSupabaseEnvironment() !== null;
}
