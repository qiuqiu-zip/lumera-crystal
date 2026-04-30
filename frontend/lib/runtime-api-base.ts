const DEFAULT_INTERNAL_API_BASE_URL = "http://app:8000/api/v1";

export function resolveApiBaseUrl() {
  const internalBase = process.env.NEXT_INTERNAL_API_BASE_URL ?? DEFAULT_INTERNAL_API_BASE_URL;

  if (typeof window === "undefined") {
    return internalBase;
  }

  // Browser requests use same-origin proxy to avoid mobile CORS/IP mismatch issues.
  return "/api/proxy";
}
