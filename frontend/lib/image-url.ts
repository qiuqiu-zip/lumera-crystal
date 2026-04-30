export type ImageSize = "thumbnail" | "medium" | "original";

const PLACEHOLDER_URL = "https://placehold.co/600x600?text=No+Image";

export function resolvePreviewUrl(input?: string | null): string {
  if (!input) return "";
  if (input.startsWith("/")) return input;
  try {
    const parsed = new URL(input);
    if (parsed.pathname.startsWith("/api/v1/media/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
    return input;
  } catch {
    return input;
  }
}

function withCdnBase(raw: string): string {
  const cdnBase = process.env.NEXT_PUBLIC_CDN_BASE_URL?.trim();
  if (!cdnBase) return raw;
  if (!raw.startsWith("/")) return raw;
  return `${cdnBase.replace(/\/$/, "")}${raw}`;
}

export function getImageUrl(raw?: string | null, size: ImageSize = "original"): string {
  if (!raw) return PLACEHOLDER_URL;
  const resolved = resolvePreviewUrl(raw);
  const withBase = withCdnBase(resolved);

  const hasProcessor = Boolean(process.env.NEXT_PUBLIC_IMAGE_PROCESSOR_ENABLED === "1");
  if (!hasProcessor) return withBase;

  try {
    const isRelative = withBase.startsWith("/");
    const url = new URL(withBase, isRelative ? "http://placeholder.local" : undefined);
    if (size === "thumbnail") {
      url.searchParams.set("w", "420");
      url.searchParams.set("q", "72");
    } else if (size === "medium") {
      url.searchParams.set("w", "1080");
      url.searchParams.set("q", "80");
    }
    const output = `${url.pathname}${url.search}`;
    return isRelative ? output : url.toString();
  } catch {
    return withBase;
  }
}

export function getThumbnailUrl(raw?: string | null): string {
  return getImageUrl(raw, "thumbnail");
}

export function getMediumImageUrl(raw?: string | null): string {
  return getImageUrl(raw, "medium");
}

export const IMAGE_PLACEHOLDER = PLACEHOLDER_URL;
