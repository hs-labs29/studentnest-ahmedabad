export function getSiteOrigin() {
  const configuredUrl = process.env.SITE_URL?.trim();
  if (!configuredUrl) return null;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(configuredUrl);
  } catch {
    throw new Error("SITE_URL must be a valid absolute URL.");
  }

  if (
    parsedUrl.username ||
    parsedUrl.password ||
    (parsedUrl.protocol !== "https:" &&
      parsedUrl.hostname !== "localhost" &&
      parsedUrl.hostname !== "127.0.0.1")
  ) {
    throw new Error("SITE_URL must use HTTPS outside localhost.");
  }
  return parsedUrl.origin;
}

export function safeNextPath(value: string | null, fallback = "/dashboard") {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return fallback;
  }

  const parsedUrl = new URL(value, "https://studentnest.invalid");
  if (parsedUrl.origin !== "https://studentnest.invalid") return fallback;
  return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}
