"use client";

import Image from "next/image";
import { useState } from "react";

import { getImageUrl, IMAGE_PLACEHOLDER, ImageSize } from "@/lib/image-url";

type SmartImageProps = {
  src?: string | null;
  alt: string;
  size?: ImageSize;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function SmartImage({ src, alt, size = "original", className, fill = false, width, height, priority = false }: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = failed ? IMAGE_PLACEHOLDER : getImageUrl(src, size);
  const unoptimized = !resolved.startsWith("/");

  if (fill) {
    return (
      <Image
        src={resolved}
        alt={alt}
        fill
        className={className}
        loading={priority ? "eager" : "lazy"}
        sizes="(max-width: 768px) 100vw, 50vw"
        unoptimized={unoptimized}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      width={width ?? 720}
      height={height ?? 720}
      className={className}
      loading={priority ? "eager" : "lazy"}
      unoptimized={unoptimized}
      onError={() => setFailed(true)}
    />
  );
}
